# EcosystemMap Design Spec
_Date: 2026-03-29_

## Problem
The existing `RelationshipMap` in the Overview tab looks bad. It uses a generic force-directed layout with no visual hierarchy, no terminal aesthetic, and no strong conceptual anchor. We are replacing it entirely.

## Goal
A visually impressive showcase component with Claude at the literal center, domain groups orbiting it, and project leaf nodes branching outward — styled in a techy/terminal aesthetic (monospace, grid background, scan-line feel).

---

## Architecture

### Files Created
| File | Purpose |
|---|---|
| `src/layout/ecosystemLayout.ts` | Pure layout engine — no React, no side effects |
| `src/components/overview/EcosystemMap.tsx` | SVG component consuming layout output |

### Files Deleted
| File | Reason |
|---|---|
| `src/layout/forceLayout.ts` | Only used by RelationshipMap — orphaned |
| `src/components/overview/RelationshipMap.tsx` | Replaced entirely |

### Files Modified
| File | Change |
|---|---|
| `src/types/dashboard.ts` | Add `DomainId` type + required `domain` field to `Project` |
| `src/data/projects.json` | Add `domain` field to every project entry |
| `src/components/overview/OverviewTab.tsx` | Swap `RelationshipMap` import for `EcosystemMap` |
| `scripts/auto_sync.py` | Add keyword-based domain assignment on scan |

### Data Flow
```
projects.json (domain field)
    +
relationships.json (edges)
    ↓
ecosystemLayout.ts → { centerNode, domainNodes, leafNodes, edges }
    ↓
EcosystemMap.tsx → SVG
```

---

## Data Model

### `types/dashboard.ts`
```ts
export type DomainId = 'sports' | 'finance' | 'infra' | 'outdoors' | 'other'

// Project interface: domain is REQUIRED (not optional)
domain: DomainId
```

### Domain Definitions (in `ecosystemLayout.ts`)
```ts
export const DOMAINS: Record<DomainId, { label: string; color: string }> = {
  sports:   { label: 'SPORTS',   color: '#f59e0b' },
  finance:  { label: 'FINANCE',  color: '#22c55e' },
  infra:    { label: 'INFRA',    color: '#3b82f6' },
  outdoors: { label: 'OUTDOORS', color: '#10b981' },
  other:    { label: 'OTHER',    color: '#6b7280' },
}
```

### Project Domain Assignments
| Domain | Projects |
|---|---|
| `sports` | betting-analyzer, sports-betting-mcp, march-madness, moltbook-poster, henchmen-trader, sportsipy, betting-ai-landing, betting-ai-analyzer, ncaab-sweet16-analysis, ncaab-marchmadness-trend-analysis |
| `finance` | investment-command-center, fidelity-analyzer-clean, fidelity-fund-analyzer, mortgage-rate-tracker, cd-ladder-analyzer, mortgage-interest-rate-lookup |
| `infra` | openclaw-bot, acc-agent-command-center, ai-business-with-automated-agents, fixer-github, agent-dashboard, developer-automation-agent-visualizer, sports-betting-mcp-repo |
| `outdoors` | fishing-report-analyzer, fishing-analyzer |
| `other` | cli, gws-cli-explore, seang1121, seang1121-profile, awesome-mcp-servers, my-project, nvda-explore, loan-officer-exam-prep-study-guide |

Note: `llm-engine` (Claude) has no domain — hardcoded as center node, excluded from domain grouping.

### `auto_sync.py` Keyword Rules
```python
DOMAIN_KEYWORDS = {
  'sports':   ['betting', 'moltbook', 'march', 'ncaab', 'sports', 'trader', 'sportsipy'],
  'finance':  ['fidelity', 'mortgage', 'investment', 'loan', 'cd-ladder', 'fund'],
  'infra':    ['openclaw', 'acc-', 'agent', 'fixer', 'dashboard', 'visualizer', 'automation', 'cli', 'mcp'],
  'outdoors': ['fishing'],
  'other':    ['seang1121', 'nvda', 'loan-officer', 'profile', 'awesome'],
}
# fallback: assign 'other' AND print warning
```

**Scanner behavior:**
- If project already has `domain` set in `projects.json` → preserve it, do not overwrite
- If project has no `domain` → match against keywords in project `id` and `name`
- If no keyword matches → assign `'other'` and print:
  ```
  WARNING: no domain matched for '<project-id>' → assigned 'other', review manually
  ```

---

## Layout Engine (`ecosystemLayout.ts`)

### Output Types
```ts
interface CenterNode { id: string; x: number; y: number; label: string; color: string }
interface DomainNode { id: DomainId; x: number; y: number; label: string; color: string; angle: number }
interface LeafNode   { id: string; x: number; y: number; label: string; color: string; domain: DomainId; parentX: number; parentY: number }
interface LayoutEdge { from: string; to: string; label: string; type: string; color: string }

interface EcosystemLayout {
  center: CenterNode
  domains: DomainNode[]
  leaves: LeafNode[]
  edges: LayoutEdge[]
}
```

### Algorithm
1. **Center** — Claude (`llm-engine`) pinned at `(700, 375)`
2. **Domain ring** — 5 domain nodes placed at `r=280`, starting at top (`-π/2`), evenly spaced `(2π/5)` apart
3. **Leaf fan** — for each domain:
   - Direction angle = same angle as domain from center
   - Children fanned in a cone of `±(leafCount × 8°)`, capped at `±55°`
   - All leaves placed at `r=480` from center
   - Repulsion pass (20 iterations, min distance `90px`) to resolve overlaps
4. **Edges** — filtered from `relationships.json` to nodes present in the layout; `llm-engine` source edges map to the target's domain node

---

## Visual Design

### Canvas
- ViewBox: `1400×750`
- Background: `#030712`
- Dot-grid via SVG `<pattern>` — `#1f2937` dots, `20px` spacing

### Claude Center Node
- Circle `r=42`, stroke `#06b6d4` (cyan), `2px`
- Outer ring: CSS `animate-ping`, `r=54`, cyan at `30%` opacity
- Label: `CLAUDE` — monospace bold, all-caps, white
- Subtitle: `LLM ENGINE` — monospace, `#4b5563`, smaller

### Domain Group Nodes
- Rectangle `140×34`, `rx=2` (near-sharp corners)
- Stroke: domain color, `1.5px`
- Fill: `#030712`
- Label: `[ SPORTS ]` bracket-wrapped, monospace, all-caps, domain color

### Project Leaf Nodes
- Rectangle `120×26`, `rx=1`
- Stroke: parent domain color at `40%` opacity
- Fill: `#030712`
- Label: monospace, truncated at 18 chars, `#d1d5db`

### Edges
| Type | Style |
|---|---|
| Claude → Domain | Solid, `1.5px`, domain color, `60%` opacity |
| Domain → Leaf | Dashed `[4,3]`, `1px`, domain color, `30%` opacity |
| Relationship edges | Hidden by default; shown on hover, colored by type |

### Relationship Edge Colors
| Type | Color |
|---|---|
| `data` | `#3b82f6` blue |
| `trigger` | `#f59e0b` amber |
| `publish` | `#10b981` green |
| `extends` | `#8b5cf6` purple |

### Hover Behavior
- **Hover domain node** → all its leaves highlight to full opacity, all other nodes dim to `15%`
- **Hover leaf node** → tooltip shows project description; relationship edges for that node appear; click navigates to project tab
- **No hover** → all nodes at base opacity, relationship edges hidden

### Legend
Bottom-left of SVG, monospace font:
- Domain color swatches with labels
- Relationship edge type colors

---

## Constraints
- `EcosystemMap.tsx` must stay under 300 lines — extract sub-components if needed
- `ecosystemLayout.ts` must stay under 300 lines
- No external graph libraries — pure SVG
- `IntegrationTree.tsx` is untouched (used in 3 other tabs)
- `domain` field on `Project` is required — TypeScript will catch any missing assignments at build time
