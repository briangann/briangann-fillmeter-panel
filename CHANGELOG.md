# Changelog

## 1.0.0 (Unreleased)

### Added

**Visualization**
- 3D animated SVG water tank ported from the water-tank-card Home Assistant custom card
- Fill level display with animated water body, surface wobble, and caustic light effects
- Temperature-driven water color: cyan below 15°C, smooth RGB interpolation to orange, full orange above warning threshold
- Inflow pipe with animated dashed stream and splash circles when inflow rate > 0
- Outflow pipe with animated flow fill, dashed lines, and drip circles when outflow active
- Bubble rise animation when inflow is active and level > 8%

**Warnings**
- High-temperature warning: pulsing red triangle when temperature exceeds threshold
- Low-level warning: pulsing blue drop with red slash when fill is at or below threshold

**Layout**
- Adaptive mode: tank fills panel with stats bar at bottom
- Fill mode: tank maximizes space with percentage and temperature overlaid
- Side Stats mode: tank on left (65%), stats panel on right

**Data**
- Auto-detection of level, temperature, inflow, outflow, and rain fields by keyword matching
- Explicit field name overrides via panel options
- Raw volume to percentage conversion via configurable max volume option
- Outflow detection from numeric values (> 0) or strings (`on`, `true`, `active`, `open`)
- US unit display: °F and inches toggle

**Configuration**
- High-temperature warning threshold (default: 20°C)
- Low-level alert threshold (default: 10%)
- React 19 compatible; requires Grafana 12.3+

### Documentation
- README with feature overview, configuration reference, and screenshots
- Panel screenshots: adaptive mode and side-stats mode
