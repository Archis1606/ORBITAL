import { Outlet } from 'react-router-dom'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SkipLink } from '@/components/layout/SkipLink'
import { GridBackdrop } from '@/components/motion/GridBackdrop'
import { IntroSequence } from '@/components/motion/IntroSequence'
import { Starfield } from '@/components/motion/Starfield'

export function AppShell() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-void text-ivory">
      <SkipLink />
      <IntroSequence />
      <Starfield />
      <GridBackdrop />
      <ScrollProgress />
      <SiteHeader />
      <main id="main-content" className="relative z-10">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
