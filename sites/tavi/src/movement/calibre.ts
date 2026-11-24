// A calibre's geometry from its spec. The spec gives tooth counts, pitch radii and the angle each wheel sits at from
// its neighbour; every position follows from the meshing rules: a pinion takes the module of the wheel that drives
// it, and each pair sits at the sum of their pitch radii. Another calibre is another spec, not edits across files.

import { DEG, polar, type Pt } from "./geometry.ts";

/** A toothed wheel or pinion: its tooth (or leaf) count and its pitch radius. */
export interface Toothed {
  readonly teeth: number;
  readonly r: number;
}

/** A wheel on its arbor: where it pivots, its teeth, and the pinion on the same arbor, if any. */
export interface Wheel extends Toothed {
  readonly at: Pt;
  readonly pinion: Toothed | null;
}

interface WheelSpec {
  readonly teeth: number;
  readonly r: number;
}
interface ArborSpec extends WheelSpec {
  /** Leaves of the pinion on the same arbor. */
  readonly leaves: number;
  /** Degrees, from the wheel that drives this one's pinion to this wheel. */
  readonly at: number;
}

export interface CalibreSpec {
  readonly name: string;
  /** Beats an hour: the balance's rate, which the train turns into one turn of the centre wheel an hour. */
  readonly vph: number;
  readonly plate: { readonly R: number; readonly thickness: number; readonly holes: readonly Pt[] };
  /**
   * The going train. The centre wheel sits at the origin, and the barrel is placed from it; every other wheel is
   * placed from the wheel that drives its pinion. Each wheel drives the next one's pinion.
   */
  readonly train: {
    readonly barrel: WheelSpec & { readonly at: number };
    readonly centre: WheelSpec & { readonly leaves: number };
    readonly third: ArborSpec;
    readonly fourth: ArborSpec;
    /** The escape wheel's `r` is its tip radius: its teeth meet the pallet stones, not another wheel. */
    readonly escape: ArborSpec;
  };
  readonly escapement: {
    /** Degrees: the line from the escape wheel through the pallet arbor to the balance. */
    readonly line: number;
    /** Degrees: each pallet stone sits this far either side of the line, seen from the escape wheel. */
    readonly stones: number;
    /** Escape wheel to balance staff, along the line. */
    readonly balanceDistance: number;
    /** The balance rim's radius. */
    readonly balanceR: number;
    /** Degrees of balance swing while the impulse pin is in the fork's notch (the lift angle). */
    readonly liftAngle: number;
    /** The impulse pin's distance from the balance staff. */
    readonly impulsePin: number;
    /** Degrees: the drawn balance amplitude, either side of rest. */
    readonly amplitude: number;
  };
  readonly winding: {
    /** On the barrel arbor. */
    readonly ratchet: WheelSpec;
    /** Placed from the ratchet wheel, at `at` degrees. */
    readonly crownWheel: WheelSpec & { readonly at: number };
    /** The winding stem runs this far below the crown wheel's centre. */
    readonly stemDrop: number;
  };
  /** Where the bridges are screwed to the plate. */
  readonly feet: {
    readonly barrelBridge: readonly [Pt, Pt];
    readonly trainBridge: readonly [Pt, Pt];
    readonly palletBridge: Pt;
    readonly balanceCock: Pt;
  };
  /**
   * The dial side, under the plate. The motion works: the cannon pinion rides the centre arbor and drives the minute
   * wheel, whose pinion drives the hour wheel back on the centre arbor; both pairs share one module, so the hour wheel
   * sits coaxial with the cannon pinion. Then the dial, its small seconds over the fourth wheel, and the hands' lengths.
   */
  readonly dialSide: {
    readonly motionWorks: {
      readonly module: number;
      /** Leaves of the cannon pinion. */
      readonly cannon: number;
      /** The minute wheel's teeth, its pinion's leaves, and the angle it sits at from the centre arbor (degrees). */
      readonly minuteWheel: { readonly teeth: number; readonly leaves: number; readonly at: number };
      /** Teeth of the hour wheel. */
      readonly hourWheel: number;
    };
    /** The dial's radius, and the small seconds' radius, centred on the fourth wheel's arbor. */
    readonly dial: { readonly R: number; readonly smallSeconds: number };
    /** Each hand's length from its arbor to its tip. */
    readonly hands: { readonly hour: number; readonly minute: number; readonly seconds: number };
  };
}

/** The going train's wheels, in order of drive. */
export type TrainId = "barrel" | "centre" | "third" | "fourth" | "escape";

type Arbor = Wheel & { readonly pinion: Toothed };

/** Where everything sits, derived from a spec. */
export interface Geometry {
  readonly spec: CalibreSpec;
  readonly plate: CalibreSpec["plate"];
  readonly barrel: Wheel;
  readonly centre: Arbor;
  readonly third: Arbor;
  readonly fourth: Arbor;
  readonly escape: Arbor;
  readonly pallet: { readonly at: Pt };
  readonly balance: { readonly at: Pt; readonly r: number };
  readonly ratchet: Wheel;
  readonly crownWheel: Wheel;
  /** The winding stem's height in the plane. */
  readonly stemY: number;
  readonly feet: CalibreSpec["feet"];
  /** Radians: the escapement's line. */
  readonly line: number;
  /** The motion works, under the dial: the cannon pinion and the hour wheel on the centre arbor, the minute wheel
   * beside them with its pinion. */
  readonly motionWorks: {
    readonly cannon: Wheel;
    readonly minuteWheel: Arbor;
    readonly hourWheel: Wheel;
  };
  /** The dial and the small seconds, centred on the fourth wheel's arbor. */
  readonly dial: { readonly R: number; readonly smallSeconds: { readonly at: Pt; readonly r: number } };
  readonly hands: CalibreSpec["dialSide"]["hands"];
}

/** A wheel's module: pitch diameter over teeth. Two toothed parts mesh only at the same module. */
export function moduleOf(w: Toothed): number {
  return (2 * w.r) / w.teeth;
}

/** The pitch radius of a pinion of `leaves` driven by `driver`: the driver's module, so the two mesh. */
function pinionFor(leaves: number, driver: Toothed): Toothed {
  return { teeth: leaves, r: (leaves * moduleOf(driver)) / 2 };
}

/** The movement's geometry from its spec: every position from the meshing rules. */
export function buildGeometry(spec: CalibreSpec): Geometry {
  const t = spec.train;
  const centre: Arbor = {
    at: [0, 0],
    teeth: t.centre.teeth,
    r: t.centre.r,
    pinion: pinionFor(t.centre.leaves, t.barrel),
  };
  const barrel: Wheel = {
    teeth: t.barrel.teeth,
    r: t.barrel.r,
    pinion: null,
    at: polar(centre.at, t.barrel.r + centre.pinion.r, t.barrel.at * DEG),
  };
  const driven = (s: ArborSpec, driver: Wheel): Arbor => {
    const pinion = pinionFor(s.leaves, driver);
    return { teeth: s.teeth, r: s.r, pinion, at: polar(driver.at, driver.r + pinion.r, s.at * DEG) };
  };
  const third = driven(t.third, centre);
  const fourth = driven(t.fourth, third);
  const escape = driven(t.escape, fourth);

  const e = spec.escapement;
  const line = e.line * DEG;
  const pallet = { at: polar(escape.at, escape.r / Math.cos(e.stones * DEG), line) };
  const balance = { at: polar(escape.at, e.balanceDistance, line), r: e.balanceR };

  const w = spec.winding;
  const ratchet: Wheel = { teeth: w.ratchet.teeth, r: w.ratchet.r, pinion: null, at: barrel.at };
  const crownWheel: Wheel = {
    teeth: w.crownWheel.teeth,
    r: w.crownWheel.r,
    pinion: null,
    at: polar(barrel.at, w.ratchet.r + w.crownWheel.r, w.crownWheel.at * DEG),
  };

  const d = spec.dialSide;
  const mw = d.motionWorks;
  const pitch = (teeth: number) => (teeth * mw.module) / 2;
  const cannon: Wheel = { teeth: mw.cannon, r: pitch(mw.cannon), pinion: null, at: centre.at };
  const minuteWheel: Arbor = {
    teeth: mw.minuteWheel.teeth,
    r: pitch(mw.minuteWheel.teeth),
    pinion: { teeth: mw.minuteWheel.leaves, r: pitch(mw.minuteWheel.leaves) },
    at: polar(centre.at, cannon.r + pitch(mw.minuteWheel.teeth), mw.minuteWheel.at * DEG),
  };
  const hourWheel: Wheel = { teeth: mw.hourWheel, r: pitch(mw.hourWheel), pinion: null, at: centre.at };

  return {
    spec,
    plate: spec.plate,
    barrel,
    centre,
    third,
    fourth,
    escape,
    pallet,
    balance,
    ratchet,
    crownWheel,
    stemY: crownWheel.at[1] + w.stemDrop,
    feet: spec.feet,
    line,
    motionWorks: { cannon, minuteWheel, hourWheel },
    dial: { R: d.dial.R, smallSeconds: { at: fourth.at, r: d.dial.smallSeconds } },
    hands: d.hands,
  };
}
