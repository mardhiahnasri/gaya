const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Persistent wardrobe file storage
const WARDROBE_FILE = path.join(__dirname, '../../wardrobe.json');

// Load wardrobe from file or initialize
function loadWardrobe() {
  if (fs.existsSync(WARDROBE_FILE)) {
    try {
      const data = fs.readFileSync(WARDROBE_FILE, 'utf8');
      return JSON.parse(data);
    } catch {
      console.warn('Could not parse wardrobe.json, starting fresh');
      return [];
    }
  }
  return [];
}

// Save wardrobe to file
function saveWardrobe(items) {
  fs.writeFileSync(WARDROBE_FILE, JSON.stringify(items, null, 2));
}

let wardrobe = loadWardrobe();

/**
 * GET /api/wardrobe
 */
router.get('/', (_req, res) => {
  res.json({ success: true, data: wardrobe });
});

/**
 * POST /api/wardrobe
 * Add an analysed clothing item to the wardrobe.
 */
router.post('/', (req, res) => {
  const { analysis, imageUri } = req.body;
  if (!analysis) {
    return res.status(400).json({ error: 'analysis object is required.' });
  }
  const id = uuidv4();
  const item = { id, imageUri: imageUri || null, ...analysis, addedAt: new Date().toISOString() };
  wardrobe.push(item);
  saveWardrobe(wardrobe);
  res.status(201).json({ success: true, data: item });
});

const EDITABLE_FIELDS = [
  'type', 'category', 'pattern', 'formality', 'sleeves', 'length', 'fit', 'neckline', 'sheer',
  'style', 'fabric', 'culturalOrigin', 'suitableOccasions',
];

/**
 * PATCH /api/wardrobe/:id
 * Correct AI-detected details (e.g. category, sleeve length) on a saved item.
 */
router.patch('/:id', (req, res) => {
  const item = wardrobe.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found.' });
  }
  for (const key of EDITABLE_FIELDS) {
    if (key in req.body) item[key] = req.body[key];
  }
  saveWardrobe(wardrobe);
  res.json({ success: true, data: item });
});

/**
 * DELETE /api/wardrobe/:id
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const idx = wardrobe.findIndex(item => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Item not found.' });
  }
  wardrobe.splice(idx, 1);
  saveWardrobe(wardrobe);
  res.json({ success: true, message: 'Item removed from wardrobe.' });
});

module.exports = router;
module.exports.getWardrobe = () => wardrobe;
