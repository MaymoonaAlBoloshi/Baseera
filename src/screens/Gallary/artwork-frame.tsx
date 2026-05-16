import { useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { SRGBColorSpace } from "three";

import type { GalleryArtwork } from "./types";

type ArtworkFrameProps = {
  artwork: GalleryArtwork;
  position: [number, number, number];
  rotation?: [number, number, number];
  onSelect: (artwork: GalleryArtwork) => void;
};

export const ArtworkFrame = ({
  artwork,
  position,
  rotation,
  onSelect,
}: ArtworkFrameProps) => {
  const texture = useTexture(artwork.imageSrc);

  texture.colorSpace = SRGBColorSpace;

  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(artwork);
  };

  return (
    <group position={position} rotation={rotation} onClick={handleSelect}>
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[2.45, 3.25, 0.18]} />
        <meshStandardMaterial color="#15120f" roughness={0.85} />
      </mesh>

      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.35, 3.15, 0.12]} />
        <meshStandardMaterial color="#211d17" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[2, 2.8]} />
        <meshStandardMaterial map={texture} roughness={0.7} />
      </mesh>
    </group>
  );
};
