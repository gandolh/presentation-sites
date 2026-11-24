// The dial side: the movement turned over, which is the back seen in a mirror (x to -x), so the crown sits at three
// o'clock and the small seconds at about eight, over the fourth wheel's arbor. Drawn flat in the paper and plate tones:
// the dial, a railroad minute track, applied indices with a highlight edge, the small seconds' sunk dial, and blued
// Breguet hands. The hands are drawn at the clock's time at t = 0 (10:10:30); each turns about its arbor when the
// page's CSS plays its `rot-hand-*` group, so a still frame is always the same.

import { stateAt } from "../clock.ts";
import { DEG, polar, type Pt } from "../geometry.ts";
import { MOVEMENT, type Calibre } from "../parts.ts";
import { circ, f, P } from "./draw.ts";

const O: Pt = [0, 0];
/** A point of the back's plane as seen on the dial. */
const mirror = (p: Pt): Pt => [-p[0], p[1]];
/** Radians to degrees, for an SVG rotate. */
const degrees = (a: number) => f(a / DEG);

/** Radial strokes from `r0` to `r1` at each of `n` even steps round `c`, skipping where `skip` says. */
function spokes(c: Pt, n: number, r0: number, r1: number, skip: (i: number) => boolean = () => false) {
  let d = "";
  for (let i = 0; i < n; i++) {
    if (skip(i)) continue;
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    d += `M${P(polar(c, r0, a))} L${P(polar(c, r1, a))} `;
  }
  return d.trim();
}

/** A hand's shapes, outline layer under fill layer, so the shaft, the ring and the tip read as one piece. */
const solid = (shapes: readonly string[]) =>
  shapes.map((d) => `<path class="ho" fill-rule="evenodd" d="${d}"/>`).join("") +
  shapes.map((d) => `<path class="hf" fill-rule="evenodd" d="${d}"/>`).join("");

interface BreguetHand {
  /** From the arbor to the tip. */
  readonly length: number;
  /** The ring's centre, its outer radius and its hole's; the hole sits off centre towards the tip (the "moon"). */
  readonly ring: number;
  readonly outer: number;
  readonly hole: number;
  /** The shaft's width at the arbor and where it meets the ring. */
  readonly base: number;
  readonly neck: number;
  /** The boss round the arbor. */
  readonly boss: number;
}

/** A Breguet (pomme) hand pointing to twelve: a tapered shaft, the hollow eccentric ring, then a short spear. */
function breguet(h: BreguetHand) {
  const below = -(h.ring - h.outer * 0.8);
  const above = -(h.ring + h.outer * 0.8);
  const shaft = `M${f(-h.base / 2)} 0 L${f(-h.neck / 2)} ${f(below)} L${f(h.neck / 2)} ${f(below)} L${f(h.base / 2)} 0 Z`;
  const ring = `${circ([0, -h.ring], h.outer)} ${circ([0, -h.ring - h.outer * 0.18], h.hole)}`;
  const tip = `M${f(-h.neck / 2)} ${f(above)} L0 ${f(-h.length)} L${f(h.neck / 2)} ${f(above)} Z`;
  return solid([shaft, ring, tip, circ(O, h.boss)]);
}

/** The small seconds' hand: a needle with a short counterweighted tail. */
function needle(length: number) {
  const tail = length * 0.3;
  const shape = `M-1.1 ${f(tail)} L-1.3 0 L-0.35 ${f(-length)} L0.35 ${f(-length)} L1.3 0 L1.1 ${f(tail)} Z`;
  return solid([shape, circ([0, tail * 0.8], 2.1), circ(O, 2.4)]);
}

/** A hand on its arbor at `c`, turned to `angle` (radians from twelve, clockwise); the inner group is the one that turns. */
const hand = (c: Pt, angle: number, inner: string, cls: string) =>
  `<g transform="translate(${P(c)}) rotate(${degrees(angle)})"><g class="${cls}">${inner}</g></g>`;

/** The dial side's layers, bottom to top. */
function dialBody(m: Calibre = MOVEMENT) {
  const { R } = m.dial;
  const small = m.dial.smallSeconds;
  const s = mirror(small.at);
  const { hands } = stateAt(0, {}, m);

  // The crown at three o'clock: the back's crown in the mirror; the dial covers its stem.
  const stemY = m.stemY;
  const flutes = Array.from({ length: 9 }, (_, i) => `<path class="flute" d="M198 ${f(stemY - 18 + i * 4.5)} h40"/>`);
  const crown =
    `<g class="part p-crown" data-part="crown"><rect class="fo" x="136" y="${f(stemY - 3)}" width="60" height="6" rx="2"/>` +
    `<rect class="fo" x="198" y="${f(stemY - 22)}" width="40" height="44" rx="6"/>${flutes.join("")}` +
    `<rect class="fo" x="194" y="${f(stemY - 9)}" width="6" height="18" rx="1.5"/></g>`;

  // The railroad track: two rails with a tick for every minute between them, heavier every five.
  const outer = R - 10;
  const inner = R - 18;
  const track =
    `<circle class="rail" r="${outer}"/><circle class="rail" r="${inner}"/>` +
    `<path class="tick" d="${spokes(O, 60, inner, outer, (i) => i % 5 === 0)}"/>` +
    `<path class="tick five" d="${spokes(O, 12, inner, outer)}"/>`;

  // Applied indices, a baton at every hour and a pair at twelve, each lit along one edge.
  const index = (x: number, from: number, to: number, w: number) =>
    `<rect class="fo" x="${f(x - w / 2)}" y="${f(-to)}" width="${w}" height="${f(to - from)}" rx="1"/>` +
    `<path class="edge" d="M${f(x - w / 2 + 1.1)} ${f(-to + 1.5)} V${f(-from - 1.5)}"/>`;
  const from = inner - 32;
  const to = inner - 7;
  const indices = Array.from({ length: 12 }, (_, i) => {
    const baton = i === 0 ? index(-4.2, from, to, 5) + index(4.2, from, to, 5) : index(0, from, to, 6);
    return `<g class="index" transform="rotate(${i * 30})">${baton}</g>`;
  }).join("");

  const dial = `<g class="part p-dial" data-part="dial"><circle class="fo" r="${R}"/>${track}${indices}</g>`;

  // The small seconds, sunk into the dial and turned on the fourth wheel's arbor: a tick a second, longer every fifteen.
  const subdial =
    `<g class="subdial"><circle class="fo" cx="${f(s[0])}" cy="${f(s[1])}" r="${small.r}"/>` +
    `<circle class="groove" cx="${f(s[0])}" cy="${f(s[1])}" r="${f(small.r * 0.58)}"/>` +
    `<circle class="groove" cx="${f(s[0])}" cy="${f(s[1])}" r="${f(small.r * 0.34)}"/>` +
    `<path class="tick" d="${spokes(s, 60, small.r - 4, small.r - 1.5, (i) => i % 15 === 0)}"/>` +
    `<path class="tick five" d="${spokes(s, 4, small.r - 9, small.r - 1.5)}"/></g>`;

  const h = m.hands;
  const hourHand = `<g class="part p-hand" data-part="hour-hand">${hand(O, hands.hour, breguet({ length: h.hour, ring: h.hour * 0.75, outer: 9, hole: 5.6, base: 4.6, neck: 2.6, boss: 6.5 }), "rot rot-hand-hour")}</g>`;
  const minuteHand = `<g class="part p-hand" data-part="minute-hand">${hand(O, hands.minute, breguet({ length: h.minute, ring: h.minute * 0.8, outer: 7.5, hole: 4.6, base: 3.6, neck: 2, boss: 5 }), "rot rot-hand-minute")}<circle class="cap" r="2.4"/></g>`;
  const secondsHand = `<g class="part p-hand" data-part="seconds-hand">${hand(s, hands.seconds, needle(h.seconds), "rot rot-hand-seconds")}<circle class="cap" cx="${f(s[0])}" cy="${f(s[1])}" r="1.1"/></g>`;
  const smallSeconds = `<g class="part p-small-seconds" data-part="seconds-hand">${subdial}</g>`;

  return crown + dial + smallSeconds + secondsHand + hourHand + minuteHand;
}

const escapeAttr = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export interface DialOptions {
  /** The drawing's id, unique on the page. */
  readonly id: string;
  /** The back's viewBox seen in the mirror, so turning the figure over keeps every part in its place. */
  readonly viewBox: string;
  /** What the drawing shows, for a screen reader. */
  readonly label: string;
  readonly calibre?: Calibre;
}

/** The dial side as a complete `<svg role="img">`. */
export function dialSvg({ id, viewBox, label, calibre = MOVEMENT }: DialOptions) {
  return (
    `<svg class="movement diagram mode-dial" id="${escapeAttr(id)}" viewBox="${escapeAttr(viewBox)}" role="img" aria-label="${escapeAttr(label)}" xmlns="http://www.w3.org/2000/svg">` +
    `<g class="mv">${dialBody(calibre)}</g></svg>`
  );
}
