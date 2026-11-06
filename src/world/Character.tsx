import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { CanvasTexture, Mesh, MeshStandardMaterial, PlaneGeometry, SphereGeometry, TorusGeometry, type Group } from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import type { JacketSpec, MoveMode } from '../game/types';
import { useStudentMaterials } from './JacketMaterial';

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

const glassesFrame = new TorusGeometry(0.027, 0.0025, 6, 24);
const frameMaterial = new MeshStandardMaterial({ color: '#393536', metalness: 0.5, roughness: 0.35 });
const hairVolume = new SphereGeometry(1, 24, 16);

// Match the curvature of the shoulder-blade panel so the embroidery stays on the cloth.
const stitchPanel = new PlaneGeometry(0.25, 0.04, 12, 1);
const stitchVertices = stitchPanel.attributes.position!;
for (let i = 0; i < stitchVertices.count; i++) {
  const unitX = Math.abs(stitchVertices.getX(i) / 0.17);
  stitchVertices.setZ(i, 0.014 + 0.135 * Math.pow(1 - Math.pow(unitX, 2.47), 0.405));
}
stitchPanel.computeVertexNormals();

function DepartmentStitch({ text }: { text: string }) {
  const label = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 80;
    const pen = canvas.getContext('2d')!;
    pen.font = 'bold 54px sans-serif';
    pen.fillStyle = '#faf5e6';
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillText(text, 256, 40, 480);
    return new CanvasTexture(canvas);
  }, [text]);
  useEffect(() => () => label.dispose(), [label]);
  return (
    <mesh position-y={1.155} geometry={stitchPanel}>
      <meshStandardMaterial map={label} transparent depthWrite={false} />
    </mesh>
  );
}

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
  const { nodes } = useGLTF(import.meta.env.BASE_URL + 'art/student/student.glb');
  const dyes = useTexture(import.meta.env.BASE_URL + 'art/student/dyes.png', (texture) => {
    texture.flipY = false; // match the embedded glTF atlas
  });
  const parts = nodes as Record<'Head' | 'Jacket' | 'LeftArm' | 'RightArm' | 'LeftLeg' | 'RightLeg', Mesh>;
  const atlas = (parts.Jacket.material as MeshStandardMaterial).map!;
  const materials = useStudentMaterials(atlas, dyes, jacket, skinColor, hairColor, pantsColor, hairStyle === 'bald');

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

  return (
    <group scale={scale}>
      <group ref={root}>
        <mesh geometry={parts.Jacket.geometry} material={materials.jacket} castShadow />
        <mesh geometry={parts.Head.geometry} material={materials.head} castShadow />
        {jacket.departmentLine && <DepartmentStitch text={jacket.departmentLine} />}
        {(['LeftLeg', 'RightLeg', 'LeftArm', 'RightArm'] as const).map((part, i) => (
          <group key={part} ref={[legL, legR, armL, armR][i]} position={parts[part].position}>
            <mesh geometry={parts[part].geometry} material={i < 2 ? materials.denim : materials.jacket} castShadow />
          </group>
        ))}
        {(hairStyle === 'long' || hairStyle === 'bun') && (
          <mesh geometry={hairVolume} position={[0, hairStyle === 'bun' ? 1.66 : 1.525, 0.068]}
            scale={hairStyle === 'bun' ? [0.061, 0.056, 0.062] : [0.095, 0.143, 0.055]} castShadow>
            <meshStandardMaterial color={hairColor} roughness={0.76} />
          </mesh>
        )}
        {glasses && (
          <group position={[0, 1.618, -0.106]}>
            {[-1, 1].map((side) => (
              <mesh key={side} geometry={glassesFrame} material={frameMaterial} position-x={side * 0.035} scale={[1.18, 0.78, 1]} />
            ))}
            <mesh material={frameMaterial}><boxGeometry args={[0.018, 0.004, 0.003]} /></mesh>
          </group>
        )}
      </group>
    </group>
  );
}
