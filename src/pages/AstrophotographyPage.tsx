import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Telescope, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { InteractiveStarMap } from '@/components/astronomy/InteractiveStarMap'
import { photosByDiscipline } from '@/data/photos'
import { collections } from '@/data/collections'
import { creators } from '@/data/creators'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { AstroTag } from '@/types/models'
import { cn } from '@/lib/cn'

const ASTRO_CATEGORIES: AstroTag[] = [
  'Galaxies',
  'Nebulae',
  'Milky Way',
  'Moon',
  'Planets',
  'Solar and lunar eclipses',
  'Star trails',
  'Deep sky',
]

export function AstrophotographyPage() {
  useDocumentTitle('Digital Observatory — ORBITAL Astrophotography')
  const allAstroPhotos = useMemo(() => photosByDiscipline('astrophotography'), [])
  const [selectedTag, setSelectedTag] = useState<string>('All')

  // Filtered frames
  const visiblePhotos = useMemo(() => {
    if (selectedTag === 'All') return allAstroPhotos
    return allAstroPhotos.filter(
      (p) =>
        p.categoryTag === selectedTag ||
        p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()),
    )
  }, [allAstroPhotos, selectedTag])

  // Featured astrophotographers
  const astroCreators = useMemo(() => {
    return creators.filter((c) => c.disciplineFocus === 'astrophotography')
  }, [])

  // Astronomy collections
  const astroCollections = useMemo(() => {
    return collections.filter((c) => c.discipline === 'astrophotography')
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-16">
      {/* Hero: Digital Observatory Command Header */}
      <section className="relative overflow-hidden rounded-3xl border border-violet/30 bg-gradient-to-b from-navy to-void p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-violet/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/40 bg-violet/15 px-3 py-1 font-mono text-xs text-violet tracking-widest uppercase">
              <Telescope size={13} />
              <span>Digital Observatory · Station Alpha</span>
            </span>
            <Badge tone="sample">Calibrated Telescope Feeds</Badge>
          </div>

          <h1 className="font-display text-4xl font-normal leading-[1.05] text-ivory md:text-6xl lg:text-7xl">
            Where photons travel for millions of years to meet our sensors.
          </h1>

          <p className="text-base text-muted leading-relaxed">
            From the ionized violet filament ribbons of the Veil Nebula to high-resolution lunar impact craters and
            total eclipse coronagraphy. Every frame is stacked and photometrically calibrated.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
            <div className="rounded-xl border border-line bg-panel/70 px-3.5 py-2">
              <span className="text-muted text-[0.68rem] block uppercase">Observatory Plateaus</span>
              <span className="text-ivory font-semibold">Atacama · Mauna Kea · Teide</span>
            </div>
            <div className="rounded-xl border border-line bg-panel/70 px-3.5 py-2">
              <span className="text-muted text-[0.68rem] block uppercase">Bortle Scale Range</span>
              <span className="text-cyan font-semibold">Class 1 to Class 3 Pristine Dark</span>
            </div>
            <div className="rounded-xl border border-line bg-panel/70 px-3.5 py-2">
              <span className="text-muted text-[0.68rem] block uppercase">Spectral Emission Passes</span>
              <span className="text-violet font-semibold">H-alpha (656nm) · [O III] (501nm)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Celestial Star Map Component */}
      <section>
        <InteractiveStarMap
          onSelectTag={(tag) => {
            setSelectedTag(tag)
            // Smoothly scroll down to the photos
            const el = document.getElementById('observatory-catalog')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      </section>

      {/* Curated Celestial Collections */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono text-xs tracking-widest text-violet uppercase">Curatorial Portfolios</p>
            <h2 className="mt-1 font-display text-3xl text-ivory">Observatory Sequences</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {astroCollections.map((col) => (
            <div
              key={col.id}
              className="glass-panel group relative overflow-hidden rounded-3xl border border-violet/20 p-6 md:p-8 transition-all hover:border-violet/60"
            >
              <div className="flex items-center justify-between">
                <Badge tone="astrophotography">Astrophotography</Badge>
                <span className="font-mono text-xs text-muted">
                  {col.photoIds.length} frames in sequence
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl text-ivory group-hover:text-violet transition-colors">
                {col.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{col.description}</p>
              <Link
                to={`/archive?discipline=astrophotography`}
                className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-violet hover:underline"
              >
                <span>Examine collection frames</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Filterable Astronomy Photography Archive */}
      <section id="observatory-catalog" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-line/60 pb-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-violet uppercase">Observational Ledger</p>
            <h2 className="mt-1 font-display text-3xl text-ivory">Astrophotography Frames</h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/archive?discipline=astrophotography"
              className="inline-flex items-center gap-1.5 rounded-full border border-violet/40 bg-violet/10 px-4 py-2 font-mono text-xs text-violet hover:bg-violet/20 transition-all"
            >
              <SlidersHorizontal size={13} />
              <span>Full Archive Search & Telemetry</span>
            </Link>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedTag('All')}
            className={cn(
              'rounded-full px-4 py-1.5 font-mono text-xs transition-colors',
              selectedTag === 'All'
                ? 'border border-violet bg-violet/20 text-violet font-semibold'
                : 'border border-line text-muted hover:text-ivory',
            )}
          >
            All Celestial Targets ({allAstroPhotos.length})
          </button>

          {ASTRO_CATEGORIES.map((cat) => {
            const count = allAstroPhotos.filter(
              (p) => p.categoryTag === cat || p.tags.includes(cat),
            ).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedTag(cat)}
                className={cn(
                  'rounded-full px-4 py-1.5 font-mono text-xs transition-colors',
                  selectedTag === cat
                    ? 'border border-violet bg-violet/20 text-violet font-semibold'
                    : 'border border-line text-muted hover:border-violet/40 hover:text-ivory',
                )}
              >
                {cat} {count > 0 ? `(${count})` : ''}
              </button>
            )
          })}
        </div>

        {/* Gallery */}
        <PhotoGrid
          photos={visiblePhotos}
          emptyTitle="No astronomy frames found"
          emptyBody="No sample photographs match this category in the local registry."
        />
      </section>

      {/* Featured Astrophotographers */}
      <section className="border-t border-line/60 pt-10">
        <div className="mb-6">
          <p className="font-mono text-xs tracking-widest text-violet uppercase">Field Observers</p>
          <h2 className="mt-1 font-display text-3xl text-ivory">Featured Astrophotographers</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {astroCreators.map((creator) => (
            <div
              key={creator.id}
              className="glass-panel flex flex-col justify-between rounded-3xl border border-line p-6 transition-all hover:border-violet/50"
            >
              <div className="flex items-start gap-4">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="h-14 w-14 rounded-2xl object-cover border border-line"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/15 text-violet border border-violet/40 font-mono text-xl">
                    {creator.displayName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-ivory truncate">{creator.displayName}</h3>
                    <Badge tone="astrophotography">Narrowband Specialist</Badge>
                  </div>
                  <p className="font-mono text-xs text-cyan">@{creator.handle}</p>
                  <p className="mt-2 text-xs text-muted leading-relaxed">{creator.bio}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line/50 pt-4 font-mono text-xs text-muted">
                <span>{creator.location}</span>
                <Link
                  to={`/creators/${creator.handle}`}
                  className="text-violet hover:underline flex items-center gap-1"
                >
                  <span>View portfolio</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Back to Full Archive Corridor */}
      <div className="flex justify-center pt-8">
        <Link
          to="/archive"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-navy/60 px-6 py-3 font-mono text-xs text-ivory hover:border-cyan hover:text-cyan transition-colors"
        >
          <span>Return to Full Photography Archive</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
