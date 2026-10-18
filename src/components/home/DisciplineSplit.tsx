import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Telescope, Plane, ArrowUpRight, Radio, Compass } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

export function DisciplineSplit() {
  const [activeSide, setActiveSide] = useState<'astro' | 'aviation' | null>(null)

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-cyan uppercase">Corridor Select</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl text-ivory">Dual Observational Disciplines</h2>
        </div>
        <p className="font-mono text-xs text-muted">
          SWITCH PROTOCOL: COSMOS [VIOLET] · AERONAUTICS [MINT]
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Astrophotography Corridor */}
        <Link
          to="/astrophotography"
          onMouseEnter={() => setActiveSide('astro')}
          onMouseLeave={() => setActiveSide(null)}
          className="group relative overflow-hidden rounded-3xl border border-violet/30 bg-navy-deep p-8 transition-all duration-500 hover:border-violet hover:shadow-[0_0_35px_rgba(155,140,255,0.22)] min-h-[22rem] flex flex-col justify-between"
        >
          {/* Background image preview */}
          <div className="absolute inset-0 opacity-25 transition-all duration-700 group-hover:scale-105 group-hover:opacity-40">
            <OptimizedImage
              unsplashId="photo-1462331940025-496dfbfc7564"
              alt="Deep space nebula preview"
              width={800}
              height={600}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-void via-void/70 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/40 bg-violet/10 px-3 py-1 font-mono text-[0.68rem] text-violet uppercase tracking-widest backdrop-blur-md">
                <Telescope size={12} />
                <span>Discipline 01 · Cosmos</span>
              </span>
              <div className="rounded-full border border-violet/30 bg-void/60 p-2 text-violet transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight size={18} />
              </div>
            </div>

            <h3 className="mt-8 font-display text-4xl text-ivory group-hover:text-violet transition-colors">
              Astrophotography
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Deep-sky nebulae, long-exposure star trails, lunar reliefs, and cosmic spectroscopy gathered across quiet nights.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-line/60 flex items-center justify-between font-mono text-xs text-muted">
            <div className="flex items-center gap-2 text-violet">
              <Radio size={13} className="animate-pulse" />
              <span>STATION: DIGITAL OBSERVATORY</span>
            </div>
            <span className="text-violet group-hover:underline">Enter Observatory →</span>
          </div>
        </Link>

        {/* Aviation Corridor */}
        <Link
          to="/aviation"
          onMouseEnter={() => setActiveSide('aviation')}
          onMouseLeave={() => setActiveSide(null)}
          className="group relative overflow-hidden rounded-3xl border border-mint/30 bg-navy-deep p-8 transition-all duration-500 hover:border-mint hover:shadow-[0_0_35px_rgba(143,217,196,0.22)] min-h-[22rem] flex flex-col justify-between"
        >
          {/* Background image preview */}
          <div className="absolute inset-0 opacity-25 transition-all duration-700 group-hover:scale-105 group-hover:opacity-40">
            <OptimizedImage
              unsplashId="photo-1540962351504-03099e0a754b"
              alt="Aviation flight deck preview"
              width={800}
              height={600}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-void via-void/70 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 font-mono text-[0.68rem] text-mint uppercase tracking-widest backdrop-blur-md">
                <Plane size={12} />
                <span>Discipline 02 · Flight Deck</span>
              </span>
              <div className="rounded-full border border-mint/30 bg-void/60 p-2 text-mint transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight size={18} />
              </div>
            </div>

            <h3 className="mt-8 font-display text-4xl text-ivory group-hover:text-mint transition-colors">
              Aviation
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Ramp illumination, transonic airframes, glass cockpit telemetry, and airport threshold choreography.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-line/60 flex items-center justify-between font-mono text-xs text-muted">
            <div className="flex items-center gap-2 text-mint">
              <Compass size={13} className="animate-spin duration-3000" />
              <span>STATION: FLIGHT OPERATIONS</span>
            </div>
            <span className="text-mint group-hover:underline">Enter Flight Deck →</span>
          </div>
        </Link>
      </div>

      {/* Corridor Transition Indicator */}
      <div className="mt-4 flex items-center justify-center font-mono text-[0.65rem] text-muted">
        <span className="tracking-widest">
          {activeSide === 'astro'
            ? 'CURRENT FOCUS: NARROWBAND OBSERVATORY [RA/DEC SYNCHRONIZED]'
            : activeSide === 'aviation'
              ? 'CURRENT FOCUS: FLIGHT OPERATIONS COMMAND [GREAT CIRCLE ACTIVE]'
              : 'HOVER OR SELECT A CORRIDOR TO ENGAGE SPECIALIZED TELEMETRY'}
        </span>
      </div>
    </section>
  )
}
