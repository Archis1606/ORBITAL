import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { photosByDiscipline } from '@/data/photos'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function AstrophotographyPage() {
  useDocumentTitle('Astrophotography — ORBITAL')
  const frames = photosByDiscipline('astrophotography')

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <SectionHeader
        as="h1"
        kicker="Violet corridor"
        title="Astrophotography"
        description="Sample night-sky work. This section reads from the local catalog until Storage is connected."
      />
      <PhotoGrid
        photos={frames}
        emptyTitle="No astronomy frames yet"
        emptyBody="The sample catalog does not currently include astrophotography."
      />
    </div>
  )
}
