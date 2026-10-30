const express = require('express');
const { suggestOutfits } = require('../services/aiModel');

const router = express.Router();

/**
 * POST /api/suggest/outfits
 * Body: { wardrobeItems: [...], occasion: string, culturalContext?: string }
 */
router.post('/outfits', async (req, res) => {
  try {
    const { wardrobeItems, occasion, culturalContext } = req.body;

    if (!Array.isArray(wardrobeItems) || wardrobeItems.length === 0) {
      return res.status(400).json({ error: 'wardrobeItems must be a non-empty array.' });
    }
    if (!occasion || typeof occasion !== 'string') {
      return res.status(400).json({ error: 'occasion is required.' });
    }

    const suggestions = await suggestOutfits(wardrobeItems, occasion, culturalContext || 'Any');
    res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error('Suggest error:', err.message);
    res.status(500).json({ error: 'Failed to generate outfit suggestions', details: err.message });
  }
});

module.exports = router;
