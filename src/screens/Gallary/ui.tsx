import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Maximize2, Minimize2, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { GalleryArtwork } from "./types";
import { SelectedOverlay } from "./selected-overlay";

type GalleryUiProps = {
  mode: "selection" | "artist";
  isMobile: boolean;
  selectedArtwork: GalleryArtwork | null;
  nearbyArtwork: GalleryArtwork | null;
  currentArtistArtwork: GalleryArtwork | null;
  supportedArtists: Set<string>;
  onSupportArtist: (artistName: string) => void;
  onCloseArtwork: () => Promise<void> | void;
  onBack: () => void;
  brightness: number;
  onBrightnessChange: (v: number) => void;
};

// Shared easing — slow, dreamy, slightly floaty
const dream = { ease: [0.4, 0, 0.2, 1] as const, duration: 0.75 };

export const GalleryUi = ({
  mode,
  isMobile,
  selectedArtwork,
  nearbyArtwork,
  currentArtistArtwork,
  supportedArtists,
  onSupportArtist,
  onCloseArtwork,
  onBack,
  brightness,
  onBrightnessChange,
}: GalleryUiProps) => {
  const [brightnessOpen, setBrightnessOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // The artist to display in the persistent HUD (artist mode)
  const displayArtist = currentArtistArtwork?.artist ?? nearbyArtwork?.artist;

  // Webkit-prefixed fullscreen helpers (Safari / older iOS)
  type DocWithWebkit = Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void>;
    webkitFullscreenEnabled?: boolean;
  };
  type ElWithWebkit = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  const doc = document as DocWithWebkit;
  const canFullscreen =
    Boolean(document.fullscreenEnabled) || Boolean(doc.webkitFullscreenEnabled);

  const getFullscreenEl = () =>
    document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;

  const [isFullscreen, setIsFullscreen] = useState(() =>
    Boolean(getFullscreenEl()),
  );

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(getFullscreenEl()));
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!getFullscreenEl()) {
      const el = document.documentElement as ElWithWebkit;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <>
      {/* ── Fullscreen button ── */}
      {!selectedArtwork && canFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className={`absolute top-8 z-20 flex items-center justify-center border border-gallery-border text-gallery-text-muted transition hover:border-gallery-text-secondary hover:text-gallery-text-secondary ${
            isRTL ? "left-8" : "right-8"
          } ${isMobile ? "w-12 h-12" : "w-9 h-9"}`}
        >
          {isFullscreen ? (
            <Minimize2 size={isMobile ? 20 : 16} />
          ) : (
            <Maximize2 size={isMobile ? 20 : 16} />
          )}
        </button>
      )}

      {/* ── Brightness control ── */}
      {!selectedArtwork && (
        <div
          className={`absolute top-8 z-20 ${
            isRTL
              ? canFullscreen
                ? isMobile
                  ? "left-24"
                  : "left-20"
                : "left-8"
              : canFullscreen
                ? isMobile
                  ? "right-24"
                  : "right-20"
                : "right-8"
          }`}
        >
          <button
            type="button"
            onClick={() => setBrightnessOpen((v) => !v)}
            aria-label="Adjust brightness"
            className={`flex items-center justify-center border transition ${
              brightnessOpen
                ? "border-gallery-text-secondary text-gallery-text-secondary"
                : "border-gallery-border text-gallery-text-muted hover:border-gallery-text-secondary hover:text-gallery-text-secondary"
            } ${isMobile ? "w-12 h-12" : "w-9 h-9"}`}
          >
            <Sun size={isMobile ? 20 : 16} />
          </button>

          <AnimatePresence>
            {brightnessOpen && (
              <motion.div
                className={`absolute top-full mt-2 flex flex-col items-center gap-3 border border-gallery-border bg-gallery-background px-3 py-4 ${
                  isRTL ? "left-0" : "right-0"
                }`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.2 }}
              >
                <input
                  type="range"
                  min={0.3}
                  max={2}
                  step={0.05}
                  value={brightness}
                  onChange={(e) => onBrightnessChange(Number(e.target.value))}
                  aria-label="Scene brightness"
                  className="h-24 w-2 cursor-pointer accent-gallery-text-secondary"
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                />
                <span className="text-[9px] tracking-[0.15em] text-gallery-text-muted uppercase">
                  {Math.round(brightness * 100)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Back button — artist mode only ────────── */}
      <AnimatePresence>
        {mode === "artist" && !selectedArtwork && (
          <motion.button
            key="back"
            type="button"
            onClick={onBack}
            className={`absolute top-8 z-10 border border-gallery-border text-gallery-text-muted uppercase transition hover:border-gallery-text-secondary hover:text-gallery-text-secondary ${
              isRTL ? "right-8" : "left-8"
            } ${
              isMobile
                ? "px-6 py-4 text-sm tracking-[0.2em]"
                : "px-5 py-2.5 text-xs tracking-[0.25em]"
            }`}
            initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 8 : -8 }}
            transition={dream}
          >
            {t("ui.allArtists")}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Persistent bottom-left HUD ────────────────── */}
      <AnimatePresence>
        {!selectedArtwork && mode === "selection" && (
          <motion.div
            key="baseera-hud"
            className={`pointer-events-none absolute bottom-10 ${
              isRTL ? "right-4 sm:right-10 text-right" : "left-4 sm:left-10"
            }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={dream}
          >
            <p className="text-[10px] tracking-[0.4em] text-gallery-text-muted uppercase mb-2">
              {t("ui.virtualGallery")}
            </p>
            <p className="text-3xl font-light text-gallery-text-primary">
              {t("ui.galleryName")}
            </p>
            <p className="mt-1.5 text-xs text-gallery-text-secondary">
              {t("ui.tagline")}
            </p>
            <div
              className={`mt-4 flex gap-5 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div>
                <p className="text-base font-light text-gallery-text-primary">
                  9
                </p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">
                  {t("ui.artists")}
                </p>
              </div>
              <div className="w-px bg-gallery-border" />
              <div>
                <p className="text-base font-light text-gallery-text-primary">
                  36
                </p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">
                  {t("ui.works")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!selectedArtwork && mode === "artist" && displayArtist && (
          <motion.div
            key={`artist-hud-${displayArtist.name}`}
            className={`pointer-events-none absolute bottom-10 ${
              isRTL ? "right-4 sm:right-10 text-right" : "left-4 sm:left-10"
            }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={dream}
          >
            <p className="text-[10px] tracking-[0.35em] text-gallery-text-muted uppercase mb-2">
              {t(`artists.${displayArtist.name}.style`, {
                defaultValue: displayArtist.style,
              })}
            </p>
            <p className="text-3xl font-light text-gallery-text-primary">
              {displayArtist.name}
            </p>
            <div
              className={`mt-4 flex gap-5 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div>
                <p className="text-base font-light text-gallery-text-primary">
                  {displayArtist.followers}
                </p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">
                  {t("ui.followers")}
                </p>
              </div>
              <div className="w-px bg-gallery-border" />
              <div>
                <p className="text-base font-light text-gallery-text-primary">
                  {displayArtist.supporters}
                </p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">
                  {t("ui.supporters")}
                </p>
              </div>
              <div className="w-px bg-gallery-border" />
              <div>
                <p className="text-base font-light text-gallery-text-primary">
                  {displayArtist.visitors}
                </p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">
                  {t("ui.visitors")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nearby painting title hint ─────────────── */}
      <AnimatePresence>
        {!selectedArtwork && nearbyArtwork && !isMobile && (
          <motion.div
            key={nearbyArtwork.id}
            className={`pointer-events-none absolute bottom-10 ${
              isRTL ? "left-10 text-left" : "right-10 text-right"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={dream}
          >
            <p className="text-sm font-light text-gallery-text-primary">
              {t(`artworks.${nearbyArtwork.id}.title`, {
                defaultValue: nearbyArtwork.title,
              })}
            </p>
            <p className="mt-1 text-xs text-gallery-text-muted">
              {mode === "selection"
                ? t("ui.clickToEnter")
                : t("ui.clickToView")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selected artwork overlay ───────────────────── */}
      <AnimatePresence>
        {selectedArtwork && (
          <SelectedOverlay
            artwork={selectedArtwork}
            supportedArtists={supportedArtists}
            onSupportArtist={onSupportArtist}
            onClose={onCloseArtwork}
          />
        )}
      </AnimatePresence>
    </>
  );
};
