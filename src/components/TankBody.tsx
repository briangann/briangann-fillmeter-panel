import React from 'react';
import { TANK } from '../utils/tankGeometry';

interface Props {
  uid: string;
}

export const TankBody: React.FC<Props> = ({ uid }) => {
  const { cx, rx, ry, topY, botY, bodyH } = TANK;
  return (
    <>
      {/* Back rim */}
      <path
        d={`M${cx - rx} ${topY} A${rx} ${ry} 0 0 1 ${cx + rx} ${topY}`}
        fill="var(--primary-text-color)"
        fillOpacity={0.06}
        stroke="var(--primary-text-color)"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Body */}
      <rect x={cx - rx} y={topY} width={rx * 2} height={bodyH} fill={`url(#cy-${uid})`} />
      <rect x={cx - rx} y={topY} width={5} height={bodyH} fill="white" fillOpacity={0.05} />
      {/* Left wall */}
      <line x1={cx - rx} y1={topY} x2={cx - rx} y2={botY} stroke="var(--primary-text-color)" strokeWidth={1.8} strokeOpacity={0.45} />
      {/* Right wall */}
      <line x1={cx + rx} y1={topY} x2={cx + rx} y2={botY} stroke="var(--primary-text-color)" strokeWidth={1.8} strokeOpacity={0.45} />
      {/* Bottom ellipse */}
      <path
        d={`M${cx - rx} ${botY} A${rx} ${ry} 0 0 0 ${cx + rx} ${botY}`}
        fill="var(--primary-text-color)"
        fillOpacity={0.08}
        stroke="var(--primary-text-color)"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Front rim */}
      <path
        d={`M${cx - rx} ${topY} A${rx} ${ry} 0 0 0 ${cx + rx} ${topY}`}
        fill="none"
        stroke="var(--primary-text-color)"
        strokeWidth={1.8}
        strokeOpacity={0.5}
      />
      {/* Inner rim highlight */}
      <path
        d={`M${cx - rx + 12} ${topY + ry * 0.55} A${rx - 12} ${ry * 0.35} 0 0 0 ${cx + rx - 12} ${topY + ry * 0.55}`}
        fill="none"
        stroke="white"
        strokeWidth={0.8}
        strokeOpacity={0.15}
      />
      {/* Level markers */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <line
          key={frac}
          x1={cx - rx + 3}
          y1={botY - bodyH * frac}
          x2={cx - rx + 11}
          y2={botY - bodyH * frac}
          stroke="var(--primary-text-color)"
          strokeWidth={0.5}
          strokeOpacity={0.25}
        />
      ))}
    </>
  );
};
