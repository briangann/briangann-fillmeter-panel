import { keyframes } from '@emotion/css';

export const wobbleAnim = keyframes`
  0%, 100% { transform: scaleX(0.97); }
  50% { transform: scaleX(1.02); }
`;

export const riseAnim = keyframes`
  0% { transform: translateY(0); opacity: 0.3; }
  50% { opacity: 0.15; }
  100% { transform: translateY(-70px); opacity: 0; }
`;

export const flowDashAnim = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -14; }
`;

export const outDashAnim = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -10; }
`;

export const splashOutAnim = keyframes`
  0% { transform: translate(0,0) scale(1); opacity: 0.7; }
  50% { transform: translate(0,-8px) scale(1.3); opacity: 0.3; }
  100% { transform: translate(0,-3px) scale(0.4); opacity: 0; }
`;

export const dripFallAnim = keyframes`
  0% { transform: translateY(0); opacity: 0.8; }
  50% { opacity: 0.5; }
  100% { transform: translateY(20px); opacity: 0; }
`;

export const pulseAnim = keyframes`
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
`;

export const pulseIconAnim = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;
