# Water Tank Panel — Design Spec

**Date:** 2026-05-31
**Branch:** dev/initial-plugin-setup
**Source reference:** `../water_tank/water-tank-card.js` (Home Assistant LitElement card)

---

## Overview

Port the `water-tank-card` Home Assistant custom card into a Grafana panel plugin. The panel renders an animated 3D SVG water tank whose fill level, color, and animations are driven by Grafana data frame fields. All HA-specific concepts (entities, LitElement, HACS) are replaced with Grafana equivalents (PanelData, React, panel options).

---

## Requirements

### Data Input
- Level field supports both percentage (0–100) and raw volume with a configurable max volume
- Auto-detect field unit: if field reports `%` unit, treat as percentage directly; otherwise apply `(value / maxVolume) * 100`
- Field mapping: panel options (explicit field name) take priority; auto-detect by field name keywords as fallback
- Multiple optional fields: temperature, inflow rate, outflow status, rain total

### Features
- Full animation set from original: water surface wobble, bubbles (when inflow active), inflow stream dash animation, outflow drip animation, splash circles
- Temperature-driven color shift: cyan (cold) → orange (hot), configurable threshold
- Warning indicators: pulsing high-temp icon, pulsing low-level icon
- Info display: level percentage, temperature, inflow rate, rain total
- Three selectable layout modes (panel option)

### Layout Modes
- **Fill**: tank fills panel; stats in compact bottom bar
- **Side Stats**: tank occupies left 65%; stats panel on right 35%
- **Adaptive**: tank maximizes space; stats overlaid at bottom (closest to original HA card)

### Animations (all CSS keyframes via Emotion)
- `wobble`: water surface ellipse scale oscillation (3s)
- `rise`: bubble upward movement + opacity fade (3–5s staggered)
- `flowDash`: inflow stream stroke-dashoffset scroll (0.7s)
- `outDash`: outflow pipe dash animation (0.5s)
- `splashOut`: splash circles translate + scale + opacity (1.2s)
- `dripFall`: outflow drip fall + opacity (1.4s)
- `pulse`: warning icon scale + opacity pulse (1.5s)

---

## Architecture

```
src/
├── module.ts                    # panel options builder
├── types.ts                     # TankOptions, TankState, LayoutMode
├── WaterTankPanel.tsx           # main panel entry (replaces SimplePanel.tsx)
├── components/
│   ├── TankSVG.tsx              # top-level SVG, dispatches to sub-components
│   ├── TankBody.tsx             # 3D cylinder shell (back rim, walls, bottom ellipse)
│   ├── WaterFill.tsx            # water body path + surface ellipse + caustics + specular
│   ├── InflowPipe.tsx           # pipe shape + animated dash stream when active
│   ├── OutflowPipe.tsx          # pipe shape + drip animation when active
│   ├── BubbleLayer.tsx          # 3 staggered animated bubbles (inflowActive only)
│   ├── StatsBar.tsx             # bottom stat row: temp, rain, inflow rate
│   ├── SideStatsPanel.tsx       # right-side stats block for layout='side-stats'
│   └── WarningIcons.tsx         # pulsing SVG icons for high-temp / low-level
└── utils/
    ├── tankGeometry.ts          # geometry constants + waterSurfaceY + waterBodyPath
    ├── tankColors.ts            # temperature color interpolation → WaterColors
    ├── fieldExtractor.ts        # PanelData + TankOptions → TankState
    └── animations.ts            # Emotion keyframes (wobble, rise, flowDash, outDash, splashOut, dripFall, pulse) — imported by components that need them
```

---

## Types

```typescript
export type LayoutMode = 'fill' | 'side-stats' | 'adaptive';

export interface TankOptions {
  layout: LayoutMode;
  levelField: string;        // empty = auto-detect
  temperatureField: string;
  inflowField: string;
  outflowField: string;
  rainField: string;
  maxVolume: number;         // 0 = treat level field as %
  warningTempThreshold: number;  // default 20 (°C)
  lowLevelThreshold: number;     // default 10 (%)
  usUnits: boolean;
}

export interface TankState {
  levelPct: number;          // 0–100, clamped
  rawVolume: number | null;
  temperature: number | null; // always °C internally
  inflowRate: number | null;  // mm/h internally
  inflowActive: boolean;
  outflowActive: boolean;
  rainTotal: number | null;
  hasData: boolean;
}
```

---

## Utilities

### `tankGeometry.ts`
Pure geometry constants and calculations derived directly from the original card:

```typescript
export const TANK = { cx: 100, rx: 46, ry: 13, topY: 38, botY: 155, bodyH: 117 };
export function waterSurfaceY(levelPct: number): number
export function waterBodyPath(levelPct: number): string   // SVG path d attribute
export function pipeGeometry(): PipeGeometry
```

### `tankColors.ts`
Temperature-driven color interpolation:
- Below 15°C: cyan palette (`#22d3ee`, `#0284c7`, `#0c4a6e`)
- 15°C → threshold: smooth RGB interpolation toward orange
- Above threshold: orange palette (`#fb923c`, `#ea580c`, `#7c2d12`)
- null temperature: cyan palette (default)

```typescript
export interface WaterColors { top: string; mid: string; deep: string; }
export function waterColors(tempC: number | null, warningThreshold: number): WaterColors
```

### `fieldExtractor.ts`
Bridges Grafana `PanelData` to `TankState`:
1. Resolve each field: explicit option name → keyword auto-detect → null
2. Auto-detect keywords (case-insensitive): level/volume/fill/percent, temp/temperature, inflow/rain_rate, outflow/usage, rain/total
3. Convert units: °F→°C, gal→L if needed, raw volume → % via maxVolume
4. Clamp levelPct 0–100
5. Detect `inflowActive`: inflowRate > 0
6. Detect `outflowActive`: numeric > 0 OR string matches 'on'/'true'/'active'/'open'

---

## Component Responsibilities

### `WaterTankPanel`
- Main panel entry point; receives Grafana `PanelProps<TankOptions>`
- Calls `extractTankState(data, options)` to get `TankState`
- Renders `PanelDataErrorView` when `!state.hasData`
- Dispatches to layout: `fill` and `adaptive` wrap `TankSVG` + `StatsBar` in a flex column; `side-stats` places `TankSVG` + `SideStatsPanel` side by side
- Passes `width`/`height` from panel props to `TankSVG`

### `TankSVG`
- Receives `TankState`, `TankOptions`, `width`, `height`
- Generates scoped SVG gradient/filter IDs using `useId()` (prevents conflicts with multiple panels)
- Renders `<defs>` block (gradients, drop shadow filter)
- Conditionally renders optional sub-components based on which fields are present in `TankState`
- Does not contain any business logic

### `TankBody`
- Renders the static 3D cylinder: back rim ellipse, rectangle body, left/right wall lines, bottom ellipse, front rim ellipse, inner highlight
- No data dependencies

### `WaterFill`
- Props: `levelPct`, `colors: WaterColors`, `uid`
- Renders: water body path, left specular highlight, caustic patches, wobbling surface ellipse
- Applies `wobble` animation to surface ellipse

### `InflowPipe`
- Props: `active: boolean`, `uid`
- Always renders pipe geometry
- Conditionally adds dash stream + splash circles with CSS animations when `active`

### `OutflowPipe`
- Props: `active: boolean`, `uid`
- Always renders pipe geometry
- Conditionally adds drip rectangles with `dripFall` + `outDash` animations when `active`

### `BubbleLayer`
- Props: `active: boolean`
- Renders nothing when `!active`
- 3 bubbles with staggered `rise` animation delays

### `WarningIcons`
- Props: `tempC`, `levelPct`, `warningTempThreshold`, `lowLevelThreshold`
- High temp: red triangle icon with `pulse` animation (shown when tempC > warningTempThreshold)
- Low level: blue drop with red slash, `pulse` animation (shown when levelPct < lowLevelThreshold)
- Renders null if no warnings

### `StatsBar`
- Compact single-row display: temperature | inflow rate | rain total
- Only shows fields with data

### `SideStatsPanel`
- Vertical list of stats with labels
- Used only in `layout='side-stats'` mode

---

## Panel Options (module.ts)

```
Category: Layout
  Layout style  [radio]  Fill | Side Stats | Adaptive  (default: Adaptive)

Category: Data Fields
  Level field       [text]  placeholder "auto"
  Temperature field [text]  placeholder "auto"
  Inflow field      [text]  placeholder "auto"
  Outflow field     [text]  placeholder "auto"
  Rain field        [text]  placeholder "auto"

Category: Volume
  Max volume        [number]  0 = field is already %  (default: 0)
  US units          [boolean toggle]  (default: false)

Category: Thresholds
  High temp warning [number]  °C  (default: 20)
  Low level alert   [number]  %   (default: 10)
```

Standard builder methods only (`addTextInput`, `addNumberInput`, `addRadio`, `addBooleanSwitch`). No custom editor component.

---

## Error Handling

| Condition | Behavior |
|---|---|
| No data | `PanelDataErrorView` (no tank rendered) |
| Missing optional field | Sub-component not rendered; no error |
| NaN / null field value | Treated as disabled feature |
| Raw volume with maxVolume = 0 | Small warning text in panel: "Set Max Volume to enable % display"; 0% fill shown |
| Level out of range | Clamped 0–100 in fieldExtractor |
| Multiple series | Uses first series; field name matching may find field in non-first series |

Edge cases to refine in implementation: unit handling for mixed-unit dashboards, behavior when field name matches multiple fields.

---

## Out of Scope

- Custom editor component (use standard panel options builder)
- Backend / alerting integration
- Thresholds from Grafana field config (use panel options instead)
- Mobile-specific layout adjustments
- Accessibility (ARIA) — future iteration
