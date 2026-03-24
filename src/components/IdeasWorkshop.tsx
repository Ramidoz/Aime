"use client";

import { Block } from "@/types";
import { ChoiceOption } from "@/game/ConversationFlow";
import { CosmoAvatar, SpeechBubble, ThinkingDots, CosmoEmotion } from "./Cosmo";
import ChoiceButton from "./ChoiceButton";
import BlockCard from "./BlockCard";

interface IdeasWorkshopProps {
  // Cosmo conversation
  cosmoMessage: string;
  cosmoEmotion: CosmoEmotion;
  choices: ChoiceOption[];
  onChoice: (choice: ChoiceOption) => void;
  isThinking: boolean;
  // Block selection (for the AI-generated building turns)
  blocks: Block[];
  onSelectBlock: (block: Block) => void;
  showBlocks: boolean;
  loading: boolean;
  pipelineStage: string;
  turn: number;
  // Launch
  showLaunchReady: boolean;
  onLaunch: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  idle: "Ready!",
  "updating-state": "Building your world...",
  narrating: "Writing your story...",
  designing: "Designing new ideas...",
  "safety-check": "Almost done...",
};

export default function IdeasWorkshop({
  cosmoMessage,
  cosmoEmotion,
  choices,
  onChoice,
  isThinking,
  blocks,
  onSelectBlock,
  showBlocks,
  loading,
  pipelineStage,
  turn,
  showLaunchReady,
  onLaunch,
}: IdeasWorkshopProps) {
  return (
    <div className="cu-panel h-full flex flex-col">
      <div className="cu-panel-header">Ideas Workshop</div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Cosmo + Speech Bubble */}
        <div className="flex items-start gap-3">
          <CosmoAvatar emotion={cosmoEmotion} size={56} />
          <SpeechBubble>
            {isThinking ? <ThinkingDots /> : cosmoMessage}
          </SpeechBubble>
        </div>

        {/* Choice Buttons (conversation stages) */}
        {!isThinking && choices.length > 0 && !showBlocks && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {choices.map((choice, i) => (
              <ChoiceButton
                key={choice.id}
                option={choice}
                onClick={() => onChoice(choice)}
                index={i}
              />
            ))}
          </div>
        )}

        {/* AI Block Cards (building turns) */}
        {showBlocks && !loading && blocks.length > 0 && (
          <div className="flex flex-col gap-3 mt-1">
            {blocks.map((block, i) => (
              <BlockCard
                key={block.id}
                block={block}
                index={i}
                onSelect={onSelectBlock}
                disabled={loading}
              />
            ))}
          </div>
        )}

        {/* Loading state */}
        {showBlocks && loading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
            <div className="animate-sparkle text-4xl">🎨</div>
            <p className="text-white/50 font-semibold text-sm animate-pulse">
              {STAGE_LABELS[pipelineStage] || "Creating..."}
            </p>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Launch Ready */}
        {showLaunchReady && (
          <div className="flex flex-col items-center gap-3 pb-2 animate-slide-up">
            <button onClick={onLaunch} className="launch-btn launch-btn--ready w-full">
              🚀 Launch & Play!
            </button>
          </div>
        )}

        {/* Turn indicator */}
        {showBlocks && !showLaunchReady && (
          <div className="text-center py-1">
            <span className="text-white/30 text-xs font-semibold">
              Step {turn} of 4 — Tap a card to add it!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
