import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listErrors } from '../api/client'
import type { ErrorRecord } from '../api/types'

export default function ErrorListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const tag = searchParams.get('tag') ?? ''

  const [items, setItems] = useState<ErrorRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listErrors({ q, tag })
      .then((records) => {
        if (cancelled) return
        setItems(records)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [q, tag])

  // Tags shown as filter chips come from the records currently listed.
  const tagChips = useMemo(() => {
    const all = new Set<string>()
    items?.forEach((r) => r.tags.forEach((t) => all.add(t)))
    if (tag) all.add(tag)
    return [...all].sort()
  }, [items, tag])

  const updateParams = (next: { q?: string; tag?: string }) => {
    const params = new URLSearchParams(searchParams)
    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q)
      else params.delete('q')
    }
    if (next.tag !== undefined) {
      if (next.tag) params.set('tag', next.tag)
      else params.delete('tag')
    }
    setSearchParams(params, { replace: true })
  }

  return (
    <section className="list-page" aria-labelledby="list-title">
      <div className="page-title-row">
        <h1 id="list-title">Errors</h1>
        <Link to="/errors/new" className="btn btn-primary">
          New error
        </Link>
      </div>

      {/* Keyed by the active query so the box resets when the URL query changes. */}
      <SearchForm
        key={q}
        initialQuery={q}
        onSearch={(value) => updateParams({ q: value.trim() })}
      />

      {tagChips.length > 0 && (
        <div className="chips" aria-label="Filter by tag">
          {tagChips.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip${t === tag ? ' chip-active' : ''}`}
              aria-pressed={t === tag}
              onClick={() => updateParams({ tag: t === tag ? '' : t })}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {(q || tag) && (
        <p className="muted filter-summary">
          {q && <>Matching “{q}”</>}
          {q && tag && ' · '}
          {tag && <>tagged “{tag}”</>}{' '}
          <button type="button" className="link-button" onClick={() => setSearchParams({}, { replace: true })}>
            Clear
          </button>
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          Could not load errors: {error}
        </p>
      )}

      {items === null && !error && <p className="muted">Loading…</p>}

      {items && items.length === 0 && !error && (
        <div className="card empty">
          {q || tag ? (
            <p>No errors match this search.</p>
          ) : (
            <>
              <p>No errors captured yet.</p>
              <Link to="/errors/new" className="btn btn-primary">
                Capture your first error
              </Link>
            </>
          )}
        </div>
      )}

      {items && items.length > 0 && (
        <ul className="error-list">
          {items.map((r) => (
            <li key={r.id}>
              <Link to={`/errors/${r.id}`} className="error-item">
                <span className="error-title">{r.title}</span>
                <span className="error-snippet">{r.errorMessage}</span>
                <span className="meta">
                  {r.source && <span>{r.source}</span>}
                  {r.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SearchForm({ initialQuery, onSearch }: { initialQuery: string; onSearch: (value: string) => void }) {
  const [draft, setDraft] = useState(initialQuery)
  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(draft)
      }}
    >
      <label htmlFor="search-input" className="sr-only">
        Search errors
      </label>
      <input
        id="search-input"
        type="search"
        placeholder="Search title, message or tags"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoComplete="off"
      />
      <button type="submit" className="btn btn-secondary">
        Search
      </button>
    </form>
  )
}
