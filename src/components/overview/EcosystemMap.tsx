import { useMemo, useState, useCallback } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { DashboardData } from '../../types/agents'
import type { Project } from '../../types/dashboard'
import { buildRadialFlowGraph } from '../../layout/radialFlowLayout'
import { LlmCenterNode } from './nodes/LlmCenterNode'
import { DomainGroupNode } from './nodes/DomainGroupNode'
import { ProjectLeafNode } from './nodes/ProjectLeafNode'
import { DetailPanel } from './nodes/DetailPanel'

const nodeTypes = {
  llmCenter: LlmCenterNode,
  domainGroup: DomainGroupNode,
  projectLeaf: ProjectLeafNode,
}

const EDGE_LEGEND = [
  { type: 'data', color: '#3b82f6' },
  { type: 'trigger', color: '#f59e0b' },
  { type: 'publish', color: '#22c55e' },
  { type: 'extends', color: '#a855f7' },
]

interface Props {
  data: DashboardData
  onNavigate?: (tabId: string) => void
}

export function EcosystemMap({ data, onNavigate }: Props) {
  const [selected, setSelected] = useState<Project | null>(null)

  const initial = useMemo(
    () => buildRadialFlowGraph(data.projects, data.relationships),
    [data.projects, data.relationships],
  )

  const [nodes, , onNodesChange] = useNodesState(initial.nodes)
  const [edges, , onEdgesChange] = useEdgesState(initial.edges)

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === 'projectLeaf') {
        const proj = data.projects.find(p => p.id === node.id) ?? null
        setSelected(proj)
      }
    },
    [data.projects],
  )

  return (
    <div className="relative rounded-lg border border-zinc-800 bg-[#030712] overflow-hidden" style={{ height: 650 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelected(null)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'default' }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1a1a2e" gap={24} size={1} />
        <Controls
          className="!bg-zinc-950 !border-zinc-800 !shadow-lg [&>button]:!bg-zinc-900 [&>button]:!border-zinc-800 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800 [&>button:hover]:!text-zinc-200"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'llmCenter') return '#06b6d4'
            if (node.type === 'domainGroup') {
              const d = node.data as { color?: string }
              return (d.color as string) ?? '#3f3f46'
            }
            return '#27272a'
          }}
          maskColor="rgba(0,0,0,0.75)"
          className="!bg-zinc-950 !border-zinc-800 !rounded-md"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Detail panel */}
      <DetailPanel project={selected} onClose={() => setSelected(null)} onNavigate={onNavigate} />

      {/* Edge type legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-md border border-zinc-800 bg-zinc-950/90 px-3 py-2 backdrop-blur-sm">
        {EDGE_LEGEND.map(({ type, color }) => (
          <span key={type} className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
            {type}
          </span>
        ))}
      </div>

      {/* Orbital ring labels */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/90 px-3 py-1.5 backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-cyan-500" style={{ boxShadow: '0 0 6px rgba(6,182,212,0.5)' }} />
        <span className="text-[10px] text-zinc-400 font-mono">
          {data.projects.length} projects &middot; {data.relationships.length} connections
        </span>
      </div>
    </div>
  )
}
