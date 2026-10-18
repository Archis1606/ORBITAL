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
2. Run `supabase/migrations/20260401000000_orbital_schema.sql` first, then `supabase/migrations/20261018000000_social_persistence.sql`.
3. Click **Run** after each migration. The initial migration creates:
   - Tables: `profiles`, `photos`, `tags`, `photo_tags`, `collections`, `collection_photos`, `favorites`, `follows`.
   - Optimized B-tree indexes for fast filtered searches.
   - Triggers for auto-creating photographer profiles on user sign-up.
   - Comprehensive Row-Level Security (RLS) policies.
4. The second migration creates/configures a public `photos` bucket for published images and a private `private-photos` bucket for drafts. Both buckets enforce owner-only writes; draft image URLs are short-lived signed URLs visible only to their owner.

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Retrieve your credentials from **Project Settings -> API**:
   - `Project URL` -> `VITE_SUPABASE_URL`
   - `Project API Keys -> anon (public)` -> `VITE_SUPABASE_ANON_KEY`
3. Never use the `service_role` key in your frontend application.

### Step 4: Configure Vercel
1. In the Vercel project, open **Settings -> Environment Variables**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same project URL and public anon/publishable key used locally.
3. Apply them to **Production**, **Preview**, and **Development** as needed, then redeploy so Vite includes them in the frontend build.
4. In Supabase **Authentication -> URL Configuration**, set the Vercel site URL as the Site URL and add the production and preview URLs to the Redirect URLs allow-list.
5. Sign-up profiles and uploaded photo metadata are stored in Supabase. Published photos use the public `photos` bucket and open at `/photos/<photo-id>`; `vercel.json` routes shared links through the app.

When Supabase is not configured, the local preview uses browser storage; those demo profiles and uploads are not permanent or shared between devices.

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
