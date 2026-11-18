import axios from 'axios'
import { clearSession, readToken } from './session'

// VITE_API_URL is set for production builds; dev uses the Vite proxy on /api
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

export const SESSION_EXPIRED_EVENT = 'oastudio:session-expired'

// Send the admin token on every request once logged in
api.interceptors.request.use((config) => {
  const token = readToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 outside login = token expired, revoked or admin removed: drop the session
api.interceptors.response.use(undefined, (err) => {
  if (axios.isAxiosError(err) && err.response?.status === 401 && !err.config?.url?.startsWith('/auth/') && readToken()) {
    clearSession()
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }
  return Promise.reject(err)
})

// Per-field messages from a 400 validation response, to show next to each input
export function fieldErrors(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err)) {
    const messages = (err.response?.data as { messages?: Record<string, string> } | undefined)?.messages
    if (messages) return messages
  }
  return {}
}

// Backend errors: { error, message } or { error, messages: { field: msg } } on validation
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; messages?: Record<string, string> } | undefined
    if (data?.messages) return Object.values(data.messages).join(' ')
    if (data?.message) return data.message
  }
  return fallback
}
