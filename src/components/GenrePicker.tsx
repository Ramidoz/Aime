"use client";

import { Genre } from "@/types";

const GENRES: { name: Genre; emoji: string; color: string }[] = [
  { name: "Racing", emoji: "🏎️", color: "from-red-400 to-orange-400" },
  { name: "Pets", emoji: "🐾", color: "from-pink-400 to-rose-400" },
  { name: "Space", emoji: "🚀", color: "from-indigo-400 to-blue-400" },
  { name: "Fantasy", emoji: "🧙", color: "from-purple-400 to-violet-400" },
  { name: "Ocean", emoji: "🌊", color: "from-cyan-400 to-blue-400" },
  { name: "Dinosaurs", emoji: "🦕", color: "from-green-400 to-emerald-400" },
];

interface GenrePickerProps {
  onSelect: (genre: Genre) => void;
}

export default function GenrePicker({ onSelect }: GenrePickerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="animate-slide-up">
        <h1 className="text-5xl font-extrabold text-center mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          Creative Engine
        </h1>
        <p className="text-xl text-gray-500 text-center mb-12 font-semibold">
          Pick a world to build!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl">
        {GENRES.map((genre, i) => (
          <button
            key={genre.name}
            onClick={() => onSelect(genre.name)}
            className="animate-slide-up group"
            style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
          >
            <div
              className={`bg-gradient-to-br ${genre.color} rounded-3xl p-8 shadow-lg
                hover:shadow-2xl hover:scale-105 transition-all duration-300
                flex flex-col items-center gap-3 cursor-pointer`}
            >
              <span className="text-5xl group-hover:animate-float">
                {genre.emoji}
              </span>
              <span className="text-white font-bold text-lg">{genre.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
