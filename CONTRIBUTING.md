# Contributing to ACC

Thanks for your interest in improving ACC! Here's how to get started.

## Dev Setup

```bash
git clone https://github.com/seang1121/acc-agent-command-center.git
cd acc-agent-command-center
npm install --legacy-peer-deps
npm run dev          # starts on localhost:3100
npx tsc --noEmit     # type check
npm run lint         # lint
```

## Adding a New Card Type

1. Create `src/components/cards/YourCard.tsx` following the existing card pattern (see `AgentCard.tsx`)
2. Add the corresponding TypeScript type in `src/types/agents.ts` or `src/types/dashboard.ts`
3. Add a `.example.json` template in `src/data/`
4. Wire it into `useDashboardData.ts` and the relevant tab component
5. Update `scripts/setup.py` if the scanner should discover this data

## Extending the Scanner

The auto-scanner lives in `scripts/setup.py`. To add a new discovery source:

1. Add a `discover_*()` function that returns a list of dicts
2. Call it from `main()`
3. Save the output to the appropriate data file with `save_json()`

## PR Conventions

- Keep PRs focused — one feature or fix per PR
- Run `npx tsc --noEmit` before submitting (must pass clean)
- No personal data in committed files — use `.example.json` for templates
- Follow existing code style (Tailwind classes, component structure)

## Quality Gates

- No file over 300 lines
- No function over 50 lines
- TypeScript strict mode, no `any`
- All `.json` data files gitignored; only `.example.json` committed
