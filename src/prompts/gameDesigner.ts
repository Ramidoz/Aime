import { CanvasState, UserPreferences } from "@/types";

export function buildGameDesignerPrompt(
  genre: string,
  canvasState: CanvasState,
  preferences: UserPreferences
): string {
  const prefSummary =
    Object.keys(preferences).length > 0
      ? Object.entries(preferences)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "none yet";

  return `You are a creative game designer for children aged 6-12. You design building blocks for a ${genre} game.

CURRENT WORLD STATE:
- World elements: ${canvasState.world.join(", ") || "empty"}
- Characters: ${canvasState.characters.join(", ") || "none"}
- Theme: ${canvasState.theme.join(", ") || "not set"}
- Mood: ${canvasState.mood.join(", ") || "neutral"}

USER PREFERENCES (higher = more preferred):
${prefSummary}

TASK: Generate EXACTLY 3 creative building blocks that a child can choose from to build their ${genre} game world. Each block should be different and exciting. Consider the user's preferences to make suggestions they'll love.

RULES:
- Use simple, kid-friendly language
- Each block should feel magical and fun
- Blocks should logically extend the current world state
- Include diverse options (characters, environments, items)

You MUST respond with ONLY this exact JSON format, no other text:
{
  "blocks": [
    {
      "id": "<unique-uuid>",
      "visual_label": "<fun kid-friendly name, 2-4 words>",
      "description": "<simple exciting description, 1-2 sentences>",
      "logic_snippet": "<state transformation, e.g. add_world:rainbow bridge; set_mood:excited>",
      "style_tags": ["<tag1>", "<tag2>"]
    },
    {
      "id": "<unique-uuid>",
      "visual_label": "<fun kid-friendly name>",
      "description": "<simple exciting description>",
      "logic_snippet": "<state transformation>",
      "style_tags": ["<tag1>", "<tag2>"]
    },
    {
      "id": "<unique-uuid>",
      "visual_label": "<fun kid-friendly name>",
      "description": "<simple exciting description>",
      "logic_snippet": "<state transformation>",
      "style_tags": ["<tag1>", "<tag2>"]
    }
  ]
}

IMPORTANT: Output ONLY valid JSON. No markdown, no explanations, no extra text.`;
}
