const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const { query } = require('./db');

const BUCKET = process.env.S3_BUCKET || 'gaya-images';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  // LocalStack needs path-style URLs (bucket in the path, not the hostname).
  forcePathStyle: true,
});

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function badRequest(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

/** Accepts a data URL or raw base64 and returns { buffer, mimeType }. */
function decodeImage(input, fallbackMime = 'image/jpeg') {
  if (typeof input !== 'string' || !input) throw badRequest('Image is missing.');
  const match = input.match(/^data:([^;]+);base64,(.*)$/s);
  const mimeType = match ? match[1] : fallbackMime;
  if (!EXT[mimeType]) throw badRequest('Only JPEG, PNG and WebP images are supported.');
  const buffer = Buffer.from(match ? match[2] : input, 'base64');
  if (buffer.length === 0) throw badRequest('Image is empty.');
  return { buffer, mimeType };
}

/** Uploads bytes to S3 and records them in the images table. Returns the image id. */
async function saveImage(input, { kind = 'misc', mimeType } = {}) {
  const decoded = Buffer.isBuffer(input) ? { buffer: input, mimeType: mimeType || 'image/jpeg' } : decodeImage(input, mimeType);
  if (!EXT[decoded.mimeType]) throw badRequest('Only JPEG, PNG and WebP images are supported.');
  const key = `${kind}/${uuidv4()}.${EXT[decoded.mimeType]}`;
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: decoded.buffer, ContentType: decoded.mimeType }));
  const { rows } = await query(
    'INSERT INTO images (bucket, s3_key, mime_type, size_bytes) VALUES ($1,$2,$3,$4) RETURNING id',
    [BUCKET, key, decoded.mimeType, decoded.buffer.length]
  );
  return rows[0].id;
}

/** Returns { buffer, mimeType } for an image id, or null if it doesn't exist. */
async function loadImage(id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return null;
  const { rows } = await query('SELECT bucket, s3_key, mime_type FROM images WHERE id = $1', [id]);
  if (!rows[0]) return null;
  const obj = await s3.send(new GetObjectCommand({ Bucket: rows[0].bucket, Key: rows[0].s3_key }));
  return { buffer: Buffer.from(await obj.Body.transformToByteArray()), mimeType: rows[0].mime_type };
}

async function loadImageBase64(id) {
  const img = await loadImage(id);
  return img && { base64: img.buffer.toString('base64'), mimeType: img.mimeType };
}

async function deleteImage(id) {
  if (!id) return;
  const { rows } = await query('DELETE FROM images WHERE id = $1 RETURNING bucket, s3_key', [id]);
  if (rows[0]) {
    await s3.send(new DeleteObjectCommand({ Bucket: rows[0].bucket, Key: rows[0].s3_key })).catch(() => {});
  }
}

const imageUrl = (id) => (id ? `/api/images/${id}` : null);

module.exports = { saveImage, loadImage, loadImageBase64, deleteImage, decodeImage, imageUrl };
