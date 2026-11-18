import { MotionConfig } from 'framer-motion'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import Admins from './pages/admin/Admins'
import Login from './pages/admin/Login'
import Overview from './pages/admin/Overview'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Home from './pages/public/Home'
import NotFound from './pages/public/NotFound'
import ProjectDetails from './pages/public/ProjectDetails'
import Projects from './pages/public/Projects'

export default function App() {
  return (
    // Honour the OS "reduce motion" setting for every Framer animation
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="atelier-control/login" element={<Login />} />
        <Route path="atelier-control" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="admins" element={<Admins />} />
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
    </MotionConfig>
  )
}
