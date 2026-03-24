"use client";

import { GameObjective } from "@/types";

interface GameHUDProps {
  objective: GameObjective;
  genre: string;
  boosted: boolean;
}

const OBJECTIVE_ICONS: Record<string, string> = {
  racing: "🏁",
  collect: "💎",
  interact: "🐾",
};

export default function GameHUD({ objective, genre, boosted }: GameHUDProps) {
  const progress = Math.min(objective.current / objective.total, 1) * 100;
  const icon = OBJECTIVE_ICONS[objective.type] || "🎯";

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="bg-black/50 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/15 flex items-center gap-4 min-w-[300px]">
        {/* Objective */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-white/90 text-sm font-bold">{objective.label}</p>
            <p className="text-white/50 text-xs">
              {objective.current} / {objective.total}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Boost indicator */}
        {boosted && (
          <div className="text-orange-400 text-xs font-bold animate-pulse">
            BOOST!
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="text-center mt-2">
        <span className="text-white/30 text-xs bg-black/30 px-3 py-1 rounded-full">
          WASD or Arrow Keys to move
        </span>
      </div>
    </div>
  );
}
