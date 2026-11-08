const express = require('express');
const { query, ensureProfileId } = require('../services/db');
const { saveImage, deleteImage, imageUrl } = require('../services/storage');
const { categoryOf } = require('../services/outfitRules');

const router = express.Router();

const CATEGORIES = ['top', 'bottom', 'dress', 'outerwear', 'hijab', 'shoes', 'accessory'];

// API field -> column. Array fields are handled separately.
const COLUMNS = {
  type: 'type', category: 'category', pattern: 'pattern', formality: 'formality', sleeves: 'sleeves',
  length: 'length', fit: 'fit', neckline: 'neckline', sheer: 'sheer', size: 'size', fabric: 'fabric',
  style: 'style', culturalOrigin: 'cultural_origin', description: 'description',
};
const ARRAYS = { dominantColours: 'dominant_colours', colourNames: 'colour_names', suitableOccasions: 'occasions' };
const EDITABLE = ['type', 'category', 'pattern', 'formality', 'sleeves', 'length', 'fit', 'neckline', 'sheer', 'size',
  'style', 'fabric', 'culturalOrigin', 'suitableOccasions'];

function toItem(row) {
  return {
    id: row.id,
    imageUri: imageUrl(row.image_id),
    type: row.type,
    category: row.category,
    pattern: row.pattern,
    formality: row.formality,
    sleeves: row.sleeves,
    length: row.length,
    fit: row.fit,
    neckline: row.neckline,
    sheer: row.sheer,
    size: row.size,
    fabric: row.fabric,
    style: row.style,
    culturalOrigin: row.cultural_origin,
    description: row.description,
    dominantColours: row.dominant_colours,
    colourNames: row.colour_names,
    suitableOccasions: row.occasions,
    addedAt: row.created_at,
  };
}

async function getWardrobe() {
  const profileId = await ensureProfileId();
  const { rows } = await query('SELECT * FROM wardrobe_items WHERE profile_id = $1 ORDER BY created_at', [profileId]);
  return rows.map(toItem);
}

async function getItemsByIds(ids) {
  const { rows } = await query('SELECT * FROM wardrobe_items WHERE id = ANY($1::uuid[])', [ids]);
  const byId = new Map(rows.map((r) => [r.id, toItem(r)]));
  return ids.map((id) => byId.get(id));
}

/** Raw image id for an item (used to fetch the photo for try-on). */
async function getItemImageId(id) {
  const { rows } = await query('SELECT image_id FROM wardrobe_items WHERE id = $1', [id]);
  return rows[0] ? rows[0].image_id : null;
}

router.get('/', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await getWardrobe() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/wardrobe
 * Body: { analysis, imageUri } where imageUri is the photo as a data URL.
 */
router.post('/', async (req, res, next) => {
  try {
    const { analysis, imageUri } = req.body;
    if (!analysis || typeof analysis !== 'object') {
      return res.status(400).json({ error: 'analysis object is required.' });
    }
    const category = CATEGORIES.includes(analysis.category) ? analysis.category : categoryOf(analysis);
    const profileId = await ensureProfileId();
    const imageId = typeof imageUri === 'string' && imageUri.startsWith('data:') ? await saveImage(imageUri, { kind: 'wardrobe' }) : null;

    const { rows } = await query(
      `INSERT INTO wardrobe_items
        (profile_id, image_id, type, category, pattern, formality, sleeves, length, fit, neckline, sheer, size,
         fabric, style, cultural_origin, description, dominant_colours, colour_names, occasions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
      [
        profileId, imageId, String(analysis.type || 'item').slice(0, 80), category, analysis.pattern ?? null,
        analysis.formality ?? null, analysis.sleeves ?? null, analysis.length ?? null, analysis.fit ?? null,
        analysis.neckline ?? null, typeof analysis.sheer === 'boolean' ? analysis.sheer : null, analysis.size ?? null,
        analysis.fabric ?? null, analysis.style ?? null, analysis.culturalOrigin ?? null, analysis.description ?? null,
        Array.isArray(analysis.dominantColours) ? analysis.dominantColours : [],
        Array.isArray(analysis.colourNames) ? analysis.colourNames : [],
        Array.isArray(analysis.suitableOccasions) ? analysis.suitableOccasions : [],
      ]
    );
    res.status(201).json({ success: true, data: toItem(rows[0]) });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/wardrobe/:id
 * Correct AI-detected details (e.g. category, sleeve length, size) on a saved item.
 */
router.patch('/:id', async (req, res, next) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(404).json({ error: 'Item not found.' });
    const sets = [];
    const values = [];
    for (const key of EDITABLE) {
      if (!(key in req.body)) continue;
      if (key === 'category' && !CATEGORIES.includes(req.body.category)) {
        return res.status(400).json({ error: 'Invalid category.' });
      }
      const column = COLUMNS[key] || ARRAYS[key];
      values.push(req.body[key]);
      sets.push(`${column} = $${values.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update.' });
    values.push(req.params.id);
    const { rows } = await query(`UPDATE wardrobe_items SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    if (!rows[0]) return res.status(404).json({ error: 'Item not found.' });
    res.json({ success: true, data: toItem(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(404).json({ error: 'Item not found.' });
    const { rows } = await query('DELETE FROM wardrobe_items WHERE id = $1 RETURNING image_id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Item not found.' });
    await deleteImage(rows[0].image_id);
    res.json({ success: true, message: 'Item removed from wardrobe.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.getWardrobe = getWardrobe;
module.exports.getItemsByIds = getItemsByIds;
module.exports.getItemImageId = getItemImageId;
