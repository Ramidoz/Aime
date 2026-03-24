// ─── Input Action System ───
// Maps raw keyboard events to game actions with buffering.
// Decouples "which key is pressed" from "what the player wants to do."

export type InputAction = "move_forward" | "move_backward" | "turn_left" | "turn_right";

interface InputBinding {
  keys: string[];
  action: InputAction;
}

const BINDINGS: InputBinding[] = [
  { keys: ["w", "arrowup"], action: "move_forward" },
  { keys: ["s", "arrowdown"], action: "move_backward" },
  { keys: ["a", "arrowleft"], action: "turn_left" },
  { keys: ["d", "arrowright"], action: "turn_right" },
];

class InputSystem {
  private heldKeys = new Set<string>();
  private activeActions = new Set<InputAction>();
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (this.heldKeys.has(key)) return; // Prevent repeat
      this.heldKeys.add(key);
      this.updateActions();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.heldKeys.delete(e.key.toLowerCase());
      this.updateActions();
    };

    const onBlur = () => {
      this.heldKeys.clear();
      this.activeActions.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  }

  private updateActions(): void {
    this.activeActions.clear();
    for (const binding of BINDINGS) {
      if (binding.keys.some((k) => this.heldKeys.has(k))) {
        this.activeActions.add(binding.action);
      }
    }
  }

  isActive(action: InputAction): boolean {
    return this.activeActions.has(action);
  }

  /** Get normalized movement vector from current inputs */
  getMovement(): { forward: number; turn: number } {
    let forward = 0;
    let turn = 0;
    if (this.activeActions.has("move_forward")) forward = -1;
    if (this.activeActions.has("move_backward")) forward = 0.5;
    if (this.activeActions.has("turn_left")) turn = 1;
    if (this.activeActions.has("turn_right")) turn = -1;
    return { forward, turn };
  }

  destroy(): void {
    this.heldKeys.clear();
    this.activeActions.clear();
    this.initialized = false;
  }
}

export const inputSystem = new InputSystem();
