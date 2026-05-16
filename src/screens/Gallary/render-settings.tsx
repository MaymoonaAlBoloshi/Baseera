import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from "three";

import { galleryConfig } from "./configs";

export const RenderSettings = () => {
  const { gl } = useThree();

  useEffect(() => {
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = galleryConfig.rendering.toneMappingExposure;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;
  }, [gl]);

  return null;
};
