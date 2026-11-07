import { makeWojtek, camHill, camRoad, camTent, camDock, camDesk, camCassino, camBadge, camZoo } from './worlds/wojtek.js';
const NIGHT = { bloom: 1.2, bloomThreshold: 0.55, grade: { sat: 0.2, contrast: 0.12 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.16, contrast: 0.1 } };
export const SCENES = {
  hill: { build: makeWojtek('hill'), cam: camHill, focusRange: 3, ...NIGHT, bloom: 1.0 },
  road: { build: makeWojtek('road'), cam: camRoad, focusRange: 2.5, ...DAY },
  tent: { build: makeWojtek('tent'), cam: camTent, focusRange: 2.2, ...NIGHT },
  dock: { build: makeWojtek('dock'), cam: camDock, focusRange: 2.6, ...DAY },
  desk: { build: makeWojtek('desk'), cam: camDesk, focusRange: 0.8, ...NIGHT },
  cassino: { build: makeWojtek('cassino'), cam: camCassino, focusRange: 3, ...NIGHT },
  badge: { build: makeWojtek('badge'), cam: camBadge, focusRange: 1.4, ...DAY },
  zoo: { build: makeWojtek('zoo'), cam: camZoo, focusRange: 2.6, ...DAY },
};
