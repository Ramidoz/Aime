"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface JumpPadMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function JumpPadMesh({ color, emissive, emissiveIntensity }: JumpPadMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Bounce compression animation
    const squash = 1 + Math.sin(t * 3) * 0.15;
    meshRef.current.scale.set(1, squash, 1);
  });

  return (
    <mesh ref={meshRef} castShadow position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.5, 0.6, 0.2, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.5}
        metalness={0.3}
      />
    </mesh>
  );
}
