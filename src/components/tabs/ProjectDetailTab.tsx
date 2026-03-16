import { useMemo } from 'react'
import type { Agent, Scheduler, CronJob, Script, Repo, McpServer } from '../../types/agents'
import { AgentCard } from '../cards/AgentCard'
import { SchedulerCard } from '../cards/SchedulerCard'
import { CronJobCard } from '../cards/CronJobCard'
import { ScriptCard } from '../cards/ScriptCard'
import { RepoCard } from '../cards/RepoCard'
import { McpServerCard } from '../cards/McpCard'
import { CardGrid } from '../layout/CardGrid'
import { SectionBlock } from '../shared/SectionBlock'
import { IntegrationTree, type TreeNode } from '../shared/IntegrationTree'
import { getProjectConfig } from '../../config/loader'

interface Props {
  projectId: string
  agents: Agent[]
  schedulers: Scheduler[]
  cronJobs: CronJob[]
  scripts: Script[]
  repos: Repo[]
  mcpServers: McpServer[]
  descriptions: Record<string, string>
}

export function ProjectDetailTab(props: Props) {
  const { projectId, agents, schedulers, cronJobs, scripts, repos, mcpServers, descriptions } = props
  const projectConfig = getProjectConfig(projectId)

  const agentCategories = useMemo(() => {
    if (projectConfig?.agentCategories) return projectConfig.agentCategories
    const cats = Array.from(new Set(agents.map((a) => a.category)))
    return cats.map((c) => ({ key: c, title: c.charAt(0).toUpperCase() + c.slice(1) }))
  }, [agents, projectConfig])

  const schedulerCategories = useMemo(() => {
    if (projectConfig?.schedulerCategories) return projectConfig.schedulerCategories
    const cats = Array.from(new Set(schedulers.map((s) => s.category)))
    return cats.map((c) => ({ key: c, title: c.charAt(0).toUpperCase() + c.slice(1) }))
  }, [schedulers, projectConfig])

  const cronCategories = useMemo(() => {
    if (projectConfig?.cronCategories) return projectConfig.cronCategories
    const cats = Array.from(new Set(cronJobs.map((c) => c.category)))
    return cats.map((c) => ({ key: c, title: c.charAt(0).toUpperCase() + c.slice(1) }))
  }, [cronJobs, projectConfig])

  const desc = (key: string) => descriptions[`${projectId}-${key}`] || descriptions[key]
  const sortedScripts = useMemo(() =>
    [...scripts].sort((a, b) => (b.critical ? 1 : 0) - (a.critical ? 1 : 0)),
    [scripts]
  )

  const integrationTree = useMemo((): TreeNode[] => {
    const root: TreeNode = {
      id: projectId,
      label: projectId.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
      color: '#3b82f6',
      children: [],
    }

    if (agents.length > 0) {
      const agentNode: TreeNode = { id: 'agents', label: `Agents (${agents.length})`, color: '#8b5cf6', children: [] }
      const byCategory = new Map<string, Agent[]>()
      for (const a of agents) {
        const cat = a.category
        if (!byCategory.has(cat)) byCategory.set(cat, [])
        byCategory.get(cat)!.push(a)
      }
      for (const [cat, items] of byCategory) {
        agentNode.children!.push({
          id: `agent-${cat}`,
          label: `${cat} (${items.length})`,
          color: '#a78bfa',
          children: items.slice(0, 4).map((a) => ({ id: a.name, label: a.name, color: '#c4b5fd' })),
        })
      }
      root.children!.push(agentNode)
    }

    if (schedulers.length > 0) {
      root.children!.push({
        id: 'schedulers',
        label: `Schedulers (${schedulers.length})`,
        color: '#f59e0b',
        children: schedulers.slice(0, 5).map((s) => ({ id: s.name, label: s.name, color: '#fbbf24' })),
      })
    }

    if (cronJobs.length > 0) {
      root.children!.push({
        id: 'crons',
        label: `Cron Jobs (${cronJobs.length})`,
        color: '#10b981',
        children: cronJobs.slice(0, 5).map((c) => ({ id: c.id, label: c.name, color: '#34d399' })),
      })
    }

    if (scripts.length > 0) {
      root.children!.push({
        id: 'scripts',
        label: `Scripts (${scripts.length})`,
        color: '#ef4444',
        children: sortedScripts.slice(0, 4).map((s) => ({ id: s.name, label: s.name, color: s.critical ? '#f87171' : '#6b7280' })),
      })
    }

    if (mcpServers.length > 0) {
      root.children!.push({
        id: 'mcp',
        label: `MCP Servers (${mcpServers.length})`,
        color: '#14b8a6',
        children: mcpServers.map((m) => ({ id: m.name, label: m.name, color: '#2dd4bf' })),
      })
    }

    return [root]
  }, [projectId, agents, schedulers, cronJobs, scripts, sortedScripts, mcpServers])

  const hasContent = agents.length > 0 || schedulers.length > 0 || cronJobs.length > 0 || scripts.length > 0 || repos.length > 0 || mcpServers.length > 0

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">No data found for this project. Run <code className="text-blue-400">/setup-daav</code> to scan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {projectConfig?.infrastructure && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {projectConfig.infrastructure.map((entry) => (
              <div key={entry.label}>
                <span className="text-xs text-gray-500">{entry.label}</span>
                <p className="text-sm font-mono text-gray-300">{entry.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <IntegrationTree roots={integrationTree} title="Project Integration Map" />

      {repos.length > 0 && (
        <SectionBlock title="Repositories" count={repos.length}>
          <CardGrid>
            {repos.map((r) => <RepoCard key={r.name} repo={r} />)}
          </CardGrid>
        </SectionBlock>
      )}

      {agentCategories.map(({ key, title }) => {
        const items = agents.filter((a) => a.category === key)
        if (items.length === 0) return null
        return (
          <SectionBlock key={key} title={title} count={items.length} description={desc(key)}>
            <CardGrid>
              {items.map((a) => <AgentCard key={a.name} agent={a} />)}
            </CardGrid>
          </SectionBlock>
        )
      })}

      {schedulerCategories.map(({ key, title }) => {
        const items = schedulers.filter((s) => s.category === key)
        if (items.length === 0) return null
        return (
          <SectionBlock key={`sched-${key}`} title={title} count={items.length} description={desc(key)}>
            <CardGrid>
              {items.map((s) => <SchedulerCard key={s.name} scheduler={s} />)}
            </CardGrid>
          </SectionBlock>
        )
      })}

      {cronCategories.map(({ key, title }) => {
        const items = cronJobs.filter((c) => c.category === key)
        if (items.length === 0) return null
        return (
          <SectionBlock key={`cron-${key}`} title={title} count={items.length} description={desc(key)}>
            <CardGrid>
              {items.map((c) => <CronJobCard key={c.id} job={c} />)}
            </CardGrid>
          </SectionBlock>
        )
      })}

      {mcpServers.length > 0 && (
        <SectionBlock title="MCP Servers" count={mcpServers.length}>
          <CardGrid>
            {mcpServers.map((s) => <McpServerCard key={s.name} server={s} />)}
          </CardGrid>
        </SectionBlock>
      )}

      {sortedScripts.length > 0 && (
        <SectionBlock title="Scripts" count={sortedScripts.length}>
          <CardGrid>
            {sortedScripts.map((s) => <ScriptCard key={s.name} script={s} />)}
          </CardGrid>
        </SectionBlock>
      )}
    </div>
  )
}
