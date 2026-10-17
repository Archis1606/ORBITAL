import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { photoCreator } from '@/data/photos'
import { disciplineLabel } from '@/lib/format'
import type { Photo } from '@/types/models'

type PhotoCardProps = {
  photo: Photo
  sizes?: string
}

export function PhotoCard({ photo, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' }: PhotoCardProps) {
  const creator = photoCreator(photo)

  return (
    <article className="group">
      <Link to={`/photos/${photo.id}`} className="block overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="relative aspect-[4/3] overflow-hidden">
          <OptimizedImage
            unsplashId={photo.unsplashId}
            alt={photo.imageAlt}
            width={photo.width}
            height={photo.height}
            sizes={sizes}
            className="transition-transform duration-500 motion-safe:group-hover:scale-[1.04]"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge tone={photo.discipline}>{disciplineLabel(photo.discipline)}</Badge>
            <Badge tone="sample">Sample</Badge>
          </div>
        </div>
        <div className="space-y-1 px-4 py-4">
          <h3 className="font-display text-xl">{photo.title}</h3>
          <p className="font-mono text-xs text-muted">{creator?.displayName ?? 'Unknown creator'}</p>
        </div>
      </Link>
    </article>
  )
}
