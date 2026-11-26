import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Pt } from "../movement/geometry.ts";
import { MOVEMENT } from "../movement/parts.ts";
import { benchSvg } from "./svg.ts";
import {
  HOLDER_RANGE,
  MAT,
  MOVEMENT_DIAMETER,
  MOVEMENT_SCALE,
  SCREWDRIVERS,
  TOOLS,
  balanceOnMat,
  corners,
  loupeSlide,
  toolOf,
} from "./tools.ts";

/** Whether two convex outlines overlap: they don't when some edge's normal separates their projections. */
function overlap(a: readonly Pt[], b: readonly Pt[]): boolean {
  for (const shape of [a, b]) {
    for (let i = 0; i < shape.length; i++) {
      const p = shape[i] ?? [0, 0];
      const q = shape[(i + 1) % shape.length] ?? [0, 0];
      const normal: Pt = [q[1] - p[1], p[0] - q[0]];
      const span = (s: readonly Pt[]) => s.map(([x, y]) => x * normal[0] + y * normal[1]);
      const [sa, sb] = [span(a), span(b)];
      if (Math.max(...sa) <= Math.min(...sb) || Math.max(...sb) <= Math.min(...sa)) return false;
    }
  }
  return true;
}

const STEPS = [1, 2, 3, 4, 5, 6];

describe("the bench's tools", () => {
  test("each tool lies on the mat, clear of its edge", () => {
    const margin = 3;
    for (const tool of TOOLS) {
      for (const [x, y] of corners(tool)) {
        assert.ok(x >= margin && x <= MAT.w - margin, `${tool.id} reaches past the mat's side at x ${x}`);
        assert.ok(y >= margin && y <= MAT.h - margin, `${tool.id} reaches past the mat's edge at y ${y}`);
      }
    }
  });

  test("no tool lies on another", () => {
    for (const [i, a] of TOOLS.entries()) {
      for (const b of TOOLS.slice(i + 1)) assert.ok(!overlap(corners(a), corners(b)), `${a.id} lies on ${b.id}`);
    }
  });

  test("the overlap check tells touching from crossing", () => {
    const square = (x: number, y: number): Pt[] => [
      [x, y],
      [x + 2, y],
      [x + 2, y + 2],
      [x, y + 2],
    ];
    assert.ok(overlap(square(0, 0), square(1, 1)));
    assert.ok(!overlap(square(0, 0), square(2, 0)));
    // Turned, the diamond's corner misses the square, though their boxes overlap.
    const diamond: Pt[] = [
      [4, 1],
      [5.5, 2.5],
      [4, 4],
      [2.5, 2.5],
    ];
    assert.ok(!overlap(square(0, 0), diamond));
  });

  test("every id is unique, step 1 shows every tool, and every other step lights at least one", () => {
    assert.equal(new Set(TOOLS.map((t) => t.id)).size, TOOLS.length);
    for (const tool of TOOLS) {
      assert.ok(tool.steps.includes(1), `${tool.id} is missing from step 1`);
      assert.ok(tool.steps.length >= 2, `${tool.id} has no step of its own`);
      for (const n of tool.steps) assert.ok(STEPS.includes(n), `${tool.id} names a step the chapter lacks`);
    }
    for (const n of STEPS.slice(1))
      assert.ok(
        TOOLS.some((t) => t.steps.includes(n)),
        `step ${n} lights no tool`,
      );
  });

  test("the movement is drawn at the NH35's 27.4 mm, a size the holder grips", () => {
    assert.ok(Math.abs(2 * MOVEMENT.plate.R * MOVEMENT_SCALE - 27.4) < 1e-9);
    assert.ok(MOVEMENT_DIAMETER >= HOLDER_RANGE[0] && MOVEMENT_DIAMETER <= HOLDER_RANGE[1]);
    const holder = toolOf("holder");
    assert.ok(MOVEMENT_DIAMETER < holder.size.w && MOVEMENT_DIAMETER < holder.size.h);
  });

  test("step 3 slides the loupe until its lens is over the balance, on the movement", () => {
    const loupe = toolOf("loupe");
    const [dx, dy] = loupeSlide();
    const lens: Pt = [loupe.at[0] + dx, loupe.at[1] + dy];
    const balance = balanceOnMat();
    assert.ok(Math.hypot(lens[0] - balance[0], lens[1] - balance[1]) < 1e-9);
    const holder = toolOf("holder");
    assert.ok(Math.hypot(lens[0] - holder.at[0], lens[1] - holder.at[1]) < MOVEMENT_DIAMETER / 2);
  });

  test("the screwdrivers run from the narrowest blade to the widest, each with its own cap", () => {
    const blades = SCREWDRIVERS.map((s) => s.blade);
    assert.deepEqual(
      blades,
      [...blades].sort((a, b) => a - b),
    );
    assert.equal(new Set(SCREWDRIVERS.map((s) => s.cap)).size, SCREWDRIVERS.length);
  });
});

describe("the bench drawing", () => {
  const svg = benchSvg({ id: "bench", label: 'Tavi\'s "bench" & <tools>' });

  test("is one image with its own id and its label, escaped", () => {
    assert.match(svg, /^<svg [^>]*id="bench"[^>]*role="img"/);
    assert.equal(svg.split(' id="').length - 1, 1);
    assert.match(svg, /aria-label="Tavi's &quot;bench&quot; &amp; &lt;tools&gt;"/);
    assert.match(svg, new RegExp(`viewBox="0 0 ${MAT.w} ${MAT.h}"`));
  });

  test("draws every tool as a named part, lit on its steps", () => {
    for (const tool of TOOLS) {
      const group = new RegExp(
        `<g class="part tool t-${tool.shape} ${tool.steps.map((n) => `s${n}`).join(" ")}" data-part="${tool.id}">`,
      );
      assert.match(svg, group, tool.id);
    }
  });

  test("puts the loupe last, in the group that slides it", () => {
    const [dx, dy] = loupeSlide();
    const at = (n: number) => String(+n.toFixed(2));
    assert.ok(svg.includes(`<g class="slide" style="--dx:${at(dx)};--dy:${at(dy)}"><g class="part tool t-loupe`));
    assert.ok(svg.lastIndexOf('data-part="loupe"') > svg.lastIndexOf('data-part="oiler"'));
  });

  test("holds the movement, and takes every colour from the stylesheet", () => {
    assert.match(svg, /<g class="held" transform="rotate\(90\) scale\(/);
    assert.match(svg, /data-part="balance"/);
    // No fill, stroke or colour of its own: the classes carry them, from the tokens. The one style is the slide's.
    assert.doesNotMatch(svg, /\s(fill|stroke|color)="/);
    assert.equal(svg.match(/style="/g)?.length, 1);
  });
});
