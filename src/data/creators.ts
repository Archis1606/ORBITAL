import type { Creator } from '@/types/models'

export const creators: Creator[] = [
  {
    id: 'creator-nova-ellison',
    displayName: 'Nova Ellison',
    handle: 'nova.ellison',
    disciplineFocus: 'astrophotography',
    bio: 'Sample creator profile. Night-sky observer documenting dark-sky corridors and deep-sky targets with modest glass.',
    location: 'Atacama analog sites / SAMPLE',
    sample: 'SAMPLE',
  },
  {
    id: 'creator-hale-meridian',
    displayName: 'Hale Meridian',
    handle: 'hale.meridian',
    disciplineFocus: 'aviation',
    bio: 'Sample creator profile. Ramp-side and air-to-air photographer focused on civil widebodies and night operations.',
    location: 'North Atlantic terminals / SAMPLE',
    sample: 'SAMPLE',
  },
]

export function getCreator(id: string) {
  return creators.find((creator) => creator.id === id)
}
