// ─── Interpreter ───
// Maps LLM output + canvas state -> registry-validated elements -> level layout.
// Bridges the creative AI build phase with the strict game engine.

import { CanvasState, Genre } from "@/types";
import { ElementType, ELEMENT_REGISTRY, isValidElementType } from "./registry";
import { designLevel, LevelLayout } from "./levelDesigner";

interface InterpretedElement {
  type: ElementType;
  label: string;
}

// Genre-specific default element pools (fallback when LLM items don't map cleanly)
const GENRE_DEFAULTS: Record<Genre, ElementType[]> = {
  Racing: ["checkpoint", "checkpoint", "checkpoint", "speed_boost", "speed_boost", "obstacle_moving"],
  Pets: ["friendly_npc", "friendly_npc", "friendly_npc", "collectible_star", "jump_pad"],
  Space: ["collectible_gem", "collectible_gem", "collectible_star", "speed_boost", "obstacle_moving"],
  Fantasy: ["collectible_gem", "collectible_star", "friendly_npc", "checkpoint", "jump_pad"],
  Ocean: ["collectible_star", "collectible_coin", "collectible_gem", "speed_boost", "friendly_npc"],
  Dinosaurs: ["collectible_star", "collectible_coin", "speed_boost", "obstacle_static", "friendly_npc"],
};

// Keyword mapping: canvas_state labels → element types
const KEYWORD_MAP: [RegExp, ElementType][] = [
  [/speed|fast|turbo|boost|rocket|nitro|wind|dash/i, "speed_boost"],
  [/jump|spring|bounce|trampoline|leap/i, "jump_pad"],
  [/star|sparkle|shine|glow|light/i, "collectible_star"],
  [/coin|treasure|gold|money|loot/i, "collectible_coin"],
  [/gem|crystal|diamond|jewel|ruby|emerald/i, "collectible_gem"],
  [/friend|buddy|pet|companion|helper|animal|puppy|kitty|bunny/i, "friendly_npc"],
  [/gate|flag|banner|marker|checkpoint|finish/i, "checkpoint"],
  [/rock|wall|block|barrier|stone|boulder/i, "obstacle_static"],
  [/enemy|patrol|moving|trap|danger/i, "obstacle_moving"],
  [/portal|door|exit|goal|end|warp/i, "goal_zone"],
];

function labelToElementType(label: string, fallback: ElementType): ElementType {
  for (const [pattern, type] of KEYWORD_MAP) {
    if (pattern.test(label)) return type;
  }
  return fallback;
}

// Interpret the canvas state into game elements
export function interpretCanvasState(
  canvasState: CanvasState,
  genre: Genre
): LevelLayout {
  const elements: InterpretedElement[] = [];
  const defaults = GENRE_DEFAULTS[genre];

  // Map world items
  canvasState.world.forEach((label) => {
    const type = labelToElementType(label, "obstacle_static");
    elements.push({ type, label });
  });

  // Map characters
  canvasState.characters.forEach((label) => {
    const type = labelToElementType(label, "friendly_npc");
    elements.push({ type, label });
  });

  // Map theme items
  canvasState.theme.forEach((label) => {
    const type = labelToElementType(label, "collectible_star");
    elements.push({ type, label });
  });

  // Ensure minimum objective count (at least 3 objective elements)
  const objectiveElements = elements.filter(
    (e) => ELEMENT_REGISTRY[e.type].isObjective
  );

  if (objectiveElements.length < 3) {
    const needed = 3 - objectiveElements.length;
    for (let i = 0; i < needed; i++) {
      const fallbackType = defaults[i % defaults.length];
      const def = ELEMENT_REGISTRY[fallbackType];
      if (def.isObjective) {
        elements.push({
          type: fallbackType,
          label: def.type === "friendly_npc" ? "Buddy" : def.type === "checkpoint" ? "Gate" : "Star",
        });
      } else {
        elements.push({ type: "collectible_star", label: "Star" });
      }
    }
  }

  // Ensure at least 1 speed boost
  const hasBoost = elements.some((e) => e.type === "speed_boost");
  if (!hasBoost) {
    elements.push({ type: "speed_boost", label: "Speed Boost" });
  }

  // Cap total elements
  const capped = elements.slice(0, 7);

  // Add goal zone
  capped.push({ type: "goal_zone", label: "Finish!" });

  // Create a deterministic seed from canvas state
  const seed = canvasState.world.length * 1000 +
    canvasState.characters.length * 100 +
    canvasState.theme.length * 10 +
    canvasState.mood.length;

  return designLevel(capped, seed);
}

// Get the objective description based on what elements are in the level
export function getObjectiveForLevel(
  elements: InterpretedElement[],
  genre: Genre
): { label: string; total: number; type: "collect" | "racing" | "interact" } {
  const objectiveElements = elements.filter(
    (e) => ELEMENT_REGISTRY[e.type].isObjective
  );

  const hasNpcs = objectiveElements.some((e) => e.type === "friendly_npc");
  const hasCheckpoints = objectiveElements.some((e) => e.type === "checkpoint");

  if (genre === "Pets" || (hasNpcs && !hasCheckpoints)) {
    return {
      label: "Meet all friends, then reach the goal!",
      total: objectiveElements.length,
      type: "interact",
    };
  }

  if (genre === "Racing" || hasCheckpoints) {
    return {
      label: "Pass all checkpoints to the finish!",
      total: objectiveElements.length,
      type: "racing",
    };
  }

  return {
    label: "Collect everything, then reach the goal!",
    total: objectiveElements.length,
    type: "collect",
  };
}
