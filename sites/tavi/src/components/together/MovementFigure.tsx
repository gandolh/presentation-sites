// The 3D movement: one React island, mounted on the hero's figure and on chapter 5's, with the drawing passed in as
// its child so the first paint is always the poster. Once hydrated it climbs the fallback ladder:
// 1. a desktop (a wide screen and a fine pointer) with WebGL 2 loads three.js and the scene, and the canvas takes the
//    poster's place in the same box, opening on the poster's flat view;
// 2. a phone keeps the poster in chapter 5 and offers "Turn it in 3D", which does the same on a press; once three.js is
//    on the page (the hero loaded it), chapter 5 turns on its own. The hero turns on any device with WebGL 2, after the
//    first paint, once it is on screen;
// 3. without WebGL, or if the context can't be made, the poster stays, with one quiet line in chapter 5; a lost
//    context swaps the poster back, keeping the clock and the play state, until the context returns;
// 4. under reduced motion the page starts paused, so the movement starts still until a Pause is released;
// 5. without scripting the island never runs: the server's render is the poster.
// three.js is imported only here, dynamically, so nothing else on the page waits on it.
//
// Chapter 5's island also carries the labels the 3D view places over its canvas (a button for each labelled part, a
// leader for each in one SVG) and, under the figure, the parts list (PartsList.tsx), which works on every rung.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { onFigureChange, pickOf, setPick } from "../../lib/figure";
import type { PartId } from "../../movement/parts";
import { LABELLED } from "../../three/labelled";
import type { View } from "../../three/view";
import { PartsList } from "./PartsList";

/** Where the island stands on the ladder; `data-gl` on its box, which the stylesheet reads. */
type Rung = "poster" | "offer" | "loading" | "live" | "lost" | "flat";
type Mode = "hero" | "chapter";

interface Props {
  /** The figure element's id: the movement follows its speed and hold (lib/figure.ts). */
  figure: string;
  /** Its name under the dev hook, `window.taviPose(name, pose)`. */
  name: string;
  /** The hero turns 3D on its own on any device; chapter 5 offers a button on a phone. */
  mode: Mode;
  /** What the 3D view shows, for a screen reader. */
  label: string;
  /** Chapter 5's steps: the parts each step frames, by the step's number; a step not named frames every part. */
  frames?: Readonly<Record<string, readonly PartId[]>>;
  /** The poster: the movement drawn as SVG. */
  children: ReactNode;
}

const NO_FRAMES: Readonly<Record<string, readonly PartId[]>> = {};

const DESKTOP = "(min-width: 64rem) and (pointer: fine)";

let loaded = false;
/** The scene's chunk, three.js in it, loaded once for the page however many figures ask. */
async function loadScene() {
  const scene = await import("../../three/view");
  loaded = true;
  return scene;
}

/** A tiny store for the rung, so the effects below move it without setting React state in an effect's body. */
function createLadder() {
  let rung: Rung = "poster";
  const listeners = new Set<() => void>();
  return {
    get: () => rung,
    set(next: Rung) {
      if (next === rung) return;
      rung = next;
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export default function MovementFigure({ figure, name, mode, label, frames = NO_FRAMES, children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const leaders = useRef<SVGSVGElement>(null);
  const [ladder] = useState(createLadder);
  const rung = useSyncExternalStore(ladder.subscribe, ladder.get, () => "poster" as const);
  const fallback: Rung = mode === "chapter" ? "flat" : "poster";
  const followFigure = useCallback(
    (listener: () => void) => {
      const el = document.getElementById(figure);
      return el ? onFigureChange(el, listener) : () => undefined;
    },
    [figure],
  );
  const picked = useSyncExternalStore(
    followFigure,
    () => {
      const el = document.getElementById(figure);
      return el ? pickOf(el) : null;
    },
    () => null,
  );
  const active = rung === "loading" || rung === "live" || rung === "lost";

  // Which rung, once hydrated: no WebGL 2 keeps the poster; a phone's chapter 5 offers the button; otherwise the scene
  // loads as soon as the figure is on screen (chapter 5 hydrates 200px before it, and loads from there).
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (typeof WebGL2RenderingContext === "undefined") {
      ladder.set(fallback);
      return;
    }
    if (mode === "chapter" && !loaded && !matchMedia(DESKTOP).matches) {
      ladder.set("offer");
      return;
    }
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near.disconnect();
        ladder.set("loading");
      },
      { rootMargin: mode === "chapter" ? "200px" : "0px" },
    );
    near.observe(el);
    return () => {
      near.disconnect();
    };
  }, [ladder, mode, fallback]);

  // The scene, from the first load until the island goes: started on the canvas, which shows once it has drawn.
  useEffect(() => {
    if (!active) return;
    let view: View | null = null;
    let gone = false;
    const el = box.current;
    loadScene().then(
      ({ startView }) => {
        const host = document.getElementById(figure);
        const poster = el?.querySelector("svg.movement");
        if (gone || !el || !host || !poster || !canvas.current) return;
        view = startView({
          canvas: canvas.current,
          box: el,
          figure: host,
          viewBox: poster.getAttribute("viewBox") ?? "",
          name,
          chapter:
            mode === "chapter" && labels.current && leaders.current
              ? { labels: labels.current, leaders: leaders.current, frames }
              : null,
          onLost: () => {
            ladder.set("lost");
          },
          onRestored: () => {
            ladder.set("live");
          },
          onTilt: () => {
            el.dataset.tilted = "";
          },
        });
        ladder.set(view ? "live" : fallback);
      },
      () => {
        if (!gone) ladder.set(fallback);
      },
    );
    return () => {
      gone = true;
      view?.dispose();
    };
  }, [active, figure, name, mode, frames, ladder, fallback]);

  // While the canvas shows, it is the figure a screen reader meets; the poster comes back with the poster.
  useEffect(() => {
    const poster = box.current?.querySelector("svg.movement");
    if (rung === "live") poster?.setAttribute("aria-hidden", "true");
    else poster?.removeAttribute("aria-hidden");
  }, [rung]);

  const chapter = mode === "chapter";
  const figureBox = (
    <div ref={box} className="movement-figure" data-gl={rung}>
      {children}
      {active && (
        <canvas
          ref={canvas}
          className="movement-canvas"
          tabIndex={rung === "live" ? 0 : -1}
          role="img"
          aria-label={label}
          aria-hidden={rung === "live" ? undefined : true}
        />
      )}
      {chapter && active && (
        <>
          <svg ref={leaders} className="leaders" aria-hidden="true">
            {LABELLED.map((part) => (
              <g key={part.id} data-leader={part.id}>
                <path />
                <circle r="2.2" />
              </g>
            ))}
          </svg>
          {/* Each label is a button too: a click lights its part, as a click on the part does. */}
          <div ref={labels} className="labels">
            {LABELLED.map((part) => (
              <button
                key={part.id}
                type="button"
                className="label"
                data-label={part.id}
                aria-pressed={picked === part.id}
                onClick={() => {
                  const el = document.getElementById(figure);
                  if (el) setPick(el, pickOf(el) === part.id ? null : part.id);
                }}
              >
                {part.label}
              </button>
            ))}
          </div>
        </>
      )}
      {rung === "offer" && (
        <button
          type="button"
          className="quiet turn-3d"
          onClick={() => {
            ladder.set("loading");
          }}
        >
          Turn it in 3D
        </button>
      )}
      {rung === "flat" && <p className="gl-note">This browser can’t turn it in 3D; here it is flat.</p>}
      {chapter && rung === "live" && (
        <p className="gl-hint" aria-hidden="true">
          <span className="max-sm:hidden">Drag sideways to turn it; click a part to light it.</span>
          <span className="sm:hidden">Drag to turn it, tap a part to light it.</span>
        </p>
      )}
    </div>
  );
  if (!chapter) return figureBox;
  return (
    <>
      {figureBox}
      <PartsList figure={figure} />
    </>
  );
}
