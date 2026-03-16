import { useState, type ReactNode } from 'react'
import { SidebarItem } from './SidebarItem'

interface NavItem {
  id: string
  label: string
  count: number
  icon: ReactNode
}

interface SidebarProps {
  items: NavItem[]
  activeTab: string
  onTabChange: (id: string) => void
}

export function Sidebar({ items, activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-800 bg-gray-900 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
        {!collapsed && (
          <span className="text-sm font-bold text-white tracking-tight truncate">
            ACC
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            count={item.count}
            active={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>

      <div className="border-t border-gray-800 px-4 py-3">
        {!collapsed && (
          <span className="text-xs text-gray-600 font-mono">ACC v1.0</span>
        )}
      </div>
    </aside>
  )
}

export { type NavItem }
