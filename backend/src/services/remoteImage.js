const dns = require('dns').promises;
const net = require('net');

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 4;
const TIMEOUT_MS = 15000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function bad(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7));
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
}

/** Rejects non-http(s) URLs and hosts that resolve to private or local addresses (SSRF guard). */
async function assertPublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw bad('That is not a valid URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw bad('Only http(s) URLs are supported.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true }).catch(() => []);
  if (!addresses.length) throw bad('Could not resolve that address.');
  if (addresses.some((a) => isPrivateIp(a.address))) throw bad('That address is not allowed.');
  return url;
}

async function readLimited(response, limit) {
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > limit) throw bad('That file is too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function fetchFollowing(raw) {
  let current = raw;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current);
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GayaBot/1.0)', Accept: 'image/*,text/html;q=0.8' },
    }).catch(() => {
      throw bad('Could not download that link.', 502);
    });
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      current = new URL(response.headers.get('location'), url).toString();
      continue;
    }
    if (!response.ok) throw bad(`The link returned an error (${response.status}).`, 502);
    return { response, url };
  }
  throw bad('Too many redirects.');
}

function findOgImage(html, baseUrl) {
  const tag = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]*>/i);
  const content = tag && tag[0].match(/content=["']([^"']+)["']/i);
  if (!content) return null;
  try {
    return new URL(content[1].replace(/&amp;/g, '&'), baseUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Downloads an image from a URL. If the URL is a web page (e.g. a Pinterest pin), uses its
 * og:image. Resolves to { buffer, mimeType }.
 */
async function fetchRemoteImage(rawUrl) {
  const first = await fetchFollowing(rawUrl);
  let type = (first.response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();

  let target = first;
  if (type.includes('html')) {
    const html = (await readLimited(first.response, MAX_HTML_BYTES)).toString('utf8');
    const og = findOgImage(html, first.url);
    if (!og) throw bad('No image found on that page. Try the direct image link.');
    target = await fetchFollowing(og);
    type = (target.response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  }

  if (!IMAGE_TYPES.includes(type)) throw bad('That link is not a JPEG, PNG or WebP image.');
  return { buffer: await readLimited(target.response, MAX_BYTES), mimeType: type };
}

module.exports = { fetchRemoteImage, isPrivateIp };
