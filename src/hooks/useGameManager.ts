"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CanvasState, Genre, GameObjective } from "@/types";
import { ELEMENT_REGISTRY } from "@/game/registry";
import { PlacedElement } from "@/game/levelDesigner";
import { interpretCanvasState } from "@/game/interpreter";
import {
  GameState,
  GamePhase,
  GAME_CONSTANTS,
  createInitialGameState,
  calculateFinalScore,
} from "@/game/GameState";
import {
  playSoundEffect,
  playObstacleHit,
  playTimerTick,
  playLoseSound,
  playComboUp,
  playGoalFanfare,
  triggerScreenShake,
  createScorePopup,
  ScorePopup,
} from "@/game/feedback";

export function useGameManager(canvasState: CanvasState, genre: Genre) {
  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState(0));
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [collectEffects, setCollectEffects] = useState<
    { id: number; position: [number, number, number]; color: string }[]
  >([]);
  const [stunActive, setStunActive] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickSoundRef = useRef(0);
  const gameStateRef = useRef(gameState);

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ─── Timer logic ───
  useEffect(() => {
    if (gameState.phase !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.phase !== "playing") return prev;

        const newTimer = Math.max(0, prev.timer - 0.1);

        // Tick sound for low time
        const now = Date.now();
        const secondsLeft = Math.ceil(newTimer);
        if (
          secondsLeft <= GAME_CONSTANTS.LOW_TIME_THRESHOLD &&
          secondsLeft > 0 &&
          now - lastTickSoundRef.current > 900
        ) {
          playTimerTick(secondsLeft);
          lastTickSoundRef.current = now;
        }

        // Check combo timeout
        let combo = prev.combo;
        if (
          prev.combo > 1 &&
          now - prev.lastCollectTime > GAME_CONSTANTS.COMBO_WINDOW * 1000
        ) {
          combo = 1;
        }

        // Time's up
        if (newTimer <= 0) {
          playLoseSound();
          return { ...prev, timer: 0, combo, phase: "lost" as GamePhase };
        }

        return { ...prev, timer: newTimer, combo };
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.phase]);

  // ─── Countdown logic ───
  useEffect(() => {
    if (gameState.phase !== "countdown") return;

    setCountdownNumber(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setGameState((prev) => ({ ...prev, phase: "playing" }));
        setCountdownNumber(0);
      } else {
        setCountdownNumber(count);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [gameState.phase]);

  // ─── Initialize game ───
  const initGame = useCallback(() => {
    const layout = interpretCanvasState(canvasState, genre);
    setElements(layout.elements);
    setScorePopups([]);
    setCollectEffects([]);
    setStunActive(false);

    const objectiveCount = layout.elements.filter(
      (e) => ELEMENT_REGISTRY[e.type].isObjective
    ).length;

    setGameState(createInitialGameState(objectiveCount));
  }, [canvasState, genre]);

  const removeCollectEffect = useCallback((id: number) => {
    setCollectEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ─── Collision check (called every frame by PlayerController) ───
  const checkCollisions = useCallback(
    (playerPos: [number, number, number]) => {
      const gs = gameStateRef.current;
      if (gs.phase !== "playing" || gs.stunUntil > Date.now()) return;

      setElements((prev) => {
        let changed = false;
        const now = Date.now();
        const next = prev.map((el) => {
          if (el.collected) return el;

          const def = ELEMENT_REGISTRY[el.type];
          const dx = playerPos[0] - el.position[0];
          const dz = playerPos[2] - el.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist >= def.interactionRadius) return el;

          // ── Goal zone ──
          if (el.type === "goal_zone") {
            if (!gs.goalReady) return el;
            changed = true;
            playGoalFanfare();
            const finalState = { ...gs, phase: "won" as GamePhase };
            const scores = calculateFinalScore(finalState);
            setGameState((prev) => ({
              ...prev,
              phase: "won",
              score: scores.total,
              highScore: Math.max(prev.highScore, scores.total),
            }));
            setCollectEffects((p) => [
              ...p,
              { id: now, position: el.position, color: def.color },
            ]);
            return { ...el, collected: true };
          }

          // ── Obstacles: penalty ──
          if (def.category === "hazard") {
            changed = true;
            playObstacleHit();
            triggerScreenShake(8, 300);

            // Time penalty + stun + combo reset + damaged flash
            setGameState((prev) => ({
              ...prev,
              timer: Math.max(0, prev.timer - GAME_CONSTANTS.OBSTACLE_TIME_PENALTY),
              combo: 1,
              stunUntil: now + GAME_CONSTANTS.STUN_DURATION * 1000,
              damaged: true,
            }));
            setStunActive(true);
            setTimeout(() => setStunActive(false), GAME_CONSTANTS.STUN_DURATION * 1000);
            setTimeout(() => setGameState((prev) => ({ ...prev, damaged: false })), 300);

            setScorePopups((p) => [
              ...p,
              createScorePopup(`-${GAME_CONSTANTS.OBSTACLE_TIME_PENALTY}s`, "#FF4444"),
            ]);

            // Obstacles don't get consumed — you can hit them again
            return el;
          }

          // ── Speed boost ──
          if (el.type === "speed_boost") {
            changed = true;
            playSoundEffect(def.sound);
            setCollectEffects((p) => [
              ...p,
              { id: now + Math.random(), position: [...el.position] as [number, number, number], color: def.color },
            ]);

            setGameState((prev) => ({ ...prev, boosted: true } as GameState));
            if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
            boostTimerRef.current = setTimeout(() => {
              setGameState((prev) => ({ ...prev, boosted: false } as GameState));
            }, 3000);

            return { ...el, collected: true };
          }

          // ── Objective items (star, coin, gem, npc, checkpoint) ──
          if (def.isObjective || def.scoreValue > 0) {
            changed = true;

            // Combo logic
            const timeSinceLast = now - gs.lastCollectTime;
            let newCombo = gs.combo;
            if (timeSinceLast < GAME_CONSTANTS.COMBO_WINDOW * 1000 && gs.lastCollectTime > 0) {
              newCombo = gs.combo + 1;
              playComboUp(newCombo);
            } else {
              newCombo = 1;
            }

            const scoreGain = def.scoreValue * newCombo;
            playSoundEffect(def.sound, newCombo);

            if (def.particle !== "none") {
              setCollectEffects((p) => [
                ...p,
                { id: now + Math.random(), position: [...el.position] as [number, number, number], color: def.color },
              ]);
            }

            // Score popup
            let popupText = `+${scoreGain}`;
            if (newCombo > 1) popupText += ` x${newCombo}`;
            setScorePopups((p) => [...p, createScorePopup(popupText)]);

            // Time bonus popup
            if (def.isObjective) {
              setTimeout(() => {
                setScorePopups((p) => [
                  ...p,
                  createScorePopup(`+${GAME_CONSTANTS.COLLECT_TIME_BONUS}s`, "#44FF88"),
                ]);
              }, 200);
            }

            triggerScreenShake(2, 100);

            const newCollected = def.isObjective
              ? gs.objectivesCollected + 1
              : gs.objectivesCollected;

            setGameState((prev) => ({
              ...prev,
              score: prev.score + scoreGain,
              combo: newCombo,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              lastCollectTime: now,
              timer: def.isObjective
                ? prev.timer + GAME_CONSTANTS.COLLECT_TIME_BONUS
                : prev.timer,
              objectivesCollected: newCollected,
              goalReady: newCollected >= prev.objectivesTotal,
            }));

            return def.consumeOnTouch || def.isObjective
              ? { ...el, collected: true }
              : el;
          }

          return el;
        });

        return changed ? next : prev;
      });
    },
    []
  );

  // Derive values for external consumers
  const objective: GameObjective = {
    type: genre === "Racing" ? "racing" : genre === "Pets" ? "interact" : "collect",
    label: gameState.goalReady ? "Reach the goal!" : `Collect all items`,
    total: gameState.objectivesTotal,
    current: gameState.objectivesCollected,
  };

  const boosted = gameState.boosted || false;
  const damaged = gameState.damaged || false;

  return {
    elements,
    gameState,
    objective,
    score: gameState.score,
    boosted,
    damaged,
    gameWon: gameState.phase === "won",
    gameLost: gameState.phase === "lost",
    scorePopups,
    collectEffects,
    stunActive,
    countdownNumber,
    initGame,
    checkCollisions,
    removeCollectEffect,
  };
}
