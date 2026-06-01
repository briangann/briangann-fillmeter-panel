import { formatTemperature, formatInflowRate, formatRain } from './unitConversions';
import { TankOptions } from '../types';

const metric: TankOptions = {
  layout: 'adaptive', levelField: '', temperatureField: '', inflowField: '',
  outflowField: '', rainField: '', maxVolume: 0, warningTempThreshold: 20,
  lowLevelThreshold: 10, usUnits: false,
};
const us: TankOptions = { ...metric, usUnits: true };

describe('formatTemperature', () => {
  it('formats metric °C', () => {
    expect(formatTemperature(18.5, metric)).toBe('18.5°C');
  });
  it('formats US °F (0°C = 32°F)', () => {
    expect(formatTemperature(0, us)).toBe('32.0°F');
  });
  it('formats US °F (100°C = 212°F)', () => {
    expect(formatTemperature(100, us)).toBe('212.0°F');
  });
});

describe('formatInflowRate', () => {
  it('formats metric mm/h', () => {
    expect(formatInflowRate(2.4, metric)).toBe('2.4 mm/h');
  });
  it('formats US in/h', () => {
    expect(formatInflowRate(25.4, us)).toBe('1.00 in/h');
  });
});

describe('formatRain', () => {
  it('formats metric mm', () => {
    expect(formatRain(12.3, metric)).toBe('12.3 mm');
  });
  it('formats US inches', () => {
    expect(formatRain(25.4, us)).toBe('1.00 in');
  });
});
