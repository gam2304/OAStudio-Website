import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Reveal } from '../../components/common/Reveal'
import { ErrorState, Loading } from '../../components/common/Status'
import { ProjectCard } from '../../components/public/ProjectCard'
import { useApi } from '../../hooks/useApi'
import { useLang } from '../../i18n/LanguageContext'
import { getCategories, getProjects } from '../../services/publicApi'

// Varying aspect ratios give the masonry columns their editorial rhythm
const aspects = ['aspect-[3/4]', 'aspect-square', 'aspect-[16/10]', 'aspect-[4/5]']

export default function Projects() {
  const projects = useApi(getProjects)
  const { t } = useLang()
  const categories = useApi(getCategories)
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const active = params.get('category') ?? ''

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (projects.data ?? []).filter(
      (p) =>
        (!active || p.category?.slug === active) &&
        (!q || [p.title, p.location, p.category?.categoryName].some((v) => v?.toLowerCase().includes(q))),
    )
  }, [projects.data, active, query])

  const setCategory = (slug: string) => setParams(slug ? { category: slug } : {}, { replace: true })

  const filterClass = (on: boolean) =>
    `label-caps border-b-2 pb-1 transition-colors duration-300 ${
      on ? 'border-gold text-gold' : 'border-transparent text-ink/40 hover:border-ink/20 hover:text-ink'
    }`

  return (
    <div className="page-x mx-auto max-w-[1440px] pb-section pt-40">
      <header className="mb-24 flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
        <Reveal className="max-w-2xl">
          <h1 className="display-xl mb-6">{t.projects.title}</h1>
          <p className="body-lg text-ink/60">
            {t.projects.intro}
          </p>
        </Reveal>
        <div className="flex flex-col gap-8 lg:items-end">
          <div role="group" aria-label={t.projects.filter} className="flex flex-wrap gap-x-8 gap-y-4 lg:justify-end">
            <button type="button" className={filterClass(!active)} aria-pressed={!active} onClick={() => setCategory('')}>
              {t.projects.all}
            </button>
            {categories.data?.map((c) => (
              <button
                key={c.id}
                type="button"
                className={filterClass(active === c.slug)}
                aria-pressed={active === c.slug}
                onClick={() => setCategory(c.slug)}
              >
                {c.categoryName}
              </button>
            ))}
          </div>
          <label className="flex w-full max-w-xs items-center gap-3 border-b border-stone/30 pb-2 focus-within:border-bronze">
            <Search size={16} strokeWidth={1.25} className="text-ink/40" aria-hidden />
            <span className="sr-only">{t.projects.search}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.projects.search}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/30"
            />
          </label>
        </div>
      </header>

      {projects.loading && <Loading label={t.projects.loading} />}
      {!!projects.error && <ErrorState error={projects.error} fallback={t.status.error} />}
      {projects.data && !visible.length && (
        <p className="py-24 text-center text-ink/50">{t.projects.none}</p>
      )}
      <div className="gap-gutter lg:columns-2">
        {visible.map((p, i) => (
          <Reveal key={p.id} className="mb-gutter break-inside-avoid">
            <ProjectCard project={p} aspect={aspects[i % aspects.length]} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
