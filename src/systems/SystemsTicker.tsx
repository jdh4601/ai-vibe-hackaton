import { useEffect } from 'react';
import { useEventStore } from '../stores/useEventStore';

const TICK_MS = 250;

// Mounted once outside the Canvas. Clock domain: performance.now() everywhere
// (event times, stamina lock, coffee cooldowns), never Date.now().
export function SystemsTicker() {
  useEffect(() => {
    const id = window.setInterval(() => useEventStore.getState().tick(performance.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
