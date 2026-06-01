// src/components/OutflowPipe.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TANK, pipeGeometry, WATER_EDGE_INSET } from '../utils/tankGeometry';
import { outDashAnim, dripFallAnim } from '../utils/animations';

const PIPE_GEOMETRY = pipeGeometry();
const pipeStartX = TANK.cx + TANK.rx - WATER_EDGE_INSET;

interface Props {
  active: boolean;
  uid: string;
}

export const OutflowPipe: React.FC<Props> = ({ active, uid }) => {
  const { outflow } = PIPE_GEOMETRY;
  const { startY, endX, bendY } = outflow;

  const dashClass = css`animation: ${outDashAnim} 0.5s linear infinite;`;
  const drip1Class = css`animation: ${dripFallAnim} 1.4s ease-in 0s infinite;`;
  const drip2Class = css`animation: ${dripFallAnim} 1.4s ease-in 0.5s infinite;`;
  const drip3Class = css`animation: ${dripFallAnim} 1.4s ease-in 1s infinite;`;

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
