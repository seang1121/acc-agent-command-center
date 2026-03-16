interface FilterOption {
  label: string
  value: string
  count?: number
}

interface Props {
  options: FilterOption[]
  selected: string
  onChange: (value: string) => void
  label?: string
}

export function FilterBar({ options, selected, onChange, label }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="text-xs text-gray-500 font-medium mr-1">{label}</span>}
      <button
        onClick={() => onChange('all')}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selected === 'all'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200'
        }`}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === opt.value
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200'
          }`}
        >
          {opt.label}
          {opt.count != null && (
            <span className="ml-1.5 font-mono">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
