import { useEffect, useRef } from "react";

// The WebGL island on the "Cum funcționează" plate. Mounts the self-contained
// chase-cam tow-truck scene, but ONLY when the device can handle it and the user
// hasn't asked for reduced motion. Three.js is dynamically imported so it never
// touches the initial bundle. If unavailable, this renders nothing and the
// plate's CSS backdrop carries the visual: the page is fully usable either way.

function canRunWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return false;
  } catch {
    return false;
  }
  return true;
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canRunWebGL()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let disposed = false;
    let scene: import("./scene").Scene | null = null;
    let cleanup = () => {};
    let last = performance.now();

    void (async () => {
      const { createScene } = await import("./scene");
      if (disposed) return;

      const host = canvas.parentElement;
      if (!host) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const created = createScene(canvas, dpr);
      scene = created;

      const sizeToHost = () => {
        const { clientWidth: w, clientHeight: h } = host;
        created.resize(Math.max(w, 1), Math.max(h, 1));
      };
      sizeToHost();

      const onResize = () => sizeToHost();
      window.addEventListener("resize", onResize, { passive: true });

      // Pause when off-screen or tab hidden (battery). Both halves: the loop
      // restarts when the plate comes back and stops when it leaves, so the scene
      // does not render at the display's refresh rate for the rest of the visit.
      let visible = true;
      const io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
          if (!visible) {
            cancelAnimationFrame(raf);
            raf = 0;
          } else if (!raf && !document.hidden) {
            last = performance.now();
            loop();
          }
        },
        { threshold: 0 },
      );
      io.observe(host);
      const onVis = () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (visible && !raf) {
          last = performance.now();
          loop();
        }
      };
      document.addEventListener("visibilitychange", onVis);

      function loop() {
        // A frame already in flight when the plate left (or the tab hid) must
        // not re-arm the loop.
        if (disposed || !visible || document.hidden) {
          raf = 0;
          return;
        }
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05); // clamp on tab refocus
        last = now;
        scene?.render(now / 1000, dt);
        raf = requestAnimationFrame(loop);
      }
      loop();

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVis);
        io.disconnect();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
      scene?.dispose();
    };
  }, []);

  return (
    <div className="hero-canvas" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
