import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Stage } from './Stage.jsx';
import { Shot1Scene } from './Shot1.jsx';
import { buildMine, mineCam } from './worlds/mine.js';
import { buildOffice, officeCam } from './worlds/office.js';
import { buildOldSite, oldSiteCam } from './worlds/oldsite.js';
import { buildRoad, roadCam } from './worlds/road.js';
import { DIPS, DURATION } from './times.js';

const FPS = 30;
const f = (s) => Math.round(s * FPS);

const Shot1Canvas = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 80, near: 0.1, far: 1200, position: [0, 5, 20] }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Shot1Scene />
    </ThreeCanvas>
  );
};

// location sequences: [start, end, element]
const LOCS = [
  [0, DIPS[0], () => <Shot1Canvas />],
  [DIPS[0], DIPS[1], (t0) => <Stage build={buildMine} cam={mineCam} t0={t0} focusRange={10} bokeh={2.6} />],
  [DIPS[1], DIPS[2], (t0) => <Stage build={buildOffice} cam={officeCam} t0={t0} focusRange={2.2} bokeh={3.0} />],
  [DIPS[2], DIPS[3], (t0) => <Stage build={buildOldSite} cam={oldSiteCam} t0={t0} focusRange={6} bokeh={3.0} />],
  [DIPS[3], DURATION, (t0) => <Stage build={buildRoad} cam={roadCam} t0={t0} focusRange={7} bokeh={3.0} />],
];

const Dip = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  let o = 0; for (const d of DIPS) o = Math.max(o, 1 - Math.abs(t - d) / 0.2);
  return <AbsoluteFill style={{ backgroundColor: '#f3ead6', opacity: Math.max(0, o) }} />;
};

export const Full = () => (
  <AbsoluteFill style={{ backgroundColor: '#f3ead6' }}>
    {LOCS.map(([a, b, el], i) => (
      <Sequence key={i} from={f(a)} durationInFrames={f(b) - f(a)} layout="none">
        <AbsoluteFill>{el(f(a) / FPS)}</AbsoluteFill>
      </Sequence>
    ))}
    <Dip />
  </AbsoluteFill>
);
