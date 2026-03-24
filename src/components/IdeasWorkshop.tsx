"use client";

import { Block } from "@/types";
import BlockCard from "./BlockCard";

interface IdeasWorkshopProps {
  blocks: Block[];
  onSelectBlock: (block: Block) => void;
  loading: boolean;
  turn: number;
  pipelineStage: string;
}

const STAGE_CONFIG: Record<string, { emoji: string; label: string }> = {
  idle: { emoji: "🎯", label: "Ready to create!" },
  "updating-state": { emoji: "🔧", label: "Building your world..." },
  narrating: { emoji: "📖", label: "Writing your story..." },
  designing: { emoji: "🎨", label: "Designing new ideas..." },
  "safety-check": { emoji: "🛡️", label: "Checking safety..." },
  complete: { emoji: "✨", label: "Done!" },
};

export default function IdeasWorkshop({
  blocks,
  onSelectBlock,
  loading,
  turn,
  pipelineStage,
}: IdeasWorkshopProps) {
  const stage = STAGE_CONFIG[pipelineStage] || STAGE_CONFIG.idle;

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
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {/* Pipeline Stage Indicator */}
            <div className="flex flex-col items-center gap-3">
              <div className="animate-sparkle text-5xl">{stage.emoji}</div>
              <p className="text-gray-500 font-semibold animate-pulse text-sm">
                {stage.label}
              </p>
            </div>

            {/* Pipeline Progress */}
            <PipelineProgress currentStage={pipelineStage} />
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

const PIPELINE_STEPS = [
  { key: "updating-state", label: "Update World" },
  { key: "narrating", label: "Write Story" },
  { key: "designing", label: "Design Ideas" },
  { key: "safety-check", label: "Safety Check" },
];

function PipelineProgress({ currentStage }: { currentStage: string }) {
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full max-w-[200px] space-y-2">
      {PIPELINE_STEPS.map((step, i) => {
        let status: "pending" | "running" | "done" = "pending";
        if (i < currentIdx) status = "done";
        else if (i === currentIdx) status = "running";

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-300 ${
                status === "done"
                  ? "bg-green-400 text-white"
                  : status === "running"
                    ? "bg-purple-400 text-white animate-pulse"
                    : "bg-gray-200 text-gray-400"
              }`}
            >
              {status === "done" ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs transition-colors duration-300 ${
                status === "done"
                  ? "text-green-600 font-semibold"
                  : status === "running"
                    ? "text-purple-600 font-semibold"
                    : "text-gray-300"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
