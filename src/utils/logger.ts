import { InteractionLog } from "@/types";

const logs: InteractionLog[] = [];

export function logInteraction(entry: InteractionLog): void {
  logs.push(entry);
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[CreativeEngine] Turn ${entry.turn} | Genre: ${entry.genre} | Selected: "${entry.selected_block.visual_label}"`
    );
  }
}

export function getLogs(): InteractionLog[] {
  return [...logs];
}

export function getLastLog(): InteractionLog | undefined {
  return logs[logs.length - 1];
}
