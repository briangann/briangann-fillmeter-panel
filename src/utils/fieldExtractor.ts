import { PanelData, Field } from '@grafana/data';
import { TankOptions, TankState } from '../types';

const LEVEL_KEYWORDS = ['level', 'volume', 'fill', 'percent', 'tank'];
const TEMP_KEYWORDS = ['temp', 'temperature'];
const INFLOW_KEYWORDS = ['inflow', 'rain_rate', 'rainrate', 'flow_in'];
const OUTFLOW_KEYWORDS = ['outflow', 'usage', 'flow_out', 'consumption'];
const RAIN_KEYWORDS = ['rain', 'rainfall', 'rain_total', 'precipitation'];

function findField(
  fields: Field[],
  explicitName: string,
  keywords: string[]
): Field | null {
  if (explicitName) {
    return fields.find((f) => f.name.toLowerCase() === explicitName.toLowerCase()) ?? null;
  }
  return (
    fields.find((f) =>
      keywords.some((kw) => f.name.toLowerCase().includes(kw))
    ) ?? null
  );
}

function fieldValue(field: Field | null): number | string | null {
  if (!field) {
    return null;
  }
  return field.values[0] ?? null;
}

function numericValue(field: Field | null): number | null {
  const v = fieldValue(field);
  if (v === null) {
    return null;
  }
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

export function extractTankState(data: PanelData, options: TankOptions): TankState {
  if (!data.series.length || data.series.every((s) => s.length === 0)) {
    return {
      levelPct: 0,
      rawVolume: null,
      temperature: null,
      inflowRate: null,
      inflowActive: false,
      outflowActive: false,
      rainTotal: null,
      hasData: false,
    };
  }

  const fields = data.series.flatMap((s) => s.fields);

  const levelField = findField(fields, options.levelField, LEVEL_KEYWORDS);
  const tempField = findField(fields, options.temperatureField, TEMP_KEYWORDS);
  const inflowField = findField(fields, options.inflowField, INFLOW_KEYWORDS);
  const outflowField = findField(fields, options.outflowField, OUTFLOW_KEYWORDS);
  const rainField = findField(fields, options.rainField, RAIN_KEYWORDS);

  const rawLevel = numericValue(levelField);
  const rawVolume = rawLevel;

  let levelPct = 0;
  if (rawLevel !== null) {
    if (options.maxVolume > 0) {
      levelPct = (rawLevel / options.maxVolume) * 100;
    } else {
      levelPct = rawLevel;
    }
    levelPct = Math.min(100, Math.max(0, levelPct));
  }

  const tempRaw = numericValue(tempField);
  let temperature: number | null = null;
  if (tempRaw !== null) {
    const unit = tempField?.config?.unit ?? tempField?.labels?.['unit'] ?? '°C';
    temperature = unit === '°F' ? ((tempRaw - 32) * 5) / 9 : tempRaw;
  }

  const inflowRate = numericValue(inflowField);
  const inflowActive = inflowRate !== null && inflowRate > 0;

  let outflowActive = false;
  const outflowRaw = fieldValue(outflowField);
  if (outflowRaw !== null) {
    const s = String(outflowRaw).toLowerCase().trim();
    outflowActive = s === 'on' || s === 'true' || s === 'active' || s === 'open' || parseFloat(s) > 0;
  }

  const rainTotal = numericValue(rainField);

  return {
    levelPct,
    rawVolume: options.maxVolume > 0 ? rawVolume : null,
    temperature,
    inflowRate,
    inflowActive,
    outflowActive,
    rainTotal,
    hasData: levelField !== null,
  };
}
