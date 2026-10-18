-- Persistent public image hosting for creator uploads.
ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'photos'
  CHECK (storage_bucket IN ('photos', 'private-photos'));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  26214400,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'private-photos',
  'private-photos',
  false,
  26214400,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO public.profiles (user_id, display_name, handle, discipline_focus)
SELECT
  users.id,
  COALESCE(NULLIF(users.raw_user_meta_data->>'display_name', ''), split_part(users.email, '@', 1), 'Observer'),
  'creator_' || substr(replace(users.id::text, '-', ''), 1, 12),
  'astrophotography'
FROM auth.users AS users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles AS profiles WHERE profiles.user_id = users.id
)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "ORBITAL public photo images" ON storage.objects;
CREATE POLICY "ORBITAL public photo images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "ORBITAL users upload own photos" ON storage.objects;
CREATE POLICY "ORBITAL users upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "ORBITAL users update own photos" ON storage.objects;
CREATE POLICY "ORBITAL users update own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "ORBITAL users delete own photos" ON storage.objects;
CREATE POLICY "ORBITAL users delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "ORBITAL users read private photos" ON storage.objects;
CREATE POLICY "ORBITAL users read private photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'private-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "ORBITAL users upload private photos" ON storage.objects;
CREATE POLICY "ORBITAL users upload private photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'private-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "ORBITAL users update private photos" ON storage.objects;
CREATE POLICY "ORBITAL users update private photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'private-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'private-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "ORBITAL users delete private photos" ON storage.objects;
CREATE POLICY "ORBITAL users delete private photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'private-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
