// Chapter 5's tray: the figure's Pause and Speed, a Take apart / Put back button, and two sliders, Take apart and
// Turn. A React island, hydrated when it scrolls into view. Nothing lives in React: Take apart is the figure's `--e`,
// which the steps set too, and Turn is its `data-turn`, which a drag on the 3D view writes back (lib/figure.ts), so
// the drawing, the 3D view and the steps all follow the same two values.
// - The button runs Take apart to 100% or back to 0 over the prototype's timing, the slider moving with it; under
//   reduced motion it jumps. A drag on the slider, or a new step, stops the run where it is.
// - Turn turns the 3D view, from -180 to 180 degrees about the view it opens on; it shows only while the 3D view does
//   (the drawing can't turn), and its first move tilts the view from its flat first frame.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { apartOf, onFigureChange, setPose, setTurn, turnOf } from "../../lib/figure";
import { apartMs, inOutCubic } from "../../three/labelled";
import FigureTray from "../chapter/FigureTray";
import { Slider } from "../ui/Slider";

interface ControlProps {
  /** The figure's id. */
  figure: string;
}

/** One of the figure's values, read from the element and followed as it changes. */
function useFigure<T>(figure: string, read: (el: HTMLElement) => T, server: T): T {
  const subscribe = useCallback(
    (listener: () => void) => {
      const el = document.getElementById(figure);
      return el ? onFigureChange(el, listener) : () => undefined;
    },
    [figure],
  );
  return useSyncExternalStore(
    subscribe,
    () => {
      const el = document.getElementById(figure);
      return el ? read(el) : server;
    },
    () => server,
  );
}

const readApart = (el: HTMLElement) => Math.round(apartOf(el) * 100);
const readTurn = (el: HTMLElement) => Math.round(turnOf(el));

/** The run the button starts: Take apart moving to 0 or 1 frame by frame, stopped by anything else that moves it. */
function useRun(figure: string) {
  const raf = useRef(0);
  const [to, setTo] = useState<number | null>(null);
  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    document.getElementById(figure)?.classList.remove("dragging");
    setTo(null);
  }, [figure]);
  useEffect(() => stop, [stop]);
  const start = useCallback(
    (target: number) => {
      const el = document.getElementById(figure);
      if (!el) return;
      stop();
      const from = apartOf(el);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPose(el, el.dataset.step ?? "", { e: target });
        return;
      }
      const t0 = performance.now();
      const ms = apartMs(from, target);
      let wrote = from;
      // The lifted parts follow each frame of the run as they follow a drag, without the drawing's own easing.
      el.classList.add("dragging");
      setTo(target);
      const tick = (now: number) => {
        if (apartOf(el) !== wrote) {
          stop();
          return;
        }
        const u = Math.min(1, Math.max(0, (now - t0) / ms));
        wrote = Math.round((from + (target - from) * inOutCubic(u)) * 10_000) / 10_000;
        setPose(el, el.dataset.step ?? "", { e: wrote });
        if (u < 1) raf.current = requestAnimationFrame(tick);
        else stop();
      };
      raf.current = requestAnimationFrame(tick);
    },
    [figure, stop],
  );
  return { to, start, stop };
}

/** The button, named for what it does next: "Take apart" while the movement is mostly together, then "Put back". */
function ApartButton({ figure, run }: ControlProps & { run: ReturnType<typeof useRun> }) {
  const apart = useFigure(figure, readApart, 0);
  const back = run.to !== null ? run.to > 0.5 : apart > 50;
  return (
    <button
      type="button"
      className="quiet apart-run"
      onClick={() => {
        run.start(back ? 0 : 1);
      }}
    >
      {back ? "Put back" : "Take apart"}
    </button>
  );
}

/** Take apart, 0 to 100%: the figure's `--e`. While its thumb is dragged the lifted parts follow without easing. */
function TakeApart({ figure, run }: ControlProps & { run: ReturnType<typeof useRun> }) {
  const apart = useFigure(figure, readApart, 0);
  return (
    <Slider
      label="Take apart"
      value={apart}
      readout={`${apart}%`}
      getAriaValueText={(value) => (value === 0 ? "Assembled" : `${value}% apart`)}
      onValueChange={(value, reason) => {
        const el = document.getElementById(figure);
        if (!el) return;
        run.stop();
        el.classList.toggle("dragging", reason === "drag");
        setPose(el, el.dataset.step ?? "", { e: value / 100 });
      }}
      onValueCommitted={() => {
        document.getElementById(figure)?.classList.remove("dragging");
      }}
    />
  );
}

/** Turn, -180 to 180 degrees: the figure's `data-turn`, which the 3D view follows and writes back. */
function Turn({ figure }: ControlProps) {
  const turn = useFigure(figure, readTurn, 0);
  return (
    <div className="turn-cell">
      <Slider
        label="Turn"
        value={turn}
        min={-180}
        max={180}
        largeStep={15}
        readout={`${turn < 0 ? "−" : ""}${Math.abs(turn)}°`}
        getAriaValueText={(value) =>
          value === 0 ? "Not turned" : `Turned ${Math.abs(value)} degrees to the ${value > 0 ? "right" : "left"}`
        }
        onValueChange={(value) => {
          const el = document.getElementById(figure);
          if (el) setTurn(el, value);
        }}
      />
    </div>
  );
}

export default function TogetherTray({ figure }: ControlProps) {
  const run = useRun(figure);
  return (
    <FigureTray figure={figure} actions={<ApartButton figure={figure} run={run} />}>
      <TakeApart figure={figure} run={run} />
      <Turn figure={figure} />
    </FigureTray>
  );
}
