"use client";

export type CosmoEmotion = "happy" | "thinking" | "excited" | "encouraging";

interface CosmoAvatarProps {
  emotion?: CosmoEmotion;
  size?: number;
}

export function CosmoAvatar({ emotion = "happy", size = 64 }: CosmoAvatarProps) {
  const animClass =
    emotion === "thinking" ? "cosmo-avatar--thinking" :
    emotion === "excited" ? "cosmo-avatar--excited" : "";

  return (
    <div className={`cosmo-avatar ${animClass}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size}>
        {/* Antenna */}
        <line x1="32" y1="12" x2="32" y2="4" stroke="#3498DB" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="3" r="3" fill={emotion === "thinking" ? "#F39C12" : "#5DADE2"}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur={emotion === "thinking" ? "0.6s" : "2s"} repeatCount="indefinite" />
        </circle>

        {/* Body */}
        <rect x="12" y="14" width="40" height="38" rx="14" fill="#5DADE2" />
        <rect x="14" y="16" width="36" height="34" rx="12" fill="#1A1A2E" opacity="0.85" />

        {/* Eyes */}
        {emotion === "happy" || emotion === "encouraging" ? (
          <>
            <circle cx="24" cy="30" r="5" fill="white" />
            <circle cx="24" cy="30" r="2.5" fill="#1A1A2E" />
            <circle cx="40" cy="30" r="5" fill="white" />
            <circle cx="40" cy="30" r="2.5" fill="#1A1A2E" />
            <circle cx="25" cy="29" r="1" fill="white" />
            <circle cx="41" cy="29" r="1" fill="white" />
          </>
        ) : emotion === "thinking" ? (
          <>
            <ellipse cx="24" cy="28" rx="5" ry="4" fill="white" />
            <circle cx="24" cy="26" r="2" fill="#1A1A2E" />
            <ellipse cx="40" cy="28" rx="5" ry="4" fill="white" />
            <circle cx="40" cy="26" r="2" fill="#1A1A2E" />
          </>
        ) : (
          <>
            {/* Excited: big sparkle eyes */}
            <circle cx="24" cy="30" r="6" fill="white" />
            <circle cx="24" cy="30" r="3" fill="#F39C12" />
            <circle cx="25" cy="28" r="1.5" fill="white" />
            <circle cx="40" cy="30" r="6" fill="white" />
            <circle cx="40" cy="30" r="3" fill="#F39C12" />
            <circle cx="41" cy="28" r="1.5" fill="white" />
          </>
        )}

        {/* Mouth */}
        {emotion === "excited" ? (
          <ellipse cx="32" cy="40" rx="6" ry="4" fill="#E74C3C" opacity="0.8" />
        ) : emotion === "happy" || emotion === "encouraging" ? (
          <path d="M 26 38 Q 32 44 38 38" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <line x1="28" y1="40" x2="36" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        )}

        {/* Cheek blush */}
        {(emotion === "happy" || emotion === "excited") && (
          <>
            <circle cx="16" cy="36" r="4" fill="#E85D9A" opacity="0.2" />
            <circle cx="48" cy="36" r="4" fill="#E85D9A" opacity="0.2" />
          </>
        )}
      </svg>
    </div>
  );
}

export function SpeechBubble({ children }: { children: React.ReactNode }) {
  return <div className="speech-bubble">{children}</div>;
}

export function ThinkingDots() {
  return (
    <div className="thinking-dots">
      <span /><span /><span />
    </div>
  );
}
