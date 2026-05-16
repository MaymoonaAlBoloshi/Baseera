import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  speedGridFragmentShader,
  speedGridVertexShader,
} from "./shaders";
import type { SpeedWallProps } from "./types";

export function SpeedWall({
  position,
  rotation,
  width = 12,
  height = 60,
  speed = 8,
}: SpeedWallProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
    }),
    [speed],
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={speedGridVertexShader}
        fragmentShader={speedGridFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}