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
}

export interface InteractionRequest {
  selected_block: Block;
  canvas_state: CanvasState;
  user_preferences: UserPreferences;
  genre: string;
}

export interface InteractionResponse {
  canvas_state: CanvasState;
  user_preferences: UserPreferences;
  narration: string;
  next_blocks: Block[];
}

export type Genre = "Racing" | "Pets" | "Space" | "Fantasy" | "Ocean" | "Dinosaurs";
