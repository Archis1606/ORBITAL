import { useLayoutEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, registerGsap } from '@/lib/gsap'

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !rootRef.current) return
    registerGsap()
    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-copy]',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08 },
      )
      gsap.to('[data-hero-image]', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, rootRef)
    return () => context.revert()
  }, [reduced])

  return (
    <section ref={rootRef} className="relative min-h-[calc(100dvh-var(--header-h))] overflow-hidden">
      <div data-hero-image className="absolute inset-0">
        <OptimizedImage
          unsplashId="photo-1419242902214-272b3f66ee7a"
          alt="Night sky used as the ORBITAL hero field"
          width={2000}
          height={1333}
          sizes="100vw"
          priority
          className="h-full w-full scale-110 object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-void/30 via-void/55 to-void" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-var(--header-h))] max-w-7xl flex-col justify-end px-4 pb-16 md:px-8 md:pb-24">
        <p data-hero-copy className="font-mono text-xs tracking-[0.35em] text-cyan uppercase">
          Observatory · flight deck · publication
        </p>
        <h1
          data-hero-copy
          className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] font-semibold tracking-tight md:text-7xl lg:text-8xl"
        >
          Light, altitude, and the long exposure.
        </h1>
        <p data-hero-copy className="mt-6 max-w-xl text-lg text-ivory/80">
          ORBITAL is a cinematic home for astrophotography and aviation photography. The frames below are labeled sample
          data from the local catalog.
        </p>
        <div data-hero-copy className="mt-8 flex flex-wrap gap-3">
          <Button to="/astrophotography">Enter astronomy</Button>
          <Button to="/aviation" variant="line">
            Enter aviation
          </Button>
        </div>
      </div>
    </section>
  )
}
