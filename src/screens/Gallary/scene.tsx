import { SpeedWall } from "./speed-wall";
import { ArtworkFrame } from "./artwork-frame";
import { galleryArtworks } from "./data";
import { MovementController } from "./movement-controller";
import { createArtworkLayout } from "./artwork-layout";
import type { GalleryArtwork } from "./types";
import { ProximityDetector } from "./proximity-detector";

type GallerySceneProps = {
  onSelectArtwork: (artwork: GalleryArtwork) => void;
  onNearbyArtworkChange: (artwork: GalleryArtwork | null) => void;
  isFocusMode: boolean;
};

const CORRIDOR_LENGTH = 50;
const WALL_HEIGHT = 6;
const CORRIDOR_WIDTH = 8;

const artworkLayout = createArtworkLayout(galleryArtworks);

export const GalleryScene = ({
  onSelectArtwork,
  onNearbyArtworkChange,
  isFocusMode,
}: GallerySceneProps) => {
  return (
    <>
      <MovementController isDisabled={isFocusMode} />
      <ProximityDetector
        artworks={artworkLayout}
        onNearbyArtworkChange={onNearbyArtworkChange}
      />
      <color attach="background" args={["#050504"]} />

      <fog attach="fog" args={["#050504", 8, 32]} />

      <ambientLight intensity={0.45} />

      <directionalLight position={[0, 4, 6]} intensity={0.65} color="#f4f0e8" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -16]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_LENGTH]} />

        <meshStandardMaterial color="#12110f" roughness={1} />
      </mesh>

      <SpeedWall
        position={[-CORRIDOR_WIDTH / 2, 1.5, -16]}
        rotation={[0, Math.PI / 2, 0]}
        size={[CORRIDOR_LENGTH, WALL_HEIGHT]}
      />

      <SpeedWall
        position={[CORRIDOR_WIDTH / 2, 1.5, -16]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[CORRIDOR_LENGTH, WALL_HEIGHT]}
      />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.2, -16]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_LENGTH]} />

        <meshStandardMaterial color="#090909" roughness={1} />
      </mesh>

      {artworkLayout.map(({ artwork, wallSide, position, rotation }) => (
        <ArtworkFrame
          key={artwork.id}
          artwork={artwork}
          wallSide={wallSide}
          position={position}
          rotation={rotation}
          onSelect={onSelectArtwork}
        />
      ))}
    </>
  );
};
