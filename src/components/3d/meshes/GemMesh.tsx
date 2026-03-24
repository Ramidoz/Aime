"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GemMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function GemMesh({ color, emissive, emissiveIntensity }: GemMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = Math.sin(t * 1.5) * 0.15;
    meshRef.current.rotation.y = t * 0.8;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = emissiveIntensity + Math.sin(t * 2.5) * 0.3;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <octahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.1}
        metalness={0.7}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
