import { useEffect, useRef } from "react";
import { RectAreaLight, Vector3 } from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { useFrame, useThree } from "@react-three/fiber";

import { galleryConfig } from "./configs";
import type { GalleryPoint } from "./map-generator";

type ArtworkLightProps = {
  position: [number, number, number];
  normal: GalleryPoint;
  color: string;
};

export const ArtworkLight = ({
  position,
  normal,
  color,
}: ArtworkLightProps) => {
  const lightRef = useRef<RectAreaLight | null>(null);
  const { camera } = useThree();
  const currentIntensityRef = useRef(0);
  const artworkVec = useRef(new Vector3(...position));

  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  useEffect(() => {
    if (!lightRef.current) {
      return;
    }

    lightRef.current.lookAt(position[0], position[1], position[2]);
    artworkVec.current.set(...position);
  }, [position]);

  useFrame(() => {
    if (!lightRef.current) return;

    const dist = camera.position.distanceTo(artworkVec.current);
    const inRange = dist <= galleryConfig.artworkLighting.proximityDistance;
    const target = inRange ? galleryConfig.artworkLighting.intensity : 0;

    currentIntensityRef.current +=
      (target - currentIntensityRef.current) *
      galleryConfig.artworkLighting.fadeSpeed;

    lightRef.current.intensity = currentIntensityRef.current;
  });

  return (
    <rectAreaLight
      ref={lightRef}
      position={[
        position[0] + normal.x * galleryConfig.artworkLighting.offsetFromWall,
        position[1] + galleryConfig.artworkLighting.heightOffset,
        position[2] + normal.z * galleryConfig.artworkLighting.offsetFromWall,
      ]}
      width={galleryConfig.artworkLighting.width}
      height={galleryConfig.artworkLighting.height}
      intensity={0}
      color={color}
    />
  );
};
