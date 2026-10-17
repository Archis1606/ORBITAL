import { cn } from '@/lib/cn'
import type { Discipline } from '@/types/models'

type BadgeProps = {
  children: string
  tone?: Discipline | 'neutral' | 'sample'
  className?: string
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  astrophotography: 'border-violet/40 text-violet',
  aviation: 'border-mint/40 text-mint',
  neutral: 'border-line text-muted',
  sample: 'border-cyan/35 text-cyan',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-[0.18em] uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
