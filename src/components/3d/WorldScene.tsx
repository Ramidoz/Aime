"use client";

import { Suspense, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stars } from "@react-three/drei";
import { CanvasState, UserPreferences, Block } from "@/types";
import GroundPlane from "./GroundPlane";
import SceneObject, { ObjectCategory } from "./SceneObject";
import ParticleField from "./ParticleField";
import SparkBurst from "./SparkBurst";
import ConfettiExplosion from "./ConfettiExplosion";

interface WorldSceneProps {
  canvasState: CanvasState;
  genre: string;
  preferences: UserPreferences;
  lastSelectedBlock: Block | null;
  showConfetti: boolean;
}

interface SceneItem {
  id: string;
  label: string;
  category: ObjectCategory;
  styleTags: string[];
  isNew: boolean;
}

function buildSceneItems(
  canvasState: CanvasState,
  prevCountRef: React.MutableRefObject<number>
): SceneItem[] {
  const items: SceneItem[] = [];

  canvasState.world.forEach((label, i) => {
    items.push({
      id: `w-${i}-${label}`,
      label,
      category: "world",
      styleTags: [],
      isNew: false,
    });
  });

  canvasState.characters.forEach((label, i) => {
    items.push({
      id: `c-${i}-${label}`,
      label,
      category: "character",
      styleTags: [],
      isNew: false,
    });
  });

  canvasState.theme.forEach((label, i) => {
    items.push({
      id: `t-${i}-${label}`,
      label,
      category: "theme",
      styleTags: [],
      isNew: false,
    });
  });

  // Mark the last item as new if count increased
  const prevCount = prevCountRef.current;
  if (items.length > prevCount && items.length > 0) {
    items[items.length - 1].isNew = true;
  }
  prevCountRef.current = items.length;

  return items;
}

// Infer style tags from preferences for all objects
function getGlobalStyleTags(preferences: UserPreferences): string[] {
  return Object.entries(preferences)
    .filter(([, v]) => v >= 0.3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([k]) => k);
}

function SceneContent({
  canvasState,
  genre,
  preferences,
  lastSelectedBlock,
  showConfetti,
}: WorldSceneProps) {
  const prevCountRef = useRef(0);
  const items = useMemo(
    () => buildSceneItems(canvasState, prevCountRef),
    [canvasState]
  );
  const globalTags = useMemo(
    () => getGlobalStyleTags(preferences),
    [preferences]
  );
  const [bursts, setBursts] = useState<
    { id: number; pos: [number, number, number]; color: string }[]
  >([]);

  // Spawn spark burst when new block is selected
  useEffect(() => {
    if (lastSelectedBlock) {
      const newItem = items.find((i) => i.isNew);
      if (newItem) {
        const idx = items.indexOf(newItem);
        const total = items.length;
        const radius = Math.min(2 + total * 0.4, 6);
        const angle = (idx / Math.max(total, 1)) * Math.PI * 2 + Math.PI / 4;
        const pos: [number, number, number] = [
          Math.cos(angle) * radius,
          1,
          Math.sin(angle) * radius,
        ];

        setBursts((prev) => [
          ...prev,
          { id: Date.now(), pos, color: "#ffaa00" },
        ]);
      }
    }
  }, [lastSelectedBlock, items]);

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isSpace = genre === "Space";

  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={showConfetti ? 0.8 : 0.3}
        target={[0, 0.5, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#8866ff" />

      {/* Environment */}
      {isSpace && <Stars radius={30} depth={20} count={300} factor={2} fade speed={0.5} />}

      {/* Ground */}
      <GroundPlane genre={genre} />

      {/* Scene objects from canvas state */}
      {items.map((item, i) => (
        <SceneObject
          key={item.id}
          label={item.label}
          category={item.category}
          index={i}
          total={items.length}
          styleTags={item.styleTags.length > 0 ? item.styleTags : globalTags}
          isNew={item.isNew}
        />
      ))}

      {/* Ambient particles */}
      <ParticleField genre={genre} count={50} />

      {/* Spark bursts on selection */}
      {bursts.map((b) => (
        <SparkBurst
          key={b.id}
          position={b.pos}
          color={b.color}
          onComplete={() => removeBurst(b.id)}
        />
      ))}

      {/* Confetti for completion */}
      <ConfettiExplosion active={showConfetti} />
    </>
  );
}

export default function WorldScene(props: WorldSceneProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [6, 4, 6], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
