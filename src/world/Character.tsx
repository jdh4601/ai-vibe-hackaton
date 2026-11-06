import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, SphereGeometry, TorusGeometry, type Group } from 'three';
import type { JacketSpec, MoveMode } from '../game/types';
import { useJacketMaterials } from './JacketMaterial';

export type HairStyle = 'short' | 'long' | 'bun' | 'bald';

export interface CharacterProps {
  jacket: JacketSpec;
  moveMode?: MoveMode;
  skinColor?: string;
  hairColor?: string;
  hairStyle?: HairStyle;
  glasses?: boolean;
  phase?: number; // animation phase offset so a crowd does not move in sync
  // When provided and false, the animation is skipped (distant NPCs).
  animateRef?: RefObject<boolean>;
}

// Code-built chibi, feet at y = 0, facing -z (so the back of the jacket faces +z).
const HEAD_R = 0.29;
const LEG_LEN = 0.34;
const TORSO_H = 0.5;
const TORSO_W = 0.5;
const TORSO_D = 0.32;
const HIP_Y = LEG_LEN + 0.02;
const SHOULDER_Y = HIP_Y + TORSO_H - 0.07;
const ARM_LEN = 0.34;

const headGeo = new SphereGeometry(HEAD_R, 24, 18);
const hairCapGeo = new SphereGeometry(HEAD_R * 1.07, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.56);
const hairBackGeo = new SphereGeometry(HEAD_R * 1.05, 20, 14);
const bunGeo = new SphereGeometry(0.11, 12, 10);
const eyeGeo = new SphereGeometry(0.04, 10, 8);
const blushGeo = new SphereGeometry(0.045, 10, 8);
const torsoGeo = new BoxGeometry(TORSO_W, TORSO_H, TORSO_D);
const armGeo = new CylinderGeometry(0.07, 0.065, ARM_LEN, 10);
const handGeo = new SphereGeometry(0.075, 10, 8);
const legGeo = new CylinderGeometry(0.085, 0.08, LEG_LEN, 10);
const shoeGeo = new BoxGeometry(0.18, 0.09, 0.26);
const glassGeo = new TorusGeometry(0.07, 0.011, 6, 16);
const eyeMat = new MeshStandardMaterial({ color: '#1b1b22', roughness: 0.4 });
const blushMat = new MeshStandardMaterial({ color: '#ff9aa2', roughness: 0.9 });
const shoeMat = new MeshStandardMaterial({ color: '#2b2b33', roughness: 0.7 });
const pantsMat = new MeshStandardMaterial({ color: '#33384a', roughness: 0.85 });
const glassMat = new MeshStandardMaterial({ color: '#222', roughness: 0.3, metalness: 0.4 });

const MODE_PARAMS: Record<MoveMode, { freq: number; swing: number; bob: number; lean: number }> = {
  idle: { freq: 2, swing: 0.04, bob: 0.008, lean: 0 },
  walk: { freq: 9, swing: 0.6, bob: 0.025, lean: 0.04 },
  run: { freq: 13, swing: 1.0, bob: 0.045, lean: 0.2 },
};

export function Character({
  jacket,
  moveMode = 'idle',
  skinColor = '#ffd9b8',
  hairColor = '#2a1d17',
  hairStyle = 'short',
  glasses = false,
  phase = 0,
  animateRef,
}: CharacterProps) {
  const mats = useJacketMaterials(jacket);
  const skinMat = useMemo(() => new MeshStandardMaterial({ color: skinColor, roughness: 0.7 }), [skinColor]);
  const hairMat = useMemo(() => new MeshStandardMaterial({ color: hairColor, roughness: 0.8 }), [hairColor]);
  // BoxGeometry face order: +x, -x, +y, -y, +z (back), -z (front)
  const torsoMats = useMemo(
    () => [mats.body, mats.body, mats.sleeve, pantsMat, mats.back, mats.body],
    [mats],
  );

  const root = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const modeRef = useRef(moveMode);
  modeRef.current = moveMode;
  const state = useRef({ t: phase * 6.28, swing: 0, bob: 0, lean: 0 });

  useFrame((_, dtRaw) => {
    if (animateRef && !animateRef.current) return;
    const dt = Math.min(dtRaw, 0.05);
    const p = MODE_PARAMS[modeRef.current];
    const s = state.current;
    const k = 1 - Math.exp(-12 * dt);
    s.swing += (p.swing - s.swing) * k;
    s.bob += (p.bob - s.bob) * k;
    s.lean += (p.lean - s.lean) * k;
    s.t += dt * p.freq;
    const sw = Math.sin(s.t) * s.swing;
    if (legL.current) legL.current.rotation.x = sw;
    if (legR.current) legR.current.rotation.x = -sw;
    if (armL.current) armL.current.rotation.x = -sw * 0.9;
    if (armR.current) armR.current.rotation.x = sw * 0.9;
    if (root.current) {
      root.current.position.y = Math.abs(Math.sin(s.t)) * s.bob;
      root.current.rotation.x = -s.lean;
    }
  });

  const headY = HIP_Y + TORSO_H + HEAD_R * 0.85;
  return (
    <group ref={root}>
      {/* legs */}
      <group ref={legL} position={[-0.12, HIP_Y, 0]}>
        <mesh geometry={legGeo} material={pantsMat} position={[0, -LEG_LEN / 2, 0]} castShadow />
        <mesh geometry={shoeGeo} material={shoeMat} position={[0, -LEG_LEN + 0.03, -0.04]} castShadow />
      </group>
      <group ref={legR} position={[0.12, HIP_Y, 0]}>
        <mesh geometry={legGeo} material={pantsMat} position={[0, -LEG_LEN / 2, 0]} castShadow />
        <mesh geometry={shoeGeo} material={shoeMat} position={[0, -LEG_LEN + 0.03, -0.04]} castShadow />
      </group>
      {/* torso wearing the jacket */}
      <mesh geometry={torsoGeo} material={torsoMats} position={[0, HIP_Y + TORSO_H / 2, 0]} castShadow />
      {/* arms */}
      <group ref={armL} position={[-(TORSO_W / 2 + 0.07), SHOULDER_Y, 0]}>
        <mesh geometry={armGeo} material={mats.sleeve} position={[0, -ARM_LEN / 2, 0]} castShadow />
        <mesh geometry={handGeo} material={skinMat} position={[0, -ARM_LEN - 0.02, 0]} />
      </group>
      <group ref={armR} position={[TORSO_W / 2 + 0.07, SHOULDER_Y, 0]}>
        <mesh geometry={armGeo} material={mats.sleeve} position={[0, -ARM_LEN / 2, 0]} castShadow />
        <mesh geometry={handGeo} material={skinMat} position={[0, -ARM_LEN - 0.02, 0]} />
      </group>
      {/* head */}
      <group position={[0, headY, 0]}>
        <mesh geometry={headGeo} material={skinMat} castShadow />
        {hairStyle !== 'bald' && (
          <mesh geometry={hairCapGeo} material={hairMat} position={[0, 0.02, 0.025]} rotation={[-0.25, 0, 0]} />
        )}
        {hairStyle === 'long' && (
          <mesh geometry={hairBackGeo} material={hairMat} position={[0, -0.07, 0.1]} scale={[1, 1.05, 0.8]} />
        )}
        {hairStyle === 'bun' && <mesh geometry={bunGeo} material={hairMat} position={[0, HEAD_R + 0.04, 0.04]} />}
        <mesh geometry={eyeGeo} material={eyeMat} position={[-0.1, 0.0, -HEAD_R + 0.01]} scale={[1, 1.3, 0.6]} />
        <mesh geometry={eyeGeo} material={eyeMat} position={[0.1, 0.0, -HEAD_R + 0.01]} scale={[1, 1.3, 0.6]} />
        <mesh geometry={blushGeo} material={blushMat} position={[-0.16, -0.07, -HEAD_R + 0.04]} scale={[1, 0.6, 0.4]} />
        <mesh geometry={blushGeo} material={blushMat} position={[0.16, -0.07, -HEAD_R + 0.04]} scale={[1, 0.6, 0.4]} />
        {glasses && (
          <>
            <mesh geometry={glassGeo} material={glassMat} position={[-0.1, 0.0, -HEAD_R - 0.005]} />
            <mesh geometry={glassGeo} material={glassMat} position={[0.1, 0.0, -HEAD_R - 0.005]} />
          </>
        )}
      </group>
    </group>
  );
}
