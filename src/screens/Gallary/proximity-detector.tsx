import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";

import type { PositionedArtwork } from "./artwork-layout";
import type { GalleryArtwork } from "./types";

type ProximityDetectorProps = {
  artworks: PositionedArtwork[];
  onNearbyArtworkChange: (artwork: GalleryArtwork | null) => void;
};

const NEARBY_DISTANCE = 5;
const FACING_THRESHOLD = 0.35; // cos(~70°) — must be broadly facing the artwork

const _toArtwork = new Vector3();
const _cameraDir = new Vector3();

export const ProximityDetector = ({
  artworks,
  onNearbyArtworkChange,
}: ProximityDetectorProps) => {
  const { camera } = useThree();
  const activeArtworkIdRef = useRef<string | null>(null);

  useFrame(() => {
    camera.getWorldDirection(_cameraDir);

    const nearbyArtwork = artworks.find(({ position }) => {
      const [x, y, z] = position;

      const distance = camera.position.distanceTo({ x, y, z });
      if (distance > NEARBY_DISTANCE) return false;

      // Check that camera is roughly facing the artwork
      _toArtwork
        .set(x - camera.position.x, 0, z - camera.position.z)
        .normalize();
      const dot = _cameraDir.x * _toArtwork.x + _cameraDir.z * _toArtwork.z;

      return dot >= FACING_THRESHOLD;
    });

    const nextArtworkId = nearbyArtwork?.artwork.id ?? null;

    if (activeArtworkIdRef.current === nextArtworkId) {
      return;
    }

    activeArtworkIdRef.current = nextArtworkId;
    onNearbyArtworkChange(nearbyArtwork?.artwork ?? null);
  });

  return null;
};
