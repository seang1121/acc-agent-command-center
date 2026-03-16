import type { ClaudeTool } from '../../types/dashboard'

const toolTypeColors: Record<string, string> = {
  command: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  skill: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  agent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export function ClaudeToolCard({ tool }: { tool: ClaudeTool }) {
  const colors = toolTypeColors[tool.type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors}`}>
          {tool.type}
        </span>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{tool.description}</p>
      <span className="font-mono text-xs text-gray-500 break-all">{tool.filePath}</span>
    </div>
  )
}
