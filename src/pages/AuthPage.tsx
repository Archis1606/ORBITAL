import { type FormEvent, useState } from 'react'
import { BackendNotice } from '@/components/ui/BackendNotice'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type Mode = 'sign-in' | 'sign-up'

export function AuthPage() {
  useDocumentTitle('Sign in — ORBITAL')
  const [mode, setMode] = useState<Mode>('sign-in')
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('Credentials were not sent. Supabase Auth is not configured in this milestone.')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">Access</p>
      <h1 className="mt-3 font-display text-4xl">{mode === 'sign-in' ? 'Sign in' : 'Create an observatory profile'}</h1>
      <p className="mt-3 text-muted">
        The form is interactive for layout and validation, but it does not authenticate anyone yet.
      </p>

      <div className="mt-6 flex gap-2">
        <Button variant={mode === 'sign-in' ? 'primary' : 'ghost'} onClick={() => setMode('sign-in')}>
          Sign in
        </Button>
        <Button variant={mode === 'sign-up' ? 'primary' : 'ghost'} onClick={() => setMode('sign-up')}>
          Sign up
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === 'sign-up' ? (
          <label className="block text-sm">
            Display name
            <input required name="name" className="mt-2 w-full rounded-2xl border border-line bg-navy px-4 py-3" />
          </label>
        ) : null}
        <label className="block text-sm">
          Email
          <input required type="email" name="email" className="mt-2 w-full rounded-2xl border border-line bg-navy px-4 py-3" />
        </label>
        <label className="block text-sm">
          Password
          <input
            required
            minLength={8}
            type="password"
            name="password"
            className="mt-2 w-full rounded-2xl border border-line bg-navy px-4 py-3"
          />
        </label>
        <Button type="submit">{mode === 'sign-in' ? 'Submit sign-in' : 'Submit sign-up'}</Button>
      </form>

      {message ? (
        <p role="status" className="mt-4 text-sm text-cyan">
          {message}
        </p>
      ) : null}

      <div className="mt-8">
        <BackendNotice />
      </div>
    </div>
  )
}
