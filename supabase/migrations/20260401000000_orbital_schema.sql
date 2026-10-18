-- =============================================================================
-- ORBITAL OBSERVATORY DATABASE SCHEMA & RLS POLICIES
-- Migration: 20260401000000_orbital_schema.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  discipline_focus TEXT NOT NULL DEFAULT 'astrophotography' CHECK (discipline_focus IN ('astrophotography', 'aviation')),
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  avatar_url TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  social_website TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index handles for discovery & routing
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- -----------------------------------------------------------------------------
-- 2. PHOTOS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT,
  discipline TEXT NOT NULL CHECK (discipline IN ('astrophotography', 'aviation')),
  category_tag TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  storage_path TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  camera TEXT,
  optics TEXT,
  exposure TEXT,
  captured_at DATE,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  allow_location_sharing BOOLEAN DEFAULT false NOT NULL,
  
  -- Astrophotography specific fields
  astro_target TEXT,
  astro_telescope TEXT,
  astro_mount TEXT,
  astro_filters TEXT,
  astro_integration TEXT,
  astro_bortle INTEGER CHECK (astro_bortle BETWEEN 1 AND 9),
  astro_notes TEXT,
  
  -- Aviation specific fields
  aviation_aircraft_type TEXT,
  aviation_manufacturer TEXT,
  aviation_airline TEXT,
  aviation_airport_code TEXT,
  aviation_airport_name TEXT,
  aviation_country TEXT,
  aviation_registration TEXT,
  aviation_conditions TEXT,
  
  -- Publication & moderation status
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'private')),
  license TEXT NOT NULL DEFAULT 'All Rights Reserved',
  featured BOOLEAN DEFAULT false NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for high-speed filtered queries
CREATE INDEX IF NOT EXISTS idx_photos_discipline ON public.photos(discipline);
CREATE INDEX IF NOT EXISTS idx_photos_status ON public.photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_category_tag ON public.photos(category_tag);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON public.photos(featured);
CREATE INDEX IF NOT EXISTS idx_photos_aviation_aircraft ON public.photos(aviation_aircraft_type);
CREATE INDEX IF NOT EXISTS idx_photos_aviation_manufacturer ON public.photos(aviation_manufacturer);

-- -----------------------------------------------------------------------------
-- 3. TAGS & PHOTO_TAGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  discipline TEXT CHECK (discipline IN ('astrophotography', 'aviation', 'both')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.photo_tags (
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

-- -----------------------------------------------------------------------------
-- 4. COLLECTIONS & COLLECTION_PHOTOS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discipline TEXT NOT NULL DEFAULT 'all' CHECK (discipline IN ('astrophotography', 'aviation', 'all')),
  is_private BOOLEAN DEFAULT false NOT NULL,
  cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.collection_photos (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (collection_id, photo_id)
);

-- -----------------------------------------------------------------------------
-- 5. FAVORITES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_photo_favorite UNIQUE (user_id, photo_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_photo_id ON public.favorites(photo_id);

-- -----------------------------------------------------------------------------
-- 6. FOLLOWS (COMMUNITY)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT cannot_follow_self CHECK (follower_id <> following_id)
);

-- -----------------------------------------------------------------------------
-- 7. AUTOMATIC USER PROFILE TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  raw_name TEXT;
  clean_handle TEXT;
BEGIN
  raw_name := COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  clean_handle := lower(regexp_replace(raw_name, '[^a-zA-Z0-9_]', '', 'g'));
  
  -- Fallback if handle is empty
  IF clean_handle = '' THEN
    clean_handle := 'creator_' || substr(new.id::text, 1, 8);
  END IF;

  -- Ensure handle uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE handle = clean_handle) LOOP
    clean_handle := clean_handle || '_' || floor(random() * 1000)::text;
  END LOOP;

  INSERT INTO public.profiles (user_id, display_name, handle, discipline_focus)
  VALUES (new.id, raw_name, clean_handle, 'astrophotography');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Public can view all profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PHOTOS POLICIES
-- Public can read published photos; owners can read their own drafts/privates
CREATE POLICY "Public photos are viewable by everyone"
  ON public.photos FOR SELECT
  USING (
    status = 'published' 
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

-- Authenticated users can insert their own photos
CREATE POLICY "Authenticated users can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only photo owner can update photo
CREATE POLICY "Users can update own photos"
  ON public.photos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only photo owner can delete photo
CREATE POLICY "Users can delete own photos"
  ON public.photos FOR DELETE
  USING (auth.uid() = user_id);

-- TAGS POLICIES
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Photo tags are viewable by everyone"
  ON public.photo_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can tag their own photos"
  ON public.photo_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.photos
      WHERE id = photo_id AND user_id = auth.uid()
    )
  );

-- COLLECTIONS POLICIES
-- Anyone can view public collections; owners can view private ones
CREATE POLICY "Public collections are viewable by everyone"
  ON public.collections FOR SELECT
  USING (
    is_private = false 
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Users can insert own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- COLLECTION PHOTOS POLICIES
CREATE POLICY "Collection photos are viewable if collection is viewable"
  ON public.collection_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id 
        AND (c.is_private = false OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage items in their own collections"
  ON public.collection_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- FAVORITES POLICIES
-- Users can only view their own favorites (private by default)
CREATE POLICY "Users can view only their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- FOLLOWS POLICIES
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- -----------------------------------------------------------------------------
-- 9. STORAGE BUCKET CONFIGURATION & POLICIES
-- -----------------------------------------------------------------------------
-- Instructions for creating buckets:
-- 1. Create a public bucket named 'photos'
-- 2. Storage RLS policies below:

-- Allow public read access on photos bucket
-- (Executed in Supabase Storage dashboard or via storage SQL API):
-- CREATE POLICY "Public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
-- CREATE POLICY "User upload photos" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
-- CREATE POLICY "User delete own photos" ON storage.objects FOR DELETE USING (
--   bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
