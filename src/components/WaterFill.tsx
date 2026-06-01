// src/components/WaterFill.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TANK, waterBodyPath, waterBotArcPath, waterSurfaceY, WATER_EDGE_INSET, WATER_SURFACE_RY_INSET } from '../utils/tankGeometry';
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
  const wL = cx - rx + WATER_EDGE_INSET;

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
            ry={ry - WATER_SURFACE_RY_INSET}
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
