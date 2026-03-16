import type { AccConfig } from '../types/config'
import configData from '../../acc.config.json'

const config: AccConfig = configData || { title: 'Agent Command Center', projectTabs: [] }

export function loadConfig(): AccConfig {
  return config
}

export function getProjectConfig(projectId: string) {
  return config.projects?.find((p) => p.projectId === projectId)
}
