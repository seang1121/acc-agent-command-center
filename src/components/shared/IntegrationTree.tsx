interface TreeNode {
  id: string
  label: string
  color: string
  children?: TreeNode[]
}

interface Props {
  roots: TreeNode[]
  title?: string
}

const NODE_H = 32
const NODE_W = 160
const H_GAP = 40
const V_GAP = 16

interface LayoutNode {
  id: string
  label: string
  color: string
  x: number
  y: number
  parentX?: number
  parentY?: number
}

function flatten(nodes: TreeNode[], depth: number, startY: number, parentX?: number, parentY?: number): { laid: LayoutNode[]; totalH: number } {
  const laid: LayoutNode[] = []
  let currentY = startY

  for (const node of nodes) {
    const x = depth * (NODE_W + H_GAP) + NODE_W / 2 + 20
    const y = currentY + NODE_H / 2

    laid.push({ id: node.id, label: node.label, color: node.color, x, y, parentX, parentY })

    if (node.children && node.children.length > 0) {
      const { laid: childLaid, totalH } = flatten(node.children, depth + 1, currentY, x + NODE_W / 2, y)
      laid.push(...childLaid)
      currentY += totalH
    } else {
      currentY += NODE_H + V_GAP
    }
  }

  return { laid, totalH: currentY - startY }
}

export function IntegrationTree({ roots, title }: Props) {
  if (roots.length === 0) return null

  const { laid, totalH } = flatten(roots, 0, 10)
  const maxX = Math.max(...laid.map((n) => n.x)) + NODE_W / 2 + 20
  const svgH = Math.max(totalH + 20, 120)

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      )}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${maxX} ${svgH}`} className="w-full" style={{ minWidth: 400, maxHeight: 500 }}>
          {laid.map((node) => {
            if (node.parentX == null || node.parentY == null) return null
            const curveX = node.parentX + (node.x - NODE_W / 2 - node.parentX) / 2
            return (
              <path
                key={`edge-${node.id}`}
                d={`M ${node.parentX} ${node.parentY} C ${curveX} ${node.parentY}, ${curveX} ${node.y}, ${node.x - NODE_W / 2} ${node.y}`}
                fill="none"
                stroke={node.color}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
            )
          })}
          {laid.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x - NODE_W / 2}
                y={node.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={6}
                fill="#111827"
                stroke={node.color}
                strokeWidth={1.5}
              />
              <text
                x={node.x}
                y={node.y + 4}
                fill="white"
                fontSize={10}
                textAnchor="middle"
                fontFamily="sans-serif"
                fontWeight={500}
              >
                {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export type { TreeNode }
