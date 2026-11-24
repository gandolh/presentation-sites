import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { distance } from "../geometry.ts";
import { MOVEMENT } from "../parts.ts";
import { movementSvg } from "./movement.ts";
import { meshPoint, ratioText } from "./train.ts";

const train = movementSvg({ pose: "train", id: "wheels-train", viewBox: "-245 -205 490 410", label: "The train" });
const count = (s: string, needle: string) => s.split(needle).length - 1;
/** The class list of the group that carries `data-part="<part>"`. */
const classOf = (part: string) => new RegExp(`<g class="([^"]*)" data-part="${part}"`).exec(train)?.[1];

describe("chapter 2's train", () => {
  test("the bridges are off: no bridge, cock, screw or winding part is drawn", () => {
    assert.equal(count(train, "p-bridge"), 0);
    assert.equal(count(train, 'class="screw"'), 0);
    for (const part of ["ratchet", "crownwheel", "click", "mainspring"]) {
      assert.equal(count(train, `data-part="${part}"`), 0, part);
    }
  });

  test("each wheel of the train is lit in the steps that name it, one mesh a step", () => {
    assert.equal(classOf("barrel"), "part p-barrel s1");
    assert.equal(classOf("centre"), "part p-centre s1 s2");
    assert.equal(classOf("third"), "part p-third s2 s3");
    assert.equal(classOf("fourth"), "part p-fourth s3 s4");
    assert.equal(classOf("escape"), "part p-escape s4");
    // Everything else stays out of every step, so it is ghosted throughout.
    for (const part of ["plate", "crown", "pallet", "balance"]) assert.doesNotMatch(classOf(part) ?? "", /\bs\d/, part);
  });

  test("beside each mesh its ratio, one for each step: 72 / 12, 80 / 10, 75 / 10, 84 / 7", () => {
    const ratios = [...train.matchAll(/<g class="ratio (s\d)"[^>]*>.*?<text [^>]*>([^<]*)<\/text><\/g>/g)].map(
      ([, step, text]) => [step, text],
    );
    assert.deepEqual(ratios, [
      ["s1", "72 / 12"],
      ["s2", "80 / 10"],
      ["s3", "75 / 10"],
      ["s4", "84 / 7"],
    ]);
    assert.equal(ratioText(MOVEMENT.barrel, MOVEMENT.centre), "72 / 12");
  });

  test("a ratio's dot is where the teeth meet: on the wheel's pitch circle and the pinion's", () => {
    const m = MOVEMENT;
    for (const [driver, driven] of [
      [m.barrel, m.centre],
      [m.centre, m.third],
      [m.third, m.fourth],
      [m.fourth, m.escape],
    ] as const) {
      const dot = meshPoint(driver, driven);
      assert.ok(Math.abs(distance(dot, driven.at) - driven.pinion.r) < 1e-9);
      assert.ok(Math.abs(distance(dot, driver.at) - driver.r) < 1e-9);
    }
  });

  test("every wheel turns in the page's CSS, the barrel too, and no colour is written into the drawing", () => {
    for (const part of ["barrel", "centre", "third", "fourth", "escape", "pallet", "balance"]) {
      assert.equal(count(train, `class="rot rot-${part}"`), 1, part);
    }
    assert.ok(!train.includes("#"));
    assert.doesNotMatch(train, / (fill|stroke)="/);
    assert.deepEqual([...new Set(train.match(/[a-z-]+\(/gi))].sort(), ["rotate(", "translate("]);
  });
});
