// src/components/TankSVG.tsx
import React, { useId } from 'react';
import { TankState, TankOptions } from '../types';
import { waterColors } from '../utils/tankColors';
import { formatTemperature } from '../utils/unitConversions';
import { TankBody } from './TankBody';
import { WaterFill } from './WaterFill';
import { InflowPipe } from './InflowPipe';
import { OutflowPipe } from './OutflowPipe';
import { BubbleLayer } from './BubbleLayer';
import { WarningIcons } from './WarningIcons';

interface Props {
  state: TankState;
  options: TankOptions;
  width: number;
  height: number;
}

export const TankSVG: React.FC<Props> = ({ state, options, width, height }) => {
  const uid = `wtc${useId().replace(/[^a-z0-9]/gi, '_')}`;

  const colors = waterColors(state.temperature, options.warningTempThreshold);

  const isTempWarning = state.temperature !== null && state.temperature > options.warningTempThreshold;
  const isLowWarning = state.levelPct <= options.lowLevelThreshold;

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    zIndex: 10,
    color: 'white',
    pointerEvents: 'none',
    textShadow: '0 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.3)',
  };

  return (
    <div data-testid="fillmeter-panel" style={{ position: 'relative', width, height }}>
      <svg
        viewBox="0 0 200 200"
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Pipe gradient */}
          <linearGradient id={`pg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78909c" />
            <stop offset="30%" stopColor="#eceff1" />
            <stop offset="70%" stopColor="#90a4ae" />
            <stop offset="100%" stopColor="#546e7a" />
          </linearGradient>
          {/* Cylinder shading gradient */}
          <linearGradient id={`cy-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary-text-color)" stopOpacity={0.12} />
            <stop offset="15%" stopColor="var(--primary-text-color)" stopOpacity={0.04} />
            <stop offset="50%" stopColor="var(--primary-text-color)" stopOpacity={0.02} />
            <stop offset="85%" stopColor="var(--primary-text-color)" stopOpacity={0.04} />
            <stop offset="100%" stopColor="var(--primary-text-color)" stopOpacity={0.14} />
          </linearGradient>
          {/* Drop shadow filter */}
          <filter id={`sh-${uid}`} x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx={0} dy={3} stdDeviation={6} floodColor="rgba(0,0,0,0.2)" />
          </filter>
          {/* Water fill gradient */}
          <linearGradient id={`wf-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.top} stopOpacity={0.85} />
            <stop offset="100%" stopColor={colors.deep} />
          </linearGradient>
        </defs>

        <InflowPipe active={state.inflowActive} levelPct={state.levelPct} waterTopColor={colors.top} uid={uid} />
        <OutflowPipe active={state.outflowActive} uid={uid} />

        <g filter={`url(#sh-${uid})`}>
          <TankBody uid={uid} />
          <WaterFill levelPct={state.levelPct} colors={colors} uid={uid} />
          <BubbleLayer active={state.inflowActive && state.levelPct > 8} />
        </g>
      </svg>

      {/* Percentage + temperature overlay */}
      <div data-testid="fillmeter-overlay" style={overlayStyle}>
        <div data-testid="fillmeter-level" style={{
          fontSize: '2em',
          fontWeight: 700,
          lineHeight: 1,
          color: isLowWarning ? '#fbbf24' : 'white',
        }}>
          {state.levelPct.toFixed(0)}
          <span style={{ fontSize: '0.5em', fontWeight: 500, opacity: 0.85, verticalAlign: 'super' }}>%</span>
        </div>
        {state.temperature !== null && (
          <div style={{
            fontSize: '0.9em',
            marginTop: 4,
            fontWeight: 500,
            opacity: 0.9,
            color: isTempWarning ? '#fbbf24' : 'white',
          }}>
            {formatTemperature(state.temperature, options)}
          </div>
        )}
      </div>

      <WarningIcons
        temperature={state.temperature}
        levelPct={state.levelPct}
        warningTempThreshold={options.warningTempThreshold}
        lowLevelThreshold={options.lowLevelThreshold}
      />
    </div>
  );
};
