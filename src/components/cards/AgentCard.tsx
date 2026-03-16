import type { Agent } from '../../types/agents'
import { StatusBadge } from '../shared/StatusBadge'
import { TagPill } from '../shared/TagPill'
import { InfoRow } from '../shared/InfoRow'
import { typeBorderColors, formatWeight } from '../../utils/formatters'

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div
      className={`rounded-lg border border-gray-800 bg-gray-900 p-4 border-l-4 ${typeBorderColors[agent.type]}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <TagPill type={agent.type} />
            <StatusBadge status={agent.status} />
          </div>
        </div>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{agent.purpose}</p>
      <div className="space-y-1.5">
        {agent.weight != null && (
          <InfoRow label="Weight" value={formatWeight(agent.weight)} />
        )}
        {agent.scoreRange && (
          <InfoRow label="Score Range" value={agent.scoreRange} />
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sources</span>
          <span className="text-gray-300 text-right text-xs max-w-[60%]">
            {agent.dataSources.join(', ')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Module</span>
          <span className="text-gray-400 font-mono text-xs truncate max-w-[65%]">
            {agent.module}
          </span>
        </div>
      </div>
    </div>
  )
}
