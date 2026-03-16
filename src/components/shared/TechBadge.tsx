import { techStackColors } from '../../utils/formatters'

export function TechBadge({ tech }: { tech: string }) {
  const colors = techStackColors[tech] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${colors}`}>
      {tech}
    </span>
  )
}
