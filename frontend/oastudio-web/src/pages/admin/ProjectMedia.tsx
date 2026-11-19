import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { Button, Notice } from '../../components/admin/ui'
import { ErrorState, Loading } from '../../components/common/Status'
import { useApi } from '../../hooks/useApi'
import { adminImages, adminProjects } from '../../services/adminApi'
import { errorMessage } from '../../services/api'
import type { Project, ProjectImage } from '../../types'
import { imageFileError, IMAGE_TYPES, reorder } from '../../utils/imageFile'

const thumb = (url: string, w: number, h: number) => url.replace('/upload/', `/upload/c_fill,w_${w},h_${h},f_auto,q_auto/`)

type Msg = { ok: boolean; text: string } | null

function FileButton({ label, multiple, disabled, onFiles }: { label: string; multiple?: boolean; disabled?: boolean; onFiles: (files: File[]) => void }) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // allow picking the same file again
    if (files.length) onFiles(files)
  }
  return (
    <label className={`label-caps inline-block border border-stone/30 px-6 py-3 transition-colors ${disabled ? 'opacity-50' : 'cursor-pointer hover:border-bronze hover:text-bronze'} focus-within:outline focus-within:outline-1 focus-within:outline-offset-4 focus-within:outline-bronze`}>
      {label}
      <input type="file" accept={IMAGE_TYPES.join(',')} multiple={multiple} disabled={disabled} onChange={onChange} className="sr-only" />
    </label>
  )
}

function Cover({ project, onChange }: { project: Project; onChange: () => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)

  async function run(action: () => Promise<unknown>, ok: string) {
    setBusy(true)
    setMsg(null)
    try {
      await action()
      setMsg({ ok: true, text: ok })
      onChange()
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  const upload = ([file]: File[]) => {
    const problem = imageFileError(file)
    if (problem) return setMsg({ ok: false, text: problem })
    run(() => adminProjects.uploadCover(project.id, file), 'Cover uploaded.')
  }

  const remove = () => {
    if (window.confirm('Remove the cover image?')) run(() => adminProjects.removeCover(project.id), 'Cover removed.')
  }

  return (
    <section aria-labelledby="cover-heading" className="space-y-6">
      <h2 id="cover-heading" className="label-caps text-ink/50">Cover</h2>
      {project.coverImageUrl ? (
        <img src={thumb(project.coverImageUrl, 960, 640)} alt={`Cover of ${project.title}`} className={`aspect-[3/2] w-full object-cover ${busy ? 'opacity-50' : ''}`} />
      ) : (
        <div className="flex aspect-[3/2] w-full items-center justify-center bg-surface-low text-sm text-ink/40">No cover yet</div>
      )}
      <div className="flex flex-wrap items-center gap-6">
        <FileButton label={busy ? 'Uploading…' : 'Upload cover'} disabled={busy} onFiles={upload} />
        {project.coverImageUrl && <Button variant="danger" disabled={busy} onClick={remove}>Remove cover</Button>}
      </div>
      <p className="text-xs text-ink/40">Or pick “Use as cover” on a gallery photo. JPG, PNG or WebP, up to 10 MB.</p>
      <div aria-live="polite">{msg && <Notice tone={msg.ok ? 'ok' : 'error'}>{msg.text}</Notice>}</div>
    </section>
  )
}

function GalleryItem({
  image, index, count, isCover, busy, onMove, onSaveAlt, onDelete, onCover,
}: {
  image: ProjectImage
  index: number
  count: number
  isCover: boolean
  busy: boolean
  onMove: (to: number) => void
  onSaveAlt: (alt: string) => void
  onDelete: () => void
  onCover: () => void
}) {
  const [alt, setAlt] = useState(image.altText ?? '')
  const dirty = alt !== (image.altText ?? '')

  return (
    <li className={`border border-stone/10 bg-surface-low ${busy ? 'opacity-50' : ''}`}>
      <div className="relative">
        <img src={thumb(image.imageUrl, 480, 320)} alt={image.altText ?? ''} className="aspect-[3/2] w-full object-cover" />
        <span className="label-caps absolute left-2 top-2 bg-void/80 px-2 py-1 text-ink/70">{index + 1}</span>
        {isCover && <span className="label-caps absolute right-2 top-2 bg-gold px-2 py-1 text-void">Cover</span>}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <label htmlFor={`alt-${image.id}`} className="label-caps mb-1 block text-ink/40">Alt text</label>
          <div className="flex gap-3">
            <input
              id={`alt-${image.id}`}
              value={alt}
              maxLength={255}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the photo"
              className="w-full rounded-none border-0 border-b border-stone/30 bg-transparent py-1 text-sm outline-none focus:border-bronze"
            />
            {dirty && <Button variant="link" disabled={busy} onClick={() => onSaveAlt(alt)}>Save</Button>}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            <button type="button" disabled={busy || index === 0} onClick={() => onMove(index - 1)} aria-label="Move earlier" className="p-1 text-ink/60 hover:text-bronze disabled:opacity-30">
              <ArrowLeft size={16} aria-hidden />
            </button>
            <button type="button" disabled={busy || index === count - 1} onClick={() => onMove(index + 1)} aria-label="Move later" className="p-1 text-ink/60 hover:text-bronze disabled:opacity-30">
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
          <div className="flex gap-4">
            {!isCover && <Button variant="link" disabled={busy} onClick={onCover}>Use as cover</Button>}
            <Button variant="danger" disabled={busy} onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </div>
    </li>
  )
}

function Gallery({ project, onProjectChange }: { project: Project; onProjectChange: () => void }) {
  const { data: images, error, loading, reload } = useApi(() => adminImages.list(project.id), [project.id])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [msg, setMsg] = useState<Msg>(null)

  if (error) return <ErrorState error={error} fallback="Photos could not be loaded." />
  if (loading && !images) return <Loading label="Loading photos" />
  if (!images) return null

  async function run(action: () => Promise<unknown>, ok: string, projectChanged = false) {
    setBusy(true)
    setMsg(null)
    try {
      await action()
      setMsg({ ok: true, text: ok })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
      setProgress('')
      reload()
      if (projectChanged) onProjectChange()
    }
  }

  const upload = (files: File[]) => {
    const problems = files.map(imageFileError).filter(Boolean)
    if (problems.length) return setMsg({ ok: false, text: problems.join(' ') })
    const start = images.reduce((max, i) => Math.max(max, i.displayOrder + 1), 0)
    // One at a time: keeps order predictable and stops at the first failure
    run(async () => {
      for (const [k, file] of files.entries()) {
        setProgress(`Uploading ${k + 1} of ${files.length}…`)
        await adminImages.upload(project.id, file, '', start + k)
      }
    }, `${files.length} photo${files.length > 1 ? 's' : ''} uploaded.`)
  }

  const move = (from: number, to: number) =>
    run(
      () => Promise.all(reorder(images, from, to).map(({ item, displayOrder }) =>
        adminImages.update(item.id, { imageUrl: item.imageUrl, altText: item.altText, displayOrder }))),
      'Order saved.',
    )

  const saveAlt = (img: ProjectImage, alt: string) =>
    run(() => adminImages.update(img.id, { imageUrl: img.imageUrl, altText: alt.trim() || null, displayOrder: img.displayOrder }), 'Alt text saved.')

  const remove = (img: ProjectImage) => {
    const isCover = img.imageUrl === project.coverImageUrl
    const warning = isCover ? ' It is also the cover; the cover will stay until you change it.' : ''
    if (window.confirm(`Delete this photo?${warning}`)) run(() => adminImages.remove(img.id), 'Photo deleted.')
  }

  const setAsCover = (img: ProjectImage) =>
    run(() => adminProjects.coverFromGallery(project.id, img.id), 'Cover updated.', true)

  return (
    <section aria-labelledby="gallery-heading" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h2 id="gallery-heading" className="label-caps text-ink/50">Gallery <span className="text-ink/30">{images.length}</span></h2>
        <FileButton label={progress || 'Add photos'} multiple disabled={busy} onFiles={upload} />
      </div>
      <div aria-live="polite">{msg && <Notice tone={msg.ok ? 'ok' : 'error'}>{msg.text}</Notice>}</div>
      {images.length === 0 ? (
        <p className="border border-dashed border-stone/20 py-16 text-center text-sm text-ink/40">No photos yet. Add JPG, PNG or WebP files up to 10 MB each.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((img, i) => (
            <GalleryItem
              key={`${img.id}-${img.altText ?? ''}`}
              image={img}
              index={i}
              count={images.length}
              isCover={img.imageUrl === project.coverImageUrl}
              busy={busy}
              onMove={(to) => move(i, to)}
              onSaveAlt={(alt) => saveAlt(img, alt)}
              onDelete={() => remove(img)}
              onCover={() => setAsCover(img)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default function ProjectMedia({ project, onProjectChange }: { project: Project; onProjectChange: () => void }) {
  return (
    <div className="mt-24 grid gap-16 border-t border-stone/10 pt-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <Cover project={project} onChange={onProjectChange} />
      <Gallery project={project} onProjectChange={onProjectChange} />
    </div>
  )
}
