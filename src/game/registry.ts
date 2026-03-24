// ─── Game Element Registry ───
// Strict type system for all allowed game elements.
// Every element in the game MUST come from this registry.

export const ELEMENT_TYPES = [
  "collectible_star",
  "collectible_coin",
  "collectible_gem",
  "speed_boost",
  "jump_pad",
  "friendly_npc",
  "checkpoint",
  "obstacle_static",
  "obstacle_moving",
  "goal_zone",
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];

export type AnimationType = "spin" | "bounce" | "pulse" | "float" | "sway" | "none";
export type SoundEffect = "collect_chime" | "boost_whoosh" | "npc_hello" | "checkpoint_ding" | "goal_fanfare" | "bump" | "jump_boing" | "none";
export type ParticleEffect = "sparkle_burst" | "speed_trail" | "confetti" | "heart_pop" | "ring_pulse" | "none";

export interface ElementDefinition {
  type: ElementType;
  category: "objective" | "powerup" | "social" | "navigation" | "hazard";
  mesh: "star" | "coin" | "gem" | "boost_pad" | "jump_pad" | "npc_blob" | "flag" | "rock" | "moving_block" | "portal";
  color: string;
  emissive: string;
  emissiveIntensity: number;
  animation: AnimationType;
  interactionRadius: number;
  scoreValue: number;
  sound: SoundEffect;
  particle: ParticleEffect;
  consumeOnTouch: boolean; // Does it disappear when collected?
  isObjective: boolean;    // Does it count toward win condition?
}

export const ELEMENT_REGISTRY: Record<ElementType, ElementDefinition> = {
  collectible_star: {
    type: "collectible_star",
    category: "objective",
    mesh: "star",
    color: "#FFD700",
    emissive: "#FFA500",
    emissiveIntensity: 0.7,
    animation: "spin",
    interactionRadius: 1.2,
    scoreValue: 100,
    sound: "collect_chime",
    particle: "sparkle_burst",
    consumeOnTouch: true,
    isObjective: true,
  },
  collectible_coin: {
    type: "collectible_coin",
    category: "objective",
    mesh: "coin",
    color: "#FFD700",
    emissive: "#CC8800",
    emissiveIntensity: 0.5,
    animation: "spin",
    interactionRadius: 1.0,
    scoreValue: 50,
    sound: "collect_chime",
    particle: "sparkle_burst",
    consumeOnTouch: true,
    isObjective: true,
  },
  collectible_gem: {
    type: "collectible_gem",
    category: "objective",
    mesh: "gem",
    color: "#FF44AA",
    emissive: "#AA0055",
    emissiveIntensity: 0.8,
    animation: "float",
    interactionRadius: 1.0,
    scoreValue: 200,
    sound: "collect_chime",
    particle: "sparkle_burst",
    consumeOnTouch: true,
    isObjective: true,
  },
  speed_boost: {
    type: "speed_boost",
    category: "powerup",
    mesh: "boost_pad",
    color: "#FF6600",
    emissive: "#FF3300",
    emissiveIntensity: 0.9,
    animation: "pulse",
    interactionRadius: 1.5,
    scoreValue: 0,
    sound: "boost_whoosh",
    particle: "speed_trail",
    consumeOnTouch: true,
    isObjective: false,
  },
  jump_pad: {
    type: "jump_pad",
    category: "powerup",
    mesh: "jump_pad",
    color: "#00CC66",
    emissive: "#009944",
    emissiveIntensity: 0.6,
    animation: "bounce",
    interactionRadius: 1.3,
    scoreValue: 0,
    sound: "jump_boing",
    particle: "ring_pulse",
    consumeOnTouch: false,
    isObjective: false,
  },
  friendly_npc: {
    type: "friendly_npc",
    category: "social",
    mesh: "npc_blob",
    color: "#FF88CC",
    emissive: "#CC4488",
    emissiveIntensity: 0.3,
    animation: "bounce",
    interactionRadius: 1.5,
    scoreValue: 150,
    sound: "npc_hello",
    particle: "heart_pop",
    consumeOnTouch: false,
    isObjective: true,
  },
  checkpoint: {
    type: "checkpoint",
    category: "navigation",
    mesh: "flag",
    color: "#00FF88",
    emissive: "#00AA55",
    emissiveIntensity: 0.6,
    animation: "sway",
    interactionRadius: 1.8,
    scoreValue: 75,
    sound: "checkpoint_ding",
    particle: "ring_pulse",
    consumeOnTouch: true,
    isObjective: true,
  },
  obstacle_static: {
    type: "obstacle_static",
    category: "hazard",
    mesh: "rock",
    color: "#666666",
    emissive: "#222222",
    emissiveIntensity: 0.1,
    animation: "none",
    interactionRadius: 1.0,
    scoreValue: 0,
    sound: "bump",
    particle: "none",
    consumeOnTouch: false,
    isObjective: false,
  },
  obstacle_moving: {
    type: "obstacle_moving",
    category: "hazard",
    mesh: "moving_block",
    color: "#CC3333",
    emissive: "#881111",
    emissiveIntensity: 0.4,
    animation: "sway",
    interactionRadius: 1.2,
    scoreValue: 0,
    sound: "bump",
    particle: "none",
    consumeOnTouch: false,
    isObjective: false,
  },
  goal_zone: {
    type: "goal_zone",
    category: "navigation",
    mesh: "portal",
    color: "#AA44FF",
    emissive: "#6600CC",
    emissiveIntensity: 1.0,
    animation: "spin",
    interactionRadius: 2.0,
    scoreValue: 500,
    sound: "goal_fanfare",
    particle: "confetti",
    consumeOnTouch: false,
    isObjective: false, // Goal is checked separately after all objectives done
  },
};

// Validate that a string is a valid element type
export function isValidElementType(type: string): type is ElementType {
  return ELEMENT_TYPES.includes(type as ElementType);
}

// Get definition or null
export function getElementDef(type: string): ElementDefinition | null {
  if (!isValidElementType(type)) return null;
  return ELEMENT_REGISTRY[type];
}
