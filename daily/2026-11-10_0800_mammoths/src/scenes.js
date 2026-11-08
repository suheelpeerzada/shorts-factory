import { makeMammoth, camHook, camGiza, camShout, camNorth, camIsland, camLab, camTimeline, camSnow } from './worlds/mammoth.js';
const NIGHT = { bloom: 1.25, bloomThreshold: 0.55, grade: { sat: 0.18, contrast: 0.08 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.12, contrast: 0.06 } };
const DUSK = { bloom: 0.8, bloomThreshold: 0.7, grade: { sat: 0.16, contrast: 0.08 } };
export const SCENES = {
  hook: { build: makeMammoth('hook'), cam: camHook, focusRange: 8, ...DUSK },
  giza: { build: makeMammoth('giza'), cam: camGiza, focusRange: 6, ...DAY },
  shout: { build: makeMammoth('shout'), cam: camShout, focusRange: 2.4, ...DAY },
  north: { build: makeMammoth('north'), cam: camNorth, focusRange: 5, ...DAY },
  island: { build: makeMammoth('island'), cam: camIsland, focusRange: 10, ...DAY },
  lab: { build: makeMammoth('lab'), cam: camLab, focusRange: 2.2, ...NIGHT, bloom: 0.9 },
  timeline: { build: makeMammoth('timeline'), cam: camTimeline, focusRange: 3, ...DAY },
  snow: { build: makeMammoth('snow'), cam: camSnow, focusRange: 5, ...NIGHT },
};
