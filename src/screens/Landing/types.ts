export type Vector3Tuple = [number, number, number];

export type SpeedWallProps = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  width?: number;
  height?: number;
  speed?: number;
};