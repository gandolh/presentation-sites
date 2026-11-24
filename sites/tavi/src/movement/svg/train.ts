// The going train seen from the back with its bridges off: the barrel, centre, third, fourth and escape wheels on the
// plate, the pallet fork and the balance beside them, and beside each mesh its ratio. Chapter 2's steps walk down
// the train one mesh at a time; a part carries `s<n>` for each step that names it, and the ratio of step n's mesh
// carries `s<n>`, so the stylesheet keeps them in colour while the rest drops to the ghost pair.

import { angleTo, polar, type Pt } from "../geometry.ts";
import { MOVEMENT, type Calibre } from "../parts.ts";
import type { Toothed, Wheel } from "../calibre.ts";
import { at, crossings, escapeOutline, f, gearOutline, P, wheel } from "./draw.ts";
import { balanceWheel, hairspring, palletFork } from "./pieces.ts";

/** One mesh of the train: a wheel and the pinion it drives, and where its ratio is written in the drawing's frame. */
interface Mesh {
  readonly driver: (m: Calibre) => Wheel;
  readonly driven: (m: Calibre) => Wheel & { readonly pinion: Toothed };
  /** Where the leader ends and the ratio starts. */
  readonly end: Pt;
  readonly anchor: "start" | "end";
}

// The four meshes in the order the chapter's steps take them, each ratio placed in open plate beside its mesh.
const MESHES: readonly Mesh[] = [
  { driver: (m) => m.barrel, driven: (m) => m.centre, end: [30, -112], anchor: "start" },
  { driver: (m) => m.centre, driven: (m) => m.third, end: [128, -66], anchor: "start" },
  { driver: (m) => m.third, driven: (m) => m.fourth, end: [150, 62], anchor: "start" },
  { driver: (m) => m.fourth, driven: (m) => m.escape, end: [112, 150], anchor: "start" },
];

/** Where a wheel's teeth meet the pinion it drives: on the line between their arbors, at the pinion's pitch circle. */
export function meshPoint(driver: Wheel, driven: Wheel & { readonly pinion: Toothed }): Pt {
  return polar(driven.at, driven.pinion.r, angleTo(driven.at, driver.at));
}

/** A mesh's ratio as the chapter writes it: the wheel's teeth over the pinion's leaves, `72 / 12`. */
export function ratioText(driver: Wheel, driven: Wheel & { readonly pinion: Toothed }): string {
  return `${driver.teeth} / ${driven.pinion.teeth}`;
}

function ratio(mesh: Mesh, step: number, m: Calibre) {
  const driver = mesh.driver(m);
  const driven = mesh.driven(m);
  const dot = meshPoint(driver, driven);
  const text: Pt = [mesh.end[0] + (mesh.anchor === "start" ? 6 : -6), mesh.end[1] + 5];
  return (
    `<g class="ratio s${step}" data-mesh="${step}"><path class="leader" d="M${P(dot)} L${P(mesh.end)}"/>` +
    `<circle class="dot" cx="${f(dot[0])}" cy="${f(dot[1])}" r="2.8"/>` +
    `<text x="${f(text[0])}" y="${f(text[1])}" text-anchor="${mesh.anchor}">${ratioText(driver, driven)}</text></g>`
  );
}

/** The train's layers, bottom to top. */
export function trainBody(m: Calibre = MOVEMENT) {
  const { barrel: b, centre: c, third: t, fourth: fo, escape: e, pallet: pa, balance: ba } = m;

  const holes = m.plate.holes.map((q) => `<circle class="hole" cx="${q[0]}" cy="${q[1]}" r="3.2"/>`).join("");
  const plate = `<g class="part p-plate" data-part="plate"><circle class="fo" r="${m.plate.R}"/><circle class="plate-ring" r="${m.plate.R - 7}"/>${holes}</g>`;

  const stemY = m.stemY;
  const flutes = Array.from({ length: 9 }, (_, i) => `<path class="flute" d="M-238 ${f(stemY - 18 + i * 4.5)} h40"/>`);
  const crown =
    `<g class="part p-crown" data-part="crown"><rect class="fo" x="-196" y="${f(stemY - 3)}" width="60" height="6" rx="2"/>` +
    `<rect class="fo" x="-238" y="${f(stemY - 22)}" width="40" height="44" rx="6"/>${flutes.join("")}` +
    `<rect class="fo" x="-200" y="${f(stemY - 9)}" width="6" height="18" rx="1.5"/></g>`;

  // The barrel closed, its arbor's end in the lid: the bridge that holds it is off.
  const barrel = `<g class="part p-barrel s1" data-part="barrel">${at(b.at, `<path class="fo" d="${gearOutline(b.teeth, b.r)}"/><circle class="fo" r="62"/><circle class="hub fo" r="9"/>`, "rot rot-barrel")}</g>`;
  const centre = `<g class="part p-centre s1 s2" data-part="centre">${at(c.at, wheel(c.teeth, c.r, 4, { hub: 9, rim: 4, pinion: c.pinion }), "rot rot-centre")}</g>`;
  const third = `<g class="part p-third s2 s3" data-part="third">${at(t.at, wheel(t.teeth, t.r, 4, { hub: 7, rim: 3.5, pinion: t.pinion }), "rot rot-third")}</g>`;
  const fourth = `<g class="part p-fourth s3 s4" data-part="fourth">${at(fo.at, wheel(fo.teeth, fo.r, 4, { hub: 6, rim: 3, pinion: fo.pinion }), "rot rot-fourth")}</g>`;
  const escapeInner =
    `<path class="fo" fill-rule="evenodd" d="${escapeOutline(e.teeth, e.r)} ${crossings(5, e.r * 0.66 - 2.6, 4.6, 1.6, 10)}"/>` +
    `<path class="pin fo" d="${gearOutline(e.pinion.teeth, 3.6, { add: 1.1, ded: 1.4, tipW: 0.22 })}"/><circle class="hub fo" r="1.8"/>`;
  const escape = `<g class="part p-escape s4" data-part="escape">${at(e.at, escapeInner, "rot rot-escape")}</g>`;
  const fork = `<g class="part p-pallet" data-part="pallet">${at(pa.at, palletFork(m), "rot rot-pallet")}</g>`;
  const bal = `<g class="part p-balance" data-part="balance">${at(ba.at, balanceWheel(m), "rot rot-balance")}<path class="hair" d="${hairspring(m)}"/></g>`;

  const ratios = MESHES.map((mesh, i) => ratio(mesh, i + 1, m)).join("");
  return plate + crown + barrel + centre + third + fourth + escape + fork + bal + ratios;
}
