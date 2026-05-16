import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

import type { PositionedArtwork } from "./artwork-layout";
import type { GalleryArtwork } from "./types";

type ProximityDetectorProps = {
  artworks: PositionedArtwork[];
  onNearbyArtworkChange: (artwork: GalleryArtwork | null) => void;
};

const NEARBY_DISTANCE = 5;

export const ProximityDetector = ({
  artworks,
  onNearbyArtworkChange,
}: ProximityDetectorProps) => {
  const { camera } = useThree();
  const activeArtworkIdRef = useRef<string | null>(null);

  useFrame(() => {
    const nearbyArtwork = artworks.find(({ position }) => {
      const [x, y, z] = position;

      const distance = camera.position.distanceTo({
        x,
        y,
        z,
      });

      return distance <= NEARBY_DISTANCE;
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
