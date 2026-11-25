// What every part of the 3D movement is built with: the part table's ids and heights, a group per part, a pivot per
// turning part, the outlines sampled from the drawing's own builders, and the sites of the screws and jewels, which
// movement.ts sets as two instanced meshes. build.ts, train.ts and bridges.ts each build one layer of the movement.

import { Group, type Object3D } from "three";
import type { Pt } from "../movement/geometry.ts";
import { partOf, type Calibre, type PartId } from "../movement/parts.ts";
import { hull } from "../movement/svg/draw.ts";
import type { Palette } from "./colours.ts";
import { pathData, pathPoints, turned } from "./path.ts";
import {
  BAND_LINE,
  capsule,
  circle,
  concat,
  extrude,
  HALF_LINE,
  type Band,
  type Disc,
  type Outline,
} from "./shapes.ts";

/** A screw or a jewel set in a part: where, how high, how big, and for a screw the angle of its slot (degrees). */
export interface Site {
  readonly part: PartId;
  readonly at: Pt;
  readonly z: number;
  readonly r: number;
  readonly slot: number;
}

/** The parts the 3D movement builds: the back of the watch. The dial side stays under the plate, out of sight. */
export const BUILT: readonly PartId[] = [
  "plate",
  "crown",
  "barrel",
  "mainspring",
  "arbor",
  "lid",
  "centre",
  "third",
  "fourth",
  "escape",
  "pallet",
  "balance",
  "hairspring",
  "barrel-bridge",
  "barrel-screws",
  "ratchet",
  "crownwheel",
  "click",
  "train-bridge",
  "train-screws",
  "pallet-bridge",
  "pallet-screws",
  "balance-cock",
  "cock-screws",
];

/** The hairspring's ribbon width, in plane units. */
export const HAIR_WIDTH = 0.8;
/** The jewels' and the bridge screws' sizes, which their instanced meshes are built at. */
export const JEWEL_R = 2.8;
export const SCREW_R = 5.2;

export const O: Pt = [0, 0];

/** A path's first subpath as an outline, the rest as its holes (the drawing cuts them with even-odd fill). */
export function shapeOf(d: string, turn = 0): Outline {
  const [outer = [], ...holes] = pathPoints(d).map((pts) => turned(pts, turn));
  return { outer, holes };
}

/** A drawn hull (`.fo`, its outline centred on the edge) as a fill and a shell. */
export function hullPair(circles: readonly Disc[]): { fill: Outline; shell: Outline } {
  const grown = (dr: number) =>
    shapeOf(
      pathData(
        hull(
          circles.map(([c, r]) => [c, r + dr] as const),
          "",
        ),
      ),
    );
  return { fill: grown(-HALF_LINE), shell: grown(HALF_LINE) };
}

/** Bands' fills and shells, to merge with another shape into one mesh. */
export function bandPair(list: readonly Band[], round: readonly Disc[] = []): { fills: Outline[]; shells: Outline[] } {
  const fills: Outline[] = [];
  const shells: Outline[] = [];
  for (const { pts, w } of list) {
    pts.slice(1).forEach((b, i) => {
      const a = pts[i] ?? b;
      fills.push({ outer: capsule(a, b, w / 2) });
      shells.push({ outer: capsule(a, b, w / 2 + BAND_LINE) });
    });
  }
  for (const [c, r] of round) {
    fills.push({ outer: circle(c, r) });
    shells.push({ outer: circle(c, r + BAND_LINE) });
  }
  return { fills, shells };
}

/** The geometry of a screw of radius `r` about its own centre, its slot along x: one instanced or placed mesh. */
export function screwGeometry(r: number, paint: Palette) {
  const { screw, slot } = paint;
  return concat([
    extrude([{ outer: circle(O, r + HALF_LINE, 32) }], 1.8, screw.line, screw.side),
    extrude([{ outer: circle(O, r - HALF_LINE, 32) }], 2.05, screw.fill, screw.side),
    extrude([{ outer: capsule([r * 0.8, 0], [-r * 0.8, 0], 0.65, 4) }], 2.3, slot.fill, slot.fill),
  ]);
}

/** The geometry of a jewel of radius `r` in its chaton, with its glint. */
export function jewelGeometry(r: number, paint: Palette) {
  const { chaton, ruby, glint } = paint;
  return concat([
    extrude([{ outer: circle(O, r + 1.8 + 0.25, 40) }], 0.5, chaton.line, chaton.side),
    extrude([{ outer: circle(O, r + 1.8 - 0.25, 40) }], 0.6, chaton.fill, chaton.side),
    extrude([{ outer: circle(O, r + HALF_LINE, 32) }], 0.9, ruby.line, ruby.side),
    extrude([{ outer: circle(O, r - HALF_LINE, 32) }], 0.95, ruby.fill, ruby.side),
    extrude([{ outer: circle([-r * 0.35, -r * 0.35], r * 0.3, 16) }], 1.0, glint.fill, glint.fill),
  ]);
}

/** The building context: the calibre, its paint, its parts' groups and pivots, and the sites found so far. */
export interface Kit {
  readonly m: Calibre;
  readonly paint: Palette;
  /** A part's group, named by its table id. */
  group(id: PartId): Group;
  /** A pivot at the part's place, turned by the clock's `turn` angle when one is named. */
  pivot(id: PartId, turn?: string): Group;
  /** The height a part's main body starts at. */
  z(id: PartId): number;
  readonly screws: Site[];
  readonly jewels: Site[];
}

/** A kit building into `root`, with every part's group made up front, bottom of the stack first. */
export function createKit(root: Object3D, m: Calibre, paint: Palette): Kit {
  const groups = new Map<PartId, Group>();
  const group = (id: PartId) => {
    let g = groups.get(id);
    if (!g) {
      g = new Group();
      g.name = id;
      root.add(g);
      groups.set(id, g);
    }
    return g;
  };
  // Whether or not a part is drawn by the builders (the hairspring's ribbon is added by movement.ts).
  for (const id of BUILT) group(id);
  return {
    m,
    paint,
    group,
    pivot(id, turn) {
      const p = new Group();
      const [x, y] = partOf(m, id).at;
      p.position.set(x, -y, 0);
      if (turn) p.userData["turn"] = turn;
      group(id).add(p);
      return p;
    },
    z: (id) => partOf(m, id).z,
    screws: [],
    jewels: [],
  };
}

/** A pinion's start angle: a gap faces the wheel that drives it, so the teeth mesh. */
export const pinStart = (towards: number, leaves: number) => towards + Math.PI + Math.PI / leaves;
