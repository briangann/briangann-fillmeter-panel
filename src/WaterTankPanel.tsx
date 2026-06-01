// src/WaterTankPanel.tsx
import React from 'react';
import { PanelProps } from '@grafana/data';
import { PanelDataErrorView } from '@grafana/runtime';
import { css } from '@emotion/css';
import { TankOptions } from './types';
import { extractTankState } from './utils/fieldExtractor';
import { TankSVG } from './components/TankSVG';
import { StatsBar } from './components/StatsBar';
import { SideStatsPanel } from './components/SideStatsPanel';

const STATS_BAR_HEIGHT = 60;
const SIDE_STATS_RATIO = 0.65;

interface Props extends PanelProps<TankOptions> {}

export const WaterTankPanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const state = extractTankState(data, options);

  if (!state.hasData) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField={false} />;
  }

  if (options.layout === 'side-stats') {
    const tankWidth = Math.floor(width * SIDE_STATS_RATIO);
    const statsWidth = width - tankWidth;
    return (
      <div className={css`display: flex; width: ${width}px; height: ${height}px;`}>
        <TankSVG state={state} options={options} width={tankWidth} height={height} />
        <div className={css`width: ${statsWidth}px; height: ${height}px; overflow: auto;`}>
          <SideStatsPanel state={state} options={options} />
        </div>
      </div>
    );
  }

  // 'fill' and 'adaptive' — full-width tank + bottom StatsBar
  const tankHeight = height - STATS_BAR_HEIGHT;

  return (
    <div className={css`display: flex; flex-direction: column; width: ${width}px; height: ${height}px;`}>
      <TankSVG state={state} options={options} width={width} height={tankHeight} />
      <StatsBar state={state} options={options} />
    </div>
  );
};
