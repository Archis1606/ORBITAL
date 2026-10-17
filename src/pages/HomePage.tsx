import { DisciplineSplit } from '@/components/home/DisciplineSplit'
import { FeaturedCollection } from '@/components/home/FeaturedCollection'
import { HeroSection } from '@/components/home/HeroSection'
import { ManifestoSection } from '@/components/home/ManifestoSection'
import { ObservatoryFeed } from '@/components/home/ObservatoryFeed'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function HomePage() {
  useDocumentTitle('ORBITAL — Observatory of Light')

  return (
    <>
      <HeroSection />
      <DisciplineSplit />
      <FeaturedCollection />
      <ObservatoryFeed />
      <ManifestoSection />
    </>
  )
}
