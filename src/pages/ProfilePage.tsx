import { useParams, Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { creators } from '@/data/creators'
import { photos } from '@/data/photos'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { disciplineLabel } from '@/lib/format'

export function ProfilePage() {
  const { handle } = useParams()
  const creator = creators.find((item) => item.handle === handle)
  const frames = creator ? photos.filter((photo) => photo.creatorId === creator.id) : []

  useDocumentTitle(creator ? `${creator.displayName} — ORBITAL` : 'Creator not found — ORBITAL')

  if (!creator) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <ErrorState title="Creator not found" body="No sample profile matches that handle." />
        <Link to="/archive" className="mt-6 inline-block text-cyan">
          Return to archive
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <div className="glass-panel mb-10 rounded-3xl p-8">
        <div className="flex flex-wrap gap-2">
          <Badge tone={creator.disciplineFocus}>{disciplineLabel(creator.disciplineFocus)}</Badge>
          <Badge tone="sample">Sample creator</Badge>
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">{creator.displayName}</h1>
        <p className="mt-2 font-mono text-sm text-muted">@{creator.handle}</p>
        <p className="mt-4 max-w-2xl text-muted">{creator.bio}</p>
        <p className="mt-3 text-sm text-muted">{creator.location}</p>
      </div>
      <PhotoGrid photos={frames} emptyTitle="No frames attributed" emptyBody="This sample creator has no catalog entries." />
    </div>
  )
}
