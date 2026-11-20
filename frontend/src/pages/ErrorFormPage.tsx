import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, createError, getError, updateError } from '../api/client'
import type { ErrorRecord } from '../api/types'
import ErrorForm from '../components/ErrorForm'
import { toFormValues, toInput, type FormValues } from '../components/errorFormModel'

/** Used for both "new error" (/errors/new) and "edit error" (/errors/:id/edit). */
export default function ErrorFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState<ErrorRecord | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode !== 'edit') return
    let cancelled = false
    getError(id)
      .then((r) => !cancelled && setLoaded(r))
      .catch((err: Error) => !cancelled && setLoadError(err.message))
    return () => {
      cancelled = true
    }
  }, [mode, id])

  const cancelTarget = mode === 'edit' ? `/errors/${id}` : '/'

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setServerErrors({})
    try {
      const input = toInput(values)
      const saved = mode === 'edit' ? await updateError(id, input) : await createError(input)
      navigate(`/errors/${saved.id}`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        setServerErrors(err.fields)
      } else {
        setServerErrors({ form: err instanceof Error ? err.message : 'Something went wrong' })
      }
      setSubmitting(false)
    }
  }

  if (mode === 'edit' && loadError) {
    return <p className="error" role="alert">Could not load error: {loadError}</p>
  }
  if (mode === 'edit' && !loaded) {
    return <p className="muted">Loading…</p>
  }

  return (
    <section>
      <p className="back-link">
        <Link to={cancelTarget}>← Back</Link>
      </p>
      <h1>{mode === 'edit' ? 'Edit error' : 'New error'}</h1>
      <ErrorForm
        key={loaded?.id ?? 'new'}
        initial={loaded ? toFormValues(loaded) : toFormValues()}
        submitLabel={mode === 'edit' ? 'Save changes' : 'Save error'}
        submitting={submitting}
        serverErrors={serverErrors}
        onSubmit={onSubmit}
        onCancel={() => navigate(cancelTarget)}
      />
    </section>
  )
}
