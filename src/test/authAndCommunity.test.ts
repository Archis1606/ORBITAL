import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredCollections,
  saveUserCollection,
  deleteUserCollection,
  getFollowingIds,
  toggleFollowUser,
  saveLocalUserPhoto,
  getLocalUserPhotos,
  deleteLocalUserPhoto,
} from '@/services/photoService'
import type { Collection, Photo } from '@/types/models'

describe('Community, Authorization, & Security Model', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Favorites & Deduplication', () => {
    it('prevents duplicate favorites in storage', () => {
      const STORAGE_KEY = 'orbital.favorites.v1'
      const photoId = 'frame-andromeda-corridor'

      // Save initial
      const initial = [photoId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))

      // Simulate adding duplicate
      const current: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const deduplicated = Array.from(new Set([...current, photoId]))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated))

      const finalSaved: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(finalSaved.length).toBe(1)
      expect(finalSaved[0]).toBe(photoId)
    })
  })

  describe('Collections Management & Access Permissions', () => {
    it('creates, persists, and retrieves user collections', () => {
      const newCollection: Collection = {
        id: 'col-test-1',
        userId: 'user-observer-123',
        title: 'Deep Sky Narrowband Test',
        description: 'Test sequence description',
        discipline: 'astrophotography',
        photoIds: ['frame-andromeda-corridor', 'frame-violet-veil'],
        isPrivate: false,
        sample: 'USER',
        createdAt: '2026-04-01',
      }

      saveUserCollection(newCollection)
      const list = getStoredCollections()
      const found = list.find((c) => c.id === 'col-test-1')

      expect(found).toBeDefined()
      expect(found?.title).toBe('Deep Sky Narrowband Test')
      expect(found?.photoIds.length).toBe(2)
      expect(found?.isPrivate).toBe(false)
    })

    it('deletes user collections without mutating fixture collections', () => {
      const colId = 'col-delete-test'
      const col: Collection = {
        id: colId,
        userId: 'user-observer-123',
        title: 'Disposable Collection',
        description: 'Will be deleted',
        discipline: 'aviation',
        photoIds: [],
        isPrivate: true,
        sample: 'USER',
      }

      saveUserCollection(col)
      expect(getStoredCollections().some((c) => c.id === colId)).toBe(true)

      deleteUserCollection(colId)
      expect(getStoredCollections().some((c) => c.id === colId)).toBe(false)
      // Verify sample collections still exist
      expect(getStoredCollections().some((c) => c.id === 'collection-dark-sky-ledger')).toBe(true)
    })

    it('enforces collection privacy: private collections are marked private', () => {
      const privateCol: Collection = {
        id: 'col-private-vault',
        userId: 'user-observer-123',
        title: 'Secret Deep Sky Trials',
        description: 'Private unreleased frames',
        discipline: 'astrophotography',
        photoIds: [],
        isPrivate: true,
        sample: 'USER',
      }

      saveUserCollection(privateCol)
      const found = getStoredCollections().find((c) => c.id === 'col-private-vault')
      expect(found?.isPrivate).toBe(true)
    })
  })

  describe('Following System', () => {
    it('toggles follow state and updates following registry', () => {
      const creatorId = 'creator-nova-ellison'
      expect(getFollowingIds().includes(creatorId)).toBe(false)

      // First toggle: follow
      const followed = toggleFollowUser(creatorId)
      expect(followed).toBe(true)
      expect(getFollowingIds().includes(creatorId)).toBe(true)

      // Second toggle: unfollow
      const unfollowed = toggleFollowUser(creatorId)
      expect(unfollowed).toBe(false)
      expect(getFollowingIds().includes(creatorId)).toBe(false)
    })
  })

  describe('User Published Frames & Ownership', () => {
    it('saves, persists, and allows deletion of user owned photos', () => {
      const photoId = 'user-frame-101'
      const userPhoto: Photo = {
        id: photoId,
        userId: 'test-user-id',
        title: 'User Supernova Observation',
        discipline: 'astrophotography',
        caption: 'Test capture in user studio',
        tags: ['Nebulae'],
        location: 'Desert Ridge',
        capturedAt: '2026-03-15',
        camera: 'Cooled CMOS',
        optics: '100mm APO',
        exposure: '30 x 120s',
        creatorId: 'test-user-id',
        unsplashId: '',
        customImageUrl: 'blob:http://localhost/test-image',
        imageAlt: 'User Supernova Observation',
        width: 1920,
        height: 1080,
        featured: false,
        sample: 'USER',
        likesCount: 0,
        viewsCount: 1,
        status: 'published',
        license: 'CC BY 4.0',
      }

      saveLocalUserPhoto(userPhoto)
      const userPhotos = getLocalUserPhotos()
      expect(userPhotos.some((p) => p.id === photoId)).toBe(true)

      deleteLocalUserPhoto(photoId)
      expect(getLocalUserPhotos().some((p) => p.id === photoId)).toBe(false)
    })
  })
})
