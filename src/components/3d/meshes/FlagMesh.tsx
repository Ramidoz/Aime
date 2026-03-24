"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FlagMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function FlagMesh({ color, emissive, emissiveIntensity }: FlagMeshProps) {
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!flagRef.current) return;
    const t = state.clock.elapsedTime;
    // Gentle wave/sway
    flagRef.current.rotation.y = Math.sin(t * 1.5) * 0.15;
  });

  return (
    <group>
      {/* Pole */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
        <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Flag banner */}
      <mesh ref={flagRef} position={[0.2, 0.6, 0]} castShadow>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      {/* Pole top ball */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FFD700" emissive="#AA8800" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
