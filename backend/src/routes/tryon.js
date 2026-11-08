const express = require('express');
const { generateVirtualTryOnPreview, renderOutfitPreview } = require('../services/virtualTryOn');
const { fetchRemoteImage } = require('../services/remoteImage');
const { decodeImage, saveImage } = require('../services/storage');
const { resolvePersonImage, recordTryon, saveReview } = require('../services/tryonStore');
const { getProfile } = require('./profile');
const { reviewOutfit } = require('../services/aiModel');

const router = express.Router();

/**
 * POST /api/tryon/preview
 * Body:
 * {
 *   personImage: { base64: string, mimeType?: string },
 *   garmentImages: [{ base64: string, mimeType?: string, category?: string, name?: string }],
 *   fitNotes?: string
 * }
 */
router.post('/preview', async (req, res) => {
  try {
    const { personImage, garmentImages, fitNotes } = req.body;
    const result = await generateVirtualTryOnPreview({ personImage, garmentImages, fitNotes });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Try-on error:', err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Failed to generate virtual try-on preview' : err.message,
      details: statusCode === 500 ? err.message : undefined,
    });
  }
});

const CATEGORIES = ['top', 'dress', 'outerwear'];

/**
 * POST /api/tryon/from-image
 * Try on any outfit image (e.g. from Pinterest) using the saved body photo.
 * Body: { sourceImage?: { base64, mimeType }, sourceUrl?, category?: 'top'|'dress'|'outerwear',
 *         personImage?, fitNotes? }
 */
router.post('/from-image', async (req, res) => {
  try {
    const { sourceImage, sourceUrl, fitNotes } = req.body;
    const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'top';

    let source;
    if (sourceImage && sourceImage.base64) {
      source = decodeImage(sourceImage.base64, sourceImage.mimeType);
    } else if (typeof sourceUrl === 'string' && sourceUrl) {
      source = await fetchRemoteImage(sourceUrl);
    } else {
      return res.status(400).json({ error: 'Send sourceImage or sourceUrl.' });
    }

    const personImage = await resolvePersonImage(req.body.personImage);
    const result = await renderOutfitPreview({
      personImage,
      garments: [{ base64: source.buffer.toString('base64'), mimeType: source.mimeType, category, name: 'outfit' }],
      fitNotes,
    });
    result.warnings = [
      ...(result.warnings || []),
      'The try-on model works best when the garment is shown on its own; photos of people wearing it can give weaker results.',
    ];

    if (result.status === 'ready' && result.previewImageBase64) {
      const sourceImageId = await saveImage(source.buffer, { kind: 'source', mimeType: source.mimeType });
      Object.assign(
        result,
        await recordTryon({
          sourceImageId,
          sourceUrl: typeof sourceUrl === 'string' ? sourceUrl.slice(0, 2000) : null,
          resultBase64: result.previewImageBase64,
          warnings: result.warnings,
        })
      );
    }
    res.json({ success: true, data: result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode === 500) console.error('Try-on from image error:', err.message);
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Failed to generate try-on' : err.message,
      details: statusCode === 500 ? err.message : undefined,
    });
  }
});

/**
 * POST /api/tryon/review
 * Body: { image: { base64, mimeType }, occasion?, tryonId? } -> stylist review that considers the saved profile.
 */
router.post('/review', async (req, res) => {
  try {
    const { image, occasion, tryonId } = req.body;
    if (!image || !image.base64) return res.status(400).json({ error: 'image.base64 is required.' });
    const wearer = await getProfile();
    const bits = [wearer.gender, wearer.ageGroup && `age ${wearer.ageGroup}`, wearer.bodyShape !== 'not-sure' && `${wearer.bodyShape} body shape`, wearer.region && `from ${wearer.region}`].filter(Boolean);
    const review = await reviewOutfit(image.base64.replace(/^data:[^;]+;base64,/, ''), image.mimeType || 'image/jpeg', {
      profile: wearer.modesty,
      wearer: bits.join(', '),
      occasion: occasion || 'everyday',
      pieces: ['the outfit shown in the image'],
      findings: [],
    });
    await saveReview(tryonId, review);
    res.json({ success: true, data: review });
  } catch (err) {
    console.error('Try-on review error:', err.message);
    res.status(err.statusCode || 500).json({ error: 'Failed to review try-on', details: err.message });
  }
});

module.exports = router;
