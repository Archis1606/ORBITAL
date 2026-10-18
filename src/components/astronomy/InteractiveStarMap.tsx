import { useState, useRef, useEffect } from 'react'
import { Telescope, ArrowRight, Info } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Link } from 'react-router-dom'

interface CelestialTarget {
  id: string
  name: string
  catalog: string
  constellation: string
  type: string
  distance: string
  apparentMag: string
  x: number // 0 - 100 percentage in map
  y: number // 0 - 100 percentage in map
  photoTag: string
  description: string
}

const CELESTIAL_TARGETS: CelestialTarget[] = [
  {
    id: 'target-andromeda',
    name: 'Andromeda Galaxy',
    catalog: 'Messier 31 (NGC 224)',
    constellation: 'Andromeda',
    type: 'Barred Spiral Galaxy',
    distance: '2.537 Million Light Years',
    apparentMag: '3.44',
    x: 28,
    y: 35,
    photoTag: 'Galaxies',
    description: 'The nearest major spiral galaxy to the Milky Way, spanning 220,000 light-years with rich dust lanes.',
  },
  {
    id: 'target-veil',
    name: 'Western Veil Nebula',
    catalog: 'NGC 6960 (Caldwell 34)',
    constellation: 'Cygnus',
    type: 'Supernova Remnant',
    distance: '2,400 Light Years',
    apparentMag: '7.0',
    x: 65,
    y: 28,
    photoTag: 'Nebulae',
    description: 'Ionized atomic gas filament ribbons created by a massive supernova explosion ~10,000 years ago.',
  },
  {
    id: 'target-milky-way',
    name: 'Galactic Center Core',
    catalog: 'Sagittarius A*',
    constellation: 'Sagittarius',
    type: 'Galactic Bulge & Supermassive Core',
    distance: '26,670 Light Years',
    apparentMag: 'N/A (Obscured by dust)',
    x: 52,
    y: 72,
    photoTag: 'Milky Way',
    description: 'Dense stellar core surrounded by dark absorption clouds, molecular gas rings, and ionized emission nebulae.',
  },
  {
    id: 'target-tycho',
    name: 'Lunar Crater Tycho',
    catalog: 'Moon (Highlands)',
    constellation: 'Ecliptic Path',
    type: 'Impact Crater (85km Dia.)',
    distance: '384,400 km',
    apparentMag: '-12.74 (Full)',
    x: 82,
    y: 62,
    photoTag: 'Moon',
    description: 'Prominent lunar impact crater with a 1,500km ray system visible across the southern highlands.',
  },
  {
    id: 'target-solar-corona',
    name: 'Solar Magnetic Corona',
    catalog: 'Sol Atmosphere',
    constellation: 'Solar System',
    type: 'Stellar Corona & Prominences',
    distance: '149.6 Million km (1 AU)',
    apparentMag: '-26.74',
    x: 18,
    y: 76,
    photoTag: 'Solar and lunar eclipses',
    description: 'Ultra-heated million-degree plasma streamers shaped by the Sun dynamic magnetic dipole field.',
  },
]

// Constellation connection lines (schematic)
const CONSTELLATIONS = [
  // Cygnus (Northern Cross)
  { from: { x: 65, y: 28 }, to: { x: 74, y: 22 } },
  { from: { x: 65, y: 28 }, to: { x: 58, y: 34 } },
  { from: { x: 65, y: 28 }, to: { x: 68, y: 38 } },
  // Cassiopeia to Andromeda
  { from: { x: 28, y: 35 }, to: { x: 38, y: 22 } },
  { from: { x: 38, y: 22 }, to: { x: 44, y: 16 } },
  // Sagittarius teapot lines
  { from: { x: 52, y: 72 }, to: { x: 46, y: 80 } },
  { from: { x: 52, y: 72 }, to: { x: 60, y: 78 } },
]

export function InteractiveStarMap({ onSelectTag }: { onSelectTag?: (tag: string) => void }) {
  const [selectedTarget, setSelectedTarget] = useState<CelestialTarget>(CELESTIAL_TARGETS[0])
  const [hoveredTarget, setHoveredTarget] = useState<CelestialTarget | null>(null)
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Subtle background starfield rotation on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let angle = 0
    const w = (canvas.width = 800)
    const h = (canvas.height = 500)

    // Generate static stars
    const backgroundStars = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }))

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      // Draw faint equatorial and declination grid lines
      ctx.strokeStyle = 'rgba(155, 140, 255, 0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 6])

      // Concentric celestial circles
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2)
      ctx.arc(w / 2, h / 2, 220, 0, Math.PI * 2)
      ctx.stroke()

      // Crosshairs
      ctx.beginPath()
      ctx.moveTo(w / 2, 0)
      ctx.lineTo(w / 2, h)
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()

      // Stars
      for (const s of backgroundStars) {
        ctx.fillStyle = `rgba(232, 238, 248, ${s.alpha})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      angle += 0.0005
      raf = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl border border-violet/30 bg-navy-deep p-6 md:p-8">
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet animate-pulse" />
            <p className="font-mono text-xs tracking-widest text-violet uppercase">
              Observatory Star Map · Celestial Projection
            </p>
          </div>
          <h2 className="mt-1 font-display text-2xl text-ivory">
            Interactive Deep-Sky Target Map
          </h2>
        </div>

        <div className="rounded-full border border-violet/30 bg-violet/10 px-3 py-1 font-mono text-[0.65rem] text-violet uppercase tracking-wider flex items-center gap-1.5">
          <Info size={12} />
          <span>Schematic Celestial Sphere · Epoch J2000</span>
        </div>
      </div>

      {/* Main Grid: Star Map Viewport + Active Target Sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Interactive Map Canvas Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-void/90 select-none">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

          {/* SVG Constellation lines */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            {CONSTELLATIONS.map((c, i) => (
              <line
                key={i}
                x1={`${c.from.x}%`}
                y1={`${c.from.y}%`}
                x2={`${c.to.x}%`}
                y2={`${c.to.y}%`}
                stroke="rgba(155, 140, 255, 0.25)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            ))}
          </svg>

          {/* Target Nodes */}
          {CELESTIAL_TARGETS.map((target) => {
            const isSelected = selectedTarget.id === target.id
            const isHovered = hoveredTarget?.id === target.id

            return (
              <button
                key={target.id}
                type="button"
                onClick={() => {
                  setSelectedTarget(target)
                  if (onSelectTag) onSelectTag(target.photoTag)
                }}
                onMouseEnter={() => setHoveredTarget(target)}
                onMouseLeave={() => setHoveredTarget(null)}
                style={{ left: `${target.x}%`, top: `${target.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
                aria-label={`Select celestial target ${target.name}`}
              >
                {/* Outer Reticle Pulse */}
                <div
                  className={`absolute -inset-2.5 rounded-full border transition-all duration-300 ${
                    isSelected
                      ? 'border-violet bg-violet/20 scale-125'
                      : isHovered
                        ? 'border-cyan bg-cyan/15 scale-110'
                        : 'border-transparent group-hover:border-violet/40'
                  }`}
                />

                {/* Central Target Dot */}
                <div
                  className={`h-3 w-3 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-violet shadow-[0_0_12px_#9b8cff]'
                      : 'bg-ivory/80 group-hover:bg-cyan'
                  }`}
                />

                {/* Target Label */}
                <span
                  className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[0.65rem] backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-violet/25 text-violet font-semibold border border-violet/40'
                      : 'bg-void/80 text-muted border border-line/60 group-hover:text-ivory group-hover:border-cyan/40'
                  }`}
                >
                  {target.name}
                </span>
              </button>
            )
          })}

          {/* Reticle coordinate label in corner */}
          <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[0.62rem] text-muted">
            DEC: +30°42′ · RA: 20h45m · BORTLE 1 DARK-SKY REGION
          </div>
        </div>

        {/* Selected Target Deep-Dive Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-panel/60 p-5 font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line/50 pb-2">
              <span className="text-[0.68rem] tracking-wider text-violet uppercase font-semibold">
                Target Selected
              </span>
              <span className="rounded-full border border-violet/30 bg-violet/10 px-2.5 py-0.5 text-[0.65rem] text-violet">
                {selectedTarget.catalog}
              </span>
            </div>

            <div>
              <h3 className="font-display text-2xl text-ivory">{selectedTarget.name}</h3>
              <p className="mt-1 font-sans text-xs text-muted leading-relaxed">
                {selectedTarget.description}
              </p>
            </div>

            <dl className="space-y-2 border-t border-line/50 pt-3 text-[0.72rem]">
              <div className="flex justify-between">
                <dt className="text-muted">Classification</dt>
                <dd className="text-ivory">{selectedTarget.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Constellation</dt>
                <dd className="text-cyan">{selectedTarget.constellation}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Distance</dt>
                <dd className="text-ivory">{selectedTarget.distance}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Apparent Magnitude</dt>
                <dd className="text-ivory">mag {selectedTarget.apparentMag}</dd>
              </div>
            </dl>
          </div>

          {/* Action to Filter Archive */}
          <div className="mt-6 border-t border-line/50 pt-4">
            <Link
              to={`/archive?discipline=astrophotography&tag=${encodeURIComponent(selectedTarget.photoTag)}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-violet bg-violet/15 py-2.5 text-xs text-violet font-semibold transition-all hover:bg-violet hover:text-void shadow-lg"
            >
              <Telescope size={14} />
              <span>Explore {selectedTarget.photoTag} Frames in Archive</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
