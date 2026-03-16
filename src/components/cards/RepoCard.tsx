import type { Repo } from '../../types/agents'

export function RepoCard({ repo }: { repo: Repo }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          {repo.name}
        </a>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            repo.visibility === 'private'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}
        >
          {repo.visibility}
        </span>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{repo.description}</p>
      <div className="flex gap-4 text-xs">
        {repo.agentCount != null && repo.agentCount > 0 && (
          <span className="text-purple-400">
            <span className="font-mono font-bold">{repo.agentCount}</span> agents
          </span>
        )}
        {repo.automationCount != null && repo.automationCount > 0 && (
          <span className="text-blue-400">
            <span className="font-mono font-bold">{repo.automationCount}</span> automations
          </span>
        )}
      </div>
    </div>
  )
}
