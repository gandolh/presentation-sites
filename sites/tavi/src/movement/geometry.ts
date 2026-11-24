// The plane the movement is drawn in: x to the right, y down, angles clockwise from 3 o'clock, in units where the
// main plate's radius is 190. The SVG uses these coordinates as they are; the 3D scene flips y once.

/** A point in the movement's plane. */
export type Pt = readonly [number, number];

/** One degree, in radians. */
export const DEG = Math.PI / 180;

/** The point `r` from `c` at angle `a` (radians). */
export function polar(c: Pt, r: number, a: number): Pt {
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
}

/** The distance between two points. */
export function distance(a: Pt, b: Pt): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** The direction from `a` to `b` (radians). */
export function angleTo(a: Pt, b: Pt): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

/** The point a fraction `t` of the way from `a` to `b`. */
export function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
