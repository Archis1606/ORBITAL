import { EmptyState } from '@/components/ui/EmptyState'
import { PhotoCard } from '@/components/ui/PhotoCard'
import type { Photo } from '@/types/models'

type PhotoGridProps = {
  photos: Photo[]
  emptyTitle?: string
  emptyBody?: string
}

export function PhotoGrid({
  photos,
  emptyTitle = 'No frames in this view',
  emptyBody = 'The local sample catalog has nothing that matches this filter.',
}: PhotoGridProps) {
  if (photos.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}
