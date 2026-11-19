import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as apiLogin } from '../services/adminApi'
import { SESSION_EXPIRED_EVENT } from '../services/api'
import { clearSession, loadSession, parseToken, saveSession, type Session } from '../services/session'

interface AuthState {
  session: Session | null
  expired: boolean // true after an automatic logout, so the login page can say why
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const [expired, setExpired] = useState(false)

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { accessToken } = await apiLogin(username, password)
    const next = parseToken(accessToken)
    if (!next) throw new Error('The server returned an unreadable token.')
    saveSession(accessToken)
    setExpired(false)
    setSession(next)
  }, [])

  // The API interceptor fires this on any 401 (expired, revoked or removed admin)
  useEffect(() => {
    const onExpired = () => {
      setExpired(true)
      setSession(null)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  // Log out the moment the token expires, not on the next failed request
  useEffect(() => {
    if (!session) return
    const timer = window.setTimeout(() => {
      clearSession()
      setExpired(true)
      setSession(null)
    }, Math.max(0, session.expiresAt - Date.now()))
    return () => window.clearTimeout(timer)
  }, [session])

  return <AuthContext.Provider value={{ session, expired, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
