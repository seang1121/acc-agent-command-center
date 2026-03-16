export interface ProjectTabConfig {
  projectId: string
  label: string
  icon: string
}

export interface InfrastructureEntry {
  label: string
  value: string
}

export interface ProjectConfig {
  projectId: string
  infrastructure?: InfrastructureEntry[]
  agentCategories?: { key: string; title: string }[]
  cronCategories?: { key: string; title: string }[]
  schedulerCategories?: { key: string; title: string }[]
}

export interface AccConfig {
  title: string
  projectTabs: ProjectTabConfig[]
  projects?: ProjectConfig[]
  centerNode?: string
}
