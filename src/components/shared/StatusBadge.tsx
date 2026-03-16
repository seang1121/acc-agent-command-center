import type { Status } from '../../types/agents'
import { statusColors } from '../../utils/formatters'

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${statusColors[status]} ${
          status === 'error' ? 'animate-pulse' : ''
        }`}
      />
      <span className="text-xs text-gray-400 capitalize">{status}</span>
    </span>
  )
}
