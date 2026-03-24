"use client";

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { useMemo } from "react";

interface GameEffectsProps {
  boosted: boolean;
  damaged: boolean;
  won: boolean;
  enabled?: boolean;
}

export default function GameEffects({
  boosted,
  damaged,
  won,
  enabled = true,
}: GameEffectsProps) {
  const chromaticOffset = useMemo(() => new Vector2(0.003, 0.003), []);
  const chromaticZero = useMemo(() => new Vector2(0, 0), []);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      {/* Subtle bloom on everything glowing */}
      <Bloom
        intensity={won ? 1.2 : 0.4}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Focus vignette */}
      <Vignette
        offset={damaged ? 0.5 : 0.3}
        darkness={damaged ? 0.9 : 0.5}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Chromatic aberration when boosted — speed distortion */}
      <ChromaticAberration
        offset={boosted ? chromaticOffset : chromaticZero}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
