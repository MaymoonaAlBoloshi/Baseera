import { useMemo } from "react";

import { ArtworkFrame } from "./artwork-frame";
import { ArtworkLight } from "./artwork-light";
import { RenderSettings } from "./render-settings";
import { FootstepAudio } from "./footstep-audio";
import { createArtworkLayout } from "./artwork-layout";
import { GalleryFloor } from "./gallery-floor";
import { GalleryWall } from "./gallery-wall";
import { createGalleryMap } from "./map-generator";
import { MovementController } from "./movement-controller";
import { ProximityDetector } from "./proximity-detector";

import type { GalleryArtwork } from "./types";

type GallerySceneProps = {
  seed: string;
  artworks: GalleryArtwork[];
  onSelectArtwork: (artwork: GalleryArtwork) => void;
  onNearbyArtworkChange: (artwork: GalleryArtwork | null) => void;
  isFocusMode: boolean;
};

export const GalleryScene = ({
  seed,
  artworks,
  onSelectArtwork,
  onNearbyArtworkChange,
  isFocusMode,
}: GallerySceneProps) => {
  const galleryMap = useMemo(() => createGalleryMap(seed), [seed]);

  const artworkLayout = useMemo(
    () => createArtworkLayout(artworks, galleryMap.walls),
    [artworks, galleryMap.walls],
  );

  return (
    <>
      <RenderSettings />
      <color attach="background" args={["#050504"]} />
      <fog attach="fog" args={["#050504", 8, 32]} />

      <MovementController isDisabled={isFocusMode} bounds={galleryMap.bounds} />
      <FootstepAudio isMuted={isFocusMode} />

      <ambientLight intensity={0.08} />

      <directionalLight position={[0, 5, 6]} intensity={0.8} color="#f4f0e8" />

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

      {artworkLayout.map(({ artwork, normal, position }) => (
        <ArtworkLight
          key={`${artwork.id}-light`}
          position={position}
          normal={normal}
        />
      ))}

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
