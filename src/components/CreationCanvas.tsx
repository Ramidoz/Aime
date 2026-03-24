"use client";

import { CanvasState, UserPreferences } from "@/types";
import { useMemo } from "react";

interface CreationCanvasProps {
  canvasState: CanvasState;
  genre: string;
  narration: string;
  preferences: UserPreferences;
  sessionSummary: string;
}

const GENRE_GRADIENTS: Record<string, string> = {
  Racing: "from-gray-900 via-red-950 to-orange-950",
  Pets: "from-pink-950 via-rose-950 to-purple-950",
  Space: "from-gray-950 via-indigo-950 to-blue-950",
  Fantasy: "from-purple-950 via-violet-950 to-indigo-950",
  Ocean: "from-blue-950 via-cyan-950 to-teal-950",
  Dinosaurs: "from-green-950 via-emerald-950 to-lime-950",
};

const TAG_COLORS = [
  "bg-purple-500/30 text-purple-200 border-purple-400/30",
  "bg-pink-500/30 text-pink-200 border-pink-400/30",
  "bg-blue-500/30 text-blue-200 border-blue-400/30",
  "bg-green-500/30 text-green-200 border-green-400/30",
  "bg-yellow-500/30 text-yellow-200 border-yellow-400/30",
  "bg-cyan-500/30 text-cyan-200 border-cyan-400/30",
];

// Derive visual effects from active style tags in preferences
function useStyleEffects(preferences: UserPreferences) {
  return useMemo(() => {
    const tags = Object.entries(preferences)
      .filter(([, v]) => v >= 0.3)
      .map(([k]) => k.toLowerCase());

    const effects: string[] = [];
    let overlayGradient = "";
    let borderEffect = "";

    // Neon: glowing border and overlay
    if (tags.some((t) => ["neon", "glowing", "sparkle"].includes(t))) {
      overlayGradient = "from-fuchsia-500/10 via-transparent to-cyan-500/10";
      borderEffect = "ring-2 ring-fuchsia-400/30";
    }

    // Urban: sharper aesthetic
    if (tags.some((t) => ["urban", "city", "vehicles"].includes(t))) {
      effects.push("backdrop-contrast-110");
      if (!borderEffect) borderEffect = "ring-1 ring-white/10";
    }

    // Fast: motion streaks via pseudo-elements handled by class
    const hasFast = tags.some((t) => ["fast", "speed", "turbo", "racing"].includes(t));

    // Cute: rounded and soft
    const hasCute = tags.some((t) => ["cute", "cozy", "adorable", "warm"].includes(t));

    // Magical: extra shimmer
    const hasMagic = tags.some((t) => ["magic", "magical", "enchanted", "fantasy", "sparkle"].includes(t));

    // Cosmic: deep gradient overlay
    if (tags.some((t) => ["cosmic", "space", "stars", "nebula"].includes(t))) {
      if (!overlayGradient) overlayGradient = "from-indigo-500/10 via-transparent to-purple-500/10";
    }

    // Nature: green tints
    if (tags.some((t) => ["nature", "outdoors", "garden", "jungle"].includes(t))) {
      if (!overlayGradient) overlayGradient = "from-emerald-500/10 via-transparent to-green-500/10";
    }

    // Ocean: blue tints
    if (tags.some((t) => ["ocean", "underwater", "water", "coral"].includes(t))) {
      if (!overlayGradient) overlayGradient = "from-cyan-500/10 via-transparent to-blue-500/10";
    }

    return {
      classes: effects.join(" "),
      overlayGradient,
      borderEffect,
      hasFast,
      hasCute,
      hasMagic,
    };
  }, [preferences]);
}

export default function CreationCanvas({
  canvasState,
  genre,
  narration,
  preferences,
  sessionSummary,
}: CreationCanvasProps) {
  const gradient = GENRE_GRADIENTS[genre] || GENRE_GRADIENTS.Space;
  const isEmpty =
    canvasState.world.length === 0 && canvasState.characters.length === 0;
  const style = useStyleEffects(preferences);

  const containerClasses = [
    "h-full bg-gradient-to-b",
    gradient,
    "rounded-2xl p-6 flex flex-col overflow-hidden relative",
    style.borderEffect,
    style.classes,
    style.hasCute ? "rounded-3xl" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {/* Style overlay gradient */}
      {style.overlayGradient && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${style.overlayGradient} rounded-2xl pointer-events-none`}
        />
      )}

      {/* Fast motion streaks */}
      {style.hasFast && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-1/4 -left-4 w-32 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[slideRight_2s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 -left-4 w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-[slideRight_2.5s_ease-in-out_infinite_0.5s]" />
          <div className="absolute top-3/4 -left-4 w-28 h-0.5 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[slideRight_3s_ease-in-out_infinite_1s]" />
        </div>
      )}

      {/* Magic shimmer */}
      {style.hasMagic && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-yellow-300/40 rounded-full animate-sparkle" />
          <div className="absolute top-12 right-20 w-1 h-1 bg-pink-300/40 rounded-full animate-sparkle [animation-delay:0.5s]" />
          <div className="absolute bottom-16 left-12 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-sparkle [animation-delay:1s]" />
          <div className="absolute bottom-8 right-12 w-1 h-1 bg-cyan-300/40 rounded-full animate-sparkle [animation-delay:1.5s]" />
        </div>
      )}

      {/* Content (relative to stay above overlays) */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <h2
            className={`text-2xl font-extrabold text-white/90 mb-1 ${style.hasCute ? "tracking-wide" : ""}`}
          >
            Your World
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
        </div>

        {/* Narration */}
        {narration && (
          <div
            className={`animate-fade-in mb-4 bg-white/10 backdrop-blur-sm p-4 border border-white/10 ${style.hasCute ? "rounded-2xl" : "rounded-xl"}`}
          >
            <p className="text-white/90 text-sm leading-relaxed italic">
              {narration}
            </p>
          </div>
        )}

        {/* Session Summary */}
        {sessionSummary && (
          <div className="mb-4 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
            <p className="text-white/40 text-xs">
              <span className="font-bold text-white/50">Story so far:</span>{" "}
              {sessionSummary}
            </p>
          </div>
        )}

        {/* Canvas Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <div className="text-6xl mb-4 animate-float">✨</div>
              <p className="text-lg font-semibold">Your world is empty...</p>
              <p className="text-sm">Pick a block to start building!</p>
            </div>
          ) : (
            <>
              {canvasState.world.length > 0 && (
                <Section title="World" emoji="🌍">
                  <div className="flex flex-wrap gap-2">
                    {canvasState.world.map((item, i) => (
                      <Tag
                        key={`w-${i}`}
                        label={item}
                        colorIdx={i}
                        cute={style.hasCute}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {canvasState.characters.length > 0 && (
                <Section title="Characters" emoji="👾">
                  <div className="flex flex-wrap gap-2">
                    {canvasState.characters.map((item, i) => (
                      <Tag
                        key={`c-${i}`}
                        label={item}
                        colorIdx={i + 2}
                        cute={style.hasCute}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {canvasState.theme.length > 0 && (
                <Section title="Theme" emoji="🎨">
                  <div className="flex flex-wrap gap-2">
                    {canvasState.theme.map((item, i) => (
                      <Tag
                        key={`t-${i}`}
                        label={item}
                        colorIdx={i + 4}
                        cute={style.hasCute}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {canvasState.mood.length > 0 && (
                <Section title="Mood" emoji="💫">
                  <p className="text-white/80 text-sm capitalize">
                    {canvasState.mood[canvasState.mood.length - 1]}
                  </p>
                </Section>
              )}
            </>
          )}
        </div>

        {/* Stats Footer */}
        {!isEmpty && (
          <div className="mt-4 pt-3 border-t border-white/10 flex gap-4 text-white/40 text-xs">
            <span>{canvasState.world.length} world items</span>
            <span>{canvasState.characters.length} characters</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in">
      <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
        {emoji} {title}
      </h3>
      {children}
    </div>
  );
}

function Tag({
  label,
  colorIdx,
  cute,
}: {
  label: string;
  colorIdx: number;
  cute: boolean;
}) {
  const color = TAG_COLORS[colorIdx % TAG_COLORS.length];
  return (
    <span
      className={`inline-block px-3 py-1.5 text-xs font-semibold border ${color} capitalize animate-slide-up ${cute ? "rounded-2xl" : "rounded-full"}`}
    >
      {label}
    </span>
  );
}
