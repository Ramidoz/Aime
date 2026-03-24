// ─── Zustand Game Store ───
// Single source of truth for all runtime game state.
// Replaces scattered useState + type hacks with a proper store.

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type PlayPhase = "idle" | "countdown" | "playing" | "won" | "lost";

interface PlayState {
  phase: PlayPhase;
  score: number;
  timer: number;
  combo: number;
  maxCombo: number;
  objectivesTotal: number;
  objectivesCollected: number;
  goalReady: boolean;
  boosted: boolean;
  damaged: boolean;
  highScore: number;
}

interface GameStore {
  // Play state
  play: PlayState;

  // Actions
  setPhase: (phase: PlayPhase) => void;
  addScore: (points: number) => void;
  setCombo: (combo: number) => void;
  setBoosted: (boosted: boolean) => void;
  setDamaged: (damaged: boolean) => void;
  setTimer: (timer: number) => void;
  collectObjective: () => void;
  setGoalReady: (ready: boolean) => void;
  resetPlay: (objectivesTotal: number) => void;
}

const INITIAL_PLAY: PlayState = {
  phase: "idle",
  score: 0,
  timer: 45,
  combo: 1,
  maxCombo: 1,
  objectivesTotal: 0,
  objectivesCollected: 0,
  goalReady: false,
  boosted: false,
  damaged: false,
  highScore: 0,
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set) => ({
    play: { ...INITIAL_PLAY },

    setPhase: (phase) =>
      set((s) => ({ play: { ...s.play, phase } })),

    addScore: (points) =>
      set((s) => ({ play: { ...s.play, score: s.play.score + points } })),

    setCombo: (combo) =>
      set((s) => ({
        play: {
          ...s.play,
          combo,
          maxCombo: Math.max(s.play.maxCombo, combo),
        },
      })),

    setBoosted: (boosted) =>
      set((s) => ({ play: { ...s.play, boosted } })),

    setDamaged: (damaged) =>
      set((s) => ({ play: { ...s.play, damaged } })),

    setTimer: (timer) =>
      set((s) => ({ play: { ...s.play, timer } })),

    collectObjective: () =>
      set((s) => {
        const next = s.play.objectivesCollected + 1;
        return {
          play: {
            ...s.play,
            objectivesCollected: next,
            goalReady: next >= s.play.objectivesTotal,
          },
        };
      }),

    setGoalReady: (ready) =>
      set((s) => ({ play: { ...s.play, goalReady: ready } })),

    resetPlay: (objectivesTotal) =>
      set((s) => ({
        play: {
          ...INITIAL_PLAY,
          objectivesTotal,
          highScore: s.play.highScore,
          phase: "countdown",
        },
      })),
  }))
);
