import { useLayoutEffect, useRef, useState } from 'react'
import { Plane, Compass, Navigation, Wind } from 'lucide-react'
import { gsap, registerGsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface Waypoint {
  code: string
  name: string
  x: number
  y: number
  alt: string
  speed: string
}

export function FlightPathAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const planeRef = useRef<SVGGElement>(null)
  const reduced = usePrefersReducedMotion()
  const [activeWaypoint, setActiveWaypoint] = useState<number>(1)

  const waypoints: Waypoint[] = [
    { code: 'KJFK', name: 'New York JFK', x: 80, y: 220, alt: '0 FT', speed: 'V2 165 KT' },
    { code: 'NAT-C1', name: 'Waypoint 54N 040W', x: 380, y: 90, alt: 'FL370', speed: 'M 0.84' },
    { code: 'NAT-C2', name: 'Waypoint 56N 020W', x: 640, y: 85, alt: 'FL390', speed: 'M 0.85' },
    { code: 'EGLL', name: 'London Heathrow', x: 920, y: 190, alt: 'ILS 27R', speed: 'VAPP 142 KT' },
  ]

  // Curve definition: cubic bezier between waypoints
  const pathD = `M 80 220 C 240 80, 480 60, 640 85 S 840 140, 920 190`

  useLayoutEffect(() => {
    if (reduced || !pathRef.current || !planeRef.current || !containerRef.current) return
    registerGsap()

    const context = gsap.context(() => {
      const pathEl = pathRef.current!
      const planeEl = planeRef.current!
      const pathLength = pathEl.getTotalLength()

      // Dash offset animation for path
      gsap.set(pathEl, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })

      // Timeline linked to ScrollTrigger with scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: 1.2,
        },
      })

      // Draw path and move plane along curve
      tl.to(pathEl, {
        strokeDashoffset: 0,
        ease: 'none',
      }, 0)

      const planeTracker = { progress: 0 }
      tl.to(planeTracker, {
        progress: 1,
        ease: 'none',
        onUpdate: () => {
          const point = pathEl.getPointAtLength(planeTracker.progress * pathLength)
          // Compute tangent angle for plane orientation
          const nextPoint = pathEl.getPointAtLength(Math.min(pathLength, (planeTracker.progress + 0.01) * pathLength))
          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI)

          gsap.set(planeEl, {
            x: point.x,
            y: point.y,
            rotation: angle,
            transformOrigin: 'center center',
          })

          // Update active waypoint
          if (planeTracker.progress < 0.3) setActiveWaypoint(0)
          else if (planeTracker.progress < 0.65) setActiveWaypoint(1)
          else if (planeTracker.progress < 0.9) setActiveWaypoint(2)
          else setActiveWaypoint(3)
        },
      }, 0)
    }, containerRef)

    return () => context.revert()
  }, [reduced])

  return (
    <div
      ref={containerRef}
      className="glass-panel relative overflow-hidden rounded-3xl border border-line p-6 md:p-8"
      aria-label="Aviation Navigation Flight Path Telemetry"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-mint animate-pulse" />
            <p className="font-mono text-xs tracking-[0.25em] text-mint uppercase">
              Flight Trajectory · Oceanic Track C
            </p>
          </div>
          <h3 className="mt-1 font-display text-2xl font-normal text-ivory">
            Transatlantic Great Circle Navigation
          </h3>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Navigation size={14} className="text-mint" />
            <span>SPEED: 485 KT TAS</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Wind size={14} className="text-cyan" />
            <span>TAILWIND: +65 KT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Compass size={14} className="text-mint" />
            <span>HDG: 072°</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas for Flight Path */}
      <div className="relative mt-4 h-64 w-full overflow-hidden sm:h-72">
        <svg
          viewBox="0 0 1000 280"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="SVG Flight trajectory between New York and London"
        >
          <defs>
            {/* Cyan/Mint glowing linear gradient */}
            <linearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3ee0ff" stopOpacity="0.3" />
              <stop offset="45%" stopColor="#8fd9c4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3ee0ff" stopOpacity="0.95" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background grid markings */}
          <line x1="50" y1="70" x2="950" y2="70" stroke="rgba(180, 210, 255, 0.05)" strokeDasharray="4 4" />
          <line x1="50" y1="140" x2="950" y2="140" stroke="rgba(180, 210, 255, 0.05)" strokeDasharray="4 4" />
          <line x1="50" y1="210" x2="950" y2="210" stroke="rgba(180, 210, 255, 0.05)" strokeDasharray="4 4" />

          {/* Passive trajectory outline */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(180, 210, 255, 0.12)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* Active animated trajectory */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="url(#flightGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Waypoints */}
          {waypoints.map((wp, i) => {
            const isPassed = activeWaypoint >= i
            return (
              <g key={wp.code} transform={`translate(${wp.x}, ${wp.y})`}>
                <circle
                  r={isPassed ? 6 : 4}
                  fill={isPassed ? '#8fd9c4' : '#101826'}
                  stroke={isPassed ? '#8fd9c4' : '#8b97ab'}
                  strokeWidth="2"
                />
                {isPassed ? (
                  <circle
                    r="12"
                    fill="none"
                    stroke="#8fd9c4"
                    strokeWidth="1"
                    opacity="0.4"
                    className="animate-ping"
                  />
                ) : null}
                <text
                  y="-14"
                  textAnchor="middle"
                  fill={isPassed ? '#e8eef8' : '#8b97ab'}
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight="600"
                  letterSpacing="0.05em"
                >
                  {wp.code}
                </text>
                <text
                  y="20"
                  textAnchor="middle"
                  fill="#8b97ab"
                  fontSize="8.5"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {wp.alt}
                </text>
              </g>
            )
          })}

          {/* Airplane Silhouette */}
          <g ref={planeRef} transform="translate(80, 220)">
            <g transform="translate(-12, -12)">
              <circle r="14" cx="12" cy="12" fill="rgba(143, 217, 196, 0.15)" />
              <Plane size={24} className="text-mint fill-mint drop-shadow-[0_0_8px_rgba(143,217,196,0.8)]" />
            </g>
          </g>
        </svg>
      </div>

      {/* Active telemetry readout bar */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line/60 pt-4 sm:grid-cols-4 font-mono text-xs">
        {waypoints.map((wp, idx) => (
          <div
            key={wp.code}
            className={`rounded-xl p-2.5 transition-colors ${
              activeWaypoint === idx ? 'bg-mint/10 border border-mint/40 text-ivory' : 'text-muted'
            }`}
          >
            <p className="text-[0.65rem] uppercase tracking-wider text-muted">Waypoint {idx + 1}</p>
            <p className="font-semibold text-ivory">{wp.code}</p>
            <p className="text-[0.7rem] text-mint">{wp.name}</p>
            <p className="mt-1 text-[0.65rem] text-muted">{wp.alt} · {wp.speed}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
