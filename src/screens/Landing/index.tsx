import { Canvas } from "@react-three/fiber";
import { speedGridConfig } from "./configs";
import { LandingScene} from "./scene";

export const Landing = () => {
  return (
    <main className="h-screen w-screen bg-black">
      <Canvas
        camera={{
          position: speedGridConfig.camera.position,
          fov: speedGridConfig.camera.fov,
        }}
      >
        <LandingScene />
      </Canvas>
    </main>
  );
}