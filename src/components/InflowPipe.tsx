// src/components/InflowPipe.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TANK, pipeGeometry, waterSurfaceY } from '../utils/tankGeometry';
import { flowDashAnim, splashOutAnim } from '../utils/animations';

const PIPE_GEOMETRY = pipeGeometry();

interface Props {
  active: boolean;
  levelPct: number;
  waterTopColor: string;
  uid: string;
}

export const InflowPipe: React.FC<Props> = ({ active, levelPct, waterTopColor, uid }) => {
  const { topY, ry } = TANK;
  const { inflow } = PIPE_GEOMETRY;
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
