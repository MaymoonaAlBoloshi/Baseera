import { useMemo } from "react";

import type { ArtistGalleryConfig } from "./configs";
import type { GalleryWallSegment } from "./map-generator";
import { SpeedWall } from "./speed-wall";

type GalleryWallProps = {
  wall: GalleryWallSegment;
  artistConfig: ArtistGalleryConfig;
};

export const GalleryWall = ({ wall, artistConfig }: GalleryWallProps) => {
  const { position, size, rotationY } = useMemo(() => {
    const centerX = (wall.start.x + wall.end.x) / 2;
    const centerZ = (wall.start.z + wall.end.z) / 2;
    const centerY = wall.height / 2;

    const dx = wall.end.x - wall.start.x;
    const dz = wall.end.z - wall.start.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    // Rotate the plane to face the wall's inward normal
    const rotY = Math.atan2(wall.normal.x, wall.normal.z);

    return {
      position: [centerX, centerY, centerZ] as [number, number, number],
      size: [length, wall.height] as [number, number],
      rotationY: rotY,
    };
  }, [wall]);

  return (
    <SpeedWall
      position={position}
      rotation={[0, rotationY, 0]}
      size={size}
      wallBaseColor={artistConfig.wallBaseColor}
      wallWireColor={artistConfig.wallWireColor}
      driftStrength={artistConfig.driftStrength}
      driftSpeed={artistConfig.driftSpeed}
    />
  );
};
