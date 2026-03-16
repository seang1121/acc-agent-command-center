#!/usr/bin/env bash
# install-hook.sh — Installs ACC auto-sync as a Claude Code Stop hook.
# This is OPTIONAL. Run it if you want your dashboard to auto-update
# every time a Claude Code session ends.

set -euo pipefail

ACC_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SYNC_SCRIPT="$ACC_ROOT/scripts/auto_sync.py"
SETTINGS="$HOME/.claude/settings.json"

echo "ACC Hook Installer"
echo "=================="

# Check prerequisites
if [ ! -f "$SYNC_SCRIPT" ]; then
  echo "Error: auto_sync.py not found at $SYNC_SCRIPT"
  exit 1
fi

if [ ! -f "$SETTINGS" ]; then
  echo "Error: Claude Code settings not found at $SETTINGS"
  echo "Install Claude Code first: https://docs.anthropic.com/en/docs/claude-code"
  exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required. Install it: https://jqlang.github.io/jq/"
  exit 1
fi

# Check if hook already exists
if jq -e '.hooks.Stop[]? | select(. | tostring | contains("auto_sync.py"))' "$SETTINGS" > /dev/null 2>&1; then
  echo "Hook already installed. Nothing to do."
  exit 0
fi

# Add the Stop hook
echo "Adding Stop hook to $SETTINGS..."
HOOK_CMD="python $SYNC_SCRIPT"

# Create hooks.Stop array if it doesn't exist, then append
TMP=$(mktemp)
jq --arg cmd "$HOOK_CMD" '
  .hooks //= {} |
  .hooks.Stop //= [] |
  .hooks.Stop += [{"command": $cmd}]
' "$SETTINGS" > "$TMP" && mv "$TMP" "$SETTINGS"

echo "Done! ACC will auto-sync when Claude Code sessions end."
echo ""
echo "To remove: edit $SETTINGS and delete the auto_sync.py entry from hooks.Stop"
