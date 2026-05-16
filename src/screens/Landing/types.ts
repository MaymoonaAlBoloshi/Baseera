import { landingSteps } from "./data";

export type Vector3Tuple = [number, number, number];

export type SpeedGridConfig = {
  camera: {
    position: Vector3Tuple;
    fov: number;
  };

  walls: {
    distanceFromCenter: number;
    depth: number;
    width: number;
    height: number;
  };

  movement: {
    speed: number;
    depthDensity: number;
    verticalDensity: number;
  };

  lines: {
    depthThickness: number;
    verticalThickness: number;
  };

  colors: {
    background: string;
    wire: string;
  };

  perspective: {
    fadePower: number;
  };

  gradient: {
    strength: number;
  };
};

export type SpeedWallProps = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  config: SpeedGridConfig;
};

export type LandingStep = (typeof landingSteps)[number];