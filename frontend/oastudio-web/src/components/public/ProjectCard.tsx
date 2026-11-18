import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Project } from '../../types'

function projectMeta(p: Project) {
  return [p.location, p.year].filter(Boolean).join(' • ')
}

// Full-bleed image; metadata overlay fades in on hover/focus (always visible on touch)
export function ProjectCard({ project, aspect = 'aspect-[4/5]' }: { project: Project; aspect?: string }) {
  return (
    <Link to={`/projects/${project.slug}`} className="group relative block overflow-hidden bg-void">
      {project.coverImageUrl ? (
        <img
          src={project.coverImageUrl}
          alt={project.title}
          loading="lazy"
          className={`${aspect} w-full object-cover grayscale transition-[filter,transform] duration-1000 ease-calm group-hover:scale-105 group-hover:grayscale-0 group-focus-visible:grayscale-0`}
        />
      ) : (
        <div className={`${aspect} w-full bg-surface-low`} aria-hidden />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 p-8 text-center opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:justify-end [@media(hover:none)]:bg-gradient-to-t [@media(hover:none)]:from-surface [@media(hover:none)]:via-transparent [@media(hover:none)]:opacity-100">
        {project.category && <span className="label-caps mb-4 text-gold">{project.category.categoryName}</span>}
        <h3 className="headline-md mb-2">{project.title}</h3>
        <p className="text-ink/60">{projectMeta(project)}</p>
        <ArrowRight className="mt-8 text-gold [@media(hover:none)]:hidden" strokeWidth={1.25} aria-hidden />
      </div>
    </Link>
  )
}
