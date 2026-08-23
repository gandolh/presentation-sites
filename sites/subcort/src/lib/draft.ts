// The drawing engine.
//
// This site is a drawing set. Every graphic on it is an orthographic or
// axonometric projection of one shared model — the marquee Subcort actually
// rents — annotated the way a real erection drawing is annotated: dimension
// lines with tick terminators, numbered callouts on dashed leaders, hatched
// ground.
//
// The model lives here once. The hero renders it in WebGL; the exploded plate,
// the plans and the OG card render it as deterministic SVG at build time, so
// the explanatory drawings need no JavaScript at all.

// ---------------------------------------------------------------------------
// Ink
// ---------------------------------------------------------------------------
// The object is drawn in ink. Everything the draughtsman *added* — callouts,
// leaders, dimensions, the active state — is orange. See DESIGN.md, the
// Annotation Rule.
export const INK = "#22303A";
export const LINE = "#5E7180";
export const LINE_SOFT = "#A7B4BE";
export const SIGNAL = "#C2481E";
export const SHEET = "#FBFBFA";
export const FILL = "#EDEFF1";

// ---------------------------------------------------------------------------
// The model — a gable marquee, in metres
// ---------------------------------------------------------------------------
export interface MarqueeSpec {
  /** Gable span. */
  w: number;
  /** Length along the ridge. */
  d: number;
  /** Height to the eave. */
  eave: number;
  /** Height to the ridge. */
  ridge: number;
  /** Bay spacing along the length. */
  bay: number;
}

export const DEFAULT_MARQUEE: MarqueeSpec = {
  w: 15,
  d: 10,
  eave: 3,
  ridge: 6.9,
  bay: 2.5,
};

export type P3 = readonly [number, number, number];

export interface Panel {
  /** Which part of the envelope this panel belongs to. */
  part: "roof" | "wall" | "gable" | "deck";
  quad: P3[];
}

export interface Marquee {
  spec: MarqueeSpec;
  /** Structural members — the frame. */
  members: Array<[P3, P3]>;
  /** Envelope panels, grouped by part. */
  panels: Panel[];
  hw: number;
  hd: number;
  bays: number[];
}

export function marquee(spec: MarqueeSpec = DEFAULT_MARQUEE): Marquee {
  const { w, d, eave, ridge, bay } = spec;
  const hw = w / 2;
  const hd = d / 2;
  const n = Math.max(2, Math.round(d / bay));
  const bays: number[] = [];
  for (let i = 0; i <= n; i++) bays.push(-hd + (i * d) / n);

  const members: Array<[P3, P3]> = [];

  // Portal frames across the span, one per bay line.
  for (const z of bays) {
    members.push([[-hw, 0, z], [-hw, eave, z]]);
    members.push([[hw, 0, z], [hw, eave, z]]);
    members.push([[-hw, eave, z], [0, ridge, z]]);
    members.push([[hw, eave, z], [0, ridge, z]]);
  }

  // Longitudinal members: ridge, eaves, footings and mid-slope purlins.
  for (let i = 0; i < bays.length - 1; i++) {
    const a = bays[i];
    const b = bays[i + 1];
    const runs: Array<[number, number]> = [
      [-hw, 0], [-hw, eave], [0, ridge], [hw, eave], [hw, 0],
      [-hw / 2, (eave + ridge) / 2], [hw / 2, (eave + ridge) / 2],
    ];
    for (const [x, y] of runs) members.push([[x, y, a], [x, y, b]]);
  }

  const panels: Panel[] = [];
  for (let i = 0; i < bays.length - 1; i++) {
    const a = bays[i];
    const b = bays[i + 1];
    panels.push({ part: "roof", quad: [[-hw, eave, a], [0, ridge, a], [0, ridge, b], [-hw, eave, b]] });
    panels.push({ part: "roof", quad: [[hw, eave, a], [0, ridge, a], [0, ridge, b], [hw, eave, b]] });
    panels.push({ part: "wall", quad: [[-hw, 0, a], [-hw, eave, a], [-hw, eave, b], [-hw, 0, b]] });
    panels.push({ part: "wall", quad: [[hw, 0, a], [hw, eave, a], [hw, eave, b], [hw, 0, b]] });
  }
  for (const z of [-hd, hd]) {
    panels.push({
      part: "gable",
      quad: [[-hw, 0, z], [-hw, eave, z], [0, ridge, z], [hw, eave, z], [hw, 0, z]],
    });
  }
  panels.push({ part: "deck", quad: [[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]] });

  return { spec, members, panels, hw, hd, bays };
}

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------
export type Projector = (p: P3) => [number, number, number];

/**
 * True isometric — no perspective, parallel lines stay parallel. This is the
 * projection a real assembly drawing uses, and the one the site leads with.
 */
export function isometric({
  scale = 18,
  cx = 700,
  cy = 340,
}: { scale?: number; cx?: number; cy?: number } = {}): Projector {
  return ([x, y, z]) => [
    cx + (x - z) * 0.8660254 * scale,
    cy + ((x + z) * 0.5 - y) * scale,
    x + z, // depth key for painter sorting
  ];
}

export const pts = (quad: readonly P3[], project: Projector) =>
  quad.map((p) => {
    const [X, Y] = project(p);
    return `${X.toFixed(1)},${Y.toFixed(1)}`;
  }).join(" ");

/** Painter's algorithm: far panels first. */
export function sortByDepth(panels: Panel[], project: Projector): Panel[] {
  return [...panels].sort((a, b) => {
    const da = a.quad.reduce((s, p) => s + project(p)[2], 0) / a.quad.length;
    const db = b.quad.reduce((s, p) => s + project(p)[2], 0) / b.quad.length;
    return da - db;
  });
}

/** Flat tonal shading from a fixed high-left sun; keeps the drawing readable. */
export function tone(quad: readonly P3[], base = 252): string {
  const [a, b, c] = quad;
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  const L = [-0.42, 0.84, 0.34];
  const d = Math.abs((n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / len);
  const k = 0.9 + 0.1 * d;
  const v255 = Math.round(base * k);
  return `rgb(${v255},${Math.round(v255 * 0.998)},${Math.round(v255 * 0.99)})`;
}

// ---------------------------------------------------------------------------
// Annotation primitives — the orange layer
// ---------------------------------------------------------------------------

/** A dimension line with tick terminators and its value sitting on the line. */
export function dimension(
  from: [number, number],
  to: [number, number],
  label: string,
  { offset = 0, flip = false }: { offset?: number; flip?: boolean } = {},
): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const nx = Math.sin(ang) * offset;
  const ny = -Math.cos(ang) * offset;
  const ax = x1 + nx, ay = y1 + ny;
  const bx = x2 + nx, by = y2 + ny;
  const t = 5; // tick half-length, drawn at 45° like a drafting tick
  const tick = (px: number, py: number) =>
    `<line x1="${(px - Math.cos(ang + Math.PI / 4) * t).toFixed(1)}" y1="${(py - Math.sin(ang + Math.PI / 4) * t).toFixed(1)}"
           x2="${(px + Math.cos(ang + Math.PI / 4) * t).toFixed(1)}" y2="${(py + Math.sin(ang + Math.PI / 4) * t).toFixed(1)}"
           stroke="${INK}" stroke-width="1"/>`;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  return `<g>
    <line x1="${x1}" y1="${y1}" x2="${ax}" y2="${ay}" stroke="${LINE_SOFT}" stroke-width=".8"/>
    <line x1="${x2}" y1="${y2}" x2="${bx}" y2="${by}" stroke="${LINE_SOFT}" stroke-width=".8"/>
    <line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${INK}" stroke-width="1"/>
    ${tick(ax, ay)}${tick(bx, by)}
    <rect x="${mx - 26}" y="${my - (flip ? 20 : 9)}" width="52" height="17" fill="${SHEET}"/>
    <text x="${mx}" y="${my + (flip ? -8 : 4)}" text-anchor="middle"
      font-family="'IBM Plex Mono',monospace" font-size="11.5" font-weight="500" fill="${INK}">${label}</text>
  </g>`;
}

/** A numbered callout on a dashed leader — the site's signature mark. */
export function callout(
  n: number | string,
  anchor: [number, number],
  at: [number, number],
  label?: string,
  { align = "start" as "start" | "end" } = {},
): string {
  const [ax, ay] = anchor;
  const [x, y] = at;
  const r = 12.5;
  const dx = align === "end" ? -(r + 9) : r + 9;
  return `<g>
    <line x1="${ax}" y1="${ay}" x2="${x}" y2="${y}" stroke="${SIGNAL}" stroke-width="1" stroke-dasharray="3 3"/>
    <circle cx="${ax}" cy="${ay}" r="2.4" fill="${SIGNAL}"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="${SHEET}" stroke="${SIGNAL}" stroke-width="1.5"/>
    <text x="${x}" y="${y + 4.4}" text-anchor="middle"
      font-family="'IBM Plex Mono',monospace" font-size="12.5" font-weight="600" fill="${SIGNAL}">${n}</text>
    ${label ? `<text x="${x + dx}" y="${y + 4.4}" text-anchor="${align}"
      font-family="'IBM Plex Sans',sans-serif" font-size="13.5" font-weight="600" fill="${INK}">${label}</text>` : ""}
  </g>`;
}

/** 45° hatching, for ground and cut faces. Returns a <pattern> to reference. */
export function hatchDef(id = "hatch", stroke = LINE_SOFT, gap = 5): string {
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="${gap}" stroke="${stroke}" stroke-width=".8"/>
  </pattern>`;
}
