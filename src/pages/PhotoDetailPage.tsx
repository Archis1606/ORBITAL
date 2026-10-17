import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { getPhoto, photoCreator } from '@/data/photos'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { disciplineLabel, formatCaptureDate } from '@/lib/format'

export function PhotoDetailPage() {
  const { photoId } = useParams()
  const navigate = useNavigate()
  const photo = photoId ? getPhoto(photoId) : undefined
  const creator = photo ? photoCreator(photo) : undefined

  useDocumentTitle(photo ? `${photo.title} — ORBITAL` : 'Frame not found — ORBITAL')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  if (!photo) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <ErrorState
          title="This frame is not in the catalog"
          body="The identifier does not match a sample photo. Return to the archive to continue."
        />
        <Link to="/archive" className="mt-6 inline-block text-cyan">
          Back to archive
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:px-8">
      <figure className="overflow-hidden rounded-3xl border border-line bg-navy-deep">
        <OptimizedImage
          unsplashId={photo.unsplashId}
          alt={photo.imageAlt}
          width={photo.width}
          height={photo.height}
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />
      </figure>
      <aside className="glass-panel h-fit rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone={photo.discipline}>{disciplineLabel(photo.discipline)}</Badge>
            <Badge tone="sample">Sample</Badge>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-line p-2"
            aria-label="Close frame"
          >
            <X size={16} />
          </button>
        </div>
        <h1 className="mt-5 font-display text-4xl">{photo.title}</h1>
        <p className="mt-3 text-muted">{photo.caption}</p>
        <dl className="mt-6 space-y-2 font-mono text-xs tracking-wide text-muted uppercase">
          <div className="flex justify-between gap-4">
            <dt>Location</dt>
            <dd className="text-ivory">{photo.location}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Captured</dt>
            <dd className="text-ivory">{formatCaptureDate(photo.capturedAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Camera</dt>
            <dd className="text-ivory">{photo.camera}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Optics</dt>
            <dd className="text-ivory">{photo.optics}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Exposure</dt>
            <dd className="text-ivory">{photo.exposure}</dd>
          </div>
        </dl>
        {creator ? (
          <Link to={`/creators/${creator.handle}`} className="mt-6 block text-sm text-cyan">
            {creator.displayName} · @{creator.handle}
          </Link>
        ) : null}
        <div className="mt-6">
          <FavoriteButton photoId={photo.id} />
        </div>
      </aside>
    </div>
  )
}
