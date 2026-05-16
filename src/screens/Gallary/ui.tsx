import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Heart,
  Bookmark,
  BadgeDollarSign,
  MessageSquare,
  X,
} from "lucide-react";

import type { GalleryArtwork } from "./types";

type GalleryUiProps = {
  mode: "selection" | "artist";
  selectedArtwork: GalleryArtwork | null;
  nearbyArtwork: GalleryArtwork | null;
  currentArtistArtwork: GalleryArtwork | null;
  supportedArtists: Set<string>;
  onSupportArtist: (artistName: string) => void;
  onCloseArtwork: () => Promise<void> | void;
  onBack: () => void;
};

// Shared easing — slow, dreamy, slightly floaty
const dream = { ease: [0.4, 0, 0.2, 1] as const, duration: 0.75 };

export const GalleryUi = ({
  mode,
  selectedArtwork,
  nearbyArtwork,
  currentArtistArtwork,
  supportedArtists,
  onSupportArtist,
  onCloseArtwork,
  onBack,
}: GalleryUiProps) => {
  // The artist to display in the persistent HUD (artist mode)
  const displayArtist = currentArtistArtwork?.artist ?? nearbyArtwork?.artist;

  return (
    <>
      {/* ── Back button — artist mode only ────────────── */}
      <AnimatePresence>
        {mode === "artist" && !selectedArtwork && (
          <motion.button
            key="back"
            type="button"
            onClick={onBack}
            className="absolute left-8 top-8 z-10 border border-gallery-border px-5 py-2.5 text-xs tracking-[0.25em] text-gallery-text-muted uppercase transition hover:border-gallery-text-secondary hover:text-gallery-text-secondary"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={dream}
          >
            ← All Artists
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Persistent bottom-left HUD ────────────────── */}
      <AnimatePresence>
        {!selectedArtwork && mode === "selection" && (
          <motion.div
            key="baseera-hud"
            className="pointer-events-none absolute bottom-10 left-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={dream}
          >
            <p className="text-[10px] tracking-[0.4em] text-gallery-text-muted uppercase mb-2">
              Virtual Gallery
            </p>
            <p className="text-3xl font-light text-gallery-text-primary">Baseera</p>
            <p className="mt-1.5 text-xs text-gallery-text-secondary">
              A gallery for independent artists
            </p>
            <div className="mt-4 flex gap-5">
              <div>
                <p className="text-base font-light text-gallery-text-primary">9</p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">Artists</p>
              </div>
              <div className="w-px bg-gallery-border" />
              <div>
                <p className="text-base font-light text-gallery-text-primary">36</p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">Works</p>
              </div>
            </div>
          </motion.div>
        )}

        {!selectedArtwork && mode === "artist" && displayArtist && (
          <motion.div
            key={`artist-hud-${displayArtist.name}`}
            className="pointer-events-none absolute bottom-10 left-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={dream}
          >
            <p className="text-[10px] tracking-[0.35em] text-gallery-text-muted uppercase mb-2">
              {displayArtist.style}
            </p>
            <p className="text-3xl font-light text-gallery-text-primary">
              {displayArtist.name}
            </p>
            <div className="mt-4 flex gap-5">
              <div>
                <p className="text-base font-light text-gallery-text-primary">{displayArtist.followers}</p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">Followers</p>
              </div>
              <div className="w-px bg-gallery-border" />
              <div>
                <p className="text-base font-light text-gallery-text-primary">{displayArtist.supporters}</p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">Supporters</p>
              </div>
              <div className="w-px bg-gallery-border" />
              <div>
                <p className="text-base font-light text-gallery-text-primary">{displayArtist.visitors}</p>
                <p className="text-[10px] tracking-[0.25em] text-gallery-text-muted uppercase mt-0.5">Visitors</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nearby painting title hint ─────────────────── */}
      <AnimatePresence>
        {!selectedArtwork && nearbyArtwork && (
          <motion.div
            key={nearbyArtwork.id}
            className="pointer-events-none absolute bottom-10 right-10 text-right"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={dream}
          >
            <p className="text-sm font-light text-gallery-text-primary">{nearbyArtwork.title}</p>
            <p className="mt-1 text-xs text-gallery-text-muted">
              {mode === "selection" ? "Click to enter" : "Click to view"}
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

// ── Extracted so useState is clean per-artwork ────────────────────────────
const SelectedOverlay = ({
  artwork,
  supportedArtists,
  onSupportArtist,
  onClose,
}: {
  artwork: GalleryArtwork;
  supportedArtists: Set<string>;
  onSupportArtist: (artistName: string) => void;
  onClose: () => Promise<void> | void;
}) => {
  const [loved, setLoved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportAmount, setSupportAmount] = useState(5);

  const supported = supportedArtists.has(artwork.artist.name);

  return (
    <motion.section
      key="selected"
      className="absolute inset-0 z-10 flex items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.9 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-gallery-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: [0.4, 0, 0.2, 1], duration: 1.1 }}
      />

      {/* Content */}
      <motion.article
        className="relative z-10 grid max-w-6xl w-full grid-cols-[minmax(0,1fr)_320px] gap-12"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.85, delay: 0.12 }}
      >
        {/* ── Artwork image ── */}
        <div className="flex items-center justify-center">
          <img
            src={artwork.imageSrc}
            alt={artwork.title}
            className="max-h-[80vh] max-w-full rounded-sm object-contain"
          />
        </div>

        {/* ── Info panel ── */}
        <div className="flex flex-col gap-5 justify-center py-2">
          {/* Header */}
          <div>
            <p className="text-[10px] tracking-[0.35em] text-gallery-text-muted uppercase">
              {artwork.artist.style}
            </p>
            <p className="mt-1 text-sm font-light text-gallery-text-secondary">
              {artwork.artist.name}
            </p>
            <h2 className="mt-2 text-2xl font-light text-gallery-text-primary leading-snug">
              {artwork.title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-gallery-text-muted">
              {artwork.subtitle}
            </p>
          </div>

          {/* Compact metadata */}
          <div className="border-t border-gallery-border pt-4 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">Year</span>
              <span className="text-[11px] text-gallery-text-secondary">{artwork.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">Medium</span>
              <span className="text-[11px] text-gallery-text-secondary text-right max-w-[58%]">{artwork.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">Size</span>
              <span className="text-[10px] text-gallery-text-muted">{artwork.dimensions}</span>
            </div>
          </div>

          {/* Poem */}
          <p className="whitespace-pre-line text-sm font-light leading-7 text-gallery-text-primary border-l border-gallery-border pl-3">
            {artwork.poem}
          </p>

          {/* Likes + comments counts */}
          <div className="flex items-center gap-4 border-t border-gallery-border pt-4">
            <span className="flex items-center gap-1.5 text-xs text-gallery-text-muted">
              <Heart size={11} />
              {artwork.likes ?? "—"}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gallery-text-muted">
              <MessageSquare size={11} />
              {artwork.comments ?? "—"}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <ActionIconBtn
                icon={<Heart size={13} />}
                label="Love"
                active={loved}
                activeClass="text-rose-400 border-rose-400/40"
                onClick={() => setLoved((v) => !v)}
              />
              <ActionIconBtn
                icon={<Bookmark size={13} />}
                label="Save"
                active={saved}
                activeClass="text-amber-400 border-amber-400/40"
                onClick={() => setSaved((v) => !v)}
              />
              <ActionIconBtn
                icon={<MessageSquare size={13} />}
                label="Comment"
                active={commenting}
                activeClass="text-gallery-text-secondary border-gallery-border"
                onClick={() => setCommenting((v) => !v)}
              />
            </div>

            {/* Comment input */}
            <AnimatePresence>
              {commenting && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Leave a thought…"
                      className="flex-1 border border-gallery-border bg-transparent px-3 py-2 text-xs text-gallery-text-secondary placeholder:text-gallery-text-muted focus:border-gallery-text-secondary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => { setComment(""); setCommenting(false); }}
                      className="border border-gallery-border px-3 py-2 text-gallery-text-muted hover:text-gallery-text-secondary transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Support button */}
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className={`flex w-full items-center justify-center gap-2 border px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase transition ${
                supported
                  ? "border-emerald-500/50 text-emerald-400"
                  : "border-gallery-border text-gallery-text-secondary hover:border-gallery-text-secondary hover:text-gallery-text-primary"
              }`}
            >
              <BadgeDollarSign size={13} />
              {supported ? `Supporting · $${supportAmount}/mo` : "Support artist"}
            </button>

            {/* Return */}
            <button
              type="button"
              onClick={onClose}
              className="w-full border border-gallery-border px-6 py-2.5 text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase transition hover:border-gallery-text-secondary hover:text-gallery-text-secondary"
            >
              Return
            </button>
          </div>
        </div>
      </motion.article>

      {/* ── Support modal ── */}
      <AnimatePresence>
        {supportOpen && (
          <>
            <motion.div
              className="absolute inset-0 z-20 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSupportOpen(false)}
            />
            <motion.div
              className="absolute z-30 w-80 border border-gallery-border bg-[#0a0908] p-7"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
            >
              <p className="text-[10px] tracking-[0.3em] text-gallery-text-muted uppercase mb-1">
                Support
              </p>
              <p className="text-lg font-light text-gallery-text-primary">
                {artwork.artist.name}
              </p>

              <div className="mt-6">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">Monthly contribution</span>
                  <span className="text-sm font-light text-gallery-text-primary">${supportAmount} / mo</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={supportAmount}
                  onChange={(e) => setSupportAmount(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gallery-text-muted">$1</span>
                  <span className="text-[10px] text-gallery-text-muted">$50</span>
                </div>
              </div>

              <p className="mt-4 text-[10px] leading-5 text-gallery-text-muted">
                Your support goes directly to the artist each month. Cancel anytime.
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => { onSupportArtist(artwork.artist.name); setSupportOpen(false); }}
                  className="flex-1 border border-emerald-500/50 py-2.5 text-[10px] tracking-[0.2em] text-emerald-400 uppercase transition hover:bg-emerald-500/10"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setSupportOpen(false)}
                  className="flex-1 border border-gallery-border py-2.5 text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase transition hover:border-gallery-text-secondary hover:text-gallery-text-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

const ActionIconBtn = ({
  icon,
  label,
  active,
  activeClass,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 border px-3 py-2 text-[10px] tracking-[0.2em] uppercase transition ${
      active
        ? activeClass
        : "border-gallery-border text-gallery-text-muted hover:border-gallery-text-secondary hover:text-gallery-text-secondary"
    }`}
  >
    {icon}
    {label}
  </button>
);
