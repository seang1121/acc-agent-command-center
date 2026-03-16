import agents from '../data/agents.json'
import schedulers from '../data/schedulers.json'
import cronJobs from '../data/cron-jobs.json'
import repos from '../data/repos.json'
import infrastructure from '../data/infrastructure.json'
import descriptions from '../data/descriptions.json'
import projects from '../data/projects.json'
import claudeTools from '../data/claude-tools.json'
import archived from '../data/archived.json'
import relationships from '../data/relationships.json'
import marketplacePlugins from '../data/marketplace-plugins.json'
import type { DashboardData } from '../types/agents'

export function useDashboardData(): DashboardData {
  return {
    agents,
    schedulers,
    cronJobs,
    repos,
    mcpServers: infrastructure.mcpServers,
    hooks: infrastructure.hooks,
    scripts: infrastructure.scripts,
    sectionDescriptions: descriptions,
    projects,
    claudeTools,
    archived,
    relationships,
    marketplacePlugins,
  } as DashboardData
}
