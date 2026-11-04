// "57 Days Stranded in Antarctica": shots, cameras, world state and actors - all pure functions of the frame (24 fps).
// Shot starts are tied to sentence starts in timing.js (from the voice's word timings), so picture locks to the narration.
import { MAWSON, MAWSON_THIN, MAWSON_GAUNT, MAWSON_CAP, MAWSON_SUIT, NINNIS, MERTZ, MERTZ_SICK, hutman } from "./cast.js";
import { SENT, CH, TOTAL as TOT } from "./timing.js";

export const TOTAL = TOT;
export const XS = { ninnis: 300, grave: 1200, glacier0: 1500, glacier1: 2100, fall: 1800, cairn: 2400 };
const HZ = 4000, DZ = -4000, TX = 4000, CX = -4000, MZ = 8000, KZ = 12000; // place offsets (hut z, deep z, tent x, cave x, map z, card z)
const GAP = 36;
export const slopeY = (zr) => Math.max(0, -87.5 + 140 * Math.sqrt(Math.max(0, 1 - ((zr - 520) / 560) ** 2))); // hut ice slope height at z offset zr

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };
const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, t) => a + (b - a) * t;
const L3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const prog = (f, a, b) => clamp((f - a) / Math.max(1, b - a));
const back = (x, s = 1.7) => { x = clamp(x); const c = s + 1; return 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const blinkAt = (f, seed) => ((f + Math.floor(seed * 37)) % 89 < 3 ? 1 : 0);
const bob = (f, seed, amt = 1) => Math.sin(f * 0.09 + seed) * 1.2 * amt;
const sa = (i) => SENT[i][0], sb = (i) => SENT[i][1];

// ---------- shot table ----------
// [start, loc, light, act, params, cam]; start = sentence index (number) or {f: frame}. cam = [p0, t0, fov0, p1, t1, fov1, opts]
// opts.rel: positions are offsets from the party anchor x; opts.ease; opts.roll [r0, r1]; opts.dof; opts.shake [frame, amp]
const A = (p0, t0, f0, p1, t1, f1, o = {}) => [p0, t0, f0, p1 || p0, t1 || t0, f1 || f0, o];
const R = (p0, t0, f0, p1, t1, f1, o = {}) => A(p0, t0, f0, p1, t1, f1, { ...o, rel: true });
const card = (ch, day, date) => [{ f: CH[ch] - GAP }, "card", "card", "card", { day, date }, A([0, 0, KZ + 13.5], [0, 0, KZ], 40, [0, 0, KZ + 12.2], [0, 0, KZ], 40)];
const MAPC = (cz = 15, cx = 0, cy = 4.5) => A([cx, cy, MZ + cz], [cx, cy, MZ], 40, [cx * 0.9, cy, MZ + cz * 0.88], [cx, cy, MZ], 40);
// party presets (all relative to the anchor)
const SIDE = R([0, 1.5, 11], [0, 1.0, 0], 38, [1.5, 1.45, 10], [1.2, 1.0, 0], 38);
const SIDE_FAR = R([-3, 2.6, 18], [1, 1.0, 0], 36, [2, 2.3, 16], [2, 1.0, 0], 36);
const WIDE = R([-16, 6, 36], [2, 1, 0], 40, [-10, 4.5, 30], [2, 1, 0], 40);
const AERIAL = R([-6, 42, 30], [2, 0, 0], 40, [2, 30, 22], [2, 0, 0], 40);
const PULLOUT = R([0, 3, 9], [1, 1, 0], 40, [-10, 60, 50], [1, 0, 0], 40, { ease: ss });
const FRONT = R([9, 1.1, 4.5], [0, 1.1, 0.2], 38, [8, 1.0, 3.8], [0, 1.1, 0.2], 36);
const LOW = R([6, 0.4, 4.6], [0, 1.1, 0], 40, [5, 0.35, 4.2], [0, 1.15, 0], 38);
const mcuR = (x, z, side = 1, fov = 30) => R([x + 0.9 * side, 1.55, z + 3.4], [x, 1.5, z], fov, [x + 0.6 * side, 1.55, z + 3.0], [x, 1.5, z], fov - 2, { dof: 1 });

// party layouts: offsets from anchor
const LAY = { mawson: [-0.3, 1.25], mertzSide: [0.7, -1.25], pullMaw: [2.3, 0.35], pullMer: [3.3, -0.35], solo: [1.9, 0.05] };

const SH = [
  // ===== INTRO =====
  [{ f: 0 }, "plateau", "low", "party", { x: 0, all: 1, dogs: 6, ski: 1, snow: 0.2 }, R([-9, 3, 19], [2, 1, 0], 38, [-6, 2.6, 15], [2, 1, 0], 38)],
  [1, "plateau", "grey", "party", { x: 1320, solo: 1, out: "gaunt", snow: 0.6, wind: 5 }, R([1.9, 1.5, 12], [1.9, 1.1, 0], 34, [2.5, 1.5, 10], [2.4, 1.1, 0], 34)],
  [2, "hut", "day", "hut", { slope: 1, ship: "leaving" }, A([6, 17, HZ + 146], [-6, 6, HZ + 20], 40, [5.5, 16.6, HZ + 143], [-8, 5, HZ + 10], 38)],
  [3, "map", "card", "map", { map: { out: 1, back: 1, ninnis: 1, label: "1912 - 1913" } }, MAPC(16)],
  [4, "hut", "day", "portrait", { who: MAWSON, key: "maw", x: 6, z: HZ - 12, label: "DOUGLAS MAWSON", expr: "stern" }, A([7.2, 1.55, HZ - 8.6], [6, 1.5, HZ - 12], 30, [6.9, 1.55, HZ - 9.2], [6, 1.5, HZ - 12], 28, { dof: 1 })],
  [5, "hut", "day", "hut", { men: 3, maw: 1 }, A([-22, 4, HZ - 34], [0, 3, HZ], 40, [-26, 14, HZ - 40], [0, 4, HZ], 42)],
  [6, "hut", "storm", "hut", { men: 2, lean: 1, snow: 1, wind: 14 }, A([12, 2.4, HZ - 22], [0, 2.5, HZ], 40, [9, 2.2, HZ - 18], [0, 2.5, HZ], 38, { shake: [600, 0.04] })],
  [7, "hut", "storm", "hut", { snow: 1, wind: 16 }, A([-3, 2.2, HZ - 12], [-2.8, 2.0, HZ - 4.5], 34, [-3.1, 2.1, HZ - 9.5], [-2.8, 2.0, HZ - 4.5], 30)],
  [8, "map", "card", "map", { map: { out: 0 }, mapTo: { out: 0.22 } }, MAPC(15)],
  [9, "plateau", "day", "portrait", { who: NINNIS, key: "nin", x: 40, z: 0, label: "BELGRAVE NINNIS", expr: "smile", dogs: 1 }, A([41.2, 1.55, 3.4], [40, 1.5, 0], 30, [40.8, 1.55, 3.0], [40, 1.5, 0], 28, { dof: 1 })],
  [10, "plateau", "day", "portrait", { who: MERTZ, key: "mer", x: 60, z: 0, label: "XAVIER MERTZ", expr: "laugh", wave: 1, skis: 1 }, A([58.8, 1.5, 3.4], [60, 1.5, 0], 30, [59.2, 1.5, 3.0], [60, 1.5, 0], 28, { dof: 1 })],
  [11, "plateau", "day", "party", { x: 80, all: 1, dogs: 6, ski: 1, label: ["17 DOGS", 11] }, SIDE_FAR],
  [12, "plateau", "day", "party", { x: 140, all: 1, dogs: 6, ski: 1 }, AERIAL],
  [13, "plateau", "day", "party", { x: 1560, all: 1, dogs: 6, ski: 1 }, R([-14, 7, 28], [2, 1.5, 0], 42, [-8, 5, 24], [2, 1.5, 0], 42)],
  [14, "plateau", "day", "party", { x: 1600, all: 1, dogs: 6, ski: 1 }, LOW],
  [15, "map", "card", "map", { map: { out: 0.22 }, mapTo: { out: 1 }, mapLabel: ["500 KM", 15] }, MAPC(15)],
  [16, "plateau", "grey", "party", { x: 250, all: 1, dogs: 6, ski: 1 }, R([0, 1.6, 9], [0, 1.3, 1], 36, [0, 1.55, 6], [-0.3, 1.4, 1.2], 30)],
  // ===== DAY 1 =====
  card(1, 1, "14 DECEMBER 1912"),
  [19, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1 }, SIDE_FAR],
  [20, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1 }, R([10.5, 1.5, 3.8], [8, 1.4, 0.3], 32, [10.2, 1.5, 3.4], [8, 1.4, 0.3], 30, { dof: 1 })],
  [21, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1 }, mcuR(-0.3, 1.25, 1, 32)],
  [22, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1 }, R([-3, 1.8, 9], [-6, 1.0, 0.5], 36, [-4, 1.7, 8], [-6, 1.0, 0.5], 34)],
  [23, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1, loadLabels: 1 }, R([-4.6, 2.2, 4.2], [-6, 1.1, 0], 34, [-4.9, 2.0, 3.6], [-6, 1.1, 0], 32)],
  [27, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1, warn: 1 }, R([10.5, 1.5, 3.8], [8, 1.5, 0.3], 32, [10.0, 1.6, 3.2], [8, 1.6, 0.3], 30, { dof: 1 })],
  [29, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1 }, A([XS.ninnis + 1.5, 0.35, 8], [XS.ninnis, 0.1, 0], 34, [XS.ninnis + 1.2, 0.3, 7], [XS.ninnis, 0.1, 0], 32)],
  [30, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1 }, A([XS.ninnis - 2, 1.4, 10], [XS.ninnis + 1, 0.8, 0], 38, [XS.ninnis, 1.4, 9.5], [XS.ninnis + 2, 0.8, 0], 38)],
  [31, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1, mawLook: 1 }, mcuR(-0.3, 1.25, -1, 32)],
  [32, "plateau", "day", "party", { d1: 1, all: 1, dogs: 6, ski: 1, mawTurn: 1 }, R([2.2, 1.55, 3.4], [-0.3, 1.5, 1.25], 30, [1.6, 1.55, 2.8], [-0.3, 1.5, 1.25], 26, { dof: 1 })],
  [33, "plateau", "grey", "party", { d1: 1, all: 1, dogs: 6, ski: 1 }, A([XS.ninnis + 10, 1.6, 2], [XS.ninnis - 6, 0.6, 0], 40, [XS.ninnis + 9, 1.6, 2], [XS.ninnis - 6, 0.6, 0], 38)],
  [34, "plateau", "grey", "party", { d1: 1, all: 1 }, A([XS.ninnis + 8, 1.5, 1.6], [XS.ninnis, 0.2, 0], 34, [XS.ninnis + 7, 1.4, 1.4], [XS.ninnis, 0.2, 0], 30)],
  [35, "plateau", "grey", "party", { d1: 1, all: 1 }, A([XS.ninnis + 6, 1.3, 1.4], [XS.ninnis, 0.1, 0], 30, [XS.ninnis + 5.4, 1.2, 1.2], [XS.ninnis, 0.1, 0], 27)],
  [36, "plateau", "grey", "party", { d1: 1, all: 1 }, A([XS.ninnis + 4.5, 1.2, 1.0], [XS.ninnis, 0.0, 0], 28, [XS.ninnis + 4, 1.1, 0.9], [XS.ninnis, 0.0, 0], 24)],
  [37, "plateau", "grey", "edge", { run: 1 }, A([XS.ninnis + 3, 26, 14], [XS.ninnis + 1, 0, 0], 40, [XS.ninnis + 2, 18, 10], [XS.ninnis + 1, 0, 0], 40)],
  [38, "plateau", "grey", "edge", {}, A([XS.ninnis - 4.5, 0.5, -3], [XS.ninnis + 2, 0.7, 0.5], 38, [XS.ninnis - 4.2, 0.6, -2.5], [XS.ninnis + 2, 0.7, 0.5], 36)],
  [39, "deep", "deep", "deep", { ledge: 1 }, A([0.4, -36, DZ + 2.6], [-1.5, -45, DZ + 2], 40, [0.3, -38.5, DZ + 2.4], [-1.5, -45, DZ + 2], 38)],
  [40, "deep", "deep", "deep", { ledge: 1, label: ["45 METRES", 40] }, A([0.8, -44, DZ + 6], [0, -10, DZ], 46, [0.6, -44.5, DZ + 6.5], [0, -8, DZ], 46)],
  [41, "plateau", "grey", "edge", { rope: 1 }, A([XS.ninnis - 4.5, 0.8, -4], [XS.ninnis + 0.5, 0.2, 0.5], 36, [XS.ninnis - 4.2, 0.6, -3.4], [XS.ninnis + 0.5, 0.0, 0.5], 34)],
  [42, "plateau", "low", "edge", { shout: 1 }, A([XS.ninnis + 30, 10, 40], [XS.ninnis + 2, 0.5, 0], 40, [XS.ninnis + 40, 16, 52], [XS.ninnis + 2, 0.5, 0], 40)],
  [44, "plateau", "low", "edge", { service: 1 }, A([XS.ninnis + 5.5, 1.5, 3.4], [XS.ninnis + 2.6, 1.4, 0.8], 32, [XS.ninnis + 5.2, 1.5, 3.0], [XS.ninnis + 2.6, 1.4, 0.8], 30, { dof: 1 })],
  [45, "plateau", "low", "inventory", { x: XS.ninnis + 3 }, A([XS.ninnis + 3, 2.4, 6.2], [XS.ninnis + 3, 0.6, 1.4], 40, [XS.ninnis + 3, 2.2, 5.6], [XS.ninnis + 3, 0.6, 1.4], 38)],
  [51, "map", "card", "map", { map: { out: 1, ninnis: 1, label: "500 KM FROM HOME", you: 0 } }, MAPC(15, 4, 4.0)],
  [52, "plateau", "low", "party", { x: XS.ninnis + 4, v: 0.02, two: 1, dogs: 6, sledges: 1 }, PULLOUT],
  // ===== DAY 2 =====
  card(2, 2, "15 DECEMBER 1912"),
  [56, "plateau", "low", "camp", { x: 600, build: [56, 57] }, A([604, 2.0, 7.5], [600, 0.8, 0], 38, [603, 1.8, 6.5], [600, 0.7, 0], 36)],
  [57, "plateau", "low", "camp", { x: 600, build: [56, 56], enter: 1 }, A([596, 1.4, 6], [600, 0.6, 0], 38, [597, 1.2, 5], [600, 0.6, 0], 36)],
  [58, "tent", "tent", "tent", { two: 1 }, A([TX + 0.1, 1.2, 1.7], [TX, 0.9, 0], 40, [TX + 0.1, 1.1, 1.4], [TX, 0.9, 0], 36)],
  [59, "tent", "tent", "tent", { two: 1, mawExpr: "nervous", focus: "maw" }, A([TX - 0.3, 0.8, 1.5], [TX - 0.45, 0.72, 0.1], 30, [TX - 0.32, 0.8, 1.3], [TX - 0.45, 0.72, 0.1], 28, { dof: 1 })],
  [60, "map", "card", "map", { map: { out: 1, ninnis: 1, fork: 1, label: "COAST: SEALS, BUT SLOW" } }, MAPC(15, 2, 4.4)],
  [62, "map", "card", "map", { map: { out: 1, ninnis: 1, fork: 2, label: "INLAND: SHORTER, NO FOOD" } }, MAPC(15, 2, 4.4)],
  [66, "map", "card", "map", { map: { out: 1, ninnis: 1, fork: 2, back: 0.02, label: "INLAND" } }, MAPC(12, 3, 4.2)],
  [67, "plateau", "night", "dogs", { x: 620, n: 6, lie: 1 }, A([620, 0.9, 5], [620, 0.4, 0], 36, [620, 0.8, 4], [620, 0.4, 0], 32)],
  [68, "plateau", "night", "dogs", { x: 620, n: 6, lie: 1, men: 1 }, A([612, 2.4, 9], [620, 1.0, 0], 38, [613, 2.2, 8], [620, 1.0, 0], 38)],
  [69, "plateau", "low", "party", { x: 640, two: 1, dogs: 6, sledges: 1 }, SIDE],
  [70, "plateau", "low", "party", { x: 650, two: 1, dogs: 6, sledges: 1, mawExpr: "pained" }, mcuR(-0.3, 1.25, 1, 30)],
  [72, "plateau", "night", "dogs", { x: 620, n: 6, lie: 1, label: ["GEORGE", 72], one: 1 }, A([620, 0.9, 4.2], [620, 0.5, 0], 32, [620, 0.85, 3.6], [620, 0.5, 0], 30)],
  [73, "tent", "tent", "tent", { two: 1, diary: 1, mertzSleep: 1 }, A([TX + 0.6, 1.1, 1.5], [TX - 0.4, 0.9, 0.1], 36, [TX + 0.5, 1.05, 1.3], [TX - 0.4, 0.9, 0.1], 32)],
  [74, "tent", "tent", "tent", { two: 1, diary: 1, mertzSleep: 1, mawExpr: "stern" }, A([TX - 0.25, 0.8, 1.2], [TX - 0.45, 0.72, 0.1], 26, [TX - 0.3, 0.8, 0.95], [TX - 0.45, 0.72, 0.1], 22, { dof: 1 })],
  // ===== DAY 8 =====
  card(3, 8, "21 DECEMBER 1912"),
  [77, "plateau", "grey", "party", { x: 700, two: 1, dogs: 5, sledges: 1 }, SIDE_FAR],
  [78, "tent", "tent", "tent", { two: 1, wake: 1 }, A([TX, 1.2, 1.6], [TX, 0.9, 0], 38)],
  [79, "tent", "tent", "tent", { two: 1, stove: 1 }, A([TX + 0.3, 0.6, 0.9], [TX + 0.1, 0.35, 0.3], 34, [TX + 0.25, 0.58, 0.8], [TX + 0.1, 0.35, 0.3], 30)],
  [80, "plateau", "grey", "camp", { x: 720, packed: 1 }, A([724, 1.6, 6], [720, 0.8, 0], 38, [723, 1.5, 5], [720, 0.8, 0], 36)],
  [81, "plateau", "storm", "party", { x: 730, two: 1, dogs: 5, sledges: 1, snow: 1, wind: 10 }, FRONT],
  [82, "plateau", "grey", "party", { x: 745, two: 1, dogs: 4, sledges: 1, dogRide: 1 }, R([-1.5, 1.8, 5], [0, 1.0, 0], 36, [-1.0, 1.7, 4.4], [0, 1.0, 0], 34)],
  [83, "plateau", "grey", "dogs", { x: 760, n: 4, names: [[84, "JOHNSON"], [85, "MARY"], [86, "HALDANE"]] }, A([760, 1.2, 6], [760, 0.5, 0], 40, [760, 1.1, 5.4], [760, 0.5, 0], 38)],
  [87, "plateau", "grey", "party", { x: 780, two: 1, pull: 1, sledges: 1, dogs: 1 }, SIDE],
  [88, "plateau", "low", "party", { x: 800, two: 1, pull: 1, sledges: 1, dogs: 1 }, R([-6, 1.2, 6], [2, 1.5, 0], 38, [-6, 1.6, 6], [60, 6, -200], 40)],
  [90, "plateau", "low", "party", { x: 820, two: 1, pull: 1, sledges: 1, dogs: 1, sunArc: 1 }, R([-30, 4, 30], [60, 8, -300], 40, [-24, 3.5, 26], [80, 6, -300], 40)],
  [91, "plateau", "day", "party", { x: 840, two: 1, pull: 1, sledges: 1, dogs: 1, mawExpr: "pained" }, mcuR(LAY.pullMaw[0], LAY.pullMaw[1], 1, 30)],
  [92, "plateau", "low", "party", { x: 860, two: 1, pull: 1, sledges: 1, dogs: 1 }, SIDE_FAR],
  [93, "plateau", "low", "party", { x: 880, two: 1, pull: 1, sledges: 1, dogs: 1, merExpr: "pained" }, mcuR(LAY.pullMer[0], LAY.pullMer[1], 1, 30)],
  [94, "tent", "tent", "tent", { two: 1, ration: 1 }, A([TX, 1.3, 1.5], [TX, 0.6, 0.2], 36, [TX, 1.2, 1.25], [TX, 0.6, 0.2], 32)],
  [95, "plateau", "low", "party", { x: 900, two: 1, pull: 1, sledges: 1, dogs: 1, merExpr: "laugh", mawExpr: "smile", hearts: 1 }, R([4.2, 1.55, 4.6], [2.8, 1.45, 0], 32, [4.0, 1.55, 4.2], [2.8, 1.45, 0], 30, { dof: 1 })],
  [99, "map", "card", "map", { map: { out: 1, ninnis: 1, back: 0.04 }, mapTo: { back: 0.1 }, mapYou: 1 }, MAPC(15, 2, 4.4)],
  [102, "hut", "day", "hut", { ship: "arriving" }, A([-30, 8, HZ - 30], [0, 2, HZ - 200], 40, [-32, 9, HZ - 34], [0, 2, HZ - 200], 40)],
  // ===== DAY 16 =====
  card(4, 16, "29 DECEMBER 1912"),
  [107, "plateau", "grey", "party", { x: 960, two: 1, still: 1, sledges: 1, dogs: 0, label: ["GINGER", 107], harness: 1 }, A([962.5, 1.6, 6], [961, 0.8, 0], 36, [962, 1.5, 5.2], [961, 0.8, 0], 34)],
  [108, "plateau", "grey", "party", { x: 970, two: 1, pull: 1, sledges: 1, dogs: 0, out: "thin" }, PULLOUT],
  [109, "plateau", "grey", "party", { x: 990, two: 1, pull: 1, sledges: 1, dogs: 0, out: "thin", merExpr: "dazed" }, mcuR(LAY.pullMer[0], LAY.pullMer[1], 1, 30)],
  [110, "tent", "tent", "tent", { two: 1, sick: 1, labels: [[110, "PEELING SKIN"], [111, "HAIR LOSS"], [112, "DIZZY"]] }, A([TX, 1.25, 1.6], [TX, 0.9, 0], 38, [TX, 1.2, 1.35], [TX, 0.9, 0], 34)],
  [113, "tent", "tent", "tent", { two: 1, sick: 1, stove: 1 }, A([TX + 0.3, 0.6, 0.9], [TX + 0.1, 0.35, 0.3], 34, [TX + 0.25, 0.58, 0.8], [TX + 0.1, 0.35, 0.3], 30)],
  [115, "plateau", "day", "dogs", { x: 1000, n: 1, stand: 1 }, A([1001.2, 0.8, 2.6], [1000, 0.6, 0], 34, [1001, 0.8, 2.2], [1000, 0.6, 0], 30, { dof: 1 })],
  [116, "plateau", "day", "dogs", { x: 1000, n: 1, stand: 1, label: ["VITAMIN A", 116] }, A([1000.8, 0.9, 3.6], [1000, 0.9, 0], 34, [1000.6, 0.9, 3.2], [1000, 0.9, 0], 32)],
  [117, "plateau", "day", "dogs", { x: 1000, n: 1, stand: 1, label: ["TOO MUCH = POISON", 117, "#ff6a4a"] }, A([1000.8, 0.9, 3.6], [1000, 0.9, 0], 32, [1000.5, 0.9, 3.0], [1000, 0.9, 0], 28)],
  [118, "plateau", "grey", "portrait", { who: MERTZ_SICK, key: "mers", x: 1010, z: 0, expr: "dazed", labels: [[118, "PEELING SKIN"], [119, "HAIR LOSS"], [120, "STOMACH PAIN"], [121, "CONFUSION"]] }, A([1011.2, 1.6, 3.8], [1010, 1.6, 0], 32, [1010.8, 1.6, 3.3], [1010, 1.6, 0], 30)],
  [122, "plateau", "grey", "party", { x: 1020, two: 1, pull: 1, sledges: 1, dogs: 0, out: "thin", slow: 0.7 }, SIDE],
  [124, "plateau", "grey", "party", { x: 1030, two: 1, pull: 1, sledges: 1, dogs: 0, out: "thin", slow: 0.5 }, SIDE_FAR],
  [126, "tent", "tent", "tent", { two: 1, sick: 1, merDiary: 1, label: ["1 JANUARY 1913", 126] }, A([TX + 0.5, 0.8, 1.3], [TX + 0.4, 0.72, 0.1], 32, [TX + 0.48, 0.8, 1.1], [TX + 0.4, 0.72, 0.1], 28, { dof: 1 })],
  // ===== DAY 19 =====
  card(5, 19, "1 JANUARY 1913"),
  [129, "plateau", "grey", "sitpair", { x: 1060 }, A([1061.8, 1.1, 3.2], [1060.6, 0.9, 0], 32, [1061.5, 1.05, 2.8], [1060.6, 0.9, 0], 30, { dof: 1 })],
  [133, "tent", "tent", "tent", { two: 1, sick: 1, sleep: 1 }, A([TX, 1.3, 1.6], [TX, 0.8, 0], 38, [TX, 1.25, 1.4], [TX, 0.8, 0], 36)],
  [135, "tent", "tent", "tent", { two: 1, sick: 1, mawExpr: "nervous", q: 1 }, A([TX - 0.2, 0.8, 1.3], [TX - 0.45, 0.72, 0.1], 30)],
  [136, "plateau", "day", "portrait", { who: MERTZ, key: "mer", x: 1080, z: 0, expr: "laugh", skis: 1, glide: 1 }, A([1076, 1.5, 6], [1080, 1.2, 0], 38, [1086, 1.5, 6], [1084, 1.2, 0], 38)],
  [139, "plateau", "grey", "sitpair", { x: 1060, merOnly: 1 }, A([1061.4, 1.0, 2.6], [1060.6, 0.8, 0], 30, [1061.2, 0.95, 2.3], [1060.6, 0.8, 0], 27, { dof: 1 })],
  [140, "plateau", "grey", "party", { x: 1100, two: 1, pull: 1, sledges: 1, dogs: 0, out: "thin", slow: 0.6 }, SIDE],
  [141, "plateau", "grey", "party", { x: 1110, two: 1, pull: 1, sledges: 1, dogs: 0, out: "thin", slow: 0.4 }, WIDE],
  [143, "plateau", "grey", "party", { x: 1115, two: 1, pull: 1, sledges: 1, dogs: 0, out: "thin", slow: 0.15 }, AERIAL],
  [144, "plateau", "grey", "party", { x: 1120, two: 1, still: 1, sledges: 1, dogs: 0, out: "thin", mawExpr: "nervous" }, mcuR(-0.3, 1.25, 1, 28)],
  [147, "plateau", "low", "sitpair", { x: 1060, hold: 1 }, A([1062.6, 1.2, 3.6], [1060.6, 1.0, 0], 34, [1062.2, 1.2, 3.2], [1060.6, 1.0, 0], 32)],
  [148, "plateau", "low", "party", { x: 1140, solo: 1, sledges: 1, ride: 1, out: "thin", slow: 0.5 }, SIDE],
  [150, "plateau", "night", "camp", { x: 1160, glow: 1 }, A([1166, 2.2, 9], [1160, 0.6, 0], 38, [1164, 1.8, 7], [1160, 0.6, 0], 36)],
  // ===== DAY 26 =====
  card(6, 26, "8 JANUARY 1913"),
  [156, "plateau", "night", "camp", { x: 1160, glow: 1, quiet: 1 }, A([1170, 3, 14], [1160, 0.6, 0], 38, [1167, 2.4, 11], [1160, 0.6, 0], 36)],
  [158, "plateau", "grey", "party", { x: XS.grave + 6, solo: 1, still: 1, sledges: 1, out: "thin" }, AERIAL],
  [159, "map", "card", "map", { map: { out: 1, ninnis: 1, back: 0.45, mertz: 1, you: 0.45, label: "160 KM TO GO" } }, MAPC(15, -1, 4.6)],
  [160, "plateau", "grey", "party", { x: XS.grave + 6, solo: 1, still: 1, sledges: 1, out: "thin", mawExpr: "pained" }, mcuR(LAY.solo[0], LAY.solo[1], 1, 30)],
  [163, "plateau", "low", "grave", {}, A([XS.grave + 5, 1.6, 6], [XS.grave, 0.9, -3], 38, [XS.grave + 4, 1.5, 5], [XS.grave, 0.9, -3], 36)],
  [164, "plateau", "low", "portrait", { who: MAWSON_THIN, key: "mawt", x: XS.grave + 3, z: 0, expr: "stern" }, A([XS.grave + 3.6, 1.55, 2.8], [XS.grave + 3, 1.5, 0], 28, [XS.grave + 3.4, 1.55, 2.3], [XS.grave + 3, 1.5, 0], 24, { dof: 1 })],
  [165, "plateau", "low", "cut", { x: XS.grave + 5, at: 165 }, A([XS.grave + 5, 1.8, 4.5], [XS.grave + 5, 0.4, 0], 38, [XS.grave + 5, 1.6, 4.0], [XS.grave + 5, 0.4, 0], 36)],
  [166, "plateau", "low", "cut", { x: XS.grave + 5, done: 1, label: ["HALF THE WEIGHT", 166] }, A([XS.grave + 6.5, 1.2, 3.5], [XS.grave + 5.6, 0.5, 0], 36)],
  [167, "plateau", "low", "party", { x: XS.grave + 10, solo: 1, sledges: "half", sail: 1, out: "thin", snow: 0.3, wind: 6 }, SIDE],
  [168, "tent", "tent", "tent", { solo: 1, stove: 1 }, A([TX + 0.3, 0.6, 0.9], [TX + 0.1, 0.35, 0.3], 34, [TX + 0.25, 0.58, 0.8], [TX + 0.1, 0.35, 0.3], 30)],
  [169, "plateau", "low", "party", { x: XS.grave + 20, solo: 1, sledges: "half", sail: 1, out: "thin", snow: 0.3, wind: 6 }, R([-8, 1.2, 10], [2, 1.4, 0], 40, [-14, 14, 26], [2, 1, 0], 40, { ease: ss })],
  // ===== DAY 29 =====
  card(7, 29, "11 JANUARY 1913"),
  [173, "plateau", "grey", "party", { x: 1400, solo: 1, sledges: "half", out: "gaunt" }, SIDE],
  [174, "plateau", "grey", "party", { x: 1410, solo: 1, sledges: "half", out: "gaunt", slow: 0.8 }, R([2.4, 0.3, 2.2], [1.9, 0.3, 0], 34, [2.6, 0.3, 2.0], [2.1, 0.3, 0], 34)],
  [175, "plateau", "grey", "party", { x: 1415, solo: 1, still: 1, sledges: "half", out: "gaunt", mawExpr: "nervous" }, mcuR(LAY.solo[0], LAY.solo[1], 1, 28)],
  [177, "plateau", "grey", "feet", { x: 1420 }, A([1422.5, 1.4, 4.2], [1420.4, 0.6, 0], 36, [1422, 1.3, 3.6], [1420.4, 0.6, 0], 34)],
  [178, "plateau", "grey", "feet", { x: 1420, expr: "shock", exclaim: 178 }, A([1421.1, 0.95, 2.2], [1420.4, 0.85, 0], 30, [1421, 0.95, 1.9], [1420.4, 0.85, 0], 27, { dof: 1 })],
  [179, "plateau", "grey", "feet", { x: 1420, expr: "pained" }, A([1421.0, 0.95, 2.0], [1420.4, 0.85, 0], 28, [1420.8, 0.95, 1.6], [1420.4, 0.85, 0], 24, { dof: 1 })],
  [181, "plateau", "grey", "feet", { x: 1420, expr: "stern", tin: 1 }, A([1422, 1.2, 3.0], [1420.4, 0.6, 0], 34, [1421.8, 1.1, 2.6], [1420.4, 0.6, 0], 32)],
  [183, "plateau", "grey", "party", { x: 1430, solo: 1, sledges: "half", out: "gaunt" }, FRONT],
  [184, "map", "card", "map", { map: { out: 1, ninnis: 1, mertz: 1, back: 0.5 }, mapTo: { back: 0.58 }, mapYou: 1, mapLabel: ["8 KM A DAY", 184] }, MAPC(15, -2, 4.6)],
  [186, "tent", "tent", "tent", { solo: 1, diary: 1, out: "gaunt" }, A([TX - 0.2, 0.8, 1.3], [TX - 0.45, 0.72, 0.1], 30, [TX - 0.25, 0.8, 1.1], [TX - 0.45, 0.72, 0.1], 27, { dof: 1 })],
  [187, "plateau", "day", "portrait", { who: MAWSON, key: "maw", x: 1440, z: 0, expr: "smile" }, A([1440.5, 1.55, 2.6], [1440, 1.5, 0], 28, [1440.4, 1.55, 2.4], [1440, 1.5, 0], 26, { dof: 1 })],
  [188, "plateau", "grey", "portrait", { who: MAWSON_GAUNT, key: "mawg", x: 1440, z: 0, expr: "pained" }, A([1440.5, 1.55, 2.6], [1440, 1.5, 0], 28, [1440.4, 1.55, 2.2], [1440, 1.5, 0], 24, { dof: 1 })],
  [189, "plateau", "day", "party", { x: 1470, solo: 1, still: 1, sledges: "half", out: "gaunt" }, R([-6, 2.2, 6], [2, 1.6, 0], 40, [-3, 6, 4], [40, 2, 0], 44, { ease: ss })],
  [190, "plateau", "day", "party", { x: 1530, solo: 1, sledges: "half", out: "gaunt", slow: 0.7 }, R([16, 0.5, 2], [2, 0.6, 0], 38, [12, 0.45, 1.6], [2, 0.8, 0], 36)],
  // ===== DAY 35 =====
  card(8, 35, "17 JANUARY 1913"),
  [194, "plateau", "day", "fallTop", {}, A([XS.fall - 6, 1.6, 9], [XS.fall - 2, 0.9, 0], 38, [XS.fall - 2, 1.5, 8], [XS.fall, 0.8, 0], 38)],
  [195, "plateau", "day", "fallTop", {}, A([XS.fall + 1, 0.8, 5], [XS.fall, 0.7, 0], 34, [XS.fall + 1, 0.7, 4.6], [XS.fall, 0.3, 0], 34, { shake: [sa(195) + 26, 0.06] })],
  [196, "deep", "deep", "deep", { hang: 1, fallIn: [196, 198] }, A([1.8, -3, DZ + 5.0], [0, -2.5, DZ], 44, [1.6, -5.4, DZ + 4.8], [0, -5.6, DZ], 44)],
  [198, "deep", "deep", "deep", { hang: 1, y: -7 }, A([1.6, -5.6, DZ + 4.6], [0, -5.6, DZ], 38, [1.5, -5.6, DZ + 4.2], [0, -5.6, DZ], 36, { shake: [sa(198) + 50, 0.07] })],
  [199, "deep", "deep", "deep", { hang: 1, y: -7 }, A([0.8, -5.8, DZ + 2.2], [0, -5.6, DZ], 32, [0.7, -5.6, DZ + 2.0], [0, -5.4, DZ], 30, { dof: 1 })],
  [200, "plateau", "day", "fallTop", { jammed: 1 }, A([XS.fall - 3.5, 0.4, 2.5], [XS.fall - 0.4, 0.3, 0], 36, [XS.fall - 3.2, 0.4, 2.2], [XS.fall - 0.4, 0.3, 0], 34)],
  [201, "deep", "deep", "deep", { hang: 1, y: -7, spin: 1 }, A([1.9, -5.4, DZ + 2.9], [0, -5.7, DZ], 38, [-1.9, -5.6, DZ + 3.0], [0, -5.7, DZ], 38)],
  [202, "deep", "deep", "deep", { hang: 1, y: -7 }, A([0.4, -4.2, DZ + 0.6], [0, -40, DZ - 0.4], 46, [0.4, -4.4, DZ + 0.5], [0, -40, DZ - 0.4], 44)],
  [203, "deep", "deep", "deep", { hang: 1, y: -7, expr: "pained" }, A([0.6, -5.4, DZ + 2.0], [0, -5.5, DZ], 30, [0.5, -5.4, DZ + 1.7], [0, -5.5, DZ], 27, { dof: 1 })],
  [204, "deep", "deep", "deep", { hang: 1, y: -7, expr: "stern" }, A([0.5, -5.4, DZ + 1.8], [0, -5.5, DZ], 28, [0.45, -5.4, DZ + 1.5], [0, -5.5, DZ], 25, { dof: 1 })],
  [205, "deep", "deep", "deep", { hang: 1, climb: [205, 208], y0: -7, y1: -2.4, expr: "pained" }, A([1.9, -5, DZ + 3.8], [0, -5.4, DZ], 40, [1.7, -1.4, DZ + 3.6], [0, -1.0, DZ], 40)],
  [208, "deep", "deep", "deep", { hang: 1, slip: [sa(208) + 44, sa(209) + 6], y0: -2.4, y1: -7, expr: "shock" }, A([1.7, -1.2, DZ + 3.6], [0, -1.0, DZ], 40, [1.7, -5.0, DZ + 4.0], [0, -5.6, DZ], 40, { shake: [sa(209), 0.07] })],
  [210, "deep", "deep", "deep", { hang: 1, y: -7, expr: "dazed" }, A([0, -26, DZ + 4], [0, -7, DZ], 40, [0, -20, DZ + 3.2], [0, -7, DZ], 36)],
  [213, "plateau", "day", "fallTop", { emerge: [213, 214] }, A([XS.fall + 3, 0.7, 2.8], [XS.fall - 0.5, 0.5, 0], 36, [XS.fall + 2.6, 0.7, 2.5], [XS.fall - 0.8, 0.5, 0], 34)],
  [215, "plateau", "night", "camp", { x: XS.fall - 8, ladder: 1 }, A([XS.fall - 4, 1.4, 4.2], [XS.fall - 7.2, 0.6, 0.6], 36, [XS.fall - 4.4, 1.3, 3.8], [XS.fall - 7.2, 0.6, 0.6], 34)],
  [217, "plateau", "day", "fallTop", { emerge: [217, 217] }, A([XS.fall + 2.5, 0.9, -3], [XS.fall - 0.5, 0.5, 0], 36)],
  [218, "plateau", "day", "fallTop", { emerge: [218, 218] }, A([XS.fall + 3.5, 1.2, 3], [XS.fall - 0.5, 0.5, 0], 34)],
  // ===== DAY 47 =====
  card(9, 47, "29 JANUARY 1913"),
  [221, "plateau", "grey", "cairn", { walk: 1 }, A([XS.cairn - 16, 1.55, 3.4], [XS.cairn - 17.9, 1.5, 0], 30, [XS.cairn - 15.4, 1.55, 3.0], [XS.cairn - 17.4, 1.5, 0], 28, { dof: 1 })],
  [222, "plateau", "grey", "cairn", { stop: 1, look: 1 }, A([XS.cairn - 16, 1.55, 3.4], [XS.cairn - 17.6, 1.5, 0], 28, [XS.cairn - 16.2, 1.55, 3.0], [XS.cairn - 17.6, 1.5, 0], 26, { dof: 1 })],
  [223, "plateau", "grey", "cairn", { stop: 1 }, A([XS.cairn - 16.8, 1.7, 0], [XS.cairn, 1.8, -30], 22, [XS.cairn - 16.8, 1.7, 0], [XS.cairn, 1.8, -30], 14)],
  [226, "plateau", "low", "cairn", { stop: 1 }, A([XS.cairn + 3, 1.0, -26], [XS.cairn, 2.0, -30], 36, [XS.cairn + 2.4, 1.2, -26.6], [XS.cairn, 2.4, -30], 34)],
  [227, "plateau", "low", "cairn", { stop: 1, label: ["LEFT BY A SEARCH PARTY", 227] }, A([XS.cairn - 6, 3, -22], [XS.cairn, 1.5, -30], 40)],
  [228, "plateau", "low", "cairn", { atCairn: 1, food: 228, note: 229 }, A([XS.cairn + 3.5, 1.4, -26.5], [XS.cairn + 1.2, 1.0, -29], 36, [XS.cairn + 3.2, 1.3, -27], [XS.cairn + 1.2, 1.0, -29], 34)],
  [230, "map", "card", "map", { map: { out: 1, ninnis: 1, mertz: 1, back: 0.86, cairn: 1, cave: 1, you: 0.86, label: "35 KM TO THE CAVE" } }, MAPC(13, -4, 3.6)],
  [232, "plateau", "low", "cairn", { atCairn: 1, reading: 1 }, A([XS.cairn + 2.1, 1.55, -26.4], [XS.cairn + 1.2, 1.5, -29], 28, [XS.cairn + 2.0, 1.55, -26.8], [XS.cairn + 1.2, 1.5, -29], 25, { dof: 1 })],
  [234, "plateau", "low", "cairn", { atCairn: 1, party3: 1 }, A([XS.cairn - 3, 1.7, -24], [XS.cairn - 60, 1.4, -90], 12, [XS.cairn - 3.3, 1.7, -24.4], [XS.cairn - 60, 1.4, -90], 10)],
  [235, "plateau", "low", "cairn", { atCairn: 1, expr: "dazed" }, A([XS.cairn + 2.1, 1.55, -26.4], [XS.cairn + 1.2, 1.5, -29], 28, [XS.cairn + 2.0, 1.55, -26.8], [XS.cairn + 1.2, 1.5, -29], 25, { dof: 1 })],
  [236, "plateau", "low", "party", { x: XS.cairn + 20, solo: 1, sledges: "half", out: "gaunt", q: 238 }, R([-5, 1.0, 7], [2, 1.5, 0], 40, [-12, 9, 18], [10, 1, 0], 40, { ease: ss })],
  // ===== DAY 50 =====
  card(10, 50, "1 FEBRUARY 1913"),
  [241, "plateau", "day", "party", { x: 1600, solo: 1, sledges: "half", out: "gaunt", slow: 0.6 }, R([-8, 7, 18], [2, 1, 0], 38, [-5, 6, 15], [2, 1, 0], 36)],
  [242, "cave", "cave", "cave", { enter: [242, 242] }, A([CX + 1.2, 1.2, 3.0], [CX, 1.1, -3], 40, [CX + 1.0, 1.2, 2.6], [CX, 1.1, -3], 38)],
  [243, "cave", "cave", "cave", { fruit: 243 }, A([CX + 1.6, 1.4, 2.3], [CX + 1.6, 0.6, 1.4], 36, [CX + 1.6, 1.3, 2.1], [CX + 1.6, 0.6, 1.4], 32)],
  [244, "cave", "cave", "cave", { fruit: 0, sit: 1, expr: "relief_open" }, A([CX + 0.2, 0.8, 1.6], [CX - 0.4, 0.7, 0.4], 30, [CX + 0.15, 0.8, 1.4], [CX - 0.4, 0.7, 0.4], 27, { dof: 1 })],
  [247, "map", "card", "map", { map: { out: 1, ninnis: 1, mertz: 1, back: 0.97, cairn: 1, cave: 1, you: 0.97, label: "ALMOST HOME" } }, MAPC(10, -5.5, 2.8)],
  [249, "cave", "storm", "cave", { sit: 1, look: 1, snow: 1, wind: 16, storm: 1 }, A([CX + 0.4, 1.3, 2.4], [CX, 1.6, -8], 40, [CX + 0.3, 1.3, 2.0], [CX, 1.6, -8], 38)],
  [250, "plateau", "storm", "empty", { x: 1700, snow: 1, wind: 18 }, A([1700, 2, 10], [1710, 3, -20], 42, [1702, 2.2, 9], [1712, 3, -20], 42, { shake: [sa(250) + 10, 0.05] })],
  [252, "cave", "cave", "cave", { sit: 1, expr: "nervous", labels: [[253, "1 DAY"], [254, "2 DAYS"], [255, "5 DAYS"]], snow: 0.5, wind: 12, storm: 1 }, A([CX + 1.6, 1.4, 2.8], [CX - 0.4, 0.9, 0.4], 38, [CX + 1.4, 1.35, 2.5], [CX - 0.4, 0.9, 0.4], 36)],
  [256, "cave", "cave", "cave", { sit: 1, expr: "nervous", snow: 0.5, wind: 12, storm: 1 }, A([CX + 2.6, 1.6, 3.4], [CX - 0.4, 0.9, 0.4], 40, [CX + 1.2, 1.2, 2.0], [CX - 0.4, 0.9, 0.4], 36)],
  [257, "cave", "cave", "cave", { sit: 1, expr: "stern", crampon: 1 }, A([CX + 0.4, 0.95, 1.6], [CX - 0.3, 0.75, 0.4], 32, [CX + 0.3, 0.95, 1.4], [CX - 0.3, 0.75, 0.4], 30, { dof: 1 })],
  [259, "cave", "cave", "cave", { sit: 1, look: 1, calm: [259, 259], expr: "relief" }, A([CX + 0.4, 1.3, 2.4], [CX, 1.6, -8], 40, [CX + 0.2, 1.25, 1.6], [CX, 1.6, -8], 36)],
  // ===== DAY 57 =====
  card(11, 57, "8 FEBRUARY 1913"),
  [261, "hut", "day", "hut", { slope: 1, walkDown: [261, 265] }, A([4, 34, HZ + 175], [0, 4, HZ], 40, [3, 30, HZ + 160], [0, 3, HZ], 40)],
  [262, "hut", "day", "hut", { slope: 1, walkDown: [261, 265] }, A([2, 23, HZ + 135], [0, 0, HZ - 120], 40, [1, 20, HZ + 125], [0, 0, HZ - 140], 38)],
  [265, "hut", "day", "portrait", { who: MAWSON_GAUNT, key: "mawg", x: 2, z: HZ + 110, y: 7.9, expr: "nervous", facing: -1 }, A([3.0, 9.6, HZ + 113], [2, 9.4, HZ + 110], 30, [2.8, 9.6, HZ + 112.6], [2, 9.4, HZ + 110], 28, { dof: 1 })],
  [266, "hut", "day", "hut", {}, A([0, 6, HZ - 60], [0, 0, HZ - 600], 40, [0, 6.2, HZ - 64], [0, 0, HZ - 600], 38)],
  [267, "hut", "day", "hut", { ship: "far" }, A([10, 3, HZ - 70], [-150, 6, HZ - 500], 24, [10, 3, HZ - 72], [-185, 6, HZ - 500], 22)],
  [270, "hut", "day", "hut", { men: 3, work: 1 }, A([16, 3, HZ - 16], [6, 1.2, HZ - 2], 38, [15, 2.8, HZ - 14], [6, 1.2, HZ - 2], 36)],
  [271, "hut", "day", "hut", { men: 3, lookUp: 1 }, A([9, 1.6, HZ - 6], [6.8, 1.6, HZ - 1], 32, [8.8, 1.6, HZ - 5.6], [6.8, 1.6, HZ - 1], 30, { dof: 1 })],
  [272, "hut", "day", "hut", { men: 3, runUp: [272, 273], slope: 1, mawDown: 1 }, A([30, 9, HZ - 30], [4, 3, HZ + 40], 40, [26, 8, HZ - 20], [4, 4, HZ + 60], 40)],
  [273, "hut", "low", "meet", {}, A([4.5, 4.4, HZ + 85], [0.4, 4.0, HZ + 92], 36, [4.0, 4.4, HZ + 86], [0.4, 4.0, HZ + 92], 34)],
  [274, "hut", "low", "meet", { ask: 1 }, A([1.9, 4.5, HZ + 88.4], [1.1, 4.4, HZ + 91.6], 30, [1.8, 4.5, HZ + 88.8], [1.1, 4.4, HZ + 91.6], 28, { dof: 1 })],
  [275, "hut", "day", "hut", { men: 1, radio: 1 }, A([-6, 6, HZ + 20], [0, 10, HZ + 6], 40, [-7, 7, HZ + 22], [0, 12, HZ + 6], 40)],
  [276, "hut", "day", "hut", { ship: "turn", t0: 276 }, A([10, 3, HZ - 70], [-80, 6, HZ - 380], 24, [10, 3, HZ - 72], [-80, 6, HZ - 380], 22)],
  [277, "hut", "storm", "hut", { ship: "leave2", t0: 277, snow: 1, wind: 16 }, A([0, 4, HZ - 50], [-60, 4, HZ - 400], 34, [2, 4, HZ - 52], [-90, 4, HZ - 420], 32)],
  [279, "hut", "night", "hut", { winter: 1, label: ["10 MORE MONTHS", 279] }, A([-24, 6, HZ - 30], [0, 3, HZ], 40, [-22, 5, HZ - 26], [0, 3, HZ], 38)],
  [280, "tent", "tent", "tent", { solo: 1, out: "cap", expr: "smile_closed" }, A([TX + 0.2, 0.8, 1.4], [TX - 0.45, 0.72, 0.1], 32, [TX + 0.1, 0.8, 1.2], [TX - 0.45, 0.72, 0.1], 30, { dof: 1 })],
  [282, "plateau", "day", "portrait", { who: MAWSON_SUIT, key: "mawsuit", x: 30, z: 0, expr: "smile", label: ["1914", 282], hearts: 1 }, A([31, 1.55, 3.4], [30, 1.5, 0], 30, [30.8, 1.55, 3.0], [30, 1.5, 0], 28, { dof: 1 })],
  [283, "plateau", "low", "party", { x: 2600, solo: 1, sledges: "half", sail: 1, out: "gaunt" }, R([-12, 1.0, 14], [2, 1.6, 0], 36, [-9, 1.4, 11], [2, 1.6, 0], 36)],
  [284, "map", "card", "map", { map: { out: 1, back: 1, ninnis: 1, mertz: 1, cairn: 1, cave: 1, label: "57 DAYS" } }, MAPC(16)],
  [285, "plateau", "low", "grave", { empty: 1 }, A([XS.grave + 6, 1.4, 6], [XS.grave, 1.0, -3], 36, [XS.grave + 5, 1.4, 5], [XS.grave, 1.0, -3], 34)],
  [286, "plateau", "low", "cut", { x: XS.grave + 5, done: 1, empty: 1 }, A([XS.grave + 6.5, 1.2, 3.5], [XS.grave + 5.6, 0.5, 0], 36, [XS.grave + 6.3, 1.1, 3.0], [XS.grave + 5.6, 0.5, 0], 34)],
  [287, "plateau", "low", "party", { x: 2640, solo: 1, sledges: "half", sail: 1, out: "gaunt" }, R([-4, 1.0, 8], [2, 1.5, 0], 38, [-8, 3, 14], [6, 1.5, 0], 40)],
  [288, "card", "card", "card", { day: 57, date: "WHICH DAY WOULD YOU HAVE GIVEN UP?", end: 1 }, A([0, 0, KZ + 13.5], [0, 0, KZ], 40, [0, 0, KZ + 12.4], [0, 0, KZ], 40)],
];
const SHOTS = SH.map(([st, loc, light, act, p, cam]) => ({ a: typeof st === "number" ? Math.max(0, sa(st) - 3) : st.f, loc, light, act, p, cam, si: typeof st === "number" ? st : null }));
SHOTS.sort((x, y) => x.a - y.a);
for (let i = 0; i < SHOTS.length; i++) SHOTS[i].b = i + 1 < SHOTS.length ? SHOTS[i + 1].a : TOTAL;
export { SHOTS };
export const shotAt = (f) => { let lo = 0, hi = SHOTS.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m].a <= f) lo = m; else hi = m - 1; } return SHOTS[lo]; };
const chOf = (f) => { let c = 0; for (let i = 0; i < CH.length; i++) if (f >= CH[i] - GAP) c = i; return c; };

// ---------- party anchor ----------
const V = 0.035;
const D1V = 0.05, D1REF = 2213; // day 1: Mawson's sledge crosses the snow bridge at frame 2213; Ninnis' sledge (6 m behind) at ~2333
const anchorAt = (f, sh) => {
  const p = sh.p;
  if (p.d1) return XS.ninnis + 1 + D1V * (Math.min(f, 2330) - D1REF);
  const slow = p.still ? 0 : (p.slow ?? 1);
  return (p.x ?? 0) + (p.v ?? V) * slow * (f - sh.a);
};
export const NINNIS_FALL = 2318;

// ---------- cameras ----------
const shake = (f, at, amp = 0.05, len = 10) => { const k = f - at; if (k < 0 || k > len) return 0; return Math.sin(k * 2.6) * amp * (1 - k / len); };
export const camAt = (f) => {
  const sh = shotAt(f), [p0, t0, f0, p1, t1, f1, o] = sh.cam;
  const t = (o.ease || ss)(prog(f, sh.a, sh.b));
  const pos = L3(p0, p1, t), tgt = L3(t0, t1, t);
  if (o.rel) { const ax = anchorAt(f, sh); pos[0] += ax; tgt[0] += ax; }
  if (sh.loc === "tent" || (sh.loc === "cave" && sh.p.sit && !sh.p.look)) { // sitting figures: lift the frame and back off a little
    for (let k = 0; k < 3; k++) pos[k] = tgt[k] + (pos[k] - tgt[k]) * 1.4;
  }
  pos[0] += Math.sin(f * 0.031) * 0.02; pos[1] += Math.sin(f * 0.023) * 0.012;
  if (o.shake) { pos[1] += shake(f, o.shake[0], o.shake[1]); pos[0] += shake(f + 3, o.shake[0], o.shake[1] * 0.7); }
  if (sh.act === "card") { const k = f - sh.a; pos[1] += shake(f, sh.a + 4, 0.12, 12); }
  return { pos, tgt, fov: lerp(f0, f1, t), roll: o.roll ? lerp(o.roll[0], o.roll[1], t) : 0 };
};
export const dofAt = (f) => { const sh = shotAt(f); return sh.cam[6].dof && sh.loc !== "tent" && sh.loc !== "cave" ? { cInf: 6 } : { cInf: 0 }; };
export const flashAt = (f) => { const sh = shotAt(f); if (sh.act !== "card") return 0; const k = f - sh.a - 4; return k >= 0 && k < 6 ? [0.8, 0.6, 0.4, 0.25, 0.12, 0.04][k] : 0; };
export const fadeAt = (f) => clamp((f - (TOTAL - 30)) / 26);

// ---------- world state ----------
const MAPOUT = { out: 0, back: 0 };
export const worldAt = (f) => {
  const sh = shotAt(f), p = sh.p, w = { props: [], snow: p.snow ?? (sh.light === "storm" ? 1 : 0.12), wind: p.wind ?? 2 };
  if (sh.loc === "deep") { w.snow = 0.15; w.wind = 0.5; }
  if (sh.loc === "tent" || sh.loc === "map") w.snow = 0;
  if (sh.loc === "card") { w.snow = 0.5; w.wind = 6; }
  w.ninnisOpen = f >= NINNIS_FALL && f < CH[2]; w.fallOpen = f >= sa(195) + 26 && f < CH[9];
  if (sh.act === "card") {
    const k = f - sh.a; w.card = { day: p.day, date: p.date, slam: 1 + 0.6 * (1 - eo(prog(k, 4, 12))) * (k >= 4 ? 1 : 0) + (k < 4 ? 3 : 0) };
  }
  if (sh.act === "map") {
    const m = { ...p.map };
    if (p.mapTo) { const t = ss(prog(f, sh.a + 6, sh.b - 6)); for (const [k, v] of Object.entries(p.mapTo)) m[k] = Math.round(lerp(p.map[k] ?? 0, v, t) * 200) / 200; if (p.mapYou) m.you = m.back; }
    if (p.mapLabel && f >= sa(p.mapLabel[1]) + 10) m.label = p.mapLabel[0];
    m.lx = Math.round(clamp(1024 + sh.cam[1][0] * 128, 560, 1500));
    w.map = m;
  }
  if (sh.act === "party") partyProps(f, sh, w);
  if (sh.act === "camp") {
    const bx = p.x, grow = p.build ? ss(prog(f, sa(p.build[0]) + 10, sb(p.build[1]))) : 1;
    if (!p.packed) w.props.push({ id: "camp", k: "makeshift", x: bx, z: -1.2, sx: 1.4, sz: 1.4, sy: 1.4 * Math.max(0.02, grow), ry: 0 });
    w.props.push({ id: "s1", k: f >= CH[6] ? "half" : "sledge", x: bx + 2.6, z: 0.8, ry: 0.2 });
    if (p.ladder) w.props.push({ id: "rope", k: "rope", x: bx + 1.4, y: 0.05, z: 0.9, sy: 1.6, rz: Math.PI / 2 - 0.2 });
  }
  if (sh.act === "edge" && p.rope) w.props.push({ id: "rope", k: "rope", x: XS.ninnis + 0.7, y: -6, z: 0.5, sy: 6.2 });
  if (sh.act === "edge") w.props.push({ id: "s1", k: "sledge", x: XS.ninnis + 6, z: 0.6, ry: 0.1 });
  if (sh.act === "inventory") w.props.push({ id: "s1", k: "sledge", x: p.x + 2.5, z: -0.4, ry: 0.3, load: false });
  if (sh.act === "deep") {
    if (p.ledge) w.props.push({ id: "bags", k: "sunk", x: -1.4, y: -45, z: DZ + 3 });
    if (p.hang) { const y = hangY(f, p); w.props.push({ id: "rope", k: "rope", x: 0.05, y: y + 1.9, z: DZ, sy: Math.max(0.1, -y - 1.9 + 0.3) }); }
  }
  if (sh.act === "fallTop") {
    const ax = XS.fall - 2 + V * (f - (sa(195) + 26)), stop = f >= sa(195) + 26;
    const sx = stop ? XS.fall - 1.4 : ax - 1.9;
    if (p.emerge) w.props.push({ id: "s1", k: "half", x: XS.fall - 3.0, z: -1.2, ry: 0.4 });
    else w.props.push({ id: "s1", k: "half", x: sx, z: 0.2, ry: 0, rz: p.jammed || (stop && f < sa(213)) ? 0.25 : 0, y: p.jammed ? 0.15 : 0 });
    if (stop && !p.emerge) w.props.push({ id: "rope", k: "rope", x: XS.fall - 0.4, y: -4, z: 0.2, sy: 4.6 });
  }
  if (sh.act === "cut") { const sep = p.done ? 0.7 : 0.7 * ss(prog(f, sa(p.at) + 40, sb(p.at))); w.props.push({ id: "s1", k: "half", x: p.x + 0.95 + sep, z: 0 }, { id: "s2", k: "half", x: p.x - 0.95 - sep, z: 0, ry: Math.PI }); }
  if (sh.act === "grave" && !p.empty) w.props.push({ id: "s1", k: "half", x: XS.grave + 4.5, z: 0.6, ry: 0.2 });
  if (sh.act === "cairn") { const mx = cairnMawX(f, sh); w.props.push({ id: "s1", k: "half", x: mx - 1.9, z: p.atCairn ? -27.5 : 0, ry: p.atCairn ? 0.6 : 0 }); }
  if (sh.act === "hut") hutProps(f, sh, w);
  if (sh.act === "portrait" && p.skis) w.props.push({ id: "skis", k: "skis", x: portraitX(f, sh) - 0.2, y: p.y || 0, z: p.z });
  if (sh.act === "empty") w.snow = 1;
  if (sh.act === "cave") { if (p.storm) { w.snow = p.snow ?? 1; w.wind = p.wind ?? 14; } else w.snow = 0; if (p.calm) { w.snow = 1 - ss(prog(f, sa(259), sb(259))); w.wind = 12; } }
  if (sh.loc === "tent") w.lampAt = [TX + 0.6, 0.5, 0.5];
  return w;
};
const hutProps = (f, sh, w) => {
  const p = sh.p;
  if (p.ship === "leaving") w.props.push({ id: "ship", k: "ship", x: -40 - (f - sh.a) * 0.15, z: HZ - 330, ry: 0.3, s: 1 });
  if (p.ship === "arriving") w.props.push({ id: "ship", k: "ship", x: 60 - (f - sh.a) * 0.08, z: HZ - 260, ry: Math.PI + 0.2, s: 1 });
  if (p.ship === "far") w.props.push({ id: "ship", k: "ship", x: -150 - (f - sh.a) * 0.15, z: HZ - 500, ry: 0.5, s: 1 });
  if (p.ship === "turn") { const t = ss(prog(f, sa(p.t0), sb(p.t0))); w.props.push({ id: "ship", k: "ship", x: -80, z: HZ - 380, ry: 0.5 + t * 2.4, s: 1 }); }
  if (p.ship === "leave2") w.props.push({ id: "ship", k: "ship", x: -80 - (f - sh.a) * 0.2, z: HZ - 420, ry: 2.9, s: 1 });
};

// ---------- actors ----------
const person = (id, outfit, outfitKey, x, z, opts, extra = {}) => ({ kind: "person", id, outfit, outfitKey, x, z, y: 0, opts: { seed: 3, ...opts }, ...extra });
const SEED = { maw: 3, mer: 7, nin: 5 };
const mawOut = (p) => (p.out === "gaunt" ? [MAWSON_GAUNT, "mawg"] : p.out === "thin" ? [MAWSON_THIN, "mawt"] : p.out === "cap" ? [MAWSON_CAP, "mawc"] : [MAWSON, "maw"]);
const merOut = (p) => (p.out === "thin" || p.sick ? [MERTZ_SICK, "mers"] : [MERTZ, "mer"]);
const walker = (id, o, key, x, z, f, seed, opts = {}, still = false, rate = 1) => still
  ? person(id, o, key, x, z, { mode: "stand", expr: opts.expr || "neutral", seed, blink: blinkAt(f, seed), headTilt: bob(f, seed), facing: opts.facing ?? 1, ...opts })
  : { ...person(id, o, key, x, z, { mode: "march", phase: ((f * 0.045 * rate) + seed * 0.3) % 1, expr: opts.expr || "neutral", seed, tilt: opts.tilt || 0, blink: blinkAt(f, seed) }), side: true, dir: [1, 0] };
const dog = (id, v, x, z, f, o = {}) => ({ kind: "dog", id, v, x, z, y: o.y ?? 0, phase: o.still ? 0 : ((f * 0.09 * (o.rate ?? 1)) + hash(v + id.length) ) % 1, still: o.still, tired: o.tired, lie: o.lie, pant: o.pant, dir: [1, 0], s: o.s ?? 1 });
const label = (id, text, x, y, z, f, a, col, sc = 1) => ({ kind: "label", id, text, col, x, y, z, s: back(prog(f, a, a + 8)) * sc, blob: false, glow: true });

const partyProps = (f, sh, w) => {
  const p = sh.p, ax = anchorAt(f, sh), d1 = !!p.d1, ninGone = d1 && f >= NINNIS_FALL;
  if (p.sledges === "half") w.props.push({ id: "s1", k: "half", x: ax, z: 0 });
  else if (p.sledges !== 0) {
    w.props.push({ id: "s1", k: "sledge", x: ax, z: 0 });
    if ((p.all || d1) && !ninGone) w.props.push({ id: "s2", k: "sledge", x: ax - 6, z: 0 });
  }
  if (p.sail) w.props.push({ id: "sail", k: "sail", x: ax + 0.3, z: 0, y: 0.4 });
  if (p.ski && !ninGone) w.props.push({ id: "skis", k: "skis", x: ax + 8 - 0.2, z: 0.3 });
  else if (p.ski && d1) w.props.push({ id: "skis", k: "skis", x: ax + 8 - 0.2, z: 0.3 });
};
const partyActors = (f, sh, out) => {
  const p = sh.p, ax = anchorAt(f, sh), d1 = !!p.d1, ninGone = d1 && f >= NINNIS_FALL, still = p.still || (d1 && f >= 2330), rate = p.slow ?? 1;
  const [mo, mk] = mawOut(p), [eo2, ek] = merOut(p);
  const nd = p.dogs ?? 0;
  // dog teams: two rows in front of each sledge
  const team = (base, n, tag) => { for (let i = 0; i < Math.min(n, 6); i++) { const row = i % 2 ? -0.45 : 0.45, col = Math.floor(i / 2); out.push(dog(tag + i, i + (tag === "b" ? 2 : 0), base + 1.9 + col * 1.0 + (i % 2) * 0.3, row, f, { still, tired: f > CH[2] && !d1, rate: rate * 1.2 })); } };
  if (!p.pull && !p.solo && p.sledges !== 0) team(ax, nd, "a");
  if ((p.all || d1) && !ninGone) team(ax - 6, nd, "b");
  if (p.dogRide) out.push(dog("ride", 3, ax - 0.2, 0.05, f, { still: true, lie: true, y: 0.62, tired: true }));
  if (p.pull) {
    out.push(walker("maw", mo, mk, ax + LAY.pullMaw[0], LAY.pullMaw[1], f, 3, { expr: p.mawExpr || "stern", tilt: 14 }, still, rate));
    if (!p.solo) out.push(walker("mer", eo2, ek, ax + LAY.pullMer[0], LAY.pullMer[1], f, 7, { expr: p.merExpr || "neutral", tilt: 14 }, still, rate));
    if (nd > 0) out.push(dog("a0", 0, ax + 1.4, -0.9, f, { still, tired: true, rate }));
    if (p.hearts && f > sa(96)) out.push({ kind: "heart", id: "ht", x: ax + 3.3, y: 2.3 + 0.1 * Math.sin(f * 0.2), z: -0.35, s: 0.35 * back(prog(f, sa(96), sa(96) + 8)), blob: false });
    return;
  }
  if (p.solo) {
    out.push(walker("maw", mo, mk, ax + LAY.solo[0], LAY.solo[1], f, 3, { expr: p.mawExpr || "stern", tilt: still ? 0 : 14 }, still, rate));
    if (p.ride) out.push(person("mer", MERTZ_SICK, "mers", ax - 0.2, 0.0, { mode: "sit", expr: "dazed", seed: 7, blink: 1 }, { y: 0.42 }));
    if (p.q && f >= sa(p.q)) out.push({ kind: "question", id: "q", x: ax + 1.9, y: 2.6, z: 0, s: 0.6 * back(prog(f, sa(p.q), sa(p.q) + 8)), blob: false });
    return;
  }
  // standard: Mawson beside sledge 1, Mertz on skis out in front (day 1/intro) or beside, Ninnis beside sledge 2
  let mawExpr = p.mawExpr || "neutral", mawOpts = {};
  if (p.mawLook) mawOpts = { facing: -1, look: -1 };
  if (p.mawTurn) mawExpr = f > sb(32) - 10 ? "shock" : "nervous";
  if (d1 && f >= 2330) mawExpr = "shock";
  out.push(walker("maw", mo, mk, ax + LAY.mawson[0], LAY.mawson[1], f, 3, { expr: mawExpr, ...mawOpts }, still || p.mawLook || p.mawTurn, rate));
  if (p.ski) {
    const warn = p.warn && f > sa(27) + 6;
    out.push(walker("mer", MERTZ, "mer", ax + 8, 0.3, f, 7, { expr: warn ? "shock" : "smile", ...(warn ? { wave: 1 } : {}) }, still || warn, rate * 0.6));
    if (warn && f > sa(28)) out.push({ kind: "exclaim", id: "ex", x: ax + 8.4, y: 2.25, z: 0.3, s: 0.5 * back(prog(f, sa(28), sa(28) + 6)), blob: false });
  } else if (!p.two || true) out.push(walker("mer", eo2, ek, ax + LAY.mertzSide[0], LAY.mertzSide[1], f, 7, { expr: p.merExpr || "neutral" }, still, rate));
  if ((p.all || d1) && !ninGone) out.push(walker("nin", NINNIS, "nin", ax - 6.2, 1.25, f, 5, { expr: "smile" }, still, rate));
  if (p.loadLabels) [[23, "TENT"], [25, "FOOD"], [26, "ALL THE DOG FOOD"]].forEach(([si, t], k) => { if (f >= sa(si)) out.push(label("ll" + k, t, ax - 6 + (k - 1) * 0.2, 1.7 + k * 0.5, 0.3, f, sa(si), k === 2 ? "#ff6a4a" : "#ffe14a")); });
  if (p.harness) out.push({ kind: "label", id: "lab", text: "GINGER", x: ax + 2.2, y: 1.2, z: 0, s: 0.6, blob: false, glow: true });
};

const hangY = (f, p) => {
  if (p.fallIn) { const t = eo(prog(f, sa(p.fallIn[0]), sa(p.fallIn[1]))); return lerp(0.5, -7, t) + (f >= sa(p.fallIn[1]) - 2 ? 0 : 0); }
  if (p.climb) return lerp(p.y0, p.y1, ss(prog(f, sa(p.climb[0]), sa(p.climb[1]))));
  if (p.slip) { if (f < p.slip[0]) return p.y0; return lerp(p.y0, p.y1, eo(prog(f, p.slip[0], p.slip[0] + 10))); }
  return p.y ?? -7;
};
const portraitX = (f, sh) => (sh.p.glide ? sh.p.x + 0.07 * (f - sh.a) : sh.p.x);
const cairnMawX = (f, sh) => { const p = sh.p; if (p.atCairn) return XS.cairn + 1.2 + 1.9; if (p.walk) return XS.cairn - 17.9 + V * (f - sh.a) * 0.6; return XS.cairn - 17.6; };

export const actorsAt = (f) => {
  const sh = shotAt(f), p = sh.p, out = [];
  switch (sh.act) {
    case "party": partyActors(f, sh, out);
      if (p.label && f >= sa(p.label[1]) + 6) out.push(label("lab", p.label[0], anchorAt(f, sh) - 1, 2.8, 0, f, sa(p.label[1]) + 6, p.label[2]));
      break;
    case "portrait": {
      const x = portraitX(f, sh), y = p.y || 0;
      const opts = { mode: "stand", expr: p.expr, seed: SEED[p.key?.slice(0, 3)] || 3, blink: blinkAt(f, 3), headTilt: bob(f, 3), facing: p.facing ?? 0, ...(p.wave ? { wave: 0.6 + 0.4 * Math.sin(f * 0.2) } : {}) };
      if (p.glide) out.push({ ...person("pp", p.who, p.key, x, p.z, { ...opts, mode: "stroll", phase: 0 }), side: true, dir: [1, 0], y });
      else out.push(person("pp", p.who, p.key, x, p.z, opts, { y, ground: y }));
      if (p.dogs) out.push(dog("pd", 0, x + 1.2, 0.4, f, { still: true, pant: 1 }));
      if (p.label) { const [t, si] = Array.isArray(p.label) ? p.label : [p.label, sh.si]; if (f >= sa(si) + 6) out.push(label("lab", t, x, y + 0.85, p.z + 0.6, f, sa(si) + 6, undefined, 0.6)); }
      if (p.labels) for (const [si, t] of p.labels) if (f >= sa(si) && (f < sa(si + 1) || si === p.labels[p.labels.length - 1][0])) out.push(label("lab", t, x + 0.9, y + 0.8, p.z + 0.3, f, sa(si), "#ff9a6a"));
      if (p.hearts && f > sh.a + 20) out.push({ kind: "heart", id: "ht", x: x - 0.55, y: 1.9 + 0.06 * Math.sin(f * 0.2), z: p.z + 0.2, s: 0.3 * back(prog(f, sh.a + 20, sh.a + 28)), blob: false });
      break;
    }
    case "hut": hutActors(f, sh, out); break;
    case "edge": {
      const run = p.run ? ss(prog(f, sh.a, sh.b)) : 1, ex = XS.ninnis + 2.0;
      const lean = { mode: "stand", tilt: -16, facing: -1, look: -1 };
      out.push(person("maw", MAWSON, "maw", lerp(ex + 6, ex, run), 0.9, { ...lean, expr: p.service ? "neutral" : p.shout ? "O" === "O" ? "shock" : "shock" : "nervous", seed: 3, blink: p.service ? 1 : blinkAt(f, 3), ...(p.shout ? { wave: 1 } : {}) }, p.run && run < 1 ? { side: false } : {}));
      out.push(person("mer", MERTZ, "mer", lerp(ex + 7, ex + 0.3, run), -0.6, { ...lean, expr: p.service ? "neutral" : "nervous", seed: 7, blink: p.service ? 1 : blinkAt(f, 7) }));
      if (p.service) out.push({ kind: "diary", id: "dy", x: ex - 0.2, y: 1.05, z: 1.3, s: 0.6, blob: false });
      for (let i = 0; i < 6; i++) out.push(dog("e" + i, i, XS.ninnis + 4.5 + (i % 3) * 1.0, 0.0 + Math.floor(i / 3) * 0.9, f, { still: true, tired: true }));
      break;
    }
    case "deep": {
      if (p.ledge) out.push(dog("ld", 2, -1.6, DZ + 1.6, f, { still: true, lie: true, tired: true, y: -45 }));
      if (p.ledge && p.label && f >= sa(p.label[1]) + 4) out.push(label("lab", p.label[0], -0.3, -41.5, DZ + 3.5, f, sa(p.label[1]) + 4));
      if (p.hang) {
        const y = hangY(f, p), sway = p.spin ? Math.sin(f * 0.05) * 0.25 : Math.sin(f * 0.04) * 0.08;
        const falling = p.fallIn && f < sa(p.fallIn[1]), slipping = p.slip && f >= p.slip[0] && f < p.slip[0] + 10;
        out.push(person("maw", MAWSON_GAUNT, "mawg", 0, DZ, { mode: falling || slipping ? "fall" : "stand", expr: p.expr || (falling ? "shock" : "pained"), seed: 3, wave: falling ? 0 : 1, blink: blinkAt(f, 3), headTilt: sway * 20 }, { y, roll: sway, blob: false }));
        if (slipping) out.push({ kind: "puff", id: "pf", x: 0.2, y: y + 2.6, z: DZ + 0.2, s: 1.0, t: prog(f, p.slip[0], p.slip[0] + 14), blob: false });
      }
      break;
    }
    case "tent": {
      const [mo, mk] = mawOut(p), sick = p.sick;
      out.push(person("maw", mo, mk, TX - 0.45, 0.1, { mode: "sit", expr: p.mawExpr || p.expr || (p.sleep || p.wake ? "neutral" : sick ? "pained" : "neutral"), seed: 3, blink: p.sleep || (p.wake && f < sh.a + 20) ? 1 : blinkAt(f, 3), facing: 1 }, { s: 0.85 }));
      if (!p.solo) out.push(person("mer", sick ? MERTZ_SICK : MERTZ, sick ? "mers" : "mer", TX + 0.45, 0.1, { mode: "sit", expr: p.mertzSleep || p.sleep ? "neutral" : sick ? "dazed" : p.ration ? "nervous" : "smile", seed: 7, blink: p.mertzSleep || p.sleep ? 1 : blinkAt(f, 7), facing: -1 }, { s: 0.85 }));
      out.push({ kind: "bag", id: "bg1", x: TX - 0.45, y: 0, z: 0.45, s: 1.2, sy: 0.6, blob: false });
      if (!p.solo) out.push({ kind: "bag", id: "bg2", x: TX + 0.45, y: 0, z: 0.45, s: 1.2, sy: 0.6, blob: false });
      if (p.diary) out.push({ kind: "diary", id: "dy", x: TX - 0.3, y: 0.22, z: 0.62, s: 0.36, blob: false });
      if (p.merDiary) out.push({ kind: "diary", id: "dy", x: TX + 0.35, y: 0.22, z: 0.62, s: 0.36, blob: false });
      if (p.stove || p.ration) out.push({ kind: "stove", id: "st", x: TX + 0.1, y: 0, z: 0.35, s: 0.7, blob: false });
      if (p.ration) out.push({ kind: "food", id: "fd", x: TX - 0.12, y: 0, z: 0.55, s: 0.28, blob: false });
      if (p.sleep || (p.wake && f < sh.a + 24)) out.push({ kind: "zzz", id: "zz", x: TX + 0.1, y: 1.4 + 0.05 * Math.sin(f * 0.1), z: 0.3, s: 0.5, blob: false });
      if (p.q) out.push({ kind: "question", id: "q", x: TX - 0.45, y: 1.6, z: 0.2, s: 0.4 * back(prog(f, sh.a + 6, sh.a + 14)), blob: false });
      if (p.labels) for (const [si, t] of p.labels) if (f >= sa(si) && (f < sa(si + 1) || si === p.labels[p.labels.length - 1][0])) out.push(label("lab", t, TX, 1.55, 0.5, f, sa(si), "#ff9a6a", 0.45));
      if (p.label && f >= sa(p.label[1]) + 4) out.push(label("lab", p.label[0], TX + 0.3, 1.55, 0.5, f, sa(p.label[1]) + 4, undefined, 0.45));
      break;
    }
    case "camp": {
      const bx = p.x;
      if (p.build) {
        const inside = p.enter && f > sh.a + (sh.b - sh.a) * 0.6;
        if (!inside) { out.push(person("mer", MERTZ, "mer", bx + 1.1, 0.2, { mode: "stand", expr: "smile", seed: 7, wave: 0.5 + 0.5 * Math.sin(f * 0.15), blink: blinkAt(f, 7), facing: -1 })); out.push(person("maw", MAWSON, "maw", bx - 1.4, 0.6, { mode: "stand", expr: "neutral", seed: 3, blink: blinkAt(f, 3), facing: 1 })); }
      } else if (p.packed) {
        out.push(person("maw", MAWSON, "maw", bx + 1.6, 1.3, { mode: "stand", expr: "stern", seed: 3, blink: blinkAt(f, 3), wave: 0.4 + 0.3 * Math.sin(f * 0.2) }));
        out.push(person("mer", MERTZ, "mer", bx + 3.8, -0.4, { mode: "stand", expr: "neutral", seed: 7, blink: blinkAt(f, 7), facing: -1 }));
        for (let i = 0; i < 5; i++) out.push(dog("c" + i, i, bx + 5 + (i % 3), 1 + Math.floor(i / 3) * 0.9, f, { still: true, tired: true }));
      } else if (p.ladder) {
        out.push(person("maw", MAWSON_GAUNT, "mawg", bx + 0.6, 0.9, { mode: "sit", expr: "stern", seed: 3, blink: blinkAt(f, 3), wave: 0.3 + 0.2 * Math.sin(f * 0.25) }));
      }
      break;
    }
    case "inventory": {
      const items = [[46, "stove", -1.8, 1.2], [47, "fuel", -0.6, 1.1], [48, "bag", 0.7, 1.4], [50, "food", 2.2, 1.2]];
      for (const [si, k, dx, sc] of items) if (f >= sa(si)) out.push({ kind: k, id: "i" + k, x: p.x + dx, y: 0, z: 1.8, s: sc * back(prog(f, sa(si), sa(si) + 7)), blob: true });
      if (f >= sa(49)) for (let i = 0; i < 6; i++) out.push(dog("iv" + i, i, p.x - 1.8 + i * 0.75, 0.2, f, { still: true, tired: true, s: 0.8 * back(prog(f, sa(49) + i * 2, sa(49) + i * 2 + 6)) }));
      if (f >= sa(50) + 8) out.push(label("lab", "10 DAYS", p.x + 2.2, 1.35, 1.9, f, sa(50) + 8, "#ff6a4a", 0.7));
      out.push(person("maw", MAWSON, "maw", p.x - 2.4, -1.4, { mode: "stand", expr: "nervous", seed: 3, blink: blinkAt(f, 3), facing: 1 }));
      out.push(person("mer", MERTZ, "mer", p.x + 3.6, -1.4, { mode: "stand", expr: "nervous", seed: 7, blink: blinkAt(f, 7), facing: -1 }));
      break;
    }
    case "dogs": {
      const names = p.names || [];
      for (let i = 0; i < p.n; i++) {
        let gone = false, fade = 1;
        names.forEach(([si], k) => { if (i === k && f >= sa(si)) { gone = f >= sa(si) + 8; fade = 1 - prog(f, sa(si), sa(si) + 8); } });
        if (p.one && i !== 0) continue;
        if (gone) continue;
        out.push(dog("g" + i, i, p.one ? p.x : p.x - (p.n - 1) * 0.5 + i * 1.0, 0, f, { still: true, lie: !!p.lie, tired: !p.stand, pant: p.stand, s: fade }));
        names.forEach(([si, t], k) => { if (i === k && f >= sa(si) && f < sa(si) + 8) out.push(label("nl", t, p.x - (p.n - 1) * 0.5 + i * 1.0, 1.4, 0.1, f, sa(si))); });
      }
      if (p.label && f >= sa(p.label[1]) + 4) out.push(label("lab", p.label[0], p.x, p.stand ? 1.4 : 1.15, 0.3, f, sa(p.label[1]) + 4, p.label[2], 0.7));
      if (p.men) { out.push(person("maw", MAWSON, "maw", p.x - 4.2, -0.8, { mode: "stand", expr: "pained", seed: 3, blink: 1, facing: 1 })); out.push(person("mer", MERTZ, "mer", p.x - 3.2, -1.2, { mode: "stand", expr: "pained", seed: 7, blink: 1, facing: 1 })); }
      break;
    }
    case "sitpair": {
      if (!p.merOnly || true) out.push(person("mer", MERTZ_SICK, "mers", p.x + 0.6, 0, { mode: "sit", expr: p.hold ? "smile_closed" : "pained", seed: 7, blink: blinkAt(f, 7) }));
      if (!p.merOnly) out.push(person("maw", MAWSON_THIN, "mawt", p.x - 0.5, 0.25, { mode: "stand", expr: p.hold ? "smile_closed" : "nervous", seed: 3, blink: blinkAt(f, 3), facing: 1, ...(p.hold ? { wave: 0.35 } : {}) }));
      w0(out, p, f);
      break;
    }
    case "grave": {
      if (!p.empty) out.push(person("maw", MAWSON_THIN, "mawt", XS.grave + 1.6, -1.6, { mode: "stand", expr: "neutral", seed: 3, blink: 1, headTilt: -6, facing: -1 }));
      break;
    }
    case "cut": {
      if (!p.empty) out.push(person("maw", MAWSON_THIN, "mawt", p.x - 0.2, 1.1, { mode: "sit", expr: "stern", seed: 3, blink: blinkAt(f, 3), wave: p.done ? 0 : 0.4 + 0.4 * Math.sin(f * 0.6) }));
      if (!p.done) { const k = prog(f, sa(p.at) + 40, sa(p.at) + 60); if (k > 0 && k < 1) out.push({ kind: "puff", id: "pf", x: p.x, y: 0.2, z: 0.4, s: 0.8, t: k, blob: false }); }
      if (p.label && f >= sa(p.label[1]) + 4) out.push(label("lab", p.label[0], p.x + 0.6, 1.25, 0.4, f, sa(p.label[1]) + 4, undefined, 0.6));
      break;
    }
    case "feet": {
      out.push(person("maw", MAWSON_GAUNT, "mawg", p.x + 0.4, 0, { mode: "sit", expr: p.expr || "nervous", seed: 3, blink: blinkAt(f, 3) }));
      out.push({ kind: "bag", id: "boots", x: p.x + 1.3, y: 0, z: 0.4, s: 0.5, blob: true });
      if (p.exclaim && f > sa(p.exclaim) + 10) out.push({ kind: "exclaim", id: "ex", x: p.x + 0.9, y: 1.5, z: 0.1, s: 0.45 * back(prog(f, sa(p.exclaim) + 10, sa(p.exclaim) + 16)), blob: false });
      if (p.tin) out.push({ kind: "tin", id: "tin", x: p.x + 0.0, y: 0, z: 0.6, s: 0.45, blob: true });
      break;
    }
    case "fallTop": {
      const fallF = sa(195) + 26, mx = f < fallF ? XS.fall - 2 + V * (f - fallF) + 1.9 - 1.9 + 0.0 : XS.fall;
      if (f < fallF) out.push(walker("maw", MAWSON_GAUNT, "mawg", XS.fall - 2 + V * (f - fallF) + 2, 0.2, f, 3, { expr: "stern", tilt: 14 }, false));
      else if (f < fallF + 8) out.push(person("maw", MAWSON_GAUNT, "mawg", XS.fall, 0.2, { mode: "fall", expr: "shock", seed: 3 }, { y: -0.3 * (f - fallF), blob: false }));
      if (f >= fallF && f < fallF + 16) out.push({ kind: "puff", id: "pf", x: XS.fall, y: 0.1, z: 0.3, s: 1.2, t: prog(f, fallF, fallF + 16), blob: false });
      if (p.emerge) { const t = ss(prog(f, sa(p.emerge[0]), sb(p.emerge[1]))); out.push(person("maw", MAWSON_GAUNT, "mawg", XS.fall - 1.1 * t, 0.2, { mode: t < 0.95 ? "stand" : "sit", expr: "pained", seed: 3, wave: 1 - t, blink: blinkAt(f, 3) }, { y: lerp(-1.8, 0, t), blob: t > 0.9 })); }
      break;
    }
    case "cairn": {
      const mx = cairnMawX(f, sh);
      if (p.walk) out.push(walker("maw", MAWSON_GAUNT, "mawg", mx, 0, f, 3, { expr: "pained", tilt: 12 }, false, 0.6));
      else if (!p.atCairn) out.push(person("maw", MAWSON_GAUNT, "mawg", mx, 0, { mode: "stand", expr: p.look ? "shock" : "pained", seed: 3, blink: blinkAt(f, 3), facing: p.look ? -1 : 0, look: p.look ? -1 : 0 }));
      else out.push(person("maw", MAWSON_GAUNT, "mawg", XS.cairn + 1.2, -29, { mode: "stand", expr: p.expr || (p.reading ? (f > sa(233) ? "shock" : "nervous") : "relief_open"), seed: 3, blink: blinkAt(f, 3), facing: -1 }));
      if (p.look && f > sh.a + 12) out.push({ kind: "exclaim", id: "ex", x: mx + 0.35, y: 2.3, z: 0, s: 0.45 * back(prog(f, sh.a + 12, sh.a + 18)), blob: false });
      if (p.food && f >= sa(p.food)) out.push({ kind: "food", id: "fd", x: XS.cairn + 0.5, y: 0, z: -28.6, s: 0.5 * back(prog(f, sa(p.food), sa(p.food) + 7)) });
      if ((p.note && f >= sa(p.note)) || p.reading) out.push({ kind: "note", id: "nt", x: XS.cairn + 1.25, y: 1.05, z: -28.5, s: 0.45, blob: false });
      if (p.party3) for (let i = 0; i < 3; i++) out.push(walker("hp" + i, hutman(i), "hm" + i, XS.cairn - 60 + i * 1.2 - (f - sh.a) * 0.02, -90 - i * 0.6, f, 11 + i, { expr: "neutral" }, false));
      if (p.label && f >= sa(p.label[1]) + 4) out.push(label("lab", p.label[0], XS.cairn, 3.9, -30, f, sa(p.label[1]) + 4, undefined, 2.2));
      break;
    }
    case "cave": {
      if (p.enter) { const t = ss(prog(f, sh.a, sh.b)); out.push(walker("maw", MAWSON_GAUNT, "mawg", CX + lerp(-0.4, -0.2, t), lerp(-3.5, -0.5, t), f, 3, { expr: "pained" }, false)); out[out.length - 1].dir = [0, 1]; out[out.length - 1].side = false; out[out.length - 1].opts.mode = "march"; }
      if (p.sit) out.push(person("maw", MAWSON_CAP, "mawc", CX - 0.4, 0.4, { mode: "sit", expr: p.expr || "neutral", seed: 3, blink: blinkAt(f, 3), facing: p.look ? -1 : 1 }, { s: 0.85 }));
      if (p.fruit !== undefined) {
        const t0 = p.fruit ? sa(p.fruit) : -1e9;
        [["orange", 1.3, 1.5], ["orange", 1.55, 1.25], ["orange", 1.8, 1.5], ["pineapple", 2.0, 1.25]].forEach(([k, x, z], i) => { if (f >= t0 + i * 8) out.push({ kind: k, id: "fr" + i, x: CX + x, y: 0.6, z, s: (k === "pineapple" ? 0.7 : 0.35) * back(prog(f, t0 + i * 8, t0 + i * 8 + 6)), blob: false }); });
      }
      if (p.crampon) out.push({ kind: "crampon", id: "cr", x: CX - 0.15, y: 0.25, z: 0.75, s: 0.5, blob: false });
      if (p.labels) for (const [si, t] of p.labels) if (f >= sa(si) && (f < sa(si + 1) || si === p.labels[p.labels.length - 1][0])) out.push(label("lab", t, CX - 0.4, 1.5, 0.7, f, sa(si), "#ffe14a", 0.5));
      break;
    }
    case "meet": {
      const my = slopeY(92); out.push(person("maw", MAWSON_GAUNT, "mawg", 0, HZ + 92.2, { mode: "stand", expr: p.ask ? "dazed" : "relief", seed: 3, blink: blinkAt(f, 3) }, { y: my, ground: my }));
      for (let i = 0; i < 3; i++) out.push(person("hm" + i, hutman(i), "hm" + i, 1.1 + i * 0.9 - (i === 2 ? 2.9 : 0), HZ + 91.6 - i * 0.2, { mode: "stand", expr: i === 0 && p.ask ? "shock" : "relief_open", seed: 11 + i, blink: blinkAt(f, 11 + i), facing: i === 2 ? 1 : -1 }, { y: slopeY(91.6 - i * 0.2), ground: slopeY(91.6 - i * 0.2) }));
      if (p.ask && f > sh.a + 16) out.push({ kind: "question", id: "q", x: 1.1, y: my + 2.5, z: HZ + 91.6, s: 0.4 * back(prog(f, sh.a + 16, sh.a + 22)), blob: false });
      break;
    }
    case "card": if (p.end && f > sh.a + 30) out.push({ kind: "question", id: "q", x: 6.2, y: 1.6, z: KZ + 0.5, s: 1.6 * back(prog(f, sh.a + 30, sh.a + 38)), blob: false, glow: true }); break;
  }
  return out;
};
const w0 = () => {};
const hutActors = (f, sh, out) => {
  const p = sh.p;
  if (p.men) {
    for (let i = 0; i < p.men; i++) {
      const bx = 5.6 + i * 1.3, bz = HZ - 4 - (i % 2) * 1.4;
      if (p.runUp) { const t = prog(f, sa(p.runUp[0]) + 20, sb(p.runUp[1])); const zr = bz - HZ + 90 * t; out.push({ ...walker("hm" + i, hutman(i), "hm" + i, bx - 4 * t, HZ + zr, f, 11 + i, { expr: "relief_open" }, false, 2.2), dir: [-0.1, 1], y: slopeY(zr), ground: slopeY(zr) }); continue; }
      out.push(person("hm" + i, hutman(i), "hm" + i, bx, bz, { mode: "stand", expr: p.lookUp ? (f > sh.a + 10 ? "shock" : "neutral") : p.lean ? "pained" : "neutral", seed: 11 + i, blink: blinkAt(f, 11 + i), facing: p.lookUp ? 1 : 0, look: p.lookUp ? 1 : 0, tilt: p.lean ? -12 : 0, ...(p.work ? { wave: 0.5 + 0.5 * Math.sin(f * 0.2 + i) } : {}) }));
    }
    if (p.maw) out.push(person("maw", MAWSON, "maw", 2.6, HZ - 8.2, { mode: "stand", expr: "stern", seed: 3, blink: blinkAt(f, 3) }));
  }
  if (p.slope) {
    const t = p.walkDown ? prog(f, sa(p.walkDown[0]), sb(p.walkDown[1])) : 0;
    const zr = lerp(130, 102, t), z = HZ + zr, y = slopeY(zr);
    if (p.walkDown) out.push({ ...walker("maw", MAWSON_GAUNT, "mawg", 2, z, f, 3, { expr: "pained" }, false, 0.8), dir: [0, -1], y, ground: y, s: 1 });
    else if (p.mawDown) out.push({ ...walker("maw", MAWSON_GAUNT, "mawg", 1, HZ + 60, f, 3, { expr: "relief" }, false, 0.8), dir: [0, -1], y: slopeY(100), ground: slopeY(100), z: HZ + 100 });
    else out.push(person("maw", MAWSON_GAUNT, "mawg", 2, HZ + 130, { mode: "stand", expr: "pained", seed: 3 }, { y: slopeY(130), ground: slopeY(130) }));
  }
  if (p.label && f >= sa(p.label[1]) + 4) out.push(label("lab", p.label[0], 0, 9, HZ - 6, f, sa(p.label[1]) + 4));
};
