import { makeViolet, camHook, camOlympic, camTitanic, camLifeboat, camBritannic, camCabin } from './worlds/violet.js';
const NIGHT = { bloom: 1.2, bloomThreshold: 0.55, grade: { sat: 0.2, contrast: 0.12 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.16, contrast: 0.1 } };
export const SCENES = {
  hook: { build: makeViolet('hook'), cam: camHook, focusRange: 4, ...NIGHT },
  olympic: { build: makeViolet('olympic'), cam: camOlympic, focusRange: 14, ...DAY },
  titanic: { build: makeViolet('titanic'), cam: camTitanic, focusRange: 3, ...NIGHT },
  lifeboat: { build: makeViolet('lifeboat'), cam: camLifeboat, focusRange: 2.4, ...NIGHT },
  britannic: { build: makeViolet('britannic'), cam: camBritannic, focusRange: 12, ...DAY },
  cabin: { build: makeViolet('cabin'), cam: camCabin, focusRange: 2.2, ...NIGHT, bloom: 0.5, bloomThreshold: 0.75 },
};
