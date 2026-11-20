import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteError, getError } from '../api/client'
import type { ErrorRecord } from '../api/types'

export default function ErrorDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState<ErrorRecord | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    getError(id)
      .then((r) => !cancelled && setRecord(r))
      .catch((err: { status?: number; message: string }) => {
        if (cancelled) return
        if (err.status === 404) setNotFound(true)
        else setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const onDelete = async () => {
    if (!window.confirm('Delete this error record? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteError(id)
      navigate('/', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setDeleting(false)
    }
  }

  if (notFound) {
    return (
      <section className="card">
        <h1>Error not found</h1>
        <p className="muted">It may have been deleted.</p>
        <Link to="/">Back to errors</Link>
      </section>
    )
  }

  if (error && !record) return <p className="error" role="alert">Could not load error: {error}</p>
  if (!record) return <p className="muted">Loading…</p>

  return (
    <article className="detail" aria-labelledby="detail-title">
      <p className="back-link">
        <Link to="/">← All errors</Link>
      </p>
      <h1 id="detail-title">{record.title}</h1>

      <div className="meta">
        {record.source && <span>{record.source}</span>}
        {record.environment && <span>{record.environment}</span>}
        {record.tags.map((t) => (
          <Link key={t} to={`/?tag=${encodeURIComponent(t)}`} className="tag">
            {t}
          </Link>
        ))}
      </div>

      <Section title="Error message">
        <pre className="code">{record.errorMessage}</pre>
      </Section>
      {record.stackTrace && (
        <Section title="Stack trace">
          <pre className="code">{record.stackTrace}</pre>
        </Section>
      )}
      {record.rootCause && (
        <Section title="Root cause">
          <p>{record.rootCause}</p>
        </Section>
      )}
      {record.resolution && (
        <Section title="Resolution">
          <p>{record.resolution}</p>
        </Section>
      )}

      <p className="muted small">
        Captured {new Date(record.createdAt).toLocaleString()} · Updated {new Date(record.updatedAt).toLocaleString()}
      </p>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-danger" onClick={onDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
        <Link to={`/errors/${record.id}/edit`} className="btn btn-primary">
          Edit
        </Link>
      </div>
    </article>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="detail-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
