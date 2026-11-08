import { makeCane, camCrate, camSwarm, camField, camDock, camRelease, camPond, camMap, camFarmer, camStalk } from './worlds/cane.js';
const NIGHT = { bloom: 1.25, bloomThreshold: 0.55, grade: { sat: 0.18, contrast: 0.08 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.12, contrast: 0.06 } };
const DUSK = { bloom: 0.8, bloomThreshold: 0.7, grade: { sat: 0.16, contrast: 0.08 } };
export const SCENES = {
  crate: { build: makeCane('crate'), cam: camCrate, focusRange: 2.2, ...DAY },
  swarm: { build: makeCane('swarm'), cam: camSwarm, focusRange: 3, ...NIGHT },
  field: { build: makeCane('field'), cam: camField, focusRange: 1.4, ...DUSK },
  dock: { build: makeCane('dock'), cam: camDock, focusRange: 3, ...DAY },
  release: { build: makeCane('release'), cam: camRelease, focusRange: 3, ...DAY },
  pond: { build: makeCane('pond'), cam: camPond, focusRange: 2, ...DUSK },
  map: { build: makeCane('map'), cam: camMap, focusRange: 1.6, ...NIGHT },
  farmer: { build: makeCane('farmer'), cam: camFarmer, focusRange: 2.4, ...DUSK },
  stalk: { build: makeCane('stalk'), cam: camStalk, focusRange: 2, ...DUSK },
};
