import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { MOVEMENT } from "../parts.ts";
import { apartFit, DRAWN_LIFT, movementSvg, type MovementOptions } from "./movement.ts";
import { springPath } from "./pieces.ts";

const base = { viewBox: "-250 -215 500 430", label: "A movement" } as const;
const draw = (options: Partial<MovementOptions> & Pick<MovementOptions, "pose" | "id">) =>
  movementSvg({ ...base, ...options });
const count = (s: string, needle: string) => s.split(needle).length - 1;

describe("the movement drawing", () => {
  test("each drawing carries its own id, and no other", () => {
    const one = draw({ pose: "hero", id: "hero-movement" });
    const two = draw({ pose: "whole", id: "together-poster" });
    assert.equal(count(one, ' id="'), 1);
    assert.match(one, /^<svg [^>]*id="hero-movement"/);
    assert.equal(count(two, ' id="'), 1);
    assert.match(two, /^<svg [^>]*id="together-poster"/);
  });

  test("it is an image with its label, escaped", () => {
    const svg = draw({ pose: "hero", id: "m", label: 'The "back" & <side>' });
    assert.match(svg, /^<svg [^>]*role="img"/);
    assert.match(svg, /aria-label="The &quot;back&quot; &amp; &lt;side&gt;"/);
  });

  test("the hero names its callouts and lifts nothing; the whole pose names none", () => {
    const hero = draw({ pose: "hero", id: "a", callouts: ["barrel", "train", "balance", "escape"] });
    assert.equal(count(hero, 'class="callout"'), 4);
    for (const text of ["Barrel", "Wheel train", "Balance", "Escape wheel"])
      assert.ok(hero.includes(`>${text}</text>`));
    assert.equal(count(hero, 'class="lift'), 0);
    const whole = draw({ pose: "whole", id: "b", callouts: ["barrel"] });
    assert.equal(count(whole, 'class="callout"'), 0);
    assert.ok(whole.includes('class="lid fo"'), "the barrel keeps its lid");
  });

  test("the whole pose lifts every part that comes apart, through the part table's own window", () => {
    const whole = draw({ pose: "whole", id: "w" });
    // The mainspring and the arbor ride in the barrel's group: the three share one lift.
    const lifted = MOVEMENT.parts.filter((p) => p.explode.lift > 0 && p.id !== "mainspring" && p.id !== "arbor");
    assert.equal(count(whole, 'class="lift-w"'), lifted.length);
    for (const p of lifted) {
      const [from, to] = p.explode.window;
      const style = `--lift:${+(p.explode.lift * DRAWN_LIFT).toFixed(2)};--w0:${+from.toFixed(2)};--w1:${+to.toFixed(2)}`;
      assert.ok(whole.includes(`style="${style}`), `${p.id}: ${style}`);
    }
    // Every bridge's screws turn as they come out, two turns as the 3D screws do.
    assert.equal(count(whole, ";--spin:2"), 4);
    assert.equal(count(whole, 'class="spin"'), 6);
    // The bridges can be lit by name, their screws with them.
    for (const id of ["barrel-bridge", "train-bridge", "pallet-bridge", "balance-cock"])
      assert.equal(count(whole, `data-part="${id}"`), 2, id);
  });

  test("taken apart, the whole pose shrinks into a frame that holds the lifted stack", () => {
    const fit = apartFit("-250 -205 450 410");
    assert.ok(fit.s > 0.6 && fit.s < 1, `scale ${fit.s}`);
    const svg = draw({ pose: "whole", id: "f", viewBox: "-250 -205 450 410" });
    assert.match(svg, /^<svg [^>]*style="--fit-s:[\d.]+;--fit-x:-?[\d.]+;--fit-y:-?[\d.]+"/);
  });

  test("the chapter pose opens the barrel and lifts four groups", () => {
    const svg = draw({ pose: "chapter", id: "c" });
    assert.match(svg, /^<svg [^>]*style="--e:0.55"/);
    for (const group of ["lift-bridge", "lift-ratchet", "lift-crownwheel", "lift-click"]) {
      assert.equal(count(svg, `class="lift ${group}"`), 1, group);
    }
    assert.ok(!svg.includes('class="lid fo"'), "the lid is off");
    assert.ok(svg.includes('data-part="mainspring"'));
  });

  test("every turning part is a group the page's CSS can animate", () => {
    const svg = draw({ pose: "hero", id: "d" });
    for (const part of ["balance", "escape", "pallet", "fourth", "third", "centre", "barrel"]) {
      assert.equal(count(svg, `class="rot rot-${part}"`), 1, part);
    }
  });

  test("no colour is written into the drawing: the stylesheet colours it", () => {
    for (const pose of ["hero", "whole", "chapter"] as const) {
      const svg = draw({ pose, id: pose });
      // No hex colour, no fill or stroke attribute, and no CSS function but the transforms.
      assert.ok(!svg.includes("#"), `${pose}: a hex colour`);
      assert.doesNotMatch(svg, / (fill|stroke)="/, pose);
      assert.deepEqual([...new Set(svg.match(/[a-z-]+\(/gi))].sort(), ["rotate(", "translate("], pose);
    }
  });

  test("the mainspring coils tighter round the arbor as it winds", () => {
    // The mean distance of its points from the barrel's centre.
    const spread = (d: string) => {
      const points = d
        .slice(1)
        .split("L")
        .map((pair) => pair.split(" ").map(Number));
      const sum = points.reduce((total, [x = 0, y = 0]) => total + Math.hypot(x + 59.397, y + 59.397), 0);
      return sum / points.length;
    };
    assert.ok(spread(springPath(1)) < spread(springPath(0)) - 10);
  });
});
