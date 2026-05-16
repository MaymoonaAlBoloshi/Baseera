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

export type GallerySelectedArtwork = GalleryArtwork | null;
export type GalleryNearbyArtwork = GalleryArtwork | null;