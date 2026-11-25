import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cameraAt,
  easeOut,
  fitFrame,
  flatFrame,
  parseViewBox,
  project,
  TILT,
  viewDirection,
  type Vec3,
  type ViewBox,
} from "./camera.ts";

const HERO: ViewBox = parseViewBox("-250 -215 500 430");
const near = (actual: number, expected: number, within: number, what: string) => {
  assert.ok(Math.abs(actual - expected) <= within, `${what}: ${actual} is not within ${within} of ${expected}`);
};

/** Where an SVG point (y down) lands in the box, as the SVG's own `xMidYMid meet` puts it. */
function meet(vb: ViewBox, width: number, height: number, [x, y]: readonly [number, number]) {
  const s = Math.min(width / vb.w, height / vb.h);
  return [(width - vb.w * s) / 2 + (x - vb.x) * s, (height - vb.h * s) / 2 + (y - vb.y) * s] as const;
}

test("a viewBox reads as four numbers", () => {
  assert.deepEqual(parseViewBox("-250 -215 500 430"), { x: -250, y: -215, w: 500, h: 430 });
  assert.deepEqual(parseViewBox(" 1,2 3  4 "), { x: 1, y: 2, w: 3, h: 4 });
});

test("the flat frame centres the viewBox and shows its height, or more where the box is the taller", () => {
  const frame = flatFrame(HERO, 1000, 860, 10);
  assert.equal(frame.half, 215);
  assert.ok(
    frame.target.every((v, i) => v === [0, 0, 10][i]),
    `${frame.target.join(",")}`,
  );
  // A wider box: the height binds, as SVG's meet fits it.
  assert.equal(flatFrame(HERO, 1200, 860, 10).half, 215);
  // A taller box: the width binds, so the view shows more than the viewBox's height.
  near(flatFrame(HERO, 500, 860, 10).half, 430, 1e-9, "half");
  const off = flatFrame(parseViewBox("-245 -200 440 400"), 440, 400, 0);
  assert.ok(
    off.target.every((v, i) => v === [-25, 0, 0][i]),
    `${off.target.join(",")}`,
  );
});

test("the flat camera puts every corner and the plate's edge where the poster draws them, within half a pixel", () => {
  for (const [w, h] of [
    [646, 556],
    [390, 336],
    [700, 500],
    [360, 520],
  ] as const) {
    const flat = flatFrame(HERO, w, h, 10);
    const camera = cameraAt(flat, flat, 0, 0);
    const points: (readonly [number, number])[] = [
      [HERO.x, HERO.y],
      [HERO.x + HERO.w, HERO.y + HERO.h],
      [190, 0],
      [-190, 0],
      [0, 190],
      [0, -190],
    ];
    for (const p of points) {
      // The plate's edge is drawn on its top face, ten units up; a bridge forty units up lands no further off.
      for (const z of [10, 45]) {
        const [x, y] = project([p[0], -p[1], z], camera, w, h);
        const [ex, ey] = meet(HERO, w, h, p);
        near(x, ex, 0.5, `x of ${p.join(",")} at z ${z} in ${w}x${h}`);
        near(y, ey, 0.5, `y of ${p.join(",")} at z ${z} in ${w}x${h}`);
      }
    }
  }
});

test("the flat camera looks straight down the axis with the drawing's top at the top of the screen", () => {
  const flat = flatFrame(HERO, 646, 556, 10);
  const camera = cameraAt(flat, flat, 0, 0.7);
  for (const [i, v] of [0, 1, 0].entries()) near(camera.up[i] ?? NaN, v, 1e-12, `up ${i}`);
  near(camera.position[0], 0, 1e-6, "x");
  near(camera.position[1], 0, 1e-6, "y");
  assert.ok(
    camera.near < camera.position[2] - 45 && camera.far > camera.position[2],
    "the movement is inside the planes",
  );
});

test("the tilted camera is the prototype's: 34 degrees off the axis, at 22 degrees of view", () => {
  const dir = viewDirection((TILT * Math.PI) / 180, 0);
  near(dir[2], Math.cos((34 * Math.PI) / 180), 1e-12, "the tilt");
  assert.ok(dir[1] < 0, "it looks from the drawing's foot, so the balance comes nearer");
  const flat = flatFrame(HERO, 646, 556, 10);
  const plate: Vec3[] = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * 2 * Math.PI;
    return [190 * Math.cos(a), 190 * Math.sin(a), i % 2 ? 0 : 45];
  });
  const tilted = fitFrame(plate, (TILT * Math.PI) / 180, 0, 22, 646 / 556);
  const camera = cameraAt(flat, tilted, 1, 0);
  near(camera.fov, 22, 1e-12, "fov");
  // Every point of the plate fits inside the box, with the margin the prototype keeps.
  for (const p of plate) {
    const [x, y] = project(p, camera, 646, 556);
    assert.ok(x > 0 && x < 646 && y > 0 && y < 556, `${p.join(",")} lands at ${x}, ${y}`);
  }
});

test("halfway, the camera sits between the two frames, and turning it moves the eye round the axis", () => {
  const flat = flatFrame(HERO, 646, 556, 10);
  const tilted: ReturnType<typeof flatFrame> = { target: [0, 20, 20], half: 260 };
  const half = cameraAt(flat, tilted, 0.5, 0);
  for (const [i, v] of [0, 10, 15].entries()) near(half.target[i] ?? NaN, v, 1e-12, `target ${i}`);
  near(half.fov, (0.5 + 22) / 2, 1e-12, "fov");
  const turned = cameraAt(flat, tilted, 1, Math.PI / 2);
  assert.ok(turned.position[0] > 0, "turned a quarter, the eye is to the right of the axis");
});

test("the tilt eases out as the stylesheet's --ease-out does: fast at first, settled at the end", () => {
  assert.equal(easeOut(0), 0);
  assert.equal(easeOut(1), 1);
  // cubic-bezier(0.16, 1, 0.3, 1): about 90% of the way at a third of the time.
  assert.ok(easeOut(1 / 3) > 0.8 && easeOut(1 / 3) < 0.92, `${easeOut(1 / 3)}`);
  for (let u = 0.05; u < 1; u += 0.05) assert.ok(easeOut(u) >= easeOut(u - 0.05), "it never goes back");
});
