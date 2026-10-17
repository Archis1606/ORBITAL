import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/cn'

type FavoriteButtonProps = {
  photoId: string
}

export function FavoriteButton({ photoId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(photoId)

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(photoId)}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm',
        active ? 'border-cyan text-cyan' : 'border-line text-muted',
      )}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
      {active ? 'Saved locally' : 'Save locally'}
    </button>
  )
}
