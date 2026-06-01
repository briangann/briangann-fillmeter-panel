// src/components/BubbleLayer.tsx
import React from 'react';
import { css } from '@emotion/css';
import { TANK } from '../utils/tankGeometry';
import { riseAnim } from '../utils/animations';

const baseCls = css`animation: ${riseAnim} 4s ease-in infinite;`;
const b2Cls = css`animation: ${riseAnim} 3.5s ease-in 1s infinite;`;
const b3Cls = css`animation: ${riseAnim} 5s ease-in 2.2s infinite;`;
const b4Cls = css`animation: ${riseAnim} 3s ease-in 0.5s infinite;`;

interface Props {
  active: boolean;
}

export const BubbleLayer: React.FC<Props> = ({ active }) => {
  if (!active) {
    return null;
  }

  const { cx, botY } = TANK;

  return (
    <>
      <circle className={baseCls} cx={cx - 16} cy={botY - 15} r={2} fill="white" opacity={0.3} />
      <circle className={b2Cls} cx={cx + 12} cy={botY - 10} r={1.5} fill="white" opacity={0.25} />
      <circle className={b3Cls} cx={cx + 24} cy={botY - 22} r={2.2} fill="white" opacity={0.2} />
      <circle className={b4Cls} cx={cx - 6} cy={botY - 8} r={1.8} fill="white" opacity={0.28} />
    </>
  );
};
