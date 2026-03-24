"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerState } from "@/types";

interface PlayerControllerProps {
  onPositionUpdate: (state: PlayerState) => void;
  onCollision: (position: [number, number, number]) => void;
  boosted: boolean;
  stunned: boolean;
  genre: string;
}

const BASE_SPEED = 0.08;
const BOOST_MULTIPLIER = 2.2;
const ROTATION_SPEED = 0.045;
const BOUNDS = 18;
const MOMENTUM_DECAY = 0.92; // Smooths start/stop

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
  stunned,
  genre,
}: PlayerControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef({ forward: 0, strafe: 0 });
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
    if (!groupRef.current) return;
    const keys = keysRef.current;
    const s = stateRef.current;
    const v = velocityRef.current;
    const t = state.clock.elapsedTime;

    // ─── Stun: flash red, can't move ───
    if (stunned) {
      if (bodyRef.current) {
        const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = Math.sin(t * 20) > 0 ? 1.5 : 0.2;
        mat.emissive.set("#ff0000");
      }
      groupRef.current.position.set(s.position[0], s.position[1], s.position[2]);
      groupRef.current.rotation.y = s.rotation;
      return;
    }

    // Reset emissive after stun
    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      const color = GENRE_COLORS[genre] || "#ff4400";
      mat.emissive.set(color);
      mat.emissiveIntensity = boosted ? 0.8 : 0.3;
    }

    const maxSpeed = boosted ? BASE_SPEED * BOOST_MULTIPLIER : BASE_SPEED;

    // Rotation
    if (keys.has("a") || keys.has("arrowleft")) s.rotation += ROTATION_SPEED;
    if (keys.has("d") || keys.has("arrowright")) s.rotation -= ROTATION_SPEED;

    // Acceleration with momentum
    let targetForward = 0;
    if (keys.has("w") || keys.has("arrowup")) targetForward = -maxSpeed;
    if (keys.has("s") || keys.has("arrowdown")) targetForward = maxSpeed * 0.5;

    v.forward += (targetForward - v.forward) * (1 - MOMENTUM_DECAY);

    // Apply velocity
    s.position[0] += Math.sin(s.rotation) * v.forward;
    s.position[2] += Math.cos(s.rotation) * v.forward;

    // Bounds
    s.position[0] = Math.max(-BOUNDS, Math.min(BOUNDS, s.position[0]));
    s.position[2] = Math.max(-BOUNDS, Math.min(BOUNDS, s.position[2]));

    const moving = Math.abs(v.forward) > 0.005;
    s.speed = Math.abs(v.forward);
    s.boosted = boosted;

    // Apply to group
    groupRef.current.position.set(s.position[0], s.position[1], s.position[2]);
    groupRef.current.rotation.y = s.rotation;

    // Squash/stretch based on speed
    const stretch = 1 + s.speed * 3;
    const squash = 1 / Math.sqrt(stretch);
    groupRef.current.scale.set(squash, stretch, squash);

    // Bob when moving
    if (moving) {
      groupRef.current.position.y = 0.3 + Math.sin(t * 10) * 0.04;
    } else {
      // Idle gentle bounce
      groupRef.current.position.y = 0.3 + Math.sin(t * 2) * 0.02;
    }

    onPositionUpdate({ ...s, position: [...s.position] as [number, number, number] });
    onCollision(s.position as [number, number, number]);
  });

  const color = GENRE_COLORS[genre] || "#ff4400";

  return (
    <group ref={groupRef} position={[0, 0.3, 8]}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.55, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.08, 0.05, -0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-0.08, 0.05, -0.22]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.08, 0.05, -0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.08, 0.05, -0.22]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}
