"use client";

import * as THREE from "three";

interface RockMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function RockMesh({ color, emissive, emissiveIntensity }: RockMeshProps) {
  return (
    <mesh castShadow>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.95}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}
