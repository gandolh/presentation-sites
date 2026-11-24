// The drawing's primitives: number formatting, wheel outlines, crossings, bridges, screws and jewels, each an SVG
// string. Every element carries a class; the colours come from the page's CSS tokens, never from here.

import { DEG, polar, type Pt } from "../geometry.ts";

const O: Pt = [0, 0];

/** A number at two decimals, as short as it prints. */
export const f = (n: number) => +n.toFixed(2);
/** A point as "x y". */
export const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

/** A full circle as a path, for cutting rings with even-odd fill. */
export const circ = (c: Pt, r: number) =>
  `M${f(c[0] - r)} ${f(c[1])} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z`;

/** `inner` drawn about its own origin, placed at `c`: the inner group is the one that turns. */
export const at = (c: Pt, inner: string, cls = "") =>
  `<g transform="translate(${P(c)})"><g class="${cls}">${inner}</g></g>`;

interface GearShape {
  /** Addendum, in modules. */
  readonly add?: number;
  /** Dedendum, in modules. */
  readonly ded?: number;
  /** Half a tooth's width at the pitch circle, as a share of the pitch. */
  readonly tipW?: number;
  /** Radians: where the first tooth points. */
  readonly start?: number;
}

/** A wheel's outline, as watch wheels are cut: rounded (ogival) tips on radial flanks. */
export function gearOutline(N: number, r: number, { add = 1.0, ded = 1.25, tipW = 0.25, start = 0 }: GearShape = {}) {
  const m = (2 * r) / N;
  const p = (2 * Math.PI) / N;
  const ra = r + add * m;
  const rf = r - ded * m;
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = start + i * p;
    const r0 = polar(O, rf, a - 0.5 * p);
    const r1 = polar(O, rf, a - tipW * p);
    const s0 = polar(O, r, a - tipW * p);
    const s1 = polar(O, r, a + tipW * p);
    const c0 = polar(O, ra * 1.02, a - tipW * 0.75 * p);
    const c1 = polar(O, ra * 1.02, a + tipW * 0.75 * p);
    const r2 = polar(O, rf, a + tipW * p);
    d += `${i ? "L" : "M"}${P(r0)} A${f(rf)} ${f(rf)} 0 0 1 ${P(r1)} L${P(s0)} C${P(c0)} ${P(c1)} ${P(s1)} L${P(r2)} `;
  }
  const end = polar(O, rf, start - 0.5 * p);
  return d + `A${f(rf)} ${f(rf)} 0 0 1 ${P(end)} Z`;
}

/** A wheel's crossings: the holes between curved spokes, cut with even-odd fill. */
export function crossings(n: number, rOut: number, rIn: number, spokeW: number, twist = 14) {
  let d = "";
  for (let j = 0; j < n; j++) {
    const a1 = ((j * 360) / n) * DEG + spokeW / rOut;
    const a2 = (((j + 1) * 360) / n) * DEG - spokeW / rOut;
    const b1 = a1 + twist * DEG + (spokeW / rIn - spokeW / rOut);
    const b2 = a2 + twist * DEG - (spokeW / rIn - spokeW / rOut);
    const o1 = polar(O, rOut, a1);
    const o2 = polar(O, rOut, a2);
    const i2 = polar(O, rIn, b2);
    const i1 = polar(O, rIn, b1);
    const m2 = polar(O, (rOut + rIn) / 2, (a2 + b2) / 2 + twist * 0.25 * DEG);
    const m1 = polar(O, (rOut + rIn) / 2, (a1 + b1) / 2 + twist * 0.25 * DEG);
    const large = a2 - a1 > Math.PI ? 1 : 0;
    const largeI = b2 - b1 > Math.PI ? 1 : 0;
    d += `M${P(o1)} A${f(rOut)} ${f(rOut)} 0 ${large} 1 ${P(o2)} Q${P(m2)} ${P(i2)} A${f(rIn)} ${f(rIn)} 0 ${largeI} 0 ${P(i1)} Q${P(m1)} ${P(o1)} Z `;
  }
  return d;
}

/** The escape wheel's club teeth, leaning the way the wheel turns. `r` is the tips' radius. */
export function escapeOutline(N: number, r: number) {
  const root = r * 0.66;
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = (i * 360) / N;
    const p1 = polar(O, root, a * DEG);
    const p2 = polar(O, r, (a + 4) * DEG);
    const p3 = polar(O, r * 0.95, (a + 9.5) * DEG);
    const p4 = polar(O, root, (a + 17) * DEG);
    const c4 = polar(O, r * 0.78, (a + 17) * DEG);
    const next = polar(O, root, (a + 24) * DEG);
    d += `${i ? "L" : "M"}${P(p1)} L${P(p2)} L${P(p3)} Q${P(c4)} ${P(p4)} A${f(root)} ${f(root)} 0 0 1 ${P(next)} `;
  }
  return d + "Z";
}

/** The ratchet wheel's saw teeth. */
export function ratchetOutline(N: number, r: number) {
  const rf = r - 2.6;
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = ((i * 360) / N) * DEG;
    const p = (2 * Math.PI) / N;
    d += `${i ? "L" : "M"}${P(polar(O, rf, a))} L${P(polar(O, r, a + p * 0.82))} L${P(polar(O, rf, a + p))} `;
  }
  return d + "Z";
}

/** A band of a bridge or a fork: round-capped strokes through `pts`, `w` wide. */
export interface Band {
  readonly pts: readonly Pt[];
  readonly w: number;
}

/** A disc on a bridge: its centre and radius. */
export type Disc = readonly [Pt, number];

/** A bridge as the union of round-capped bands and discs: the outline strokes first, the fills on top. */
export function bridge(cls: string, segs: readonly Band[], discs: readonly Disc[] = []) {
  const line = (s: Band) => `M${s.pts.map(P).join(" L")}`;
  let out = `<g class="${cls}">`;
  out += segs.map((s) => `<path class="bo" d="${line(s)}" stroke-width="${f(s.w + 2.6)}"/>`).join("");
  out += discs.map(([c, r]) => `<circle class="bo-disc" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r + 1.3)}"/>`).join("");
  out += segs.map((s) => `<path class="bf" d="${line(s)}" stroke-width="${f(s.w)}"/>`).join("");
  out += discs.map(([c, r]) => `<circle class="bf-disc" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r)}"/>`).join("");
  return out + "</g>";
}

/** The rounded hull of circles: the calm outline of a real bridge or cock. */
export function hull(circles: readonly Disc[], cls: string) {
  const pts: Pt[] = [];
  for (const [c, r] of circles) for (let i = 0; i < 64; i++) pts.push(polar(c, r, (i / 64) * 2 * Math.PI));
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const out: Pt[] = [];
    for (const p of list) {
      // Drop the last point while it makes no left turn towards p.
      while (out.length >= 2) {
        const a = out.at(-2);
        const b = out.at(-1);
        if (!a || !b || cross(a, b, p) > 0) break;
        out.pop();
      }
      out.push(p);
    }
    return out.slice(0, -1);
  };
  const h = half(pts).concat(half(pts.slice().reverse()));
  return `<path class="${cls} fo" d="M${h.map(P).join(" L")} Z"/>`;
}

/** A slotted screw, its slot at `a` degrees. */
export const screw = (c: Pt, r = 5, a = 30) => {
  const s0 = polar(c, r * 0.8, a * DEG);
  const s1 = polar(c, r * 0.8, (a + 180) * DEG);
  return `<g class="screw"><circle class="fo" cx="${f(c[0])}" cy="${f(c[1])}" r="${r}"/><path class="slot" d="M${P(s0)} L${P(s1)}"/></g>`;
};

/** A jewel in its chaton, with a glint. */
export const jewel = (c: Pt, r = 3) =>
  `<g class="jewel"><circle class="chaton" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r + 1.8)}"/><circle class="fo" cx="${f(c[0])}" cy="${f(c[1])}" r="${r}"/><circle class="glint" cx="${f(c[0] - r * 0.35)}" cy="${f(c[1] - r * 0.35)}" r="${f(r * 0.3)}"/></g>`;

interface WheelOptions {
  readonly hub?: number;
  readonly rim?: number;
  readonly pinion?: { readonly teeth: number; readonly r: number } | null;
}

/** A train wheel about its own centre: the toothed rim with its crossings, the pinion below, the hub. */
export function wheel(N: number, r: number, spokes: number, { hub = 6, rim = 3.5, pinion = null }: WheelOptions = {}) {
  const m = (2 * r) / N;
  const rf = r - 1.25 * m;
  let s = `<path class="fo" fill-rule="evenodd" d="${gearOutline(N, r)} ${crossings(spokes, rf - rim, hub + 2.5, 2.2)}"/>`;
  if (pinion)
    s += `<path class="pin fo" d="${gearOutline(pinion.teeth, pinion.r * 0.92, { add: 1.1, ded: 1.4, tipW: 0.22 })}"/>`;
  s += `<circle class="hub fo" r="${f(hub * 0.55)}"/>`;
  return s;
}
