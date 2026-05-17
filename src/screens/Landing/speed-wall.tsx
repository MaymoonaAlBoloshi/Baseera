import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { DoubleSide, Vector3, type ShaderMaterial } from "three";
import { wallFragmentShader, wallVertexShader } from "./shaders";
import type { SpeedWallProps } from "./types";

export const SpeedWall = ({ position, rotation, config }: SpeedWallProps) => {
  const materialRef = useRef<ShaderMaterial | null>(null);
  const virtualTimeRef = useRef(0);
  const lastRealRef = useRef(0);
  const boostRef = useRef(1);
  const boostRafRef = useRef(0);

  useEffect(() => {
    const handleTransition = () => {
      cancelAnimationFrame(boostRafRef.current);
      boostRef.current = 9;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 4000, 1);
        boostRef.current = 1 + 8 * Math.exp(-t * 5);
        if (t < 1) boostRafRef.current = requestAnimationFrame(tick);
        else boostRef.current = 1;
      };
      boostRafRef.current = requestAnimationFrame(tick);
    };
    window.addEventListener("landing-transition", handleTransition);
    return () => {
      window.removeEventListener("landing-transition", handleTransition);
      cancelAnimationFrame(boostRafRef.current);
    };
  }, []);

  useFrame((state) => {
    const real = state.clock.elapsedTime;
    const delta = real - lastRealRef.current;
    lastRealRef.current = real;
    virtualTimeRef.current += delta * boostRef.current;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = virtualTimeRef.current;
    }
  });

  const { width, height } = config.walls;

  return (
    <group position={position} rotation={rotation}>
      {/* Base — lit by scene lights */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={config.colors.wallBase}
          roughness={1}
          metalness={0}
          side={DoubleSide}
        />
      </mesh>

      {/* Diamond lattice overlay */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={wallVertexShader}
          fragmentShader={wallFragmentShader}
          side={DoubleSide}
          transparent
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-4}
          uniforms={{
            uTime: { value: 0 },
            uAspectRatio: { value: width / height },
            uWireColor: { value: new Vector3(...config.colors.wallWire) },
            uDriftStrength: { value: config.drift.strength },
            uDriftSpeed: { value: config.drift.speed },
            uShadowStrength: { value: 0.03 },
          }}
        />
      </mesh>
    </group>
  );
};
