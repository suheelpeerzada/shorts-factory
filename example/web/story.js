// "Napoleon vs. the Rabbits": shots, cameras, world state and actors, all pure functions of the frame (30 fps).
import { GENERAL, CHIEF, hunter, beater, FARMER } from "./cast.js";

export const TOTAL = 1223;
// word frames (voice): rabbits 125, rabbit hunt 325, celebrate 350, released 438, ready 508, stepped 543, charged 601,
// Not 637, Straight 676, drove 733, whips 760, split 799, came 822, sides 847, swarmed 878, legs 899, retreated 933,
// carriage 959, wild 1027, bought 1070, farmers 1084, feared 1139, cabbage 1195
export const SHOTS = [
  { a: 0, b: 74, light: "day" },        // 1 MCU general: conquered half of Europe
  { a: 74, b: 160, light: "day" },      // 2 then he lost a battle to rabbits
  { a: 160, b: 212, light: "day" },     // 3 1807 estate wide (flash)
  { a: 212, b: 388, light: "day" },     // 4 chief of staff plans the hunt
  { a: 388, b: 486, light: "day" },     // 5 crates open, rabbits released
  { a: 486, b: 526, light: "day" },     // 6 guns ready
  { a: 526, b: 580, light: "day" },     // 7 emperor steps out
  { a: 580, b: 632, light: "gold" },    // 8 rabbits charge
  { a: 632, b: 722, light: "gold" },    // 9 not away, straight at him
  { a: 722, b: 781, light: "gold" },    // 10 whips
  { a: 781, b: 858, light: "gold" },    // 11 flank from the sides
  { a: 858, b: 992, light: "gold" },    // 12 swarm legs -> carriage
  { a: 992, b: 1112, light: "night", place: "farm" }, // 13 tame rabbits bought from farmers (flash)
  { a: 1112, b: 1223, light: "gold" },  // 14 cabbage payoff (flash)
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
const idx = (f) => SHOTS.indexOf(shotAt(f)) + 1;
const FLASHES = [160, 992, 1112];
export const flashAt = (f) => { for (const a of FLASHES) { const k = f - a; if (k >= 0 && k < 6) return [0.9, 0.7, 0.5, 0.32, 0.16, 0.05][k]; } return 0; };

// ---------- motion helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };
const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, t) => a + (b - a) * t;
const L3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const prog = (f, a, b) => clamp((f - a) / (b - a));
const back = (x, s = 1.7) => { x = clamp(x); const c = s + 1; return 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const blinkAt = (f, seed) => ((f + Math.floor(seed * 37)) % 97 < 3 ? 1 : 0);
const bob = (f, seed, amt = 1) => Math.sin(f * 0.11 + seed) * 1.2 * amt;

/** keys: [frame, pos, tgt, fov, roll]; smootherstep between keys, plus a slow creep so holds never freeze */
const camKeys = (keys, f, ease = ss) => {
  let k = 0; while (k < keys.length - 2 && f > keys[k + 1][0]) k++;
  const A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)], t = B[0] === A[0] ? 1 : ease(prog(f, A[0], B[0]));
  const creep = Math.sin(f * 0.031) * 0.025;
  const pos = L3(A[1], B[1], t); pos[0] += creep; pos[1] += Math.sin(f * 0.023) * 0.012;
  return { pos, tgt: L3(A[2], B[2], t), fov: lerp(A[3], B[3], t), roll: lerp(A[4] || 0, B[4] || 0, t) };
};
const shake = (f, at, amp = 0.05, len = 8) => { const k = f - at; if (k < 0 || k > len) return 0; return Math.sin(k * 2.6) * amp * (1 - k / len); };

// general home spot
const GX = 0, GZ = 8;

export const camAt = (f) => {
  const s = idx(f);
  let c;
  switch (s) {
    case 1: c = camKeys([[0, [0.25, 1.6, 10.3], [0, 1.58, 8], 40], [74, [0.1, 1.62, 9.75], [0, 1.6, 8], 38]], f); break;
    case 2: c = camKeys([[74, [1.3, 1.05, 12.6], [0.2, 1.0, 8], 40], [118, [1.0, 0.95, 12.0], [0.35, 0.85, 8.2], 40], [160, [0.8, 0.85, 11.3], [0.4, 0.75, 8.3], 38]], f); break;
    case 3: c = camKeys([[160, [-12, 3.2, 22], [-2, 2.5, -20], 44], [212, [-8, 4.0, 19], [-1, 3, -20], 42]], f); break;
    case 4: c = camKeys([[212, [1.0, 1.55, 13.0], [0, 1.35, 7.8], 40], [330, [0.2, 1.5, 12.6], [0, 1.4, 7.8], 40], [388, [-0.4, 1.55, 12.2], [-0.1, 1.45, 7.8], 38]], f); break;
    case 5: c = camKeys([[388, [0, 3.4, -1.5], [0, 0.3, -12.5], 46], [440, [0, 3.0, -2.8], [0, 0.3, -12.5], 46], [486, [0, 2.8, -4.2], [0, 0.3, -11], 46]], f); break;
    case 6: c = camKeys([[486, [-2.6, 1.5, 14.0], [-2.0, 1.3, 9], 42], [526, [1.4, 1.5, 14.0], [2.0, 1.3, 9], 42]], f); break;
    case 7: { const gx = genWalkX(f); c = camKeys([[526, [-1.6, 0.7, 12.2], [-1.8, 1.45, 8], 42], [580, [0.2, 0.7, 11.8], [-0.1, 1.5, 8], 42]], f); c.tgt[0] = lerp(c.tgt[0], gx, 0.6); break; }
    case 8: c = camKeys([[580, [0, 0.55, 7.2], [0, 0.35, 0], 42, 0], [601, [0, 0.5, 6.8], [0, 0.32, 0], 40, 0.02], [632, [0, 0.42, 6.0], [0, 0.3, 0], 36, 0.05]], f, eo); break;
    case 9: c = camKeys([[632, [2.0, 1.4, 11.2], [-0.5, 1.1, 8], 40], [676, [1.7, 1.35, 10.8], [-0.6, 1.0, 8], 40], [722, [1.5, 1.4, 10.4], [-0.4, 1.2, 8], 38, -0.03]], f); break;
    case 10: c = camKeys([[722, [-1.2, 1.35, 1.2], [-1.0, 1.0, 6], 40], [781, [-0.6, 1.3, 1.8], [-0.8, 1.0, 6], 40]], f); break;
    case 11: c = camKeys([[781, [0, 12, 17.5], [0, 0, 6], 42], [858, [0, 9.5, 15.5], [0, 0, 6.5], 42]], f); break;
    case 12: {
      c = camKeys([[858, [0.8, 1.3, 12.8], [0.4, 0.9, 8], 40], [930, [1.1, 1.25, 12.6], [0.7, 0.95, 8], 40], [968, [2.8, 1.9, 15.4], [3.0, 2.1, 8], 42], [992, [3.1, 2.0, 15.2], [3.3, 2.5, 8], 42]], f);
      c.pos[1] += shake(f, 965, 0.06); break;
    }
    case 13: { const o = -600; c = camKeys([[992, [o + 0.3, 1.55, 6.0], [o + 0.3, 1.2, 0.3], 40], [1112, [o + 0.3, 1.45, 5.0], [o + 0.3, 1.15, 0.3], 38]], f); break; }
    default: c = camKeys([[1112, [3.4, 1.4, 17.2], [3.4, 1.7, 8.6], 42, 0], [1180, [3.4, 1.35, 16.3], [3.4, 1.7, 8.6], 41, 0], [1195, [3.4, 1.3, 15.9], [3.4, 1.75, 8.6], 40, 0.03], [1222, [3.4, 1.3, 15.5], [3.4, 1.8, 8.6], 39, 0.045]], f);
  }
  if (s === 8) c.pos[1] += shake(f, 601, 0.05);
  if (s === 9) c.pos[0] += shake(f, 676, 0.05);
  return c;
};

export const dofAt = (f) => {
  const s = idx(f);
  if (s === 1) return { focus: [0, 1.62, 8], cInf: 10 };
  if (s === 4) return { focus: [0, 1.5, 7.8], cInf: 8 };
  if (s === 9) return { focus: [-0.2, 1.4, 8], cInf: 8 };
  if (s === 13) return { focus: [-600, 1.3, 0], cInf: 10 };
  if (s === 14) return { focus: [3.4, 1.4, 9.6], cInf: 6 };
  if (s === 2) return { focus: [0.2, 1.0, 8.3], cInf: 6 };
  return { cInf: 0 };
};

export const worldAt = (f) => {
  const crate = [];
  for (let i = 0; i < 6; i++) crate.push(f < 388 ? 0 : f < 492 ? back(prog(f, 430 + i * 3, 444 + i * 3)) : 1);
  const door = f >= 940 && f < 1112 ? (f < 958 ? back(prog(f, 940, 952)) : 1 - eo(prog(f, 966, 972))) : 0;
  return { crate, door, flags: idx(f) === 1 };
};

// ---------- actors ----------
const person = (id, outfit, outfitKey, x, z, opts, extra = {}) => ({ kind: "person", id, outfit, outfitKey, x, z, y: 0, opts: { seed: 3, ...opts }, ...extra });
const gen = (f, x, z, opts, extra) => person("gen", GENERAL, "gen", x, z, { seed: 3, blink: blinkAt(f, 3), headTilt: bob(f, 3), ...opts }, extra);
const rab = (id, v, x, z, o = {}) => ({ kind: "rabbit", id: "r" + id, v, x, z, y: o.y ?? 0, hop: o.hop ?? 0, look: o.look, flip: o.flip, s: (o.s ?? 1) * 1.25 });
const rabF = (id, v, x, z, o = {}) => ({ kind: "rabbitF", id: "r" + id, v, x, z, y: o.y ?? 0, beg: o.beg ?? 0, blink: o.blink, s: (o.s ?? 1) * 1.25 });
const genWalkX = (f) => lerp(-2.8, 0, ss(prog(f, 530, 576)));

/** rabbit that hops along a path p(t) between frames a..b; facing from the screen direction (camera x axis = world x here) */
const hopper = (id, v, f, a, b, path, o = {}) => {
  const t = prog(f, a, b), [x, z] = path(ss(t)), [x2] = path(ss(clamp(t + 0.02)));
  const moving = f > a && f < b, ph = moving ? ((f - a) * (o.rate ?? 0.12) + hash(id)) % 1 : 0;
  const flip = o.flip ?? (x2 < x);
  return rab(id, v, x, z, { hop: ph, flip, look: o.look, s: o.s });
};

export const actorsAt = (f) => {
  const s = idx(f), out = [];
  switch (s) {
    case 1: out.push(gen(f, GX, GZ, { mode: "stand", expr: "stern", headTilt: -3 + bob(f, 3, 0.5), facing: 0 })); break;
    case 2: {
      const shock = f >= 128;
      out.push(gen(f, GX, GZ, { mode: "stand", expr: shock ? "shock" : f > 96 ? "nervous" : "smile", facing: 1, look: shock ? 0.6 : 0, headTilt: shock ? 4 : bob(f, 3) }, { y: shock ? 0.05 * Math.max(0, Math.sin(prog(f, 128, 136) * Math.PI)) : 0 }));
      out.push(hopper(1, 0, f, 108, 128, (t) => [lerp(2.4, 0.75, t), lerp(8.9, 8.6, t)], { rate: 0.16 }));
      if (f >= 128) out[1] = rab(1, 0, 0.75, 8.6, { look: 1, flip: true, hop: 0 });
      break;
    }
    case 3: break;
    case 4: {
      const point = ss(prog(f, 312, 326));
      out.push(person("chief", CHIEF, "chief", -0.6, 7.7, { mode: "stand", expr: f > 300 ? "grin" : "smile", facing: 1, seed: 9, blink: blinkAt(f, 9), headTilt: bob(f, 9), ...(point > 0.01 ? { wave: point } : {}) }));
      out.push(gen(f, 0.55, 8.0, { mode: "stand", expr: f > 348 ? "grin" : "smile", facing: -1 }));
      break;
    }
    case 5: {
      for (let i = 0; i < 6; i++) {
        const cx = -7.5 + i * 3 + (i % 2) * 0.4, cz = -11 - (i % 3) * 1.6;
        for (let k = 0; k < 10; k++) {
          const id = 100 + i * 10 + k, a = 438 + i * 3 + k * 3, ang = hash(id) * Math.PI * 2, r = 2 + hash(id + 5) * 5;
          if (f < a) continue;
          out.push(hopper(id, (i + k) % 4, f, a, a + 40 + hash(id + 2) * 20, (t) => [cx + Math.cos(ang) * r * t, cz + 0.3 + Math.abs(Math.sin(ang)) * r * t], { rate: 0.14 }));
          const last = out[out.length - 1]; last.y = (1 - eo(prog(f, a, a + 6))) * 0.6;
        }
      }
      break;
    }
    case 6: for (let i = 0; i < 4; i++) out.push(person("h" + i, hunter(i), "h" + i, -3 + i * 2, 9.2 - (i % 2) * 0.3, { mode: "stand", expr: "stern", seed: 11 + i, blink: blinkAt(f, 11 + i), headTilt: bob(f, 11 + i) }, { y: f >= 508 && f < 512 ? 0.02 : 0 })); break;
    case 7: {
      const x = genWalkX(f), walking = f < 576;
      out.push(walking ? gen(f, x, GZ, { side: true, mode: "march", phase: ((f - 526) / 18) % 1, expr: "smile" }, { side: true })
        : gen(f, x, GZ, { mode: "stand", expr: "smile", facing: 0 }));
      out[0].side = walking;
      for (let i = 0; i < 2; i++) out.push(person("h" + i, hunter(i), "h" + i, 1.6 + i * 1.3, 6.8 - i * 0.6, { mode: "stand", expr: "stern", seed: 11 + i, blink: blinkAt(f, 11 + i) }));
      break;
    }
    case 8: {
      for (let k = 0; k < 40; k++) {
        const id = 200 + k, x0 = (hash(id) - 0.5) * 6, z0 = -3.5 + hash(id + 3) * 4.5;
        if (f < 600 + (k % 6)) out.push(rab(id, k % 4, x0, z0, { hop: 0, flip: hash(id + 9) < 0.5, look: f > 592 }));
        else {
          const t = (f - 600 - (k % 6)) / 30, z = z0 + t * (4.5 + hash(id + 1) * 2), ph = ((f + k * 7) * 0.13) % 1;
          out.push(rabF(id, k % 4, x0 * (1 - t * 0.25), z, { y: Math.abs(Math.sin(ph * Math.PI)) * 0.2 }));
        }
      }
      break;
    }
    case 9: {
      const shock = f >= 676;
      out.push(gen(f, -0.2, GZ, { mode: "stand", expr: shock ? "shock" : f >= 640 ? "nervous" : "smile", facing: -1, ...(shock ? { wave: 1 } : {}), headTilt: shock ? 5 * Math.sin(f * 0.9) : bob(f, 3) }, { y: shock && f < 684 ? 0.06 : 0 }));
      if (shock) out.push({ kind: "exclaim", id: "exc", x: 0.2, z: GZ + 0.05, y: 2.45, s: 0.6 * back(prog(f, 676, 684)), blob: false });
      for (let k = 0; k < 26; k++) {
        const id = 300 + k, a = 636 + (k % 13) * 3 + (k >= 13 ? 34 : 0), lane = (hash(id) - 0.5) * 3.0;
        if (f < a) continue;
        out.push(hopper(id, k % 4, f, a, a + 46, (t) => [lerp(-6.5, -1.1 - hash(id + 4) * 0.5, t), GZ + lane * (1 - t * 0.6) + 0.4], { rate: 0.16, flip: false }));
      }
      break;
    }
    case 10: {
      for (let i = 0; i < 2; i++) out.push(person("b" + i, beater(i), "b" + i, -1.9 + i * 1.6, 6.2 - i * 0.5, { mode: "stand", expr: f > 755 ? "stern" : "nervous", seed: 21 + i, whip: 0.5 + 0.5 * Math.sin(f * 0.45 + i * 2), blink: blinkAt(f, 21 + i) }));
      for (let k = 0; k < 16; k++) {
        const id = 400 + k, a = 726 + (k % 8) * 3, x0 = -2.6 + hash(id) * 3.2, z0 = 4.6 + hash(id + 1) * 0.8;
        out.push(hopper(id, k % 4, f, a, a + 40, (t) => [x0 - t * (1.5 + hash(id + 2) * 1.5), z0 - t * 1.4], { rate: 0.17 }));
      }
      if (f > 733 && f < 760) out.push({ kind: "puff", id: "p1", x: -1.2, z: 5.2, y: 0.2, s: 1.0, t: prog(f, 733, 760), blob: false });
      break;
    }
    case 11: {
      out.push(gen(f, GX, GZ, { mode: "stand", expr: f > 822 ? "shock" : "nervous", facing: 0 }));
      for (let k = 0; k < 36; k++) {
        const id = 500 + k, side = k % 2 ? 1 : -1, a = 792 + (k >> 1) * 2, d = hash(id) * 0.8;
        const path = (t) => {
          const P0 = [side * (0.5 + d), -2], P1 = [side * (5 + d * 2), 4 + d * 2], P2 = [side * (0.55 + d * 0.4), GZ + (hash(id + 2) - 0.5) * 1.2];
          const u = 1 - t; return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
        };
        if (f >= a) out.push(hopper(id, k % 4, f, a, a + 52, path, { rate: 0.15, s: 1.3 }));
      }
      break;
    }
    case 12: {
      let gx = GX, gy = 0, gz = GZ, opts = { mode: "stand", expr: f > 899 ? "dazed" : "shock", facing: 0 }, side = false;
      const hopUp = (Math.abs(Math.sin(f * 0.5)) * 0.12) * (f > 874 && f < 933 ? 1 : 0);
      if (f >= 933 && f < 955) { gx = lerp(GX, 2.6, ss(prog(f, 933, 955))); side = true; opts = { mode: "march", phase: ((f - 933) / 10) % 1, expr: "shock", side: true }; }
      else if (f >= 955) {
        const t = prog(f, 955, 966); gx = lerp(2.6, 3.4, eo(t)); gz = lerp(GZ, 8.0, t); gy = f < 966 ? 2.3 * Math.sin(t * Math.PI / 2) + 0.6 * Math.sin(t * Math.PI) : 2.3;
        opts = f < 966 ? { mode: "fall", expr: "shock", facing: 0 } : { mode: "stand", expr: "nervous", facing: 0, wave: 0.8 + 0.2 * Math.sin(f * 0.6) };
      }
      const g = gen(f, gx, gz, opts, { y: gy + hopUp, ground: gy > 2.0 ? 2.3 : 0 }); g.side = side; if (gy > 2.0) g.z = 8.05; out.push(g);
      if (f >= 966 && f < 984) out.push({ kind: "puff", id: "p2", x: 3.4, z: 8.6, y: 2.2, s: 1.2, t: prog(f, 966, 984), blob: false });
      for (let k = 0; k < 22; k++) {
        const id = 600 + k, ang = hash(id) * Math.PI * 2, r = 0.35 + hash(id + 1) * 0.6;
        const cx = f < 940 ? GX : lerp(GX, 2.8, ss(prog(f, 940 + (k % 5) * 2, 975 + (k % 5) * 2)));
        const x = cx + Math.cos(ang) * r * (f < 940 ? 1 : 1.6), z = GZ + 0.6 + Math.abs(Math.sin(ang)) * r * 1.5 - (f < 940 ? 0.3 : -0.4);
        out.push(rab(id, k % 4, x, z, { hop: ((f + k * 5) * 0.16) % 1, flip: Math.cos(ang + f * 0.05) < 0, look: k % 3 === 0 }));
      }
      break;
    }
    case 13: {
      const o = -600, sold = f >= 1068;
      out.push(person("farmer", FARMER, "farmer", o - 0.45, 0.5, { mode: "stand", expr: sold ? "grin" : "smile", facing: 1, seed: 14, blink: blinkAt(f, 14), headTilt: bob(f, 14), ...(sold ? { wave: 0.4 } : {}) }));
      out.push(person("chief", CHIEF, "chief", o + 1.05, 0.6, { mode: "stand", expr: sold ? "grin" : "smile", facing: -1, seed: 9, blink: blinkAt(f, 9), ...(f >= 1056 ? { wave: ss(prog(f, 1056, 1066)) * 0.5 } : {}) }));
      out.push({ kind: "hutch", id: "hutch", x: o + 0.3, z: 0.4, y: 0.85, s: 1, blob: false });
      for (let k = 0; k < 3; k++) out.push(rabF(700 + k, [2, 0, 1][k], o - 1.4 + k * 0.45, 1.0 + (k % 2) * 0.3, { beg: (f > 1027 && (f + k * 9) % 40 < 20) ? 1 : 0, blink: blinkAt(f, 70 + k) }));
      break;
    }
    default: {
      out.push(gen(f, 3.4, 8.05, { mode: "stand", expr: f >= 1195 ? "shock" : "nervous", facing: 0, look: -0.4, headTilt: bob(f, 3) }, { y: 2.3, ground: 2.3 }));
      for (let k = 0; k < 14; k++) {
        const id = 800 + k, a = (k / 13) * Math.PI, r = 1.5 + (k % 3) * 0.5;
        const x = 3.4 + Math.cos(a) * r * 1.1, z = 9.3 + Math.sin(a) * r * 1.1;
        const beg = (f + k * 11) % 36 < 18 ? 1 : 0.5;
        out.push(rabF(id, k % 4, x, z, { beg, blink: blinkAt(f, 80 + k) }));
        if (f >= 1192 + (k % 5) && k % 2 === 0) out.push({ kind: "bubble", id: "bub" + k, x: x + 0.35, z: z + 0.02, y: 1.05, s: 0.75 * back(prog(f, 1192 + (k % 5), 1200 + (k % 5))), blob: false });
      }
    }
  }
  return out;
};
