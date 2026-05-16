export type ArtistGalleryConfig = {
  fogColor: string;
  fogNear: number;
  fogFar: number;
  backgroundColor: string;
  ambientIntensity: number;
  ambientColor: string;
  directionalColor: string;
  directionalIntensity: number;
  wallBaseColor: string;
  /** RGB in 0–1 range for the diamond lattice wire tint */
  wallWireColor: [number, number, number];
  floorBaseColor: string;
  ceilingBaseColor: string;
  artworkLightColor: string;
  driftStrength: number;
  driftSpeed: number;
};

export const defaultArtistConfig: ArtistGalleryConfig = {
  fogColor: "#050504",
  fogNear: 8,
  fogFar: 32,
  backgroundColor: "#050504",
  ambientIntensity: 0.08,
  ambientColor: "#ffffff",
  directionalColor: "#f4f0e8",
  directionalIntensity: 0.8,
  wallBaseColor: "#0d0b09",
  wallWireColor: [0.13, 0.115, 0.098],
  floorBaseColor: "#0d0b09",
  ceilingBaseColor: "#060504",
  artworkLightColor: "#ffe6b8",
  driftStrength: 0.48,
  driftSpeed: 0.07,
};

const artistGalleryConfigs: Record<string, Partial<ArtistGalleryConfig>> = {
  // Noor Al-Rashid — warm amber, intimate warmth
  "silent-door": {
    fogColor: "#070503",
    backgroundColor: "#070503",
    wallBaseColor: "#0f0c08",
    wallWireColor: [0.16, 0.12, 0.07],
    floorBaseColor: "#0f0c08",
    artworkLightColor: "#ffd077",
    ambientColor: "#ffe0a0",
  },

  // Leila Voss — cold ash, northern light
  "ashen-field": {
    fogColor: "#060810",
    fogNear: 6,
    fogFar: 22,
    backgroundColor: "#060810",
    wallBaseColor: "#090c12",
    wallWireColor: [0.08, 0.09, 0.13],
    floorBaseColor: "#090c12",
    ceilingBaseColor: "#050710",
    artworkLightColor: "#cce0ff",
    ambientColor: "#c0d0ff",
    directionalColor: "#d8e8ff",
    directionalIntensity: 0.6,
  },

  // Tariq Henson — deep violet, psychological weight
  "mirror-weight": {
    fogColor: "#07050f",
    fogNear: 7,
    fogFar: 28,
    backgroundColor: "#07050f",
    wallBaseColor: "#0d0a12",
    wallWireColor: [0.11, 0.07, 0.16],
    floorBaseColor: "#0a0810",
    ceilingBaseColor: "#060410",
    artworkLightColor: "#ddc8ff",
    ambientColor: "#c0a0ff",
    ambientIntensity: 0.06,
    directionalColor: "#e0d0ff",
    directionalIntensity: 0.7,
    driftStrength: 0.52,
  },

  // Amara Osei — teal/mineral, expansive calm
  "blue-departure": {
    fogColor: "#030d0c",
    fogNear: 7,
    fogFar: 26,
    backgroundColor: "#030d0c",
    wallBaseColor: "#060f0e",
    wallWireColor: [0.06, 0.12, 0.11],
    floorBaseColor: "#060f0e",
    ceilingBaseColor: "#040c0a",
    artworkLightColor: "#90ffda",
    ambientColor: "#90ffcc",
    ambientIntensity: 0.06,
    directionalColor: "#c0fff0",
    directionalIntensity: 0.65,
  },

  // Selin Çelik — dusty rose/burgundy, intimate & warm
  "the-weight-of-rooms": {
    fogColor: "#0c0608",
    backgroundColor: "#0c0608",
    wallBaseColor: "#120a0d",
    wallWireColor: [0.15, 0.07, 0.09],
    floorBaseColor: "#120a0d",
    ceilingBaseColor: "#090508",
    artworkLightColor: "#ffbbd4",
    ambientColor: "#ffb0c8",
    ambientIntensity: 0.07,
    directionalColor: "#ffe0ec",
    driftStrength: 0.44,
  },

  // Marcus Frei — cold steel, geometric precision
  "orbit-of-grief": {
    fogColor: "#050508",
    fogNear: 5,
    fogFar: 20,
    backgroundColor: "#050508",
    wallBaseColor: "#0a0a0e",
    wallWireColor: [0.14, 0.14, 0.17],
    floorBaseColor: "#0a0a0e",
    ceilingBaseColor: "#060609",
    artworkLightColor: "#e8eeff",
    ambientColor: "#d8deff",
    ambientIntensity: 0.12,
    directionalColor: "#e0e4ff",
    directionalIntensity: 1.0,
    driftStrength: 0.3,
    driftSpeed: 0.05,
  },

  // Yuki Tanabe — pale ivory/archive, quiet contemplation
  "pale-archive": {
    fogColor: "#0c0b08",
    fogNear: 8,
    fogFar: 34,
    backgroundColor: "#0c0b08",
    wallBaseColor: "#141210",
    wallWireColor: [0.20, 0.17, 0.13],
    floorBaseColor: "#141210",
    ceilingBaseColor: "#0a0906",
    artworkLightColor: "#fff8e0",
    ambientColor: "#fff0cc",
    ambientIntensity: 0.14,
    directionalColor: "#fff8e8",
    directionalIntensity: 0.9,
    driftStrength: 0.38,
  },

  // Daria Molnár — digital cyan, electric atmosphere
  "threshold-song": {
    fogColor: "#030c0d",
    fogNear: 5,
    fogFar: 22,
    backgroundColor: "#030c0d",
    wallBaseColor: "#050f10",
    wallWireColor: [0.05, 0.16, 0.17],
    floorBaseColor: "#050f10",
    ceilingBaseColor: "#030b0c",
    artworkLightColor: "#7affff",
    ambientColor: "#60ffee",
    ambientIntensity: 0.07,
    directionalColor: "#b0ffff",
    directionalIntensity: 0.65,
    driftStrength: 0.6,
    driftSpeed: 0.10,
  },

  // Ravi Menon — deep ocean, still & meditative
  "still-water-hour": {
    fogColor: "#030409",
    fogNear: 7,
    fogFar: 28,
    backgroundColor: "#030409",
    wallBaseColor: "#080a12",
    wallWireColor: [0.07, 0.08, 0.16],
    floorBaseColor: "#080a12",
    ceilingBaseColor: "#04060e",
    artworkLightColor: "#b0ccff",
    ambientColor: "#8aaaff",
    ambientIntensity: 0.06,
    directionalColor: "#c0d4ff",
    directionalIntensity: 0.7,
    driftStrength: 0.45,
    driftSpeed: 0.06,
  },
};

export function getArtistConfig(artworkId: string): ArtistGalleryConfig {
  const overrides = artistGalleryConfigs[artworkId] ?? {};
  return { ...defaultArtistConfig, ...overrides };
}

export const galleryConfig = {
  camera: {
    position: [0, 1.6, 6] as const,
    fov: 45,
  },

  artworkLayout: {
    wallOffsetX: 3.95,
    startZ: -8,
    spacingZ: 8,
    defaultHeight: 2.2,
  },

  artworkLighting: {
    color: "#ffe6b8",
    intensity: 1.5,
    width: 3.2,
    height: 4.2,
    offsetFromWall: 1.2,
    heightOffset: 0.8,
    proximityDistance: 12,
    fadeSpeed: 0.18,
  },

  scene: {
    backgroundColor: "var(--color-gallery-background)",
    fogColor: "var(--color-gallery-background)",
    fogNear: 6,
    fogFar: 20,
  },

  corridor: {
    width: 8,
    length: 50,
    wallHeight: 6,
    centerZ: -16,
  },

  walls: {
    driftStrength: 0.48,
    driftSpeed: 0.07,
    shadowStrength: 0.03,
  },

  proximity: {
    nearbyDistance: 5,
    facingThreshold: 0.35,
  },

  rendering: {
    toneMappingExposure: 0.9,
  },

  audio: {
    footstepVolume: 0.9,
    footstepPlaybackRate: 1.0,
    movementThreshold: 0.0015,
    fadeInSpeed: 0.10,
    fadeOutSpeed: 0.04,
  },

  music: {
    volume: 0.22,
    fadeInDuration: 3.0,
  },

  movement: {
    moveSpeed: 0.012,
    lookDistance: 5,
    cameraHeight: 1.6,
    positionDamping: 0.06,
    lookRangeX: 82,
    lookRangeY: 4,

    lookSensitivityX: 0.0028,
    lookSensitivityY: 0.0018,
    minPitch: -0.7,
    maxPitch: 0.55,
  },
} as const;