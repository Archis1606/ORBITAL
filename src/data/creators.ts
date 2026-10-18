import type { Creator } from '@/types/models'

export const creators: Creator[] = [
  {
    id: 'creator-nova-ellison',
    displayName: 'Nova Ellison',
    handle: 'nova.ellison',
    disciplineFocus: 'astrophotography',
    bio: 'Observational astronomer & narrowband specialist. Tracking faint hydrogen and oxygen emissions across high-latitude dark-sky reserves.',
    location: 'Atacama Desert & Nordic Latitudes',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    socialLinks: {
      twitter: 'nova_astro',
      instagram: 'nova.deepsky',
      website: 'https://orbital.gallery/nova',
    },
    stats: {
      photosCount: 8,
      collectionsCount: 3,
      followersCount: 1420,
      likesReceived: 3840,
    },
    sample: 'SAMPLE',
  },
  {
    id: 'creator-hale-meridian',
    displayName: 'Hale Meridian',
    handle: 'hale.meridian',
    disciplineFocus: 'aviation',
    bio: 'Aviation photojournalist & ramp observer. Specializing in long-haul departures, technical cockpits, and flight operations in extreme weather.',
    location: 'North Atlantic Corridors & Pacific Terminals',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    socialLinks: {
      twitter: 'hale_aviation',
      instagram: 'meridian.flight',
      website: 'https://orbital.gallery/meridian',
    },
    stats: {
      photosCount: 8,
      collectionsCount: 2,
      followersCount: 2180,
      likesReceived: 4920,
    },
    sample: 'SAMPLE',
  },
  {
    id: 'creator-dr-soren-vance',
    displayName: 'Dr. Soren Vance',
    handle: 'soren.vance',
    disciplineFocus: 'astrophotography',
    bio: 'Solar system researcher and high-magnification planetary astrophotographer. Solar coronagraphy, lunar limb mapping, and planetary transits.',
    location: 'Canary Islands & Mauna Kea',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    socialLinks: {
      twitter: 'soren_solar',
      website: 'https://orbital.gallery/vance',
    },
    stats: {
      photosCount: 4,
      collectionsCount: 2,
      followersCount: 980,
      likesReceived: 2150,
    },
    sample: 'SAMPLE',
  },
  {
    id: 'creator-elena-rostova',
    displayName: 'Elena Rostova',
    handle: 'elena.aero',
    disciplineFocus: 'aviation',
    bio: 'Air-to-air photographer and experimental flight tester. Capturing airframes at high angles of attack and transonic vapor envelopes.',
    location: 'Mojave Aerospace Corridor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    socialLinks: {
      instagram: 'elena_airtoair',
    },
    stats: {
      photosCount: 4,
      collectionsCount: 1,
      followersCount: 1640,
      likesReceived: 3100,
    },
    sample: 'SAMPLE',
  },
]

export function getCreator(id: string) {
  return creators.find((creator) => creator.id === id)
}

export function getCreatorByHandle(handle: string) {
  return creators.find((creator) => creator.handle.toLowerCase() === handle.toLowerCase())
}
