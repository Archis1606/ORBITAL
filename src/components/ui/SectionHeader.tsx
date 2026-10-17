import { Badge } from '@/components/ui/Badge'

type SectionHeaderProps = {
  kicker: string
  title: string
  description?: string
  as?: 'h1' | 'h2'
}

export function SectionHeader({ kicker, title, description, as = 'h2' }: SectionHeaderProps) {
  const Heading = as
  return (
    <header className="mb-10 max-w-3xl">
      <Badge tone="sample">{kicker}</Badge>
      <Heading className="mt-4 font-display text-3xl font-semibold tracking-tight text-ivory md:text-5xl">{title}</Heading>
      {description ? <p className="mt-4 max-w-2xl text-muted">{description}</p> : null}
    </header>
  )
}
