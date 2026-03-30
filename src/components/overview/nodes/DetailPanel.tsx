import type { Project } from '../../../types/dashboard'

interface Props {
  project: Project | null
  onClose: () => void
  onNavigate?: (tabId: string) => void
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
  maintained: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  archived: 'bg-zinc-800/50 text-zinc-400 border-zinc-600/50',
  template: 'bg-purple-900/50 text-purple-300 border-purple-700/50',
}

export function DetailPanel({ project, onClose, onNavigate }: Props) {
  if (!project) return null

  return (
    <div className="absolute right-3 top-3 z-10 w-72 rounded-lg border border-zinc-800 bg-zinc-950/95 backdrop-blur-sm shadow-xl shadow-black/40">
      <div className="flex items-start justify-between border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-zinc-100 font-mono">{project.name}</h3>
          <span className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_BADGE[project.status] ?? STATUS_BADGE.active}`}>
            {project.status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-2 shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-3 space-y-3">
        {project.description && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
            {project.description.replace(/^[>#*\s]+/, '').slice(0, 150)}
          </p>
        )}
        {project.techStack.length > 0 && (
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-mono">Stack</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {project.techStack.map(t => (
                <span key={t} className="rounded border border-zinc-700/50 bg-zinc-900/50 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-600" />
            {project.domain}
          </span>
          <span>{project.category}</span>
          {project.isGitRepo && <span className="text-emerald-600">git</span>}
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate(project.id)}
            className="w-full rounded border border-zinc-800 bg-zinc-900 py-1.5 text-[10px] font-mono text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            VIEW DETAILS
          </button>
        )}
      </div>
    </div>
  )
}
