import { Suspense } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { Loading } from '../components/common/Status'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { adminMessages } from '../services/adminApi'
import { isSuperAdmin } from '../services/session'

function NewMessagesBadge() {
  const { pathname } = useLocation()
  // Refreshed on every page change, so it drops after reading messages
  const { data } = useApi(adminMessages.countNew, [pathname])
  return data ? <span className="ml-2 bg-gold px-1.5 py-0.5 text-[10px] text-void">{data}</span> : null
}

export default function AdminLayout() {
  const { session, logout } = useAuth()
  const location = useLocation()

  if (!session) return <Navigate to="/atelier-control/login" replace state={{ from: location.pathname }} />

  const link = ({ isActive }: { isActive: boolean }) =>
    `label-caps transition-colors hover:text-bronze ${isActive ? 'text-gold' : 'text-ink/60'}`

  return (
    <div className="min-h-screen bg-void">
      <header className="page-x flex flex-wrap items-center justify-between gap-6 border-b border-stone/10 py-6">
        <nav aria-label="Admin" className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="font-display text-xl">Atelier control</span>
          <NavLink to="/atelier-control" end className={link}>Dashboard</NavLink>
          <NavLink to="/atelier-control/home" className={link}>Home page</NavLink>
          <NavLink to="/atelier-control/projects" className={link}>Projects</NavLink>
          <NavLink to="/atelier-control/categories" className={link}>Categories</NavLink>
          <NavLink to="/atelier-control/messages" className={link}>
            Messages
            <NewMessagesBadge />
          </NavLink>
          {isSuperAdmin(session) && <NavLink to="/atelier-control/admins" className={link}>Admins</NavLink>}
        </nav>
        <div className="flex items-center gap-6">
          <NavLink to="/atelier-control/account" className={({ isActive }) => `text-sm transition-colors hover:text-bronze ${isActive ? 'text-gold' : 'text-ink/60'}`}>
            {session.username}
            <span className="label-caps ml-3 text-ink/50">{isSuperAdmin(session) ? 'Main admin' : 'Admin'}</span>
          </NavLink>
          <a href="/" target="_blank" rel="noreferrer" className="label-caps text-ink/60 hover:text-bronze">Site ↗</a>
          <button type="button" onClick={logout} className="label-caps text-ink/60 hover:text-bronze">
            Sign out
          </button>
        </div>
      </header>
      <main className="page-x mx-auto max-w-[1440px] py-16">
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
