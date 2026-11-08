const express = require('express');
const { loadImage } = require('../services/storage');

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    const img = await loadImage(req.params.id);
    if (!img) return res.status(404).json({ error: 'Image not found.' });
    res.set('Content-Type', img.mimeType);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'private, max-age=86400, immutable');
    res.send(img.buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
