// Shot 1 (0.0 - 5.5 s): "In 2025, a town in Sweden put its church on wheels and drove it five kilometres across town."
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EffectComposer, RenderPass, EffectPass, DepthOfFieldEffect, VignetteEffect } from 'postprocessing';
import { church, transporter, house, lampPost, cone, signPost, ground, sky, mineMountain } from './lib/kit.js';
import { makePerson, PALETTES } from './lib/char.js';
import { cameraPath, wordTime } from './lib/camera.js';
import TIMES from './sentence_times.json';

const S1 = TIMES.sentences[0];
const SPOKEN = 'In twenty twenty-five, a town in Sweden put its church on wheels and drove it five kilometres across town.';
// Word times measured from the narrator audio (pause after "2025," at 1.00-1.12 s, stop before "put" at 2.34 s),
// later words placed by syllable count between 2.34 s and the sentence end.
export const BEATS = { church: 2.70, wheels: 3.06, five: 3.77, end: S1.end };

const RIG_X0 = -3.0, RIG_SPEED = 0.3; // m/s (slow, like the real move)
const rigX = (t) => RIG_X0 + RIG_SPEED * t;

// camera: wide high view -> crane down to the wheels on "wheels" -> settle on walkers and the 5 KM sign on "five"
const CAM = cameraPath([
  { t: 0.0, pos: [-13.0, 9.0, 23.5], look: [0.0, 7.0, 0.0] },          // wide: the church on its transporter
  { t: BEATS.wheels, pos: [-6.0, 1.25, 14.8], look: [-1.2, 0.9, 7.6] }, // crane down to the wheels
  { t: BEATS.five, pos: [-1.6, 1.45, 15.0], look: [5.6, 2.0, 9.4] },    // swing toward the road ahead: 5 KM sign
  { t: BEATS.end + 0.05, pos: [0.0, 1.45, 14.2], look: [7.0, 2.0, 9.4] }, // rest: walkers, wheels, road ahead
]);

// people walking beside the transporter (dx relative to the rig), and people watching
const WALKERS = [
  { dx: -10.2, z: 9.0, p: 0, seed: 3, phase: 0.0 },
  { dx: -7.6, z: 9.7, p: 1, seed: 5, phase: 1.3 },
  { dx: 4.4, z: 10.3, p: 2, seed: 7, phase: 2.1 },
  { dx: 6.2, z: 10.8, p: 1, seed: 11, phase: 0.6 },
  { dx: 0.8, z: 10.0, p: 5, seed: 13, phase: 2.8 },
];
const WATCHERS = [
  { x: 15.0, z: -11.6, p: 4, seed: 17, height: 1.66 },
  { x: 17.4, z: -11.9, p: 3, seed: 19, height: 1.3 },
  { x: 19.6, z: -11.5, p: 0, seed: 23 }, { x: -9.8, z: -12.0, p: 0, seed: 29 }, { x: -12.5, z: -11.6, p: 2, seed: 31 },
];

function buildWorld() {
  const root = new THREE.Group();
  root.add(sky()); root.add(ground());
  const mtn = mineMountain(); mtn.position.set(80, 0, -300); root.add(mtn);
  // background houses along the far side of the road
  const cols = ['#e2b955', '#a3392d', '#6f8f5a', '#ece4d2', '#7d93a3', '#d98b3a', '#a3392d', '#e2b955'];
  let x = -52;
  cols.concat(cols).forEach((c, i) => {
    const w = 7 + ((i * 37) % 4), h = 5.5 + ((i * 13) % 3);
    const hs = house({ w, h, d: 7, color: c, seed: 100 + i }); hs.position.set(x + w / 2, 0, -24 - ((i * 7) % 3)); root.add(hs); x += w + 3 + ((i * 11) % 3);
  });
  for (const lx of [-24, 24]) { const l = lampPost(); l.position.set(lx, 0, 12.8); l.rotation.y = Math.PI; root.add(l); }
  for (const lx of [-8, 18]) { const l = lampPost(); l.position.set(lx, 0, -12.6); root.add(l); }
  const sign = signPost(['NEW KIRUNA'], '5 KM'); sign.group.position.set(6.8, 0, 11.6); sign.group.rotation.y = -1.0; root.add(sign.group);
  const cones = [];
  for (const [cx, cz] of [[-10.4, 13.2], [-9.7, 13.8], [1.0, 12.6]]) { const c = cone(); c.position.set(cx, 0, cz); root.add(c); cones.push(c); }

  const rig = new THREE.Group(); root.add(rig);
  const tr = transporter(); rig.add(tr.group);
  const ch = church(); ch.position.y = tr.topY; rig.add(ch);

  const walkers = WALKERS.map((w) => { const p = makePerson({ ...PALETTES[w.p], seed: w.seed, phase: w.phase }); p.group.position.z = w.z; root.add(p.group); return { ...w, person: p }; });
  const watchers = WATCHERS.map((w) => { const p = makePerson({ ...PALETTES[w.p], seed: w.seed, height: w.height || 1.72, phase: w.seed }); p.group.position.set(w.x, 0, w.z); root.add(p.group); return p; });
  return { root, rig, wheels: tr.wheels, plaque: sign.plaque, walkers, watchers };
}

function lights(scene) {
  const hemi = new THREE.HemisphereLight('#d6e4ef', '#8c8a5c', 1.15); scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff0d4', 2.4);
  key.position.set(-38, 46, 34); key.target.position.set(0, 0, 4);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 160 });
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.03;
  scene.add(key); scene.add(key.target);
  scene.fog = new THREE.Fog('#e6dfcb', 48, 360);
}

export const Shot1Scene = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const frameRef = useRef(frame); frameRef.current = frame;
  const { gl, scene, camera, size } = useThree();
  const W = useMemo(() => { const w = buildWorld(); scene.add(w.root); lights(scene); return w; }, [scene]);
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType });
    composer.addPass(new RenderPass(scene, camera));
    const dof = new DepthOfFieldEffect(camera, { focusDistance: 12, focusRange: 7, bokehScale: 3.2, resolutionScale: 0.5 });
    dof.target = new THREE.Vector3();
    const vig = new VignetteEffect({ offset: 0.32, darkness: 0.38 });
    composer.addPass(new EffectPass(camera, dof, vig));
    return { composer, dof };
  }, [gl, scene, camera]);
  useEffect(() => { fx.composer.setSize(size.width, size.height); }, [fx, size]);

  useFrame(() => {
    const t = frameRef.current / fps;
    const c = CAM(t);
    camera.position.copy(c.pos); camera.lookAt(c.look); camera.updateMatrixWorld();
    fx.dof.target.copy(c.look);
    // transporter creeps forward, wheels turn
    W.rig.position.x = rigX(t);
    for (const wg of W.wheels) wg.rotation.z = -(RIG_SPEED * t) / 0.42;
    // walkers keep pace beside it
    for (const w of W.walkers) { w.person.group.position.x = rigX(t) + w.dx; w.person.update(t, camera.position, 0.9); }
    W.watchers.forEach((p) => p.update(t, camera.position, 0));
    // "5 KM" plaque pops in on the word "five"
    const k = THREE.MathUtils.clamp((t - BEATS.five) / 0.28, 0, 1);
    const back = k === 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
    W.plaque.scale.setScalar(Math.max(0.0001, back));
    fx.composer.render();
  }, 1);
  return null;
};
