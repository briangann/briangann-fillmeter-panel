export type LayoutMode = 'fill' | 'side-stats' | 'adaptive';

export interface TankOptions {
  layout: LayoutMode;
  levelField: string;
  temperatureField: string;
  inflowField: string;
  outflowField: string;
  rainField: string;
  maxVolume: number;
  warningTempThreshold: number;
  lowLevelThreshold: number;
  usUnits: boolean;
}

export interface TankState {
  levelPct: number;
  rawVolume: number | null;
  temperature: number | null;
  inflowRate: number | null;
  inflowActive: boolean;
  outflowActive: boolean;
  rainTotal: number | null;
  hasData: boolean;
}
