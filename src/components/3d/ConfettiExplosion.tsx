"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ConfettiExplosionProps {
  active: boolean;
}

const COUNT = 80;
const COLORS = ["#ff4488", "#44aaff", "#ffaa22", "#44ff88", "#aa44ff", "#ff6644"];

const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const tempEuler = new THREE.Euler();

export default function ConfettiExplosion({ active }: ConfettiExplosionProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const confetti = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.5,
      y: Math.random() * 2 + 3,
      z: (Math.random() - 0.5) * 0.5,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -Math.random() * 0.02 - 0.01,
      vz: (Math.random() - 0.5) * 0.08,
      rz: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.1,
      scale: 0.05 + Math.random() * 0.05,
      colorIndex: i % COLORS.length,
    }));
  }, []);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    const color = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      color.set(COLORS[confetti[i].colorIndex]);
      arr[i * 3] = color.r;
      arr[i * 3 + 1] = color.g;
      arr[i * 3 + 2] = color.b;
    }
    return arr;
  }, [confetti]);

  // Set instance colors once
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < COUNT; i++) {
      const color = new THREE.Color(COLORS[confetti[i].colorIndex]);
      meshRef.current.setColorAt(i, color);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [confetti]);

  useFrame(() => {
    if (!meshRef.current || !active) return;

    for (let i = 0; i < COUNT; i++) {
      const c = confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.z += c.vz;
      c.rz += c.rs;

      if (c.y < -2) {
        c.x = (Math.random() - 0.5) * 8;
        c.y = Math.random() * 2 + 5;
        c.z = (Math.random() - 0.5) * 8;
      }

      tempPosition.set(c.x, c.y, c.z);
      tempEuler.set(0, 0, c.rz);
      tempQuaternion.setFromEuler(tempEuler);
      tempScale.set(c.scale, c.scale * 1.5, 1);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current.setMatrixAt(i, tempMatrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        vertexColors
      />
    </instancedMesh>
  );
}
