import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../../components/common/Reveal'
import { ErrorState, Loading } from '../../components/common/Status'
import { OfficeMap } from '../../components/public/OfficeMap'
import { ProjectCard } from '../../components/public/ProjectCard'
import { tr, type HomeContent, type SectionId } from '../../content/homeContent'
import { useApi } from '../../hooks/useApi'
import { useHomeContent } from '../../hooks/useHomeContent'
import { useLang } from '../../i18n/LanguageContext'
import { getProjects } from '../../services/publicApi'

// Section order, visibility, texts, images and selected projects all come from the admin (Atelier control → Home page)
export default function Home() {
  const content = useHomeContent()
  // Hold the hero area dark until the admin's content arrives, instead of flashing the defaults
  if (!content) return <div className="h-svh bg-void" />
  return (
    <>
      {content.sections
        .filter((s) => s.visible)
        .map((s) => (
          <Section key={s.id} id={s.id} content={content} />
        ))}
    </>
  )
}

function Section({ id, content }: { id: SectionId; content: HomeContent }): ReactNode {
  switch (id) {
    case 'hero':
      return <Hero c={content.hero} />
    case 'featured':
      return <Featured c={content.featured} />
    case 'founder':
      return <Founder c={content.founder} />
    case 'studio':
      return <Studio c={content.studio} />
    case 'services':
      return <Services c={content.services} />
    case 'cta':
      return <Cta c={content.cta} />
    case 'map':
      return (
        <section className="page-x mx-auto my-section max-w-[1440px]">
          <OfficeMap />
        </section>
      )
  }
}

function Hero({ c }: { c: HomeContent['hero'] }) {
  const { t, lang } = useLang()
  const caption = tr(c.caption, lang)
  return (
    <section className="relative h-svh min-h-[640px] w-full overflow-hidden bg-void">
      <img src={c.imageUrl} alt="" className="h-full w-full object-cover object-[70%_center]" />
      {/* Neutral scrims shade only the text side and the bottom edge; the building keeps full light */}
      <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/60 to-transparent md:via-void/50" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-surface to-transparent" />
      <motion.div
        className="page-x absolute inset-x-0 bottom-16 md:bottom-24"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="display-xl max-w-3xl">{tr(c.headline, lang)}</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-ink/80">{tr(c.intro, lang)}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/contact"
            className="press border border-transparent bg-paper px-8 py-4 text-sm font-medium text-void hover:border-bronze hover:text-bronze"
          >
            {t.home.startProject}
          </Link>
          <Link to="/projects" className="press border border-ink/40 px-8 py-4 text-sm font-medium hover:border-bronze hover:text-bronze">
            {t.home.seeProjects}
          </Link>
        </div>
      </motion.div>
      {caption && (
        <Link
          to={c.captionLink || '/projects'}
          className="press absolute bottom-6 right-6 hidden items-center gap-2 text-xs text-ink/60 hover:text-bronze md:right-20 md:flex"
        >
          {caption}
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Link>
      )}
    </section>
  )
}

// First card full width, then pairs offset like the original three-up layout
const featuredLayout = (i: number) =>
  i % 3 === 0 ? 'md:col-span-12' : i % 3 === 1 ? 'md:col-span-5' : 'md:col-span-6 md:col-start-7 md:mt-32'

function Featured({ c }: { c: HomeContent['featured'] }) {
  const { t, lang } = useLang()
  const { data: projects, error, loading } = useApi(getProjects)
  const all = projects ?? []
  // Admin's picks in their order (unpublished or deleted ones simply drop out); otherwise the three newest
  const featured = c.projectIds.length
    ? c.projectIds.map((id) => all.find((p) => p.id === id)).filter((p) => p !== undefined)
    : all.slice(0, 3)

  return (
    <section className="page-x mt-section mx-auto max-w-[1440px]">
      <Reveal className="mb-16 flex items-end justify-between gap-8">
        <div>
          <p className="label-caps mb-4 text-ink/50">{tr(c.eyebrow, lang)}</p>
          <h2 className="headline-lg">{tr(c.title, lang)}</h2>
        </div>
        <Link to="/projects" className="label-caps border-b border-ink/30 pb-1 transition-colors hover:border-bronze hover:text-bronze">
          {t.home.viewAll}
        </Link>
      </Reveal>
      {loading && <Loading label={t.status.loading} />}
      {!!error && <ErrorState error={error} fallback={t.status.error} />}
      {projects && !featured.length && <p className="text-ink/50">{t.home.noProjects}</p>}
      {!!featured.length && (
        <div className="grid gap-gutter md:grid-cols-12">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.1} className={featuredLayout(i)}>
              <ProjectCard project={p} aspect={i % 3 === 0 ? 'aspect-[4/5] md:aspect-[21/9]' : 'aspect-[4/5]'} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}

function Founder({ c }: { c: HomeContent['founder'] }) {
  const { t, lang } = useLang()
  return (
    <section className="page-x mx-auto mt-section grid max-w-[1440px] items-center gap-16 md:grid-cols-12">
      <Reveal className="md:col-span-5">
        <img src={c.photoUrl} alt={c.name} loading="lazy" className="aspect-[3/4] w-full object-cover grayscale" />
      </Reveal>
      <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
        <p className="label-caps mb-4 text-ink/50">{tr(c.eyebrow, lang)}</p>
        <h2 className="headline-lg">{c.name}</h2>
        <p className="label-caps mb-8 mt-3 text-ink/50">{tr(c.role, lang)}</p>
        <p className="body-lg mb-10 whitespace-pre-line text-ink/70">{tr(c.bio, lang)}</p>
        <Link to="/founder" className="label-caps inline-flex items-center gap-3 transition-colors hover:text-bronze">
          {t.home.founderLink} <ArrowRight size={16} strokeWidth={1.25} />
        </Link>
      </Reveal>
    </section>
  )
}

function Studio({ c }: { c: HomeContent['studio'] }) {
  const { t, lang } = useLang()
  return (
    <section className="mt-section bg-void py-24 md:py-section">
      <div className="page-x mx-auto grid max-w-[1440px] items-center gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="label-caps mb-4 text-ink/50">{tr(c.eyebrow, lang)}</p>
          <h2 className="headline-lg mb-8">{tr(c.headline, lang)}</h2>
          <p className="body-lg mb-10 whitespace-pre-line text-ink/70">{tr(c.text, lang)}</p>
          <Link to="/about" className="label-caps inline-flex items-center gap-3 transition-colors hover:text-bronze">
            {t.home.discover} <ArrowRight size={16} strokeWidth={1.25} />
          </Link>
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
          <img src={c.imageUrl} alt={t.home.studioAlt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </Reveal>
      </div>
    </section>
  )
}

function Services({ c }: { c: HomeContent['services'] }) {
  const { lang } = useLang()
  return (
    <section className="page-x mx-auto mt-section max-w-[1440px]">
      <Reveal className="mb-16">
        <p className="label-caps mb-4 text-ink/50">{tr(c.eyebrow, lang)}</p>
        <h2 className="headline-lg">{tr(c.title, lang)}</h2>
      </Reveal>
      <ol className="border-t border-stone/20">
        {c.items.map((s, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <li className="grid gap-4 border-b border-stone/20 py-10 md:grid-cols-12">
              <span className="label-caps text-ink/50 md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-display text-2xl md:col-span-5">{tr(s.title, lang)}</h3>
              <p className="text-ink/60 md:col-span-6">{tr(s.text, lang)}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}

function Cta({ c }: { c: HomeContent['cta'] }) {
  const { lang } = useLang()
  return (
    <section className="page-x mx-auto my-section max-w-[1440px] text-center">
      <Reveal>
        <p className="label-caps mb-6 text-ink/50">{tr(c.eyebrow, lang)}</p>
        <h2 className="display-xl mx-auto mb-12 max-w-3xl">{tr(c.title, lang)}</h2>
        <Link
          to="/contact"
          className="label-caps inline-block border border-transparent bg-paper px-10 py-4 text-void press hover:border-bronze hover:text-bronze"
        >
          {tr(c.button, lang)}
        </Link>
      </Reveal>
    </section>
  )
}
