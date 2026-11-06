import { Interactor } from './Interactor';
import { Npc } from './Npc';
import { getWorldNpcs } from './npcList';

// Renders every NPC from data/npcs (plus the E-key interaction handler for NPCs and coffee carts).
export function NpcLayer() {
  const npcs = getWorldNpcs();
  return (
    <>
      {npcs.map((n) => (
        <Npc key={n.id} def={n} />
      ))}
      <Interactor />
    </>
  );
}
