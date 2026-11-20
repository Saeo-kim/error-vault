import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createError, deleteError, listErrors } from './client'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('API client', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn(async () => json([]))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the search query string only from provided filters', async () => {
    await listErrors({ q: 'null pointer', tag: 'npe' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/errors?q=null+pointer&tag=npe')

    await listErrors()
    expect(fetchMock.mock.calls[1][0]).toBe('/api/errors')
  })

  it('throws ApiError with field messages for a 400 response', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: 'Validation failed', fields: { title: 'must not be blank' } }, 400))
    const err = await createError({ title: '', errorMessage: 'x' }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(400)
    expect((err as ApiError).fields).toEqual({ title: 'must not be blank' })
  })

  it('resolves for a 204 delete response', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(deleteError('abc')).resolves.toBeUndefined()
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'DELETE' })
  })
})
