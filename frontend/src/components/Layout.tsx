import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/authContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { authRequired, signOut } = useAuth()
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Error Vault
        </Link>
        {authRequired && (
          <button type="button" className="btn btn-secondary header-action" onClick={() => void signOut()}>
            Sign out
          </button>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
