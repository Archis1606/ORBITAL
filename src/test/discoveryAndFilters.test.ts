import { describe, it, expect } from 'vitest'
import { fetchFilteredPhotos, getAllAvailablePhotos } from '@/services/photoService'
import type { ArchiveFilterState } from '@/types/models'

describe('Photography Discovery System & Archive Filtering', () => {
  it('returns all catalog frames when no filters are applied', async () => {
    const filters: ArchiveFilterState = {
      search: '',
      discipline: 'all',
      sort: 'newest',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    expect(result.photos.length).toBeGreaterThanOrEqual(16)
    expect(result.total).toBeGreaterThanOrEqual(16)
    expect(result.page).toBe(1)
  })

  it('filters accurately by astrophotography discipline', async () => {
    const filters: ArchiveFilterState = {
      search: '',
      discipline: 'astrophotography',
      sort: 'newest',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    expect(result.photos.length).toBeGreaterThan(0)
    result.photos.forEach((photo) => {
      expect(photo.discipline).toBe('astrophotography')
    })
  })

  it('filters accurately by aviation discipline', async () => {
    const filters: ArchiveFilterState = {
      search: '',
      discipline: 'aviation',
      sort: 'newest',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    expect(result.photos.length).toBeGreaterThan(0)
    result.photos.forEach((photo) => {
      expect(photo.discipline).toBe('aviation')
    })
  })

  it('combines discipline and category tag filters', async () => {
    const filters: ArchiveFilterState = {
      search: '',
      discipline: 'astrophotography',
      astroTag: 'Nebulae',
      sort: 'newest',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    expect(result.photos.length).toBeGreaterThan(0)
    result.photos.forEach((photo) => {
      expect(photo.discipline).toBe('astrophotography')
      const matchesCategory =
        photo.categoryTag === 'Nebulae' ||
        photo.tags.includes('Nebulae') ||
        photo.astro?.target?.includes('Nebula')
      expect(matchesCategory).toBe(true)
    })
  })

  it('combines aviation manufacturer filter with search query', async () => {
    const filters: ArchiveFilterState = {
      search: '777',
      discipline: 'aviation',
      manufacturer: 'Boeing',
      sort: 'newest',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    expect(result.photos.length).toBeGreaterThan(0)
    result.photos.forEach((photo) => {
      expect(photo.discipline).toBe('aviation')
      expect(photo.aviation?.manufacturer).toBe('Boeing')
    })
  })

  it('sorts chronologically earliest when oldest sort is requested', async () => {
    const filters: ArchiveFilterState = {
      search: '',
      discipline: 'all',
      sort: 'oldest',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    for (let i = 0; i < result.photos.length - 1; i++) {
      const dateA = new Date(result.photos[i].capturedAt).getTime()
      const dateB = new Date(result.photos[i + 1].capturedAt).getTime()
      expect(dateA).toBeLessThanOrEqual(dateB)
    }
  })

  it('sorts by most appreciated (likes count descending)', async () => {
    const filters: ArchiveFilterState = {
      search: '',
      discipline: 'all',
      sort: 'liked',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    for (let i = 0; i < result.photos.length - 1; i++) {
      expect(result.photos[i].likesCount).toBeGreaterThanOrEqual(result.photos[i + 1].likesCount)
    }
  })

  it('returns empty results gracefully for non-matching queries without crashing', async () => {
    const filters: ArchiveFilterState = {
      search: 'NonExistentCelestialTargetOrAirframeXYZ999',
      discipline: 'all',
      sort: 'newest',
      page: 1,
      pageSize: 20,
    }

    const result = await fetchFilteredPhotos(filters)
    expect(result.photos.length).toBe(0)
    expect(result.total).toBe(0)
    expect(result.hasMore).toBe(false)
  })

  it('paginates accurately with custom page sizes', async () => {
    const all = getAllAvailablePhotos()
    const pageSize = 4
    const filters: ArchiveFilterState = {
      search: '',
      discipline: 'all',
      sort: 'newest',
      page: 2,
      pageSize,
    }

    const result = await fetchFilteredPhotos(filters)
    expect(result.photos.length).toBeLessThanOrEqual(pageSize)
    expect(result.page).toBe(2)
    expect(result.totalPages).toBe(Math.ceil(all.length / pageSize))
  })
})
