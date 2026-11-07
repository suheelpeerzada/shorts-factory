import { makeFerry, camPier, camCaptain, camBoard, camFog, camArrive, camCabin, camStuck } from './worlds/ferry.js';
const NIGHT = { bloom: 1.25, bloomThreshold: 0.55, grade: { sat: 0.2, contrast: 0.12 } };
export const SCENES = {
  pier: { build: makeFerry('pier'), cam: camPier, focusRange: 3, ...NIGHT },
  captain: { build: makeFerry('captain'), cam: camCaptain, focusRange: 2.2, ...NIGHT },
  board: { build: makeFerry('board'), cam: camBoard, focusRange: 3, ...NIGHT },
  fog: { build: makeFerry('fog'), cam: camFog, focusRange: 5, ...NIGHT },
  arrive: { build: makeFerry('arrive'), cam: camArrive, focusRange: 3, ...NIGHT },
  cabin: { build: makeFerry('cabin'), cam: camCabin, focusRange: 1.2, ...NIGHT },
  stuck: { build: makeFerry('stuck'), cam: camStuck, focusRange: 2.5, ...NIGHT },
};
