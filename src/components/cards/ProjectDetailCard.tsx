import type { Project } from '../../types/dashboard'
import { TechBadge } from '../shared/TechBadge'
import { statusTextColors, categoryColors } from '../../utils/formatters'

interface Props {
  project: Project
  onClick?: () => void
}

export function ProjectDetailCard({ project, onClick }: Props) {
  const statusColor = statusTextColors[project.status] || 'text-gray-400'

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{project.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${categoryColors[project.category] || ''}`}>
            {project.category}
          </span>
        </div>
      </div>

      <p className="mb-3 text-xs text-gray-400 leading-relaxed line-clamp-2">
        {project.description}
      </p>

      {project.techStack.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.techStack.map((t) => (
            <TechBadge key={t} tech={t} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {project.highlights?.slice(0, 3).map((h) => (
            <span key={h} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              {h}
            </span>
          ))}
        </div>
        <span className={`flex items-center gap-1.5 text-xs ${statusColor}`}>
          <span className={`inline-block h-2 w-2 rounded-full ${
            project.status === 'active' ? 'bg-green-500' :
            project.status === 'maintained' ? 'bg-blue-500' :
            project.status === 'archived' ? 'bg-amber-500' : 'bg-gray-500'
          }`} />
          {project.status}
        </span>
      </div>
    </div>
  )
}
