import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Full } from './Full.jsx';
import { DURATION } from './times.js';

const Root = () => <Composition id="Full" component={Full} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1920} />;
registerRoot(Root);
