import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from "three";

export const RenderSettings = () => {
  const { gl } = useThree();

  useEffect(() => {
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.9;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;
    // @ts-ignore — deprecated but still functional in r3f/three
    gl.physicallyCorrectLights = true;
  }, [gl]);

  return null;
};
