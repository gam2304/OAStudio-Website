import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../../components/common/Reveal'
import { ErrorState, Loading } from '../../components/common/Status'
import { OfficeMap } from '../../components/public/OfficeMap'
import { ProjectCard } from '../../components/public/ProjectCard'
import { site } from '../../content/site'
import { useApi } from '../../hooks/useApi'
import { useLang } from '../../i18n/LanguageContext'
import { getProjects } from '../../services/publicApi'

export default function Home() {
  const { data: projects, error, loading } = useApi(getProjects)
  const { t } = useLang()
  // No "featured" flag in the API yet: show the three most recent published projects
  const featured = (projects ?? []).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative h-svh min-h-[640px] w-full overflow-hidden bg-void">
        <img src={site.images.heroFallback} alt="" className="h-full w-full object-cover object-[70%_center]" />
        {/* Neutral scrims shade only the text side and the bottom edge; the building keeps full light */}
        <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/60 to-transparent md:via-void/50" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-surface to-transparent" />
        <motion.div
          className="page-x absolute inset-x-0 bottom-16 md:bottom-24"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="display-xl max-w-3xl">{t.hero.headline}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/80">{t.hero.intro}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="press border border-transparent bg-paper px-8 py-4 text-sm font-medium text-void hover:border-bronze hover:text-bronze"
            >
              {t.home.startProject}
            </Link>
            <Link
              to="/projects"
              className="press border border-ink/40 px-8 py-4 text-sm font-medium hover:border-bronze hover:text-bronze"
            >
              {t.home.seeProjects}
            </Link>
          </div>
        </motion.div>
        <Link
          to="/projects/duo-residences"
          className="press absolute bottom-6 right-6 hidden items-center gap-2 text-xs text-ink/60 hover:text-bronze md:right-20 md:flex"
        >
          {t.hero.caption}
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Link>
      </section>

      {/* Featured projects */}
      <section className="page-x mt-section mx-auto max-w-[1440px]">
        <Reveal className="mb-16 flex items-end justify-between gap-8">
          <div>
            <p className="label-caps mb-4 text-ink/50">{t.home.portfolio}</p>
            <h2 className="headline-lg">{t.home.featured}</h2>
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
              <Reveal
                key={p.id}
                delay={i * 0.1}
                className={i === 0 ? 'md:col-span-12' : i === 1 ? 'md:col-span-5' : 'md:col-span-6 md:col-start-7 md:mt-32'}
              >
                <ProjectCard project={p} aspect={i === 0 ? 'aspect-[4/5] md:aspect-[21/9]' : 'aspect-[4/5]'} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* About preview */}
      <section className="mt-section bg-void py-24 md:py-section">
        <div className="page-x mx-auto grid max-w-[1440px] items-center gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="label-caps mb-4 text-ink/50">{t.home.theStudio}</p>
            <h2 className="headline-lg mb-8">{t.about.headline}</h2>
            <p className="body-lg mb-10 text-ink/70">{t.about.presentation}</p>
            <Link to="/about" className="label-caps inline-flex items-center gap-3 transition-colors hover:text-bronze">
              {t.home.discover} <ArrowRight size={16} strokeWidth={1.25} />
            </Link>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
            <img src={site.images.studio} alt={t.home.studioAlt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Founder */}
      <section className="page-x mx-auto mt-section grid max-w-[1440px] items-center gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <img src={site.founder.photoUrl} alt={site.founder.name} loading="lazy" className="aspect-[3/4] w-full object-cover grayscale" />
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
          <p className="label-caps mb-4 text-ink/50">{t.aboutPage.founder}</p>
          <h2 className="headline-lg">{site.founder.name}</h2>
          <p className="label-caps mb-8 mt-3 text-ink/50">{t.aboutPage.founderRole}</p>
          <p className="body-lg mb-10 text-ink/70">{t.aboutPage.founderBio}</p>
          <Link to="/founder" className="label-caps inline-flex items-center gap-3 transition-colors hover:text-bronze">
            {t.home.founderLink} <ArrowRight size={16} strokeWidth={1.25} />
          </Link>
        </Reveal>
      </section>

      {/* Services */}
      <section className="page-x mx-auto mt-section max-w-[1440px]">
        <Reveal className="mb-16">
          <p className="label-caps mb-4 text-ink/50">{t.home.expertise}</p>
          <h2 className="headline-lg">{t.home.services}</h2>
        </Reveal>
        <ol className="border-t border-stone/20">
          {t.services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <li className="grid gap-4 border-b border-stone/20 py-10 md:grid-cols-12">
                <span className="label-caps text-ink/50 md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-2xl md:col-span-5">{s.title}</h3>
                <p className="text-ink/60 md:col-span-6">{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Contact CTA */}
      <section className="page-x mx-auto my-section max-w-[1440px] text-center">
        <Reveal>
          <p className="label-caps mb-6 text-ink/50">{t.home.begin}</p>
          <h2 className="display-xl mx-auto mb-12 max-w-3xl">{t.home.ctaTitle}</h2>
          <Link
            to="/contact"
            className="label-caps inline-block border border-transparent bg-paper px-10 py-4 text-void press hover:border-bronze hover:text-bronze"
          >
            {t.home.cta}
          </Link>
        </Reveal>
      </section>

      <section className="page-x mx-auto mb-section max-w-[1440px]">
        <OfficeMap />
      </section>
    </>
  )
}
