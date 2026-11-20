import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { site } from '../../content/site'
import { errorMessage } from '../../services/api'

// Sharp corners and no browser chrome, per DESIGN.md (0px radius, bottom-border inputs)
const input =
  'w-full appearance-none rounded-none border-0 border-b border-stone/30 bg-transparent py-3 text-ink outline-none transition-colors focus:border-bronze'

export default function Login() {
  const { session, expired, login } = useAuth()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  // Return to the admin page the user was sent away from
  const from = (location.state as { from?: string } | null)?.from ?? '/atelier-control'
  if (session) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    setPending(true)
    setError('')
    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(errorMessage(err, 'Login failed. Please try again.'))
      setPassword('')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-margin-mobile py-20 md:justify-end md:px-margin md:py-12">
      <img src={site.images.adminLogin} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale" />
      {/* Darkens the photo toward the form side so the panel edge stays readable */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/60 to-void md:bg-gradient-to-r md:from-void/20 md:via-void/50 md:to-void/90" />

      <p className="label-caps absolute left-margin-mobile top-10 text-paper md:left-margin">OA Studio</p>

      <section className="relative w-full max-w-md border border-stone/10 bg-void px-8 py-10 md:px-12">
        <p className="label-caps mb-3 text-ink/50">Private access</p>
        <h1 className="headline-md mb-2">Atelier control</h1>
        <p className="mb-8 text-sm text-ink/50">Sign in to manage projects, categories and messages.</p>

        <form noValidate onSubmit={onSubmit} className="space-y-7">
          <div>
            <label htmlFor="username" className="label-caps mb-2 block text-ink/60">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus className={input} />
          </div>
          <div>
            <label htmlFor="password" className="label-caps mb-2 block text-ink/60">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={`${input} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls="password"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink/50 transition-colors hover:text-bronze"
              >
                {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
          </div>

          <div aria-live="polite" className="min-h-5">
            {error ? (
              <p role="alert" className="text-sm text-error">{error}</p>
            ) : (
              expired && <p className="text-sm text-ink/60">Your session ended. Please sign in again.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="label-caps w-full rounded-none border border-transparent bg-paper px-10 py-4 text-void press hover:border-bronze hover:bg-void hover:text-bronze disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
