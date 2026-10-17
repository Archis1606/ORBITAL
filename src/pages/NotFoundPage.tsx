import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Lost signal — ORBITAL')

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-cyan uppercase">404</p>
      <h1 className="mt-4 font-display text-5xl">Lost signal</h1>
      <p className="mt-4 text-muted">That route is not part of the observatory map.</p>
      <div className="mt-8 flex justify-center">
        <Button to="/">Return home</Button>
      </div>
    </div>
  )
}
