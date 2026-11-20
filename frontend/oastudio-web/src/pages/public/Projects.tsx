import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Reveal } from '../../components/common/Reveal'
import { ErrorState, Loading } from '../../components/common/Status'
import { ProjectCard } from '../../components/public/ProjectCard'
import { useApi } from '../../hooks/useApi'
import { useLang } from '../../i18n/LanguageContext'
import { getCategories, getProjects } from '../../services/publicApi'

// Each row of two shares an aspect ratio, so the grid reads newest-first left to right with no gaps
const aspects = ['aspect-[3/4]', 'aspect-square', 'aspect-[16/10]', 'aspect-[4/5]']

// Fewer cards per page means fewer images to download
const PAGE_SIZE = 15

export default function Projects() {
  const projects = useApi(getProjects)
  const { t } = useLang()
  const categories = useApi(getCategories)
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const active = params.get('category') ?? ''
  const requestedPage = Number(params.get('page')) || 1

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (projects.data ?? []).filter(
      (p) =>
        (!active || p.category?.slug === active) &&
        (!q || [p.title, p.location, p.category?.categoryName].some((v) => v?.toLowerCase().includes(q))),
    )
  }, [projects.data, active, query])

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, requestedPage), pageCount)
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Changing the filter or search starts again from page 1
  const setCategory = (slug: string) => setParams(slug ? { category: slug } : {}, { replace: true })
  const onSearch = (value: string) => {
    setQuery(value)
    if (!params.has('page')) return
    const next = new URLSearchParams(params)
    next.delete('page')
    setParams(next, { replace: true })
  }
  const goToPage = (n: number) => {
    const next = new URLSearchParams(params)
    if (n > 1) next.set('page', String(n))
    else next.delete('page')
    setParams(next)
    window.scrollTo({ top: 0 })
  }
  const pageClass = (on: boolean) =>
    `label-caps press flex h-10 min-w-10 items-center justify-center border px-3 disabled:opacity-30 ${
      on ? 'border-gold text-gold' : 'border-stone/20 text-ink/60 hover:border-bronze hover:text-bronze'
    }`

  const filterClass = (on: boolean) =>
    `label-caps press border-b-2 pb-1 ${
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
              onChange={(e) => onSearch(e.target.value)}
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
      <div className="grid gap-gutter lg:grid-cols-2">
        {pageItems.map((p, i) => (
          <Reveal key={p.id} duration={active || query || page > 1 ? 0.2 : undefined}>
            <ProjectCard project={p} aspect={aspects[Math.floor(i / 2) % aspects.length]} />
          </Reveal>
        ))}
      </div>

      {pageCount > 1 && (
        <nav aria-label={t.projects.pagination} className="mt-section flex flex-wrap items-center justify-center gap-3">
          <button type="button" className={pageClass(false)} disabled={page === 1} onClick={() => goToPage(page - 1)} aria-label={t.projects.prev}>
            <ArrowLeft size={14} strokeWidth={1.5} />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={pageClass(n === page)}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => goToPage(n)}
            >
              {n}
            </button>
          ))}
          <button type="button" className={pageClass(false)} disabled={page === pageCount} onClick={() => goToPage(page + 1)} aria-label={t.projects.next}>
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </nav>
      )}
    </div>
  )
}
