const express = require('express');
const { getWardrobe, getItemsByIds, getItemImageId } = require('./wardrobe');
const { getProfile } = require('./profile');
const { categoryOf, scoreOutfit, matchOutfits } = require('../services/outfitRules');
const { renderOutfitPreview } = require('../services/virtualTryOn');
const { reviewOutfit } = require('../services/aiModel');
const { query, ensureProfileId } = require('../services/db');
const { loadImageBase64 } = require('../services/storage');
const { resolvePersonImage, recordTryon, saveReview } = require('../services/tryonStore');

const router = express.Router();

const PROFILES = ['hijab', 'modest', 'none'];
const UUID = /^[0-9a-f-]{36}$/i;

// An explicit profile in the request wins; otherwise the saved wearer profile decides.
async function readContext(body) {
  const wearer = await getProfile();
  const profile = PROFILES.includes(body.profile) ? body.profile : wearer.modesty || 'none';
  return { profile, wearer, occasion: typeof body.occasion === 'string' ? body.occasion : '' };
}

function describeWearer(w) {
  const parts = [
    w.gender, w.ageGroup && `age ${w.ageGroup}`, w.bodyShape && w.bodyShape !== 'not-sure' && `${w.bodyShape} body shape`,
    w.heightCm && `${w.heightCm}cm`, w.region && `from ${w.region}`,
  ].filter(Boolean);
  return parts.join(', ');
}

async function resolveItems(itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0 || !itemIds.every((id) => UUID.test(String(id)))) {
    throw Object.assign(new Error('itemIds must be a non-empty array of item ids.'), { statusCode: 400 });
  }
  const items = await getItemsByIds(itemIds);
  if (items.some((i) => !i)) {
    throw Object.assign(new Error('One or more items no longer exist in the wardrobe.'), { statusCode: 404 });
  }
  return items;
}

function sendError(res, err, fallback) {
  const status = err.statusCode || 500;
  if (status === 500) console.error(fallback, err.message);
  res.status(status).json({ error: status === 500 ? fallback : err.message, details: status === 500 ? err.message : undefined });
}

/**
 * POST /api/outfits/match
 * Body: { occasion, profile } -> ranked outfits built from the saved wardrobe.
 */
router.post('/match', async (req, res) => {
  try {
    const { occasion, profile, wearer } = await readContext(req.body);
    const wardrobe = await getWardrobe();
    const outfits = matchOutfits(wardrobe, { occasion, profile, wearer, limit: Number(req.body.limit) || 6 });
    res.json({ success: true, data: outfits });
  } catch (err) {
    sendError(res, err, 'Failed to match outfits');
  }
});

/**
 * POST /api/outfits/score
 * Body: { itemIds, occasion, profile } -> rule-based fashion score and checks.
 */
router.post('/score', async (req, res) => {
  try {
    const { occasion, profile, wearer } = await readContext(req.body);
    const items = await resolveItems(req.body.itemIds);
    const wardrobe = await getWardrobe();
    res.json({ success: true, data: scoreOutfit(items, { occasion, profile, wearer, wardrobe }) });
  } catch (err) {
    sendError(res, err, 'Failed to score outfit');
  }
});

/**
 * POST /api/outfits/render
 * Body: { personImage?: { base64, mimeType }, itemIds, occasion?, fitNotes? }
 * personImage defaults to the saved body photo. Returns the try-on image of the full outfit.
 */
router.post('/render', async (req, res) => {
  try {
    const items = await resolveItems(req.body.itemIds);
    const personImage = await resolvePersonImage(req.body.personImage);

    const garments = [];
    const missingImage = [];
    for (const item of items) {
      const stored = await loadImageBase64(await getItemImageId(item.id));
      if (stored) garments.push({ ...stored, category: categoryOf(item), name: item.type });
      else missingImage.push(item.type);
    }

    const result = await renderOutfitPreview({ personImage, garments, fitNotes: req.body.fitNotes });
    if (missingImage.length) {
      result.warnings = [...(result.warnings || []), `No photo saved for: ${missingImage.join(', ')}.`];
    }

    if (result.status === 'ready' && result.previewImageBase64) {
      const profileId = await ensureProfileId();
      const outfit = await query('INSERT INTO outfits (profile_id, occasion) VALUES ($1,$2) RETURNING id', [profileId, req.body.occasion || null]);
      for (const item of items) {
        await query('INSERT INTO outfit_items (outfit_id, item_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [outfit.rows[0].id, item.id]);
      }
      Object.assign(result, await recordTryon({ outfitId: outfit.rows[0].id, resultBase64: result.previewImageBase64, warnings: result.warnings }));
    }
    res.json({ success: true, data: result });
  } catch (err) {
    sendError(res, err, 'Failed to render outfit');
  }
});

/**
 * POST /api/outfits/review
 * Body: { image: { base64, mimeType }, itemIds, occasion, profile, tryonId? } -> stylist review of the render.
 */
router.post('/review', async (req, res) => {
  try {
    const { occasion, profile, wearer } = await readContext(req.body);
    const items = await resolveItems(req.body.itemIds);
    const { image } = req.body;
    if (!image || !image.base64) {
      return res.status(400).json({ error: 'image.base64 is required.' });
    }

    const rules = scoreOutfit(items, { occasion, profile, wearer, wardrobe: await getWardrobe() });
    const review = await reviewOutfit(image.base64.replace(/^data:[^;]+;base64,/, ''), image.mimeType || 'image/jpeg', {
      profile,
      wearer: describeWearer(wearer),
      occasion: occasion || 'everyday',
      pieces: items.map((i) => `${i.type} (${(i.colourNames || []).join('/')})`),
      findings: rules.checks.filter((c) => c.status !== 'pass').map((c) => `${c.label}: ${c.detail}`),
    });
    await saveReview(req.body.tryonId, review);
    res.json({ success: true, data: review });
  } catch (err) {
    sendError(res, err, 'Failed to review outfit');
  }
});

module.exports = router;
