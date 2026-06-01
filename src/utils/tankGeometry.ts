export const TANK = {
  cx: 100,
  rx: 46,
  ry: 13,
  topY: 38,
  botY: 155,
  bodyH: 117,
} as const;

export const WATER_EDGE_INSET = 3; // inset from cylinder wall for water body
export const WATER_SURFACE_RY_INSET = 1; // reduce ellipse height for surface clearance

export function waterSurfaceY(levelPct: number): number {
  const clamped = Math.min(100, Math.max(0, levelPct));
  return TANK.botY - (TANK.bodyH * clamped) / 100;
}

export function waterBodyPath(levelPct: number): string {
  const surfY = waterSurfaceY(levelPct);
  const wL = TANK.cx - TANK.rx + WATER_EDGE_INSET;
  const wR = TANK.cx + TANK.rx - WATER_EDGE_INSET;
  const wRx = TANK.rx - WATER_EDGE_INSET;
  const wRy = TANK.ry - WATER_SURFACE_RY_INSET;
  return `M${wL} ${surfY} L${wL} ${TANK.botY} A${wRx} ${wRy} 0 0 0 ${wR} ${TANK.botY} L${wR} ${surfY} Z`;
}

export function waterBotArcPath(): string {
  const wL = TANK.cx - TANK.rx + WATER_EDGE_INSET;
  const wR = TANK.cx + TANK.rx - WATER_EDGE_INSET;
  const wRx = TANK.rx - WATER_EDGE_INSET;
  const wRy = TANK.ry - WATER_SURFACE_RY_INSET;
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
      pipeY: TANK.topY - 20, // pipe enters 20px above tank top
      connectorY: TANK.topY + TANK.ry + 2,
    },
    outflow: {
      startY: TANK.botY - 15, // outflow exits 15px above tank bottom
      endX: TANK.cx + TANK.rx + 32, // outflow bends 32px right of tank edge
      bendY: TANK.botY + 8, // outflow bends 8px below tank bottom
    },
  };
}
