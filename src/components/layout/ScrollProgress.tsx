import { useScrollProgress } from '@/hooks/useScrollProgress'

export function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div
      className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-[2px] bg-white/5"
      role="progressbar"
      aria-label="Scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div
        className="h-full origin-left bg-linear-to-r from-violet via-cyan to-mint"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
