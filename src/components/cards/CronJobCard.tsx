import type { CronJob } from '../../types/agents'
import { StatusBadge } from '../shared/StatusBadge'
import { InfoRow } from '../shared/InfoRow'

export function CronJobCard({ job }: { job: CronJob }) {
  return (
    <div
      className={`rounded-lg border bg-gray-900 p-4 ${
        job.status === 'error' ? 'border-red-500/50' : 'border-gray-800'
      }`}
    >
      {job.status === 'error' && job.lastError && (
        <div className="mb-3 rounded bg-red-500/10 border border-red-500/30 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-400">
              {job.errorCount}x errors
            </span>
          </div>
          <p className="mt-1 text-xs text-red-300">{job.lastError}</p>
        </div>
      )}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{job.name}</h3>
        <StatusBadge status={job.status} />
      </div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            job.enabled
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}
        >
          {job.enabled ? 'enabled' : 'disabled'}
        </span>
        <span className="font-mono text-xs text-gray-500">{job.cron}</span>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed">{job.description}</p>
      <div className="space-y-1.5">
        <InfoRow label="Delivery" value={job.delivery} />
        <InfoRow label="Timezone" value={job.timezone} />
      </div>
    </div>
  )
}
