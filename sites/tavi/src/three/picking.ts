// Rays into the 3D movement: which part a click or a tap lands on, and whether a label's anchor is in sight or behind
// another part. Both cast against the solids only (a line's ray test needs the camera and adds nothing here).

import { Raycaster, Vector2, Vector3, type Camera } from "three";
import type { PartId } from "../movement/parts.ts";
import type { Vec3 } from "./camera.ts";
import { labelledFor } from "./labelled.ts";
import type { Movement } from "./movement.ts";

const ray = new Raycaster();
const ndc = new Vector2();
const from = new Vector3();
const towards = new Vector3();

/** The labelled part under a point of the canvas (CSS pixels from its top left), or null over empty paper. */
export function partAtPoint(
  movement: Movement,
  camera: Camera,
  x: number,
  y: number,
  width: number,
  height: number,
): PartId | null {
  ndc.set((x / width) * 2 - 1, 1 - (y / height) * 2);
  ray.setFromCamera(ndc, camera);
  ray.far = Infinity;
  for (const hit of ray.intersectObjects(movement.solids(), false)) {
    const part = movement.partHit(hit);
    const named = part ? labelledFor(part) : null;
    if (named) return named;
  }
  return null;
}

/** How far short of an anchor a hit must be to hide it, in plane units: the anchor sits on its part's own face. */
const CLEAR = 1.5;

/**
 * Whether something other than `own` stands between the camera and an anchor. While some parts are lit, only they
 * hide an anchor: a part in the ghost pair is out of focus, and a label of a lit part shows through it.
 */
export function hidden(
  movement: Movement,
  camera: Camera,
  anchor: Vec3,
  own: PartId,
  lit: ReadonlySet<PartId> | null,
): boolean {
  from.copy(camera.position);
  towards.set(...anchor).sub(from);
  const distance = towards.length();
  ray.set(from, towards.normalize());
  ray.far = distance - CLEAR;
  for (const hit of ray.intersectObjects(movement.solids(), false)) {
    const part = movement.partHit(hit);
    if (!part || part === own || labelledFor(part) === own) continue;
    if (lit === null || lit.has(part)) return true;
  }
  return false;
}
