import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const STORAGE_KEY = 'orbital.favorites.v1'
const FAVORITES_EVENT = 'orbital-favorites-change'

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(readIds)
  const { user } = useAuth()
  const isConfigured = isSupabaseConfigured()

  // Sync state across all active components and browser tabs
  useEffect(() => {
    const handleSync = () => {
      setIds(readIds())
    }

    window.addEventListener(FAVORITES_EVENT, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Sync with Supabase on login
  useEffect(() => {
    if (!isConfigured || !user) return

    let cancelled = false
    async function loadSupabaseFavorites() {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('photo_id')
          .eq('user_id', user!.id)

        if (!error && data && !cancelled) {
          type FavRow = { photo_id: string }
          const dbIds = (data as unknown as FavRow[]).map((row) => row.photo_id)
          // Merge local and remote
          const local = readIds()
          const combined = Array.from(new Set([...local, ...dbIds]))
          setIds(combined)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(combined))
        }
      } catch {
        // Silently preserve local favorites
      }
    }

    loadSupabaseFavorites()
    return () => {
      cancelled = true
    }
  }, [isConfigured, user])

  const persist = useCallback(
    async (next: string[], photoId: string, isAdding: boolean) => {
      setIds(next)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(FAVORITES_EVENT))

      // Persist to Supabase if authenticated
      if (isConfigured && user) {
        try {
          type FavInsert = import('@/types/database').Database['public']['Tables']['favorites']['Insert']
          if (isAdding) {
            const favInsert: FavInsert = {
              user_id: user.id,
              photo_id: photoId,
            }
            await supabase.from('favorites').insert(favInsert as unknown as never)
          } else {
            await supabase
              .from('favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('photo_id', photoId)
          }
        } catch {
          // Keep local optimistic state
        }
      }
    },
    [isConfigured, user],
  )

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids])

  const toggleFavorite = useCallback(
    (id: string) => {
      const alreadyFav = ids.includes(id)
      const next = alreadyFav ? ids.filter((item) => item !== id) : [...ids, id]
      persist(next, id, !alreadyFav)
    },
    [ids, persist],
  )

  return { ids, isFavorite, toggleFavorite }
}
