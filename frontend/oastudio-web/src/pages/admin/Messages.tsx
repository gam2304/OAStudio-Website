import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, formatDate, Notice, PageHeader, StatusBadge } from '../../components/admin/ui'
import { ErrorState, Loading } from '../../components/common/Status'
import { useApi } from '../../hooks/useApi'
import { adminMessages } from '../../services/adminApi'
import { errorMessage } from '../../services/api'
import type { MessageStatus } from '../../types'

type Filter = 'INBOX' | MessageStatus

export default function Messages() {
  const { data: messages, error, loading, reload } = useApi(adminMessages.list)
  const [params, setParams] = useSearchParams()
  const openId = Number(params.get('open')) || null
  const [filter, setFilter] = useState<Filter>('INBOX')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const open = messages?.find((m) => m.id === openId) ?? null

  // Opening a new message marks it read
  useEffect(() => {
    if (open?.status === 'NEW') adminMessages.setStatus(open.id, 'READ').then(reload, () => {})
  }, [open?.id, open?.status, reload])

  if (error) return <ErrorState error={error} fallback="Messages could not be loaded." />
  if (loading && !messages) return <Loading label="Loading messages" />
  if (!messages) return null

  const visible = messages.filter((m) => (filter === 'INBOX' ? m.status !== 'ARCHIVED' : m.status === filter))
  const select = (id: number | null) => setParams(id ? { open: String(id) } : {})

  async function act(action: () => Promise<unknown>, ok: string, close = false) {
    setBusy(true)
    setNotice(null)
    try {
      await action()
      setNotice({ ok: true, text: ok })
      if (close) select(null)
      reload()
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: 'INBOX', label: 'Inbox' },
    { key: 'NEW', label: 'New' },
    { key: 'ARCHIVED', label: 'Archived' },
  ]
  const countFor = (f: Filter) => messages.filter((m) => (f === 'INBOX' ? m.status !== 'ARCHIVED' : m.status === f)).length

  return (
    <div>
      <PageHeader eyebrow="Contact form" title="Messages" />

      <div className="mb-8 flex flex-wrap gap-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={filter === t.key}
            onClick={() => setFilter(t.key)}
            className={`label-caps pb-2 transition-colors ${filter === t.key ? 'border-b border-bronze text-ink' : 'text-ink/50 hover:text-bronze'}`}
          >
            {t.label} <span className="text-ink/30">{countFor(t.key)}</span>
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mb-4 min-h-5">{notice && <Notice tone={notice.ok ? 'ok' : 'error'}>{notice.text}</Notice>}</div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ul className="max-h-[70vh] divide-y divide-stone/10 overflow-y-auto border-y border-stone/10">
          {visible.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => select(m.id)}
                aria-current={m.id === openId}
                className={`block w-full px-4 py-4 text-left transition-colors hover:bg-surface-low ${m.id === openId ? 'bg-surface-low' : ''}`}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className={m.status === 'NEW' ? 'font-medium text-ink' : 'text-ink/80'}>{m.senderName}</span>
                  <span className="shrink-0 text-xs text-ink/40">{formatDate(m.createdAt)}</span>
                </span>
                <span className="mt-1 block truncate text-sm text-ink/50">{m.subject || m.message}</span>
              </button>
            </li>
          ))}
          {visible.length === 0 && <li className="px-4 py-8 text-ink/50">No messages here.</li>}
        </ul>

        {open ? (
          <article aria-labelledby="message-subject" className="border border-stone/10 p-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="message-subject" className="headline-md mb-2">{open.subject || 'No subject'}</h2>
                <p className="text-sm text-ink/60">
                  {open.senderName} · <a href={`mailto:${open.senderEmail}`} className="hover:text-bronze">{open.senderEmail}</a>
                  {open.senderPhone && <> · <a href={`tel:${open.senderPhone.replace(/[^+0-9]/g, '')}`} className="hover:text-bronze">{open.senderPhone}</a></>}
                </p>
                {open.projectType && <p className="label-caps mt-2 text-ink/50">{open.projectType}</p>}
                <p className="mt-1 text-xs text-ink/40">{open.createdAt ? new Date(open.createdAt).toLocaleString() : ""}</p>
              </div>
              <StatusBadge status={open.status} />
            </div>
            <p className="whitespace-pre-wrap leading-7 text-ink/80">{open.message}</p>
            <div className="mt-10 flex flex-wrap gap-6 border-t border-stone/10 pt-6">
              <a
                href={`mailto:${open.senderEmail}?subject=${encodeURIComponent('Re: ' + (open.subject || 'Your inquiry'))}`}
                className="label-caps border border-transparent bg-paper px-6 py-3 text-void press hover:border-bronze hover:bg-void hover:text-bronze"
              >
                Reply by email
              </a>
              {open.status === 'ARCHIVED' ? (
                <Button variant="secondary" disabled={busy} onClick={() => act(() => adminMessages.setStatus(open.id, 'READ'), 'Moved back to the inbox.')}>
                  Unarchive
                </Button>
              ) : (
                <Button variant="secondary" disabled={busy} onClick={() => act(() => adminMessages.setStatus(open.id, 'ARCHIVED'), 'Archived.', true)}>
                  Archive
                </Button>
              )}
              <Button
                variant="danger"
                disabled={busy}
                onClick={() => window.confirm('Delete this message permanently?') && act(() => adminMessages.remove(open.id), 'Message deleted.', true)}
              >
                Delete
              </Button>
            </div>
          </article>
        ) : (
          <p className="flex items-center justify-center border border-dashed border-stone/20 p-16 text-sm text-ink/40">Select a message to read it.</p>
        )}
      </div>
    </div>
  )
}
