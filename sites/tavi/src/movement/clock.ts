// The tick: the whole movement's pose as one pure function of time. The balance swings at the calibre's beat rate;
// the escape wheel moves half a tooth each beat (a hair of recoil, the impulse, the drop, then lock); every other
// wheel follows the escape wheel through the tooth ratios, and the hands follow the centre and fourth wheels. Angles
// are radians, clockwise positive (y down): the train's as seen from the back, the hands' as seen on the dial.

import type { Toothed, TrainId } from "./calibre.ts";
import { angleTo, DEG, polar } from "./geometry.ts";
import { MOVEMENT, type Calibre } from "./parts.ts";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The time the hands show at t = 0, in seconds after twelve: 10:10:30, as watches are set to be photographed. */
const HANDS_START = 10 * 3600 + 10 * 60 + 30;

/** The mainspring's power reserve when fully wound, in hours (the NH35's "more than 41 hours"). */
export const RESERVE_HOURS = 41;

/** The share of the drawn amplitude the balance still swings to when the spring has almost run down. */
const LOW_AMPLITUDE = 0.65;

export interface ClockOptions {
  /** Degrees either side of rest. Defaults to the calibre's drawn amplitude, lowered by `reserve`. */
  readonly amplitude?: number;
  /**
   * Hours of power left in the mainspring, 0 to 41 (`RESERVE_HOURS`); defaults to a full spring. The balance's
   * amplitude falls with it, from the drawn amplitude when fully wound to 65% of it as the spring runs down, then
   * eases to nothing over the last hour. At zero the balance stands still, and so does everything it drives.
   */
  readonly reserve?: number;
  /** The time the hands show at t = 0, in seconds after twelve. Defaults to 10:10:30. */
  readonly time?: number;
}

/** The hands, each from twelve o'clock, clockwise as seen on the dial. */
interface Hands {
  readonly hour: number;
  readonly minute: number;
  readonly seconds: number;
}

export interface ClockState {
  /** Whole beats since t = 0. */
  readonly beats: number;
  /** The escape wheel's travel in half-teeth (one a beat), with its recoil, impulse and drop inside each beat. */
  readonly steps: number;
  /** The balance's angle from rest. */
  readonly balance: number;
  /** The pallet fork's angle from the line to the balance. */
  readonly fork: number;
  /** Each wheel of the train, from its pose at t = 0. */
  readonly train: Readonly<Record<TrainId, number>>;
  readonly hands: Hands;
}

/** Half the lift angle, in radians: the impulse pin is in the fork's notch while the balance is within this. */
function halfLift(calibre: Calibre): number {
  return (calibre.spec.escapement.liftAngle / 2) * DEG;
}

/** The escape wheel's travel inside one beat, 0 to 1: a hair of recoil as the stone unlocks, the impulse, the drop,
 * then lock. */
export function escEase(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (p < 0.15) return -0.04 * Math.sin((Math.PI * p) / 0.15);
  if (p < 0.82) {
    const u = (p - 0.15) / 0.67;
    return 0.82 * u * u * (3 - 2 * u);
  }
  return 0.82 + 0.18 * Math.min(1, (p - 0.82) / 0.06);
}

/** The fork's angle for a balance angle: it follows the impulse pin while the pin is in the notch, and rests on a
 * banking outside it. */
export function forkAngle(theta: number, calibre: Calibre = MOVEMENT): number {
  const { pallet, balance } = calibre;
  const lift = halfLift(calibre);
  const pin = polar(
    balance.at,
    calibre.spec.escapement.impulsePin,
    angleTo(balance.at, pallet.at) + clamp(theta, -lift, lift),
  );
  let a = angleTo(pallet.at, pin) - angleTo(pallet.at, balance.at);
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/** The fork's two banking angles, lower first: it never swings past them. */
export function bankings(calibre: Calibre = MOVEMENT): readonly [number, number] {
  const lift = halfLift(calibre);
  const a = forkAngle(-lift, calibre);
  const b = forkAngle(lift, calibre);
  return a < b ? [a, b] : [b, a];
}

/**
 * Each train wheel's turn for one turn of the escape wheel, signed: a wheel drives the next one's pinion, so each
 * mesh divides by teeth over leaves and reverses the sense.
 */
export function trainRatios(calibre: Calibre = MOVEMENT): Readonly<Record<TrainId, number>> {
  const { barrel, centre, third, fourth, escape } = calibre;
  const mesh = (wheel: Toothed, pinion: Toothed) => -pinion.teeth / wheel.teeth;
  const fourthTurns = mesh(fourth, escape.pinion);
  const thirdTurns = fourthTurns * mesh(third, fourth.pinion);
  const centreTurns = thirdTurns * mesh(centre, third.pinion);
  const barrelTurns = centreTurns * mesh(barrel, centre.pinion);
  return { escape: 1, fourth: fourthTurns, third: thirdTurns, centre: centreTurns, barrel: barrelTurns };
}

/**
 * The hour wheel's turn for one turn of the cannon pinion: the cannon pinion drives the minute wheel, whose pinion
 * drives the hour wheel. Two meshes, so the hour hand turns the same way as the minute hand.
 */
export function motionRatio(calibre: Calibre = MOVEMENT): number {
  const { cannon, minuteWheel, hourWheel } = calibre.motionWorks;
  return (cannon.teeth / minuteWheel.teeth) * (minuteWheel.pinion.teeth / hourWheel.teeth);
}

/**
 * The hands for the train's pose. The dial side is the back seen in a mirror, so a wheel turning anticlockwise from
 * the back turns its hand clockwise on the dial: the minute hand rides the centre arbor (through the cannon pinion),
 * the hour hand the hour wheel, and the small seconds the fourth wheel's arbor.
 */
function handsOf(train: Readonly<Record<TrainId, number>>, time: number, calibre: Calibre): Hands {
  const turn = 2 * Math.PI;
  const from = (period: number) => ((time % period) / period) * turn;
  return {
    hour: from(43_200) - train.centre * motionRatio(calibre),
    minute: from(3600) - train.centre,
    seconds: from(60) - train.fourth,
  };
}

/** The balance's amplitude in degrees for `reserve` hours of power: the drawn amplitude when fully wound. */
export function amplitudeAt(reserve: number, calibre: Calibre = MOVEMENT): number {
  const left = clamp(reserve, 0, RESERVE_HOURS);
  const full = calibre.spec.escapement.amplitude;
  const share = left / RESERVE_HOURS;
  return full * (LOW_AMPLITUDE + (1 - LOW_AMPLITUDE) * share) * Math.min(1, left);
}

/** The movement's pose at `t` seconds. Pure: the same `t` and options give the same state. */
export function stateAt(t: number, options: ClockOptions = {}, calibre: Calibre = MOVEMENT): ClockState {
  const reserve = options.reserve ?? RESERVE_HOURS;
  const stopped = reserve <= 0;
  // A hair above nothing at the least, so the lift window below stays defined; a stopped balance is posed at rest.
  const amplitude = Math.max((options.amplitude ?? amplitudeAt(reserve, calibre)) * DEG, 1e-6);
  const lift = halfLift(calibre);
  // Half the lift window, in beats: the share of a beat the balance spends within the lift angle of rest.
  const halfWindow = Math.asin(Math.min(1, lift / amplitude)) / Math.PI;

  const phi = (t * calibre.spec.vph) / 3600; // beats since t = 0
  // A balance with no power left stands at rest, the escape wheel locked on a stone where the last beat left it.
  const theta = stopped ? 0 : amplitude * Math.cos(Math.PI * phi); // through rest at every half beat
  const beats = Math.floor(phi);
  const p = stopped ? 0 : clamp((phi - beats - 0.5 + halfWindow) / (2 * halfWindow), 0, 1);
  const steps = beats + escEase(p);

  // The escape wheel moves half a tooth a beat: two beats let one tooth pass.
  const escape = steps * ((2 * Math.PI) / (2 * calibre.escape.teeth));
  const r = trainRatios(calibre);
  const train = {
    barrel: escape * r.barrel,
    centre: escape * r.centre,
    third: escape * r.third,
    fourth: escape * r.fourth,
    escape,
  };
  const hands = handsOf(train, options.time ?? HANDS_START, calibre);
  return { beats, steps, balance: theta, fork: forkAngle(theta, calibre), train, hands };
}
