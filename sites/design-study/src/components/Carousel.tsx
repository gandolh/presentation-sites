// The one carousel behaviour, shared by every theme that does not replace it.
//
// It is deliberately opinion-free about appearance. It renders a documented DOM
// contract with stable `ds-carousel__*` class names and *no* styling of its own
// beyond what is structurally required; each theme.css restyles those classes
// into its own world. Two themes (spatial, liquid-glass) need a different
// mechanism rather than a different skin, so they ship their own component and
// the theme's Post.astro imports that instead.
//
// Astro island props must be serialisable, so there are no render-prop slots
// here — the styling seam is CSS, not JSX.
//
// Progressive enhancement: Astro server-renders this markup, and the CSS gives
// the viewport `overflow-x: auto` + `scroll-snap-type`. So it swipes natively
// before hydration and keeps working if hydration never happens. Once Embla is
// ready we flip `data-ready="true"` and the CSS hands control over.

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export type CarouselImage = { src: string; alt: string };

export type CarouselProps = {
  images: CarouselImage[];
  /** Instagram post ratio. Drives the aspect-ratio CSS custom property. */
  ratio: "4:5" | "1:1";
  /** Accessible name — the post title, so screen readers know what this shows. */
  label: string;
  /** Optional per-theme hook for a variant, e.g. "peek" or "stack". */
  variant?: string;
};

export default function Carousel({ images, ratio, label, variant }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [selected, setSelected] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setSelected(emblaApi.selectedScrollSnap());
    sync();
    setReady(true);
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const count = images.length;

  return (
    <div
      className="ds-carousel"
      data-ratio={ratio}
      data-ready={ready}
      data-variant={variant}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="ds-carousel__viewport" ref={emblaRef}>
        <div className="ds-carousel__track">
          {images.map((image, i) => (
            <figure
              className="ds-carousel__slide"
              key={image.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              <img
                className="ds-carousel__image"
                src={image.src}
                alt={image.alt}
                width={1080}
                height={ratio === "1:1" ? 1080 : 1350}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="ds-carousel__controls">
          <button
            className="ds-carousel__nav ds-carousel__nav--prev"
            type="button"
            onClick={prev}
            disabled={ready && selected === 0}
            aria-label="Previous image"
          >
            <span aria-hidden="true">&#8592;</span>
          </button>

          <div className="ds-carousel__dots" role="tablist" aria-label="Choose image">
            {images.map((image, i) => (
              <button
                className="ds-carousel__dot"
                key={image.src}
                type="button"
                role="tab"
                aria-selected={selected === i}
                aria-label={`Image ${i + 1}`}
                onClick={() => scrollTo(i)}
              />
            ))}
          </div>

          <button
            className="ds-carousel__nav ds-carousel__nav--next"
            type="button"
            onClick={next}
            disabled={ready && selected === count - 1}
            aria-label="Next image"
          >
            <span aria-hidden="true">&#8594;</span>
          </button>

          <p className="ds-carousel__counter" aria-hidden="true">
            {selected + 1} / {count}
          </p>
        </div>
      )}
    </div>
  );
}
