import type { Project } from '../../types/dashboard'
import { CardGrid } from '../layout/CardGrid'
import { SectionBlock } from '../shared/SectionBlock'
import { TechBadge } from '../shared/TechBadge'

interface Props {
  projects: Project[]
}

const categories = [
  { key: 'active', title: 'Active Projects' },
  { key: 'tool', title: 'Tools & CLIs' },
  { key: 'analysis', title: 'Analysis & Research' },
  { key: 'infrastructure', title: 'Infrastructure' },
]

function RepoLinkCard({ project }: { project: Project }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700">
      <div className="mb-3 flex items-start justify-between">
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          {project.name}
        </a>
        <span className="rounded-full border border-gray-500/30 bg-gray-500/20 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {project.category}
        </span>
      </div>
      <p className="mb-3 text-xs text-gray-400 leading-relaxed line-clamp-2">
        {project.description}
      </p>
      {project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((t) => (
            <TechBadge key={t} tech={t} />
          ))}
        </div>
      )}
    </div>
  )
}

export function GitHubReposTab({ projects }: Props) {
  const repos = projects.filter((p) => p.isGitRepo && p.repoUrl)

  return (
    <div className="space-y-10">
      {categories.map(({ key, title }) => {
        const items = repos.filter((p) => p.category === key)
        if (items.length === 0) return null
        return (
          <SectionBlock key={key} title={title} count={items.length}>
            <CardGrid>
              {items.map((p) => <RepoLinkCard key={p.id} project={p} />)}
            </CardGrid>
          </SectionBlock>
        )
      })}
    </div>
  )
}
