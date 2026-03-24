"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ConfettiExplosionProps {
  active: boolean;
}

const COUNT = 100;
const COLORS = ["#ff4488", "#44aaff", "#ffaa22", "#44ff88", "#aa44ff", "#ff6644"];

export default function ConfettiExplosion({ active }: ConfettiExplosionProps) {
  const groupRef = useRef<THREE.Group>(null);

  const confetti = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 0.5,
        Math.random() * 2 + 3,
        (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
      velocity: [
        (Math.random() - 0.5) * 0.08,
        -Math.random() * 0.02 - 0.01,
        (Math.random() - 0.5) * 0.08,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      color: COLORS[i % COLORS.length],
      scale: 0.05 + Math.random() * 0.05,
    }));
  }, []);

  useFrame(() => {
    if (!groupRef.current || !active) return;

    groupRef.current.children.forEach((child, i) => {
      const c = confetti[i];
      if (!c) return;

      child.position.x += c.velocity[0];
      child.position.y += c.velocity[1];
      child.position.z += c.velocity[2];
      child.rotation.z += c.rotationSpeed;

      // Reset when fallen below
      if (child.position.y < -2) {
        child.position.set(
          (Math.random() - 0.5) * 8,
          Math.random() * 2 + 5,
          (Math.random() - 0.5) * 8
        );
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {confetti.map((c, i) => (
        <mesh key={i} position={c.position} rotation={[0, 0, c.rotation]}>
          <planeGeometry args={[c.scale, c.scale * 1.5]} />
          <meshBasicMaterial
            color={c.color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
