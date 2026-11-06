import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Sky } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Suspense, type ReactNode } from 'react';
import { MAP_HALF, MAP_SIZE } from '../game/config';
import { useGameStore } from '../stores/useGameStore';

export const KEYBOARD_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'interact', keys: ['KeyE'] },
];

// Track A owns this file: lighting, sky, post-processing, and the world meshes (Plaza, Buildings, ...).
// Actors from other tracks (Player, NPCs, ...) are passed in as children and render inside <Physics>.
export function GameCanvas({ children }: { children?: ReactNode }) {
  const paused = useGameStore((s) => s.phase === 'minigame');
  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <Canvas shadows camera={{ fov: 55, near: 0.1, far: 400, position: [0, 4, 56] }}>
        <Sky sunPosition={[60, 40, -30]} />
        <hemisphereLight args={['#dfefff', '#c9a27a', 0.6]} />
        <directionalLight position={[40, 60, 20]} intensity={1.6} color="#fff1d6" castShadow />
        <Suspense fallback={null}>
          <Physics paused={paused}>
            {/* Phase 0 spike ground; track A replaces with <Plaza /> and friends */}
            <RigidBody type="fixed" colliders={false}>
              <CuboidCollider args={[MAP_HALF, 0.5, MAP_HALF]} position={[0, -0.5, 0]} />
              <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
                <meshStandardMaterial color="#b5523b" />
              </mesh>
            </RigidBody>
            {children}
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
