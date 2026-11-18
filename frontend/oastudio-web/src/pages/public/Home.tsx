import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../../components/common/Reveal'
import { ErrorState, Loading } from '../../components/common/Status'
import { ProjectCard } from '../../components/public/ProjectCard'
import { site } from '../../content/site'
import { useApi } from '../../hooks/useApi'
import { getProjects } from '../../services/publicApi'

export default function Home() {
  const { data: projects, error, loading } = useApi(getProjects)
  // No "featured" flag in the API yet: show the three most recent published projects
  const featured = (projects ?? []).slice(0, 3)
  const heroImage = featured.find((p) => p.coverImageUrl)?.coverImageUrl ?? site.images.heroFallback

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-void">
        <motion.img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover brightness-[0.6] grayscale-[20%]"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        <div className="page-x absolute inset-x-0 bottom-16 md:bottom-24">
          <motion.p
            className="label-caps mb-6 text-gold"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
          >
            {site.tagline}
          </motion.p>
          <motion.h1
            className="display-xl max-w-4xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {site.hero.headline}
          </motion.h1>
          <motion.p
            className="body-lg mt-8 max-w-xl text-ink/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            {site.hero.intro}
          </motion.p>
        </div>
        <ArrowDown className="absolute bottom-16 right-6 hidden text-ink/50 md:right-20 md:block" strokeWidth={1} aria-hidden />
      </section>

      {/* Featured projects */}
      <section className="page-x mt-section mx-auto max-w-[1440px]">
        <Reveal className="mb-16 flex items-end justify-between gap-8">
          <div>
            <p className="label-caps mb-4 text-gold">Portfolio</p>
            <h2 className="headline-lg">Featured Works</h2>
          </div>
          <Link to="/projects" className="label-caps border-b border-ink/30 pb-1 transition-colors hover:border-bronze hover:text-bronze">
            View all works
          </Link>
        </Reveal>
        {loading && <Loading />}
        {!!error && <ErrorState error={error} />}
        {projects && !featured.length && <p className="text-ink/50">Projects will be published soon.</p>}
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
            <p className="label-caps mb-4 text-gold">The Studio</p>
            <h2 className="headline-lg mb-8">{site.about.headline}</h2>
            <p className="body-lg mb-10 text-ink/70">{site.about.presentation}</p>
            <Link to="/about" className="label-caps inline-flex items-center gap-3 transition-colors hover:text-bronze">
              Discover the studio <ArrowRight size={16} strokeWidth={1.25} />
            </Link>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
            <img src={site.images.studio} alt="Double-height living room in Villa Moonlight" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="page-x mx-auto mt-section max-w-[1440px]">
        <Reveal className="mb-16">
          <p className="label-caps mb-4 text-gold">Expertise</p>
          <h2 className="headline-lg">Services</h2>
        </Reveal>
        <ol className="border-t border-stone/20">
          {site.services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <li className="grid gap-4 border-b border-stone/20 py-10 md:grid-cols-12">
                <span className="label-caps text-gold md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
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
          <p className="label-caps mb-6 text-gold">Begin a project</p>
          <h2 className="display-xl mx-auto mb-12 max-w-3xl">Let us shape your next space.</h2>
          <Link
            to="/contact"
            className="label-caps inline-block border border-transparent bg-paper px-10 py-4 text-void transition-colors duration-500 hover:border-bronze hover:text-bronze"
          >
            Request a consultation
          </Link>
        </Reveal>
      </section>
    </>
  )
}
