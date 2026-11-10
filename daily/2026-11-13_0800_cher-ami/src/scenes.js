import { makeCherAmi, camHook, camForest, camShelling, camMajor, camFlight, camHq, camRescue, camMuseum } from './worlds/cherami.js';
const BATTLE = { bloom: 1.1, bloomThreshold: 0.6, grade: { sat: 0.18, contrast: 0.12 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.16, contrast: 0.1 } };
const ROOM = { bloom: 0.8, bloomThreshold: 0.7, grade: { sat: 0.18, contrast: 0.12 } };
export const SCENES = {
  hook: { build: makeCherAmi('hook'), cam: camHook, focusRange: 2.5, ...BATTLE },
  forest: { build: makeCherAmi('forest'), cam: camForest, focusRange: 5, ...BATTLE },
  shelling: { build: makeCherAmi('shelling'), cam: camShelling, focusRange: 6, ...BATTLE },
  major: { build: makeCherAmi('major'), cam: camMajor, focusRange: 2.2, ...BATTLE },
  flight: { build: makeCherAmi('flight'), cam: camFlight, focusRange: 3, ...BATTLE },
  hq: { build: makeCherAmi('hq'), cam: camHq, focusRange: 2, ...ROOM },
  rescue: { build: makeCherAmi('rescue'), cam: camRescue, focusRange: 4, ...DAY },
  museum: { build: makeCherAmi('museum'), cam: camMuseum, focusRange: 2, ...DAY },
};
