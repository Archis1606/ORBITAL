import { EmptyState } from '@/components/ui/EmptyState'
import { PhotoCard } from '@/components/ui/PhotoCard'
import type { Photo } from '@/types/models'
import { motion, AnimatePresence } from 'framer-motion'

type PhotoGridProps = {
  photos: Photo[]
  emptyTitle?: string
  emptyBody?: string
  onSelectPhoto?: (photo: Photo) => void
}

export function PhotoGrid({
  photos,
  emptyTitle = 'No frames in this view',
  emptyBody = 'No catalog entries match your active query and filters. Try adjusting or clearing filters.',
  onSelectPhoto,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="py-12">
        <EmptyState title={emptyTitle} body={emptyBody} />
      </div>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
      <AnimatePresence mode="popLayout">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.35,
              delay: Math.min(index * 0.04, 0.4),
              ease: 'easeOut',
            }}
          >
            <PhotoCard
              photo={photo}
              priority={index < 4}
              onSelect={onSelectPhoto}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
