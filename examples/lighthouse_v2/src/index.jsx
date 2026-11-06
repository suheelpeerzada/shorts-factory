import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Full, C0, C1 } from './Full.jsx';

const Root = () => <Composition id="Full" component={Full} durationInFrames={Math.round((C1 - C0) * 30)} fps={30} width={1080} height={1920} />;
registerRoot(Root);
