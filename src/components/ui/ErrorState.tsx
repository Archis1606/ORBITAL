type ErrorStateProps = {
  title: string
  body: string
}

export function ErrorState({ title, body }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-3xl border border-danger/40 bg-danger/10 px-6 py-10">
      <p className="font-mono text-xs tracking-[0.2em] text-danger uppercase">Error</p>
      <h2 className="mt-3 font-display text-2xl text-ivory">{title}</h2>
      <p className="mt-3 max-w-xl text-muted">{body}</p>
    </div>
  )
}
