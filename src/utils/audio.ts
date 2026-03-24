import { Howl } from "howler";

// Synthesized audio using Web Audio API as a lightweight alternative
// to shipping audio files — generates sounds procedurally on demand

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.15
) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — silent fallback
  }
}

export function playClickSound() {
  playTone(600, 0.1, "sine", 0.1);
  setTimeout(() => playTone(800, 0.08, "sine", 0.08), 50);
}

export function playSuccessSound() {
  playTone(523, 0.15, "sine", 0.12); // C5
  setTimeout(() => playTone(659, 0.15, "sine", 0.12), 100); // E5
  setTimeout(() => playTone(784, 0.2, "sine", 0.12), 200); // G5
}

export function playSpawnSound() {
  playTone(400, 0.2, "triangle", 0.1);
  setTimeout(() => playTone(600, 0.15, "triangle", 0.08), 100);
}

export function playCompletionSound() {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C major scale
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "sine", 0.1), i * 100);
  });
}

// Ambient background drone — very subtle
let ambientOscillator: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbientLoop() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    if (ambientOscillator) return; // already playing

    ambientOscillator = ctx.createOscillator();
    ambientGain = ctx.createGain();

    ambientOscillator.type = "sine";
    ambientOscillator.frequency.setValueAtTime(110, ctx.currentTime); // low A
    ambientGain.gain.setValueAtTime(0.02, ctx.currentTime);

    ambientOscillator.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    ambientOscillator.start();
  } catch {
    // Silent fallback
  }
}

export function stopAmbientLoop() {
  try {
    if (ambientOscillator) {
      ambientOscillator.stop();
      ambientOscillator.disconnect();
      ambientOscillator = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }
  } catch {
    // Silent fallback
  }
}
