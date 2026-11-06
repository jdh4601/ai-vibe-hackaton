import { useGameStore } from '../../stores/useGameStore';

// Stub from Phase 0. Owned by track C (HUD & Overlay); keep the export name.
// Phase 'opening': black screen → phone notice → admission letter → monologue → [문을 연다] → setPhase('explore').
export function OpeningSequence() {
  const setPhase = useGameStore((s) => s.setPhase);
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', color: '#fff', display: 'grid', placeItems: 'center' }}>
      <button onClick={() => setPhase('explore')}>문을 연다</button>
    </div>
  );
}
