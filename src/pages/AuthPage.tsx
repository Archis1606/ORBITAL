import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackendNotice } from '@/components/ui/BackendNotice'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { LogOut, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Mode = 'sign-in' | 'sign-up' | 'reset'

export function AuthPage() {
  useDocumentTitle('Observatory Access — ORBITAL')
  const { user, profile, signIn, signUp, signOut, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    if (mode === 'sign-in') {
      const res = await signIn(email, password)
      setLoading(false)
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        navigate('/studio')
      }
    } else if (mode === 'sign-up') {
      const res = await signUp(email, password, displayName || email.split('@')[0])
      setLoading(false)
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(res.message || 'Account created successfully! Check your inbox.')
      }
    } else if (mode === 'reset') {
      const res = await resetPassword(email)
      setLoading(false)
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(res.message || 'Password reset link sent to your email.')
      }
    }
  }

  // If already authenticated, show account panel
  if (user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="glass-panel rounded-3xl border border-line p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-line/60 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan/15 text-cyan border border-cyan/40 font-mono text-lg">
              {profile?.display_name ? profile.display_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="font-display text-2xl text-ivory">Observatory Active</h1>
              <p className="font-mono text-xs text-muted">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between border-b border-line/40 py-1.5">
              <span className="text-muted">Display Name</span>
              <span className="text-ivory font-medium">{profile?.display_name || 'Observer'}</span>
            </div>
            <div className="flex justify-between border-b border-line/40 py-1.5">
              <span className="text-muted">Handle</span>
              <span className="text-cyan">@{profile?.handle || 'observer'}</span>
            </div>
            <div className="flex justify-between border-b border-line/40 py-1.5">
              <span className="text-muted">Discipline Focus</span>
              <span className="text-ivory uppercase">{profile?.discipline_focus || 'astrophotography'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button to="/studio">Enter Creator Studio</Button>
            {profile?.handle ? (
              <Button to={`/creators/${profile.handle}`} variant="line">
                View Public Profile
              </Button>
            ) : null}
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-danger/40 py-2.5 font-mono text-xs text-danger hover:border-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out of Observatory</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <BackendNotice />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">Authentication</p>
      <h1 className="mt-2 font-display text-4xl text-ivory">
        {mode === 'sign-in'
          ? 'Sign in to ORBITAL'
          : mode === 'sign-up'
            ? 'Create Observer Profile'
            : 'Reset Password'}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {mode === 'sign-in'
          ? 'Access your published photographs, private collections, and upload studio.'
          : mode === 'sign-up'
            ? 'Join our community of astrophotographers and aviation spotters.'
            : 'Enter your email to receive a secure recovery link.'}
      </p>

      {/* Mode Switcher Tabs */}
      <div className="mt-6 flex rounded-full border border-line bg-navy/60 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('sign-in')
            setErrorMsg(null)
            setSuccessMsg(null)
          }}
          className={cn(
            'flex-1 rounded-full py-1.5 text-xs font-mono transition-all',
            mode === 'sign-in' ? 'bg-cyan text-void font-semibold' : 'text-muted hover:text-ivory',
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('sign-up')
            setErrorMsg(null)
            setSuccessMsg(null)
          }}
          className={cn(
            'flex-1 rounded-full py-1.5 text-xs font-mono transition-all',
            mode === 'sign-up' ? 'bg-cyan text-void font-semibold' : 'text-muted hover:text-ivory',
          )}
        >
          Create Profile
        </button>
      </div>

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="glass-panel mt-6 rounded-3xl border border-line p-6 space-y-4">
        {mode === 'sign-up' ? (
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <input
                required
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Dr. Soren Vance"
                className="w-full rounded-2xl border border-line bg-navy px-4 py-2.5 text-sm font-sans text-ivory placeholder:text-muted/50 focus:border-cyan focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        <div>
          <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="observer@orbital.gallery"
            className="w-full rounded-2xl border border-line bg-navy px-4 py-2.5 text-sm font-sans text-ivory placeholder:text-muted/50 focus:border-cyan focus:outline-none"
          />
        </div>

        {mode !== 'reset' ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-mono text-xs text-muted uppercase tracking-wider">
                Password
              </label>
              {mode === 'sign-in' ? (
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="font-mono text-[0.65rem] text-cyan hover:underline"
                >
                  Forgot password?
                </button>
              ) : null}
            </div>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-line bg-navy px-4 py-2.5 text-sm font-sans text-ivory placeholder:text-muted/50 focus:border-cyan focus:outline-none"
            />
          </div>
        ) : null}

        {errorMsg ? (
          <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 font-mono text-xs text-danger">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {successMsg ? (
          <div className="flex items-center gap-2 rounded-xl border border-mint/30 bg-mint/10 p-3 font-mono text-xs text-mint">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading
            ? 'Processing...'
            : mode === 'sign-in'
              ? 'Authorize Session'
              : mode === 'sign-up'
                ? 'Register Profile'
                : 'Send Password Reset'}
        </Button>

        {mode === 'reset' ? (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode('sign-in')}
              className="font-mono text-xs text-muted hover:text-cyan"
            >
              ← Back to Sign In
            </button>
          </div>
        ) : null}
      </form>

      <div className="mt-8">
        <BackendNotice />
      </div>
    </div>
  )
}
