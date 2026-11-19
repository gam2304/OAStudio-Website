import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Project } from '../../types'

function projectMeta(p: Project) {
  return [p.location, p.year].filter(Boolean).join(' • ')
}

// Image with a hover/focus overlay; caption below is always visible so cards can be scanned without hovering
export function ProjectCard({ project, aspect = 'aspect-[4/5]' }: { project: Project; aspect?: string }) {
  const caption = [project.category?.categoryName, project.location, project.year].filter(Boolean).join(' · ')
  return (
    <Link to={`/projects/${project.slug}`} className="group block">
      <div className="relative overflow-hidden bg-void">
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
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 p-8 text-center opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:hidden"
          aria-hidden
        >
          {project.category && <span className="label-caps mb-4 text-gold">{project.category.categoryName}</span>}
          <span className="headline-md mb-2">{project.title}</span>
          <p className="text-ink/60">{projectMeta(project)}</p>
          <ArrowRight className="mt-8 text-gold" strokeWidth={1.25} />
        </div>
      </div>
      <div className="mt-4">
        {caption && <p className="label-caps text-[10px] text-gold">{caption}</p>}
        <h3 className="mt-2 font-display text-xl transition-colors duration-500 group-hover:text-bronze">{project.title}</h3>
      </div>
    </Link>
  )
}
