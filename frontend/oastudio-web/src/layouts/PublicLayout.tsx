import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../components/public/Footer'
import { LanguagePrompt } from '../components/public/LanguagePrompt'
import { Navbar } from '../components/public/Navbar'
import { useLang } from '../i18n/LanguageContext'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const { t } = useLang()

  // Braces matter: scrollTo can return a Promise, which React would treat as a cleanup
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="label-caps sr-only z-[60] bg-paper p-4 text-void focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t.nav.skip}
      </a>
      <Navbar />
      <motion.main
        id="main"
        key={pathname}
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <LanguagePrompt />
    </div>
  )
}
