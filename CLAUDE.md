# Agent Command Center (ACC)

Self-configuring dashboard for visualizing developer automations, AI agents, MCP servers, and Claude ecosystem tools.

## Stack
- Vite + React 19 + TypeScript 5.9 + Tailwind CSS 4.2
- Port: 3100
- All data lives in `src/data/*.json` (11 split data files)

## Commands
- `npm run dev` — start dev server on localhost:3100
- `npm run setup` — auto-scan system and populate data files
- `npx tsc --noEmit` — type check
- `npm run build` — production build
- `/setup-acc` — auto-scan via Claude Code slash command

## Rules
- No file over 300 lines
- Edit `src/data/*.json` to update data
- `acc.config.json` controls tabs and project configuration
- Dark theme only
- No personal data in sample files
