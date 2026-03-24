"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  CanvasState,
  Genre,
  GameObject,
  GameObjective,
  ObjectiveType,
} from "@/types";

const COLLECTION_RADIUS = 1.2; // How close player must be to collect

// Map genre to primary objective type
function getObjectiveType(genre: Genre): ObjectiveType {
  switch (genre) {
    case "Racing":
      return "racing";
    case "Pets":
      return "interact";
    default:
      return "collect";
  }
}

// Convert canvas_state items into gameplay objects placed around the world
function buildGameObjects(
  canvasState: CanvasState,
  genre: Genre
): GameObject[] {
  const objects: GameObject[] = [];
  const objectiveType = getObjectiveType(genre);
  let id = 0;

  // Place world items as environment/paths
  canvasState.world.forEach((label, i) => {
    const angle = (i / Math.max(canvasState.world.length, 1)) * Math.PI * 2;
    const radius = 4 + i * 1.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Some world items become boosts (anything with speed-like words)
    const isBoost =
      /fast|speed|turbo|boost|rocket|nitro|wind/i.test(label);

    objects.push({
      id: `go-${id++}`,
      type: isBoost ? "boost" : "obstacle",
      position: [x, 0.4, z],
      label,
      collected: false,
    });
  });

  // Place characters as interactables or obstacles
  canvasState.characters.forEach((label, i) => {
    const angle =
      (i / Math.max(canvasState.characters.length, 1)) * Math.PI * 2 +
      Math.PI / 6;
    const radius = 3 + i * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    objects.push({
      id: `go-${id++}`,
      type: objectiveType === "interact" ? "interactable" : "obstacle",
      position: [x, 0.4, z],
      label,
      collected: false,
    });
  });

  // Place theme items as collectibles or checkpoints
  canvasState.theme.forEach((label, i) => {
    const angle =
      (i / Math.max(canvasState.theme.length, 1)) * Math.PI * 2 +
      Math.PI / 3;
    const radius = 5 + i * 1.8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    objects.push({
      id: `go-${id++}`,
      type: objectiveType === "racing" ? "checkpoint" : "collectible",
      position: [x, 0.4, z],
      label,
      collected: false,
    });
  });

  // Ensure we always have enough objective items (minimum 3)
  const objItems = objects.filter(
    (o) =>
      o.type === "collectible" ||
      o.type === "checkpoint" ||
      o.type === "interactable"
  );

  if (objItems.length < 3) {
    // Add extra collectibles/checkpoints spread around
    const needed = 3 - objItems.length;
    for (let i = 0; i < needed; i++) {
      const angle = ((objItems.length + i) / 5) * Math.PI * 2 + Math.PI / 2;
      const radius = 6 + i * 2;
      objects.push({
        id: `go-${id++}`,
        type: objectiveType === "racing" ? "checkpoint" : objectiveType === "interact" ? "interactable" : "collectible",
        position: [Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius],
        label: objectiveType === "racing" ? `Gate ${i + 1}` : objectiveType === "interact" ? `Friend ${i + 1}` : `Star ${i + 1}`,
        collected: false,
      });
    }
  }

  // Always add a couple of boost zones
  const boostCount = objects.filter((o) => o.type === "boost").length;
  if (boostCount < 2) {
    for (let i = 0; i < 2 - boostCount; i++) {
      const angle = Math.PI * (0.8 + i * 1.2);
      const radius = 7 + i * 3;
      objects.push({
        id: `go-${id++}`,
        type: "boost",
        position: [Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius],
        label: "Speed Boost",
        collected: false,
      });
    }
  }

  return objects;
}

function buildObjective(
  genre: Genre,
  objects: GameObject[]
): GameObjective {
  const type = getObjectiveType(genre);
  const targetTypes =
    type === "racing"
      ? ["checkpoint"]
      : type === "interact"
        ? ["interactable"]
        : ["collectible"];

  const total = objects.filter((o) => targetTypes.includes(o.type)).length;

  const labels: Record<ObjectiveType, string> = {
    racing: "Pass all checkpoints",
    collect: "Collect all items",
    interact: "Meet all friends",
  };

  return {
    type,
    label: labels[type],
    total,
    current: 0,
  };
}

export function useGameManager(canvasState: CanvasState, genre: Genre) {
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [objective, setObjective] = useState<GameObjective>({
    type: "collect",
    label: "Collect all items",
    total: 0,
    current: 0,
  });
  const [boosted, setBoosted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize game from canvas state
  const initGame = useCallback(() => {
    const objects = buildGameObjects(canvasState, genre);
    const obj = buildObjective(genre, objects);
    setGameObjects(objects);
    setObjective(obj);
    setBoosted(false);
    setGameWon(false);
  }, [canvasState, genre]);

  // Check collision between player position and game objects
  const checkCollisions = useCallback(
    (playerPos: [number, number, number]) => {
      if (gameWon) return;

      setGameObjects((prev) => {
        let changed = false;
        const next = prev.map((obj) => {
          if (obj.collected) return obj;

          const dx = playerPos[0] - obj.position[0];
          const dz = playerPos[2] - obj.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < COLLECTION_RADIUS) {
            changed = true;

            if (obj.type === "boost") {
              setBoosted(true);
              if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
              boostTimerRef.current = setTimeout(() => setBoosted(false), 3000);
              return { ...obj, collected: true };
            }

            if (
              obj.type === "collectible" ||
              obj.type === "checkpoint" ||
              obj.type === "interactable"
            ) {
              return { ...obj, collected: true };
            }
          }
          return obj;
        });

        if (changed) {
          // Recount objective progress
          const targetTypes =
            objective.type === "racing"
              ? ["checkpoint"]
              : objective.type === "interact"
                ? ["interactable"]
                : ["collectible"];

          const collected = next.filter(
            (o) => targetTypes.includes(o.type) && o.collected
          ).length;

          setObjective((prev) => {
            const updated = { ...prev, current: collected };
            if (collected >= prev.total && !gameWon) {
              setGameWon(true);
            }
            return updated;
          });
        }

        return changed ? next : prev;
      });
    },
    [gameWon, objective.type]
  );

  return {
    gameObjects,
    objective,
    boosted,
    gameWon,
    initGame,
    checkCollisions,
  };
}
