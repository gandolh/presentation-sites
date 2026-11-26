// The parts chapter 5 names: every part of the table with a label and an anchor, their anchors at a lift, and the
// timing of taking them apart. Pure, with no three.js, so the tray, the parts list and the tests share it.

import type { Vec3 } from "./camera.ts";
import { MOVEMENT, type Anchor, type Calibre, type Explode, type PartId } from "../movement/parts.ts";

/** Smoothstep: 0 below `a`, 1 above `b`, eased between. */
export const smooth = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

/** How far a part has risen at `apart` (0 assembled, 1 apart): its lift, eased through its window. */
export const liftOf = (explode: Explode, apart: number) =>
  explode.lift * smooth(explode.window[0], explode.window[1], apart);

export interface Labelled {
  readonly id: PartId;
  readonly label: string;
  readonly anchor: Anchor;
  readonly explode: Explode;
}

/**
 * The labelled parts in the order they come off (by the start of their lift window, the balance cock first); the
 * plate and the crown, which never lift, last.
 */
export function labelledParts(m: Calibre = MOVEMENT): Labelled[] {
  const out: Labelled[] = [];
  for (const p of m.parts)
    if (p.label && p.anchor) out.push({ id: p.id, label: p.label, anchor: p.anchor, explode: p.explode });
  const start = (p: Labelled) => (p.explode.lift > 0 ? p.explode.window[0] : 2);
  return out.sort((a, b) => start(a) - start(b));
}

export const LABELLED: readonly Labelled[] = labelledParts();

/** A label's anchor in world units (y flipped, as the scene's), at `apart`. */
export function anchorAt(p: Labelled, apart: number): Vec3 {
  return [p.anchor.at[0], -p.anchor.at[1], p.anchor.z + liftOf(p.explode, apart)];
}

/** The parts that have no name of their own and stand for the one they belong to: a bridge's screws, the arbor. */
const STANDS_FOR: Partial<Record<PartId, PartId>> = {
  "barrel-screws": "barrel-bridge",
  "train-screws": "train-bridge",
  "pallet-screws": "pallet-bridge",
  "cock-screws": "balance-cock",
  arbor: "barrel",
};

/** The labelled part a hit on `id` lights, or null where it lights none. */
export function labelledFor(id: string): PartId | null {
  const named = STANDS_FOR[id as PartId] ?? id;
  return LABELLED.some((p) => p.id === named) ? (named as PartId) : null;
}

/** The parts that stay in colour while `id` is lit: the part and whatever stands for it. */
export function litWith(id: PartId): PartId[] {
  return [id, ...Object.entries(STANDS_FOR).flatMap(([part, owner]) => (owner === id ? [part as PartId] : []))];
}

/** The ease the Take apart button runs on, the prototype's: cubic in, cubic out. */
export const inOutCubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

/** How long the movement takes to come apart from `from` to `to`, in milliseconds: the prototype's 1.8 s a whole run. */
export const apartMs = (from: number, to: number) => 1800 * Math.abs(to - from) + 200;
