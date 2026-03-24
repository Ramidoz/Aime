import { NextRequest, NextResponse } from "next/server";
import { InteractionRequest, InteractionResponse } from "@/types";
import { stateEngineAgent } from "@/agents/stateEngine";
import { narratorAgent } from "@/agents/narrator";
import { gameDesignerAgent } from "@/agents/gameDesigner";
import { safetyFilterAgent } from "@/agents/safetyFilter";

export async function POST(req: NextRequest) {
  try {
    const body: InteractionRequest = await req.json();
    const { selected_block, canvas_state, user_preferences, genre } = body;

    if (!selected_block || !genre) {
      return NextResponse.json(
        { error: "selected_block and genre are required" },
        { status: 400 }
      );
    }

    // Agent 3: Update state
    const { canvasState: newState, preferences: newPrefs } = stateEngineAgent(
      selected_block,
      canvas_state,
      user_preferences
    );

    // Agent 4: Narrate + Agent 1+2: Generate next blocks (in parallel)
    const [narration, rawNextBlocks] = await Promise.all([
      narratorAgent(newState, selected_block.visual_label),
      gameDesignerAgent(genre, newState, newPrefs),
    ]);

    const safeNextBlocks = await safetyFilterAgent(rawNextBlocks);

    const response: InteractionResponse = {
      canvas_state: newState,
      user_preferences: newPrefs,
      narration,
      next_blocks: safeNextBlocks.blocks,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("interactions error:", error);
    return NextResponse.json(
      { error: "Failed to process interaction" },
      { status: 500 }
    );
  }
}
