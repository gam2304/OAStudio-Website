import { Link } from 'react-router-dom'
import { site } from '../../content/site'

const year = new Date().getFullYear()

export function Footer() {
  const social = site.social.filter((s) => s.href)
  return (
    <footer className="page-x border-t border-stone/10 bg-void pb-12 pt-24">
      <p className="font-display text-5xl uppercase tracking-tight text-ink/10 md:text-8xl">{site.name}</p>

      <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="label-caps mb-6 text-ink">Navigation</h2>
          <ul className="space-y-3 text-sm text-ink/50">
            <li><Link className="hover:text-bronze" to="/">Home</Link></li>
            <li><Link className="hover:text-bronze" to="/projects">Projects</Link></li>
            <li><Link className="hover:text-bronze" to="/about">Studio</Link></li>
            <li><Link className="hover:text-bronze" to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="label-caps mb-6 text-ink">Social</h2>
          {social.length ? (
            <ul className="space-y-3 text-sm text-ink/50">
              {social.map((s) => (
                <li key={s.label}>
                  <a className="hover:text-bronze" href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/30">Coming soon</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <h2 className="label-caps mb-6 text-ink">Office</h2>
          <address className="space-y-2 text-sm not-italic text-ink/50">
            <p>{site.contact.address}</p>
            <p>{site.contact.phone}</p>
            <p>{site.contact.email}</p>
          </address>
        </div>
      </div>

      <p className="label-caps mt-20 text-[10px] text-ink/30">
        © {year} {site.name}. All rights reserved.
      </p>
    </footer>
  )
}
