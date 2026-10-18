import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { photoCreator } from '@/data/photos'
import { disciplineLabel } from '@/lib/format'
import type { Photo } from '@/types/models'
import { Camera, MapPin, Eye, Heart } from 'lucide-react'

type PhotoCardProps = {
  photo: Photo
  sizes?: string
  priority?: boolean
  onSelect?: (photo: Photo) => void
}

export function PhotoCard({
  photo,
  sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority = false,
  onSelect,
}: PhotoCardProps) {
  const creator = photoCreator(photo)

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault()
      onSelect(photo)
    }
  }

  return (
    <article className="group relative break-inside-avoid mb-5">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-300 hover:border-cyan/50 hover:shadow-2xl">
        <Link
          to={`/photos/${photo.id}`}
          onClick={handleClick}
          className="block relative overflow-hidden"
          aria-label={`View frame: ${photo.title} by ${creator?.displayName ?? 'Photographer'}`}
        >
          {/* Image with true natural aspect ratio */}
          <div
            className="w-full overflow-hidden"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            <OptimizedImage
              unsplashId={photo.unsplashId}
              src={photo.customImageUrl}
              alt={photo.imageAlt || photo.title}
              width={photo.width}
              height={photo.height}
              sizes={sizes}
              priority={priority}
              className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
            <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
              <Badge tone={photo.discipline}>{disciplineLabel(photo.discipline)}</Badge>
              {photo.categoryTag ? (
                <span className="rounded-full border border-white/10 bg-void/70 px-2 py-0.5 font-mono text-[0.62rem] text-ivory/80 backdrop-blur-md">
                  {photo.categoryTag}
                </span>
              ) : null}
            </div>

            {/* Favorite button (stop propagation so it doesn't open the link) */}
            <div
              className="pointer-events-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <FavoriteButton photoId={photo.id} />
            </div>
          </div>

          {/* Hover overlay with optical metadata */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-void/90 via-void/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
            <div className="space-y-1.5 text-xs">
              {photo.location ? (
                <div className="flex items-center gap-1 text-[0.7rem] text-cyan">
                  <MapPin size={11} />
                  <span className="truncate">{photo.location}</span>
                </div>
              ) : null}

              {photo.camera || photo.optics ? (
                <div className="flex items-center gap-1.5 font-mono text-[0.65rem] text-ivory/80">
                  <Camera size={11} />
                  <span className="truncate">{photo.optics || photo.camera}</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-1 font-mono text-[0.62rem] text-muted">
                <span>{photo.exposure}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Heart size={10} /> {photo.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Eye size={10} /> {photo.viewsCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Card footer details */}
        <div className="px-4 py-3.5 border-t border-line/40">
          <Link
            to={`/photos/${photo.id}`}
            onClick={handleClick}
            className="block font-display text-lg font-medium text-ivory hover:text-cyan transition-colors truncate"
          >
            {photo.title}
          </Link>
          <div className="mt-1 flex items-center justify-between text-xs font-mono text-muted">
            {creator ? (
              <Link
                to={`/creators/${creator.handle}`}
                className="hover:text-cyan transition-colors truncate max-w-[70%]"
              >
                {creator.displayName}
              </Link>
            ) : (
              <span className="truncate">Unknown creator</span>
            )}
            <span className="text-[0.65rem] text-muted/70">{photo.capturedAt.split('-')[0]}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
