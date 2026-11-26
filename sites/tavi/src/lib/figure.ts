// A figure is an element holding a drawing: a chapter's sticky card. Its state lives on the element, not in React,
// so the steps' module script and the tray's island read and write the same thing:
// - the pose: `data-step` (which step's parts stay in colour) and `--e` (how far the lifted parts have risen);
// - the part the prose points at: `data-focus`, and `is-focus` on that part's groups in the drawing;
// - the part the visitor chose (chapter 5, by a tap on the 3D view, a label or the parts list): `data-pick`. It stays
//   lit whenever nothing else is pointed at;
// - the turn of a figure that turns (chapter 5's 3D view): `data-turn`, in degrees from the view it opens on;
// - the speed: `--slow` (1, 10 or 100), which stretches every ticking duration in the stylesheet;
// - a hold: `data-hold`, the moment of the figure's clock it stands still at (seconds), when a step asks for one. A
//   hold is the figure's own: it leaves the page's play state alone, and the tray's Pause shows pressed while it lasts.
// - the mainspring's reserve in hours (chapter 5's Wind): `data-reserve`, absent while the spring is full. The 3D view
//   runs it down in real time while the figure ticks; the tray's Wind sets it;
// - the figure's clock, for a figure that keeps one (clockFigure.ts, the 3D view): the moment it shows and when it
//   showed it, so the ticking sound can beat with what is on screen.
// Every change fires one `tavi:figure` event on the figure, except the clock's, which is stamped every frame.

import { RESERVE_HOURS } from "../movement/clock.ts";

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

/**
 * Lights one part and drops every other to the ghost pair; null lights the chosen part again, or where none is chosen
 * the step's parts.
 */
export function setFocus(figure: HTMLElement, part: string | null): void {
  const lit = part ?? figure.dataset.pick ?? null;
  if (lit === null) delete figure.dataset.focus;
  else figure.dataset.focus = lit;
  for (const group of figure.querySelectorAll<SVGGElement>(".part[data-part]")) {
    group.classList.toggle("is-focus", lit !== null && group.dataset.part === lit);
  }
  changed(figure);
}

/** Chooses a part to keep lit, or none (null), and lights it. */
export function setPick(figure: HTMLElement, part: string | null): void {
  if (part === null) delete figure.dataset.pick;
  else figure.dataset.pick = part;
  setFocus(figure, part);
}

/** The part the visitor chose, or null. */
export function pickOf(figure: HTMLElement): string | null {
  return figure.dataset.pick ?? null;
}

/** Turns a figure that turns to `degrees` from the view it opens on. */
export function setTurn(figure: HTMLElement, degrees: number): void {
  const next = String(Math.round(degrees * 10) / 10);
  if (figure.dataset.turn === next) return;
  figure.dataset.turn = next;
  changed(figure);
}

/** A figure's turn, in degrees from the view it opens on. */
export function turnOf(figure: HTMLElement): number {
  return Number(figure.dataset.turn ?? 0) || 0;
}

/** How far the figure's lifted parts have risen, 0 (assembled) to 1: its `--e`. */
export function apartOf(figure: HTMLElement): number {
  return Number(figure.style.getPropertyValue("--e")) || 0;
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

/** Holds the figure still at `t` seconds of its clock (lib/clockFigure.ts), whether or not the page plays. */
export function hold(figure: HTMLElement, t: number): void {
  figure.dataset.hold = String(t);
  changed(figure);
}

/** Lets a held figure run on from where it stood; a figure that isn't held is left as it is. */
export function release(figure: HTMLElement): void {
  if (figure.dataset.hold === undefined) return;
  delete figure.dataset.hold;
  changed(figure);
}

/** The moment the figure is held at, or null while it isn't held. */
export function heldAt(figure: HTMLElement): number | null {
  const value = figure.dataset.hold;
  return value === undefined ? null : Number(value);
}

/** Calls `listener` after every change to the figure; returns the unsubscribe. */
export function onFigureChange(figure: HTMLElement, listener: () => void): () => void {
  figure.addEventListener(EVENT, listener);
  return () => {
    figure.removeEventListener(EVENT, listener);
  };
}

/** Hours of power left in the figure's mainspring: the full reserve until something winds or runs it. */
export function reserveOf(figure: HTMLElement): number {
  const value = figure.dataset.reserve;
  if (value === undefined) return RESERVE_HOURS;
  const hours = Number(value);
  return Number.isFinite(hours) ? Math.min(RESERVE_HOURS, Math.max(0, hours)) : RESERVE_HOURS;
}

/**
 * Sets the figure's reserve in hours. A `quiet` write, for the run-down every frame, fires no event: the caller tells
 * the tray itself when what it shows has changed.
 */
export function setReserve(figure: HTMLElement, hours: number, quiet = false): void {
  figure.dataset.reserve = String(Math.min(RESERVE_HOURS, Math.max(0, hours)));
  if (!quiet) changed(figure);
}

/** Tells everything following the figure that it changed, after a run of quiet writes. */
export function announce(figure: HTMLElement): void {
  changed(figure);
}

/** A figure's clock as last stamped: the moment it showed, and the page's `performance.now()` then. */
export interface ClockStamp {
  readonly t: number;
  readonly at: number;
}

const stamps = new WeakMap<HTMLElement, ClockStamp>();

/** Records that the figure shows `t` seconds of its clock right now. */
export function markClock(figure: HTMLElement, t: number): void {
  stamps.set(figure, { t, at: performance.now() });
}

/** The figure's clock as last stamped, or null if it keeps none or hasn't stamped it for `within` ms. */
export function clockOf(figure: HTMLElement, within = 1000): ClockStamp | null {
  const stamp = stamps.get(figure);
  return stamp && performance.now() - stamp.at <= within ? stamp : null;
}
