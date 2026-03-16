import { useState, useMemo } from 'react'
import type { Agent, Scheduler, CronJob, Script } from '../../types/agents'
import { AgentCard } from '../cards/AgentCard'
import { SchedulerCard } from '../cards/SchedulerCard'
import { CronJobCard } from '../cards/CronJobCard'
import { ScriptCard } from '../cards/ScriptCard'
import { CardGrid } from '../layout/CardGrid'
import { SectionBlock } from '../shared/SectionBlock'
import { FilterBar } from '../shared/FilterBar'
import { IntegrationTree, type TreeNode } from '../shared/IntegrationTree'

interface Props {
  agents: Agent[]
  schedulers: Scheduler[]
  cronJobs: CronJob[]
  scripts: Script[]
}

export function AutomationsTab({ agents, schedulers, cronJobs, scripts }: Props) {
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const allProjects = Array.from(
    new Set([
      ...agents.map((a) => a.project),
      ...schedulers.map((s) => s.project),
      ...cronJobs.map((c) => c.project),
      ...scripts.map((s) => s.project),
    ])
  )

  const projectOptions = allProjects.map((p) => ({ label: p, value: p }))
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'Inactive', value: 'inactive' },
  ]

  const filterByProject = <T extends { project: string }>(items: T[]) =>
    projectFilter === 'all' ? items : items.filter((i) => i.project === projectFilter)

  const filterByStatus = <T extends { status: string }>(items: T[]) =>
    statusFilter === 'all' ? items : items.filter((i) => i.status === statusFilter)

  const filteredAgents = filterByStatus(filterByProject(agents))
  const filteredSchedulers = filterByStatus(filterByProject(schedulers))
  const filteredCronJobs = filterByStatus(filterByProject(cronJobs))
  const filteredScripts = filterByProject(scripts)

  const automationTree = useMemo((): TreeNode[] => {
    const projectMap = new Map<string, TreeNode>()
    for (const proj of allProjects) {
      const children: TreeNode[] = []
      const projAgents = agents.filter((a) => a.project === proj)
      const projScheds = schedulers.filter((s) => s.project === proj)
      const projCrons = cronJobs.filter((c) => c.project === proj)
      const projScripts = scripts.filter((s) => s.project === proj)

      if (projAgents.length > 0) children.push({ id: `${proj}-agents`, label: `Agents (${projAgents.length})`, color: '#8b5cf6' })
      if (projScheds.length > 0) children.push({ id: `${proj}-scheds`, label: `Schedulers (${projScheds.length})`, color: '#f59e0b' })
      if (projCrons.length > 0) children.push({ id: `${proj}-crons`, label: `Cron Jobs (${projCrons.length})`, color: '#10b981' })
      if (projScripts.length > 0) children.push({ id: `${proj}-scripts`, label: `Scripts (${projScripts.length})`, color: '#ef4444' })

      if (children.length > 0) {
        projectMap.set(proj, {
          id: proj,
          label: proj.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
          color: '#3b82f6',
          children,
        })
      }
    }
    return Array.from(projectMap.values())
  }, [allProjects, agents, schedulers, cronJobs, scripts])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <FilterBar
          label="Project:"
          options={projectOptions}
          selected={projectFilter}
          onChange={setProjectFilter}
        />
        <FilterBar
          label="Status:"
          options={statusOptions}
          selected={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {automationTree.length > 1 && (
        <IntegrationTree roots={automationTree} title="Automation Ownership" />
      )}

      {filteredAgents.length > 0 && (
        <SectionBlock title="Agents" count={filteredAgents.length}>
          <CardGrid>
            {filteredAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {filteredSchedulers.length > 0 && (
        <SectionBlock title="Schedulers" count={filteredSchedulers.length}>
          <CardGrid>
            {filteredSchedulers.map((s) => (
              <SchedulerCard key={s.name} scheduler={s} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {filteredCronJobs.length > 0 && (
        <SectionBlock title="Cron Jobs" count={filteredCronJobs.length}>
          <CardGrid>
            {filteredCronJobs.map((j) => (
              <CronJobCard key={j.id} job={j} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}

      {filteredScripts.length > 0 && (
        <SectionBlock title="Scripts" count={filteredScripts.length}>
          <CardGrid>
            {filteredScripts.map((s) => (
              <ScriptCard key={s.name} script={s} />
            ))}
          </CardGrid>
        </SectionBlock>
      )}
    </div>
  )
}
