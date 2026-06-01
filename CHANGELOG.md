# Changelog

## 1.0.0 (Unreleased)

### Features

- 3D animated SVG water tank visualization ported from the water-tank-card Home Assistant custom card
- Fill level display as percentage with animated water body, surface wobble, and caustic light effects
- Temperature-driven color shift: cyan palette below 15°C, smooth RGB interpolation toward orange, full orange above configurable warning threshold
- Inflow pipe animation: dashed stream and splash circles when inflow rate > 0
- Outflow pipe animation: flow fill, dashed lines, and drip circles when outflow active
- Animated bubble rise when inflow is active and tank level > 8%
- High-temperature warning icon (pulsing red triangle) when temperature exceeds threshold
- Low-level warning icon (pulsing blue drop with red slash) when fill level is at or below threshold
- Three layout modes: Adaptive (tank + bottom stats bar), Fill (tank + compact overlay), Side Stats (tank left / stats panel right)
- Auto-detection of data fields by keyword matching on field names (level, temperature, inflow, outflow, rain)
- Explicit field name overrides via panel options
- Raw volume to percentage conversion using configurable max volume
- US unit display toggle: °F and inches
- Configurable thresholds for high-temperature warning (default 20°C) and low-level alert (default 10%)
- Multiple panels on the same dashboard render independently with scoped SVG gradient IDs
- React 19 compatible; requires Grafana 12.3+
