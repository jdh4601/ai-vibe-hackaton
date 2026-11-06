import { REQUIRED_SKILLS } from '../../game/config';
import { getDepartment } from '../../data/departments';
import { getQuest } from '../../data/quests';
import { QUEST_IDS, useQuestStore } from '../../stores/useQuestStore';
import { nextQuestSpot } from '../../systems/nextQuest';

export function QuestTracker() {
  const quests = useQuestStore((s) => s.quests);
  const deadlineQuestId = useQuestStore((s) => s.deadlineQuestId);
  const endingUnlocked = useQuestStore((s) => s.endingUnlocked);

  const cleared = QUEST_IDS.filter((id) => quests[id].status === 'cleared').length;
  const activeId = QUEST_IDS.find((id) => quests[id].status === 'inProgress');
  const activeTitle = activeId ? getQuest(activeId)?.title : undefined;
  // with nothing in progress, always point at the next senior so the goal is visible from the start
  const next = !activeId && !endingUnlocked ? nextQuestSpot(quests) : null;
  const nextDept = next ? getDepartment(next.npc.departmentId)?.name : undefined;
  const deadline = deadlineQuestId ? getQuest(deadlineQuestId) : undefined;
  const deadlineDept = deadline ? getDepartment(deadline.departmentId)?.name : undefined;

  return (
    <div className="quest-tracker ui-panel" data-testid="quest-tracker">
      <div className="qt-title">새내기 미션</div>
      <div className="qt-count">
        <span>학과 체험 {cleared}/{REQUIRED_SKILLS}</span>
      </div>
      <div className="qt-pips">
        {QUEST_IDS.map((id, i) => <div key={id} className={`qt-pip${i < cleared ? ' on' : ''}`} />)}
      </div>
      {activeTitle && <div className="qt-active">진행 중: {activeTitle}</div>}
      {next && (
        <div className="qt-active" data-testid="qt-next">
          다음 퀘스트: {nextDept} {next.npc.displayName} (! 표시, E로 대화)
        </div>
      )}
      {deadline && (
        <div className="qt-deadline">오늘 마감: {deadlineDept ?? deadline.title} 선배 찾아가기</div>
      )}
      {endingUnlocked && <div className="qt-ending">⭐ 중앙 분수대로 가 보자!</div>}
    </div>
  );
}
