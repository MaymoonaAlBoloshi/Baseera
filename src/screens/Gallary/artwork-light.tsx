import { useEffect, useRef } from "react";
import { RectAreaLight } from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

import { galleryConfig } from "./configs";
import type { GalleryPoint } from "./map-generator";

type ArtworkLightProps = {
  position: [number, number, number];
  normal: GalleryPoint;
};

export const ArtworkLight = ({ position, normal }: ArtworkLightProps) => {
  const lightRef = useRef<RectAreaLight | null>(null);

  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  useEffect(() => {
    if (!lightRef.current) {
      return;
    }

    lightRef.current.lookAt(position[0], position[1], position[2]);
  }, [position]);

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
      intensity={galleryConfig.artworkLighting.intensity}
      color={galleryConfig.artworkLighting.color}
    />
  );
};
