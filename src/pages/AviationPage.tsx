import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { photosByDiscipline } from '@/data/photos'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function AviationPage() {
  useDocumentTitle('Aviation — ORBITAL')
  const frames = photosByDiscipline('aviation')

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <SectionHeader
        as="h1"
        kicker="Mint corridor"
        title="Aviation photography"
        description="Sample airframe and operations work. This section reads from the local catalog until Storage is connected."
      />
      <PhotoGrid
        photos={frames}
        emptyTitle="No aviation frames yet"
        emptyBody="The sample catalog does not currently include aviation photography."
      />
    </div>
  )
}
