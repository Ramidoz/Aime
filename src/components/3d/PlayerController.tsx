"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerState } from "@/types";

interface PlayerControllerProps {
  onPositionUpdate: (state: PlayerState) => void;
  onCollision: (position: [number, number, number]) => void;
  boosted: boolean;
  genre: string;
}

const BASE_SPEED = 0.08;
const BOOST_MULTIPLIER = 2.0;
const ROTATION_SPEED = 0.04;
const BOUNDS = 18; // Keep player within ground plane

const GENRE_COLORS: Record<string, string> = {
  Racing: "#ff4400",
  Pets: "#ffaacc",
  Space: "#6644cc",
  Fantasy: "#aa44ff",
  Ocean: "#2299cc",
  Dinosaurs: "#44aa44",
};

export default function PlayerController({
  onPositionUpdate,
  onCollision,
  boosted,
  genre,
}: PlayerControllerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef<PlayerState>({
    position: [0, 0.3, 8],
    rotation: 0,
    speed: 0,
    boosted: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key.toLowerCase());
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const keys = keysRef.current;
    const s = stateRef.current;
    const speed = boosted ? BASE_SPEED * BOOST_MULTIPLIER : BASE_SPEED;

    // Rotation (A/D or Left/Right)
    if (keys.has("a") || keys.has("arrowleft")) {
      s.rotation += ROTATION_SPEED;
    }
    if (keys.has("d") || keys.has("arrowright")) {
      s.rotation -= ROTATION_SPEED;
    }

    // Movement (W/S or Up/Down)
    let moving = false;
    if (keys.has("w") || keys.has("arrowup")) {
      s.position[0] -= Math.sin(s.rotation) * speed;
      s.position[2] -= Math.cos(s.rotation) * speed;
      moving = true;
    }
    if (keys.has("s") || keys.has("arrowdown")) {
      s.position[0] += Math.sin(s.rotation) * speed * 0.6;
      s.position[2] += Math.cos(s.rotation) * speed * 0.6;
      moving = true;
    }

    // Clamp to bounds
    s.position[0] = Math.max(-BOUNDS, Math.min(BOUNDS, s.position[0]));
    s.position[2] = Math.max(-BOUNDS, Math.min(BOUNDS, s.position[2]));

    s.speed = moving ? speed : 0;
    s.boosted = boosted;

    // Apply to mesh
    meshRef.current.position.set(s.position[0], s.position[1], s.position[2]);
    meshRef.current.rotation.y = s.rotation;

    // Bobbing animation when moving
    if (moving) {
      meshRef.current.position.y =
        0.3 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
    }

    onPositionUpdate({ ...s, position: [...s.position] as [number, number, number] });
    onCollision(s.position as [number, number, number]);
  });

  const color = GENRE_COLORS[genre] || "#ff4400";

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0.3, 8]} castShadow>
        {/* Player body - small arrow/wedge shape */}
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={boosted ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      {/* Direction indicator - small sphere at front */}
      {meshRef.current && (
        <mesh
          position={[
            meshRef.current.position.x - Math.sin(stateRef.current.rotation) * 0.4,
            0.5,
            meshRef.current.position.z - Math.cos(stateRef.current.rotation) * 0.4,
          ]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
