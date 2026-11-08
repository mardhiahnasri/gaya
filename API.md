# Gaya API Documentation

## Base URL
```
http://localhost:5050
```

## Authentication
Currently no authentication required. In production, add API key validation.

---

## 📋 Endpoints

### 1. Analyze Clothing
Analyze a clothing item from a base64-encoded image using the configured AI model.

**Endpoint:** `POST /api/analyze/clothing`

**Request:**
```json
{
  "base64": "iVBORw0KGgo...",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "Black Blazer",
    "description": "Classic wool blazer, perfect for formal occasions",
    "dominantColours": ["#000000", "#2F2F2F"],
    "colourNames": ["Black", "Charcoal"],
    "fabric": "Wool",
    "style": "Formal",
    "culturalOrigin": "Western",
    "suitableOccasions": ["Work", "Formal Event", "Interview"],
    "description": "A classic black wool blazer with a tailored fit"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid base64 or missing parameters
- `500` - Server error (AI provider issue)

---

### 2. Analyze Colors
Check color compatibility and harmony.

**Endpoint:** `POST /api/analyze/colours`

**Request:**
```json
{
  "colours": ["#000000", "#FFFFFF", "#2244D4"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "harmonyType": "Triadic",
    "score": 8,
    "verdict": "Excellent color combination with high contrast and visual interest",
    "culturalNotes": "This combination works well across most cultural contexts",
    "suggestedAccents": ["#FFD700", "#FF6B6B"]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid color format or insufficient colors
- `500` - Server error

---

### 3. Get Outfit Suggestions
Generate outfit suggestions for a specific occasion.

**Endpoint:** `POST /api/suggest/outfits`

**Request:**
```json
{
  "wardrobeItems": [
    {
      "type": "Black Blazer",
      "dominantColours": ["#000000"],
      "colourNames": ["Black"],
      "fabric": "Wool",
      "style": "Formal",
      "culturalOrigin": "Western",
      "suitableOccasions": ["Work", "Formal"],
      "description": "Classic black blazer"
    },
    {
      "type": "White T-Shirt",
      "dominantColours": ["#FFFFFF"],
      "colourNames": ["White"],
      "fabric": "Cotton",
      "style": "Casual",
      "culturalOrigin": "Western",
      "suitableOccasions": ["Casual"],
      "description": "Cotton tee"
    }
  ],
  "occasion": "Job Interview",
  "culturalContext": "Western"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "outfitName": "Professional Interview Look",
      "items": [1, 2],
      "colourHarmony": "Monochromatic - black and white create strong contrast",
      "whyItWorks": "The black blazer conveys professionalism while the white shirt keeps it fresh and approachable",
      "colourPalette": ["#000000", "#FFFFFF"],
      "tips": "Add a silk tie or scarf for extra polish"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing wardrobe items or occasion
- `500` - AI provider error

---

### 4. Get Wardrobe
Fetch all saved wardrobe items.

**Endpoint:** `GET /api/wardrobe`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "Black Blazer",
      "dominantColours": ["#000000"],
      "colourNames": ["Black"],
      "fabric": "Wool",
      "style": "Formal",
      "culturalOrigin": "Western",
      "suitableOccasions": ["Work", "Formal"],
      "description": "Classic black blazer",
      "imageUri": "data:image/jpeg;base64,...",
      "addedAt": "2026-07-01T12:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### 5. Add to Wardrobe
Save an analyzed clothing item to the wardrobe.

**Endpoint:** `POST /api/wardrobe`

**Request:**
```json
{
  "analysis": {
    "type": "Blue Jeans",
    "dominantColours": ["#1F3A8A"],
    "colourNames": ["Navy Blue"],
    "fabric": "Denim",
    "style": "Casual",
    "culturalOrigin": "Western",
    "suitableOccasions": ["Casual", "Weekend"],
    "description": "Classic blue denim jeans"
  },
  "imageUri": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "Blue Jeans",
    "dominantColours": ["#1F3A8A"],
    "colourNames": ["Navy Blue"],
    "fabric": "Denim",
    "style": "Casual",
    "culturalOrigin": "Western",
    "suitableOccasions": ["Casual", "Weekend"],
    "description": "Classic blue denim jeans",
    "imageUri": "data:image/jpeg;base64,...",
    "addedAt": "2026-07-01T12:05:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Missing analysis object
- `500` - Server error

---

### 6. Delete from Wardrobe
Remove an item from the wardrobe.

**Endpoint:** `DELETE /api/wardrobe/:id`

**Example:**
```
DELETE /api/wardrobe/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from wardrobe."
}
```

**Status Codes:**
- `200` - Success
- `404` - Item not found
- `500` - Server error

---

### 7. Virtual Try-On Preview
Generate a virtual try-on preview using Hugging Face IDM-VTON.

**Endpoint:** `POST /api/tryon/preview`

**Request:**
```json
{
  "personImage": {
    "base64": "iVBORw0KGgo...",
    "mimeType": "image/jpeg"
  },
  "garmentImages": [
    {
      "base64": "iVBORw0KGgo...",
      "mimeType": "image/jpeg",
      "category": "top",
      "name": "Black Blazer"
    }
  ],
  "fitNotes": "Make sure the blazer fits well with the dress"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "provider": "huggingface",
    "previewImageBase64": "iVBORw0KGgo...",
    "previewImageUrl": "https://...",
    "fitNotes": "The blazer fits well and complements the dress",
    "warnings": []
  }
}
```

**Possible Status Values:**
- `ready` - Preview generated successfully
- `provider_unavailable` - Hugging Face service temporarily unavailable

**Status Codes:**
- `200` - Success
- `400` - Invalid image data
- `503` - Hugging Face service unavailable
- `500` - Server error

---

## 🔍 Data Models

### ClothingAnalysis
```typescript
interface ClothingAnalysis {
  type: string;                    // e.g., "Black Blazer"
  dominantColours: string[];       // Hex colors
  colourNames: string[];           // Color names
  fabric: string;                  // e.g., "Wool"
  style: string;                   // e.g., "Formal"
  culturalOrigin: string;          // e.g., "Western"
  suitableOccasions: string[];     // e.g., ["Work", "Formal"]
  description: string;             // Item description
}
```

### WardrobeItem (ClothingAnalysis + metadata)
```typescript
interface WardrobeItem extends ClothingAnalysis {
  id: string;                      // UUID
  imageUri: string | null;         // Base64 or file path
  addedAt: string;                 // ISO timestamp
}
```

### OutfitSuggestion
```typescript
interface OutfitSuggestion {
  outfitName: string;              // e.g., "Professional Interview Look"
  items: number[];                 // Indices of wardrobe items used
  colourHarmony: string;           // Description of color harmony
  whyItWorks: string;              // Explanation
  colourPalette: string[];         // Hex colors in outfit
  tips: string;                    // Styling tips
}
```

### ColourAnalysis
```typescript
interface ColourAnalysis {
  harmonyType: string;             // e.g., "Triadic"
  score: number;                   // 1-10
  verdict: string;                 // Assessment
  culturalNotes: string;           // Cultural context
  suggestedAccents: string[];      // Accent color suggestions
}
```

### VirtualTryOnResult
```typescript
interface VirtualTryOnResult {
  status: 'ready' | 'provider_unavailable';
  provider: string;                // e.g., "huggingface"
  previewImageBase64?: string;     // Generated image
  previewImageUrl?: string;        // URL if stored
  fitNotes?: string;               // Fit assessment
  warnings: string[];              // Any warnings
}
```

---

## 🔐 Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Messages
- `"analysis object is required."` - Missing analysis data
- `"Item not found."` - Item ID doesn't exist
- `"Invalid AI API key."` - API configuration error
- `"Provider unavailable."` - Hugging Face service down

---

## 📊 Examples

### Complete Workflow

**1. Upload and Analyze Clothing:**
```bash
curl -X POST http://localhost:5050/api/analyze/clothing \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "iVBORw0KGgo...",
    "mimeType": "image/jpeg"
  }'
```

**2. Save to Wardrobe:**
```bash
curl -X POST http://localhost:5050/api/wardrobe \
  -H "Content-Type: application/json" \
  -d '{
    "analysis": {
      "type": "Black Blazer",
      ...
    },
    "imageUri": "data:image/jpeg;base64,..."
  }'
```

**3. Get Suggestions:**
```bash
curl -X POST http://localhost:5050/api/suggest/outfits \
  -H "Content-Type: application/json" \
  -d '{
    "wardrobeItems": [...],
    "occasion": "Job Interview",
    "culturalContext": "Western"
  }'
```

---

## 🚀 Rate Limiting

Currently no rate limiting implemented. For production:
- Implement per-IP rate limiting (100 requests/minute)
- Cache AI responses to reduce API costs
- Queue virtual try-on requests

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Base64 images should be complete data URIs or raw base64
- Color codes should be valid hex format (#RRGGBB)
- Wardrobe is persisted in `backend/wardrobe.json`

---

**Last Updated**: July 2026
**API Version**: 1.0


---

## Outfit matching (web studio)

All endpoints take `profile`: `hijab` | `modest` | `none`, and `occasion`: an id from the web app's occasion list (e.g. `hari_raya`, `formal_work`).

- `POST /api/outfits/match` `{ occasion, profile, limit? }` returns ranked outfits `[{ itemIds, score, checks }]` built from the saved wardrobe using rule-based fashion checks (completeness, colour harmony, patterns, modest coverage, hijab pairing, occasion fit).
- `POST /api/outfits/score` `{ itemIds, occasion, profile }` returns `{ score, checks }` for a chosen outfit.
- `POST /api/outfits/render` `{ personImage: { base64, mimeType }, itemIds }` renders the outfit on a body photo by chaining try-on passes (dress or top, then outerwear). Bottoms and hijabs are not rendered by the free model and come back as warnings.
- `POST /api/outfits/review` `{ image: { base64, mimeType }, itemIds, occasion, profile }` returns a stylist review `{ score, verdict, strengths, issues, swaps }` from the vision model.
- `PATCH /api/wardrobe/:id` corrects detected fields such as `category`, `sleeves`, `length`, `fit`.

## Profile, images and try-on from any image

Photos are stored in S3 and returned as relative URLs like `/api/images/<id>`.

| Endpoint | Purpose |
|---|---|
| `GET /api/profile` | Body photo URL, height, weight, top/bottom/shoe size, body shape, age group, gender, modesty (`none`/`modest`/`hijab`), region, budget, colour season |
| `PUT /api/profile` | Partial update. `bodyPhoto`: data URL to replace the photo, `null` to remove it |
| `GET /api/images/:id` | Serves a stored image |
| `POST /api/tryon/from-image` | Body: `{ sourceImage?: {base64, mimeType}, sourceUrl?, category: 'top'｜'dress'｜'outerwear' }`. Tries any outfit image on the saved body photo. `sourceUrl` may be a direct image link or a page (e.g. a Pinterest pin, its `og:image` is used). Private addresses are rejected |
| `POST /api/tryon/review` | Body: `{ image, occasion?, tryonId? }`. Stylist review that considers the profile |

Changes to existing endpoints:
- `POST /api/outfits/render`: `personImage` is optional and defaults to the saved body photo. The response adds `tryonId` and `resultImageUrl`.
- `POST /api/outfits/match|score|review`: the saved profile (modesty, sizes, demographics) is used. An explicit `profile` in the body still overrides modesty. Items whose `size` differs from the profile get a "Sizing" warning.
- `PATCH /api/wardrobe/:id` also accepts `size`.
