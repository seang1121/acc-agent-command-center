import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface ProjectLeafData {
  label: string
  color: string
  techStack: string[]
  status: string
  domain: string
  description: string
  [key: string]: unknown
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-400',
  maintained: 'bg-blue-400',
  archived: 'bg-zinc-500',
  template: 'bg-purple-400',
}

const TECH_COLORS: Record<string, string> = {
  Python: 'border-yellow-600/40 text-yellow-400/80 bg-yellow-900/20',
  'Node.js': 'border-emerald-600/40 text-emerald-400/80 bg-emerald-900/20',
  TypeScript: 'border-blue-600/40 text-blue-400/80 bg-blue-900/20',
  React: 'border-cyan-600/40 text-cyan-400/80 bg-cyan-900/20',
  Vite: 'border-purple-600/40 text-purple-400/80 bg-purple-900/20',
  Docker: 'border-sky-600/40 text-sky-400/80 bg-sky-900/20',
  Rust: 'border-orange-600/40 text-orange-400/80 bg-orange-900/20',
}

function ProjectLeafNodeInner({ data }: NodeProps) {
  const { label, color, techStack, status } = data as unknown as ProjectLeafData
  const dotClass = STATUS_DOT[status] ?? STATUS_DOT.active
  const displayName = label.length > 22 ? label.slice(0, 20) + '..' : label

  return (
    <div className="relative group">
      <div
        className="rounded-lg border bg-zinc-950 px-3 py-2 transition-all duration-200 hover:bg-zinc-900"
        style={{
          borderColor: `${color}35`,
          minWidth: 180,
          maxWidth: 220,
          boxShadow: `0 2px 12px ${color}08`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
          <span className="truncate text-xs font-semibold text-zinc-200" style={{ fontFamily: 'monospace' }}>
            {displayName}
          </span>
        </div>
        {techStack.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {techStack.slice(0, 3).map((t) => (
              <span
                key={t}
                className={`rounded border px-1 py-0.5 text-[8px] font-mono ${TECH_COLORS[t] ?? 'border-zinc-700/40 text-zinc-500 bg-zinc-900/30'}`}
              >
                {t}
              </span>
            ))}
            {techStack.length > 3 && (
              <span className="text-[8px] text-zinc-600 self-center">+{techStack.length - 3}</span>
            )}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} id="target-left" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Right} id="target-right" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Top} id="source-top" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Left} id="source-left" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  )
}

export const ProjectLeafNode = memo(ProjectLeafNodeInner)
