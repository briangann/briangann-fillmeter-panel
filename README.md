# Fillmeter Panel

A Grafana panel plugin that renders an animated 3D water tank visualization. Originally ported from the [water-tank-card](https://github.com/mong00se007/water_tank) Home Assistant custom card.

## Overview

Fillmeter displays water tank fill level as an animated SVG cylinder. The water color shifts from cyan (cold) to orange (hot) based on temperature, and pipes animate when inflow or outflow is active.

![All three layout modes](img/screenshot-dashboard.png)

| Adaptive (inflow + outflow active) | Side Stats (hot water warning) | Fill (low level warning) |
|---|---|---|
| ![Adaptive layout](img/screenshot-adaptive.png) | ![Side stats layout](img/screenshot-side-stats.png) | ![Low level warning](img/screenshot-low-level.png) |

## Features

- **3D animated SVG tank** — water fill, surface wobble, bubble rise, inflow stream, outflow drips
- **Temperature-driven color** — cyan below 15°C, interpolates to orange at configurable threshold
- **Warning indicators** — pulsing high-temperature triangle and low-level drop icon
- **Three layout modes** — Adaptive, Fill, Side Stats (selectable per panel)
- **Flexible field mapping** — auto-detects field names or accepts explicit overrides
- **US unit support** — toggleable °F / inches display
- **Grafana 12.3+ / React 19 compatible**

## Layout Modes

| Mode | Description |
|------|-------------|
| **Adaptive** | Tank fills panel; stats bar at bottom |
| **Fill** | Tank maximizes space; compact stats overlay |
| **Side Stats** | Tank on left (65%), stats panel on right |

## Data Fields

The panel auto-detects fields by name keyword. You can override any field name in panel options.

| Field | Auto-detect keywords | Description |
|-------|---------------------|-------------|
| Level | `level`, `volume`, `fill`, `percent`, `tank` | Water level — % or raw volume |
| Temperature | `temp`, `temperature` | Water temperature (°C or °F) |
| Inflow | `inflow`, `rain_rate`, `rainrate`, `flow_in` | Inflow rate (triggers stream animation) |
| Outflow | `outflow`, `usage`, `flow_out`, `consumption` | Outflow status — numeric > 0 or `on`/`true`/`active`/`open` |
| Rain | `rain`, `rainfall`, `rain_total`, `precipitation` | Rain accumulation total |

## Panel Options

### Layout
- **Layout style** — Adaptive / Fill / Side Stats

### Data Fields
- **Level field** — field name for water level (empty = auto-detect)
- **Temperature field** — field name for temperature (empty = auto-detect)
- **Inflow field** — field name for inflow rate (empty = auto-detect)
- **Outflow field** — field name for outflow status (empty = auto-detect)
- **Rain total field** — field name for rain accumulation (empty = auto-detect)

### Volume
- **Max volume** — maximum volume used to compute fill % from raw value (0 = field is already a percentage)
- **US units** — display temperature in °F and rain in inches

### Thresholds
- **High temp warning (°C)** — temperature above which the tank turns orange and warning icon appears (default: 20)
- **Low level alert (%)** — fill % below which the amber low-level icon appears (default: 10)

## Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Build and watch
pnpm run dev

# Production build
pnpm run build

# Run unit tests
pnpm run test:ci

# Start Grafana via Docker
pnpm run server

# Run E2E tests (requires server running)
pnpm run e2e
```

### Docker

```bash
# Start Grafana 12 with the plugin loaded
docker compose up --build
```

Grafana will be available at `http://localhost:3000`. A provisioned dashboard with example panels is included.

## Distributing / Publishing

This plugin must be signed before publishing to the Grafana Plugins Catalog.

1. Create a [Grafana Cloud account](https://grafana.com/signup)
2. Ensure the plugin ID prefix matches your Grafana Cloud account slug
3. Create a Grafana Cloud API key with the `PluginPublisher` role
4. Add the key as `GRAFANA_API_KEY` in your GitHub repository secrets
5. Push a version tag to trigger the release workflow:

```bash
pnpm version patch   # or minor / major
git push origin main --follow-tags
```

See [How to sign a plugin](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin) for full details.

## References

- [Grafana plugin documentation](https://grafana.com/developers/plugin-tools/)
- [`plugin.json` reference](https://grafana.com/developers/plugin-tools/reference/plugin-json)
- [Original water-tank-card (Home Assistant)](https://github.com/water-tank-card)
