export type GalleryWallSide = "left" | "right";

/** Shared mobile touch input state — written by MobileControls, read by MovementController */
export type MobileInputState = {
  moveX: number;   // -1 to 1 (strafe left/right)
  moveZ: number;   // -1 to 1 (forward negative, back positive)
  lookDX: number;  // accumulated look delta X — reset each frame
  lookDY: number;  // accumulated look delta Y — reset each frame
};

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
