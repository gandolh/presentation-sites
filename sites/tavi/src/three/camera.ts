// Where the 3D movement's camera stands, as pure arithmetic, so a test can check it without a browser. World units are
// the drawing's plane with y flipped (x right, y up, z out of the plate towards the back of the watch). Two frames:
// - flat: straight down the movement's axis, framing exactly the poster's viewBox in the same box, the way an SVG fits
//   its viewBox (`xMidYMid meet`). The field of view is so narrow that every layer prints at the poster's scale;
// - tilted: the prototype's view, a field of view of 22 degrees at a tilt of 34, backed off until every part fits. As
//   the movement comes apart the tilt grows to 68, so the lifted layers stand clear of each other, and the fit can
//   keep a share of the width free for the labels' columns.
// The first drag eases from one to the other; `cameraAt` blends them, field of view, tilt and framing together.

/** A point or a direction in world units. */
export type Vec3 = readonly [number, number, number];

export interface ViewBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** What the camera looks at, and the half-height of the view at that point, in plane units. */
export interface Frame {
  readonly target: Vec3;
  readonly half: number;
}

export interface CameraPose {
  readonly position: Vec3;
  readonly target: Vec3;
  /** The screen's up, in world units. */
  readonly up: Vec3;
  /** The vertical field of view, in degrees. */
  readonly fov: number;
  /** The half-height of the view at the target, in plane units: the box's height shows twice this. */
  readonly half: number;
  readonly near: number;
  readonly far: number;
}

const DEG = Math.PI / 180;

/** The flat view's field of view, in degrees: narrow enough that the depth of the movement changes no scale. */
export const FLAT_FOV = 0.5;
/** The tilted view's field of view and tilt from straight down, in degrees: the prototype's. */
export const TILT_FOV = 22;
export const TILT = 34;
/** How much more the view tilts with the movement fully apart, in degrees: the prototype's. */
export const APART_TILT = 34;
/** The yaw the tilted view opens at, in degrees: the prototype's. A turn of 0 is this view. */
export const OPEN_YAW = -18;

/** A turn in degrees, wrapped into (-180, 180]. */
export function wrapTurn(deg: number): number {
  const w = ((((deg + 180) % 360) + 360) % 360) - 180;
  return w === -180 ? 180 : w;
}

/** The yaw, in radians, of a turn in degrees from the opening view: a drag to the right turns it up. */
export function yawOf(turn: number): number {
  return (OPEN_YAW - turn) * DEG;
}
/** The share of the tilted view the fitted movement may fill, as the prototype leaves it. */
const FIT_MARGIN = 0.94;
/** How far beyond the target the scene can reach, in plane units: the near and far planes keep that much. */
const DEPTH = 900;

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const times = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const unit = (a: Vec3): Vec3 => times(a, 1 / Math.hypot(...a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: Vec3, b: Vec3, k: number): Vec3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

/** A viewBox attribute's four numbers. */
export function parseViewBox(text: string): ViewBox {
  const [x = 0, y = 0, w = 1, h = 1] = text
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  return { x, y, w, h };
}

/** The flat frame: the viewBox fitted into a `width` by `height` box as SVG fits it, at the plane's height `z`. */
export function flatFrame(vb: ViewBox, width: number, height: number, z: number): Frame {
  const scale = Math.min(width / vb.w, height / vb.h);
  return { target: [vb.x + vb.w / 2, -(vb.y + vb.h / 2), z], half: height / scale / 2 };
}

/** The camera's direction from its target, for a tilt from straight down and a yaw about the axis (radians). */
export function viewDirection(tilt: number, yaw: number): Vec3 {
  return [Math.sin(tilt) * Math.sin(yaw), -Math.sin(tilt) * Math.cos(yaw), Math.cos(tilt)];
}

/** The screen's right and up for a view direction and its yaw. */
function screenAxes(dir: Vec3, yaw: number): { right: Vec3; up: Vec3 } {
  const right: Vec3 = [Math.cos(yaw), Math.sin(yaw), 0];
  return { right, up: unit(cross(dir, right)) };
}

/** The tilted view's tilt from straight down at `apart` (0 assembled, 1 apart), in degrees. */
export function tiltFor(apart: number): number {
  const u = Math.min(1, Math.max(0, apart));
  return TILT + APART_TILT * u * u * (3 - 2 * u);
}

/**
 * The frame that fits every point, seen along `dir` with a vertical field of view `fov` (degrees) in a box of
 * `aspect` (width over height): centred on the points' extent across the screen, backed off until the nearest of them
 * fits. The prototype's framing. `room` is the share of the width kept free for labels: half of it each side, or all
 * of it on the right.
 */
export function fitFrame(
  points: readonly Vec3[],
  tilt: number,
  yaw: number,
  fov: number,
  aspect: number,
  room = 0,
  side: "both" | "right" = "both",
): Frame {
  const dir = viewDirection(tilt, yaw);
  const { right, up } = screenAxes(dir, yaw);
  const tanV = Math.tan((fov * DEG) / 2) * FIT_MARGIN;
  const tanH = tanV * aspect * (1 - room);
  let r0 = Infinity;
  let r1 = -Infinity;
  let u0 = Infinity;
  let u1 = -Infinity;
  for (const p of points) {
    r0 = Math.min(r0, dot(p, right));
    r1 = Math.max(r1, dot(p, right));
    u0 = Math.min(u0, dot(p, up));
    u1 = Math.max(u1, dot(p, up));
  }
  const target = add(times(right, (r0 + r1) / 2), times(up, (u0 + u1) / 2));
  let d = 0;
  for (const p of points) {
    const v = sub(p, target);
    const depth = dot(v, dir);
    d = Math.max(d, Math.abs(dot(v, right)) / tanH + depth, Math.abs(dot(v, up)) / tanV + depth);
  }
  // With the room on the right only, the view looks that much right of the points, so they sit to its left.
  const shifted = side === "right" ? add(target, times(right, room * d * tanV * aspect)) : target;
  return { target: shifted, half: d * Math.tan((fov * DEG) / 2) };
}

/** A frame `k` of the way from `a` to `b`: the target and the size of the view each move by `k`. */
export function mixFrame(a: Frame, b: Frame, k: number): Frame {
  return { target: mix3(a.target, b.target, k), half: mix(a.half, b.half, k) };
}

/**
 * The camera `k` of the way from the flat frame (0) to the tilted one (1), which looks down at `tiltDeg`: the tilt, the
 * field of view, the target and the size of the view at the target each move by `k`, and the distance follows from
 * the last two.
 */
export function cameraAt(flat: Frame, tilted: Frame, k: number, yaw: number, tiltDeg = TILT): CameraPose {
  const tilt = tiltDeg * DEG * k;
  const turn = yaw * k;
  const fov = mix(FLAT_FOV, TILT_FOV, k);
  const half = mix(flat.half, tilted.half, k);
  const target = mix3(flat.target, tilted.target, k);
  const dir = viewDirection(tilt, turn);
  const distance = half / Math.tan((fov * DEG) / 2);
  return {
    position: add(target, times(dir, distance)),
    target,
    up: screenAxes(dir, turn).up,
    fov,
    half,
    near: Math.max(1, distance - DEPTH),
    far: distance + DEPTH,
  };
}

/** Where a world point lands in a `width` by `height` box, in pixels from its top left corner. */
export function project(p: Vec3, camera: CameraPose, width: number, height: number): readonly [number, number] {
  const back = unit(sub(camera.position, camera.target));
  const right = unit(cross(camera.up, back));
  const up = cross(back, right);
  const v = sub(p, camera.position);
  const depth = -dot(v, back);
  const tan = Math.tan((camera.fov * DEG) / 2);
  const x = dot(v, right) / (depth * tan * (width / height));
  const y = dot(v, up) / (depth * tan);
  return [((x + 1) / 2) * width, ((1 - y) / 2) * height];
}

/**
 * The site's ease-out, `cubic-bezier(0.16, 1, 0.3, 1)` (the `--ease-out` token), at `u` from 0 to 1: the curve's x
 * solved for `u` by Newton's method, then its y.
 */
export function easeOut(u: number): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const [x1, y1, x2, y2] = [0.16, 1, 0.3, 1];
  const at = (s: number, a: number, b: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const slope = (s: number, a: number, b: number) =>
    3 * a * (1 - s) ** 2 + 6 * (b - a) * s * (1 - s) + 3 * (1 - b) * s * s;
  let s = u;
  for (let i = 0; i < 8; i++) {
    const d = slope(s, x1, x2);
    if (Math.abs(d) < 1e-6) break;
    s = Math.min(1, Math.max(0, s - (at(s, x1, x2) - u) / d));
  }
  return at(s, y1, y2);
}
