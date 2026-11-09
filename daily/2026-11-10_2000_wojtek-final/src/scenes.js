import { makeWojtek, camHill, camCarry, camDock, camCassino, camDriver, camTent, camZoo, camBadge } from './worlds/wojtekfinal.js';
const NIGHT = { bloom: 1.2, bloomThreshold: 0.55, grade: { sat: 0.2, contrast: 0.12 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.16, contrast: 0.1 } };
export const SCENES = {
  hill: { build: makeWojtek('hill'), cam: camHill, focusRange: 3, ...NIGHT, bloom: 1.0 },
  dock: { build: makeWojtek('dock'), cam: camDock, focusRange: 2.6, ...DAY },
  cassino: { build: makeWojtek('cassino'), cam: camCassino, focusRange: 3, ...NIGHT },
  driver: { build: makeWojtek('driver'), cam: camDriver, focusRange: 2.2, ...NIGHT },
  carry: { build: makeWojtek('carry'), cam: camCarry, focusRange: 3, ...NIGHT, bloom: 1.0 },
  tent: { build: makeWojtek('tent'), cam: camTent, focusRange: 2.2, ...NIGHT },
  zoo: { build: makeWojtek('zoo'), cam: camZoo, focusRange: 2.6, ...DAY },
  badge: { build: makeWojtek('badge'), cam: camBadge, focusRange: 1.4, ...DAY },
};
