import { TANK, WATER_EDGE_INSET, WATER_SURFACE_RY_INSET, waterSurfaceY, waterBodyPath, waterBotArcPath, pipeGeometry } from './tankGeometry';

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

describe('geometry inset constants', () => {
  it('WATER_EDGE_INSET is 3', () => {
    expect(WATER_EDGE_INSET).toBe(3);
  });
  it('WATER_SURFACE_RY_INSET is 1', () => {
    expect(WATER_SURFACE_RY_INSET).toBe(1);
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

describe('waterBotArcPath', () => {
  it('returns a string starting with M', () => {
    const path = waterBotArcPath();
    expect(path).toMatch(/^M/);
  });
  it('contains A (arc command) and uses x values 57 and 143', () => {
    const path = waterBotArcPath();
    expect(path).toContain('A');
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
