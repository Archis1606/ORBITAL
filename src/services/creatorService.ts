import { creators as sampleCreators } from '@/data/creators'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { Creator } from '@/types/models'
import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

function mapProfile(profile: ProfileRow): Creator {
  return {
    id: profile.id,
    userId: profile.user_id,
    displayName: profile.display_name,
    handle: profile.handle,
    disciplineFocus: profile.discipline_focus,
    bio: profile.bio,
    location: profile.location,
    avatarUrl: profile.avatar_url || undefined,
    socialLinks: {
      twitter: profile.social_twitter || undefined,
      instagram: profile.social_instagram || undefined,
      website: profile.social_website || undefined,
    },
    stats: {
      photosCount: 0,
      collectionsCount: 0,
      followersCount: 0,
      likesReceived: 0,
    },
    sample: 'USER',
  }
}

export async function findCreatorByHandle(handle: string): Promise<Creator | undefined> {
  if (!isSupabaseConfigured()) return undefined

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('handle', handle)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapProfile(data) : undefined
}

export async function findCreatorByUserId(userId: string): Promise<Creator | undefined> {
  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(userId)) return undefined

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapProfile(data) : undefined
}

export async function searchCreators(query: string): Promise<Creator[]> {
  const term = query.trim()
  if (term.length < 2) return []

  const localMatches = sampleCreators.filter((creator) =>
    `${creator.displayName} ${creator.handle}`.toLowerCase().includes(term.toLowerCase()),
  )

  if (!isSupabaseConfigured()) return localMatches.slice(0, 6)

  const pattern = `%${term}%`
  const [byHandle, byName] = await Promise.all([
    supabase.from('profiles').select('*').ilike('handle', pattern).limit(6),
    supabase.from('profiles').select('*').ilike('display_name', pattern).limit(6),
  ])

  if (byHandle.error) throw new Error(byHandle.error.message)
  if (byName.error) throw new Error(byName.error.message)

  const liveMatches = [...(byHandle.data ?? []), ...(byName.data ?? [])].map(mapProfile)
  const results = new Map(liveMatches.map((creator) => [creator.handle.toLowerCase(), creator]))
  for (const creator of localMatches) {
    if (!results.has(creator.handle.toLowerCase())) results.set(creator.handle.toLowerCase(), creator)
  }
  return [...results.values()].slice(0, 6)
}

export async function getCreatorFollowState(
  followingId: string,
  followerId?: string,
): Promise<{ following: boolean; followers: number }> {
  if (!isSupabaseConfigured()) return { following: false, followers: 0 }

  const countQuery = supabase
    .from('follows')
    .select('follower_id', { count: 'exact', head: true })
    .eq('following_id', followingId)
  const followingQuery = followerId
    ? supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', followingId)
        .eq('follower_id', followerId)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null })

  const [countResult, followingResult] = await Promise.all([countQuery, followingQuery])
  if (countResult.error) throw new Error(countResult.error.message)
  if (followingResult.error) throw new Error(followingResult.error.message)

  return {
    following: Boolean(followingResult.data),
    followers: countResult.count ?? 0,
  }
}

export async function toggleCreatorFollow(followerId: string, followingId: string, following: boolean) {
  const result = following
    ? await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
    : await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId } as unknown as never)

  if (result.error) throw new Error(result.error.message)
  return !following
}
