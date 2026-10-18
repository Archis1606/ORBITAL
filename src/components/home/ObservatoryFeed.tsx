import { collections } from '@/data/collections'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { disciplineLabel } from '@/lib/format'

export function ObservatoryFeed() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <SectionHeader
        kicker="Collections"
        title="Observatory sequences"
        description="Sample collections grouping related frames. Favorites you save stay in this browser until accounts exist."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <article key={collection.id} className="rounded-3xl border border-line bg-panel/70 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone={collection.discipline === 'all' ? 'neutral' : collection.discipline}>
                {collection.discipline === 'all' ? 'All Disciplines' : disciplineLabel(collection.discipline)}
              </Badge>
              <Badge tone="sample">Sample</Badge>
            </div>
            <h3 className="mt-4 font-display text-2xl">{collection.title}</h3>
            <p className="mt-2 text-muted">{collection.description}</p>
            <p className="mt-4 font-mono text-xs text-muted uppercase">
              {collection.photoIds.length} frames in sequence
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
