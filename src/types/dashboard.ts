export type ProjectCategory = 'active' | 'tool' | 'analysis' | 'infrastructure' | 'archived'
export type ProjectStatus = 'active' | 'maintained' | 'archived' | 'template'

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  techStack: string[]
  status: ProjectStatus
  path: string
  repoUrl?: string
  isGitRepo: boolean
  highlights?: string[]
  relatedProjects?: string[]
}

export interface ClaudeTool {
  name: string
  type: 'command' | 'skill' | 'agent'
  filePath: string
  description: string
}

export interface Relationship {
  from: string
  to: string
  label: string
  type: 'data' | 'trigger' | 'publish' | 'extends'
}

export interface ArchivedRepo {
  name: string
  path: string
  description: string
  techStack: string[]
  originalUrl?: string
}
