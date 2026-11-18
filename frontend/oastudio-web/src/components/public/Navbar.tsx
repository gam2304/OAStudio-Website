import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { site } from '../../content/site'

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'Studio' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const close = () => setOpen(false)

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
        className={`page-x fixed inset-x-0 top-0 z-50 flex items-center justify-between transition-[background-color,padding] duration-700 ease-calm ${
          scrolled && !open ? 'bg-void py-5' : 'bg-transparent py-8'
        }`}
      >
        <Link to="/" onClick={close} className="flex items-center gap-3" aria-label={`${site.name} home`}>
          <img src="/logo.png" alt="" className="h-8 w-8 invert" />
          <span className="font-display text-xl font-bold tracking-tighter md:text-2xl">{site.name}</span>
        </Link>

        <div className="flex items-center gap-6 md:gap-10">
          <Link
            to="/contact"
            onClick={close}
            className="label-caps hidden border border-transparent bg-paper px-8 py-3 text-void transition-colors duration-500 hover:border-bronze hover:text-bronze sm:inline-block"
          >
            Consultation
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="p-2 transition-colors hover:text-bronze"
          >
            {open ? <X strokeWidth={1.25} /> : <Menu strokeWidth={1.25} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu"
            aria-label="Main"
            className="page-x fixed inset-0 z-40 flex flex-col justify-center bg-void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="space-y-4 md:space-y-6">
              {links.map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={close}
                    className={({ isActive }) =>
                      `display-xl transition-colors duration-500 hover:text-bronze ${isActive ? 'text-gold italic' : 'text-ink'}`
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
