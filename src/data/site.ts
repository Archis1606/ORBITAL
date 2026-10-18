import type { AppNotice } from '@/types/models'

export const supabaseNotice: AppNotice = {
  title: 'Supabase is not connected yet',
  body: 'Add the Supabase URL and public anon key to the environment to enable persistent profiles, social follows, and shareable photo uploads.',
}

export const navItems = [
  { to: '/archive', label: 'Archive' },
  { to: '/astrophotography', label: 'Astrophotography' },
  { to: '/aviation', label: 'Aviation' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/studio', label: 'Studio' },
] as const
