import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { COFFEE_CARTS, INTERACT_RADIUS } from '../game/config';
import type { Vec3 } from '../game/types';
import { nearestTarget } from '../logic/proximity';
import { useDialogueStore } from '../stores/useDialogueStore';
import { useGameStore } from '../stores/useGameStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { getWorldNpcs } from './npcList';
import { playerLive } from './playerLive';

interface Target {
  id: string;
  kind: 'npc' | 'cart';
  position: Vec3;
}

// Pressing E (or clicking while the pointer is locked) interacts with the nearest NPC / coffee cart.
export function Interactor() {
  const [subscribe] = useKeyboardControls();
  const targets = useMemo<Target[]>(
    () => [
      ...getWorldNpcs().map((n) => ({ id: n.id, kind: 'npc' as const, position: n.position })),
      ...COFFEE_CARTS.map((c) => ({ id: c.id, kind: 'cart' as const, position: c.position })),
    ],
    [],
  );
  const pending = useRef(false);

  useEffect(() => {
    const unsub = subscribe(
      (s) => s.interact,
      (pressed) => {
        if (pressed) pending.current = true;
      },
    );
    const onClick = () => {
      if (document.pointerLockElement) pending.current = true;
    };
    document.addEventListener('mousedown', onClick);
    return () => {
      unsub();
      document.removeEventListener('mousedown', onClick);
    };
  }, [subscribe]);

  useFrame(() => {
    if (!pending.current) return;
    pending.current = false;
    if (useGameStore.getState().phase !== 'explore') return;
    const hit = nearestTarget(playerLive.position, targets, INTERACT_RADIUS);
    if (!hit) return;
    if (hit.kind === 'npc') {
      useDialogueStore.getState().start(hit.id);
      return;
    }
    const ok = usePlayerStore.getState().drinkCoffee(hit.id, performance.now());
    const notify = useNotificationStore.getState();
    if (ok) notify.push('아아 한 잔 수혈!', '☕');
    else notify.push('커피 카트 준비 중…', '☕');
  });

  return null;
}
