// Liquid Glass replaces the shared carousel outright, because the difference
// is mechanical rather than cosmetic.
//
// Three things stack here that plain CSS cannot do on its own:
//
//   1. REFRACTION. An SVG `feDisplacementMap`, driven by a very low-frequency
//      `feTurbulence`, bends the image the way a thick pane of glass bends
//      what is behind it. This is the same primitive every liquid-glass npm
//      package uses; the difference is that they generate a signed-distance
//      field for the lens shape, while this generates a smooth noise field —
//      cheaper, and closer to "liquid" than "lens".
//
//   2. SPECULAR HIGHLIGHT THAT TRACKS MOTION. Apple's version reads device
//      tilt. A web page has no tilt, so the honest analogue is scroll: the
//      highlight sweeps as the element moves through the viewport, which is
//      the same causal story (the light stays put, the glass moves).
//
//   3. EDGE LENSING. A second copy of the image, offset and hue-shifted, is
//      masked to the rim — chromatic dispersion, which is what stops a glass
//      effect reading as a plain blur.
//
// Everything degrades: no JS and it is a scroll-snap carousel with a static
// highlight; `prefers-reduced-motion` freezes the sweep.

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { CarouselProps } from "../../components/Carousel";

export default function LiquidGlassCarousel({ images, ratio, label }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const rootRef = useRef<HTMLDivElement>(null);
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

  // The sweep. `--lg-sweep` runs 0 -> 1 as the element crosses the viewport,
  // and the CSS uses it to slide the specular band across the glass.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const box = root.getBoundingClientRect();
      const progress = 1 - (box.top + box.height) / (window.innerHeight + box.height);
      root.style.setProperty("--lg-sweep", String(Math.min(1, Math.max(0, progress))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const count = images.length;

  return (
    <div
      className="ds-carousel lg-carousel"
      data-ratio={ratio}
      data-ready={ready}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      ref={rootRef}
    >
      {/*
        The refraction filter. Scoped per component instance is unnecessary —
        filter ids are document-global and the parameters never vary — so it is
        declared once here and every carousel on the page references it.
      */}
      <svg className="lg-defs" aria-hidden="true" focusable="false">
        <filter id="lg-refract" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.003 0.009"
            numOctaves={2}
            seed={7}
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale={16}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

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
              {/* Chromatic dispersion, masked to the rim only. */}
              <img className="lg-fringe" src={image.src} alt="" aria-hidden="true" />
              {/* The travelling specular band. */}
              <span className="lg-specular" aria-hidden="true" />
              <span className="lg-rim" aria-hidden="true" />
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
