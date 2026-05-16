import { useMemo } from "react";

import { GalleryFloor } from "./gallery-floor";
import { GalleryWall } from "./gallery-wall";
import { createArtworkLayout } from "./artwork-layout";
import { ArtworkFrame } from "./artwork-frame";
import { galleryArtworks } from "./data";
import { createGalleryMap } from "./map-generator";
import { MovementController } from "./movement-controller";
import { ProximityDetector } from "./proximity-detector";

import type { GalleryArtwork } from "./types";

type GallerySceneProps = {
  seed: string;
  onSelectArtwork: (artwork: GalleryArtwork) => void;
  onNearbyArtworkChange: (artwork: GalleryArtwork | null) => void;
  isFocusMode: boolean;
};

export const GalleryScene = ({
  seed,
  onSelectArtwork,
  onNearbyArtworkChange,
  isFocusMode,
}: GallerySceneProps) => {
  const galleryMap = useMemo(() => createGalleryMap(seed), [seed]);

  const artworkLayout = useMemo(
    () => createArtworkLayout(galleryArtworks, galleryMap.walls),
    [galleryMap.walls],
  );

  return (
    <>
      <color attach="background" args={["#050504"]} />
      <fog attach="fog" args={["#050504", 8, 32]} />

      <MovementController isDisabled={isFocusMode} bounds={galleryMap.bounds} />

      <ambientLight intensity={0.45} />

      <directionalLight position={[0, 4, 6]} intensity={0.65} color="#f4f0e8" />

      {galleryMap.floors.map((floor) => (
        <GalleryFloor key={floor.id} floor={floor} />
      ))}

      {galleryMap.walls.map((wall) => (
        <GalleryWall key={wall.id} wall={wall} />
      ))}

      <ProximityDetector
        artworks={artworkLayout}
        onNearbyArtworkChange={onNearbyArtworkChange}
      />

      {artworkLayout.map(({ artwork, position, rotation }) => (
        <ArtworkFrame
          key={artwork.id}
          artwork={artwork}
          position={position}
          rotation={rotation}
          onSelect={onSelectArtwork}
        />
      ))}
    </>
  );
};
