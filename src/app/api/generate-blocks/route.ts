import { NextRequest, NextResponse } from "next/server";
import { GenerateBlocksRequest } from "@/types";
import { gameDesignerAgent } from "@/agents/gameDesigner";
import { safetyFilterAgent } from "@/agents/safetyFilter";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateBlocksRequest = await req.json();
    const { genre, user_preferences, canvas_state } = body;

    if (!genre) {
      return NextResponse.json(
        { error: "genre is required" },
        { status: 400 }
      );
    }

    // Agent 1: Generate blocks
    const rawBlocks = await gameDesignerAgent(
      genre,
      canvas_state || { world: [], characters: [], theme: [], mood: [] },
      user_preferences || {}
    );

    // Agent 2: Safety filter
    const safeBlocks = await safetyFilterAgent(rawBlocks);

    return NextResponse.json(safeBlocks);
  } catch (error) {
    console.error("generate-blocks error:", error);
    return NextResponse.json(
      { error: "Failed to generate blocks" },
      { status: 500 }
    );
  }
}
