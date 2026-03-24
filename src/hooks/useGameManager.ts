"use client";

import { useState, useCallback, useRef } from "react";
import { CanvasState, Genre, GameObjective } from "@/types";
import { ELEMENT_REGISTRY } from "@/game/registry";
import { PlacedElement, LevelLayout } from "@/game/levelDesigner";
import { interpretCanvasState } from "@/game/interpreter";
import {
  playSoundEffect,
  triggerScreenShake,
  createScorePopup,
  ScorePopup,
} from "@/game/feedback";

export function useGameManager(canvasState: CanvasState, genre: Genre) {
  const [layout, setLayout] = useState<LevelLayout | null>(null);
  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [objective, setObjective] = useState<GameObjective>({
    type: "collect",
    label: "Collect all items",
    total: 0,
    current: 0,
  });
  const [score, setScore] = useState(0);
  const [boosted, setBoosted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [collectEffects, setCollectEffects] = useState<
    { id: number; position: [number, number, number]; color: string }[]
  >([]);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goalReadyRef = useRef(false);

  const initGame = useCallback(() => {
    const levelLayout = interpretCanvasState(canvasState, genre);
    setLayout(levelLayout);
    setElements(levelLayout.elements);
    setScore(0);
    setBoosted(false);
    setGameWon(false);
    setScorePopups([]);
    setCollectEffects([]);
    goalReadyRef.current = false;

    // Count objectives
    const objectiveEls = levelLayout.elements.filter(
      (e) => ELEMENT_REGISTRY[e.type].isObjective
    );

    const hasNpcs = objectiveEls.some((e) => e.type === "friendly_npc");
    const hasCheckpoints = objectiveEls.some((e) => e.type === "checkpoint");

    let label = "Collect everything, then reach the goal!";
    let type: "collect" | "racing" | "interact" = "collect";

    if (genre === "Pets" || (hasNpcs && !hasCheckpoints)) {
      label = "Meet all friends, then reach the goal!";
      type = "interact";
    } else if (genre === "Racing" || hasCheckpoints) {
      label = "Pass all checkpoints to the finish!";
      type = "racing";
    }

    setObjective({
      type,
      label,
      total: objectiveEls.length,
      current: 0,
    });
  }, [canvasState, genre]);

  const removeCollectEffect = useCallback((id: number) => {
    setCollectEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const checkCollisions = useCallback(
    (playerPos: [number, number, number]) => {
      if (gameWon) return;

      setElements((prev) => {
        let changed = false;
        const next = prev.map((el) => {
          if (el.collected) return el;

          const def = ELEMENT_REGISTRY[el.type];
          const dx = playerPos[0] - el.position[0];
          const dz = playerPos[2] - el.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < def.interactionRadius) {
            // Goal zone — only activate when all objectives done
            if (el.type === "goal_zone") {
              if (!goalReadyRef.current) return el;
              // Player reached goal!
              changed = true;
              playSoundEffect(def.sound);
              setGameWon(true);
              setScore((s) => s + def.scoreValue);
              setScorePopups((p) => [...p, createScorePopup(def.scoreValue)]);
              setCollectEffects((p) => [
                ...p,
                { id: Date.now(), position: el.position, color: def.color },
              ]);
              return { ...el, collected: true };
            }

            changed = true;
            playSoundEffect(def.sound);

            // Score
            if (def.scoreValue > 0) {
              setScore((s) => s + def.scoreValue);
              setScorePopups((p) => [...p, createScorePopup(def.scoreValue)]);
            }

            // Particle effect
            if (def.particle !== "none") {
              setCollectEffects((p) => [
                ...p,
                { id: Date.now() + Math.random(), position: [...el.position] as [number, number, number], color: def.color },
              ]);
            }

            // Speed boost
            if (el.type === "speed_boost") {
              setBoosted(true);
              if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
              boostTimerRef.current = setTimeout(() => setBoosted(false), 3000);
            }

            // Screen shake for obstacles
            if (def.category === "hazard") {
              triggerScreenShake(3, 150);
            }

            if (def.consumeOnTouch || def.isObjective) {
              return { ...el, collected: true };
            }
          }
          return el;
        });

        if (changed) {
          // Recount objective progress
          const objectiveCount = next.filter(
            (e) => ELEMENT_REGISTRY[e.type].isObjective && e.collected
          ).length;

          setObjective((prev) => {
            const updated = { ...prev, current: objectiveCount };
            if (objectiveCount >= prev.total) {
              goalReadyRef.current = true;
            }
            return updated;
          });
        }

        return changed ? next : prev;
      });
    },
    [gameWon]
  );

  return {
    layout,
    elements,
    objective,
    score,
    boosted,
    gameWon,
    scorePopups,
    collectEffects,
    initGame,
    checkCollisions,
    removeCollectEffect,
  };
}
