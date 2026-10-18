import { photos as fixturePhotos } from '@/data/photos'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { ArchiveFilterState, Collection, Photo } from '@/types/models'
import { collections as fixtureCollections } from '@/data/collections'
import type { Database } from '@/types/database'

const LOCAL_USER_PHOTOS_KEY = 'orbital.user.photos'
const LOCAL_COLLECTIONS_KEY = 'orbital.user.collections'
const LOCAL_FOLLOWS_KEY = 'orbital.follows'
type PhotoRow = Database['public']['Tables']['photos']['Row']

function mapPhotoRow(row: PhotoRow): Photo {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    discipline: row.discipline,
    caption: row.caption || '',
    categoryTag: row.category_tag || undefined,
    tags: row.tags || [],
    location: row.allow_location_sharing ? row.location_name || '' : '',
    capturedAt: row.captured_at || '',
    camera: row.camera || '',
    optics: row.optics || '',
    exposure: row.exposure || '',
    creatorId: row.user_id,
    unsplashId: '',
    customImageUrl: row.image_url,
    storagePath: row.storage_path || undefined,
    storageBucket: row.storage_bucket || 'photos',
    thumbnailUrl: row.thumbnail_url || undefined,
    imageAlt: row.title,
    width: row.width || 1920,
    height: row.height || 1080,
    featured: row.featured,
    sample: 'USER',
    likesCount: row.likes_count,
    viewsCount: row.views_count,
    status: row.status,
    license: row.license,
    locationCoordinates:
      row.allow_location_sharing && row.latitude !== null && row.longitude !== null
        ? {
            latitude: row.latitude,
            longitude: row.longitude,
            allowLocationSharing: true,
          }
        : undefined,
    exif: {
      camera: row.camera || undefined,
      lens: row.optics || undefined,
      exposure: row.exposure || undefined,
    },
    astro:
      row.discipline === 'astrophotography'
        ? {
            target: row.astro_target || undefined,
            telescope: row.astro_telescope || undefined,
            mount: row.astro_mount || undefined,
            filters: row.astro_filters || undefined,
            exposureIntegration: row.astro_integration || undefined,
            bortleClass: row.astro_bortle || undefined,
            processingNotes: row.astro_notes || undefined,
          }
        : undefined,
    aviation:
      row.discipline === 'aviation'
        ? {
            aircraftType: row.aviation_aircraft_type || undefined,
            manufacturer: row.aviation_manufacturer || undefined,
            airline: row.aviation_airline || undefined,
            airportCode: row.aviation_airport_code || undefined,
            airportName: row.aviation_airport_name || undefined,
            country: row.aviation_country || undefined,
            registration: row.aviation_registration || undefined,
            flightConditions: row.aviation_conditions || undefined,
          }
        : undefined,
  }
}

async function mapAccessiblePhoto(row: PhotoRow): Promise<Photo> {
  const photo = mapPhotoRow(row)
  if (photo.storageBucket === 'private-photos' && photo.storagePath) {
    const { data, error } = await supabase.storage
      .from('private-photos')
      .createSignedUrl(photo.storagePath, 60 * 60)
    if (error) throw new Error(error.message)
    photo.customImageUrl = data.signedUrl
  }
  return photo
}

// Helper to get locally stored user-created photos
export function getLocalUserPhotos(): Photo[] {
  try {
    const raw = localStorage.getItem(LOCAL_USER_PHOTOS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalUserPhoto(photo: Photo): void {
  const existing = getLocalUserPhotos()
  const updated = [photo, ...existing.filter((p) => p.id !== photo.id)]
  localStorage.setItem(LOCAL_USER_PHOTOS_KEY, JSON.stringify(updated))
}

export function deleteLocalUserPhoto(id: string): void {
  const existing = getLocalUserPhotos()
  const updated = existing.filter((p) => p.id !== id)
  localStorage.setItem(LOCAL_USER_PHOTOS_KEY, JSON.stringify(updated))
}

// Master list of all available photos (fixtures + user photos)
export function getAllAvailablePhotos(): Photo[] {
  const userPhotos = getLocalUserPhotos()
  return [...userPhotos, ...fixturePhotos]
}

export interface PhotoQueryResult {
  photos: Photo[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export async function fetchFilteredPhotos(filters: ArchiveFilterState): Promise<PhotoQueryResult> {
  const {
    search,
    discipline,
    astroTag,
    aviationTag,
    aircraftType,
    manufacturer,
    airline,
    airport,
    sort,
    page,
    pageSize,
  } = filters

  // If Supabase is configured and reachable, attempt server-side query
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('photos').select('*', { count: 'exact' })

      // Filter: status = published
      query = query.eq('status', 'published')

      if (discipline !== 'all') {
        query = query.eq('discipline', discipline)
      }

      if (astroTag && discipline === 'astrophotography') {
        query = query.eq('category_tag', astroTag)
      }

      if (aviationTag && discipline === 'aviation') {
        query = query.eq('category_tag', aviationTag)
      }

      if (aircraftType) {
        query = query.eq('aviation_aircraft_type', aircraftType)
      }

      if (manufacturer) {
        query = query.eq('aviation_manufacturer', manufacturer)
      }

      if (airline) {
        query = query.ilike('aviation_airline', `%${airline}%`)
      }

      if (airport) {
        query = query.or(`aviation_airport_code.ilike.%${airport}%,aviation_airport_name.ilike.%${airport}%`)
      }

      if (search.trim()) {
        const q = search.trim()
        query = query.or(`title.ilike.%${q}%,caption.ilike.%${q}%,location_name.ilike.%${q}%,camera.ilike.%${q}%`)
      }

      // Sort
      if (sort === 'newest') query = query.order('created_at', { ascending: false })
      else if (sort === 'oldest') query = query.order('created_at', { ascending: true })
      else if (sort === 'liked') query = query.order('likes_count', { ascending: false })
      else if (sort === 'views') query = query.order('views_count', { ascending: false })

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, count, error } = await query

      if (!error && data && data.length > 0) {
        const mappedPhotos = (data as unknown as PhotoRow[]).map(mapPhotoRow)

        const total = count || mappedPhotos.length
        const totalPages = Math.ceil(total / pageSize)
        return {
          photos: mappedPhotos,
          total,
          page,
          totalPages,
          hasMore: page < totalPages,
        }
      }
    } catch {
      // Fallback to local catalog if database fails
    }
  }

  // Local in-memory filtering across all photos
  const allPhotos = getAllAvailablePhotos()

  let filtered = allPhotos.filter((p) => p.status === 'published' || p.status === undefined)

  // Discipline
  if (discipline !== 'all') {
    filtered = filtered.filter((p) => p.discipline === discipline)
  }

  // Astro Tag
  if (astroTag && discipline === 'astrophotography') {
    filtered = filtered.filter(
      (p) =>
        p.categoryTag === astroTag ||
        p.tags.some((t) => t.toLowerCase() === astroTag.toLowerCase()) ||
        p.astro?.target?.toLowerCase().includes(astroTag.toLowerCase()),
    )
  }

  // Aviation Tag
  if (aviationTag && discipline === 'aviation') {
    filtered = filtered.filter(
      (p) =>
        p.categoryTag === aviationTag ||
        p.tags.some((t) => t.toLowerCase() === aviationTag.toLowerCase()) ||
        p.aviation?.aircraftType?.toLowerCase().includes(aviationTag.toLowerCase()),
    )
  }

  // Aircraft Type
  if (aircraftType) {
    filtered = filtered.filter((p) => p.aviation?.aircraftType === aircraftType)
  }

  // Manufacturer
  if (manufacturer) {
    filtered = filtered.filter((p) => p.aviation?.manufacturer === manufacturer)
  }

  // Airline
  if (airline) {
    filtered = filtered.filter((p) => p.aviation?.airline?.toLowerCase().includes(airline.toLowerCase()))
  }

  // Airport
  if (airport) {
    filtered = filtered.filter(
      (p) =>
        p.aviation?.airportCode?.toLowerCase().includes(airport.toLowerCase()) ||
        p.aviation?.airportName?.toLowerCase().includes(airport.toLowerCase()),
    )
  }

  // Live Search
  if (search.trim()) {
    const term = search.trim().toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.caption.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.camera.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term)) ||
        p.astro?.target?.toLowerCase().includes(term) ||
        p.aviation?.airline?.toLowerCase().includes(term) ||
        p.aviation?.airportName?.toLowerCase().includes(term) ||
        p.aviation?.registration?.toLowerCase().includes(term) ||
        p.aviation?.aircraftType?.toLowerCase().includes(term),
    )
  }

  // Sorting
  filtered.sort((a, b) => {
    if (sort === 'newest') return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    if (sort === 'oldest') return new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    if (sort === 'liked') return (b.likesCount || 0) - (a.likesCount || 0)
    if (sort === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0)
    return 0
  })

  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return {
    photos: paginated,
    total,
    page,
    totalPages,
    hasMore: page < totalPages,
  }
}

// Single photo lookup
export async function getPhotoById(id: string): Promise<Photo | undefined> {
  // Check local collection first
  const all = getAllAvailablePhotos()
  const found = all.find((p) => p.id === id)
  if (found) return found

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('photos').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapAccessiblePhoto(data as unknown as PhotoRow) : undefined
  }

  return undefined
}

export async function fetchPhotosByUserId(userId: string, includeUnpublished = false): Promise<Photo[]> {
  if (!isSupabaseConfigured()) {
    return getLocalUserPhotos().filter((photo) => photo.userId === userId)
  }

  let query = supabase.from('photos').select('*').eq('user_id', userId)
  if (!includeUnpublished) query = query.eq('status', 'published')
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return Promise.all((data ?? []).map((row) => mapAccessiblePhoto(row as unknown as PhotoRow)))
}

// User collections management
export function getStoredCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(LOCAL_COLLECTIONS_KEY)
    const localCols: Collection[] = raw ? JSON.parse(raw) : []
    return [...localCols, ...fixtureCollections]
  } catch {
    return fixtureCollections
  }
}

export function saveUserCollection(collection: Collection): void {
  try {
    const raw = localStorage.getItem(LOCAL_COLLECTIONS_KEY)
    const existing: Collection[] = raw ? JSON.parse(raw) : []
    const updated = [collection, ...existing.filter((c) => c.id !== collection.id)]
    localStorage.setItem(LOCAL_COLLECTIONS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore
  }
}

export function deleteUserCollection(id: string): void {
  try {
    const raw = localStorage.getItem(LOCAL_COLLECTIONS_KEY)
    const existing: Collection[] = raw ? JSON.parse(raw) : []
    const updated = existing.filter((c) => c.id !== id)
    localStorage.setItem(LOCAL_COLLECTIONS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore
  }
}

// User follows management
export function getFollowingIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_FOLLOWS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function toggleFollowUser(creatorId: string): boolean {
  const current = getFollowingIds()
  const exists = current.includes(creatorId)
  const next = exists ? current.filter((id) => id !== creatorId) : [...current, creatorId]
  localStorage.setItem(LOCAL_FOLLOWS_KEY, JSON.stringify(next))
  return !exists
}
