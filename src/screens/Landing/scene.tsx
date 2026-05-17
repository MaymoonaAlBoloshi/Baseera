import { speedGridConfig } from "./configs";
import { SpeedWall } from "./speed-wall";

export const LandingScene = () => {
  const { walls, colors } = speedGridConfig;

  return (
    <>
      <color attach="background" args={[colors.background]} />
      <fog attach="fog" args={[colors.background, 10, 45]} />

      <ambientLight intensity={0.12} color="#f4e8cc" />
      <directionalLight position={[0, 6, 4]} intensity={0.6} color="#f4f0e8" />

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
