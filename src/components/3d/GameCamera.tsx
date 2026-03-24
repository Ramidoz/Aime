"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GameCameraProps {
  playerPosition: [number, number, number];
  playerRotation: number;
}

const CAMERA_DISTANCE = 6;
const CAMERA_HEIGHT = 4;
const SMOOTH_FACTOR = 0.06; // Lower = smoother/more lag

export default function GameCamera({
  playerPosition,
  playerRotation,
}: GameCameraProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(6, 4, 6));
  const targetLook = useRef(new THREE.Vector3(0, 0.5, 0));

  useFrame(() => {
    // Desired camera position: behind and above the player
    const idealX =
      playerPosition[0] + Math.sin(playerRotation) * CAMERA_DISTANCE;
    const idealZ =
      playerPosition[2] + Math.cos(playerRotation) * CAMERA_DISTANCE;
    const idealY = playerPosition[1] + CAMERA_HEIGHT;

    // Smooth interpolation for camera position (creates lag effect)
    targetPos.current.lerp(
      new THREE.Vector3(idealX, idealY, idealZ),
      SMOOTH_FACTOR
    );

    // Smooth interpolation for look-at target
    targetLook.current.lerp(
      new THREE.Vector3(
        playerPosition[0],
        playerPosition[1] + 0.5,
        playerPosition[2]
      ),
      SMOOTH_FACTOR * 1.5
    );

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);
  });

  return null;
}
