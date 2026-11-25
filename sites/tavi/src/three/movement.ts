// The 3D movement, posed by the clock. Its parts are built once per page (build.ts) into a template; each view that
// shows the movement (the hero, chapter 5) takes its own copy, sharing the geometry and the materials, so a second view
// costs neither another build nor another upload of the shapes. A pose sets every turning part from one `stateAt(t)`,
// breathes the hairspring, and lifts each part through its own window of the "apart" control, top parts first.

import { Box3, Group, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3, type Object3D } from "three";
import type { TrainId } from "../movement/calibre.ts";
import type { ClockState } from "../movement/clock.ts";
import { MOVEMENT, partOf, type Calibre, type Explode, type PartId } from "../movement/parts.ts";
import { hairspringAt } from "../movement/svg/pieces.ts";
import { buildParts } from "./build.ts";
import { BUILT, HAIR_WIDTH, jewelGeometry, JEWEL_R, screwGeometry, SCREW_R, type Site } from "./kit.ts";
import type { Vec3 } from "./camera.ts";
import type { Palette } from "./colours.ts";
import { pathPoints } from "./path.ts";
import { ribbon, setRibbon, SOLID } from "./shapes.ts";

/** A part's footprint: the circle round it in the plane and the heights it spans, assembled. */
interface Bounds {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly z0: number;
  readonly z1: number;
}

interface Template {
  readonly root: Group;
  readonly bounds: ReadonlyMap<PartId, Bounds>;
}

export interface Movement {
  readonly root: Group;
  /** Turns every part to the clock's state and lifts each by `apart` (0 assembled, 1 apart). */
  pose(state: ClockState, apart: number): void;
  /** Hides the parts named (by their table ids) and shows the rest. */
  hide(ids: readonly string[]): void;
  /** Points round every shown part at its current lift, for framing the tilted view. */
  footprint(): Vec3[];
}

const smooth = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};
const liftOf = (explode: Explode, apart: number) => explode.lift * smooth(explode.window[0], explode.window[1], apart);

/** The footprint of everything in `group`, from its vertices (every third, as the prototype samples them). */
function boundsOf(group: Object3D): Bounds | null {
  const box = new Box3().setFromObject(group);
  if (box.isEmpty()) return null;
  const cx = (box.min.x + box.max.x) / 2;
  const cy = (box.min.y + box.max.y) / 2;
  const v = new Vector3();
  let r = 0;
  group.traverse((o) => {
    if (!(o instanceof Mesh) || o.geometry.getAttribute("position").itemSize !== 3) return;
    const pos = o.geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i += 3) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      r = Math.max(r, Math.hypot(v.x - cx, v.y - cy));
    }
  });
  return { cx, cy, r, z0: box.min.z, z1: box.max.z };
}

let template: Template | null = null;

function buildTemplate(palette: Palette, m: Calibre): Template {
  const root = new Group();
  const { screws, jewels } = buildParts(root, m, palette);
  const hairGroup = root.getObjectByName("hairspring");
  const [rest = []] = pathPoints(hairspringAt(0, m));
  if (hairGroup) {
    const hair = ribbon(hairGroup, rest.length, HAIR_WIDTH, partOf(m, "hairspring").z, palette.hair.fill);
    hair.mesh.name = "hair-ribbon";
    hair.set(rest);
  }
  const instanced = (name: string, geo: ReturnType<typeof screwGeometry>, sites: readonly Site[]) => {
    const mesh = new InstancedMesh(geo, SOLID, sites.length);
    mesh.name = name;
    mesh.userData["sites"] = sites;
    mesh.frustumCulled = false;
    root.add(mesh);
  };
  instanced("screws", screwGeometry(SCREW_R, palette), screws);
  instanced("jewels", jewelGeometry(JEWEL_R, palette), jewels);
  root.updateMatrixWorld(true);
  const bounds = new Map<PartId, Bounds>();
  for (const id of BUILT) {
    const group = root.getObjectByName(id);
    const b = group ? boundsOf(group) : null;
    if (b) bounds.set(id, b);
  }
  return { root, bounds };
}

/** What turns a pivot: a wheel of the train, the pallet fork or the balance. */
type Turn = TrainId | "pallet" | "balance";

function angleOf(turn: Turn, state: ClockState): number {
  if (turn === "pallet") return state.fork;
  if (turn === "balance") return state.balance;
  return state.train[turn];
}

/** A view's own copy of the movement, built from the page's one template. */
export function createMovement(palette: Palette, m: Calibre = MOVEMENT): Movement {
  template ??= buildTemplate(palette, m);
  const { bounds } = template;
  const root = template.root.clone(true);
  const parts = BUILT.flatMap((id) => {
    const group = root.getObjectByName(id);
    return group ? [{ id, group, explode: partOf(m, id).explode }] : [];
  });
  const explodeOf = new Map(parts.map((p) => [p.id, p.explode]));
  const pivots: [Turn, Object3D][] = [];
  root.traverse((o) => {
    const turn = o.userData["turn"] as Turn | undefined;
    if (turn) pivots.push([turn, o]);
  });
  const hair = root.getObjectByName("hair-ribbon");
  if (hair instanceof Mesh) hair.geometry = hair.geometry.clone();
  const hairZ = partOf(m, "hairspring").z;
  const sets = ["screws", "jewels"].flatMap((name) => {
    const mesh = root.getObjectByName(name);
    return mesh instanceof InstancedMesh
      ? [{ mesh, sites: mesh.userData["sites"] as readonly Site[], base: name === "screws" ? SCREW_R : JEWEL_R }]
      : [];
  });

  const hidden = new Set<string>();
  let placed = NaN;
  const matrix = new Matrix4();
  const at = new Vector3();
  const turn = new Quaternion();
  const size = new Vector3();
  const zAxis = new Vector3(0, 0, 1);
  const place = (apart: number) => {
    for (const { group, explode } of parts) group.position.z = liftOf(explode, apart);
    for (const { mesh, sites, base } of sets) {
      sites.forEach((site, i) => {
        const explode = explodeOf.get(site.part);
        const f = explode ? smooth(explode.window[0], explode.window[1], apart) : 0;
        at.set(site.at[0], -site.at[1], site.z + (explode ? explode.lift * f : 0));
        turn.setFromAxisAngle(zAxis, -((site.slot * Math.PI) / 180 + 2 * Math.PI * (explode?.spin ?? 0) * f));
        const k = hidden.has(site.part) ? 0 : site.r / base;
        matrix.compose(at, turn, size.set(k, k, k));
        mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    placed = apart;
  };

  return {
    root,
    pose(state, apart) {
      for (const [name, pivot] of pivots) pivot.rotation.z = -angleOf(name, state);
      if (hair instanceof Mesh) {
        const [pts] = pathPoints(hairspringAt(state.balance, m));
        if (pts) setRibbon(hair, pts, HAIR_WIDTH, hairZ);
      }
      if (apart !== placed) place(apart);
    },
    hide(ids) {
      hidden.clear();
      for (const id of ids) hidden.add(id);
      for (const { id, group } of parts) group.visible = !hidden.has(id);
      place(Number.isNaN(placed) ? 0 : placed);
    },
    footprint() {
      const pts: Vec3[] = [];
      for (const { id, group } of parts) {
        const b = bounds.get(id);
        if (!b || !group.visible) continue;
        for (const zz of [b.z0, b.z1]) {
          for (let i = 0; i < 12; i++) {
            const a = (i * Math.PI) / 6;
            pts.push([b.cx + b.r * Math.cos(a), b.cy + b.r * Math.sin(a), zz + group.position.z]);
          }
        }
      }
      return pts;
    },
  };
}
