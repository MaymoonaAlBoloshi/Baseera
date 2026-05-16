import { galleryConfig } from "./configs";
import type { GalleryArtwork, GalleryWallSide } from "./types";

export type PositionedArtwork = {
  artwork: GalleryArtwork;
  wallSide: GalleryWallSide;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const createArtworkLayout = (
  artworks: GalleryArtwork[],
): PositionedArtwork[] => {
  return artworks.map((artwork, index) => {
    const wallSide =
      artwork.wallSide ?? (index % 2 === 0 ? "left" : "right");

    const isLeftSide = wallSide === "left";

    const x = isLeftSide
      ? -galleryConfig.artworkLayout.wallOffsetX
      : galleryConfig.artworkLayout.wallOffsetX;

    const z =
      artwork.distanceZ ??
      galleryConfig.artworkLayout.startZ -
        index * galleryConfig.artworkLayout.spacingZ;

    const y =
      artwork.height ?? galleryConfig.artworkLayout.defaultHeight;

    return {
      artwork,
      wallSide,
      position: [x, y, z],
rotation: [0, isLeftSide ? Math.PI / 2 : -Math.PI / 2, 0],    };
  });
};