"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BoostTrailProps {
  playerPosition: [number, number, number];
  active: boolean;
  color?: string;
}

const TRAIL_LENGTH = 20;

export default function BoostTrail({
  playerPosition,
  active,
  color = "#FF6600",
}: BoostTrailProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const positionsRef = useRef<[number, number, number][]>(
    Array.from({ length: TRAIL_LENGTH }, () => [0, -10, 0] as [number, number, number])
  );
  const indexRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    if (active) {
      // Record current player position with slight random spread
      positionsRef.current[indexRef.current] = [
        playerPosition[0] + (Math.random() - 0.5) * 0.3,
        playerPosition[1] + Math.random() * 0.2,
        playerPosition[2] + (Math.random() - 0.5) * 0.3,
      ];
      indexRef.current = (indexRef.current + 1) % TRAIL_LENGTH;
    }

    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const age = (indexRef.current - i + TRAIL_LENGTH) % TRAIL_LENGTH;
      const fade = active ? Math.max(0, 1 - age / TRAIL_LENGTH) : 0;
      const pos = positionsRef.current[i];

      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.scale.setScalar(fade * 0.08);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TRAIL_LENGTH]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
}
