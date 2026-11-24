import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { movementSvg, type MovementOptions } from "./movement.ts";
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

  test("the hero names its callouts; the whole pose names none and lifts nothing", () => {
    const hero = draw({ pose: "hero", id: "a", callouts: ["barrel", "train", "balance", "escape"] });
    assert.equal(count(hero, 'class="callout"'), 4);
    for (const text of ["Barrel", "Wheel train", "Balance", "Escape wheel"])
      assert.ok(hero.includes(`>${text}</text>`));
    const whole = draw({ pose: "whole", id: "b", callouts: ["barrel"] });
    assert.equal(count(whole, 'class="callout"'), 0);
    assert.equal(count(whole, 'class="lift'), 0);
    assert.ok(whole.includes('class="lid fo"'), "the barrel keeps its lid");
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
      assert.doesNotMatch(svg, /#[0-9a-f]{3,8}\b|rgb\(|oklch\(| fill="| stroke="/i, pose);
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
