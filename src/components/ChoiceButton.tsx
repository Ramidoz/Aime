"use client";

import { ChoiceOption } from "@/game/ConversationFlow";

interface ChoiceButtonProps {
  option: ChoiceOption;
  onClick: () => void;
  disabled?: boolean;
  index?: number;
}

export default function ChoiceButton({ option, onClick, disabled = false, index = 0 }: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`choice-btn choice-btn--${option.color} animate-pop-in ${disabled ? "opacity-40 pointer-events-none" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <span className="choice-btn-shadow" />
      <span className="choice-btn__icon">{option.icon}</span>
      <span className="choice-btn__label">{option.label}</span>
    </button>
  );
}
