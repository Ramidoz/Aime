// ─── Feedback System ───
// Audio, screen shake, and popups. Every interaction must feel satisfying.

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

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol: number = 0.12, delay: number = 0) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur);
  } catch {
    // Silent fallback
  }
}

// ─── Collection sounds — pitch rises with combo ───

export function playCollectStar(combo: number = 1) {
  const pitchMultiplier = 1 + (combo - 1) * 0.12;
  tone(880 * pitchMultiplier, 0.08, "sine", 0.14);
  tone(1100 * pitchMultiplier, 0.08, "sine", 0.11, 0.06);
  tone(1320 * pitchMultiplier, 0.12, "sine", 0.09, 0.12);
}

export function playCollectCoin(combo: number = 1) {
  const p = 1 + (combo - 1) * 0.12;
  tone(1200 * p, 0.06, "square", 0.08);
  tone(1500 * p, 0.06, "square", 0.06, 0.05);
}

export function playCollectGem(combo: number = 1) {
  const p = 1 + (combo - 1) * 0.12;
  tone(660 * p, 0.15, "sine", 0.12);
  tone(990 * p, 0.12, "sine", 0.1, 0.08);
  tone(1320 * p, 0.18, "sine", 0.08, 0.16);
}

export function playBoostWhoosh() {
  tone(200, 0.3, "sawtooth", 0.08);
  tone(400, 0.2, "sawtooth", 0.06, 0.05);
  tone(800, 0.15, "sine", 0.04, 0.1);
}

export function playNpcHello(combo: number = 1) {
  const p = 1 + (combo - 1) * 0.1;
  tone(523 * p, 0.1, "sine", 0.1);
  tone(659 * p, 0.1, "sine", 0.1, 0.08);
  tone(784 * p, 0.12, "triangle", 0.08, 0.16);
}

export function playCheckpointDing(combo: number = 1) {
  const p = 1 + (combo - 1) * 0.1;
  tone(698 * p, 0.1, "sine", 0.12);
  tone(880 * p, 0.15, "sine", 0.12, 0.08);
}

export function playGoalFanfare() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    tone(freq, 0.3, "sine", 0.13, i * 0.12);
  });
}

// ─── Obstacle hit — crunchy, punishing ───

export function playObstacleHit() {
  tone(80, 0.2, "sawtooth", 0.15);
  tone(60, 0.15, "square", 0.12, 0.05);
  tone(120, 0.1, "sawtooth", 0.08, 0.1);
}

export function playJumpBoing() {
  tone(300, 0.1, "sine", 0.1);
  tone(600, 0.15, "sine", 0.08, 0.06);
  tone(900, 0.1, "sine", 0.06, 0.12);
}

// ─── Timer warning — increasingly urgent ───

export function playTimerTick(timeRemaining: number) {
  if (timeRemaining <= 5) {
    tone(1000, 0.05, "square", 0.1);
  } else if (timeRemaining <= 10) {
    tone(800, 0.04, "sine", 0.06);
  }
}

// ─── Lose sound ───

export function playLoseSound() {
  tone(300, 0.3, "sawtooth", 0.1);
  tone(200, 0.4, "sawtooth", 0.08, 0.2);
  tone(100, 0.5, "sawtooth", 0.06, 0.4);
}

// ─── Combo sound ───

export function playComboUp(level: number) {
  const base = 400 + level * 100;
  tone(base, 0.08, "triangle", 0.1);
  tone(base * 1.5, 0.1, "triangle", 0.08, 0.06);
}

// ─── Dispatch by registry key ───

export function playSoundEffect(effect: SoundEffect, combo: number = 1) {
  switch (effect) {
    case "collect_chime": return playCollectStar(combo);
    case "boost_whoosh": return playBoostWhoosh();
    case "npc_hello": return playNpcHello(combo);
    case "checkpoint_ding": return playCheckpointDing(combo);
    case "goal_fanfare": return playGoalFanfare();
    case "bump": return playObstacleHit();
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
  text: string;
  color: string;
  x: number;
  y: number;
  createdAt: number;
}

let popupCounter = 0;

export function createScorePopup(text: string, color: string = "#FFD700"): ScorePopup {
  return {
    id: popupCounter++,
    text,
    color,
    x: 50 + (Math.random() - 0.5) * 16,
    y: 38 + (Math.random() - 0.5) * 8,
    createdAt: Date.now(),
  };
}
