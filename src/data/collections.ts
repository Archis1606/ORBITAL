import type { Collection } from '@/types/models'
import { getPhoto } from '@/data/photos'

export const collections: Collection[] = [
  {
    id: 'collection-dark-sky-ledger',
    title: 'Dark Sky Ledger',
    description: 'Wide-field deep sky observations sequenced as a single observatory night across Bortle 1 and 2 plateaus.',
    discipline: 'astrophotography',
    photoIds: ['frame-andromeda-corridor', 'frame-violet-veil', 'frame-milky-way-arch', 'frame-star-trails-ridge'],
    coverPhotoId: 'frame-andromeda-corridor',
    sample: 'SAMPLE',
    createdAt: '2025-09-15',
  },
  {
    id: 'collection-solar-lunar-architecture',
    title: 'Solar & Lunar Architecture',
    description: 'High-magnification lunar relief, totality corona magnetic streamers, and planetary limb studies.',
    discipline: 'astrophotography',
    photoIds: ['frame-lunar-terminator', 'frame-solar-corona', 'frame-limb-of-earth'],
    coverPhotoId: 'frame-lunar-terminator',
    sample: 'SAMPLE',
    createdAt: '2025-08-01',
  },
  {
    id: 'collection-ramp-cyan',
    title: 'Ramp Cyan & Operations',
    description: 'Civil aviation frames organized around nocturnal turnarounds, sodium ramp reflections, and heavy departures.',
    discipline: 'aviation',
    photoIds: ['frame-night-widebody', 'frame-cargo-queen-apron', 'frame-tokyo-threshold'],
    coverPhotoId: 'frame-night-widebody',
    sample: 'SAMPLE',
    createdAt: '2025-10-05',
  },
  {
    id: 'collection-transatlantic-corridors',
    title: 'Flight Deck & High Altitude',
    description: 'Airframes slicing through thin stratospheric air at FL390+ and tactical air-to-air captures.',
    discipline: 'aviation',
    photoIds: ['frame-glass-cockpit', 'frame-formation-silver', 'frame-dreamliner-contrail', 'frame-a321-approach-cloud'],
    coverPhotoId: 'frame-glass-cockpit',
    sample: 'SAMPLE',
    createdAt: '2025-11-22',
  },
]

export function getCollection(id: string) {
  return collections.find((collection) => collection.id === id)
}

export function collectionPhotos(collection: Collection) {
  return collection.photoIds.map((id) => getPhoto(id)).filter((photo) => photo !== undefined)
}
