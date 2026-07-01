const express = require('express');
const { generateVirtualTryOnPreview } = require('../services/virtualTryOn');

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

module.exports = router;
