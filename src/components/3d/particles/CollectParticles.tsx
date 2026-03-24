"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CollectParticlesProps {
  position: [number, number, number];
  color: string;
  count?: number;
  onComplete?: () => void;
}

export default function CollectParticles({
  position,
  color,
  count = 16,
  onComplete,
}: CollectParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const startTime = useRef(Date.now());
  const completedRef = useRef(false);
  const LIFETIME = 800; // ms

  const velocities = useMemo(() => {
    const vels: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 3;
      vels.push([
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed * 0.8 + 2, // Bias upward
        Math.sin(phi) * Math.sin(theta) * speed,
      ]);
    }
    return vels;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const elapsed = Date.now() - startTime.current;
    const t = Math.min(elapsed / LIFETIME, 1);

    if (t >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
      return;
    }

    for (let i = 0; i < count; i++) {
      const [vx, vy, vz] = velocities[i];
      const gravity = -6;
      const time = t * 0.8; // Scale time for physics

      dummy.position.set(
        position[0] + vx * time,
        position[1] + vy * time + 0.5 * gravity * time * time,
        position[2] + vz * time
      );

      const scale = Math.max(0, 1 - t) * (0.5 + Math.random() * 0.3);
      dummy.scale.setScalar(scale * 0.12);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}
