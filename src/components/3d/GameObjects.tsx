"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { GameObject } from "@/types";

interface GameObjectsProps {
  objects: GameObject[];
}

function Collectible({
  obj,
}: {
  obj: GameObject;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || obj.collected) return;
    const t = state.clock.elapsedTime;
    // Float + spin
    meshRef.current.position.y = obj.position[1] + Math.sin(t * 2 + obj.position[0]) * 0.2;
    meshRef.current.rotation.y = t * 2;
  });

  if (obj.collected) return null;

  const isCheckpoint = obj.type === "checkpoint";
  const isBoost = obj.type === "boost";
  const isCollectible = obj.type === "collectible";
  const isInteractable = obj.type === "interactable";

  let color = "#ffcc00";
  let emissive = "#664400";
  let emissiveIntensity = 0.5;
  let geometry: React.ReactNode = <octahedronGeometry args={[0.3]} />;

  if (isCheckpoint) {
    color = "#00ff88";
    emissive = "#004422";
    emissiveIntensity = 0.6;
    geometry = <torusGeometry args={[0.5, 0.1, 8, 16]} />;
  } else if (isBoost) {
    color = "#ff6600";
    emissive = "#442200";
    emissiveIntensity = 0.8;
    geometry = <coneGeometry args={[0.3, 0.5, 6]} />;
  } else if (isInteractable) {
    color = "#ff66aa";
    emissive = "#440022";
    emissiveIntensity = 0.4;
    geometry = <sphereGeometry args={[0.35, 12, 12]} />;
  } else if (isCollectible) {
    color = "#ffcc00";
    emissive = "#664400";
    emissiveIntensity = 0.6;
    geometry = <octahedronGeometry args={[0.25]} />;
  }

  return (
    <group position={[obj.position[0], obj.position[1], obj.position[2]]}>
      <mesh ref={meshRef} castShadow>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {obj.label}
      </Text>
      {/* Glow ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -obj.position[1] + 0.01, 0]}>
        <ringGeometry args={[0.4, 0.6, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function GameObjects({ objects }: GameObjectsProps) {
  return (
    <>
      {objects.map((obj) => (
        <Collectible key={obj.id} obj={obj} />
      ))}
    </>
  );
}
