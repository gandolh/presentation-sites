// The whole movement as one SVG, seen from the back, in one of four poses:
// - `hero`: assembled, with callouts;
// - `whole`: assembled, no callouts (chapter 5's poster);
// - `chapter`: the barrel opened, its bridge, ratchet wheel, crown wheel and click in lift groups that `--e` raises;
// - `train`: the bridges off, the going train with each mesh's ratio (chapter 2, train.ts).
// Groups whose class names a `rot-*` animation turn about their own centre when the page's CSS plays them.

import { DEG, polar, type Pt } from "../geometry.ts";
import { MOVEMENT, type Calibre } from "../parts.ts";
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

/** The drawing's layers, bottom to top, for a pose. */
export function movementBody(pose: Pose, m: Calibre = MOVEMENT) {
  if (pose === "train") return trainBody(m);
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

const escapeAttr = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export interface MovementOptions {
  readonly pose: Pose;
  /** The drawing's id, unique on the page: the figure's scripts and the dev hook find it by this. */
  readonly id: string;
  readonly viewBox: string;
  /** What the drawing shows, for a screen reader. */
  readonly label: string;
  /** The parts named on the drawing, in the hero's frame. Ignored by the `whole` and `chapter` poses. */
  readonly callouts?: readonly CalloutKey[];
  readonly calibre?: Calibre;
}

/** The movement as a complete `<svg role="img">`. */
export function movementSvg({ pose, id, viewBox, label, callouts = [], calibre = MOVEMENT }: MovementOptions) {
  const named = pose === "hero" ? callouts.map((k) => callout(k, calibre)).join("") : "";
  // The opened barrel starts half lifted, as the sketch's chapter 1 opens.
  const style = pose === "chapter" ? ' style="--e:0.55"' : "";
  return (
    `<svg class="movement diagram mode-${pose}" id="${escapeAttr(id)}" viewBox="${escapeAttr(viewBox)}" role="img" aria-label="${escapeAttr(label)}" xmlns="http://www.w3.org/2000/svg"${style}>` +
    `<g class="mv">${movementBody(pose, calibre)}</g>${named}</svg>`
  );
}
