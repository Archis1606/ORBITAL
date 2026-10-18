import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plane, Compass, ArrowRight, ShieldCheck, Info } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface AirportVantage {
  id: string
  code: string
  name: string
  city: string
  country: string
  lat: number
  lng: number
  // Percentage on Mercator map 0-100%
  mapX: number
  mapY: number
  runways: string
  elevation: string
  framesCount: number
  primaryAircraft: string
}

const VERIFIED_AIRPORT_VANTAGES: AirportVantage[] = [
  {
    id: 'apt-hkg',
    code: 'HKG / VHHH',
    name: 'Hong Kong International',
    city: 'Chek Lap Kok',
    country: 'Hong Kong',
    lat: 22.308,
    lng: 113.9185,
    mapX: 78,
    mapY: 52,
    runways: '07R/25L, 07L/25R, 07C/25C',
    elevation: '28 FT',
    framesCount: 1,
    primaryAircraft: 'Boeing 777-300ER (Cathay Pacific)',
  },
  {
    id: 'apt-lhr',
    code: 'LHR / EGLL',
    name: 'London Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.47,
    lng: -0.4543,
    mapX: 47,
    mapY: 28,
    runways: '09L/27R, 09R/27L',
    elevation: '83 FT',
    framesCount: 2,
    primaryAircraft: 'Airbus A350-1000 & A321neo',
  },
  {
    id: 'apt-edw',
    code: 'EDW / KEDW',
    name: 'Edwards Air Force Base (R-2508)',
    city: 'Mojave Desert, CA',
    country: 'United States',
    lat: 35.011,
    lng: -115.473,
    mapX: 18,
    mapY: 40,
    runways: '04R/22L (Lakebed Dry Runs)',
    elevation: '2,302 FT',
    framesCount: 1,
    primaryAircraft: 'F-16 Fighting Falcon (USAF TPS)',
  },
  {
    id: 'apt-anc',
    code: 'ANC / PANC',
    name: 'Ted Stevens Anchorage International',
    city: 'Anchorage, AK',
    country: 'United States',
    lat: 61.1744,
    lng: -149.9964,
    mapX: 12,
    mapY: 20,
    runways: '07L/25R, 07R/25L, 15/33',
    elevation: '152 FT',
    framesCount: 1,
    primaryAircraft: 'Boeing 747-8F (Atlas Air Cargo)',
  },
  {
    id: 'apt-hnd',
    code: 'HND / RJTT',
    name: 'Tokyo Haneda International',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.5494,
    lng: 139.7798,
    mapX: 84,
    mapY: 41,
    runways: '16R/34L, 16L/34R, 04/22, 05/23',
    elevation: '35 FT',
    framesCount: 1,
    primaryAircraft: 'Airbus A320neo (ANA)',
  },
  {
    id: 'apt-syd',
    code: 'SYD / YSSY',
    name: 'Sydney Kingsford Smith',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.9461,
    lng: 151.1772,
    mapX: 88,
    mapY: 82,
    runways: '16R/34L, 16L/34R, 07/25',
    elevation: '21 FT',
    framesCount: 1,
    primaryAircraft: 'Boeing 787-9 Dreamliner (Qantas)',
  },
]

export function InteractiveRadarMap({ onSelectAirport }: { onSelectAirport?: (code: string) => void }) {
  const [selectedVantage, setSelectedVantage] = useState<AirportVantage>(VERIFIED_AIRPORT_VANTAGES[0])
  const [hoveredVantage, setHoveredVantage] = useState<AirportVantage | null>(null)
  const reduced = usePrefersReducedMotion()

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl border border-mint/30 bg-navy-deep p-6 md:p-8">
      {/* Radar Header Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
            <p className="font-mono text-xs tracking-widest text-mint uppercase">
              Flight Operations Command · Vantage Radar
            </p>
          </div>
          <h2 className="mt-1 font-display text-2xl text-ivory">
            Verified Photography Coordinates & Terminals
          </h2>
        </div>

        <div className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-mono text-[0.65rem] text-mint uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck size={13} />
          <span>Verified Photographer Locations · Not Live Aircraft Radar</span>
        </div>
      </div>

      {/* Main Radar Layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Tactical Map Display */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-void/90 select-none">
          {/* Subtle Radar Sweep Animation */}
          {!reduced ? (
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, rgba(143, 217, 196, 0.4) 0deg, rgba(143, 217, 196, 0) 60deg, transparent 360deg)',
                animation: 'radarSweep 8s linear infinite',
              }}
            />
          ) : null}

          {/* Grid lines & range rings */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <defs>
              <radialGradient id="radarRings" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8fd9c4" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#8fd9c4" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50%" cy="50%" r="20%" fill="none" stroke="rgba(143, 217, 196, 0.12)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="38%" fill="none" stroke="rgba(143, 217, 196, 0.10)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(143, 217, 196, 0.08)" strokeWidth="1" />
            <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="rgba(143, 217, 196, 0.08)" strokeWidth="1" />
            <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(143, 217, 196, 0.08)" strokeWidth="1" />
          </svg>

          {/* Airport Terminals Markers */}
          {VERIFIED_AIRPORT_VANTAGES.map((vantage) => {
            const isSelected = selectedVantage.id === vantage.id
            const isHovered = hoveredVantage?.id === vantage.id

            return (
              <button
                key={vantage.id}
                type="button"
                onClick={() => {
                  setSelectedVantage(vantage)
                  if (onSelectAirport) onSelectAirport(vantage.code.split(' ')[0])
                }}
                onMouseEnter={() => setHoveredVantage(vantage)}
                onMouseLeave={() => setHoveredVantage(null)}
                style={{ left: `${vantage.mapX}%`, top: `${vantage.mapY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
                aria-label={`Select vantage at ${vantage.name}`}
              >
                {/* Ping rings */}
                <div
                  className={`absolute -inset-2.5 rounded-full border transition-all duration-300 ${
                    isSelected
                      ? 'border-mint bg-mint/20 scale-125'
                      : isHovered
                        ? 'border-cyan bg-cyan/15 scale-110'
                        : 'border-transparent group-hover:border-mint/40'
                  }`}
                />

                {/* Beacon Core */}
                <div
                  className={`h-3 w-3 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-mint shadow-[0_0_12px_#8fd9c4]'
                      : 'bg-ivory/80 group-hover:bg-mint'
                  }`}
                />

                {/* Badge Tag */}
                <span
                  className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[0.65rem] backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-mint/25 text-mint font-semibold border border-mint/40'
                      : 'bg-void/80 text-muted border border-line/60 group-hover:text-ivory group-hover:border-mint/40'
                  }`}
                >
                  {vantage.code.split(' ')[0]}
                </span>
              </button>
            )
          })}

          <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[0.62rem] text-muted flex items-center gap-2">
            <Compass size={11} className="text-mint" />
            <span>RADAR AZIMUTH: 360° · WGS84 ELLIPSOID VANTAGE MAPPING</span>
          </div>
        </div>

        {/* Selected Terminal Telemetry Panel */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-panel/60 p-5 font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line/50 pb-2">
              <span className="text-[0.68rem] tracking-wider text-mint uppercase font-semibold">
                Terminal Selected
              </span>
              <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-[0.65rem] text-mint">
                {selectedVantage.code}
              </span>
            </div>

            <div>
              <h3 className="font-display text-2xl text-ivory">{selectedVantage.name}</h3>
              <p className="font-sans text-xs text-muted mt-1">
                {selectedVantage.city}, {selectedVantage.country}
              </p>
            </div>

            <dl className="space-y-2 border-t border-line/50 pt-3 text-[0.72rem]">
              <div className="flex justify-between">
                <dt className="text-muted">Field Coordinates</dt>
                <dd className="text-ivory font-mono">
                  {selectedVantage.lat.toFixed(4)}° N, {selectedVantage.lng.toFixed(4)}°
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Field Elevation</dt>
                <dd className="text-mint">{selectedVantage.elevation}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Runway Configuration</dt>
                <dd className="text-ivory">{selectedVantage.runways}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Cataloged Aircraft</dt>
                <dd className="text-ivory">{selectedVantage.primaryAircraft}</dd>
              </div>
            </dl>

            <div className="rounded-xl border border-line/50 bg-navy/60 p-3 text-[0.68rem] text-muted flex items-start gap-2">
              <Info size={14} className="text-mint shrink-0 mt-0.5" />
              <span>
                Coordinates represent physical photographer observation points verified against flight dispatch data.
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-line/50 pt-4">
            <Link
              to={`/archive?discipline=aviation&q=${encodeURIComponent(selectedVantage.code.split(' ')[0])}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-mint bg-mint/15 py-2.5 text-xs text-mint font-semibold transition-all hover:bg-mint hover:text-void shadow-lg"
            >
              <Plane size={14} />
              <span>Filter Archive for {selectedVantage.code.split(' ')[0]} Frames</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
