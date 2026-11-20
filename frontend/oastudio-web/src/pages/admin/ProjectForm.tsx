import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Notice, PageHeader, SelectField, TextArea, TextField } from '../../components/admin/ui'
import { ErrorState, Loading } from '../../components/common/Status'
import { useApi } from '../../hooks/useApi'
import { adminCategories, adminProjects } from '../../services/adminApi'
import { errorMessage, fieldErrors } from '../../services/api'
import type { Category, Project, ProjectInput, ProjectStatus } from '../../types'
import { isValidSlug, slugify } from '../../utils/slugify'
import ProjectMedia from './ProjectMedia'

// Form state keeps every field as a string; converted on submit
interface FormState {
  title: string
  slug: string
  location: string
  year: string
  area: string
  description: string
  architecturalConcept: string
  status: ProjectStatus
  categoryId: string
}

const emptyForm: FormState = {
  title: '', slug: '', location: '', year: '', area: '', description: '',
  architecturalConcept: '', status: 'DRAFT', categoryId: '',
}

const toForm = (p: Project): FormState => ({
  title: p.title,
  slug: p.slug,
  location: p.location ?? '',
  year: p.year?.toString() ?? '',
  area: p.area?.toString() ?? '',
  description: p.description ?? '',
  architecturalConcept: p.architecturalConcept ?? '',
  status: p.status,
  categoryId: p.category?.id.toString() ?? '',
})

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (!f.title.trim()) e.title = 'Title is required.'
  else if (f.title.length > 200) e.title = 'Title must be at most 200 characters.'
  if (!f.slug) e.slug = 'Slug is required.'
  else if (!isValidSlug(f.slug)) e.slug = 'Use lowercase letters, numbers and single hyphens only.'
  else if (f.slug.length > 220) e.slug = 'Slug must be at most 220 characters.'
  if (f.location.length > 200) e.location = 'Location must be at most 200 characters.'
  if (f.year && !(Number.isInteger(+f.year) && +f.year >= 1900 && +f.year <= 2100)) e.year = 'Year must be between 1900 and 2100.'
  if (f.area && !(Number.isFinite(+f.area) && +f.area >= 0)) e.area = 'Area must be a positive number.'
  if (!f.categoryId) e.categoryId = 'Choose a category.'
  return e
}

const blankToNull = (s: string) => (s.trim() ? s.trim() : null)

export default function ProjectForm() {
  const { id } = useParams()
  const projectId = id ? Number(id) : null
  const categories = useApi(adminCategories.list)
  const existing = useApi(() => (projectId ? adminProjects.get(projectId) : Promise.resolve(null)), [projectId])

  if (existing.error) return <ErrorState error={existing.error} fallback="This project could not be loaded." />
  if (categories.error) return <ErrorState error={categories.error} fallback="Categories could not be loaded." />
  if ((projectId && !existing.data) || !categories.data) return <Loading label="Loading project" />

  // Keyed on the id only: reloading after a cover/photo change must not wipe unsaved form edits
  return (
    <ProjectEditor
      key={existing.data?.id ?? 'new'}
      project={existing.data}
      categories={categories.data}
      onSaved={existing.reload}
    />
  )
}

function ProjectEditor({ project, categories, onSaved }: { project: Project | null; categories: Category[]; onSaved: () => void }) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(project ? toForm(project) : emptyForm)
  // New projects: the slug follows the title until the slug is edited by hand
  const [slugTouched, setSlugTouched] = useState(!!project)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const set = (k: keyof FormState) => (e: { target: { value: string } }) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [k]: value, ...(k === 'title' && !slugTouched ? { slug: slugify(value) } : {}) }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    setMessage(null)
    if (Object.keys(found).length) return

    const body: ProjectInput = {
      title: form.title.trim(),
      slug: form.slug,
      location: blankToNull(form.location),
      year: form.year ? Number(form.year) : null,
      area: form.area ? Number(form.area) : null,
      description: blankToNull(form.description),
      architecturalConcept: blankToNull(form.architecturalConcept),
      // The cover is managed by the cover endpoints below; keep the current one untouched
      coverImageUrl: project?.coverImageUrl ?? null,
      status: form.status,
      categoryId: Number(form.categoryId),
    }

    setSaving(true)
    try {
      if (project) {
        await adminProjects.update(project.id, body)
        setMessage({ ok: true, text: 'Project saved.' })
        setSaving(false)
        onSaved()
      } else {
        const created = await adminProjects.create(body)
        navigate(`/atelier-control/projects/${created.id}`, { replace: true })
      }
    } catch (err) {
      setErrors(fieldErrors(err))
      setMessage({ ok: false, text: errorMessage(err, 'The project could not be saved.') })
      setSaving(false)
    }
  }

  return (
    <div>
      <Link to="/atelier-control/projects" className="label-caps mb-8 inline-block text-ink/50 hover:text-bronze">← All projects</Link>
      <PageHeader eyebrow={project ? 'Edit project' : 'New project'} title={project ? project.title : 'New project'}>
        {project?.status === 'PUBLISHED' && (
          <a href={`/projects/${project.slug}`} target="_blank" rel="noreferrer" className="label-caps text-ink/60 hover:text-bronze">View on site ↗</a>
        )}
      </PageHeader>

      <form noValidate onSubmit={onSubmit} className="grid gap-x-16 gap-y-10 lg:grid-cols-2">
        <TextField id="title" label="Title" value={form.title} onChange={set('title')} error={errors.title} />
        <TextField
          id="slug"
          label="Slug"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true)
            set('slug')(e)
          }}
          error={errors.slug}
          hint={`Page address: /projects/${form.slug || '…'}`}
        />
        <SelectField id="categoryId" label="Category" value={form.categoryId} onChange={set('categoryId')} error={errors.categoryId}>
          <option value="">Choose a category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
        </SelectField>
        <SelectField id="status" label="Status" value={form.status} onChange={set('status')} hint="Only published projects appear on the website.">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </SelectField>
        <TextField id="location" label="Location" optional value={form.location} onChange={set('location')} error={errors.location} />
        <div className="grid grid-cols-2 gap-8">
          <TextField id="year" label="Year" optional inputMode="numeric" value={form.year} onChange={set('year')} error={errors.year} />
          <TextField id="area" label="Area (m²)" optional inputMode="decimal" value={form.area} onChange={set('area')} error={errors.area} />
        </div>
        <TextArea id="description" label="Description" optional rows={6} value={form.description} onChange={set('description')} />
        <TextArea id="architecturalConcept" label="Architectural concept" optional rows={6} value={form.architecturalConcept} onChange={set('architecturalConcept')} />

        <div className="flex flex-wrap items-center gap-8 lg:col-span-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}</Button>
          <div aria-live="polite">{message && <Notice tone={message.ok ? 'ok' : 'error'}>{message.text}</Notice>}</div>
        </div>
      </form>

      {project ? (
        <ProjectMedia project={project} onProjectChange={onSaved} />
      ) : (
        <p className="mt-16 text-sm text-ink/50">Save the project first, then add its cover and gallery photos.</p>
      )}
    </div>
  )
}
