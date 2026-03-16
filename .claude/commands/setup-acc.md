---
name: setup-acc
description: Auto-scan your system and populate ACC dashboard data files
---

Run the ACC auto-scanner to discover your Claude Code setup and populate the dashboard.

## Steps

1. Run `python scripts/setup.py` to scan your system
2. The scanner will discover:
   - Claude Code commands, agents, and skills from `~/.claude/`
   - MCP servers and plugins from `~/.claude/settings.json`
   - Hooks from settings and `~/.claude/hooks/`
   - Git repos from your home directory
3. Data files will be written to `src/data/*.json`
4. `acc.config.json` will be generated with tabs for discovered projects

After scanning, start the dashboard with `npm run dev` to see your setup visualized.

## Optional: Auto-sync hook

To keep the dashboard updated automatically, run:
```bash
bash scripts/install-hook.sh
```

This installs a Claude Code Stop hook that re-scans on every session end.
