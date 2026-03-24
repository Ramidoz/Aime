import { BlocksResponse } from "@/types";
import { buildSafetyFilterPrompt } from "@/prompts/safetyFilter";
import { validateBlocksResponse } from "@/utils/validation";
import { callClaude } from "@/utils/claude";

export async function safetyFilterAgent(
  blocks: BlocksResponse
): Promise<BlocksResponse> {
  // Skip if no API key (mock data is already safe)
  if (!process.env.ANTHROPIC_API_KEY) {
    return blocks;
  }

  const prompt = buildSafetyFilterPrompt(JSON.stringify(blocks, null, 2));
  const response = await callClaude(prompt);
  const parsed = JSON.parse(response);
  return validateBlocksResponse(parsed);
}
