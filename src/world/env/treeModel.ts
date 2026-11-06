import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from './rng';

function paint(g: THREE.BufferGeometry, tint: THREE.Color) {
  const rgb = Array.from({ length: g.attributes.position!.count }, () => tint.toArray()).flat();
  g.setAttribute('color', new THREE.Float32BufferAttribute(rgb, 3));
  return g;
}

export function treeModel(pine: boolean) {
  const rand = mulberry32(pine ? 46 : 99);
  const branches: THREE.BufferGeometry[] = [];
  const leaves: THREE.BufferGeometry[] = [];
  function limb(a: THREE.Vector3, b: THREE.Vector3, base: number, tip: number) {
    const axis = b.clone().sub(a);
    const cylinder = new THREE.CylinderGeometry(tip, base, axis.length(), 7);
    cylinder.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize()));
    cylinder.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    branches.push(paint(cylinder, new THREE.Color(pine ? '#715340' : '#766a57')));
  }
  const fork = new THREE.Vector3(0.06, 1.55, 0.02);
  const top = new THREE.Vector3(-0.14, pine ? 3.9 : 4.5, 0.12);
  limb(new THREE.Vector3(), fork, 0.14, 0.095);
  limb(fork, top, 0.1, 0.018);
  for (let tier = 0; tier < 17; tier++) {
    const t = tier / 18;
    const a = tier * 2.4 + rand() * 0.55;
    const radius = (pine ? 1.68 : 1.27) * (1 - t * 0.7);
    const base = fork.clone().lerp(top, t);
    const elbow = base.clone().add(new THREE.Vector3(Math.cos(a) * radius * 0.53, 0.15, Math.sin(a) * radius * 0.53));
    const tip = base.clone().add(new THREE.Vector3(Math.cos(a) * radius, pine ? 0.39 : 0.73, Math.sin(a) * radius));
    limb(base, elbow, 0.054 * (1 - t * 0.6), 0.029);
    limb(elbow, tip, 0.032, 0.01);
    for (let j = 0; j < 13; j++) {
      const angle = j * 2.4 + a;
      const spread = Math.sqrt(rand()) * (pine ? 0.66 : 0.57);
      const card = new THREE.PlaneGeometry(pine ? 1.02 : 0.9, pine ? 0.68 : 1.01);
      card.rotateX(-0.27 - rand() * (pine ? 1.15 : 0.84));
      card.rotateZ((rand() - 0.5) * 1.8);
      card.rotateY(angle);
      card.translate(tip.x + spread * Math.cos(angle), tip.y + rand() * (pine ? 0.23 : 0.58), tip.z + spread * Math.sin(angle));
      // A leaf cluster is lit like a convex canopy, independent of its card's angle.
      const normal = new THREE.Vector3(Math.cos(angle) * 0.46, 0.8, Math.sin(angle) * 0.46).normalize();
      for (let k = 0; k < 4; k++) card.attributes.normal!.setXYZ(k, normal.x, normal.y, normal.z);
      leaves.push(paint(card, new THREE.Color().setScalar(0.64 + rand() * 0.32 + t * 0.13)));
    }
  }
  return { wood: mergeGeometries(branches), foliage: mergeGeometries(leaves) };
}
