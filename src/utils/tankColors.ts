export interface WaterColors {
  top: string;
  mid: string;
  deep: string;
}

const CYAN: WaterColors = { top: '#22d3ee', mid: '#0284c7', deep: '#0c4a6e' };
const ORANGE: WaterColors = { top: '#fb923c', mid: '#ea580c', deep: '#7c2d12' };

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function waterColors(tempC: number | null, warningThreshold: number): WaterColors {
  if (tempC === null || tempC <= 15) {
    return CYAN;
  }
  if (tempC >= warningThreshold) {
    return ORANGE;
  }
  const r = Math.max(0, Math.min(1, (tempC - 15) / (warningThreshold - 10)));
  return {
    top: `rgb(${lerp(34, 251, r)},${lerp(211, 146, r)},${lerp(238, 60, r)})`,
    mid: `rgb(${lerp(2, 234, r)},${lerp(132, 88, r)},${lerp(199, 12, r)})`,
    deep: `rgb(${lerp(12, 124, r)},${lerp(74, 45, r)},${lerp(110, 18, r)})`,
  };
}
