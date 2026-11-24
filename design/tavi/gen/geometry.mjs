// One part table for the sketch's SVG and the prototype's numbers.
// Units: plate radius 190. Meshing pairs sit at the sum of their pitch radii.
export const D = Math.PI / 180;
export const pol = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Train for 21,600 vph: barrel 72/12, centre 80/10, third 75/10, fourth 84/7, escape 15 teeth.
const centre = { c: [0, 0], N: 80, r: 56, pinion: { N: 12, r: 12 } };
const barrel = { N: 72, r: 72 };
barrel.c = pol(centre.c, barrel.r + centre.pinion.r, 225 * D);
const third = { N: 75, r: 46, pinion: { N: 10, r: 7 } };
third.c = pol(centre.c, centre.r + third.pinion.r, 0 * D);
const fourth = { N: 84, r: 42, pinion: { N: 10, r: (10 * (2 * 46 / 75)) / 2 } };
fourth.c = pol(third.c, third.r + fourth.pinion.r, 65 * D);
const escape = { N: 15, r: 24, pinion: { N: 7, r: 3.5 } };
escape.c = pol(fourth.c, fourth.r + escape.pinion.r, 125 * D);
const lineAngle = 150 * D; // escape -> pallet -> balance
const pallet = { c: pol(escape.c, escape.r / Math.cos(30 * D), lineAngle) };
const balance = { r: 42, c: pol(escape.c, 88, lineAngle) };

export const M = {
  plate: { R: 190 },
  centre, barrel, third, fourth, escape, pallet, balance, lineAngle,
  ratchet: { N: 36, r: 34 },
  crownWheel: { N: 24, r: 17 },
};
M.ratchet.c = barrel.c;
M.crownWheel.c = pol(barrel.c, M.ratchet.r + M.crownWheel.r, 152 * D);
M.stemY = M.crownWheel.c[1] + 4;

export function check() {
  const rows = [
    ['barrel-centre', dist(barrel.c, centre.c), barrel.r + centre.pinion.r],
    ['centre-third', dist(centre.c, third.c), centre.r + third.pinion.r],
    ['third-fourth', dist(third.c, fourth.c), third.r + fourth.pinion.r],
    ['fourth-escape', dist(fourth.c, escape.c), fourth.r + escape.pinion.r],
  ];
  const inPlate = Object.entries({ barrel, centre, third, fourth, escape, balance }).map(([k, p]) => [k, Math.hypot(...p.c) + (p.r || 0) * 1.05]);
  return { rows, inPlate, ratio: (72 / 12) * (80 / 10) * (75 / 10) * (84 / 7) };
}
