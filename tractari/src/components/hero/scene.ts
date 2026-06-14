// Hero 3D scene: a flatbed tow truck (empty platform) driving down a winding
// night road, seen from a chase camera behind it. The road curves left and
// right; the truck steers to follow it and banks slightly into the turns. Built
// from Three.js primitives — no external model, no textures — but detailed and
// lit enough to read as a real vehicle. Continuous loop; no scroll input.
//
// Returns an imperative handle the React island drives with render(t).

import * as THREE from "three";

export type Scene = {
  render: (t: number, dt?: number) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
  renderer: THREE.WebGLRenderer;
};

const AMBER = 0xf5a623;
const ORANGE = 0xff6b2b;
const HEADLIGHT = 0xdfeeff;

// The road centre-line as a function of distance z: a gentle compound sine so
// the road snakes left and right. Amplitude kept modest so the truck always
// stays well within the (wide) asphalt as the lane weaves. Truck, camera, and
// road furniture all sample this same function.
function roadX(z: number): number {
  return Math.sin(z * 0.045) * 2.1 + Math.sin(z * 0.017 + 1.3) * 1.2;
}

export function createScene(canvas: HTMLCanvasElement, dpr: number): Scene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  // Lighter, thinner fog so the truck + nearby road stay legible; the far road
  // still fades for depth.
  scene.fog = new THREE.FogExp2(0x14171f, 0.011);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);

  // ---- Lighting -----------------------------------------------------------
  // Night, but a readable night: brighter sky fill + a cool key (moon) + a warm
  // rim from behind so the dark truck body separates from the dark road.
  scene.add(new THREE.HemisphereLight(0x6f86a8, 0x10131a, 1.25));
  const moon = new THREE.DirectionalLight(0xcfe0f5, 1.1);
  moon.position.set(-7, 12, 6);
  scene.add(moon);
  const rim = new THREE.DirectionalLight(0xffb066, 0.5);
  rim.position.set(4, 6, -10);
  scene.add(rim);
  // A soft fill that travels with the truck so it never sinks into black.
  const truckFill = new THREE.PointLight(0xbcd2f0, 12, 22, 2);
  truckFill.position.set(0, 6, -4);
  scene.add(truckFill);

  // ---- Road ---------------------------------------------------------------
  // Built as a ribbon following roadX(z): a custom geometry strip so the road
  // actually curves. We generate quads along z and offset x by roadX.
  const ROAD_LEN = 260; // world units of road ahead
  const ROAD_SEG = 200;
  const ROAD_W = 11; // wide enough that the weaving lane never runs off the edge
  const roadShape = new THREE.BufferGeometry();
  const roadPos = new Float32Array(ROAD_SEG * 6 * 3);
  // Fixed z per segment row; x is rewritten each frame to follow the curve.
  const roadZ: number[] = [];
  for (let i = 0; i <= ROAD_SEG; i++) roadZ[i] = -i * (ROAD_LEN / ROAD_SEG);
  {
    const uvs: number[] = [];
    for (let i = 0; i < ROAD_SEG; i++) {
      const v0 = i, v1 = i + 1;
      uvs.push(0, v0, 1, v0, 0, v1, 0, v1, 1, v0, 1, v1);
    }
    roadShape.setAttribute("position", new THREE.BufferAttribute(roadPos, 3));
    roadShape.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    // The road is flat (y=0 everywhere), so every normal is +Y — set once.
    const normals = new Float32Array(ROAD_SEG * 6 * 3);
    for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
    roadShape.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  }
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x222732, roughness: 0.82, metalness: 0.1 });
  const roadMesh = new THREE.Mesh(roadShape, roadMat);
  scene.add(roadMesh);
  // Rewrite road x-positions to follow the animated curve (defined after curveX).
  let updateRoad: (travel: number) => void = () => {};

  // Dashed centre-line: emissive amber slabs placed along the curve.
  const dashGeo = new THREE.BoxGeometry(0.16, 0.02, 1.8);
  const dashMat = new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 1.5, roughness: 0.6 });
  const DASHES = 70;
  const dashes = new THREE.InstancedMesh(dashGeo, dashMat, DASHES);
  const dummy = new THREE.Object3D();
  // `travel` is how far we've driven. Each dash keeps a fixed phase; its world
  // z = phase advanced by travel, wrapped into [-ROAD_LEN+VIS, VIS]. Increasing
  // travel moves z toward +Z (toward the camera behind), i.e. the world flows
  // PAST us as we drive forward — the correct chase-cam direction.
  const VIS_BEHIND = 18; // how far behind the camera before recycle
  const DASH_SPACING = 3.5;
  function wrapZ(raw: number): number {
    // map into (-(ROAD_LEN - VIS_BEHIND), VIS_BEHIND]
    const span = ROAD_LEN;
    let z = ((raw % span) + span) % span; // 0..span
    z = z - (span - VIS_BEHIND);          // shift so most is ahead (-Z)
    return z;
  }
  // The visible road curve is roadX(zWorld + travel): as travel grows the whole
  // curve slides, so the road appears to snake while flowing toward the camera.
  // Furniture and the truck all sample THIS function at their world z, so they
  // stay locked to the same lane.
  function curveX(zWorld: number, travel: number): number {
    return roadX(zWorld + travel);
  }
  // Now that curveX exists, wire the per-frame road ribbon rebuild.
  updateRoad = (travel: number) => {
    let p = 0;
    for (let i = 0; i < ROAD_SEG; i++) {
      const z0 = roadZ[i]!, z1 = roadZ[i + 1]!;
      const c0 = curveX(z0, travel), c1 = curveX(z1, travel);
      const hw = ROAD_W / 2;
      // tri 1
      roadPos[p++] = c0 - hw; roadPos[p++] = 0; roadPos[p++] = z0;
      roadPos[p++] = c0 + hw; roadPos[p++] = 0; roadPos[p++] = z0;
      roadPos[p++] = c1 - hw; roadPos[p++] = 0; roadPos[p++] = z1;
      // tri 2
      roadPos[p++] = c1 - hw; roadPos[p++] = 0; roadPos[p++] = z1;
      roadPos[p++] = c0 + hw; roadPos[p++] = 0; roadPos[p++] = z0;
      roadPos[p++] = c1 + hw; roadPos[p++] = 0; roadPos[p++] = z1;
    }
    roadShape.attributes.position.needsUpdate = true;
  };
  updateRoad(0);
  function layoutDashes(travel: number) {
    for (let i = 0; i < DASHES; i++) {
      const z = wrapZ(i * DASH_SPACING + travel);
      const x = curveX(z, travel);
      const xAhead = curveX(z - 0.5, travel);
      dummy.position.set(x, 0.02, z);
      dummy.rotation.set(0, Math.atan2(x - xAhead, 0.5), 0);
      dummy.updateMatrix();
      dashes.setMatrixAt(i, dummy.matrix);
    }
    dashes.instanceMatrix.needsUpdate = true;
  }
  layoutDashes(0);
  scene.add(dashes);

  // Roadside reflector posts (depth + speed cue), both edges.
  const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x222a35, roughness: 0.8 });
  const reflMat = new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 1.6 });
  const POSTS = 40;
  const posts = new THREE.InstancedMesh(postGeo, postMat, POSTS * 2);
  const reflectors = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 6, 6), reflMat, POSTS * 2);
  const POST_SPACING = 6.5;
  function layoutPosts(travel: number) {
    let k = 0;
    for (let i = 0; i < POSTS; i++) {
      const z = wrapZ(i * POST_SPACING + travel);
      const x = curveX(z, travel);
      for (const side of [-1, 1]) {
        dummy.position.set(x + side * (ROAD_W / 2 + 0.5), 0.45, z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        posts.setMatrixAt(k, dummy.matrix);
        dummy.position.y = 0.8;
        dummy.updateMatrix();
        reflectors.setMatrixAt(k, dummy.matrix);
        k++;
      }
    }
    posts.instanceMatrix.needsUpdate = true;
    reflectors.instanceMatrix.needsUpdate = true;
  }
  layoutPosts(0);
  scene.add(posts, reflectors);

  // ---- Tow truck ----------------------------------------------------------
  const truck = new THREE.Group();

  // Brighter "AXA red-amber" cab so the truck pops against the night road.
  const paint = new THREE.MeshStandardMaterial({ color: 0x3a4150, roughness: 0.4, metalness: 0.55 });
  const amberPaint = new THREE.MeshStandardMaterial({ color: AMBER, roughness: 0.4, metalness: 0.35, emissive: AMBER, emissiveIntensity: 0.18 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x4a525d, roughness: 0.55, metalness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0a1825, roughness: 0.12, metalness: 0.9 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0x8893a0, roughness: 0.25, metalness: 0.95 });

  // The body is built with its FRONT at +Z, then rotated 180° so the front
  // faces -Z (the driving direction). That puts the flatbed toward the chase
  // camera (+Z) — we follow the truck and see its bed, as intended.
  const body = new THREE.Group();
  body.rotation.y = Math.PI;
  truck.add(body);

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 5.4), paint);
  chassis.position.y = 0.62;
  body.add(chassis);

  // Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.74, 1.05, 1.7), paint);
  cab.position.set(0, 1.4, 1.65);
  body.add(cab);
  // Cab roof taper
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.4), paint);
  roof.position.set(0, 2.05, 1.7);
  body.add(roof);
  // Windshield + rear cab glass
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 0.1), glass);
  windshield.position.set(0, 1.75, 0.86);
  body.add(windshield);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.08), glass);
  rearGlass.position.set(0, 1.78, 2.45);
  body.add(rearGlass);
  // Amber cab stripe (brand)
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.16, 1.72), amberPaint);
  stripe.position.set(0, 1.0, 1.65);
  body.add(stripe);

  // Flatbed platform (empty), slightly tilted at the rear like a real tilt-tray
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 3.0), deckMat);
  deck.position.set(0, 0.92, -1.1);
  body.add(deck);
  // Deck side rails
  for (const x of [-0.85, 0.85]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 3.0), paint);
    rail.position.set(x, 1.02, -1.1);
    body.add(rail);
  }
  // Deck ribs (the rolled-steel look)
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x363c46, roughness: 0.5, metalness: 0.6 });
  for (let i = 0; i < 7; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.06), ribMat);
    rib.position.set(0, 0.99, -2.5 + i * 0.46);
    body.add(rib);
  }
  // Headache rack behind cab
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.9, 0.12), chrome);
  rack.position.set(0, 1.5, 0.45);
  body.add(rack);

  // --- Front-end detail (the cab faces +Z in body space) ---
  // Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 0.7), paint);
  hood.position.set(0, 1.05, 2.55);
  body.add(hood);
  // Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.1), chrome);
  grille.position.set(0, 0.95, 2.92);
  body.add(grille);
  // Front bumper
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.25), chrome);
  bumper.position.set(0, 0.62, 2.98);
  body.add(bumper);
  // Side mirrors on stalks
  for (const x of [0.98, -0.98]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.05), chrome);
    arm.position.set(x, 1.55, 2.2);
    body.add(arm);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.18), paint);
    mirror.position.set(x + 0.14, 1.5, 2.2);
    body.add(mirror);
  }
  // Vertical exhaust stack behind the cab
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 10), chrome);
  exhaust.position.set(-0.92, 1.5, 0.7);
  body.add(exhaust);
  // Fenders over each wheel
  const fenderMat = new THREE.MeshStandardMaterial({ color: 0x1b1f27, roughness: 0.6, metalness: 0.4 });
  const fenderSpots: [number, number][] = [
    [0.95, 1.7], [-0.95, 1.7], [0.95, -1.45], [-0.95, -1.45],
  ];
  for (const [x, z] of fenderSpots) {
    const fender = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 1.4), fenderMat);
    fender.position.set(x, 1.0, z);
    body.add(fender);
  }

  // Wheels (6: front pair + rear dually-ish)
  const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.34, 20);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0d, roughness: 0.85 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x60686f, roughness: 0.4, metalness: 0.8 });
  const wheels: THREE.Group[] = [];
  const wheelSpots: [number, number][] = [
    [0.95, 1.7], [-0.95, 1.7], [0.95, -1.9], [-0.95, -1.9], [0.95, -1.0], [-0.95, -1.0],
  ];
  for (const [x, z] of wheelSpots) {
    const wg = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    wg.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.36, 12), hubMat);
    hub.rotation.z = Math.PI / 2;
    wg.add(hub);
    wg.position.set(x, 0.46, z);
    wheels.push(wg);
    body.add(wg);
  }

  // Headlights — emissive + real spotlights down the road
  const headMat = new THREE.MeshStandardMaterial({ color: HEADLIGHT, emissive: HEADLIGHT, emissiveIntensity: 4 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff2a2a, emissiveIntensity: 2.2 });
  for (const x of [0.6, -0.6]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.08), headMat);
    lamp.position.set(x, 1.0, 0.86);
    body.add(lamp);
    const spot = new THREE.SpotLight(HEADLIGHT, 40, 60, 0.42, 0.6, 1.2);
    spot.position.set(x, 1.0, 0.9);
    const tgt = new THREE.Object3D();
    tgt.position.set(x, 0, 30);
    body.add(tgt);
    spot.target = tgt;
    body.add(spot);
    // tail lights
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.06), tailMat);
    tail.position.set(x, 0.95, -2.72);
    body.add(tail);
  }

  // Rear license plate "GJ 01 AAV" (RO format: blue EU band + black-on-white).
  // Drawn to a small canvas texture. Sits at the bed/-Z end of the body, which
  // faces the chase camera after the 180° body rotation, so it reads clearly.
  {
    const pc = document.createElement("canvas");
    pc.width = 256; pc.height = 64;
    const ctx = pc.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 256, 64);
    // EU blue band
    ctx.fillStyle = "#003399";
    ctx.fillRect(0, 0, 34, 64);
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("RO", 17, 42);
    // plate number
    ctx.fillStyle = "#111317";
    ctx.font = "bold 40px 'Arial Narrow', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("GJ 01 AAV", 46, 47);
    // thin border
    ctx.strokeStyle = "#111317"; ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 60);
    const plateTex = new THREE.CanvasTexture(pc);
    plateTex.colorSpace = THREE.SRGBColorSpace;
    const plateMat = new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.5, emissive: 0xffffff, emissiveMap: plateTex, emissiveIntensity: 0.25 });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.225), plateMat);
    plate.position.set(0, 0.7, -2.79);
    plate.rotation.y = Math.PI; // face outward at the -Z end
    body.add(plate);
  }

  // Rotating amber beacon bar on the cab roof
  const beacon = new THREE.Group();
  const beaconBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.22), new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 2.4, roughness: 0.4 }));
  beacon.add(beaconBar);
  const beaconLight = new THREE.PointLight(ORANGE, 5, 12, 2);
  beaconLight.position.y = 0.2;
  beacon.add(beaconLight);
  beacon.position.set(0, 2.34, 1.7);
  body.add(beacon);

  scene.add(truck);

  // ---- Drive state --------------------------------------------------------
  let scroll = 0; // how far we've travelled along the road (animates forever)
  const SPEED = 14; // world units / second

  // The truck holds at a fixed z in front of the camera; the road furniture
  // flows past (forward driving). `travel` only ever increases.
  const TRUCK_Z = -12;
  let camXSmooth = 0;

  function render(t: number, dtArg?: number) {
    const dt = dtArg ?? 0.016;
    scroll += SPEED * dt;

    // Road ribbon + furniture all flow toward the camera as we drive forward.
    updateRoad(scroll);
    layoutDashes(scroll);
    layoutPosts(scroll);

    // The road furniture is laid out via wrapZ(i*spacing + scroll), so its world
    // x at a given world z is roadX(wrapZ(...)). The truck holds at TRUCK_Z; to
    // make it ride the SAME curve the dashes trace there, evaluate roadX on the
    // animated phase: curveAt(zWorld) = roadX(zWorld - scroll). As scroll grows
    // the sampled curve shifts so the truck weaves left/right in sync with the
    // road flowing past it.
    const curveAt = (zWorld: number) => curveX(zWorld, scroll);
    const centreTruck = curveAt(TRUCK_Z);
    const xAhead = curveAt(TRUCK_Z - 3);
    const heading = Math.atan2(centreTruck - xAhead, 3); // yaw along the road

    // Keep to the RIGHT lane (Romania drives on the right). Offset the truck from
    // the centre-line by LANE units, perpendicular to its heading so it hugs the
    // right lane through the curves rather than sitting on the dashes.
    const LANE = ROAD_W / 4; // half a lane to the right of centre
    const xTruck = centreTruck + Math.cos(heading) * LANE;

    truck.position.set(xTruck, Math.sin(t * 3) * 0.02, TRUCK_Z);
    truck.rotation.y = heading;
    truck.rotation.z = -heading * 0.35; // bank into the turn

    // Wheels spin forward.
    const spin = scroll * 1.5;
    for (const w of wheels) w.rotation.x = spin;

    // Beacon rotates + flickers.
    beacon.rotation.y = t * 3.2;
    beaconLight.intensity = 3.5 + Math.sin(t * 7) * 2;

    // Chase camera: behind (+Z) and above the truck, in the same right lane so
    // it stays directly behind. X eases toward the lane x so turns sweep.
    const camXTarget = curveAt(TRUCK_Z + 3) + LANE;
    camXSmooth += (camXTarget - camXSmooth) * Math.min(1, dt * 3);
    camera.position.set(camXSmooth, 3.6, TRUCK_Z + 8.5);
    const lookX = curveAt(TRUCK_Z - 10) + LANE;
    camera.lookAt(lookX, 1.1, TRUCK_Z - 14);

    renderer.render(scene, camera);
  }

  function resize(w: number, h: number) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function dispose() {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
      else if (mat) mat.dispose();
    });
    renderer.dispose();
  }

  return { render, resize, dispose, renderer };
}
