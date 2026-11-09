// Generic composition: one <Sequence>/<Stage> per location (scenes.js), dips, title card, one-word captions that
// sit TOP or BOTTOM, whichever side the subject is not on (camera focus projected to the screen at each word).
import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Stage } from './Stage.jsx';
import { Captions, TitleCard } from './Overlays.jsx';
import { SCENES } from './scenes.js';
import { LOCS, INNER_CUTS, TIME_SKIPS, WORDS, SPEAKER_COLORS, TITLE, DURATION } from './times.js';
import { CLIP } from './clip.js';

const FPS = 30, f = (s) => Math.round(s * FPS);
export const C0 = CLIP ? CLIP[0] : 0, C1 = CLIP ? CLIP[1] : DURATION;
const locAt = (t) => LOCS.find(([a, b]) => t >= a && t < b) || LOCS[LOCS.length - 1];

// caption side per word: subject in the upper/middle part of the frame -> caption at the bottom, subject low -> top
const PC = new THREE.PerspectiveCamera(80, 1080 / 1920, 0.1, 1200);
const SIDE = WORDS.map((q) => {
  const [, , id] = locAt(q.s + 0.05); const c = SCENES[id].cam(q.s + 0.05);
  if (c.cap) return c.cap;
  PC.position.copy(c.pos); PC.lookAt(c.look); PC.updateMatrixWorld();
  const p = (c.focus || c.look).clone().project(PC);
  return p.y > -0.18 ? 'bottom' : 'top';
});
const SMOOTH = SIDE.map((s, i) => { // majority of 5 neighbours inside the same location: no flip-flopping
  const id = locAt(WORDS[i].s + 0.05)[2]; let b = 0, n = 0;
  for (let k = i - 2; k <= i + 2; k++) if (k >= 0 && k < SIDE.length && locAt(WORDS[k].s + 0.05)[2] === id) { n++; if (SIDE[k] === 'bottom') b++; }
  return b * 2 >= n ? 'bottom' : 'top';
});

const Dip = () => {
  const t = C0 + useCurrentFrame() / FPS; let o = 0, col = '#05070d';
  for (const c of [...LOCS.slice(1).map((l) => l[0]), ...INNER_CUTS]) {
    const long = TIME_SKIPS.includes(c), hw = long ? 0.3 : 0.09;
    const k = 1 - Math.abs(t - c) / hw; if (k > o) { o = k; col = long ? '#f3ead6' : '#05070d'; }
  }
  if (t > DURATION - 0.35) { const k = (t - (DURATION - 0.35)) / 0.35; if (k > o) { o = k; col = '#05070d'; } }
  return <AbsoluteFill style={{ backgroundColor: col, opacity: Math.max(0, Math.min(1, o)) }} />;
};

export const Full = () => {
  const words = WORDS.map((q, i) => ({ ...q, side: SMOOTH[i] })).filter((q) => q.e > C0 && q.s < C1).map((q) => ({ ...q, s: Math.max(0, q.s - C0), e: q.e - C0 }));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      {LOCS.filter(([a, b]) => b > C0 && a < C1).map(([a, b, id]) => {
        const S = SCENES[id]; const a2 = Math.max(a, C0), b2 = Math.min(b, C1);
        return (
          <Sequence key={id + a} from={f(a2) - f(C0)} durationInFrames={f(b2) - f(a2)} layout="none">
            <AbsoluteFill><Stage build={S.build} cam={S.cam} t0={f(a2) / FPS} focusRange={S.focusRange || 3} bokeh={2.6} bloom={S.bloom ?? 1.0} bloomThreshold={S.bloomThreshold ?? 0.62} grade={S.grade || { sat: 0.16, contrast: 0.1 }} /></AbsoluteFill>
          </Sequence>
        );
      })}
      <Dip />
      {C0 < TITLE.until ? <TitleCard TITLE={TITLE} /> : null}
      <Captions WORDS={words} SPEAKER_COLORS={SPEAKER_COLORS} after={Math.max(0, TITLE.until - C0)} y={(i) => (words[i].side === 'top' ? '14%' : '67%')} />
    </AbsoluteFill>
  );
};
