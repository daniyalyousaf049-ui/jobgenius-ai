// Synthesized sound effects via Web Audio API — no external assets needed.
// Lightweight Duolingo-style cues.

let ctx: AudioContext | null = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

type Settings = { sound: boolean; haptics: boolean; volume: number };
const KEY = "interview-fx-settings";
export function getSettings(): Settings {
  if (typeof window === "undefined") return { sound: true, haptics: true, volume: 0.7 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { sound: true, haptics: true, volume: 0.7, ...JSON.parse(raw) };
  } catch {}
  return { sound: true, haptics: true, volume: 0.7 };
}
export function setSettings(s: Partial<Settings>) {
  if (typeof window === "undefined") return;
  const next = { ...getSettings(), ...s };
  localStorage.setItem(KEY, JSON.stringify(next));
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.2, when = 0) {
  const c = getCtx();
  if (!c) return;
  const s = getSettings();
  if (!s.sound) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + when;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain * s.volume, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function vibrate(pattern: number | number[]) {
  const s = getSettings();
  if (!s.haptics) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
}

export const sfx = {
  click()    { tone(600, 0.06, "sine", 0.06); vibrate(8); },
  hover()    { tone(900, 0.03, "sine", 0.03); },
  type()     { tone(1200 + Math.random() * 200, 0.02, "sine", 0.04); },
  notify()   { tone(880, 0.08, "sine", 0.12); tone(1320, 0.12, "sine", 0.1, 0.06); vibrate(20); },
  reveal()   { [392, 523, 659].forEach((f, i) => tone(f, 0.18, "sine", 0.12, i * 0.05)); vibrate(15); },
  submit()   { tone(523, 0.06, "sine", 0.1); tone(659, 0.1, "sine", 0.1, 0.05); vibrate(12); },
  correct()  { [523, 659, 784].forEach((f, i) => tone(f, 0.12, "sine", 0.14, i * 0.06)); vibrate(80); },
  average()  { tone(440, 0.12, "triangle", 0.12); vibrate(30); },
  poor()     { tone(280, 0.18, "sine", 0.12); tone(200, 0.2, "sine", 0.1, 0.08); vibrate(60); },
  combo()    { [700, 900, 1100].forEach((f, i) => tone(f, 0.1, "sine", 0.14, i * 0.06)); vibrate([40, 40, 80]); },
  legendary(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, "sine", 0.16, i * 0.07)); vibrate([100,50,100,50,200]); },
  damage()   { tone(180, 0.18, "sawtooth", 0.14); vibrate([100, 200]); },
  gameover() { [440, 392, 349, 294].forEach((f, i) => tone(f, 0.25, "triangle", 0.16, i * 0.18)); vibrate([200,100,200,100,500]); },
  levelup()  { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, "triangle", 0.16, i * 0.08)); vibrate([100,200,100]); },
  powerup()  { tone(880, 0.08, "sine", 0.14); tone(1320, 0.1, "sine", 0.14, 0.06); vibrate(30); },
  streak()   { [659, 784, 988].forEach((f, i) => tone(f, 0.16, "triangle", 0.14, i * 0.1)); vibrate([50, 50, 50]); },
  applause() { for (let i = 0; i < 8; i++) tone(200 + Math.random() * 600, 0.05, "sine", 0.06, i * 0.05); },
};
