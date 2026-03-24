"use client";

import { UserPreferences, CanvasState } from "@/types";

interface AIInsightsPanelProps {
  preferences: UserPreferences;
  canvasState: CanvasState;
  visible: boolean;
  onToggle: () => void;
}

function inferTheme(canvasState: CanvasState): string {
  const all = [
    ...canvasState.world,
    ...canvasState.characters,
    ...canvasState.theme,
    ...canvasState.mood,
  ].map((s) => s.toLowerCase());

  if (all.length === 0) return "Not yet determined";

  const keywords: Record<string, string[]> = {
    "Magical Adventure": ["magic", "enchanted", "fairy", "unicorn", "dragon", "wizard", "crystal"],
    "Speed & Action": ["fast", "rocket", "speed", "race", "turbo", "boost"],
    "Cute & Cozy": ["cute", "cozy", "puppy", "kitten", "warm", "adorable", "cuddle"],
    "Space Exploration": ["space", "star", "planet", "galaxy", "cosmic", "nebula", "moon"],
    "Ocean Discovery": ["ocean", "underwater", "coral", "dolphin", "submarine", "fish"],
    "Prehistoric World": ["dinosaur", "fossil", "volcano", "jungle", "dino", "t-rex"],
    "Colorful Fantasy": ["rainbow", "colorful", "sparkle", "glowing", "neon"],
    "Nature & Friendship": ["nature", "garden", "park", "friendship", "friend"],
  };

  let bestTheme = "Creative World";
  let bestScore = 0;

  for (const [theme, words] of Object.entries(keywords)) {
    const score = all.reduce(
      (count, item) => count + words.filter((w) => item.includes(w)).length,
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  return bestTheme;
}

function buildSuggestionReason(
  topPrefs: [string, number][],
  theme: string
): string {
  if (topPrefs.length === 0) {
    return "We're getting to know what you like! Pick some blocks and we'll learn your style.";
  }

  const topTags = topPrefs.slice(0, 3).map(([k]) => k);

  if (topTags.length === 1) {
    return `You really like ${topTags[0]} things! We're suggesting more of that in your ${theme.toLowerCase()} world.`;
  }

  const last = topTags.pop();
  return `You enjoy ${topTags.join(", ")} and ${last} vibes! We're mixing those into your ${theme.toLowerCase()} world.`;
}

export default function AIInsightsPanel({
  preferences,
  canvasState,
  visible,
  onToggle,
}: AIInsightsPanelProps) {
  const topPrefs = Object.entries(preferences)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const theme = inferTheme(canvasState);
  const reason = buildSuggestionReason([...topPrefs], theme);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -top-1 -right-1 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-md hover:shadow-lg hover:scale-110 transition-all"
        title={visible ? "Hide AI Insights" : "Show AI Insights"}
      >
        {visible ? "×" : "🧠"}
      </button>

      {/* Panel */}
      {visible && (
        <div className="animate-slide-up bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-lg">
          <h3 className="text-sm font-extrabold text-gray-700 mb-3">
            AI Insights
          </h3>

          {/* Inferred Theme */}
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Your Theme
            </p>
            <p className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {theme}
            </p>
          </div>

          {/* Top Preferences */}
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Your Style
            </p>
            {topPrefs.length > 0 ? (
              <div className="space-y-1.5">
                {topPrefs.map(([tag, weight]) => (
                  <div key={tag} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600 w-16 truncate capitalize">
                      {tag}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(weight * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {Math.round(weight * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Pick some blocks to see your style!
              </p>
            )}
          </div>

          {/* Suggestion Reason */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Why these suggestions?
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">{reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
