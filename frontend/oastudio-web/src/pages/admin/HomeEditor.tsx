import { ArrowDown, ArrowUp, Eye, EyeOff, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Button, Notice, PageHeader, SelectField, TextArea, TextField } from '../../components/admin/ui'
import { ErrorState, Loading } from '../../components/common/Status'
import { defaultHomeContent, withDefaults, type HomeContent, type Localized, type SectionId } from '../../content/homeContent'
import { useApi } from '../../hooks/useApi'
import { setCachedHomeContent } from '../../hooks/useHomeContent'
import { errorMessage } from '../../services/api'
import { adminProjects, adminSite } from '../../services/adminApi'
import { getHomeContent } from '../../services/publicApi'
import { imageFileError } from '../../utils/imageFile'

const sectionNames: Record<SectionId, string> = {
  hero: 'Hero (top of page)',
  featured: 'Selected projects',
  founder: 'Founder / about',
  studio: 'Studio',
  services: 'Services',
  cta: 'Call to action',
  map: 'Office map',
}

// Moves item i by `by` places; returns the same array when the move would leave the list
function move<T>(list: T[], i: number, by: number): T[] {
  const j = i + by
  if (j < 0 || j >= list.length) return list
  const next = [...list]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export default function HomeEditor() {
  const [content, setContent] = useState<HomeContent | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [loadError, setLoadError] = useState<unknown>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  useEffect(() => {
    getHomeContent().then((saved) => {
      const merged = withDefaults(saved)
      setContent(merged)
      setSavedJson(JSON.stringify(merged))
    }, setLoadError)
  }, [])

  // Warn before leaving the tab with unsaved edits
  const dirty = !!content && JSON.stringify(content) !== savedJson
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (loadError) return <ErrorState error={loadError} fallback="The landing page content could not be loaded." />
  if (!content) return <Loading label="Loading landing page" />

  // Updates one section's fields
  const patch = <K extends keyof HomeContent>(key: K, value: Partial<HomeContent[K]>) =>
    setContent((c) => (c ? { ...c, [key]: { ...c[key], ...value } } : c))

  async function save() {
    if (!content) return
    setSaving(true)
    setNotice(null)
    try {
      await adminSite.saveHome(content)
      setSavedJson(JSON.stringify(content))
      setCachedHomeContent(content)
      setNotice({ tone: 'ok', text: 'Saved. The landing page is updated.' })
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err, 'The landing page could not be saved.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Website" title="Home page">
        <a href="/" target="_blank" rel="noreferrer" className="label-caps text-ink/60 hover:text-bronze">
          View page ↗
        </a>
      </PageHeader>

      <div className="sticky top-0 z-10 -mx-4 mb-12 flex flex-wrap items-center gap-6 border-b border-stone/10 bg-void px-4 py-4">
        <Button onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        <Button variant="secondary" disabled={!dirty || saving} onClick={() => setContent(JSON.parse(savedJson))}>
          Discard changes
        </Button>
        <span className="text-sm text-ink/50">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      </div>

      <Panel title="Section order" hint="Use the arrows to reorder sections, the eye to show or hide one.">
        <ol className="divide-y divide-stone/10 border-y border-stone/10">
          {content.sections.map((s, i) => (
            <li key={s.id} className="flex items-center gap-4 py-3">
              <span className="w-6 text-sm text-ink/40">{i + 1}</span>
              <span className={`flex-1 ${s.visible ? '' : 'text-ink/30 line-through'}`}>{sectionNames[s.id]}</span>
              <IconButton label={`Move ${sectionNames[s.id]} up`} disabled={i === 0} onClick={() => setContent({ ...content, sections: move(content.sections, i, -1) })}>
                <ArrowUp size={16} />
              </IconButton>
              <IconButton label={`Move ${sectionNames[s.id]} down`} disabled={i === content.sections.length - 1} onClick={() => setContent({ ...content, sections: move(content.sections, i, 1) })}>
                <ArrowDown size={16} />
              </IconButton>
              <IconButton
                label={s.visible ? `Hide ${sectionNames[s.id]}` : `Show ${sectionNames[s.id]}`}
                pressed={!s.visible}
                onClick={() => setContent({ ...content, sections: content.sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)) })}
              >
                {s.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </IconButton>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Hero (top of page)">
        <Localized id="hero-headline" label="Headline" value={content.hero.headline} onChange={(headline) => patch('hero', { headline })} />
        <Localized id="hero-intro" label="Introduction" long value={content.hero.intro} onChange={(intro) => patch('hero', { intro })} />
        <ImageField label="Background photo" url={content.hero.imageUrl} fallback={defaultHomeContent.hero.imageUrl} onChange={(imageUrl) => patch('hero', { imageUrl })} />
        <Localized id="hero-caption" label="Photo caption (bottom right)" optional value={content.hero.caption} onChange={(caption) => patch('hero', { caption })} />
        <TextField
          id="hero-caption-link"
          label="Caption link"
          hint="A page on this site, e.g. /projects/duo-residences"
          value={content.hero.captionLink}
          onChange={(e) => patch('hero', { captionLink: e.target.value })}
        />
      </Panel>

      <Panel title="Selected projects">
        <Localized id="featured-eyebrow" label="Small label" value={content.featured.eyebrow} onChange={(eyebrow) => patch('featured', { eyebrow })} />
        <Localized id="featured-title" label="Title" value={content.featured.title} onChange={(title) => patch('featured', { title })} />
        <ProjectPicker ids={content.featured.projectIds} onChange={(projectIds) => patch('featured', { projectIds })} />
      </Panel>

      <Panel title="Founder / about">
        <Localized id="founder-eyebrow" label="Small label" value={content.founder.eyebrow} onChange={(eyebrow) => patch('founder', { eyebrow })} />
        <TextField id="founder-name" label="Name" value={content.founder.name} onChange={(e) => patch('founder', { name: e.target.value })} />
        <Localized id="founder-role" label="Role" value={content.founder.role} onChange={(role) => patch('founder', { role })} />
        <Localized id="founder-bio" label="Biography" long value={content.founder.bio} onChange={(bio) => patch('founder', { bio })} />
        <ImageField label="Portrait" url={content.founder.photoUrl} fallback={defaultHomeContent.founder.photoUrl} onChange={(photoUrl) => patch('founder', { photoUrl })} />
        <p className="text-xs text-ink/40">The name, role, biography and portrait are also used on the Studio and About pages.</p>
      </Panel>

      <Panel title="Studio">
        <Localized id="studio-eyebrow" label="Small label" value={content.studio.eyebrow} onChange={(eyebrow) => patch('studio', { eyebrow })} />
        <Localized id="studio-headline" label="Headline" value={content.studio.headline} onChange={(headline) => patch('studio', { headline })} />
        <Localized id="studio-text" label="Text" long value={content.studio.text} onChange={(text) => patch('studio', { text })} />
        <ImageField label="Photo" url={content.studio.imageUrl} fallback={defaultHomeContent.studio.imageUrl} onChange={(imageUrl) => patch('studio', { imageUrl })} />
      </Panel>

      <Panel title="Services">
        <Localized id="services-eyebrow" label="Small label" value={content.services.eyebrow} onChange={(eyebrow) => patch('services', { eyebrow })} />
        <Localized id="services-title" label="Title" value={content.services.title} onChange={(title) => patch('services', { title })} />
        {content.services.items.map((item, i) => {
          const setItems = (items: typeof content.services.items) => patch('services', { items })
          return (
            <div key={i} className="space-y-6 border-l border-stone/20 pl-6">
              <div className="flex items-center gap-4">
                <span className="label-caps flex-1 text-ink/50">Service {i + 1}</span>
                <IconButton label={`Move service ${i + 1} up`} disabled={i === 0} onClick={() => setItems(move(content.services.items, i, -1))}>
                  <ArrowUp size={16} />
                </IconButton>
                <IconButton label={`Move service ${i + 1} down`} disabled={i === content.services.items.length - 1} onClick={() => setItems(move(content.services.items, i, 1))}>
                  <ArrowDown size={16} />
                </IconButton>
                <IconButton label={`Remove service ${i + 1}`} onClick={() => setItems(content.services.items.filter((_, j) => j !== i))}>
                  <X size={16} />
                </IconButton>
              </div>
              <Localized id={`service-${i}-title`} label="Name" value={item.title} onChange={(title) => setItems(content.services.items.map((x, j) => (j === i ? { ...x, title } : x)))} />
              <Localized id={`service-${i}-text`} label="Description" long value={item.text} onChange={(text) => setItems(content.services.items.map((x, j) => (j === i ? { ...x, text } : x)))} />
            </div>
          )
        })}
        <Button
          variant="secondary"
          onClick={() => patch('services', { items: [...content.services.items, { title: { fr: '', en: '' }, text: { fr: '', en: '' } }] })}
        >
          Add a service
        </Button>
      </Panel>

      <Panel title="Call to action">
        <Localized id="cta-eyebrow" label="Small label" value={content.cta.eyebrow} onChange={(eyebrow) => patch('cta', { eyebrow })} />
        <Localized id="cta-title" label="Title" value={content.cta.title} onChange={(title) => patch('cta', { title })} />
        <Localized id="cta-button" label="Button text" value={content.cta.button} onChange={(button) => patch('cta', { button })} />
      </Panel>
    </div>
  )
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mb-16 space-y-8 border-t border-stone/20 pt-8">
      <div>
        <h2 className="font-display text-2xl">{title}</h2>
        {hint && <p className="mt-2 text-sm text-ink/50">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function IconButton({ label, pressed, children, ...rest }: { label: string; pressed?: boolean; children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={pressed} className="press p-2 text-ink/60 hover:text-bronze disabled:opacity-20" {...rest}>
      {children}
    </button>
  )
}

/** French and English versions of one text, side by side. */
function Localized({ id, label, value, onChange, long, optional }: { id: string; label: string; value: Localized; onChange: (v: Localized) => void; long?: boolean; optional?: boolean }) {
  const Field = long ? TextArea : TextField
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {(['fr', 'en'] as const).map((lang) => (
        <Field
          key={lang}
          id={`${id}-${lang}`}
          label={`${label} · ${lang === 'fr' ? 'Français' : 'English'}`}
          optional={optional}
          value={value[lang]}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        />
      ))}
    </div>
  )
}

function ImageField({ label, url, fallback, onChange }: { label: string; url: string; fallback: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function upload(file: File | undefined) {
    if (!file) return
    const invalid = imageFileError(file)
    if (invalid) return setError(invalid)
    setBusy(true)
    setError('')
    try {
      onChange(await adminSite.uploadImage(file))
    } catch (err) {
      setError(errorMessage(err, 'The photo could not be uploaded.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="label-caps mb-3 text-ink/60">{label}</p>
      <div className="flex flex-wrap items-end gap-6">
        <img src={url || fallback} alt="" className="h-32 w-32 border border-stone/20 object-cover" />
        <div className="flex flex-wrap gap-4">
          <label className={`label-caps press cursor-pointer border border-stone/30 px-6 py-3 hover:border-bronze hover:text-bronze ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            {busy ? 'Uploading…' : 'Replace photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          {url !== fallback && (
            <Button variant="link" onClick={() => onChange(fallback)}>
              Use default photo
            </Button>
          )}
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
      <p className="mt-2 text-xs text-ink/40">JPG, PNG or WebP, up to 10 MB. Saved when you click “Save changes”.</p>
    </div>
  )
}

function ProjectPicker({ ids, onChange }: { ids: number[]; onChange: (ids: number[]) => void }) {
  const { data: projects, error, loading } = useApi(adminProjects.list)
  if (loading) return <Loading label="Loading projects" />
  if (error) return <ErrorState error={error} fallback="Projects could not be loaded." />
  const published = (projects ?? []).filter((p) => p.status === 'PUBLISHED')
  const byId = new Map((projects ?? []).map((p) => [p.id, p]))
  const available = published.filter((p) => !ids.includes(p.id))

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink/50">
        {ids.length ? 'Shown in this order.' : 'No projects chosen: the three newest published projects are shown.'}
      </p>
      {!!ids.length && (
        <ol className="divide-y divide-stone/10 border-y border-stone/10">
          {ids.map((id, i) => {
            const p = byId.get(id)
            return (
              <li key={id} className="flex items-center gap-4 py-3">
                <span className="w-6 text-sm text-ink/40">{i + 1}</span>
                {p?.coverImageUrl && <img src={p.coverImageUrl} alt="" className="h-10 w-14 object-cover" />}
                <span className="flex-1">
                  {p ? p.title : `Deleted project #${id}`}
                  {p && p.status !== 'PUBLISHED' && <span className="label-caps ml-3 text-error">Not published, hidden on the site</span>}
                </span>
                <IconButton label="Move up" disabled={i === 0} onClick={() => onChange(move(ids, i, -1))}>
                  <ArrowUp size={16} />
                </IconButton>
                <IconButton label="Move down" disabled={i === ids.length - 1} onClick={() => onChange(move(ids, i, 1))}>
                  <ArrowDown size={16} />
                </IconButton>
                <IconButton label={`Remove ${p?.title ?? 'project'}`} onClick={() => onChange(ids.filter((x) => x !== id))}>
                  <X size={16} />
                </IconButton>
              </li>
            )
          })}
        </ol>
      )}
      <SelectField
        id="featured-add"
        label="Add a project"
        value=""
        onChange={(e) => e.target.value && onChange([...ids, Number(e.target.value)])}
      >
        <option value="">Choose a published project…</option>
        {available.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </SelectField>
    </div>
  )
}
