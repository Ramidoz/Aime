import { CanvasState, UserPreferences, BlocksResponse } from "@/types";
import { buildGameDesignerPrompt } from "@/prompts/gameDesigner";
import { validateBlocksResponse } from "@/utils/validation";
import { callClaude } from "@/utils/claude";
import { generateMockBlocks } from "@/utils/mockData";

export async function gameDesignerAgent(
  genre: string,
  canvasState: CanvasState,
  preferences: UserPreferences
): Promise<BlocksResponse> {
  // Fall back to mock data if no API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateMockBlocks(genre, canvasState);
  }

  const prompt = buildGameDesignerPrompt(genre, canvasState, preferences);

  const response = await callClaude(prompt);

  // Parse and validate
  const parsed = JSON.parse(response);
  return validateBlocksResponse(parsed);
}
