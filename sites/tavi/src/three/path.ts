// The drawing's outlines as point lists, for the 3D scene to extrude. The SVG builders (movement/svg/) write each
// outline once, as a path; this samples that same path, so the 3D movement and the drawing share every tooth, crossing
// and coil. It reads what the builders write: M, L, H, V, C, Q, A and Z, absolute or relative, with arcs of a circle or
// an unrotated ellipse.

import type { Pt } from "../movement/geometry.ts";

export interface Sampling {
  /** Points per Bézier curve. */
  readonly curve?: number;
  /** The widest step along an arc, in radians. */
  readonly arcStep?: number;
}

const TOKEN = /[MLHVCQAZ]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const EPS = 1e-6;

const same = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS;

/** The points along an arc from `p0` to `p1`, `p0` left out (SVG's endpoint-to-centre conversion, unrotated). */
function arcPoints(p0: Pt, rx0: number, ry0: number, large: boolean, sweep: boolean, p1: Pt, step: number): Pt[] {
  if (same(p0, p1)) return [];
  if (rx0 === 0 || ry0 === 0) return [p1];
  const hx = (p0[0] - p1[0]) / 2;
  const hy = (p0[1] - p1[1]) / 2;
  let rx = Math.abs(rx0);
  let ry = Math.abs(ry0);
  const scale = (hx * hx) / (rx * rx) + (hy * hy) / (ry * ry);
  if (scale > 1) {
    rx *= Math.sqrt(scale);
    ry *= Math.sqrt(scale);
  }
  const num = rx * rx * ry * ry - rx * rx * hy * hy - ry * ry * hx * hx;
  const den = rx * rx * hy * hy + ry * ry * hx * hx;
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cx = (k * rx * hy) / ry + (p0[0] + p1[0]) / 2;
  const cy = (-k * ry * hx) / rx + (p0[1] + p1[1]) / 2;
  const a0 = Math.atan2((p0[1] - cy) / ry, (p0[0] - cx) / rx);
  let da = Math.atan2((p1[1] - cy) / ry, (p1[0] - cx) / rx) - a0;
  if (sweep && da < 0) da += 2 * Math.PI;
  if (!sweep && da > 0) da -= 2 * Math.PI;
  const n = Math.max(1, Math.ceil(Math.abs(da) / step));
  const out: Pt[] = [];
  for (let i = 1; i < n; i++) {
    const a = a0 + (da * i) / n;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  out.push(p1);
  return out;
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** The points along a quadratic or cubic Bézier curve, its start left out. */
function bezier(controls: readonly Pt[], n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    let level = controls.slice();
    while (level.length > 1) level = level.slice(1).map((p, j) => lerp(level[j] ?? p, p, i / n));
    const [p] = level;
    if (p) out.push(p);
  }
  return out;
}

/**
 * A path's subpaths as point lists, each closed or open as drawn. A closed subpath doesn't repeat its first point at
 * its end, and no point repeats the one before it.
 */
export function pathPoints(d: string, { curve = 6, arcStep = Math.PI / 24 }: Sampling = {}): Pt[][] {
  const tokens = d.match(TOKEN) ?? [];
  const subpaths: Pt[][] = [];
  let current: Pt[] = [];
  let pen: Pt = [0, 0];
  let start: Pt = [0, 0];
  let command = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  const push = (...pts: Pt[]) => {
    for (const p of pts) if (!same(current.at(-1) ?? [NaN, NaN], p)) current.push(p);
    pen = pts.at(-1) ?? pen;
  };
  const close = () => {
    const first = current[0];
    if (first && current.length > 1 && same(first, current.at(-1) ?? first)) current.pop();
    if (current.length) subpaths.push(current);
    current = [];
  };
  while (i < tokens.length) {
    const token = tokens[i] ?? "";
    if (/^[a-z]$/i.test(token)) {
      command = token;
      i++;
      if (command === "Z" || command === "z") {
        close();
        pen = start;
        continue;
      }
    }
    const rel = command === command.toLowerCase();
    const o = (p: Pt): Pt => (rel ? [pen[0] + p[0], pen[1] + p[1]] : p);
    switch (command.toUpperCase()) {
      case "M": {
        if (current.length) subpaths.push(current);
        current = [];
        const p = o([num(), num()]);
        start = p;
        push(p);
        // Further pairs after a move are lines.
        command = rel ? "l" : "L";
        break;
      }
      case "L":
        push(o([num(), num()]));
        break;
      case "H": {
        const x = num();
        push([rel ? pen[0] + x : x, pen[1]]);
        break;
      }
      case "V": {
        const y = num();
        push([pen[0], rel ? pen[1] + y : y]);
        break;
      }
      case "C": {
        const c1 = o([num(), num()]);
        const c2 = o([num(), num()]);
        const p = o([num(), num()]);
        push(...bezier([pen, c1, c2, p], curve));
        break;
      }
      case "Q": {
        const c = o([num(), num()]);
        const p = o([num(), num()]);
        push(...bezier([pen, c, p], curve));
        break;
      }
      case "A": {
        const rx = num();
        const ry = num();
        num(); // the ellipse's rotation: the builders never rotate one
        const large = num() !== 0;
        const sweep = num() !== 0;
        const p = o([num(), num()]);
        push(...arcPoints(pen, rx, ry, large, sweep, p, arcStep));
        break;
      }
      default:
        // A number with no command before it: skip it rather than loop on it.
        i++;
    }
  }
  if (current.length) subpaths.push(current);
  return subpaths;
}

/** The `d` of the first `<path>` in an SVG fragment, as the builders write it. */
export function pathData(svg: string): string {
  return /\sd="([^"]*)"/.exec(svg)?.[1] ?? "";
}

/** The points turned by `a` radians about `c`, clockwise on screen (y down). */
export function turned(points: readonly Pt[], a: number, c: Pt = [0, 0]): Pt[] {
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return points.map(([x, y]) => {
    const dx = x - c[0];
    const dy = y - c[1];
    return [c[0] + dx * cos - dy * sin, c[1] + dx * sin + dy * cos];
  });
}
