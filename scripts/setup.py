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


def get_repo_description(path: Path) -> str:
    """Try to extract a meaningful description from the repo."""
    # 1. Try package.json description
    pkg = path / "package.json"
    if pkg.exists():
        try:
            data = json.loads(pkg.read_text(encoding="utf-8"))
            desc = data.get("description", "")
            if desc and len(desc) > 5:
                return desc[:200]
        except (json.JSONDecodeError, OSError):
            pass
    # 2. Try pyproject.toml description
    pyproject = path / "pyproject.toml"
    if pyproject.exists():
        try:
            text = pyproject.read_text(encoding="utf-8", errors="replace")
            match = re.search(r'description\s*=\s*"([^"]+)"', text)
            if match:
                return match.group(1)[:200]
        except OSError:
            pass
    # 3. Try first meaningful line of README.md
    for readme_name in ("README.md", "readme.md", "Readme.md"):
        readme = path / readme_name
        if readme.exists():
            try:
                lines = readme.read_text(encoding="utf-8", errors="replace").split("\n")
                for line in lines:
                    stripped = line.strip().lstrip("#").strip()
                    # Skip empty lines, badges, images, and the repo name itself
                    if not stripped or "[![" in stripped or stripped.startswith("[!") or stripped.startswith("!["):
                        continue
                    # Skip if it's just the repo name
                    if stripped.lower().replace("-", " ") == path.name.lower().replace("-", " "):
                        continue
                    return stripped[:200]
            except OSError:
                pass
    # 4. Fallback
    return f"Repository: {path.name}"


def discover_repos() -> tuple[list[dict], list[dict]]:
    """Scan home directory and common project dirs for git repos."""
    repos: list[dict] = []
    projects: list[dict] = []
    seen_ids: set[str] = set()

    # Common project locations (home top-level + common subdirs)
    search_dirs = [
        HOME,
        HOME / "projects",
        HOME / "repos",
        HOME / "code",
        HOME / "dev",
        HOME / "src",
        HOME / "workspace",
    ]
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
            if project_id in seen_ids:
                continue
            seen_ids.add(project_id)

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

            description = get_repo_description(entry)

            repos.append({
                "name": entry.name,
                "url": remote_url,
                "visibility": visibility,
                "description": description,
                "project": project_id,
            })

            # Detect tech stack
            tech_stack = detect_tech_stack(entry)
            projects.append({
                "id": project_id,
                "name": entry.name,
                "description": description,
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
    """Generate meaningful relationships based on shared tech stacks and known connections."""
    if len(projects) < 2:
        return []

    ids = {p["id"] for p in projects}
    rels: list[dict] = []
    seen = set()

    def add(frm, to, label, etype):
        if frm in ids and to in ids and (frm, to) not in seen:
            rels.append({"from": frm, "to": to, "label": label, "type": etype})
            seen.add((frm, to))

    # Known data flow relationships
    known = [
        ("betting-analyzer", "sports-betting-mcp", "feeds predictions", "data"),
        ("betting-analyzer", "henchmen-trader", "odds signals", "data"),
        ("betting-analyzer", "betting-ai-landing", "marketing site", "publish"),
        ("betting-analyzer", "moltbook-poster", "pick data", "data"),
        ("openclaw-bot", "betting-analyzer", "auto-picks", "trigger"),
        ("openclaw-bot", "fishing-report-analyzer", "daily report", "trigger"),
        ("openclaw-bot", "moltbook-poster", "publishing", "trigger"),
        ("march-madness", "betting-analyzer", "NCAAB models", "data"),
        ("sports-betting-mcp", "betting-analyzer", "API gateway", "extends"),
        ("acc-agent-command-center", "betting-analyzer", "monitors", "data"),
        ("acc-agent-command-center", "openclaw-bot", "monitors", "data"),
        ("acc-agent-command-center", "henchmen-trader", "monitors", "data"),
        ("acc-agent-command-center", "march-madness", "monitors", "data"),
        ("acc-agent-command-center", "investment-command-center", "monitors", "data"),
        ("acc-agent-command-center", "ai-business-with-automated-agents", "monitors", "data"),
        ("acc-agent-command-center", "fishing-report-analyzer", "monitors", "data"),
        ("acc-agent-command-center", "moltbook-poster", "monitors", "data"),
        ("ai-business-with-automated-agents", "openclaw-bot", "integration", "extends"),
        ("investment-command-center", "acc-agent-command-center", "reports to", "publish"),
        ("sportsipy", "betting-analyzer", "stats library", "data"),
    ]
    for frm, to, label, etype in known:
        add(frm, to, label, etype)

    # Auto-connect projects sharing Python + same domain
    tech_map = {p["id"]: set(t.lower() for t in p.get("techStack", [])) for p in projects}
    for p1 in projects:
        for p2 in projects:
            if p1["id"] >= p2["id"]:
                continue
            shared = tech_map[p1["id"]] & tech_map[p2["id"]]
            if len(shared) >= 2 and (p1["id"], p2["id"]) not in seen:
                add(p1["id"], p2["id"], "shared stack", "data")

    return rels


def generate_config(projects: list[dict]) -> dict:
    """Generate acc.config.json from discovered projects."""
    icon_map = {"python": "bot", "typescript": "chart", "rust": "wrench", "go": "server",
                "react": "chart", "flask": "server", "docker": "server"}
    tabs = []
    for p in projects:
        tech = p.get("techStack", [])
        icon = "projects"
        for t in tech:
            if t.lower() in icon_map:
                icon = icon_map[t.lower()]
                break
        tabs.append({
            "projectId": p["id"],
            "label": p["name"][:25],
            "icon": icon,
        })
    # Find most-connected project as center
    center_node = _find_center_project(projects)
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


def _find_center_project(projects: list[dict]) -> str:
    """Pick the LLM engine node as center if it exists, otherwise most connected."""
    if not projects:
        return "llm-engine"
    for p in projects:
        if p["id"] == "llm-engine":
            return "llm-engine"
    best = max(projects, key=lambda p: len(p.get("techStack", [])))
    return best["id"]


def detect_llm_engine() -> dict:
    """Auto-detect which AI model/platform the user is running.

    Checks for Claude Code, OpenAI, Gemini, Cursor, Codex, and OpenClaw configs.
    Returns a project dict for the LLM center node.
    """
    model_name = "AI Model"
    model_id = "unknown"
    tech_stack = []
    description = "The AI model powering your agents and automation."

    # 1. Check Claude Code (~/.claude/)
    if (HOME / ".claude" / "settings.json").exists():
        model_name = "Claude"
        model_id = "claude"
        tech_stack.append("Claude API")
        tech_stack.append("Anthropic SDK")
        description = "Claude by Anthropic — powering agents, analysis, and automation."

    # 2. Check OpenClaw for specific model version
    openclaw_config = HOME / ".openclaw" / "openclaw.json"
    if openclaw_config.exists():
        data = load_json(openclaw_config)
        if data:
            primary = (data.get("agents", {}).get("defaults", {})
                       .get("model", {}).get("primary", ""))
            if primary:
                if "claude" in primary.lower():
                    model_name = "Claude"
                    model_id = "claude"
                elif "gpt" in primary.lower():
                    model_name = "GPT"
                    model_id = "gpt"
                elif "gemini" in primary.lower():
                    model_name = "Gemini"
                    model_id = "gemini"
                else:
                    model_name = primary.split("/")[-1]
                    model_id = primary.split("/")[0] if "/" in primary else "custom"
                tech_stack.append("OpenClaw")

    # 3. Check for OpenAI config
    if (HOME / ".openai").exists() or os.environ.get("OPENAI_API_KEY"):
        if model_id == "unknown":
            model_name = "GPT"
            model_id = "gpt"
            tech_stack.append("OpenAI SDK")
            description = "GPT by OpenAI — powering agents and automation."

    # 4. Check for Gemini
    if (HOME / ".gemini").exists() or (HOME / "GEMINI.md").exists():
        if model_id == "unknown":
            model_name = "Gemini"
            model_id = "gemini"
            tech_stack.append("Google AI SDK")
            description = "Gemini by Google — powering agents and automation."

    # 5. Check for Cursor
    if (HOME / ".cursor").exists():
        tech_stack.append("Cursor")
        if model_id == "unknown":
            model_name = "Cursor AI"
            model_id = "cursor"

    # 6. Check for Codex CLI
    if (HOME / ".codex").exists():
        tech_stack.append("Codex CLI")
        if model_id == "unknown":
            model_name = "Codex"
            model_id = "codex"

    # Fallback
    if model_id == "unknown":
        model_name = "AI Model"
        description = ("No AI platform auto-detected. Edit the 'llm-engine' entry in "
                       "src/data/projects.json to set your model name.")

    tech_stack.append("MCP")

    print(f"  detected LLM: {model_name}")

    return {
        "id": "llm-engine",
        "name": model_name,
        "description": description,
        "category": "active",
        "techStack": tech_stack,
        "status": "active",
        "path": "",
        "repoUrl": "",
        "isGitRepo": False,
    }


def _has_real_data(path: Path) -> bool:
    """Check if a JSON file exists and has more than an empty array/object."""
    if not path.exists():
        return False
    try:
        text = path.read_text(encoding="utf-8").strip()
        return len(text) > 5 and text not in ("[]", "{}")
    except OSError:
        return False


def discover_openclaw_crons() -> list[dict]:
    """Discover OpenClaw cron jobs from ~/.openclaw/cron/jobs.json."""
    jobs_path = HOME / ".openclaw" / "cron" / "jobs.json"
    if not jobs_path.exists():
        return []
    data = load_json(jobs_path)
    if not data or "jobs" not in data:
        return []
    crons = []
    for job in data["jobs"]:
        crons.append({
            "id": job.get("id", job.get("name", "")),
            "name": job.get("name", "Unknown"),
            "enabled": job.get("enabled", False),
            "cron": job.get("schedule", {}).get("expr", ""),
            "timezone": job.get("schedule", {}).get("tz", "UTC"),
            "delivery": job.get("delivery", {}).get("channel", "silent"),
            "status": "error" if job.get("state", {}).get("lastStatus") == "error" else "active",
            "errorCount": job.get("state", {}).get("consecutiveErrors", 0),
            "project": "openclaw-bot",
            "category": "automation",
            "description": job.get("payload", {}).get("message", "")[:100],
        })
    print(f"  found {len(crons)} OpenClaw cron jobs ({sum(1 for c in crons if c['enabled'])} enabled)")
    return crons


def discover_project_agents(projects: list[dict]) -> list[dict]:
    """Discover agents by scanning for class.*Agent in project src directories."""
    agents = []
    for project in projects:
        path = Path(project.get("path", ""))
        if not path.exists():
            continue
        # Look for agent files
        agent_dirs = [path / "src" / "agents", path / "agents", path / "backend" / "agents"]
        for agent_dir in agent_dirs:
            if not agent_dir.is_dir():
                continue
            for py_file in agent_dir.glob("*.py"):
                if py_file.name.startswith("__"):
                    continue
                try:
                    text = py_file.read_text(encoding="utf-8", errors="replace")
                    for match in re.finditer(r"class\s+(\w+Agent\w*)", text):
                        class_name = match.group(1)
                        if class_name == "BaseAgent":
                            continue
                        # Get docstring
                        purpose = ""
                        doc_match = re.search(rf"class\s+{class_name}.*?:\s*\n\s*\"\"\"(.+?)\"\"\"", text, re.DOTALL)
                        if doc_match:
                            purpose = doc_match.group(1).strip().split("\n")[0][:120]
                        agents.append({
                            "name": class_name,
                            "type": "daemon" if "daemon" in text.lower()[:500] else "parallel",
                            "purpose": purpose or f"Agent: {class_name}",
                            "weight": None,
                            "scoreRange": None,
                            "dataSources": [],
                            "module": str(py_file.relative_to(path)),
                            "status": "active",
                            "project": project["id"],
                            "category": "analysis",
                        })
                except OSError:
                    pass
    if agents:
        print(f"  found {len(agents)} agents across projects")
    return agents


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

    print("\nDetecting AI model...")
    llm_node = detect_llm_engine()
    # Insert LLM as first project (center node)
    projects = [llm_node] + [p for p in projects if p["id"] != "llm-engine"]

    print("\nGenerating relationships...")
    relationships = generate_relationships(projects)

    print("\nWriting data files...")
    save_json(DATA_DIR / "claude-tools.json", claude_tools)
    save_json(DATA_DIR / "marketplace-plugins.json", marketplace_plugins)
    save_json(DATA_DIR / "repos.json", repos)
    save_json(DATA_DIR / "projects.json", projects)
    # Preserve curated relationships if they exist
    if _has_real_data(DATA_DIR / "relationships.json"):
        print("  skipped relationships.json (has existing data)")
    else:
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

    # Discover OpenClaw cron jobs
    print("\nDiscovering OpenClaw cron jobs...")
    openclaw_crons = discover_openclaw_crons()

    # Discover project agents
    print("\nDiscovering project agents...")
    discovered_agents = discover_project_agents(projects)

    # Preserve existing data files if they have real content
    for name, fallback in [("agents.json", discovered_agents or []),
                           ("schedulers.json", []),
                           ("cron-jobs.json", openclaw_crons or []),
                           ("archived.json", []),
                           ("descriptions.json", {})]:
        path = DATA_DIR / name
        if _has_real_data(path):
            print(f"  skipped {name} (has existing data)")
        else:
            save_json(path, fallback)

    print("\nGenerating acc.config.json...")
    if _has_real_data(CONFIG_PATH):
        # Update only centerNode in existing config, preserve curated tabs
        try:
            existing = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            existing["centerNode"] = _find_center_project(projects)
            save_json(CONFIG_PATH, existing)
        except (json.JSONDecodeError, OSError):
            config = generate_config(projects)
            save_json(CONFIG_PATH, config)
    else:
        config = generate_config(projects)
        save_json(CONFIG_PATH, config)

    print(f"\nDone! Found {len(projects)} projects, {len(claude_tools)} tools, "
          f"{len(marketplace_plugins)} plugins, {len(hooks)} hooks.")
    print("\nRun 'npm run dev' to see your dashboard.")


if __name__ == "__main__":
    main()
