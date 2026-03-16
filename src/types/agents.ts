export type AgentType = 'parallel' | 'sequential' | 'daemon' | 'orchestrator' | 'external'
export type Status = 'active' | 'warning' | 'error' | 'inactive'

export interface Agent {
  name: string
  type: AgentType
  purpose: string
  weight?: number
  scoreRange?: string
  dataSources: string[]
  module: string
  status: Status
  project: string
  category: string
}

export interface Scheduler {
  name: string
  schedule: string
  cron: string
  triggerType: 'cron' | 'daemon' | 'manual'
  timezone: string
  status: Status
  project: string
  category: string
  description: string
}

export interface CronJob {
  id: string
  name: string
  enabled: boolean
  cron: string
  timezone: string
  delivery: string
  status: Status
  errorCount: number
  lastError?: string
  project: string
  category: string
  description: string
}

export interface Repo {
  name: string
  url: string
  visibility: 'public' | 'private'
  description: string
  agentCount?: number
  automationCount?: number
  project: string
}

export interface McpServer {
  name: string
  version: string
  transport: string
  command: string
  description: string
  project: string
}

export interface Hook {
  name: string
  event: string
  matcher?: string
  command: string
  description: string
  project: string
}

export interface Script {
  name: string
  path: string
  description: string
  critical: boolean
  frequency: string
  project: string
}

export interface MarketplacePlugin {
  name: string
  kind: 'mcp' | 'skill' | 'lsp' | 'hook' | 'hybrid'
  transport?: 'sse' | 'http' | 'stdio'
  url?: string
  command?: string
  args?: string[]
  envVars?: string[]
  oauth?: boolean
  installs?: number
  installed: boolean
  description: string
}

export interface DashboardData {
  agents: Agent[]
  schedulers: Scheduler[]
  cronJobs: CronJob[]
  repos: Repo[]
  mcpServers: McpServer[]
  hooks: Hook[]
  scripts: Script[]
  sectionDescriptions: Record<string, string>
  projects: import('../types/dashboard').Project[]
  claudeTools: import('../types/dashboard').ClaudeTool[]
  archived: import('../types/dashboard').ArchivedRepo[]
  relationships: import('../types/dashboard').Relationship[]
  marketplacePlugins: MarketplacePlugin[]
}
