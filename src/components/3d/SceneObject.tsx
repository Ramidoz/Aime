"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

export type ObjectCategory = "world" | "character" | "theme";

interface SceneObjectProps {
  label: string;
  category: ObjectCategory;
  index: number;
  total: number;
  styleTags: string[];
  isNew: boolean;
}

// Map style tags to visual properties
function getVisualStyle(tags: string[], category: ObjectCategory) {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  let color = "#8866ff";
  let emissive = "#220044";
  let emissiveIntensity = 0.3;
  let shape: string = "box";
  let isGlowing = false;
  let hasMotion = false;
  let isCute = false;

  // Category defaults
  if (category === "character") {
    shape = "sphere";
    color = "#ff66aa";
    emissive = "#440022";
  } else if (category === "theme") {
    shape = "octahedron";
    color = "#66aaff";
    emissive = "#002244";
  }

  // Style tag overrides
  if (tagSet.has("neon") || tagSet.has("glowing") || tagSet.has("sparkle")) {
    isGlowing = true;
    emissiveIntensity = 0.8;
    emissive = "#ff00ff";
  }

  if (tagSet.has("fast") || tagSet.has("speed") || tagSet.has("turbo") || tagSet.has("racing")) {
    hasMotion = true;
    color = "#ff4400";
    emissive = "#441100";
    shape = "cylinder";
  }

  if (tagSet.has("magic") || tagSet.has("magical") || tagSet.has("enchanted") || tagSet.has("fantasy")) {
    isGlowing = true;
    emissiveIntensity = 0.6;
    color = "#aa44ff";
    emissive = "#330066";
    shape = "octahedron";
  }

  if (tagSet.has("cute") || tagSet.has("cozy") || tagSet.has("adorable") || tagSet.has("warm")) {
    isCute = true;
    color = "#ffaacc";
    emissive = "#442233";
    shape = "sphere";
  }

  if (tagSet.has("vehicles") || tagSet.has("rides")) {
    shape = "box";
    color = "#cccccc";
    emissive = "#222222";
  }

  if (tagSet.has("castle") || tagSet.has("coral")) {
    shape = "cylinder";
    color = "#ddcc88";
    emissive = "#332200";
  }

  if (tagSet.has("ocean") || tagSet.has("underwater") || tagSet.has("water")) {
    color = "#2299cc";
    emissive = "#003344";
    isGlowing = true;
    emissiveIntensity = 0.4;
  }

  if (tagSet.has("space") || tagSet.has("cosmic") || tagSet.has("stars")) {
    color = "#6644cc";
    emissive = "#220066";
    isGlowing = true;
    emissiveIntensity = 0.5;
  }

  if (tagSet.has("nature") || tagSet.has("garden") || tagSet.has("jungle")) {
    color = "#44aa44";
    emissive = "#113311";
  }

  if (tagSet.has("colorful") || tagSet.has("rainbow")) {
    color = "#ff8844";
    emissive = "#442200";
    isGlowing = true;
    emissiveIntensity = 0.5;
  }

  return { color, emissive, emissiveIntensity, shape, isGlowing, hasMotion, isCute };
}

// Calculate position on a circular/spiral layout
function getPosition(index: number, total: number): [number, number, number] {
  if (total <= 1) return [0, 0.5, 0];

  const radius = Math.min(2 + total * 0.4, 6);
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 + Math.PI / 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = 0.5 + (index % 3) * 0.3; // slight vertical variation

  return [x, y, z];
}

export default function SceneObject({
  label,
  category,
  index,
  total,
  styleTags,
  isNew,
}: SceneObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(isNew ? 0 : 1);
  const vis = useMemo(() => getVisualStyle(styleTags, category), [styleTags, category]);
  const position = useMemo(() => getPosition(index, total), [index, total]);

  // Spawn animation
  useEffect(() => {
    if (isNew) {
      let start: number | null = null;
      const duration = 600;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        // Elastic ease-out
        const elastic =
          progress === 1
            ? 1
            : -Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
        setScale(elastic);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isNew]);

  // Rotation + glow pulse
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle rotation
    meshRef.current.rotation.y = t * 0.3 + index * 0.5;

    // Motion trail effect: additional rotation
    if (vis.hasMotion) {
      meshRef.current.rotation.x = Math.sin(t * 2) * 0.1;
      meshRef.current.rotation.z = Math.cos(t * 2) * 0.1;
    }

    // Glow pulse
    if (vis.isGlowing) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        vis.emissiveIntensity + Math.sin(t * 2 + index) * 0.2;
    }
  });

  const floatSpeed = vis.hasMotion ? 3 : 1.5;
  const floatIntensity = vis.isCute ? 0.3 : 0.15;

  const meshScale = vis.isCute ? 0.6 : 0.5;

  return (
    <Float speed={floatSpeed} floatIntensity={floatIntensity} rotationIntensity={0.1}>
      <group position={position} scale={[scale, scale, scale]}>
        <mesh ref={meshRef} castShadow>
          {vis.shape === "sphere" && (
            <sphereGeometry args={[meshScale, 16, 16]} />
          )}
          {vis.shape === "box" && (
            <boxGeometry args={[meshScale * 1.5, meshScale, meshScale * 1.5]} />
          )}
          {vis.shape === "octahedron" && (
            <octahedronGeometry args={[meshScale]} />
          )}
          {vis.shape === "cylinder" && (
            <cylinderGeometry args={[meshScale * 0.4, meshScale * 0.6, meshScale * 1.5, 8]} />
          )}
          {vis.shape === "torus" && (
            <torusGeometry args={[meshScale * 0.5, meshScale * 0.2, 8, 16]} />
          )}
          <meshStandardMaterial
            color={vis.color}
            emissive={vis.emissive}
            emissiveIntensity={vis.emissiveIntensity}
            roughness={vis.isCute ? 0.9 : 0.4}
            metalness={vis.isGlowing ? 0.6 : 0.2}
          />
        </mesh>

        {/* Label floating above */}
        <Text
          position={[0, meshScale + 0.4, 0]}
          fontSize={0.18}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
          maxWidth={2}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}
