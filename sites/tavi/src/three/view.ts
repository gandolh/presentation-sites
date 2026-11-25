// One view of the 3D movement: a WebGL renderer on the island's canvas, the camera, the frame loop and the drag. The
// loop keeps the rules the clock-drawn figures keep (lib/clockFigure.ts): `t` moves on by real time over the figure's
// `--slow`, a frame's step clamped at 0.25 s; it renders only while something moves, so not while the page is
// paused, the figure held, the canvas off screen or the tab hidden. The first frame is the poster's flat view
// (camera.ts); the first drag, or an arrow key on the focused canvas, eases to the prototype's tilt in 420 ms (a jump
// under reduced motion), and after that a sideways drag turns it.
//
// Chapter 5's view does more, all of it read from and written to the figure element (lib/figure.ts), so the tray, the
// steps and the parts list stay in step with it:
// - it comes apart with the figure's `--e`: a step's new value runs over the prototype's timing (a jump under reduced
//   motion), a dragged or running slider is followed as it moves. Taking it apart from the flat view tilts it, since
//   nothing lifts that the flat view could show;
// - it turns with the figure's `data-turn`, which a drag or an arrow key on the canvas writes back;
// - it lights the figure's `data-focus` and drops every other part to the ghost pair; a click or a tap that isn't a
//   drag chooses the part under it (`data-pick`), or none over empty paper;
// - a step that names its parts (`frames`) frames them, lights them and labels only them, as focus by subtraction
//   does in the drawings, while Take apart stands where the step put it; moved away, the view goes back to the whole
//   movement. On a phone the lit part is framed instead. Each framing eases from the one before;
// - it labels the parts, in two columns on a desktop, and on a phone the lit part alone, each label fading while its
//   anchor is behind another part (a ray cast for a few labels each frame, and for all of them on a still frame);
// - it winds: the figure's `data-reserve` (hours of power, 0 to 41, the tray's Wind) coils the mainspring, steps the
//   ratchet wheel round a tooth at a time and sets the balance's amplitude, and it runs down in real time over the
//   figure's speed while the clock runs. With no power the clock stands still.

import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { registerPose } from "../lib/clockFigure.ts";
import {
  announce,
  apartOf,
  heldAt,
  hold,
  markClock,
  onFigureChange,
  pickOf,
  reserveOf,
  setPick,
  setPose,
  setReserve,
  setTurn,
  speedOf,
  turnOf,
} from "../lib/figure.ts";
import { isPlaying, subscribe } from "../lib/playback.ts";
import { RESERVE_HOURS, stateAt } from "../movement/clock.ts";
import { MOVEMENT, type PartId } from "../movement/parts.ts";
import {
  cameraAt,
  easeOut,
  fitFrame,
  flatFrame,
  mixFrame,
  OPEN_YAW,
  parseViewBox,
  project,
  tiltFor,
  TILT_FOV,
  wrapTurn,
  yawOf,
  type CameraPose,
  type Frame,
} from "./camera.ts";
import { readPalette } from "./colours.ts";
import { createLabelLayer, type LabelLayer } from "./labelLayer.ts";
import { anchorAt, apartMs, inOutCubic, LABELLED, labelledFor, litWith, smooth, type Labelled } from "./labelled.ts";
import { DESKTOP_LABELS, labelRoom, layoutLabels, PHONE_LABELS, type LabelIn, type LabelOptions } from "./labels.ts";
import { createMovement } from "./movement.ts";
import { hidden as anchorHidden, partAtPoint } from "./picking.ts";
import { setLineScale } from "./shapes.ts";

/** Chapter 5's part of a view: where its labels go and what each step frames. */
export interface ChapterParts {
  /** The layer of label buttons (`[data-label]`) and the SVG of their leaders (`[data-leader]`). */
  readonly labels: HTMLElement;
  readonly leaders: SVGSVGElement;
  /** The parts each step frames, by the step's name; a step not named frames the whole movement. */
  readonly frames: Readonly<Record<string, readonly PartId[]>>;
}

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
  /** Chapter 5's view: it comes apart, turns, lights, frames and labels. The hero's has none of it. */
  readonly chapter?: ChapterParts | null;
}

export interface View {
  dispose(): void;
}

/** The longest step one frame may take, in seconds of real time. */
const MAX_STEP = 0.25;
/** How long the first tilt and a change of framing take, in milliseconds: the stylesheet's --dur-long. */
const TILT_MS = 420;
/** Radians of turn per pixel dragged, and per arrow key. */
const DRAG_TURN = 0.006;
const KEY_TURN = (10 * Math.PI) / 180;
/** A pointer must travel this far, in CSS pixels, before a press counts as a drag. */
const DRAG_SLOP = 4;
/** The clock's start: half a beat in, the balance passing rest and the fork in the middle, as the poster draws them. */
const REST = 0.5 / (MOVEMENT.spec.vph / 3600);
const DEG = Math.PI / 180;
/**
 * A framing of a few parts keeps room round them: the view is this much bigger than the parts' own fit, and never
 * smaller than MIN_HALF (its half-height in plane units), so a small part keeps its neighbours in sight.
 */
const FRAME_ROOM = 1.25;
const MIN_HALF = 90;
/** How many labels' anchors are tested for being hidden, each frame while the view moves. */
const RAYS_PER_FRAME = 4;
/** How far a label fades while its anchor is hidden, and while another part is lit. */
const HIDDEN_FADE = 0.4;
const OTHER_FADE = 0.5;

/** Where a phone stops and the labels' two columns start: the stylesheet's phone width. */
const PHONE = "(max-width: 40rem)";

/** Starts a view on `canvas`, or returns null where the browser can't make a WebGL 2 context. */
export function startView(o: ViewOptions): View | null {
  const { canvas, box, figure } = o;
  const chapter = o.chapter ?? null;
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
  const phone = matchMedia(PHONE);

  let t = heldAt(figure) ?? REST;
  // Hours of power left, chapter 5's alone: the hero's spring stays as drawn and its balance at the drawn amplitude.
  let reserve = chapter ? reserveOf(figure) : RESERVE_HOURS;
  let shownMinute = Math.ceil(reserve * 60);
  let tilt = 0;
  let tiltFrom: number | null = null;
  let turn = chapter ? turnOf(figure) : 0;
  let yaw = yawOf(turn);
  let drag: { x: number; y: number; yaw: number; moved: boolean } | null = null;
  let onScreen = false;
  let lost = false;
  let width = 1;
  let height = 1;
  let frames = 0;

  // Taking it apart: what the figure asks for, what shows, and a run between them.
  let apart = chapter ? apartOf(figure) : 0;
  let apartTarget = apart;
  let run: { from: number; to: number; t0: number; ms: number } | null = null;
  // The part pointed at or chosen, the parts lit now, and the framing: its key, the frame last drawn, and an ease from
  // an earlier frame.
  let lit: PartId | null = null;
  let lighting = "";
  let litSet: ReadonlySet<PartId> | null = null;
  let framing = "";
  let lastFrame: Frame | null = null;
  let frameFrom: { frame: Frame; t0: number } | null = null;

  const startTilt = () => {
    if (tilt > 0 || tiltFrom !== null) return;
    o.onTilt();
    if (reduce.matches) tilt = 1;
    else tiltFrom = performance.now();
  };

  // ---- What the step names -----------------------------------------------------------------------------------------
  /** The step's own parts, while Take apart stands where the step put it; else none. */
  const stepParts = (): readonly PartId[] | undefined => {
    if (!chapter) return undefined;
    const name = figure.dataset.step ?? "";
    const parts = chapter.frames[name];
    if (!parts) return undefined;
    const own = figure.closest("section")?.querySelector<HTMLElement>(`.step[data-step="${name}"]`)?.dataset.explode;
    return own !== undefined && Math.abs(Number(own) - apartTarget) < 0.005 ? parts : undefined;
  };
  /** Lights the part pointed at, else the step's parts, else every part. */
  const relight = () => {
    const ids = lit ? litWith(lit) : (stepParts() ?? null);
    const key = ids ? ids.join(" ") : "";
    if (key === lighting) return;
    lighting = key;
    litSet = ids ? new Set(ids) : null;
    movement.light(ids);
  };

  // ---- Labels ----------------------------------------------------------------------------------------------------
  const layer: LabelLayer | null = chapter ? createLabelLayer(chapter.labels, chapter.leaders) : null;
  const named = new Map<PartId, Labelled>(LABELLED.map((p) => [p.id, p]));
  const labelled = layer ? layer.ids.flatMap((id) => named.get(id) ?? []) : [];
  const behind = new Map<PartId, boolean>();
  let rayAt = 0;
  const shownIds = new Set<PartId>();
  const labelOptions = (): LabelOptions => ({ width, height, ...(phone.matches ? PHONE_LABELS : DESKTOP_LABELS) });
  /**
   * How far the labels show. A phone shows the lit part's alone. On a desktop they come in as the movement comes apart,
   * as the prototype's do, and a step that names its parts labels them in full.
   */
  const labelsOn = () => {
    if (phone.matches) return lit && named.has(lit) ? tilt : 0;
    return (stepParts() ? 1 : smooth(0.3, 0.6, apart)) * tilt;
  };
  const room = (on: number) => {
    if (!layer || on <= 0) return 0;
    const ids = phone.matches ? (lit ? [lit] : []) : layer.ids;
    return (
      labelRoom(
        ids.map((id) => layer.width(id)),
        labelOptions(),
      ) * (phone.matches ? 1 : on)
    );
  };
  /** Tests whether labels' anchors are behind other parts: `all` on a still frame, else a few in turn. */
  const testHidden = (all: boolean) => {
    const list = labelled.filter((p) => shownIds.has(p.id));
    if (list.length === 0) return;
    const n = all ? list.length : Math.min(RAYS_PER_FRAME, list.length);
    for (let k = 0; k < n; k++) {
      const p = list[(rayAt + k) % list.length];
      if (p) behind.set(p.id, anchorHidden(movement, camera, anchorAt(p, apart), p.id, litSet));
    }
    rayAt = (rayAt + n) % list.length;
  };
  const placeLabels = (pose: CameraPose, still: boolean) => {
    if (!layer) return;
    const on = lost ? 0 : labelsOn();
    if (on <= 0.01) {
      shownIds.clear();
      layer.hide();
      delete box.dataset.labels;
      return;
    }
    box.dataset.labels = "";
    const items: LabelIn[] = [];
    const only = stepParts();
    for (const p of labelled) {
      if (phone.matches ? p.id !== lit : only !== undefined && !only.includes(p.id)) continue;
      const [x, y] = project(anchorAt(p, apart), pose, width, height);
      items.push({ id: p.id, x, y, w: layer.width(p.id) });
    }
    const out = layoutLabels(items, labelOptions());
    shownIds.clear();
    for (const l of out) shownIds.add(l.id as PartId);
    testHidden(still);
    layer.place(out, on, (id) => (behind.get(id) ? HIDDEN_FADE : 1) * (lit && id !== lit ? OTHER_FADE : 1), lit);
  };

  // ---- The frame ---------------------------------------------------------------------------------------------------
  /** The parts the camera fits now: the lit part on a phone, else the step's, else every part. */
  const framed = (): readonly PartId[] | undefined => {
    if (!chapter) return undefined;
    if (phone.matches && lit) return litWith(lit);
    return stepParts();
  };
  const fitNow = (tiltDeg: number, on: number): Frame => {
    const only = framed();
    const points = (only && movement.footprint(only)) || [];
    const all = points.length > 0 ? points : movement.footprint();
    const side = phone.matches ? "right" : "both";
    const fit = fitFrame(all, tiltDeg * DEG, yaw, TILT_FOV, width / height, room(on), side);
    return only ? { target: fit.target, half: Math.max(MIN_HALF, fit.half * FRAME_ROOM) } : fit;
  };

  let still = true;
  const render = () => {
    movement.pose(stateAt(t, { reserve }), apart, chapter ? reserve / RESERVE_HOURS : undefined);
    markClock(figure, t);
    const flat = flatFrame(viewBox, width, height, MOVEMENT.plate.thickness);
    const tiltDeg = tiltFor(apart);
    let tilted = flat;
    if (tilt > 0) {
      const on = labelsOn();
      // A new framing (a step, a lit part on a phone, a label's room) eases from the frame last drawn.
      const key = `${(framed() ?? []).join(" ")}|${phone.matches ? (lit ?? "") : ""}`;
      if (key !== framing) {
        if (lastFrame && !reduce.matches) frameFrom = { frame: lastFrame, t0: performance.now() };
        framing = key;
      }
      tilted = fitNow(tiltDeg, on);
      if (frameFrom) {
        const u = (performance.now() - frameFrom.t0) / TILT_MS;
        if (u >= 1) frameFrom = null;
        else tilted = mixFrame(frameFrom.frame, tilted, easeOut(u));
      }
      lastFrame = tilted;
    }
    const pose = cameraAt(flat, tilted, tilt, yaw, tiltDeg);
    camera.fov = pose.fov;
    camera.aspect = width / height;
    camera.near = pose.near;
    camera.far = pose.far;
    camera.position.set(...pose.position);
    camera.up.set(...pose.up);
    camera.lookAt(...pose.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    setLineScale(height / (2 * pose.half), width, height);
    renderer.render(scene, camera);
    placeLabels(pose, still);
    frames += 1;
  };

  const clockRuns = () => isPlaying() && heldAt(figure) === null && reserve > 0;
  const moving = () => tiltFrom !== null || run !== null || frameFrom !== null;
  const wants = () => !lost && onScreen && document.visibilityState === "visible" && (clockRuns() || moving());

  let raf = 0;
  let last = 0;
  let once = false;
  const frame = (now: number) => {
    raf = 0;
    // A frame's timestamp is when the frame began, which can come before the moment the loop was woken: never step back.
    const step = Math.min(Math.max(0, now - last) / 1000, MAX_STEP);
    last = now;
    let tell = false;
    if (clockRuns()) {
      const slow = speedOf(figure);
      t += step / slow;
      if (chapter) {
        // The spring gives up an hour of power in an hour of the figure's own time; the tray hears of it a minute at a time.
        reserve = Math.max(0, reserve - step / slow / 3600);
        setReserve(figure, reserve, true);
        const minute = Math.ceil(reserve * 60);
        if (minute !== shownMinute) {
          shownMinute = minute;
          tell = true;
        }
      }
    }
    if (tiltFrom !== null) {
      const u = (now - tiltFrom) / TILT_MS;
      tilt = easeOut(u);
      if (u >= 1) tiltFrom = null;
    }
    if (run) {
      const u = Math.min(1, Math.max(0, (now - run.t0) / run.ms));
      // A run ends on its target exactly: from + (to - from) can miss it by a rounding error.
      apart = u >= 1 ? run.to : run.from + (run.to - run.from) * inOutCubic(u);
      if (u >= 1) run = null;
    }
    // A frame with nothing left to move is the last for now: every label's anchor is tested on it.
    still = !wants() && !drag;
    render();
    once = false;
    if (wants()) raf = requestAnimationFrame(frame);
    // Told last, so the figure's own listener finds the loop already scheduled.
    if (tell) announce(figure);
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
  function invalidate() {
    if (lost) return;
    once = true;
    wake();
  }

  // ---- The figure's state ------------------------------------------------------------------------------------------
  // A new hold moves the clock to its moment; a speed or a release just wakes the loop. In chapter 5 the take-apart,
  // the turn and the lit part follow the figure too.
  let held = heldAt(figure);
  let step = figure.dataset.step;
  const onFigure = () => {
    const now = heldAt(figure);
    if (now !== null && now !== held) {
      t = now;
      invalidate();
    }
    held = now;
    if (chapter) {
      const power = reserveOf(figure);
      if (power !== reserve) {
        reserve = power;
        shownMinute = Math.ceil(power * 60);
        invalidate();
      }
      const e = apartOf(figure);
      if (e !== apartTarget) {
        // Moved off the step's own value, the view frames and lights the whole movement again.
        apartTarget = e;
        if (figure.classList.contains("dragging") || reduce.matches) {
          apart = e;
          run = null;
        } else run = { from: apart, to: e, t0: performance.now(), ms: apartMs(apart, e) };
        if (e > 0) startTilt();
        invalidate();
      }
      const next = turnOf(figure);
      if (Math.abs(next - turn) > 0.05) {
        turn = next;
        yaw = yawOf(turn);
        startTilt();
        invalidate();
      }
      const focus = figure.dataset.focus;
      const nextLit = focus === undefined ? null : labelledFor(focus);
      if (nextLit !== lit) {
        lit = nextLit;
        // On a phone the lit part is framed, which the flat view can't do.
        if (lit && phone.matches) startTilt();
        invalidate();
      }
      if (figure.dataset.step !== step) {
        step = figure.dataset.step;
        invalidate();
      }
      relight();
    }
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
    layer?.measure();
    invalidate();
  });
  sized.observe(box);
  const onPhone = () => {
    framing = "";
    invalidate();
  };
  phone.addEventListener("change", onPhone);
  const remeasure = () => {
    layer?.measure();
    invalidate();
  };
  void document.fonts.ready.then(remeasure);

  /** Turns the view by a drag or a key, and tells the figure, so the tray's Turn follows. */
  const turnTo = (next: number) => {
    yaw = next;
    if (!chapter) return;
    turn = wrapTurn(OPEN_YAW - yaw / DEG);
    setTurn(figure, turn);
  };
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
    turnTo(drag.yaw - dx * DRAG_TURN);
    invalidate();
  };
  const up = (ev: PointerEvent) => {
    const tap = drag && !drag.moved;
    drag = null;
    // The frame after a drag is a still one, which tests every label's anchor.
    invalidate();
    if (!tap || !chapter || lost) return;
    // A press that didn't drag chooses the part under it, or none over empty paper; the chosen part again lets it go.
    const rect = canvas.getBoundingClientRect();
    const part = partAtPoint(movement, camera, ev.clientX - rect.left, ev.clientY - rect.top, width, height);
    setPick(figure, part !== null && part !== pickOf(figure) ? part : null);
    invalidate();
  };
  const cancel = () => {
    drag = null;
  };
  const key = (ev: KeyboardEvent) => {
    if (chapter && ev.key === "Escape" && pickOf(figure) !== null) {
      setPick(figure, null);
      return;
    }
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    ev.preventDefault();
    startTilt();
    turnTo(yaw + (ev.key === "ArrowLeft" ? 1 : -1) * KEY_TURN);
    invalidate();
  };
  // three's renderer keeps the context restorable on its own listener; this one swaps the poster back and forth.
  const onLost = () => {
    lost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    layer?.hide();
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
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("keydown", key);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  // The first frame, drawn now so the canvas never shows empty when it replaces the poster. A page opened with chapter
  // 5 already apart or turned starts tilted there.
  width = Math.max(1, box.clientWidth);
  height = Math.max(1, box.clientHeight);
  renderer.setSize(width, height, false);
  if (chapter) {
    const focus = figure.dataset.focus;
    lit = focus === undefined ? null : labelledFor(focus);
    relight();
    if (apart > 0 || turn !== 0) {
      o.onTilt();
      tilt = 1;
    }
  }
  render();

  const stats = () => ({
    frames,
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    t,
    reserve,
    spring: movement.winding().wind,
    ratchet: movement.winding().teeth,
    balance: stateAt(t, { reserve }).balance,
    apart,
    tilt,
    turn,
    lit,
    pixelRatio: renderer.getPixelRatio(),
  });
  // For stills and tests: `{ t }` holds the figure at t seconds, `apart` lifts the parts (0 to 1) at once, `yaw`
  // (degrees) turns the tilted view to it and `turn` (degrees from the opening view) as the tray's Turn does, `hide`
  // lists parts to leave out by their table ids, `reserve` (hours) winds chapter 5's spring as the tray's Wind does. An
  // empty pose reads the stats.
  registerPose(o.name, (pose) => {
    if (Object.keys(pose).length === 0) return stats();
    const tiltNow = () => {
      if (tilt === 0) o.onTilt();
      tilt = 1;
      tiltFrom = null;
    };
    if (pose["apart"] !== undefined) {
      apart = Math.min(1, Math.max(0, Number(pose["apart"]) || 0));
      apartTarget = apart;
      run = null;
      if (chapter) setPose(figure, figure.dataset.step ?? "", { e: apart });
      if (apart > 0) tiltNow();
    }
    if (pose["yaw"] !== undefined) {
      turnTo((Number(pose["yaw"]) || 0) * DEG);
      tiltNow();
    }
    if (pose["turn"] !== undefined) {
      turn = wrapTurn(Number(pose["turn"]) || 0);
      yaw = yawOf(turn);
      if (chapter) setTurn(figure, turn);
      tiltNow();
    }
    if (Array.isArray(pose["hide"])) movement.hide(pose["hide"].map(String));
    if (pose["reserve"] !== undefined && chapter) {
      reserve = Math.min(RESERVE_HOURS, Math.max(0, Number(pose["reserve"]) || 0));
      shownMinute = Math.ceil(reserve * 60);
      setReserve(figure, reserve);
    }
    if (pose["t"] !== undefined) {
      const at = Number(pose["t"]);
      if (Number.isFinite(at)) hold(figure, at);
    }
    frameFrom = null;
    still = true;
    if (!lost) render();
    return stats();
  });

  return {
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      unFigure();
      unPlay();
      document.removeEventListener("visibilitychange", wake);
      phone.removeEventListener("change", onPhone);
      seen.disconnect();
      sized.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("keydown", key);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      layer?.hide();
      renderer.dispose();
    },
  };
}
