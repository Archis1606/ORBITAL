import { Link } from 'react-router-dom'

export function DisciplineSplit() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-20 md:grid-cols-2 md:px-8">
      <Link
        to="/astrophotography"
        className="group glass-panel relative overflow-hidden rounded-3xl p-8 min-h-72"
      >
        <p className="font-mono text-xs tracking-[0.24em] text-violet uppercase">Discipline 01</p>
        <h2 className="mt-6 font-display text-4xl">Astrophotography</h2>
        <p className="mt-3 max-w-sm text-muted">
          Deep-sky ledgers, aurora architecture, and editorial night work. Violet marks this corridor.
        </p>
        <span className="mt-8 inline-block text-sm text-violet transition-transform motion-safe:group-hover:translate-x-1">
          Open the observatory →
        </span>
      </Link>
      <Link to="/aviation" className="group glass-panel relative overflow-hidden rounded-3xl p-8 min-h-72">
        <p className="font-mono text-xs tracking-[0.24em] text-mint uppercase">Discipline 02</p>
        <h2 className="mt-6 font-display text-4xl">Aviation</h2>
        <p className="mt-3 max-w-sm text-muted">
          Ramp light, glass cockpits, and airframes in motion. Mint marks this corridor.
        </p>
        <span className="mt-8 inline-block text-sm text-mint transition-transform motion-safe:group-hover:translate-x-1">
          Open the flight deck →
        </span>
      </Link>
    </section>
  )
}
