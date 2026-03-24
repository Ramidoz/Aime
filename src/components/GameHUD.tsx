"use client";

import { useEffect, useState } from "react";
import { GameObjective } from "@/types";
import { ScorePopup } from "@/game/feedback";

interface GameHUDProps {
  objective: GameObjective;
  score: number;
  boosted: boolean;
  scorePopups: ScorePopup[];
}

const OBJECTIVE_ICONS: Record<string, string> = {
  racing: "🏁",
  collect: "⭐",
  interact: "💜",
};

export default function GameHUD({ objective, score, boosted, scorePopups }: GameHUDProps) {
  const progress = objective.total > 0
    ? Math.min(objective.current / objective.total, 1) * 100
    : 0;
  const icon = OBJECTIVE_ICONS[objective.type] || "⭐";
  const [showControls, setShowControls] = useState(true);

  // Hide controls hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Top center: Objective */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/10 flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm font-bold">
              {objective.current}/{objective.total}
            </span>
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {boosted && (
            <span className="text-orange-400 text-xs font-extrabold animate-pulse ml-1">
              BOOST!
            </span>
          )}
        </div>
      </div>

      {/* Top right: Score */}
      <div className="absolute top-4 right-4 z-30 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
          <span className="text-yellow-400 text-lg font-extrabold tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Score popups */}
      {scorePopups.map((popup) => (
        <ScorePopupEl key={popup.id} popup={popup} />
      ))}

      {/* Controls hint (fades away) */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/5">
            <span className="text-white/40 text-xs">
              WASD or Arrow Keys to move
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function ScorePopupEl({ popup }: { popup: ScorePopup }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute z-40 pointer-events-none animate-score-popup"
      style={{
        left: `${popup.x}%`,
        top: `${popup.y}%`,
      }}
    >
      <span className="text-yellow-300 font-extrabold text-xl drop-shadow-lg">
        +{popup.value}
      </span>
    </div>
  );
}
