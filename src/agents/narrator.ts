import { CanvasState } from "@/types";
import { buildNarratorPrompt } from "@/prompts/narrator";
import { callClaude } from "@/utils/claude";

export async function narratorAgent(
  canvasState: CanvasState,
  selectedBlockLabel: string
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateMockNarration(canvasState, selectedBlockLabel);
  }

  const prompt = buildNarratorPrompt(canvasState, selectedBlockLabel);
  return callClaude(prompt);
}

function generateMockNarration(
  canvasState: CanvasState,
  selectedBlockLabel: string
): string {
  const world = canvasState.world.length > 0 ? canvasState.world.join(" and ") : "your world";
  const mood = canvasState.mood.length > 0 ? canvasState.mood[canvasState.mood.length - 1] : "magical";

  const templates = [
    `Wow! ${selectedBlockLabel} appeared in ${world}! Everything feels so ${mood} now!`,
    `Something amazing happened! ${selectedBlockLabel} just joined the adventure in ${world}! The air feels ${mood}!`,
    `Look at that! ${selectedBlockLabel} has arrived! ${world} will never be the same — it's getting more ${mood} by the minute!`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
