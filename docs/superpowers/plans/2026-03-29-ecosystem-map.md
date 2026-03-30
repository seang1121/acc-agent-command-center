# EcosystemMap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic RelationshipMap with a terminal-aesthetic EcosystemMap showing Claude at center, domain groups orbiting it, and project leaves branching outward.

**Architecture:** Pure layout engine (`ecosystemLayout.ts`) computes positions for all 3 tiers (center, domain, leaf). SVG component (`EcosystemMap.tsx`) consumes that output and renders with hover interactions. Domain assignment lives in `projects.json` as a required `domain` field, auto-assigned by the scanner and manually correctable.

**Tech Stack:** Vite, React 19, TypeScript 5.9, Tailwind CSS 4.2, pure SVG (no graph libraries)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/types/dashboard.ts` | Add `DomainId` type + `domain` field to `Project` |
| Modify | `src/data/projects.json` | Add `domain` field to every entry |
| Modify | `scripts/auto_sync.py` | Keyword-based domain assignment + fallback warning |
| Create | `src/layout/ecosystemLayout.ts` | 3-tier layout engine, no React |
| Create | `src/components/overview/EcosystemMap.tsx` | SVG component consuming layout output |
| Modify | `src/components/overview/OverviewTab.tsx` | Swap RelationshipMap → EcosystemMap |
| Delete | `src/layout/forceLayout.ts` | Orphaned — only used by RelationshipMap |
| Delete | `src/components/overview/RelationshipMap.tsx` | Replaced by EcosystemMap |

---

## Task 1: Update Types

**Files:**
- Modify: `src/types/dashboard.ts`

- [ ] **Step 1: Add DomainId and update Project**

Replace the contents of `src/types/dashboard.ts` with:

```ts
export type ProjectCategory = 'active' | 'tool' | 'analysis' | 'infrastructure' | 'archived'
export type ProjectStatus = 'active' | 'maintained' | 'archived' | 'template'
export type DomainId = 'sports' | 'finance' | 'infra' | 'outdoors' | 'other'

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  techStack: string[]
  status: ProjectStatus
  path: string
  repoUrl?: string
  isGitRepo: boolean
  domain: DomainId
  highlights?: string[]
  relatedProjects?: string[]
}

export interface ClaudeTool {
  name: string
  type: 'command' | 'skill' | 'agent'
  filePath: string
  description: string
}

export interface Relationship {
  from: string
  to: string
  label: string
  type: 'data' | 'trigger' | 'publish' | 'extends'
}

export interface ArchivedRepo {
  name: string
  path: string
  description: string
  techStack: string[]
  originalUrl?: string
}
```

- [ ] **Step 2: Type check — expect failures**

Run: `npx tsc --noEmit`

Expected: TypeScript errors on `projects.json` usages because `domain` is now required but not yet present in data. This is expected — proceed to Task 2.

- [ ] **Step 3: Commit**

```bash
git add src/types/dashboard.ts
git commit -m "feat: add DomainId type and required domain field to Project"
```

---

## Task 2: Update projects.json

**Files:**
- Modify: `src/data/projects.json`

- [ ] **Step 1: Add domain field to every project**

Add `"domain": "<value>"` to each entry. Use this mapping:

```
llm-engine                          → (no domain — center node, skip)
acc-agent-command-center            → "infra"
agent-dashboard                     → "infra"
ai-business-with-automated-agents   → "infra"
awesome-mcp-servers                 → "other"
betting-ai-landing                  → "sports"
betting-analyzer                    → "sports"
cli                                 → "infra"
developer-automation-agent-visualizer → "infra"
fidelity-analyzer-clean             → "finance"
fidelity-fund-analyzer              → "finance"
fishing-analyzer                    → "outdoors"
fishing-report-analyzer             → "outdoors"
fixer-github                        → "infra"
gws-cli-explore                     → "infra"
henchmen-trader                     → "sports"
march-madness                       → "sports"
mortgage-rate-tracker               → "finance"
my-project                          → "other"
ncaab-sweet16-analysis              → "sports"
nvda-explore                        → "other"
seang1121                           → "other"
seang1121-profile                   → "other"
sports-betting-mcp                  → "sports"
sports-betting-mcp-repo             → "infra"
sportsipy                           → "sports"
betting-ai-analyzer                 → "sports"
cd-ladder-analyzer                  → "finance"
investment-command-center           → "finance"
loan-officer-exam-prep-study-guide  → "other"
mortgage-interest-rate-lookup       → "finance"
ncaab-marchmadness-trend-analysis   → "sports"
```

For `llm-engine`, add `"domain": "other"` as a placeholder — the layout engine ignores it since it matches the hardcoded center ID `"llm-engine"`.

Example of a correctly updated entry:
```json
{
  "id": "betting-analyzer",
  "name": "betting-analyzer",
  "description": "Betting AI Analyzer",
  "category": "active",
  "techStack": ["Python"],
  "status": "active",
  "path": "C:\\Users\\Sean Goudy\\betting-analyzer",
  "repoUrl": "git@github.com:seang1121/Betting-AI-Analyzer.git",
  "isGitRepo": true,
  "domain": "sports"
}
```

- [ ] **Step 2: Type check — errors should clear**

Run: `npx tsc --noEmit`

Expected: Type errors from Task 1 are resolved. May still see errors from other files that use `Project` if they create objects without `domain` — fix those by adding `domain: 'other'` as needed.

- [ ] **Step 3: Commit**

```bash
git add src/data/projects.json
git commit -m "feat: assign domain field to all projects in data"
```

---

## Task 3: Update auto_sync.py

**Files:**
- Modify: `scripts/auto_sync.py`

- [ ] **Step 1: Find where projects are written in auto_sync.py**

Open `scripts/auto_sync.py` and find the section that writes project entries to `projects.json`. Look for where `id`, `name`, `description`, `techStack`, etc. are assembled into a dict.

- [ ] **Step 2: Add domain assignment function**

Add this function near the top of the file (after imports):

```python
DOMAIN_KEYWORDS = {
    'sports':   ['betting', 'moltbook', 'march', 'ncaab', 'sports', 'trader', 'sportsipy'],
    'finance':  ['fidelity', 'mortgage', 'investment', 'loan', 'cd-ladder', 'fund'],
    'infra':    ['openclaw', 'acc-', 'agent', 'fixer', 'dashboard', 'visualizer', 'automation', 'cli', 'mcp'],
    'outdoors': ['fishing'],
    'other':    ['seang1121', 'nvda', 'profile', 'awesome', 'my-project'],
}

def assign_domain(project_id: str, project_name: str) -> str:
    """Assign domain by keyword match. Preserves existing value if already set."""
    combined = f"{project_id} {project_name}".lower()
    for domain, keywords in DOMAIN_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            return domain
    print(f"WARNING: no domain matched for '{project_id}' → assigned 'other', review manually")
    return 'other'
```

- [ ] **Step 3: Use assign_domain when building project entries**

In the section where project dicts are assembled, add domain assignment. The key rule: **preserve existing value if already set**.

Find the dict assembly (it will look something like `project_entry = { 'id': ..., 'name': ..., ... }`).

Add domain assignment using this pattern:

```python
# existing_domain is whatever is already in projects.json for this project (or None if new)
existing_domain = existing_project.get('domain') if existing_project else None
domain = existing_domain if existing_domain else assign_domain(project_id, project_name)

project_entry = {
    'id': project_id,
    'name': project_name,
    # ... other existing fields ...
    'domain': domain,
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/auto_sync.py
git commit -m "feat: add keyword-based domain assignment to auto_sync with fallback warning"
```

---

## Task 4: Create ecosystemLayout.ts

**Files:**
- Create: `src/layout/ecosystemLayout.ts`

- [ ] **Step 1: Create the layout engine**

Create `src/layout/ecosystemLayout.ts` with this exact content:

```ts
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
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

Expected: No new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/layout/ecosystemLayout.ts
git commit -m "feat: add ecosystemLayout 3-tier layout engine"
```

---

## Task 5: Create EcosystemMap.tsx

**Files:**
- Create: `src/components/overview/EcosystemMap.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/overview/EcosystemMap.tsx`:

```tsx
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
  const dimmed = !hovered
  return (
    <g style={{ cursor: 'pointer' }}>
      <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={2}
        fill="#030712" stroke={node.color} strokeWidth={1.5} strokeOpacity={dimmed ? 0.5 : 1} />
      <text x={node.x} y={node.y + 4} fill={node.color} fillOpacity={dimmed ? 0.5 : 1}
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
          const relevant = hoveredLeaf ? (e.from === hoveredLeaf || e.to === hoveredLeaf) :
            hoveredDomain ? (e.from === hoveredDomain || e.to === hoveredDomain) : false
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
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

Expected: No errors from `EcosystemMap.tsx`. If you see errors about missing properties on `DashboardData`, check `src/types/agents.ts` to confirm `projects` and `relationships` fields exist — they should already be there from the existing code.

- [ ] **Step 3: Commit**

```bash
git add src/components/overview/EcosystemMap.tsx
git commit -m "feat: add EcosystemMap SVG component with terminal aesthetic"
```

---

## Task 6: Wire Up and Delete Old Files

**Files:**
- Modify: `src/components/overview/OverviewTab.tsx`
- Delete: `src/components/overview/RelationshipMap.tsx`
- Delete: `src/layout/forceLayout.ts`

- [ ] **Step 1: Update OverviewTab.tsx**

In `src/components/overview/OverviewTab.tsx`:

Replace:
```tsx
import { RelationshipMap } from './RelationshipMap'
```
With:
```tsx
import { EcosystemMap } from './EcosystemMap'
```

Replace:
```tsx
{data.relationships.length > 0 && (
  <SectionBlock title="Project Relationships" count={data.relationships.length}>
    <RelationshipMap relationships={data.relationships} data={data} onNavigate={onNavigate} />
  </SectionBlock>
)}
```
With:
```tsx
{data.projects.length > 0 && (
  <SectionBlock title="Ecosystem Map" count={data.projects.length}>
    <EcosystemMap data={data} onNavigate={onNavigate} />
  </SectionBlock>
)}
```

- [ ] **Step 2: Delete old files**

```bash
rm src/components/overview/RelationshipMap.tsx
rm src/layout/forceLayout.ts
```

- [ ] **Step 3: Full type check — must be clean**

Run: `npx tsc --noEmit`

Expected: Zero errors. If you see `Cannot find module './RelationshipMap'` or `Cannot find module '../../layout/forceLayout'` — you missed an import somewhere. Search for remaining references:

```bash
grep -r "RelationshipMap\|forceLayout" src/
```

Fix any remaining imports.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: wire EcosystemMap into OverviewTab, remove RelationshipMap and forceLayout"
```

---

## Self-Review Checklist

- [x] Types updated — `DomainId` exported, `domain` required on `Project`
- [x] All 32 projects in `projects.json` have domain assignment documented
- [x] `auto_sync.py` preserves existing domain values, warns on fallback
- [x] `ecosystemLayout.ts` exports all types consumed by `EcosystemMap.tsx`
- [x] `EcosystemMap.tsx` handles empty domain groups (filters `activeDomains`)
- [x] `forceLayout.ts` deletion confirmed safe — grep shows only `RelationshipMap` used it
- [x] `IntegrationTree.tsx` untouched — used in 3 other tabs
- [x] Section title updated from "Project Relationships" to "Ecosystem Map"
- [x] No placeholders or TODOs in any task
- [x] Type names consistent: `DomainNode`, `LeafNode`, `CenterNode`, `LayoutEdge`, `EcosystemLayout` used consistently across tasks 4 and 5
