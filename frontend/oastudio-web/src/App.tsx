import { MotionConfig } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Loading } from './components/common/Status'
import PublicLayout from './layouts/PublicLayout'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Home from './pages/public/Home'
import NotFound from './pages/public/NotFound'
import ProjectDetails from './pages/public/ProjectDetails'
import Projects from './pages/public/Projects'

// Admin pages load on demand, so public visitors never download them
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const Login = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ProjectsList = lazy(() => import('./pages/admin/ProjectsList'))
const ProjectForm = lazy(() => import('./pages/admin/ProjectForm'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const Messages = lazy(() => import('./pages/admin/Messages'))
const Admins = lazy(() => import('./pages/admin/Admins'))
const Account = lazy(() => import('./pages/admin/Account'))

export default function App() {
  return (
    // Honour the OS "reduce motion" setting for every Framer animation
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-void"><Loading /></div>}>
        <Routes>
          <Route path="atelier-control/login" element={<Login />} />
          <Route path="atelier-control" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id" element={<ProjectForm key="edit" />} />
            <Route path="categories" element={<Categories />} />
            <Route path="messages" element={<Messages />} />
            <Route path="admins" element={<Admins />} />
            <Route path="account" element={<Account />} />
          </Route>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetails />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </MotionConfig>
  )
}
