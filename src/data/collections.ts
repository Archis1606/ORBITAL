import type { Collection } from '@/types/models'
import { getPhoto } from '@/data/photos'

export const collections: Collection[] = [
  {
    id: 'collection-dark-sky-ledger',
    title: 'Dark Sky Ledger',
    description: 'Sample collection. Wide-field night work sequenced as a single observatory night.',
    discipline: 'astrophotography',
    photoIds: ['frame-andromeda-corridor', 'frame-violet-veil', 'frame-polar-curtain'],
    sample: 'SAMPLE',
  },
  {
    id: 'collection-ramp-cyan',
    title: 'Ramp Cyan',
    description: 'Sample collection. Civil aviation frames organized around departure light and glass.',
    discipline: 'aviation',
    photoIds: ['frame-night-widebody', 'frame-glass-cockpit', 'frame-formation-silver'],
    sample: 'SAMPLE',
  },
]

export function getCollection(id: string) {
  return collections.find((collection) => collection.id === id)
}

export function collectionPhotos(collection: Collection) {
  return collection.photoIds.map((id) => getPhoto(id)).filter((photo) => photo !== undefined)
}
