import { Outlet, useLocation } from 'react-router-dom'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SkipLink } from '@/components/layout/SkipLink'
import { GridBackdrop } from '@/components/motion/GridBackdrop'
import { IntroSequence } from '@/components/motion/IntroSequence'
import { Starfield } from '@/components/motion/Starfield'
import { useEffect } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function AppShell() {
  const reducedMotion = usePrefersReducedMotion()
  const { pathname } = useLocation()

  useEffect(() => {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal').forEach((element) => {
        element.classList.remove('scroll-reveal')
        element.classList.remove('scroll-reveal-visible')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    let revealIndex = 0
    const observedElements = new Set<HTMLElement>()
    const observeElement = (element: HTMLElement) => {
      if (element.classList.contains('scroll-reveal')) return
      element.classList.add('scroll-reveal')
      observedElements.add(element)
      element.style.setProperty('--reveal-delay', `${Math.min(revealIndex++ % 4, 3) * 70}ms`)
      observer.observe(element)
    }
    const revealWithin = (node: ParentNode) => {
      if (node instanceof HTMLElement && node.matches('section, article, [data-scroll-reveal]')) {
        observeElement(node)
      }
      node.querySelectorAll<HTMLElement>('section, article, [data-scroll-reveal]').forEach(observeElement)
    }

    const main = document.getElementById('main-content')
    if (!main) return () => observer.disconnect()
    revealWithin(main)
    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) revealWithin(node)
        })
      }
    })
    mutationObserver.observe(main, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
      observedElements.forEach((element) => {
        element.classList.remove('scroll-reveal', 'scroll-reveal-visible')
        element.style.removeProperty('--reveal-delay')
      })
    }
  }, [pathname, reducedMotion])

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
