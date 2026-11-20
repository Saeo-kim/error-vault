import type { ErrorRecord, ErrorRecordInput } from '../api/types'

export const MAX_TAGS = 10
export const MAX_TAG_LENGTH = 40

export type Fields = Record<string, string>

/** Splits a comma-separated tag string into a clean list. */
export function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t, i, all) => t.length > 0 && all.indexOf(t) === i)
}

/** Client-side checks that mirror the server rules. Returns field -> message. */
export function validate(values: FormValues): Fields {
  const errors: Fields = {}
  if (!values.title.trim()) errors.title = 'Title is required'
  else if (values.title.trim().length > 200) errors.title = 'Title must be 200 characters or fewer'
  if (!values.errorMessage.trim()) errors.errorMessage = 'Error message is required'
  const tags = parseTags(values.tags)
  if (tags.length > MAX_TAGS) errors.tags = `Use at most ${MAX_TAGS} tags`
  else if (tags.some((t) => t.length > MAX_TAG_LENGTH)) errors.tags = `Each tag must be ${MAX_TAG_LENGTH} characters or fewer`
  return errors
}

export interface FormValues {
  title: string
  errorMessage: string
  stackTrace: string
  source: string
  environment: string
  rootCause: string
  resolution: string
  tags: string
}

export function toFormValues(record?: ErrorRecord): FormValues {
  return {
    title: record?.title ?? '',
    errorMessage: record?.errorMessage ?? '',
    stackTrace: record?.stackTrace ?? '',
    source: record?.source ?? '',
    environment: record?.environment ?? '',
    rootCause: record?.rootCause ?? '',
    resolution: record?.resolution ?? '',
    tags: record?.tags.join(', ') ?? '',
  }
}

export function toInput(values: FormValues): ErrorRecordInput {
  const orNull = (v: string) => (v.trim() ? v : null)
  return {
    title: values.title.trim(),
    errorMessage: values.errorMessage,
    stackTrace: orNull(values.stackTrace),
    source: orNull(values.source.trim()),
    environment: orNull(values.environment.trim()),
    rootCause: orNull(values.rootCause),
    resolution: orNull(values.resolution),
    tags: parseTags(values.tags),
  }
}
