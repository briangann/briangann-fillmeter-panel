import { PanelPlugin } from '@grafana/data';
import { TankOptions } from './types';
import { WaterTankPanel } from './WaterTankPanel';

export const plugin = new PanelPlugin<TankOptions>(WaterTankPanel).setPanelOptions((builder) => {
  return builder
    .addRadio({
      path: 'layout',
      name: 'Layout style',
      defaultValue: 'adaptive',
      settings: {
        options: [
          { value: 'fill', label: 'Fill' },
          { value: 'side-stats', label: 'Side Stats' },
          { value: 'adaptive', label: 'Adaptive' },
        ],
      },
      category: ['Layout'],
    })
    .addTextInput({
      path: 'levelField',
      name: 'Level field',
      description: 'Field name for water level (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'temperatureField',
      name: 'Temperature field',
      description: 'Field name for temperature (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'inflowField',
      name: 'Inflow field',
      description: 'Field name for inflow rate (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'outflowField',
      name: 'Outflow field',
      description: 'Field name for outflow status (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addTextInput({
      path: 'rainField',
      name: 'Rain total field',
      description: 'Field name for rain total (empty = auto-detect)',
      defaultValue: '',
      category: ['Data Fields'],
    })
    .addNumberInput({
      path: 'maxVolume',
      name: 'Max volume',
      description: 'Maximum volume (0 = level field is already a percentage)',
      defaultValue: 0,
      category: ['Volume'],
    })
    .addBooleanSwitch({
      path: 'usUnits',
      name: 'US units',
      description: 'Display temperature in °F and rain in inches',
      defaultValue: false,
      category: ['Volume'],
    })
    .addNumberInput({
      path: 'warningTempThreshold',
      name: 'High temp warning (°C)',
      defaultValue: 20,
      category: ['Thresholds'],
    })
    .addNumberInput({
      path: 'lowLevelThreshold',
      name: 'Low level alert (%)',
      defaultValue: 10,
      category: ['Thresholds'],
    });
});
