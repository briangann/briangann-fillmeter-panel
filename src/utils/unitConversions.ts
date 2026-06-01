// src/utils/unitConversions.ts
import { TankOptions } from '../types';

export function formatTemperature(tempC: number, options: TankOptions): string {
  return options.usUnits
    ? ((tempC * 9) / 5 + 32).toFixed(1) + '°F'
    : tempC.toFixed(1) + '°C';
}

export function formatInflowRate(mmPerHour: number, options: TankOptions): string {
  return options.usUnits
    ? (mmPerHour * 0.0393701).toFixed(2) + ' in/h'
    : mmPerHour.toFixed(1) + ' mm/h';
}

export function formatRain(mm: number, options: TankOptions): string {
  return options.usUnits
    ? (mm * 0.0393701).toFixed(2) + ' in'
    : mm.toFixed(1) + ' mm';
}
