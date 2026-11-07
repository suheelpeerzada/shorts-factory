import React from 'react';
import { registerRoot, Composition, Freeze, useCurrentFrame } from 'remotion';
import { Full, C0, C1 } from './Full.jsx';
import { LOCS } from './times.js';
// Preview: 2 frames per location (at 30 % and 75 %), rendered as a quick image sequence to check framing
const SAMPLES = LOCS.flatMap(([a, b]) => [a + (b - a) * 0.3, a + (b - a) * 0.75]).map((t) => Math.round(t * 30));
const Preview = () => { const f = useCurrentFrame(); return <Freeze frame={SAMPLES[Math.min(f, SAMPLES.length - 1)]}><Full /></Freeze>; };
const Root = () => (<>
  <Composition id="Full" component={Full} durationInFrames={Math.round((C1 - C0) * 30)} fps={30} width={1080} height={1920} />
  <Composition id="Preview" component={Preview} durationInFrames={SAMPLES.length} fps={30} width={1080} height={1920} />
</>);
registerRoot(Root);
