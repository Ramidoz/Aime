// ─── Game State Machine ───
// Manages timer, combo, scoring, win/lose, and stun.

export type GamePhase = "countdown" | "playing" | "won" | "lost" | "paused";

export interface GameState {
  phase: GamePhase;
  timer: number;         // Seconds remaining
  score: number;
  combo: number;         // Current combo multiplier (1, 2, 3...)
  maxCombo: number;      // Highest combo reached this session
  lastCollectTime: number; // Timestamp of last collection (for combo window)
  stunUntil: number;     // Timestamp when stun ends (0 = not stunned)
  objectivesTotal: number;
  objectivesCollected: number;
  goalReady: boolean;    // True when all objectives collected
  highScore: number;     // Best score this session
  boosted: boolean;      // Speed boost active
  damaged: boolean;      // Recently hit (for screen effects)
}

export const GAME_CONSTANTS = {
  STARTING_TIME: 45,        // seconds
  COLLECT_TIME_BONUS: 3,    // seconds added per collection
  OBSTACLE_TIME_PENALTY: 5, // seconds removed per obstacle hit
  COMBO_WINDOW: 3.0,        // seconds to maintain combo
  STUN_DURATION: 0.4,       // seconds player is frozen after obstacle hit
  TIME_BONUS_MULTIPLIER: 50, // points per remaining second
  COMBO_BONUS_MULTIPLIER: 100, // points per max combo level
  LOW_TIME_THRESHOLD: 10,   // seconds when timer turns red
  COUNTDOWN_DURATION: 3,    // "3, 2, 1, GO!" countdown
} as const;

export function createInitialGameState(objectivesTotal: number): GameState {
  return {
    phase: "countdown",
    timer: GAME_CONSTANTS.STARTING_TIME,
    score: 0,
    combo: 1,
    maxCombo: 1,
    lastCollectTime: 0,
    stunUntil: 0,
    objectivesTotal,
    objectivesCollected: 0,
    goalReady: false,
    highScore: 0,
    boosted: false,
    damaged: false,
  };
}

export function calculateFinalScore(state: GameState): {
  baseScore: number;
  timeBonus: number;
  comboBonus: number;
  total: number;
} {
  const timeBonus = Math.max(0, Math.floor(state.timer)) * GAME_CONSTANTS.TIME_BONUS_MULTIPLIER;
  const comboBonus = state.maxCombo * GAME_CONSTANTS.COMBO_BONUS_MULTIPLIER;
  const total = state.score + timeBonus + comboBonus;
  return {
    baseScore: state.score,
    timeBonus,
    comboBonus,
    total,
  };
}
