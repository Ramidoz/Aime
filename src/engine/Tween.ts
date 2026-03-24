// ─── Tween / Easing Utilities ───
// Lightweight tween system — no dependencies.
// Use for smooth value transitions (camera, UI, scale).

export type EasingFn = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
  easeOutBack: (t: number) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};

interface TweenConfig {
  from: number;
  to: number;
  duration: number; // ms
  easing?: EasingFn;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

interface ActiveTween {
  config: TweenConfig;
  startTime: number;
}

class TweenManager {
  private tweens: Map<string, ActiveTween> = new Map();
  private counter = 0;
  private rafId: number | null = null;

  /** Start a tween. Returns an id to cancel it. */
  start(config: TweenConfig): string {
    const id = `tween_${this.counter++}`;
    this.tweens.set(id, { config, startTime: performance.now() });
    this.ensureRunning();
    return id;
  }

  cancel(id: string): void {
    this.tweens.delete(id);
  }

  cancelAll(): void {
    this.tweens.clear();
  }

  private ensureRunning(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    const toRemove: string[] = [];

    for (const [id, tween] of this.tweens) {
      const elapsed = now - tween.startTime;
      const progress = Math.min(elapsed / tween.config.duration, 1);
      const easing = tween.config.easing || Easing.easeOutQuad;
      const easedProgress = easing(progress);
      const value = tween.config.from + (tween.config.to - tween.config.from) * easedProgress;

      tween.config.onUpdate(value);

      if (progress >= 1) {
        tween.config.onComplete?.();
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.tweens.delete(id);
    }

    if (this.tweens.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.rafId = null;
    }
  };
}

export const tweenManager = new TweenManager();

/** Convenience: tween a value from→to over duration ms */
export function tween(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void,
  easing?: EasingFn
): string {
  return tweenManager.start({ from, to, duration, easing, onUpdate });
}
