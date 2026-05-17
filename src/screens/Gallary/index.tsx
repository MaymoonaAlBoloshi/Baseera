import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import { galleryConfig, getArtistConfig } from "./configs";
import { BackgroundMusic } from "./audio/background-music";
import { useIsPortrait } from "./hooks/use-is-portrait";
import { MobileControls } from "./controls/mobile-controls";
import { GalleryScene } from "./scene";
import { GalleryUi } from "./ui";
import { useIsMobile } from "./hooks/use-is-mobile";
import { galleryArtworks, artistCollections } from "./data";

import type { GalleryArtwork, GalleryView, MobileInputState } from "./types";

export const Gallery = () => {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();
  const audioIframeRef = useRef<HTMLIFrameElement | null>(null);
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
            showScreen={view.mode === "selection"}
            audioIframeRef={audioIframeRef}
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

      {/* Hidden YouTube iframe for proximity audio — lives outside Canvas so
          react-dom's reconciler handles it, not R3F's */}
      {view.mode === "selection" &&
        (() => {
          const cfg = galleryConfig.galleryScreen;
          const src =
            `https://www.youtube.com/embed/${cfg.videoId}` +
            `?enablejsapi=1&autoplay=1&mute=1&loop=1` +
            `&playlist=${cfg.playlistIds.join(",")}` +
            `&controls=0&modestbranding=1&rel=0&playsinline=1`;
          return (
            <iframe
              ref={audioIframeRef}
              src={src}
              width={1}
              height={1}
              allow="autoplay; encrypted-media"
              title="Stage audio"
              style={{
                position: "fixed",
                bottom: 0,
                right: 0,
                opacity: 0.001,
                pointerEvents: "none",
                border: "none",
              }}
            />
          );
        })()}

      {isMobile && isPortrait && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(5,5,4,0.97)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "28px",
            color: "#f0ece4",
            fontFamily: "inherit",
          }}
        >
          {/* Rotating phone icon */}
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: "portrait-spin 2s ease-in-out infinite" }}
          >
            <style>{`
              @keyframes portrait-spin {
                0%   { transform: rotate(0deg); }
                40%  { transform: rotate(-90deg); }
                60%  { transform: rotate(-90deg); }
                100% { transform: rotate(-90deg); }
              }
            `}</style>
            {/* Phone body */}
            <rect
              x="22"
              y="8"
              width="28"
              height="48"
              rx="5"
              stroke="#c8b89a"
              strokeWidth="3"
              fill="none"
            />
            {/* Home button */}
            <circle cx="36" cy="50" r="3" fill="#c8b89a" />
            {/* Speaker */}
            <rect
              x="31"
              y="14"
              width="10"
              height="2.5"
              rx="1.25"
              fill="#c8b89a"
            />
            {/* Rotation arrow */}
            <path
              d="M54 20 Q62 28 58 38"
              stroke="#c8b89a"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <polyline
              points="55,38 58,38 58,42"
              stroke="#c8b89a"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p
            style={{
              fontSize: "18px",
              fontWeight: 600,
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Rotate your device
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "#8a8070",
              margin: 0,
              textAlign: "center",
              maxWidth: "220px",
              lineHeight: 1.5,
            }}
          >
            Baseera is designed for landscape orientation
          </p>
        </div>
      )}
    </main>
  );
};
