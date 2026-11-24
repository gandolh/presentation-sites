import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { moduleOf, type Toothed, type Wheel } from "./calibre.ts";
import { trainRatios } from "./clock.ts";
import { distance } from "./geometry.ts";
import { buildCalibre, MOVEMENT, NH35_CLASS, PART_IDS, partOf, type Calibre } from "./parts.ts";

/** The four meshes of the going train: each wheel and the pinion it drives. */
function meshes(m: Calibre): [string, Wheel, Wheel & { readonly pinion: Toothed }][] {
  return [
    ["barrel to centre pinion", m.barrel, m.centre],
    ["centre to third pinion", m.centre, m.third],
    ["third to fourth pinion", m.third, m.fourth],
    ["fourth to escape pinion", m.fourth, m.escape],
  ];
}

describe("the part table", () => {
  test("every meshing pair of the train sits at the sum of its pitch radii", () => {
    for (const [name, wheel, driven] of meshes(MOVEMENT)) {
      const gap = distance(wheel.at, driven.at) - (wheel.r + driven.pinion.r);
      assert.ok(Math.abs(gap) < 1e-6, `${name} is off by ${gap}`);
    }
  });

  test("the ratchet wheel and the crown wheel sit at the sum of their radii", () => {
    const gap = distance(MOVEMENT.ratchet.at, MOVEMENT.crownWheel.at) - (MOVEMENT.ratchet.r + MOVEMENT.crownWheel.r);
    assert.ok(Math.abs(gap) < 1e-6, `off by ${gap}`);
  });

  test("each wheel and the pinion it drives share one module: 2.0, 1.4, 1.2267, 1.0", () => {
    const expected = [2.0, 1.4, 1.2267, 1.0];
    meshes(MOVEMENT).forEach(([name, wheel, driven], i) => {
      assert.ok(Math.abs(moduleOf(wheel) - moduleOf(driven.pinion)) < 1e-9, `${name}: the modules differ`);
      assert.ok(Math.abs(moduleOf(wheel) - (expected[i] ?? 0)) < 1e-4, `${name}: module ${moduleOf(wheel)}`);
    });
  });

  test("the sketch's numbers: the teeth and leaves, and the pinions' pitch radii", () => {
    const m = MOVEMENT;
    assert.deepEqual(
      [m.barrel.teeth, m.centre.teeth, m.third.teeth, m.fourth.teeth, m.escape.teeth],
      [72, 80, 75, 84, 15],
    );
    assert.deepEqual(
      [m.centre.pinion.teeth, m.third.pinion.teeth, m.fourth.pinion.teeth, m.escape.pinion.teeth],
      [12, 10, 10, 7],
    );
    assert.equal(m.centre.pinion.r, 12);
    assert.equal(m.third.pinion.r, 7);
    assert.ok(Math.abs(m.fourth.pinion.r - 6.1333) < 1e-4);
    assert.equal(m.escape.pinion.r, 3.5);
    assert.deepEqual(m.centre.at, [0, 0]);
  });

  test("every wheel and the balance sit inside the plate", () => {
    const m = MOVEMENT;
    const wheels: [string, Wheel][] = [
      ["barrel", m.barrel],
      ["centre", m.centre],
      ["third", m.third],
      ["fourth", m.fourth],
      ["ratchet", m.ratchet],
      ["crown wheel", m.crownWheel],
    ];
    for (const [name, w] of wheels) {
      // The tip circle: the pitch radius plus one module.
      const reach = Math.hypot(...w.at) + w.r + moduleOf(w);
      assert.ok(reach < m.plate.R, `${name} reaches ${reach}`);
    }
    // The escape wheel's radius is already its tips'; the balance's is its rim's.
    assert.ok(Math.hypot(...m.escape.at) + m.escape.r < m.plate.R);
    assert.ok(Math.hypot(...m.balance.at) + m.balance.r < m.plate.R);
    assert.ok(Math.hypot(...m.pallet.at) < m.plate.R);
  });

  test("barrel to escape wheel is 4,320 to 1, so the escape wheel makes 720 turns an hour", () => {
    const ratios = trainRatios(MOVEMENT);
    assert.ok(Math.abs(1 / Math.abs(ratios.barrel) - 4320) < 1e-9);
    assert.ok(Math.abs(1 / Math.abs(ratios.centre) - 720) < 1e-9);
    // 21,600 beats an hour, two beats to each of the 15 teeth.
    assert.equal(MOVEMENT.spec.vph / (2 * MOVEMENT.escape.teeth), 720);
  });

  test("the pallet and the balance sit on one line from the escape wheel", () => {
    const m = MOVEMENT;
    const side = (p: readonly [number, number]) =>
      (p[0] - m.escape.at[0]) * Math.sin(m.line) - (p[1] - m.escape.at[1]) * Math.cos(m.line);
    assert.ok(Math.abs(side(m.pallet.at)) < 1e-9);
    assert.ok(Math.abs(side(m.balance.at)) < 1e-9);
  });

  test("another calibre is another spec: turn the train and every mesh still holds", () => {
    const turned = buildCalibre({
      ...NH35_CLASS,
      train: { ...NH35_CLASS.train, third: { ...NH35_CLASS.train.third, at: 20 } },
    });
    assert.notDeepEqual(turned.escape.at, MOVEMENT.escape.at);
    for (const [name, wheel, driven] of meshes(turned)) {
      assert.ok(Math.abs(distance(wheel.at, driven.at) - (wheel.r + driven.pinion.r)) < 1e-6, name);
    }
  });

  test("every part is listed once, with a material and a lift window inside 0 to 1", () => {
    assert.equal(new Set(MOVEMENT.parts.map((p) => p.id)).size, PART_IDS.length);
    for (const p of MOVEMENT.parts) {
      const [from, to] = p.explode.window;
      assert.ok(from >= 0 && from < to && to <= 1, `${p.id}: window ${from} to ${to}`);
      assert.ok(p.explode.lift >= 0, p.id);
    }
    assert.deepEqual(partOf(MOVEMENT, "barrel").gear, { teeth: 72, r: 72 });
    assert.equal(partOf(MOVEMENT, "escape").pinion?.teeth, 7);
  });

  test("the motion works: ten leaves into thirty, eight into thirty-two, twelve to one at one module", () => {
    const { cannon, minuteWheel, hourWheel } = MOVEMENT.motionWorks;
    assert.deepEqual([cannon.teeth, minuteWheel.teeth, minuteWheel.pinion.teeth, hourWheel.teeth], [10, 30, 8, 32]);
    assert.equal((minuteWheel.teeth / cannon.teeth) * (hourWheel.teeth / minuteWheel.pinion.teeth), 12);
    assert.ok(Math.abs(moduleOf(cannon) - moduleOf(minuteWheel)) < 1e-9, "cannon pinion and minute wheel");
    assert.ok(Math.abs(moduleOf(minuteWheel.pinion) - moduleOf(hourWheel)) < 1e-9, "minute pinion and hour wheel");
  });

  test("the hour wheel rides the centre arbor with the cannon pinion: both meshes span one centre distance", () => {
    const { cannon, minuteWheel, hourWheel } = MOVEMENT.motionWorks;
    assert.deepEqual(cannon.at, MOVEMENT.centre.at);
    assert.deepEqual(hourWheel.at, MOVEMENT.centre.at);
    const span = distance(minuteWheel.at, MOVEMENT.centre.at);
    assert.ok(Math.abs(span - (cannon.r + minuteWheel.r)) < 1e-9, "cannon pinion to minute wheel");
    assert.ok(Math.abs(span - (minuteWheel.pinion.r + hourWheel.r)) < 1e-9, "minute pinion to hour wheel");
  });

  test("the hands ride their arbors, and the small seconds sits over the fourth wheel inside the dial", () => {
    const m = MOVEMENT;
    assert.deepEqual(partOf(m, "minute-hand").at, m.centre.at);
    assert.deepEqual(partOf(m, "hour-hand").at, m.centre.at);
    assert.deepEqual(partOf(m, "seconds-hand").at, m.fourth.at);
    assert.deepEqual(m.dial.smallSeconds.at, m.fourth.at);
    assert.ok(Math.hypot(...m.dial.smallSeconds.at) + m.dial.smallSeconds.r < m.dial.R);
    assert.ok(m.hands.seconds <= m.dial.smallSeconds.r, "the seconds hand stays inside its dial");
    assert.ok(m.hands.minute < m.dial.R && m.hands.hour < m.hands.minute);
  });

  test("the dial side sits under the plate, stays with it when taken apart, and has no 3D label", () => {
    const dialSide = ["minute-hand", "seconds-hand", "hour-hand", "dial", "hour-wheel", "minute-wheel", "cannon"];
    assert.deepEqual(PART_IDS.slice(0, dialSide.length), dialSide);
    for (const id of dialSide) {
      const p = partOf(MOVEMENT, id as (typeof PART_IDS)[number]);
      assert.ok(p.z < 0, `${id} at z ${p.z}`);
      assert.equal(p.explode.lift, 0, id);
      assert.equal(p.anchor, null, id);
    }
    for (const p of MOVEMENT.parts) if (!dialSide.includes(p.id)) assert.ok(p.z >= 0, `${p.id} at z ${p.z}`);
    assert.deepEqual(partOf(MOVEMENT, "cannon").pinion, { teeth: 10, r: 7.5 });
    assert.equal(partOf(MOVEMENT, "cannon").gear, null);
    assert.deepEqual(partOf(MOVEMENT, "minute-wheel").pinion, { teeth: 8, r: 6 });
  });
});
