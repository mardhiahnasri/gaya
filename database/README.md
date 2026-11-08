# Gaya database

PostgreSQL 16 plus LocalStack (S3 for images) in Docker, kept separate from the app stack like `local-ai/`.

```bash
cd database
cp .env.example .env        # set POSTGRES_PASSWORD
docker compose up -d
docker compose ps           # wait for "healthy"
```

Connect from the host: `psql postgresql://gaya:<password>@localhost:5433/gaya`
From the backend container: `postgresql://gaya:<password>@host.docker.internal:5433/gaya`

## Image storage (LocalStack S3)

Bucket `gaya-images` is created on start by `localstack/init/01-bucket.sh`. Endpoint from the host:
`http://localhost:4566`; from the backend container: `http://host.docker.internal:4566`. Use path-style
addressing (`forcePathStyle: true` in the AWS SDK). Check it with
`docker exec gaya-localstack awslocal s3 ls`. In production swap the endpoint for real S3; no code change.

## Schema (`init/001_schema.sql`)

| Table | Purpose |
|---|---|
| `profiles` | Sizes, height/weight, body shape, age group, gender, modesty/hijab, region, budget, optional colour season |
| `images`, `body_photos` | Image metadata (bucket + S3 key; bytes are in S3), and the user's body photos (one primary) |
| `wardrobe_items` | Closet items with category tag and detected details (colours, sleeves, length, size…) |
| `outfits`, `outfit_items` | Saved mix-and-match outfits with their rule-based score |
| `tryons` | Try-on results from closet outfits or any outside image/URL, with the AI review |

The init script only runs on the first start of an empty volume. For later changes add a file in
`migrations/`. To start over: `docker compose down -v` (deletes all data).

## Status

The backend uses this database (`DATABASE_URL`) and S3 (`S3_ENDPOINT`, `S3_BUCKET`), both set in the root
`.env`. Start this stack before the backend. The old `backend/wardrobe.json` is no longer read.
