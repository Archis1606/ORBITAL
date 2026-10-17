type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Calibrating instruments' }: LoadingStateProps) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="h-10 w-10 rounded-full border border-cyan/30 border-t-cyan motion-safe:animate-spin" />
      <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">{label}</p>
    </div>
  )
}
