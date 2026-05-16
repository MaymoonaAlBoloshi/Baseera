import type { GalleryArtwork } from "./types";

type GalleryUiProps = {
  selectedArtwork: GalleryArtwork | null;
  nearbyArtwork: GalleryArtwork | null;
  onCloseArtwork: () => Promise<void> | void;
};
export const GalleryUi = ({
  selectedArtwork,
  nearbyArtwork,
  onCloseArtwork,
}: GalleryUiProps) => {
  return (
    <>
      {!selectedArtwork && !nearbyArtwork && (
        <section className="pointer-events-none absolute inset-0 flex items-end justify-center px-8 pb-12">
          <div className="max-w-xl text-center">
            <p className="text-sm tracking-[0.35em] text-gallery-text-muted uppercase">
              Gallery
            </p>

            <h1 className="mt-4 text-4xl font-light text-gallery-text-primary">
              Walk slowly.
            </h1>

            <p className="mt-4 text-sm leading-7 text-gallery-text-secondary">
              Click an artwork to let it come closer.
            </p>
          </div>
        </section>
      )}
      {!selectedArtwork && nearbyArtwork && (
        <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center">
          <p className="text-xs tracking-[0.3em] text-gallery-text-muted uppercase">
            Click to view
          </p>

          <p className="mt-2 text-sm text-gallery-text-secondary">
            {nearbyArtwork.title}
          </p>
        </div>
      )}
      {selectedArtwork && (
        <section className="absolute inset-0 z-10 flex items-center justify-center bg-gallery-overlay px-8">
          <article className="grid max-w-6xl grid-cols-[minmax(0,1fr)_minmax(280px,420px)] gap-12">
            <div className="flex items-center justify-center">
              <img
                src={selectedArtwork.imageSrc}
                alt={selectedArtwork.title}
                className="max-h-[78vh] max-w-full rounded-sm object-contain"
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm tracking-[0.35em] text-gallery-text-muted uppercase">
                Selected Piece
              </p>

              <h2 className="mt-4 text-4xl font-light text-gallery-text-primary">
                {selectedArtwork.title}
              </h2>

              <p className="mt-4 text-sm leading-7 text-gallery-text-secondary">
                {selectedArtwork.subtitle}
              </p>

              <p className="mt-10 whitespace-pre-line text-lg font-light leading-9 text-gallery-text-primary">
                {selectedArtwork.poem}
              </p>

              <button
                type="button"
                onClick={onCloseArtwork}
                className="mt-12 w-fit border border-gallery-border px-6 py-3 text-sm tracking-[0.2em] text-gallery-text-secondary uppercase transition hover:border-gallery-text-secondary hover:text-gallery-text-primary"
              >
                Return
              </button>
            </div>
          </article>
        </section>
      )}
    </>
  );
};
