import { useMemo } from "react";
import type { MutableRefObject } from "react";

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

import type { ArtistGalleryConfig } from "./configs";
import type { GalleryArtwork, MobileInputState } from "./types";

type GallerySceneProps = {
  seed: string;
  artworks: GalleryArtwork[];
  artistConfig: ArtistGalleryConfig;
  isMobile: boolean;
  mobileInputRef: MutableRefObject<MobileInputState>;
  onSelectArtwork: (artwork: GalleryArtwork) => void;
  onNearbyArtworkChange: (artwork: GalleryArtwork | null) => void;
  isFocusMode: boolean;
};

export const GalleryScene = ({
  seed,
  artworks,
  artistConfig,
  isMobile,
  mobileInputRef,
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
      <color attach="background" args={[artistConfig.backgroundColor]} />
      <fog
        attach="fog"
        args={[
          artistConfig.fogColor,
          artistConfig.fogNear,
          artistConfig.fogFar,
        ]}
      />

      <MovementController
        isDisabled={isFocusMode}
        bounds={galleryMap.bounds}
        isMobile={isMobile}
        mobileInputRef={mobileInputRef}
      />
      <FootstepAudio isMuted={isFocusMode} />

      <ambientLight
        intensity={artistConfig.ambientIntensity}
        color={artistConfig.ambientColor}
      />

      <directionalLight
        position={[0, 5, 6]}
        intensity={artistConfig.directionalIntensity}
        color={artistConfig.directionalColor}
      />

      {galleryMap.floors.map((floor) => (
        <GalleryFloor
          key={floor.id}
          floor={floor}
          artistConfig={artistConfig}
        />
      ))}

      {galleryMap.walls.map((wall) => (
        <GalleryWall key={wall.id} wall={wall} artistConfig={artistConfig} />
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
          color={artistConfig.artworkLightColor}
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
