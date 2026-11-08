const express = require('express');
const { pool, query, ensureProfileId } = require('../services/db');
const { saveImage, deleteImage, imageUrl } = require('../services/storage');

const router = express.Router();

const ENUMS = {
  bodyShape: ['hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle', 'not-sure'],
  ageGroup: ['teen', '20s', '30s', '40s', '50s+'],
  gender: ['female', 'male', 'non-binary'],
  modesty: ['none', 'modest', 'hijab'],
  budget: ['low', 'mid', 'high'],
};
const NULLABLE_ENUMS = ['ageGroup', 'gender', 'budget'];
const NUMBERS = { heightCm: [100, 230], weightKg: [25, 250] };
const STRINGS = ['topSize', 'bottomSize', 'shoeSize', 'region', 'colourSeason', 'skinTone'];

const COLUMN = {
  bodyShape: 'body_shape', ageGroup: 'age_group', gender: 'gender', modesty: 'modesty', budget: 'budget',
  heightCm: 'height_cm', weightKg: 'weight_kg', topSize: 'top_size', bottomSize: 'bottom_size',
  shoeSize: 'shoe_size', region: 'region', colourSeason: 'colour_season', skinTone: 'skin_tone',
};

async function primaryPhotoImageId(profileId) {
  const { rows } = await query('SELECT image_id FROM body_photos WHERE profile_id = $1 AND is_primary', [profileId]);
  return rows[0] ? rows[0].image_id : null;
}

function toProfile(row, photoImageId) {
  return {
    bodyPhoto: imageUrl(photoImageId),
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    topSize: row.top_size,
    bottomSize: row.bottom_size,
    shoeSize: row.shoe_size,
    bodyShape: row.body_shape,
    ageGroup: row.age_group,
    gender: row.gender,
    modesty: row.modesty,
    region: row.region,
    budget: row.budget,
    colourSeason: row.colour_season || '',
    skinTone: row.skin_tone || '',
  };
}

/** Used by other routes so advice and scoring can consider the saved profile. */
async function getProfile() {
  const id = await ensureProfileId();
  const { rows } = await query('SELECT * FROM profiles WHERE id = $1', [id]);
  return toProfile(rows[0], await primaryPhotoImageId(id));
}

/** The primary body photo's image id, used when a try-on request doesn't send its own photo. */
async function getBodyPhotoImageId() {
  return primaryPhotoImageId(await ensureProfileId());
}

/** Returns { values: {column: value} } or { error } from a request body. */
function validate(body = {}) {
  const values = {};
  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (!(key in body)) continue;
    const v = body[key];
    if (v === null && NULLABLE_ENUMS.includes(key)) values[COLUMN[key]] = null;
    else if (allowed.includes(v)) values[COLUMN[key]] = v;
    else return { error: `Invalid value for ${key}` };
  }
  for (const [key, [min, max]] of Object.entries(NUMBERS)) {
    if (!(key in body)) continue;
    const v = body[key];
    if (v === null || v === '') {
      values[COLUMN[key]] = null;
      continue;
    }
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) return { error: `${key} must be between ${min} and ${max}` };
    values[COLUMN[key]] = Math.round(n);
  }
  for (const key of STRINGS) {
    if (key in body) values[COLUMN[key]] = String(body[key] ?? '').trim().slice(0, 40);
  }
  return { values };
}

router.get('/', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await getProfile() });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/profile
 * Partial update. bodyPhoto: a data URL to replace the primary photo, or null to remove it.
 */
router.put('/', async (req, res, next) => {
  try {
    const { values, error } = validate(req.body);
    if (error) return res.status(400).json({ error });
    const photo = req.body.bodyPhoto;
    if ('bodyPhoto' in req.body && photo !== null && !(typeof photo === 'string' && photo.startsWith('data:'))) {
      return res.status(400).json({ error: 'bodyPhoto must be a data URL or null.' });
    }
    const profileId = await ensureProfileId();

    const columns = Object.keys(values);
    if (columns.length) {
      const sets = columns.map((c, i) => `${c} = $${i + 1}`).join(', ');
      await query(`UPDATE profiles SET ${sets} WHERE id = $${columns.length + 1}`, [...Object.values(values), profileId]);
    }

    if ('bodyPhoto' in req.body) {
      const oldImageId = await primaryPhotoImageId(profileId);
      const newImageId = photo ? await saveImage(photo, { kind: 'body' }) : null;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM body_photos WHERE profile_id = $1 AND is_primary', [profileId]);
        if (newImageId) {
          await client.query('INSERT INTO body_photos (profile_id, image_id, is_primary) VALUES ($1,$2,true)', [profileId, newImageId]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
      await deleteImage(oldImageId);
    }

    res.json({ success: true, data: await getProfile() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.getProfile = getProfile;
module.exports.getBodyPhotoImageId = getBodyPhotoImageId;
