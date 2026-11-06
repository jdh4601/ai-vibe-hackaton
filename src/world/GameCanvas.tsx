import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls, Sky } from '@react-three/drei';
import { Bloom, EffectComposer, SMAA } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { Suspense, type ReactNode } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { Backdrop } from './Backdrop';
import { Buildings } from './Buildings';
import { Landmarks } from './Landmarks';
import { Plaza } from './Plaza';
import { Trees } from './Trees';

export const KEYBOARD_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'interact', keys: ['KeyE'] },
];

const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
const LOW_QUALITY = params.get('quality') === 'low';
const CAM = params.get('cam'); // debug cameras: 'top' | 'fountain'

// Debug/screenshot camera (?cam=top|fountain): overrides the follow camera each frame. Mounted after children.
function TopCam() {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    if (CAM === 'fountain') {
      camera.position.set(0, 1.8, 6);
      camera.lookAt(0, 1.6, -20);
    } else {
      camera.position.set(0, 150, 38);
      camera.lookAt(0, 0, -12);
    }
  });
  return null;
}

// Track A owns this file: lighting, sky, post-processing, and the world meshes.
// Actors from other tracks (Player, NPCs, ...) are passed in as children and render inside <Physics>.
export function GameCanvas({ children }: { children?: ReactNode }) {
  const paused = useGameStore((s) => s.phase === 'minigame');
  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <Canvas
        shadows={!LOW_QUALITY}
        dpr={LOW_QUALITY ? 1 : [1, 1.75]}
        camera={{ fov: 55, near: 0.1, far: 1200, position: [0, 4, 56] }}
      >
        <fog attach="fog" args={['#d4e6f2', 140, 700]} />
        <Sky sunPosition={[60, 25, 30]} turbidity={2} rayleigh={2} mieCoefficient={0.003} mieDirectionalG={0.7} />
        <hemisphereLight args={['#dfefff', '#c9a27a', 0.7]} />
        <directionalLight
          position={[40, 60, 20]}
          intensity={2.2}
          color="#fff1d6"
          castShadow={!LOW_QUALITY}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-camera-near={1}
          shadow-camera-far={200}
          shadow-bias={-0.0004}
        />
        <Suspense fallback={null}>
          <Physics paused={paused}>
            <Plaza />
            <Buildings />
            <Landmarks />
            <Trees />
            {children}
          </Physics>
          <Backdrop />
        </Suspense>
        {!LOW_QUALITY && (
          <EffectComposer multisampling={0} frameBufferType={THREE.UnsignedByteType}>
            <Bloom intensity={0.3} luminanceThreshold={0.9} mipmapBlur />
            <SMAA />
          </EffectComposer>
        )}
        {CAM && <TopCam />}
      </Canvas>
    </KeyboardControls>
  );
}
