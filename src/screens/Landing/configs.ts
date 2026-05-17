import type { SpeedGridConfig } from "./types";

export const speedGridConfig = {
  camera: {
    position: [0, 1.2, 6],
    fov: 55,
  },

  walls: {
    distanceFromCenter: 5,
    depth: -30,
    width: 80,
    height: 14,
  },

  colors: {
    background: "#050504",
    wallBase: "#0d0b09",
    wallWire: [0.13, 0.115, 0.098] as [number, number, number],
  },

  drift: {
    strength: 0.55,
    speed: 1.2,
  },
} satisfies SpeedGridConfig;