import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface DomainGroupData {
  label: string
  color: string
  count: number
  [key: string]: unknown
}

function DomainGroupNodeInner({ data }: NodeProps) {
  const { label, color, count } = data as unknown as DomainGroupData
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 rounded-md border px-4 py-2"
        style={{
          borderColor: color,
          background: `linear-gradient(135deg, ${color}08, ${color}15)`,
          boxShadow: `0 0 20px ${color}15, inset 0 1px 0 ${color}10`,
        }}
      >
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color, fontFamily: 'monospace' }}
        >
          [ {label} ]
        </span>
        <span
          className="ml-1 rounded-full border px-1.5 py-0.5 text-[9px] font-mono"
          style={{ borderColor: `${color}40`, color: `${color}99` }}
        >
          {count}
        </span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} id="target-left" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Right} id="target-right" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Top} id="source-top" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Left} id="source-left" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  )
}

export const DomainGroupNode = memo(DomainGroupNodeInner)
