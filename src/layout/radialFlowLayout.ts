import type { Node, Edge } from '@xyflow/react'
import type { Project, Relationship, DomainId } from '../types/dashboard'

const DOMAIN_CONFIG: Record<DomainId, { label: string; color: string }> = {
  sports:   { label: 'SPORTS',   color: '#f59e0b' },
  finance:  { label: 'FINANCE',  color: '#22c55e' },
  infra:    { label: 'INFRA',    color: '#3b82f6' },
  outdoors: { label: 'OUTDOORS', color: '#10b981' },
  other:    { label: 'OTHER',    color: '#6b7280' },
}

const EDGE_COLORS: Record<string, string> = {
  data: '#3b82f6',
  trigger: '#f59e0b',
  publish: '#22c55e',
  extends: '#a855f7',
}

const CENTER_ID = 'llm-engine'
const DOMAIN_RADIUS = 280
const LEAF_RADIUS_BASE = 500
const CENTER_X = 900
const CENTER_Y = 750

export function buildRadialFlowGraph(
  projects: Project[],
  relationships: Relationship[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Center LLM node
  nodes.push({
    id: CENTER_ID,
    type: 'llmCenter',
    position: { x: CENTER_X - 50, y: CENTER_Y - 50 },
    data: { label: 'CLAUDE' },
    draggable: true,
  })

  // Group projects by domain (excluding the center)
  const domainMap = new Map<DomainId, Project[]>()
  const allDomains: DomainId[] = ['sports', 'finance', 'infra', 'outdoors', 'other']
  for (const d of allDomains) domainMap.set(d, [])
  for (const p of projects) {
    if (p.id === CENTER_ID) continue
    const list = domainMap.get(p.domain)
    if (list) list.push(p)
  }

  const activeDomains = allDomains.filter(d => (domainMap.get(d)?.length ?? 0) > 0)

  // Place domain group nodes in a ring around the center
  for (let i = 0; i < activeDomains.length; i++) {
    const domainId = activeDomains[i]
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / activeDomains.length
    const dx = CENTER_X + DOMAIN_RADIUS * Math.cos(angle) - 75
    const dy = CENTER_Y + DOMAIN_RADIUS * Math.sin(angle) - 16
    const cfg = DOMAIN_CONFIG[domainId]
    const children = domainMap.get(domainId) ?? []

    nodes.push({
      id: `domain-${domainId}`,
      type: 'domainGroup',
      position: { x: dx, y: dy },
      data: {
        label: cfg.label,
        color: cfg.color,
        count: children.length,
      },
      draggable: true,
    })

    // Edge from center to domain
    edges.push({
      id: `e-center-${domainId}`,
      source: CENTER_ID,
      target: `domain-${domainId}`,
      style: { stroke: cfg.color, strokeWidth: 2, opacity: 0.4 },
      animated: true,
      type: 'default',
    })

    // Place leaf project nodes in a fan around this domain
    // More children = wider fan, with staggered radii to avoid overlap
    const leafRadius = LEAF_RADIUS_BASE + children.length * 10
    const maxHalfAngle = Math.min(
      85 * (Math.PI / 180),
      children.length * 18 * (Math.PI / 180),
    )

    for (let j = 0; j < children.length; j++) {
      const project = children[j]
      const t = children.length === 1 ? 0 : (j / (children.length - 1)) * 2 - 1
      const leafAngle = angle + t * maxHalfAngle
      // Stagger radii: alternate between inner and outer ring for breathing room
      const stagger = j % 2 === 0 ? 0 : 50
      const r = leafRadius + stagger
      const lx = CENTER_X + r * Math.cos(leafAngle) - 95
      const ly = CENTER_Y + r * Math.sin(leafAngle) - 22

      nodes.push({
        id: project.id,
        type: 'projectLeaf',
        position: { x: lx, y: ly },
        data: {
          label: project.name,
          color: cfg.color,
          techStack: project.techStack,
          status: project.status,
          domain: domainId,
          description: project.description,
        },
        draggable: true,
      })

      // Edge from domain to leaf
      edges.push({
        id: `e-${domainId}-${project.id}`,
        source: `domain-${domainId}`,
        target: project.id,
        style: { stroke: cfg.color, strokeWidth: 1, opacity: 0.25 },
        type: 'default',
      })
    }
  }

  // Relationship edges between projects
  const nodeIds = new Set(nodes.map(n => n.id))
  const seenEdges = new Set(edges.map(e => `${e.source}-${e.target}`))

  for (const r of relationships) {
    // Skip edges involving center — we already drew domain links
    if (r.from === CENTER_ID || r.to === CENTER_ID) continue
    if (!nodeIds.has(r.from) || !nodeIds.has(r.to)) continue
    const key = `${r.from}-${r.to}`
    if (seenEdges.has(key)) continue
    seenEdges.add(key)

    edges.push({
      id: `rel-${key}`,
      source: r.from,
      target: r.to,
      label: r.label,
      animated: r.type === 'trigger',
      style: {
        stroke: EDGE_COLORS[r.type] ?? '#6b7280',
        strokeWidth: 1.5,
        opacity: 0.5,
      },
      labelStyle: { fill: '#a1a1aa', fontSize: 9, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#09090b', fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 3,
      type: 'default',
    })
  }

  return { nodes, edges }
}
