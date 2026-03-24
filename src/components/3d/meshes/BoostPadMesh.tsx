"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BoostPadMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function BoostPadMesh({ color, emissive, emissiveIntensity }: BoostPadMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Pulsing glow
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = emissiveIntensity + Math.sin(t * 4) * 0.4;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Base platform */}
      <mesh castShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.6, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      {/* Arrow chevron on top */}
      <mesh position={[0, 0.05, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.35, 3]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={emissive}
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      <mesh position={[0, 0.05, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.25, 3]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={emissive}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
