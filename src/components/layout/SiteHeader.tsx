import { ChevronDown, LogOut, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { navItems } from '@/data/site'
import { useAuth } from '@/context/AuthContext'
import { ProfileSearch } from '@/components/layout/ProfileSearch'
import { cn } from '@/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3.5 py-1.5 text-xs font-mono tracking-wider transition-colors uppercase',
    isActive ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_12px_rgba(62,224,255,0.2)]' : 'text-muted hover:text-ivory',
  )

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [authActionError, setAuthActionError] = useState<string | null>(null)
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.error) {
      setAuthActionError(result.error)
      return
    }
    setAuthActionError(null)
    setProfileMenuOpen(false)
    setOpen(false)
  }

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
        <nav className="hidden items-center gap-1.5 xl:flex" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <ProfileSearch />

          {/* User Profile / Auth Action */}
          {user ? (
            <div className="relative ml-2">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-panel/70 px-3.5 py-1.5 text-xs font-mono text-ivory transition-all hover:border-cyan/50"
              >
                <div className="h-4 w-4 rounded-full bg-cyan/30 text-cyan flex items-center justify-center text-[0.6rem] font-bold">
                  {profile?.display_name ? profile.display_name[0].toUpperCase() : 'U'}
                </div>
                <span className="truncate max-w-[7rem]">@{profile?.handle || 'observer'}</span>
                <ChevronDown size={13} aria-hidden="true" />
              </button>
              {profileMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-line bg-navy-deep p-2 shadow-2xl"
                >
                  {authActionError ? (
                    <p role="alert" className="px-3 py-2 text-xs text-danger">{authActionError}</p>
                  ) : null}
                  <NavLink
                    role="menuitem"
                    to={profile?.handle ? `/creators/${profile.handle}` : '/auth'}
                    onClick={() => setProfileMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-xs font-mono text-ivory hover:bg-cyan/10 hover:text-cyan"
                  >
                    View Profile
                  </NavLink>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleSignOut()}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-mono text-danger hover:bg-danger/10"
                  >
                    <LogOut size={13} aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
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
          className="rounded-full border border-line p-2 text-ivory xl:hidden hover:border-cyan"
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
        <nav id="mobile-nav" className="border-t border-line bg-void/95 px-6 py-5 xl:hidden backdrop-blur-xl" aria-label="Mobile Navigation">
          <ul className="flex flex-col gap-3">
            <li className="pb-2">
              <ProfileSearch onSelect={() => setOpen(false)} />
            </li>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2 border-t border-line/60">
              {user ? (
                <div className="flex flex-col gap-3">
                  <NavLink
                    to={profile?.handle ? `/creators/${profile.handle}` : '/auth'}
                    className={linkClass}
                    onClick={() => setOpen(false)}
                  >
                    {`View Profile (@${profile?.handle || 'observer'})`}
                  </NavLink>
                  {authActionError ? <p role="alert" className="font-mono text-xs text-danger">{authActionError}</p> : null}
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-danger/40 px-3.5 py-1.5 text-xs font-mono text-danger transition-colors hover:border-danger hover:bg-danger/10"
                  >
                    <LogOut size={14} aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <NavLink to="/auth" className={linkClass} onClick={() => setOpen(false)}>
                  Sign in to Observatory
                </NavLink>
              )}
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
