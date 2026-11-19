import axios from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { changeOwnPassword } from '../../services/adminApi'
import { api, errorMessage } from '../../services/api'

// Read-only calls, so checking them changes nothing
const PROBES = [
  { label: 'Projects', path: '/admin/projects' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Contact messages', path: '/admin/contact-messages' },
  { label: 'Admin accounts (main admin only)', path: '/admin/admins' },
]

type ProbeResult = 'checking' | 'allowed' | 'denied' | 'error'

function PermissionCheck() {
  const [results, setResults] = useState<Record<string, ProbeResult>>({})

  useEffect(() => {
    let active = true
    for (const { path } of PROBES) {
      api.get(path).then(
        () => active && setResults((r) => ({ ...r, [path]: 'allowed' })),
        (err) =>
          active &&
          setResults((r) => ({
            ...r,
            [path]: axios.isAxiosError(err) && err.response?.status === 403 ? 'denied' : 'error',
          })),
      )
    }
    return () => {
      active = false
    }
  }, [])

  const text: Record<ProbeResult, string> = { checking: 'Checking…', allowed: 'Allowed', denied: 'Denied (403)', error: 'Error' }
  const color: Record<ProbeResult, string> = { checking: 'text-ink/40', allowed: 'text-gold', denied: 'text-error', error: 'text-error' }

  return (
    <section aria-labelledby="perm-heading">
      <h2 id="perm-heading" className="label-caps mb-6 text-ink/50">Your permissions</h2>
      <ul className="divide-y divide-stone/10 border-y border-stone/10">
        {PROBES.map(({ label, path }) => {
          const r = results[path] ?? 'checking'
          return (
            <li key={path} className="flex items-center justify-between gap-6 py-4">
              <span>
                {label}
                <code className="ml-3 text-xs text-ink/40">GET /api{path}</code>
              </span>
              <span className={`label-caps ${color[r]}`}>{text[r]}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (next.length < 8 || next.length > 72) return fail('New password must be 8 to 72 characters.')
    if (next !== confirm) return fail('The new passwords do not match.')
    setStatus('saving')
    try {
      await changeOwnPassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      setStatus('saved')
    } catch (err) {
      fail(errorMessage(err, 'Password could not be changed.'))
    }
  }

  function fail(msg: string) {
    setMessage(msg)
    setStatus('error')
  }

  const input = 'w-full border-b border-stone/30 bg-transparent py-2 outline-none transition-colors focus:border-bronze'
  const field = (id: string, label: string, value: string, set: (v: string) => void, autoComplete: string) => (
    <div>
      <label htmlFor={id} className="label-caps mb-3 block text-ink/60">{label}</label>
      <input id={id} type="password" value={value} onChange={(e) => set(e.target.value)} autoComplete={autoComplete} className={input} />
    </div>
  )

  return (
    <section aria-labelledby="pw-heading">
      <h2 id="pw-heading" className="label-caps mb-6 text-ink/50">Change your password</h2>
      <form noValidate onSubmit={onSubmit} className="max-w-md space-y-8">
        {field('current-password', 'Current password', current, setCurrent, 'current-password')}
        {field('new-password', 'New password', next, setNext, 'new-password')}
        {field('confirm-password', 'Confirm new password', confirm, setConfirm, 'new-password')}
        <div aria-live="polite">
          {status === 'saved' && <p className="text-sm text-gold">Password changed.</p>}
          {status === 'error' && <p role="alert" className="text-sm text-error">{message}</p>}
        </div>
        <button
          type="submit"
          disabled={status === 'saving' || !current || !next}
          className="label-caps border border-transparent bg-paper px-8 py-3 text-void press hover:border-bronze hover:text-bronze disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </section>
  )
}

export default function Account() {
  const { session } = useAuth()
  return (
    <div className="space-y-20">
      <div>
        <p className="label-caps mb-4 text-ink/50">Signed in</p>
        <h1 className="headline-lg">Welcome, {session?.username}.</h1>
      </div>
      <div className="grid gap-20 lg:grid-cols-2">
        <PermissionCheck />
        <ChangePassword />
      </div>
    </div>
  )
}
