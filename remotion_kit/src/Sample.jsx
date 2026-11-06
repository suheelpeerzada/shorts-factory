import React from 'react';
import { AbsoluteFill, Audio, staticFile, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Shot1Scene } from './Shot1.jsx';

// 5.5-second sample: shot 1 with the narrator's hook.
export const Sample = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#efe4cc' }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 80, near: 0.1, far: 1200, position: [0, 5, 20] }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <Shot1Scene />
      </ThreeCanvas>
      <Audio src={staticFile('voiceover_sample.wav')} />
    </AbsoluteFill>
  );
};
