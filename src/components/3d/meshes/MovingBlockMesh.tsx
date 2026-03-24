"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MovingBlockMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function MovingBlockMesh({ color, emissive, emissiveIntensity }: MovingBlockMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Patrol side to side
    meshRef.current.position.x = Math.sin(t * 0.8) * 1.5;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.6}
        metalness={0.3}
      />
    </mesh>
  );
}
