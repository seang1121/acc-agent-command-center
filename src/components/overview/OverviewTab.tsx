import type { DashboardData } from '../../types/agents'
import { StatsBar } from './StatsBar'
import { ProjectGrid } from './ProjectGrid'
import { RelationshipMap } from './RelationshipMap'
import { SectionBlock } from '../shared/SectionBlock'

interface Props {
  data: DashboardData
  onNavigate: (tabId: string) => void
}

export function OverviewTab({ data, onNavigate }: Props) {
  const stats = [
    { label: 'Total Projects', value: data.projects.length, color: 'border-t-blue-500', navigateTo: 'projects' },
    {
      label: 'Git Repos',
      value: data.projects.filter((p) => p.isGitRepo).length,
      color: 'border-t-emerald-500',
      navigateTo: 'github-repos',
    },
    { label: 'Active Agents', value: data.agents.length, color: 'border-t-purple-500', navigateTo: 'automations' },
    {
      label: 'Automations',
      value: data.schedulers.length + data.cronJobs.length + data.scripts.length,
      color: 'border-t-amber-500',
      navigateTo: 'automations',
    },
    { label: 'MCP Servers', value: data.mcpServers.length, color: 'border-t-cyan-500', navigateTo: 'claude' },
    {
      label: 'Languages',
      value: new Set(data.projects.flatMap((p) => p.techStack)).size,
      color: 'border-t-pink-500',
      navigateTo: 'projects',
    },
  ]

  return (
    <div className="space-y-10">
      <StatsBar stats={stats} onNavigate={onNavigate} />

      <SectionBlock title="All Projects" count={data.projects.length}>
        <ProjectGrid projects={data.projects} onNavigate={onNavigate} />
      </SectionBlock>

      {data.relationships.length > 0 && (
        <SectionBlock title="Project Relationships" count={data.relationships.length}>
          <RelationshipMap relationships={data.relationships} data={data} onNavigate={onNavigate} />
        </SectionBlock>
      )}
    </div>
  )
}
