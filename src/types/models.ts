export type Discipline = 'astrophotography' | 'aviation'

export type SampleFlag = 'SAMPLE' | 'USER'

export type AstroTag =
  | 'Moon'
  | 'Sun'
  | 'Planets'
  | 'Milky Way'
  | 'Nebulae'
  | 'Galaxies'
  | 'Star trails'
  | 'Deep sky'
  | 'Solar and lunar eclipses'

export type AviationTag =
  | 'Widebody'
  | 'Narrowbody'
  | 'Cockpit'
  | 'Vintage'
  | 'Military'
  | 'Ramp'
  | 'Air-to-Air'
  | 'Approach'

export type AircraftType =
  | 'Commercial Widebody'
  | 'Commercial Narrowbody'
  | 'Turboprop'
  | 'Supersonic / Military'
  | 'Vintage Radial'
  | 'Cockpit / Flight Deck'
  | 'Cargo Heavy'

export type AircraftManufacturer =
  | 'Boeing'
  | 'Airbus'
  | 'Lockheed'
  | 'Bombardier'
  | 'Embraer'
  | 'Cessna'
  | 'North American'
  | 'Dassault'

export type PhotoStatus = 'published' | 'draft' | 'private'

export type ExifMetadata = {
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: string
  exposure?: string
  capturedAt?: string
}

export type AstroMetadata = {
  target?: string
  telescope?: string
  mount?: string
  filters?: string
  exposureIntegration?: string
  bortleClass?: number
  processingNotes?: string
  comparisonRawUrl?: string // For before/after slider (single raw frame vs final stacked stack)
  constellation?: string
  raCoordinates?: string
  decCoordinates?: string
}

export type AviationMetadata = {
  aircraftType?: AircraftType | string
  manufacturer?: AircraftManufacturer | string
  airline?: string
  airportCode?: string // IATA or ICAO (e.g. LAX, LHR, HND)
  airportName?: string
  country?: string
  registration?: string // Real tail number if supplied by photographer
  flightConditions?: string // e.g. "Golden hour approach", "Night ramp fog"
}

export type LocationCoordinates = {
  latitude: number
  longitude: number
  allowLocationSharing: boolean // Privacy: Never reveal unless creator enabled
}

export type CreatorStats = {
  photosCount: number
  collectionsCount: number
  followersCount: number
  likesReceived: number
}

export type Creator = {
  id: string
  userId?: string
  displayName: string
  handle: string
  disciplineFocus: Discipline
  bio: string
  location: string
  avatarUrl?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    website?: string
  }
  stats?: CreatorStats
  sample: SampleFlag
}

export type Photo = {
  id: string
  userId?: string
  title: string
  discipline: Discipline
  caption: string
  categoryTag?: AstroTag | AviationTag | string
  tags: string[]
  location: string
  locationCoordinates?: LocationCoordinates
  capturedAt: string
  camera: string
  optics: string
  exposure: string
  creatorId: string
  unsplashId: string
  customImageUrl?: string // When uploaded via Creator Studio / Supabase Storage
  storagePath?: string
  storageBucket?: 'photos' | 'private-photos'
  thumbnailUrl?: string
  imageAlt: string
  width: number
  height: number
  featured: boolean
  sample: SampleFlag
  likesCount: number
  viewsCount: number
  status: PhotoStatus
  license: string
  exif?: ExifMetadata
  astro?: AstroMetadata
  aviation?: AviationMetadata
  beforeImageUrl?: string // For before/after interactive slider
}

export type Collection = {
  id: string
  userId?: string
  title: string
  description: string
  discipline: Discipline | 'all'
  photoIds: string[]
  isPrivate?: boolean
  coverPhotoId?: string
  sample: SampleFlag
  createdAt?: string
}

export type AppNotice = {
  title: string
  body: string
}

export type SortOption = 'newest' | 'oldest' | 'liked' | 'views'

export type ArchiveFilterState = {
  search: string
  discipline: 'all' | Discipline
  astroTag?: string
  aviationTag?: string
  aircraftType?: string
  manufacturer?: string
  airline?: string
  airport?: string
  sort: SortOption
  page: number
  pageSize: number
}
