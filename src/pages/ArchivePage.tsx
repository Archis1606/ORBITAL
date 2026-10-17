import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { photos } from '@/data/photos'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Discipline } from '@/types/models'
import { cn } from '@/lib/cn'

const filters: Array<{ id: 'all' | Discipline; label: string }> = [
  { id: 'all', label: 'All frames' },
  { id: 'astrophotography', label: 'Astrophotography' },
  { id: 'aviation', label: 'Aviation' },
]

export function ArchivePage() {
  useDocumentTitle('Archive — ORBITAL')
  const [params, setParams] = useSearchParams()
  const discipline = params.get('discipline')

  const visible = useMemo(() => {
    if (discipline === 'astrophotography' || discipline === 'aviation') {
      return photos.filter((photo) => photo.discipline === discipline)
    }
    return photos
  }, [discipline])

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <SectionHeader
        as="h1"
        kicker="Sample catalog"
        title="Photography archive"
        description="Filter the local sample catalog. Query parameters are real; the images are labeled sample frames."
      />
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Discipline filter">
        {filters.map((filter) => {
          const active =
            filter.id === 'all' ? discipline !== 'astrophotography' && discipline !== 'aviation' : discipline === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              className={cn('rounded-full border px-4 py-2 text-sm', active ? 'border-cyan text-cyan' : 'border-line text-muted')}
              onClick={() => {
                const next = new URLSearchParams(params)
                if (filter.id === 'all') next.delete('discipline')
                else next.set('discipline', filter.id)
                setParams(next)
              }}
            >
              {filter.label}
            </button>
          )
        })}
        <Badge tone="sample">{`${visible.length} frames`}</Badge>
      </div>
      <PhotoGrid photos={visible} />
    </div>
  )
}
