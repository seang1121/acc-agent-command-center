# ACC — Agent Command Center

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**See your entire [Claude Code](https://docs.anthropic.com/en/docs/claude-code) ecosystem in one dashboard.** AI agents, MCP servers, hooks, plugins, repos, and automations — auto-discovered, zero config.

<!-- Replace this block with a real screenshot of your dashboard -->
```
 ┌──────────┐ ┌─────────────────────────────────────────────────────────┐
 │ Overview  │ │  My Command Center                        [Ctrl+K]    │
 │ Scraper   │ ├─────────────────────────────────────────────────────────┤
 │ API       │ │  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
 │ Dashboard │ │  │ 4 Agents│  │ 3 Repos │  │ 6 Tools │  Stats Bar    │
 │───────────│ │  └─────────┘  └─────────┘  └─────────┘               │
 │ Projects  │ │                                                       │
 │ GitHub    │ │    ┌──── Relationship Map ────┐                       │
 │ Automate  │ │    │   api ── [scraper] ── ui │                       │
 │ Claude    │ │    └──────────────────────────┘                       │
 │           │ │                                                       │
 │ ACC v1.0  │ │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
 └──────────┘ │  │ Agent    │ │ Scheduler│ │ MCP      │  Card Grid   │
              │  │ Card     │ │ Card     │ │ Card     │              │
              │  └──────────┘ └──────────┘ └──────────┘              │
              └─────────────────────────────────────────────────────────┘
```

## Why?

Claude Code power users accumulate tools fast — slash commands, MCP servers, hooks, agents, plugins spread across `~/.claude/`, project dirs, and settings files. There's no single place to see what you've built.

ACC fixes that. Point it at your system, and it maps everything into a searchable, filterable dashboard with a relationship graph showing how your projects connect.

## Features

- **Auto-discovery** — scans `~/.claude/` and local git repos, generates all dashboard data automatically
- **Relationship map** — force-directed graph showing how your projects connect (auto-calculated layout, no manual positioning)
- **Per-project deep dives** — agents, schedulers, cron jobs, scripts, MCP servers grouped by project
- **Claude ecosystem view** — all your commands, agents, skills, hooks, and marketplace plugins in one tab
- **Global search** — `Ctrl+K` to filter across everything
- **Auto-sync hook** — optional Stop hook keeps the dashboard current after every Claude Code session
- **Zero personal data committed** — `.example.json` templates ship in git; your real data stays gitignored

## Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+** (for the auto-scanner)
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** installed (the scanner reads `~/.claude/`)

### Install and run

```bash
git clone https://github.com/seang1121/acc-agent-command-center.git
cd acc-agent-command-center
npm install --legacy-peer-deps
npm run dev
```

Opens at [http://localhost:3100](http://localhost:3100) with example "Acme Labs" data.

### Populate with your data

```bash
python scripts/setup.py
# or
npm run setup
```

The scanner discovers:

| What | Where it looks |
|------|---------------|
| Commands, agents, skills | `~/.claude/commands/`, `agents/`, `skills/` |
| MCP servers & plugins | `~/.claude/settings.json` |
| Hooks | `~/.claude/settings.json` + `~/.claude/hooks/` |
| Git repos & tech stacks | `~/`, `~/projects/`, `~/repos/`, `~/code/`, `~/dev/` |
| Project descriptions | `package.json` description, `README.md` first line |

Refresh the dashboard to see your data.

## Auto-Sync (Optional)

Keep the dashboard updated automatically with a Claude Code Stop hook:

```bash
bash scripts/install-hook.sh
```

This re-scans your system every time a Claude Code session ends. To remove it, edit `~/.claude/settings.json` and delete the `auto_sync.py` entry from `hooks.Stop`.

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

Available icons: `overview` `projects` `github` `automations` `claude` `bot` `chart` `server` `database` `wrench` `globe` `dollar` `sun`

## Customization

- **Edit data** — modify `src/data/*.json` directly to add/update entries
- **Change tabs** — edit `acc.config.json` to control sidebar navigation
- **Extend the scanner** — add discovery functions in `scripts/setup.py`
- **Add card types** — create a new component in `src/components/cards/`

The relationship map auto-calculates node positions from connectivity — no hardcoded coordinates.

<details>
<summary><strong>Data file schemas</strong></summary>

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

</details>

<details>
<summary><strong>Project structure</strong></summary>

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
├── acc.config.example.json
└── package.json
```

</details>

## Tech Stack

- **React 19** + **TypeScript 5.9** (strict mode)
- **Vite 8** — dev server and build
- **Tailwind CSS 4.2** — dark theme only
- **Python 3** — auto-scanner scripts

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Credits

Built for the [Claude Code](https://docs.anthropic.com/en/docs/claude-code) ecosystem.

## License

[MIT](LICENSE)
