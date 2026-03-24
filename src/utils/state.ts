import { CanvasState, UserPreferences, Block } from "@/types";

export function createInitialCanvasState(): CanvasState {
  return {
    world: [],
    characters: [],
    theme: [],
    mood: [],
  };
}

export function createInitialPreferences(): UserPreferences {
  return {};
}

export function applyBlockToState(
  state: CanvasState,
  block: Block
): CanvasState {
  const newState = { ...state };
  const snippet = block.logic_snippet.toLowerCase();

  // Parse logic_snippet to determine state updates
  if (snippet.includes("add_world:")) {
    const value = extractValue(snippet, "add_world:");
    newState.world = [...state.world, value];
  }
  if (snippet.includes("add_character:")) {
    const value = extractValue(snippet, "add_character:");
    newState.characters = [...state.characters, value];
  }
  if (snippet.includes("set_theme:")) {
    const value = extractValue(snippet, "set_theme:");
    newState.theme = [...state.theme, value];
  }
  if (snippet.includes("set_mood:")) {
    const value = extractValue(snippet, "set_mood:");
    newState.mood = [...state.mood, value];
  }

  // If no specific instruction matched, use style_tags to infer updates
  if (
    !snippet.includes("add_world:") &&
    !snippet.includes("add_character:") &&
    !snippet.includes("set_theme:") &&
    !snippet.includes("set_mood:")
  ) {
    // Fallback: add the block's label to world
    newState.world = [...state.world, block.visual_label];
  }

  return newState;
}

function extractValue(snippet: string, prefix: string): string {
  const startIdx = snippet.indexOf(prefix) + prefix.length;
  const rest = snippet.slice(startIdx);
  const endIdx = rest.indexOf(";");
  return endIdx >= 0 ? rest.slice(0, endIdx).trim() : rest.trim();
}

export function updatePreferences(
  prefs: UserPreferences,
  styleTags: string[]
): UserPreferences {
  const newPrefs = { ...prefs };

  // Increment weights for selected tags
  for (const tag of styleTags) {
    const key = tag.toLowerCase();
    newPrefs[key] = (newPrefs[key] || 0) + 1;
  }

  // Normalize: divide all values by the max so they stay in [0, 1]
  const values = Object.values(newPrefs);
  const maxVal = Math.max(...values, 1);
  for (const key of Object.keys(newPrefs)) {
    newPrefs[key] = Math.round((newPrefs[key] / maxVal) * 100) / 100;
  }

  return newPrefs;
}
