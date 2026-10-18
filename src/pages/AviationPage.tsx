import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plane, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { InteractiveRadarMap } from '@/components/aviation/InteractiveRadarMap'
import { FlightPathAnimation } from '@/components/home/FlightPathAnimation'
import { photosByDiscipline } from '@/data/photos'
import { collections } from '@/data/collections'
import { creators } from '@/data/creators'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { AviationTag } from '@/types/models'
import { cn } from '@/lib/cn'

const AVIATION_CATEGORIES: AviationTag[] = [
  'Widebody',
  'Narrowbody',
  'Cockpit',
  'Vintage',
  'Military',
  'Ramp',
  'Air-to-Air',
  'Approach',
]

export function AviationPage() {
  useDocumentTitle('Flight Operations Command — ORBITAL Aviation')
  const allAviationPhotos = useMemo(() => photosByDiscipline('aviation'), [])
  const [selectedTag, setSelectedTag] = useState<string>('All')

  // Filtered frames
  const visiblePhotos = useMemo(() => {
    if (selectedTag === 'All') return allAviationPhotos
    return allAviationPhotos.filter(
      (p) =>
        p.categoryTag === selectedTag ||
        p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()),
    )
  }, [allAviationPhotos, selectedTag])

  // Featured aviation photographers
  const aviationCreators = useMemo(() => {
    return creators.filter((c) => c.disciplineFocus === 'aviation')
  }, [])

  // Aviation collections
  const aviationCollections = useMemo(() => {
    return collections.filter((c) => c.discipline === 'aviation')
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-16">
      {/* Hero: Flight Deck Command Header */}
      <section className="relative overflow-hidden rounded-3xl border border-mint/30 bg-gradient-to-b from-navy to-void p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-mint/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/40 bg-mint/15 px-3 py-1 font-mono text-xs text-mint tracking-widest uppercase">
              <Plane size={13} />
              <span>Flight Deck Operations · Terminal Bravo</span>
            </span>
            <Badge tone="sample">Civil & Experimental Aviation Feeds</Badge>
          </div>

          <h1 className="font-display text-4xl font-normal leading-[1.05] text-ivory md:text-6xl lg:text-7xl">
            Airframes in high light, sodium ramps, and stratospheric flight decks.
          </h1>

          <p className="text-base text-muted leading-relaxed">
            Documenting the engineering choreography of global flight. From Boeing 777 heavy rotations into wet
            maritime fog to transonic vapor cones in the Mojave corridor.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
            <div className="rounded-xl border border-line bg-panel/70 px-3.5 py-2">
              <span className="text-muted text-[0.68rem] block uppercase">Vantage Fields</span>
              <span className="text-ivory font-semibold">Heathrow · Haneda · Anchorage · Edwards AFB</span>
            </div>
            <div className="rounded-xl border border-line bg-panel/70 px-3.5 py-2">
              <span className="text-muted text-[0.68rem] block uppercase">Aircraft Classifications</span>
              <span className="text-mint font-semibold">Widebody · Narrowbody · Military · Vintage</span>
            </div>
            <div className="rounded-xl border border-line bg-panel/70 px-3.5 py-2">
              <span className="text-muted text-[0.68rem] block uppercase">Cruise Level Benchmark</span>
              <span className="text-cyan font-semibold">FL370 to FL410 Transpacific Tracks</span>
            </div>
          </div>
        </div>
      </section>

      {/* SVG Flight Path Great Circle Trajectory */}
      <section>
        <FlightPathAnimation />
      </section>

      {/* Interactive Tactical Radar Vantage Map */}
      <section>
        <InteractiveRadarMap
          onSelectAirport={(_code) => {
            const el = document.getElementById('aviation-catalog')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      </section>

      {/* Curated Aviation Collections */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono text-xs tracking-widest text-mint uppercase">Flight Operations Curations</p>
            <h2 className="mt-1 font-display text-3xl text-ivory">Aeronautical Sequences</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {aviationCollections.map((col) => (
            <div
              key={col.id}
              className="glass-panel group relative overflow-hidden rounded-3xl border border-mint/20 p-6 md:p-8 transition-all hover:border-mint/60"
            >
              <div className="flex items-center justify-between">
                <Badge tone="aviation">Aviation</Badge>
                <span className="font-mono text-xs text-muted">
                  {col.photoIds.length} frames in sequence
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl text-ivory group-hover:text-mint transition-colors">
                {col.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{col.description}</p>
              <Link
                to={`/archive?discipline=aviation`}
                className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-mint hover:underline"
              >
                <span>Examine collection frames</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Filterable Aviation Archive */}
      <section id="aviation-catalog" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-line/60 pb-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-mint uppercase">Fleet Ledger</p>
            <h2 className="mt-1 font-display text-3xl text-ivory">Aviation Photography Frames</h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/archive?discipline=aviation"
              className="inline-flex items-center gap-1.5 rounded-full border border-mint/40 bg-mint/10 px-4 py-2 font-mono text-xs text-mint hover:bg-mint/20 transition-all"
            >
              <SlidersHorizontal size={13} />
              <span>Full Archive Search & Specs</span>
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
                ? 'border border-mint bg-mint/20 text-mint font-semibold'
                : 'border border-line text-muted hover:text-ivory',
            )}
          >
            All Airframes ({allAviationPhotos.length})
          </button>

          {AVIATION_CATEGORIES.map((cat) => {
            const count = allAviationPhotos.filter(
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
                    ? 'border border-mint bg-mint/20 text-mint font-semibold'
                    : 'border border-line text-muted hover:border-mint/40 hover:text-ivory',
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
          emptyTitle="No aviation frames found"
          emptyBody="No aircraft match this classification in the current registry."
        />
      </section>

      {/* Featured Aviation Photographers */}
      <section className="border-t border-line/60 pt-10">
        <div className="mb-6">
          <p className="font-mono text-xs tracking-widest text-mint uppercase">Flight Line Observers</p>
          <h2 className="mt-1 font-display text-3xl text-ivory">Featured Aviation Photographers</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {aviationCreators.map((creator) => (
            <div
              key={creator.id}
              className="glass-panel flex flex-col justify-between rounded-3xl border border-line p-6 transition-all hover:border-mint/50"
            >
              <div className="flex items-start gap-4">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="h-14 w-14 rounded-2xl object-cover border border-line"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/15 text-mint border border-mint/40 font-mono text-xl">
                    {creator.displayName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-ivory truncate">{creator.displayName}</h3>
                    <Badge tone="aviation">Flight Journalist</Badge>
                  </div>
                  <p className="font-mono text-xs text-mint">@{creator.handle}</p>
                  <p className="mt-2 text-xs text-muted leading-relaxed">{creator.bio}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line/50 pt-4 font-mono text-xs text-muted">
                <span>{creator.location}</span>
                <Link
                  to={`/creators/${creator.handle}`}
                  className="text-mint hover:underline flex items-center gap-1"
                >
                  <span>View airframe gallery</span>
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
