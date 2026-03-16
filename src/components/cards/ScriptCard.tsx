import type { Script } from '../../types/agents'
import { InfoRow } from '../shared/InfoRow'

export function ScriptCard({ script }: { script: Script }) {
  return (
    <div
      className={`rounded-lg border bg-gray-900 p-4 ${
        script.critical ? 'border-red-500/50' : 'border-gray-800'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{script.name}</h3>
        {script.critical && (
          <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold text-red-400">
            CRITICAL
          </span>
        )}
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{script.description}</p>
      <div className="space-y-1.5">
        <InfoRow label="Frequency" value={script.frequency} />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Path</span>
          <span className="font-mono text-xs text-gray-400 truncate max-w-[65%]">
            {script.path}
          </span>
        </div>
      </div>
    </div>
  )
}
