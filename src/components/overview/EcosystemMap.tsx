import { useMemo, useState } from 'react'
import type { DashboardData } from '../../types/agents'
import { computeEcosystemLayout, DOMAINS } from '../../layout/ecosystemLayout'
import type { DomainId, DomainNode, LeafNode } from '../../layout/ecosystemLayout'

interface Props {
  data: DashboardData
  onNavigate?: (tabId: string) => void
}

const EDGE_TYPE_COLORS: Record<string, string> = {
  data: '#3b82f6', trigger: '#f59e0b', publish: '#10b981', extends: '#8b5cf6',
}

function DotGrid() {
  return (
    <defs>
      <pattern id="dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.8" fill="#1f2937" />
      </pattern>
    </defs>
  )
}

function CenterNodeEl({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={54} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.3}>
        <animate attributeName="r" values="54;62;54" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={42} fill="#030712" stroke={color} strokeWidth={2} />
      <text x={x} y={y - 5} fill="white" fontSize={13} fontFamily="monospace" fontWeight={700} textAnchor="middle">CLAUDE</text>
      <text x={x} y={y + 10} fill="#4b5563" fontSize={9} fontFamily="monospace" textAnchor="middle">LLM ENGINE</text>
    </g>
  )
}

function DomainNodeEl({ node, hovered }: { node: DomainNode; hovered: boolean }) {
  const w = 140; const h = 34
  return (
    <g style={{ cursor: 'pointer' }}>
      <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={2}
        fill="#030712" stroke={node.color} strokeWidth={1.5} strokeOpacity={hovered ? 1 : 0.5} />
      <text x={node.x} y={node.y + 4} fill={node.color} fillOpacity={hovered ? 1 : 0.5}
        fontSize={11} fontFamily="monospace" fontWeight={700} textAnchor="middle">
        [ {node.label} ]
      </text>
    </g>
  )
}

function LeafNodeEl({ node, hovered, dimmed, onClick }: {
  node: LeafNode; hovered: boolean; dimmed: boolean; onClick: () => void
}) {
  const w = 120; const h = 26
  const label = node.label.length > 18 ? node.label.slice(0, 16) + '..' : node.label
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={1}
        fill="#030712" stroke={node.color}
        strokeWidth={hovered ? 1.5 : 1}
        strokeOpacity={dimmed ? 0.15 : hovered ? 1 : 0.4} />
      <text x={node.x} y={node.y + 4} fill="#d1d5db" fillOpacity={dimmed ? 0.15 : 1}
        fontSize={9} fontFamily="monospace" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

export function EcosystemMap({ data, onNavigate }: Props) {
  const [hoveredDomain, setHoveredDomain] = useState<DomainId | null>(null)
  const [hoveredLeaf, setHoveredLeaf] = useState<string | null>(null)

  const layout = useMemo(
    () => computeEcosystemLayout(data.projects, data.relationships),
    [data.projects, data.relationships]
  )

  const activeDomainIds = new Set(layout.domains.map(d => d.id))

  return (
    <div className="rounded-lg border border-gray-800 bg-[#030712] p-4 overflow-x-auto">
      <svg viewBox="0 0 1400 750" className="w-full min-w-[900px]" style={{ maxHeight: 650 }}>
        <DotGrid />
        <rect width={1400} height={750} fill="url(#dotgrid)" />

        {/* Claude → Domain edges */}
        {layout.domains.map(dn => (
          <line key={`c-${dn.id}`}
            x1={layout.center.x} y1={layout.center.y} x2={dn.x} y2={dn.y}
            stroke={dn.color} strokeWidth={1.5}
            strokeOpacity={hoveredDomain && hoveredDomain !== dn.id ? 0.1 : 0.6} />
        ))}

        {/* Domain → Leaf edges */}
        {layout.leaves.map(leaf => {
          const dimmed = hoveredDomain !== null && hoveredDomain !== leaf.domain
          return (
            <line key={`d-${leaf.id}`}
              x1={leaf.parentX} y1={leaf.parentY} x2={leaf.x} y2={leaf.y}
              stroke={leaf.color} strokeWidth={1} strokeDasharray="4 3"
              strokeOpacity={dimmed ? 0.05 : 0.3} />
          )
        })}

        {/* Relationship edges — only on hover */}
        {(hoveredDomain || hoveredLeaf) && layout.edges.map((e, i) => {
          const fromNode = layout.leaves.find(l => l.id === e.from) ??
            layout.domains.find(d => d.id === e.from) ??
            (e.from === layout.center.id ? layout.center : null)
          const toNode = layout.leaves.find(l => l.id === e.to) ??
            layout.domains.find(d => d.id === e.to) ??
            (e.to === layout.center.id ? layout.center : null)
          if (!fromNode || !toNode) return null
          const relevant = hoveredLeaf
            ? (e.from === hoveredLeaf || e.to === hoveredLeaf)
            : hoveredDomain
            ? (e.from === hoveredDomain || e.to === hoveredDomain)
            : false
          if (!relevant) return null
          return (
            <line key={`rel-${i}`}
              x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
              stroke={e.color} strokeWidth={1} strokeOpacity={0.6} />
          )
        })}

        {/* Domain nodes */}
        {layout.domains.map(dn => (
          <g key={dn.id}
            onMouseEnter={() => setHoveredDomain(dn.id)}
            onMouseLeave={() => setHoveredDomain(null)}>
            <DomainNodeEl node={dn} hovered={hoveredDomain === dn.id || hoveredDomain === null} />
          </g>
        ))}

        {/* Leaf nodes */}
        {layout.leaves.map(leaf => (
          <g key={leaf.id}
            onMouseEnter={() => setHoveredLeaf(leaf.id)}
            onMouseLeave={() => setHoveredLeaf(null)}>
            <LeafNodeEl
              node={leaf}
              hovered={hoveredLeaf === leaf.id}
              dimmed={hoveredDomain !== null && hoveredDomain !== leaf.domain}
              onClick={() => onNavigate?.(leaf.id)}
            />
          </g>
        ))}

        {/* Center node — on top */}
        <CenterNodeEl x={layout.center.x} y={layout.center.y} color={layout.center.color} />

        {/* Legend */}
        <g transform="translate(10, 718)">
          {Object.entries(DOMAINS).filter(([id]) => activeDomainIds.has(id as DomainId)).map(([id, d], i) => (
            <g key={id} transform={`translate(${i * 100}, 0)`}>
              <rect width={10} height={10} fill={d.color} rx={1} />
              <text x={14} y={9} fill="#6b7280" fontSize={9} fontFamily="monospace">{d.label}</text>
            </g>
          ))}
          <g transform="translate(520, 0)">
            {Object.entries(EDGE_TYPE_COLORS).map(([type, color], i) => (
              <g key={type} transform={`translate(${i * 90}, 0)`}>
                <line x1={0} y1={5} x2={16} y2={5} stroke={color} strokeWidth={1.5} />
                <text x={20} y={9} fill="#4b5563" fontSize={9} fontFamily="monospace">{type}</text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
