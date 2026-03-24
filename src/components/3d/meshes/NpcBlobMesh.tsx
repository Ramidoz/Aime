"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NpcBlobMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function NpcBlobMesh({ color, emissive, emissiveIntensity }: NpcBlobMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Bouncy idle
    groupRef.current.position.y = Math.abs(Math.sin(t * 2)) * 0.15;
    // Squash & stretch
    const squash = 1 + Math.sin(t * 2) * 0.08;
    groupRef.current.scale.set(1 / squash, squash, 1 / squash);
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.12, 0.12, 0.28]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-0.12, 0.12, 0.32]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.12, 0.12, 0.28]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.12, 0.32]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Smile - small torus arc */}
      <mesh position={[0, -0.05, 0.32]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#CC3366" roughness={0.9} />
      </mesh>
    </group>
  );
}
