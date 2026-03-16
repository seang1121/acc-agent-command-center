import type { MarketplacePlugin } from '../../types/agents'

const kindColors: Record<string, string> = {
  mcp: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  skill: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  lsp: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  hook: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hybrid: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

const transportColors: Record<string, string> = {
  http: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  sse: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  stdio: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function formatInstalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return String(n)
}

export function MarketplacePluginCard({ plugin }: { plugin: MarketplacePlugin }) {
  const kindClass = kindColors[plugin.kind] || kindColors.skill
  const borderClass = plugin.installed ? 'border-gray-700' : 'border-gray-800/50'
  const opacityClass = plugin.installed ? 'opacity-90 hover:opacity-100' : 'opacity-60 hover:opacity-80'

  return (
    <div className={`rounded-lg border ${borderClass} bg-gray-900/60 p-4 transition-opacity ${opacityClass}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{plugin.name}</h3>
          {plugin.installed && (
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] text-emerald-400">
              installed
            </span>
          )}
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${kindClass}`}>
          {plugin.kind}
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-gray-400">{plugin.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {plugin.transport && (
          <span className={`rounded-full border px-2 py-0.5 text-xs ${transportColors[plugin.transport] || transportColors.stdio}`}>
            {plugin.transport}
          </span>
        )}
        {plugin.envVars && plugin.envVars.length > 0 &&
          plugin.envVars.map((v) => (
            <span
              key={v}
              className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400"
            >
              {v}
            </span>
          ))}
        {plugin.oauth && (
          <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
            OAuth
          </span>
        )}
        {plugin.installs != null && plugin.installs > 0 && (
          <span className="ml-auto text-[10px] text-gray-500">
            {formatInstalls(plugin.installs)} installs
          </span>
        )}
      </div>
    </div>
  )
}
