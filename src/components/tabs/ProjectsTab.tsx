import type { Project } from '../../types/dashboard'
import { ProjectDetailCard } from '../cards/ProjectDetailCard'
import { CardGrid } from '../layout/CardGrid'
import { SectionBlock } from '../shared/SectionBlock'

interface Props {
  projects: Project[]
}

const categories = [
  { key: 'active', title: 'Active Projects' },
  { key: 'tool', title: 'Tools & CLIs' },
  { key: 'analysis', title: 'Analysis & Research' },
  { key: 'infrastructure', title: 'Infrastructure' },
]

export function ProjectsTab({ projects }: Props) {
  return (
    <div className="space-y-10">
      {categories.map(({ key, title }) => {
        const items = projects.filter((p) => p.category === key)
        if (items.length === 0) return null
        return (
          <SectionBlock key={key} title={title} count={items.length}>
            <CardGrid>
              {items.map((p) => <ProjectDetailCard key={p.id} project={p} />)}
            </CardGrid>
          </SectionBlock>
        )
      })}
    </div>
  )
}
