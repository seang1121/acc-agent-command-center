import type { McpServer, Hook } from '../../types/agents'
import { InfoRow } from '../shared/InfoRow'

export function McpServerCard({ server }: { server: McpServer }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{server.name}</h3>
        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          v{server.version}
        </span>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{server.description}</p>
      <div className="space-y-1.5">
        <InfoRow label="Transport" value={server.transport} />
        <InfoRow label="Command" value={server.command} />
      </div>
    </div>
  )
}

export function HookCard({ hook }: { hook: Hook }) {
  const eventColor =
    hook.event === 'PreToolUse'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{hook.name}</h3>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${eventColor}`}>
          {hook.event}
        </span>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{hook.description}</p>
      {hook.matcher && (
        <InfoRow label="Matcher" value={hook.matcher} />
      )}
      <div className="mt-1.5">
        <span className="font-mono text-xs text-gray-500 break-all">{hook.command}</span>
      </div>
    </div>
  )
}
