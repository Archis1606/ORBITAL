# ORBITAL Supabase Setup & Architecture Guide

ORBITAL features a real Supabase backend integration that powers user authentication, cloud catalog persistence, user-curated collections, favorites, and storage of high-resolution astrophotography and aviation imagery.

When Supabase credentials are not configured, ORBITAL runs gracefully in an offline/sample mode using typed catalog fixtures and browser local storage.

---

## 1. Quick Setup

### Step 1: Create a Supabase Project
1. Log in to [Supabase Console](https://supabase.com/dashboard).
2. Click **New Project** and choose your preferred organization and region.

### Step 2: Apply Database Migrations
1. In the Supabase Dashboard, navigate to the **SQL Editor**.
2. Open or paste the contents of `supabase/migrations/20260401000000_orbital_schema.sql`.
3. Click **Run**. This will create:
   - Tables: `profiles`, `photos`, `tags`, `photo_tags`, `collections`, `collection_photos`, `favorites`, `follows`.
   - Optimized B-tree indexes for fast filtered searches.
   - Triggers for auto-creating photographer profiles on user sign-up.
   - Comprehensive Row-Level Security (RLS) policies.

### Step 3: Configure Storage Buckets
1. In the Supabase Dashboard, navigate to **Storage**.
2. Click **New Bucket**:
   - Bucket Name: `photos`
   - Public bucket: **Enabled (ON)** (for high-speed global CDN delivery)
   - Allowed MIME types: `image/jpeg, image/png, image/webp`
   - Max file size: `25MB`
3. In **Storage Policies** for `photos`, add:
   - **Select (Read)**: Allow public read access to all objects (`bucket_id = 'photos'`).
   - **Insert (Upload)**: Allow authenticated users to upload into their own folder:
     ```sql
     bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
   - **Delete**: Allow users to delete only files in their own folder:
     ```sql
     bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
     ```

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Retrieve your credentials from **Project Settings -> API**:
   - `Project URL` -> `VITE_SUPABASE_URL`
   - `Project API Keys -> anon (public)` -> `VITE_SUPABASE_ANON_KEY`
3. Never use the `service_role` key in your frontend application.

---

## 2. Row-Level Security (RLS) Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Public (anyone) | Authenticated (own user_id) | Authenticated (own user_id) | Restricted |
| `photos` | Published = public; Draft/Private = Owner only | Authenticated (own user_id) | Authenticated (own user_id) | Authenticated (own user_id) |
| `collections` | Public collections = anyone; Private = Owner only | Authenticated (own user_id) | Authenticated (own user_id) | Authenticated (own user_id) |
| `favorites` | Private (user only views their own) | Authenticated (own user_id) | N/A | Authenticated (own user_id) |
| `follows` | Public (anyone) | Authenticated (follower_id) | N/A | Authenticated (follower_id) |

---

## 3. Privacy & Sensitive Metadata Protection

- **Location privacy**: Coordinates are never shown publicly unless `allow_location_sharing = true` is explicitly chosen by the creator.
- **Sensitive EXIF**: GPS tags are stripped on client upload unless explicitly opted into.
