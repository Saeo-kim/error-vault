import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { toFormValues, validate, type FormValues, type Fields } from './errorFormModel'

interface Props {
  initial?: FormValues
  submitLabel: string
  submitting: boolean
  serverErrors?: Fields
  onSubmit: (values: FormValues) => void
  onCancel: () => void
}

export default function ErrorForm({ initial, submitLabel, submitting, serverErrors = {}, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<FormValues>(initial ?? toFormValues())
  const [touched, setTouched] = useState(false)
  const clientErrors = validate(values)
  const errors = { ...clientErrors, ...serverErrors }
  const hasErrors = Object.keys(errors).length > 0

  const set = (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!hasErrors) onSubmit(values)
  }

  const showError = (field: string) => (touched || serverErrors[field]) && errors[field]

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-label="Error details">
      <Field id="title" label="Title" required error={showError('title')}>
        <input id="title" name="title" value={values.title} onChange={set('title')} maxLength={300} autoComplete="off" />
      </Field>

      <Field id="errorMessage" label="Error message" required error={showError('errorMessage')}>
        <textarea id="errorMessage" name="errorMessage" value={values.errorMessage} onChange={set('errorMessage')} rows={3} />
      </Field>

      <Field id="stackTrace" label="Stack trace" error={showError('stackTrace')}>
        <textarea id="stackTrace" name="stackTrace" value={values.stackTrace} onChange={set('stackTrace')} rows={5} className="mono" />
      </Field>

      <div className="form-row">
        <Field id="source" label="Source" error={showError('source')}>
          <input id="source" name="source" value={values.source} onChange={set('source')} placeholder="e.g. Java" />
        </Field>
        <Field id="environment" label="Environment" error={showError('environment')}>
          <input id="environment" name="environment" value={values.environment} onChange={set('environment')} placeholder="e.g. local" />
        </Field>
      </div>

      <Field id="rootCause" label="Root cause" error={showError('rootCause')}>
        <textarea id="rootCause" name="rootCause" value={values.rootCause} onChange={set('rootCause')} rows={3} />
      </Field>

      <Field id="resolution" label="Resolution" error={showError('resolution')}>
        <textarea id="resolution" name="resolution" value={values.resolution} onChange={set('resolution')} rows={3} />
      </Field>

      <Field id="tags" label="Tags" hint="Comma-separated, e.g. npe, spring" error={showError('tags')}>
        <input id="tags" name="tags" value={values.tags} onChange={set('tags')} autoComplete="off" />
      </Field>

      {serverErrors.form && <p className="error" role="alert">{serverErrors.form}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string | false
  children: ReactNode
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}
