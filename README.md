# Gaya 👗

An AI wardrobe app. Upload the clothes you own, mix and match them into outfits that follow fashion rules (including hijab and modest dressing), and see any outfit on your own body.

## Features

- **Virtual try-on from any image.** Upload a photo or screenshot, or paste a Pinterest or image link, and see it on your saved body photo. A stylist review follows.
- **Mix and match your closet.** Upload your clothes (one at a time or in bulk). The AI tags each piece (category, colours, sleeves, length, fabric, occasions). Auto-match builds outfits from your own wardrobe and scores them with fashion rules.
- **Profile.** Body photo, height, weight, top/bottom/shoe size, body shape, age group, gender, modesty (none, modest, hijab), region and budget. It drives try-on, size-fit warnings and outfit scoring.
- **Colour check.** Palette harmony analysis with cultural presets. A personal colour-season analysis (by skin tone, photo or questions) is planned.
- **Local AI.** Runs on a local Ollama vision model, so no paid API is needed. Gemini is still supported.

The full list with status and what is planned is in [FEATURES.md](FEATURES.md).

## Architecture

```
gaya/
├── backend/        Node.js / Express API
│   └── src/
│       ├── routes/     analyze, suggest, wardrobe, profile, outfits, tryon, images
│       └── services/   aiModel (Ollama/Gemini), outfitRules, virtualTryOn,
│                       db (Postgres), storage (S3), remoteImage, tryonStore
├── web/            React + Vite (sidebar app)
├── mobile/         React Native (bottom tabs)
├── database/       PostgreSQL + LocalStack S3 (docker compose)
├── local-ai/       Ollama vision model (docker compose)
└── docker-compose.yml   backend + web
```

| Part | Tech |
|---|---|
| AI | Ollama `qwen2.5vl:7b` (default) or Google Gemini, set with `AI_PROVIDER` |
| Try-on | Hugging Face IDM-VTON Space (free, upper body only) |
| Data | PostgreSQL 16 |
| Images | S3 API via LocalStack (swap for real S3 by changing `S3_ENDPOINT`) |
| Web | React, Vite, TypeScript |
| Mobile | React Native, React Navigation, TypeScript |

## Quick start

Prerequisites: Docker, and Node 20+ if you run things outside Docker.

**1. Database and image storage**
```bash
cd database
cp .env.example .env     # set POSTGRES_PASSWORD
docker compose up -d
```

**2. Local AI model** (downloads about 6 GB on first run)
```bash
cd local-ai
docker compose up -d
```
Docker on Apple Silicon is CPU-only and slow (about 40 to 60 s per image). For GPU speed on a Mac, run native Ollama instead and point `OLLAMA_URL` at it. See [local-ai/README.md](local-ai/README.md).

**3. App**
```bash
cp .env.example .env
```
Edit `.env`:
- `AI_PROVIDER=ollama` (or `gemini` with `GEMINI_API_KEY`)
- `OLLAMA_URL` (`http://host.docker.internal:11435` for the Docker Ollama above)
- `DATABASE_URL`: the password must match `database/.env`
- `HF_TOKEN`: optional, a Hugging Face read token for the try-on Space

```bash
docker compose up -d --build
```
- Web: http://localhost:5173
- API: http://localhost:5050 (`/health`)

Start the database before the backend. Without Docker, run `npm install && npm run dev` in `backend/` and `web/`, with `localhost` in place of `host.docker.internal` in `.env`.

**Mobile**: `cd mobile && npm install`. It uses the same API; set `API_BASE_URL` in `mobile/src/constants/config.ts` (`http://10.0.2.2:5050` for the Android emulator, or your Mac's LAN IP for a real phone).

## How to use

1. **Profile**: add your body photo, sizes and modesty setting.
2. **Wardrobe**: add clothes with a clear photo of one item (or use bulk upload on web). Check the category and size on each card and fix them if needed.
3. **Outfit studio**: pick an occasion, auto-match or choose pieces yourself, check the fashion score, then try the outfit on and get a stylist review.
4. **Try on**: try any outfit image or link on your body.
5. **Colour check**: test a palette.

## API

See [API.md](API.md). Main groups: `/api/profile`, `/api/wardrobe`, `/api/outfits` (match, score, render, review), `/api/tryon` (preview, from-image, review), `/api/analyze`, `/api/suggest`, `/api/images/:id`.

## Limits to know about

- The free try-on Space only dresses the upper body (tops, dresses, outerwear). Bottoms and hijabs are scored and matched but not rendered. It can queue for minutes or be down. Garment photos on their own work best.
- Local model results depend on photo quality. Wrong tags can be fixed on the wardrobe card.
- Colour-season analysis is not built yet.
- The mobile app type-checks but has not been tested on a device yet; web is the main target.

## Contributing

Fork, create a feature branch, commit, push and open a pull request.

## License

MIT

---

Made with ❤️ by Mardhiah Najwa
