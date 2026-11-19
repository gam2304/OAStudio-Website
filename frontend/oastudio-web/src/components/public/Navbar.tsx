import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { site } from '../../content/site'
import { useLang } from '../../i18n/LanguageContext'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const close = () => setOpen(false)
  const { lang, t, setLang } = useLang()
  const links = [
    { to: '/', label: t.nav.home },
    { to: '/projects', label: t.nav.projects },
    { to: '/about', label: t.nav.studio },
    { to: '/founder', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <header
        className={`page-x fixed inset-x-0 top-0 z-50 flex items-center justify-between py-6 transition-colors duration-300 ease-out ${
          scrolled && !open ? 'bg-void' : 'bg-transparent'
        }`}
      >
        <Link to="/" onClick={close} className="flex items-center gap-3" aria-label={`${site.name} ${t.nav.homeLink}`}>
          <img src="/logo.png" alt="" className="h-8 w-8 invert" />
          <span className="font-display text-xl font-medium tracking-tight md:text-2xl">{site.name}</span>
        </Link>

        <div className="flex items-center gap-6 md:gap-10">
          <NavLink
            to="/founder"
            onClick={close}
            className={({ isActive }) =>
              `label-caps hidden transition-colors duration-200 hover:text-bronze md:inline-block ${isActive ? 'text-gold' : ''}`
            }
          >
            {t.nav.about}
          </NavLink>
          <Link
            to="/contact"
            onClick={close}
            className="label-caps hidden border border-transparent bg-paper px-8 py-3 text-void press hover:border-bronze hover:text-bronze sm:inline-block"
          >
            {t.nav.consultation}
          </Link>
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            aria-label={t.nav.switchLang}
            className="label-caps press p-2 hover:text-bronze"
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="press p-2 hover:text-bronze"
          >
            {open ? <X strokeWidth={1.25} /> : <Menu strokeWidth={1.25} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu"
            aria-label={t.nav.main}
            className="page-x fixed inset-0 z-40 flex flex-col justify-center bg-void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
            // Exit faster than enter: the visitor already chose where to go
            exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }}
          >
            <ul className="space-y-4 md:space-y-6">
              {links.map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={close}
                    className={({ isActive }) =>
                      `display-xl transition-colors duration-200 hover:text-bronze ${isActive ? 'text-gold' : 'text-ink'}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
