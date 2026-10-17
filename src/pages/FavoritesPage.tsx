import { collections } from '@/data/collections'
import { photos } from '@/data/photos'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useFavorites } from '@/hooks/useFavorites'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { disciplineLabel } from '@/lib/format'

export function FavoritesPage() {
  useDocumentTitle('Favorites — ORBITAL')
  const { ids } = useFavorites()
  const saved = photos.filter((photo) => ids.includes(photo.id))

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <SectionHeader
        as="h1"
        kicker="Local only"
        title="Favorites and collections"
        description="Favorites persist in this browser via localStorage. Sample collections below are editorial groupings, not server records."
      />

      {saved.length === 0 ? (
        <EmptyState
          title="No local favorites yet"
          body="Open a frame and choose Save locally. This does not create a cloud collection."
        />
      ) : (
        <PhotoGrid photos={saved} />
      )}

      <h2 className="mt-16 mb-6 font-display text-3xl">Sample collections</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <article key={collection.id} className="rounded-3xl border border-line p-6">
            <div className="flex gap-2">
              <Badge tone={collection.discipline}>{disciplineLabel(collection.discipline)}</Badge>
              <Badge tone="sample">Sample</Badge>
            </div>
            <h3 className="mt-4 font-display text-2xl">{collection.title}</h3>
            <p className="mt-2 text-muted">{collection.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
