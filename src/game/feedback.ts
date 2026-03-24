// ─── Feedback System ───
// Audio, screen shake, and score popup management.
// Every interaction must feel satisfying.

import { SoundEffect } from "./registry";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol: number = 0.12) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch {
    // Silent fallback
  }
}

// ─── Sound Effects ───

export function playCollectChime() {
  tone(880, 0.08, "sine", 0.15);
  setTimeout(() => tone(1100, 0.08, "sine", 0.12), 60);
  setTimeout(() => tone(1320, 0.12, "sine", 0.1), 120);
}

export function playBoostWhoosh() {
  tone(200, 0.3, "sawtooth", 0.08);
  setTimeout(() => tone(400, 0.2, "sawtooth", 0.06), 50);
  setTimeout(() => tone(800, 0.15, "sine", 0.04), 100);
}

export function playNpcHello() {
  tone(523, 0.12, "sine", 0.1);
  setTimeout(() => tone(659, 0.12, "sine", 0.1), 80);
  setTimeout(() => tone(784, 0.15, "triangle", 0.08), 160);
}

export function playCheckpointDing() {
  tone(698, 0.1, "sine", 0.12);
  setTimeout(() => tone(880, 0.15, "sine", 0.12), 80);
}

export function playGoalFanfare() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => tone(freq, 0.3, "sine", 0.12), i * 120);
  });
}

export function playBump() {
  tone(120, 0.15, "square", 0.08);
  setTimeout(() => tone(80, 0.1, "square", 0.06), 50);
}

export function playJumpBoing() {
  tone(300, 0.1, "sine", 0.1);
  setTimeout(() => tone(600, 0.15, "sine", 0.08), 60);
  setTimeout(() => tone(900, 0.1, "sine", 0.06), 120);
}

// Dispatch sound by registry key
export function playSoundEffect(effect: SoundEffect) {
  switch (effect) {
    case "collect_chime": return playCollectChime();
    case "boost_whoosh": return playBoostWhoosh();
    case "npc_hello": return playNpcHello();
    case "checkpoint_ding": return playCheckpointDing();
    case "goal_fanfare": return playGoalFanfare();
    case "bump": return playBump();
    case "jump_boing": return playJumpBoing();
    case "none": return;
  }
}

// ─── Screen Shake ───

let shakeTarget: HTMLElement | null = null;

export function setShakeTarget(el: HTMLElement | null) {
  shakeTarget = el;
}

export function triggerScreenShake(intensity: number = 4, duration: number = 200) {
  const el = shakeTarget || document.body;
  const start = performance.now();

  function shake(now: number) {
    const elapsed = now - start;
    if (elapsed > duration) {
      el.style.transform = "";
      return;
    }
    const decay = 1 - elapsed / duration;
    const x = (Math.random() - 0.5) * intensity * decay;
    const y = (Math.random() - 0.5) * intensity * decay;
    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(shake);
  }

  requestAnimationFrame(shake);
}

// ─── Score Popup Manager ───

export interface ScorePopup {
  id: number;
  value: number;
  x: number;
  y: number;
  createdAt: number;
}

let popupCounter = 0;

export function createScorePopup(value: number): ScorePopup {
  return {
    id: popupCounter++,
    value,
    x: 50 + (Math.random() - 0.5) * 20, // percentage of screen width
    y: 40 + (Math.random() - 0.5) * 10,  // percentage of screen height
    createdAt: Date.now(),
  };
}
