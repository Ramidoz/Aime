"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PortalMeshProps {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

export default function PortalMesh({ color, emissive, emissiveIntensity }: PortalMeshProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    }
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = emissiveIntensity + Math.sin(t * 2) * 0.4;
      innerRef.current.rotation.z = -t * 0.8;
    }
  });

  return (
    <group position={[0, 0.8, 0]}>
      {/* Outer ring */}
      <mesh ref={ringRef} castShadow>
        <torusGeometry args={[0.7, 0.08, 8, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
      {/* Inner glow disc */}
      <mesh ref={innerRef}>
        <circleGeometry args={[0.55, 24]} />
        <meshStandardMaterial
          color={emissive}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity * 0.6}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
        <ringGeometry args={[0.5, 1.0, 24]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
