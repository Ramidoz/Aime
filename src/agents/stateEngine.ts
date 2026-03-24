import { Block, CanvasState, UserPreferences } from "@/types";
import { applyBlockToState, updatePreferences } from "@/utils/state";

export function stateEngineAgent(
  selectedBlock: Block,
  canvasState: CanvasState,
  preferences: UserPreferences
): { canvasState: CanvasState; preferences: UserPreferences } {
  const newCanvasState = applyBlockToState(canvasState, selectedBlock);
  const newPreferences = updatePreferences(preferences, selectedBlock.style_tags);

  return {
    canvasState: newCanvasState,
    preferences: newPreferences,
  };
}
