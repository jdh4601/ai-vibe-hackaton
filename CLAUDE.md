# 너의 학과는 — project map

Spec: `plan.md` (Part 1 PRD, 2.4 contract, Part 3 track briefs, Part 4 tests). UI copy is Korean; code, comments and commits are English.

## Commands

```bash
npm run dev            # http://localhost:5173  (?debug=1, ?minigame=dial|trace|fillBlank|ordering-word|ordering-code, ?ui-preview=1)
npx tsc -p tsconfig.app.json --noEmit   # type check (strict, no any)
npx vitest run         # unit + component (tests/unit, tests/component)
npx playwright test    # e2e (tests/e2e), starts the dev server itself
```

## Contract (lead-only files)

- `src/game/types.ts` — every shared type. Do not edit from a track; ask the lead.
- `src/game/config.ts` — constants and the shared map layout (BUILDINGS, LAWNS, WALKWAYS, ZONES, COFFEE_CARTS, ENDING_POINT, SPAWN_POINT). World axes: +x east, -z north (sea), y up.
- `src/stores/*.ts` — action **signatures** are fixed. Track E fills the bodies of quest/dialogue/event/stamina actions.
- `src/App.tsx` — phase routing; mounts every track's top-level component by its fixed export name.

## Track ownership (only edit files you own)

| Track | Files |
|---|---|
| A World | `src/world/GameCanvas.tsx`, `Plaza.tsx`, `Buildings.tsx`, `Landmarks.tsx`, `Backdrop.tsx`, `Trees.tsx` |
| B Player & NPC | `src/world/Player.tsx`, `JacketMaterial.tsx`, `Npc.tsx`, `NpcBubble.tsx`, `NpcLayer.tsx`, `CoffeeCart.tsx`, `EventActors.tsx`, `EndingStage.tsx`, `src/logic/proximity.ts`, `src/logic/jacket.ts` |
| C HUD & Overlay | `src/ui/hud/*`, `src/ui/dialogue/*`, `src/ui/overlays/*`, `src/audio/*`, `src/logic/minimap.ts` |
| D Minigames | `src/ui/minigames/*`, `src/logic/minigames/*` |
| E Systems & Content | `src/logic/questMachine.ts`, `stamina.ts`, `eventScheduler.ts`, `rng.ts`, store bodies in `src/stores/*`, `src/data/*`, `src/debug/*`, `src/systems/*` |

Tests go in `tests/unit/<file>.test.ts` / `tests/component/<Component>.test.tsx`, named `{action}_{condition}_{expected}`. Write `src/logic` tests first.

## Game flow (who calls what)

1. `OpeningSequence` (C) → `setPhase('explore')`.
2. Player near NPC + E / bubble click (B) → `useDialogueStore.start(npcId)` (E) → phase `dialogue`.
3. `DialogueBox` (C) renders `script.lines[index]`, calls `advance()`; on the last line with choices calls `choose('accept'|'decline')`.
4. accept → `useQuestStore.accept` (E) → `setActiveQuest(id)` + phase `minigame` → App mounts `MinigameModal` (D) with `onSuccess/onFail/onAbort`.
5. `succeed` (E) → plays `successLines` → `useSkillStore.grant(skillId)` → phase `skillAcquired` → `SkillAcquired` (C) closes → `explore`.
6. All 5 cleared → `endingUnlocked` → notice + ★ marker. Player reaches `ENDING_POINT` (B) → `endingCutscene` → `EndingStage` (B) → `endingSelect` → `EndingSelect` (C) → `chooseDepartment` + `jacketCeremony` → `EndingStage` swaps jacket at 5.2s, `JacketCeremony` (C) → `credits`.
7. Random events: `SystemsTicker` (E) calls `useEventStore.tick`; `EventActors` (B) renders `active` and reports `resolve(outcome)`.
8. Player (B) writes pose to `usePlayerStore.setPose` (~10 Hz), calls `tickStamina(dt, now)` each frame, uses `canRun(now)`, consumes `teleportTarget`.

## Gotchas

- ecctrl 2.x does **not** read the keyboard: Player reads drei `useKeyboardControls` and calls `ecctrl.setMovement(...)` every frame. Camera follow is manual (`EcctrlCameraControls.moveTo`).
- Stack: React 19, three 0.187, R3F 9, drei 10, rapier 2, TypeScript 7, Vite 8, Vitest 5.
- In e2e, stores can be read with `page.evaluate(() => import('/src/stores/usePlayerStore.ts'))` (dev server only); prefer `window.__game` once track E lands it.
