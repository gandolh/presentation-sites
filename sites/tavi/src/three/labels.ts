// Where the 3D movement's labels go, as pure arithmetic, so a test can check the layout without a browser. Each label
// names a part and points at an anchor on it, projected to the screen. On a desktop the labels stand in two columns,
// left and right of the figure, each label on the side its anchor is on; a phone shows one label, in one column on the
// right. A leader runs from the anchor to an elbow beside the column, then level to its label.
//
// No two leaders cross, by construction:
// - the two columns' anchors are split by one vertical line, and a leader never crosses back over it, so a left
//   leader and a right one never meet;
// - in a column every leader turns at the same elbow line, so the level runs are short, parallel and apart. The
//   slanted runs, anchor to elbow, are dealt rows in order of their anchors' height, and any two that still cross swap
//   rows. A swap shortens the two runs together (two crossing segments are always longer than the two that uncross
//   them), so the swaps end, and they end with no crossing.

/** A point on screen, in CSS pixels from the box's top left corner. */
export type Pt2 = readonly [number, number];

export interface LabelIn {
  readonly id: string;
  /** The anchor on screen. */
  readonly x: number;
  readonly y: number;
  /** The label's width, in CSS pixels. */
  readonly w: number;
}

export interface LabelOptions {
  /** The box the labels lie over. */
  readonly width: number;
  readonly height: number;
  /** The space kept clear at the box's edges. */
  readonly pad: number;
  /** The distance between two rows' centre lines. */
  readonly pitch: number;
  /** The gap between a label's text and the end of its leader. */
  readonly gap: number;
  /** A leader's level run, from its elbow to its end. */
  readonly run: number;
  /** Two columns, or one on the right. */
  readonly sides: "both" | "right";
}

export type Side = "left" | "right";

/** The labels on a desktop, two columns, and on a phone, one on the right for the lit part: CSS pixels. */
export const DESKTOP_LABELS = { pad: 10, pitch: 22, gap: 6, run: 16, sides: "both" } as const;
export const PHONE_LABELS = { pad: 6, pitch: 20, gap: 4, run: 12, sides: "right" } as const;

export interface LabelOut {
  readonly id: string;
  readonly side: Side;
  /** The label's left edge and its centre line. */
  readonly x: number;
  readonly y: number;
  /** The leader: the anchor, the elbow, the end beside the label. */
  readonly leader: readonly [Pt2, Pt2, Pt2];
}

/** The width one column takes from the box's edge to its elbow line, for labels as wide as the widest of `widths`. */
export function columnSpan(widths: readonly number[], o: Pick<LabelOptions, "pad" | "gap" | "run">): number {
  return o.pad + Math.max(0, ...widths) + o.gap + o.run;
}

/** The share of the box's width the label columns take: the camera fits the movement into the rest. */
export function labelRoom(widths: readonly number[], o: LabelOptions): number {
  const span = columnSpan(widths, o);
  return Math.min(0.6, ((o.sides === "both" ? 2 : 1) * span) / Math.max(1, o.width));
}

/**
 * Rows as close as can be to the targets (sorted, top first), at least `pitch` apart, inside [lo, hi]: the least-squares
 * fit, found by pooling neighbours that would break the order (isotonic regression on the targets less their rows'
 * offsets), then clamped into the band. Where the band is too short for the rows they share it evenly.
 */
export function rows(targets: readonly number[], pitch: number, lo: number, hi: number): number[] {
  const n = targets.length;
  if (n === 0) return [];
  const step = n > 1 ? Math.min(pitch, (hi - lo) / (n - 1)) : pitch;
  // Pool adjacent violators: blocks of [sum, count], each block's mean no lower than the one before it.
  const blocks: [number, number][] = [];
  targets.forEach((t, i) => {
    blocks.push([t - i * step, 1]);
    for (;;) {
      const last = blocks.at(-1);
      const before = blocks.at(-2);
      if (!last || !before || before[0] / before[1] <= last[0] / last[1]) break;
      blocks.pop();
      before[0] += last[0];
      before[1] += last[1];
    }
  });
  const top = hi - (n - 1) * step;
  const out: number[] = [];
  for (const [sum, count] of blocks) {
    const fit = Math.min(top, Math.max(lo, sum / count));
    for (let k = 0; k < count; k++) out.push(fit + out.length * step);
  }
  return out;
}

const cross = (o: Pt2, a: Pt2, b: Pt2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** Whether two segments meet, touching included (within `eps` pixels). */
export function segmentsMeet(a: Pt2, b: Pt2, c: Pt2, d: Pt2, eps = 1e-6): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  if (((d1 > eps && d2 < -eps) || (d1 < -eps && d2 > eps)) && ((d3 > eps && d4 < -eps) || (d3 < -eps && d4 > eps)))
    return true;
  // An end on the other segment.
  const on = (p: Pt2, q: Pt2, r: Pt2) =>
    Math.abs(cross(p, q, r)) <= eps * Math.max(1, Math.hypot(q[0] - p[0], q[1] - p[1])) &&
    r[0] >= Math.min(p[0], q[0]) - eps &&
    r[0] <= Math.max(p[0], q[0]) + eps &&
    r[1] >= Math.min(p[1], q[1]) - eps &&
    r[1] <= Math.max(p[1], q[1]) + eps;
  return on(c, d, a) || on(c, d, b) || on(a, b, c) || on(a, b, d);
}

/** Whether two leaders (polylines) meet anywhere. */
export function leadersMeet(p: readonly Pt2[], q: readonly Pt2[]): boolean {
  for (let i = 1; i < p.length; i++) {
    for (let j = 1; j < q.length; j++) {
      const a = p[i - 1];
      const b = p[i];
      const c = q[j - 1];
      const d = q[j];
      if (a && b && c && d && segmentsMeet(a, b, c, d)) return true;
    }
  }
  return false;
}

/** One column: its labels dealt rows, uncrossed, and their leaders drawn. */
function column(items: readonly LabelIn[], side: Side, o: LabelOptions): LabelOut[] {
  if (items.length === 0) return [];
  const widest = Math.max(...items.map((it) => it.w));
  const sign = side === "left" ? 1 : -1;
  // The column's text edge nearest the figure, the leaders' ends beside it, and the elbow line beyond.
  const edge = side === "left" ? o.pad + widest : o.width - o.pad - widest;
  const end = edge + sign * o.gap;
  // The elbow line stays clear of every anchor, so each slanted run leaves its anchor towards the column.
  const nearest = side === "left" ? Math.min(...items.map((it) => it.x)) : Math.max(...items.map((it) => it.x));
  const want = end + sign * o.run;
  const elbow =
    side === "left" ? Math.max(end, Math.min(want, nearest - 2)) : Math.min(end, Math.max(want, nearest + 2));

  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const half = o.pitch / 2;
  const ys = rows(
    sorted.map((it) => it.y),
    o.pitch,
    o.pad + half,
    o.height - o.pad - half,
  );
  // Which row each label holds; any two slanted runs that cross swap rows until none do.
  const row = sorted.map((_, i) => i);
  const port = (i: number): Pt2 => [elbow, ys[row[i] ?? i] ?? 0];
  const anchor = (i: number): Pt2 => [sorted[i]?.x ?? 0, sorted[i]?.y ?? 0];
  for (let pass = 0; pass < sorted.length * sorted.length; pass++) {
    let swapped = false;
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (!segmentsMeet(anchor(i), port(i), anchor(j), port(j))) continue;
        const ri = row[i] ?? i;
        row[i] = row[j] ?? j;
        row[j] = ri;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return sorted.map((it, i) => {
    const y = ys[row[i] ?? i] ?? it.y;
    return {
      id: it.id,
      side,
      x: side === "left" ? edge - it.w : edge,
      y,
      leader: [
        [it.x, it.y],
        [elbow, y],
        [end, y],
      ],
    };
  });
}

/**
 * Lays out every label over a `width` by `height` box. A label whose anchor falls outside the box, or under a column,
 * is left out: its leader would have to run back across the labels.
 */
export function layoutLabels(items: readonly LabelIn[], o: LabelOptions): LabelOut[] {
  const span = columnSpan(
    items.map((it) => it.w),
    o,
  );
  const x0 = o.sides === "both" ? span : 0;
  const inside = items.filter((it) => it.x > x0 && it.x < o.width - span && it.y >= 0 && it.y <= o.height);
  if (o.sides === "right") return column(inside, "right", o);
  // Split by the box's middle, then move the labels nearest the split across where a column has more than it holds:
  // either way the left column is the anchors furthest left, so one vertical line still parts the two.
  const byX = [...inside].sort((a, b) => a.x - b.x || a.y - b.y);
  const holds = Math.max(1, Math.floor((o.height - 2 * o.pad) / o.pitch));
  let split = byX.filter((it) => it.x < o.width / 2).length;
  split = Math.min(split, holds);
  split = Math.max(split, byX.length - holds);
  return [...column(byX.slice(0, split), "left", o), ...column(byX.slice(split), "right", o)];
}
