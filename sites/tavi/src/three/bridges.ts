// The 3D movement's top layer: the barrel bridge with the ratchet wheel, the crown wheel and the click on it, the train
// bridge, the pallet bridge and the balance cock, each with its jewels, and the screws that hold them, slotted as the
// drawing slots them. The bridge screws and most jewels are listed as sites for movement.ts's instanced meshes.

import { DEG, polar, type Pt } from "../movement/geometry.ts";
import type { PartId } from "../movement/parts.ts";
import { gearOutline, ratchetOutline } from "../movement/svg/draw.ts";
import { bandPair, hullPair, JEWEL_R, jewelGeometry, SCREW_R, screwGeometry, shapeOf, type Kit } from "./kit.ts";
import { bands, outlined, place, solid } from "./shapes.ts";

/** Builds the bridges and the winding parts, and lists the screws' and jewels' sites. */
export function buildBridges({ m, paint, group, pivot, z, screws, jewels }: Kit): void {
  const { barrel: b, centre: c, third: t, fourth: fo, escape: e, pallet: pa, balance: ba, crownWheel: cw } = m;
  const [bFoot0, bFoot1] = m.feet.barrelBridge;
  const [tFoot0, tFoot1] = m.feet.trainBridge;
  const pFoot = m.feet.palletBridge;
  const cockFoot = m.feet.balanceCock;
  const bridgeZ = z("train-bridge");
  const cockZ = z("balance-cock");

  // The bridges, each on its pillars, with its jewels and screws.
  const bbZ = z("barrel-bridge");
  const bbHull = hullPair([
    [b.at, 40],
    [cw.at, 21],
    [bFoot0, 12],
  ]);
  const bbArm = bandPair([{ pts: [b.at, bFoot1], w: 20 }], [[bFoot1, 11]]);
  outlined(
    group("barrel-bridge"),
    [bbHull.fill, ...bbArm.fills],
    [bbHull.shell, ...bbArm.shells],
    bbZ,
    5,
    paint.bridge,
  );

  const winding = z("ratchet");
  const ratchet = pivot("ratchet");
  // The ratchet wheel turns with the winding, a tooth at a time (movement.ts).
  ratchet.userData["wind"] = true;
  solid(ratchet, [shapeOf(ratchetOutline(m.ratchet.teeth, m.ratchet.r))], winding, 2.5, paint.steel);
  place(ratchet, screwGeometry(9, paint), winding + 2.5).rotation.z = -60 * DEG;
  const crownWheel = pivot("crownwheel");
  solid(crownWheel, [shapeOf(gearOutline(cw.teeth, cw.r, { tipW: 0.22 }))], z("crownwheel"), 2.5, paint.steel);
  screws.push({ part: "crownwheel", at: cw.at, z: z("crownwheel") + 2.5, r: 5.4, slot: 110 });
  const clickPivot = polar(b.at, 50, -14 * DEG);
  const click = group("click");
  bands(
    click,
    [{ pts: [clickPivot, polar(b.at, 42, -32 * DEG), polar(b.at, m.ratchet.r - 1.2, -44 * DEG)], w: 5 }],
    [],
    z("click"),
    1.6,
    paint.steel,
  );
  const clickScrew = place(click, screwGeometry(3.6, paint), z("click") + 1.7);
  clickScrew.position.x = clickPivot[0];
  clickScrew.position.y = -clickPivot[1];

  bands(
    group("train-bridge"),
    [
      { pts: [tFoot1, t.at, fo.at, e.at], w: 16 },
      { pts: [tFoot0, c.at], w: 15 },
    ],
    [
      [c.at, 10.5],
      [t.at, 11],
      [fo.at, 11],
      [e.at, 10],
      [tFoot0, 10],
    ],
    bridgeZ,
    5,
    paint.bridge,
  );
  for (const q of [c.at, t.at, fo.at, e.at])
    jewels.push({ part: "train-bridge", at: q, z: bridgeZ + 5.25, r: JEWEL_R, slot: 0 });

  const pbZ = z("pallet-bridge");
  bands(
    group("pallet-bridge"),
    [{ pts: [pa.at, pFoot], w: 11 }],
    [
      [pa.at, 8],
      [pFoot, 8],
    ],
    pbZ,
    4,
    paint.bridge,
  );
  jewels.push({ part: "pallet-bridge", at: pa.at, z: pbZ + 4.25, r: JEWEL_R, slot: 0 });

  const cock = group("balance-cock");
  const cockHull = hullPair([
    [ba.at, 13],
    [cockFoot, 19],
  ]);
  outlined(cock, [cockHull.fill], [cockHull.shell], cockZ, 5, paint.bridge);
  bands(cock, [{ pts: [ba.at, polar(ba.at, 30, -62 * DEG)], w: 2.2 }], [], cockZ + 5.25, 1.2, paint.bridge);
  const shock = place(cock, jewelGeometry(3.4, paint), cockZ + 6.5);
  shock.position.x = ba.at[0];
  shock.position.y = -ba.at[1];

  // The bridge screws, slotted as the drawing slots them: 37 degrees on from one to the next.
  const feet: [Pt, PartId][] = [
    [bFoot0, "barrel-screws"],
    [bFoot1, "barrel-screws"],
    [tFoot0, "train-screws"],
    [tFoot1, "train-screws"],
    [pFoot, "pallet-screws"],
    [cockFoot, "cock-screws"],
  ];
  feet.forEach(([at, part], i) => {
    group(part);
    screws.push({ part, at, z: z(part), r: SCREW_R, slot: 20 + i * 37 });
  });
}
