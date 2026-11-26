// The movement's moving pieces drawn from the part table: the springs, the pallet fork, the balance and the barrel
// opened. Each returns an SVG string with the classes the page's CSS colours.

import { angleTo, DEG, polar, type Pt } from "../geometry.ts";
import { MOVEMENT, type Calibre } from "../parts.ts";
import { at, bridge, circ, f, P, type Band } from "./draw.ts";

const O: Pt = [0, 0];

/**
 * The mainspring's path at `wind` (0 let down, 1 fully wound): wound coils hug the arbor, let-down coils hug the
 * drum wall.
 */
export function springPath(wind: number, c: Pt = MOVEMENT.barrel.at) {
  const turns = 9;
  const n = 520;
  const arbor = 13.5;
  const wall = 61;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const wound = u < 0.86 ? arbor + 1.5 + 21 * (u / 0.86) : arbor + 22.5 + (wall - arbor - 22.5) * ((u - 0.86) / 0.14);
    const loose = u < 0.12 ? arbor + 1.5 + 24 * (u / 0.12) : wall - 18 + 17 * ((u - 0.12) / 0.88);
    const r = loose + (wound - loose) * wind;
    const a = u * turns * 2 * Math.PI + wind * 4.1;
    const p = polar(c, r, a);
    d += `${i ? "L" : "M"}${f(p[0])} ${f(p[1])}`;
  }
  return d;
}

/** The hairspring at rest: eleven turns out from the collet, then the curve to its stud. */
export function hairspring(m: Calibre = MOVEMENT) {
  const c = m.balance.at;
  const turns = 11;
  const n = 700;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const p = polar(c, 6.5 + 20 * u, u * turns * 2 * Math.PI);
    d += `${i ? "L" : "M"}${f(p[0])} ${f(p[1])}`;
  }
  const stud = polar(c, 31, 200 * DEG);
  return d + ` Q${P(polar(c, 29.5, 120 * DEG))} ${P(stud)}`;
}

/** How far the hairspring's middle coils move out at the full swing, in plane units. */
const BREATH = 1.1;

/** Where the hairspring's outer end is pinned: the stud, beside the outer coil. */
export const STUD = { r: 31, at: 200 * DEG } as const;

/**
 * The hairspring at a balance angle `theta` (radians from rest, clockwise positive), drawn for the close-ups. Its
 * inner end turns with the collet and its outer end stays at the stud. Turned clockwise the spiral loses part of a
 * turn, so its coils open out; turned back it gains one and they close in. That is the spring breathing. Its eleven
 * turns are `hairspring()`'s; past them the outer coil runs on round the outside to the stud, where the hero's small
 * drawing takes a short curve across.
 */
export function hairspringAt(theta: number, m: Calibre = MOVEMENT) {
  const c = m.balance.at;
  const turns = 11;
  const n = 700;
  const k = theta / (m.spec.escapement.amplitude * DEG);
  let d = "";
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const p = polar(c, 6.5 + 20 * u + BREATH * k * Math.sin(Math.PI * u), u * turns * 2 * Math.PI + theta * (1 - u));
    d += `${i ? "L" : "M"}${f(p[0])} ${f(p[1])}`;
  }
  // The terminal curve: on round from the last turn's end, easing out to the stud's radius.
  const tail = 48;
  for (let i = 1; i <= tail; i++) {
    const w = i / tail;
    const p = polar(c, 26.5 + (STUD.r - 26.5) * w * w * (3 - 2 * w), turns * 2 * Math.PI + w * STUD.at);
    d += `L${f(p[0])} ${f(p[1])}`;
  }
  return d;
}

/** The pallet fork about its pivot: two arms with their stones, the lever to the balance, the notch and guard pin. */
export function palletFork(m: Calibre = MOVEMENT) {
  // Local frame: the pivot at the origin, the balance along +x.
  const toB: Pt = [m.balance.at[0] - m.pallet.at[0], m.balance.at[1] - m.pallet.at[1]];
  const L = Math.hypot(...toB);
  const ang = Math.atan2(toB[1], toB[0]);
  const toLocal = (p: Pt): Pt => {
    const v = [p[0] - m.pallet.at[0], p[1] - m.pallet.at[1]] as const;
    return [v[0] * Math.cos(-ang) - v[1] * Math.sin(-ang), v[0] * Math.sin(-ang) + v[1] * Math.cos(-ang)];
  };
  const eAng = angleTo(m.escape.at, m.pallet.at);
  const stones = m.spec.escapement.stones * DEG;
  const s1 = toLocal(polar(m.escape.at, m.escape.r, eAng - stones));
  const s2 = toLocal(polar(m.escape.at, m.escape.r, eAng + stones));
  const tip = L - 11;
  const segs: Band[] = [
    { pts: [O, [s1[0] * 0.72, s1[1] * 0.72]], w: 5 },
    { pts: [O, [s2[0] * 0.72, s2[1] * 0.72]], w: 5 },
    { pts: [O, [tip, 0]], w: 3.6 },
    {
      pts: [
        [tip - 1, -4.2],
        [tip + 3.5, -4.6],
      ],
      w: 2.4,
    },
    {
      pts: [
        [tip - 1, 4.2],
        [tip + 3.5, 4.6],
      ],
      w: 2.4,
    },
    {
      pts: [
        [tip - 2, -4.4],
        [tip - 2, 4.4],
      ],
      w: 2.4,
    },
  ];
  const stone = (s: Pt) => {
    const a = Math.atan2(s[1], s[0]) * (180 / Math.PI);
    return `<rect class="stone" x="${f(-2.2)}" y="${f(-1.4)}" width="6.4" height="2.8" rx="0.6" transform="translate(${P([s[0] * 0.8, s[1] * 0.8])}) rotate(${f(a)})"/>`;
  };
  const deg = ang * (180 / Math.PI);
  return `<g transform="rotate(${f(deg)})">${bridge("fork-body", segs)}${stone(s1)}${stone(s2)}<circle class="fork-pin fo" cx="${f(tip - 6)}" cy="0" r="1"/></g>`;
}

/** The balance about its staff: the rim, three arms, four timing screws, the roller and its impulse pin. */
export function balanceWheel(m: Calibre = MOVEMENT) {
  const { r } = m.balance;
  let s = `<path class="fo" fill-rule="evenodd" d="${circ(O, r)} ${circ(O, r - 4.6)}"/>`;
  s += bridge(
    "arms",
    [90, 210, 330].map((a) => ({ pts: [polar(O, 3, a * DEG), polar(O, r - 3, a * DEG)], w: 3.4 })),
  );
  s += [0, 90, 180, 270]
    .map((a) => {
      const q = polar(O, r - 2.3, (a + 45) * DEG);
      return `<circle class="fo" cx="${f(q[0])}" cy="${f(q[1])}" r="2.6"/>`;
    })
    .join("");
  s += `<circle class="roller fo" r="7.5"/><circle class="hub fo" r="3.6"/>`;
  const pin = polar(O, 6, angleTo(m.balance.at, m.pallet.at));
  s += `<circle class="impulse" cx="${f(pin[0])}" cy="${f(pin[1])}" r="1.3"/>`;
  return s;
}

/** The barrel opened: the drum, the mainspring wound to `wind`, and the arbor with its hook. */
export function barrelCutaway(m: Calibre = MOVEMENT, wind = 0.62) {
  const c = m.barrel.at;
  return (
    `<g class="part p-barrel-inside s1 s2 s3" data-part="barrel"><circle class="drum fo" cx="${f(c[0])}" cy="${f(c[1])}" r="63"/></g>` +
    `<g class="part p-spring s1 s2" data-part="mainspring"><path class="spring-o" d="${springPath(wind, c)}"/><path class="spring-f" d="${springPath(wind, c)}"/></g>` +
    `<g class="part p-arbor s2" data-part="arbor">${at(c, `<circle class="fo" r="13"/><path class="fo" d="M10 -5 L16.5 -2 L10 2 Z"/><circle class="hub fo" r="4"/>`, "rot rot-arbor")}</g>`
  );
}

/** An assembly axis: a dashed line along the lift direction, drawn to the full lift. */
export function axis(c: Pt, amt: number) {
  const end: Pt = [c[0] + amt * 0.5, c[1] - amt * 0.866];
  return `<path class="axis" d="M${P(c)} L${P(end)}" style="--lift:${amt}"/>`;
}
