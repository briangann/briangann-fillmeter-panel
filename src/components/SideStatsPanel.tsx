// src/components/SideStatsPanel.tsx
import React from 'react';
import { css, cx } from '@emotion/css';
import { TankState, TankOptions } from '../types';
import { formatTemperature, formatInflowRate, formatRain } from '../utils/unitConversions';

const panelStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 8px 12px;
  border-left: 1px solid rgba(128,128,128,0.15);
`;
const rowStyle = css`display: flex; flex-direction: column; gap: 2px;`;
const labelStyle = css`font-size: 0.65em; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6;`;
const valueStyle = css`font-size: 1.1em; font-weight: 600;`;

interface Props {
  state: TankState;
  options: TankOptions;
}

export const SideStatsPanel: React.FC<Props> = ({ state, options }) => {
  const { temperature, inflowRate, outflowActive, rainTotal, levelPct } = state;

  const displayTemp = temperature !== null ? formatTemperature(temperature, options) : null;
  const displayInflow = inflowRate !== null ? formatInflowRate(inflowRate, options) : null;
  const displayRain = rainTotal !== null ? formatRain(rainTotal, options) : null;

  return (
    <div data-testid="fillmeter-side-stats" className={panelStyle}>
      <div className={rowStyle}>
        <span className={labelStyle}>Level</span>
        <span className={valueStyle}>{levelPct.toFixed(0)}%</span>
      </div>
      {displayTemp && (
        <div className={rowStyle}>
          <span className={labelStyle}>Temperature</span>
          <span className={valueStyle}>{displayTemp}</span>
        </div>
      )}
      {displayInflow && (
        <div className={rowStyle}>
          <span className={labelStyle}>Inflow Rate</span>
          <span className={valueStyle}>{displayInflow}</span>
        </div>
      )}
      {displayRain && (
        <div className={rowStyle}>
          <span className={labelStyle}>Rain Total</span>
          <span className={valueStyle}>{displayRain}</span>
        </div>
      )}
      <div className={rowStyle}>
        <span className={labelStyle}>Outflow</span>
        <span className={cx(valueStyle, css`color: ${outflowActive ? '#22c55e' : 'inherit'};`)}>
          {outflowActive ? 'Active' : 'Off'}
        </span>
      </div>
    </div>
  );
};
