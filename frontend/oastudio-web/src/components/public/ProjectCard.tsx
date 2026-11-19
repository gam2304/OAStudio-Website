import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../../i18n/LanguageContext'
import type { Project } from '../../types'

// Grey image with a colour copy on top that fades in on hover. Crossfading opacity
// stays on the GPU; animating `filter: grayscale` would repaint the image every frame.
export function ProjectCard({ project, aspect = 'aspect-[4/5]' }: { project: Project; aspect?: string }) {
  const { t } = useLang()
  const caption = [project.category?.categoryName, project.location, project.year].filter(Boolean).join(' · ')
  return (
    <Link to={`/projects/${project.slug}`} className="group block">
      <div className="relative overflow-hidden bg-void">
        {project.coverImageUrl ? (
          <div>
            <img src={project.coverImageUrl} alt={project.title} loading="lazy" className={`${aspect} w-full object-cover grayscale`} />
            <img
              src={project.coverImageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </div>
        ) : (
          <div className={`${aspect} w-full bg-surface-low`} aria-hidden />
        )}
        <div
          className="absolute inset-0 flex items-center justify-center bg-surface/50 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:hidden"
          aria-hidden
        >
          <span className="label-caps inline-flex items-center gap-3 text-paper">
            {t.project.view} <ArrowRight size={16} strokeWidth={1.25} />
          </span>
        </div>
      </div>
      <div className="mt-4">
        {caption && <p className="label-caps text-ink/50">{caption}</p>}
        <h3 className="mt-2 font-display text-xl transition-colors duration-200 group-hover:text-bronze">{project.title}</h3>
      </div>
    </Link>
  )
}
