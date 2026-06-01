import { extractTankState } from './fieldExtractor';
import { PanelData, FieldType, toDataFrame, LoadingState } from '@grafana/data';
import { TankOptions } from '../types';

const defaultOptions: TankOptions = {
  layout: 'adaptive',
  levelField: '',
  temperatureField: '',
  inflowField: '',
  outflowField: '',
  rainField: '',
  maxVolume: 0,
  warningTempThreshold: 20,
  lowLevelThreshold: 10,
  usUnits: false,
};

function makeData(fields: Array<{ name: string; values: number[] | string[] }>): PanelData {
  return {
    state: LoadingState.Done,
    series: [
      toDataFrame({
        fields: fields.map((f) => ({
          name: f.name,
          type: typeof f.values[0] === 'string' ? FieldType.string : FieldType.number,
          values: f.values,
        })),
      }),
    ],
    timeRange: {} as any,
  };
}

describe('extractTankState', () => {
  it('returns hasData=false with no series', () => {
    const state = extractTankState({ series: [], state: LoadingState.Done, timeRange: {} as any }, defaultOptions);
    expect(state.hasData).toBe(false);
  });

  it('auto-detects level field by name "level"', () => {
    const data = makeData([{ name: 'level', values: [75] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.hasData).toBe(true);
    expect(state.levelPct).toBe(75);
  });

  it('uses explicit levelField option over auto-detect', () => {
    const data = makeData([{ name: 'fill', values: [60] }]);
    const state = extractTankState(data, { ...defaultOptions, levelField: 'fill' });
    expect(state.levelPct).toBe(60);
  });

  it('converts raw volume to % using maxVolume', () => {
    const data = makeData([{ name: 'volume', values: [500] }]);
    const state = extractTankState(data, { ...defaultOptions, maxVolume: 1000 });
    expect(state.levelPct).toBeCloseTo(50);
    expect(state.rawVolume).toBe(500);
  });

  it('clamps levelPct to 0–100', () => {
    const data = makeData([{ name: 'level', values: [150] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.levelPct).toBe(100);
  });

  it('auto-detects temperature field', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'temperature', values: [18] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.temperature).toBe(18);
  });

  it('detects outflowActive from string "on"', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'outflow', values: ['on'] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.outflowActive).toBe(true);
  });

  it('detects outflowActive from numeric > 0', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'outflow', values: [1.5] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.outflowActive).toBe(true);
  });

  it('detects inflowActive when inflowRate > 0', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'inflow', values: [2.4] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.inflowActive).toBe(true);
    expect(state.inflowRate).toBe(2.4);
  });

  it('returns null for explicit field name that does not match any field', () => {
    const data = makeData([{ name: 'level', values: [50] }]);
    const state = extractTankState(data, { ...defaultOptions, temperatureField: 'nonexistent' });
    expect(state.temperature).toBeNull();
  });

  it('returns null temperature when field has no value', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'temperature', values: [] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.temperature).toBeNull();
  });

  it('returns null for non-numeric field value', () => {
    const data = makeData([{ name: 'level', values: ['not-a-number'] }]);
    const state = extractTankState(data, defaultOptions);
    expect(state.levelPct).toBe(0);
  });

  it('converts Fahrenheit temperature to Celsius', () => {
    const data = makeData([{ name: 'level', values: [50] }, { name: 'temperature', values: [32] }]);
    // Patch field config unit to °F
    const frame = data.series[0];
    const tempField = frame.fields.find((f) => f.name === 'temperature')!;
    tempField.config = { unit: '°F' };
    const state = extractTankState(data, defaultOptions);
    expect(state.temperature).toBeCloseTo(0); // 32°F = 0°C
  });
});
