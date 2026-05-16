import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import { galleryConfig } from "./configs";
import { GalleryScene } from "./scene";
import { GalleryUi } from "./ui";

import type { GalleryArtwork } from "./types";

export const Gallery = () => {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  const [selectedArtwork, setSelectedArtwork] = useState<GalleryArtwork | null>(
    null,
  );
  const [nearbyArtwork, setNearbyArtwork] = useState<GalleryArtwork | null>(
    null,
  );
  useEffect(() => {
    if (!selectedArtwork) {
      return;
    }

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [selectedArtwork]);

  const handleCloseArtwork = async () => {
    setSelectedArtwork(null);

    await canvasWrapperRef.current
      ?.querySelector("canvas")
      ?.requestPointerLock();
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gallery-background">
      <div ref={canvasWrapperRef} className="h-full w-full">
        <Canvas
          camera={{
            position: galleryConfig.camera.position,
            fov: galleryConfig.camera.fov,
          }}
        >
          <GalleryScene
            seed="oh"
            onSelectArtwork={setSelectedArtwork}
            onNearbyArtworkChange={setNearbyArtwork}
            isFocusMode={Boolean(selectedArtwork)}
          />
        </Canvas>
      </div>

      <GalleryUi
        selectedArtwork={selectedArtwork}
        nearbyArtwork={nearbyArtwork}
        onCloseArtwork={handleCloseArtwork}
      />
    </main>
  );
};
