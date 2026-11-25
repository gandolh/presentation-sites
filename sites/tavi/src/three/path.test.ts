import assert from "node:assert/strict";
import { test } from "node:test";
import { circ, escapeOutline, gearOutline, hull } from "../movement/svg/draw.ts";
import { hairspringAt } from "../movement/svg/pieces.ts";
import { MOVEMENT } from "../movement/parts.ts";
import { pathData, pathPoints, turned } from "./path.ts";

const radius = (p: readonly [number, number], c: readonly [number, number] = [0, 0]) =>
  Math.hypot(p[0] - c[0], p[1] - c[1]);

test("lines, a closed subpath without its first point repeated, and a second subpath", () => {
  assert.deepEqual(pathPoints("M0 0 L10 0 L10 10 Z M20 20 h5 v5"), [
    [
      [0, 0],
      [10, 0],
      [10, 10],
    ],
    [
      [20, 20],
      [25, 20],
      [25, 25],
    ],
  ]);
});

test("a circle drawn as two relative arcs stays on its radius, evenly sampled", () => {
  const [ring] = pathPoints(circ([5, -3], 40), { arcStep: Math.PI / 36 });
  assert.ok(ring);
  assert.equal(ring.length, 72);
  for (const p of ring) assert.ok(Math.abs(radius(p, [5, -3]) - 40) < 1e-9);
});

test("a wheel's outline: its tips reach the addendum, its roots the dedendum, one tooth to each pitch", () => {
  const { teeth, r } = MOVEMENT.centre;
  const [outline] = pathPoints(gearOutline(teeth, r));
  assert.ok(outline);
  const m = (2 * r) / teeth;
  const radii = outline.map((p) => radius(p));
  // The builders print two decimals, so the points sit within 0.01 of their circles.
  assert.ok(Math.abs(Math.min(...radii) - (r - 1.25 * m)) < 0.01, "the root circle");
  // The tips round off inside their control points, which stand 2% past the addendum.
  assert.ok(Math.max(...radii) > r + 0.6 * m && Math.max(...radii) < (r + m) * 1.02, "the rounded tips");
  const tips = radii.filter((x, i) => x > r && (radii[i - 1] ?? 0) <= r);
  assert.equal(tips.length, teeth);
});

test("the escape wheel's fifteen club teeth, and a hull's path read from its SVG", () => {
  const [esc] = pathPoints(escapeOutline(15, 24));
  assert.ok(esc);
  assert.ok(Math.abs(Math.max(...esc.map((p) => radius(p))) - 24) < 0.01);
  const d = pathData(
    hull(
      [
        [[0, 0], 10],
        [[30, 0], 5],
      ],
      "x",
    ),
  );
  const [shape] = pathPoints(d);
  assert.ok(shape && shape.length > 20);
  assert.ok(Math.abs(Math.min(...shape.map((p) => p[0])) + 10) < 0.01);
  assert.ok(Math.abs(Math.max(...shape.map((p) => p[0])) - 35) < 0.01);
});

test("the hairspring as the close-ups draw it: one open run from the collet out to the stud", () => {
  const runs = pathPoints(hairspringAt(0));
  assert.equal(runs.length, 1);
  const [run] = runs;
  assert.ok(run && run.length > 700);
  const c = MOVEMENT.balance.at;
  assert.ok(Math.abs(radius(run[0] ?? [0, 0], c) - 6.5) < 0.01);
  assert.ok(Math.abs(radius(run.at(-1) ?? [0, 0], c) - 31) < 0.01);
});

test("points turn clockwise on screen about a centre", () => {
  const [p] = turned([[10, 0]], Math.PI / 2, [0, 0]);
  assert.ok(p && Math.abs(p[0]) < 1e-12 && Math.abs(p[1] - 10) < 1e-12);
});
