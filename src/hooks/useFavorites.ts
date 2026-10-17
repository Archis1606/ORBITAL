import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'orbital.favorites.v1'

function readIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [] as string[]
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return [] as string[]
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(readIds())
  }, [])

  const persist = useCallback((next: string[]) => {
    setIds(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids])

  const toggleFavorite = useCallback(
    (id: string) => {
      persist(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
    },
    [ids, persist],
  )

  return { ids, isFavorite, toggleFavorite }
}
