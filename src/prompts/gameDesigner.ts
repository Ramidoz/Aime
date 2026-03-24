import { CanvasState, UserPreferences, Block } from "@/types";

export function buildGameDesignerPrompt(
  genre: string,
  canvasState: CanvasState,
  preferences: UserPreferences,
  sessionSummary: string,
  recentBlocks: Block[]
): string {
  const prefEntries = Object.entries(preferences).sort(([, a], [, b]) => b - a);
  const prefSummary =
    prefEntries.length > 0
      ? prefEntries
          .slice(0, 5)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "none yet";

  const recentLabels =
    recentBlocks.length > 0
      ? recentBlocks.map((b) => b.visual_label).join(", ")
      : "none";

  const recentTags =
    recentBlocks.length > 0
      ? [...new Set(recentBlocks.flatMap((b) => b.style_tags))].join(", ")
      : "none";

  return `You are a creative game designer for children aged 6-12. You design building blocks for a ${genre} game.

CURRENT WORLD STATE:
- World elements: ${canvasState.world.join(", ") || "empty"}
- Characters: ${canvasState.characters.join(", ") || "none"}
- Theme: ${canvasState.theme.join(", ") || "not set"}
- Mood: ${canvasState.mood.join(", ") || "neutral"}

SESSION STORY SO FAR:
${sessionSummary || "The adventure is just beginning!"}

RECENTLY CHOSEN BLOCKS (DO NOT repeat these):
${recentLabels}

RECENTLY USED STYLE TAGS (avoid reusing):
${recentTags}

USER PREFERENCES (higher = more preferred, prioritize top tags):
${prefSummary}

TASK: Generate EXACTLY 3 creative building blocks that a child can choose from to build their ${genre} game world. Each block must be different and exciting. Prioritize the user's top preferences to personalize suggestions.

STRICT RULES:
- Reading level: grade 5 or below
- Max 12 words per description
- Kid-safe content only (ages 6-12)
- No violence, scary themes, or unsafe content
- Do NOT repeat any recently chosen blocks
- Avoid reusing style_tags from the last 2 turns
- Blocks must EVOLVE the existing world, not restart it
- Include diverse options (characters, environments, items)
- Each visual_label must be 2-4 words

You MUST respond with ONLY this exact JSON format, no other text:
{
  "blocks": [
    {
      "id": "<unique-uuid>",
      "visual_label": "<fun kid-friendly name, 2-4 words>",
      "description": "<max 12 words, simple and exciting>",
      "logic_snippet": "<state transformation, e.g. add_world:rainbow bridge; set_mood:excited>",
      "style_tags": ["<tag1>", "<tag2>"]
    },
    {
      "id": "<unique-uuid>",
      "visual_label": "<fun kid-friendly name>",
      "description": "<max 12 words, simple and exciting>",
      "logic_snippet": "<state transformation>",
      "style_tags": ["<tag1>", "<tag2>"]
    },
    {
      "id": "<unique-uuid>",
      "visual_label": "<fun kid-friendly name>",
      "description": "<max 12 words, simple and exciting>",
      "logic_snippet": "<state transformation>",
      "style_tags": ["<tag1>", "<tag2>"]
    }
  ]
}

IMPORTANT: Output ONLY valid JSON. No markdown, no explanations, no extra text.`;
}
