import * as THREE from "three";

import { galleryConfig } from "../configs";
import type { PositionedArtwork } from "./artwork-layout";

export const CHARACTER_MODEL_PATH = "/models/man.fbx";
export const ENTRY_DURATION = 0.55;

const PROXIMITY_NEAR = 1.1;
const PROXIMITY_FAR = Math.max(
  PROXIMITY_NEAR + 0.1,
  galleryConfig.proximity.nearbyDistance,
);

export const getProximityFigureTransform = (target: PositionedArtwork) => {
  const [x, , z] = target.position;
  const px = x + target.normal.x * 1.05;
  const pz = z + target.normal.z * 1.05;
  const rotationY = Math.atan2(-target.normal.x, -target.normal.z);

  return { px, pz, rotationY };
};

export const getProximityEmissionGain = ({
  target,
  camera,
  probe,
}: {
  target: PositionedArtwork;
  camera: THREE.Camera;
  probe: THREE.Vector3;
}) => {
  const { px, pz } = getProximityFigureTransform(target);
  probe.set(px, 0.9, pz);

  const dist = camera.position.distanceTo(probe);
  const t =
    1 -
    Math.max(
      0,
      Math.min(1, (dist - PROXIMITY_NEAR) / (PROXIMITY_FAR - PROXIMITY_NEAR)),
    );
  const smoothT = t * t * (3 - 2 * t);

  return 0.65 + smoothT * 1.35;
};
