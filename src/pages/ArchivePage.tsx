import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Plane,
  Telescope,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { fetchFilteredPhotos, type PhotoQueryResult } from '@/services/photoService'
import type {
  ArchiveFilterState,
  AstroTag,
  AviationTag,
  Discipline,
  SortOption,
} from '@/types/models'
import { cn } from '@/lib/cn'

const ASTRO_TAGS: AstroTag[] = [
  'Moon',
  'Sun',
  'Planets',
  'Milky Way',
  'Nebulae',
  'Galaxies',
  'Star trails',
  'Deep sky',
  'Solar and lunar eclipses',
]

const AVIATION_TAGS: AviationTag[] = [
  'Widebody',
  'Narrowbody',
  'Cockpit',
  'Vintage',
  'Military',
  'Ramp',
  'Air-to-Air',
  'Approach',
]

const MANUFACTURERS = ['Boeing', 'Airbus', 'Lockheed', 'North American', 'Douglas']

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest captures' },
  { value: 'oldest', label: 'Chronological earliest' },
  { value: 'liked', label: 'Most appreciated' },
  { value: 'views', label: 'Most observed' },
]

export function ArchivePage() {
  useDocumentTitle('Photography Archive — ORBITAL')
  const [params, setParams] = useSearchParams()
  const [, startTransition] = useTransition()

  // Parse filters from URL
  const disciplineParam = (params.get('discipline') as Discipline | 'all') || 'all'
  const tagParam = params.get('tag') || ''
  const mfrParam = params.get('mfr') || ''
  const queryParam = params.get('q') || ''
  const sortParam = (params.get('sort') as SortOption) || 'newest'
  const pageParam = parseInt(params.get('page') || '1', 10)

  // Local state for immediate typing in search input
  const [searchInput, setSearchInput] = useState(queryParam)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<PhotoQueryResult>({
    photos: [],
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  })
  const [loading, setLoading] = useState(true)

  // Debounce search query into URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== queryParam) {
        setParams((prev) => {
          const next = new URLSearchParams(prev)
          if (searchInput.trim()) next.set('q', searchInput.trim())
          else next.delete('q')
          next.set('page', '1')
          return next
        })
      }
    }, 280)
    return () => clearTimeout(timer)
  }, [searchInput, queryParam, setParams])

  // Fetch photos whenever URL params change
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const filterState: ArchiveFilterState = {
      search: queryParam,
      discipline: disciplineParam,
      astroTag: disciplineParam === 'astrophotography' || disciplineParam === 'all' ? tagParam : undefined,
      aviationTag: disciplineParam === 'aviation' || disciplineParam === 'all' ? tagParam : undefined,
      manufacturer: mfrParam || undefined,
      sort: sortParam,
      page: pageParam,
      pageSize: 12,
    }

    fetchFilteredPhotos(filterState).then((res) => {
      if (!cancelled) {
        startTransition(() => {
          setResult(res)
          setLoading(false)
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [disciplineParam, tagParam, mfrParam, queryParam, sortParam, pageParam])

  // Helper to update specific param
  const updateParam = (key: string, value: string | null) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === null || value === '' || value === 'all') next.delete(key)
      else next.set(key, value)
      next.set('page', '1') // reset page on filter change
      return next
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('')
    setParams(new URLSearchParams())
  }

  const isFiltered = Boolean(disciplineParam !== 'all' || tagParam || mfrParam || queryParam || sortParam !== 'newest')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* Header */}
      <SectionHeader
        as="h1"
        kicker="Curated Discovery System"
        title="Photography Archive"
        description="Filter celestial deep-sky observations and high-altitude aviation telemetry. All filters are synchronized with shareable URL parameters."
      />

      {/* Main Filter & Search Control Console */}
      <div className="glass-panel mb-8 rounded-3xl border border-line p-5 md:p-6 space-y-5">
        {/* Top row: Search and Discipline Tabs */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Discipline Selector */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Discipline Selector">
            <button
              type="button"
              role="tab"
              aria-selected={disciplineParam === 'all'}
              onClick={() => {
                updateParam('discipline', 'all')
                updateParam('tag', null)
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all',
                disciplineParam === 'all'
                  ? 'border border-cyan bg-cyan/15 text-cyan shadow-[0_0_15px_rgba(62,224,255,0.2)]'
                  : 'border border-line text-muted hover:border-ivory/40 hover:text-ivory',
              )}
            >
              <Sparkles size={13} />
              <span>All Frames ({result.total})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={disciplineParam === 'astrophotography'}
              onClick={() => {
                updateParam('discipline', 'astrophotography')
                updateParam('tag', null)
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all',
                disciplineParam === 'astrophotography'
                  ? 'border border-violet bg-violet/15 text-violet shadow-[0_0_15px_rgba(155,140,255,0.2)]'
                  : 'border border-line text-muted hover:border-violet/40 hover:text-ivory',
              )}
            >
              <Telescope size={13} />
              <span>Astrophotography</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={disciplineParam === 'aviation'}
              onClick={() => {
                updateParam('discipline', 'aviation')
                updateParam('tag', null)
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all',
                disciplineParam === 'aviation'
                  ? 'border border-mint bg-mint/15 text-mint shadow-[0_0_15px_rgba(143,217,196,0.2)]'
                  : 'border border-line text-muted hover:border-mint/40 hover:text-ivory',
              )}
            >
              <Plane size={13} />
              <span>Aviation</span>
            </button>
          </div>

          {/* Live Search Input */}
          <div className="relative min-w-[18rem] max-w-md flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={15} />
            </div>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search targets, aircraft, cameras, airports..."
              aria-label="Live search archive"
              className="w-full rounded-full border border-line bg-navy/80 py-2 pl-9 pr-10 text-xs font-mono text-ivory placeholder:text-muted focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-ivory"
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Category Sub-Filters Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-line/50 pt-4">
          <span className="font-mono text-[0.68rem] tracking-wider text-muted uppercase mr-1 flex items-center gap-1">
            <Filter size={11} />
            <span>Target / Airframe:</span>
          </span>

          <button
            type="button"
            onClick={() => updateParam('tag', null)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-mono transition-colors',
              !tagParam ? 'border border-cyan text-cyan bg-cyan/10' : 'border border-line text-muted hover:text-ivory',
            )}
          >
            All targets
          </button>

          {/* Astro tags if astro or all */}
          {(disciplineParam === 'astrophotography' || disciplineParam === 'all') &&
            ASTRO_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => updateParam('tag', tagParam === tag ? null : tag)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-mono transition-colors',
                  tagParam === tag
                    ? 'border border-violet text-violet bg-violet/15'
                    : 'border border-line text-muted hover:border-violet/40 hover:text-ivory',
                )}
              >
                {tag}
              </button>
            ))}

          {/* Aviation tags if aviation */}
          {disciplineParam === 'aviation' &&
            AVIATION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => updateParam('tag', tagParam === tag ? null : tag)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-mono transition-colors',
                  tagParam === tag
                    ? 'border border-mint text-mint bg-mint/15'
                    : 'border border-line text-muted hover:border-mint/40 hover:text-ivory',
                )}
              >
                {tag}
              </button>
            ))}

          {/* Toggle Advanced Filters Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={cn(
              'ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono transition-colors',
              showAdvanced || mfrParam
                ? 'border-cyan text-cyan bg-cyan/10'
                : 'border-line text-muted hover:text-ivory',
            )}
          >
            <SlidersHorizontal size={12} />
            <span>Telemetry Specs</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced ? (
          <div className="grid gap-4 rounded-2xl border border-line/60 bg-navy-deep/60 p-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Manufacturer filter */}
            <div>
              <label className="block font-mono text-[0.68rem] tracking-wider text-muted uppercase mb-1.5">
                Aircraft Manufacturer
              </label>
              <select
                value={mfrParam}
                onChange={(e) => updateParam('mfr', e.target.value)}
                className="w-full rounded-xl border border-line bg-navy px-3 py-2 text-xs font-mono text-ivory focus:border-cyan focus:outline-none"
              >
                <option value="">All Manufacturers</option>
                {MANUFACTURERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Selector */}
            <div>
              <label className="block font-mono text-[0.68rem] tracking-wider text-muted uppercase mb-1.5">
                Catalog Sequence Sort
              </label>
              <select
                value={sortParam}
                onChange={(e) => updateParam('sort', e.target.value as SortOption)}
                className="w-full rounded-xl border border-line bg-navy px-3 py-2 text-xs font-mono text-ivory focus:border-cyan focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Reset Action */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={!isFiltered}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-mono transition-colors',
                  isFiltered
                    ? 'border-danger/40 text-danger hover:border-danger hover:bg-danger/10'
                    : 'border-line text-muted/50 cursor-not-allowed',
                )}
              >
                <RotateCcw size={12} />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Filter Summary & Active Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span>SHOWING:</span>
            <Badge tone="sample">{`${result.total} frames indexed`}</Badge>

            {tagParam ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet/40 bg-violet/10 px-2.5 py-0.5 text-violet">
                Tag: {tagParam}
                <button
                  type="button"
                  onClick={() => updateParam('tag', null)}
                  className="hover:text-ivory"
                  aria-label="Remove tag filter"
                >
                  <X size={10} />
                </button>
              </span>
            ) : null}

            {mfrParam ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-mint/40 bg-mint/10 px-2.5 py-0.5 text-mint">
                Mfr: {mfrParam}
                <button
                  type="button"
                  onClick={() => updateParam('mfr', null)}
                  className="hover:text-ivory"
                  aria-label="Remove manufacturer filter"
                >
                  <X size={10} />
                </button>
              </span>
            ) : null}

            {queryParam ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-0.5 text-cyan">
                Query: "{queryParam}"
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="hover:text-ivory"
                  aria-label="Remove query"
                >
                  <X size={10} />
                </button>
              </span>
            ) : null}
          </div>

          {isFiltered ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-cyan underline hover:text-ivory transition-colors text-[0.72rem]"
            >
              Clear all active filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5 py-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 w-full animate-pulse rounded-2xl border border-line/40 bg-panel/60"
            />
          ))}
        </div>
      ) : (
        <PhotoGrid
          photos={result.photos}
          emptyTitle="No frames match this filter combination"
          emptyBody="Try broadening your criteria, clearing active search keywords, or selecting another discipline."
        />
      )}

      {/* Pagination Controls */}
      {result.totalPages > 1 ? (
        <div className="mt-12 flex items-center justify-between border-t border-line/60 pt-6 font-mono text-xs text-muted">
          <p>
            PAGE <span className="text-ivory">{result.page}</span> OF{' '}
            <span className="text-ivory">{result.totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={result.page <= 1}
              onClick={() => updateParam('page', String(result.page - 1))}
              className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-ivory hover:border-cyan disabled:opacity-40 disabled:hover:border-line"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={result.page >= result.totalPages}
              onClick={() => updateParam('page', String(result.page + 1))}
              className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-ivory hover:border-cyan disabled:opacity-40 disabled:hover:border-line"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
