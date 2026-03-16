"""
ACC Auto-Scanner — discovers Claude Code tools, hooks, plugins, and repos
on your system and generates dashboard data files.

Usage:
    python scripts/setup.py
    npm run setup
"""

import json
import os
import re
import sys
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────

HOME = Path.home()
CLAUDE_DIR = HOME / ".claude"
SETTINGS_PATH = CLAUDE_DIR / "settings.json"
ACC_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ACC_ROOT / "src" / "data"
CONFIG_PATH = ACC_ROOT / "acc.config.json"


def load_json(path: Path) -> dict | list | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def save_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  wrote {path.name}")


# ── Markdown scanner ──────────────────────────────────────────────────────────

def parse_md_frontmatter(path: Path) -> dict:
    """Extract YAML-ish frontmatter from a .md file (simple key: value pairs)."""
    text = path.read_text(encoding="utf-8", errors="replace")
    meta: dict = {"name": path.stem, "filePath": str(path), "description": ""}
    lines = text.split("\n")
    in_frontmatter = False
    body_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped == "---":
            if not in_frontmatter:
                in_frontmatter = True
                continue
            else:
                in_frontmatter = False
                continue
        if in_frontmatter:
            match = re.match(r"^(\w[\w-]*):\s*(.+)$", stripped)
            if match:
                meta[match.group(1)] = match.group(2).strip()
        else:
            body_lines.append(line)
    if not meta.get("description"):
        # Use first non-empty body line as description
        for bl in body_lines:
            bl = bl.strip().lstrip("#").strip()
            if bl:
                meta["description"] = bl[:120]
                break
    return meta


# ── Discovery functions ───────────────────────────────────────────────────────

def discover_claude_tools() -> list[dict]:
    """Scan ~/.claude/commands/, ~/.claude/agents/, ~/.claude/skills/ for .md files."""
    tools: list[dict] = []
    type_dirs = {
        "command": CLAUDE_DIR / "commands",
        "agent": CLAUDE_DIR / "agents",
        "skill": CLAUDE_DIR / "skills",
    }
    for tool_type, dir_path in type_dirs.items():
        if not dir_path.is_dir():
            continue
        for md in sorted(dir_path.glob("*.md")):
            meta = parse_md_frontmatter(md)
            tools.append({
                "name": meta.get("name", md.stem),
                "type": tool_type,
                "filePath": str(md.relative_to(HOME)).replace("\\", "/"),
                "description": meta.get("description", ""),
            })
    # Add built-in agents
    for name, desc in [
        ("Explore", "Fast agent for exploring codebases with pattern matching and keyword search"),
        ("Plan", "Software architect agent for designing implementation plans"),
    ]:
        tools.append({"name": name, "type": "agent", "filePath": "built-in", "description": desc})
    print(f"  found {len(tools)} Claude tools")
    return tools


def discover_settings() -> dict | None:
    """Load ~/.claude/settings.json."""
    return load_json(SETTINGS_PATH)


def discover_marketplace_plugins(settings: dict | None) -> list[dict]:
    """Extract enabled plugins from settings."""
    if not settings:
        return []
    plugins: list[dict] = []
    enabled = settings.get("enabledPlugins", [])
    for plugin_name in enabled:
        plugins.append({
            "name": plugin_name,
            "kind": "mcp",
            "installed": True,
            "description": f"Plugin: {plugin_name}",
        })
    # Also check mcpServers
    mcp_servers = settings.get("mcpServers", {})
    for name, config in mcp_servers.items():
        if any(p["name"] == name for p in plugins):
            continue
        plugins.append({
            "name": name,
            "kind": "mcp",
            "transport": "stdio" if "command" in config else "http",
            "command": config.get("command"),
            "args": config.get("args", []),
            "envVars": list(config.get("env", {}).keys()),
            "installed": True,
            "description": f"MCP server: {name}",
        })
    print(f"  found {len(plugins)} marketplace plugins")
    return plugins


def discover_hooks(settings: dict | None) -> list[dict]:
    """Extract hooks from settings and ~/.claude/hooks/."""
    hooks: list[dict] = []
    # From settings.json
    if settings:
        hooks_config = settings.get("hooks", {})
        for event, hook_list in hooks_config.items():
            if not isinstance(hook_list, list):
                continue
            for h in hook_list:
                cmd = h if isinstance(h, str) else h.get("command", "")
                matcher = h.get("matcher", "") if isinstance(h, dict) else ""
                hooks.append({
                    "name": Path(cmd.split()[0]).stem if cmd else event,
                    "event": event,
                    "matcher": matcher,
                    "command": cmd,
                    "description": f"Hook: {event}" + (f" ({matcher})" if matcher else ""),
                    "project": "global",
                })
    # From ~/.claude/hooks/ directory
    hooks_dir = CLAUDE_DIR / "hooks"
    if hooks_dir.is_dir():
        for f in sorted(hooks_dir.iterdir()):
            if f.suffix in (".sh", ".py", ".ts", ".js"):
                hooks.append({
                    "name": f.stem,
                    "event": "unknown",
                    "command": str(f),
                    "description": f"Hook script: {f.name}",
                    "project": "global",
                })
    print(f"  found {len(hooks)} hooks")
    return hooks


def discover_repos() -> tuple[list[dict], list[dict]]:
    """Scan home directory top-level for git repos."""
    repos: list[dict] = []
    projects: list[dict] = []
    # Common project locations
    search_dirs = [HOME]
    for search_dir in search_dirs:
        if not search_dir.is_dir():
            continue
        for entry in sorted(search_dir.iterdir()):
            if not entry.is_dir() or entry.name.startswith("."):
                continue
            git_dir = entry / ".git"
            if not git_dir.exists():
                continue
            project_id = entry.name.lower().replace(" ", "-")
            # Try to get remote URL
            remote_url = ""
            git_config = git_dir / "config"
            if git_config.exists():
                try:
                    text = git_config.read_text(encoding="utf-8", errors="replace")
                    match = re.search(r'url\s*=\s*(\S+)', text)
                    if match:
                        remote_url = match.group(1)
                except OSError:
                    pass
            # Determine visibility from URL
            visibility = "private"
            if "github.com" in remote_url:
                visibility = "public"  # default guess; can be updated

            repos.append({
                "name": entry.name,
                "url": remote_url,
                "visibility": visibility,
                "description": f"Repository: {entry.name}",
                "project": project_id,
            })

            # Detect tech stack
            tech_stack = detect_tech_stack(entry)
            projects.append({
                "id": project_id,
                "name": entry.name,
                "description": f"Project: {entry.name}",
                "category": "active",
                "techStack": tech_stack,
                "status": "active",
                "path": str(entry),
                "repoUrl": remote_url,
                "isGitRepo": True,
            })

    print(f"  found {len(repos)} repos / {len(projects)} projects")
    return repos, projects


def detect_tech_stack(path: Path) -> list[str]:
    """Detect tech stack from common config files."""
    stack: list[str] = []
    markers = {
        "package.json": "Node.js",
        "tsconfig.json": "TypeScript",
        "requirements.txt": "Python",
        "setup.py": "Python",
        "pyproject.toml": "Python",
        "Cargo.toml": "Rust",
        "go.mod": "Go",
        "Gemfile": "Ruby",
        "pom.xml": "Java",
        "Dockerfile": "Docker",
        "docker-compose.yml": "Docker",
        "tailwind.config.js": "Tailwind",
        "tailwind.config.ts": "Tailwind",
        "next.config.js": "Next",
        "next.config.ts": "Next",
        "vite.config.ts": "Vite",
    }
    for filename, tech in markers.items():
        if (path / filename).exists() and tech not in stack:
            stack.append(tech)
    # Check package.json for React
    pkg = path / "package.json"
    if pkg.exists():
        try:
            pkg_data = json.loads(pkg.read_text(encoding="utf-8"))
            deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
            if "react" in deps:
                stack.append("React")
            if "flask" in str(deps).lower():
                stack.append("Flask")
            if "fastapi" in str(deps).lower():
                stack.append("FastAPI")
        except (json.JSONDecodeError, OSError):
            pass
    return stack


def generate_relationships(projects: list[dict]) -> list[dict]:
    """Generate a basic relationship map with a center node."""
    if len(projects) < 2:
        return []
    rels: list[dict] = []
    center = projects[0]["id"]
    for p in projects[1:]:
        rels.append({
            "from": center,
            "to": p["id"],
            "label": "related",
            "type": "data",
        })
    return rels


def generate_config(projects: list[dict]) -> dict:
    """Generate acc.config.json from discovered projects."""
    icon_map = {"python": "bot", "typescript": "chart", "rust": "wrench", "go": "server"}
    tabs = []
    for p in projects[:8]:  # Limit to 8 project tabs
        tech = p.get("techStack", [])
        icon = "projects"
        for t in tech:
            if t.lower() in icon_map:
                icon = icon_map[t.lower()]
                break
        tabs.append({
            "projectId": p["id"],
            "label": p["name"][:15],
            "icon": icon,
        })
    center_node = projects[0]["id"] if projects else "claude"
    return {
        "title": "Agent Command Center",
        "projectTabs": tabs,
        "projects": [
            {
                "projectId": p["id"],
                "infrastructure": [
                    {"label": "Tech", "value": ", ".join(p.get("techStack", []))},
                    {"label": "Path", "value": p.get("path", "")},
                ],
            }
            for p in projects
        ],
        "centerNode": center_node,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    print("ACC Auto-Scanner")
    print("=" * 50)

    if not CLAUDE_DIR.is_dir():
        print(f"Warning: {CLAUDE_DIR} not found. Install Claude Code first.")
        print("Generating minimal data from example files...")
        return

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("\nDiscovering Claude tools...")
    claude_tools = discover_claude_tools()

    print("\nReading settings...")
    settings = discover_settings()

    print("\nDiscovering plugins...")
    marketplace_plugins = discover_marketplace_plugins(settings)

    print("\nDiscovering hooks...")
    hooks = discover_hooks(settings)

    print("\nScanning for repos...")
    repos, projects = discover_repos()

    print("\nGenerating relationships...")
    relationships = generate_relationships(projects)

    print("\nWriting data files...")
    save_json(DATA_DIR / "claude-tools.json", claude_tools)
    save_json(DATA_DIR / "marketplace-plugins.json", marketplace_plugins)
    save_json(DATA_DIR / "repos.json", repos)
    save_json(DATA_DIR / "projects.json", projects)
    save_json(DATA_DIR / "relationships.json", relationships)

    # Infrastructure (hooks + empty scripts/mcpServers)
    infra = {
        "mcpServers": [],
        "hooks": hooks,
        "scripts": [],
    }
    # Pull MCP servers from settings into infra
    if settings:
        for name, cfg in settings.get("mcpServers", {}).items():
            infra["mcpServers"].append({
                "name": name,
                "version": "latest",
                "transport": "stdio" if "command" in cfg else "http",
                "command": cfg.get("command", ""),
                "description": f"MCP: {name}",
                "project": "global",
            })
    save_json(DATA_DIR / "infrastructure.json", infra)

    # Empty/minimal files for remaining data
    save_json(DATA_DIR / "agents.json", [])
    save_json(DATA_DIR / "schedulers.json", [])
    save_json(DATA_DIR / "cron-jobs.json", [])
    save_json(DATA_DIR / "archived.json", [])
    save_json(DATA_DIR / "descriptions.json", {})

    print("\nGenerating acc.config.json...")
    config = generate_config(projects)
    save_json(CONFIG_PATH, config)

    print(f"\nDone! Found {len(projects)} projects, {len(claude_tools)} tools, "
          f"{len(marketplace_plugins)} plugins, {len(hooks)} hooks.")
    print("\nRun 'npm run dev' to see your dashboard.")


if __name__ == "__main__":
    main()
