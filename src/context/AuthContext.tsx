import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export type UserProfile = {
  id: string
  user_id: string
  display_name: string
  handle: string
  discipline_focus: 'astrophotography' | 'aviation'
  bio: string
  location: string
  avatar_url?: string | null
  social_twitter?: string | null
  social_instagram?: string | null
  social_website?: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string; message?: string }>
  signOut: () => Promise<{ error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_USER_STORAGE = 'orbital.mock.user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const isConfigured = isSupabaseConfigured()

  const fetchProfile = async (userId: string) => {
    if (!isConfigured) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data as UserProfile)
      }
    } catch {
      // Ignore network errors on profile fetch
    }
  }

  useEffect(() => {
    if (!isConfigured) {
      // In offline/mock mode, check if a mock user was logged in
      const savedMock = localStorage.getItem(LOCAL_USER_STORAGE)
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock)
          setUser(parsed.user)
          setProfile(parsed.profile)
        } catch {
          localStorage.removeItem(LOCAL_USER_STORAGE)
        }
      }
      setLoading(false)
      return
    }

    // Live Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isConfigured])

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      // Fallback demo authentication for offline evaluation
      const mockId = 'user-mock-' + Math.random().toString(36).substring(2, 9)
      const mockUser = {
        id: mockId,
        email,
        app_metadata: {},
        user_metadata: { display_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User

      const mockProfile: UserProfile = {
        id: 'prof-' + mockId,
        user_id: mockId,
        display_name: email.split('@')[0],
        handle: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
        discipline_focus: 'astrophotography',
        bio: 'Astrophotographer & optical observer.',
        location: 'Earth Orbit Station / Offline Mode',
      }

      setUser(mockUser)
      setProfile(mockProfile)
      localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify({ user: mockUser, profile: mockProfile }))
      return {}
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return {}
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Unable to connect to authentication service.' }
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isConfigured) {
      const mockId = 'user-mock-' + Math.random().toString(36).substring(2, 9)
      const mockUser = {
        id: mockId,
        email,
        app_metadata: {},
        user_metadata: { display_name: displayName },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User

      const mockProfile: UserProfile = {
        id: 'prof-' + mockId,
        user_id: mockId,
        display_name: displayName,
        handle: displayName.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        discipline_focus: 'astrophotography',
        bio: 'Astrophotographer & light collector.',
        location: 'Dark Sky Reserve',
      }

      setUser(mockUser)
      setProfile(mockProfile)
      localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify({ user: mockUser, profile: mockProfile }))
      return { message: 'Demo account registered in local preview mode.' }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      })
      if (error) return { error: error.message }
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }
      return { message: 'Check your email for the confirmation link.' }
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Registration failed.' }
    }
  }

  const signOut = async () => {
    if (isConfigured) {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) return { error: error.message }
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Unable to sign out.' }
      }
    }
    localStorage.removeItem(LOCAL_USER_STORAGE)
    setUser(null)
    setSession(null)
    setProfile(null)
    return {}
  }

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { message: 'Password reset simulated in local mode. Reset link would be dispatched in production.' }
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      })
      if (error) return { error: error.message }
      return { message: 'Password reset link sent to your email.' }
    } catch (err: unknown) {
      return { error: (err as Error).message }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' }
    if (!isConfigured) {
      if (profile) {
        const next = { ...profile, ...updates }
        setProfile(next)
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify({ user, profile: next }))
      }
      return {}
    }

    try {
      type ProfileUpdate = import('@/types/database').Database['public']['Tables']['profiles']['Update']
      const payload: ProfileUpdate = {
        ...(updates as unknown as ProfileUpdate),
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('profiles')
        .update(payload as unknown as never)
        .eq('user_id', user.id)

      if (error) return { error: error.message }
      await fetchProfile(user.id)
      return {}
    } catch (err: unknown) {
      return { error: (err as Error).message }
    }
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
