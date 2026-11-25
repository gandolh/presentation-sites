// One view of the 3D movement: a WebGL renderer on the island's canvas, the camera, the frame loop and the drag. The
// loop keeps the rules the clock-drawn figures keep (lib/clockFigure.ts): `t` moves on by real time over the figure's
// `--slow`, a frame's step clamped at 0.25 s; it renders only while something moves, so not while the page is
// paused, the figure held, the canvas off screen or the tab hidden. The first frame is the poster's flat view
// (camera.ts); the first drag, or an arrow key on the focused canvas, eases to the prototype's tilt in 420 ms (a jump
// under reduced motion), and after that a sideways drag turns it.

import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { registerPose } from "../lib/clockFigure.ts";
import { heldAt, hold, onFigureChange, speedOf } from "../lib/figure.ts";
import { isPlaying, subscribe } from "../lib/playback.ts";
import { stateAt } from "../movement/clock.ts";
import { MOVEMENT } from "../movement/parts.ts";
import { cameraAt, easeOut, fitFrame, flatFrame, parseViewBox, TILT, TILT_FOV } from "./camera.ts";
import { readPalette } from "./colours.ts";
import { createMovement } from "./movement.ts";
import { setLineScale } from "./shapes.ts";

export interface ViewOptions {
  readonly canvas: HTMLCanvasElement;
  /** The element the canvas fills: its size is the view's. */
  readonly box: HTMLElement;
  /** The figure the movement belongs to: its speed and its hold (lib/figure.ts). */
  readonly figure: HTMLElement;
  /** The poster's viewBox attribute, which the flat view frames exactly. */
  readonly viewBox: string;
  /** The figure's name under the dev hook, `window.taviPose(name, pose)`. */
  readonly name: string;
  /** Told when the WebGL context is lost, and when it comes back. */
  readonly onLost: () => void;
  readonly onRestored: () => void;
  /** Told when the view first leaves its flat frame. */
  readonly onTilt: () => void;
}

export interface View {
  dispose(): void;
}

/** The longest step one frame may take, in seconds of real time. */
const MAX_STEP = 0.25;
/** How long the first tilt takes, in milliseconds: the stylesheet's --dur-long. */
const TILT_MS = 420;
/** The yaw the tilted view opens at, in degrees: the prototype's. */
const OPEN_YAW = -18;
/** Radians of turn per pixel dragged, and per arrow key. */
const DRAG_TURN = 0.006;
const KEY_TURN = (10 * Math.PI) / 180;
/** A pointer must travel this far, in CSS pixels, before a press counts as a drag. */
const DRAG_SLOP = 4;
/** The clock's start: half a beat in, the balance passing rest and the fork in the middle, as the poster draws them. */
const REST = 0.5 / (MOVEMENT.spec.vph / 3600);
const DEG = Math.PI / 180;

/** Starts a view on `canvas`, or returns null where the browser can't make a WebGL 2 context. */
export function startView(o: ViewOptions): View | null {
  const { canvas, box, figure } = o;
  const viewBox = parseViewBox(o.viewBox);
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true, depth: true, stencil: false });
  if (!context) return null;
  const renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const movement = createMovement(readPalette());
  const scene = new Scene();
  scene.add(movement.root);
  const camera = new PerspectiveCamera();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  let t = heldAt(figure) ?? REST;
  let apart = 0;
  let tilt = 0;
  let tiltFrom: number | null = null;
  let yaw = OPEN_YAW * DEG;
  let drag: { x: number; y: number; yaw: number; moved: boolean } | null = null;
  let onScreen = false;
  let lost = false;
  let width = 1;
  let height = 1;
  let frames = 0;

  const startTilt = () => {
    if (tilt > 0 || tiltFrom !== null) return;
    o.onTilt();
    if (reduce.matches) tilt = 1;
    else tiltFrom = performance.now();
  };

  const render = () => {
    movement.pose(stateAt(t), apart);
    const flat = flatFrame(viewBox, width, height, MOVEMENT.plate.thickness);
    const tilted = tilt > 0 ? fitFrame(movement.footprint(), TILT * DEG, yaw, TILT_FOV, width / height) : flat;
    const pose = cameraAt(flat, tilted, tilt, yaw);
    camera.fov = pose.fov;
    camera.aspect = width / height;
    camera.near = pose.near;
    camera.far = pose.far;
    camera.position.set(...pose.position);
    camera.up.set(...pose.up);
    camera.lookAt(...pose.target);
    camera.updateProjectionMatrix();
    setLineScale(height / (2 * pose.half), width, height);
    renderer.render(scene, camera);
    frames += 1;
  };

  const clockRuns = () => isPlaying() && heldAt(figure) === null;
  const wants = () => !lost && onScreen && document.visibilityState === "visible" && (clockRuns() || tiltFrom !== null);

  let raf = 0;
  let last = 0;
  let once = false;
  const frame = (now: number) => {
    raf = 0;
    // A frame's timestamp is when the frame began, which can come before the moment the loop was woken: never step back.
    const step = Math.min(Math.max(0, now - last) / 1000, MAX_STEP);
    last = now;
    if (clockRuns()) t += step / speedOf(figure);
    if (tiltFrom !== null) {
      const u = (now - tiltFrom) / TILT_MS;
      tilt = easeOut(u);
      if (u >= 1) tiltFrom = null;
    }
    render();
    once = false;
    if (wants()) raf = requestAnimationFrame(frame);
  };
  /** Runs the loop if something moves, stops it if nothing does. */
  const wake = () => {
    if (wants() || once) {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  /** Draws one more frame, for a change made while nothing moves. */
  const invalidate = () => {
    if (lost) return;
    once = true;
    wake();
  };

  // A new hold moves the clock to its moment; a speed or a release just wakes the loop.
  let held = heldAt(figure);
  const onFigure = () => {
    const now = heldAt(figure);
    if (now !== null && now !== held) {
      t = now;
      invalidate();
    }
    held = now;
    wake();
  };
  const unFigure = onFigureChange(figure, onFigure);
  const unPlay = subscribe(wake);
  document.addEventListener("visibilitychange", wake);
  const seen = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? false;
    wake();
  });
  seen.observe(canvas);
  const sized = new ResizeObserver(() => {
    width = Math.max(1, box.clientWidth);
    height = Math.max(1, box.clientHeight);
    renderer.setSize(width, height, false);
    invalidate();
  });
  sized.observe(box);

  const down = (ev: PointerEvent) => {
    drag = { x: ev.clientX, y: ev.clientY, yaw, moved: false };
    canvas.setPointerCapture(ev.pointerId);
  };
  const move = (ev: PointerEvent) => {
    if (!drag) return;
    const dx = ev.clientX - drag.x;
    if (!drag.moved && Math.hypot(dx, ev.clientY - drag.y) < DRAG_SLOP) return;
    drag.moved = true;
    startTilt();
    yaw = drag.yaw - dx * DRAG_TURN;
    invalidate();
  };
  const up = () => {
    drag = null;
  };
  const key = (ev: KeyboardEvent) => {
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    ev.preventDefault();
    startTilt();
    yaw += (ev.key === "ArrowLeft" ? 1 : -1) * KEY_TURN;
    invalidate();
  };
  // three's renderer keeps the context restorable on its own listener; this one swaps the poster back and forth.
  const onLost = () => {
    lost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    o.onLost();
  };
  const onRestored = () => {
    lost = false;
    render();
    o.onRestored();
    wake();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("keydown", key);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  // The first frame, drawn now so the canvas never shows empty when it replaces the poster.
  width = Math.max(1, box.clientWidth);
  height = Math.max(1, box.clientHeight);
  renderer.setSize(width, height, false);
  render();

  const stats = () => ({
    frames,
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    t,
    apart,
    tilt,
    pixelRatio: renderer.getPixelRatio(),
  });
  // For stills and tests: `{ t }` holds the figure at t seconds, `apart` lifts the parts (0 to 1), `yaw` (degrees)
  // turns the tilted view to it, `hide` lists parts to leave out by their table ids. An empty pose reads the stats.
  registerPose(o.name, (pose) => {
    if (Object.keys(pose).length === 0) return stats();
    if (pose["apart"] !== undefined) apart = Math.min(1, Math.max(0, Number(pose["apart"]) || 0));
    if (pose["yaw"] !== undefined) {
      yaw = (Number(pose["yaw"]) || 0) * DEG;
      if (tilt === 0) o.onTilt();
      tilt = 1;
      tiltFrom = null;
    }
    if (Array.isArray(pose["hide"])) movement.hide(pose["hide"].map(String));
    if (pose["t"] !== undefined) {
      const at = Number(pose["t"]);
      if (Number.isFinite(at)) hold(figure, at);
    }
    if (!lost) render();
    return stats();
  });

  return {
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      unFigure();
      unPlay();
      document.removeEventListener("visibilitychange", wake);
      seen.disconnect();
      sized.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("keydown", key);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer.dispose();
    },
  };
}
