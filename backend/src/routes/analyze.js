const express = require('express');
const multer = require('multer');
const { analyzeClothingItem } = require('../services/aiModel');

const router = express.Router();

// Store uploads in memory (base64 sent directly from mobile)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/analyze/clothing
 * Accepts multipart image upload OR JSON { base64, mimeType }
 */
router.post('/clothing', upload.single('image'), async (req, res) => {
  try {
    let base64Data;
    let mimeType = 'image/jpeg';

    if (req.file) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.base64) {
      base64Data = req.body.base64;
      mimeType = req.body.mimeType || 'image/jpeg';
    } else {
      return res.status(400).json({ error: 'No image provided. Send multipart file or { base64, mimeType }.' });
    }

    const analysis = await analyzeClothingItem(base64Data, mimeType);
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: 'Failed to analyse clothing item', details: err.message });
  }
});

/**
 * POST /api/analyze/colours
 */
router.post('/colours', async (req, res) => {
  try {
    const { colours } = req.body;
    if (!Array.isArray(colours) || colours.length < 2) {
      return res.status(400).json({ error: 'Provide at least 2 hex colour codes in "colours" array.' });
    }
    const { analyseColours } = require('../services/aiModel');
    const result = await analyseColours(colours);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Colour analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyse colours', details: err.message });
  }
});

module.exports = router;
