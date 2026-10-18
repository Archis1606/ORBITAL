import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verify if the credentials are valid and not default placeholders
export function isSupabaseConfigured(): boolean {
  if (!envUrl || !envAnonKey) return false
  if (envUrl.includes('placeholder') || envUrl.includes('your-project')) return false
  if (envAnonKey.includes('placeholder') || envAnonKey.startsWith('your-')) return false
  return true
}

// Fallback dummy URL and anon key for offline development so createClient never throws on startup
const effectiveUrl = isSupabaseConfigured() ? envUrl : 'https://placeholder-orbital.supabase.co'
const effectiveKey = isSupabaseConfigured() ? envAnonKey : 'placeholder-anon-key'

export const supabase = createClient<Database>(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
