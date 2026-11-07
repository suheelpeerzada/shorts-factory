import { makeHotel, camLobby, camManager, camKeys, camLift, camHall, camRoom, camReveal } from './worlds/hotel.js';
const NIGHT = { bloom: 1.15, bloomThreshold: 0.58, grade: { sat: 0.2, contrast: 0.12 } };
export const SCENES = {
  lobby: { build: makeHotel('lobby'), cam: camLobby, focusRange: 2.6, ...NIGHT },
  manager: { build: makeHotel('manager'), cam: camManager, focusRange: 2.0, ...NIGHT },
  keys: { build: makeHotel('keys'), cam: camKeys, focusRange: 1.6, ...NIGHT },
  lift: { build: makeHotel('lift'), cam: camLift, focusRange: 2.6, ...NIGHT },
  hall: { build: makeHotel('hall'), cam: camHall, focusRange: 2.6, ...NIGHT },
  room: { build: makeHotel('room'), cam: camRoom, focusRange: 1.4, ...NIGHT },
  reveal: { build: makeHotel('reveal'), cam: camReveal, focusRange: 2.2, ...NIGHT },
};
