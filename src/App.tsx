import { useState, useMemo } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar, type NavItem } from './components/layout/Sidebar'
import { OverviewTab } from './components/overview/OverviewTab'
import { ProjectDetailTab } from './components/tabs/ProjectDetailTab'
import { ProjectsTab } from './components/tabs/ProjectsTab'
import { GitHubReposTab } from './components/tabs/GitHubReposTab'
import { AutomationsTab } from './components/tabs/AutomationsTab'
import { ClaudeEcosystemTab } from './components/tabs/ClaudeEcosystemTab'
import { useDashboardData } from './hooks/useDashboardData'
import { loadConfig } from './config/loader'
import { getIcon } from './config/icons'

function App() {
  const data = useDashboardData()
  const config = loadConfig()
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')

  const byProject = <T extends { project: string }>(items: T[], id: string) =>
    items.filter((i) => i.project === id)

  const automationsCount =
    data.agents.length + data.schedulers.length + data.cronJobs.length + data.scripts.length

  const claudeCount =
    data.claudeTools.length + data.mcpServers.length + data.hooks.length + data.archived.length + data.marketplacePlugins.length

  const gitRepoCount = data.projects.filter((p) => p.isGitRepo && p.repoUrl).length

  const navItems: NavItem[] = useMemo(() => {
    const fixed: NavItem[] = [
      { id: 'overview', label: 'Overview', count: data.projects.length, icon: getIcon('overview') },
    ]

    const projectNavs: NavItem[] = config.projectTabs.map((tab) => {
      const count =
        byProject(data.agents, tab.projectId).length +
        byProject(data.schedulers, tab.projectId).length +
        byProject(data.cronJobs, tab.projectId).length +
        byProject(data.scripts, tab.projectId).length +
        byProject(data.mcpServers, tab.projectId).length +
        byProject(data.repos, tab.projectId).length
      return {
        id: tab.projectId,
        label: tab.label,
        count,
        icon: getIcon(tab.icon),
      }
    })

    const systemNavs: NavItem[] = [
      { id: 'projects', label: 'Projects', count: data.projects.length, icon: getIcon('projects') },
      { id: 'github-repos', label: 'GitHub Repos', count: gitRepoCount, icon: getIcon('github') },
      { id: 'automations', label: 'All Automations', count: automationsCount, icon: getIcon('automations') },
      { id: 'claude', label: 'Claude Ecosystem', count: claudeCount, icon: getIcon('claude') },
    ]

    return [...fixed, ...projectNavs, ...systemNavs]
  }, [config.projectTabs, data, automationsCount, claudeCount, gitRepoCount])

  const filteredData = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return {
      ...data,
      projects: data.projects.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      ),
      agents: data.agents.filter(
        (a) => a.name.toLowerCase().includes(q) || a.purpose.toLowerCase().includes(q)
      ),
      schedulers: data.schedulers.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      ),
      cronJobs: data.cronJobs.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      ),
      scripts: data.scripts.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      ),
      claudeTools: data.claudeTools.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      ),
      archived: data.archived.filter(
        (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      ),
      marketplacePlugins: data.marketplacePlugins.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      ),
    }
  }, [data, search])

  const isProjectTab = config.projectTabs.some((t) => t.projectId === activeTab)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="lg:pl-60 transition-all duration-200">
        <Header search={search} onSearchChange={setSearch} />
        <main className="mx-auto max-w-7xl p-6">
          {activeTab === 'overview' && (
            <OverviewTab data={filteredData} onNavigate={setActiveTab} />
          )}
          {isProjectTab && (
            <ProjectDetailTab
              projectId={activeTab}
              agents={byProject(filteredData.agents, activeTab)}
              schedulers={byProject(filteredData.schedulers, activeTab)}
              cronJobs={byProject(filteredData.cronJobs, activeTab)}
              scripts={byProject(filteredData.scripts, activeTab)}
              repos={byProject(filteredData.repos, activeTab)}
              mcpServers={byProject(filteredData.mcpServers, activeTab)}
              descriptions={filteredData.sectionDescriptions}
            />
          )}
          {activeTab === 'projects' && (
            <ProjectsTab projects={filteredData.projects} />
          )}
          {activeTab === 'github-repos' && (
            <GitHubReposTab projects={filteredData.projects} />
          )}
          {activeTab === 'automations' && (
            <AutomationsTab
              agents={filteredData.agents}
              schedulers={filteredData.schedulers}
              cronJobs={filteredData.cronJobs}
              scripts={filteredData.scripts}
            />
          )}
          {activeTab === 'claude' && (
            <ClaudeEcosystemTab
              claudeTools={filteredData.claudeTools}
              mcpServers={filteredData.mcpServers}
              hooks={filteredData.hooks}
              archived={filteredData.archived}
              marketplacePlugins={filteredData.marketplacePlugins}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
