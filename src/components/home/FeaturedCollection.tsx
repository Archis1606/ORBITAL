import { PhotoCard } from '@/components/ui/PhotoCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { featuredPhotos } from '@/data/photos'

export function FeaturedCollection() {
  const frames = featuredPhotos()

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <SectionHeader
        kicker="Sample catalog"
        title="Featured frames"
        description="A short editorial cut from the local sample dataset. These are not live Storage objects."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {frames.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
    </section>
  )
}
