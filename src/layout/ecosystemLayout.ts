import type { Project } from '../types/dashboard'
import type { Relationship } from '../types/dashboard'
import type { DomainId } from '../types/dashboard'

export { type DomainId }

export const DOMAINS: Record<DomainId, { label: string; color: string }> = {
  sports:   { label: 'SPORTS',   color: '#f59e0b' },
  finance:  { label: 'FINANCE',  color: '#22c55e' },
  infra:    { label: 'INFRA',    color: '#3b82f6' },
  outdoors: { label: 'OUTDOORS', color: '#10b981' },
  other:    { label: 'OTHER',    color: '#6b7280' },
}

export interface CenterNode {
  id: string; x: number; y: number; label: string; color: string
}
export interface DomainNode {
  id: DomainId; x: number; y: number; label: string; color: string; angle: number
}
export interface LeafNode {
  id: string; x: number; y: number; label: string; color: string
  domain: DomainId; parentX: number; parentY: number
}
export interface LayoutEdge {
  from: string; to: string; label: string; type: string; color: string
}
export interface EcosystemLayout {
  center: CenterNode
  domains: DomainNode[]
  leaves: LeafNode[]
  edges: LayoutEdge[]
}

const EDGE_COLORS: Record<string, string> = {
  data: '#3b82f6', trigger: '#f59e0b', publish: '#10b981', extends: '#8b5cf6',
}
const CENTER_ID = 'llm-engine'
const CENTER_COLOR = '#06b6d4'
const DOMAIN_RADIUS = 280
const LEAF_RADIUS = 480
const W = 1400
const H = 750

export function computeEcosystemLayout(
  projects: Project[],
  relationships: Relationship[]
): EcosystemLayout {
  const cx = W / 2
  const cy = H / 2

  const center: CenterNode = { id: CENTER_ID, x: cx, y: cy, label: 'CLAUDE', color: CENTER_COLOR }

  // Group projects by domain, skip center node
  const domainMap = new Map<DomainId, Project[]>()
  const allDomains: DomainId[] = ['sports', 'finance', 'infra', 'outdoors', 'other']
  for (const d of allDomains) domainMap.set(d, [])
  for (const p of projects) {
    if (p.id === CENTER_ID) continue
    domainMap.get(p.domain)!.push(p)
  }

  // Domain nodes — evenly spaced radial ring
  const activeDomains = allDomains.filter(d => domainMap.get(d)!.length > 0)
  const domainNodes: DomainNode[] = activeDomains.map((id, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / activeDomains.length
    return {
      id,
      x: cx + DOMAIN_RADIUS * Math.cos(angle),
      y: cy + DOMAIN_RADIUS * Math.sin(angle),
      label: DOMAINS[id].label,
      color: DOMAINS[id].color,
      angle,
    }
  })

  // Leaf nodes — fan outward from each domain node
  const leaves: LeafNode[] = []
  for (const dn of domainNodes) {
    const children = domainMap.get(dn.id)!
    if (children.length === 0) continue
    const maxHalf = Math.min(55 * (Math.PI / 180), children.length * 8 * (Math.PI / 180))
    children.forEach((p, i) => {
      const t = children.length === 1 ? 0 : (i / (children.length - 1)) * 2 - 1
      const leafAngle = dn.angle + t * maxHalf
      leaves.push({
        id: p.id,
        x: cx + LEAF_RADIUS * Math.cos(leafAngle),
        y: cy + LEAF_RADIUS * Math.sin(leafAngle),
        label: p.name,
        color: DOMAINS[dn.id].color,
        domain: dn.id,
        parentX: dn.x,
        parentY: dn.y,
      })
    })
  }

  applyRepulsion(leaves, 90, 20)

  // Build edges — remap llm-engine source to target's domain node
  const leafDomainMap = new Map(leaves.map(l => [l.id, l.domain]))
  const knownIds = new Set([CENTER_ID, ...domainNodes.map(d => d.id), ...leaves.map(l => l.id)])

  const seen = new Set<string>()
  const edges: LayoutEdge[] = []
  for (const r of relationships) {
    let from = r.from
    let to = r.to
    if (from === CENTER_ID && leafDomainMap.has(to)) to = leafDomainMap.get(to)!
    if (to === CENTER_ID && leafDomainMap.has(from)) from = leafDomainMap.get(from)!
    if (!knownIds.has(from) || !knownIds.has(to)) continue
    const key = `${from}→${to}`
    if (seen.has(key)) continue
    seen.add(key)
    edges.push({ from, to, label: r.label, type: r.type, color: EDGE_COLORS[r.type] ?? '#6b7280' })
  }

  return { center, domains: domainNodes, leaves, edges }
}

function applyRepulsion(nodes: LeafNode[], minDist: number, iters: number): void {
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        if (dist < minDist) {
          const push = ((minDist - dist) / dist) * 0.3
          nodes[i].x -= dx * push
          nodes[i].y -= dy * push
          nodes[j].x += dx * push
          nodes[j].y += dy * push
        }
      }
    }
  }
}
