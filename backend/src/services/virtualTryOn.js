function sanitizeBase64(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/^data:[^;]+;base64,/, '').trim();
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function assertImageShape(image, fieldName) {
  if (!image || typeof image !== 'object') {
    throw Object.assign(new Error(`${fieldName} is required.`), { statusCode: 400 });
  }

  const base64 = sanitizeBase64(image.base64);
  if (!base64) {
    throw Object.assign(new Error(`${fieldName}.base64 is required.`), { statusCode: 400 });
  }

  return {
    base64,
    mimeType: typeof image.mimeType === 'string' && image.mimeType ? image.mimeType : 'image/jpeg',
  };
}

/**
 * Provider-agnostic virtual try-on API adaptor.
 *
 * Configure these env vars to connect a real VTON service:
 * - VTON_API_URL: Full endpoint URL.
 * - VTON_API_KEY: Optional bearer token.
 */
async function generateVirtualTryOnPreview({ personImage, garmentImages, fitNotes }) {
  const validatedPerson = assertImageShape(personImage, 'personImage');

  if (!Array.isArray(garmentImages) || garmentImages.length === 0) {
    throw Object.assign(new Error('garmentImages must be a non-empty array.'), { statusCode: 400 });
  }

  const validatedGarments = garmentImages.map((img, index) => {
    const validated = assertImageShape(img, `garmentImages[${index}]`);
    return {
      ...validated,
      category: typeof img.category === 'string' ? img.category : 'unknown',
      name: typeof img.name === 'string' ? img.name : `Item ${index + 1}`,
    };
  });

  const providerMode = process.env.VTON_PROVIDER;
  if (providerMode === 'hf_space' || process.env.HF_SPACE_URL) {
    return generateWithHuggingFaceSpace({
      personImage: validatedPerson,
      garmentImages: validatedGarments,
      fitNotes,
    });
  }

  const providerUrl = process.env.VTON_API_URL;
  if (!providerUrl) {
    return {
      status: 'provider_unavailable',
      provider: 'none',
      warnings: [
        'No virtual try-on provider configured. Set VTON_API_URL to enable rendered try-on images.',
      ],
      fitNotes:
        'Body-aware rendering requires a dedicated VTON model provider (for example IDM-VTON, CatVTON, or Kling Try-On API).',
    };
  }

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.VTON_API_KEY) {
    headers.Authorization = `Bearer ${process.env.VTON_API_KEY}`;
  }

  const response = await fetch(providerUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      personImage: validatedPerson,
      garmentImages: validatedGarments,
      fitNotes: typeof fitNotes === 'string' ? fitNotes : undefined,
    }),
  });

  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw Object.assign(new Error('VTON provider returned non-JSON response.'), { statusCode: 502 });
  }

  if (!response.ok) {
    throw Object.assign(
      new Error(data.error || data.message || 'Virtual try-on provider request failed.'),
      { statusCode: 502 }
    );
  }

  return {
    status: 'ready',
    provider: data.provider || providerUrl,
    previewImageBase64: typeof data.previewImageBase64 === 'string' ? data.previewImageBase64 : undefined,
    previewImageUrl: typeof data.previewImageUrl === 'string' ? data.previewImageUrl : undefined,
    fitNotes: typeof data.fitNotes === 'string' ? data.fitNotes : undefined,
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
  };
}

function getHfHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.HF_TOKEN) {
    headers.Authorization = `Bearer ${process.env.HF_TOKEN}`;
  }
  return headers;
}

function getHfAuthHeaders() {
  const headers = {};
  if (process.env.HF_TOKEN) {
    headers.Authorization = `Bearer ${process.env.HF_TOKEN}`;
  }
  return headers;
}

function pickOutputUrl(resultArray) {
  if (!Array.isArray(resultArray)) return undefined;
  for (const entry of resultArray) {
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.url === 'string' && entry.url) return entry.url;
    if (typeof entry.path === 'string' && entry.path) return entry.path;
  }
  return undefined;
}

function extractHfErrorMessage(payload) {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = extractHfErrorMessage(item);
      if (nested) return nested;
    }
  }
  if (typeof payload === 'object') {
    if (typeof payload.error === 'string' && payload.error) return payload.error;
    if (typeof payload.message === 'string' && payload.message) return payload.message;
    if (typeof payload.detail === 'string' && payload.detail) return payload.detail;
  }
  return '';
}

async function uploadImageToHfSpace({ baseUrl, image, filename }) {
  const bytes = Buffer.from(image.base64, 'base64');
  const blob = new Blob([bytes], { type: image.mimeType || 'image/jpeg' });
  const formData = new FormData();
  formData.append('files', blob, filename);

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: getHfAuthHeaders(),
    body: formData,
  });

  const responseText = await response.text();
  const uploaded = safeJsonParse(responseText);

  if (!response.ok || !Array.isArray(uploaded) || typeof uploaded[0] !== 'string') {
    throw Object.assign(
      new Error(
        extractHfErrorMessage(uploaded) ||
          `HF Space upload failed (${response.status}).`
      ),
      { statusCode: 502 }
    );
  }

  return uploaded[0];
}

async function getEventResult({ baseUrl, apiName, eventId }) {
  const url = `${baseUrl}/call/${apiName}/${eventId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHfHeaders(),
  });

  if (!response.ok) {
    throw Object.assign(new Error(`HF Space result fetch failed (${response.status}).`), {
      statusCode: 502,
    });
  }

  const text = await response.text();
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let currentEvent = '';
  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent = line.slice(6).trim();
      continue;
    }
    if (!line.startsWith('data:')) continue;

    const payloadRaw = line.slice(5).trim();
    const payload = safeJsonParse(payloadRaw);
    if (currentEvent === 'error') {
      const msg = extractHfErrorMessage(payload) || payloadRaw;
      throw Object.assign(new Error(msg || 'HF Space returned an error event.'), {
        statusCode: 502,
      });
    }
    if (currentEvent === 'complete') {
      return Array.isArray(payload) ? payload : [];
    }
  }

  throw Object.assign(new Error('HF Space did not return a complete event.'), {
    statusCode: 502,
  });
}

async function generateWithHuggingFaceSpace({ personImage, garmentImages, fitNotes }) {
  const baseUrl = (process.env.HF_SPACE_URL || 'https://yisol-idm-vton.hf.space').replace(/\/$/, '');
  const apiName = process.env.HF_SPACE_API_NAME || 'tryon';

  const garment = garmentImages[0];
  const [personPath, garmentPath] = await Promise.all([
    uploadImageToHfSpace({ baseUrl, image: personImage, filename: 'person.jpg' }),
    uploadImageToHfSpace({ baseUrl, image: garment, filename: 'garment.jpg' }),
  ]);

  const payload = {
    data: [
      {
        background: { path: personPath },
        layers: [],
        composite: null,
      },
      { path: garmentPath },
      typeof fitNotes === 'string' ? fitNotes : '',
      true,
      false,
      30,
      42,
    ],
  };

  const enqueueResponse = await fetch(`${baseUrl}/call/${apiName}`, {
    method: 'POST',
    headers: getHfHeaders(),
    body: JSON.stringify(payload),
  });

  const enqueueText = await enqueueResponse.text();
  const enqueueData = safeJsonParse(enqueueText);

  if (!enqueueResponse.ok || !enqueueData || typeof enqueueData.event_id !== 'string') {
    throw Object.assign(
      new Error(
        (enqueueData && (enqueueData.error || enqueueData.message)) ||
          'HF Space enqueue failed. If this persists, duplicate the Space and set HF_SPACE_URL to your own copy.'
      ),
      { statusCode: 502 }
    );
  }

  const resultData = await getEventResult({
    baseUrl,
    apiName,
    eventId: enqueueData.event_id,
  });

  const outputUrl = pickOutputUrl(resultData);

  return {
    status: outputUrl ? 'ready' : 'provider_unavailable',
    provider: `hf_space:${baseUrl}`,
    previewImageUrl: outputUrl,
    fitNotes:
      outputUrl
        ? 'Preview generated by Hugging Face Space free endpoint.'
        : 'HF Space call completed but no image URL was returned.',
    warnings: [
      'Using free public Space. Queue delays, rate limits, and downtime are expected.',
      'Current free adapter uses the first selected garment for rendering.',
    ],
  };
}

module.exports = { generateVirtualTryOnPreview };
