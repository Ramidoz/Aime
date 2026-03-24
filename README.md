# Creation Universe

A 3D creative sandbox game for kids (ages 6-12) built with **Godot 4.3**.

Collect stars, dodge obstacles, chain combos, and race to the goal before time runs out — all in procedurally generated levels.

## Game Design

### Core Loop
> Collect all stars before the 45-second timer runs out while avoiding obstacles that steal your time. Reach the goal portal to win.

### Mechanics

| Mechanic | Trigger | Effect | Feedback |
|---|---|---|---|
| **Timed Collection** | Game starts | 45s countdown. Stars add +3s. Obstacles cost -5s. | Timer pulses red < 10s |
| **Combo Chain** | Collect 2+ items within 3s | Score multiplier x1→x5 | "x3 COMBO!" popup, pitch-rising SFX |
| **Obstacle Penalty** | Touch an obstacle | -5s, 0.4s stun, combo resets | Screen shake, red flash, crunch SFX |
| **Speed Boost** | Touch a boost pad | 2x speed for 3s | FOV widens, trail particles |

### Scoring
```
Base Score    = Sum of collectible values × combo multiplier
Time Bonus    = Remaining seconds × 50
Combo Bonus   = Best combo × 100
─────────────────────────────────
Total         = Base + Time Bonus + Combo Bonus
```

## Tech Stack

- **Engine:** Godot 4.3 (GDScript)
- **Rendering:** Forward+ with custom toon shader
- **Audio:** Procedural synthesis (no external audio files needed)
- **Level Gen:** Seeded path-based procedural generation

## Architecture

```
scripts/
├── autoload/
│   ├── game_manager.gd    # Global state: score, timer, combos, phase FSM
│   └── audio_manager.gd   # Pooled SFX players, procedural tone synthesis
├── player/
│   └── player_controller.gd  # CharacterBody3D, momentum, jump, squash/stretch
├── game/
│   ├── collectible.gd     # Float, spin, collect animation, score award
│   ├── boost_pad.gd       # Pulsing glow, speed buff trigger
│   ├── obstacle.gd        # Static or patrolling hazard
│   ├── goal.gd            # Locked/unlocked portal, win trigger
│   ├── game_world.gd      # Scene manager, camera follow, level instantiation
│   └── level_generator.gd # Path-based procedural level builder
├── ui/
│   ├── main_menu.gd       # Title screen
│   ├── hud.gd             # Timer, score, objectives, combo display
│   └── results_screen.gd  # Score breakdown, retry/menu buttons
└── data/
    ├── character_data.gd   # Resource: body color, speed, jump, squash feel
    └── environment_data.gd # Resource: sky, ground, lighting, fog, music
```

### Key Design Patterns
- **Autoload singletons** for global state (GameManager, AudioManager)
- **Signals** for decoupled event communication
- **Custom Resources** for character/environment data (`.tres` files)
- **Tween-based animations** for collect effects, UI transitions
- **Procedural audio** — generates sine wave tones at runtime, no asset files needed

## How to Run

1. Download [Godot 4.3+](https://godotengine.org/download)
2. Clone this repository
3. Open `project.godot` in Godot
4. Press **F5** (or the Play button) to run

### Controls
| Key | Action |
|---|---|
| W / Arrow Up | Move forward |
| S / Arrow Down | Move backward |
| A / Arrow Left | Move left |
| D / Arrow Right | Move right |
| Space | Jump |
| Escape | Pause |

## Project Structure

```
creation-universe/
├── project.godot          # Engine config, input map, autoloads
├── scenes/                # .tscn scene files (prefabs)
│   ├── main.tscn          # Main menu
│   └── game/              # Gameplay scenes
├── scripts/               # GDScript source files
├── shaders/               # Custom visual shaders
│   ├── toon.gdshader      # Cel/cartoon shading
│   ├── gradient_sky.gdshader
│   └── glow.gdshader      # Pulsing glow for collectibles
├── resources/             # .tres data files
└── assets/                # Audio, textures, models, fonts
```

## Roadmap

- [ ] Add particle effects (GPUParticles3D) for collections and boosts
- [ ] Create 3 themed environments (Jungle, Space, Ocean)
- [ ] Add character selection with 3 playable characters
- [ ] Implement high score persistence (SaveManager)
- [ ] Add screen shake and post-processing (WorldEnvironment)
- [ ] Mobile touch controls
- [ ] Level difficulty scaling

## License

MIT
