interface Node {
  id: string
  x: number
  y: number
  label: string
  color: string
  isCenter?: boolean
}

interface Edge {
  from: string
  to: string
}

/**
 * Auto-calculate domain angles from edge connectivity.
 * Groups connected nodes together and spreads groups evenly around the circle.
 */
function computeDomainAngles(
  nodeIds: string[],
  edges: Edge[],
  centerId: string
): Map<string, number> {
  const angles = new Map<string, number>()
  const nonCenter = nodeIds.filter((id) => id !== centerId)
  if (nonCenter.length === 0) return angles

  // Build adjacency (excluding center)
  const adj = new Map<string, Set<string>>()
  for (const id of nonCenter) adj.set(id, new Set())
  for (const e of edges) {
    if (e.from === centerId || e.to === centerId) continue
    adj.get(e.from)?.add(e.to)
    adj.get(e.to)?.add(e.from)
  }

  // Find connected clusters via BFS
  const visited = new Set<string>()
  const clusters: string[][] = []
  for (const id of nonCenter) {
    if (visited.has(id)) continue
    const cluster: string[] = []
    const queue = [id]
    visited.add(id)
    while (queue.length > 0) {
      const current = queue.shift()!
      cluster.push(current)
      for (const neighbor of adj.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }
    clusters.push(cluster)
  }

  // Sort clusters by size (largest first) for visual balance
  clusters.sort((a, b) => b.length - a.length)

  // Distribute clusters evenly around the circle
  const totalNodes = nonCenter.length
  let currentAngle = -Math.PI / 2 // Start at top
  for (const cluster of clusters) {
    const clusterArc = (cluster.length / totalNodes) * 2 * Math.PI
    // Sort nodes within cluster alphabetically for determinism
    cluster.sort()
    for (let i = 0; i < cluster.length; i++) {
      const nodeAngle = currentAngle + (clusterArc * (i + 0.5)) / cluster.length
      angles.set(cluster[i], nodeAngle)
    }
    currentAngle += clusterArc
  }

  return angles
}

export function forceLayout(
  nodeIds: string[],
  edges: Edge[],
  labels: Record<string, string>,
  colors: Record<string, string>,
  centerId?: string,
  width = 1400,
  height = 750
): Node[] {
  if (nodeIds.length === 0) return []

  const cx = width / 2
  const cy = height / 2

  if (nodeIds.length <= 2) {
    return nodeIds.map((id, i) => ({
      id,
      x: cx + (i - (nodeIds.length - 1) / 2) * 200,
      y: cy,
      label: labels[id] || id,
      color: colors[id] || '#6b7280',
      isCenter: id === centerId,
    }))
  }

  const center =
    centerId && nodeIds.includes(centerId)
      ? centerId
      : findMostConnected(nodeIds, edges)

  // Auto-calculate angles based on connectivity
  const domainAngles = computeDomainAngles(nodeIds, edges, center)

  // Build adjacency from center
  const directlyConnected = new Set<string>()
  for (const e of edges) {
    if (e.from === center) directlyConnected.add(e.to)
    if (e.to === center) directlyConnected.add(e.from)
  }

  const tier1 = nodeIds.filter((id) => id !== center && directlyConnected.has(id))
  const tier2 = nodeIds.filter((id) => id !== center && !directlyConnected.has(id))

  const nodes: Node[] = []

  // Center node
  nodes.push({
    id: center,
    x: cx,
    y: cy,
    label: labels[center] || center,
    color: colors[center] || '#f97316',
    isCenter: true,
  })

  // Place tier 1 on elliptical inner ring
  const rx1 = 420
  const ry1 = 250
  const t1Sorted = [...tier1].sort((a, b) => {
    const aAngle = domainAngles.get(a) ?? 0
    const bAngle = domainAngles.get(b) ?? 0
    return aAngle - bAngle
  })
  for (let i = 0; i < t1Sorted.length; i++) {
    const id = t1Sorted[i]
    const angle = domainAngles.get(id) ?? (2 * Math.PI * i) / t1Sorted.length - Math.PI / 2
    nodes.push({
      id,
      x: cx + rx1 * Math.cos(angle),
      y: cy + ry1 * Math.sin(angle),
      label: labels[id] || id,
      color: colors[id] || '#6b7280',
      isCenter: false,
    })
  }

  // Place tier 2 on elliptical outer ring
  const rx2 = 600
  const ry2 = 320
  const t2Sorted = [...tier2].sort((a, b) => {
    const aAngle = domainAngles.get(a) ?? 0
    const bAngle = domainAngles.get(b) ?? 0
    return aAngle - bAngle
  })
  for (let i = 0; i < t2Sorted.length; i++) {
    const id = t2Sorted[i]
    const angle = domainAngles.get(id) ?? (2 * Math.PI * i) / t2Sorted.length
    nodes.push({
      id,
      x: cx + rx2 * Math.cos(angle),
      y: cy + ry2 * Math.sin(angle),
      label: labels[id] || id,
      color: colors[id] || '#6b7280',
      isCenter: false,
    })
  }

  // Repulsion pass to separate any remaining overlaps
  for (let iter = 0; iter < 80; iter++) {
    const forces = nodes.map(() => ({ fx: 0, fy: 0 }))
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        if (dist < 150) {
          const push = (150 - dist) * 0.4
          const fx = (dx / dist) * push
          const fy = (dy / dist) * push
          forces[i].fx -= fx
          forces[i].fy -= fy
          forces[j].fx += fx
          forces[j].fy += fy
        }
      }
    }
    const padding = 80
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isCenter) continue
      nodes[i].x += forces[i].fx
      nodes[i].y += forces[i].fy
      nodes[i].x = Math.max(padding, Math.min(width - padding, nodes[i].x))
      nodes[i].y = Math.max(padding, Math.min(height - padding, nodes[i].y))
    }
  }

  return nodes
}

function findMostConnected(nodeIds: string[], edges: Edge[]): string {
  const counts = new Map<string, number>()
  for (const id of nodeIds) counts.set(id, 0)
  for (const e of edges) {
    if (counts.has(e.from)) counts.set(e.from, (counts.get(e.from) || 0) + 1)
    if (counts.has(e.to)) counts.set(e.to, (counts.get(e.to) || 0) + 1)
  }
  let best = nodeIds[0]
  let max = 0
  for (const [id, c] of counts) {
    if (c > max) { max = c; best = id }
  }
  return best
}
