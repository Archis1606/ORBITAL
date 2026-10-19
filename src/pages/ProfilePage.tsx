import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  UserPlus,
  UserCheck,
  Edit3,
  MapPin,
  Globe,
  AtSign,
  Share2,
  X,
  Camera,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ImageOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { useAuth } from '@/context/AuthContext'
import { getCreatorByHandle } from '@/data/creators'
import { getAllAvailablePhotos, getFollowingIds, toggleFollowUser, getStoredCollections } from '@/services/photoService'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { disciplineLabel } from '@/lib/format'
import type { Creator, Photo } from '@/types/models'
import { cn } from '@/lib/cn'


export function ProfilePage() {
  const { handle } = useParams<{ handle: string }>()
  const { user, profile: authProfile, updateProfile } = useAuth()

  // Find creator in static list or dynamically from current auth user
  const initialCreator = useMemo(() => {
    if (!handle) return undefined
    const found = getCreatorByHandle(handle)
    if (found) return found

    // Check if the current logged-in user matches the handle
    if (authProfile && authProfile.handle.toLowerCase() === handle.toLowerCase()) {
      return {
        id: authProfile.id,
        userId: authProfile.user_id,
        displayName: authProfile.display_name,
        handle: authProfile.handle,
        disciplineFocus: authProfile.discipline_focus,
        bio: authProfile.bio,
        location: authProfile.location,
        avatarUrl: authProfile.avatar_url || undefined,
        socialLinks: {
          twitter: authProfile.social_twitter || undefined,
          instagram: authProfile.social_instagram || undefined,
          website: authProfile.social_website || undefined,
        },
        stats: {
          photosCount: 0,
          collectionsCount: 0,
          followersCount: 0,
          likesReceived: 0,
        },
        sample: 'USER' as const,
      }
    }
    return undefined
  }, [handle, authProfile])

  const [creator, setCreator] = useState<Creator | undefined>(initialCreator)
  const [activeTab, setActiveTab] = useState<'photos' | 'collections'>('photos')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(initialCreator?.stats?.followersCount || 0)
  const [isEditing, setIsEditing] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editTwitter, setEditTwitter] = useState('')
  const [editInstagram, setEditInstagram] = useState('')
  const [editWebsite, setEditWebsite] = useState('')

  useEffect(() => {
    setCreator(initialCreator)
    if (initialCreator) {
      setFollowerCount(initialCreator.stats?.followersCount || 0)
      setIsFollowing(getFollowingIds().includes(initialCreator.id))
      setEditName(initialCreator.displayName)
      setEditBio(initialCreator.bio)
      setEditLocation(initialCreator.location)
      setEditAvatar(initialCreator.avatarUrl || '')
      setEditTwitter(initialCreator.socialLinks?.twitter || '')
      setEditInstagram(initialCreator.socialLinks?.instagram || '')
      setEditWebsite(initialCreator.socialLinks?.website || '')
    }
  }, [initialCreator])

  useDocumentTitle(creator ? `${creator.displayName} (@${creator.handle}) — ORBITAL` : 'Photographer Profile — ORBITAL')

  // Retrieve photos attributed to this creator — local catalog + Supabase
  const localPhotos = getAllAvailablePhotos()
  const [authorPhotos, setAuthorPhotos] = useState<Photo[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [photosError, setPhotosError] = useState<string | null>(null)

  useEffect(() => {
    if (!creator) {
      setAuthorPhotos([])
      setPhotosLoading(false)
      return
    }

    let cancelled = false
    setPhotosLoading(true)
    setPhotosError(null)

    async function loadPhotos() {
      // Start with local catalog photos matching this creator
      const local = localPhotos.filter(
        (photo) =>
          photo.creatorId === creator!.id ||
          (creator!.handle && photo.creatorId.toLowerCase() === creator!.handle.toLowerCase()),
      )

      // If Supabase is available and the creator has a real user_id, query for their uploaded photos
      if (isSupabaseConfigured() && creator!.userId) {
        try {
          const { data, error } = await supabase
            .from('photos')
            .select('*')
            .eq('user_id', creator!.userId)
            .eq('status', 'published')
            .order('created_at', { ascending: false })

          if (!cancelled) {
            if (error) {
              // Table may not exist yet — fall back to local data silently
              setAuthorPhotos(local)
            } else if (data && data.length > 0) {
              // Map database rows to Photo model
              type PhotoRow = import('@/types/database').Database['public']['Tables']['photos']['Row']
              const mapped: Photo[] = (data as unknown as PhotoRow[]).map((row) => ({
                id: row.id,
                userId: row.user_id,
                title: row.title,
                discipline: row.discipline,
                caption: row.caption || '',
                categoryTag: row.category_tag || undefined,
                tags: row.tags || [],
                location: row.location_name || '',
                capturedAt: row.captured_at || '',
                camera: row.camera || '',
                optics: row.optics || '',
                exposure: row.exposure || '',
                creatorId: row.user_id,
                unsplashId: '',
                customImageUrl: row.image_url,
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
              }))
              // Merge: put DB photos first, then local-only ones not already in DB
              const dbIds = new Set(mapped.map((p) => p.id))
              const merged = [...mapped, ...local.filter((p) => !dbIds.has(p.id))]
              setAuthorPhotos(merged)
            } else {
              setAuthorPhotos(local)
            }
          }
        } catch {
          if (!cancelled) setAuthorPhotos(local)
        }
      } else {
        if (!cancelled) setAuthorPhotos(local)
      }

      if (!cancelled) setPhotosLoading(false)
    }

    loadPhotos()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator?.id, creator?.userId])

  // Retrieve public collections created by this creator
  const allCollections = getStoredCollections()
  const authorCollections = useMemo(() => {
    if (!creator) return []
    return allCollections.filter(
      (c) =>
        !c.isPrivate &&
        (c.userId === creator.userId || (creator.id === 'creator-nova-ellison' && c.discipline === 'astrophotography')),
    )
  }, [allCollections, creator])

  // Check ownership
  const isOwner = Boolean(
    (user && creator?.userId && user.id === creator.userId) ||
      (authProfile && creator && authProfile.handle.toLowerCase() === creator.handle.toLowerCase()),
  )

  // Toggle follow
  const handleToggleFollow = () => {
    if (!creator) return
    const nowFollowing = toggleFollowUser(creator.id)
    setIsFollowing(nowFollowing)
    setFollowerCount((prev) => (nowFollowing ? prev + 1 : Math.max(0, prev - 1)))
  }

  // Save profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!creator) return

    const updated = {
      ...creator,
      displayName: editName,
      bio: editBio,
      location: editLocation,
      avatarUrl: editAvatar || undefined,
      socialLinks: {
        twitter: editTwitter || undefined,
        instagram: editInstagram || undefined,
        website: editWebsite || undefined,
      },
    }

    setCreator(updated)

    // Save to auth context if logged in
    await updateProfile({
      display_name: editName,
      bio: editBio,
      location: editLocation,
      avatar_url: editAvatar || null,
      social_twitter: editTwitter || null,
      social_instagram: editInstagram || null,
      social_website: editWebsite || null,
    })

    setIsEditing(false)
  }

  if (!creator) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <ErrorState
          title="Photographer profile not located"
          body="No active observatory observer is registered under that handle."
        />
        <div className="mt-6">
          <Link
            to="/archive"
            className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/15 px-5 py-2.5 font-mono text-xs text-cyan hover:border-cyan"
          >
            <span>Return to Discovery Archive</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-12">
      {/* Editorial Profile Header Card */}
      <section className="glass-panel relative overflow-hidden rounded-3xl border border-line bg-navy-deep p-6 md:p-10 shadow-2xl">
        {/* Background ambient lighting */}
        <div
          className={cn(
            'pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full blur-[140px] opacity-25',
            creator.disciplineFocus === 'astrophotography' ? 'bg-violet' : 'bg-mint',
          )}
        />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            {creator.avatarUrl ? (
              <img
                src={creator.avatarUrl}
                alt={creator.displayName}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover border-2 border-line shadow-xl"
              />
            ) : (
              <div
                className={cn(
                  'flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border-2 font-display text-4xl shadow-xl',
                  creator.disciplineFocus === 'astrophotography'
                    ? 'border-violet/40 bg-violet/15 text-violet'
                    : 'border-mint/40 bg-mint/15 text-mint',
                )}
              >
                {creator.displayName[0]}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={creator.disciplineFocus}>
                  {disciplineLabel(creator.disciplineFocus)}
                </Badge>
                <div className="flex items-center gap-1 rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-0.5 font-mono text-[0.65rem] text-cyan">
                  <ShieldCheck size={12} />
                  <span>Verified Observer</span>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl text-ivory font-normal">
                {creator.displayName}
              </h1>
              <p className="font-mono text-sm text-cyan">@{creator.handle}</p>

              {creator.location ? (
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
                  <MapPin size={13} className="text-muted" />
                  <span>{creator.location}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Action buttons (Follow or Edit) */}
          <div className="flex flex-wrap items-center gap-3">
            {isOwner ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs transition-all shadow-md',
                  isFollowing
                    ? 'border border-mint bg-mint/15 text-mint hover:bg-mint/25'
                    : 'border border-cyan bg-cyan text-void font-semibold hover:bg-cyan/90',
                )}
              >
                {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                <span>{isFollowing ? 'Following' : 'Follow Observer'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted font-sans sm:text-base">
          {creator.bio}
        </p>

        {/* Social Links */}
        {creator.socialLinks ? (
          <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-muted border-t border-line/60 pt-4">
            {creator.socialLinks.website ? (
              <a
                href={creator.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-cyan transition-colors"
              >
                <Globe size={13} />
                <span>{creator.socialLinks.website.replace(/^https?:\/\//, '')}</span>
              </a>
            ) : null}
            {creator.socialLinks.twitter ? (
              <a
                href={`https://x.com/${creator.socialLinks.twitter}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-cyan transition-colors"
              >
                <AtSign size={13} />
                <span>@{creator.socialLinks.twitter}</span>
              </a>
            ) : null}
            {creator.socialLinks.instagram ? (
              <a
                href={`https://instagram.com/${creator.socialLinks.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-cyan transition-colors"
              >
                <Share2 size={13} />
                <span>@{creator.socialLinks.instagram}</span>
              </a>
            ) : null}
          </div>
        ) : null}

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line/60 pt-6 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded-2xl border border-line/60 bg-panel/50 p-3">
            <dt className="text-muted text-[0.65rem] uppercase">Catalog Frames</dt>
            <dd className="mt-1 font-display text-2xl text-ivory font-semibold">
              {authorPhotos.length}
            </dd>
          </div>
          <div className="rounded-2xl border border-line/60 bg-panel/50 p-3">
            <dt className="text-muted text-[0.65rem] uppercase">Curated Collections</dt>
            <dd className="mt-1 font-display text-2xl text-ivory font-semibold">
              {authorCollections.length}
            </dd>
          </div>
          <div className="rounded-2xl border border-line/60 bg-panel/50 p-3">
            <dt className="text-muted text-[0.65rem] uppercase">Community Followers</dt>
            <dd className="mt-1 font-display text-2xl text-cyan font-semibold">
              {followerCount}
            </dd>
          </div>
          <div className="rounded-2xl border border-line/60 bg-panel/50 p-3">
            <dt className="text-muted text-[0.65rem] uppercase">Total Appreciations</dt>
            <dd className="mt-1 font-display text-2xl text-ivory font-semibold">
              {creator.stats?.likesReceived || 120}
            </dd>
          </div>
        </div>
      </section>

      {/* Profile Content Navigation Tabs */}
      <section className="space-y-6">
        <div className="flex border-b border-line/60 pb-3 font-mono text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all',
                activeTab === 'photos'
                  ? 'border border-cyan bg-cyan/15 text-cyan font-semibold'
                  : 'text-muted hover:text-ivory',
              )}
            >
              <Camera size={14} />
              <span>Published Photographs ({photosLoading ? '…' : authorPhotos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all',
                activeTab === 'collections'
                  ? 'border border-cyan bg-cyan/15 text-cyan font-semibold'
                  : 'text-muted hover:text-ivory',
              )}
            >
              <FolderOpen size={14} />
              <span>Curated Collections ({authorCollections.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Photographs */}
        {activeTab === 'photos' ? (
          photosLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted font-mono text-xs">
              <Loader2 size={18} className="animate-spin text-cyan" />
              <span>Loading photographs…</span>
            </div>
          ) : photosError ? (
            <div className="glass-panel rounded-3xl border border-danger/30 p-10 text-center space-y-2">
              <ImageOff size={32} className="mx-auto text-muted/50 mb-3" />
              <p className="font-display text-xl text-ivory">Unable to load photographs</p>
              <p className="text-xs font-mono text-muted">{photosError}</p>
            </div>
          ) : (
            <PhotoGrid
              photos={authorPhotos}
              emptyTitle="No photographs yet"
              emptyBody="This photographer has not published any frames to the catalog yet."
            />
          )
        ) : (
          /* Tab 2: Collections */
          <div className="grid gap-6 md:grid-cols-2">
            {authorCollections.length === 0 ? (
              <div className="glass-panel col-span-2 rounded-3xl border border-line p-12 text-center text-muted">
                <FolderOpen size={36} className="mx-auto text-muted/50 mb-3" />
                <p className="font-display text-xl text-ivory">No Collections Curated Yet</p>
                <p className="mt-1 text-xs font-mono">
                  Collections created by this photographer will be indexed here.
                </p>
              </div>
            ) : (
              authorCollections.map((col) => (
                <div
                  key={col.id}
                  className="glass-panel rounded-3xl border border-line p-6 space-y-4 hover:border-cyan/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Badge tone={col.discipline === 'all' ? 'neutral' : col.discipline}>
                      {col.discipline}
                    </Badge>
                    <span className="font-mono text-xs text-muted">
                      {col.photoIds.length} frames
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-ivory">{col.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{col.description}</p>
                  <Link
                    to="/archive"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan hover:underline"
                  >
                    <span>Browse collection in archive</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Edit Profile Modal for Owner */}
      {isEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 p-4 backdrop-blur-md">
          <form
            onSubmit={handleSaveProfile}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-navy p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="font-display text-xl text-ivory">Edit Observer Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-line p-1 text-muted hover:text-ivory"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                required
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ivory focus:border-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Biography & Equipment Specialties
              </label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ivory focus:border-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Primary Observation Location / Site
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g. Atacama Plateau / London Heathrow"
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ivory focus:border-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ivory focus:border-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[0.68rem] text-muted uppercase tracking-wider mb-1">
                  Twitter / X Handle
                </label>
                <input
                  type="text"
                  value={editTwitter}
                  onChange={(e) => setEditTwitter(e.target.value)}
                  placeholder="handle"
                  className="w-full rounded-xl border border-line bg-panel px-3 py-1.5 text-xs text-ivory focus:border-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[0.68rem] text-muted uppercase tracking-wider mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={editInstagram}
                  onChange={(e) => setEditInstagram(e.target.value)}
                  placeholder="handle"
                  className="w-full rounded-xl border border-line bg-panel px-3 py-1.5 text-xs text-ivory focus:border-cyan focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-line/60">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Profile Changes</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
