-- Gaya schema. Applied automatically on first start (see docker-compose.yml).
-- Later changes go in ../migrations as numbered files.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE schema_migrations (
  version    TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wearer profile: body, sizing and demographic details used for fit and suitability.
-- One row per user; a single-user app can simply use one row.
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  height_cm   INTEGER CHECK (height_cm BETWEEN 100 AND 230),
  weight_kg   INTEGER CHECK (weight_kg BETWEEN 25 AND 250),
  top_size    TEXT NOT NULL DEFAULT '',
  bottom_size TEXT NOT NULL DEFAULT '',
  shoe_size   TEXT NOT NULL DEFAULT '',
  body_shape  TEXT NOT NULL DEFAULT 'not-sure'
              CHECK (body_shape IN ('hourglass','pear','apple','rectangle','inverted-triangle','not-sure')),
  age_group   TEXT CHECK (age_group IN ('teen','20s','30s','40s','50s+')),
  gender      TEXT CHECK (gender IN ('female','male','non-binary')),
  modesty     TEXT NOT NULL DEFAULT 'none' CHECK (modesty IN ('none','modest','hijab')),
  region      TEXT NOT NULL DEFAULT '',
  budget      TEXT CHECK (budget IN ('low','mid','high')),
  -- Colour analysis (optional, to do later)
  colour_season TEXT,
  skin_tone     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Image metadata. The bytes live in S3 (LocalStack locally); other tables reference this row.
CREATE TABLE images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket     TEXT NOT NULL,
  s3_key     TEXT NOT NULL,
  mime_type  TEXT NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
  size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket, s3_key)
);

-- Body photos (a profile can keep several; one is primary).
CREATE TABLE body_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_id   UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX body_photos_one_primary ON body_photos (profile_id) WHERE is_primary;

-- Closet items, tagged by category.
CREATE TABLE wardrobe_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_id         UUID REFERENCES images(id) ON DELETE SET NULL,
  type             TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('top','bottom','dress','outerwear','hijab','shoes','accessory')),
  pattern          TEXT,
  formality        TEXT,
  sleeves          TEXT,
  length           TEXT,
  fit              TEXT,
  neckline         TEXT,
  sheer            BOOLEAN,
  size             TEXT,
  fabric           TEXT,
  style            TEXT,
  cultural_origin  TEXT,
  description      TEXT,
  dominant_colours TEXT[] NOT NULL DEFAULT '{}',
  colour_names     TEXT[] NOT NULL DEFAULT '{}',
  occasions        TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wardrobe_items_profile_category ON wardrobe_items (profile_id, category);

-- Saved outfits built from closet items (mix and match).
CREATE TABLE outfits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT,
  occasion   TEXT,
  score      INTEGER CHECK (score BETWEEN 0 AND 100),
  checks     JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outfit_items (
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  item_id   UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, item_id)
);

-- Virtual try-on results. Source is either closet items (outfit_id) or any outside
-- image such as a Pinterest pin (source_image_id / source_url).
CREATE TABLE tryons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body_photo_id   UUID REFERENCES body_photos(id) ON DELETE SET NULL,
  outfit_id       UUID REFERENCES outfits(id) ON DELETE SET NULL,
  source_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  source_url      TEXT,
  result_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  review          JSONB,
  warnings        TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tryons_has_source CHECK (outfit_id IS NOT NULL OR source_image_id IS NOT NULL OR source_url IS NOT NULL)
);

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER wardrobe_items_touch BEFORE UPDATE ON wardrobe_items FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

INSERT INTO schema_migrations (version) VALUES ('001_schema');
