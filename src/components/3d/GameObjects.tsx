"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ELEMENT_REGISTRY } from "@/game/registry";
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
  goalReady: boolean;
  playerPosition: [number, number, number];
}

function GameElement({
  element,
  goalReady,
  playerPosition,
}: {
  element: PlacedElement;
  goalReady: boolean;
  playerPosition: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const def = ELEMENT_REGISTRY[element.type];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Proximity glow — brighter as player gets closer
    if (glowRef.current && !element.collected) {
      const dx = playerPosition[0] - element.position[0];
      const dz = playerPosition[2] - element.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      const proximity = Math.max(0, 1 - dist / (def.interactionRadius * 3));
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + proximity * 0.35 + Math.sin(t * 2) * 0.05;

      // Scale glow ring with proximity
      const glowScale = 1 + proximity * 0.3;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
  });

  // Consumed items disappear
  if (element.collected && def.consumeOnTouch) return null;

  // Met NPCs show dimmed
  if (element.collected && !def.consumeOnTouch && element.type !== "goal_zone") {
    return (
      <group position={element.position}>
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={def.color} transparent opacity={0.15} />
        </mesh>
      </group>
    );
  }

  // Goal zone: locked vs unlocked
  const isGoal = element.type === "goal_zone";
  const goalColor = isGoal && goalReady ? "#44FF88" : isGoal ? "#444444" : def.color;
  const goalEmissive = isGoal && goalReady ? "#00FF55" : isGoal ? "#222222" : def.emissive;
  const goalIntensity = isGoal && goalReady ? 1.2 : isGoal ? 0.1 : def.emissiveIntensity;

  const MeshComponent = getMeshComponent(def.mesh);

  return (
    <group ref={groupRef} position={element.position}>
      <MeshComponent
        color={goalColor}
        emissive={goalEmissive}
        emissiveIntensity={goalIntensity}
      />
      {/* Goal locked indicator */}
      {isGoal && !goalReady && (
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#666666" emissive="#333333" emissiveIntensity={0.3} />
        </mesh>
      )}
      {/* Ground glow ring — reacts to player proximity */}
      <mesh
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -element.position[1] + 0.02, 0]}
      >
        <ringGeometry args={[def.interactionRadius * 0.4, def.interactionRadius * 0.65, 24]} />
        <meshBasicMaterial
          color={goalColor}
          transparent
          opacity={0.15}
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

export default function GameObjects({ elements, goalReady, playerPosition }: GameObjectsProps) {
  return (
    <>
      {elements.map((el) => (
        <GameElement
          key={el.id}
          element={el}
          goalReady={goalReady}
          playerPosition={playerPosition}
        />
      ))}
    </>
  );
}
