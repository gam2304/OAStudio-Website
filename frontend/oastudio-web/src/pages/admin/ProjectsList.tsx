import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, formatDate, Notice, PageHeader } from '../../components/admin/ui'
import { ErrorState, Loading } from '../../components/common/Status'
import { byMostRecent } from '../../utils/sortByRecent'
import { useApi } from '../../hooks/useApi'
import { adminProjects } from '../../services/adminApi'
import { errorMessage } from '../../services/api'
import type { Project, ProjectStatus } from '../../types'

const STATUSES: ProjectStatus[] = ['PUBLISHED', 'DRAFT', 'ARCHIVED']

export default function ProjectsList() {
  const { data: projects, error, loading, reload } = useApi(adminProjects.list)
  const [params, setParams] = useSearchParams()
  const filter = params.get('status') as ProjectStatus | null
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  if (error) return <ErrorState error={error} fallback="Projects could not be loaded." />
  if (loading && !projects) return <Loading label="Loading projects" />
  if (!projects) return null

  const q = query.trim().toLowerCase()
  const visible = projects
    .filter((p) => !filter || p.status === filter)
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.category?.categoryName.toLowerCase().includes(q))
    .sort(byMostRecent)

  async function act(p: Project, action: () => Promise<unknown>, ok: string) {
    setBusyId(p.id)
    setMessage(null)
    try {
      await action()
      setMessage({ ok: true, text: ok })
      reload()
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    } finally {
      setBusyId(null)
    }
  }

  const remove = (p: Project) => {
    if (!window.confirm(`Delete "${p.title}" and all its photos? This cannot be undone.`)) return
    act(p, () => adminProjects.remove(p.id), `"${p.title}" deleted.`)
  }

  const tab = (status: ProjectStatus | null, label: string, n: number) => (
    <button
      type="button"
      onClick={() => setParams(status ? { status } : {})}
      aria-pressed={filter === status}
      className={`label-caps pb-2 transition-colors ${filter === status ? 'border-b border-bronze text-ink' : 'text-ink/50 hover:text-bronze'}`}
    >
      {label} <span className="text-ink/30">{n}</span>
    </button>
  )

  return (
    <div>
      <PageHeader eyebrow="Portfolio" title="Projects">
        <Link to="/atelier-control/projects/new" className="label-caps border border-transparent bg-paper px-6 py-3 text-void press hover:border-bronze hover:bg-void hover:text-bronze">
          New project
        </Link>
      </PageHeader>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap gap-8">
          {tab(null, 'All', projects.length)}
          {STATUSES.map((s) => tab(s, s.charAt(0) + s.slice(1).toLowerCase(), projects.filter((p) => p.status === s).length))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or category"
          aria-label="Search projects"
          className="w-64 rounded-none border-0 border-b border-stone/30 bg-transparent py-2 text-sm outline-none focus:border-bronze"
        />
      </div>

      <div aria-live="polite" className="mb-4 min-h-5">{message && <Notice tone={message.ok ? 'ok' : 'error'}>{message.text}</Notice>}</div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="label-caps text-ink/40">
            <tr className="border-b border-stone/10">
              <th scope="col" className="w-20 py-3 font-medium">Cover</th>
              <th scope="col" className="py-3 font-medium">Title</th>
              <th scope="col" className="py-3 font-medium">Category</th>
              <th scope="col" className="py-3 font-medium">Status</th>
              <th scope="col" className="py-3 font-medium">Updated</th>
              <th scope="col" className="py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/10">
            {visible.map((p) => (
              <tr key={p.id} className={busyId === p.id ? 'opacity-50' : ''}>
                <td className="py-3">
                  {p.coverImageUrl ? (
                    <img src={p.coverImageUrl.replace('/upload/', '/upload/c_fill,w_120,h_80,f_auto,q_auto/')} alt="" className="h-10 w-16 object-cover" />
                  ) : (
                    <span className="block h-10 w-16 bg-surface-high" />
                  )}
                </td>
                <td className="py-3">
                  <Link to={`/atelier-control/projects/${p.id}`} className="hover:text-bronze">{p.title}</Link>
                  <p className="text-xs text-ink/40">/{p.slug}</p>
                </td>
                <td className="py-3 text-ink/70">{p.category?.categoryName ?? '—'}</td>
                <td className="py-3">
                  <select
                    value={p.status}
                    disabled={busyId === p.id}
                    onChange={(e) => {
                      const status = e.target.value as ProjectStatus
                      act(p, () => adminProjects.setStatus(p.id, status), `"${p.title}" is now ${status.toLowerCase()}.`)
                    }}
                    aria-label={`Status of ${p.title}`}
                    className="label-caps rounded-none border-0 border-b border-stone/30 bg-transparent py-1 outline-none focus:border-bronze [&>option]:bg-void"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                </td>
                <td className="py-3 text-sm text-ink/50">{formatDate(p.updatedAt)}</td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-6">
                    <Link to={`/atelier-control/projects/${p.id}`} className="label-caps text-ink/60 hover:text-bronze">Edit</Link>
                    {p.status === 'PUBLISHED' && (
                      <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer" className="label-caps text-ink/60 hover:text-bronze">View</a>
                    )}
                    <Button variant="danger" disabled={busyId === p.id} onClick={() => remove(p)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="py-12 text-center text-ink/50">No projects match.</p>}
      </div>
    </div>
  )
}
