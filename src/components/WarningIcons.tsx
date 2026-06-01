// src/components/WarningIcons.tsx
import React from 'react';
import { css, cx } from '@emotion/css';
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

  const tempIconPositionClass = css`top: 5px;`;
  const lowIconPositionClass = css`bottom: 45px;`;

  return (
    <>
      {isTempWarning && (
        <div data-testid="fillmeter-warning-temp" className={cx(pulseClass, tempIconPositionClass)}>
          <svg viewBox="0 0 40 40" width={30} height={30}>
            <path d="M20 5 L5 35 L35 35 Z" fill="#ef4444" stroke="white" strokeWidth={2} />
            <text x={20} y={30} textAnchor="middle" fontSize={18} fontWeight="bold" fill="white">!</text>
          </svg>
        </div>
      )}
      {isLowWarning && (
        <div data-testid="fillmeter-warning-low" className={cx(pulseClass, lowIconPositionClass)}>
          <svg viewBox="0 0 40 40" width={30} height={30}>
            <path d="M20 8 Q 30 20 30 26 A 10 10 0 1 1 10 26 Q 10 20 20 8 Z" fill="#3b82f6" stroke="white" strokeWidth={1.5} />
            <line x1={8} y1={35} x2={32} y2={10} stroke="#ef4444" strokeWidth={3.5} strokeLinecap="round" />
          </svg>
        </div>
      )}
    </>
  );
};
