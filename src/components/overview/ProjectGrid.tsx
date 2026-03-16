import type { Project } from '../../types/dashboard'
import { ProjectSummaryCard } from './ProjectSummaryCard'
import { loadConfig } from '../../config/loader'

interface Props {
  projects: Project[]
  onNavigate?: (tabId: string) => void
}

export function ProjectGrid({ projects, onNavigate }: Props) {
  const config = loadConfig()
  const projectTabIds = new Set(config.projectTabs.map((t) => t.projectId))

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <ProjectSummaryCard
          key={p.id}
          project={p}
          onClick={
            onNavigate
              ? () => {
                  if (projectTabIds.has(p.id)) {
                    onNavigate(p.id)
                  } else {
                    onNavigate('projects')
                  }
                }
              : undefined
          }
        />
      ))}
    </div>
  )
}
