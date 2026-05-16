import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import { galleryConfig, getArtistConfig } from "./configs";
import { BackgroundMusic } from "./background-music";
import { MobileControls } from "./mobile-controls";
import { GalleryScene } from "./scene";
import { GalleryUi } from "./ui";
import { useIsMobile } from "./use-is-mobile";
import { galleryArtworks, artistCollections } from "./data";

import type { GalleryArtwork, GalleryView, MobileInputState } from "./types";

export const Gallery = () => {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const mobileInputRef = useRef<MobileInputState>({
    moveX: 0,
    moveZ: 0,
    lookDX: 0,
    lookDY: 0,
  });

  const [view, setView] = useState<GalleryView>({ mode: "selection" });

  const [selectedArtwork, setSelectedArtwork] = useState<GalleryArtwork | null>(
    null,
  );
  const [nearbyArtwork, setNearbyArtwork] = useState<GalleryArtwork | null>(
    null,
  );

  const currentArtworks =
    view.mode === "artist"
      ? (artistCollections[view.artworkId] ?? [])
      : galleryArtworks;

  const currentSeed = view.mode === "artist" ? view.artworkId : "selection";

  const artistConfig = getArtistConfig(currentSeed);

  const currentArtistArtwork =
    view.mode === "artist"
      ? (galleryArtworks.find((a) => a.id === view.artworkId) ?? null)
      : null;

  const [supportedArtists, setSupportedArtists] = useState<Set<string>>(
    new Set(),
  );

  const handleSupportArtist = (artistName: string) => {
    setSupportedArtists((prev) => new Set(prev).add(artistName));
  };

  // Reset nearby + selected when switching views
  useEffect(() => {
    setSelectedArtwork(null);
    setNearbyArtwork(null);
  }, [view]);

  useEffect(() => {
    if (!selectedArtwork) {
      return;
    }

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [selectedArtwork]);

  const handleSelectArtwork = (artwork: GalleryArtwork) => {
    if (view.mode === "selection") {
      // Navigate into that artist's gallery
      setView({ mode: "artist", artworkId: artwork.id });
      return;
    }
    setSelectedArtwork(artwork);
  };

  const handleCloseArtwork = async () => {
    setSelectedArtwork(null);

    if (!isMobile) {
      await canvasWrapperRef.current
        ?.querySelector("canvas")
        ?.requestPointerLock();
    }
  };

  const handleSelectNearby = () => {
    if (nearbyArtwork) handleSelectArtwork(nearbyArtwork);
  };

  const handleBack = () => {
    setView({ mode: "selection" });
  };

  // Backspace → back to main gallery (artist mode, no overlay open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && view.mode === "artist" && !selectedArtwork) {
        handleBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view.mode, selectedArtwork]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gallery-background">
      <div key={currentSeed} ref={canvasWrapperRef} className="h-full w-full">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          camera={{
            position: galleryConfig.camera.position,
            fov: galleryConfig.camera.fov,
          }}
        >
          <GalleryScene
            seed={currentSeed}
            artworks={currentArtworks}
            artistConfig={artistConfig}
            isMobile={isMobile}
            mobileInputRef={mobileInputRef}
            onSelectArtwork={handleSelectArtwork}
            onNearbyArtworkChange={setNearbyArtwork}
            isFocusMode={Boolean(selectedArtwork)}
          />
        </Canvas>
      </div>

      <GalleryUi
        mode={view.mode}
        isMobile={isMobile}
        selectedArtwork={selectedArtwork}
        nearbyArtwork={nearbyArtwork}
        currentArtistArtwork={currentArtistArtwork}
        supportedArtists={supportedArtists}
        onSupportArtist={handleSupportArtist}
        onCloseArtwork={handleCloseArtwork}
        onBack={handleBack}
      />

      {isMobile && (
        <MobileControls
          inputRef={mobileInputRef}
          isDisabled={Boolean(selectedArtwork)}
          nearbyArtworkTitle={nearbyArtwork?.title ?? null}
          onSelectNearby={handleSelectNearby}
        />
      )}

      <BackgroundMusic />
    </main>
  );
};
