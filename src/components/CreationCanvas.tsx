"use client";

import { CanvasState } from "@/types";

interface CreationCanvasProps {
  canvasState: CanvasState;
  genre: string;
  narration: string;
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

export default function CreationCanvas({
  canvasState,
  genre,
  narration,
}: CreationCanvasProps) {
  const gradient = GENRE_GRADIENTS[genre] || GENRE_GRADIENTS.Space;
  const isEmpty =
    canvasState.world.length === 0 &&
    canvasState.characters.length === 0;

  return (
    <div
      className={`h-full bg-gradient-to-b ${gradient} rounded-2xl p-6 flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold text-white/90 mb-1">
          Your World
        </h2>
        <div className="h-0.5 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
      </div>

      {/* Narration */}
      {narration && (
        <div className="animate-fade-in mb-5 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-white/90 text-sm leading-relaxed italic">
            {narration}
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
            {/* World Elements */}
            {canvasState.world.length > 0 && (
              <Section title="World" emoji="🌍">
                <div className="flex flex-wrap gap-2">
                  {canvasState.world.map((item, i) => (
                    <Tag key={`w-${i}`} label={item} colorIdx={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Characters */}
            {canvasState.characters.length > 0 && (
              <Section title="Characters" emoji="👾">
                <div className="flex flex-wrap gap-2">
                  {canvasState.characters.map((item, i) => (
                    <Tag key={`c-${i}`} label={item} colorIdx={i + 2} />
                  ))}
                </div>
              </Section>
            )}

            {/* Theme */}
            {canvasState.theme.length > 0 && (
              <Section title="Theme" emoji="🎨">
                <div className="flex flex-wrap gap-2">
                  {canvasState.theme.map((item, i) => (
                    <Tag key={`t-${i}`} label={item} colorIdx={i + 4} />
                  ))}
                </div>
              </Section>
            )}

            {/* Mood */}
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

function Tag({ label, colorIdx }: { label: string; colorIdx: number }) {
  const color = TAG_COLORS[colorIdx % TAG_COLORS.length];
  return (
    <span
      className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${color} capitalize animate-slide-up`}
    >
      {label}
    </span>
  );
}
