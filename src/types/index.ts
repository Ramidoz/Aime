export interface Block {
  id: string;
  visual_label: string;
  description: string;
  logic_snippet: string;
  style_tags: string[];
}

export interface BlocksResponse {
  blocks: Block[];
}

export interface CanvasState {
  world: string[];
  characters: string[];
  theme: string[];
  mood: string[];
}

export interface UserPreferences {
  [tag: string]: number;
}

export interface SessionMemory {
  session_summary: string;
  recent_blocks: Block[];
}

export interface Interaction {
  timestamp: number;
  block: Block;
  canvas_state: CanvasState;
  preferences: UserPreferences;
}

export interface GenerateBlocksRequest {
  genre: string;
  user_preferences: UserPreferences;
  canvas_state: CanvasState;
  session_summary: string;
  recent_blocks: Block[];
}

export interface InteractionRequest {
  selected_block: Block;
  canvas_state: CanvasState;
  user_preferences: UserPreferences;
  genre: string;
  session_summary: string;
  recent_blocks: Block[];
}

export interface InteractionResponse {
  canvas_state: CanvasState;
  user_preferences: UserPreferences;
  narration: string;
  next_blocks: Block[];
  session_summary: string;
  recent_blocks: Block[];
  pipeline_stages: PipelineStage[];
}

export type PipelineStage = {
  name: string;
  status: "pending" | "running" | "done";
};

export interface InteractionLog {
  timestamp: number;
  turn: number;
  genre: string;
  llm_input: {
    genre: string;
    canvas_state: CanvasState;
    user_preferences: UserPreferences;
    session_summary: string;
    recent_block_labels: string[];
  };
  llm_output_blocks: Block[];
  selected_block: Block;
  updated_preferences: UserPreferences;
  updated_canvas_state: CanvasState;
  narration: string;
}

export interface AIInsights {
  top_preferences: [string, number][];
  inferred_theme: string;
  suggestion_reason: string;
}

export type Genre = "Racing" | "Pets" | "Space" | "Fantasy" | "Ocean" | "Dinosaurs";

// ─── Game / Play Mode Types ───

export type GameMode = "build" | "play" | "complete";

export type ObjectiveType = "racing" | "collect" | "interact";

export interface GameObjective {
  type: ObjectiveType;
  label: string;
  total: number;
  current: number;
}

export interface GameObject {
  id: string;
  type: "checkpoint" | "collectible" | "boost" | "obstacle" | "interactable";
  position: [number, number, number];
  label: string;
  collected: boolean;
}

export interface PlayerState {
  position: [number, number, number];
  rotation: number; // Y-axis rotation in radians
  speed: number;
  boosted: boolean;
}
