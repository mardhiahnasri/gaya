const express = require('express');
const { getWardrobe } = require('./wardrobe');
const { categoryOf, scoreOutfit, matchOutfits } = require('../services/outfitRules');
const { renderOutfitPreview } = require('../services/virtualTryOn');
const { reviewOutfit } = require('../services/aiModel');

const router = express.Router();

const PROFILES = ['hijab', 'modest', 'none'];

function readContext(body) {
  const profile = PROFILES.includes(body.profile) ? body.profile : 'none';
  return { profile, occasion: typeof body.occasion === 'string' ? body.occasion : '' };
}

function resolveItems(itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw Object.assign(new Error('itemIds must be a non-empty array.'), { statusCode: 400 });
  }
  const wardrobe = getWardrobe();
  const items = itemIds.map((id) => wardrobe.find((i) => i.id === id));
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
router.post('/match', (req, res) => {
  try {
    const { occasion, profile } = readContext(req.body);
    const wardrobe = getWardrobe();
    const outfits = matchOutfits(wardrobe, { occasion, profile, limit: Number(req.body.limit) || 6 });
    res.json({ success: true, data: outfits });
  } catch (err) {
    sendError(res, err, 'Failed to match outfits');
  }
});

/**
 * POST /api/outfits/score
 * Body: { itemIds, occasion, profile } -> rule-based fashion score and checks.
 */
router.post('/score', (req, res) => {
  try {
    const { occasion, profile } = readContext(req.body);
    const items = resolveItems(req.body.itemIds);
    res.json({ success: true, data: scoreOutfit(items, { occasion, profile, wardrobe: getWardrobe() }) });
  } catch (err) {
    sendError(res, err, 'Failed to score outfit');
  }
});

/**
 * POST /api/outfits/render
 * Body: { personImage: { base64, mimeType }, itemIds, fitNotes? } -> try-on image of the full outfit.
 */
router.post('/render', async (req, res) => {
  try {
    const items = resolveItems(req.body.itemIds);
    const hasImage = (i) => typeof i.imageUri === 'string' && i.imageUri.startsWith('data:');
    const garments = items
      .filter(hasImage)
      .map((i) => ({
        base64: i.imageUri,
        mimeType: 'image/jpeg',
        category: categoryOf(i),
        name: i.type,
      }));
    const missingImage = items.filter((i) => !hasImage(i)).map((i) => i.type);

    const result = await renderOutfitPreview({
      personImage: req.body.personImage,
      garments,
      fitNotes: req.body.fitNotes,
    });
    if (missingImage.length) {
      result.warnings = [...(result.warnings || []), `No photo saved for: ${missingImage.join(', ')}.`];
    }
    res.json({ success: true, data: result });
  } catch (err) {
    sendError(res, err, 'Failed to render outfit');
  }
});

/**
 * POST /api/outfits/review
 * Body: { image: { base64, mimeType }, itemIds, occasion, profile } -> stylist review of the render.
 */
router.post('/review', async (req, res) => {
  try {
    const { occasion, profile } = readContext(req.body);
    const items = resolveItems(req.body.itemIds);
    const { image } = req.body;
    if (!image || !image.base64) {
      return res.status(400).json({ error: 'image.base64 is required.' });
    }

    const rules = scoreOutfit(items, { occasion, profile, wardrobe: getWardrobe() });
    const review = await reviewOutfit(image.base64.replace(/^data:[^;]+;base64,/, ''), image.mimeType || 'image/jpeg', {
      profile,
      occasion: occasion || 'everyday',
      pieces: items.map((i) => `${i.type} (${(i.colourNames || []).join('/')})`),
      findings: rules.checks.filter((c) => c.status !== 'pass').map((c) => `${c.label}: ${c.detail}`),
    });
    res.json({ success: true, data: review });
  } catch (err) {
    sendError(res, err, 'Failed to review outfit');
  }
});

module.exports = router;
