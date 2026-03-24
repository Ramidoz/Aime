import { NextRequest, NextResponse } from "next/server";
import { GenerateBlocksRequest } from "@/types";
import { gameDesignerAgent } from "@/agents/gameDesigner";
import { safetyFilterAgent } from "@/agents/safetyFilter";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateBlocksRequest = await req.json();
    const {
      genre,
      user_preferences,
      canvas_state,
      session_summary,
      recent_blocks,
    } = body;

    if (!genre) {
      return NextResponse.json(
        { error: "genre is required" },
        { status: 400 }
      );
    }

    const state = canvas_state || { world: [], characters: [], theme: [], mood: [] };
    const prefs = user_preferences || {};
    const summary = session_summary || "";
    const recent = recent_blocks || [];

    // Agent 1: Generate blocks
    const rawBlocks = await gameDesignerAgent(genre, state, prefs, summary, recent);

    // Agent 2: Safety filter
    const safeBlocks = await safetyFilterAgent(rawBlocks);

    return NextResponse.json(safeBlocks);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("generate-blocks:", error);
    return NextResponse.json(
      { error: "Failed to generate blocks" },
      { status: 500 }
    );
  }
}
