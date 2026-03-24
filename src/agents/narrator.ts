import { CanvasState } from "@/types";
import { buildNarratorPrompt } from "@/prompts/narrator";
import { callClaude } from "@/utils/claude";

export interface NarrationResult {
  narration: string;
  session_summary: string;
}

export async function narratorAgent(
  canvasState: CanvasState,
  selectedBlockLabel: string,
  previousSummary: string
): Promise<NarrationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateMockNarration(canvasState, selectedBlockLabel, previousSummary);
  }

  const prompt = buildNarratorPrompt(canvasState, selectedBlockLabel, previousSummary);

  try {
    const response = await callClaude(prompt);
    return parseNarrationResponse(response, canvasState, selectedBlockLabel, previousSummary);
  } catch (error) {
    console.error("narrator LLM failed, falling back to mock:", error);
    return generateMockNarration(canvasState, selectedBlockLabel, previousSummary);
  }
}

function parseNarrationResponse(
  response: string,
  canvasState: CanvasState,
  selectedBlockLabel: string,
  previousSummary: string
): NarrationResult {
  const lines = response.trim().split("\n").filter((l) => l.trim().length > 0);

  const summaryLineIdx = lines.findIndex((l) => l.includes("[SUMMARY]"));

  if (summaryLineIdx >= 0) {
    const narration = lines.slice(0, summaryLineIdx).join(" ").trim();
    const summary = lines[summaryLineIdx].replace("[SUMMARY]", "").trim();
    return {
      narration: narration || lines[0] || "",
      session_summary: summary,
    };
  }

  // Fallback: use the full response as narration, build summary
  return {
    narration: lines[0] || "",
    session_summary: buildFallbackSummary(canvasState, selectedBlockLabel, previousSummary),
  };
}

function buildFallbackSummary(
  canvasState: CanvasState,
  selectedBlockLabel: string,
  previousSummary: string
): string {
  if (previousSummary) {
    return `${previousSummary} Then ${selectedBlockLabel} was added to the world.`;
  }
  const items = [...canvasState.world, ...canvasState.characters];
  return `The adventure began with ${items.join(", ") || selectedBlockLabel}.`;
}

function generateMockNarration(
  canvasState: CanvasState,
  selectedBlockLabel: string,
  previousSummary: string
): NarrationResult {
  const world = canvasState.world.length > 0 ? canvasState.world.join(" and ") : "your world";
  const mood =
    canvasState.mood.length > 0
      ? canvasState.mood[canvasState.mood.length - 1]
      : "magical";

  const templates = [
    `Wow! ${selectedBlockLabel} appeared in ${world}! Everything feels so ${mood} now!`,
    `Something amazing happened! ${selectedBlockLabel} just joined the adventure in ${world}! The air feels ${mood}!`,
    `Look at that! ${selectedBlockLabel} has arrived! ${world} will never be the same — it's getting more ${mood} by the minute!`,
  ];

  const narration = templates[Math.floor(Math.random() * templates.length)];
  const summary = buildFallbackSummary(canvasState, selectedBlockLabel, previousSummary);

  return { narration, session_summary: summary };
}
