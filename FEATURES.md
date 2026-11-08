# Gaya features

Status: ✅ built · 🟡 partly built · 🕒 planned (kiv)

## Core features

### 1. Virtual try-on (any outfit image)
Take any outfit image (a Pinterest pin, a screenshot, a photo) and see it on your own body.

| | Status |
|---|---|
| Upload an image or screenshot | ✅ web, ✅ mobile |
| Paste a Pinterest or image link (pin pages use their main image; private addresses are blocked) | ✅ web, ✅ mobile |
| Uses the saved body photo from the profile | ✅ |
| Stylist review of the result, aware of the profile | ✅ |
| History of try-ons saved (result, source, review) | ✅ stored in the database; no history screen yet 🕒 |
| Full outfit rendering (bottoms, hijab) | 🕒 needs a better try-on model; the free one dresses the upper body only |
| Works best with garment-only images; photos of people wearing the outfit give weaker results | known limit |

### 2. Mix and match your closet
Upload all your clothes, have them tagged by category, and build outfits from what you own.

| | Status |
|---|---|
| Upload clothes with a photo, AI detects type, colours, fabric, sleeves, length, fit, neckline, occasions | ✅ |
| Category tagging (top, bottom, dress, outerwear, hijab, shoes, accessory) with manual correction | ✅ |
| Size per item (editable) | ✅ |
| Bulk upload | ✅ web, 🕒 mobile |
| Auto-match outfits for an occasion, ranked by fashion rules | ✅ |
| Fashion score: completeness, colour harmony, patterns, modesty, hijab pairing, occasion fit, sizing | ✅ |
| Hijab and modest styling rules | ✅ |
| Try the matched outfit on your body, with stylist review | ✅ |
| Save favourite outfits | 🟡 stored when rendered; no saved-outfits screen yet 🕒 |
| Filter or hide items that don't suit the profile | 🟡 warnings only; hiding not built 🕒 |

### 3. Profile, sizing and demographics
Needed to know what suits the wearer.

| | Status |
|---|---|
| Body photo | ✅ |
| Height, weight | ✅ |
| Top, bottom and shoe size | ✅ |
| Body shape | ✅ |
| Age group, gender | ✅ |
| Modesty (none, modest, hijab) | ✅ |
| Culture or region, budget | ✅ stored and shown to the stylist; budget not used for filtering yet 🕒 |
| Size mismatch warnings on outfits | ✅ |
| Profile page | ✅ web, ✅ mobile |

## Optional, planned later (kiv)

### Colour analysis
Some outfits don't suit our colouring. The user can enter their colour group, or generate it.

| | Status |
|---|---|
| Palette harmony check with cultural presets | ✅ web, ✅ mobile |
| Enter your colour season (Spring, Summer, Autumn, Winter) | 🟡 field exists in the profile, not used in scoring yet 🕒 |
| Generate your colour season from skin tone (photo) | 🕒 |
| Generate your colour season from a short quiz | 🕒 |
| Warn when an item's colour doesn't suit your season | 🕒 |

## Platform

| | Status |
|---|---|
| Web app (sidebar: Wardrobe, Outfit studio, Try on, Profile, Colour check) | ✅ |
| Mobile app (bottom tabs, same five screens) | 🟡 type-checked, not tested on a device |
| Local AI (Ollama `qwen2.5vl:7b`), no paid API needed | ✅ |
| PostgreSQL for data, S3 (LocalStack) for images | ✅ |
| Accounts and login (single user for now) | 🕒 |
