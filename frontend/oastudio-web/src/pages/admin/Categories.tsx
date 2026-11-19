import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Notice, PageHeader, TextArea, TextField } from '../../components/admin/ui'
import { ErrorState, Loading } from '../../components/common/Status'
import { useApi } from '../../hooks/useApi'
import { adminCategories, adminProjects } from '../../services/adminApi'
import { errorMessage, fieldErrors } from '../../services/api'
import type { Category, CategoryInput } from '../../types'
import { isValidSlug, slugify } from '../../utils/slugify'

const loadCategories = () =>
  Promise.all([adminCategories.list(), adminProjects.list()]).then(([categories, projects]) => ({
    categories,
    // Project count per category, so "in use" is visible before trying to delete
    usage: projects.reduce<Record<number, number>>((acc, p) => {
      if (p.category) acc[p.category.id] = (acc[p.category.id] ?? 0) + 1
      return acc
    }, {}),
  }))

function validate(f: CategoryInput) {
  const e: Record<string, string> = {}
  if (!f.categoryName.trim()) e.categoryName = 'Name is required.'
  else if (f.categoryName.length > 100) e.categoryName = 'Name must be at most 100 characters.'
  if (!f.slug) e.slug = 'Slug is required.'
  else if (!isValidSlug(f.slug)) e.slug = 'Use lowercase letters, numbers and single hyphens only.'
  else if (f.slug.length > 120) e.slug = 'Slug must be at most 120 characters.'
  return e
}

// One form for both create (category = null) and edit
function CategoryForm({ category, onDone, onCancel }: { category: Category | null; onDone: (text: string) => void; onCancel?: () => void }) {
  const empty: CategoryInput = { categoryName: '', slug: '', description: '' }
  const [form, setForm] = useState<CategoryInput>(
    category ? { categoryName: category.categoryName, slug: category.slug, description: category.description ?? '' } : empty,
  )
  const [slugTouched, setSlugTouched] = useState(!!category)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const prefix = category ? `edit-${category.id}` : 'new'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length) return
    const body = { ...form, categoryName: form.categoryName.trim(), description: form.description?.trim() || null }
    setSaving(true)
    try {
      if (category) await adminCategories.update(category.id, body)
      else await adminCategories.create(body)
      if (!category) setForm(empty)
      setSlugTouched(false)
      onDone(category ? `"${body.categoryName}" saved.` : `"${body.categoryName}" created.`)
    } catch (err) {
      setErrors(fieldErrors(err))
      setServerError(errorMessage(err, 'The category could not be saved.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-8">
      <TextField
        id={`${prefix}-name`}
        label="Name"
        value={form.categoryName}
        error={errors.categoryName}
        onChange={(e) => {
          const name = e.target.value
          setForm((f) => ({ ...f, categoryName: name, ...(slugTouched ? {} : { slug: slugify(name) }) }))
        }}
      />
      <TextField
        id={`${prefix}-slug`}
        label="Slug"
        value={form.slug}
        error={errors.slug}
        onChange={(e) => {
          setSlugTouched(true)
          setForm((f) => ({ ...f, slug: e.target.value }))
        }}
      />
      <TextArea id={`${prefix}-description`} label="Description" optional rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      {serverError && <Notice tone="error">{serverError}</Notice>}
      <div className="flex gap-6">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : category ? 'Save' : 'Add category'}</Button>
        {onCancel && <Button variant="link" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}

export default function Categories() {
  const { data, error, loading, reload } = useApi(loadCategories)
  const [editing, setEditing] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  if (error) return <ErrorState error={error} fallback="Categories could not be loaded." />
  if (loading && !data) return <Loading label="Loading categories" />
  if (!data) return null

  const done = (text: string) => {
    setMessage({ ok: true, text })
    setEditing(null)
    reload()
  }

  async function remove(c: Category) {
    if (!window.confirm(`Delete the category "${c.categoryName}"?`)) return
    setBusyId(c.id)
    setMessage(null)
    try {
      await adminCategories.remove(c.id)
      done(`"${c.categoryName}" deleted.`)
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Portfolio" title="Categories" />
      <div aria-live="polite" className="mb-6 min-h-5">{message && <Notice tone={message.ok ? 'ok' : 'error'}>{message.text}</Notice>}</div>

      <div className="grid gap-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ul className="divide-y divide-stone/10 border-y border-stone/10">
          {data.categories.map((c) => {
            const used = data.usage[c.id] ?? 0
            return (
              <li key={c.id} className={`py-6 ${busyId === c.id ? 'opacity-50' : ''}`}>
                {editing === c.id ? (
                  <CategoryForm category={c} onDone={done} onCancel={() => setEditing(null)} />
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl">{c.categoryName}</p>
                      <p className="text-xs text-ink/40">/{c.slug}</p>
                      {c.description && <p className="mt-2 max-w-xl text-sm text-ink/60">{c.description}</p>}
                      <Link to={`/atelier-control/projects`} className="mt-2 inline-block text-xs text-ink/50 hover:text-bronze">
                        {used} project{used === 1 ? '' : 's'}
                      </Link>
                    </div>
                    <div className="flex gap-6">
                      <Button variant="link" onClick={() => setEditing(c.id)}>Edit</Button>
                      <Button
                        variant="danger"
                        disabled={busyId === c.id || used > 0}
                        title={used > 0 ? 'Move or delete its projects first' : undefined}
                        onClick={() => remove(c)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
          {data.categories.length === 0 && <li className="py-6 text-ink/50">No categories yet.</li>}
        </ul>

        <section aria-labelledby="new-category">
          <h2 id="new-category" className="label-caps mb-6 text-ink/50">Add a category</h2>
          <CategoryForm category={null} onDone={done} />
        </section>
      </div>
    </div>
  )
}
