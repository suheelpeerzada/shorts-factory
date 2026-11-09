import * as THREE from 'three';

// T = beat times per path key; returns path position 0..1 (monotone cubic, zero speed at first and last key)
export function warpU(T, t) {
  const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push((2 * sec[i - 1] * sec[i]) / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++;
  const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1];
}

// keys: [{t, pos:[x,y,z], look:[x,y,z]}]. Path passes through every key; timing comes from warpU.
export function cameraPath(keys) {
  const T = keys.map((k) => k.t);
  const P = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal');
  const L = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal');
  return (t) => { const u = warpU(T, t); return { pos: P.getPoint(u), look: L.getPoint(u), u }; };
}

// word time inside a sentence, by syllable proportion (used until word-level timestamps exist)
export function wordTime(sentence, wordIndex, start, end, leadIn = 0) {
  const syl = (w) => Math.max(1, (w.toLowerCase().replace(/[^a-z0-9]/g, '').match(/[aeiouy]+/g) || []).length);
  const words = sentence.split(/\s+/); const tot = words.reduce((a, w) => a + syl(w), 0);
  let acc = 0; for (let i = 0; i < wordIndex; i++) acc += syl(words[i]);
  return start + leadIn + (end - start - leadIn) * (acc / tot);
}
