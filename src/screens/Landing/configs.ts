import type { SpeedGridConfig } from "./types";

export const speedGridConfig = {
  camera: {
    position: [0, 1.2, 6],
    fov: 75,
  },

  walls: {
    distanceFromCenter: 6,
    depth: -40,
    width: 120,
    height: 20,
  },

  movement: {
    speed: 1.2,
    depthDensity: 35,
    verticalDensity: 8,
  },

  lines: {
    depthThickness: 0.02,
    verticalThickness: 0.01,
  },

  colors: {
    background: "#050505",
    wire: "#6d6d76",
  },

  perspective: {
    fadePower: 2.5,
  },

  gradient: {
    strength: 0.45,
  },
} satisfies SpeedGridConfig;