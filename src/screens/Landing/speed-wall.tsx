import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  speedGridFragmentShader,
  speedGridVertexShader,
} from "./shaders";
import type { SpeedWallProps } from "./types";

const cssColorToVector3 = (cssColor: string) => {
  const color = new THREE.Color(cssColor);

  return new THREE.Vector3(color.r, color.g, color.b);
};

export const SpeedWall = ({
  position,
  rotation,
  config,
}: SpeedWallProps) => {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },

      uSpeed: {
        value: config.movement.speed,
      },

      uDepthDensity: {
        value: config.movement.depthDensity,
      },

      uVerticalDensity: {
        value: config.movement.verticalDensity,
      },

      uDepthThickness: {
        value: config.lines.depthThickness,
      },

      uVerticalThickness: {
        value: config.lines.verticalThickness,
      },

      uWireColor: {
        value: cssColorToVector3(config.colors.wire),
      },

      uFadePower: {
        value: config.perspective.fadePower,
      },

      uGradientStrength: {
        value: config.gradient.strength,
      },
    };
  }, [config]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value =
      clock.elapsedTime;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry
        args={[
          config.walls.width,
          config.walls.height,
          1,
          1,
        ]}
      />

      <shaderMaterial
        ref={materialRef}
        vertexShader={speedGridVertexShader}
        fragmentShader={speedGridFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};