const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI_PROVIDER=gemini (default) | ollama
const provider = () => (process.env.AI_PROVIDER || 'gemini').toLowerCase();

let geminiModel;
function getGeminiModel() {
  if (!geminiModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return geminiModel;
}

/**
 * Converts a base64 image string to a Gemini-compatible inline part.
 */
function imageToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

async function generateWithOllama(prompt, image) {
  const baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'qwen2.5vl:7b',
      prompt,
      images: image ? [image.base64] : undefined,
      format: 'json',
      stream: false,
      keep_alive: '30m',
    }),
    // CPU inference can take minutes
    signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS) || 300000),
  });
  if (!res.ok) {
    throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  }
  return (await res.json()).response;
}

/**
 * Sends a prompt (and optional image) to the configured provider and returns parsed JSON.
 */
async function generateJson(prompt, image) {
  let text;
  if (provider() === 'ollama') {
    text = await generateWithOllama(prompt, image);
  } else {
    const parts = image ? [prompt, imageToGenerativePart(image.base64, image.mimeType)] : prompt;
    const result = await getGeminiModel().generateContent(parts);
    text = result.response.text();
  }
  // Strip markdown code fences if present
  const jsonText = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(jsonText);
}

/**
 * Analyse a clothing item image and return structured metadata.
 */
async function analyzeClothingItem(base64Image, mimeType = 'image/jpeg') {
  const prompt = `You are a fashion analyst with deep knowledge of Malay, Chinese, Indian, and Western clothing traditions.

Analyse this clothing item image and return a JSON object with the following fields:
{
  "type": "e.g. baju kurung, cheongsam, saree, t-shirt, dress, hijab, jeans, blazer, etc.",
  "category": "one of: top, bottom, dress, outerwear, hijab, shoes, accessory (a baju kurung or abaya is a dress; a headscarf is hijab)",
  "dominantColours": ["array of hex colour codes, max 3"],
  "colourNames": ["descriptive colour names matching the hex array"],
  "pattern": "one of: solid, striped, floral, checked, printed, embroidered, songket, batik",
  "fabric": "e.g. cotton, silk, linen, unknown",
  "style": "e.g. traditional, casual, formal, semi-formal",
  "formality": "one of: casual, smart-casual, formal, traditional",
  "sleeves": "one of: sleeveless, short, three-quarter, long, none (use none for bottoms, shoes, hijab)",
  "length": "garment length, one of: cropped, waist, hip, thigh, knee, midi, ankle, full",
  "fit": "one of: fitted, regular, relaxed, loose",
  "neckline": "one of: high, crew, v, deep, off-shoulder, none",
  "sheer": true or false,
  "culturalOrigin": "Malay | Chinese | Indian | Western | Neutral",
  "suitableOccasions": ["array from: Hari Raya, Chinese New Year, Deepavali, Wedding, Formal Work, Casual, Beach, Sports, Night Out, Funeral"],
  "description": "one sentence describing the item"
}

Respond with ONLY valid JSON. No markdown, no explanation.`;

  return generateJson(prompt, { base64: base64Image, mimeType });
}

/**
 * Given a list of wardrobe items and an occasion, suggest outfit combinations.
 */
async function suggestOutfits(wardrobeItems, occasion, culturalContext = 'Any') {
  const itemsSummary = wardrobeItems
    .map((item, i) => `Item ${i + 1}: ${item.type} — ${item.description} (Colours: ${item.colourNames?.join(', ')}, Cultural: ${item.culturalOrigin})`)
    .join('\n');

  const prompt = `You are Gaya, a culturally-aware AI fashion stylist for Southeast Asia.

The user's wardrobe:
${itemsSummary}

Occasion: ${occasion}
Cultural preference: ${culturalContext}

Suggest up to 3 outfit combinations from the wardrobe above that are appropriate for the occasion.
For each outfit, consider:
- Cultural appropriateness (e.g. modest dressing for Hari Raya, auspicious colours for CNY, vibrant for Deepavali)
- Colour harmony (complementary, analogous, or neutral pairings)
- Dress code for the occasion

Return a JSON array:
[
  {
    "outfitName": "short creative name",
    "items": [item numbers used, e.g. [1, 3]],
    "colourHarmony": "explanation of why the colours work together",
    "whyItWorks": "cultural and occasion reasoning",
    "colourPalette": ["hex codes from the combined outfit"],
    "tips": "one styling tip"
  }
]

Respond with ONLY valid JSON. No markdown, no explanation.`;

  return generateJson(prompt);
}

/**
 * Given two or more colours, analyse how well they pair together.
 */
async function analyseColours(hexColours) {
  const prompt = `You are a colour theory expert and fashion stylist.

Colours to analyse: ${hexColours.join(', ')}

Analyse these colours as a fashion pairing and return JSON:
{
  "harmonyType": "e.g. Complementary, Analogous, Triadic, Neutral, Clash",
  "score": <1-10 compatibility score>,
  "verdict": "one sentence verdict",
  "culturalNotes": "any cultural significance of these colours in Malay, Chinese, Indian, or Western context",
  "suggestedAccents": ["up to 2 hex colours that would complete this palette"]
}

Respond with ONLY valid JSON.`;

  return generateJson(prompt);
}

/**
 * Review a rendered try-on image of an outfit the way a stylist would.
 * `context` carries the pieces, occasion, style profile and the rule-based findings.
 */
async function reviewOutfit(base64Image, mimeType, context) {
  const profileNote = {
    hijab: 'The wearer wears a hijab and dresses modestly. Judge the hijab styling, modest coverage and how the hijab colour works with the outfit.',
    modest: 'The wearer dresses modestly (covered arms, legs and neckline, relaxed fit).',
    none: 'No special coverage requirements.',
  }[context.profile] || '';

  const prompt = `You are a fashion stylist reviewing a virtual try-on image of an outfit assembled from the wearer's own wardrobe.

Pieces: ${context.pieces.join('; ')}
Occasion: ${context.occasion}
${profileNote}
Rule-based findings already noted: ${context.findings.join(' | ') || 'none'}

Look at the image and judge: colour harmony, proportions and silhouette, fit, and whether it suits the occasion.
Note that the image may be an imperfect AI render; ignore rendering artefacts and judge the outfit itself.

Return a JSON object:
{
  "score": <1-10 overall fashion score>,
  "verdict": "one sentence verdict",
  "strengths": ["up to 3 short points"],
  "issues": ["up to 3 short points, empty if none"],
  "swaps": ["up to 3 concrete suggestions, e.g. swap the top for a neutral one, or add a belt"]
}

Respond with ONLY valid JSON.`;

  return generateJson(prompt, { base64: base64Image, mimeType });
}

module.exports = { analyzeClothingItem, suggestOutfits, analyseColours, reviewOutfit };
