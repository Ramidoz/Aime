"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GoalConfettiProps {
  position: [number, number, number];
  active: boolean;
}

const PARTICLE_COUNT = 40;
const COLORS = ["#FFD700", "#FF44AA", "#44AAFF", "#44FF88", "#FF6600", "#AA44FF"];

export default function GoalConfetti({ position, active }: GoalConfettiProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const startTime = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      vx: (Math.random() - 0.5) * 6,
      vy: 3 + Math.random() * 5,
      vz: (Math.random() - 0.5) * 6,
      rotSpeed: Math.random() * 5,
    }));
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = new THREE.Color(COLORS[i % COLORS.length]);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !active) return;

    if (startTime.current === 0) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;
    const gravity = -8;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const t = elapsed;

      dummy.position.set(
        position[0] + p.vx * t,
        position[1] + 1 + p.vy * t + 0.5 * gravity * t * t,
        position[2] + p.vz * t
      );

      const fade = Math.max(0, 1 - elapsed / 3);
      dummy.scale.setScalar(fade * 0.08);
      dummy.rotation.set(t * p.rotSpeed, t * p.rotSpeed * 0.7, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <boxGeometry args={[1, 1, 0.2]} />
      <meshBasicMaterial vertexColors={false} color="#FFD700" transparent opacity={0.9} />
    </instancedMesh>
  );
}
