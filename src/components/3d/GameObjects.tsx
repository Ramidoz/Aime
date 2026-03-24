"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { ELEMENT_REGISTRY, ElementType } from "@/game/registry";
import { PlacedElement } from "@/game/levelDesigner";
import StarMesh from "./meshes/StarMesh";
import CoinMesh from "./meshes/CoinMesh";
import GemMesh from "./meshes/GemMesh";
import BoostPadMesh from "./meshes/BoostPadMesh";
import JumpPadMesh from "./meshes/JumpPadMesh";
import NpcBlobMesh from "./meshes/NpcBlobMesh";
import FlagMesh from "./meshes/FlagMesh";
import RockMesh from "./meshes/RockMesh";
import MovingBlockMesh from "./meshes/MovingBlockMesh";
import PortalMesh from "./meshes/PortalMesh";

interface GameObjectsProps {
  elements: PlacedElement[];
}

function GameElement({ element }: { element: PlacedElement }) {
  const groupRef = useRef<THREE.Group>(null);
  const def = ELEMENT_REGISTRY[element.type];

  useFrame((state) => {
    if (!groupRef.current || element.collected) return;
    // Glow ring pulse
    const ring = groupRef.current.children.find(
      (c) => c.userData.isGlowRing
    ) as THREE.Mesh | undefined;
    if (ring) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (element.collected && def.consumeOnTouch) return null;
  // For NPCs that have been "met" — show dimmed
  if (element.collected && !def.consumeOnTouch && element.type !== "goal_zone") {
    return (
      <group position={element.position}>
        <mesh>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color={def.color} transparent opacity={0.2} />
        </mesh>
      </group>
    );
  }

  const MeshComponent = getMeshComponent(def.mesh);

  return (
    <group ref={groupRef} position={element.position}>
      <MeshComponent
        color={def.color}
        emissive={def.emissive}
        emissiveIntensity={def.emissiveIntensity}
      />
      {/* Label */}
      {element.label && element.type !== "goal_zone" && (
        <Text
          position={[0, 0.85, 0]}
          fontSize={0.14}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
          maxWidth={2}
        >
          {element.label}
        </Text>
      )}
      {element.type === "goal_zone" && (
        <Text
          position={[0, 2.0, 0]}
          fontSize={0.22}
          color="#FFD700"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.03}
          outlineColor="#000000"
          font={undefined}
        >
          GOAL
        </Text>
      )}
      {/* Ground glow ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -element.position[1] + 0.02, 0]}
        userData={{ isGlowRing: true }}
      >
        <ringGeometry args={[def.interactionRadius * 0.4, def.interactionRadius * 0.6, 20]} />
        <meshBasicMaterial
          color={def.color}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function getMeshComponent(mesh: string) {
  switch (mesh) {
    case "star": return StarMesh;
    case "coin": return CoinMesh;
    case "gem": return GemMesh;
    case "boost_pad": return BoostPadMesh;
    case "jump_pad": return JumpPadMesh;
    case "npc_blob": return NpcBlobMesh;
    case "flag": return FlagMesh;
    case "rock": return RockMesh;
    case "moving_block": return MovingBlockMesh;
    case "portal": return PortalMesh;
    default: return StarMesh;
  }
}

export default function GameObjects({ elements }: GameObjectsProps) {
  return (
    <>
      {elements.map((el) => (
        <GameElement key={el.id} element={el} />
      ))}
    </>
  );
}
