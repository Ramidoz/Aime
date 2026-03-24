import { Block, BlocksResponse } from "@/types";

export function validateBlocksResponse(data: unknown): BlocksResponse {
  if (!data || typeof data !== "object") {
    throw new Error("Response must be a JSON object");
  }

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.blocks)) {
    throw new Error("Response must contain a 'blocks' array");
  }

  if (obj.blocks.length !== 3) {
    throw new Error(`Expected exactly 3 blocks, got ${obj.blocks.length}`);
  }

  const blocks = obj.blocks.map((b: unknown, i: number) => validateBlock(b, i));
  return { blocks };
}

function validateBlock(data: unknown, index: number): Block {
  if (!data || typeof data !== "object") {
    throw new Error(`Block ${index} must be an object`);
  }

  const b = data as Record<string, unknown>;

  if (typeof b.id !== "string" || b.id.length === 0) {
    throw new Error(`Block ${index} must have a string 'id'`);
  }
  if (typeof b.visual_label !== "string" || b.visual_label.length === 0) {
    throw new Error(`Block ${index} must have a string 'visual_label'`);
  }
  if (typeof b.description !== "string" || b.description.length === 0) {
    throw new Error(`Block ${index} must have a string 'description'`);
  }
  if (typeof b.logic_snippet !== "string" || b.logic_snippet.length === 0) {
    throw new Error(`Block ${index} must have a string 'logic_snippet'`);
  }
  if (!Array.isArray(b.style_tags)) {
    throw new Error(`Block ${index} must have a 'style_tags' array`);
  }

  return {
    id: b.id,
    visual_label: b.visual_label,
    description: b.description,
    logic_snippet: b.logic_snippet,
    style_tags: b.style_tags as string[],
  };
}
