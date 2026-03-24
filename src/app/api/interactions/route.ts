import { NextRequest, NextResponse } from "next/server";
import { InteractionRequest, InteractionResponse, Block } from "@/types";
import { stateEngineAgent } from "@/agents/stateEngine";
import { narratorAgent } from "@/agents/narrator";
import { gameDesignerAgent } from "@/agents/gameDesigner";
import { safetyFilterAgent } from "@/agents/safetyFilter";
import { logInteraction } from "@/utils/logger";

let turnCounter = 0;

export async function POST(req: NextRequest) {
  try {
    const body: InteractionRequest = await req.json();
    const {
      selected_block,
      canvas_state,
      user_preferences,
      genre,
      session_summary,
      recent_blocks,
    } = body;

    if (!selected_block || !genre) {
      return NextResponse.json(
        { error: "selected_block and genre are required" },
        { status: 400 }
      );
    }

    turnCounter++;
    const currentTurn = turnCounter;
    const prevSummary = session_summary || "";
    const prevRecent = recent_blocks || [];

    // Agent 3: Update state
    const { canvasState: newState, preferences: newPrefs } = stateEngineAgent(
      selected_block,
      canvas_state,
      user_preferences
    );

    // Update recent_blocks: keep last 3
    const updatedRecent: Block[] = [...prevRecent, selected_block].slice(-3);

    // Agent 4: Narrate + Agent 1+2: Generate next blocks (in parallel)
    const [narrationResult, rawNextBlocks] = await Promise.all([
      narratorAgent(newState, selected_block.visual_label, prevSummary),
      gameDesignerAgent(genre, newState, newPrefs, prevSummary, updatedRecent),
    ]);

    const safeNextBlocks = await safetyFilterAgent(rawNextBlocks);

    // Log interaction
    logInteraction({
      timestamp: Date.now(),
      turn: currentTurn,
      genre,
      llm_input: {
        genre,
        canvas_state: canvas_state,
        user_preferences,
        session_summary: prevSummary,
        recent_block_labels: prevRecent.map((b) => b.visual_label),
      },
      llm_output_blocks: safeNextBlocks.blocks,
      selected_block,
      updated_preferences: newPrefs,
      updated_canvas_state: newState,
      narration: narrationResult.narration,
    });

    const response: InteractionResponse = {
      canvas_state: newState,
      user_preferences: newPrefs,
      narration: narrationResult.narration,
      next_blocks: safeNextBlocks.blocks,
      session_summary: narrationResult.session_summary,
      recent_blocks: updatedRecent,
      pipeline_stages: [
        { name: "Updating world", status: "done" },
        { name: "Writing story", status: "done" },
        { name: "Designing ideas", status: "done" },
        { name: "Checking safety", status: "done" },
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("interactions:", error);
    return NextResponse.json(
      { error: "Failed to process interaction" },
      { status: 500 }
    );
  }
}
