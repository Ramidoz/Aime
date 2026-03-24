"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GameCameraProps {
  playerPosition: [number, number, number];
  playerRotation: number;
  boosted?: boolean;
}

const CAMERA_DISTANCE = 4;
const CAMERA_HEIGHT = 2.5;
const SMOOTH_FACTOR = 0.08;
const LOOK_AHEAD = 1.5; // Look slightly ahead of player
const BASE_FOV = 50;
const BOOST_FOV = 60;

export default function GameCamera({
  playerPosition,
  playerRotation,
  boosted = false,
}: GameCameraProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE));
  const targetLook = useRef(new THREE.Vector3(0, 0.5, 0));
  const currentFov = useRef(BASE_FOV);

  useFrame(() => {
    // Position: behind and above the player
    const idealX = playerPosition[0] + Math.sin(playerRotation) * CAMERA_DISTANCE;
    const idealZ = playerPosition[2] + Math.cos(playerRotation) * CAMERA_DISTANCE;
    const idealY = playerPosition[1] + CAMERA_HEIGHT;

    targetPos.current.lerp(
      new THREE.Vector3(idealX, idealY, idealZ),
      SMOOTH_FACTOR
    );

    // Look target: slightly ahead of the player (in their movement direction)
    const lookX = playerPosition[0] - Math.sin(playerRotation) * LOOK_AHEAD;
    const lookZ = playerPosition[2] - Math.cos(playerRotation) * LOOK_AHEAD;

    targetLook.current.lerp(
      new THREE.Vector3(lookX, playerPosition[1] + 0.3, lookZ),
      SMOOTH_FACTOR * 1.5
    );

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);

    // Dynamic FOV when boosted
    const targetFov = boosted ? BOOST_FOV : BASE_FOV;
    currentFov.current += (targetFov - currentFov.current) * 0.05;
    (camera as THREE.PerspectiveCamera).fov = currentFov.current;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}
