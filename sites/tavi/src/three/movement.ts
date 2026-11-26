// The 3D movement, posed by the clock. Its parts are built once per page (build.ts) into a template; each view that
// shows the movement (the hero, chapter 5) takes its own copy, sharing the geometry and the materials, so a second view
// costs neither another build nor another upload of the shapes. A pose sets every turning part from one `stateAt(t)`,
// breathes the hairspring, and lifts each part through its own window of the "apart" control, top parts first.
//
// Lighting a part drops every other to the ghost pair, as focus by subtraction does in the drawings: each solid swaps
// to a copy of its geometry painted in the ghost pair (fills to the ghost fill, lines to the ghost line), each line and
// flat to a ghost material, and the screws and jewels move to a twin of their instanced mesh painted the same way. The
// copies are made once per page and shared, so lighting costs no upload after the first time.

import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
  type Intersection,
  type Material,
  type Object3D,
} from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import type { TrainId } from "../movement/calibre.ts";
import type { ClockState } from "../movement/clock.ts";
import { MOVEMENT, partOf, type Calibre, type PartId } from "../movement/parts.ts";
import { hairspringAt, springPath } from "../movement/svg/pieces.ts";
import { buildParts, BUILT_WIND } from "./build.ts";
import { BUILT, HAIR_WIDTH, jewelGeometry, JEWEL_R, screwGeometry, SCREW_R, type Site } from "./kit.ts";
import type { Vec3 } from "./camera.ts";
import type { Paint, Palette } from "./colours.ts";
import { liftOf, smooth } from "./labelled.ts";
import { pathPoints } from "./path.ts";
import { flatMaterial, lineMaterial, ribbon, setCurtain, setRibbon, SOLID } from "./shapes.ts";

/** How far the mainspring's wind must move, 0 to 1, before its coils are drawn again. */
const WIND_EPS = 0.002;
/** How far the arbor, and the ratchet wheel squared on it, turns from a let-down spring to a full one, in radians. */
const WIND_TURN = 4.1;

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
  readonly ghost: Ghost;
}

export interface Movement {
  readonly root: Group;
  /**
   * Turns every part to the clock's state and lifts each by `apart` (0 assembled, 1 apart). `wind` (0 let down, 1
   * fully wound) coils the mainspring to match and steps the ratchet wheel round to it a tooth at a time; left out, the
   * spring stays as it was built and the ratchet wheel where it sits.
   */
  pose(state: ClockState, apart: number, wind?: number): void;
  /** Where the winding stands: the spring's wind as drawn (0 to 1) and the teeth the ratchet wheel has turned back. */
  winding(): { readonly wind: number; readonly teeth: number };
  /** Hides the parts named (by their table ids) and shows the rest. */
  hide(ids: readonly string[]): void;
  /** Points round every shown part at its current lift, for framing the tilted view; `only` narrows it to those parts. */
  footprint(only?: readonly PartId[]): Vec3[];
  /** Keeps the parts named in colour and drops every other to the ghost pair; null puts every colour back. */
  light(ids: readonly PartId[] | null): void;
  /** The meshes a ray can hit: every shown solid, not the lines. */
  solids(): Object3D[];
  /** The part a ray's hit belongs to. */
  partHit(hit: Intersection): PartId | null;
}

/** The ghost pair's copies of the page's geometry and materials, made as they are first asked for. */
interface Ghost {
  geometry(geo: BufferGeometry): BufferGeometry;
  material(material: Material): Material;
}

const colourKey = (r: number, g: number, b: number) =>
  `${Math.round(r * 1e4)} ${Math.round(g * 1e4)} ${Math.round(b * 1e4)}`;

/** Maps every colour the palette paints with to its place in the ghost pair: fills and walls light, lines dark. */
function createGhost(palette: Palette): Ghost {
  const { ghost } = palette;
  const to = new Map<string, Color>();
  const paints = Object.entries<Paint>(palette).flatMap(([name, p]) => (name === "ghost" ? [] : [p]));
  // Lines last, so a paint whose fill is its line (the hairspring) ghosts as a line.
  for (const p of paints) to.set(colourKey(p.fill.r, p.fill.g, p.fill.b), ghost.fill);
  for (const p of paints) to.set(colourKey(p.side.r, p.side.g, p.side.b), ghost.side);
  for (const p of paints) to.set(colourKey(p.line.r, p.line.g, p.line.b), ghost.line);
  const ghostOf = (c: Color) =>
    to.get(colourKey(c.r, c.g, c.b)) ?? (c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722 > 0.25 ? ghost.fill : ghost.line);

  const geometries = new WeakMap<BufferGeometry, BufferGeometry>();
  const materials = new WeakMap<Material, Material>();
  const probe = new Color();
  return {
    geometry(geo) {
      let out = geometries.get(geo);
      if (out) return out;
      out = new BufferGeometry();
      const colours = geo.getAttribute("color");
      for (const [name, attr] of Object.entries(geo.attributes)) {
        if (name !== "color" || !(attr instanceof BufferAttribute)) {
          out.setAttribute(name, attr);
          continue;
        }
        const array = new Float32Array(attr.count * 3);
        for (let i = 0; i < attr.count; i++) {
          const g = ghostOf(probe.setRGB(colours.getX(i), colours.getY(i), colours.getZ(i)));
          array.set([g.r, g.g, g.b], i * 3);
        }
        out.setAttribute("color", new BufferAttribute(array, 3));
      }
      out.setIndex(geo.index);
      geometries.set(geo, out);
      return out;
    },
    material(material) {
      let out = materials.get(material);
      if (out) return out;
      if (material instanceof MeshBasicMaterial && !material.vertexColors) out = flatMaterial(ghostOf(material.color));
      else if ("linewidth" in material && "dashed" in material)
        out = lineMaterial(ghost.line, Number(material.userData["units"]) || undefined, Boolean(material.dashed));
      else out = material;
      materials.set(material, out);
      return out;
    },
  };
}

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
  const ghost = createGhost(palette);
  const { screws, jewels } = buildParts(root, m, palette);
  const hairGroup = root.getObjectByName("hairspring");
  const [rest = []] = pathPoints(hairspringAt(0, m));
  if (hairGroup) {
    const hair = ribbon(hairGroup, rest.length, HAIR_WIDTH, partOf(m, "hairspring").z, palette.hair.fill);
    hair.mesh.name = "hair-ribbon";
    hair.set(rest);
  }
  // Each instanced set has a twin in the ghost pair: a ghosted part's screws and jewels are drawn by the twin.
  const instanced = (name: string, geo: ReturnType<typeof screwGeometry>, sites: readonly Site[]) => {
    for (const [suffix, g] of [
      ["", geo],
      ["-ghost", ghost.geometry(geo)],
    ] as const) {
      const mesh = new InstancedMesh(g, SOLID, sites.length);
      mesh.name = name + suffix;
      mesh.userData["sites"] = sites;
      mesh.frustumCulled = false;
      root.add(mesh);
    }
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
  return { root, bounds, ghost };
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
  const { bounds, ghost } = template;
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
  // The mainspring and the ratchet wheel, wound by `pose`'s third argument.
  const spring = root.getObjectByName("mainspring");
  const springZ = [partOf(m, "mainspring").z, partOf(m, "lid").z - 0.5] as const;
  const ratchets: Object3D[] = [];
  root.traverse((o) => {
    if (o.userData["wind"]) ratchets.push(o);
  });
  let wound = BUILT_WIND;
  let stepped = 0;
  const sets = ["screws", "jewels", "screws-ghost", "jewels-ghost"].flatMap((name) => {
    const mesh = root.getObjectByName(name);
    return mesh instanceof InstancedMesh
      ? [
          {
            mesh,
            sites: mesh.userData["sites"] as readonly Site[],
            base: name.startsWith("screws") ? SCREW_R : JEWEL_R,
            ghost: name.endsWith("-ghost"),
          },
        ]
      : [];
  });

  // What each part swaps to in the ghost pair and back: its solids' geometry, its lines' and flats' materials.
  const owner = new Map<Object3D, PartId>();
  const swaps = new Map<PartId, ((ghosted: boolean) => void)[]>();
  for (const { id, group } of parts) {
    const list: ((ghosted: boolean) => void)[] = [];
    group.traverse((o) => {
      owner.set(o, id);
      if (o instanceof LineSegments2 || (o instanceof Mesh && o.material !== SOLID)) {
        const mesh = o as Mesh;
        const normal = mesh.material as Material;
        list.push((ghosted) => {
          mesh.material = ghosted ? ghost.material(normal) : normal;
        });
      } else if (o instanceof Mesh) {
        const normal = o.geometry;
        list.push((ghosted) => {
          o.geometry = ghosted ? ghost.geometry(normal) : normal;
        });
      }
    });
    swaps.set(id, list);
  }

  const hidden = new Set<string>();
  let lit: Set<PartId> | null = null;
  let solids: Object3D[] | null = null;
  const ghosted = (id: PartId) => lit !== null && !lit.has(id);
  let placed = NaN;
  const matrix = new Matrix4();
  const at = new Vector3();
  const turn = new Quaternion();
  const size = new Vector3();
  const zAxis = new Vector3(0, 0, 1);
  const place = (apart: number) => {
    for (const { group, explode } of parts) group.position.z = liftOf(explode, apart);
    for (const { mesh, sites, base, ghost: twin } of sets) {
      sites.forEach((site, i) => {
        const explode = explodeOf.get(site.part);
        const f = explode ? smooth(explode.window[0], explode.window[1], apart) : 0;
        at.set(site.at[0], -site.at[1], site.z + (explode ? explode.lift * f : 0));
        turn.setFromAxisAngle(zAxis, -((site.slot * Math.PI) / 180 + 2 * Math.PI * (explode?.spin ?? 0) * f));
        const k = hidden.has(site.part) || ghosted(site.part) !== twin ? 0 : site.r / base;
        matrix.compose(at, turn, size.set(k, k, k));
        mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      // The bounds a ray tests first follow the instances: worked out again when a ray next asks.
      mesh.boundingSphere = null;
      mesh.boundingBox = null;
    }
    placed = apart;
  };

  return {
    root,
    pose(state, apart, wind) {
      for (const [name, pivot] of pivots) pivot.rotation.z = -angleOf(name, state);
      if (wind !== undefined) {
        // The coils are drawn again once the spring has moved a visible amount, however it got there.
        if (spring && Math.abs(wind - wound) >= WIND_EPS) {
          const [pts] = pathPoints(springPath(wind, m.barrel.at));
          if (pts) setCurtain(spring, pts, ...springZ);
          wound = wind;
        }
        // The arbor turns 4.1 radians between let down and fully wound (chapter 1's drawing); the ratchet wheel keeps to
        // whole teeth, and stands where the full spring leaves it.
        const tooth = (2 * Math.PI) / m.ratchet.teeth;
        const turned = Math.floor((wind * WIND_TURN) / tooth + 1e-9) - Math.floor(WIND_TURN / tooth + 1e-9);
        if (turned !== stepped) {
          stepped = turned;
          for (const r of ratchets) r.rotation.z = -turned * tooth;
        }
      }
      if (hair instanceof Mesh) {
        const [pts] = pathPoints(hairspringAt(state.balance, m));
        if (pts) setRibbon(hair, pts, HAIR_WIDTH, hairZ);
      }
      if (apart !== placed) place(apart);
    },
    winding: () => ({ wind: wound, teeth: stepped }),
    hide(ids) {
      solids = null;
      hidden.clear();
      for (const id of ids) hidden.add(id);
      for (const { id, group } of parts) group.visible = !hidden.has(id);
      place(Number.isNaN(placed) ? 0 : placed);
    },
    footprint(only) {
      const pts: Vec3[] = [];
      for (const { id, group } of parts) {
        const b = bounds.get(id);
        if (!b || !group.visible || (only && !only.includes(id))) continue;
        for (const zz of [b.z0, b.z1]) {
          for (let i = 0; i < 12; i++) {
            const a = (i * Math.PI) / 6;
            pts.push([b.cx + b.r * Math.cos(a), b.cy + b.r * Math.sin(a), zz + group.position.z]);
          }
        }
      }
      return pts;
    },
    light(ids) {
      const next = ids === null ? null : new Set(ids);
      for (const { id } of parts) {
        const was = ghosted(id);
        const now = next !== null && !next.has(id);
        if (was !== now) for (const swap of swaps.get(id) ?? []) swap(now);
      }
      lit = next;
      place(Number.isNaN(placed) ? 0 : placed);
    },
    solids() {
      if (solids) return solids;
      const out: Object3D[] = [];
      for (const { group } of parts) {
        if (!group.visible) continue;
        group.traverse((o) => {
          if (o instanceof Mesh && !(o instanceof LineSegments2)) out.push(o);
        });
      }
      for (const { mesh } of sets) out.push(mesh);
      solids = out;
      return out;
    },
    partHit(hit) {
      const sites = hit.object.userData["sites"] as readonly Site[] | undefined;
      if (sites && hit.instanceId !== undefined) return sites[hit.instanceId]?.part ?? null;
      return owner.get(hit.object) ?? null;
    },
  };
}
