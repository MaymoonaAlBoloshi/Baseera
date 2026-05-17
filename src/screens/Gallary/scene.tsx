import { useMemo } from "react";
import type { MutableRefObject } from "react";

import { ArtworkFrame } from "./artwork/artwork-frame";
import { ArtworkLight } from "./artwork/artwork-light";
import { GalleryScreen } from "./environment/gallery-screen";
import { RenderSettings } from "./render-settings";
import { FootstepAudio } from "./audio/footstep-audio";
import { createArtworkLayout } from "./artwork/artwork-layout";
import { GalleryFloor } from "./environment/gallery-floor";
import { GalleryWall } from "./environment/gallery-wall";
import { LightAudience } from "./environment/light-audience";
import { createGalleryMap } from "./map-generator";
import { MovementController } from "./controls/movement-controller";
import { ProximityDetector } from "./artwork/proximity-detector";

import type { ArtistGalleryConfig } from "./configs";
import type { GalleryArtwork, MobileInputState } from "./types";

type GallerySceneProps = {
  seed: string;
  artworks: GalleryArtwork[];
  artistConfig: ArtistGalleryConfig;
  isMobile: boolean;
  mobileInputRef: MutableRefObject<MobileInputState>;
  showScreen: boolean;
  audioIframeRef: MutableRefObject<HTMLIFrameElement | null>;
  onSelectArtwork: (artwork: GalleryArtwork) => void;
  onNearbyArtworkChange: (artwork: GalleryArtwork | null) => void;
  isFocusMode: boolean;
  audioEnabled: boolean;
  brightness: number;
};

export const GalleryScene = ({
  seed,
  artworks,
  artistConfig,
  isMobile,
  mobileInputRef,
  showScreen,
  audioIframeRef,
  onSelectArtwork,
  onNearbyArtworkChange,
  isFocusMode,
  audioEnabled,
  brightness,
}: GallerySceneProps) => {
  const galleryMap = useMemo(() => createGalleryMap(seed), [seed]);

  // When the back-wall installation is visible, exclude the back wall from
  // artwork placement so nothing hangs behind the radio plinth.
  const layoutWalls = useMemo(
    () =>
      showScreen
        ? galleryMap.walls.filter((w) => w.id !== "gallery-back")
        : galleryMap.walls,
    [galleryMap.walls, showScreen],
  );

  const artworkLayout = useMemo(
    () => createArtworkLayout(artworks, layoutWalls),
    [artworks, layoutWalls],
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
      <FootstepAudio isMuted={isFocusMode || !audioEnabled} />

      <LightAudience artworkPositions={artworkLayout.map((a) => a.position)} />

      <ambientLight
        intensity={artistConfig.ambientIntensity * brightness}
        color={artistConfig.ambientColor}
      />

      <directionalLight
        position={[0, 5, 6]}
        intensity={artistConfig.directionalIntensity * brightness}
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

      {showScreen && (
        <GalleryScreen
          backWallZ={galleryMap.backWallZ}
          iframeRef={audioIframeRef}
        />
      )}
    </>
  );
};
