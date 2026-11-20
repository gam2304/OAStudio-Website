import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ErrorState, Loading } from '../../components/common/Status'
import { createAdmin, deleteAdmin, listAdmins, resetAdminPassword } from '../../services/adminApi'
import { errorMessage } from '../../services/api'
import type { AdminAccount } from '../../types'

const MAX_ADMINS = 5 // mirrors AdminServiceImpl.MAX_ADMINS
const input = 'w-full border-b border-stone/30 bg-transparent py-2 outline-none transition-colors focus:border-bronze'
const button =
  'label-caps border border-transparent bg-paper px-8 py-3 text-void press hover:border-bronze hover:text-bronze disabled:opacity-50'

function CreateAdminForm({ onCreated, full }: { onCreated: () => void; full: boolean }) {
  const empty = { username: '', email: '', password: '' }
  const [form, setForm] = useState(empty)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      await createAdmin({ ...form, username: form.username.trim(), email: form.email.trim() })
      setForm(empty)
      onCreated()
    } catch (err) {
      setError(errorMessage(err, 'The admin could not be created.'))
    } finally {
      setPending(false)
    }
  }

  const field = (k: keyof typeof empty, label: string, type: string, autoComplete: string) => (
    <div>
      <label htmlFor={`new-${k}`} className="label-caps mb-3 block text-ink/60">{label}</label>
      <input
        id={`new-${k}`}
        type={type}
        value={form[k]}
        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
        autoComplete={autoComplete}
        className={input}
      />
    </div>
  )

  return (
    <section aria-labelledby="create-heading">
      <h2 id="create-heading" className="label-caps mb-6 text-ink/50">Add an admin</h2>
      {full ? (
        <p className="text-ink/60">The limit of {MAX_ADMINS} admins is reached. Remove one to add another.</p>
      ) : (
        <form noValidate onSubmit={onSubmit} className="max-w-md space-y-8">
          {field('username', 'Username', 'text', 'off')}
          {field('email', 'Email', 'email', 'off')}
          {field('password', 'Temporary password (8–72 characters)', 'password', 'new-password')}
          <div aria-live="polite">{error && <p role="alert" className="text-sm text-error">{error}</p>}</div>
          <button type="submit" disabled={pending} className={button}>
            {pending ? 'Adding…' : 'Add admin'}
          </button>
        </form>
      )}
    </section>
  )
}

function AdminRow({ admin, onChanged }: { admin: AdminAccount; onChanged: () => void }) {
  const [mode, setMode] = useState<'view' | 'reset'>('view')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const isMain = admin.role === 'SUPER_ADMIN'

  async function run(action: () => Promise<unknown>, ok: string) {
    setPending(true)
    setMessage(null)
    try {
      await action()
      setMessage({ ok: true, text: ok })
      return true
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
      return false
    } finally {
      setPending(false)
    }
  }

  async function onRemove() {
    if (!window.confirm(`Remove ${admin.username}? They lose access immediately.`)) return
    if (await run(() => deleteAdmin(admin.id), 'Removed.')) onChanged()
  }

  async function onReset(e: FormEvent) {
    e.preventDefault()
    if (await run(() => resetAdminPassword(admin.id, password), 'Password reset. Share it with them securely.')) {
      setPassword('')
      setMode('view')
    }
  }

  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p>
            {admin.username}
            <span className={`label-caps ml-3 ${isMain ? 'text-gold' : 'text-ink/40'}`}>{isMain ? 'Main admin' : 'Admin'}</span>
          </p>
          <p className="text-sm text-ink/50">{admin.email}</p>
        </div>
        {!isMain && (
          <div className="flex gap-6">
            <button type="button" disabled={pending} onClick={() => setMode(mode === 'reset' ? 'view' : 'reset')} className="label-caps text-ink/60 hover:text-bronze disabled:opacity-50">
              Reset password
            </button>
            <button type="button" disabled={pending} onClick={onRemove} className="label-caps text-error hover:text-bronze disabled:opacity-50">
              Remove
            </button>
          </div>
        )}
      </div>
      {mode === 'reset' && (
        <form noValidate onSubmit={onReset} className="mt-4 flex max-w-md items-end gap-6">
          <div className="flex-1">
            <label htmlFor={`reset-${admin.id}`} className="label-caps mb-3 block text-ink/60">New password</label>
            <input id={`reset-${admin.id}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={input} />
          </div>
          <button type="submit" disabled={pending || !password} className={button}>Save</button>
        </form>
      )}
      {message && (
        <p role={message.ok ? 'status' : 'alert'} className={`mt-3 text-sm ${message.ok ? 'text-gold' : 'text-error'}`}>
          {message.text}
        </p>
      )}
    </li>
  )
}

export default function Admins() {
  const [admins, setAdmins] = useState<AdminAccount[] | null>(null)
  const [error, setError] = useState<unknown>(null)

  const reload = useCallback(() => {
    listAdmins().then(
      (list) => {
        setAdmins(list)
        setError(null)
      },
      setError,
    )
  }, [])

  useEffect(reload, [reload])

  // A regular admin who types the URL sees the server's 403 message
  if (error) return <ErrorState error={error} fallback="Admin accounts could not be loaded." />
  if (!admins) return <Loading label="Loading admins" />

  return (
    <div className="space-y-16">
      <div>
        <p className="label-caps mb-4 text-ink/50">Main admin</p>
        <h1 className="headline-lg">Admin accounts</h1>
        <p className="mt-4 text-ink/60">{admins.length} of {MAX_ADMINS} accounts used.</p>
      </div>
      <div className="grid gap-20 lg:grid-cols-2">
        <section aria-labelledby="list-heading">
          <h2 id="list-heading" className="label-caps mb-6 text-ink/50">Accounts</h2>
          <ul className="divide-y divide-stone/10 border-y border-stone/10">
            {admins.map((a) => <AdminRow key={a.id} admin={a} onChanged={reload} />)}
          </ul>
        </section>
        <CreateAdminForm onCreated={reload} full={admins.length >= MAX_ADMINS} />
      </div>
    </div>
  )
}
