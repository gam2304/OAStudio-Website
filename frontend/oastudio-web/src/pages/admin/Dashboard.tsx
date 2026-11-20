import { Link } from 'react-router-dom'
import { formatDate, PageHeader, StatusBadge } from '../../components/admin/ui'
import { ErrorState, Loading } from '../../components/common/Status'
import { byMostRecent } from '../../utils/sortByRecent'
import { useApi } from '../../hooks/useApi'
import { adminCategories, adminMessages, adminProjects } from '../../services/adminApi'

// No stats endpoint: counts come from the existing list endpoints
const loadDashboard = () =>
  Promise.all([adminProjects.list(), adminCategories.list(), adminMessages.list()]).then(
    ([projects, categories, messages]) => ({ projects, categories, messages }),
  )

export default function Dashboard() {
  const { data, error, loading } = useApi(loadDashboard)

  if (error) return <ErrorState error={error} fallback="The dashboard could not be loaded." />
  if (loading && !data) return <Loading label="Loading dashboard" />
  if (!data) return null

  const { projects, categories, messages } = data
  const count = (status: string) => projects.filter((p) => p.status === status).length
  const newMessages = messages.filter((m) => m.status === 'NEW')

  const stats = [
    { label: 'Published projects', value: count('PUBLISHED'), to: '/atelier-control/projects?status=PUBLISHED' },
    { label: 'Drafts', value: count('DRAFT'), to: '/atelier-control/projects?status=DRAFT' },
    { label: 'Categories', value: categories.length, to: '/atelier-control/categories' },
    { label: 'New messages', value: newMessages.length, to: '/atelier-control/messages' },
  ]

  return (
    <div>
      <PageHeader eyebrow="Back office" title="Dashboard">
        <Link to="/atelier-control/projects/new" className="label-caps border border-transparent bg-paper px-6 py-3 text-void press hover:border-bronze hover:bg-void hover:text-bronze">
          New project
        </Link>
      </PageHeader>

      <ul className="mb-20 grid grid-cols-2 gap-px border border-stone/10 bg-stone/10 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="bg-void">
            <Link to={s.to} className="block p-8 transition-colors hover:bg-surface-low">
              <p className="font-display text-5xl">{s.value}</p>
              <p className="label-caps mt-3 text-ink/50">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-16 lg:grid-cols-2">
        <section aria-labelledby="recent-projects">
          <h2 id="recent-projects" className="label-caps mb-6 text-ink/50">Recently updated projects</h2>
          <ul className="divide-y divide-stone/10 border-y border-stone/10">
            {[...projects]
              .sort(byMostRecent)
              .slice(0, 5)
              .map((p) => (
                <li key={p.id}>
                  <Link to={`/atelier-control/projects/${p.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-bronze">
                    <span>{p.title}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            {projects.length === 0 && <li className="py-4 text-ink/50">No projects yet.</li>}
          </ul>
        </section>

        <section aria-labelledby="recent-messages">
          <h2 id="recent-messages" className="label-caps mb-6 text-ink/50">New messages</h2>
          <ul className="divide-y divide-stone/10 border-y border-stone/10">
            {newMessages.slice(0, 5).map((m) => (
              <li key={m.id}>
                <Link to={`/atelier-control/messages?open=${m.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-bronze">
                  <span className="truncate">
                    {m.senderName}
                    <span className="ml-3 text-ink/50">{m.subject || m.message.slice(0, 60)}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink/40">{formatDate(m.createdAt)}</span>
                </Link>
              </li>
            ))}
            {newMessages.length === 0 && <li className="py-4 text-ink/50">No new messages.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}
