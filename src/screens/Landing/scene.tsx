import { SpeedWall } from "./speed-walls";

export function SpeedGridScene() {
  return (
    <>
      <color attach="background" args={["#02030a"]} />

      <SpeedWall
        position={[-4, 1, -12]}
        rotation={[0, Math.PI / 2.7, 0]}
      />

      <SpeedWall
        position={[4, 1, -12]}
        rotation={[0, -Math.PI / 2.7, 0]}
      />
    </>
  );
}