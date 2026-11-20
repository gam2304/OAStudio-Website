// Admin session: the JWT from POST /api/auth/login, kept in sessionStorage (cleared when the tab closes)

export interface Session {
  token: string
  username: string
  roles: string[]
  expiresAt: number // epoch ms
}

const KEY = 'oastudio.admin.token'

// Reads sub/roles/exp from the JWT payload. The server verifies the signature; this is display-only.
export function parseToken(token: string): Session | null {
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof json.sub !== 'string' || typeof json.exp !== 'number') return null
    return {
      token,
      username: json.sub,
      roles: Array.isArray(json.roles) ? json.roles : [],
      expiresAt: json.exp * 1000,
    }
  } catch {
    return null
  }
}

export const isSuperAdmin = (s: Session | null) => !!s?.roles.includes('ROLE_SUPER_ADMIN')

export function loadSession(now = Date.now()): Session | null {
  let token: string | null = null
  try {
    token = sessionStorage.getItem(KEY)
  } catch {
    return null
  }
  const session = token ? parseToken(token) : null
  return session && session.expiresAt > now ? session : null
}

export function saveSession(token: string) {
  try {
    sessionStorage.setItem(KEY, token)
  } catch {
    // Private mode: the session still lives in memory until reload
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export const readToken = () => {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}
