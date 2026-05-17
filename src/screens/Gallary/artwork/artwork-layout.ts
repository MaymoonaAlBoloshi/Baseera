import { galleryConfig } from "../configs";
import type { GalleryPoint, GalleryWallSegment } from "../map-generator";
import type { GalleryArtwork } from "../types";

export type PositionedArtwork = {
  artwork: GalleryArtwork;
  wallId: string;
  normal: GalleryPoint;
  position: [number, number, number];
  rotation: [number, number, number];
};

const WALL_PADDING = 2;
const WALL_OFFSET = 0.08;

export const createArtworkLayout = (
  artworks: GalleryArtwork[],
  walls: GalleryWallSegment[],
): PositionedArtwork[] => {
  const validWalls = walls.filter((wall) => {
    const deltaX = wall.end.x - wall.start.x;
    const deltaZ = wall.end.z - wall.start.z;

    const length = Math.sqrt(deltaX ** 2 + deltaZ ** 2);

    return length >= 8;
  });

  return artworks.map((artwork, index) => {
    const wall = validWalls[index % validWalls.length];

    const deltaX = wall.end.x - wall.start.x;
    const deltaZ = wall.end.z - wall.start.z;

    const length = Math.sqrt(deltaX ** 2 + deltaZ ** 2);

    const directionX = deltaX / length;
    const directionZ = deltaZ / length;

    const usableLength = length - WALL_PADDING * 2;

    const offset =
      WALL_PADDING + ((index % 3) / 2) * usableLength;

    const wallX = wall.start.x + directionX * offset;
    const wallZ = wall.start.z + directionZ * offset;

    const positionX = wallX + wall.normal.x * WALL_OFFSET;
    const positionZ = wallZ + wall.normal.z * WALL_OFFSET;

    const rotationY = Math.atan2(wall.normal.x, wall.normal.z);

    return {
      artwork,
      wallId: wall.id,
      normal: wall.normal,
      position: [
        positionX,
        galleryConfig.artworkLayout.defaultHeight,
        positionZ,
      ],
      rotation: [0, rotationY, 0],
    };
  });
};