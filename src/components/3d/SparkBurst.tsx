"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SparkBurstProps {
  position: [number, number, number];
  color?: string;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 30;

export default function SparkBurst({
  position,
  color = "#ffaa00",
  onComplete,
}: SparkBurstProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const lifeRef = useRef(0);
  const [alive, setAlive] = useState(true);

  const velocities = useMemo(() => {
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.05 + Math.random() * 0.08;
      vel[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i3 + 1] = Math.cos(phi) * speed + 0.02;
      vel[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    return vel;
  }, []);

  useEffect(() => {
    if (!geoRef.current) return;
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = position[0];
      pos[i3 + 1] = position[1];
      pos[i3 + 2] = position[2];
    }
    geoRef.current.setAttribute(
      "position",
      new THREE.BufferAttribute(pos, 3)
    );
  }, [position]);

  useFrame(() => {
    if (!geoRef.current || !alive) return;

    lifeRef.current += 0.02;
    if (lifeRef.current >= 1) {
      setAlive(false);
      onComplete?.();
      return;
    }

    const posAttr = geoRef.current.attributes.position as THREE.BufferAttribute;
    if (!posAttr) return;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3];
      arr[i3 + 1] += velocities[i3 + 1] - 0.001;
      arr[i3 + 2] += velocities[i3 + 2];
    }
    posAttr.needsUpdate = true;

    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 1 - lifeRef.current);
      mat.size = 0.1 * (1 - lifeRef.current * 0.5);
    }
  });

  if (!alive) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
