import type { SpeedGridConfig } from "./types";

export const speedGridConfig = {
  camera: {
    position: [0, 1.2, 6],
    fov: 68,
  },

  walls: {
    distanceFromCenter: 4,
    depth: -30,
    width: 80,
    height: 18,
  },

  colors: {
    background: "#11100d",
    wallBase: "#1a1612",
    wallWire: [0.22, 0.19, 0.15] as [number, number, number],
  },

  drift: {
    strength: 0.55,
    speed: 1.2,
  },
} satisfies SpeedGridConfig;