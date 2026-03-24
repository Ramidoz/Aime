"use client";

interface ProgressBarProps {
  current: number;
  max: number;
}

export default function ProgressBar({ current, max }: ProgressBarProps) {
  const progress = Math.min((current - 1) / max, 1) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-400 tabular-nums">
        {Math.min(current - 1, max)}/{max}
      </span>
    </div>
  );
}
