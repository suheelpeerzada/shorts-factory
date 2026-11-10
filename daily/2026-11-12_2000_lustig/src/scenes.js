import { makeLustig, camHook, camParis, camDesk, camHotel, camCouple, camDeal, camShame, camTower } from './worlds/lustig.js';
const NIGHT = { bloom: 1.2, bloomThreshold: 0.55, grade: { sat: 0.2, contrast: 0.12 } };
const DUSK = { bloom: 1.0, bloomThreshold: 0.6, grade: { sat: 0.2, contrast: 0.1 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.16, contrast: 0.1 } };
const ROOM = { bloom: 0.8, bloomThreshold: 0.7, grade: { sat: 0.18, contrast: 0.12 } };
export const SCENES = {
  hook: { build: makeLustig('hook'), cam: camHook, focusRange: 5, ...DUSK },
  paris: { build: makeLustig('paris'), cam: camParis, focusRange: 14, ...DAY },
  desk: { build: makeLustig('desk'), cam: camDesk, focusRange: 1.8, ...ROOM },
  hotel: { build: makeLustig('hotel'), cam: camHotel, focusRange: 3, ...ROOM },
  couple: { build: makeLustig('couple'), cam: camCouple, focusRange: 2.6, ...DUSK },
  deal: { build: makeLustig('deal'), cam: camDeal, focusRange: 3, ...DAY },
  shame: { build: makeLustig('shame'), cam: camShame, focusRange: 2, ...ROOM },
  tower: { build: makeLustig('tower'), cam: camTower, focusRange: 5, ...NIGHT },
};
