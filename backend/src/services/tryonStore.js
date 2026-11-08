const { query, ensureProfileId } = require('./db');
const { saveImage, loadImageBase64 } = require('./storage');
const { getBodyPhotoImageId } = require('../routes/profile');

/** Uses the photo sent with the request, otherwise the saved primary body photo. */
async function resolvePersonImage(personImage) {
  if (personImage && personImage.base64) return personImage;
  const imageId = await getBodyPhotoImageId();
  const stored = imageId && (await loadImageBase64(imageId));
  if (!stored) {
    throw Object.assign(new Error('Add a body photo to your profile first (or send personImage).'), { statusCode: 400 });
  }
  return stored;
}

/** Stores a finished try-on (result image + optional source) and returns its id and image URL. */
async function recordTryon({ outfitId = null, sourceImageId = null, sourceUrl = null, resultBase64, warnings = [] }) {
  const profileId = await ensureProfileId();
  const resultImageId = await saveImage(resultBase64, { kind: 'tryon', mimeType: 'image/jpeg' });
  const photo = await query('SELECT id FROM body_photos WHERE profile_id = $1 AND is_primary', [profileId]);
  const { rows } = await query(
    `INSERT INTO tryons (profile_id, body_photo_id, outfit_id, source_image_id, source_url, result_image_id, warnings)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [profileId, photo.rows[0]?.id ?? null, outfitId, sourceImageId, sourceUrl, resultImageId, warnings]
  );
  return { tryonId: rows[0].id, resultImageUrl: `/api/images/${resultImageId}` };
}

async function saveReview(tryonId, review) {
  if (!/^[0-9a-f-]{36}$/i.test(String(tryonId || ''))) return;
  await query('UPDATE tryons SET review = $1 WHERE id = $2', [JSON.stringify(review), tryonId]);
}

module.exports = { resolvePersonImage, recordTryon, saveReview };
