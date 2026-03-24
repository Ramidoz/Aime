"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  genre: string;
}

const GENRE_PARTICLE_COLOR: Record<string, string> = {
  Racing: "#ff4422",
  Pets: "#ff88cc",
  Space: "#4488ff",
  Fantasy: "#aa66ff",
  Ocean: "#22cccc",
  Dinosaurs: "#44cc44",
};

export default function ParticleField({
  count = 60,
  genre,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const color = GENRE_PARTICLE_COLOR[genre] || "#8866ff";

  const velocities = useMemo(() => {
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      vel[i3] = (Math.random() - 0.5) * 0.005;
      vel[i3 + 1] = Math.random() * 0.01 + 0.003;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return vel;
  }, [count]);

  // Set up geometry imperatively
  useEffect(() => {
    if (!geoRef.current) return;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;
      pos[i3 + 1] = Math.random() * 8;
      pos[i3 + 2] = (Math.random() - 0.5) * 20;
    }
    geoRef.current.setAttribute(
      "position",
      new THREE.BufferAttribute(pos, 3)
    );
  }, [count]);

  useFrame(() => {
    if (!geoRef.current) return;
    const posAttr = geoRef.current.attributes.position as THREE.BufferAttribute;
    if (!posAttr) return;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3];
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2];

      if (arr[i3 + 1] > 10) {
        arr[i3] = (Math.random() - 0.5) * 20;
        arr[i3 + 1] = -1;
        arr[i3 + 2] = (Math.random() - 0.5) * 20;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
