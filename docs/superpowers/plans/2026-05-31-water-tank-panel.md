# Water Tank Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the `water-tank-card` Home Assistant LitElement card into a Grafana React panel plugin with SVG rendering, full animations, and flexible field mapping.

**Architecture:** Pure TypeScript utility functions (geometry, colors, field extraction) feed a typed `TankState` object into a tree of focused React SVG components. Layout switching (fill / side-stats / adaptive) is handled at the top-level `WaterTankPanel` component. CSS animations are Emotion keyframes injected once per component.

**Tech Stack:** React, TypeScript, `@emotion/css`, `@grafana/data` (PanelProps, PanelData), `@grafana/runtime` (PanelDataErrorView), `@grafana/ui` (useStyles2), Jest + @testing-library/react

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Replace | `src/types.ts` | `TankOptions`, `TankState`, `LayoutMode` — drop old `SimpleOptions` |
| Replace | `src/module.ts` | Panel options builder wired to `TankOptions` + `WaterTankPanel` |
| Create | `src/WaterTankPanel.tsx` | Main panel entry; layout dispatch; calls `extractTankState` |
| Delete | `src/components/SimplePanel.tsx` | Replaced by `WaterTankPanel` |
| Create | `src/utils/tankGeometry.ts` | Geometry constants + pure calc functions |
| Create | `src/utils/tankGeometry.test.ts` | Unit tests for geometry |
| Create | `src/utils/tankColors.ts` | Temperature → water color interpolation |
| Create | `src/utils/tankColors.test.ts` | Unit tests for color logic |
| Create | `src/utils/fieldExtractor.ts` | `PanelData + TankOptions → TankState` |
| Create | `src/utils/fieldExtractor.test.ts` | Unit tests for field extraction |
| Create | `src/utils/animations.ts` | Emotion keyframes (wobble, rise, flowDash, outDash, splashOut, dripFall, pulse) |
| Create | `src/components/TankSVG.tsx` | SVG root: defs + sub-component assembly |
| Create | `src/components/TankBody.tsx` | Static 3D cylinder shell |
| Create | `src/components/WaterFill.tsx` | Water body path + surface ellipse + caustics |
| Create | `src/components/InflowPipe.tsx` | Inflow pipe + animated stream |
| Create | `src/components/OutflowPipe.tsx` | Outflow pipe + drip animation |
| Create | `src/components/BubbleLayer.tsx` | Animated bubbles |
| Create | `src/components/WarningIcons.tsx` | Pulsing high-temp / low-level SVG icons |
| Create | `src/components/StatsBar.tsx` | Bottom stat row (temp, inflow, rain) |
| Create | `src/components/SideStatsPanel.tsx` | Right-side stats block for layout=side-stats |

---

## Task 1: Types

**Files:**
- Replace: `src/types.ts`

- [ ] **Step 1: Replace types.ts**

```typescript
// src/types.ts
export type LayoutMode = 'fill' | 'side-stats' | 'adaptive';

export interface TankOptions {
  layout: LayoutMode;
  levelField: string;
  temperatureField: string;
  inflowField: string;
  outflowField: string;
  rainField: string;
  maxVolume: number;
  warningTempThreshold: number;
  lowLevelThreshold: number;
  usUnits: boolean;
}

export interface TankState {
  levelPct: number;
  rawVolume: number | null;
  temperature: number | null;
  inflowRate: number | null;
  inflowActive: boolean;
  outflowActive: boolean;
  rainTotal: number | null;
  hasData: boolean;
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: errors about missing `SimpleOptions` in `module.ts` — that's fine, fixed in Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add TankOptions and TankState types"
```

---

## Task 2: Geometry Utilities

**Files:**
- Create: `src/utils/tankGeometry.ts`
- Create: `src/utils/tankGeometry.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/utils/tankGeometry.test.ts
import { TANK, waterSurfaceY, waterBodyPath, pipeGeometry } from './tankGeometry';

describe('TANK constants', () => {
  it('has correct values', () => {
    expect(TANK.cx).toBe(100);
    expect(TANK.rx).toBe(46);
    expect(TANK.ry).toBe(13);
    expect(TANK.topY).toBe(38);
    expect(TANK.botY).toBe(155);
    expect(TANK.bodyH).toBe(117);
  });
});

describe('waterSurfaceY', () => {
  it('returns botY at 0%', () => {
    expect(waterSurfaceY(0)).toBe(155);
  });
  it('returns topY at 100%', () => {
    expect(waterSurfaceY(100)).toBe(38);
  });
  it('returns midpoint at 50%', () => {
    expect(waterSurfaceY(50)).toBeCloseTo(96.5);
  });
  it('clamps below 0', () => {
    expect(waterSurfaceY(-10)).toBe(155);
  });
  it('clamps above 100', () => {
    expect(waterSurfaceY(110)).toBe(38);
  });
});

describe('waterBodyPath', () => {
  it('returns a valid SVG path string', () => {
    const path = waterBodyPath(50);
    expect(path).toMatch(/^M/);
    expect(path).toContain('A');
    expect(path).toContain('Z');
  });
  it('uses correct left/right x values', () => {
    const path = waterBodyPath(50);
    expect(path).toContain('57');   // cx - rx + 3 = 57
    expect(path).toContain('143'); // cx + rx - 3 = 143
  });
});

describe('pipeGeometry', () => {
  it('returns inflow and outflow geometry', () => {
    const g = pipeGeometry();
    expect(g.inflow).toBeDefined();
    expect(g.outflow).toBeDefined();
    expect(g.inflow.endX).toBe(100);
    expect(typeof g.outflow.endX).toBe('number');
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test:ci 2>&1 | grep -E "FAIL|Cannot find"
```

Expected: `Cannot find module './tankGeometry'`

- [ ] **Step 3: Implement tankGeometry.ts**

```typescript
// src/utils/tankGeometry.ts
export const TANK = {
  cx: 100,
  rx: 46,
  ry: 13,
  topY: 38,
  botY: 155,
  bodyH: 117,
} as const;

export function waterSurfaceY(levelPct: number): number {
  const clamped = Math.min(100, Math.max(0, levelPct));
  return TANK.botY - (TANK.bodyH * clamped) / 100;
}

export function waterBodyPath(levelPct: number): string {
  const surfY = waterSurfaceY(levelPct);
  const wL = TANK.cx - TANK.rx + 3;
  const wR = TANK.cx + TANK.rx - 3;
  const wRx = TANK.rx - 3;
  const wRy = TANK.ry - 1;
  return `M${wL} ${surfY} L${wL} ${TANK.botY} A${wRx} ${wRy} 0 0 0 ${wR} ${TANK.botY} L${wR} ${surfY} Z`;
}

export function waterBotArcPath(): string {
  const wL = TANK.cx - TANK.rx + 3;
  const wR = TANK.cx + TANK.rx - 3;
  const wRx = TANK.rx - 3;
  const wRy = TANK.ry - 1;
  return `M${wL} ${TANK.botY} A${wRx} ${wRy} 0 0 0 ${wR} ${TANK.botY}`;
}

export interface PipeGeometry {
  inflow: {
    endX: number;
    pipeY: number;
    connectorY: number;
  };
  outflow: {
    startY: number;
    endX: number;
    bendY: number;
  };
}

export function pipeGeometry(): PipeGeometry {
  return {
    inflow: {
      endX: TANK.cx,
      pipeY: TANK.topY - 20,
      connectorY: TANK.topY + TANK.ry + 2,
    },
    outflow: {
      startY: TANK.botY - 15,
      endX: TANK.cx + TANK.rx + 32,
      bendY: TANK.botY + 8,
    },
  };
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
pnpm test:ci 2>&1 | grep -E "PASS|FAIL|Tests:"
```

Expected: `PASS src/utils/tankGeometry.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/utils/tankGeometry.ts src/utils/tankGeometry.test.ts
git commit -m "feat: add tank geometry utilities"
```

---

## Task 3: Color Utilities

**Files:**
- Create: `src/utils/tankColors.ts`
- Create: `src/utils/tankColors.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/utils/tankColors.test.ts
import { waterColors } from './tankColors';

describe('waterColors', () => {
  it('returns cyan palette when tempC is null', () => {
    const c = waterColors(null, 20);
    expect(c.top).toBe('#22d3ee');
    expect(c.mid).toBe('#0284c7');
    expect(c.deep).toBe('#0c4a6e');
  });

  it('returns cyan palette below 15°C', () => {
    const c = waterColors(10, 20);
    expect(c.top).toBe('#22d3ee');
    expect(c.mid).toBe('#0284c7');
    expect(c.deep).toBe('#0c4a6e');
  });

  it('returns orange palette above threshold', () => {
    const c = waterColors(25, 20);
    expect(c.top).toBe('#fb923c');
    expect(c.mid).toBe('#ea580c');
    expect(c.deep).toBe('#7c2d12');
  });

  it('returns interpolated color between 15°C and threshold', () => {
    const c = waterColors(17.5, 20);
    expect(c.top).toMatch(/^rgb\(/);
    expect(c.mid).toMatch(/^rgb\(/);
    expect(c.deep).toMatch(/^rgb\(/);
  });

  it('interpolation r=0 at 15°C gives cyan', () => {
    const c = waterColors(15, 20);
    expect(c.top).toBe('#22d3ee');
  });
});
```

- [ ] **Step 2: Run tests — verify fail**

```bash
pnpm test:ci 2>&1 | grep -E "FAIL|Cannot find"
```

Expected: `Cannot find module './tankColors'`

- [ ] **Step 3: Implement tankColors.ts**

```typescript
// src/utils/tankColors.ts
export interface WaterColors {
  top: string;
  mid: string;
  deep: string;
}

const CYAN: WaterColors = { top: '#22d3ee', mid: '#0284c7', deep: '#0c4a6e' };
const ORANGE: WaterColors = { top: '#fb923c', mid: '#ea580c', deep: '#7c2d12' };

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function waterColors(tempC: number | null, warningThreshold: number): WaterColors {
  if (tempC === null || tempC <= 15) {
    return CYAN;
  }
  if (tempC >= warningThreshold) {
    return ORANGE;
  }
  const r = Math.max(0, Math.min(1, (tempC - 15) / (warningThreshold - 10)));
  return {
    top: `rgb(${lerp(34, 251, r)},${lerp(211, 146, r)},${lerp(238, 60, r)})`,
    mid: `rgb(${lerp(2, 234, r)},${lerp(132, 88, r)},${lerp(199, 12, r)})`,
    deep: `rgb(${lerp(12, 124, r)},${lerp(74, 45, r)},${lerp(110, 18, r)})`,
  };
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
pnpm test:ci 2>&1 | grep -E "PASS|FAIL|Tests:"
```

Expected: `PASS src/utils/tankColors.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/utils/tankColors.ts src/utils/tankColors.test.ts
git commit -m "feat: add tank color utilities"
```

---

## Task 4: Field Extractor

**Files:**
- Create: `src/utils/fieldExtractor.ts`
- Create: `src/utils/fieldExtractor.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/utils/fieldExtractor.test.ts
import { extractTankState } from './fieldExtractor';
import { PanelData, FieldType, toDataFrame } from '@grafana/data';
import { TankOptions } from '../types';

const defaultOptions: TankOptions = {
  layout: 'adaptive',
  levelField: '',
  temperatureField: '',
  inflowField: '',
  outflowField: '',
  rainField: '',
  maxVolume: 0,
  warningTempThreshold: 20,
  lowLevelThreshold: 10,
  usUnits: false,
};

function makeData(fields: Array<{ name: string; values: number[] | string[] }>): PanelData {
  return {
    state: 'Done',
    series: [
      toDataFrame({
        fields: fields.map((f) => ({
          name: f.name,
          type: typeof f.values[0] === 'string' ? FieldType.string : FieldType.number,
          values: f.values,
        })),
      }),
    ],
    timeRange: {} as any,
  };
}

describe('extractTankState', () => {
  it('returns hasData=false with no series', () => {
    const state = extractTankState({ series: [], state: 'Done', timeRange: {} as any }, defaultOptions);
    expect(state.hasData).toBe(false);
  });

  it('auto-detects level field by name "level"', () => {
    const data = makeData([{ name: 'level', values: [75] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.hasData).toBe(true);
    expect(state.levelPct).toBe(75);
  });

  it('uses explicit levelField option over auto-detect', () => {
    const data = makeData([{ name: 'fill', values: [60] }]);
    const state = extractTankState(data, { ...defaultOptions, levelField: 'fill' });
    expect(state.levelPct).toBe(60);
  });

  it('converts raw volume to % using maxVolume', () => {
    const data = makeData([{ name: 'volume', values: [500] }]);
    const state = extractTankState(data, { ...defaultOptions, maxVolume: 1000 });
    expect(state.levelPct).toBeCloseTo(50);
    expect(state.rawVolume).toBe(500);
  });

  it('clamps levelPct to 0–100', () => {
    const data = makeData([{ name: 'level', values: [150] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.levelPct).toBe(100);
  });

  it('auto-detects temperature field', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'temperature', values: [18] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.temperature).toBe(18);
  });

  it('detects outflowActive from string "on"', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'outflow', values: ['on'] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.outflowActive).toBe(true);
  });

  it('detects outflowActive from numeric > 0', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'outflow', values: [1.5] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.outflowActive).toBe(true);
  });

  it('detects inflowActive when inflowRate > 0', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'inflow', values: [2.4] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.inflowActive).toBe(true);
    expect(state.inflowRate).toBe(2.4);
  });
});
```

- [ ] **Step 2: Run tests — verify fail**

```bash
pnpm test:ci 2>&1 | grep -E "FAIL|Cannot find"
```

- [ ] **Step 3: Implement fieldExtractor.ts**

```typescript
// src/utils/fieldExtractor.ts
import { PanelData, Field } from '@grafana/data';
import { TankOptions, TankState } from '../types';

const LEVEL_KEYWORDS = ['level', 'volume', 'fill', 'percent', 'tank'];
const TEMP_KEYWORDS = ['temp', 'temperature'];
const INFLOW_KEYWORDS = ['inflow', 'rain_rate', 'rainrate', 'flow_in'];
const OUTFLOW_KEYWORDS = ['outflow', 'usage', 'flow_out', 'consumption'];
const RAIN_KEYWORDS = ['rain', 'rainfall', 'rain_total', 'precipitation'];

function findField(
  fields: Field[],
  explicitName: string,
  keywords: string[]
): Field | null {
  if (explicitName) {
    return fields.find((f) => f.name.toLowerCase() === explicitName.toLowerCase()) ?? null;
  }
  return (
    fields.find((f) =>
      keywords.some((kw) => f.name.toLowerCase().includes(kw))
    ) ?? null
  );
}

function fieldValue(field: Field | null): number | string | null {
  if (!field) { return null; }
  const v = field.values.get ? field.values.get(0) : (field.values as any)[0];
  return v ?? null;
}

function numericValue(field: Field | null): number | null {
  const v = fieldValue(field);
  if (v === null) { return null; }
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

export function extractTankState(data: PanelData, options: TankOptions): TankState {
  if (!data.series.length) {
    return {
      levelPct: 0,
      rawVolume: null,
      temperature: null,
      inflowRate: null,
      inflowActive: false,
      outflowActive: false,
      rainTotal: null,
      hasData: false,
    };
  }

  const fields = data.series.flatMap((s) => s.fields);

  const levelField = findField(fields, options.levelField, LEVEL_KEYWORDS);
  const tempField = findField(fields, options.temperatureField, TEMP_KEYWORDS);
  const inflowField = findField(fields, options.inflowField, INFLOW_KEYWORDS);
  const outflowField = findField(fields, options.outflowField, OUTFLOW_KEYWORDS);
  const rainField = findField(fields, options.rainField, RAIN_KEYWORDS);

  const rawLevel = numericValue(levelField);
  const rawVolume = rawLevel;

  let levelPct = 0;
  if (rawLevel !== null) {
    if (options.maxVolume > 0) {
      levelPct = (rawLevel / options.maxVolume) * 100;
    } else {
      levelPct = rawLevel;
    }
    levelPct = Math.min(100, Math.max(0, levelPct));
  }

  const tempRaw = numericValue(tempField);
  let temperature: number | null = null;
  if (tempRaw !== null) {
    const unit = tempField?.config?.unit ?? tempField?.labels?.['unit'] ?? '°C';
    temperature = unit === '°F' ? ((tempRaw - 32) * 5) / 9 : tempRaw;
  }

  const inflowRate = numericValue(inflowField);
  const inflowActive = inflowRate !== null && inflowRate > 0;

  let outflowActive = false;
  const outflowRaw = fieldValue(outflowField);
  if (outflowRaw !== null) {
    const s = String(outflowRaw).toLowerCase().trim();
    outflowActive = s === 'on' || s === 'true' || s === 'active' || s === 'open' || parseFloat(s) > 0;
  }

  const rainTotal = numericValue(rainField);

  return {
    levelPct,
    rawVolume: options.maxVolume > 0 ? rawVolume : null,
    temperature,
    inflowRate,
    inflowActive,
    outflowActive,
    rainTotal,
    hasData: true,
  };
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
pnpm test:ci 2>&1 | grep -E "PASS|FAIL|Tests:"
```

Expected: `PASS src/utils/fieldExtractor.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/utils/fieldExtractor.ts src/utils/fieldExtractor.test.ts
git commit -m "feat: add field extractor utility"
```

---

## Task 5: Animation Keyframes

**Files:**
- Create: `src/utils/animations.ts`

- [ ] **Step 1: Create animations.ts**

```typescript
// src/utils/animations.ts
import { keyframes } from '@emotion/css';

export const wobbleAnim = keyframes`
  0%, 100% { transform: scaleX(0.97); }
  50% { transform: scaleX(1.02); }
`;

export const riseAnim = keyframes`
  0% { transform: translateY(0); opacity: 0.3; }
  50% { opacity: 0.15; }
  100% { transform: translateY(-70px); opacity: 0; }
`;

export const flowDashAnim = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -14; }
`;

export const outDashAnim = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -10; }
`;

export const splashOutAnim = keyframes`
  0% { transform: translate(0,0) scale(1); opacity: 0.7; }
  50% { transform: translate(0,-8px) scale(1.3); opacity: 0.3; }
  100% { transform: translate(0,-3px) scale(0.4); opacity: 0; }
`;

export const dripFallAnim = keyframes`
  0% { transform: translateY(0); opacity: 0.8; }
  50% { opacity: 0.5; }
  100% { transform: translateY(20px); opacity: 0; }
`;

export const pulseAnim = keyframes`
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
`;

export const pulseIconAnim = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: only errors from `module.ts` (still referencing old types) — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/utils/animations.ts
git commit -m "feat: add animation keyframes"
```

---

## Task 6: TankBody Component

**Files:**
- Create: `src/components/TankBody.tsx`

- [ ] **Step 1: Create TankBody.tsx**

```tsx
// src/components/TankBody.tsx
import React from 'react';
import { TANK } from '../utils/tankGeometry';

interface Props {
  uid: string;
}

export const TankBody: React.FC<Props> = ({ uid }) => {
  const { cx, rx, ry, topY, botY, bodyH } = TANK;
  return (
    <>
      {/* Back rim */}
      <path
        d={`M${cx - rx} ${topY} A${rx} ${ry} 0 0 1 ${cx + rx} ${topY}`}
        fill="var(--primary-text-color)"
        fillOpacity={0.06}
        stroke="var(--primary-text-color)"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Body */}
      <rect x={cx - rx} y={topY} width={rx * 2} height={bodyH} fill={`url(#cy-${uid})`} />
      <rect x={cx - rx} y={topY} width={5} height={bodyH} fill="white" fillOpacity={0.05} />
      {/* Left wall */}
      <line x1={cx - rx} y1={topY} x2={cx - rx} y2={botY} stroke="var(--primary-text-color)" strokeWidth={1.8} strokeOpacity={0.45} />
      {/* Right wall */}
      <line x1={cx + rx} y1={topY} x2={cx + rx} y2={botY} stroke="var(--primary-text-color)" strokeWidth={1.8} strokeOpacity={0.45} />
      {/* Bottom ellipse */}
      <path
        d={`M${cx - rx} ${botY} A${rx} ${ry} 0 0 0 ${cx + rx} ${botY}`}
        fill="var(--primary-text-color)"
        fillOpacity={0.08}
        stroke="var(--primary-text-color)"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Front rim */}
      <path
        d={`M${cx - rx} ${topY} A${rx} ${ry} 0 0 0 ${cx + rx} ${topY}`}
        fill="none"
        stroke="var(--primary-text-color)"
        strokeWidth={1.8}
        strokeOpacity={0.5}
      />
      {/* Inner rim highlight */}
      <path
        d={`M${cx - rx + 12} ${topY + ry * 0.55} A${rx - 12} ${ry * 0.35} 0 0 0 ${cx + rx - 12} ${topY + ry * 0.55}`}
        fill="none"
        stroke="white"
        strokeWidth={0.8}
        strokeOpacity={0.15}
      />
      {/* Level markers */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <line
          key={frac}
          x1={cx - rx + 3}
          y1={botY - bodyH * frac}
          x2={cx - rx + 11}
          y2={botY - bodyH * frac}
          stroke="var(--primary-text-color)"
          strokeWidth={0.5}
          strokeOpacity={0.25}
        />
      ))}
    </>
  );
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TankBody.tsx
git commit -m "feat: add TankBody component"
```

---

## Task 7: WaterFill Component

**Files:**
- Create: `src/components/WaterFill.tsx`

- [ ] **Step 1: Create WaterFill.tsx**

```tsx
// src/components/WaterFill.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TANK, waterBodyPath, waterBotArcPath, waterSurfaceY } from '../utils/tankGeometry';
import { WaterColors } from '../utils/tankColors';
import { wobbleAnim } from '../utils/animations';

interface Props {
  levelPct: number;
  colors: WaterColors;
  uid: string;
}

export const WaterFill: React.FC<Props> = ({ levelPct, colors, uid }) => {
  const { cx, rx, ry, botY } = TANK;
  const surfY = waterSurfaceY(levelPct);
  const waterH = botY - surfY;
  const wL = cx - rx + 3;

  const surfaceClass = css`
    animation: ${wobbleAnim} 3s ease-in-out infinite alternate;
    transform-origin: center;
  `;

  if (levelPct <= 0) {
    return null;
  }

  return (
    <>
      <path d={waterBodyPath(levelPct)} fill={`url(#wf-${uid})`} />
      {/* Left specular highlight */}
      <rect x={wL} y={surfY} width={10} height={waterH} fill="white" opacity={0.08} />
      {/* Caustic patches (only when water is deep enough) */}
      {waterH > 25 && (
        <>
          <ellipse cx={cx - 8} cy={surfY + waterH * 0.4} rx={14} ry={7} fill="white" opacity={0.05} />
          <ellipse cx={cx + 15} cy={surfY + waterH * 0.65} rx={10} ry={5} fill="white" opacity={0.04} />
        </>
      )}
      {/* Bottom arc */}
      <path d={waterBotArcPath()} fill={colors.deep} opacity={0.6} />
      {/* Water surface ellipse (shown above 1%) */}
      {levelPct > 1 && (
        <>
          <ellipse
            className={surfaceClass}
            cx={cx}
            cy={surfY}
            rx={rx - 2}
            ry={ry - 1}
            fill={colors.top}
            fillOpacity={0.5}
            stroke={colors.top}
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <ellipse cx={cx} cy={surfY - 1} rx={rx * 0.4} ry={ry * 0.25} fill="white" opacity={0.15} />
        </>
      )}
    </>
  );
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WaterFill.tsx
git commit -m "feat: add WaterFill component"
```

---

## Task 8: InflowPipe Component

**Files:**
- Create: `src/components/InflowPipe.tsx`

- [ ] **Step 1: Create InflowPipe.tsx**

```tsx
// src/components/InflowPipe.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TANK, pipeGeometry, waterSurfaceY } from '../utils/tankGeometry';
import { flowDashAnim, splashOutAnim } from '../utils/animations';

interface Props {
  active: boolean;
  levelPct: number;
  waterTopColor: string;
  uid: string;
}

export const InflowPipe: React.FC<Props> = ({ active, levelPct, waterTopColor, uid }) => {
  const { topY, ry } = TANK;
  const { inflow } = pipeGeometry();
  const { endX, pipeY } = inflow;
  const surfY = waterSurfaceY(levelPct);
  const inflowEndY = Math.min(surfY - 2, TANK.botY - 5);

  const streamClass = css`
    animation: ${flowDashAnim} 0.7s linear infinite;
  `;
  const splashClass = css`animation: ${splashOutAnim} 1.2s ease-out infinite;`;
  const splash2Class = css`animation: ${splashOutAnim} 1.2s ease-out infinite; animation-delay: 0.3s;`;
  const splash3Class = css`animation: ${splashOutAnim} 1.2s ease-out infinite; animation-delay: 0.15s;`;

  return (
    <>
      {/* Horizontal pipe */}
      <rect x={8} y={pipeY - 5} width={endX - 8} height={10} rx={2} fill={`url(#pg-${uid})`} />
      {/* Vertical pipe */}
      <rect x={endX - 5} y={pipeY} width={10} height={topY - pipeY + ry + 2} rx={2} fill={`url(#pg-${uid})`} />
      {/* Connector elbow */}
      <circle cx={endX} cy={pipeY} r={7} fill={`url(#pg-${uid})`} stroke="#546e7a" strokeWidth={0.8} />
      <circle cx={endX} cy={pipeY} r={3} fill="#b0bec5" />
      {/* Pipe cap */}
      <rect x={5} y={pipeY - 7} width={6} height={14} rx={2} fill="#546e7a" />
      {/* Stream + splashes (only when active) */}
      {active && (
        <>
          <line
            className={streamClass}
            x1={endX}
            y1={topY + ry + 2}
            x2={endX}
            y2={inflowEndY}
            stroke={waterTopColor}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="6 8"
            opacity={0.85}
          />
          <circle className={splashClass} cx={endX - 8} cy={surfY} r={2} fill={waterTopColor} opacity={0.6} />
          <circle className={splash2Class} cx={endX + 7} cy={surfY - 2} r={1.8} fill={waterTopColor} opacity={0.5} />
          <circle className={splash3Class} cx={endX + 10} cy={surfY - 1} r={1.5} fill={waterTopColor} opacity={0.5} />
        </>
      )}
    </>
  );
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/InflowPipe.tsx
git commit -m "feat: add InflowPipe component"
```

---

## Task 9: OutflowPipe Component

**Files:**
- Create: `src/components/OutflowPipe.tsx`

- [ ] **Step 1: Create OutflowPipe.tsx**

```tsx
// src/components/OutflowPipe.tsx
import React from 'react';
import { css } from '@emotion/css';
import { pipeGeometry } from '../utils/tankGeometry';
import { outDashAnim, dripFallAnim } from '../utils/animations';

interface Props {
  active: boolean;
  uid: string;
}

export const OutflowPipe: React.FC<Props> = ({ active, uid }) => {
  const { outflow } = pipeGeometry();
  const { startY, endX, bendY } = outflow;
  // cx + rx - 3 = 143
  const pipeStartX = 143;

  const dashClass = css`animation: ${outDashAnim} 0.5s linear infinite;`;
  const drip1Class = css`animation: ${dripFallAnim} 1.4s ease-in infinite;`;
  const drip2Class = css`animation: ${dripFallAnim} 1.4s ease-in infinite; animation-delay: 0.5s;`;
  const drip3Class = css`animation: ${dripFallAnim} 1.4s ease-in infinite; animation-delay: 1s;`;

  return (
    <>
      {/* Horizontal pipe */}
      <rect x={pipeStartX} y={startY - 5} width={endX - pipeStartX + 6} height={10} rx={2} fill={`url(#pg-${uid})`} />
      {/* Vertical pipe */}
      <rect x={endX - 5} y={startY} width={10} height={bendY - startY} rx={2} fill={`url(#pg-${uid})`} />
      {/* Connector */}
      <circle cx={endX} cy={startY} r={7} fill={`url(#pg-${uid})`} stroke="#546e7a" strokeWidth={0.8} />
      <circle cx={endX} cy={startY} r={3} fill="#b0bec5" />
      {/* Flow + drips (only when active) */}
      {active && (
        <>
          <rect x={pipeStartX} y={startY - 2} width={endX - pipeStartX} height={4} fill="#0284c7" opacity={0.85} />
          <line className={dashClass} x1={pipeStartX} y1={startY} x2={endX} y2={startY} stroke="rgba(255,255,255,0.45)" strokeWidth={2} strokeDasharray="4 6" strokeLinecap="round" />
          <rect x={endX - 2} y={startY} width={4} height={bendY - startY + 3} fill="#0284c7" opacity={0.85} />
          <line className={dashClass} x1={endX} y1={startY} x2={endX} y2={bendY + 3} stroke="rgba(255,255,255,0.45)" strokeWidth={2} strokeDasharray="4 6" strokeLinecap="round" />
          <circle className={drip1Class} cx={endX} cy={bendY + 9} r={2.5} fill="#22d3ee" opacity={0.8} />
          <circle className={drip2Class} cx={endX} cy={bendY + 18} r={2} fill="#0284c7" opacity={0.6} />
          <circle className={drip3Class} cx={endX} cy={bendY + 26} r={1.5} fill="#0284c7" opacity={0.4} />
        </>
      )}
    </>
  );
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/OutflowPipe.tsx
git commit -m "feat: add OutflowPipe component"
```

---

## Task 10: BubbleLayer Component

**Files:**
- Create: `src/components/BubbleLayer.tsx`

- [ ] **Step 1: Create BubbleLayer.tsx**

```tsx
// src/components/BubbleLayer.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TANK } from '../utils/tankGeometry';
import { riseAnim } from '../utils/animations';

interface Props {
  active: boolean;
}

export const BubbleLayer: React.FC<Props> = ({ active }) => {
  if (!active) {
    return null;
  }

  const { cx, botY } = TANK;
  const base = css`animation: ${riseAnim} 4s ease-in infinite;`;
  const b2 = css`animation: ${riseAnim} 3.5s ease-in 1s infinite;`;
  const b3 = css`animation: ${riseAnim} 5s ease-in 2.2s infinite;`;
  const b4 = css`animation: ${riseAnim} 3s ease-in 0.5s infinite;`;

  return (
    <>
      <circle className={base} cx={cx - 16} cy={botY - 15} r={2} fill="white" opacity={0.3} />
      <circle className={b2} cx={cx + 12} cy={botY - 10} r={1.5} fill="white" opacity={0.25} />
      <circle className={b3} cx={cx + 24} cy={botY - 22} r={2.2} fill="white" opacity={0.2} />
      <circle className={b4} cx={cx - 6} cy={botY - 8} r={1.8} fill="white" opacity={0.28} />
    </>
  );
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BubbleLayer.tsx
git commit -m "feat: add BubbleLayer component"
```

---

## Task 11: WarningIcons Component

**Files:**
- Create: `src/components/WarningIcons.tsx`

- [ ] **Step 1: Create WarningIcons.tsx**

```tsx
// src/components/WarningIcons.tsx
import React from 'react';
import { css } from '@emotion/css';
import { pulseAnim } from '../utils/animations';

interface Props {
  temperature: number | null;
  levelPct: number;
  warningTempThreshold: number;
  lowLevelThreshold: number;
}

export const WarningIcons: React.FC<Props> = ({
  temperature,
  levelPct,
  warningTempThreshold,
  lowLevelThreshold,
}) => {
  const isTempWarning = temperature !== null && temperature > warningTempThreshold;
  const isLowWarning = levelPct <= lowLevelThreshold;

  if (!isTempWarning && !isLowWarning) {
    return null;
  }

  const pulseClass = css`
    position: absolute;
    z-index: 20;
    animation: ${pulseAnim} 1.5s ease-in-out infinite;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    left: 50%;
    transform: translateX(-50%);
  `;

  return (
    <>
      {isTempWarning && (
        <div className={css`${pulseClass}; top: 5px;`}>
          <svg viewBox="0 0 40 40" width={30} height={30}>
            <path d="M20 5 L5 35 L35 35 Z" fill="#ef4444" stroke="white" strokeWidth={2} />
            <text x={20} y={30} textAnchor="middle" fontSize={18} fontWeight="bold" fill="white">!</text>
          </svg>
        </div>
      )}
      {isLowWarning && (
        <div className={css`${pulseClass}; bottom: 45px;`}>
          <svg viewBox="0 0 40 40" width={30} height={30}>
            <path d="M20 8 Q 30 20 30 26 A 10 10 0 1 1 10 26 Q 10 20 20 8 Z" fill="#3b82f6" stroke="white" strokeWidth={1.5} />
            <line x1={8} y1={35} x2={32} y2={10} stroke="#ef4444" strokeWidth={3.5} strokeLinecap="round" />
          </svg>
        </div>
      )}
    </>
  );
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WarningIcons.tsx
git commit -m "feat: add WarningIcons component"
```

---

## Task 12: StatsBar and SideStatsPanel

**Files:**
- Create: `src/components/StatsBar.tsx`
- Create: `src/components/SideStatsPanel.tsx`

- [ ] **Step 1: Create StatsBar.tsx**

```tsx
// src/components/StatsBar.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TankState, TankOptions } from '../types';
import { pulseIconAnim } from '../utils/animations';

interface Props {
  state: TankState;
  options: TankOptions;
}

export const StatsBar: React.FC<Props> = ({ state, options }) => {
  const { temperature, inflowRate, inflowActive, rainTotal } = state;
  const isUS = options.usUnits;

  const displayTemp =
    temperature !== null
      ? isUS
        ? ((temperature * 9) / 5 + 32).toFixed(1) + '°F'
        : temperature.toFixed(1) + '°C'
      : null;

  const displayInflow =
    inflowRate !== null
      ? isUS
        ? (inflowRate * 0.0393701).toFixed(2) + ' in/h'
        : inflowRate.toFixed(1) + ' mm/h'
      : null;

  const displayRain =
    rainTotal !== null
      ? isUS
        ? (rainTotal * 0.0393701).toFixed(2) + ' in'
        : rainTotal.toFixed(1) + ' mm'
      : null;

  const activeIconClass = css`
    color: #3b82f6;
    animation: ${pulseIconAnim} 2s ease-in-out infinite;
  `;

  const barStyle = css`
    display: flex;
    justify-content: center;
    gap: 20px;
    width: 100%;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(128,128,128,0.15);
    flex-wrap: wrap;
  `;

  const statStyle = css`display: flex; align-items: center; gap: 8px;`;
  const labelStyle = css`font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7;`;
  const valueStyle = css`font-size: 1.05em; font-weight: 600;`;

  return (
    <div className={barStyle}>
      {displayTemp && (
        <div className={statStyle}>
          <div className={labelStyle}>Temp</div>
          <div className={valueStyle}>{displayTemp}</div>
        </div>
      )}
      {displayRain && (
        <div className={statStyle}>
          <div className={labelStyle}>Rain</div>
          <div className={valueStyle}>{displayRain}</div>
        </div>
      )}
      {displayInflow && (
        <div className={statStyle}>
          <div className={inflowActive ? activeIconClass : ''}>
            <div className={labelStyle}>Rate</div>
            <div className={valueStyle}>{displayInflow}</div>
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Create SideStatsPanel.tsx**

```tsx
// src/components/SideStatsPanel.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TankState, TankOptions } from '../types';

interface Props {
  state: TankState;
  options: TankOptions;
}

export const SideStatsPanel: React.FC<Props> = ({ state, options }) => {
  const { temperature, inflowRate, outflowActive, rainTotal, levelPct } = state;
  const isUS = options.usUnits;

  const panelStyle = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding: 8px 12px;
    border-left: 1px solid rgba(128,128,128,0.15);
  `;
  const rowStyle = css`display: flex; flex-direction: column; gap: 2px;`;
  const labelStyle = css`font-size: 0.65em; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6;`;
  const valueStyle = css`font-size: 1.1em; font-weight: 600;`;

  const displayTemp =
    temperature !== null
      ? isUS
        ? ((temperature * 9) / 5 + 32).toFixed(1) + '°F'
        : temperature.toFixed(1) + '°C'
      : null;

  const displayInflow =
    inflowRate !== null
      ? isUS
        ? (inflowRate * 0.0393701).toFixed(2) + ' in/h'
        : inflowRate.toFixed(1) + ' mm/h'
      : null;

  const displayRain =
    rainTotal !== null
      ? isUS
        ? (rainTotal * 0.0393701).toFixed(2) + ' in'
        : rainTotal.toFixed(1) + ' mm'
      : null;

  return (
    <div className={panelStyle}>
      <div className={rowStyle}>
        <span className={labelStyle}>Level</span>
        <span className={valueStyle}>{levelPct.toFixed(0)}%</span>
      </div>
      {displayTemp && (
        <div className={rowStyle}>
          <span className={labelStyle}>Temperature</span>
          <span className={valueStyle}>{displayTemp}</span>
        </div>
      )}
      {displayInflow && (
        <div className={rowStyle}>
          <span className={labelStyle}>Inflow Rate</span>
          <span className={valueStyle}>{displayInflow}</span>
        </div>
      )}
      {displayRain && (
        <div className={rowStyle}>
          <span className={labelStyle}>Rain Total</span>
          <span className={valueStyle}>{displayRain}</span>
        </div>
      )}
      <div className={rowStyle}>
        <span className={labelStyle}>Outflow</span>
        <span className={css`${valueStyle}; color: ${outflowActive ? '#22c55e' : 'inherit'};`}>
          {outflowActive ? 'Active' : 'Off'}
        </span>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/StatsBar.tsx src/components/SideStatsPanel.tsx
git commit -m "feat: add StatsBar and SideStatsPanel components"
```

---

## Task 13: TankSVG Component

**Files:**
- Create: `src/components/TankSVG.tsx`

- [ ] **Step 1: Create TankSVG.tsx**

```tsx
// src/components/TankSVG.tsx
import React, { useId } from 'react';
import { TankState, TankOptions } from '../types';
import { waterColors } from '../utils/tankColors';
import { TankBody } from './TankBody';
import { WaterFill } from './WaterFill';
import { InflowPipe } from './InflowPipe';
import { OutflowPipe } from './OutflowPipe';
import { BubbleLayer } from './BubbleLayer';
import { WarningIcons } from './WarningIcons';

interface Props {
  state: TankState;
  options: TankOptions;
  width: number;
  height: number;
}

export const TankSVG: React.FC<Props> = ({ state, options, width, height }) => {
  const rawId = useId().replace(/[^a-z0-9]/gi, '');
  const uid = `wtc${rawId}`;

  const colors = waterColors(state.temperature, options.warningTempThreshold);

  const isTempWarning = state.temperature !== null && state.temperature > options.warningTempThreshold;
  const isLowWarning = state.levelPct <= options.lowLevelThreshold;

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    zIndex: 10,
    color: 'white',
    pointerEvents: 'none',
    textShadow: '0 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.3)',
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg
        viewBox="0 0 200 200"
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Pipe gradient */}
          <linearGradient id={`pg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78909c" />
            <stop offset="30%" stopColor="#eceff1" />
            <stop offset="70%" stopColor="#90a4ae" />
            <stop offset="100%" stopColor="#546e7a" />
          </linearGradient>
          {/* Cylinder shading gradient */}
          <linearGradient id={`cy-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary-text-color)" stopOpacity={0.12} />
            <stop offset="15%" stopColor="var(--primary-text-color)" stopOpacity={0.04} />
            <stop offset="50%" stopColor="var(--primary-text-color)" stopOpacity={0.02} />
            <stop offset="85%" stopColor="var(--primary-text-color)" stopOpacity={0.04} />
            <stop offset="100%" stopColor="var(--primary-text-color)" stopOpacity={0.14} />
          </linearGradient>
          {/* Drop shadow filter */}
          <filter id={`sh-${uid}`} x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx={0} dy={3} stdDeviation={6} floodColor="rgba(0,0,0,0.2)" />
          </filter>
          {/* Water fill gradient */}
          <linearGradient id={`wf-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.top} stopOpacity={0.85} />
            <stop offset="100%" stopColor={colors.deep} />
          </linearGradient>
        </defs>

        <InflowPipe active={state.inflowActive} levelPct={state.levelPct} waterTopColor={colors.top} uid={uid} />
        <OutflowPipe active={state.outflowActive} uid={uid} />

        <g filter={`url(#sh-${uid})`}>
          <TankBody uid={uid} />
          <WaterFill levelPct={state.levelPct} colors={colors} uid={uid} />
          <BubbleLayer active={state.inflowActive && state.levelPct > 8} />
        </g>
      </svg>

      {/* Percentage + temperature overlay */}
      <div style={overlayStyle}>
        <div style={{
          fontSize: '2em',
          fontWeight: 700,
          lineHeight: 1,
          color: isLowWarning ? '#fbbf24' : 'white',
        }}>
          {state.levelPct.toFixed(0)}
          <span style={{ fontSize: '0.5em', fontWeight: 500, opacity: 0.85, verticalAlign: 'super' }}>%</span>
        </div>
        {state.temperature !== null && (
          <div style={{
            fontSize: '0.9em',
            marginTop: 4,
            fontWeight: 500,
            opacity: 0.9,
            color: isTempWarning ? '#fbbf24' : 'white',
          }}>
            {options.usUnits
              ? ((state.temperature * 9) / 5 + 32).toFixed(1) + '°F'
              : state.temperature.toFixed(1) + '°C'}
          </div>
        )}
      </div>

      <WarningIcons
        temperature={state.temperature}
        levelPct={state.levelPct}
        warningTempThreshold={options.warningTempThreshold}
        lowLevelThreshold={options.lowLevelThreshold}
      />
    </div>
  );
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TankSVG.tsx
git commit -m "feat: add TankSVG component"
```

---

## Task 14: WaterTankPanel + module.ts

**Files:**
- Create: `src/WaterTankPanel.tsx`
- Replace: `src/module.ts`
- Delete: `src/components/SimplePanel.tsx`

- [ ] **Step 1: Create WaterTankPanel.tsx**

```tsx
// src/WaterTankPanel.tsx
import React from 'react';
import { PanelProps } from '@grafana/data';
import { PanelDataErrorView } from '@grafana/runtime';
import { css } from '@emotion/css';
import { TankOptions } from './types';
import { extractTankState } from './utils/fieldExtractor';
import { TankSVG } from './components/TankSVG';
import { StatsBar } from './components/StatsBar';
import { SideStatsPanel } from './components/SideStatsPanel';

interface Props extends PanelProps<TankOptions> {}

export const WaterTankPanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const state = extractTankState(data, options);

  if (!state.hasData) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField={false} />;
  }

  if (options.layout === 'side-stats') {
    const tankWidth = Math.floor(width * 0.65);
    const statsWidth = width - tankWidth;
    return (
      <div className={css`display: flex; width: ${width}px; height: ${height}px;`}>
        <TankSVG state={state} options={options} width={tankWidth} height={height} />
        <div className={css`width: ${statsWidth}px; height: ${height}px; overflow: auto;`}>
          <SideStatsPanel state={state} options={options} />
        </div>
      </div>
    );
  }

  // 'fill' and 'adaptive' both use full-width tank + bottom StatsBar
  const statsBarHeight = 60;
  const tankHeight = height - statsBarHeight;

  return (
    <div className={css`display: flex; flex-direction: column; width: ${width}px; height: ${height}px;`}>
      <TankSVG state={state} options={options} width={width} height={tankHeight} />
      <StatsBar state={state} options={options} />
    </div>
  );
};
```

- [ ] **Step 2: Replace module.ts**

```typescript
// src/module.ts
import { PanelPlugin } from '@grafana/data';
import { TankOptions } from './types';
import { WaterTankPanel } from './WaterTankPanel';

export const plugin = new PanelPlugin<TankOptions>(WaterTankPanel).setPanelOptions((builder) => {
  return builder
    .addRadio({
      path: 'layout',
      name: 'Layout style',
      defaultValue: 'adaptive',
      settings: {
        options: [
          { value: 'fill', label: 'Fill' },
          { value: 'side-stats', label: 'Side Stats' },
          { value: 'adaptive', label: 'Adaptive' },
        ],
      },
      category: ['Layout'],
    })
    .addTextInput({
      path: 'levelField',
      name: 'Level field',
      description: 'Field name for water level (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'temperatureField',
      name: 'Temperature field',
      description: 'Field name for temperature (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'inflowField',
      name: 'Inflow field',
      description: 'Field name for inflow rate (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'outflowField',
      name: 'Outflow field',
      description: 'Field name for outflow status (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'rainField',
      name: 'Rain total field',
      description: 'Field name for rain total (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addNumberInput({
      path: 'maxVolume',
      name: 'Max volume',
      description: 'Maximum volume (0 = level field is already a percentage)',
      defaultValue: 0,
      category: ['Volume'],
    })
    .addBooleanSwitch({
      path: 'usUnits',
      name: 'US units',
      description: 'Display temperature in °F and rain in inches',
      defaultValue: false,
      category: ['Volume'],
    })
    .addNumberInput({
      path: 'warningTempThreshold',
      name: 'High temp warning (°C)',
      defaultValue: 20,
      category: ['Thresholds'],
    })
    .addNumberInput({
      path: 'lowLevelThreshold',
      name: 'Low level alert (%)',
      defaultValue: 10,
      category: ['Thresholds'],
    });
});
```

- [ ] **Step 3: Delete SimplePanel.tsx**

```bash
git rm src/components/SimplePanel.tsx
```

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5: Build**

```bash
pnpm build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 6: Run all tests**

```bash
pnpm test:ci
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/WaterTankPanel.tsx src/module.ts
git commit -m "feat: wire up WaterTankPanel and panel options"
```

---

## Task 15: Smoke Test in Grafana

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

Expected: webpack compiles without errors. Keep running in background.

- [ ] **Step 2: Start Grafana**

Follow your local Grafana setup. Plugin must be in the plugins directory (or symlinked). Restart Grafana if `plugin.json` was changed.

- [ ] **Step 3: Add panel to a dashboard**

1. Create or open a dashboard
2. Add a new panel
3. Set visualization to **Fillmeter**
4. Add a test data source query returning a field named `level` with a numeric value (e.g., 74)
5. Verify tank renders at correct fill level

- [ ] **Step 4: Test each layout mode**

In panel options → Layout style: switch between Fill, Side Stats, Adaptive. Verify layout changes.

- [ ] **Step 5: Test animations**

Add a field named `inflow` with value `2.4`. Verify inflow stream animation appears.
Add a field named `outflow` with value `on`. Verify outflow drip animation appears.

- [ ] **Step 6: Test temperature color shift**

Add a field named `temperature` with value `22`. Verify water color shifts toward orange.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: complete water tank panel implementation"
```
