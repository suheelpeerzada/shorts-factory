// One 3D location: builds its world once, drives camera + animation from the frame number,
// renders through the post-processing composer (depth of field + light vignette).
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { EffectComposer, RenderPass, EffectPass, DepthOfFieldEffect, VignetteEffect, BloomEffect, HueSaturationEffect, BrightnessContrastEffect } from 'postprocessing';

export function addLights(scene, { center = [0, 0, 0], key = [-38, 46, 34], keyColor = '#fff0d4', keyI = 2.4, hemiI = 1.15, size = 32, fog = ['#e6dfcb', 48, 360], hemi = ['#d6e4ef', '#8c8a5c'] } = {}) {
  scene.add(new THREE.HemisphereLight(hemi[0], hemi[1], hemiI));
  const k = new THREE.DirectionalLight(keyColor, keyI);
  k.position.set(center[0] + key[0], center[1] + key[1], center[2] + key[2]); k.target.position.set(...center);
  k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
  Object.assign(k.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 1, far: 200 });
  k.shadow.bias = -0.0006; k.shadow.normalBias = 0.03;
  scene.add(k); scene.add(k.target);
  if (fog) scene.fog = new THREE.Fog(...fog);
  return k;
}

// bloom: glow around lamps, beams and bright windows (0 = off). grade: { sat, contrast } colour grade.
const Inner = ({ build, cam, t0, focusRange = 7, bokeh = 3.2, bloom = 0.9, bloomThreshold = 0.62, grade = { sat: 0.12, contrast: 0.06 } }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const fr = useRef(frame); fr.current = frame;
  const { gl, scene, camera, size } = useThree();
  const W = useMemo(() => { const w = build(scene); scene.add(w.root); return w; }, [scene]);
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType });
    composer.addPass(new RenderPass(scene, camera));
    const dof = new DepthOfFieldEffect(camera, { focusDistance: 10, focusRange, bokehScale: bokeh, resolutionScale: 0.5 });
    dof.target = new THREE.Vector3();
    composer.addPass(new EffectPass(camera, dof));
    const fx2 = [];
    if (bloom > 0) fx2.push(new BloomEffect({ intensity: bloom, luminanceThreshold: bloomThreshold, luminanceSmoothing: 0.22, mipmapBlur: true, radius: 0.7 }));
    if (grade) fx2.push(new HueSaturationEffect({ saturation: grade.sat || 0 }), new BrightnessContrastEffect({ contrast: grade.contrast || 0 }));
    fx2.push(new VignetteEffect({ offset: 0.32, darkness: 0.38 }));
    composer.addPass(new EffectPass(camera, ...fx2));
    return { composer, dof };
  }, [gl, scene, camera]);
  useEffect(() => { fx.composer.setSize(size.width, size.height); }, [fx, size]);
  useFrame(() => {
    const t = t0 + fr.current / fps;
    const c = cam(t);
    camera.position.copy(c.pos); camera.lookAt(c.look); camera.updateMatrixWorld();
    fx.dof.target.copy(c.focus || c.look);
    W.update(t, camera);
    fx.composer.render();
  }, 1);
  return null;
};

export const Stage = (props) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 80, near: 0.1, far: 1200, position: [0, 5, 20] }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Inner {...props} />
    </ThreeCanvas>
  );
};
