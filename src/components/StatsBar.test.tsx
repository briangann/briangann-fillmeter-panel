import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsBar } from './StatsBar';
import { TankState, TankOptions } from '../types';

const baseOptions: TankOptions = {
  layout: 'adaptive', levelField: '', temperatureField: '', inflowField: '',
  outflowField: '', rainField: '', maxVolume: 0, warningTempThreshold: 20,
  lowLevelThreshold: 10, usUnits: false,
};

const baseState: TankState = {
  levelPct: 74, rawVolume: null, temperature: null, inflowRate: null,
  inflowActive: false, outflowActive: false, rainTotal: null, hasData: true,
};

describe('StatsBar', () => {
  it('renders nothing when all optional fields are null', () => {
    const { container } = render(<StatsBar state={baseState} options={baseOptions} />);
    expect(container.textContent).toBe('');
  });

  it('shows temperature in metric', () => {
    render(<StatsBar state={{ ...baseState, temperature: 18.5 }} options={baseOptions} />);
    expect(screen.getByText('18.5°C')).toBeInTheDocument();
    expect(screen.getByText('Temp')).toBeInTheDocument();
  });

  it('shows temperature in US units', () => {
    render(<StatsBar state={{ ...baseState, temperature: 0 }} options={{ ...baseOptions, usUnits: true }} />);
    expect(screen.getByText('32.0°F')).toBeInTheDocument();
  });

  it('shows rain total', () => {
    render(<StatsBar state={{ ...baseState, rainTotal: 12.3 }} options={baseOptions} />);
    expect(screen.getByText('12.3 mm')).toBeInTheDocument();
    expect(screen.getByText('Rain')).toBeInTheDocument();
  });

  it('shows inflow rate', () => {
    render(<StatsBar state={{ ...baseState, inflowRate: 2.4, inflowActive: true }} options={baseOptions} />);
    expect(screen.getByText('2.4 mm/h')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
  });

  it('shows all three stats simultaneously', () => {
    render(<StatsBar
      state={{ ...baseState, temperature: 18.5, inflowRate: 2.4, inflowActive: true, rainTotal: 12.3 }}
      options={baseOptions}
    />);
    expect(screen.getByText('18.5°C')).toBeInTheDocument();
    expect(screen.getByText('12.3 mm')).toBeInTheDocument();
    expect(screen.getByText('2.4 mm/h')).toBeInTheDocument();
  });
});
