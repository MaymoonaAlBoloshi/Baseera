export const GalleryUi = () => {
  return (
    <section className="pointer-events-none absolute inset-0 flex items-end justify-center px-8 pb-12">
      <div className="max-w-xl text-center">
        <p className="text-sm tracking-[0.35em] text-gallery-text-muted uppercase">
          Gallery
        </p>

        <h1 className="mt-4 text-4xl font-light text-gallery-text-primary">
          Walk slowly.
        </h1>

        <p className="mt-4 text-sm leading-7 text-gallery-text-secondary">
          A quiet museum of images, poetry, and remembered spaces.
        </p>
      </div>
    </section>
  );
};