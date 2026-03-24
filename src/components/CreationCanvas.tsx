"use client";

import { CanvasState, UserPreferences, Block, GameObject, GameObjective, PlayerState } from "@/types";
import { useMemo, lazy, Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";
import GameHUD from "./GameHUD";

const WorldScene = lazy(() => import("./3d/WorldScene"));

interface CreationCanvasProps {
  canvasState: CanvasState;
  genre: string;
  narration: string;
  preferences: UserPreferences;
  sessionSummary: string;
  lastSelectedBlock: Block | null;
  showConfetti: boolean;
  // Play mode props
  playMode?: boolean;
  gameObjects?: GameObject[];
  objective?: GameObjective;
  boosted?: boolean;
  onPlayerUpdate?: (state: PlayerState) => void;
  onCollision?: (position: [number, number, number]) => void;
  onPlayNow?: () => void;
  showPlayButton?: boolean;
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

function useStyleEffects(preferences: UserPreferences) {
  return useMemo(() => {
    const tags = Object.entries(preferences)
      .filter(([, v]) => v >= 0.3)
      .map(([k]) => k.toLowerCase());

    const hasCute = tags.some((t) =>
      ["cute", "cozy", "adorable", "warm"].includes(t)
    );

    return { hasCute };
  }, [preferences]);
}

export default function CreationCanvas({
  canvasState,
  genre,
  narration,
  preferences,
  sessionSummary,
  lastSelectedBlock,
  showConfetti,
  playMode = false,
  gameObjects = [],
  objective,
  boosted = false,
  onPlayerUpdate,
  onCollision,
  onPlayNow,
  showPlayButton = false,
}: CreationCanvasProps) {
  const gradient = GENRE_GRADIENTS[genre] || GENRE_GRADIENTS.Space;
  const isEmpty =
    canvasState.world.length === 0 && canvasState.characters.length === 0;
  const style = useStyleEffects(preferences);

  return (
    <div
      className={`h-full bg-gradient-to-b ${gradient} ${style.hasCute ? "rounded-3xl" : "rounded-2xl"} overflow-hidden relative`}
    >
      {/* 3D Scene — fills the entire canvas area */}
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-white/30 text-sm animate-pulse">
                  Loading 3D world...
                </div>
              </div>
            }
          >
            <WorldScene
              canvasState={canvasState}
              genre={genre}
              preferences={preferences}
              lastSelectedBlock={lastSelectedBlock}
              showConfetti={showConfetti}
              playMode={playMode}
              gameObjects={gameObjects}
              boosted={boosted}
              onPlayerUpdate={onPlayerUpdate}
              onCollision={onCollision}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Game HUD — shown in play mode */}
      {playMode && objective && (
        <GameHUD objective={objective} genre={genre} boosted={boosted} />
      )}

      {/* UI Overlay — on top of 3D scene (build mode only) */}
      {!playMode && (
        <div className="relative z-10 flex flex-col h-full p-6 pointer-events-none">
          {/* Header */}
          <div className="mb-4 pointer-events-auto">
            <h2
              className={`text-2xl font-extrabold text-white/90 mb-1 drop-shadow-lg ${style.hasCute ? "tracking-wide" : ""}`}
            >
              Your World
            </h2>
            <div className="h-0.5 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
          </div>

          {/* Narration */}
          {narration && (
            <div
              className={`animate-fade-in mb-4 bg-black/40 backdrop-blur-md p-4 border border-white/10 pointer-events-auto ${style.hasCute ? "rounded-2xl" : "rounded-xl"}`}
            >
              <p className="text-white/90 text-sm leading-relaxed italic drop-shadow-md">
                {narration}
              </p>
            </div>
          )}

          {/* Session Summary */}
          {sessionSummary && (
            <div className="mb-4 px-3 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/5 pointer-events-auto">
              <p className="text-white/40 text-xs">
                <span className="font-bold text-white/50">Story so far:</span>{" "}
                {sessionSummary}
              </p>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Play Now Button */}
          {showPlayButton && (
            <div className="flex justify-center mb-6 pointer-events-auto animate-slide-up">
              <button
                onClick={onPlayNow}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-extrabold text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/30 border border-green-400/30"
              >
                Play Now!
              </button>
            </div>
          )}

          {/* Bottom info bar */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-white/40 mb-8">
              <div className="text-5xl mb-3 animate-float">✨</div>
              <p className="text-lg font-semibold drop-shadow-md">
                Your world is empty...
              </p>
              <p className="text-sm drop-shadow-md">
                Pick a block to start building!
              </p>
            </div>
          ) : (
            <div className="pointer-events-auto">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {canvasState.world.map((item, i) => (
                    <Tag
                      key={`w-${i}`}
                      label={item}
                      colorIdx={i}
                      cute={style.hasCute}
                      icon="🌍"
                    />
                  ))}
                  {canvasState.characters.map((item, i) => (
                    <Tag
                      key={`c-${i}`}
                      label={item}
                      colorIdx={i + 2}
                      cute={style.hasCute}
                      icon="👾"
                    />
                  ))}
                  {canvasState.theme.map((item, i) => (
                    <Tag
                      key={`t-${i}`}
                      label={item}
                      colorIdx={i + 4}
                      cute={style.hasCute}
                      icon="🎨"
                    />
                  ))}
                  {canvasState.mood.length > 0 && (
                    <span className="text-white/50 text-xs font-semibold capitalize ml-1">
                      💫 {canvasState.mood[canvasState.mood.length - 1]}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex gap-4 text-white/30 text-xs">
                  <span>{canvasState.world.length} world items</span>
                  <span>{canvasState.characters.length} characters</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tag({
  label,
  colorIdx,
  cute,
  icon,
}: {
  label: string;
  colorIdx: number;
  cute: boolean;
  icon: string;
}) {
  const color = TAG_COLORS[colorIdx % TAG_COLORS.length];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border ${color} capitalize ${cute ? "rounded-2xl" : "rounded-full"}`}
    >
      <span className="text-[10px]">{icon}</span>
      {label}
    </span>
  );
}
