import { useGameStore } from '../stores/useGameStore';

// Shared Web Audio plumbing. Every function is safe in jsdom / SSR (returns null / no-ops).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const unlockListeners = new Set<() => void>();

export const isMuted = (): boolean => useGameStore.getState().muted;

export function getAudioContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor: typeof AudioContext | undefined =
      typeof window === 'undefined' ? undefined : window.AudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = isMuted() ? 0 : 1;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
    master = null;
  }
  return ctx;
}

export function getMaster(): GainNode | null {
  getAudioContext();
  return master;
}

export function applyMute(muted: boolean): void {
  if (master) master.gain.value = muted ? 0 : 1;
}

export function onAudioUnlocked(fn: () => void): () => void {
  unlockListeners.add(fn);
  return () => unlockListeners.delete(fn);
}

// Call from a user gesture (click / key). Resumes the context and notifies waiting players (bgm).
export function unlockAudio(): void {
  const c = getAudioContext();
  if (!c) return;
  const done = () => unlockListeners.forEach((fn) => fn());
  try {
    if (c.state === 'running') done();
    else void c.resume().then(done, () => undefined);
  } catch {
    /* ignore */
  }
}

export function installAudioUnlock(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => unlockAudio();
  window.addEventListener('pointerdown', handler);
  window.addEventListener('keydown', handler);
  return () => {
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
  };
}

export interface ToneOpts {
  freq: number;
  start?: number; // seconds from now
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
}

// Schedule one enveloped oscillator note. Returns false when audio is unavailable or muted.
export function tone(o: ToneOpts): boolean {
  const c = getAudioContext();
  const out = getMaster();
  if (!c || !out || isMuted()) return false;
  try {
    const t0 = c.currentTime + (o.start ?? 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.slideTo) osc.frequency.linearRampToValueAtTime(o.slideTo, t0 + o.dur);
    const peak = o.gain ?? 0.08;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g);
    g.connect(out);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.02);
    return true;
  } catch {
    return false;
  }
}
