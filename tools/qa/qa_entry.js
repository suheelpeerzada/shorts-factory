import * as THREE from 'three';
import { SCENES } from 'VIDEO/src/scenes.js';
import { LOCS, WORDS, DURATION } from 'VIDEO/src/times.js';
const errs = []; const log = [];
for (const [a, b, id] of LOCS) {
  const S = SCENES[id];
  try {
    const scene = new THREE.Scene(); const W = S.build(scene); scene.add(W.root);
    const cam = new THREE.PerspectiveCamera(80, 1080 / 1920, 0.1, 1200);
    let n = 0;
    for (let t = a; t < b; t += 1 / 6) { const c = S.cam(t); if (!c.pos || !c.look || isNaN(c.pos.x) || isNaN(c.look.y)) throw new Error('bad cam at ' + t); cam.position.copy(c.pos); cam.lookAt(c.look); cam.updateMatrixWorld(); W.update(t, cam); n++; }
    let tris = 0; scene.traverse((o) => { if (o.isMesh && o.geometry) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
    let lights = 0; scene.traverse((o) => { if (o.isLight) lights++; });
    log.push(`${id} ok (${n} steps, ${Math.round(tris / 1000)}k tris, ${lights} lights)`);
  } catch (e) { errs.push(`${id}: ${e.message}\n${(e.stack || '').split('\n').slice(0, 3).join('\n')}`); }
}
window.QA = { log, errs };
