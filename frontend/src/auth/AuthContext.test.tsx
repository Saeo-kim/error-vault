import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthGate } from './AuthContext'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('AuthGate', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows children when no password is configured', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ authRequired: false, authenticated: false })))
    render(<AuthGate><p>private content</p></AuthGate>)
    expect(await screen.findByText('private content')).toBeInTheDocument()
  })

  it('shows the login page until the password is accepted', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ authRequired: true, authenticated: false }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    render(<AuthGate><p>private content</p></AuthGate>)
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong password')

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'right')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('private content')).toBeInTheDocument()
  })

  it('locks again when an API call is rejected with 401', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ authRequired: false, authenticated: false })))
    render(<AuthGate><p>private content</p></AuthGate>)
    await screen.findByText('private content')
    fireEvent(window, new Event('ev:unauthorized'))
    await waitFor(() => expect(screen.getByLabelText('Password')).toBeInTheDocument())
  })
})
