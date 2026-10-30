/**
 * Deterministic fashion rules for judging and matching outfits made from wardrobe items.
 * An outfit is an array of wardrobe items. A profile is 'hijab' | 'modest' | 'none'.
 */

const CATEGORIES = ['top', 'bottom', 'dress', 'outerwear', 'hijab', 'shoes', 'accessory'];

const CATEGORY_KEYWORDS = [
  ['hijab', /hijab|tudung|shawl|scarf|selendang|bawal|veil|dupatta/i],
  ['outerwear', /blazer|jacket|cardigan|coat|kimono|outer|vest|bolero|shrug/i],
  ['dress', /dress|gown|abaya|jubah|kurung|kebaya set|saree|sari|cheongsam|qipao|kaftan|jumpsuit|lehenga|churidar|thobe/i],
  ['bottom', /pants|trouser|jeans|skirt|kain|shorts|culotte|palazzo|leggings|sarong|slacks/i],
  ['shoes', /shoe|heel|sandal|sneaker|boot|flat|loafer|kasut/i],
  ['accessory', /bag|belt|watch|necklace|earring|bracelet|brooch|glasses|clutch/i],
  ['top', /shirt|blouse|top|tee|kebaya|baju|sweater|hoodie|polo|tunic|kurta|tank/i],
];

const NEUTRAL_WORDS = /black|white|grey|gray|beige|cream|ivory|nude|tan|khaki|navy|brown|taupe|charcoal|silver|off-white/i;

const FORMALITY = { casual: 1, 'smart-casual': 2, formal: 3, traditional: 3 };

const LENGTH_ORDER = ['cropped', 'waist', 'hip', 'thigh', 'knee', 'midi', 'ankle', 'full'];

const OCCASION_RULES = {
  hari_raya: { tags: ['hari raya'], formality: [3, 3], note: 'Festive, modest and polished' },
  hari_raya_haji: { tags: ['hari raya'], formality: [3, 3] },
  cny: { tags: ['chinese new year'], formality: [2, 3], prefer: 'warm', avoidAllDark: true },
  deepavali: { tags: ['deepavali'], formality: [2, 3], prefer: 'bright', avoidAllDark: true },
  thaipusam: { tags: ['deepavali', 'casual'], formality: [1, 2] },
  vesak: { tags: ['casual', 'formal work'], formality: [1, 2], prefer: 'calm' },
  wedding_malay: { tags: ['wedding', 'hari raya'], formality: [3, 3] },
  wedding_chinese: { tags: ['wedding', 'chinese new year'], formality: [3, 3] },
  wedding_indian: { tags: ['wedding', 'deepavali'], formality: [3, 3] },
  wedding_western: { tags: ['wedding', 'formal work'], formality: [3, 3] },
  formal_work: { tags: ['formal work'], formality: [2, 3] },
  casual: { tags: ['casual'], formality: [1, 2] },
  night_out: { tags: ['night out'], formality: [2, 3] },
  beach: { tags: ['beach', 'casual'], formality: [1, 1] },
  sports: { tags: ['sports'], formality: [1, 1] },
  funeral: { tags: ['funeral'], formality: [2, 3], prefer: 'subdued' },
};

function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

function hueDistance(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function itemColour(item) {
  const hex = item.dominantColours && item.dominantColours[0];
  const hsl = hexToHsl(hex);
  const name = (item.colourNames && item.colourNames[0]) || '';
  if (!hsl) return { hex, hsl: null, neutral: NEUTRAL_WORDS.test(name), dark: false, bright: false };
  const neutral = hsl.s < 0.18 || hsl.l < 0.15 || hsl.l > 0.9 || NEUTRAL_WORDS.test(name);
  return { hex, hsl, neutral, dark: hsl.l < 0.28, bright: !neutral && hsl.s > 0.55 && hsl.l > 0.35 };
}

function categoryOf(item) {
  if (CATEGORIES.includes(item.category)) return item.category;
  for (const [cat, re] of CATEGORY_KEYWORDS) {
    if (re.test(item.type || '')) return cat;
  }
  return 'top';
}

function check(id, label, status, detail) {
  return { id, label, status, detail };
}

function checkCompleteness(items) {
  const cats = items.map(categoryOf);
  const count = (c) => cats.filter((x) => x === c).length;
  const hasDress = count('dress') > 0;
  const complete = hasDress || (count('top') > 0 && count('bottom') > 0);
  const dupes = ['top', 'bottom', 'dress', 'outerwear', 'hijab', 'shoes'].filter((c) => count(c) > 1);

  if (!complete) {
    return check('complete', 'Complete outfit', 'fail', 'Needs a dress, or a top and a bottom.');
  }
  if (hasDress && (count('top') > 0 || count('bottom') > 0)) {
    return check('complete', 'Complete outfit', 'warn', 'A dress usually replaces a separate top and bottom.');
  }
  if (dupes.length) {
    return check('complete', 'Complete outfit', 'warn', `More than one ${dupes.join(', ')} in the outfit.`);
  }
  return check('complete', 'Complete outfit', 'pass', hasDress ? 'One-piece base.' : 'Top and bottom present.');
}

function checkColours(items) {
  const colours = items
    .filter((i) => !['shoes', 'accessory'].includes(categoryOf(i)))
    .map(itemColour)
    .filter((c) => c.hsl);
  const chromatic = colours.filter((c) => !c.neutral);

  if (colours.length === 0) {
    return check('colour', 'Colour harmony', 'warn', 'Colours were not detected for these pieces.');
  }
  if (chromatic.length <= 1) {
    return check('colour', 'Colour harmony', 'pass', chromatic.length ? 'Neutral base with one accent colour.' : 'Neutral palette.');
  }

  const hues = chromatic.map((c) => c.hsl.h);
  let maxDist = 0;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) maxDist = Math.max(maxDist, hueDistance(hues[i], hues[j]));
  }

  if (chromatic.length >= 3 && maxDist > 70) {
    return check('colour', 'Colour harmony', 'warn', 'Three or more different colours can look busy; keep to one or two.');
  }
  if (maxDist <= 40) return check('colour', 'Colour harmony', 'pass', 'Analogous colours sit well together.');
  if (maxDist >= 150) return check('colour', 'Colour harmony', 'pass', 'Complementary colours give strong contrast.');
  if (maxDist >= 110 && maxDist <= 135) return check('colour', 'Colour harmony', 'pass', 'A balanced triadic pairing.');
  return check('colour', 'Colour harmony', 'warn', 'These two colours sit awkwardly on the colour wheel; try a neutral in between.');
}

function checkPatterns(items) {
  const busy = items.filter((i) => i.pattern && !/^(solid|plain|none|unknown)$/i.test(i.pattern));
  if (busy.length > 1) {
    return check('pattern', 'Patterns', 'warn', 'Two patterned pieces compete; pair a pattern with solids.');
  }
  return check('pattern', 'Patterns', 'pass', busy.length ? 'One statement pattern, balanced by solids.' : 'Solid pieces; easy to style.');
}

function modestyIssues(item) {
  const cat = categoryOf(item);
  const fails = [];
  const warns = [];
  if (['hijab', 'shoes', 'accessory'].includes(cat)) return { fails, warns };

  const name = item.type || 'piece';
  const lengthIdx = LENGTH_ORDER.indexOf(item.length);
  const covers = (min) => lengthIdx >= LENGTH_ORDER.indexOf(min);

  if (cat !== 'bottom') {
    if (item.sleeves === 'sleeveless' || item.sleeves === 'short') {
      (cat === 'outerwear' ? warns : fails).push(`${name}: sleeves too short`);
    } else if (!item.sleeves || item.sleeves === 'unknown') {
      warns.push(`${name}: sleeve length unknown`);
    }
    if (['deep', 'off-shoulder', 'plunging'].includes(item.neckline)) fails.push(`${name}: neckline too low`);
    else if (item.neckline === 'v') warns.push(`${name}: V-neck may need an inner`);
  }

  if (cat === 'top' || cat === 'outerwear') {
    if (lengthIdx >= 0 && !covers('hip')) fails.push(`${name}: too short to cover the hips`);
  }
  if (cat === 'bottom' || cat === 'dress') {
    if (lengthIdx < 0) warns.push(`${name}: length unknown`);
    else if (!covers('midi')) fails.push(`${name}: hem too short`);
    else if (!covers('ankle')) warns.push(`${name}: ankle-length is more modest`);
  }
  if (item.fit === 'fitted' || item.fit === 'tight') warns.push(`${name}: fitted cut; relaxed is more modest`);
  if (item.sheer === true) warns.push(`${name}: sheer fabric needs a lining or layer`);

  return { fails, warns };
}

function checkModesty(items, profile) {
  if (profile !== 'hijab' && profile !== 'modest') return null;
  const hasOuter = items.some((i) => categoryOf(i) === 'outerwear');
  let fails = [];
  let warns = [];
  for (const item of items) {
    const r = modestyIssues(item);
    fails = fails.concat(r.fails);
    warns = warns.concat(r.warns);
  }
  if (hasOuter) warns = warns.filter((w) => !/sheer/.test(w));
  if (fails.length) return check('modesty', 'Modest coverage', 'fail', fails.join('; ') + '.');
  if (warns.length) return check('modesty', 'Modest coverage', 'warn', warns.join('; ') + '.');
  return check('modesty', 'Modest coverage', 'pass', 'Sleeves, hem and neckline are suitably covered.');
}

function checkHijab(items, profile, wardrobeHasHijab) {
  if (profile !== 'hijab') return null;
  const hijab = items.find((i) => categoryOf(i) === 'hijab');
  if (!hijab) {
    return wardrobeHasHijab
      ? check('hijab', 'Hijab pairing', 'warn', 'Add a hijab or scarf to complete the look.')
      : check('hijab', 'Hijab pairing', 'warn', 'No hijab in your wardrobe yet; add one so it can be matched.');
  }
  const hc = itemColour(hijab);
  const others = items.filter((i) => categoryOf(i) !== 'hijab').map(itemColour).filter((c) => c.hsl);
  if (!hc.hsl) return check('hijab', 'Hijab pairing', 'pass', 'Hijab included.');
  if (hc.neutral) return check('hijab', 'Hijab pairing', 'pass', 'A neutral hijab frames the outfit safely.');

  const matches = others.some((o) => !o.neutral && (hueDistance(o.hsl.h, hc.hsl.h) <= 40 || hueDistance(o.hsl.h, hc.hsl.h) >= 150));
  const allOthersNeutral = others.every((o) => o.neutral);
  if (matches || allOthersNeutral) {
    return check('hijab', 'Hijab pairing', 'pass', matches ? 'Hijab colour echoes the outfit.' : 'A coloured hijab lifts a neutral outfit.');
  }
  return check('hijab', 'Hijab pairing', 'warn', 'Hijab colour clashes with the outfit; try a neutral or a matching tone.');
}

function checkOccasion(items, occasionId) {
  const rule = OCCASION_RULES[occasionId];
  if (!rule) return null;

  const levels = items
    .filter((i) => !['shoes', 'accessory', 'hijab'].includes(categoryOf(i)))
    .map((i) => FORMALITY[i.formality] || FORMALITY[String(i.style || '').toLowerCase()] || 0)
    .filter(Boolean);
  const tagHit = items.some((i) => (i.suitableOccasions || []).some((o) => rule.tags.some((t) => String(o).toLowerCase().includes(t))));
  const avg = levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;
  const colours = items.map(itemColour).filter((c) => c.hsl);

  if (rule.prefer === 'subdued' && colours.some((c) => c.bright)) {
    return check('occasion', 'Occasion fit', 'fail', 'Keep to dark or muted tones for this occasion.');
  }
  if (rule.avoidAllDark && colours.length && colours.every((c) => c.dark || c.neutral)) {
    return check('occasion', 'Occasion fit', 'warn', 'All-dark or all-neutral can feel flat; add a festive colour.');
  }
  if (avg && (avg < rule.formality[0] - 0.4 || avg > rule.formality[1] + 0.4)) {
    return check('occasion', 'Occasion fit', 'warn', avg < rule.formality[0] ? 'A bit too casual for this occasion.' : 'More dressed-up than this occasion needs.');
  }
  if (!tagHit) {
    return check('occasion', 'Occasion fit', 'warn', 'None of these pieces are tagged for this occasion.');
  }
  return check('occasion', 'Occasion fit', 'pass', 'Suits the occasion.');
}

function scoreOutfit(items, { occasion, profile = 'none', wardrobe = [] } = {}) {
  const wardrobeHasHijab = wardrobe.some((i) => categoryOf(i) === 'hijab');
  const checks = [
    checkCompleteness(items),
    checkColours(items),
    checkPatterns(items),
    checkModesty(items, profile),
    checkHijab(items, profile, wardrobeHasHijab),
    checkOccasion(items, occasion),
  ].filter(Boolean);

  const score = Math.max(
    0,
    100 - checks.reduce((sum, c) => sum + (c.status === 'fail' ? 30 : c.status === 'warn' ? 10 : 0), 0)
  );
  return { score, checks };
}

function matchOutfits(wardrobe, { occasion, profile = 'none', limit = 6 } = {}) {
  const byCat = (cat) => wardrobe.filter((i) => categoryOf(i) === cat);
  const modest = profile === 'hijab' || profile === 'modest';

  // Pieces that outright break the modesty rules are never used when a profile asks for it.
  const usable = (items) => (modest ? items.filter((i) => modestyIssues(i).fails.length === 0) : items);

  const tops = usable(byCat('top'));
  const bottoms = usable(byCat('bottom'));
  const dresses = usable(byCat('dress'));
  const outers = [null, ...usable(byCat('outerwear'))];
  const hijabs = profile === 'hijab' ? [null, ...byCat('hijab')] : [null];

  const bases = [...dresses.map((d) => [d]), ...tops.flatMap((t) => bottoms.map((b) => [t, b]))];
  const candidates = [];
  for (const base of bases) {
    for (const outer of outers) {
      for (const hijab of hijabs) {
        const items = [...base, outer, hijab].filter(Boolean);
        const result = scoreOutfit(items, { occasion, profile, wardrobe });
        candidates.push({ itemIds: items.map((i) => i.id), ...result });
      }
    }
  }

  // Prefer complete looks (more layers/hijab when asked) and avoid reusing one piece over and over.
  candidates.sort((a, b) => b.score - a.score || b.itemIds.length - a.itemIds.length);
  const used = new Map();
  const picked = [];
  for (const c of candidates) {
    if (picked.length >= limit) break;
    if (c.checks.some((x) => x.id === 'complete' && x.status === 'fail')) continue;
    const overused = c.itemIds.some((id) => (used.get(id) || 0) >= 2);
    if (overused) continue;
    c.itemIds.forEach((id) => used.set(id, (used.get(id) || 0) + 1));
    picked.push(c);
  }
  return picked;
}

module.exports = { CATEGORIES, categoryOf, scoreOutfit, matchOutfits, OCCASION_RULES };
