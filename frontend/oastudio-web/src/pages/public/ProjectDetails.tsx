import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Reveal } from '../../components/common/Reveal'
import { ErrorState, Loading } from '../../components/common/Status'
import { useApi } from '../../hooks/useApi'
import { useLang } from '../../i18n/LanguageContext'
import { getProject, getProjectImages, getProjects } from '../../services/publicApi'
import { site } from '../../content/site'
import NotFound from './NotFound'
import axios from 'axios'

export default function ProjectDetails() {
  const { slug = '' } = useParams()
  const project = useApi(() => getProject(slug), [slug])
  const images = useApi(() => getProjectImages(slug), [slug])
  const all = useApi(getProjects)
  const { t } = useLang()

  const p = project.data
  useEffect(() => {
    if (!p) return
    const previous = document.title // the SEO title from index.html
    document.title = `${p.title} – ${p.location ?? `${site.name} M'saken`} | Architecte Tunisie`
    return () => {
      document.title = previous
    }
  }, [p])

  if (project.loading) return <div className="pt-40"><Loading label={t.status.loading} /></div>
  if (axios.isAxiosError(project.error) && project.error.response?.status === 404) return <NotFound />
  if (project.error || !p) return <div className="pt-40"><ErrorState error={project.error} fallback={t.status.error} /></div>

  const list = all.data ?? []
  const index = list.findIndex((x) => x.slug === p.slug)
  const prev = index > 0 ? list[index - 1] : null
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null

  const facts = [
    [t.project.location, p.location],
    [t.project.year, p.year],
    [t.project.category, p.category?.categoryName],
    [t.project.area, p.area ? `${p.area} m²` : null],
  ].filter(([, v]) => v != null && v !== '')

  return (
    <article>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-void">
        {p.coverImageUrl && (
          <img src={p.coverImageUrl} alt={p.title} className="h-full w-full object-cover brightness-75 grayscale-[20%]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        <div className="page-x absolute inset-x-0 bottom-16 md:bottom-24">
          {p.category && <p className="label-caps mb-4 text-ink/50">{p.category.categoryName}</p>}
          <h1 className="display-xl max-w-4xl">{p.title}</h1>
        </div>
      </section>

      {/* Facts + narrative */}
      <section className="page-x mx-auto mt-section grid max-w-[1440px] gap-gutter md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <dl className="space-y-6 border-t border-stone/20 pt-8">
            {facts.map(([k, v]) => (
              <div key={k as string}>
                <dt className="label-caps mb-1 text-ink/50">{k}</dt>
                <dd className="text-ink/70">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal className="md:col-span-7 md:col-start-6" delay={0.1}>
          <h2 className="label-caps mb-6 text-ink/50">{t.project.narrative}</h2>
          {p.description && <p className="body-lg whitespace-pre-line text-ink/80">{p.description}</p>}
        </Reveal>
      </section>

      {/* Concept */}
      {p.architecturalConcept && (
        <section className="page-x mx-auto mt-section max-w-[1440px]">
          <Reveal className="mx-auto max-w-4xl text-center">
            <h2 className="label-caps mb-8 text-ink/50">{t.project.concept}</h2>
            <p className="headline-lg whitespace-pre-line">{p.architecturalConcept}</p>
          </Reveal>
        </section>
      )}

      {/* Gallery */}
      {!!images.data?.length && (
        <section className="page-x mx-auto mt-section max-w-[1440px]" aria-label={t.project.gallery}>
          <div className="grid gap-gutter md:grid-cols-2">
            {images.data.map((img, i) => (
              <Reveal key={img.id} className={i % 3 === 0 ? 'md:col-span-2' : ''}>
                <img
                  src={img.imageUrl}
                  alt={img.altText ?? `${p.title} — ${t.project.image} ${i + 1}`}
                  loading="lazy"
                  className={`w-full object-cover ${i % 3 === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Prev / next */}
      <nav aria-label={t.project.more} className="page-x mx-auto my-section flex max-w-[1440px] justify-between gap-8 border-t border-stone/20 pt-12">
        {prev ? (
          <Link to={`/projects/${prev.slug}`} className="group max-w-[45%]">
            <span className="label-caps mb-3 flex items-center gap-2 text-ink/40 group-hover:text-bronze">
              <ArrowLeft size={14} /> {t.project.previous}
            </span>
            <span className="font-display text-xl md:text-3xl">{prev.title}</span>
          </Link>
        ) : (
          <Link to="/projects" className="label-caps flex items-center gap-2 text-ink/40 hover:text-bronze">
            <ArrowLeft size={14} /> {t.project.all}
          </Link>
        )}
        {next && (
          <Link to={`/projects/${next.slug}`} className="group max-w-[45%] text-right">
            <span className="label-caps mb-3 flex items-center justify-end gap-2 text-ink/40 group-hover:text-bronze">
              {t.project.next} <ArrowRight size={14} />
            </span>
            <span className="font-display text-xl md:text-3xl">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
