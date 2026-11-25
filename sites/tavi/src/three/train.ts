// The 3D movement's middle layer: the going train, each arbor's wheel, pinion, boss and arbor phased so the teeth
// mesh; the escape wheel and the pallet fork with its stones; the balance with its roller, impulse pin, rim and arms.

import { forkAngle } from "../movement/clock.ts";
import { angleTo, DEG, distance, lerp, polar, type Pt } from "../movement/geometry.ts";
import { crossings, escapeOutline, gearOutline } from "../movement/svg/draw.ts";
import { O, pinStart, shapeOf, type Kit } from "./kit.ts";
import { turned } from "./path.ts";
import { bands, circle, discs, HALF_LINE, outlined, solid } from "./shapes.ts";

/** Builds the train, the escapement and the balance. */
export function buildTrain({ m, paint, pivot, z }: Kit): void {
  const T = m.plate.thickness;
  const { barrel: b, centre: c, third: t, fourth: fo, escape: e, pallet: pa, balance: ba } = m;
  // Each wheel's teeth point along the line to the pinion it drives; each pinion's gap faces its driver.
  const beta = {
    bc: angleTo(b.at, c.at),
    ct: angleTo(c.at, t.at),
    tf: angleTo(t.at, fo.at),
    fe: angleTo(fo.at, e.at),
  };

  // The train. Each arbor: its pinion from just under the teeth that drive it, its wheel above, a boss on the wheel,
  // and the arbor itself up to the train bridge's jewel.
  const bridgeZ = z("train-bridge");
  const arbor = (
    id: "centre" | "third" | "fourth",
    driverZ: number,
    o: {
      readonly hub: number;
      readonly rim: number;
      readonly arbor: number;
      readonly start: number;
      readonly pinion: number;
    },
  ) => {
    const w = m[id];
    const p = pivot(id, id);
    const mod = (2 * w.r) / w.teeth;
    const rf = w.r - 1.25 * mod;
    const wheelZ = z(id);
    solid(
      p,
      [shapeOf(`${gearOutline(w.teeth, w.r, { start: o.start })} ${crossings(4, rf - o.rim, o.hub + 2.5, 2.2)}`)],
      wheelZ,
      2.5,
      paint.gilt,
    );
    const pinion0 = Math.max(T + 0.5, driverZ - 0.5);
    solid(
      p,
      [shapeOf(gearOutline(w.pinion.teeth, w.pinion.r * 0.92, { add: 1.1, ded: 1.4, tipW: 0.22, start: o.pinion }))],
      pinion0,
      driverZ + 3.5 - pinion0,
      paint.steel,
    );
    solid(p, [{ outer: circle(O, o.arbor, 32) }], pinion0, bridgeZ - pinion0, paint.steel);
    solid(p, [{ outer: circle(O, o.hub * 0.95, 40) }], wheelZ - 0.2, 2.9, paint.gilt);
  };
  arbor("centre", z("barrel"), {
    hub: 9,
    rim: 4,
    arbor: 3.2,
    start: beta.ct,
    pinion: pinStart(beta.bc, c.pinion.teeth),
  });
  arbor("third", z("centre"), {
    hub: 7,
    rim: 3.5,
    arbor: 2.6,
    start: beta.tf,
    pinion: pinStart(beta.ct, t.pinion.teeth),
  });
  arbor("fourth", z("third"), {
    hub: 6,
    rim: 3,
    arbor: 2.2,
    start: beta.fe,
    pinion: pinStart(beta.tf, fo.pinion.teeth),
  });

  // The escapement. The stones sit either side of the line to the fork; with the fork on its banking, the escape
  // wheel starts with a tooth locked on whichever stone is in.
  const { stones: stoneAngle, liftAngle, impulsePin } = m.spec.escapement;
  const eAng = angleTo(e.at, pa.at);
  const stoneAt = (sign: number): Pt[] => {
    const a = eAng + sign * stoneAngle * DEG;
    const inner = polar(e.at, e.r - 0.6, a);
    const outer = polar(e.at, e.r + 5.6, a);
    const n: Pt = [-Math.sin(a) * 1.35, Math.cos(a) * 1.35];
    return [
      [inner[0] + n[0], inner[1] + n[1]],
      [outer[0] + n[0], outer[1] + n[1]],
      [outer[0] - n[0], outer[1] - n[1]],
      [inner[0] - n[0], inner[1] - n[1]],
    ];
  };
  const bank = forkAngle((liftAngle / 2) * DEG, m);
  const [locked] = [-1, 1]
    .map((s) => {
      const q = turned(stoneAt(s), bank, pa.at);
      const mid = lerp(q[0] ?? O, q[3] ?? O, 0.5);
      return { r: distance(mid, e.at), ang: angleTo(e.at, mid) };
    })
    .sort((x, y) => x.r - y.r);
  const escStart = ((locked?.ang ?? 0) / DEG - 12.5) * DEG;
  const esc = pivot("escape", "escape");
  const escapeZ = z("escape");
  solid(
    esc,
    [shapeOf(`${escapeOutline(e.teeth, e.r)} ${crossings(5, e.r * 0.66 - 2.6, 4.6, 1.6, 10)}`, escStart)],
    escapeZ,
    2,
    paint.steel,
  );
  const escPinion0 = z("fourth") - 0.5;
  solid(
    esc,
    [
      shapeOf(
        gearOutline(e.pinion.teeth, 3.6, { add: 1.1, ded: 1.4, tipW: 0.22, start: pinStart(beta.fe, e.pinion.teeth) }),
      ),
    ],
    escPinion0,
    4,
    paint.steel,
  );
  solid(esc, [{ outer: circle(O, 1.8, 20) }], escPinion0, bridgeZ - escPinion0, paint.steel);

  const forkZ = z("pallet");
  const fork = pivot("pallet", "pallet");
  const local = (q: Pt): Pt => [q[0] - pa.at[0], q[1] - pa.at[1]];
  const axisA = angleTo(pa.at, ba.at);
  const F = (x: number, y: number): Pt => [
    x * Math.cos(axisA) - y * Math.sin(axisA),
    x * Math.sin(axisA) + y * Math.cos(axisA),
  ];
  const tip = distance(pa.at, ba.at) - impulsePin;
  const stones = [-1, 1].map((s) => stoneAt(s).map(local));
  const stoneMid = stones.map((q) => lerp(lerp(q[0] ?? O, q[3] ?? O, 0.5), lerp(q[1] ?? O, q[2] ?? O, 0.5), 0.5));
  bands(
    fork,
    [
      { pts: [O, stoneMid[0] ?? O], w: 4.4 },
      { pts: [O, stoneMid[1] ?? O], w: 4.4 },
      { pts: [O, F(tip - 2, 0)], w: 3.6 },
      { pts: [F(tip - 1, -4.2), F(tip + 3.5, -4.6)], w: 2.4 },
      { pts: [F(tip - 1, 4.2), F(tip + 3.5, 4.6)], w: 2.4 },
      { pts: [F(tip - 2, -4.4), F(tip - 2, 4.4)], w: 2.4 },
    ],
    [[O, 4.5]],
    forkZ,
    2,
    paint.steel,
  );
  solid(
    fork,
    stones.map((q) => ({ outer: q })),
    forkZ - 0.5,
    3,
    paint.ruby,
  );
  solid(fork, [{ outer: circle(O, 1.6, 20) }], forkZ - 8, 13, paint.steel);

  // The balance: the roller and its impulse pin at the fork's level, the rim and arms above, the staff up to the cock.
  const bal = pivot("balance", "balance");
  const rimZ = z("balance");
  const rollerZ = rimZ - 6;
  const cockZ = z("balance-cock");
  const r = ba.r;
  discs(bal, [[O, 12.5]], rollerZ, 2, paint.steel);
  solid(
    bal,
    [{ outer: circle(polar(O, impulsePin, angleTo(ba.at, pa.at)), 1.3, 16) }],
    rollerZ,
    forkZ + 2.5 - rollerZ,
    paint.ruby,
  );
  outlined(
    bal,
    [{ outer: circle(O, r - HALF_LINE, 120), holes: [circle(O, r - 4.6 + HALF_LINE, 120)] }],
    [{ outer: circle(O, r + HALF_LINE, 120), holes: [circle(O, r - 4.6 - HALF_LINE, 120)] }],
    rimZ,
    3,
    paint.balance,
  );
  bands(
    bal,
    [90, 210, 330].map((a) => ({ pts: [polar(O, 3, a * DEG), polar(O, r - 3, a * DEG)], w: 3.4 })),
    [],
    rimZ,
    2.5,
    paint.balance,
  );
  discs(
    bal,
    [45, 135, 225, 315].map((a) => [polar(O, r - 2.3, a * DEG), 2.4] as const),
    rimZ,
    3.6,
    paint.gilt,
  );
  solid(bal, [{ outer: circle(O, 3.6, 24) }], rollerZ - 3, cockZ - rollerZ + 3, paint.steel);
}
