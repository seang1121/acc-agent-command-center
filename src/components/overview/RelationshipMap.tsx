import { useMemo, useState } from 'react'
import type { Relationship } from '../../types/dashboard'
import type { DashboardData } from '../../types/agents'
import { forceLayout } from '../../layout/forceLayout'
import { loadConfig } from '../../config/loader'

interface Props {
  relationships: Relationship[]
  data?: DashboardData
  onNavigate?: (tabId: string) => void
}

const edgeTypeColors: Record<string, string> = {
  data: '#3b82f6',
  trigger: '#f59e0b',
  publish: '#10b981',
  extends: '#8b5cf6',
}

const defaultNodeColors = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#64748b',
]

function curvedPath(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number): string {
  const dx = x2 - x1
  const dy = y2 - y1
  // Curve away from center
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const nx = -(dy) * 0.15
  const ny = (dx) * 0.15
  // Push curve outward from center
  const fromCenter = Math.atan2(my - cy, mx - cx)
  const push = 20
  const cpx = mx + nx + Math.cos(fromCenter) * push
  const cpy = my + ny + Math.sin(fromCenter) * push
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`
}

export function RelationshipMap({ relationships, data, onNavigate }: Props) {
  const config = loadConfig()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null)

  const nodes = useMemo(() => {
    const nodeSet = new Set<string>()
    for (const r of relationships) {
      nodeSet.add(r.from)
      nodeSet.add(r.to)
    }
    const nodeIds = Array.from(nodeSet)

    const labels: Record<string, string> = {}
    const colors: Record<string, string> = {}

    const projectNames = new Map(data?.projects.map((p) => [p.id, p.name]) || [])

    nodeIds.forEach((id, i) => {
      labels[id] = projectNames.get(id) || id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
      colors[id] = defaultNodeColors[i % defaultNodeColors.length]
    })

    return forceLayout(
      nodeIds,
      relationships.map((r) => ({ from: r.from, to: r.to })),
      labels,
      colors,
      config.centerNode
    )
  }, [relationships, data?.projects, config.centerNode])

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const centerNode = nodes.find((n) => n.isCenter)
  const cxCenter = centerNode?.x ?? 700
  const cyCenter = centerNode?.y ?? 375

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 overflow-x-auto">
      <svg
        viewBox="0 0 1400 750"
        className="w-full min-w-[900px]"
        style={{ maxHeight: 650 }}
      >
        {/* Edges */}
        {relationships.map((rel, i) => {
          const from = nodeMap.get(rel.from)
          const to = nodeMap.get(rel.to)
          if (!from || !to) return null
          const color = edgeTypeColors[rel.type] || '#6b7280'

          const isHighlighted =
            hoveredNode === rel.from || hoveredNode === rel.to || hoveredEdge === i
          const dimmed = (hoveredNode || hoveredEdge !== null) && !isHighlighted

          const d = curvedPath(from.x, from.y, to.x, to.y, cxCenter, cyCenter)
          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2

          return (
            <g key={`edge-${i}`}>
              {/* Invisible fat hitbox for hover */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                onMouseEnter={() => setHoveredEdge(i)}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{ cursor: 'pointer' }}
              />
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={isHighlighted ? 2.5 : 1.2}
                strokeOpacity={dimmed ? 0.1 : isHighlighted ? 0.9 : 0.35}
                pointerEvents="none"
              />
              {/* Label only on hover */}
              {isHighlighted && (
                <g>
                  <rect
                    x={midX - 70}
                    y={midY - 20}
                    width={140}
                    height={18}
                    rx={4}
                    fill="#1f2937"
                    fillOpacity={0.95}
                    stroke={color}
                    strokeWidth={0.5}
                  />
                  <text
                    x={midX}
                    y={midY - 8}
                    fill={color}
                    fontSize={9}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontWeight={600}
                  >
                    {rel.label}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isCenter = node.isCenter
          const w = isCenter ? 150 : 120
          const h = isCenter ? 46 : 36

          const isHighlighted =
            hoveredNode === node.id ||
            (hoveredNode &&
              relationships.some(
                (r) =>
                  (r.from === hoveredNode && r.to === node.id) ||
                  (r.to === hoveredNode && r.from === node.id)
              ))
          const dimmed = hoveredNode !== null && !isHighlighted && hoveredNode !== node.id

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNavigate?.(node.id)}
              style={{ cursor: 'pointer' }}
            >
              {isCenter && (
                <rect
                  x={node.x - w / 2 - 4}
                  y={node.y - h / 2 - 4}
                  width={w + 8}
                  height={h + 8}
                  rx={14}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                />
              )}
              <rect
                x={node.x - w / 2}
                y={node.y - h / 2}
                width={w}
                height={h}
                rx={8}
                fill="#111827"
                stroke={node.color}
                strokeWidth={isCenter ? 2.5 : dimmed ? 0.8 : 1.5}
                strokeOpacity={dimmed ? 0.3 : 1}
              />
              <text
                x={node.x}
                y={node.y + 4}
                fill="white"
                fillOpacity={dimmed ? 0.3 : 1}
                fontSize={isCenter ? 13 : 10}
                textAnchor="middle"
                fontFamily="sans-serif"
                fontWeight={isCenter ? 700 : 600}
              >
                {node.label}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform="translate(10, 720)">
          {Object.entries(edgeTypeColors).map(([type, color], i) => (
            <g key={type} transform={`translate(${i * 110}, 0)`}>
              <line x1={0} y1={6} x2={20} y2={6} stroke={color} strokeWidth={2} />
              <text x={25} y={10} fill="#9ca3af" fontSize={10}>
                {type}
              </text>
            </g>
          ))}
          <text x={480} y={10} fill="#4b5563" fontSize={9} fontFamily="monospace">
            Hover nodes or edges to see details
          </text>
        </g>
      </svg>
    </div>
  )
}
