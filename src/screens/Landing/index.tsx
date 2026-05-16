import { Canvas } from "@react-three/fiber";
import { SpeedGridScene } from "./scene";

export const Landing = () => {
  return (
    <main className="h-screen w-screen bg-black">
      <Canvas camera={{ position: [0, 1.2, 6], fov: 75 }}>
        <SpeedGridScene />
      </Canvas>
    </main>
  );
}