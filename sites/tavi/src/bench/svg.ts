// The bench drawn from the tool table (tools.ts) as one SVG, top-down on the mat, in the movement's style: flat
// material fills with a darker outline of the same hue, every colour from the page's tokens. Each builder draws its
// tool about its own centre, inside its footprint; the movement in the holder is the hero's drawing, small. Every
// tool is a `.part` with its id, so the chapter engine lights it when the prose names it (lib/chapters.ts).

import { f, P } from "../movement/svg/draw.ts";
import { movementBody } from "../movement/svg/movement.ts";
import {
  MAT,
  MOVEMENT_DIAMETER,
  MOVEMENT_SCALE,
  OILER,
  SCREWDRIVERS,
  TOOLS,
  loupeSlide,
  type Tool,
  type ToolMaterial,
} from "./tools.ts";

const rect = (x: number, y: number, w: number, h: number, rx = 0) =>
  `<rect class="fo" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${rx ? ` rx="${f(rx)}"` : ""}/>`;

/** Shapes in one material, which sets their fill and outline pair. */
const made = (material: ToolMaterial, inner: string) => `<g class="m m-${material}">${inner}</g>`;

/** A full circle as a path, for cutting rings with even-odd fill. */
const ring = (r: number) => `M${f(-r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z`;

/** A knurled grip: two sets of diagonal lines, a diamond pattern, cut to the box from (x0, y0) to (x1, y1). */
function knurl(x0: number, y0: number, x1: number, y1: number, pitch = 1.8): string {
  let d = "";
  for (let c = y0 - x1; c <= y1 - x0; c += pitch) {
    // y = x + c
    const a = Math.max(x0, y0 - c);
    const b = Math.min(x1, y1 - c);
    if (b > a) d += `M${P([a, a + c])} L${P([b, b + c])}`;
  }
  for (let c = x0 + y0; c <= x1 + y1; c += pitch) {
    // y = c - x
    const a = Math.max(x0, c - y1);
    const b = Math.min(x1, c - y0);
    if (b > a) d += `M${P([a, c - a])} L${P([b, c - b])}`;
  }
  return `<path class="knurl" d="${d}"/>`;
}

/**
 * One watchmaker's screwdriver lying down, cap at the top: the swivel cap in its size's colour, the knurled steel
 * handle, the collet that holds the blade, and the blade, ground flat to its width at the tip.
 */
function screwdriver(x: number, top: number, blade: number, cap: ToolMaterial) {
  const cw = 9.4;
  const hw = 8.6;
  const capH = 9;
  const handle = top + capH;
  const collet = handle + 61;
  const shank = collet + 8;
  const tip = top + 96;
  const sw = blade + 0.7;
  const steel =
    rect(x - hw / 2, handle, hw, collet - handle, 0.8) +
    `<path class="fo" d="M${P([x - hw / 2, collet])} L${P([x - 1.5, shank])} L${P([x + 1.5, shank])} L${P([x + hw / 2, collet])} Z"/>` +
    `<path class="fo" d="M${P([x - sw / 2, shank])} L${P([x - sw / 2, tip - 3.5])} L${P([x - blade / 2, tip])} L${P([x + blade / 2, tip])} L${P([x + sw / 2, tip - 3.5])} L${P([x + sw / 2, shank])} Z"/>` +
    knurl(x - hw / 2, handle + 6, x + hw / 2, collet - 10) +
    `<path class="ln" d="M${P([x - hw / 2, handle + 3])} h${f(hw)} M${P([x - hw / 2, collet - 6])} h${f(hw)}"/>`;
  const head =
    rect(x - cw / 2, top, cw, capH + 1, 3) + `<path class="ln" d="M${P([x - cw / 2, top + 6.4])} h${f(cw)}"/>`;
  return made("steel", steel) + made(cap, head);
}

/** Bergeon's set of five side by side, the smallest blade on the left. */
function screwdrivers({ size }: Tool) {
  const pitch = (size.w - 9.4) / (SCREWDRIVERS.length - 1);
  return SCREWDRIVERS.map(({ blade, cap }, i) =>
    screwdriver(-size.w / 2 + 4.7 + i * pitch, -size.h / 2, blade, cap),
  ).join("");
}

/** A pair of tweezers lying flat, closed, the joined end on the left: the two legs and the gap between them. */
function tweezers({ size, material }: Tool) {
  const L = size.w;
  const x0 = -L / 2;
  const x1 = L / 2;
  const back = 3.2;
  const wide = size.h / 2 - 0.4;
  const point = material === "brass" ? 0.8 : 0.35;
  const at = (t: number) => x0 + t * L;
  const outer =
    `M${P([x0 + back, -back])} Q${P([at(0.3), -back - 0.3])} ${P([at(0.55), -wide])} Q${P([at(0.8), -wide + 0.6])} ${P([x1, -point])}` +
    ` L${P([x1, point])} Q${P([at(0.8), wide - 0.6])} ${P([at(0.55), wide])} Q${P([at(0.3), back + 0.3])} ${P([x0 + back, back])}` +
    ` A${back} ${back} 0 0 1 ${P([x0 + back, -back])} Z`;
  const gap =
    `M${P([at(0.22), 0])} Q${P([at(0.4), -1.7])} ${P([at(0.56), -1.9])} Q${P([at(0.82), -1.4])} ${P([x1 - 3, 0])}` +
    ` Q${P([at(0.82), 1.4])} ${P([at(0.56), 1.9])} Q${P([at(0.4), 1.7])} ${P([at(0.22), 0])} Z`;
  return made(material, `<path class="fo" fill-rule="evenodd" d="${outer} ${gap}"/>`);
}

/**
 * Bergeon's 4040 holder: two chromed jaws on two steel rails, closed on the movement's edge. The movement is the
 * hero's drawing at its real size, turned so the crown points up between the rails; each jaw's lip covers a sliver
 * of the plate, and its inner face shows the steps the plate can sit on.
 */
function holder({ size }: Tool) {
  const r = MOVEMENT_DIAMETER / 2;
  const railY = size.h / 2 - 5;
  const rails = [-railY, railY].map((y) => rect(-size.w / 2, y - 1.8, size.w, 3.6, 1.8)).join("");
  const jaw = (side: -1 | 1) => {
    const inner = side * (r - 0.5);
    const outer = side * (size.w / 2 - 5);
    const x = Math.min(inner, outer);
    const steps = [1.8, 3.6].map((d) => `M${P([inner + side * d, -13])} V13`).join(" ");
    return rect(x, -size.h / 2, Math.abs(outer - inner), size.h, 2) + `<path class="ln" d="${steps}"/>`;
  };
  const held = `<g class="held" transform="rotate(90) scale(${MOVEMENT_SCALE.toFixed(5)})">${movementBody("hero")}</g>`;
  return made("steel", rails) + held + made("chrome", jaw(-1) + jaw(1));
}

/**
 * Bergeon's 2611 eyeglass standing on its eyecup, lens up: the black body round a 20 mm lens, which is clear, so
 * whatever the loupe is over shows through it, and a glint on the glass.
 */
function loupe({ size }: Tool) {
  const R = size.w / 2 - 0.5;
  const lens = 10;
  const glint = (a: number) => P([lens * 0.68 * Math.cos(a), lens * 0.68 * Math.sin(a)]);
  return made(
    "black",
    `<path class="fo" fill-rule="evenodd" d="${ring(R)} ${ring(lens)}"/>` +
      `<circle class="ln" r="${f(R - 3)}"/><circle class="rim" r="${lens}"/>` +
      `<path class="glint" d="M${glint(-2.6)} A${f(lens * 0.68)} ${f(lens * 0.68)} 0 0 1 ${glint(-1.75)}"/>`,
  );
}

/** Bergeon's dip oiler lying down: the coloured cap, the knurled steel handle, the collet and the fine steel point. */
function oiler({ size }: Tool) {
  const x0 = -size.w / 2;
  const h = 3.5;
  const handle = x0 + 7;
  const collet = handle + 60;
  const wire = collet + 8;
  const tip = size.w / 2;
  const steel =
    rect(handle, -h, collet - handle, 2 * h, 0.6) +
    `<path class="fo" d="M${P([collet, -h])} L${P([wire, -0.9])} L${P([wire, 0.9])} L${P([collet, h])} Z"/>` +
    rect(wire, -0.3, tip - 2.5 - wire, 0.6) +
    `<path class="fo" d="M${P([tip - 2.5, -0.3])} Q${P([tip - 1.2, -0.75])} ${P([tip, 0])} Q${P([tip - 1.2, 0.75])} ${P([tip - 2.5, 0.3])} Z"/>` +
    knurl(handle + 6, -h, collet - 12, h);
  return made("steel", steel) + made(OILER.cap, rect(x0, -h - 0.2, 8, 2 * h + 0.4, 2.2));
}

/** A round chromed oil cup with its well. */
function oilCup({ size }: Tool) {
  return (
    made("chrome", `<circle class="fo" r="${f(size.w / 2 - 0.5)}"/>`) + made("steel", `<circle class="fo" r="6.6"/>`)
  );
}

const BUILDERS: Record<Tool["shape"], (tool: Tool) => string> = {
  screwdrivers,
  holder,
  tweezers,
  loupe,
  oiler,
  "oil-cup": oilCup,
};

/** One tool on the mat: a named part, lit on its steps, placed and turned by the table. */
function placed(tool: Tool) {
  const cls = ["part", "tool", `t-${tool.shape}`, ...tool.steps.map((n) => `s${n}`)].join(" ");
  const turn = tool.angle ? ` rotate(${f(tool.angle)})` : "";
  return `<g class="${cls}" data-part="${tool.id}"><g transform="translate(${P(tool.at)})${turn}">${BUILDERS[tool.shape](tool)}</g></g>`;
}

const escapeAttr = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export interface BenchOptions {
  /** The drawing's id, unique on the page. */
  readonly id: string;
  /** What the drawing shows, for a screen reader. */
  readonly label: string;
}

/**
 * The bench as a complete `<svg role="img">`: the mat, then every tool in the table's order, the loupe last, on top,
 * inside the group that slides it over the movement on step 3.
 */
export function benchSvg({ id, label }: BenchOptions): string {
  const [dx, dy] = loupeSlide();
  const tools = TOOLS.map((tool) =>
    tool.id === "loupe" ? `<g class="slide" style="--dx:${f(dx)};--dy:${f(dy)}">${placed(tool)}</g>` : placed(tool),
  );
  return (
    `<svg class="movement diagram mode-bench" id="${escapeAttr(id)}" viewBox="0 0 ${MAT.w} ${MAT.h}" role="img" aria-label="${escapeAttr(label)}" xmlns="http://www.w3.org/2000/svg">` +
    `<g class="bv"><rect class="mat" x="0.5" y="0.5" width="${MAT.w - 1}" height="${MAT.h - 1}" rx="5"/>${tools.join("")}</g></svg>`
  );
}
