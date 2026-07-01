const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Converts a base64 image string to a Gemini-compatible inline part.
 */
function imageToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

/**
 * Analyse a clothing item image and return structured metadata.
 */
async function analyzeClothingItem(base64Image, mimeType = 'image/jpeg') {
  const prompt = `You are a fashion analyst with deep knowledge of Malay, Chinese, Indian, and Western clothing traditions.

Analyse this clothing item image and return a JSON object with the following fields:
{
  "type": "e.g. baju kurung, cheongsam, saree, t-shirt, dress, etc.",
  "dominantColours": ["array of hex colour codes, max 3"],
  "colourNames": ["descriptive colour names matching the hex array"],
  "fabric": "e.g. cotton, silk, linen, unknown",
  "style": "e.g. traditional, casual, formal, semi-formal",
  "culturalOrigin": "Malay | Chinese | Indian | Western | Neutral",
  "suitableOccasions": ["array from: Hari Raya, Chinese New Year, Deepavali, Wedding, Formal Work, Casual, Beach, Sports, Night Out, Funeral"],
  "description": "one sentence describing the item"
}

Respond with ONLY valid JSON. No markdown, no explanation.`;

  const imagePart = imageToGenerativePart(base64Image, mimeType);
  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(jsonText);
}

/**
 * Given a list of wardrobe items and an occasion, suggest outfit combinations.
 */
async function suggestOutfits(wardrobeItems, occasion, culturalContext = 'Any') {
  const itemsSummary = wardrobeItems
    .map((item, i) => `Item ${i + 1}: ${item.type} — ${item.description} (Colours: ${item.colourNames?.join(', ')}, Cultural: ${item.culturalOrigin})`)
    .join('\n');

  const prompt = `You are Gaya, a culturally-aware AI fashion stylist for Southeast Asia.

The user's wardrobe:
${itemsSummary}

Occasion: ${occasion}
Cultural preference: ${culturalContext}

Suggest up to 3 outfit combinations from the wardrobe above that are appropriate for the occasion.
For each outfit, consider:
- Cultural appropriateness (e.g. modest dressing for Hari Raya, auspicious colours for CNY, vibrant for Deepavali)
- Colour harmony (complementary, analogous, or neutral pairings)
- Dress code for the occasion

Return a JSON array:
[
  {
    "outfitName": "short creative name",
    "items": [item numbers used, e.g. [1, 3]],
    "colourHarmony": "explanation of why the colours work together",
    "whyItWorks": "cultural and occasion reasoning",
    "colourPalette": ["hex codes from the combined outfit"],
    "tips": "one styling tip"
  }
]

Respond with ONLY valid JSON. No markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(jsonText);
}

/**
 * Given two or more colours, analyse how well they pair together.
 */
async function analyseColours(hexColours) {
  const prompt = `You are a colour theory expert and fashion stylist.

Colours to analyse: ${hexColours.join(', ')}

Analyse these colours as a fashion pairing and return JSON:
{
  "harmonyType": "e.g. Complementary, Analogous, Triadic, Neutral, Clash",
  "score": <1-10 compatibility score>,
  "verdict": "one sentence verdict",
  "culturalNotes": "any cultural significance of these colours in Malay, Chinese, Indian, or Western context",
  "suggestedAccents": ["up to 2 hex colours that would complete this palette"]
}

Respond with ONLY valid JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(jsonText);
}

module.exports = { analyzeClothingItem, suggestOutfits, analyseColours };
