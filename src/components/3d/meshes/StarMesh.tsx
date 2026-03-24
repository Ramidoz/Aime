"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

// Create a 5-point star shape
function createStarShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const outerRadius = 0.35;
  const innerRadius = 0.15;
  const points = 5;

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export default function StarMesh({ color, emissive, emissiveIntensity }: StarMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const shape = createStarShape();
    const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = emissiveIntensity + Math.sin(state.clock.elapsedTime * 3) * 0.2;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}
