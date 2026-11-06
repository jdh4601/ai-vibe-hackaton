import { applyMute, getAudioContext, getMaster, isMuted, onAudioUnlocked } from './context';

export type BgmTrack = 'plaza' | 'ending';

interface Song {
  stepSec: number;
  melody: (number | null)[]; // semitone offsets from root, one per step
  bass: (number | null)[];
  root: number;
  wave: OscillatorType;
}

// Plain C major pentatonic loops, synthesized at runtime (no audio files).
const SONGS: Record<BgmTrack, Song> = {
  plaza: {
    stepSec: 0.3,
    root: 261.63,
    wave: 'triangle',
    melody: [7, null, 9, 12, 9, null, 7, 4, 4, null, 7, 9, 7, null, 4, 2, 0, null, 4, 7, 4, null, 2, 0, 2, 4, 7, 9, 12, null, null, null],
    bass: [-12, null, null, null, -5, null, null, null, -8, null, null, null, -5, null, null, null],
  },
  ending: {
    stepSec: 0.55,
    root: 261.63,
    wave: 'sine',
    melody: [12, null, 9, null, 7, null, 9, 12, 14, null, 12, null, 9, null, 7, null, 4, null, 7, null, 9, null, 7, 4, 0, null, null, null, null, null, null, null],
    bass: [-12, null, -5, null, -8, null, -3, null, -12, null, -5, null, -7, null, -12, null],
  },
};

let current: BgmTrack | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextTime = 0;
let step = 0;
let unsub: (() => void) | null = null;

const freq = (root: number, semis: number) => root * Math.pow(2, semis / 12);

function note(f: number, t: number, dur: number, gain: number, type: OscillatorType) {
  const c = getAudioContext();
  const out = getMaster();
  if (!c || !out) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function pump() {
  const c = getAudioContext();
  if (!c || !current || c.state !== 'running') return;
  const song = SONGS[current];
  if (nextTime < c.currentTime) nextTime = c.currentTime + 0.05;
  while (nextTime < c.currentTime + 0.6) {
    const m = song.melody[step % song.melody.length];
    if (m !== null && m !== undefined) note(freq(song.root, m), nextTime, song.stepSec * 1.6, 0.05, song.wave);
    const b = song.bass[step % song.bass.length];
    if (b !== null && b !== undefined && step % 2 === 0) note(freq(song.root, b), nextTime, song.stepSec * 3, 0.06, 'sine');
    nextTime += song.stepSec;
    step++;
  }
}

function startLoop() {
  if (timer) return;
  timer = setInterval(pump, 150);
  pump();
}

export function playBgm(track: BgmTrack): void {
  if (current === track) return;
  current = track;
  step = 0;
  nextTime = 0;
  const c = getAudioContext();
  if (!c) return; // jsdom / unsupported
  applyMute(isMuted());
  unsub?.();
  unsub = onAudioUnlocked(startLoop);
  if (c.state === 'running') startLoop();
}

export function stopBgm(onlyTrack?: BgmTrack): void {
  if (onlyTrack && current !== onlyTrack) return;
  current = null;
  if (timer) clearInterval(timer);
  timer = null;
  unsub?.();
  unsub = null;
}

export const currentBgm = (): BgmTrack | null => current;
export const setBgmMuted = applyMute;
