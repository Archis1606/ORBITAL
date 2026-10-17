import { Button } from '@/components/ui/Button'

export function ManifestoSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <div className="glass-panel rounded-3xl px-6 py-12 md:px-12">
        <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">Editorial charter</p>
        <blockquote className="mt-6 max-w-3xl font-display text-3xl leading-tight md:text-5xl">
          Photograph the night as if it were architecture. Photograph flight as if it were choreography.
        </blockquote>
        <p className="mt-6 max-w-2xl text-muted">
          ORBITAL is built as a real product shell: routing, typed catalog data, local favorites, and honest empty
          states where Supabase will later attach.
        </p>
        <div className="mt-8">
          <Button to="/archive" variant="ghost">
            Browse the archive
          </Button>
        </div>
      </div>
    </section>
  )
}
