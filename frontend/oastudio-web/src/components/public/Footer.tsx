import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '../../content/site'
import { useLang } from '../../i18n/LanguageContext'

const year = new Date().getFullYear()

export function Footer() {
  const social = site.social.filter((s) => s.href)
  const { t } = useLang()
  return (
    <footer className="page-x border-t border-stone/10 bg-void pb-12 pt-24">
      <p className="font-display text-5xl uppercase tracking-tight text-ink/10 md:text-8xl">{site.name}</p>

      <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="label-caps mb-6 text-ink">{t.footer.navigation}</h2>
          <ul className="space-y-3 text-sm text-ink/50">
            <li><Link className="hover:text-bronze" to="/">{t.nav.home}</Link></li>
            <li><Link className="hover:text-bronze" to="/projects">{t.nav.projects}</Link></li>
            <li><Link className="hover:text-bronze" to="/about">{t.nav.studio}</Link></li>
            <li><Link className="hover:text-bronze" to="/contact">{t.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="label-caps mb-6 text-ink">{t.footer.social}</h2>
          {social.length ? (
            <ul className="space-y-3 text-sm text-ink/50">
              {social.map((s) => (
                <li key={s.label}>
                  <a className="hover:text-bronze" href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/30">{t.footer.comingSoon}</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <h2 className="label-caps mb-6 text-ink">{t.footer.office}</h2>
          <address className="space-y-2 text-sm not-italic text-ink/50">
            <p>{site.contact.address}</p>
            <p><a href={`tel:${site.contact.tel}`} className="hover:text-bronze">{site.contact.phone}</a></p>
            <p><a href={`mailto:${site.contact.email}`} className="hover:text-bronze">{site.contact.email}</a></p>
            <p>{t.contact.hours.join(' · ')}</p>
          </address>
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="label-caps mt-8 inline-flex items-center gap-3 border border-transparent bg-paper px-8 py-4 text-void transition-colors duration-500 hover:border-bronze hover:text-bronze"
          >
            <MessageCircle size={16} strokeWidth={1.5} aria-hidden />
            {t.footer.whatsapp}
          </a>
        </div>
      </div>

      <p className="label-caps mt-20 text-[10px] text-ink/30">
        © {year} {site.name}. {t.footer.rights}
      </p>
    </footer>
  )
}
