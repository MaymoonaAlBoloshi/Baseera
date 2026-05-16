import { speedGridConfig } from "./configs";
import { SpeedWall } from "./speed-wall";

export const LandingScene = () => {
  const { walls, colors } = speedGridConfig;

  return (
    <>
      <color attach="background" args={[colors.background]} />

      <SpeedWall
        config={speedGridConfig}
        position={[-walls.distanceFromCenter, 0, walls.depth]}
        rotation={[0, Math.PI / 2, 0]}
      />

      <SpeedWall
        config={speedGridConfig}
        position={[walls.distanceFromCenter, 0, walls.depth]}
        rotation={[0, Math.PI / 2, 0]}
      />
    </>
  );
};