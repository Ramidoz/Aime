"use client";

import { Block } from "@/types";

interface BlockCardProps {
  block: Block;
  index: number;
  onSelect: (block: Block) => void;
  disabled: boolean;
}

const CARD_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
];

const CARD_SHADOWS = [
  "hover:shadow-violet-500/25",
  "hover:shadow-pink-500/25",
  "hover:shadow-cyan-500/25",
];

export default function BlockCard({
  block,
  index,
  onSelect,
  disabled,
}: BlockCardProps) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const shadow = CARD_SHADOWS[index % CARD_SHADOWS.length];

  return (
    <button
      onClick={() => onSelect(block)}
      disabled={disabled}
      className="animate-slide-up w-full text-left"
      style={{ animationDelay: `${index * 0.15}s`, animationFillMode: "both" }}
    >
      <div
        className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 shadow-lg
          ${shadow} hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1
          transition-all duration-300 cursor-pointer
          ${disabled ? "opacity-50 pointer-events-none" : ""}
          border border-white/20`}
      >
        <h3 className="text-white font-bold text-lg mb-2">
          {block.visual_label}
        </h3>
        <p className="text-white/80 text-sm leading-relaxed mb-3">
          {block.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {block.style_tags.map((tag) => (
            <span
              key={tag}
              className="bg-white/20 text-white/90 px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
