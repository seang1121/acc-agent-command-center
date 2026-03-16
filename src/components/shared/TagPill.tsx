import type { AgentType } from '../../types/agents'
import { typeColors } from '../../utils/formatters'

export function TagPill({ type }: { type: AgentType }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeColors[type]}`}
    >
      {type}
    </span>
  )
}
