import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { ShaderMaterial } from "three";

import type { ArtistGalleryConfig } from "./configs";
import type { GalleryFloorSegment } from "./map-generator";
import {
  ceilingFragmentShader,
  ceilingVertexShader,
  floorFragmentShader,
  floorVertexShader,
} from "./shaders";

type GalleryFloorProps = {
  floor: GalleryFloorSegment;
  artistConfig: ArtistGalleryConfig;
};

export const GalleryFloor = ({ floor, artistConfig }: GalleryFloorProps) => {
  const overlayRef = useRef<ShaderMaterial | null>(null);
  const isCeiling = floor.id.includes("ceiling");
  const aspectRatio = floor.size[0] / floor.size[1];

  useFrame((state) => {
    if (overlayRef.current) {
      overlayRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group rotation={floor.rotation} position={floor.position}>
      {/* Base — receives ambient, directional and rectAreaLights */}
      <mesh>
        <planeGeometry args={[floor.size[0], floor.size[1]]} />
        <meshStandardMaterial
          color={
            isCeiling
              ? artistConfig.ceilingBaseColor
              : artistConfig.floorBaseColor
          }
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Pattern overlay — transparent, no lighting */}
      <mesh>
        <planeGeometry args={[floor.size[0], floor.size[1]]} />
        <shaderMaterial
          ref={overlayRef}
          vertexShader={isCeiling ? ceilingVertexShader : floorVertexShader}
          fragmentShader={
            isCeiling ? ceilingFragmentShader : floorFragmentShader
          }
          transparent
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-4}
          uniforms={{
            uTime: { value: 0 },
            uAspectRatio: { value: aspectRatio },
          }}
        />
      </mesh>
    </group>
  );
};
