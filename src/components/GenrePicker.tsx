"use client";

import { Genre } from "@/types";
import { CosmoAvatar, SpeechBubble } from "./Cosmo";
import { getCosmoGreeting } from "@/game/ConversationFlow";
import { useMemo } from "react";

const GENRES: { name: Genre; emoji: string; color: string }[] = [
  { name: "Racing", emoji: "🏎️", color: "red" },
  { name: "Pets", emoji: "🐾", color: "pink" },
  { name: "Space", emoji: "🚀", color: "blue" },
  { name: "Fantasy", emoji: "🧙", color: "purple" },
  { name: "Ocean", emoji: "🌊", color: "blue" },
  { name: "Dinosaurs", emoji: "🦕", color: "green" },
];

interface GenrePickerProps {
  onSelect: (genre: Genre) => void;
  isSwitch?: boolean;
  currentGenre?: Genre | null;
}

export default function GenrePicker({ onSelect, isSwitch, currentGenre }: GenrePickerProps) {
  const greeting = useMemo(() => getCosmoGreeting(), []);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)" }}>
      {/* Cosmo greeting */}
      <div className="flex flex-col items-center mb-10 animate-slide-up max-w-lg">
        <CosmoAvatar emotion="happy" size={80} />
        <div className="mt-4 w-full">
          <SpeechBubble>
            {isSwitch ? "Want to switch worlds? Your creativity carries over!" : greeting}
          </SpeechBubble>
        </div>
      </div>

      {/* Genre buttons */}
      <div className="grid grid-cols-3 gap-4 max-w-lg w-full">
        {GENRES.map((genre, i) => {
          const isCurrent = currentGenre === genre.name;
          return (
            <button
              key={genre.name}
              onClick={() => !isCurrent && onSelect(genre.name)}
              disabled={isCurrent}
              className={`choice-btn choice-btn--${genre.color} animate-pop-in ${isCurrent ? "opacity-40 ring-2 ring-white/30" : ""}`}
              style={{ animationDelay: `${i * 0.08}s`, minHeight: "90px" }}
            >
              <span className="choice-btn-shadow" />
              <span className="choice-btn__icon">{genre.emoji}</span>
              <span className="choice-btn__label">{genre.name}</span>
            </button>
          );
        })}
      </div>

      {isSwitch && (
        <button
          onClick={() => currentGenre && onSelect(currentGenre)}
          className="mt-6 text-sm text-white/30 hover:text-white/60 font-semibold transition-colors"
        >
          Never mind, go back
        </button>
      )}
    </div>
  );
}
