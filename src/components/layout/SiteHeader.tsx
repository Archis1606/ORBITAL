import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { navItems } from '@/data/site'
import { cn } from '@/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3 py-1.5 text-sm transition-colors',
    isActive ? 'bg-white/8 text-cyan' : 'text-muted hover:text-ivory',
  )

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between px-4 md:px-8">
        <NavLink to="/" end className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan/40 font-mono text-[0.6rem] text-cyan">
            OR
          </span>
          <span className="font-display text-lg tracking-[0.28em]">ORBITAL</span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/auth" className={linkClass}>
            Sign in
          </NavLink>
        </nav>

        <button
          type="button"
          className="rounded-full border border-line p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" className="border-t border-line px-4 py-4 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/auth" className={linkClass} onClick={() => setOpen(false)}>
                Sign in
              </NavLink>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
