import type { Project } from '../../types/dashboard'
import { TechBadge } from '../shared/TechBadge'
import { categoryColors } from '../../utils/formatters'

interface Props {
  project: Project
  onClick?: () => void
}

export function ProjectSummaryCard({ project, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-gray-800 bg-gray-900 p-4 transition-all hover:border-gray-700 hover:bg-gray-900/80 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white truncate">{project.name}</h3>
        <span
          className={`flex-shrink-0 ml-2 rounded-full border px-2 py-0.5 text-xs font-medium ${
            categoryColors[project.category] ||
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}
        >
          {project.category}
        </span>
      </div>

      <p className="mb-3 text-xs text-gray-400 leading-relaxed line-clamp-2">
        {project.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 3).map((t) => (
            <TechBadge key={t} tech={t} />
          ))}
          {project.techStack.length > 3 && (
            <span className="text-xs text-gray-500">+{project.techStack.length - 3}</span>
          )}
        </div>
        <span
          className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
            project.status === 'active'
              ? 'bg-green-500'
              : project.status === 'maintained'
                ? 'bg-blue-500'
                : project.status === 'archived'
                  ? 'bg-amber-500'
                  : 'bg-gray-500'
          }`}
          title={project.status}
        />
      </div>
    </div>
  )
}
