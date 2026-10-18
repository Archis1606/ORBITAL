import { Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { navItems } from '@/data/site'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3.5 py-1.5 text-xs font-mono tracking-wider transition-colors uppercase',
    isActive ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_12px_rgba(62,224,255,0.2)]' : 'text-muted hover:text-ivory',
  )

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, profile } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Brand Logo */}
        <NavLink to="/" end className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan/40 font-mono text-[0.62rem] text-cyan group-hover:border-cyan group-hover:shadow-[0_0_12px_rgba(62,224,255,0.4)] transition-all">
            OR
          </span>
          <span className="font-display text-lg tracking-[0.28em] text-ivory">ORBITAL</span>
        </NavLink>

        {/* Desktop Primary Navigation */}
        <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}

          {/* User Profile / Auth Action */}
          {user ? (
            <NavLink
              to={profile?.handle ? `/creators/${profile.handle}` : '/auth'}
              className={({ isActive }) =>
                cn(
                  'ml-2 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-mono transition-all',
                  isActive
                    ? 'border-cyan bg-cyan/20 text-cyan'
                    : 'border-line/70 bg-panel/70 text-ivory hover:border-cyan/50',
                )
              }
            >
              <div className="h-4 w-4 rounded-full bg-cyan/30 text-cyan flex items-center justify-center text-[0.6rem] font-bold">
                {profile?.display_name ? profile.display_name[0].toUpperCase() : 'U'}
              </div>
              <span className="truncate max-w-[7rem]">@{profile?.handle || 'observer'}</span>
            </NavLink>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                cn(
                  'ml-2 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-mono transition-all uppercase tracking-wider',
                  isActive
                    ? 'border-cyan bg-cyan/20 text-cyan'
                    : 'border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20 hover:border-cyan',
                )
              }
            >
              <User size={13} />
              <span>Sign In</span>
            </NavLink>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="rounded-full border border-line p-2 text-ivory lg:hidden hover:border-cyan"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          <span className="sr-only">Toggle navigation menu</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {open ? (
        <nav id="mobile-nav" className="border-t border-line bg-void/95 px-6 py-5 lg:hidden backdrop-blur-xl" aria-label="Mobile Navigation">
          <ul className="flex flex-col gap-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2 border-t border-line/60">
              <NavLink to="/auth" className={linkClass} onClick={() => setOpen(false)}>
                {user ? `Account (@${profile?.handle || 'observer'})` : 'Sign in to Observatory'}
              </NavLink>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
