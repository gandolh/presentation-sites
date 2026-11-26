// The whole movement as one SVG, seen from the back, in one of four poses:
// - `hero`: assembled, with callouts;
// - `whole`: chapter 5's poster, assembled, every part in a lift group that `--e` raises through the part table's own
//   lift window, as the 3D movement's parts rise, the screws unscrewing on the way; the drawing shrinks to keep the
//   whole stack in its frame;
// - `chapter`: the barrel opened, its bridge, ratchet wheel, crown wheel and click in lift groups that `--e` raises;
// - `train`: the bridges off, the going train with each mesh's ratio (chapter 2, train.ts).
// Groups whose class names a `rot-*` animation turn about their own centre when the page's CSS plays them.

import { DEG, lerp, polar, type Pt } from "../geometry.ts";
import { MOVEMENT, partOf, type Calibre, type PartId } from "../parts.ts";
import {
  at,
  bridge,
  crossings,
  escapeOutline,
  f,
  gearOutline,
  hull,
  jewel,
  P,
  ratchetOutline,
  screw,
  wheel,
} from "./draw.ts";
import { axis, balanceWheel, barrelCutaway, hairspring, palletFork } from "./pieces.ts";
import { trainBody } from "./train.ts";

export type Pose = "hero" | "whole" | "chapter" | "train";

/** The parts a callout can name. */
export type CalloutKey = "barrel" | "train" | "balance" | "escape";

interface CalloutSpec {
  readonly at: (m: Calibre) => Pt;
  readonly end: Pt;
  readonly text: string;
  readonly anchor: "start" | "end";
  readonly tx: number;
  readonly ty: number;
}

// Where each callout's dot sits on its part, and where its leader and label go in the hero's frame.
const CALLOUTS: Record<CalloutKey, CalloutSpec> = {
  barrel: {
    at: (m) => polar(m.barrel.at, 69, 232 * DEG),
    end: [-122, -166],
    text: "Barrel",
    anchor: "end",
    tx: -128,
    ty: -166,
  },
  balance: {
    at: (m) => polar(m.balance.at, 40, 150 * DEG),
    end: [-104, 192],
    text: "Balance",
    anchor: "end",
    tx: -110,
    ty: 202,
  },
  escape: {
    at: (m) => polar(m.escape.at, 21, 62 * DEG),
    end: [110, 190],
    text: "Escape wheel",
    anchor: "start",
    tx: 116,
    ty: 200,
  },
  train: {
    at: (m) => polar(m.third.at, 44, -50 * DEG),
    end: [128, -166],
    text: "Wheel train",
    anchor: "start",
    tx: 134,
    ty: -164,
  },
};

function callout(key: CalloutKey, m: Calibre) {
  const c = CALLOUTS[key];
  const a = c.at(m);
  return `<g class="callout"><circle class="dot" cx="${f(a[0])}" cy="${f(a[1])}" r="2.8"/><path class="leader" d="M${P(a)} L${P(c.end)}"/><text x="${c.tx}" y="${c.ty}" text-anchor="${c.anchor}">${c.text}</text></g>`;
}

/**
 * How far the drawing lifts a part for each unit the 3D movement lifts it: the drawing's lift runs along one oblique
 * axis, up and to the right, and at the table's full lift the stack would leave the frame.
 */
export const DRAWN_LIFT = 1.4;
/** The lift's direction in the drawing: up and to the right, as chapter 1's. */
const AXIS: Pt = [0.5, -0.866];

/** The circles each part covers, for the frame the whole pose shrinks into once every part has lifted. */
function extentsOf(m: Calibre): Partial<Record<PartId, readonly (readonly [Pt, number])[]>> {
  const { barrel: b, centre: c, third: t, fourth: fo, escape: e, pallet: pa, balance: ba, crownWheel: cw } = m;
  const [bFoot0, bFoot1] = m.feet.barrelBridge;
  const [tFoot0, tFoot1] = m.feet.trainBridge;
  const pFoot = m.feet.palletBridge;
  const cockFoot = m.feet.balanceCock;
  return {
    barrel: [[b.at, b.r + 3]],
    lid: [[b.at, 62]],
    centre: [[c.at, c.r + 3]],
    third: [[t.at, t.r + 3]],
    fourth: [[fo.at, fo.r + 3]],
    escape: [[e.at, e.r + 2]],
    pallet: [
      [pa.at, 12],
      [lerp(pa.at, ba.at, 0.8), 6],
    ],
    balance: [[ba.at, ba.r + 3]],
    hairspring: [[ba.at, 32]],
    "barrel-bridge": [
      [b.at, 40],
      [cw.at, 21],
      [bFoot0, 12],
      [bFoot1, 11],
    ],
    "barrel-screws": [
      [bFoot0, 6],
      [bFoot1, 6],
    ],
    ratchet: [[b.at, m.ratchet.r + 1]],
    crownwheel: [[cw.at, cw.r + 2]],
    click: [[polar(b.at, 48, -28 * DEG), 14]],
    "train-bridge": [tFoot1, t.at, fo.at, e.at, tFoot0, c.at].map((q) => [q, 11] as const),
    "train-screws": [
      [tFoot0, 6],
      [tFoot1, 6],
    ],
    "pallet-bridge": [
      [pa.at, 8],
      [pFoot, 8],
    ],
    "pallet-screws": [[pFoot, 6]],
    "balance-cock": [
      [ba.at, 30],
      [cockFoot, 19],
    ],
    "cock-screws": [[cockFoot, 6]],
  };
}

/**
 * The whole pose's frame once every part has lifted: the scale and the shift that fit the lifted stack, the plate and
 * the crown into the viewBox, applied in proportion to `--e`.
 */
export function apartFit(viewBox: string, m: Calibre = MOVEMENT) {
  const [vx = 0, vy = 0, vw = 1, vh = 1] = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  let x0 = -m.plate.R;
  let x1 = m.plate.R;
  let y0 = -m.plate.R;
  let y1 = m.plate.R;
  // The crown, out to the left of the plate.
  x0 = Math.min(x0, -238);
  for (const [id, circles] of Object.entries(extentsOf(m)) as [PartId, readonly (readonly [Pt, number])[]][]) {
    const lift = partOf(m, id).explode.lift * DRAWN_LIFT;
    for (const [q, r] of circles) {
      const cx = q[0] + lift * AXIS[0];
      const cy = q[1] + lift * AXIS[1];
      x0 = Math.min(x0, cx - r);
      x1 = Math.max(x1, cx + r);
      y0 = Math.min(y0, cy - r);
      y1 = Math.max(y1, cy + r);
    }
  }
  const s = Math.min(1, Math.min(vw / (x1 - x0), vh / (y1 - y0)) * 0.97);
  return { s, x: vx + vw / 2 - s * ((x0 + x1) / 2), y: vy + vh / 2 - s * ((y0 + y1) / 2) };
}

/** The drawing's layers, bottom to top, for a pose. */
export function movementBody(pose: Pose, m: Calibre = MOVEMENT) {
  if (pose === "train") return trainBody(m);
  if (pose === "whole") return wholeBody(m);
  const opened = pose === "chapter";
  const { barrel: b, centre: c, third: t, fourth: fo, escape: e, pallet: pa, balance: ba, crownWheel: cw } = m;
  const lift = (amt: number, inner: string, extra: string) =>
    `<g class="lift ${extra}" style="--lift:${amt}">${inner}</g>`;

  const holes = m.plate.holes.map((q) => `<circle class="hole" cx="${q[0]}" cy="${q[1]}" r="3.2"/>`).join("");
  const plate = `<g class="part p-plate" data-part="plate"><circle class="fo" r="${m.plate.R}"/><circle class="plate-ring" r="${m.plate.R - 7}"/>${holes}</g>`;

  const stemY = m.stemY;
  const flutes = Array.from({ length: 9 }, (_, i) => `<path class="flute" d="M-238 ${f(stemY - 18 + i * 4.5)} h40"/>`);
  const crown =
    `<g class="part p-crown s2" data-part="crown"><rect class="fo" x="-196" y="${f(stemY - 3)}" width="60" height="6" rx="2"/>` +
    `<rect class="fo" x="-238" y="${f(stemY - 22)}" width="40" height="44" rx="6"/>${flutes.join("")}` +
    `<rect class="fo" x="-200" y="${f(stemY - 9)}" width="6" height="18" rx="1.5"/></g>`;

  const lid = opened ? "" : `<circle class="lid fo" r="62"/>`;
  const barrelGear = `<g class="part p-barrel s1 s3" data-part="barrel">${at(b.at, `<path class="fo" d="${gearOutline(b.teeth, b.r)}"/>${lid}`, "rot rot-barrel")}</g>`;

  const centreW = `<g class="part p-centre s3" data-part="centre">${at(c.at, wheel(c.teeth, c.r, 4, { hub: 9, rim: 4, pinion: c.pinion }), "rot rot-centre")}</g>`;
  const thirdW = `<g class="part p-third" data-part="third">${at(t.at, wheel(t.teeth, t.r, 4, { hub: 7, rim: 3.5, pinion: t.pinion }), "rot rot-third")}</g>`;
  const fourthW = `<g class="part p-fourth" data-part="fourth">${at(fo.at, wheel(fo.teeth, fo.r, 4, { hub: 6, rim: 3, pinion: fo.pinion }), "rot rot-fourth")}</g>`;
  const escapeInner =
    `<path class="fo" fill-rule="evenodd" d="${escapeOutline(e.teeth, e.r)} ${crossings(5, e.r * 0.66 - 2.6, 4.6, 1.6, 10)}"/>` +
    `<path class="pin fo" d="${gearOutline(e.pinion.teeth, 3.6, { add: 1.1, ded: 1.4, tipW: 0.22 })}"/><circle class="hub fo" r="1.8"/>`;
  const escapeW = `<g class="part p-escape" data-part="escape">${at(e.at, escapeInner, "rot rot-escape")}</g>`;
  const fork = `<g class="part p-pallet" data-part="pallet">${at(pa.at, palletFork(m), "rot rot-pallet")}</g>`;
  const bal = `<g class="part p-balance" data-part="balance">${at(ba.at, balanceWheel(m), "rot rot-balance")}<path class="hair" d="${hairspring(m)}"/></g>`;

  // The bridges and cocks, each screwed to the plate at its feet.
  const [bFoot0, bFoot1] = m.feet.barrelBridge;
  const [tFoot0, tFoot1] = m.feet.trainBridge;
  const pFoot = m.feet.palletBridge;
  const cockFoot = m.feet.balanceCock;
  const barrelBridge = `<g class="part p-bridge bridge-barrel">${hull(
    [
      [b.at, 40],
      [cw.at, 21],
      [bFoot0, 12],
    ],
    "bridge-shape",
  )}${bridge("bridge-arm", [{ pts: [b.at, bFoot1], w: 20 }], [[bFoot1, 11]])}</g>`;
  const trainBridge = bridge(
    "part p-bridge bridge-train",
    [
      { pts: [tFoot1, t.at, fo.at, e.at], w: 16 },
      { pts: [tFoot0, c.at], w: 15 },
    ],
    [
      [c.at, 10.5],
      [t.at, 11],
      [fo.at, 11],
      [e.at, 10],
      [tFoot0, 10],
    ],
  );
  const palletCock = bridge(
    "part p-bridge bridge-pallet",
    [{ pts: [pa.at, pFoot], w: 11 }],
    [
      [pa.at, 8],
      [pFoot, 8],
    ],
  );
  const balanceCock = `<g class="part p-bridge bridge-balance">${hull(
    [
      [ba.at, 13],
      [cockFoot, 19],
    ],
    "bridge-shape",
  )}</g>`;
  const regulatorTo = P(polar(ba.at, 30, -62 * DEG));
  const regulator = `<g class="part p-bridge"><path class="reg-o" d="M${P(ba.at)} L${regulatorTo}"/><path class="reg-f" d="M${P(ba.at)} L${regulatorTo}"/></g>`;

  const lyre = `<path class="lyre" d="M${P([ba.at[0] - 7, ba.at[1] - 3])} Q${P([ba.at[0], ba.at[1] - 12])} ${P([ba.at[0] + 7, ba.at[1] - 3])}"/>`;
  const jewels =
    [c.at, t.at, fo.at, e.at, pa.at].map((p) => jewel(p, 2.8)).join("") +
    `<g class="shock">${jewel(ba.at, 3.4)}${lyre}</g>`;
  const screwsOf = (feet: readonly Pt[], from: number) => feet.map((p, i) => screw(p, 5.2, from + i * 37)).join("");

  // The winding parts on top of the barrel bridge.
  const ratchet = `<g class="part p-ratchet s2" data-part="ratchet">${at(b.at, `<path class="fo" d="${ratchetOutline(m.ratchet.teeth, m.ratchet.r)}"/><circle class="ring" r="22"/>`, "rot rot-ratchet")}${screw(b.at, 9, 60)}</g>`;
  const crownWheel = `<g class="part p-crownwheel s2" data-part="crownwheel">${at(cw.at, `<path class="fo" d="${gearOutline(cw.teeth, cw.r, { tipW: 0.22 })}"/>`, "rot rot-crownwheel")}${screw(cw.at, 5.4, 110)}</g>`;
  const clickPivot = polar(b.at, 50, -14 * DEG);
  const clickTip = polar(b.at, m.ratchet.r - 1.2, -44 * DEG);
  const clickBody = bridge("click-body", [{ pts: [clickPivot, polar(b.at, 42, -32 * DEG), clickTip], w: 5 }]);
  const clickSpring = `<path class="clickspring" d="M${P(clickPivot)} Q${P(polar(b.at, 62, -30 * DEG))} ${P(polar(b.at, 60, -48 * DEG))}"/>`;
  const click = `<g class="part p-click s2" data-part="click">${clickBody}${clickSpring}${screw(clickPivot, 3.6, 0)}</g>`;

  const lowerTrain = centreW + thirdW + fourthW + escapeW + fork + bal;
  const bridgesTop = trainBridge + palletCock + balanceCock + regulator;
  if (!opened) {
    const screws = screwsOf([bFoot0, bFoot1, tFoot0, tFoot1, pFoot, cockFoot], 20);
    return (
      plate +
      crown +
      barrelGear +
      lowerTrain +
      barrelBridge +
      bridgesTop +
      jewels +
      screws +
      ratchet +
      crownWheel +
      click
    );
  }
  return (
    plate +
    crown +
    lowerTrain +
    barrelGear +
    barrelCutaway(m) +
    bridgesTop +
    jewels +
    `<g class="axes">${axis(b.at, 160)}${axis(cw.at, 140)}</g>` +
    lift(110, barrelBridge + screwsOf([bFoot0, bFoot1], 20), "lift-bridge") +
    lift(160, ratchet, "lift-ratchet") +
    lift(140, crownWheel, "lift-crownwheel") +
    lift(110, click, "lift-click") +
    screwsOf([tFoot0, tFoot1, pFoot, cockFoot], 60)
  );
}

/**
 * Chapter 5's poster: the movement assembled as the hero draws it, every part in a lift group with the part table's
 * lift, window and spin, so `--e` takes it apart in the order the 3D movement comes apart. Each bridge carries its
 * jewels, and its screws lift a little before it, unscrewing; the screws share their bridge's name, so they light
 * with it.
 */
function wholeBody(m: Calibre) {
  const { barrel: b, centre: c, third: t, fourth: fo, escape: e, pallet: pa, balance: ba, crownWheel: cw } = m;
  const lifted = (id: PartId, inner: string) => {
    const { lift, window: w, spin } = partOf(m, id).explode;
    if (lift === 0) return inner;
    const style = `--lift:${f(lift * DRAWN_LIFT)};--w0:${f(w[0])};--w1:${f(w[1])}${spin ? `;--spin:${spin}` : ""}`;
    return `<g class="lift-w" style="${style}">${inner}</g>`;
  };
  const named = (id: PartId, cls: string, inner: string) => `<g class="part ${cls}" data-part="${id}">${inner}</g>`;
  /** A bridge's screws, each turning about its own centre as it lifts. */
  const screws = (id: PartId, bridgeId: PartId, feet: readonly Pt[], from: number) =>
    lifted(
      id,
      named(bridgeId, "p-screws", feet.map((p, i) => at(p, screw([0, 0], 5.2, from + i * 37), "spin")).join("")),
    );

  const holes = m.plate.holes.map((q) => `<circle class="hole" cx="${q[0]}" cy="${q[1]}" r="3.2"/>`).join("");
  const plate = named(
    "plate",
    "p-plate",
    `<circle class="fo" r="${m.plate.R}"/><circle class="plate-ring" r="${m.plate.R - 7}"/>${holes}`,
  );
  const stemY = m.stemY;
  const flutes = Array.from({ length: 9 }, (_, i) => `<path class="flute" d="M-238 ${f(stemY - 18 + i * 4.5)} h40"/>`);
  const crown = named(
    "crown",
    "p-crown",
    `<rect class="fo" x="-196" y="${f(stemY - 3)}" width="60" height="6" rx="2"/>` +
      `<rect class="fo" x="-238" y="${f(stemY - 22)}" width="40" height="44" rx="6"/>${flutes.join("")}` +
      `<rect class="fo" x="-200" y="${f(stemY - 9)}" width="6" height="18" rx="1.5"/>`,
  );
  // The barrel with its mainspring and arbor inside, under the lid, which lifts off first.
  const barrel = lifted(
    "barrel",
    named("barrel", "p-barrel", at(b.at, `<path class="fo" d="${gearOutline(b.teeth, b.r)}"/>`, "rot rot-barrel")) +
      barrelCutaway(m),
  );
  const lid = lifted(
    "lid",
    named("lid", "p-barrel", `<circle class="lid fo" cx="${f(b.at[0])}" cy="${f(b.at[1])}" r="62"/>`),
  );
  const train =
    lifted(
      "centre",
      named(
        "centre",
        "p-centre",
        at(c.at, wheel(c.teeth, c.r, 4, { hub: 9, rim: 4, pinion: c.pinion }), "rot rot-centre"),
      ),
    ) +
    lifted(
      "third",
      named(
        "third",
        "p-third",
        at(t.at, wheel(t.teeth, t.r, 4, { hub: 7, rim: 3.5, pinion: t.pinion }), "rot rot-third"),
      ),
    ) +
    lifted(
      "fourth",
      named(
        "fourth",
        "p-fourth",
        at(fo.at, wheel(fo.teeth, fo.r, 4, { hub: 6, rim: 3, pinion: fo.pinion }), "rot rot-fourth"),
      ),
    );
  const escapeInner =
    `<path class="fo" fill-rule="evenodd" d="${escapeOutline(e.teeth, e.r)} ${crossings(5, e.r * 0.66 - 2.6, 4.6, 1.6, 10)}"/>` +
    `<path class="pin fo" d="${gearOutline(e.pinion.teeth, 3.6, { add: 1.1, ded: 1.4, tipW: 0.22 })}"/><circle class="hub fo" r="1.8"/>`;
  const escapement =
    lifted("escape", named("escape", "p-escape", at(e.at, escapeInner, "rot rot-escape"))) +
    lifted("pallet", named("pallet", "p-pallet", at(pa.at, palletFork(m), "rot rot-pallet"))) +
    lifted("balance", named("balance", "p-balance", at(ba.at, balanceWheel(m), "rot rot-balance"))) +
    lifted("hairspring", named("hairspring", "p-balance", `<path class="hair" d="${hairspring(m)}"/>`));

  const [bFoot0, bFoot1] = m.feet.barrelBridge;
  const [tFoot0, tFoot1] = m.feet.trainBridge;
  const pFoot = m.feet.palletBridge;
  const cockFoot = m.feet.balanceCock;
  const barrelBridge = lifted(
    "barrel-bridge",
    named(
      "barrel-bridge",
      "p-bridge bridge-barrel",
      hull(
        [
          [b.at, 40],
          [cw.at, 21],
          [bFoot0, 12],
        ],
        "bridge-shape",
      ) + bridge("bridge-arm", [{ pts: [b.at, bFoot1], w: 20 }], [[bFoot1, 11]]),
    ),
  );
  const ratchet = lifted(
    "ratchet",
    named(
      "ratchet",
      "p-ratchet",
      at(
        b.at,
        `<path class="fo" d="${ratchetOutline(m.ratchet.teeth, m.ratchet.r)}"/><circle class="ring" r="22"/>`,
        "rot rot-ratchet",
      ) + screw(b.at, 9, 60),
    ),
  );
  const crownWheel = lifted(
    "crownwheel",
    named(
      "crownwheel",
      "p-crownwheel",
      at(cw.at, `<path class="fo" d="${gearOutline(cw.teeth, cw.r, { tipW: 0.22 })}"/>`, "rot rot-crownwheel") +
        screw(cw.at, 5.4, 110),
    ),
  );
  const clickPivot = polar(b.at, 50, -14 * DEG);
  const clickTip = polar(b.at, m.ratchet.r - 1.2, -44 * DEG);
  const click = lifted(
    "click",
    named(
      "click",
      "p-click",
      bridge("click-body", [{ pts: [clickPivot, polar(b.at, 42, -32 * DEG), clickTip], w: 5 }]) +
        `<path class="clickspring" d="M${P(clickPivot)} Q${P(polar(b.at, 62, -30 * DEG))} ${P(polar(b.at, 60, -48 * DEG))}"/>` +
        screw(clickPivot, 3.6, 0),
    ),
  );
  const trainBridge = lifted(
    "train-bridge",
    named(
      "train-bridge",
      "p-bridge",
      bridge(
        "bridge-train",
        [
          { pts: [tFoot1, t.at, fo.at, e.at], w: 16 },
          { pts: [tFoot0, c.at], w: 15 },
        ],
        [
          [c.at, 10.5],
          [t.at, 11],
          [fo.at, 11],
          [e.at, 10],
          [tFoot0, 10],
        ],
      ) + [c.at, t.at, fo.at, e.at].map((q) => jewel(q, 2.8)).join(""),
    ),
  );
  const palletBridge = lifted(
    "pallet-bridge",
    named(
      "pallet-bridge",
      "p-bridge",
      bridge(
        "bridge-pallet",
        [{ pts: [pa.at, pFoot], w: 11 }],
        [
          [pa.at, 8],
          [pFoot, 8],
        ],
      ) + jewel(pa.at, 2.8),
    ),
  );
  const regulatorTo = P(polar(ba.at, 30, -62 * DEG));
  const lyre = `<path class="lyre" d="M${P([ba.at[0] - 7, ba.at[1] - 3])} Q${P([ba.at[0], ba.at[1] - 12])} ${P([ba.at[0] + 7, ba.at[1] - 3])}"/>`;
  const cock = lifted(
    "balance-cock",
    named(
      "balance-cock",
      "p-bridge bridge-balance",
      hull(
        [
          [ba.at, 13],
          [cockFoot, 19],
        ],
        "bridge-shape",
      ) +
        `<path class="reg-o" d="M${P(ba.at)} L${regulatorTo}"/><path class="reg-f" d="M${P(ba.at)} L${regulatorTo}"/>` +
        `<g class="shock">${jewel(ba.at, 3.4)}${lyre}</g>`,
    ),
  );
  return (
    plate +
    crown +
    barrel +
    lid +
    train +
    escapement +
    barrelBridge +
    screws("barrel-screws", "barrel-bridge", [bFoot0, bFoot1], 20) +
    ratchet +
    crownWheel +
    click +
    trainBridge +
    screws("train-screws", "train-bridge", [tFoot0, tFoot1], 94) +
    palletBridge +
    screws("pallet-screws", "pallet-bridge", [pFoot], 168) +
    cock +
    screws("cock-screws", "balance-cock", [cockFoot], 205)
  );
}

const escapeAttr = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export interface MovementOptions {
  readonly pose: Pose;
  /** The drawing's id, unique on the page: the figure's scripts and the dev hook find it by this. */
  readonly id: string;
  readonly viewBox: string;
  /** What the drawing shows, for a screen reader. */
  readonly label: string;
  /** The parts named on the drawing, in the hero's frame. Ignored by the other poses. */
  readonly callouts?: readonly CalloutKey[];
  readonly calibre?: Calibre;
}

/** The movement as a complete `<svg role="img">`. */
export function movementSvg({ pose, id, viewBox, label, callouts = [], calibre = MOVEMENT }: MovementOptions) {
  const named = pose === "hero" ? callouts.map((k) => callout(k, calibre)).join("") : "";
  // The opened barrel starts half lifted, as the sketch's chapter 1 opens. The whole pose carries the frame it shrinks
  // into as it comes apart.
  const fit = pose === "whole" ? apartFit(viewBox, calibre) : null;
  const style =
    pose === "chapter"
      ? ' style="--e:0.55"'
      : fit
        ? ` style="--fit-s:${f(fit.s)};--fit-x:${f(fit.x)};--fit-y:${f(fit.y)}"`
        : "";
  return (
    `<svg class="movement diagram mode-${pose}" id="${escapeAttr(id)}" viewBox="${escapeAttr(viewBox)}" role="img" aria-label="${escapeAttr(label)}" xmlns="http://www.w3.org/2000/svg"${style}>` +
    `<g class="mv">${movementBody(pose, calibre)}</g>${named}</svg>`
  );
}
