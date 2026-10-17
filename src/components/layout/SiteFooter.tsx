import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-2xl tracking-[0.2em]">ORBITAL</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            A publication-grade observatory for astrophotography and aviation photography. Sample catalog in use until
            Supabase is connected.
          </p>
        </div>
        <ul className="flex flex-wrap gap-5 font-mono text-xs tracking-[0.16em] text-muted uppercase">
          <li>
            <Link to="/archive">Archive</Link>
          </li>
          <li>
            <Link to="/creators/nova.ellison">Creators</Link>
          </li>
          <li>
            <Link to="/studio">Upload studio</Link>
          </li>
          <li>
            <Link to="/auth">Sign in</Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}
