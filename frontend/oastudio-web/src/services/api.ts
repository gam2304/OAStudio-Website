import axios from 'axios'

// VITE_API_URL is set for production builds; dev uses the Vite proxy on /api
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

// Backend errors: { error, message } or { error, messages: { field: msg } } on validation
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; messages?: Record<string, string> } | undefined
    if (data?.messages) return Object.values(data.messages).join(' ')
    if (data?.message) return data.message
  }
  return fallback
}
