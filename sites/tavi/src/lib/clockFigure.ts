// A figure drawn by the clock instead of by CSS: one frame loop per figure poses its drawing from `stateAt(t)` every
// frame, so a still frame is exact and the same every time. The drawing names what turns: `data-clock="escape"`,
// `"fork"` and `"balance"` take a rotation, `"hair"` (the hairspring) a new path. The figure's readouts carry
// `data-readout` (`beats`, `escape`, `balance`, `amplitude`).
//
// The rules, which the 3D movement's loop keeps too:
// - `t` moves on by real time divided by the figure's `--slow` (lib/figure.ts), a frame's step clamped at 0.25 s so a
//   stalled tab or a slow device doesn't jump;
// - the loop runs only while the page plays (lib/playback.ts), the figure is on screen and the tab is visible, and
//   asks for no frame otherwise;
// - a held figure (`data-hold`) stands still at its hold's moment and runs on from there once released. A step can ask
//   for a hold (`holds`, by the step's number); the page's play state is never touched by one.
// Under reduced motion the page starts paused, so the figure starts on its still frame until a Pause is released.

import { poseAt, readoutsAt } from "../movement/svg/escapement";
import { hairspringAt } from "../movement/svg/pieces";
import { heldAt, hold, onFigureChange, release, speedOf } from "./figure";
import { isPlaying, subscribe } from "./playback";

/** The longest step one frame may take, in seconds of real time. */
const MAX_STEP = 0.25;

/** Poses one figure for stills and tests: `{ t }` holds a clock figure at `t` seconds. */
type Poser = (pose: Readonly<Record<string, unknown>>) => unknown;

declare global {
  interface Window {
    /** Development builds only: poses a figure by its id for stills and tests. */
    taviPose?: (figure: string, pose: Readonly<Record<string, unknown>>) => unknown;
  }
}

const posers = new Map<string, Poser>();

/**
 * Registers a figure under `window.taviPose(figure, pose)`, the one dev hook, in development builds only. Each kind of
 * figure gives its own meaning to `pose`.
 */
export function registerPose(figure: string, poser: Poser): void {
  if (!import.meta.env.DEV) return;
  posers.set(figure, poser);
  window.taviPose = (id, pose) => posers.get(id)?.(pose);
}

export interface ClockFigureOptions {
  /** The moment each step holds the figure at, by the step's number. A step without one lets it run. */
  readonly holds?: Readonly<Record<string, number>>;
  /** The clock's time at first paint, where nothing holds it: the moment the drawing is built at. */
  readonly start?: number;
}

/** Starts the frame loop of the figure `#<name>-figure`, and registers it with the dev hook as `name`. */
export function startClockFigure(name: string, { holds = {}, start = 0 }: ClockFigureOptions = {}): void {
  const figure = document.getElementById(`${name}-figure`);
  if (!figure) return;
  const turning = (key: string) => [...figure.querySelectorAll<SVGElement>(`[data-clock="${key}"]`)];
  const groups = { escape: turning("escape"), fork: turning("fork"), balance: turning("balance") };
  const hair = turning("hair");
  const readouts = [...figure.querySelectorAll<HTMLElement>("[data-readout]")];

  let t = start;
  const render = () => {
    const pose = poseAt(t);
    const rotate = (els: readonly SVGElement[], deg: number) => {
      for (const el of els) el.setAttribute("transform", `rotate(${deg.toFixed(3)})`);
    };
    rotate(groups.escape, pose.escape);
    rotate(groups.fork, pose.fork);
    rotate(groups.balance, pose.balance);
    if (hair.length) {
      const d = hairspringAt(pose.theta);
      for (const el of hair) el.setAttribute("d", d);
    }
    const text = readoutsAt(pose);
    for (const el of readouts) {
      const value = text[el.dataset.readout ?? ""];
      if (value !== undefined && el.textContent !== value) el.textContent = value;
    }
    return pose;
  };

  let onScreen = false;
  const running = () => heldAt(figure) === null && isPlaying() && onScreen && document.visibilityState === "visible";

  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    raf = 0;
    if (!running()) return;
    t += Math.min((now - last) / 1000, MAX_STEP) / speedOf(figure);
    last = now;
    render();
    raf = requestAnimationFrame(frame);
  };
  const update = () => {
    if (running()) {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  // A new step holds the figure at its moment, or lets it run; a new hold moves the clock there.
  let step: string | undefined;
  let held: number | null = null;
  const sync = () => {
    if (figure.dataset.step !== step) {
      step = figure.dataset.step;
      const moment = step === undefined ? undefined : holds[step];
      // Each call fires the figure's event, which runs `sync` again for the hold.
      if (moment !== undefined) hold(figure, moment);
      else release(figure);
    }
    const now = heldAt(figure);
    if (now !== null && now !== held) {
      t = now;
      render();
    }
    held = now;
    update();
  };

  render();
  sync();
  onFigureChange(figure, sync);
  subscribe(update);
  document.addEventListener("visibilitychange", update);
  new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? false;
    update();
  }).observe(figure);

  registerPose(name, (pose) => {
    const at = Number(pose.t);
    if (!Number.isFinite(at)) return undefined;
    hold(figure, at);
    return poseAt(at);
  });
}
