import { BlocksResponse } from "@/types";
import { buildSafetyFilterPrompt } from "@/prompts/safetyFilter";
import { validateBlocksResponse } from "@/utils/validation";
import { callClaude } from "@/utils/claude";

export async function safetyFilterAgent(
  blocks: BlocksResponse
): Promise<BlocksResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return blocks;
  }

  try {
    const prompt = buildSafetyFilterPrompt(JSON.stringify(blocks, null, 2));
    const response = await callClaude(prompt);
    const parsed = JSON.parse(response);
    return validateBlocksResponse(parsed);
  } catch (error) {
    console.error("safetyFilter LLM failed, returning unfiltered blocks:", error);
    return blocks;
  }
}
