import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

function LlmCenterNodeInner(_props: NodeProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
      <div
        className="absolute rounded-full border border-cyan-500/20"
        style={{
          width: 160,
          height: 160,
          animation: 'llm-pulse 3s ease-in-out infinite',
        }}
      />
      {/* Middle glow ring */}
      <div
        className="absolute rounded-full border border-cyan-400/30"
        style={{
          width: 130,
          height: 130,
          animation: 'llm-pulse 3s ease-in-out infinite 0.5s',
        }}
      />
      {/* Core node */}
      <div
        className="relative flex flex-col items-center justify-center rounded-full border-2 border-cyan-400"
        style={{
          width: 100,
          height: 100,
          background: 'radial-gradient(circle at 30% 30%, #083344, #030712 70%)',
          boxShadow: '0 0 40px rgba(6,182,212,0.3), 0 0 80px rgba(6,182,212,0.1), inset 0 0 20px rgba(6,182,212,0.1)',
        }}
      >
        <span className="text-sm font-bold tracking-wider text-cyan-300" style={{ fontFamily: 'monospace' }}>
          CLAUDE
        </span>
        <span className="mt-0.5 text-[9px] tracking-widest text-cyan-600" style={{ fontFamily: 'monospace' }}>
          LLM ENGINE
        </span>
        {/* Rotating arc */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 100 100"
          style={{ animation: 'llm-spin 8s linear infinite' }}
        >
          <circle
            cx="50" cy="50" r="46"
            fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1"
            strokeDasharray="20 60 10 60"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {/* Invisible handles on all sides */}
      <Handle type="source" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Top} id="target-top" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} id="target-left" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Right} id="target-right" className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  )
}

export const LlmCenterNode = memo(LlmCenterNodeInner)
