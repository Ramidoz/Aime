"use client";

import { useEffect, useState } from "react";
import { GameObjective } from "@/types";
import { GAME_CONSTANTS } from "@/game/GameState";
import { ScorePopup } from "@/game/feedback";

interface GameHUDProps {
  objective: GameObjective;
  score: number;
  timer: number;
  combo: number;
  boosted: boolean;
  goalReady: boolean;
  scorePopups: ScorePopup[];
  gamePhase: string;
  countdownNumber: number;
}

export default function GameHUD({
  objective,
  score,
  timer,
  combo,
  boosted,
  goalReady,
  scorePopups,
  gamePhase,
  countdownNumber,
}: GameHUDProps) {
  const progress = objective.total > 0
    ? Math.min(objective.current / objective.total, 1) * 100
    : 0;
  const lowTime = timer <= GAME_CONSTANTS.LOW_TIME_THRESHOLD;
  const criticalTime = timer <= 5;
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Countdown overlay
  if (gamePhase === "countdown") {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="text-8xl font-extrabold text-white drop-shadow-2xl animate-pulse">
          {countdownNumber > 0 ? countdownNumber : "GO!"}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top left: Timer */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className={`backdrop-blur-md rounded-xl px-4 py-2 border transition-colors ${
          criticalTime
            ? "bg-red-900/70 border-red-500/50 animate-pulse"
            : lowTime
              ? "bg-red-900/40 border-red-400/30"
              : "bg-black/50 border-white/10"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-extrabold tabular-nums ${
              criticalTime ? "text-red-400" : lowTime ? "text-orange-400" : "text-white"
            }`}>
              {Math.ceil(timer)}s
            </span>
          </div>
        </div>
      </div>

      {/* Top center: Objective */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
          {goalReady ? (
            <span className="text-green-400 text-sm font-bold animate-pulse">
              🏁 REACH THE GOAL!
            </span>
          ) : (
            <>
              <span className="text-white/80 text-sm font-bold">
                ⭐ {objective.current}/{objective.total}
              </span>
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
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

      {/* Combo indicator */}
      {combo > 1 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm rounded-lg px-4 py-1 border border-purple-400/30 animate-pulse">
            <span className="text-white font-extrabold text-sm">
              x{combo} COMBO!
            </span>
          </div>
        </div>
      )}

      {/* Boost indicator */}
      {boosted && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-orange-600/60 backdrop-blur-sm rounded-lg px-4 py-1 border border-orange-400/30">
            <span className="text-white font-extrabold text-xs animate-pulse">
              ⚡ BOOST!
            </span>
          </div>
        </div>
      )}

      {/* Score popups */}
      {scorePopups.map((popup) => (
        <ScorePopupEl key={popup.id} popup={popup} />
      ))}

      {/* Controls hint */}
      {showControls && gamePhase === "playing" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/5">
            <span className="text-white/40 text-xs">WASD or Arrow Keys to move</span>
          </div>
        </div>
      )}
    </>
  );
}

function ScorePopupEl({ popup }: { popup: ScorePopup }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute z-40 pointer-events-none animate-score-popup"
      style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
    >
      <span
        className="font-extrabold text-xl drop-shadow-lg"
        style={{ color: popup.color }}
      >
        {popup.text}
      </span>
    </div>
  );
}
