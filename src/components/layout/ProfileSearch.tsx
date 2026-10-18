import { Search, UserRound } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchCreators } from '@/services/creatorService'
import type { Creator } from '@/types/models'

export function ProfileSearch({ onSelect }: { onSelect?: () => void }) {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Creator[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return

    let cancelled = false
    setLoading(true)
    const timeout = window.setTimeout(() => {
      searchCreators(term)
        .then((creators) => {
          if (!cancelled) {
            setResults(creators)
            setError(null)
          }
        })
        .catch((searchError: unknown) => {
          if (!cancelled) {
            setResults([])
            setError(searchError instanceof Error ? searchError.message : 'Profile search failed.')
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [query])

  const isOpen = query.trim().length >= 2

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={inputId}>
        Search profiles
      </label>
      <div className="flex items-center rounded-full border border-line/70 bg-panel/70 px-3 text-muted focus-within:border-cyan/60">
        <Search size={14} aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            const value = event.target.value
            setQuery(value)
            if (value.trim().length < 2) {
              setResults([])
              setError(null)
              setLoading(false)
            } else {
              setLoading(true)
              setError(null)
            }
          }}
          placeholder="Find observers"
          autoComplete="off"
          className="w-32 bg-transparent px-2 py-2 text-xs text-ivory outline-none placeholder:text-muted/70 xl:w-40"
        />
      </div>
      {isOpen ? (
        <div
          role="listbox"
          aria-label="Profile search results"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-navy-deep p-2 shadow-2xl"
        >
          {loading ? <p className="px-3 py-2 font-mono text-xs text-muted">Searching profiles…</p> : null}
          {error ? <p className="px-3 py-2 font-mono text-xs text-danger">{error}</p> : null}
          {!loading && !error && results.length === 0 ? (
            <p className="px-3 py-2 font-mono text-xs text-muted">No profiles found.</p>
          ) : null}
          {results.map((creator) => (
            <Link
              key={creator.handle}
              role="option"
              aria-selected="false"
              to={`/creators/${creator.handle}`}
              onClick={() => {
                setQuery('')
                onSelect?.()
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-cyan/10"
            >
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan/10 text-cyan">
                  <UserRound size={15} aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm text-ivory">{creator.displayName}</span>
                <span className="block truncate font-mono text-[0.65rem] text-muted">@{creator.handle}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
