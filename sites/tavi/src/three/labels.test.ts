import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Color } from "three";
import { stateAt } from "../movement/clock.ts";
import { MOVEMENT } from "../movement/parts.ts";
import { cameraAt, fitFrame, flatFrame, parseViewBox, project, tiltFor, TILT_FOV, yawOf } from "./camera.ts";
import type { Palette } from "./colours.ts";
import { anchorAt, LABELLED } from "./labelled.ts";
import {
  columnSpan,
  DESKTOP_LABELS,
  labelRoom,
  layoutLabels,
  leadersMeet,
  rows,
  segmentsMeet,
  type LabelIn,
  type LabelOptions,
  type LabelOut,
} from "./labels.ts";
import { createMovement } from "./movement.ts";

const DEG = Math.PI / 180;

/** Chapter 5's figure, the box the 3D view fills, at the page's 1280 x 800 and 1440 x 900 (measured in Chromium). */
const BOXES = [
  { page: "1280 x 800", width: 640, height: 476 },
  { page: "1440 x 900", width: 681, height: 500 },
] as const;
const TURNS = [0, 30, -30];

/** A label's width at 15 px of Newsreader, near enough: 7.4 px a letter and its 2 px of padding each side. */
const widthOf = (text: string) => Math.round(text.length * 7.4 + 4);

/** Any palette will do for the shapes: the layout reads none of its colours. */
function palette(): Palette {
  const paint = () => ({
    fill: new Color(0.9, 0.9, 0.9),
    line: new Color(0.3, 0.3, 0.3),
    side: new Color(0.6, 0.6, 0.6),
  });
  const names = [
    "plate",
    "bridge",
    "brass",
    "drum",
    "gilt",
    "steel",
    "spring",
    "balance",
    "hair",
    "screw",
    "slot",
    "ruby",
    "glint",
    "chaton",
    "ghost",
  ] as const;
  return Object.fromEntries(names.map((n) => [n, paint()])) as unknown as Palette;
}

/** Every pair of leaders that meet, by their labels' ids. */
function meetings(out: readonly LabelOut[]): string[] {
  const found: string[] = [];
  for (let i = 0; i < out.length; i++)
    for (let j = i + 1; j < out.length; j++) {
      const a = out[i];
      const b = out[j];
      if (a && b && leadersMeet(a.leader, b.leader)) found.push(`${a.id} / ${b.id}`);
    }
  return found;
}

/** The view's labels for the movement fully apart, as chapter 5 draws them on a desktop. */
function apartAt(width: number, height: number, turn: number) {
  const movement = createMovement(palette());
  movement.pose(stateAt(0.5 / 6), 1);
  const options: LabelOptions = { width, height, ...DESKTOP_LABELS };
  const widths = LABELLED.map((p) => widthOf(p.label));
  const yaw = yawOf(turn);
  const tilt = tiltFor(1);
  const fit = fitFrame(movement.footprint(), tilt * DEG, yaw, TILT_FOV, width / height, labelRoom(widths, options));
  const flat = flatFrame(parseViewBox("-250 -205 450 410"), width, height, MOVEMENT.plate.thickness);
  const pose = cameraAt(flat, fit, 1, yaw, tilt);
  const items: LabelIn[] = LABELLED.map((p, i) => {
    const [x, y] = project(anchorAt(p, 1), pose, width, height);
    return { id: p.id, x, y, w: widths[i] ?? 0 };
  });
  return { items, out: layoutLabels(items, options), options };
}

describe("chapter 5's labels", () => {
  for (const box of BOXES) {
    for (const turn of TURNS) {
      test(`apart 100% at ${box.page}, turned ${turn}°: every part labelled, no two leaders meet`, () => {
        const { items, out, options } = apartAt(box.width, box.height, turn);
        assert.equal(out.length, LABELLED.length, "a label for every labelled part");
        assert.deepEqual(meetings(out), []);
        const span = columnSpan(
          items.map((it) => it.w),
          options,
        );
        for (const l of out) {
          const it = items.find((i) => i.id === l.id);
          assert.ok(it, l.id);
          // The label stands in its column, inside the box, and its leader starts at its anchor.
          assert.ok(l.x >= options.pad - 0.01 && l.x + it.w <= box.width - options.pad + 0.01, `${l.id} at ${l.x}`);
          assert.ok(l.y >= options.pad && l.y <= box.height - options.pad, `${l.id} at row ${l.y}`);
          assert.deepEqual(l.leader[0], [it.x, it.y]);
          assert.equal(l.side, it.x < box.width / 2 ? "left" : "right", `${l.id}: the side its anchor is on`);
          // The anchors lie between the columns, so the labels never cover the movement.
          assert.ok(it.x > span && it.x < box.width - span, `${l.id}'s anchor at ${it.x.toFixed(1)}`);
        }
        // No two labels in a column share a row.
        for (const side of ["left", "right"] as const) {
          const ys = out
            .filter((l) => l.side === side)
            .map((l) => l.y)
            .sort((a, b) => a - b);
          ys.slice(1).forEach((y, i) => {
            assert.ok(y - (ys[i] ?? -Infinity) >= options.pitch - 1e-6, `${side}: rows ${ys[i]} and ${y}`);
          });
        }
      });
    }
  }

  test("however the anchors fall between the columns, no two leaders meet", () => {
    // A small seeded generator, so a failure can be replayed.
    let seed = 17;
    const random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed / 2_147_483_648;
    };
    const options: LabelOptions = { width: 640, height: 476, ...DESKTOP_LABELS };
    for (let round = 0; round < 300; round++) {
      const items: LabelIn[] = LABELLED.map((p) => ({
        id: p.id,
        x: 140 + random() * 360,
        y: 10 + random() * 456,
        w: 50 + random() * 50,
      }));
      const out = layoutLabels(items, options);
      assert.equal(out.length, items.length);
      assert.deepEqual(meetings(out), [], `round ${round}`);
    }
  });

  test("a phone's one label goes to the right, level with its anchor where it can", () => {
    const out = layoutLabels([{ id: "balance", x: 120, y: 90, w: 50 }], {
      width: 356,
      height: 253,
      pad: 6,
      pitch: 20,
      gap: 4,
      run: 12,
      sides: "right",
    });
    assert.equal(out.length, 1);
    assert.equal(out[0]?.side, "right");
    assert.equal(out[0]?.y, 90);
    assert.equal(out[0]?.x, 356 - 6 - 50);
  });

  test("anchors outside the box, or under a column, go unlabelled", () => {
    const options: LabelOptions = { width: 640, height: 476, ...DESKTOP_LABELS };
    const out = layoutLabels(
      [
        { id: "a", x: -5, y: 100, w: 60 },
        { id: "b", x: 320, y: 500, w: 60 },
        { id: "c", x: 20, y: 100, w: 60 },
        { id: "d", x: 320, y: 100, w: 60 },
      ],
      options,
    );
    assert.deepEqual(
      out.map((l) => l.id),
      ["d"],
    );
  });

  test("the room the columns take is their share of the width", () => {
    const options: LabelOptions = { width: 640, height: 476, ...DESKTOP_LABELS };
    const span = columnSpan([60, 90], options);
    assert.equal(span, 10 + 90 + 6 + 16);
    assert.equal(labelRoom([60, 90], options), (2 * span) / 640);
    assert.equal(labelRoom([60, 90], { ...options, sides: "right" }), span / 640);
  });
});

describe("rows for labels", () => {
  test("rows already far enough apart stay where their anchors are", () => {
    assert.deepEqual(rows([20, 60, 100], 22, 0, 200), [20, 60, 100]);
  });

  test("crowded rows spread round their anchors, a pitch apart", () => {
    const ys = rows([100, 101, 102], 22, 0, 400);
    assert.deepEqual(
      ys.map((y) => Math.round(y)),
      [79, 101, 123],
    );
  });

  test("rows stay inside the band, and share it evenly when it is too short", () => {
    const ys = rows([0, 1, 2], 22, 11, 200);
    assert.equal(ys[0], 11);
    assert.deepEqual(rows([50, 50, 50], 30, 0, 40), [0, 20, 40]);
  });
});

describe("segments", () => {
  test("crossing, touching and apart", () => {
    assert.ok(segmentsMeet([0, 0], [10, 10], [0, 10], [10, 0]));
    assert.ok(segmentsMeet([0, 0], [10, 0], [5, 0], [5, 5]), "an end on the other");
    assert.ok(!segmentsMeet([0, 0], [10, 0], [0, 1], [10, 1]), "parallel");
    assert.ok(!segmentsMeet([0, 0], [4, 4], [5, 5], [9, 9]), "in line, apart");
  });
});
