import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { gsap, registerGsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Sparkles, ArrowRight } from 'lucide-react'

export function ClipPathFeature() {
  const containerRef = useRef<HTMLElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const imageInnerRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !containerRef.current || !maskRef.current) return
    registerGsap()

    const context = gsap.context(() => {
      // Animate clip-path from inset aperture to full widescreen reveal
      gsap.fromTo(
        maskRef.current,
        {
          clipPath: 'polygon(15% 10%, 85% 10%, 85% 90%, 15% 90%)',
          borderRadius: '48px',
        },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          borderRadius: '24px',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
        },
      )

      // Parallax on inner image
      if (imageInnerRef.current) {
        gsap.fromTo(
          imageInnerRef.current,
          { scale: 1.25, yPercent: -8 },
          {
            scale: 1.02,
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }

      // Staggered text reveal
      if (copyRef.current) {
        gsap.fromTo(
          copyRef.current.querySelectorAll('[data-reveal]'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: copyRef.current,
              start: 'top 85%',
            },
          },
        )
      }
    }, containerRef)

    return () => context.revert()
  }, [reduced])

  return (
    <section ref={containerRef} className="relative mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Dynamic Clip-path Image Frame */}
        <div className="relative overflow-hidden rounded-3xl border border-line bg-navy-deep shadow-2xl">
          <div
            ref={maskRef}
            className="relative aspect-[16/10] w-full overflow-hidden transition-all duration-300"
            style={{
              clipPath: reduced ? 'none' : 'polygon(8% 6%, 92% 6%, 92% 94%, 8% 94%)',
            }}
          >
            <div ref={imageInnerRef} className="h-full w-full">
              <OptimizedImage
                unsplashId="photo-1462331940025-496dfbfc7564"
                alt="High-resolution deep sky nebula integration with rich chromatic dust clouds"
                width={1600}
                height={1000}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Cinematic Gradient Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-void/80 via-transparent to-void/30" />

            {/* Inset Camera Reticle Telemetry */}
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-void/60 px-3 py-1 font-mono text-[0.65rem] text-cyan backdrop-blur-md">
              <Sparkles size={12} />
              <span>APERTURE EXPANSION · 3.5m INTEGRATION</span>
            </div>

            <div className="absolute bottom-4 right-4 rounded-xl border border-white/10 bg-void/70 px-3 py-1.5 font-mono text-[0.65rem] text-ivory/80 backdrop-blur-md">
              <span>FOV: 3.2° × 2.1° · DUAL-NARROWBAND</span>
            </div>
          </div>
        </div>

        {/* Editorial Text Reveal */}
        <div ref={copyRef} className="space-y-6">
          <p data-reveal className="font-mono text-xs tracking-[0.3em] text-cyan uppercase">
            Curatorial Method · Optical Aperture
          </p>

          <h2 data-reveal className="font-display text-4xl leading-[1.05] font-normal text-ivory md:text-5xl">
            Where deep time meets split-second precision.
          </h2>

          <p data-reveal className="text-base leading-relaxed text-muted">
            Astrophotography collects ancient photons gathered across hours of quiet sensor chilling. Aviation
            photography freezes 400-ton aircraft carving turbulent air at transonic speeds.
          </p>

          <p data-reveal className="text-base leading-relaxed text-muted">
            ORBITAL brings these two rigorous observational crafts into dialogue under a single technical editorial
            standard.
          </p>

          <div data-reveal className="pt-2">
            <Link
              to="/archive"
              className="group inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-5 py-2.5 font-mono text-xs text-cyan transition-all hover:border-cyan hover:bg-cyan/20"
            >
              <span>Explore curated archive frames</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
