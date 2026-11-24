// A figure is an element holding a drawing: a chapter's sticky card. Its state lives on the element, not in React,
// so the steps' module script and the tray's island read and write the same thing:
// - the pose: `data-step` (which step's parts stay in colour) and `--e` (how far the lifted parts have risen);
// - the part the prose points at: `data-focus`, and `is-focus` on that part's groups in the drawing;
// - the speed: `--slow` (1, 10 or 100), which stretches every ticking duration in the stylesheet.
// Every change fires one `tavi:figure` event on the figure.

export type Speed = 1 | 10 | 100;

/** A pose's values: `e` is how far the lift groups have risen, 0 (assembled) to 1. */
export interface Pose {
  readonly e: number;
}

const EVENT = "tavi:figure";
const SPEEDS: readonly Speed[] = [1, 10, 100];

function changed(figure: HTMLElement) {
  figure.dispatchEvent(new CustomEvent(EVENT));
}

/** Puts the figure in a step's pose: the step's name on `data-step`, its values as custom properties. */
export function setPose(figure: HTMLElement, name: string, { e }: Pose): void {
  figure.dataset.step = name;
  figure.style.setProperty("--e", String(e));
  // The drawing is built with its first pose on itself, for a page without scripting; the figure holds it now.
  figure.querySelector<SVGSVGElement>("svg.movement")?.style.removeProperty("--e");
  changed(figure);
}

/** Lights one part and drops every other to the ghost pair; null lights the step's parts again. */
export function setFocus(figure: HTMLElement, part: string | null): void {
  if (part === null) delete figure.dataset.focus;
  else figure.dataset.focus = part;
  for (const group of figure.querySelectorAll<SVGGElement>(".part[data-part]")) {
    group.classList.toggle("is-focus", part !== null && group.dataset.part === part);
  }
  changed(figure);
}

/** Slows every ticking part of the figure by `speed` (1, 10 or 100 times). */
export function setSpeed(figure: HTMLElement, speed: Speed): void {
  figure.style.setProperty("--slow", String(speed));
  changed(figure);
}

/** The figure's speed, from its `--slow` (1 when it has none of its own). */
export function speedOf(figure: HTMLElement): Speed {
  const value = Number(figure.style.getPropertyValue("--slow"));
  return SPEEDS.find((speed) => speed === value) ?? 1;
}

/** Calls `listener` after every change to the figure; returns the unsubscribe. */
export function onFigureChange(figure: HTMLElement, listener: () => void): () => void {
  figure.addEventListener(EVENT, listener);
  return () => {
    figure.removeEventListener(EVENT, listener);
  };
}
