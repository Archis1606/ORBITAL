import { DisciplineSplit } from '@/components/home/DisciplineSplit'
import { FeaturedCollection } from '@/components/home/FeaturedCollection'
import { HeroSection } from '@/components/home/HeroSection'
import { ManifestoSection } from '@/components/home/ManifestoSection'
import { ObservatoryFeed } from '@/components/home/ObservatoryFeed'
import { ClipPathFeature } from '@/components/home/ClipPathFeature'
import { FlightPathAnimation } from '@/components/home/FlightPathAnimation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function HomePage() {
  useDocumentTitle('ORBITAL — Observatory of Light')

  return (
    <>
      <HeroSection />
      <DisciplineSplit />
      <ClipPathFeature />
      <FeaturedCollection />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <FlightPathAnimation />
      </div>
      <ObservatoryFeed />
      <ManifestoSection />
    </>
  )
}
