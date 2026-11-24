// Draws the movement as an SVG technical illustration from geometry.mjs.
// Every drawn element carries a class; colours come from the page's CSS tokens.
import { M, D, pol } from './geometry.mjs';

const f = (n) => +n.toFixed(2);
const P = (p) => `${f(p[0])} ${f(p[1])}`;
const O = [0, 0];

// Wheel outline: rounded (ogival) addendum, radial flanks, as watch wheels are cut.
function gearOutline(N, r, { add = 1.0, ded = 1.25, tipW = 0.25, start = 0 } = {}) {
  const m = (2 * r) / N, p = (2 * Math.PI) / N;
  const ra = r + add * m, rf = r - ded * m;
  let d = '';
  for (let i = 0; i < N; i++) {
    const a = start + i * p;
    const r0 = pol(O, rf, a - 0.5 * p), r1 = pol(O, rf, a - tipW * p);
    const s0 = pol(O, r, a - tipW * p), s1 = pol(O, r, a + tipW * p);
    const c0 = pol(O, ra * 1.02, a - tipW * 0.75 * p), c1 = pol(O, ra * 1.02, a + tipW * 0.75 * p);
    const r2 = pol(O, rf, a + tipW * p);
    d += `${i ? 'L' : 'M'}${P(r0)} A${f(rf)} ${f(rf)} 0 0 1 ${P(r1)} L${P(s0)} C${P(c0)} ${P(c1)} ${P(s1)} L${P(r2)} `;
  }
  const end = pol(O, rf, start - 0.5 * p);
  return d + `A${f(rf)} ${f(rf)} 0 0 1 ${P(end)} Z`;
}

// Crossings: holes between curved spokes, cut with even-odd fill.
function crossings(n, rOut, rIn, spokeW, twist = 14) {
  let d = '';
  for (let j = 0; j < n; j++) {
    const a1 = ((j * 360) / n) * D + spokeW / rOut, a2 = (((j + 1) * 360) / n) * D - spokeW / rOut;
    const b1 = a1 + twist * D + (spokeW / rIn - spokeW / rOut), b2 = a2 + twist * D - (spokeW / rIn - spokeW / rOut);
    const o1 = pol(O, rOut, a1), o2 = pol(O, rOut, a2), i2 = pol(O, rIn, b2), i1 = pol(O, rIn, b1);
    const m2 = pol(O, (rOut + rIn) / 2, (a2 + b2) / 2 + twist * 0.25 * D), m1 = pol(O, (rOut + rIn) / 2, (a1 + b1) / 2 + twist * 0.25 * D);
    const large = a2 - a1 > Math.PI ? 1 : 0, largeI = b2 - b1 > Math.PI ? 1 : 0;
    d += `M${P(o1)} A${f(rOut)} ${f(rOut)} 0 ${large} 1 ${P(o2)} Q${P(m2)} ${P(i2)} A${f(rIn)} ${f(rIn)} 0 ${largeI} 0 ${P(i1)} Q${P(m1)} ${P(o1)} Z `;
  }
  return d;
}

const circ = (c, r) => `M${f(c[0] - r)} ${f(c[1])} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z`;

function wheel(N, r, spokes, { hub = 6, rim = 3.5, pinion } = {}) {
  const m = (2 * r) / N, rf = r - 1.25 * m;
  let s = `<path class="fo" fill-rule="evenodd" d="${gearOutline(N, r)} ${crossings(spokes, rf - rim, hub + 2.5, 2.2)}"/>`;
  if (pinion) s += `<path class="pin fo" d="${gearOutline(pinion.N, pinion.r * 0.92, { add: 1.1, ded: 1.4, tipW: 0.22 })}"/>`;
  s += `<circle class="hub fo" r="${f(hub * 0.55)}"/>`;
  return s;
}

// Escape wheel: 15 club teeth leaning the way the wheel turns.
function escapeOutline() {
  const { N, r } = M.escape, root = r * 0.66;
  let d = '';
  for (let i = 0; i < N; i++) {
    const a = (i * 360) / N;
    const p1 = pol(O, root, a * D), p2 = pol(O, r, (a + 4) * D), p3 = pol(O, r * 0.95, (a + 9.5) * D);
    const p4 = pol(O, root, (a + 17) * D), c4 = pol(O, r * 0.78, (a + 17) * D);
    const next = pol(O, root, (a + 24) * D);
    d += `${i ? 'L' : 'M'}${P(p1)} L${P(p2)} L${P(p3)} Q${P(c4)} ${P(p4)} A${f(root)} ${f(root)} 0 0 1 ${P(next)} `;
  }
  return d + 'Z';
}

function ratchetOutline() {
  const { N, r } = M.ratchet, rf = r - 2.6;
  let d = '';
  for (let i = 0; i < N; i++) {
    const a = ((i * 360) / N) * D, p = (2 * Math.PI) / N;
    d += `${i ? 'L' : 'M'}${P(pol(O, rf, a))} L${P(pol(O, r, a + p * 0.82))} L${P(pol(O, rf, a + p))} `;
  }
  return d + 'Z';
}

// A watch bridge as the union of round-capped bands: outline strokes first, fills on top.
function bridge(cls, segs, discs = []) {
  const w = (s) => s.w;
  const line = (s) => `M${s.pts.map(P).join(' L')}`;
  let out = `<g class="${cls}">`;
  out += segs.map((s) => `<path class="bo" d="${line(s)}" stroke-width="${f(w(s) + 2.6)}"/>`).join('');
  out += discs.map(([c, r]) => `<circle class="bo-disc" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r + 1.3)}"/>`).join('');
  out += segs.map((s) => `<path class="bf" d="${line(s)}" stroke-width="${f(w(s))}"/>`).join('');
  out += discs.map(([c, r]) => `<circle class="bf-disc" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r)}"/>`).join('');
  return out + '</g>';
}


// Rounded hull of circles: the calm outline of a real bridge or cock.
function hull(circles, cls) {
  const pts = [];
  for (const [c, r] of circles) for (let i = 0; i < 64; i++) pts.push(pol(c, r, (i / 64) * 2 * Math.PI));
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p); }
  for (const p of pts.slice().reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p); }
  const h = lower.slice(0, -1).concat(upper.slice(0, -1));
  return `<path class="${cls} fo" d="M${h.map(P).join(' L')} Z"/>`;
}

// Catmull-Rom through points, sampled, for smooth bands.
function smooth(points, steps = 14) {
  const out = [];
  const p = [points[0], ...points, points.at(-1)];
  for (let i = 1; i < p.length - 2; i++) {
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      const q = [0, 1].map((j) => 0.5 * (2 * p[i][j] + (-p[i - 1][j] + p[i + 1][j]) * t + (2 * p[i - 1][j] - 5 * p[i][j] + 4 * p[i + 1][j] - p[i + 2][j]) * t2 + (-p[i - 1][j] + 3 * p[i][j] - 3 * p[i + 1][j] + p[i + 2][j]) * t3));
      out.push(q);
    }
  }
  out.push(points.at(-1));
  return out;
}

const screw = (c, r = 5, a = 30) => {
  const s0 = pol(c, r * 0.8, a * D), s1 = pol(c, r * 0.8, (a + 180) * D);
  return `<g class="screw"><circle class="fo" cx="${f(c[0])}" cy="${f(c[1])}" r="${r}"/><path class="slot" d="M${P(s0)} L${P(s1)}"/></g>`;
};
const jewel = (c, r = 3) => `<g class="jewel"><circle class="chaton" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r + 1.8)}"/><circle class="fo" cx="${f(c[0])}" cy="${f(c[1])}" r="${r}"/><circle class="glint" cx="${f(c[0] - r * 0.35)}" cy="${f(c[1] - r * 0.35)}" r="${f(r * 0.3)}"/></g>`;

const at = (c, inner, cls = '') => `<g transform="translate(${P(c)})"><g class="${cls}">${inner}</g></g>`;

// Mainspring: wound coils hug the arbor, let-down coils hug the drum wall.
export function springPath(wind, c = M.barrel.c) {
  const turns = 9, n = 520, arbor = 13.5, wall = 61;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const wound = u < 0.86 ? arbor + 1.5 + 21 * (u / 0.86) : arbor + 22.5 + (wall - arbor - 22.5) * ((u - 0.86) / 0.14);
    const loose = u < 0.12 ? arbor + 1.5 + 24 * (u / 0.12) : wall - 18 + 17 * ((u - 0.12) / 0.88);
    const r = loose + (wound - loose) * wind;
    const a = u * turns * 2 * Math.PI + wind * 4.1;
    const p = pol(c, r, a);
    d += `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`;
  }
  return d;
}

function hairspring() {
  const c = M.balance.c, turns = 11, n = 700;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n, r = 6.5 + 20 * u, a = u * turns * 2 * Math.PI;
    const p = pol(c, r, a);
    d += `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`;
  }
  const end = pol(c, 26.5, turns * 2 * Math.PI), stud = pol(c, 31, 200 * D);
  return d + ` Q${P(pol(c, 29.5, 120 * D))} ${P(stud)}`;
}

function palletFork() {
  // Local frame: pivot at the origin, the balance along +x.
  const toB = M.balance.c.map((v, i) => v - M.pallet.c[i]);
  const L = Math.hypot(...toB), ang = Math.atan2(toB[1], toB[0]);
  const toLocal = (p) => {
    const v = [p[0] - M.pallet.c[0], p[1] - M.pallet.c[1]];
    return [v[0] * Math.cos(-ang) - v[1] * Math.sin(-ang), v[0] * Math.sin(-ang) + v[1] * Math.cos(-ang)];
  };
  const eAng = Math.atan2(M.pallet.c[1] - M.escape.c[1], M.pallet.c[0] - M.escape.c[0]);
  const s1 = toLocal(pol(M.escape.c, M.escape.r, eAng - 30 * D)), s2 = toLocal(pol(M.escape.c, M.escape.r, eAng + 30 * D));
  const tip = L - 11;
  const arms = [[0, 0], s1].concat([[0, 0], s2]);
  const segs = [
    { pts: [[0, 0], [s1[0] * 0.72, s1[1] * 0.72]], w: 5 },
    { pts: [[0, 0], [s2[0] * 0.72, s2[1] * 0.72]], w: 5 },
    { pts: [[0, 0], [tip, 0]], w: 3.6 },
    { pts: [[tip - 1, -4.2], [tip + 3.5, -4.6]], w: 2.4 },
    { pts: [[tip - 1, 4.2], [tip + 3.5, 4.6]], w: 2.4 },
    { pts: [[tip - 2, -4.4], [tip - 2, 4.4]], w: 2.4 },
  ];
  const stone = (s) => {
    const a = Math.atan2(s[1], s[0]) * (180 / Math.PI);
    return `<rect class="stone" x="${f(-2.2)}" y="${f(-1.4)}" width="6.4" height="2.8" rx="0.6" transform="translate(${P([s[0] * 0.8, s[1] * 0.8])}) rotate(${f(a)})"/>`;
  };
  void arms;
  const deg = ang * (180 / Math.PI);
  return `<g transform="rotate(${f(deg)})">${bridge('fork-body', segs)}${stone(s1)}${stone(s2)}<circle class="fork-pin fo" cx="${f(tip - 6)}" cy="0" r="1"/></g>`;
}

function balanceWheel() {
  const { r } = M.balance;
  let s = `<path class="fo" fill-rule="evenodd" d="${circ(O, r)} ${circ(O, r - 4.6)}"/>`;
  s += bridge('arms', [90, 210, 330].map((a) => ({ pts: [pol(O, 3, a * D), pol(O, r - 3, a * D)], w: 3.4 })));
  s += [0, 90, 180, 270].map((a) => `<circle class="fo" cx="${f(pol(O, r - 2.3, (a + 45) * D)[0])}" cy="${f(pol(O, r - 2.3, (a + 45) * D)[1])}" r="2.6"/>`).join('');
  s += `<circle class="roller fo" r="7.5"/><circle class="hub fo" r="3.6"/>`;
  const pinAng = Math.atan2(M.pallet.c[1] - M.balance.c[1], M.pallet.c[0] - M.balance.c[0]);
  const pin = pol(O, 6, pinAng);
  s += `<circle class="impulse" cx="${f(pin[0])}" cy="${f(pin[1])}" r="1.3"/>`;
  return s;
}

function barrelCutaway() {
  const c = M.barrel.c;
  return `<g class="part p-barrel-inside s1 s2 s3" data-part="barrel">
    <circle class="drum fo" cx="${f(c[0])}" cy="${f(c[1])}" r="63"/>
  </g>
  <g class="part p-spring s1 s2" data-part="mainspring"><path class="spring-o" d="${springPath(0.62)}"/><path class="spring-f" d="${springPath(0.62)}"/></g>
  <g class="part p-arbor s2" data-part="arbor">${at(c, `<circle class="fo" r="13"/><path class="fo" d="M10 -5 L16.5 -2 L10 2 Z"/><circle class="hub fo" r="4"/>`, 'rot rot-arbor')}</g>`;
}

const ids = { n: 0 };

/**
 * mode 'hero': assembled movement with callouts.
 * mode 'chapter': same movement, barrel opened, bridge and ratchet in lift groups for the explode.
 */
export function movementSvg({ mode, viewBox, label, callouts = [] }) {
  const id = `mv${++ids.n}`;
  const ch = mode === 'chapter';
  const b = M.barrel, c = M.centre, t = M.third, fo = M.fourth, e = M.escape, pa = M.pallet, ba = M.balance;
  const lift = (amt, inner, extra = '') => (ch ? `<g class="lift ${extra}" style="--lift:${amt}">${inner}</g>` : inner);

  const plate = `<g class="part p-plate" data-part="plate"><circle class="fo" r="${M.plate.R}"/><circle class="plate-ring" r="${M.plate.R - 7}"/>
    ${[[-150, 60], [150, 40], [-60, 165]].map((q) => `<circle class="hole" cx="${q[0]}" cy="${q[1]}" r="3.2"/>`).join('')}</g>`;

  const stemY = M.stemY;
  const crown = `<g class="part p-crown s2" data-part="crown">
    <rect class="fo" x="-196" y="${f(stemY - 3)}" width="60" height="6" rx="2"/>
    <rect class="fo" x="-238" y="${f(stemY - 22)}" width="40" height="44" rx="6"/>
    ${Array.from({ length: 9 }, (_, i) => `<path class="flute" d="M-238 ${f(stemY - 18 + i * 4.5)} h40"/>`).join('')}
    <rect class="fo" x="-200" y="${f(stemY - 9)}" width="6" height="18" rx="1.5"/></g>`;

  const barrelGear = `<g class="part p-barrel s1 s3" data-part="barrel">${at(b.c, `<path class="fo" d="${gearOutline(b.N, b.r)}"/>${ch ? '' : `<circle class="lid fo" r="62"/>`}`, 'rot rot-barrel')}</g>`;

  const centreW = `<g class="part p-centre s3" data-part="centre">${at(c.c, wheel(c.N, c.r, 4, { hub: 9, rim: 4, pinion: c.pinion }), 'rot rot-centre')}</g>`;
  const thirdW = `<g class="part p-third" data-part="third">${at(t.c, wheel(t.N, t.r, 4, { hub: 7, rim: 3.5, pinion: t.pinion }), 'rot rot-third')}</g>`;
  const fourthW = `<g class="part p-fourth" data-part="fourth">${at(fo.c, wheel(fo.N, fo.r, 4, { hub: 6, rim: 3, pinion: fo.pinion }), 'rot rot-fourth')}</g>`;
  const escapeW = `<g class="part p-escape" data-part="escape">${at(e.c, `<path class="fo" fill-rule="evenodd" d="${escapeOutline()} ${crossings(5, e.r * 0.66 - 2.6, 4.6, 1.6, 10)}"/><path class="pin fo" d="${gearOutline(7, 3.6, { add: 1.1, ded: 1.4, tipW: 0.22 })}"/><circle class="hub fo" r="1.8"/>`, 'rot rot-escape')}</g>`;
  const fork = `<g class="part p-pallet" data-part="pallet">${at(pa.c, palletFork(), 'rot rot-pallet')}</g>`;
  const bal = `<g class="part p-balance" data-part="balance">${at(ba.c, balanceWheel(), 'rot rot-balance')}<path class="hair" d="${hairspring()}"/></g>`;

  // Bridges
  const bFeet = [[-152, -62], [-8, -112]];
  const barrelBridge = `<g class="part p-bridge bridge-barrel">${hull([[b.c, 40], [M.crownWheel.c, 21], [bFeet[0], 12]], 'bridge-shape')}${bridge('bridge-arm', [{ pts: [b.c, bFeet[1]], w: 20 }], [[bFeet[1], 11]])}</g>`;
  const tFeet = [[-72, 60], [128, -54]];
  const trainBridge = bridge('part p-bridge bridge-train', [
    { pts: [tFeet[1], t.c, fo.c, e.c], w: 16 },
    { pts: [tFeet[0], c.c], w: 15 },
  ], [[c.c, 10.5], [t.c, 11], [fo.c, 11], [e.c, 10], [tFeet[0], 10]]);
  const pFoot = [64, 150];
  const palletCock = bridge('part p-bridge bridge-pallet', [{ pts: [pa.c, pFoot], w: 11 }], [[pa.c, 8], [pFoot, 8]]);
  const cockFoot = [-98, 146];
  const balanceCock = `<g class="part p-bridge bridge-balance">${hull([[ba.c, 13], [cockFoot, 19]], 'bridge-shape')}</g>`;
  const regulator = `<g class="part p-bridge"><path class="reg-o" d="M${P(ba.c)} L${P(pol(ba.c, 30, -62 * D))}"/><path class="reg-f" d="M${P(ba.c)} L${P(pol(ba.c, 30, -62 * D))}"/></g>`;

  const jewels = [c.c, t.c, fo.c, e.c, pa.c].map((p) => jewel(p, 2.8)).join('') + `<g class="shock">${jewel(ba.c, 3.4)}<path class="lyre" d="M${P([ba.c[0] - 7, ba.c[1] - 3])} Q${P([ba.c[0], ba.c[1] - 12])} ${P([ba.c[0] + 7, ba.c[1] - 3])}"/></g>`;
  const screws = [...bFeet, ...tFeet, pFoot, cockFoot].map((p, i) => screw(p, 5.2, 20 + i * 37)).join('');

  const ratchet = `<g class="part p-ratchet s2" data-part="ratchet">${at(b.c, `<path class="fo" d="${ratchetOutline()}"/><circle class="ring" r="22"/>`, 'rot rot-ratchet')}${screw(b.c, 9, 60)}</g>`;
  const cw = M.crownWheel;
  const crownWheel = `<g class="part p-crownwheel s2" data-part="crownwheel">${at(cw.c, `<path class="fo" d="${gearOutline(cw.N, cw.r, { tipW: 0.22 })}"/>`, 'rot rot-crownwheel')}${screw(cw.c, 5.4, 110)}</g>`;
  const clickPivot = pol(b.c, 50, -14 * D), clickTip = pol(b.c, M.ratchet.r - 1.2, -44 * D);
  const click = `<g class="part p-click s2" data-part="click">${bridge('click-body', [{ pts: [clickPivot, pol(b.c, 42, -32 * D), clickTip], w: 5 }])}
    <path class="clickspring" d="M${P(clickPivot)} Q${P(pol(b.c, 62, -30 * D))} ${P(pol(b.c, 60, -48 * D))}"/>${screw(clickPivot, 3.6, 0)}</g>`;

  // Layers, bottom to top.
  const lowerTrain = centreW + thirdW + fourthW + escapeW + fork + bal;
  const bridgesTop = trainBridge + palletCock + balanceCock + regulator;
  let body;
  if (ch) {
    body = plate + crown + lowerTrain + barrelGear + barrelCutaway() + bridgesTop + jewels +
      `<g class="axes">${axis(b.c, 160)}${axis(cw.c, 140)}</g>` +
      lift(110, barrelBridge + bFeet.map((p, i) => screw(p, 5.2, 20 + i * 37)).join(''), 'lift-bridge') +
      lift(160, ratchet, 'lift-ratchet') + lift(140, crownWheel, 'lift-crownwheel') + lift(110, click, 'lift-click') +
      [...tFeet, pFoot, cockFoot].map((p, i) => screw(p, 5.2, 60 + i * 37)).join('');
  } else {
    body = plate + crown + barrelGear + lowerTrain + barrelBridge + bridgesTop + jewels + screws + ratchet + crownWheel + click;
  }

  const co = callouts.map((k) => callout(k)).join('');
  return `<svg class="movement diagram mode-${mode}" id="${id}" viewBox="${viewBox}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" ${ch ? 'style="--e:0.55"' : ''}>
<g class="mv">${body}</g>${co}</svg>`;
}

// Assembly axis: a dashed line along the lift direction, drawn to the full lift.
function axis(c, amt) {
  const end = [c[0] + amt * 0.5, c[1] - amt * 0.866];
  return `<path class="axis" d="M${P(c)} L${P(end)}" style="--lift:${amt}"/>`;
}

const CALL = {
  barrel: { at: () => pol(M.barrel.c, 69, 232 * D), end: [-122, -166], text: 'Barrel', anchor: 'end', tx: -128, ty: -166 },
  balance: { at: () => pol(M.balance.c, 40, 150 * D), end: [-104, 192], text: 'Balance', anchor: 'end', tx: -110, ty: 202 },
  escape: { at: () => pol(M.escape.c, 21, 62 * D), end: [110, 190], text: 'Escape wheel', anchor: 'start', tx: 116, ty: 200 },
  train: { at: () => pol(M.third.c, 44, -50 * D), end: [128, -166], text: 'Wheel train', anchor: 'start', tx: 134, ty: -164 },
};
function callout(k) {
  const c = CALL[k], a = c.at();
  return `<g class="callout"><circle class="dot" cx="${f(a[0])}" cy="${f(a[1])}" r="2.8"/><path class="leader" d="M${P(a)} L${P(c.end)}"/><text x="${c.tx}" y="${c.ty}" text-anchor="${c.anchor}">${c.text}</text></g>`;
}
