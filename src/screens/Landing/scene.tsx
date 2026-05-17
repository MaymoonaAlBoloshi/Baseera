import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { PointLight } from "three";
import { speedGridConfig } from "./configs";
import { SpeedWall } from "./speed-wall";

// Slow sine-wave camera breathe — feels like you're standing in the space
const CameraRig = () => {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.y = 1.2 + Math.sin(t * 0.32) * 0.05;
    state.camera.position.x = Math.sin(t * 0.17) * 0.07;
  });
  return null;
};

// Warm light that slowly pulses, washing the corridor walls amber
const CorridorLight = () => {
  const ref = useRef<PointLight>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.intensity = 0.55 + Math.sin(t * 0.38) * 0.18;
  });
  return (
    <pointLight
      ref={ref}
      position={[0, 2.5, -4]}
      color="#f4a030"
      distance={28}
      decay={1.6}
    />
  );
};

export const LandingScene = () => {
  const { walls, colors } = speedGridConfig;

  return (
    <>
      <color attach="background" args={[colors.background]} />
      <fog attach="fog" args={[colors.background, 6, 38]} />

      <ambientLight intensity={0.08} color="#f4e8cc" />
      <directionalLight position={[0, 6, 4]} intensity={0.3} color="#f4f0e8" />

      <CameraRig />
      <CorridorLight />

      {/* Left wall */}
      <SpeedWall
        config={speedGridConfig}
        position={[-walls.distanceFromCenter, 0, walls.depth]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Right wall */}
      <SpeedWall
        config={speedGridConfig}
        position={[walls.distanceFromCenter, 0, walls.depth]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -10]}>
        <planeGeometry args={[12, 60]} />
        <meshStandardMaterial
          color="#080706"
          roughness={0.25}
          metalness={0.5}
        />
      </mesh>

      {/* Ceiling — dark, just enough to close the space */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, -10]}>
        <planeGeometry args={[12, 60]} />
        <meshStandardMaterial color="#060504" roughness={1} metalness={0} />
      </mesh>

      {/* Floating dust — very sparse, barely visible */}
      <Sparkles
        count={120}
        scale={[9, 7, 28]}
        size={0.7}
        speed={0.015}
        opacity={0.18}
        color="#f4e8cc"
        noise={1.5}
      />
    </>
  );
};
