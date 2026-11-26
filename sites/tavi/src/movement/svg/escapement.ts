// The escapement close up, for chapters 3 and 4: the escape wheel, the pallet fork with its two ruby stones between
// two banking pins, the roller with its impulse pin, and the balance with its hairspring, drawn large from the part
// table and posed by the clock. The bridges are off; chapter 3 cuts the balance away round its staff so the roller
// shows, and chapter 4 draws the lift window as a thin arc.
//
// The stones are cut from the clock itself. Each face is the path the escape wheel's tooth tip takes across the fork
// while `stateAt(t)` turns them both: the locking face is where the tip rests while the stone unlocks, the impulse face
// is where it slides while the escape wheel gives its push, and the far corner is where it lets go. So at every
// moment the clock names, a tooth rests on a stone, slides down its slanted end, or drops onto the other one.
//
// Every turning group carries a `data-clock` name (`escape`, `fork`, `balance`) and the hairspring's path is
// `data-clock="hair"`; lib/clockFigure.ts rewrites them each frame. The groups a step names carry `s<n>`, as in the
// other drawings, and the stylesheet ghosts the rest.

import { bankings, stateAt, type ClockOptions } from "../clock.ts";
import { angleTo, DEG, distance, polar, type Pt } from "../geometry.ts";
import { MOVEMENT, type Calibre } from "../parts.ts";
import { circ, crossings, f, gearOutline, P } from "./draw.ts";
import { hairspringAt, STUD } from "./pieces.ts";

const O: Pt = [0, 0];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const times = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const unit = (a: Pt): Pt => times(a, 1 / Math.hypot(a[0], a[1]));
const mid = (a: Pt, b: Pt): Pt => times(add(a, b), 0.5);
const turn = (a: Pt, angle: number): Pt => [
  a[0] * Math.cos(angle) - a[1] * Math.sin(angle),
  a[0] * Math.sin(angle) + a[1] * Math.cos(angle),
];
const polygon = (points: readonly Pt[]) => `M${points.map(P).join(" L")} Z`;

/** The convex hull of a few points, anticlockwise on screen. */
function convexHull(points: readonly Pt[]): Pt[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: readonly Pt[]) => {
    const out: Pt[] = [];
    for (const p of list) {
      while (out.length >= 2) {
        const a = out.at(-2);
        const b = out.at(-1);
        if (!a || !b || cross(a, b, p) > 0) break;
        out.pop();
      }
      out.push(p);
    }
    return out.slice(0, -1);
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

// ---------------------------------------------------------------------------------------------------------------
// Inside one beat: the moments of the lift window
// ---------------------------------------------------------------------------------------------------------------

/**
 * Shares of the lift window at which the escape wheel's travel turns over (the corners of `escEase` in clock.ts):
 * the unlock ends, the impulse ends and the tooth lets go, and the next tooth lands on the other stone.
 */
export const WINDOW = { unlocked: 0.15, letOff: 0.82, landed: 0.88 } as const;

/**
 * The time, in seconds, at a share `p` of the lift window in beat `beat`: 0 as the impulse pin enters the fork's
 * notch, 1 as it leaves. The balance passes rest at 0.5.
 */
export function windowMoment(p: number, beat = 0, calibre: Calibre = MOVEMENT): number {
  const { amplitude, liftAngle } = calibre.spec.escapement;
  const half = Math.asin(Math.min(1, liftAngle / 2 / amplitude)) / Math.PI;
  return (beat + 0.5 - half + p * 2 * half) / (calibre.spec.vph / 3600);
}

/** A share of a beat, as a time in seconds: `beatMoment(0.25, 2)` is a quarter of the way through beat 2. */
function beatMoment(share: number, beat: number, calibre: Calibre = MOVEMENT): number {
  return (beat + share) / (calibre.spec.vph / 3600);
}

/** The beat chapter 3's steps take their phases from: two beats on, so the escape wheel reads 24 degrees, one tooth. */
const SHOWN_BEAT = 2;

/**
 * Chapter 3's held moments, by step: locked (the balance far out on its swing), unlocking (the most recoil), the
 * impulse (the balance passing rest), and the other stone just locked after the drop.
 */
export const ESCAPEMENT_HOLDS: Readonly<Record<string, number>> = {
  "1": beatMoment(0.25, SHOWN_BEAT),
  "2": windowMoment(WINDOW.unlocked / 2, SHOWN_BEAT),
  "3": windowMoment(0.5, SHOWN_BEAT),
  "4": windowMoment(0.94, SHOWN_BEAT),
};

/** Chapter 4's clock at first paint: the balance most of the way out on its first swing. */
export const BALANCE_START = beatMoment(0.25, 0);

// ---------------------------------------------------------------------------------------------------------------
// The pose at a moment, in degrees, for the drawing and its frame loop
// ---------------------------------------------------------------------------------------------------------------

export interface ClosePose {
  readonly t: number;
  readonly beats: number;
  /** The escape wheel's turn from t = 0, clockwise. */
  readonly escape: number;
  /** The fork's angle from the line to the balance. */
  readonly fork: number;
  /** The balance's angle from rest. */
  readonly balance: number;
  /** The same, in radians, for the hairspring. */
  readonly theta: number;
  readonly amplitude: number;
}

/** Everything the close-up shows at `t` seconds. */
export function poseAt(t: number, options: ClockOptions = {}, calibre: Calibre = MOVEMENT): ClosePose {
  const s = stateAt(t, options, calibre);
  return {
    t,
    beats: s.beats,
    escape: s.train.escape / DEG,
    fork: s.fork / DEG,
    balance: s.balance / DEG,
    theta: s.balance,
    amplitude: options.amplitude ?? calibre.spec.escapement.amplitude,
  };
}

const count = new Intl.NumberFormat("en-GB");
const signed = (deg: number) => {
  const whole = Math.round(deg);
  return `${whole < 0 ? "−" : whole > 0 ? "+" : ""}${Math.abs(whole)}°`;
};

/** The figures' readouts at a pose, by their `data-readout` names. */
export function readoutsAt(pose: ClosePose): Readonly<Record<string, string>> {
  const within = (((pose.escape % 360) + 360) % 360).toFixed(1);
  return {
    beats: count.format(pose.beats),
    escape: `${within === "360.0" ? "0.0" : within}°`,
    balance: signed(pose.balance),
    amplitude: `${Math.round(pose.amplitude)}°`,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// The escape wheel's teeth
// ---------------------------------------------------------------------------------------------------------------

/** A tooth's shape, in degrees behind its tip and in plane units below the tip circle. */
const TOOTH = {
  /** The heel of the tooth's flat top, behind the tip and a little lower. */
  heel: 6.5,
  heelDrop: 1.1,
  /** Where its front face meets the root circle: behind the tip, so the tooth leans the way the wheel turns. */
  lean: 10,
  /** Where its back meets the root circle, and the control of its curve. */
  back: 19,
  backCurve: 15.5,
  backDepth: 3.8,
} as const;

/** The root circle's radius, as a share of the tips'. */
const ROOT = 0.66;

/** One tooth's outline points about the wheel's centre, its tip at `a`, back root first. */
export function toothOutline(a: number, R: number): readonly Pt[] {
  const root = R * ROOT;
  const backRoot = polar(O, root, a - TOOTH.back * DEG);
  const control = polar(O, R - TOOTH.backDepth, a - TOOTH.backCurve * DEG);
  const heel = polar(O, R - TOOTH.heelDrop, a - TOOTH.heel * DEG);
  const curve = Array.from({ length: 7 }, (_, i): Pt => {
    const u = (i + 1) / 8;
    return add(add(times(backRoot, (1 - u) ** 2), times(control, 2 * u * (1 - u))), times(heel, u * u));
  });
  return [backRoot, ...curve, heel, polar(O, R, a), polar(O, root, a - TOOTH.lean * DEG)];
}

/** The escape wheel's teeth as one outline: each tip leads, its flat top falls back to the heel, its back curves down. */
function teethPath(N: number, R: number, start: number) {
  const root = R * ROOT;
  const pitch = (2 * Math.PI) / N;
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = start + i * pitch;
    const backRoot = polar(O, root, a - TOOTH.back * DEG);
    const control = polar(O, R - TOOTH.backDepth, a - TOOTH.backCurve * DEG);
    const heel = polar(O, R - TOOTH.heelDrop, a - TOOTH.heel * DEG);
    const front = polar(O, root, a - TOOTH.lean * DEG);
    const next = polar(O, root, a + pitch - TOOTH.back * DEG);
    d += `${i ? "L" : "M"}${P(backRoot)} Q${P(control)} ${P(heel)} L${P(polar(O, R, a))} L${P(front)} A${f(root)} ${f(root)} 0 0 1 ${P(next)} `;
  }
  return d + "Z";
}

// ---------------------------------------------------------------------------------------------------------------
// The pallet fork and its stones, in the fork's own frame: its pivot at the origin, x along the line to the balance
// ---------------------------------------------------------------------------------------------------------------

/** How far a stone runs back from its working end into the arm that holds it. */
const STONE_LENGTH = 6.5;
/** Points along a stone's impulse face. */
const FACE_POINTS = 9;

export interface Stone {
  /**
   * The stone's outline in the fork's frame: the locking corner, the impulse face down to the let-off corner, then
   * its two back corners.
   */
  readonly outline: readonly Pt[];
  readonly lockCorner: Pt;
  readonly letOff: Pt;
  /** Where the tooth tip rests at full lock, on the locking face. */
  readonly lock: Pt;
  /** The tooth whose tip is on it at full lock, by the angle of that tip from the escape wheel's centre at t = 0. */
  readonly tooth: number;
  /** The beat in which this stone unlocks first. */
  readonly beat: number;
}

/** The line the fork lies along at rest, from its pivot to the balance (radians). */
const forkLine = (m: Calibre) => angleTo(m.pallet.at, m.balance.at);

/** A point of the plane in the fork's frame, with the fork turned to `fork` (radians). */
const inFork = (m: Calibre, q: Pt, fork: number) => turn(sub(q, m.pallet.at), -(forkLine(m) + fork));

/** Half a tooth's pitch, the escape wheel's travel in one beat (radians). */
const halfPitch = (m: Calibre) => Math.PI / m.escape.teeth;

/**
 * The two stones, cut from the clock. Each sits where a line from the fork's pivot touches the escape wheel's tip
 * circle (`stones` degrees either side of the escapement's line); the stone that is in at t = 0 unlocks in beat 0, the
 * other in beat 1. The tooth on it is followed through its unlocking beat in the fork's frame: where its tip rests at
 * full lock, where the unlock ends (the locking corner), the impulse face it slides down, and where it lets go (the
 * let-off corner). The face follows the tip's path, which bows by a fraction of a unit from a straight cut.
 */
export function palletStones(m: Calibre = MOVEMENT): readonly [Stone, Stone] {
  const { at: E, r: R } = m.escape;
  const start = stateAt(0, {}, m).fork;
  const cut = (side: -1 | 1): Stone => {
    const touch = m.line + side * m.spec.escapement.stones * DEG;
    const contact = polar(E, R, touch);
    // In at t = 0: the stone is inside the tip circle with the fork where the clock starts it.
    const lockedFirst = distance(E, add(m.pallet.at, turn(sub(contact, m.pallet.at), start))) < R;
    const beat = lockedFirst ? 0 : 1;
    const tooth = touch - beat * halfPitch(m);
    const tipAt = (p: number) => {
      const s = stateAt(windowMoment(p, beat, m), {}, m);
      return inFork(m, polar(E, R, tooth + s.train.escape), s.fork);
    };
    const lock = tipAt(0);
    const face = Array.from({ length: FACE_POINTS }, (_, i) =>
      tipAt(WINDOW.unlocked + ((WINDOW.letOff - WINDOW.unlocked) * i) / (FACE_POINTS - 1)),
    );
    const lockCorner = face[0] ?? lock;
    const letOff = face.at(-1) ?? lock;
    const back = times(unit(sub(lock, lockCorner)), STONE_LENGTH);
    return {
      outline: [...face, add(letOff, back), add(lockCorner, back)],
      lockCorner,
      letOff,
      lock,
      tooth,
      beat,
    };
  };
  return [cut(-1), cut(1)];
}

/** The lever's half-width at the pivot and where it meets the fork. */
const LEVER = { root: 1.9, end: 1.5 } as const;

/** Where the lever meets the fork at its end, from the pivot: just short of the notch's bottom. */
const leverEnd = (m: Calibre) => distance(m.pallet.at, m.balance.at) - m.spec.escapement.impulsePin - 1.6 - 3.7;

/** The lever's half-width `x` along it from the pivot. */
export function leverHalf(x: number, m: Calibre = MOVEMENT): number {
  return LEVER.root + ((LEVER.end - LEVER.root) * x) / (leverEnd(m) + 0.5);
}

/** The fork's shapes, in its own frame, each a closed outline: the arbor's boss, the two arms, the lever, the fork. */
export function forkShapes(m: Calibre = MOVEMENT): readonly (readonly Pt[])[] {
  const reach = distance(m.pallet.at, m.balance.at);
  const pin = m.spec.escapement.impulsePin;
  // The impulse pin's centre is `reach - pin` from the pivot with the balance at rest. The slot's walls end just past
  // it: towards the window's edges the pin moves out and sideways, and the horns open steeply to let it go.
  const bottom = reach - pin - 1.6;
  const mouth = reach - pin + 0.1;
  const slot = 1.55;
  const end = leverEnd(m);

  // Each arm runs from the boss to a jaw that frames the stone's back half; the stone is drawn over it.
  const arms = palletStones(m).flatMap(({ lockCorner, letOff, lock }) => {
    const along = unit(sub(lock, lockCorner));
    const across = unit(sub(letOff, lockCorner));
    const tailLock = add(add(lockCorner, times(along, STONE_LENGTH + 0.8)), times(across, -1));
    const tailLetOff = add(add(letOff, times(along, STONE_LENGTH + 0.8)), times(across, 1));
    const jaw = [tailLock, tailLetOff, sub(tailLetOff, times(along, 4)), sub(tailLock, times(along, 4))];
    const toward = unit(mid(tailLock, tailLetOff));
    const side: Pt = [-toward[1] * 2.2, toward[0] * 2.2];
    return [jaw, convexHull([side, times(side, -1), tailLock, tailLetOff])];
  });
  const lever: Pt[] = [
    [0, LEVER.root],
    [end + 0.5, LEVER.end],
    [end + 0.5, -LEVER.end],
    [0, -LEVER.root],
  ];
  const upper: Pt[] = [
    [end, LEVER.end],
    [bottom - 0.8, 3],
    [mouth + 0.6, 5.3],
    [mouth + 2.6, 5],
    [mouth + 1.6, 3.7],
    [mouth + 0.8, 2.6],
    [mouth, slot],
    [bottom, slot],
  ];
  const fork = [...upper, ...upper.map(([x, y]): Pt => [x, -y]).reverse()];
  const boss = Array.from({ length: 24 }, (_, i) => polar(O, 2.8, (i / 24) * 2 * Math.PI));
  return [boss, ...arms, lever, fork];
}

/** Where along the lever the banking pins stop it, and their radius. */
const BANKING_AT = 26;
export const BANKING_R = 1.4;

/** The two banking pins' centres in the plane: each touches the lever's side with the fork at one of its bankings. */
export function bankingPins(m: Calibre = MOVEMENT): readonly [Pt, Pt] {
  const half = leverHalf(BANKING_AT, m);
  const [low, high] = bankings(m);
  const pinAt = (angle: number, side: number) =>
    add(m.pallet.at, turn([BANKING_AT, side * (half + BANKING_R)], forkLine(m) + angle));
  return [pinAt(low, -1), pinAt(high, 1)];
}

// ---------------------------------------------------------------------------------------------------------------
// The drawing
// ---------------------------------------------------------------------------------------------------------------

type ClosePoseName = "escapement" | "balance";

/** The step classes each group carries, by pose: which steps keep it in colour. */
const STEPS: Record<ClosePoseName, Record<string, string>> = {
  escapement: {
    escape: "s1 s3 s4 s5",
    pallet: "s1 s2 s3 s4 s5",
    banking: "s1 s4",
    roller: "s2",
    pin: "s2 s3",
    balance: "s2",
    hairspring: "s2",
  },
  balance: {
    escape: "",
    pallet: "s4",
    banking: "",
    roller: "",
    pin: "s4",
    balance: "s1 s2 s5",
    hairspring: "s1 s3 s5",
  },
};

/** A group turning about `c`: placed there, then turned by the frame loop under its `data-clock` name. */
const turning = (c: Pt, name: string, angle: number, inner: string, base = 0) =>
  `<g transform="translate(${P(c)})${base ? ` rotate(${f(base)})` : ""}"><g data-clock="${name}" transform="rotate(${f(angle)})">${inner}</g></g>`;

/** A shape made of overlapping outlines, drawn as one piece: every outline's border first, then every fill. */
const solid = (shapes: readonly (readonly Pt[])[]) =>
  shapes.map((s) => `<path class="ol" d="${polygon(s)}"/>`).join("") +
  shapes.map((s) => `<path class="fl" d="${polygon(s)}"/>`).join("");

function escapeWheel(m: Calibre, pose: ClosePose, steps: string) {
  const { teeth, r, pinion } = m.escape;
  const first = palletStones(m).find((s) => s.beat === 0)?.tooth ?? 0;
  const body =
    `<path class="fo" fill-rule="evenodd" d="${teethPath(teeth, r, first)} ${crossings(5, r * ROOT - 2.6, 4.6, 1.6, 10)}"/>` +
    `<path class="pin fo" d="${gearOutline(pinion.teeth, 3.6, { add: 1.1, ded: 1.4, tipW: 0.22 })}"/><circle class="hub fo" r="1.8"/>`;
  return `<g class="part p-escape ${steps}" data-part="escape">${turning(m.escape.at, "escape", pose.escape, body)}</g>`;
}

function fork(m: Calibre, pose: ClosePose, steps: string) {
  const stones = palletStones(m)
    .map((s) => `<path class="stone" d="${polygon(s.outline)}"/>`)
    .join("");
  // The stones over the fork's body: each sits in its arm's jaw, its working end out towards the escape wheel.
  const inner =
    `<g class="fork-body">${solid(forkShapes(m))}<circle class="hub fo" r="1.4"/></g>` +
    `<g class="part p-stones" data-part="stones">${stones}</g>`;
  return `<g class="part p-pallet ${steps}" data-part="pallet">${turning(m.pallet.at, "fork", pose.fork, inner, forkLine(m) / DEG)}</g>`;
}

function bankingsOf(m: Calibre, steps: string) {
  const pins = bankingPins(m)
    .map((c) => `<circle class="fo" cx="${f(c[0])}" cy="${f(c[1])}" r="${BANKING_R}"/>`)
    .join("");
  return `<g class="part p-banking ${steps}">${pins}</g>`;
}

/** The impulse pin's direction from the balance staff at rest: towards the fork. */
const pinAngle = (m: Calibre) => angleTo(m.balance.at, m.pallet.at);

function roller(m: Calibre, pose: ClosePose, steps: string) {
  const pin = pinAngle(m);
  // The impulse roller under the fork, the safety roller on it with its crescent where the guard pin passes, the staff.
  const notch = polar(O, 6.4, pin);
  const inner =
    `<circle class="fo" r="12.5"/>` +
    `<path class="fo" fill-rule="evenodd" d="${circ(O, 6.4)} ${circ(notch, 1.7)}"/><circle class="hub fo" r="2.2"/>`;
  return `<g class="part p-roller ${steps}" data-part="roller">${turning(m.balance.at, "balance", pose.balance, inner)}</g>`;
}

function impulsePin(m: Calibre, pose: ClosePose, steps: string) {
  const at = polar(O, m.spec.escapement.impulsePin, pinAngle(m));
  const inner = `<circle class="jewel-pin" cx="${f(at[0])}" cy="${f(at[1])}" r="1.3"/>`;
  return `<g class="part p-impulse ${steps}" data-part="impulse-pin">${turning(m.balance.at, "balance", pose.balance, inner)}</g>`;
}

function balanceWheel(m: Calibre, pose: ClosePose, steps: string, index: boolean) {
  const { r } = m.balance;
  const pin = pinAngle(m);
  // Three arms, set between the impulse pin's directions so the pin shows between them.
  const arms = [60, 180, 300].map((a) => {
    const u = polar(O, 1, pin + a * DEG);
    const n: Pt = [-u[1], u[0]];
    return [
      add(times(u, 3), times(n, 1.7)),
      add(times(u, r - 3), times(n, 1.7)),
      add(times(u, r - 3), times(n, -1.7)),
      add(times(u, 3), times(n, -1.7)),
    ];
  });
  const hub = Array.from({ length: 24 }, (_, i) => polar(O, 4.8, (i / 24) * 2 * Math.PI));
  const rim =
    `<path class="ol" fill-rule="evenodd" d="${circ(O, r)} ${circ(O, r - 4.6)}"/>` +
    arms.map((s) => `<path class="ol" d="${polygon(s)}"/>`).join("") +
    `<path class="ol" d="${polygon(hub)}"/>` +
    `<path class="fl" fill-rule="evenodd" d="${circ(O, r)} ${circ(O, r - 4.6)}"/>` +
    arms.map((s) => `<path class="fl" d="${polygon(s)}"/>`).join("") +
    `<path class="fl" d="${polygon(hub)}"/>`;
  const screws = [15, 105, 195, 285]
    .map((a) => {
      const q = polar(O, r - 2.3, pin + a * DEG);
      return `<circle class="fo" cx="${f(q[0])}" cy="${f(q[1])}" r="2.6"/>`;
    })
    .join("");
  // Chapter 4's index: a short mark on the rim in the impulse pin's direction, read against the lift window.
  const mark = index ? `<path class="index-mark" d="M${P(polar(O, r - 6.5, pin))} L${P(polar(O, r + 4, pin))}"/>` : "";
  const collet = `<g class="collet"><circle class="fo" r="6"/><circle class="hub fo" r="2.2"/></g>`;
  return `<g class="part p-balance ${steps}" data-part="balance">${turning(m.balance.at, "balance", pose.balance, rim + screws + collet + mark)}</g>`;
}

function hairspringOf(m: Calibre, pose: ClosePose, steps: string) {
  const stud = polar(m.balance.at, STUD.r, STUD.at);
  const studShape = `<rect class="fo" x="-1.7" y="-1.2" width="3.4" height="2.4" rx="0.4" transform="translate(${P(stud)}) rotate(290)"/>`;
  return `<g class="part p-hairspring ${steps}" data-part="hairspring"><path class="hair" data-clock="hair" d="${hairspringAt(pose.theta, m)}"/>${studShape}</g>`;
}

/** The lift window: a thin arc round the balance, the impulse pin's directions while it is in the fork's notch. */
function liftWindow(m: Calibre) {
  const c = m.balance.at;
  const half = (m.spec.escapement.liftAngle / 2) * DEG;
  const pin = pinAngle(m);
  const R = m.balance.r + 7;
  const from = polar(c, R, pin - half);
  const to = polar(c, R, pin + half);
  const tick = (a: number) => `M${P(polar(c, R - 2.2, a))} L${P(polar(c, R + 2.2, a))}`;
  const label = polar(c, R + 4.5, pin - half - 4 * DEG);
  return (
    `<g class="window"><path d="M${P(from)} A${f(R)} ${f(R)} 0 0 1 ${P(to)} ${tick(pin - half)} ${tick(pin + half)}"/>` +
    `<text x="${f(label[0])}" y="${f(label[1])}" text-anchor="end">Lift window, ${m.spec.escapement.liftAngle}°</text></g>`
  );
}

/** Chapter 3's cutaway: the balance and hairspring are drawn only outside this circle round the staff. */
const CUT = 15.5;

const escapeAttr = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export interface CloseUpOptions {
  readonly pose: ClosePoseName;
  /** The drawing's id, unique on the page. */
  readonly id: string;
  readonly viewBox: string;
  /** What the drawing shows, for a screen reader. */
  readonly label: string;
  /** The clock's time the drawing is built at: its first paint, and the still frame without scripting. */
  readonly t: number;
  readonly calibre?: Calibre;
}

/** The escapement close up as a complete `<svg role="img">`, posed at `t`. */
export function closeUpSvg({ pose: name, id, viewBox, label, t, calibre: m = MOVEMENT }: CloseUpOptions) {
  const pose = poseAt(t, {}, m);
  const steps = STEPS[name];
  const plate = `<g class="part p-plate" data-part="plate"><circle class="fo" r="${m.plate.R}"/></g>`;
  const lower =
    plate +
    bankingsOf(m, steps.banking ?? "") +
    escapeWheel(m, pose, steps.escape ?? "") +
    roller(m, pose, steps.roller ?? "") +
    fork(m, pose, steps.pallet ?? "") +
    impulsePin(m, pose, steps.pin ?? "");
  const upper =
    balanceWheel(m, pose, steps.balance ?? "", name === "balance") + hairspringOf(m, pose, steps.hairspring ?? "");
  const c = m.balance.at;
  const body =
    name === "escapement"
      ? `<clipPath id="${escapeAttr(id)}-cut"><path clip-rule="evenodd" d="M-400 -400 H400 V400 H-400 Z ${circ(c, CUT)}"/></clipPath>` +
        lower +
        `<g clip-path="url(#${escapeAttr(id)}-cut)">${upper}</g>` +
        `<circle class="cut" cx="${f(c[0])}" cy="${f(c[1])}" r="${CUT}"/>`
      : lower + upper + liftWindow(m);
  return (
    `<svg class="movement diagram closeup mode-${name}" id="${escapeAttr(id)}" viewBox="${escapeAttr(viewBox)}" role="img" aria-label="${escapeAttr(label)}" xmlns="http://www.w3.org/2000/svg">` +
    `<g class="mv">${body}</g></svg>`
  );
}
