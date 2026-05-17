import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DoubleSide, Vector3, type ShaderMaterial } from "three";
import { wallFragmentShader, wallVertexShader } from "./shaders";
import type { SpeedWallProps } from "./types";

export const SpeedWall = ({ position, rotation, config }: SpeedWallProps) => {
  const materialRef = useRef<ShaderMaterial | null>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
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
