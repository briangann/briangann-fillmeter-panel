# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project knowledge

This repository contains a **Grafana plugin**. Read @./.config/AGENTS/instructions.md before making changes.

## Commands

```bash
# Development
pnpm dev              # webpack watch mode (development)
pnpm build            # production build

# Testing
pnpm test             # jest watch mode (changed files only)
pnpm test:ci          # jest CI run (all tests, 4 workers)
jest src/utils/fieldExtractor.test.ts  # single test file

# Quality
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm lint:fix         # eslint --fix + prettier

# E2E
pnpm server           # start Grafana via docker compose
pnpm e2e              # playwright tests (server must be running)
```

## Architecture

**Entry point**: `src/module.ts` — registers `PanelPlugin<TankOptions>` with all panel options.

**Data flow**:
1. `extractTankState(data, options)` (`src/utils/fieldExtractor.ts`) — flattens `PanelData.series` fields, auto-detects or explicitly matches level/temperature/inflow/outflow/rain fields by keyword, returns `TankState`.
2. `WaterTankPanel` (`src/WaterTankPanel.tsx`) — top-level panel component; switches between three layouts based on `options.layout`.
3. Layout renders `TankSVG` (animated SVG, 200×200 viewBox scaled to panel size) plus either `StatsBar` (bottom bar, fixed 60px) or `SideStatsPanel` (side panel, 35% of width).

**Key types** (`src/types.ts`):
- `TankOptions` — panel editor options (persisted to dashboard JSON)
- `TankState` — derived runtime state computed from `PanelData` each render

**SVG component hierarchy** (`src/components/`):
- `TankSVG` — root SVG, owns `useId`-scoped gradient/filter IDs (`pg-`, `cy-`, `sh-`, `wf-` prefixed), temperature overlay, warning icons
- `TankBody` — static cylinder shape
- `WaterFill` — animated fill level (wobble keyframe from `src/utils/animations.ts`)
- `BubbleLayer` — rising bubble animation, active when inflow on and level > 8%
- `InflowPipe` / `OutflowPipe` — animated dash-stroke pipes

**Utility modules** (`src/utils/`):
- `fieldExtractor.ts` — keyword lists per field type; explicit `options.*Field` names override auto-detect
- `tankColors.ts` — `waterColors(tempC, threshold)` linearly interpolates CYAN→ORANGE palette between 15°C and `warningTempThreshold`
- `tankGeometry.ts` — SVG geometry helpers
- `unitConversions.ts` — °C/°F and metric/imperial rain formatting
- `animations.ts` — `@emotion/css` keyframe definitions shared across components

**Tests**:
- Unit tests co-located with source: `*.test.ts(x)` files in `src/`
- E2E tests in `tests/` using `@grafana/plugin-e2e` + Playwright

**Grafana version**: `>=12.3.0` (see `plugin.json` `grafanaDependency`). Plugin ID `briangann-fillmeter-panel` — do not change.

**pnpm security**: overrides for vulnerable transitive deps live in `pnpm-workspace.yaml`. `.npmrc` enforces `ignore-scripts=true`, registry lock, and `strict-ssl`. CI runs `pnpm audit --audit-level=high` after install.

## Critical rules for agents

**Use dedicated file tools — never shell text tools.**

| Task | Use | Never use |
|---|---|---|
| Read a file | `Read` tool | `cat`, `head`, `tail` |
| Edit a file | `Edit` tool | `sed`, `awk` |
| Write a file | `Write` tool | `echo >`, `tee` |

`sed` and `awk` fail on multiline patterns, special characters, and regex escaping. `Edit` does exact string replacement and is always reliable. Reserve `Bash` for shell-native operations only: `git`, `gh`, process management, env inspection.
