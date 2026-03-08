-- ==========================================================
-- Litter Pick MVP — Complete Supabase Database Schema
-- ==========================================================
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).
-- It is safe to run multiple times — every statement uses IF NOT EXISTS / OR REPLACE.
--
-- Prerequisites:
--   1. A Supabase project (free tier is fine)
--   2. PostGIS is available by default on Supabase Postgres
--
-- After running this file you also need to:
--   • Create a **public** storage bucket called "photos"  (see bottom of file)
-- ==========================================================


-- --------------------------------------------------------
-- 0. EXTENSIONS
-- --------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS postgis;


-- --------------------------------------------------------
-- 1. TABLES  (order matters for foreign-key references)
-- --------------------------------------------------------

-- 1a. hotspots — aggregated litter areas (created FIRST so reports can FK to it)
CREATE TABLE IF NOT EXISTS hotspots (
  id                        UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  centroid_latitude          DOUBLE PRECISION NOT NULL,
  centroid_longitude         DOUBLE PRECISION NOT NULL,
  score                      DOUBLE PRECISION DEFAULT 0,
  status                     TEXT           DEFAULT 'needs_attention'
                              CHECK (status IN ('needs_attention','cleanup_forming','recently_improved','cleaned')),
  created_at                 TIMESTAMPTZ    DEFAULT now(),
  updated_at                 TIMESTAMPTZ    DEFAULT now(),
  latest_before_image_url    TEXT,
  latest_after_image_url     TEXT,
  report_count               INTEGER        DEFAULT 0,
  volunteer_interest_count   INTEGER        DEFAULT 0,
  area_name                  TEXT,
  -- Computed PostGIS geography column for spatial queries
  location                   GEOGRAPHY(POINT, 4326)
                              GENERATED ALWAYS AS (
                                ST_SetSRID(ST_MakePoint(centroid_longitude, centroid_latitude), 4326)::geography
                              ) STORED
);

-- 1b. reports — anonymous litter sightings
CREATE TABLE IF NOT EXISTS reports (
  id             UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url      TEXT,
  latitude       DOUBLE PRECISION NOT NULL,
  longitude      DOUBLE PRECISION NOT NULL,
  severity       TEXT           NOT NULL CHECK (severity IN ('low','medium','bad')),
  note           TEXT,
  submitted_at   TIMESTAMPTZ    DEFAULT now(),
  source         TEXT           DEFAULT 'web',
  hotspot_id     UUID           REFERENCES hotspots(id) ON DELETE SET NULL,
  status         TEXT           DEFAULT 'pending' CHECK (status IN ('pending','confirmed','spam')),
  -- Computed PostGIS geography column
  location       GEOGRAPHY(POINT, 4326)
                  GENERATED ALWAYS AS (
                    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
                  ) STORED
);

-- 1c. users — volunteer profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name        TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  phone             TEXT,
  postcode_or_town  TEXT        NOT NULL,
  volunteer_type    TEXT        DEFAULT 'group' CHECK (volunteer_type IN ('solo','group','organise')),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 1d. volunteer_interests — links volunteers to hotspots they want to help with
CREATE TABLE IF NOT EXISTS volunteer_interests (
  id             UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hotspot_id     UUID           NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  interest_type  TEXT           NOT NULL CHECK (interest_type IN ('help','join','organise')),
  created_at     TIMESTAMPTZ    DEFAULT now(),
  UNIQUE(user_id, hotspot_id)
);

-- 1e. cleanups — organised cleanup events tied to a hotspot
CREATE TABLE IF NOT EXISTS cleanups (
  id                 UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id         UUID           NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  organiser_user_id  UUID           REFERENCES users(id) ON DELETE SET NULL,
  status             TEXT           DEFAULT 'forming'
                      CHECK (status IN ('forming','scheduled','in_progress','completed','cancelled')),
  proposed_time      TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  volunteer_count    INTEGER        DEFAULT 0,
  bags_collected     INTEGER,
  notes              TEXT,
  created_at         TIMESTAMPTZ    DEFAULT now()
);

-- 1f. cleanup_photos — before / after images for a cleanup
CREATE TABLE IF NOT EXISTS cleanup_photos (
  id                  UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  cleanup_id          UUID           NOT NULL REFERENCES cleanups(id) ON DELETE CASCADE,
  photo_type          TEXT           NOT NULL CHECK (photo_type IN ('before','after')),
  image_url           TEXT           NOT NULL,
  uploaded_by_user_id UUID           REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ    DEFAULT now()
);


-- --------------------------------------------------------
-- 2. INDEXES
-- --------------------------------------------------------

-- Spatial indexes (GIST) for PostGIS proximity queries
CREATE INDEX IF NOT EXISTS idx_reports_location        ON reports  USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_hotspots_location       ON hotspots USING GIST (location);

-- B-tree indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_reports_hotspot_id      ON reports(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_reports_submitted_at    ON reports(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status          ON reports(status);
CREATE INDEX IF NOT EXISTS idx_hotspots_status         ON hotspots(status);
CREATE INDEX IF NOT EXISTS idx_hotspots_score          ON hotspots(score DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_interests_user    ON volunteer_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_interests_hotspot ON volunteer_interests(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_cleanups_hotspot        ON cleanups(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_cleanups_status         ON cleanups(status);


-- --------------------------------------------------------
-- 3. POSTGIS FUNCTIONS  (used by the API via supabase.rpc())
-- --------------------------------------------------------

-- find_nearby_reports — called during hotspot recalculation after a new report is submitted
-- Returns all non-spam reports within `radius_km` of the target point, since `since`.
CREATE OR REPLACE FUNCTION find_nearby_reports(
  target_lat  DOUBLE PRECISION,
  target_lng  DOUBLE PRECISION,
  radius_km   DOUBLE PRECISION DEFAULT 0.3,
  since       TIMESTAMPTZ      DEFAULT (now() - interval '30 days')
)
RETURNS SETOF reports
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM   reports
  WHERE  ST_DWithin(
           location,
           ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
           radius_km * 1000          -- convert km → metres
         )
    AND  submitted_at >= since
    AND  status != 'spam'
  ORDER BY submitted_at DESC;
$$;

-- find_nearby_hotspots — used to check whether a hotspot already exists near a new cluster
CREATE OR REPLACE FUNCTION find_nearby_hotspots(
  target_lat  DOUBLE PRECISION,
  target_lng  DOUBLE PRECISION,
  radius_km   DOUBLE PRECISION DEFAULT 0.3
)
RETURNS SETOF hotspots
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM   hotspots
  WHERE  ST_DWithin(
           location,
           ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
           radius_km * 1000
         )
  ORDER BY score DESC;
$$;


-- --------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------
-- The app uses the service-role key for most server-side writes,
-- but RLS still protects the anon/public key used by the browser client.

ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspots             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_interests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanups             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_photos       ENABLE ROW LEVEL SECURITY;

-- reports — public read, anyone can insert (anonymous reporting, no auth required)
CREATE POLICY "Reports are viewable by everyone"
  ON reports FOR SELECT USING (true);
CREATE POLICY "Anyone can create reports"
  ON reports FOR INSERT WITH CHECK (true);
-- service-role key handles UPDATE (linking reports to hotspots)

-- hotspots — public read (heatmap data)
CREATE POLICY "Hotspots are viewable by everyone"
  ON hotspots FOR SELECT USING (true);
-- service-role key handles INSERT/UPDATE (hotspot recalculation)

-- users — authenticated users can read/update their own profile only
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);
-- service-role key handles INSERT (during signup)

-- volunteer_interests — users can read their own, insert their own
CREATE POLICY "Users can view own interests"
  ON volunteer_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create interests"
  ON volunteer_interests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- cleanups — public read
CREATE POLICY "Cleanups are viewable by everyone"
  ON cleanups FOR SELECT USING (true);
-- service-role key handles INSERT/UPDATE

-- cleanup_photos — public read, authenticated insert
CREATE POLICY "Cleanup photos are viewable by everyone"
  ON cleanup_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload cleanup photos"
  ON cleanup_photos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- --------------------------------------------------------
-- 5. STORAGE BUCKET
-- --------------------------------------------------------
-- Supabase does not allow CREATE POLICY on storage.objects via the SQL Editor
-- unless you first create the bucket.  The safest approach:
--
--   1. Go to Dashboard → Storage → New Bucket
--   2. Name:   photos
--   3. Public: ON  (so getPublicUrl works without auth)
--   4. Then run the two policy statements below.
--
-- If you prefer to create the bucket via SQL (works on some Supabase versions):

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload photos (reports are anonymous)
CREATE POLICY "Anyone can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos');

-- Allow anyone to view/download photos
CREATE POLICY "Photos are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');
