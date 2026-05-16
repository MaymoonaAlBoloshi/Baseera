import { Canvas } from "@react-three/fiber";
import { galleryConfig } from "./configs";
import { GalleryScene } from "./scene";
import { GalleryUi } from "./ui";

export const Gallery = () => {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gallery-background">
      <Canvas
        camera={{
          position: galleryConfig.camera.position,
          fov: galleryConfig.camera.fov,
        }}
      >
        <GalleryScene />
      </Canvas>

      <GalleryUi />
    </main>
  );
};