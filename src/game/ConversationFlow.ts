// ─── Conversation Flow ───
// Cosmo guides kids through building their creation step by step.

import { CosmoEmotion } from "@/components/Cosmo";

export type ConversationStage =
  | "welcome"
  | "choose_setting"
  | "choose_character"
  | "choose_goal"
  | "building"
  | "ready_to_launch"
  | "playing"
  | "finished";

export interface ChoiceOption {
  id: string;
  icon: string;
  label: string;
  color: string;
  /** Maps to logic_snippet-style mutations on canvasState */
  worldEffect?: string;
  characterEffect?: string;
  themeEffect?: string;
  moodEffect?: string;
}

export interface StageConfig {
  cosmoMessage: string | ((ctx: ConversationContext) => string);
  cosmoEmotion: CosmoEmotion;
  options: ChoiceOption[] | ((ctx: ConversationContext) => ChoiceOption[]);
  nextStage: ConversationStage | ((choiceId: string) => ConversationStage);
}

export interface ConversationContext {
  genre: string | null;
  setting: string | null;
  character: string | null;
  goal: string | null;
  elementsAdded: number;
}

const COSMO_GREETINGS = [
  "Welcome, Creator! I'm Cosmo, your creative buddy! What kind of world should we build?",
  "Hey there, friend! I'm Cosmo! Ready to make something amazing? Pick a world!",
  "Yay, you're here! I'm Cosmo! Let's create something incredible together!",
];

export function getCosmoGreeting(): string {
  return COSMO_GREETINGS[Math.floor(Math.random() * COSMO_GREETINGS.length)];
}

const SETTING_OPTIONS: Record<string, ChoiceOption[]> = {
  Racing: [
    { id: "neon_city", icon: "🏙️", label: "Neon City", color: "purple", worldEffect: "neon city track", moodEffect: "fast" },
    { id: "desert_canyon", icon: "🏜️", label: "Desert Canyon", color: "orange", worldEffect: "desert canyon road", moodEffect: "adventurous" },
    { id: "rainbow_sky", icon: "🌈", label: "Rainbow Skyway", color: "blue", worldEffect: "rainbow sky road", moodEffect: "magical" },
  ],
  Pets: [
    { id: "cozy_house", icon: "🏠", label: "Cozy House", color: "pink", worldEffect: "cozy house", moodEffect: "warm" },
    { id: "magic_garden", icon: "🌸", label: "Magic Garden", color: "green", worldEffect: "magic garden", moodEffect: "peaceful" },
    { id: "cloud_kingdom", icon: "☁️", label: "Cloud Kingdom", color: "blue", worldEffect: "cloud kingdom", moodEffect: "dreamy" },
  ],
  Space: [
    { id: "alien_planet", icon: "🪐", label: "Alien Planet", color: "purple", worldEffect: "alien planet", moodEffect: "mysterious" },
    { id: "space_station", icon: "🛸", label: "Space Station", color: "blue", worldEffect: "space station", moodEffect: "futuristic" },
    { id: "asteroid_belt", icon: "☄️", label: "Asteroid Belt", color: "orange", worldEffect: "asteroid belt", moodEffect: "dangerous" },
  ],
  Fantasy: [
    { id: "enchanted_forest", icon: "🌲", label: "Enchanted Forest", color: "green", worldEffect: "enchanted forest", moodEffect: "magical" },
    { id: "crystal_cave", icon: "💎", label: "Crystal Cave", color: "purple", worldEffect: "crystal cave", moodEffect: "mysterious" },
    { id: "sky_castle", icon: "🏰", label: "Sky Castle", color: "blue", worldEffect: "floating sky castle", moodEffect: "epic" },
  ],
  Ocean: [
    { id: "coral_reef", icon: "🐠", label: "Coral Reef", color: "pink", worldEffect: "coral reef", moodEffect: "colorful" },
    { id: "deep_trench", icon: "🌊", label: "Deep Trench", color: "blue", worldEffect: "deep ocean trench", moodEffect: "mysterious" },
    { id: "sunken_ship", icon: "⚓", label: "Sunken Ship", color: "orange", worldEffect: "sunken pirate ship", moodEffect: "adventurous" },
  ],
  Dinosaurs: [
    { id: "volcano_valley", icon: "🌋", label: "Volcano Valley", color: "red", worldEffect: "volcano valley", moodEffect: "exciting" },
    { id: "jungle_river", icon: "🌴", label: "Jungle River", color: "green", worldEffect: "jungle river", moodEffect: "wild" },
    { id: "frozen_tundra", icon: "❄️", label: "Frozen Tundra", color: "blue", worldEffect: "frozen tundra", moodEffect: "cold" },
  ],
};

const CHARACTER_OPTIONS: Record<string, ChoiceOption[]> = {
  Racing: [
    { id: "speed_racer", icon: "🏎️", label: "Speed Racer", color: "red", characterEffect: "speed racer" },
    { id: "rocket_rider", icon: "🚀", label: "Rocket Rider", color: "orange", characterEffect: "rocket rider" },
    { id: "turbo_bot", icon: "🤖", label: "Turbo Bot", color: "blue", characterEffect: "turbo robot" },
  ],
  Pets: [
    { id: "fluffy_puppy", icon: "🐶", label: "Fluffy Puppy", color: "orange", characterEffect: "fluffy puppy" },
    { id: "sparkle_kitten", icon: "🐱", label: "Sparkle Kitten", color: "pink", characterEffect: "sparkle kitten" },
    { id: "bouncy_bunny", icon: "🐰", label: "Bouncy Bunny", color: "purple", characterEffect: "bouncy bunny" },
  ],
  Space: [
    { id: "purple_alien", icon: "👾", label: "Purple Alien", color: "purple", characterEffect: "purple alien" },
    { id: "astro_cat", icon: "🐱", label: "Astro Cat", color: "orange", characterEffect: "astro cat" },
    { id: "star_robot", icon: "🤖", label: "Star Robot", color: "blue", characterEffect: "star robot" },
  ],
  Fantasy: [
    { id: "tiny_wizard", icon: "🧙", label: "Tiny Wizard", color: "purple", characterEffect: "tiny wizard" },
    { id: "fairy_friend", icon: "🧚", label: "Fairy Friend", color: "pink", characterEffect: "fairy friend" },
    { id: "baby_dragon", icon: "🐉", label: "Baby Dragon", color: "red", characterEffect: "baby dragon" },
  ],
  Ocean: [
    { id: "friendly_dolphin", icon: "🐬", label: "Friendly Dolphin", color: "blue", characterEffect: "friendly dolphin" },
    { id: "treasure_turtle", icon: "🐢", label: "Treasure Turtle", color: "green", characterEffect: "treasure turtle" },
    { id: "magic_mermaid", icon: "🧜", label: "Magic Mermaid", color: "pink", characterEffect: "magic mermaid" },
  ],
  Dinosaurs: [
    { id: "trex_hero", icon: "🦖", label: "T-Rex Hero", color: "green", characterEffect: "friendly t-rex" },
    { id: "flying_ptero", icon: "🦅", label: "Flying Ptero", color: "blue", characterEffect: "flying pterodactyl" },
    { id: "tiny_raptor", icon: "🦎", label: "Tiny Raptor", color: "orange", characterEffect: "tiny raptor" },
  ],
};

const GOAL_OPTIONS: ChoiceOption[] = [
  { id: "collect_stars", icon: "⭐", label: "Collect Stars", color: "yellow", themeEffect: "star collection" },
  { id: "explore_discover", icon: "🗺️", label: "Explore & Discover", color: "green", themeEffect: "exploration adventure" },
  { id: "help_friends", icon: "💝", label: "Help Friends", color: "pink", themeEffect: "friendship rescue" },
];

export function getSettingOptions(genre: string): ChoiceOption[] {
  return SETTING_OPTIONS[genre] || SETTING_OPTIONS.Fantasy;
}

export function getCharacterOptions(genre: string): ChoiceOption[] {
  return CHARACTER_OPTIONS[genre] || CHARACTER_OPTIONS.Fantasy;
}

export function getGoalOptions(): ChoiceOption[] {
  return GOAL_OPTIONS;
}

export function getCosmoReaction(stage: ConversationStage, ctx: ConversationContext): string {
  switch (stage) {
    case "choose_setting":
      return `Awesome! A ${ctx.genre} world! Where should it happen?`;
    case "choose_character":
      return `Ooh, ${ctx.setting} — love it! Now, who's the star of the show?`;
    case "choose_goal":
      return `${ctx.character} is SO cool! What's their mission?`;
    case "building":
      return "Your world is coming to life! Let me cook up some more ideas...";
    case "ready_to_launch":
      return "WOW! Your creation looks AMAZING! Ready to play it?";
    case "finished":
      return "Great job, Creator! That was incredible!";
    default:
      return "Let's keep building!";
  }
}
