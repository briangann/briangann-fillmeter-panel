// src/components/StatsBar.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TankState, TankOptions } from '../types';
import { pulseIconAnim } from '../utils/animations';
import { formatTemperature, formatInflowRate, formatRain } from '../utils/unitConversions';

const activeIconClass = css`
  color: #3b82f6;
  animation: ${pulseIconAnim} 2s ease-in-out infinite;
`;

const barStyle = css`
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(128,128,128,0.15);
  flex-wrap: wrap;
`;
const statStyle = css`display: flex; align-items: center; gap: 8px;`;
const labelStyle = css`font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7;`;
const valueStyle = css`font-size: 1.05em; font-weight: 600;`;

interface StatProps {
  label: string;
  value: string;
  active?: boolean;
}

const Stat: React.FC<StatProps> = ({ label, value, active }) => (
  <div className={statStyle}>
    <div className={active ? activeIconClass : ''}>
      <div className={labelStyle}>{label}</div>
      <div className={valueStyle}>{value}</div>
    </div>
  </div>
);

interface Props {
  state: TankState;
  options: TankOptions;
}

export const StatsBar: React.FC<Props> = ({ state, options }) => {
  const { temperature, inflowRate, inflowActive, rainTotal } = state;

  const displayTemp = temperature !== null ? formatTemperature(temperature, options) : null;
  const displayInflow = inflowRate !== null ? formatInflowRate(inflowRate, options) : null;
  const displayRain = rainTotal !== null ? formatRain(rainTotal, options) : null;

  return (
    <div className={barStyle}>
      {displayTemp && <Stat label="Temp" value={displayTemp} />}
      {displayRain && <Stat label="Rain" value={displayRain} />}
      {displayInflow && <Stat label="Rate" value={displayInflow} active={inflowActive} />}
    </div>
  );
};
