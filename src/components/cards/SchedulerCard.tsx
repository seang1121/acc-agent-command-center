import type { Scheduler } from '../../types/agents'
import { StatusBadge } from '../shared/StatusBadge'
import { InfoRow } from '../shared/InfoRow'

export function SchedulerCard({ scheduler }: { scheduler: Scheduler }) {
  const triggerColor =
    scheduler.triggerType === 'cron'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : scheduler.triggerType === 'daemon'
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{scheduler.name}</h3>
        <StatusBadge status={scheduler.status} />
      </div>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${triggerColor}`}>
          {scheduler.triggerType}
        </span>
        <span className="font-mono text-xs text-gray-500">{scheduler.cron}</span>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{scheduler.description}</p>
      <div className="space-y-1.5">
        <InfoRow label="Schedule" value={scheduler.schedule} />
        <InfoRow label="Timezone" value={scheduler.timezone} />
      </div>
    </div>
  )
}
