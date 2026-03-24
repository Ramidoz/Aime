// ─── Level Designer ───
// Generates intentional, path-based layouts from a set of game elements.
// Objects are placed along a smooth path from spawn to goal,
// distributed across near/mid/far zones.

import { ElementType, ELEMENT_REGISTRY } from "./registry";

export interface PlacedElement {
  id: string;
  type: ElementType;
  position: [number, number, number];
  label: string;
  collected: boolean;
}

interface PathPoint {
  x: number;
  z: number;
  distance: number; // distance along path from start
}

const SPAWN_POS: [number, number, number] = [0, 0, 8];
const GOAL_DISTANCE = 16; // How far the goal is from spawn
const MIN_ELEMENT_SPACING = 2.5; // Minimum distance between any two elements
const PATH_SPREAD = 2.5; // How far off-path objects can be placed
const MAX_ELEMENTS = 8;

// Generate a smooth curved path from spawn toward a goal direction
function generatePath(numPoints: number, seed: number): PathPoint[] {
  const points: PathPoint[] = [];
  const angleOffset = ((seed % 6) - 3) * 0.15; // Slight curve variation

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const distance = t * GOAL_DISTANCE;

    // Curved path: start at spawn, curve toward goal
    const baseAngle = -Math.PI / 2 + angleOffset; // Generally heading "forward" from spawn
    const curve = Math.sin(t * Math.PI) * 3; // Gentle S-curve

    const x = SPAWN_POS[0] + Math.cos(baseAngle) * distance + curve;
    const z = SPAWN_POS[2] + Math.sin(baseAngle) * distance;

    points.push({ x, z, distance });
  }

  return points;
}

// Get a position along the path with optional lateral offset
function getPositionAlongPath(
  path: PathPoint[],
  t: number, // 0-1 progress along path
  lateralOffset: number // How far sideways from path center
): [number, number, number] {
  const idx = Math.min(Math.floor(t * (path.length - 1)), path.length - 2);
  const localT = (t * (path.length - 1)) - idx;

  const p1 = path[idx];
  const p2 = path[idx + 1];

  const x = p1.x + (p2.x - p1.x) * localT;
  const z = p1.z + (p2.z - p1.z) * localT;

  // Calculate perpendicular direction for lateral offset
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  const len = Math.sqrt(dx * dx + dz * dz) || 1;
  const perpX = -dz / len;
  const perpZ = dx / len;

  return [
    x + perpX * lateralOffset,
    0.4, // Ground level + slight elevation
    z + perpZ * lateralOffset,
  ];
}

// Check minimum distance constraint
function isTooClose(pos: [number, number, number], existing: PlacedElement[]): boolean {
  for (const e of existing) {
    const dx = pos[0] - e.position[0];
    const dz = pos[2] - e.position[2];
    if (Math.sqrt(dx * dx + dz * dz) < MIN_ELEMENT_SPACING) return true;
  }
  return false;
}

// Simple seeded random (deterministic per session)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface LevelLayout {
  elements: PlacedElement[];
  goalPosition: [number, number, number];
  spawnPosition: [number, number, number];
  path: PathPoint[];
}

export function designLevel(
  requestedElements: { type: ElementType; label: string }[],
  seed: number = Date.now()
): LevelLayout {
  const rand = seededRandom(seed);
  const path = generatePath(20, seed);
  const placed: PlacedElement[] = [];
  let idCounter = 0;

  // Separate goal_zone from other elements
  const goalElements = requestedElements.filter((e) => e.type === "goal_zone");
  const otherElements = requestedElements.filter((e) => e.type !== "goal_zone").slice(0, MAX_ELEMENTS - 1);

  // Place objectives and collectibles in zones along path
  // Near zone: t=0.15-0.35, Mid zone: t=0.4-0.65, Far zone: t=0.7-0.9
  const zones = [
    { min: 0.15, max: 0.35 },
    { min: 0.40, max: 0.65 },
    { min: 0.70, max: 0.90 },
  ];

  otherElements.forEach((element, i) => {
    const def = ELEMENT_REGISTRY[element.type];
    const zone = zones[i % zones.length];
    const t = zone.min + rand() * (zone.max - zone.min);
    const lateral = (rand() - 0.5) * PATH_SPREAD * 2;

    let pos = getPositionAlongPath(path, t, lateral);
    // Retry if too close to existing
    let attempts = 0;
    while (isTooClose(pos, placed) && attempts < 10) {
      const newT = zone.min + rand() * (zone.max - zone.min);
      const newLateral = (rand() - 0.5) * PATH_SPREAD * 2;
      pos = getPositionAlongPath(path, newT, newLateral);
      attempts++;
    }

    // Adjust Y based on element type
    if (def.mesh === "boost_pad" || def.mesh === "jump_pad") {
      pos[1] = 0.05; // Ground level
    } else if (def.mesh === "npc_blob") {
      pos[1] = 0.35;
    } else if (def.mesh === "portal") {
      pos[1] = 0.0;
    }

    placed.push({
      id: `el-${idCounter++}`,
      type: element.type,
      position: pos,
      label: element.label,
      collected: false,
    });
  });

  // Place goal at end of path
  const goalPos = getPositionAlongPath(path, 0.95, 0);
  goalPos[1] = 0.0;

  if (goalElements.length > 0) {
    placed.push({
      id: `el-${idCounter++}`,
      type: "goal_zone",
      position: goalPos,
      label: goalElements[0].label,
      collected: false,
    });
  } else {
    placed.push({
      id: `el-${idCounter++}`,
      type: "goal_zone",
      position: goalPos,
      label: "Finish!",
      collected: false,
    });
  }

  return {
    elements: placed,
    goalPosition: goalPos,
    spawnPosition: SPAWN_POS,
    path,
  };
}
