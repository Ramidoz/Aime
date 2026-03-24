# GAME DESIGN DOCUMENT

## Core Loop (one sentence)

> **Collect all stars before time runs out while avoiding obstacles that cost you precious seconds.**

---

## Win Condition

- **Trigger:** Player collects ALL objective items AND reaches the goal zone, with time remaining > 0
- **Feedback:** Goal confetti explosion, victory fanfare (ascending notes), camera zooms out, score breakdown appears (base score + time bonus + combo bonus), "YOU WIN!" with final score

## Lose Condition

- **Trigger:** Timer reaches 0 before all objectives are collected or goal is reached
- **Feedback:** Screen desaturates, low buzzer sound, camera pulls back slowly, "TIME'S UP!" with score earned so far, "Try Again" button

---

## Core Mechanics (4 total)

### MECHANIC 1: Timed Collection
```
TRIGGER: Game starts
EFFECT: 45-second countdown begins. Collecting objectives adds +3s each.
        Hitting obstacles costs -5s penalty.
FEEDBACK: Timer pulses red when < 10s. Tick sound accelerates.
          "+3s" popup on collect, "-5s" popup on obstacle hit.
```

### MECHANIC 2: Combo Chain
```
TRIGGER: Collect 2+ objectives within 3 seconds of each other
EFFECT: Score multiplier increases (x2, x3, x4...).
        Resets if 3s pass without a collection.
FEEDBACK: "x2 COMBO!" popup in center. Pitch of collect sound increases
          with combo. Player glows brighter. Trail gets longer.
```

### MECHANIC 3: Obstacle Penalty
```
TRIGGER: Player touches a static or moving obstacle
EFFECT: -5 seconds from timer. Brief stun (0.3s can't move).
        Combo resets to x1.
FEEDBACK: Screen shake (strong). Red flash overlay. Crunch sound.
          "-5s" in red floating text. Combo counter resets visibly.
```

### MECHANIC 4: Speed Boost
```
TRIGGER: Player touches a boost pad
EFFECT: 2x speed for 3 seconds. Timer does NOT pause.
FEEDBACK: FOV widens. Speed lines appear. Whoosh sound.
          Orange trail behind player. Music pitch shifts up.
```

---

## Progression / Tension

- **Timer creates constant urgency** — every second matters
- **Timer penalty from obstacles** — can't just rush blindly
- **Combo rewards skillful pathing** — plan your route to chain collections
- **Final 10 seconds** — timer turns red, ticks accelerate, music intensifies
- **Goal only unlocks after all objectives** — can't shortcut to victory

---

## Scoring

```
Base Score    = Sum of objective values (stars 100, coins 50, gems 200)
Time Bonus    = Remaining seconds × 50
Combo Bonus   = Highest combo reached × 100
────────────────────────────────────────
Total Score   = Base + Time Bonus + Combo Bonus
```

---

## Replayability

1. **Score attack** — Time bonus + combo bonus mean there's always room to optimize
2. **Route optimization** — Different paths through the level yield different combo chains
3. **Personal best** — "NEW RECORD!" celebration when beating your high score
4. **Built from YOUR world** — Each build phase creates a unique level, so replay the same world or build a new one

---

## Visual Hierarchy (most to least prominent)

1. **GOAL** — Largest, brightest, rotating portal. Locked (dim) until objectives done. Pulses when unlocked.
2. **COLLECTIBLES** — Shiny, spinning, obvious pickup. Glow ring on ground.
3. **TIMER** — Top center, impossible to miss. Red when low.
4. **OBSTACLES** — Dark, spiky, threatening. Red glow.
5. **BOOSTS** — Orange, pulsing, ground arrows.
6. **PLAYER** — Clear, responsive, always visible.
7. **GROUND** — Dark, subtle grid. Does not distract.
