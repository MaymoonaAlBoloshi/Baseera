import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { ShaderMaterial } from "three";

import { galleryConfig } from "./configs";
import {
  wallFragmentShader,
  wallVertexShader,
} from "./shaders";

type SpeedWallProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
};

export const SpeedWall = ({
  position,
  rotation,
  size,
}: SpeedWallProps) => {
  const materialRef = useRef<ShaderMaterial | null>(null);

  useFrame((state) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value =
      state.clock.elapsedTime;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size[0], size[1], 80, 16]} />

      <shaderMaterial
        ref={materialRef}
        vertexShader={wallVertexShader}
        fragmentShader={wallFragmentShader}
        uniforms={{
          uTime: {
            value: 0,
          },
          uDriftStrength: {
            value: galleryConfig.walls.driftStrength,
          },
          uDriftSpeed: {
            value: galleryConfig.walls.driftSpeed,
          },
          uShadowStrength: {
            value: galleryConfig.walls.shadowStrength,
          },
        }}
      />
    </mesh>
  );
};