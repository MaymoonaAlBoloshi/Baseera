import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DoubleSide, type ShaderMaterial } from "three";

import { galleryConfig } from "./configs";
import { wallFragmentShader, wallVertexShader } from "./shaders";

type SpeedWallProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
};

export const SpeedWall = ({ position, rotation, size }: SpeedWallProps) => {
  const materialRef = useRef<ShaderMaterial | null>(null);

  useFrame((state) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Base — receives ambient, directional and rectAreaLights */}
      <mesh>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial
          color="#0d0b09"
          roughness={1}
          metalness={0}
          side={DoubleSide}
        />
      </mesh>

      {/* Diamond lattice overlay — transparent, no lighting */}
      <mesh>
        <planeGeometry args={[size[0], size[1]]} />
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
            uAspectRatio: { value: size[0] / size[1] },
            uDriftStrength: { value: galleryConfig.walls.driftStrength },
            uDriftSpeed: { value: galleryConfig.walls.driftSpeed },
            uShadowStrength: { value: galleryConfig.walls.shadowStrength },
          }}
        />
      </mesh>
    </group>
  );
};
