type EmptyStateProps = {
  title: string
  body: string
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="glass-panel rounded-3xl px-6 py-12 text-center">
      <p className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">Empty</p>
      <h2 className="mt-3 font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
    </div>
  )
}
