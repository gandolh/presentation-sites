// The 3D movement's building blocks, as the prototype made them: flat shapes extruded with their holes, one
// vertex-coloured material for every solid (a part is one draw call), a shell in the line colour under a part the
// drawing outlines, edges drawn as lines, a wall standing along a spiral (the mainspring) and a flat ribbon whose
// points change every frame (the hairspring). Shapes are drawn in the drawing's plane (y down) and flipped once.
//
// Outlines follow the drawing's strokes, so the flat view prints them where the poster does: a `.fo` outline is a
// line 1.1 units wide centred on the edge, a band (a bridge's arm) has its outline 1.3 units outside it.

import {
  BufferAttribute,
  BufferGeometry,
  type Color,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  Path,
  Shape,
  Vector2,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { angleTo, polar, type Pt } from "../movement/geometry.ts";
import type { Paint } from "./colours.ts";

/** A closed outline and its holes, in the drawing's plane. */
export interface Outline {
  readonly outer: readonly Pt[];
  readonly holes?: readonly (readonly Pt[])[];
}

/** A round-capped band through `pts`, `w` wide: a bridge's arm, a fork's lever. */
export interface Band {
  readonly pts: readonly Pt[];
  readonly w: number;
}

/** A disc: its centre and radius. */
export type Disc = readonly [Pt, number];

/** Half the width of a `.fo` outline, in plane units: the drawing's stroke of 1.1, centred on the edge. */
export const HALF_LINE = 0.55;
/** How far a band's outline reaches outside the band: the drawing's outline stroke is 2.6 wider. */
export const BAND_LINE = 1.3;
/** The drawing's outline width, in plane units: the lines' width on screen follows it. */
export const LINE_UNITS = 1.1;

/** `n` points round a circle. */
export function circle(c: Pt, r: number, n = 48): Pt[] {
  return Array.from({ length: n }, (_, i) => polar(c, r, (i / n) * 2 * Math.PI));
}

/** A stadium round two points, `h` either side of the line between them. */
export function capsule(p0: Pt, p1: Pt, h: number, n = 10): Pt[] {
  const a = angleTo(p0, p1);
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) out.push(polar(p1, h, a - Math.PI / 2 + (Math.PI * i) / n));
  for (let i = 0; i <= n; i++) out.push(polar(p0, h, a + Math.PI / 2 + (Math.PI * i) / n));
  return out;
}

const V = (p: Pt) => new Vector2(p[0], -p[1]);

/** Paints a geometry by its groups (an extrusion's caps are group 0, its walls group 1), then drops the groups. */
function painted(geo: BufferGeometry, cap: Color, wall: Color): BufferGeometry {
  const col = new Float32Array(geo.getAttribute("position").count * 3);
  for (const group of geo.groups) {
    const c = group.materialIndex === 1 ? wall : cap;
    for (let i = group.start; i < group.start + group.count; i++) col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new BufferAttribute(col, 3));
  geo.clearGroups();
  return geo;
}

/** One geometry from several unindexed ones with the same attributes. */
export function concat(geos: readonly BufferGeometry[]): BufferGeometry {
  const out = new BufferGeometry();
  const [first] = geos;
  if (!first) return out;
  for (const name of Object.keys(first.attributes)) {
    const size = first.getAttribute(name).itemSize;
    const total = geos.reduce((n, g) => n + g.getAttribute(name).array.length, 0);
    const array = new Float32Array(total);
    let at = 0;
    for (const g of geos) {
      const source = g.getAttribute(name).array as Float32Array;
      array.set(source, at);
      at += source.length;
    }
    out.setAttribute(name, new BufferAttribute(array, size));
  }
  return out;
}

/** Outlines extruded `depth` up from 0, the caps in `cap` and the walls in `wall`. */
export function extrude(list: readonly Outline[], depth: number, cap: Color, wall: Color): BufferGeometry {
  const shapes = list.map(({ outer, holes = [] }) => {
    const shape = new Shape(outer.map(V));
    for (const hole of holes) shape.holes.push(new Path(hole.map(V)));
    return shape;
  });
  return painted(new ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments: 1 }), cap, wall);
}

/** The material every solid shares: each vertex carries its colour, pushed back a hair so lines on it show. */
export const SOLID = new MeshBasicMaterial({
  vertexColors: true,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});

/** A flat material in one colour, both faces (the mainspring's wall, the hairspring). */
const flats = new Map<string, MeshBasicMaterial>();
export function flatMaterial(colour: Color): MeshBasicMaterial {
  const key = colour.getHexString();
  let m = flats.get(key);
  if (!m) {
    m = new MeshBasicMaterial({ color: colour, side: DoubleSide });
    flats.set(key, m);
  }
  return m;
}

/** Every line material, each with its width in plane units; `setLineScale` turns those into CSS pixels. */
const lineMaterials = new Map<string, LineMaterial>();
export function lineMaterial(colour: Color, units = LINE_UNITS, dashed = false): LineMaterial {
  const key = `${colour.getHexString()} ${units} ${dashed}`;
  let m = lineMaterials.get(key);
  if (!m) {
    m = new LineMaterial({ color: colour, linewidth: units, worldUnits: false, dashed, dashSize: 2, gapSize: 3 });
    m.userData["units"] = units;
    lineMaterials.set(key, m);
  }
  return m;
}

/**
 * Sizes every line for a view: a box of `width` by `height` CSS pixels showing `pxPerUnit` pixels for each plane
 * unit, so a line is as wide on screen as the drawing's stroke at that scale, whatever the device's pixel ratio.
 */
export function setLineScale(pxPerUnit: number, width: number, height: number): void {
  for (const m of lineMaterials.values()) {
    m.linewidth = Number(m.userData["units"]) * pxPerUnit;
    m.resolution.set(width, height);
  }
}

const edgeCache = new WeakMap<BufferGeometry, LineSegmentsGeometry>();

/** A geometry's hard edges (more than `angle` degrees between faces), as screen-width lines. */
export function edges(geo: BufferGeometry, colour: Color, angle = 25): LineSegments2 {
  let lines = edgeCache.get(geo);
  if (!lines) {
    lines = new LineSegmentsGeometry().fromEdgesGeometry(new EdgesGeometry(geo, angle));
    edgeCache.set(geo, lines);
  }
  return new LineSegments2(lines, lineMaterial(colour));
}

/** A mesh of `geo` in the shared material, `z` up in `parent`. */
export function place(parent: Object3D, geo: BufferGeometry, z: number): Mesh {
  const mesh = new Mesh(geo, SOLID);
  mesh.position.z = z;
  parent.add(mesh);
  return mesh;
}

/** A solid part: outlines extruded and painted, with its edges drawn as lines in the paint's line colour. */
export function solid(parent: Object3D, list: readonly Outline[], z: number, depth: number, paint: Paint): Mesh {
  const geo = extrude(list, depth, paint.fill, paint.side);
  const mesh = place(parent, geo, z);
  const lines = edges(geo, paint.line);
  lines.position.z = z;
  parent.add(lines);
  return mesh;
}

/** A part with a drawn outline: a shell in the line colour under the fill, as the drawing strokes under its fills. */
export function outlined(
  parent: Object3D,
  fills: readonly Outline[],
  shells: readonly Outline[],
  z: number,
  depth: number,
  paint: Paint,
): Mesh {
  const geo = concat([
    extrude(shells, depth, paint.line, paint.side),
    extrude(fills, depth + 0.25, paint.fill, paint.side),
  ]);
  return place(parent, geo, z);
}

/** Discs outlined as the drawing outlines a circle: a line 1.1 wide centred on the edge. */
export function discs(parent: Object3D, list: readonly Disc[], z: number, depth: number, paint: Paint): Mesh {
  return outlined(
    parent,
    list.map(([c, r]) => ({ outer: circle(c, r - HALF_LINE) })),
    list.map(([c, r]) => ({ outer: circle(c, r + HALF_LINE) })),
    z,
    depth,
    paint,
  );
}

/** Round-capped bands and discs with their outline outside them, as the drawing's bridges. */
export function bands(
  parent: Object3D,
  list: readonly Band[],
  round: readonly Disc[],
  z: number,
  depth: number,
  paint: Paint,
): Mesh {
  const fills: Outline[] = [];
  const shells: Outline[] = [];
  for (const { pts, w } of list) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      if (!a || !b) continue;
      fills.push({ outer: capsule(a, b, w / 2) });
      shells.push({ outer: capsule(a, b, w / 2 + BAND_LINE) });
    }
  }
  for (const [c, r] of round) {
    fills.push({ outer: circle(c, r) });
    shells.push({ outer: circle(c, r + BAND_LINE) });
  }
  return outlined(parent, fills, shells, z, depth, paint);
}

/** A wall standing along a spiral from `z0` to `z1`, its top edge drawn: the mainspring is a tall steel strip. */
export function curtain(parent: Object3D, pts: readonly Pt[], z0: number, z1: number, paint: Paint): void {
  const position = new Float32Array(pts.length * 6);
  const index: number[] = [];
  pts.forEach((p, i) => {
    position.set([p[0], -p[1], z0, p[0], -p[1], z1], i * 6);
    if (i) {
      const a = 2 * (i - 1);
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const wall = new BufferGeometry();
  wall.setAttribute("position", new BufferAttribute(position, 3));
  wall.setIndex(index);
  parent.add(new Mesh(wall, flatMaterial(paint.fill)));
  const top = new LineSegmentsGeometry().setPositions(
    pts.slice(1).flatMap((p, i) => {
      const q = pts[i] ?? p;
      return [q[0], -q[1], z1 + 0.05, p[0], -p[1], z1 + 0.05];
    }),
  );
  parent.add(new LineSegments2(top, lineMaterial(paint.line)));
}

/** A flat ribbon `width` wide along `n` points at height `z`; the returned function moves it to new points. */
export function ribbon(
  parent: Object3D,
  n: number,
  width: number,
  z: number,
  colour: Color,
): { mesh: Mesh; set: (pts: readonly Pt[]) => void } {
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(n * 6), 3));
  const index: number[] = [];
  for (let i = 1; i < n; i++) {
    const a = 2 * (i - 1);
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  geo.setIndex(index);
  const mesh = new Mesh(geo, flatMaterial(colour));
  mesh.frustumCulled = false;
  parent.add(mesh);
  return { mesh, set: (pts) => setRibbon(mesh, pts, width, z) };
}

/** Moves a ribbon made by `ribbon` to new points. */
export function setRibbon(mesh: Mesh, pts: readonly Pt[], width: number, z: number): void {
  const attr = mesh.geometry.getAttribute("position");
  const pos = attr.array as Float32Array;
  const n = Math.min(pts.length, attr.count / 2);
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const p = pts[i];
    if (!a || !b || !p) continue;
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    const nx = ((-ty / l) * width) / 2;
    const ny = ((tx / l) * width) / 2;
    pos.set([p[0] + nx, -(p[1] + ny), z, p[0] - nx, -(p[1] - ny), z], i * 6);
  }
  attr.needsUpdate = true;
}
