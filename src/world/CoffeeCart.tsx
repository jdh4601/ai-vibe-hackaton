import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useMemo, useState } from 'react';
import { CanvasTexture, ConeGeometry, DoubleSide, SRGBColorSpace } from 'three';
import { COFFEE_CARTS, INTERACT_RADIUS } from '../game/config';
import type { Vec3 } from '../game/types';
import { useGameStore } from '../stores/useGameStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { playerLive } from './playerLive';

const umbrellaGeo = new ConeGeometry(1.5, 0.6, 12, 1, true);

function signTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#3b2a20';
    ctx.fillRect(0, 0, 256, 96);
    ctx.fillStyle = '#ffe8c2';
    ctx.font = '800 48px "Malgun Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☕ 아아', 128, 50);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function Cart({ id, position }: { id: string; position: Vec3 }) {
  const sign = useMemo(signTexture, []);
  const [near, setNear] = useState(false);
  const readyAt = usePlayerStore((s) => s.coffeeCooldowns[id] ?? 0);

  useFrame(() => {
    const [qx, , qz] = playerLive.position;
    const d = Math.hypot(qx - position[0], qz - position[2]);
    const n = d <= INTERACT_RADIUS && useGameStore.getState().phase === 'explore';
    if (n !== near) setNear(n);
  });

  return (
    <>
      <RigidBody type="fixed" colliders={false} position={position}>
        <CuboidCollider args={[0.95, 0.6, 0.5]} position={[0, 0.6, 0]} />
      </RigidBody>
      <group position={position}>
        {/* counter */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.0, 0.9]} />
          <meshStandardMaterial color="#8a5a3a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.02, 0]} castShadow>
          <boxGeometry args={[1.9, 0.06, 1.0]} />
          <meshStandardMaterial color="#f1e3cf" roughness={0.6} />
        </mesh>
        {/* wheels */}
        {([-0.7, 0.7] as const).map((x) => (
          <mesh key={x} position={[x, 0.18, 0.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 14]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
        {/* cups */}
        {([-0.4, -0.15, 0.1] as const).map((x) => (
          <mesh key={x} position={[x, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.055, 0.18, 12]} />
            <meshStandardMaterial color="#c9eaf5" transparent opacity={0.75} />
          </mesh>
        ))}
        {/* pole + umbrella */}
        <mesh position={[0.3, 1.75, 0.2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
          <meshStandardMaterial color="#d8d8d8" metalness={0.4} />
        </mesh>
        <mesh geometry={umbrellaGeo} position={[0.3, 2.55, 0.2]} castShadow>
          <meshStandardMaterial color="#e86a5a" side={DoubleSide} roughness={0.7} />
        </mesh>
        {/* sign (faces -z, toward the plaza center from the south edge) */}
        <mesh position={[0, 0.58, -0.46]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.2, 0.45]} />
          <meshStandardMaterial map={sign} />
        </mesh>
        <mesh position={[0, 0.58, 0.46]}>
          <planeGeometry args={[1.2, 0.45]} />
          <meshStandardMaterial map={sign} />
        </mesh>
        {near && (
          <Html position={[0, 3.1, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div
              style={{
                padding: '3px 10px',
                borderRadius: 10,
                background: 'rgba(20,24,40,0.85)',
                color: '#fff',
                font: '700 13px Pretendard, "Malgun Gothic", sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {readyAt <= performance.now() ? 'E 아아 마시기' : '준비 중…'}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

export function CoffeeCarts() {
  return (
    <>
      {COFFEE_CARTS.map((c) => (
        <Cart key={c.id} id={c.id} position={c.position} />
      ))}
    </>
  );
}
