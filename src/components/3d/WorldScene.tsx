"use client";

import { Suspense, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { CanvasState, UserPreferences, Block, PlayerState } from "@/types";
import { PlacedElement } from "@/game/levelDesigner";
import GroundPlane from "./GroundPlane";
import SceneObject, { ObjectCategory } from "./SceneObject";
import ParticleField from "./ParticleField";
import SparkBurst from "./SparkBurst";
import ConfettiExplosion from "./ConfettiExplosion";
import PlayerController from "./PlayerController";
import GameCamera from "./GameCamera";
import GameObjects from "./GameObjects";
import CollectParticles from "./particles/CollectParticles";
import BoostTrail from "./particles/BoostTrail";
import GoalConfetti from "./particles/GoalConfetti";

interface WorldSceneProps {
  canvasState: CanvasState;
  genre: string;
  preferences: UserPreferences;
  lastSelectedBlock: Block | null;
  showConfetti: boolean;
  playMode?: boolean;
  gameElements?: PlacedElement[];
  boosted?: boolean;
  stunned?: boolean;
  gamePhase?: string;
  goalReady?: boolean;
  collectEffects?: { id: number; position: [number, number, number]; color: string }[];
  onRemoveCollectEffect?: (id: number) => void;
  onPlayerUpdate?: (state: PlayerState) => void;
  onCollision?: (position: [number, number, number]) => void;
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
    items.push({ id: `w-${i}-${label}`, label, category: "world", styleTags: [], isNew: false });
  });
  canvasState.characters.forEach((label, i) => {
    items.push({ id: `c-${i}-${label}`, label, category: "character", styleTags: [], isNew: false });
  });
  canvasState.theme.forEach((label, i) => {
    items.push({ id: `t-${i}-${label}`, label, category: "theme", styleTags: [], isNew: false });
  });
  const prevCount = prevCountRef.current;
  if (items.length > prevCount && items.length > 0) items[items.length - 1].isNew = true;
  prevCountRef.current = items.length;
  return items;
}

function getGlobalStyleTags(preferences: UserPreferences): string[] {
  return Object.entries(preferences)
    .filter(([, v]) => v >= 0.3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([k]) => k);
}

function SceneContent({
  canvasState, genre, preferences, lastSelectedBlock, showConfetti,
  playMode = false, gameElements = [], boosted = false, stunned = false,
  gamePhase = "playing", goalReady = false,
  collectEffects = [], onRemoveCollectEffect, onPlayerUpdate, onCollision,
}: WorldSceneProps) {
  const prevCountRef = useRef(0);
  const items = useMemo(() => buildSceneItems(canvasState, prevCountRef), [canvasState]);
  const globalTags = useMemo(() => getGlobalStyleTags(preferences), [preferences]);

  const [bursts, setBursts] = useState<
    { id: number; pos: [number, number, number]; color: string }[]
  >([]);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0.3, 8]);
  const [playerRot, setPlayerRot] = useState(0);

  const handlePlayerUpdate = useCallback(
    (state: PlayerState) => {
      setPlayerPos(state.position);
      setPlayerRot(state.rotation);
      onPlayerUpdate?.(state);
    },
    [onPlayerUpdate]
  );

  const handleCollision = useCallback(
    (position: [number, number, number]) => {
      onCollision?.(position);
    },
    [onCollision]
  );

  useEffect(() => {
    if (lastSelectedBlock && !playMode) {
      const newItem = items.find((i) => i.isNew);
      if (newItem) {
        const idx = items.indexOf(newItem);
        const total = items.length;
        const radius = Math.min(2 + total * 0.4, 6);
        const angle = (idx / Math.max(total, 1)) * Math.PI * 2 + Math.PI / 4;
        setBursts((prev) => [
          ...prev,
          { id: Date.now(), pos: [Math.cos(angle) * radius, 1, Math.sin(angle) * radius], color: "#ffaa00" },
        ]);
      }
    }
  }, [lastSelectedBlock, items, playMode]);

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isSpace = genre === "Space";
  const goalEl = gameElements.find((e) => e.type === "goal_zone");
  const goalPos: [number, number, number] = goalEl?.position || [0, 0, 0];
  const isGameOver = gamePhase === "won" || gamePhase === "lost";

  return (
    <>
      {playMode ? (
        <GameCamera
          playerPosition={playerPos}
          playerRotation={playerRot}
          boosted={boosted}
          gamePhase={gamePhase}
        />
      ) : (
        <OrbitControls
          enableZoom={false} enablePan={false}
          maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 4}
          autoRotate autoRotateSpeed={showConfetti ? 0.8 : 0.3}
          target={[0, 0.5, 0]}
        />
      )}

      <ambientLight intensity={playMode ? 0.55 : 0.4} />
      <directionalLight
        position={[5, 8, 5]} intensity={0.9} castShadow
        shadow-mapSize-width={256} shadow-mapSize-height={256}
      />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#8866ff" />
      {playMode && <pointLight position={[5, 2, -3]} intensity={0.2} color="#ffaa44" />}

      {isSpace && <Stars radius={30} depth={20} count={200} factor={2} fade speed={0.5} />}

      <GroundPlane genre={genre} />

      {/* Build mode objects */}
      {!playMode &&
        items.map((item, i) => (
          <SceneObject key={item.id} label={item.label} category={item.category}
            index={i} total={items.length}
            styleTags={item.styleTags.length > 0 ? item.styleTags : globalTags}
            isNew={item.isNew}
          />
        ))}

      {/* Play mode */}
      {playMode && (
        <>
          {!isGameOver && (
            <PlayerController
              onPositionUpdate={handlePlayerUpdate}
              onCollision={handleCollision}
              boosted={boosted}
              stunned={stunned || false}
              genre={genre}
            />
          )}
          <GameObjects
            elements={gameElements}
            goalReady={goalReady}
            playerPosition={playerPos}
          />
          <BoostTrail playerPosition={playerPos} active={boosted} />

          {collectEffects.map((fx) => (
            <CollectParticles
              key={fx.id}
              position={fx.position}
              color={fx.color}
              onComplete={() => onRemoveCollectEffect?.(fx.id)}
            />
          ))}

          {gamePhase === "won" && <GoalConfetti position={goalPos} active={true} />}
        </>
      )}

      <ParticleField genre={genre} count={playMode ? 15 : 40} />

      {!playMode &&
        bursts.map((b) => (
          <SparkBurst key={b.id} position={b.pos} color={b.color}
            onComplete={() => removeBurst(b.id)}
          />
        ))}

      <ConfettiExplosion active={showConfetti && !playMode} />
    </>
  );
}

export default function WorldScene(props: WorldSceneProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [6, 4, 6], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
