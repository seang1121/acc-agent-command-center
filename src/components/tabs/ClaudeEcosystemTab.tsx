import { useMemo } from 'react'
import type { ClaudeTool, ArchivedRepo } from '../../types/dashboard'
import type { McpServer, Hook, MarketplacePlugin } from '../../types/agents'
import { ClaudeToolCard } from '../cards/ClaudeToolCard'
import { McpServerCard, HookCard } from '../cards/McpCard'
import { MarketplacePluginCard } from '../cards/MarketplacePluginCard'
import { CardGrid } from '../layout/CardGrid'
import { SectionBlock } from '../shared/SectionBlock'
import { TechBadge } from '../shared/TechBadge'
import { IntegrationTree, type TreeNode } from '../shared/IntegrationTree'

interface Props {
  claudeTools: ClaudeTool[]
  mcpServers: McpServer[]
  hooks: Hook[]
  archived: ArchivedRepo[]
  marketplacePlugins: MarketplacePlugin[]
}

function ArchivedRepoCard({ repo }: { repo: ArchivedRepo }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{repo.name}</h3>
        <span className="rounded-full border bg-amber-500/20 text-amber-400 border-amber-500/30 px-2.5 py-0.5 text-xs font-medium">
          archived
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-gray-400">
        {repo.description}
      </p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {repo.techStack.map((t) => (
          <TechBadge key={t} tech={t} />
        ))}
      </div>
      <span className="font-mono text-xs text-gray-500">{repo.path}</span>
    </div>
  )
}

export function ClaudeEcosystemTab({
  claudeTools,
  mcpServers,
  hooks,
  archived,
  marketplacePlugins,
}: Props) {
  const commands = claudeTools.filter((t) => t.type === 'command')
  const agents = claudeTools.filter((t) => t.type === 'agent')
  const skills = claudeTools.filter((t) => t.type === 'skill')

  const ecosystemTree = useMemo((): TreeNode[] => {
    const root: TreeNode = { id: 'claude', label: 'Claude Ecosystem', color: '#f97316', children: [] }

    if (commands.length > 0) {
      root.children!.push({
        id: 'commands', label: `Commands (${commands.length})`, color: '#3b82f6',
        children: commands.map((c) => ({ id: c.name, label: c.name, color: '#60a5fa' })),
      })
    }
    if (agents.length > 0) {
      root.children!.push({
        id: 'agents', label: `Agents (${agents.length})`, color: '#10b981',
        children: agents.map((a) => ({ id: a.name, label: a.name, color: '#34d399' })),
      })
    }
    if (skills.length > 0) {
      root.children!.push({
        id: 'skills', label: `Skills (${skills.length})`, color: '#8b5cf6',
        children: skills.map((s) => ({ id: s.name, label: s.name, color: '#a78bfa' })),
      })
    }
    if (mcpServers.length > 0) {
      root.children!.push({
        id: 'mcp', label: `MCP Servers (${mcpServers.length})`, color: '#14b8a6',
        children: mcpServers.map((m) => ({ id: m.name, label: m.name, color: '#2dd4bf' })),
      })
    }
    if (hooks.length > 0) {
      root.children!.push({ id: 'hooks', label: `Hooks (${hooks.length})`, color: '#f59e0b' })
    }
    if (marketplacePlugins.length > 0) {
      const installed = marketplacePlugins.filter((p) => p.installed)
      root.children!.push({
        id: 'plugins', label: `Plugins (${installed.length}/${marketplacePlugins.length})`, color: '#ec4899',
      })
    }

    return [root]
  }, [commands, agents, skills, mcpServers, hooks, marketplacePlugins])

  return (
    <div className="space-y-10">
      <IntegrationTree roots={ecosystemTree} title="Claude Ecosystem Overview" />

      {commands.length > 0 && (
        <SectionBlock
          title="Commands"
          count={commands.length}
          description="Custom slash commands for Claude Code CLI"
        >
          <CardGrid>
            {commands.map((t) => (
              <ClaudeToolCard key={t.name} tool={t} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {agents.length > 0 && (
        <SectionBlock
          title="Custom Agents"
          count={agents.length}
          description="Specialized Claude Code agents for domain-specific tasks"
        >
          <CardGrid>
            {agents.map((t) => (
              <ClaudeToolCard key={t.name} tool={t} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {skills.length > 0 && (
        <SectionBlock title="Skills" count={skills.length}>
          <CardGrid>
            {skills.map((t) => (
              <ClaudeToolCard key={t.name} tool={t} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {mcpServers.length > 0 && (
        <SectionBlock
          title="MCP Servers"
          count={mcpServers.length}
          description="Model Context Protocol servers exposing tools to Claude"
        >
          <CardGrid>
            {mcpServers.map((s) => (
              <McpServerCard key={s.name} server={s} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {marketplacePlugins.length > 0 && (
        <SectionBlock
          title="Available Plugins"
          count={marketplacePlugins.length}
          description="Marketplace plugins — activate in Claude settings"
        >
          <CardGrid>
            {marketplacePlugins.map((p) => (
              <MarketplacePluginCard key={p.name} plugin={p} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {hooks.length > 0 && (
        <SectionBlock
          title="Hooks"
          count={hooks.length}
          description="Security and compliance gates for Claude Code sessions"
        >
          <CardGrid>
            {hooks.map((h) => (
              <HookCard key={h.name} hook={h} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {archived.length > 0 && (
        <SectionBlock
          title="Archived Repositories"
          count={archived.length}
          description="Historical project snapshots and templates"
        >
          <CardGrid>
            {archived.map((r) => (
              <ArchivedRepoCard key={r.name} repo={r} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}
    </div>
  )
}
