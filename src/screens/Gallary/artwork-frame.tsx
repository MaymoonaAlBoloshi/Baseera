import { useTexture } from "@react-three/drei";

import type { GalleryArtwork, GalleryWallSide } from "./types";

type ArtworkFrameProps = {
  artwork: GalleryArtwork;
  wallSide: GalleryWallSide;
  position: [number, number, number];
  rotation?: [number, number, number];
};

export const ArtworkFrame = ({
  artwork,
  wallSide,
  position,
  rotation,
}: ArtworkFrameProps) => {
  const texture = useTexture(artwork.imageSrc);

const depthDirection = 1;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.12 * depthDirection]}>
        <boxGeometry args={[2.45, 3.25, 0.18]} />
        <meshStandardMaterial color="#15120f" roughness={1} />
      </mesh>

      <mesh position={[0, 0, -0.02 * depthDirection]}>
        <boxGeometry args={[2.35, 3.15, 0.12]} />
        <meshStandardMaterial color="#211d17" roughness={1} />
      </mesh>

      <mesh position={[0, 0, 0.055 * depthDirection]}>
        <planeGeometry args={[2, 2.8]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>

      <mesh position={[0, 0, -0.16 * depthDirection]}>
        <planeGeometry args={[2.9, 3.7]} />
        <meshBasicMaterial color="#2b241d" transparent opacity={0.22} />
      </mesh>
    </group>
  );
};