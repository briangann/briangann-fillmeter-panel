import React from 'react';
import { render, screen } from '@testing-library/react';
import { SideStatsPanel } from './SideStatsPanel';
import { TankState, TankOptions } from '../types';

const baseOptions: TankOptions = {
  layout: 'side-stats', levelField: '', temperatureField: '', inflowField: '',
  outflowField: '', rainField: '', maxVolume: 0, warningTempThreshold: 20,
  lowLevelThreshold: 10, usUnits: false,
};

const baseState: TankState = {
  levelPct: 25, rawVolume: null, temperature: null, inflowRate: null,
  inflowActive: false, outflowActive: false, rainTotal: null, hasData: true,
};

describe('SideStatsPanel', () => {
  it('always shows level', () => {
    render(<SideStatsPanel state={baseState} options={baseOptions} />);
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('always shows outflow row as Off by default', () => {
    render(<SideStatsPanel state={baseState} options={baseOptions} />);
    expect(screen.getByText('Outflow')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('shows Active when outflow is on', () => {
    render(<SideStatsPanel state={{ ...baseState, outflowActive: true }} options={baseOptions} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('hides temperature row when null', () => {
    render(<SideStatsPanel state={baseState} options={baseOptions} />);
    expect(screen.queryByText('Temperature')).not.toBeInTheDocument();
  });

  it('shows temperature when provided', () => {
    render(<SideStatsPanel state={{ ...baseState, temperature: 22.5 }} options={baseOptions} />);
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('22.5°C')).toBeInTheDocument();
  });

  it('shows inflow rate when provided', () => {
    render(<SideStatsPanel state={{ ...baseState, inflowRate: 2.4 }} options={baseOptions} />);
    expect(screen.getByText('Inflow Rate')).toBeInTheDocument();
    expect(screen.getByText('2.4 mm/h')).toBeInTheDocument();
  });

  it('shows rain total when provided', () => {
    render(<SideStatsPanel state={{ ...baseState, rainTotal: 8.1 }} options={baseOptions} />);
    expect(screen.getByText('Rain Total')).toBeInTheDocument();
    expect(screen.getByText('8.1 mm')).toBeInTheDocument();
  });

  it('formats values in US units', () => {
    render(<SideStatsPanel
      state={{ ...baseState, temperature: 0, inflowRate: 25.4, rainTotal: 25.4 }}
      options={{ ...baseOptions, usUnits: true }}
    />);
    expect(screen.getByText('32.0°F')).toBeInTheDocument();
    expect(screen.getByText('1.00 in/h')).toBeInTheDocument();
    expect(screen.getByText('1.00 in')).toBeInTheDocument();
  });
});
