"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GameCameraProps {
  playerPosition: [number, number, number];
  playerRotation: number;
  boosted?: boolean;
  gamePhase?: string;
}

const CAMERA_DISTANCE = 4;
const CAMERA_HEIGHT = 2.5;
const SMOOTH_FACTOR = 0.08;
const LOOK_AHEAD = 1.5;
const BASE_FOV = 50;
const BOOST_FOV = 62;
const WIN_FOV = 40; // Zoom in on win
const WIN_HEIGHT = 5;
const WIN_DISTANCE = 8;

export default function GameCamera({
  playerPosition,
  playerRotation,
  boosted = false,
  gamePhase = "playing",
}: GameCameraProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE));
  const targetLook = useRef(new THREE.Vector3(0, 0.5, 0));
  const currentFov = useRef(BASE_FOV);

  useFrame(() => {
    const isWon = gamePhase === "won";
    const isLost = gamePhase === "lost";

    // Camera position
    const dist = isWon || isLost ? WIN_DISTANCE : CAMERA_DISTANCE;
    const height = isWon || isLost ? WIN_HEIGHT : CAMERA_HEIGHT;
    const smoothing = isWon || isLost ? 0.03 : SMOOTH_FACTOR;

    const idealX = playerPosition[0] + Math.sin(playerRotation) * dist;
    const idealZ = playerPosition[2] + Math.cos(playerRotation) * dist;
    const idealY = playerPosition[1] + height;

    targetPos.current.lerp(new THREE.Vector3(idealX, idealY, idealZ), smoothing);

    // Look-at target
    const lookX = playerPosition[0] - Math.sin(playerRotation) * LOOK_AHEAD;
    const lookZ = playerPosition[2] - Math.cos(playerRotation) * LOOK_AHEAD;

    targetLook.current.lerp(
      new THREE.Vector3(lookX, playerPosition[1] + 0.3, lookZ),
      smoothing * 1.5
    );

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);

    // Dynamic FOV
    let targetFov = BASE_FOV;
    if (boosted) targetFov = BOOST_FOV;
    if (isWon) targetFov = WIN_FOV;

    currentFov.current += (targetFov - currentFov.current) * 0.06;
    (camera as THREE.PerspectiveCamera).fov = currentFov.current;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}
