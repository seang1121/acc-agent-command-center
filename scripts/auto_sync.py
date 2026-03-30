"""
ACC Auto-Sync — lightweight re-scan that updates data files.
Designed to be called from a Claude Code Stop hook.

Usage:
    python scripts/auto_sync.py
"""

import sys
from pathlib import Path

# Re-use the full scanner
sys.path.insert(0, str(Path(__file__).resolve().parent))
from setup import main, DOMAIN_KEYWORDS, assign_domain  # noqa: F401

if __name__ == "__main__":
    main()
