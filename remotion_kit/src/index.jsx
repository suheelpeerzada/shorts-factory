import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Sample } from './Sample.jsx';
import { Full } from './Full.jsx';
import { DURATION } from './times.js';

const Root = () => (
  <>
    {/* Full video, 1080x1920, silent; render.bat adds voiceover.wav afterwards */}
    <Composition id="Full" component={Full} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1920} />
    {/* 5.5 s sample (shot 1 with audio), 720x1280 */}
    <Composition id="Sample" component={Sample} durationInFrames={165} fps={30} width={720} height={1280} />
  </>
);
registerRoot(Root);
