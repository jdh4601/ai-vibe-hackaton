import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, SphereGeometry, type Group } from 'three';
import { useQuestStore } from '../stores/useQuestStore';

// Generic code-built props placed around an NPC, chosen by NpcDef.propKeys.
const box = new BoxGeometry(1, 1, 1);
const cyl = new CylinderGeometry(0.5, 0.5, 1, 14);
const ball = new SphereGeometry(0.5, 12, 10);
const mat = (color: string, extra: Partial<ConstructorParameters<typeof MeshStandardMaterial>[0]> = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.75, ...extra });

const M = {
  wood: mat('#9c6b3f'),
  white: mat('#f4f4f0'),
  green: mat('#2f6b4f'),
  darkGreen: mat('#244d3a'),
  metal: mat('#6d7480', { metalness: 0.5, roughness: 0.4 }),
  dark: mat('#23262d'),
  yellow: mat('#f2c14e'),
  red: mat('#d9534f'),
  blue: mat('#4a7fd9'),
  chalk: mat('#f2f2ea', { emissive: '#f2f2ea', emissiveIntensity: 0.25 }),
  ledRed: mat('#ff3b30', { emissive: '#ff3b30', emissiveIntensity: 1.2 }),
  ledGreen: mat('#2cff7a', { emissive: '#2cff7a', emissiveIntensity: 1.2 }),
  glass: mat('#bfe3f2', { transparent: true, opacity: 0.55 }),
  liquid: mat('#7be0a4'),
};

type P = { position?: [number, number, number]; scale?: [number, number, number]; m: MeshStandardMaterial; g?: 'box' | 'cyl' | 'ball' };
function Part({ position, scale, m, g = 'box' }: P) {
  const geo = g === 'box' ? box : g === 'cyl' ? cyl : ball;
  return <mesh geometry={geo} material={m} position={position} scale={scale} castShadow />;
}

function Table({ children }: { children?: React.ReactNode }) {
  return (
    <group>
      <Part m={M.wood} position={[0, 0.72, 0]} scale={[1.0, 0.06, 0.55]} />
      {([-0.45, 0.45] as const).map((x) =>
        ([-0.22, 0.22] as const).map((z) => (
          <Part key={`${x}${z}`} m={M.metal} position={[x, 0.36, z]} scale={[0.05, 0.72, 0.05]} />
        )),
      )}
      {children}
    </group>
  );
}

function Breadboard() {
  return (
    <Table>
      <Part m={M.white} position={[0, 0.77, 0]} scale={[0.6, 0.03, 0.25]} />
      <Part m={M.red} position={[-0.15, 0.8, 0.03]} scale={[0.12, 0.03, 0.03]} />
      <Part m={M.blue} position={[0.1, 0.8, -0.04]} scale={[0.14, 0.03, 0.03]} />
      <Part m={M.ledGreen} position={[0.22, 0.81, 0.04]} scale={[0.05, 0.05, 0.05]} g="ball" />
    </Table>
  );
}

function DeliveryRobot() {
  const g = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.position.x = Math.sin(clock.elapsedTime * 0.6) * 0.5;
  });
  return (
    <group ref={g}>
      <Part m={M.yellow} position={[0, 0.3, 0]} scale={[0.5, 0.26, 0.7]} />
      <Part m={M.dark} position={[0, 0.5, 0.1]} scale={[0.4, 0.14, 0.3]} />
      <Part m={M.ledRed} position={[0, 0.52, -0.2]} scale={[0.1, 0.1, 0.1]} g="ball" />
      {([-0.27, 0.27] as const).map((x) =>
        ([-0.25, 0.25] as const).map((z) => (
          <mesh key={`${x}${z}`} geometry={cyl} material={M.dark} position={[x, 0.14, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.28, 0.1, 0.28]} />
        )),
      )}
    </group>
  );
}

function Easel() {
  return (
    <group>
      <Part m={M.wood} position={[-0.3, 0.7, 0.15]} scale={[0.05, 1.4, 0.05]} />
      <Part m={M.wood} position={[0.3, 0.7, 0.15]} scale={[0.05, 1.4, 0.05]} />
      <Part m={M.wood} position={[0, 0.7, 0.4]} scale={[0.05, 1.4, 0.05]} />
      <Part m={M.white} position={[0, 1.0, 0]} scale={[0.8, 0.6, 0.04]} />
      <Part m={M.red} position={[-0.2, 1.05, -0.03]} scale={[0.25, 0.2, 0.02]} />
      <Part m={M.blue} position={[0.15, 0.95, -0.03]} scale={[0.3, 0.25, 0.02]} />
      <Part m={M.yellow} position={[0.1, 1.15, -0.03]} scale={[0.15, 0.15, 0.02]} g="ball" />
    </group>
  );
}

function Chalkboard() {
  return (
    <group>
      <Part m={M.wood} position={[0, 0.65, 0]} scale={[1.4, 1.1, 0.07]} />
      <Part m={M.darkGreen} position={[0, 0.65, -0.04]} scale={[1.3, 1.0, 0.03]} />
      <Part m={M.chalk} position={[-0.3, 0.85, -0.06]} scale={[0.5, 0.04, 0.01]} />
      <Part m={M.chalk} position={[0.1, 0.65, -0.06]} scale={[0.7, 0.04, 0.01]} />
      <Part m={M.chalk} position={[-0.2, 0.45, -0.06]} scale={[0.4, 0.04, 0.01]} />
      <Part m={M.metal} position={[-0.6, 0.05, 0]} scale={[0.06, 0.1, 0.4]} />
      <Part m={M.metal} position={[0.6, 0.05, 0]} scale={[0.06, 0.1, 0.4]} />
    </group>
  );
}

function ServerRack() {
  const solved = useQuestStore((s) => s.quests['q5-cse'].status === 'cleared');
  const led = solved ? M.ledGreen : M.ledRed;
  return (
    <group>
      <Part m={M.dark} position={[0, 0.85, 0]} scale={[0.7, 1.7, 0.7]} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} position={[0, 0.3 + i * 0.25, -0.36]}>
          <Part m={M.metal} scale={[0.6, 0.18, 0.02]} />
          <Part m={led} position={[0.22, 0, -0.015]} scale={[0.05, 0.05, 0.03]} g="ball" />
          <Part m={led} position={[0.12, 0, -0.015]} scale={[0.05, 0.05, 0.03]} g="ball" />
        </group>
      ))}
    </group>
  );
}

function Books() {
  const colors = [M.red, M.blue, M.yellow, M.green];
  return (
    <group>
      {colors.map((c, i) => (
        <Part key={i} m={c} position={[(i % 2) * 0.03, 0.06 + i * 0.12, 0]} scale={[0.5 - i * 0.04, 0.1, 0.35]} />
      ))}
    </group>
  );
}

function Laptop() {
  return (
    <Table>
      <Part m={M.metal} position={[0, 0.77, 0]} scale={[0.4, 0.02, 0.28]} />
      <Part m={M.dark} position={[0, 0.9, 0.14]} scale={[0.4, 0.24, 0.02]} />
      <Part m={M.blue} position={[0, 0.9, 0.125]} scale={[0.34, 0.19, 0.01]} />
    </Table>
  );
}

function Beaker() {
  return (
    <Table>
      <Part m={M.glass} position={[-0.15, 0.85, 0]} scale={[0.14, 0.22, 0.14]} g="cyl" />
      <Part m={M.liquid} position={[-0.15, 0.82, 0]} scale={[0.12, 0.12, 0.12]} g="cyl" />
      <Part m={M.glass} position={[0.15, 0.82, 0]} scale={[0.1, 0.16, 0.1]} g="cyl" />
    </Table>
  );
}

function Generic() {
  return <Part m={M.wood} position={[0, 0.2, 0]} scale={[0.4, 0.4, 0.4]} />;
}

const PROPS: Record<string, () => React.JSX.Element> = {
  breadboard: Breadboard,
  deliveryRobot: DeliveryRobot,
  easel: Easel,
  chalkboard: Chalkboard,
  serverRack: ServerRack,
  books: Books,
  laptop: Laptop,
  beaker: Beaker,
};

// Slots around the NPC in its local frame ([x, z]); the NPC itself stands at the origin facing -z.
const SLOTS: [number, number][] = [
  [1.3, 0.2],
  [-1.3, 0.2],
  [1.0, 1.3],
  [-1.0, 1.3],
];

export function NpcProps({ keys }: { keys: string[] }) {
  return (
    <>
      {keys.slice(0, SLOTS.length).map((key, i) => {
        const Prop = PROPS[key] ?? Generic;
        const [x, z] = SLOTS[i]!;
        return (
          <group key={`${key}-${i}`} position={[x, 0, z]} rotation={[0, x > 0 ? -0.4 : 0.4, 0]}>
            <Prop />
          </group>
        );
      })}
    </>
  );
}
