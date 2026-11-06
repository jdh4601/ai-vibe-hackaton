import { create } from 'zustand';
import { NOTIFICATION_MAX } from '../game/config';
import type { GameNotification } from '../game/types';

export interface NotificationState {
  items: GameNotification[]; // newest last, at most NOTIFICATION_MAX
  push: (text: string, icon?: string) => number;
  dismiss: (id: number) => void;
  reset: () => void;
}

let nextId = 1;

// The HUD (NotificationStack) owns the 5s TTL timers and calls dismiss().
export const useNotificationStore = create<NotificationState>()((set) => ({
  items: [],
  push: (text, icon) => {
    const id = nextId++;
    set((s) => ({ items: [...s.items, { id, text, icon, createdAt: Date.now() }].slice(-NOTIFICATION_MAX) }));
    return id;
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
  reset: () => set({ items: [] }),
}));
