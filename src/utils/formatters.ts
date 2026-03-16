import type { AgentType, Status } from '../types/agents'

export const typeColors: Record<AgentType, string> = {
  parallel: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sequential: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  daemon: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  orchestrator: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  external: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

export const typeBorderColors: Record<AgentType, string> = {
  parallel: 'border-l-blue-500',
  sequential: 'border-l-purple-500',
  daemon: 'border-l-amber-500',
  orchestrator: 'border-l-emerald-500',
  external: 'border-l-pink-500',
}

export const statusColors: Record<Status, string> = {
  active: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  inactive: 'bg-gray-500',
}

export const techStackColors: Record<string, string> = {
  Python: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TypeScript: 'bg-blue-700/20 text-blue-300 border-blue-700/30',
  JavaScript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Node.js': 'bg-green-500/20 text-green-400 border-green-500/30',
  React: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Flask: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  SQLite: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Tailwind: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'scikit-learn': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MCP: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Discord.js': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  PM2: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  Markdown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Shell: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  HTML: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CSS: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Rust: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
  Go: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30',
  Docker: 'bg-sky-600/20 text-sky-300 border-sky-600/30',
  PostgreSQL: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  Redis: 'bg-red-500/20 text-red-400 border-red-500/30',
  Next: 'bg-gray-600/20 text-gray-300 border-gray-600/30',
  FastAPI: 'bg-teal-600/20 text-teal-300 border-teal-600/30',
}

export function formatWeight(w: number | null | undefined): string {
  if (w == null) return '—'
  return `${(w * 100).toFixed(0)}%`
}

export const categoryColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  tool: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  analysis: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  infrastructure: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  archived: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export const statusTextColors: Record<string, string> = {
  active: 'text-green-400',
  maintained: 'text-blue-400',
  archived: 'text-amber-400',
  template: 'text-gray-400',
}
