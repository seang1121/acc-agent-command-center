import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  count: number
  active: boolean
  collapsed: boolean
  onClick: () => void
}

export function SidebarItem({ icon, label, count, active, collapsed, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-500/10 text-blue-400 border-r-2 border-blue-500'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      } ${collapsed ? 'justify-center px-0' : ''}`}
      title={collapsed ? label : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{label}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-mono ${
              active ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'
            }`}
          >
            {count}
          </span>
        </>
      )}
    </button>
  )
}
