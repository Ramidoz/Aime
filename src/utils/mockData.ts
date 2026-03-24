import { v4 as uuidv4 } from "uuid";
import { BlocksResponse, CanvasState } from "@/types";

const GENRE_BLOCKS: Record<string, Array<{ label: string; desc: string; snippet: string; tags: string[] }>> = {
  Racing: [
    { label: "Turbo Rocket Car", desc: "A super fast car with rocket boosters that zooms through the clouds!", snippet: "add_world:rocket car; set_mood:excited", tags: ["fast", "vehicles", "sky"] },
    { label: "Rainbow Speedway", desc: "A magical race track made of rainbows that sparkles as you drive!", snippet: "add_world:rainbow speedway; set_mood:happy", tags: ["colorful", "track", "magic"] },
    { label: "Friendly Pit Crew", desc: "A team of cute robot helpers that fix your car with sparkle wrenches!", snippet: "add_character:robot pit crew; set_mood:friendly", tags: ["robots", "teamwork", "cute"] },
    { label: "Cloud Loop Track", desc: "A loopy track that goes through fluffy clouds high in the sky!", snippet: "add_world:cloud loop; set_mood:thrilling", tags: ["sky", "adventure", "clouds"] },
    { label: "Star Boost Pad", desc: "Step on this shiny pad and your car flies like a shooting star!", snippet: "add_world:star boost pad; set_mood:amazing", tags: ["stars", "speed", "power"] },
    { label: "Puppy Co-Driver", desc: "An adorable puppy sits next to you and barks encouragement!", snippet: "add_character:puppy co-driver; set_mood:joyful", tags: ["cute", "animals", "fun"] },
  ],
  Pets: [
    { label: "Sparkle Kitten", desc: "A tiny kitten with fur that sparkles like glitter in the sunshine!", snippet: "add_character:sparkle kitten; set_mood:adorable", tags: ["cute", "sparkle", "cats"] },
    { label: "Cozy Pet House", desc: "A colorful house with tiny beds, toys, and a snack bowl for your pets!", snippet: "add_world:cozy pet house; set_mood:warm", tags: ["cozy", "home", "colorful"] },
    { label: "Magic Pet Park", desc: "A park where flowers sing and butterflies play with your pets!", snippet: "add_world:magic pet park; set_mood:magical", tags: ["nature", "magic", "outdoors"] },
    { label: "Bouncy Puppy", desc: "A happy puppy that bounces around and does funny tricks!", snippet: "add_character:bouncy puppy; set_mood:playful", tags: ["dogs", "playful", "funny"] },
    { label: "Rainbow Fish Pond", desc: "A sparkling pond with fish that change colors when you watch them!", snippet: "add_world:rainbow fish pond; set_mood:peaceful", tags: ["water", "colorful", "calm"] },
    { label: "Baby Dragon Pet", desc: "A tiny friendly dragon that loves cuddles and blows bubble fire!", snippet: "add_character:baby dragon; set_mood:excited", tags: ["fantasy", "cute", "magical"] },
  ],
  Space: [
    { label: "Starship Explorer", desc: "A sparkly spaceship that can fly to any planet in the galaxy!", snippet: "add_world:starship; set_mood:adventurous", tags: ["space", "vehicles", "exploration"] },
    { label: "Friendly Alien", desc: "A smiley green alien who wants to be your best friend!", snippet: "add_character:friendly alien; set_mood:friendly", tags: ["aliens", "friendship", "fun"] },
    { label: "Candy Planet", desc: "A whole planet made of candy with lollipop trees and chocolate rivers!", snippet: "add_world:candy planet; set_theme:sweet; set_mood:delighted", tags: ["sweet", "colorful", "fantasy"] },
    { label: "Moon Bounce Castle", desc: "A bouncy castle on the moon where you can jump super high!", snippet: "add_world:moon bounce castle; set_mood:playful", tags: ["moon", "play", "bouncy"] },
    { label: "Star Collector Bot", desc: "A cute robot that helps you collect twinkling stars!", snippet: "add_character:star collector bot; set_mood:helpful", tags: ["robots", "stars", "collection"] },
    { label: "Nebula Rainbow", desc: "A beautiful space rainbow made of cosmic dust and dreams!", snippet: "add_world:nebula rainbow; set_theme:cosmic; set_mood:wonder", tags: ["colorful", "cosmic", "beautiful"] },
  ],
  Fantasy: [
    { label: "Enchanted Castle", desc: "A magical castle with towers that glow different colors at night!", snippet: "add_world:enchanted castle; set_theme:magical; set_mood:wonder", tags: ["castle", "magic", "glowing"] },
    { label: "Unicorn Friend", desc: "A sparkly unicorn with a rainbow mane who loves adventures!", snippet: "add_character:unicorn; set_mood:magical", tags: ["unicorn", "sparkle", "rainbow"] },
    { label: "Fairy Garden", desc: "A tiny garden where fairies dance and flowers grow instantly!", snippet: "add_world:fairy garden; set_mood:enchanted", tags: ["fairies", "nature", "magical"] },
    { label: "Dragon Egg", desc: "A glowing egg that wobbles — something magical is about to hatch!", snippet: "add_world:dragon egg; set_mood:excited", tags: ["dragons", "mystery", "magical"] },
    { label: "Wizard Hat", desc: "A silly wizard hat that makes funny spells by accident!", snippet: "add_world:wizard hat; set_mood:silly", tags: ["magic", "funny", "wizard"] },
    { label: "Crystal Bridge", desc: "A shining crystal bridge that leads to a secret cloud kingdom!", snippet: "add_world:crystal bridge; set_theme:crystal; set_mood:adventurous", tags: ["crystal", "adventure", "beautiful"] },
  ],
  Ocean: [
    { label: "Submarine Adventure", desc: "A bright yellow submarine that explores the deepest ocean caves!", snippet: "add_world:submarine; set_mood:adventurous", tags: ["vehicles", "underwater", "exploration"] },
    { label: "Dolphin Buddy", desc: "A playful dolphin who does flips and guides you through the sea!", snippet: "add_character:dolphin buddy; set_mood:playful", tags: ["dolphins", "friendship", "fun"] },
    { label: "Coral Castle", desc: "A beautiful castle made of colorful coral where mermaids live!", snippet: "add_world:coral castle; set_theme:underwater; set_mood:magical", tags: ["coral", "castle", "mermaids"] },
    { label: "Treasure Chest", desc: "A sparkly treasure chest filled with golden coins and jewels!", snippet: "add_world:treasure chest; set_mood:excited", tags: ["treasure", "gold", "discovery"] },
    { label: "Jellyfish Lights", desc: "Glowing jellyfish that light up the dark ocean like tiny lanterns!", snippet: "add_world:jellyfish lights; set_mood:wonder", tags: ["glowing", "ocean", "beautiful"] },
    { label: "Silly Octopus", desc: "An octopus with eight arms who tries to juggle seashells!", snippet: "add_character:silly octopus; set_mood:funny", tags: ["octopus", "funny", "silly"] },
  ],
  Dinosaurs: [
    { label: "Baby T-Rex", desc: "A tiny T-Rex with little arms who loves giving high-fives!", snippet: "add_character:baby t-rex; set_mood:funny", tags: ["dinosaurs", "cute", "funny"] },
    { label: "Volcano Playground", desc: "A friendly volcano that shoots out confetti instead of lava!", snippet: "add_world:volcano playground; set_mood:exciting", tags: ["volcano", "party", "colorful"] },
    { label: "Dino Egg Nest", desc: "A warm nest with colorful eggs — new baby dinos are coming!", snippet: "add_world:dino egg nest; set_mood:anticipation", tags: ["eggs", "babies", "nurturing"] },
    { label: "Triceratops Taxi", desc: "A gentle triceratops who gives rides on its back through the jungle!", snippet: "add_character:triceratops taxi; add_world:jungle; set_mood:adventurous", tags: ["dinosaurs", "rides", "jungle"] },
    { label: "Fossil Dig Site", desc: "A sandy area where you can dig up amazing dinosaur bones!", snippet: "add_world:fossil dig site; set_mood:curious", tags: ["discovery", "science", "digging"] },
    { label: "Pterodactyl Mail", desc: "A friendly flying pterodactyl who delivers letters to all the dinos!", snippet: "add_character:pterodactyl mail carrier; set_mood:helpful", tags: ["flying", "communication", "helpful"] },
  ],
};

export function generateMockBlocks(
  genre: string,
  canvasState: CanvasState
): BlocksResponse {
  const pool = GENRE_BLOCKS[genre] || GENRE_BLOCKS["Space"];

  // Avoid selecting blocks that are already in the world
  const existingItems = [
    ...canvasState.world,
    ...canvasState.characters,
  ].map((s) => s.toLowerCase());

  const available = pool.filter(
    (b) => !existingItems.some((item) => b.label.toLowerCase().includes(item))
  );

  // Pick 3 random blocks from available (or fall back to full pool)
  const source = available.length >= 3 ? available : pool;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  return {
    blocks: selected.map((b) => ({
      id: uuidv4(),
      visual_label: b.label,
      description: b.desc,
      logic_snippet: b.snippet,
      style_tags: b.tags,
    })),
  };
}
