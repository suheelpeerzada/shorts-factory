import { makeElevator, camCar, camPanel, camLobby, camNight, camClimb, camBricks, camLever, camOpen } from './worlds/elevator.js';
const NIGHT = { bloom: 1.25, bloomThreshold: 0.55, grade: { sat: 0.2, contrast: 0.14 } };
export const SCENES = {
  car: { build: makeElevator('car'), cam: camCar, focusRange: 1.2, ...NIGHT },
  panel: { build: makeElevator('panel'), cam: camPanel, focusRange: 0.6, ...NIGHT },
  lobby: { build: makeElevator('lobby'), cam: camLobby, focusRange: 2.2, ...NIGHT },
  night: { build: makeElevator('night'), cam: camNight, focusRange: 1.2, ...NIGHT },
  climb: { build: makeElevator('climb'), cam: camClimb, focusRange: 1.2, ...NIGHT },
  bricks: { build: makeElevator('bricks'), cam: camBricks, focusRange: 1.0, ...NIGHT },
  lever: { build: makeElevator('lever'), cam: camLever, focusRange: 1.0, ...NIGHT },
  open: { build: makeElevator('open'), cam: camOpen, focusRange: 1.0, ...NIGHT },
};
