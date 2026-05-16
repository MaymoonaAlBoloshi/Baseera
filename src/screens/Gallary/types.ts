export type GalleryWallSide = "left" | "right";

export type GalleryArtist = {
  name: string;
  style: string;
  followers: string;
  supporters: string;
  visitors: string;
};

export type GalleryArtwork = {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  poem: string;
  artist: GalleryArtist;
  medium: string;
  dimensions: string;
  year: number;
  likes?: string;
  comments?: string;
  wallSide?: GalleryWallSide;
  distanceZ?: number;
  height?: number;
};

export type GallerySelectedArtwork = GalleryArtwork | null;
export type GalleryNearbyArtwork = GalleryArtwork | null;

export type GalleryView =
  | { mode: "selection" }
  | { mode: "artist"; artworkId: string };
