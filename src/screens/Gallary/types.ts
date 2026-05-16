export type GalleryWallSide = "left" | "right";

export type GalleryArtwork = {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  poem: string;
  wallSide?: GalleryWallSide;
  distanceZ?: number;
  height?: number;
};