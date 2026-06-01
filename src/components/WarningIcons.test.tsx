import React from 'react';
import { render, screen } from '@testing-library/react';
import { WarningIcons } from './WarningIcons';

describe('WarningIcons', () => {
  it('renders nothing when no warnings', () => {
    const { container } = render(
      <WarningIcons temperature={15} levelPct={50} warningTempThreshold={20} lowLevelThreshold={10} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when temperature is null and level is normal', () => {
    const { container } = render(
      <WarningIcons temperature={null} levelPct={50} warningTempThreshold={20} lowLevelThreshold={10} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders temp warning when temperature exceeds threshold', () => {
    render(
      <WarningIcons temperature={25} levelPct={50} warningTempThreshold={20} lowLevelThreshold={10} />
    );
    expect(screen.getByTestId('fillmeter-warning-temp')).toBeInTheDocument();
    expect(screen.queryByTestId('fillmeter-warning-low')).not.toBeInTheDocument();
  });

  it('renders low level warning when levelPct at threshold', () => {
    render(
      <WarningIcons temperature={15} levelPct={10} warningTempThreshold={20} lowLevelThreshold={10} />
    );
    expect(screen.getByTestId('fillmeter-warning-low')).toBeInTheDocument();
    expect(screen.queryByTestId('fillmeter-warning-temp')).not.toBeInTheDocument();
  });

  it('renders both warnings simultaneously', () => {
    render(
      <WarningIcons temperature={25} levelPct={5} warningTempThreshold={20} lowLevelThreshold={10} />
    );
    expect(screen.getByTestId('fillmeter-warning-temp')).toBeInTheDocument();
    expect(screen.getByTestId('fillmeter-warning-low')).toBeInTheDocument();
  });

  it('does not trigger temp warning at exactly the threshold', () => {
    const { container } = render(
      <WarningIcons temperature={20} levelPct={50} warningTempThreshold={20} lowLevelThreshold={10} />
    );
    expect(container.firstChild).toBeNull();
  });
});
