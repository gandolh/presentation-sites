// The hero scene: the same marquee as the exploded plate, in WebGL, built
// entirely from Three.js primitives — no downloaded model, no image texture.
//
// The one authored moment is an ASSEMBLY: the layers start separated in the
// vertical, exactly as the plate draws them, and settle into the finished
// structure. That is literally the service — we bring it and we mount it.
//
// Panels are built from explicit corner points rather than rotated planes: a
// roof slope is a quad between four known vertices, and saying so directly is
// both exact and immune to Euler-order surprises. Fills are flat (MeshBasic,
// shaded in JS by the same `tone()` the SVG plate uses), so the 3D hero and the
// drawing below it are recognisably the same object rendered twice.

import * as THREE from "three";
import { DEFAULT_MARQUEE, tone, type MarqueeSpec, type P3 } from "../../lib/draft";

export interface TentSceneState {
  /** 1 → 0: how far apart the layers sit. 1 is fully exploded. */
  explode: number;
  /** 0 → 1: structural members grow along their length. */
  frame: number;
  /** Footprint interpolation across the four formats, 0 → 1. */
  size: number;
  /** Slow idle orbit, radians. */
  spin: number;
}

export interface TentScene {
  state: TentSceneState;
  apply: () => void;
  render: () => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
}

const INK = 0x22303a;
const LINE = 0x5e7180;
const SIGNAL = 0xc2481e;

/** The four real formats, span × length in metres. */
const FORMATS: Array<[number, number]> = [[8, 8], [15, 10], [20, 10], [20, 15]];

function footprint(t: number) {
  const x = Math.min(0.9999, Math.max(0, t)) * (FORMATS.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = FORMATS[i];
  const b = FORMATS[Math.min(FORMATS.length - 1, i + 1)];
  return { w: a[0] + (b[0] - a[0]) * f, d: a[1] + (b[1] - a[1]) * f };
}

/** A flat polygon whose vertices are rewritten every frame, plus its outline. */
class Facet {
  mesh: THREE.Mesh;
  outline: THREE.LineSegments;
  private pos: THREE.BufferAttribute;
  private edgePos: THREE.BufferAttribute;
  private mat: THREE.MeshBasicMaterial;

  constructor(n: number, parent: THREE.Object3D, edgeColor = LINE) {
    const geo = new THREE.BufferGeometry();
    this.pos = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    geo.setAttribute("position", this.pos);
    const idx: number[] = [];
    for (let i = 1; i < n - 1; i++) idx.push(0, i, i + 1); // triangle fan
    geo.setIndex(idx);
    this.mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    parent.add(this.mesh);

    const egeo = new THREE.BufferGeometry();
    this.edgePos = new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3);
    egeo.setAttribute("position", this.edgePos);
    this.outline = new THREE.LineSegments(egeo, new THREE.LineBasicMaterial({ color: edgeColor }));
    parent.add(this.outline);
  }

  set(points: P3[], color: string) {
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      this.pos.setXYZ(i, a[0], a[1], a[2]);
      this.edgePos.setXYZ(i * 2, a[0], a[1], a[2]);
      this.edgePos.setXYZ(i * 2 + 1, b[0], b[1], b[2]);
    }
    this.pos.needsUpdate = true;
    this.edgePos.needsUpdate = true;
    this.mesh.geometry.computeBoundingSphere();
    this.outline.geometry.computeBoundingSphere();
    this.mat.color.set(color);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.outline.geometry.dispose();
    this.mat.dispose();
    (this.outline.material as THREE.Material).dispose();
  }
}

export function createTentScene(
  canvasEl: HTMLCanvasElement,
  dpr: number,
  spec: MarqueeSpec = DEFAULT_MARQUEE,
): TentScene {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasEl, antialias: true, alpha: true, powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(dpr, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);

  const root = new THREE.Group();
  scene.add(root);

  // Layer groups mirror the exploded plate exactly.
  const gRoof = new THREE.Group();
  const gWalls = new THREE.Group();
  const gFrame = new THREE.Group();
  const gDeck = new THREE.Group();
  root.add(gRoof, gWalls, gFrame, gDeck);

  const roofL = new Facet(4, gRoof);
  const roofR = new Facet(4, gRoof);
  const wallL = new Facet(4, gWalls);
  const wallR = new Facet(4, gWalls);
  const gableA = new Facet(5, gWalls);
  const gableB = new Facet(5, gWalls);
  const deck = new Facet(4, gDeck);

  const matFrame = new THREE.MeshBasicMaterial({ color: INK });
  const memberGeo = new THREE.BoxGeometry(1, 1, 1);
  const members: THREE.Mesh[] = [];
  for (let i = 0; i < 80; i++) {
    const m = new THREE.Mesh(memberGeo, matFrame);
    m.visible = false;
    members.push(m);
    gFrame.add(m);
  }

  // The ridge, picked out in signal orange — the one annotated line in the 3D,
  // matching the drawing's annotation layer.
  const ridgeGeo = new THREE.BufferGeometry();
  const ridgePos = new THREE.BufferAttribute(new Float32Array(6), 3);
  ridgeGeo.setAttribute("position", ridgePos);
  const ridgeLine = new THREE.Line(ridgeGeo, new THREE.LineBasicMaterial({ color: SIGNAL }));
  gRoof.add(ridgeLine);

  const state: TentSceneState = { explode: 1, frame: 0, size: 0.3, spin: 0 };

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vDir = new THREE.Vector3();
  const Z = new THREE.Vector3(0, 0, 1);

  function apply() {
    const { w, d } = footprint(state.size);
    const { eave, ridge, bay } = spec;
    const hw = w / 2, hd = d / 2;
    const n = Math.max(2, Math.round(d / bay));
    const bays: number[] = [];
    for (let i = 0; i <= n; i++) bays.push(-hd + (i * d) / n);

    const e = Math.max(0, state.explode);
    const SEP = 6.5;
    gRoof.position.y = e * SEP * 2;
    gWalls.position.y = e * SEP;
    gDeck.position.y = -e * SEP * 0.9;

    // ---- envelope, from explicit corner points ----------------------------
    const qRoofL: P3[] = [[-hw, eave, -hd], [0, ridge, -hd], [0, ridge, hd], [-hw, eave, hd]];
    const qRoofR: P3[] = [[hw, eave, -hd], [0, ridge, -hd], [0, ridge, hd], [hw, eave, hd]];
    const qWallL: P3[] = [[-hw, 0, -hd], [-hw, eave, -hd], [-hw, eave, hd], [-hw, 0, hd]];
    const qWallR: P3[] = [[hw, 0, -hd], [hw, eave, -hd], [hw, eave, hd], [hw, 0, hd]];
    const qGableA: P3[] = [[-hw, 0, -hd], [-hw, eave, -hd], [0, ridge, -hd], [hw, eave, -hd], [hw, 0, -hd]];
    const qGableB: P3[] = [[-hw, 0, hd], [-hw, eave, hd], [0, ridge, hd], [hw, eave, hd], [hw, 0, hd]];
    const qDeck: P3[] = [[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]];

    roofL.set(qRoofL, tone(qRoofL));
    roofR.set(qRoofR, tone(qRoofR));
    wallL.set(qWallL, tone(qWallL));
    wallR.set(qWallR, tone(qWallR));
    gableA.set(qGableA, tone(qGableA));
    gableB.set(qGableB, tone(qGableB));
    deck.set(qDeck, "rgb(237,239,241)");

    // a hair above the panel edge, or it z-fights with the roof outlines
    ridgePos.setXYZ(0, 0, ridge + 0.02, -hd);
    ridgePos.setXYZ(1, 0, ridge + 0.02, hd);
    ridgePos.needsUpdate = true;
    ridgeGeo.computeBoundingSphere();

    // ---- frame ------------------------------------------------------------
    let mi = 0;
    const put = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => {
      if (mi >= members.length) return;
      const mesh = members[mi++];
      vA.set(ax, ay, az);
      vB.set(bx, by, bz);
      vDir.subVectors(vB, vA);
      const len = vDir.length();
      mesh.visible = len > 0.001 && state.frame > 0.001;
      if (!mesh.visible) return;
      mesh.position.copy(vA).addScaledVector(vDir, 0.5 * state.frame);
      mesh.scale.set(0.16, 0.16, len * state.frame);
      mesh.quaternion.setFromUnitVectors(Z, vDir.normalize());
    };
    for (const z of bays) {
      put(-hw, 0, z, -hw, eave, z);
      put(hw, 0, z, hw, eave, z);
      put(-hw, eave, z, 0, ridge, z);
      put(hw, eave, z, 0, ridge, z);
    }
    for (let i = 0; i < bays.length - 1; i++) {
      const a = bays[i], b = bays[i + 1];
      const runs: Array<[number, number]> = [
        [-hw, eave], [0, ridge], [hw, eave],
        [-hw / 2, (eave + ridge) / 2], [hw / 2, (eave + ridge) / 2],
      ];
      for (const [x, y] of runs) put(x, y, a, x, y, b);
    }
    for (let k = mi; k < members.length; k++) members[k].visible = false;

    // ---- camera: frame the whole assembly, exploded or not ----------------
    root.rotation.y = -0.72 + state.spin;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const spanH = Math.hypot(w, d) * 0.5 + 1.5;
    const spanV = ridge * 0.5 + e * SEP * 1.55;
    const radius = Math.hypot(spanH, spanV) + 1.2;
    const dist = (radius / Math.sin(Math.min(vFov, hFov) / 2)) * 0.94;
    const pitchCam = 0.36;
    camera.position.set(
      Math.sin(0.3) * dist * Math.cos(pitchCam),
      ridge * 0.35 + Math.sin(pitchCam) * dist,
      Math.cos(0.3) * dist * Math.cos(pitchCam),
    );
    camera.lookAt(0, ridge * 0.4 + e * SEP * 0.3, 0);
  }

  function render() { renderer.render(scene, camera); }

  function resize(w: number, h: number) {
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  function dispose() {
    [roofL, roofR, wallL, wallR, gableA, gableB, deck].forEach((f) => f.dispose());
    memberGeo.dispose();
    matFrame.dispose();
    ridgeGeo.dispose();
    (ridgeLine.material as THREE.Material).dispose();
    renderer.dispose();
  }

  apply();
  return { state, apply, render, resize, dispose };
}
