import { MotionConfig } from 'framer-motion'
import { Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
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
