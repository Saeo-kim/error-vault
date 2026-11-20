import { createContext, useContext } from 'react'

export interface AuthValue {
  authRequired: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthValue>({ authRequired: false, signOut: async () => {} })

export function useAuth() {
  return useContext(AuthContext)
}
