import type { ErrorRecord, ErrorRecordInput } from './types'

const BASE = '/api/errors'
const UNAUTHORIZED_EVENT = 'ev:unauthorized'

/** Error thrown for non-2xx responses. `fields` holds per-field validation messages. */
export class ApiError extends Error {
  status: number
  fields: Record<string, string>

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...init,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json().catch(() => null)
  if (response.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  if (!response.ok) {
    const message = (body && (body.detail || body.title)) || `Request failed (${response.status})`
    throw new ApiError(response.status, message, (body && body.fields) || {})
  }
  return body as T
}

export function listErrors(params: { q?: string; tag?: string } = {}): Promise<ErrorRecord[]> {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.tag) query.set('tag', params.tag)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request<ErrorRecord[]>(`${BASE}${suffix}`)
}

export function getError(id: string): Promise<ErrorRecord> {
  return request<ErrorRecord>(`${BASE}/${encodeURIComponent(id)}`)
}

export function createError(input: ErrorRecordInput): Promise<ErrorRecord> {
  return request<ErrorRecord>(BASE, { method: 'POST', body: JSON.stringify(input) })
}

export function updateError(id: string, input: ErrorRecordInput): Promise<ErrorRecord> {
  return request<ErrorRecord>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteError(id: string): Promise<void> {
  return request<void>(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
