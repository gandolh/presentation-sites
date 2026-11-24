import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { MOVEMENT } from "../parts.ts";
import { dialSvg } from "./dial.ts";

const dial = dialSvg({ id: "wheels-dial", viewBox: "-245 -205 490 410", label: 'The "dial" & <hands>' });
const count = (s: string, needle: string) => s.split(needle).length - 1;
/** The rotate on the group around a hand's turning group. */
const turnedTo = (hand: string) =>
  Number(new RegExp(`rotate\\(([-\\d.]+)\\)"><g class="rot rot-hand-${hand}"`).exec(dial)?.[1]);

describe("the dial side", () => {
  test("is an image with its own id and label, escaped", () => {
    assert.match(dial, /^<svg [^>]*class="movement diagram mode-dial"/);
    assert.equal(count(dial, ' id="'), 1);
    assert.match(dial, /role="img"/);
    assert.match(dial, /aria-label="The &quot;dial&quot; &amp; &lt;hands&gt;"/);
  });

  test("the hands stand at 10:10:30: the hour hand at 305.25 degrees, the minute hand at 63, the seconds at 180", () => {
    assert.equal(turnedTo("hour"), 305.25);
    assert.equal(turnedTo("minute"), 63);
    assert.equal(turnedTo("seconds"), 180);
  });

  test("the small seconds sits over the fourth wheel's arbor, seen in the mirror, at about eight o'clock", () => {
    const [x, y] = MOVEMENT.fourth.at;
    const seconds = new RegExp(
      `translate\\(([-\\d.]+) ([-\\d.]+)\\) rotate\\([-\\d.]+\\)"><g class="rot rot-hand-seconds"`,
    ).exec(dial);
    assert.ok(Math.abs(Number(seconds?.[1]) + x) < 0.01, "x mirrored");
    assert.ok(Math.abs(Number(seconds?.[2]) - y) < 0.01, "y kept");
    // From twelve, clockwise, on the dial: about eight o'clock is 240 degrees.
    const clock = ((Math.atan2(-x, -y) * 180) / Math.PI + 360) % 360;
    assert.ok(Math.abs(clock - 240) < 15, `${clock} degrees`);
    assert.equal(count(dial, 'class="subdial"'), 1);
  });

  test("the crown is at three o'clock, the back's crown in the mirror", () => {
    assert.match(dial, /<g class="part p-crown" data-part="crown"><rect class="fo" x="136"/);
  });

  test("every part a step names is a group with its data-part: the hands, the dial, the small seconds", () => {
    for (const part of ["hour-hand", "minute-hand", "dial"]) assert.equal(count(dial, `data-part="${part}"`), 1, part);
    // The small seconds is its hand and its sunk dial: naming it lights both.
    assert.equal(count(dial, 'data-part="seconds-hand"'), 2);
    for (const hand of ["hour", "minute", "seconds"]) assert.equal(count(dial, `class="rot rot-hand-${hand}"`), 1);
  });

  test("twelve applied indices, a pair at twelve, and a track of sixty minutes", () => {
    assert.equal(count(dial, 'class="index"'), 12);
    assert.equal(count(dial, 'class="edge"'), 13);
    const ticks = /<path class="tick" d="([^"]*)"\/><path class="tick five" d="([^"]*)"/.exec(dial);
    assert.equal(count(ticks?.[1] ?? "", "M") + count(ticks?.[2] ?? "", "M"), 60);
  });

  test("no colour is written into the drawing: the stylesheet colours it", () => {
    assert.ok(!dial.includes("#"));
    assert.doesNotMatch(dial, / (fill|stroke)="/);
    assert.deepEqual([...new Set(dial.match(/[a-z-]+\(/gi))].sort(), ["rotate(", "translate("]);
  });
});
