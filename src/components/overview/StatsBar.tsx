interface StatItem {
  label: string
  value: number
  color: string
  navigateTo?: string
}

interface Props {
  stats: StatItem[]
  onNavigate?: (tabId: string) => void
}

export function StatsBar({ stats, onNavigate }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => {
        const clickable = stat.navigateTo && onNavigate
        return (
          <div
            key={stat.label}
            onClick={clickable ? () => onNavigate(stat.navigateTo!) : undefined}
            className={`rounded-lg border border-gray-800 bg-gray-900 p-4 border-t-2 ${stat.color} transition-colors ${
              clickable ? 'cursor-pointer hover:border-gray-600 hover:bg-gray-800/80' : ''
            }`}
          >
            <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}
