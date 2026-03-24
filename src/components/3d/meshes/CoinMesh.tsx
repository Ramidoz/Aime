"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CoinMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function CoinMesh({ color, emissive, emissiveIntensity }: CoinMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 2.5;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <cylinderGeometry args={[0.25, 0.25, 0.06, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.15}
        metalness={0.9}
      />
    </mesh>
  );
}
