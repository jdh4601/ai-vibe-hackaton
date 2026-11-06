import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  type Group,
} from 'three';
import type { JacketSpec, MoveMode } from '../game/types';
import { useJacketMaterials } from './JacketMaterial';

export type HairStyle = 'short' | 'long' | 'bun' | 'bald';

export interface CharacterProps {
  jacket: JacketSpec;
  moveMode?: MoveMode;
  skinColor?: string;
  hairColor?: string;
  hairStyle?: HairStyle;
  pantsColor?: string;
  glasses?: boolean;
  scale?: number; // overall height variation (1 = 1.75 m)
  phase?: number; // animation phase offset so a crowd does not move in sync
  // When provided and false, the animation is skipped (distant NPCs).
  animateRef?: RefObject<boolean>;
}

// Stylized slim young adult, ~6.4 heads tall. Feet at y = 0, facing -z (the jacket back faces +z).
// Matches assets/characters/hero/hero-*-v2.png: varsity jacket over a white tee, light jeans, white sneakers.
const HIP_Y = 0.9;
const LEG_LEN = 0.83;
const JACKET_Y0 = 0.88;
const JACKET_H = 0.52;
const JACKET_W = 0.42;
const JACKET_D = 0.25;
const SHOULDER_Y = 1.35;
const SHOULDER_X = JACKET_W / 2 + 0.045;
const ARM_LEN = 0.5;
const HEAD_Y = 1.585;
const HEAD_R = 0.12;
const HEAD_SCALE: [number, number, number] = [1, 1.12, 1.05];

const g = {
  head: new SphereGeometry(HEAD_R, 28, 20),
  hairCap: new SphereGeometry(HEAD_R * 1.07, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
  hairBack: new SphereGeometry(HEAD_R * 1.05, 20, 14),
  tuft: new SphereGeometry(0.034, 10, 8),
  bun: new SphereGeometry(0.05, 12, 10),
  ear: new SphereGeometry(0.028, 10, 8),
  eye: new SphereGeometry(0.014, 10, 8),
  brow: new BoxGeometry(0.04, 0.007, 0.01),
  mouth: new BoxGeometry(0.03, 0.006, 0.008),
  nose: new SphereGeometry(0.014, 8, 6),
  glassRing: new TorusGeometry(0.03, 0.0035, 6, 18),
  neck: new CylinderGeometry(0.045, 0.05, 0.1, 12),
  torso: new BoxGeometry(JACKET_W, JACKET_H, JACKET_D),
  pelvis: new BoxGeometry(0.31, 0.12, 0.21),
  collar: new CylinderGeometry(0.085, 0.095, 0.06, 16),
  collarRing: new CylinderGeometry(0.0905, 0.0985, 0.01, 16),
  shoulder: new SphereGeometry(0.058, 12, 10),
  sleeve: new CylinderGeometry(0.052, 0.046, ARM_LEN, 12),
  cuff: new CylinderGeometry(0.049, 0.049, 0.065, 12),
  cuffRing: new CylinderGeometry(0.0505, 0.0505, 0.01, 12),
  hand: new SphereGeometry(0.044, 10, 8),
  leg: new CylinderGeometry(0.085, 0.07, LEG_LEN, 12),
  shoe: new BoxGeometry(0.105, 0.07, 0.27),
  sole: new BoxGeometry(0.11, 0.022, 0.275),
  // decal on the outer side (+x) of the right sleeve, wrapped around the cylinder
  number: new CylinderGeometry(0.0535, 0.0515, 0.1, 14, 1, true, Math.PI / 2 - 0.75, 1.5),
};
const eyeMat = new MeshStandardMaterial({ color: '#17141a', roughness: 0.4 });
const mouthMat = new MeshStandardMaterial({ color: '#b5655f', roughness: 0.7 });
const shoeMat = new MeshStandardMaterial({ color: '#f6f6f6', roughness: 0.6, emissive: '#ffffff', emissiveIntensity: 0.25 });
const soleMat = new MeshStandardMaterial({ color: '#d9d9d9', roughness: 0.8 });
const glassMat = new MeshStandardMaterial({ color: '#2a2a2e', roughness: 0.3, metalness: 0.4 });

const TUFTS: [number, number, number][] = [
  [-0.05, 0.125, -0.02],
  [0.04, 0.13, -0.04],
  [0.0, 0.135, 0.03],
  [0.075, 0.1, 0.02],
  [-0.075, 0.105, 0.0],
  [-0.02, 0.11, -0.09],
  [0.05, 0.1, -0.08],
];

const MODE_PARAMS: Record<MoveMode, { freq: number; swing: number; arm: number; bob: number; lean: number }> = {
  idle: { freq: 1.6, swing: 0.0, arm: 0.03, bob: 0.004, lean: 0 },
  walk: { freq: 7, swing: 0.5, arm: 0.4, bob: 0.02, lean: 0.03 },
  run: { freq: 10.5, swing: 0.95, arm: 0.9, bob: 0.045, lean: 0.16 },
};

export function Character({
  jacket,
  moveMode = 'idle',
  skinColor = '#f2c9a5',
  hairColor = '#1c1715',
  hairStyle = 'short',
  pantsColor = '#8aa9d4',
  glasses = false,
  scale = 1,
  phase = 0,
  animateRef,
}: CharacterProps) {
  const mats = useJacketMaterials(jacket);
  const skinMat = useMemo(() => new MeshStandardMaterial({ color: skinColor, roughness: 0.7, emissive: skinColor, emissiveIntensity: 0.3 }), [skinColor]);
  const hairMat = useMemo(() => new MeshStandardMaterial({ color: hairColor, roughness: 0.75 }), [hairColor]);
  const pantsMat = useMemo(() => new MeshStandardMaterial({ color: pantsColor, roughness: 0.9, emissive: pantsColor, emissiveIntensity: 0.3 }), [pantsColor]);
  // BoxGeometry face order: +x, -x, +y, -y, +z (back), -z (front)
  const torsoMats = useMemo(
    () => [mats.side, mats.side, mats.body, pantsMat, mats.back, mats.front],
    [mats, pantsMat],
  );

  const root = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const modeRef = useRef(moveMode);
  modeRef.current = moveMode;
  const state = useRef({ t: phase * 6.28, swing: 0, arm: 0, bob: 0, lean: 0 });

  useFrame((_, dtRaw) => {
    if (animateRef && !animateRef.current) return;
    const dt = Math.min(dtRaw, 0.05);
    const mode = modeRef.current;
    const p = MODE_PARAMS[mode];
    const s = state.current;
    const k = 1 - Math.exp(-12 * dt);
    s.swing += (p.swing - s.swing) * k;
    s.arm += (p.arm - s.arm) * k;
    s.bob += (p.bob - s.bob) * k;
    s.lean += (p.lean - s.lean) * k;
    s.t += dt * p.freq;
    const sw = Math.sin(s.t);
    const idle = mode === 'idle';
    if (legL.current) legL.current.rotation.x = sw * s.swing;
    if (legR.current) legR.current.rotation.x = -sw * s.swing;
    if (armL.current) armL.current.rotation.x = idle ? sw * s.arm : -sw * s.arm;
    if (armR.current) armR.current.rotation.x = idle ? -sw * s.arm : sw * s.arm;
    if (root.current) {
      root.current.position.y = (idle ? sw * 0.5 + 0.5 : Math.abs(sw)) * s.bob;
      root.current.rotation.x = -s.lean;
    }
  });

  const eyeY = 0.004;
  return (
    <group scale={scale}>
      <group ref={root}>
        {/* legs: pivot at the hip */}
        {([-0.095, 0.095] as const).map((x, i) => (
          <group key={x} ref={i === 0 ? legL : legR} position={[x, HIP_Y, 0]}>
            <mesh geometry={g.leg} material={pantsMat} position={[0, -LEG_LEN / 2, 0]} castShadow />
            <mesh geometry={g.shoe} material={shoeMat} position={[0, -LEG_LEN - 0.015, -0.05]} castShadow />
            <mesh geometry={g.sole} material={soleMat} position={[0, -LEG_LEN - 0.05, -0.05]} />
          </group>
        ))}
        <mesh geometry={g.pelvis} material={pantsMat} position={[0, HIP_Y + 0.02, 0]} />
        {/* jacket torso (open front over a white tee) */}
        <mesh geometry={g.torso} material={torsoMats} position={[0, JACKET_Y0 + JACKET_H / 2, 0]} castShadow />
        {/* ribbed stand collar */}
        <mesh geometry={g.collar} material={mats.body} position={[0, 1.43, 0.005]} />
        <mesh geometry={g.collarRing} material={mats.sleeve} position={[0, 1.44, 0.005]} />
        <mesh geometry={g.collarRing} material={mats.sleeve} position={[0, 1.415, 0.005]} />
        <mesh geometry={g.neck} material={skinMat} position={[0, 1.47, -0.005]} />
        {/* arms: pivot at the shoulder; the "27" decal is on the wearer's right (+x) sleeve only */}
        {([-1, 1] as const).map((side) => (
          <group
            key={side}
            ref={side === -1 ? armL : armR}
            position={[side * SHOULDER_X, SHOULDER_Y, 0]}
            rotation={[0, 0, side * 0.05]}
          >
            <mesh geometry={g.shoulder} material={mats.sleeve} />
            <mesh geometry={g.sleeve} material={mats.sleeve} position={[0, -ARM_LEN / 2, 0]} castShadow />
            <mesh geometry={g.cuff} material={mats.body} position={[0, -ARM_LEN + 0.005, 0]} />
            <mesh geometry={g.cuffRing} material={mats.sleeve} position={[0, -ARM_LEN + 0.018, 0]} />
            <mesh geometry={g.cuffRing} material={mats.sleeve} position={[0, -ARM_LEN - 0.008, 0]} />
            <mesh geometry={g.hand} material={skinMat} position={[0, -ARM_LEN - 0.07, 0]} scale={[0.9, 1.7, 0.7]} />
            {side === 1 && <mesh geometry={g.number} material={mats.sleeveNumber} position={[0, -0.15, 0]} />}
          </group>
        ))}
        {/* head */}
        <group position={[0, HEAD_Y, 0]}>
          <group scale={HEAD_SCALE}>
            <mesh geometry={g.head} material={skinMat} castShadow />
            {hairStyle !== 'bald' && (
              <mesh geometry={g.hairCap} material={hairMat} position={[0, 0.006, 0.014]} rotation={[-0.32, 0, 0]} />
            )}
            {(hairStyle === 'short' || hairStyle === 'bun') && (
              <mesh geometry={g.hairBack} material={hairMat} position={[0, 0.0, 0.03]} scale={[1, 0.88, 0.85]} />
            )}
            {hairStyle === 'long' && (
              <mesh geometry={g.hairBack} material={hairMat} position={[0, -0.07, 0.04]} scale={[1, 1.15, 0.85]} />
            )}
            {hairStyle === 'bun' && <mesh geometry={g.bun} material={hairMat} position={[0, 0.125, 0.04]} />}
            {hairStyle !== 'bald' &&
              TUFTS.map((p, i) => (
                <mesh key={i} geometry={g.tuft} material={hairMat} position={p} scale={[1, 0.8, 1.1]} />
              ))}
          </group>
          <mesh geometry={g.ear} material={skinMat} position={[-HEAD_R - 0.002, 0, 0.005]} scale={[0.5, 1.2, 1]} />
          <mesh geometry={g.ear} material={skinMat} position={[HEAD_R + 0.002, 0, 0.005]} scale={[0.5, 1.2, 1]} />
          <mesh geometry={g.eye} material={eyeMat} position={[-0.043, eyeY, -0.123]} scale={[1, 1.4, 0.6]} />
          <mesh geometry={g.eye} material={eyeMat} position={[0.043, eyeY, -0.123]} scale={[1, 1.4, 0.6]} />
          <mesh geometry={g.brow} material={hairMat} position={[-0.043, 0.032, -0.121]} rotation={[0, 0, 0.08]} />
          <mesh geometry={g.brow} material={hairMat} position={[0.043, 0.032, -0.121]} rotation={[0, 0, -0.08]} />
          <mesh geometry={g.nose} material={skinMat} position={[0, -0.018, -0.13]} scale={[0.9, 1, 0.8]} />
          <mesh geometry={g.mouth} material={mouthMat} position={[0, -0.055, -0.122]} />
          {glasses && (
            <>
              <mesh geometry={g.glassRing} material={glassMat} position={[-0.043, eyeY, -0.13]} />
              <mesh geometry={g.glassRing} material={glassMat} position={[0.043, eyeY, -0.13]} />
            </>
          )}
        </group>
      </group>
    </group>
  );
}
