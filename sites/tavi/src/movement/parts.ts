// The movement as one part table. The SVG builders (svg/) and the 3D scene read it; neither keeps a copy. The spec
// below holds the numbers; `buildCalibre` derives the positions (calibre.ts) and adds what each part is made of, how
// high it sits, how it comes apart and what it is called.

import { buildGeometry, type CalibreSpec, type Geometry, type Toothed, type Wheel } from "./calibre.ts";
import { DEG, lerp, polar, type Pt } from "./geometry.ts";

/** Which token pair colours a part: `--color-part-<material>` and `--color-part-<material>-line`. */
export type Material = "plate" | "bridge" | "brass" | "gilt" | "steel" | "spring" | "balance" | "screw" | "hair";

/** The shade the prose names a part in, `--color-part-<ink>-ink`; null for the page's own ink. */
export type Ink = "brass" | "gilt" | "steel" | "spring" | "balance" | null;

/** Every part, bottom of the stack first. The ids are the drawing's `data-part` names. */
export const PART_IDS = [
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
] as const;

export type PartId = (typeof PART_IDS)[number];

/**
 * How a part comes apart: it rises `lift` units while the 0-to-1 "apart" control crosses its `window`, turning
 * `spin` times on the way (a bridge's screws unscrew).
 */
export interface Explode {
  readonly lift: number;
  readonly window: readonly [number, number];
  readonly spin: number;
}

/** Where a part's label leader lands in the 3D view, and whether a phone labels it too. */
export interface Anchor {
  readonly at: Pt;
  readonly z: number;
  readonly phone: boolean;
}

export interface Part {
  readonly id: PartId;
  /** Its name on a label or in a parts list; null for a group the page never names (a bridge's screws). */
  readonly label: string | null;
  readonly material: Material;
  readonly ink: Ink;
  /** Its pivot, or the centre of its main body. */
  readonly at: Pt;
  /** Teeth and pitch radius, for the parts that have them. */
  readonly gear: Toothed | null;
  readonly pinion: Toothed | null;
  /** Its layer: the height its main body starts at, in plane units above the plate's underside. */
  readonly z: number;
  readonly explode: Explode;
  readonly anchor: Anchor | null;
}

/** A movement: its geometry and its parts. */
export interface Calibre extends Geometry {
  readonly parts: readonly Part[];
}

/**
 * The movement drawn on the site: a 21,600 vph train of the NH35 class (six beats a second), with a barrel of 72
 * teeth, a centre wheel of 80 on a 12-leaf pinion, a third of 75 on 10, a fourth of 84 on 10, and a 15-tooth escape
 * wheel on a 7-leaf pinion. The tooth counts are this drawing's, chosen so the centre wheel turns once an hour and
 * the fourth once a minute; they are not copied from any one maker's calibre.
 */
export const NH35_CLASS: CalibreSpec = {
  name: "21,600 vph, NH35 class",
  vph: 21_600,
  plate: {
    R: 190,
    thickness: 10,
    holes: [
      [-150, 60],
      [150, 40],
      [-60, 165],
    ],
  },
  train: {
    barrel: { teeth: 72, r: 72, at: 225 },
    centre: { teeth: 80, r: 56, leaves: 12 },
    third: { teeth: 75, r: 46, leaves: 10, at: 0 },
    fourth: { teeth: 84, r: 42, leaves: 10, at: 65 },
    escape: { teeth: 15, r: 24, leaves: 7, at: 125 },
  },
  escapement: {
    line: 150,
    stones: 30,
    balanceDistance: 88,
    balanceR: 42,
    liftAngle: 50,
    impulsePin: 11,
    // Drawn at 200 degrees by eye: a fully wound balance swings wider than that.
    amplitude: 200,
  },
  winding: {
    ratchet: { teeth: 36, r: 34 },
    crownWheel: { teeth: 24, r: 17, at: 152 },
    stemDrop: 4,
  },
  feet: {
    barrelBridge: [
      [-152, -62],
      [-8, -112],
    ],
    trainBridge: [
      [-72, 60],
      [128, -54],
    ],
    palletBridge: [64, 150],
    balanceCock: [-98, 146],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// What each part is: its name, its metal, and the shade the prose names it in
// ---------------------------------------------------------------------------------------------------------------

const KINDS: Record<PartId, readonly [label: string | null, material: Material, ink: Ink]> = {
  plate: ["Main plate", "plate", null],
  crown: ["Crown", "steel", "steel"],
  barrel: ["Barrel", "brass", "brass"],
  mainspring: ["Mainspring", "spring", "spring"],
  arbor: ["Barrel arbor", "steel", "steel"],
  lid: ["Barrel lid", "brass", "brass"],
  centre: ["Centre wheel", "gilt", "gilt"],
  third: ["Third wheel", "gilt", "gilt"],
  fourth: ["Fourth wheel", "gilt", "gilt"],
  escape: ["Escape wheel", "steel", "steel"],
  pallet: ["Pallet fork", "steel", "steel"],
  balance: ["Balance", "balance", "balance"],
  hairspring: ["Hairspring", "hair", null],
  "barrel-bridge": ["Barrel bridge", "bridge", null],
  "barrel-screws": [null, "screw", null],
  ratchet: ["Ratchet wheel", "steel", "steel"],
  crownwheel: ["Crown wheel", "steel", "steel"],
  click: ["Click", "steel", "steel"],
  "train-bridge": ["Train bridge", "bridge", null],
  "train-screws": [null, "screw", null],
  "pallet-bridge": ["Pallet bridge", "bridge", null],
  "pallet-screws": [null, "screw", null],
  "balance-cock": ["Balance cock", "bridge", null],
  "cock-screws": [null, "screw", null],
};

// ---------------------------------------------------------------------------------------------------------------
// Taking it apart: each part rises by whole ranks, top parts first, so nothing passes through what it covers
// ---------------------------------------------------------------------------------------------------------------

/** The height of one rank of the lift. */
export const LIFT_RANK = 36;

const lift = (rank: number, from: number, to: number, spin = 0): Explode => ({
  lift: rank * LIFT_RANK,
  window: [from, to],
  spin,
});
/** A bridge's screws leave a little before it, unscrewing two turns on the way. */
const screws = (rank: number, from: number, to: number): Explode =>
  lift(rank + 0.9, Math.max(0, from - 0.06), to - 0.08, 2);

const EXPLODE: Record<PartId, Explode> = {
  plate: lift(0, 0, 1),
  crown: lift(0, 0, 1),
  barrel: lift(1, 0.6, 0.96),
  mainspring: lift(1, 0.6, 0.96),
  arbor: lift(1, 0.6, 0.96),
  lid: lift(2, 0.56, 0.92),
  centre: lift(3, 0.52, 0.88),
  third: lift(4, 0.46, 0.82),
  fourth: lift(5, 0.4, 0.76),
  escape: lift(6, 0.34, 0.7),
  pallet: lift(7, 0.18, 0.55),
  balance: lift(8, 0.08, 0.45),
  hairspring: lift(8, 0.08, 0.45),
  "barrel-bridge": lift(4, 0.32, 0.68),
  "barrel-screws": screws(4, 0.32, 0.68),
  ratchet: lift(6, 0.2, 0.56),
  crownwheel: lift(5, 0.22, 0.58),
  click: lift(5, 0.22, 0.58),
  "train-bridge": lift(7, 0.26, 0.62),
  "train-screws": screws(7, 0.26, 0.62),
  "pallet-bridge": lift(8, 0.14, 0.5),
  "pallet-screws": screws(8, 0.14, 0.5),
  "balance-cock": lift(9, 0.04, 0.4),
  "cock-screws": screws(9, 0.04, 0.4),
};

// ---------------------------------------------------------------------------------------------------------------
// Where each part sits, how high, and where its label lands
// ---------------------------------------------------------------------------------------------------------------

function placesOf(g: Geometry) {
  const { barrel: b, centre: c, third: t, fourth: fo, escape: e, pallet: pa, balance: ba, crownWheel: cw } = g;
  const { barrelBridge, trainBridge, palletBridge, balanceCock } = g.feet;
  const T = g.plate.thickness;
  /** The barrel bridge's top face, which carries the ratchet wheel, the crown wheel and the click. */
  const BB = T + 20.2;
  const click = polar(b.at, 50, -14 * DEG);

  const at: Record<PartId, Pt> = {
    plate: [0, 0],
    crown: [-218, g.stemY],
    barrel: b.at,
    mainspring: b.at,
    arbor: b.at,
    lid: b.at,
    centre: c.at,
    third: t.at,
    fourth: fo.at,
    escape: e.at,
    pallet: pa.at,
    balance: ba.at,
    hairspring: ba.at,
    "barrel-bridge": b.at,
    "barrel-screws": barrelBridge[0],
    ratchet: b.at,
    crownwheel: cw.at,
    click,
    "train-bridge": t.at,
    "train-screws": trainBridge[0],
    "pallet-bridge": pa.at,
    "pallet-screws": palletBridge,
    "balance-cock": ba.at,
    "cock-screws": balanceCock,
  };

  // Each wheel clears the one it overlaps, and each pinion reaches up to the wheel that drives it.
  const z: Record<PartId, number> = {
    plate: 0,
    crown: 5,
    barrel: T + 0.5,
    mainspring: T + 3.5,
    arbor: T + 0.5,
    lid: T + 9,
    centre: T + 11,
    third: T + 15,
    fourth: T + 19,
    escape: T + 23,
    pallet: T + 23,
    balance: T + 26,
    hairspring: T + 30.5,
    "barrel-bridge": T + 15,
    "barrel-screws": BB,
    ratchet: BB,
    crownwheel: BB,
    click: BB,
    "train-bridge": T + 28,
    "train-screws": T + 33.25,
    "pallet-bridge": T + 26,
    "pallet-screws": T + 30.25,
    "balance-cock": T + 32,
    "cock-screws": T + 37.25,
  };

  const pin = (point: Pt, height: number, phone = false): Anchor => ({ at: point, z: height, phone });
  const anchor: Partial<Record<PartId, Anchor>> = {
    plate: pin(polar([0, 0], 186, 62 * DEG), T, true),
    crown: pin([-238, g.stemY - 22], 5),
    barrel: pin(polar(b.at, 70, 200 * DEG), T + 3, true),
    mainspring: pin(polar(b.at, 44, 155 * DEG), T + 8.5),
    lid: pin(polar(b.at, 58, 250 * DEG), T + 10.2),
    centre: pin(polar(c.at, 50, 300 * DEG), T + 13.5, true),
    third: pin(polar(t.at, 42, 330 * DEG), T + 17.5),
    fourth: pin(polar(fo.at, 40, 20 * DEG), T + 21.5),
    escape: pin(polar(e.at, 26, 40 * DEG), T + 25, true),
    pallet: pin(lerp(pa.at, ba.at, 0.45), T + 25, true),
    balance: pin(polar(ba.at, 42, 200 * DEG), T + 29, true),
    hairspring: pin(polar(ba.at, 24, 250 * DEG), T + 30.5),
    "barrel-bridge": pin(polar(b.at, 40, 250 * DEG), T + 20),
    ratchet: pin(polar(b.at, 34, 290 * DEG), BB + 2.5),
    crownwheel: pin(polar(cw.at, 18, 200 * DEG), BB + 2.5),
    click: pin(polar(b.at, 46, -30 * DEG), BB + 1.6),
    "train-bridge": pin(t.at, T + 33, true),
    "pallet-bridge": pin(pa.at, T + 30),
    "balance-cock": pin(lerp(ba.at, balanceCock, 0.55), T + 37),
  };

  const gear: Partial<Record<PartId, Wheel>> = {
    barrel: b,
    centre: c,
    third: t,
    fourth: fo,
    escape: e,
    ratchet: g.ratchet,
    crownwheel: cw,
  };

  return { at, z, anchor, gear };
}

/** The movement from its spec: the geometry from the meshing rules, then every part. */
export function buildCalibre(spec: CalibreSpec): Calibre {
  const geometry = buildGeometry(spec);
  const places = placesOf(geometry);
  const parts = PART_IDS.map((id): Part => {
    const [label, material, ink] = KINDS[id];
    const wheel = places.gear[id];
    return {
      id,
      label,
      material,
      ink,
      at: places.at[id],
      gear: wheel ? { teeth: wheel.teeth, r: wheel.r } : null,
      pinion: wheel?.pinion ?? null,
      z: places.z[id],
      explode: EXPLODE[id],
      anchor: places.anchor[id] ?? null,
    };
  });
  return { ...geometry, parts };
}

/** The movement on the site. */
export const MOVEMENT: Calibre = buildCalibre(NH35_CLASS);

/** A part of a calibre, by its id. */
export function partOf(calibre: Calibre, id: PartId): Part {
  const found = calibre.parts.find((p) => p.id === id);
  if (!found) throw new Error(`No part "${id}" in ${calibre.spec.name}`);
  return found;
}
