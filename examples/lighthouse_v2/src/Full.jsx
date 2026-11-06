import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Stage } from './Stage.jsx';
import { Captions, TitleCard } from './Overlays.jsx';
import { makeExterior, camDusk, camNight1, camBeam, camSink, camMorning } from './worlds/exterior.js';
import { makeRoom, camRoom1, camRoom2, camRoom3, camRoom4 } from './worlds/room.js';
import { buildDeck, camDeck } from './worlds/deck.js';
import { buildHarbour, camHarbour } from './worlds/harbour.js';
import { LOCS, INNER_CUTS, WORDS, SPEAKER_COLORS, TITLE, DURATION } from './times.js';
import { CLIP } from './clip.js';
export const C0 = CLIP ? CLIP[0] : 0, C1 = CLIP ? CLIP[1] : DURATION;

const FPS = 30;
const f = (s) => Math.round(s * FPS);
const NIGHT = { bloom: 1.25, bloomThreshold: 0.55, grade: { sat: 0.18, contrast: 0.08 } };
const DAY = { bloom: 0.6, bloomThreshold: 0.8, grade: { sat: 0.12, contrast: 0.06 } };
const SCENES = {
  dusk: { build: makeExterior('dusk', 'dusk'), cam: camDusk, focusRange: 4, ...DAY, bloom: 0.8, bloomThreshold: 0.7 },
  night1: { build: makeExterior('night', 'night1'), cam: camNight1, focusRange: 14, ...NIGHT },
  room1: { build: makeRoom('room1'), cam: camRoom1, focusRange: 2.2, ...NIGHT },
  deck: { build: buildDeck, cam: camDeck, focusRange: 2.0, ...NIGHT },
  room2: { build: makeRoom('room2'), cam: camRoom2, focusRange: 2.2, ...NIGHT },
  beam: { build: makeExterior('night', 'beam'), cam: camBeam, focusRange: 5, ...NIGHT },
  room3: { build: makeRoom('room3'), cam: camRoom3, focusRange: 2.2, ...NIGHT },
  sink: { build: makeExterior('night', 'sink'), cam: camSink, focusRange: 8, ...NIGHT },
  harbour: { build: buildHarbour, cam: camHarbour, focusRange: 2.5, ...DAY },
  morning: { build: makeExterior('morning', 'morning'), cam: camMorning, focusRange: 2.2, ...DAY },
  room4: { build: makeRoom('room4'), cam: camRoom4, focusRange: 3, ...NIGHT },
};

// quick dips to black on every cut; a longer cream dip for "next morning"
const Dip = () => {
  const t = C0 + useCurrentFrame() / FPS;
  let o = 0, col = '#05070d';
  for (const c of [...LOCS.slice(1).map((l) => l[0]), ...INNER_CUTS]) {
    const long = c === 35.3, hw = long ? 0.3 : 0.09;
    const k = 1 - Math.abs(t - c) / hw; if (k > o) { o = k; col = long ? '#f3ead6' : '#05070d'; }
  }
  if (t > DURATION - 0.35) { const k = (t - (DURATION - 0.35)) / 0.35; if (k > o) { o = k; col = '#05070d'; } }
  return <AbsoluteFill style={{ backgroundColor: col, opacity: Math.max(0, Math.min(1, o)) }} />;
};

export const Full = () => (
  <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
    {LOCS.filter(([a, b]) => b > C0 && a < C1).map(([a, b, id]) => {
      const S = SCENES[id]; const a2 = Math.max(a, C0), b2 = Math.min(b, C1);
      return (
        <Sequence key={id} from={f(a2) - f(C0)} durationInFrames={f(b2) - f(a2)} layout="none">
          <AbsoluteFill><Stage build={S.build} cam={S.cam} t0={f(a2) / FPS} focusRange={S.focusRange} bokeh={2.6} bloom={S.bloom} bloomThreshold={S.bloomThreshold} grade={S.grade} /></AbsoluteFill>
        </Sequence>
      );
    })}
    <Dip />
    {C0 < TITLE.until ? <TitleCard TITLE={TITLE} /> : null}
    <Captions WORDS={WORDS.filter((q) => q.e > C0 && q.s < C1).map((q) => ({ ...q, s: Math.max(0, q.s - C0), e: q.e - C0 }))} SPEAKER_COLORS={SPEAKER_COLORS} after={Math.max(0, TITLE.until - C0)} />
  </AbsoluteFill>
);
