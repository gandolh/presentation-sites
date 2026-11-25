// The movement built in 3D from the part table, part by part, as the prototype builds it: every position, tooth count,
// radius and height comes from movement/parts.ts, every outline from the drawing's own builders (movement/svg/), so
// the flat view is the poster. Each part is a group named by its table id; a turning part keeps a pivot with
// `userData.turn` naming the angle of the clock it follows. This file builds the bottom layer (the plate, the crown
// and the barrel); train.ts the wheels, the escapement and the balance; bridges.ts the bridges, the winding parts and
// the sites of the screws and jewels.

import { BufferAttribute, CylinderGeometry, type Object3D } from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { angleTo, type Pt } from "../movement/geometry.ts";
import type { Calibre, PartId } from "../movement/parts.ts";
import { gearOutline } from "../movement/svg/draw.ts";
import { springPath } from "../movement/svg/pieces.ts";
import { buildBridges } from "./bridges.ts";
import type { Palette } from "./colours.ts";
import { createKit, O, shapeOf, type Site } from "./kit.ts";
import { pathPoints } from "./path.ts";
import { circle, curtain, discs, edges, extrude, HALF_LINE, lineMaterial, outlined, place, solid } from "./shapes.ts";
import { buildTrain } from "./train.ts";

/** How far the mainspring is wound as it is built, 0 to 1: the drawing's (`barrelCutaway`). */
export const BUILT_WIND = 0.62;

/** Builds every part into `root`; returns the screw and jewel sites for the instanced meshes. */
export function buildParts(root: Object3D, m: Calibre, paint: Palette): { screws: Site[]; jewels: Site[] } {
  const kit = createKit(root, m, paint);
  const { group, pivot, z } = kit;
  const T = m.plate.thickness;
  const { barrel: b, centre: c } = m;
  const [bFoot0, bFoot1] = m.feet.barrelBridge;
  const [tFoot0, tFoot1] = m.feet.trainBridge;
  const pFoot = m.feet.palletBridge;
  const cockFoot = m.feet.balanceCock;

  // The plate, its pillars under each bridge, and the crown on its stem.
  const plate = group("plate");
  // The plate's screw holes go through it, a rim of the line colour round each as the drawing strokes them.
  const holes = (dr: number) => m.plate.holes.map((q) => circle(q, 3.2 + dr, 20));
  outlined(
    plate,
    [{ outer: circle(O, m.plate.R - HALF_LINE, 160), holes: holes(0.4) }],
    [{ outer: circle(O, m.plate.R + HALF_LINE, 160), holes: holes(-0.4) }],
    0,
    T,
    paint.plate,
  );
  const ring = new LineSegmentsGeometry().setPositions(
    circle(O, m.plate.R - 7, 160).flatMap((p, i, all) => {
      const q = all[(i + 1) % all.length] ?? p;
      return [p[0], -p[1], T + 0.3, q[0], -q[1], T + 0.3];
    }),
  );
  const dashes = new LineSegments2(ring, lineMaterial(paint.plate.fill.clone().lerp(paint.plate.line, 0.7), 0.6, true));
  dashes.computeLineDistances();
  plate.add(dashes);
  const pillars: [readonly Pt[], PartId][] = [
    [[bFoot0, bFoot1], "barrel-bridge"],
    [[tFoot0, tFoot1], "train-bridge"],
    [[pFoot], "pallet-bridge"],
    [[cockFoot], "balance-cock"],
  ];
  for (const [feet, bridge] of pillars)
    discs(
      plate,
      feet.map((q) => [q, 7] as const),
      T,
      z(bridge) - T,
      paint.plate,
    );

  const crown = group("crown");
  const cylinder = (r: number, length: number, x0: number, segments: number) => {
    const geo = new CylinderGeometry(r, r, length, segments, 1).toNonIndexed();
    // The tube is the cylinder's first group, its two caps the others. Seen from the back the tube is what shows, so
    // it takes the fill; every facet's edge is drawn, so the crown's knurling reads as the drawing's flutes.
    const colours = new Float32Array(geo.getAttribute("position").count * 3);
    for (const g of geo.groups) {
      const k = g.materialIndex === 0 ? paint.steel.fill : paint.steel.side;
      for (let i = g.start; i < g.start + g.count; i++) colours.set([k.r, k.g, k.b], i * 3);
    }
    geo.setAttribute("color", new BufferAttribute(colours, 3));
    geo.clearGroups();
    const mesh = place(crown, geo, z("crown"));
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x0 + length / 2, -m.stemY, z("crown"));
    const lines = edges(geo, paint.steel.line, 10);
    lines.rotation.copy(mesh.rotation);
    lines.position.copy(mesh.position);
    crown.add(lines);
  };
  cylinder(3, 62, -198, 12);
  cylinder(22, 40, -238, 28);
  cylinder(9, 6, -200, 20);

  // The barrel: its toothed drum turns; the mainspring, the arbor and the lid ride with it when it comes apart.
  const lidZ = z("lid");
  const drum = pivot("barrel", "barrel");
  solid(drum, [shapeOf(gearOutline(b.teeth, b.r, { start: angleTo(b.at, c.at) }))], z("barrel"), 2.5, paint.brass);
  const drumGeo = extrude(
    [{ outer: circle(O, 62, 96), holes: [circle(O, 59, 96)] }],
    lidZ - z("barrel") - 2.5,
    paint.brass.fill,
    paint.drum.fill,
  );
  place(drum, drumGeo, z("barrel") + 2.5);
  const drumLines = edges(drumGeo, paint.brass.line);
  drumLines.position.z = z("barrel") + 2.5;
  drum.add(drumLines);
  const [spring = []] = pathPoints(springPath(BUILT_WIND, b.at));
  curtain(group("mainspring"), spring, z("mainspring"), lidZ - 0.5, paint.spring);
  discs(group("arbor"), [[b.at, 13]], z("arbor"), z("barrel-bridge") - z("arbor"), paint.steel);
  solid(group("lid"), [{ outer: circle(b.at, 62, 96), holes: [circle(b.at, 13.6, 40)] }], lidZ, 1.2, paint.brass);

  buildTrain(kit);
  buildBridges(kit);
  return { screws: kit.screws, jewels: kit.jewels };
}
