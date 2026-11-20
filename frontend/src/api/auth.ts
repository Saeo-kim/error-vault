export interface AuthStatus {
  authRequired: boolean
  authenticated: boolean
}

export async function getAuthStatus(): Promise<AuthStatus> {
  const response = await fetch('/api/auth/status', { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Could not check sign-in status (${response.status})`)
  return (await response.json()) as AuthStatus
}

/** Resolves on success; rejects with "Wrong password" for a 401 response. */
export async function login(password: string): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (response.status === 401) throw new Error('Wrong password')
  if (!response.ok) throw new Error(`Sign-in failed (${response.status})`)
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}
