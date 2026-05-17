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

type SelectedOverlayProps = {
  artwork: GalleryArtwork;
  supportedArtists: Set<string>;
  onSupportArtist: (artistName: string) => void;
  onClose: () => Promise<void> | void;
};

export const SelectedOverlay = ({
  artwork,
  supportedArtists,
  onSupportArtist,
  onClose,
}: SelectedOverlayProps) => {
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
      className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-4 py-4 sm:px-8"
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

      {/* Close × */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 z-20 flex items-center justify-center w-9 h-9 border border-gallery-border text-gallery-text-muted transition hover:border-gallery-text-secondary hover:text-gallery-text-secondary"
      >
        <X size={16} />
      </button>

      {/* Content */}
      <motion.article
        className="relative z-10 grid max-w-6xl w-full grid-cols-1 gap-6 sm:grid-cols-[minmax(0,1fr)_320px] sm:gap-12"
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
            className="max-h-[40vh] max-w-full rounded-sm object-contain sm:max-h-[80vh]"
          />
        </div>

        {/* ── Info panel ── */}
        <div className="flex flex-col gap-5 justify-center py-2">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-light text-gallery-text-primary leading-snug">
              {artwork.title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-gallery-text-muted">
              {artwork.subtitle}
            </p>
          </div>

          {/* Compact metadata */}
          <div className="border-t border-gallery-border pt-4 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">
                Year
              </span>
              <span className="text-[11px] text-gallery-text-secondary">
                {artwork.year}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">
                Medium
              </span>
              <span className="text-[11px] text-gallery-text-secondary text-right max-w-[58%]">
                {artwork.medium}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">
                Size
              </span>
              <span className="text-[10px] text-gallery-text-muted">
                {artwork.dimensions}
              </span>
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
                      onClick={() => {
                        setComment("");
                        setCommenting(false);
                      }}
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
              {supported
                ? `Supporting · $${supportAmount}/mo`
                : "Support artist"}
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
                  <span className="text-[10px] tracking-[0.2em] text-gallery-text-muted uppercase">
                    Monthly contribution
                  </span>
                  <span className="text-sm font-light text-gallery-text-primary">
                    ${supportAmount} / mo
                  </span>
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
                  <span className="text-[10px] text-gallery-text-muted">
                    $1
                  </span>
                  <span className="text-[10px] text-gallery-text-muted">
                    $50
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[10px] leading-5 text-gallery-text-muted">
                Your support goes directly to the artist each month. Cancel
                anytime.
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSupportArtist(artwork.artist.name);
                    setSupportOpen(false);
                  }}
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
