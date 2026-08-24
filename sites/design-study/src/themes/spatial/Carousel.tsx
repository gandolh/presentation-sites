// Spatial UI replaces the shared carousel with a real three-dimensional one.
//
// Every other theme in this study fakes depth — a shadow, a blur, a transform.
// Spatial UI's entire premise is that depth is not a metaphor, so faking it
// here would be the one place the study told a lie. This mounts an actual
// perspective camera and puts the photographs on planes in a room:
//
//   * the selected panel sits at z = 0, facing the viewer;
//   * neighbours recede along -z and rotate toward the centre, so their
//     parallax is genuine rather than a scale trick;
//   * a rim light and a soft ambient give the panels an edge, the way
//     visionOS lights glass against a room it did not create.
//
// Accessibility is deliberately NOT handled in the canvas — WebGL has no
// accessibility tree. The controls stay ordinary DOM buttons underneath, and
// a <noscript> fallback in PostCarousel.astro shows the plain images, because
// `client:only` means nothing at all renders on the server.

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { CarouselProps } from "../../components/Carousel";

const GAP = 2.5;
const DEPTH = 1.5;
const TILT = 0.34;

function Panel({
  url,
  index,
  active,
  size,
}: {
  url: string;
  index: number;
  active: number;
  size: [number, number];
}) {
  const texture = useLoader(THREE.TextureLoader, url);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;

    const offset = index - active;
    // Frame-rate independent easing: the fraction of the remaining distance
    // covered depends on elapsed time, not on how often we were called.
    const k = 1 - Math.pow(0.0015, delta);

    node.position.x += (offset * GAP - node.position.x) * k;
    node.position.z += (-Math.abs(offset) * DEPTH - node.position.z) * k;
    node.rotation.y += (-offset * TILT - node.rotation.y) * k;
  });

  return (
    <group ref={group} position={[index * GAP, 0, 0]}>
      <mesh>
        <planeGeometry args={size} />
        <meshStandardMaterial
          map={texture}
          roughness={0.55}
          metalness={0.05}
          toneMapped={false}
        />
      </mesh>
      {/* The panel's own edge — visionOS glass always has a lit rim. */}
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[size[0] + 0.07, size[1] + 0.07]} />
        <meshBasicMaterial color="#9db4ff" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function Scene({ images, active, size }: { images: string[]; active: number; size: [number, number] }) {
  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -1, 2]} intensity={0.4} color="#9db4ff" />
      {images.map((url, i) => (
        <Panel key={url} url={url} index={i} active={active} size={size} />
      ))}
    </>
  );
}

export default function SpatialCarousel({ images, ratio, label }: CarouselProps) {
  const [active, setActive] = useState(0);
  const [supported, setSupported] = useState(true);
  const count = images.length;

  // A machine with no WebGL should get the flat images, not an empty box.
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    setSupported(Boolean(gl));
  }, []);

  const size: [number, number] = ratio === "1:1" ? [2, 2] : [1.76, 2.2];

  if (!supported) {
    return (
      <div className="ds-carousel sp-carousel sp-carousel--flat" aria-label={label} role="group">
        {images.map((image) => (
          <img key={image.src} src={image.src} alt={image.alt} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="ds-carousel sp-carousel"
      data-ratio={ratio}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="sp-stage" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 3.9], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Scene images={images.map((i) => i.src)} active={active} size={size} />
          </Suspense>
        </Canvas>
      </div>

      {/* The accessible surface: plain buttons and a live region, outside WebGL. */}
      <p className="sp-live" aria-live="polite">
        {images[active]?.alt ?? ""}
      </p>

      <div className="ds-carousel__controls">
        <button
          className="ds-carousel__nav ds-carousel__nav--prev"
          type="button"
          onClick={() => setActive((i) => Math.max(0, i - 1))}
          disabled={active === 0}
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
              aria-selected={active === i}
              aria-label={`Image ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>

        <button
          className="ds-carousel__nav ds-carousel__nav--next"
          type="button"
          onClick={() => setActive((i) => Math.min(count - 1, i + 1))}
          disabled={active === count - 1}
          aria-label="Next image"
        >
          <span aria-hidden="true">&#8594;</span>
        </button>

        <p className="ds-carousel__counter" aria-hidden="true">
          {active + 1} / {count}
        </p>
      </div>
    </div>
  );
}
