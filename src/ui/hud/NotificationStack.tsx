import { useEffect } from 'react';
import { NOTIFICATION_TTL_MS } from '../../game/config';
import type { GameNotification } from '../../game/types';
import { playSfx } from '../../audio/sfx';
import { useNotificationStore } from '../../stores/useNotificationStore';

function NotificationItem({ item }: { item: GameNotification }) {
  const dismiss = useNotificationStore((s) => s.dismiss);
  useEffect(() => {
    playSfx('notify');
    const remaining = Math.max(0, NOTIFICATION_TTL_MS - (Date.now() - item.createdAt));
    const t = setTimeout(() => dismiss(item.id), remaining);
    return () => clearTimeout(t);
  }, [item.id, item.createdAt, dismiss]);
  return (
    <div className="notif ui-panel" role="status">
      {item.icon && <span className="icon">{item.icon}</span>}
      <span>{item.text}</span>
    </div>
  );
}

export function NotificationStack() {
  const items = useNotificationStore((s) => s.items);
  return (
    <div className="notif-stack" data-testid="notification-stack">
      {items.map((n) => <NotificationItem key={n.id} item={n} />)}
    </div>
  );
}
