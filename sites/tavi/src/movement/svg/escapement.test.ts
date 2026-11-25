import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { bankings, escEase, stateAt } from "../clock.ts";
import { angleTo, DEG, polar, type Pt } from "../geometry.ts";
import { MOVEMENT } from "../parts.ts";
import {
  BANKING_R,
  bankingPins,
  closeUpSvg,
  ESCAPEMENT_HOLDS,
  forkShapes,
  leverHalf,
  palletStones,
  poseAt,
  readoutsAt,
  toothOutline,
  WINDOW,
  windowMoment,
} from "./escapement.ts";
import { hairspring, hairspringAt } from "./pieces.ts";

const m = MOVEMENT;
const E = m.escape.at;
const P = m.pallet.at;
const B = m.balance.at;
const line = angleTo(P, B);
const beat = 3600 / m.spec.vph;

const turn = (a: Pt, angle: number): Pt => [
  a[0] * Math.cos(angle) - a[1] * Math.sin(angle),
  a[0] * Math.sin(angle) + a[1] * Math.cos(angle),
];
/** A point of the plane in the fork's frame, the fork turned to `fork` radians. */
const inFork = (q: Pt, fork: number) => turn([q[0] - P[0], q[1] - P[1]], -(line + fork));

function inside(q: Pt, polygon: readonly Pt[]) {
  let c = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi = 0, yi = 0] = polygon[i] ?? [];
    const [xj = 0, yj = 0] = polygon[j] ?? [];
    if (yi > q[1] !== yj > q[1] && q[0] < ((xj - xi) * (q[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function toEdge(q: Pt, a: Pt, b: Pt) {
  const ab = [b[0] - a[0], b[1] - a[1]] as const;
  const aq = [q[0] - a[0], q[1] - a[1]] as const;
  const u = Math.max(0, Math.min(1, (aq[0] * ab[0] + aq[1] * ab[1]) / (ab[0] ** 2 + ab[1] ** 2)));
  return Math.hypot(aq[0] - u * ab[0], aq[1] - u * ab[1]);
}
/** How far `q` is inside `polygon`: 0 outside, else its distance to the nearest edge. */
function depth(q: Pt, polygon: readonly Pt[]) {
  if (!inside(q, polygon)) return 0;
  let d = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    d = Math.min(d, toEdge(q, polygon[j] ?? q, polygon[i] ?? q));
  }
  return d;
}
/** The outline's edges, cut into short pieces, so a check finds an edge passing through a shape. */
function dense(points: readonly Pt[]) {
  return points.flatMap((a, i) => {
    const b = points[(i + 1) % points.length] ?? a;
    return Array.from({ length: 10 }, (_, k): Pt => [a[0] + ((b[0] - a[0]) * k) / 10, a[1] + ((b[1] - a[1]) * k) / 10]);
  });
}
/** The escape wheel's teeth at `t` that come within reach of the fork, in the fork's frame. */
function teethAt(t: number) {
  const s = stateAt(t);
  const first = palletStones().find((stone) => stone.beat === 0)?.tooth ?? 0;
  return Array.from({ length: m.escape.teeth }, (_, k) =>
    toothOutline(first + (k * 2 * Math.PI) / m.escape.teeth + s.train.escape, m.escape.r).map((q) =>
      inFork([q[0] + E[0], q[1] + E[1]], s.fork),
    ),
  ).filter((tooth) => tooth.some(([x, y]) => Math.hypot(x, y) < 22));
}
/** Moments through two beats, one stone unlocking in each. */
const twoBeats = Array.from({ length: 801 }, (_, i) => (i / 800) * 2 * beat + 1e-6);

describe("the escapement close up", () => {
  test("over one beat the escape wheel turns 12 degrees: a recoil first, the drop after the impulse", () => {
    const start = windowMoment(0, 2);
    const at = (p: number) => poseAt(windowMoment(p, 2)).escape - poseAt(start).escape;
    assert.ok(Math.abs(poseAt(start + beat).escape - poseAt(start).escape - 12) < 1e-9, "12 degrees a beat");
    assert.ok(at(WINDOW.unlocked / 2) < -0.4, "the recoil");
    assert.ok(Math.abs(at(WINDOW.letOff) - 9.84) < 1e-9, "the impulse ends short of 12");
    assert.ok(Math.abs(at(WINDOW.landed) - 12) < 1e-9, "dropped and locked");
  });

  test("the window's moments are escEase's corners", () => {
    assert.ok(Math.abs(escEase(WINDOW.unlocked)) < 1e-12);
    assert.equal(escEase(WINDOW.letOff), 0.82);
    assert.equal(escEase(WINDOW.landed), 1);
  });

  test("each of chapter 3's held moments shows its phase", () => {
    const [low, high] = bankings();
    const at = (step: string) => poseAt(ESCAPEMENT_HOLDS[step] ?? NaN);
    const locked = at("1");
    assert.equal(locked.escape, 24, "locked one tooth on");
    assert.ok(Math.abs(locked.fork - low / DEG) < 1e-9, "the fork on its banking");
    assert.ok(at("2").escape < 24, "unlocking: the wheel backs up");
    assert.ok(at("3").escape > 24 && at("3").escape < 36, "the impulse");
    assert.equal(Math.round(at("3").balance), 0, "the balance passing rest");
    const lock = at("4");
    assert.equal(lock.escape, 36, "locked on the other stone");
    assert.ok(lock.fork > 0 && lock.fork < high / DEG, "the fork on its way to the other banking");
  });

  test("a tooth rests on a stone's locking face at full lock, and no tooth ever runs into a stone", () => {
    const stones = palletStones();
    assert.notEqual(stones[0].beat, stones[1].beat, "one stone unlocks in each beat");
    for (const stone of stones) {
      const tip = inFork(
        polar(E, m.escape.r, stone.tooth + stateAt(windowMoment(0, stone.beat)).train.escape),
        stateAt(windowMoment(0, stone.beat)).fork,
      );
      assert.ok(toEdge(tip, stone.lockCorner, stone.outline.at(-1) ?? tip) < 0.01, "the tip is on the locking face");
    }
    let worst = 0;
    for (const t of twoBeats) {
      for (const tooth of teethAt(t)) {
        for (const q of dense(tooth)) for (const stone of stones) worst = Math.max(worst, depth(q, stone.outline));
        for (const stone of stones) for (const q of stone.outline) worst = Math.max(worst, depth(q, tooth));
      }
    }
    assert.ok(worst < 0.05, `a tooth runs ${worst.toFixed(3)} into a stone`);
  });

  test("the escape wheel's teeth never touch the fork's body", () => {
    const shapes = forkShapes();
    let worst = 0;
    for (const t of twoBeats) {
      for (const tooth of teethAt(t)) {
        for (const q of dense(tooth)) for (const shape of shapes) worst = Math.max(worst, depth(q, shape));
      }
    }
    assert.equal(worst, 0);
  });

  test("the impulse pin sits in the fork's notch through the lift window and leaves it clear", () => {
    const shapes = forkShapes();
    const pin = m.spec.escapement.impulsePin;
    let worst = 0;
    for (const t of twoBeats) {
      const s = stateAt(t);
      const at = inFork(polar(B, pin, angleTo(B, P) + s.balance), s.fork);
      for (let k = 0; k < 24; k++) {
        const q: Pt = [at[0] + 1.3 * Math.cos((k * Math.PI) / 12), at[1] + 1.3 * Math.sin((k * Math.PI) / 12)];
        for (const shape of shapes) worst = Math.max(worst, depth(q, shape));
      }
    }
    assert.equal(worst, 0);
  });

  test("each banking pin touches the lever's side with the fork on that banking", () => {
    const [low, high] = bankings();
    for (const [pin, fork, side] of [
      [bankingPins()[0], low, -1],
      [bankingPins()[1], high, 1],
    ] as const) {
      const local = inFork(pin, fork);
      assert.ok(Math.abs(side * local[1] - leverHalf(local[0]) - BANKING_R) < 1e-9);
    }
  });

  test("the hairspring keeps its eleven turns, and its coils open out one way and close in the other", () => {
    const turns = (d: string) => d.split("L").slice(0, 701).join("L");
    assert.equal(turns(hairspringAt(0)), turns(hairspring()).split(" Q")[0]);
    const spread = (d: string) => {
      const points = d
        .slice(1)
        .split("L")
        .slice(0, 701)
        .map((pair) => pair.split(" ").map(Number));
      return points.reduce((sum, [x = 0, y = 0]) => sum + Math.hypot(x - B[0], y - B[1]), 0) / points.length;
    };
    assert.ok(spread(hairspringAt(200 * DEG)) > spread(hairspringAt(0)) + 0.5);
    assert.ok(spread(hairspringAt(-200 * DEG)) < spread(hairspringAt(0)) - 0.5);
    // The outer end stays at the stud whatever the swing.
    assert.equal(
      hairspringAt(150 * DEG)
        .split("L")
        .at(-1),
      hairspringAt(-150 * DEG)
        .split("L")
        .at(-1),
    );
  });

  test("the readouts: beats with a thousands comma, the escape wheel within its turn, the balance signed", () => {
    const r = readoutsAt(poseAt(1234 * beat + beat / 4));
    assert.equal(r.beats, "1,234");
    assert.equal(r.escape, `${((1234 * 12) % 360).toFixed(1)}°`);
    assert.equal(readoutsAt(poseAt(beat * 1.25)).balance, "−141°");
    assert.equal(readoutsAt(poseAt(0)).amplitude, "200°");
  });

  test("the drawing: its own id and its cut's, the turning groups named, no colour written in", () => {
    const three = closeUpSvg({ pose: "escapement", id: "esc", viewBox: "0 0 1 1", label: "A", t: 0 });
    const four = closeUpSvg({ pose: "balance", id: "bal", viewBox: "0 0 1 1", label: "B", t: 0 });
    assert.deepEqual(three.match(/ id="[^"]+"/g), [' id="esc"', ' id="esc-cut"']);
    assert.deepEqual(four.match(/ id="[^"]+"/g), [' id="bal"']);
    for (const name of ["escape", "fork", "balance", "hair"]) {
      assert.ok(three.includes(`data-clock="${name}"`), name);
      assert.ok(four.includes(`data-clock="${name}"`), name);
    }
    for (const part of ["escape", "pallet", "stones", "roller", "impulse-pin", "balance", "hairspring"]) {
      assert.ok(three.includes(`data-part="${part}"`), part);
    }
    assert.ok(four.includes('class="window"') && !three.includes('class="window"'));
    for (const svg of [three, four]) {
      assert.doesNotMatch(svg, /#[0-9a-f]{3,8}(?![\w-])/i, "a hex colour");
      assert.doesNotMatch(svg, / (fill|stroke)="/);
    }
  });
});
