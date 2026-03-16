<p align="center">
  <img src="public/favicon.svg" alt="ACC" width="80" />
</p>

<h1 align="center">Agent Command Center</h1>

<p align="center">
  <strong>Your Claude Code setup is more powerful than you think.<br>Now you can actually see it.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node 18+" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind-4.2-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <a href="#3-commands-to-your-dashboard">Quick Start</a> &bull;
  <a href="#what-it-finds">What It Finds</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#make-it-yours">Customize</a> &bull;
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

---

<!-- TODO: Replace with a real screenshot of your running dashboard -->
<!-- Take a screenshot at localhost:3100 after running setup.py and drop it here -->
<p align="center">
  <img src="https://placehold.co/900x500/111827/3b82f6?text=Your+Dashboard+Here%0A%0Anpm+run+dev+%E2%86%92+localhost%3A3100&font=source-sans-pro" alt="Dashboard Preview" width="900" />
</p>

---

## The Problem

You've been building with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) for weeks. Maybe months. You've got:

- 5 slash commands you wrote at 2am and forgot about
- 8 MCP servers — some from the marketplace, some custom
- Hooks that guard secrets, lint on save, sync dashboards
- 14 repos with agents, schedulers, and cron jobs scattered across them
- A `settings.json` that's 200 lines deep

**Where does it all live? What's connected to what? What's even running?**

You don't know. Nobody does. There's no single view.

## The Fix

```bash
git clone https://github.com/seang1121/acc-agent-command-center.git
cd acc-agent-command-center
npm install --legacy-peer-deps
python scripts/setup.py
npm run dev
```

ACC scans your entire Claude Code setup — `~/.claude/`, your settings, your repos — and builds a live dashboard showing **everything you've built, how it connects, and what state it's in.**

One command. Zero manual config. Your whole ecosystem, visualized.

---

## What It Finds

The scanner is opinionated about where to look and aggressive about what it pulls:

| Discovery | Source | What You Get |
|-----------|--------|-------------|
| **Slash commands, agents, skills** | `~/.claude/commands/`, `agents/`, `skills/` | Name, type, description (parsed from frontmatter) |
| **MCP servers** | `~/.claude/settings.json` | Server name, transport, command, env vars |
| **Marketplace plugins** | `settings.json` `enabledPlugins` | Every plugin you've installed or enabled |
| **Hooks** | `settings.json` hooks + `~/.claude/hooks/` | Event type, matcher, command — the full picture |
| **Git repos** | `~/`, `~/projects/`, `~/repos/`, `~/code/`, `~/dev/`, `~/workspace/` | Remote URL, tech stack auto-detected, description from `package.json` or `README.md` |
| **Tech stacks** | `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, etc. | Python, TypeScript, React, Flask, Rust, Go, Docker — 16+ frameworks detected |

Everything lands in `src/data/*.json`. Your data stays **gitignored** — only example templates are committed.

---

## Features

### Relationship Map
A force-directed graph that shows how your projects connect. Node positions are **auto-calculated from connectivity** — no manual layout, no config files. Add a project, add an edge, and the graph reorganizes.

### Per-Project Deep Dives
Click any project in the sidebar to see its agents, schedulers, cron jobs, scripts, repos, and MCP servers — all in one view. Category groupings configurable per project.

### Claude Ecosystem Tab
Every Claude Code tool you own on one screen: commands, agents, skills, hooks, marketplace plugins. See what's installed, what's custom, and what's built-in.

### Global Search
`Ctrl+K` filters across every tab — projects, agents, tools, repos. Instant results as you type.

### Auto-Sync Hook
Install a Claude Code Stop hook and your dashboard **updates itself** every time you end a session:

```bash
bash scripts/install-hook.sh
```

One command. Runs `setup.py` on every session close. Your dashboard is always current.

### Privacy by Default
Real data files are gitignored. Only `.example.json` templates (with fictional "Acme Labs" data) are committed. Clone this repo, push it to your own GitHub — zero risk of leaking your setup.

---

## 3 Commands to Your Dashboard

**Prerequisites:** Node.js 18+, Python 3.10+, [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed

```bash
# 1. Clone and install
git clone https://github.com/seang1121/acc-agent-command-center.git
cd acc-agent-command-center
npm install --legacy-peer-deps

# 2. Scan your system (discovers everything automatically)
python scripts/setup.py

# 3. Launch
npm run dev
```

Open [localhost:3100](http://localhost:3100). That's it.

Don't have Claude Code yet? Run `npm run dev` anyway — you'll see a working dashboard with example data so you know what you're getting.

---

## Make It Yours

### Change what shows in the sidebar

Edit `acc.config.json`:

```json
{
  "title": "My Command Center",
  "projectTabs": [
    { "projectId": "my-api", "label": "API", "icon": "server" },
    { "projectId": "my-bot", "label": "Bot", "icon": "bot" }
  ],
  "centerNode": "my-api"
}
```

Icons: `overview` `projects` `github` `automations` `claude` `bot` `chart` `server` `database` `wrench` `globe` `dollar` `sun`

### Edit data directly

All data lives in `src/data/*.json` — 11 files, each with a clear schema. Edit them directly or re-run the scanner. Hot reload picks up changes instantly.

### Extend the scanner

Add a `discover_*()` function in `scripts/setup.py`, call it from `main()`, and save output with `save_json()`. The scanner is pure Python with zero dependencies.

### Use the slash command

If you're in Claude Code, run `/setup-acc` to trigger the scanner from inside your session.

---

<details>
<summary><strong>Data File Reference (11 files)</strong></summary>

| File | What's Inside |
|------|--------------|
| `agents.json` | AI agents — type, purpose, weight, data sources, module path, status |
| `schedulers.json` | Scheduled tasks — cron expression, timezone, trigger type |
| `cron-jobs.json` | Cron jobs — enabled/disabled, error count, delivery target |
| `repos.json` | Git repos — remote URL, visibility, description, project mapping |
| `projects.json` | Projects — tech stack, status, highlights, related projects |
| `infrastructure.json` | MCP servers, hooks, and scripts — the glue layer |
| `claude-tools.json` | Commands, agents, skills — everything in `~/.claude/` |
| `marketplace-plugins.json` | Installed plugins — kind, transport, install count |
| `relationships.json` | Graph edges — from/to/label/type for the relationship map |
| `descriptions.json` | Section descriptions — override default labels per category |
| `archived.json` | Deprecated repos — kept for reference, hidden from active views |

Each file has a `.example.json` template with fictional Acme Labs data.

</details>

<details>
<summary><strong>Project Structure</strong></summary>

```
acc-agent-command-center/
├── src/
│   ├── components/          # 25 React components
│   │   ├── cards/           # AgentCard, RepoCard, McpCard, CronJobCard...
│   │   ├── layout/          # Header, Sidebar, SearchBar, CardGrid
│   │   ├── overview/        # OverviewTab, RelationshipMap, StatsBar
│   │   ├── shared/          # StatusBadge, TagPill, FilterBar, InfoRow
│   │   └── tabs/            # ProjectDetail, Automations, Claude, GitHub
│   ├── config/              # Config loader + icon registry
│   ├── data/                # 11 JSON data files (gitignored) + 11 examples
│   ├── hooks/               # useDashboardData hook
│   ├── layout/              # Force-directed graph engine
│   ├── types/               # TypeScript types (strict, no `any`)
│   └── utils/               # Formatters, color maps
├── scripts/
│   ├── setup.py             # The auto-scanner (zero dependencies)
│   ├── auto_sync.py         # Lightweight wrapper for hook usage
│   ├── init-data.ts         # Copies examples on first `npm run dev`
│   └── install-hook.sh      # One-command auto-sync installer
├── .claude/commands/
│   └── setup-acc.md         # /setup-acc slash command
├── acc.config.example.json  # Dashboard config template
├── CONTRIBUTING.md
└── package.json
```

</details>

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **UI** | React 19 + TypeScript 5.9 (strict) | Type-safe components, zero `any` |
| **Styling** | Tailwind CSS 4.2 | Dark theme only, utility-first |
| **Build** | Vite 8 | Sub-second hot reload |
| **Scanner** | Python 3 (stdlib only) | Zero dependencies, runs anywhere |
| **Graph** | Custom force-directed layout | Auto-positions from connectivity, no D3 dependency |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome — especially new card types, scanner sources, and theme improvements.

## Credits

Built for the [Claude Code](https://docs.anthropic.com/en/docs/claude-code) ecosystem by [@seang1121](https://github.com/seang1121).

## License

[MIT](LICENSE) — use it, fork it, ship it.
