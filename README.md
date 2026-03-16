# ACC — Agent Command Center

A self-configuring dashboard that visualizes your entire Claude Code ecosystem: AI agents, MCP servers, hooks, plugins, repos, and automations — all in one place.

ACC auto-scans your `~/.claude/` directory and local git repos to populate a dark-themed React dashboard. No manual data entry required.

## Quick Start

```bash
git clone https://github.com/seang1121/acc-agent-command-center.git
cd acc-agent-command-center
npm install
npm run dev
```

The dashboard starts at [http://localhost:3100](http://localhost:3100) with example "Acme Labs" data.

## Populate With Your Data

Run the auto-scanner to discover your Claude Code setup:

```bash
python scripts/setup.py
# or
npm run setup
```

The scanner discovers:
- **Claude tools** — commands, agents, and skills from `~/.claude/`
- **MCP servers** — from `~/.claude/settings.json`
- **Plugins** — enabled plugins from settings
- **Hooks** — from settings and `~/.claude/hooks/`
- **Git repos** — top-level directories in `~/` with `.git/`
- **Tech stacks** — auto-detected from `package.json`, `requirements.txt`, `Cargo.toml`, etc.

Then refresh the dashboard to see your data.

## Auto-Sync (Optional)

Keep the dashboard updated automatically by installing a Claude Code Stop hook:

```bash
bash scripts/install-hook.sh
```

This re-scans your system every time a Claude Code session ends.

## Project Structure

```
acc-agent-command-center/
├── src/
│   ├── components/     # React components (cards, layout, tabs, overview, shared)
│   ├── config/         # Config loader and icon registry
│   ├── data/           # JSON data files (*.example.json committed, *.json gitignored)
│   ├── hooks/          # React hooks
│   ├── layout/         # Force-directed graph layout engine
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Formatters and helpers
├── scripts/
│   ├── setup.py        # Auto-scanner (generates data files)
│   ├── auto_sync.py    # Lightweight re-scan for hook usage
│   ├── init-data.ts    # Copies example data on first run
│   └── install-hook.sh # Installs auto-sync as Stop hook
├── .claude/commands/
│   └── setup-acc.md    # /setup-acc slash command
├── acc.config.example.json  # Dashboard configuration template
└── package.json
```

## Data Files

All data lives in `src/data/*.json`. Each file has a `.example.json` template:

| File | Contents |
|------|----------|
| `agents.json` | AI agents with type, purpose, weight, data sources |
| `schedulers.json` | Scheduled tasks with cron expressions |
| `cron-jobs.json` | Cron jobs with status and error tracking |
| `repos.json` | Git repositories with visibility and project mapping |
| `projects.json` | Projects with tech stack, status, and highlights |
| `infrastructure.json` | MCP servers, hooks, and scripts |
| `claude-tools.json` | Claude Code commands, agents, and skills |
| `marketplace-plugins.json` | Installed and available plugins |
| `relationships.json` | Project relationship graph edges |
| `descriptions.json` | Section description overrides |
| `archived.json` | Archived/deprecated repositories |

## Configuration

`acc.config.json` controls the dashboard layout:

```json
{
  "title": "My Command Center",
  "projectTabs": [
    { "projectId": "my-project", "label": "My Project", "icon": "bot" }
  ],
  "projects": [...],
  "centerNode": "my-project"
}
```

Available icons: `overview`, `projects`, `github`, `automations`, `claude`, `bot`, `chart`, `server`, `database`, `wrench`, `globe`, `dollar`, `sun`

## Customization

- Edit `src/data/*.json` directly to add/modify entries
- Edit `acc.config.json` to change tabs and project groupings
- The relationship map auto-calculates node positions from connectivity (no hardcoded positions)
- All components are in `src/components/` — standard React + Tailwind

## Tech Stack

- **React 19** + **TypeScript 5.9** — strict mode
- **Vite 8** — dev server and build
- **Tailwind CSS 4.2** — styling (dark theme only)
- **Python 3** — auto-scanner scripts

## License

MIT
