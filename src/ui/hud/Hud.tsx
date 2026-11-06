import { useEffect, useState } from 'react';
import { currentBgm, playBgm, setBgmMuted, stopBgm } from '../../audio/bgm';
import { installAudioUnlock } from '../../audio/context';
import { useGameStore } from '../../stores/useGameStore';
import { Minimap } from './Minimap';
import { NotificationStack } from './NotificationStack';
import { QuestTracker } from './QuestTracker';
import { SkillList } from './SkillList';
import './hud.css';

const CONTROLS_TOAST_MS = 7000;

function MuteButton() {
  const muted = useGameStore((s) => s.muted);
  const toggle = useGameStore((s) => s.toggleMute);
  useEffect(() => setBgmMuted(muted), [muted]);
  return (
    <button className="mute-btn" onClick={toggle} aria-label={muted ? '소리 켜기' : '소리 끄기'}>
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

function ControlsToast() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), CONTROLS_TOAST_MS);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div className="controls-toast ui-panel">WASD 이동 · Shift 달리기 · 마우스 시점 · E/클릭 대화 · Tab 도감</div>
  );
}

export function Hud() {
  const phase = useGameStore((s) => s.phase);
  // the controls toast appears once, after the first time the player reaches explore
  const [seenExplore, setSeenExplore] = useState(false);
  useEffect(() => {
    if (phase === 'explore') setSeenExplore(true);
  }, [phase]);

  useEffect(() => {
    const off = installAudioUnlock();
    if (currentBgm() !== 'ending') playBgm('plaza');
    return () => {
      off();
      stopBgm('plaza');
    };
  }, []);

  return (
    <div className="hud ui-root" data-testid="hud">
      <div className="hud-left">
        <Minimap />
        <SkillList />
      </div>
      <div className="hud-right">
        <QuestTracker />
        <NotificationStack />
      </div>
      <MuteButton />
      {seenExplore && <ControlsToast />}
    </div>
  );
}
