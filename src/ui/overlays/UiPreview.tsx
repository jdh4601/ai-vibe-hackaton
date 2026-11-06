import { useState } from 'react';
import { SKILLS } from '../../data/skills';
import { NPCS } from '../../data/npcs';
import type { GamePhase, QuestId } from '../../game/types';
import { useDialogueStore } from '../../stores/useDialogueStore';
import { useEventStore } from '../../stores/useEventStore';
import { useGameStore } from '../../stores/useGameStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { QUEST_IDS, useQuestStore } from '../../stores/useQuestStore';
import { useSkillStore } from '../../stores/useSkillStore';
import { DialogueBox } from '../dialogue/DialogueBox';
import { Hud } from '../hud/Hud';
import { Credits } from './Credits';
import { EndingSelect } from './EndingSelect';
import { JacketCeremony } from './JacketCeremony';
import { OpeningSequence } from './OpeningSequence';
import { SkillAcquired } from './SkillAcquired';
import { SkillDex } from './SkillDex';
import './overlays.css';

const setPhase = (p: GamePhase) => {
  if (p !== 'dialogue') useDialogueStore.getState().reset();
  useGameStore.getState().setPhase(p);
};

const actions: [string, () => void][] = [
  ['탐험', () => setPhase('explore')],
  ['오프닝', () => setPhase('opening')],
  ['스킬 3개', () => {
    useSkillStore.getState().reset();
    SKILLS.slice(0, 3).forEach((s) => useSkillStore.getState().grant(s.id));
    const q = useQuestStore.getState();
    QUEST_IDS.slice(0, 3).forEach((id) => q.quests[id] && useQuestStore.setState({ quests: { ...useQuestStore.getState().quests, [id]: { status: 'cleared', failCount: 0, hintVisible: false } } }));
  }],
  ['알림 2개', () => {
    const n = useNotificationStore.getState();
    n.push('교수님이 다가옵니다! 도망치세요!', '🎓');
    n.push('학생회 간식 나눔 행사 중! (60초)', '🍪');
  }],
  ['대화(일반)', () => {
    useDialogueStore.getState().play({
      voicePitch: 220,
      lines: [
        { speaker: '납땜 선배', text: "전자공학부는 회로부터 반도체, 임베디드 시스템까지 '전기가 흐르는 모든 것'을 다뤄." },
        { speaker: '납땜 선배', text: '나는 임베디드 트랙인데, 작은 컴퓨터를 로봇이나 기계에 심는 걸 배워.' },
      ],
    });
    setPhase('dialogue');
  }],
  ['대화(선택지)', () => {
    useDialogueStore.getState().play({
      voicePitch: 260,
      lines: [{ speaker: '납땜 선배', text: '지금 자율주행 배달 로봇을 만들고 있는데, 전압이 안 맞아서 안 움직여. 좀 도와줄래?' }],
      choices: [{ id: 'accept', label: '도와준다' }, { id: 'decline', label: '다음에' }],
    });
    setPhase('dialogue');
  }],
  ['스킬 획득', () => {
    const s = useSkillStore.getState();
    const id = SKILLS[0]?.id;
    if (id) { s.reset(); s.grant(id); }
    setPhase('skillAcquired');
  }],
  ['도감', () => { setPhase('explore'); useGameStore.getState().setDexOpen(true); }],
  ['엔딩 선택', () => setPhase('endingSelect')],
  ['과잠 수여식', () => setPhase('jacketCeremony')],
  ['크레딧', () => setPhase('credits')],
  ['마감 마커', () => {
    const q: QuestId | undefined = NPCS.find((n) => n.questId)?.questId;
    useQuestStore.getState().setDeadline(q ?? null);
  }],
  ['이벤트 마커', () => {
    usePlayerStore.getState().setPose([0, 1, 20], 0.6);
    useEventStore.setState({ active: { id: 'snackEvent', startedAt: 0, endsAt: 1e12, position: [12, 0, 10] } });
  }],
  ['엔딩 해금', () => useQuestStore.setState({ endingUnlocked: true })],
  ['스태미나 30', () => usePlayerStore.setState({ stamina: 30 })],
];

export function UiPreview() {
  const phase = useGameStore((s) => s.phase);
  const [open, setOpen] = useState(true);
  return (
    <>
      <div className="pv-bg" />
      {phase !== 'opening' && phase !== 'credits' && <Hud />}
      <DialogueBox />
      {phase === 'skillAcquired' && <SkillAcquired />}
      <SkillDex />
      {phase === 'endingSelect' && <EndingSelect />}
      {phase === 'jacketCeremony' && <JacketCeremony />}
      {phase === 'credits' && <Credits />}
      {phase === 'opening' && <OpeningSequence />}
      <div className="pv-panel">
        <button onClick={() => setOpen((o) => !o)}>{open ? '▾' : '▸ UI preview'}</button>
        {open && actions.map(([label, fn]) => <button key={label} onClick={fn}>{label}</button>)}
      </div>
    </>
  );
}
