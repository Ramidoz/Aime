"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GroundPlaneProps {
  genre: string;
}

const GENRE_COLORS: Record<string, string> = {
  Racing: "#1a0a0a",
  Pets: "#1a0a15",
  Space: "#05050f",
  Fantasy: "#10051a",
  Ocean: "#050f1a",
  Dinosaurs: "#0a1a05",
};

const GENRE_GRID_COLORS: Record<string, string> = {
  Racing: "#ff3333",
  Pets: "#ff69b4",
  Space: "#4466ff",
  Fantasy: "#9933ff",
  Ocean: "#00cccc",
  Dinosaurs: "#33cc33",
};

export default function GroundPlane({ genre }: GroundPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const groundColor = GENRE_COLORS[genre] || GENRE_COLORS.Space;
  const gridColor = GENRE_GRID_COLORS[genre] || GENRE_GRID_COLORS.Space;

  // Subtle pulsing glow
  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 0.03;
      mat.emissiveIntensity = pulse;
    }
  });

  return (
    <group>
      {/* Main ground */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color={groundColor}
          emissive={gridColor}
          emissiveIntensity={0.03}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[40, 40, gridColor, gridColor]}
        position={[0, -0.49, 0]}
        material-opacity={0.08}
        material-transparent={true}
      />
    </group>
  );
}
