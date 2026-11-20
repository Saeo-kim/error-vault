import { useEffect, useState, type ReactNode } from 'react'
import { getAuthStatus, login as apiLogin, logout as apiLogout } from '../api/auth'
import LoginPage from '../pages/LoginPage'
import { AuthContext, type AuthValue } from './authContext'

/** Emitted by the API client when a request is rejected with 401 (session expired). */
const UNAUTHORIZED_EVENT = 'ev:unauthorized'

type State = 'checking' | 'locked' | 'ready' | 'error'

/** Shows the login page until the browser has a valid session (when a password is configured). */
export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>('checking')
  const [authRequired, setAuthRequired] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const refresh = () =>
    getAuthStatus()
      .then((status) => {
        setAuthRequired(status.authRequired)
        setState(status.authRequired && !status.authenticated ? 'locked' : 'ready')
        setStatusError(null)
      })
      .catch((err: Error) => {
        setStatusError(err.message)
        setState('error')
      })

  useEffect(() => {
    let cancelled = false
    getAuthStatus()
      .then((status) => {
        if (cancelled) return
        setAuthRequired(status.authRequired)
        setState(status.authRequired && !status.authenticated ? 'locked' : 'ready')
      })
      .catch((err: Error) => {
        if (cancelled) return
        setStatusError(err.message)
        setState('error')
      })
    const onUnauthorized = () => {
      setState('locked')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => {
      cancelled = true
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [])

  const value: AuthValue = {
    authRequired,
    signOut: async () => {
      await apiLogout()
      setState('locked')
    },
  }

  if (state === 'checking') return <p className="muted center">Loading…</p>
  if (state === 'error') {
    return (
      <section className="card">
        <h1>Can’t reach Error Vault</h1>
        <p className="error" role="alert">{statusError}</p>
        <button type="button" className="btn btn-primary" onClick={() => { setState('checking'); refresh() }}>
          Try again
        </button>
      </section>
    )
  }
  if (state === 'locked') {
    return (
      <LoginPage
        onLogin={async (password) => {
          await apiLogin(password)
          setState('ready')
        }}
      />
    )
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
