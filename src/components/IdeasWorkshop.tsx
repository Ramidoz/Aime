"use client";

import { Block } from "@/types";
import BlockCard from "./BlockCard";

interface IdeasWorkshopProps {
  blocks: Block[];
  onSelectBlock: (block: Block) => void;
  loading: boolean;
  turn: number;
}

export default function IdeasWorkshop({
  blocks,
  onSelectBlock,
  loading,
  turn,
}: IdeasWorkshopProps) {
  return (
    <div className="h-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
          Ideas Workshop
        </h2>
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-16 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full" />
          <span className="text-xs font-semibold text-gray-400">
            Turn {turn}
          </span>
        </div>
      </div>

      {/* Blocks */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-sparkle text-5xl mb-4">🎨</div>
            <p className="text-gray-500 font-semibold animate-pulse">
              Creating new ideas...
            </p>
          </div>
        ) : blocks.length > 0 ? (
          blocks.map((block, i) => (
            <BlockCard
              key={block.id}
              block={block}
              index={i}
              onSelect={onSelectBlock}
              disabled={loading}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-5xl mb-4">🎯</div>
            <p className="font-semibold">Ready to create!</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!loading && blocks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center font-medium">
            Tap a card to add it to your world!
          </p>
        </div>
      )}
    </div>
  );
}
