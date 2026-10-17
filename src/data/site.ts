import type { AppNotice } from '@/types/models'

export const supabaseNotice: AppNotice = {
  title: 'Supabase is not connected yet',
  body: 'Authentication, database, and Storage will be wired in a later milestone. This screen is the interface only.',
}

export const navItems = [
  { to: '/archive', label: 'Archive' },
  { to: '/astrophotography', label: 'Astrophotography' },
  { to: '/aviation', label: 'Aviation' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/studio', label: 'Studio' },
] as const
