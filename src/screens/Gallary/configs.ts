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

  scene: {
    backgroundColor: "var(--color-gallery-background)",
    fogColor: "var(--color-gallery-background)",
    fogNear: 8,
    fogFar: 32,
  },

  corridor: {
    width: 8,
    length: 50,
    wallHeight: 6,
    centerZ: -16,
  },

  walls: {
    driftStrength: 0.08,
    driftSpeed: 0.08,
    shadowStrength: 0.03,
  },

  movement: {
    moveSpeed: 0.032,
    lookDistance: 8,
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