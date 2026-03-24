import { CanvasState, UserPreferences, Block, BlocksResponse } from "@/types";
import { buildGameDesignerPrompt } from "@/prompts/gameDesigner";
import { validateBlocksResponse } from "@/utils/validation";
import { callClaude } from "@/utils/claude";
import { generateMockBlocks } from "@/utils/mockData";

export async function gameDesignerAgent(
  genre: string,
  canvasState: CanvasState,
  preferences: UserPreferences,
  sessionSummary: string,
  recentBlocks: Block[]
): Promise<BlocksResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateMockBlocks(genre, canvasState, recentBlocks);
  }

  const prompt = buildGameDesignerPrompt(
    genre,
    canvasState,
    preferences,
    sessionSummary,
    recentBlocks
  );

  try {
    const response = await callClaude(prompt);
    const parsed = JSON.parse(response);
    return validateBlocksResponse(parsed);
  } catch (error) {
    console.error("gameDesigner LLM failed, falling back to mock:", error);
    return generateMockBlocks(genre, canvasState, recentBlocks);
  }
}
