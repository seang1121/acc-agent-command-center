"""Populate agents.json with agents from all projects."""
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data")

with open(os.path.join(DATA_DIR, "agents.json"), encoding="utf-8") as f:
    agents = json.load(f)

# Keep existing betting-analyzer + openclaw + moltbook agents
existing_projects = {a["project"] for a in agents}

new_agents = []

# March Madness — 7 models/systems
if "march-madness" not in existing_projects:
    new_agents.extend([
        {"name": "KenPomEfficiency", "type": "parallel", "purpose": "Analyzes adjusted offensive and defensive efficiency ratings per team", "weight": 0.25, "scoreRange": "0.0 to 1.0", "dataSources": ["KenPom ratings"], "module": "src/models/kenpom.ts", "status": "active", "project": "march-madness", "category": "analysis"},
        {"name": "DefensiveIdentity", "type": "parallel", "purpose": "Profiles team defensive style — rim protection, perimeter D, turnover forcing", "weight": 0.20, "scoreRange": "0.0 to 1.0", "dataSources": ["team defensive stats"], "module": "src/models/defense.ts", "status": "active", "project": "march-madness", "category": "analysis"},
        {"name": "MarketIntelligence", "type": "parallel", "purpose": "Compares betting lines to model predictions to find market inefficiencies", "weight": 0.20, "scoreRange": "0.0 to 1.0", "dataSources": ["betting lines", "model output"], "module": "src/models/market.ts", "status": "active", "project": "march-madness", "category": "analysis"},
        {"name": "TempoMatchup", "type": "parallel", "purpose": "Tempo and pace-of-play matchup analysis — fast vs slow, style clashes", "weight": 0.20, "scoreRange": "0.0 to 1.0", "dataSources": ["tempo stats"], "module": "src/models/tempo.ts", "status": "active", "project": "march-madness", "category": "analysis"},
        {"name": "SeedPatternAnalyzer", "type": "parallel", "purpose": "Historical seed performance patterns over 14 years of tournament data", "weight": 0.15, "scoreRange": "0.0 to 1.0", "dataSources": ["14-year history"], "module": "src/models/seeds.ts", "status": "active", "project": "march-madness", "category": "analysis"},
        {"name": "EnsembleCalibrator", "type": "orchestrator", "purpose": "Combines all 5 models into calibrated ensemble — 77% accuracy", "weight": None, "scoreRange": "0.0 to 1.0", "dataSources": ["All 5 models"], "module": "src/models/ensemble.ts", "status": "active", "project": "march-madness", "category": "orchestration"},
        {"name": "MonteCarloSim", "type": "parallel", "purpose": "Simulates full tournament brackets 10,000+ times for probabilities", "weight": None, "scoreRange": "distribution", "dataSources": ["ensemble predictions"], "module": "src/simulate.ts", "status": "active", "project": "march-madness", "category": "analysis"},
    ])

# Henchmen Trader — 4 systems
if "henchmen-trader" not in existing_projects:
    new_agents.extend([
        {"name": "KellySizer", "type": "parallel", "purpose": "Kelly criterion position sizing with bankroll-aware bet calculations", "weight": None, "scoreRange": "0-10% of bankroll", "dataSources": ["sportsbook odds", "model confidence"], "module": "src/kelly.py", "status": "active", "project": "henchmen-trader", "category": "analysis"},
        {"name": "DeadMarketSniper", "type": "daemon", "purpose": "Scans Polymarket for mispriced contracts in low-liquidity markets", "weight": None, "scoreRange": None, "dataSources": ["Polymarket CLOB API"], "module": "src/sniper.py", "status": "active", "project": "henchmen-trader", "category": "analysis"},
        {"name": "RiskManager", "type": "daemon", "purpose": "Enforces hard limits — 20% max daily, 10% max position, 30% drawdown halt", "weight": None, "scoreRange": None, "dataSources": ["position tracker"], "module": "src/risk.py", "status": "active", "project": "henchmen-trader", "category": "monitoring"},
        {"name": "PositionTracker", "type": "daemon", "purpose": "Tracks open positions, P&L, and portfolio exposure across all markets", "weight": None, "scoreRange": None, "dataSources": ["Polymarket positions"], "module": "src/positions.py", "status": "active", "project": "henchmen-trader", "category": "pipeline"},
    ])

# Investment Command Center — 9 analyzers
if "investment-command-center" not in existing_projects:
    new_agents.extend([
        {"name": "MonteCarloEngine", "type": "parallel", "purpose": "Runs 10,000-path Monte Carlo simulations for portfolio outcomes", "weight": None, "scoreRange": "distribution", "dataSources": ["yfinance"], "module": "src/monte_carlo.py", "status": "active", "project": "investment-command-center", "category": "analysis"},
        {"name": "MarkowitzOptimizer", "type": "parallel", "purpose": "Mean-variance portfolio optimization with efficient frontier", "weight": None, "scoreRange": "Sharpe ratio", "dataSources": ["yfinance"], "module": "src/markowitz.py", "status": "active", "project": "investment-command-center", "category": "analysis"},
        {"name": "GordonGrowthValuator", "type": "parallel", "purpose": "Dividend discount model for stock intrinsic value estimation", "weight": None, "scoreRange": "fair value USD", "dataSources": ["dividend history"], "module": "src/gordon.py", "status": "active", "project": "investment-command-center", "category": "analysis"},
        {"name": "RiskAnalyzer", "type": "parallel", "purpose": "VaR, max drawdown, Sortino ratio, downside risk metrics", "weight": None, "scoreRange": "0-100", "dataSources": ["portfolio returns"], "module": "src/risk_analysis.py", "status": "active", "project": "investment-command-center", "category": "analysis"},
        {"name": "ProactiveAdvisor", "type": "parallel", "purpose": "Identifies rebalancing opportunities and tax-loss harvesting candidates", "weight": None, "scoreRange": None, "dataSources": ["portfolio state"], "module": "src/advisor.py", "status": "active", "project": "investment-command-center", "category": "analysis"},
        {"name": "FinancialHealthScorer", "type": "orchestrator", "purpose": "Composite score — diversification, expenses, risk, performance", "weight": None, "scoreRange": "0-100", "dataSources": ["All analyzers"], "module": "src/health_score.py", "status": "active", "project": "investment-command-center", "category": "orchestration"},
        {"name": "StockScanner", "type": "parallel", "purpose": "Scans equities for value, momentum, and quality factor signals", "weight": None, "scoreRange": "ranked list", "dataSources": ["yfinance"], "module": "src/scanners/stock.py", "status": "active", "project": "investment-command-center", "category": "analysis"},
        {"name": "FundScanner", "type": "parallel", "purpose": "Compares mutual funds/ETFs by expense ratio, performance, holdings", "weight": None, "scoreRange": "ranked list", "dataSources": ["fund data"], "module": "src/scanners/fund.py", "status": "active", "project": "investment-command-center", "category": "analysis"},
        {"name": "WeeklyReportGen", "type": "daemon", "purpose": "Automated weekly portfolio report via GitHub Actions", "weight": None, "scoreRange": None, "dataSources": ["All analyzers"], "module": ".github/workflows/report.yml", "status": "active", "project": "investment-command-center", "category": "content"},
    ])

# Fishing Report Analyzer — 6 systems
if "fishing-report-analyzer" not in existing_projects:
    new_agents.extend([
        {"name": "WeatherFetcher", "type": "parallel", "purpose": "Wind, temperature, barometric pressure, precipitation forecasts", "weight": 0.20, "scoreRange": "0-100", "dataSources": ["Weather API"], "module": "fishing_analyzer.py", "status": "active", "project": "fishing-report-analyzer", "category": "data-collection"},
        {"name": "TideAnalyzer", "type": "parallel", "purpose": "Tide patterns — incoming/outgoing, high/low timing, current strength", "weight": 0.25, "scoreRange": "0-100", "dataSources": ["NOAA Tides API"], "module": "fishing_analyzer.py", "status": "active", "project": "fishing-report-analyzer", "category": "analysis"},
        {"name": "MarineConditions", "type": "parallel", "purpose": "Sea state, swell height, water temperature, visibility", "weight": 0.20, "scoreRange": "0-100", "dataSources": ["Marine weather API"], "module": "fishing_analyzer.py", "status": "active", "project": "fishing-report-analyzer", "category": "data-collection"},
        {"name": "NOAAIntegration", "type": "parallel", "purpose": "Official NOAA forecasts and marine warnings for target zone", "weight": 0.15, "scoreRange": "advisory level", "dataSources": ["NOAA API"], "module": "fishing_analyzer.py", "status": "active", "project": "fishing-report-analyzer", "category": "data-collection"},
        {"name": "CompositeScorer", "type": "orchestrator", "purpose": "Aggregates all conditions into 100-point composite fishing score", "weight": None, "scoreRange": "0-100", "dataSources": ["All fetchers"], "module": "fishing_analyzer.py", "status": "active", "project": "fishing-report-analyzer", "category": "orchestration"},
        {"name": "GoNoGoDecision", "type": "parallel", "purpose": "Binary Go/No-Go recommendation with confidence and key factors", "weight": None, "scoreRange": "GO / NO-GO", "dataSources": ["CompositeScorer"], "module": "fishing_analyzer.py", "status": "active", "project": "fishing-report-analyzer", "category": "analysis"},
    ])

# AI Business Agents — 6 agents
if "ai-business-with-automated-agents" not in existing_projects:
    new_agents.extend([
        {"name": "LeadsAgent", "type": "parallel", "purpose": "Drafts personalized follow-ups within minutes of form submission", "weight": None, "scoreRange": None, "dataSources": ["Formspree webhook"], "module": "backend/agents/leads_agent.py", "status": "active", "project": "ai-business-with-automated-agents", "category": "delivery"},
        {"name": "EstimatingAgent", "type": "parallel", "purpose": "Calculates ballpark price ranges using service config", "weight": None, "scoreRange": "USD range", "dataSources": ["business_config.yaml"], "module": "backend/agents/estimating_agent.py", "status": "active", "project": "ai-business-with-automated-agents", "category": "analysis"},
        {"name": "SchedulingAgent", "type": "parallel", "purpose": "Finds open time slots from business hours and existing jobs", "weight": None, "scoreRange": None, "dataSources": ["jobs database"], "module": "backend/agents/scheduling_agent.py", "status": "active", "project": "ai-business-with-automated-agents", "category": "automation"},
        {"name": "ReviewsAgent", "type": "parallel", "purpose": "Drafts thank-you and Google review requests post-completion", "weight": None, "scoreRange": None, "dataSources": ["jobs database"], "module": "backend/agents/reviews_agent.py", "status": "active", "project": "ai-business-with-automated-agents", "category": "delivery"},
        {"name": "FinanceAgent", "type": "parallel", "purpose": "Generates invoices with line items, tax, payment methods", "weight": None, "scoreRange": None, "dataSources": ["jobs database"], "module": "backend/agents/finance_agent.py", "status": "active", "project": "ai-business-with-automated-agents", "category": "content"},
        {"name": "MarketingAgent", "type": "parallel", "purpose": "Drafts platform-specific social media posts with hashtags", "weight": None, "scoreRange": None, "dataSources": ["business_config.yaml"], "module": "backend/agents/marketing_agent.py", "status": "active", "project": "ai-business-with-automated-agents", "category": "content"},
    ])

agents.extend(new_agents)

with open(os.path.join(DATA_DIR, "agents.json"), "w", encoding="utf-8") as f:
    json.dump(agents, f, indent=2, ensure_ascii=False)

from collections import Counter
counts = Counter(a["project"] for a in agents)
print(f"Total agents: {len(agents)}")
for proj, count in counts.most_common():
    print(f"  {proj:45s} {count}")
