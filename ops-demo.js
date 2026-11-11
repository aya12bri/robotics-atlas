// ops-demo.js — "Operations demo" on the robot pages: an animated 3D cell where the robot performs the
// industrial operations it is suited for (palletizing, case packing, bundling, labelling and laser marking,
// vision inspection, bin picking, separating joined products, conveying, AMR, screwing and assembly).
//
// Usage on a page:  <div class="opsdemo" data-robot="articulated"></div>  +  <script type="module" src="ops-demo.js"></script>
//
// Every manipulator is driven the same way: a script asks "put the tool tip at this point", the robot
// solves its own inverse kinematics (6-axis, cobot, SCARA, Delta, Cartesian gantry, 3-axis arm), and the
// tool (gripper) always points straight down. Straight-line moves are done by solving the IK at every frame.
// Coordinates are the three.js scene coordinates: y is up, the floor is y = 0, the robot base is at the origin.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FR = (window.RA && RA.lang) === 'fr';
const L = (en, fr) => (FR ? fr : en);

// ---------------------------------------------------------------- operations: names and one-line explanations
const OPS = {
  pal: [L('Palletizing', 'Palettisation'), L('Boxes arrive on a conveyor and are stacked on a pallet following a plan (2 × 2 per layer).', 'Les colis arrivent sur un convoyeur et sont empilés sur la palette selon un plan (2 × 2 par couche).')],
  enc: [L('Case packing', 'Encaissage'), L('Bottles are put one by one into the slots of a carton, then the carton is closed.', 'Les bouteilles sont mises une à une dans les cases d\'un carton, puis le carton est fermé.')],
  far: [L('Bundling', 'Fardelage'), L('Loose bottles are grouped into a tight 2 × 3 pack, then wrapped in shrink film.', 'Les bouteilles en vrac sont regroupées en un lot serré de 2 × 3, puis entourées d\'un film rétractable.')],
  eti: [L('Labelling / laser marking', 'Étiquetage / marquage laser'), L('The robot sticks a label on the box, then a laser engraves the batch number and the date.', 'Le robot colle une étiquette sur la boîte, puis un laser grave le numéro de lot et la date.')],
  vis: [L('Quality control / vision', 'Contrôle qualité / vision'), L('A camera on the tool checks each part; the defective one is taken out to the reject bin.', 'Une caméra sur l\'outil vérifie chaque pièce ; la pièce défectueuse est sortie vers le bac de rebut.')],
  bin: [L('Bin picking', 'Dévracage (bin picking)'), L('A camera above the bin finds a part lying loose; the robot picks it and lines it up on a tray.', 'Une caméra au-dessus du bac repère une pièce en vrac ; le robot la prend et l\'aligne sur un plateau.')],
  deg: [L('Separating joined products', 'Dégrappage'), L('Four pots joined together are separated: the robot breaks each link and sets the pots apart.', 'Quatre pots liés entre eux sont séparés : le robot casse chaque lien et pose les pots à part.')],
  con: [L('Conveying', 'Convoyage'), L('Products travel on belts; the robot transfers each one from the infeed belt to the outfeed belt.', 'Les produits circulent sur des tapis ; le robot transfère chacun du tapis d\'entrée au tapis de sortie.')],
  amr: [L('Mobility with an AMR', 'Mobilité via AMR'), L('An autonomous mobile robot brings a tote of parts; the robot unloads it, then the AMR leaves.', 'Un robot mobile autonome apporte un bac de pièces ; le robot le décharge, puis l\'AMR repart.')],
  ass: [L('Screwing / assembly', 'Vissage / assemblage'), L('The robot puts the cover on the housing, then drives the four screws.', 'Le robot pose le couvercle sur le boîtier, puis visse les quatre vis.')],
  shu: [L('Conveying with an AMR', 'Convoyage par AMR'), L('The AMR takes a tote from station A and delivers it to station B, with no rail or conveyor between them.', 'L\'AMR prend un bac au poste A et le livre au poste B, sans rail ni convoyeur entre les deux.')],
  rou: [L('AMR delivery route', 'Tournée d\'un AMR'), L('The AMR visits three stations, finds its way around the shelves and stops for a person crossing.', 'L\'AMR passe par trois postes, contourne les étagères et s\'arrête pour une personne qui traverse.')]
};

// ---------------------------------------------------------------- materials and small helpers
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...o });
const MAT = {
  orange: M('#ff9f43', { roughness: 0.4 }), grey: M('#cfd8e3', { roughness: 0.35, metalness: 0.3 }), dark: M('#2a313b', { roughness: 0.6 }),
  steel: M('#9aa5b1', { roughness: 0.3, metalness: 0.7 }), black: M('#15181d', { roughness: 0.7 }), blue: M('#3d6fb6', { roughness: 0.4 }),
  cobot: M('#e9edf2', { roughness: 0.35 }), cobotCap: M('#3d5a80', { roughness: 0.4 }), card: M('#c9a06a', { roughness: 0.85 }),
  cardDark: M('#a8824f', { roughness: 0.85 }), tape: M('#e8d7b0', { roughness: 0.6 }), wood: M('#b98d5a', { roughness: 0.9 }),
  belt: M('#23272e', { roughness: 0.9 }), frame: M('#59636f', { roughness: 0.5, metalness: 0.4 }), white: M('#f4f6f8', { roughness: 0.5 }),
  red: M('#e5484d'), green: M('#30a46c'), yellow: M('#f5c518'), part: M('#8a96a3', { roughness: 0.3, metalness: 0.8 }),
  bin: M('#2f6bff', { roughness: 0.6 }), rejBin: M('#c73a3f', { roughness: 0.6 }), tray: M('#3a4350', { roughness: 0.7 }),
  glass: new THREE.MeshStandardMaterial({ color: '#7cc4a4', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 }),
  cap: M('#e5484d', { roughness: 0.4 }), pot: M('#f2f2f2', { roughness: 0.4 }), film: new THREE.MeshStandardMaterial({ color: '#cfe8ff', roughness: 0.1, transparent: true, opacity: 0.0, depthWrite: false })
};
const box = (w, h, d, mat, y0 = true) => { const g = new THREE.BoxGeometry(w, h, d); if (y0) g.translate(0, h / 2, 0); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m; };
const cyl = (r, h, mat, seg = 28, y0 = true) => { const g = new THREE.CylinderGeometry(r, r, h, seg); if (y0) g.translate(0, h / 2, 0); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m; };
const cylZ = (r, h, mat, seg = 28) => { const m = cyl(r, h, mat, seg, false); m.geometry.rotateX(Math.PI / 2); return m; };   // axis along z
const cylX = (r, h, mat, seg = 28) => { const m = cyl(r, h, mat, seg, false); m.geometry.rotateZ(Math.PI / 2); m.geometry.translate(h / 2, 0, 0); return m; };   // from 0 to h along x
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (k) => k * k * (3 - 2 * k);
const lerpAng = (a, b, k) => { let d = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
function rodBetween(mesh, a, b) {                          // place a unit-height cylinder (along y, centred) between points a and b
  const d = b.clone().sub(a), len = d.length();
  mesh.position.copy(a).addScaledVector(d, 0.5); mesh.scale.set(1, len, 1);
  mesh.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
}
function textTexture(lines, w = 256, h = 128, bg = '#ffffff', fg = '#111') {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.draw = (n = Infinity) => {                          // draws the first n characters (for the laser effect)
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `bold ${Math.round(h / (lines.length + 1.2))}px monospace`; g.textBaseline = 'middle';
    let left = n; lines.forEach((ln, i) => { const s = ln.slice(0, Math.max(0, left)); left -= ln.length; g.fillText(s, w * 0.07, (h * (i + 0.85)) / (lines.length + 0.7)); });
    tex.needsUpdate = true;
  };
  tex.draw(); return tex;
}

// ---------------------------------------------------------------- the gripper (separate object, always pointing down)
// origin = tool tip (between the fingertips), +y up. setOpen(half gap).
function makeGripper(u) {
  const g = new THREE.Group(), fl = 0.62 * u, len = fl + 0.2 * u;
  const flange = cyl(0.3 * u, 0.06 * u, MAT.steel); flange.position.y = len - 0.06 * u; g.add(flange);
  const body = cyl(0.2 * u, 0.1 * u, MAT.dark); body.position.y = len - 0.16 * u; g.add(body);
  const palm = box(1.5 * u, 0.1 * u, 0.32 * u, MAT.orange); palm.position.y = fl; g.add(palm);
  const fingers = [-1, 1].map((s) => { const f = box(0.09 * u, fl, 0.26 * u, MAT.dark); f.userData.s = s; g.add(f); return f; });
  const cam = new THREE.Group(); { const b = box(0.32 * u, 0.22 * u, 0.3 * u, MAT.black); b.position.set(0, 0, 0); cam.add(b); const lens = cyl(0.09 * u, 0.08 * u, MAT.steel); lens.position.y = -0.08 * u; cam.add(lens); }
  cam.position.set(0, fl * 0.55, 0.32 * u); cam.visible = false; g.add(cam);
  g.userData = { len, fl, fingers, cam, open: 0.55 * u };
  g.setOpen = (w) => { g.userData.open = w; fingers.forEach((f) => { f.position.x = f.userData.s * (w + 0.045 * u); }); };
  g.setOpen(0.55 * u);
  return g;
}

// ---------------------------------------------------------------- robots: build(u) -> { root, reach(flange point) -> bool }
// "flange" = point where the tool is mounted; the tool tip is toolLen below it.
function articulated(o) {
  const { h1, L2, L3, L4, style } = o, cobot = style === 'cobot', root = new THREE.Group();
  const J = cobot ? MAT.cobotCap : MAT.orange, K = cobot ? MAT.cobot : MAT.orange, r = o.r;
  root.add(cyl(r * 1.9, 0.06, MAT.dark));
  const turret = new THREE.Group(); root.add(turret);
  const col = cyl(r * 1.35, h1 - 0.06, K); col.position.y = 0.06; turret.add(col);
  const sh = new THREE.Group(); sh.position.y = h1; turret.add(sh);
  sh.add(cylZ(r * 1.25, r * 2.6, J));
  const up = new THREE.Group(); sh.add(up);
  const uarm = cylX(r * 0.9, L2, K); up.add(uarm);
  if (!cobot) { const side = box(L2 * 0.9, r * 1.4, r * 0.5, MAT.orange, false); side.position.set(L2 / 2, 0, r * 1.05); up.add(side); }
  const el = new THREE.Group(); el.position.x = L2; up.add(el);
  el.add(cylZ(r * 1.05, r * 2.2, J));
  const farm = cylX(r * 0.72, L3, cobot ? MAT.cobot : MAT.grey); el.add(farm);
  const wr = new THREE.Group(); wr.position.x = L3; el.add(wr);
  wr.add(cylZ(r * 0.78, r * 1.7, J));
  const wl = cylX(r * 0.55, L4, cobot ? MAT.cobot : MAT.dark); wr.add(wl);
  const cap = cylX(r * 0.6, 0.02, MAT.steel); cap.position.x = L4 - 0.02; wr.add(cap);
  return {
    root,
    reach(f) {                                             // f = flange position; the wrist link points straight down
      const wx = f.x, wy = f.y + L4, wz = f.z;
      const t1 = Math.atan2(-wz, wx), rr = Math.hypot(wx, wz), zz = wy - h1;
      const D = (rr * rr + zz * zz - L2 * L2 - L3 * L3) / (2 * L2 * L3);
      if (D > 1 || D < -1 || rr < 0.12) return false;
      const a3 = -Math.acos(D), a2 = Math.atan2(zz, rr) + Math.atan2(L3 * Math.sin(-a3), L2 + L3 * D);
      turret.rotation.y = t1; up.rotation.z = a2; el.rotation.z = a3; wr.rotation.z = -Math.PI / 2 - a2 - a3;
      return true;
    }
  };
}
function arm3(o) {                                          // 3-axis arm (yaw, shoulder, elbow); the tool hangs on a passive joint
  const { h1, L2, L3, r } = o, root = new THREE.Group();
  root.add(cyl(r * 1.9, 0.06, MAT.dark));
  const turret = new THREE.Group(); root.add(turret);
  const col = cyl(r * 1.4, h1 - 0.06, MAT.orange); col.position.y = 0.06; turret.add(col);
  const sh = new THREE.Group(); sh.position.y = h1; turret.add(sh); sh.add(cylZ(r * 1.2, r * 2.4, MAT.orange));
  const up = new THREE.Group(); sh.add(up); up.add(cylX(r * 0.7, L2, MAT.grey));
  const el = new THREE.Group(); el.position.x = L2; up.add(el); el.add(cylZ(r * 1.0, r * 2.0, MAT.orange)); el.add(cylX(r * 0.6, L3, MAT.grey));
  const tip = new THREE.Group(); tip.position.x = L3; el.add(tip); tip.add(new THREE.Mesh(new THREE.SphereGeometry(r * 0.75, 20, 14), MAT.orange));
  return {
    root, hang: r * 0.6,
    reach(f) {
      const wy = f.y + r * 0.6, t1 = Math.atan2(-f.z, f.x), rr = Math.hypot(f.x, f.z), zz = wy - h1;
      const D = (rr * rr + zz * zz - L2 * L2 - L3 * L3) / (2 * L2 * L3);
      if (D > 1 || D < -1 || rr < 0.1) return false;
      const a3 = -Math.acos(D), a2 = Math.atan2(zz, rr) + Math.atan2(L3 * Math.sin(-a3), L2 + L3 * D);
      turret.rotation.y = t1; up.rotation.z = a2; el.rotation.z = a3; return true;
    }
  };
}
function scara(o) {
  const { H, L1, L2, r, lo, hi } = o, root = new THREE.Group();
  root.add(cyl(r * 2.2, 0.05, MAT.dark));
  const col = cyl(r * 1.5, H - 0.05, MAT.dark); col.position.y = 0.05; root.add(col);
  const j1 = new THREE.Group(); j1.position.y = H; root.add(j1);
  j1.add(cyl(r * 1.45, r * 1.3, MAT.orange, 28, false));
  const l1 = box(L1, r * 1.1, r * 2.2, MAT.orange, false); l1.position.x = L1 / 2; j1.add(l1);
  const j2 = new THREE.Group(); j2.position.set(L1, r * 1.1, 0); j1.add(j2);
  j2.add(cyl(r * 1.25, r * 1.2, MAT.orange, 28, false));
  const l2 = box(L2, r * 1.0, r * 1.9, MAT.grey, false); l2.position.x = L2 / 2; j2.add(l2);
  const head = cyl(r * 0.95, r * 1.6, MAT.orange, 28, false); head.position.set(L2, r * 0.3, 0); j2.add(head);
  const quill = cyl(r * 0.32, 1, MAT.steel, 20, false); j2.add(quill);
  return {
    root,
    reach(f) {
      const x = f.x, y = -f.z, rr = Math.hypot(x, y);
      const D = (rr * rr - L1 * L1 - L2 * L2) / (2 * L1 * L2);
      const top = H + r * 1.1;                               // height of link 2
      if (D > 1 || D < -1 || f.y < lo || f.y > hi) return false;
      const t2 = Math.acos(D), t1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * D);
      j1.rotation.y = t1; j2.rotation.y = t2;
      const qTop = r * 1.4, qBot = f.y - top;                // quill from above the head down to the flange (local y of j2)
      quill.position.set(L2, (qTop + qBot) / 2, 0); quill.scale.y = qTop - qBot;
      return true;
    }
  };
}
function gantry(o) {
  const { W, D, Hg, r } = o, root = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = box(r * 1.4, Hg, r * 1.4, MAT.frame); p.position.set(sx * W / 2, 0, sz * D / 2); root.add(p); }
  for (const sz of [-1, 1]) { const rail = box(W + r * 1.4, r * 1.2, r * 1.4, MAT.frame, false); rail.position.set(0, Hg + r * 0.6, sz * D / 2); root.add(rail); }
  const bridge = new THREE.Group(); root.add(bridge);
  const beam = box(r * 1.6, r * 1.6, D + r * 1.4, MAT.orange, false); beam.position.y = Hg + r * 1.6; bridge.add(beam);
  const car = new THREE.Group(); bridge.add(car);
  const carr = box(r * 2.6, r * 2.2, r * 2.4, MAT.dark, false); carr.position.y = Hg + r * 1.6; car.add(carr);
  const ram = box(r * 0.9, 1, r * 0.9, MAT.grey, false); car.add(ram);
  return {
    root,
    reach(f) {
      if (Math.abs(f.x) > W / 2 - r * 1.5 || Math.abs(f.z) > D / 2 - r * 1.5 || f.y > Hg - r || f.y < 0) return false;
      bridge.position.x = f.x; car.position.z = f.z;
      const top = Hg + r * 3.2; ram.position.y = (top + f.y) / 2; ram.scale.y = top - f.y; return true;
    }
  };
}
function delta(o) {
  const { Ht, Rb, rf, re, Re, r } = o, root = new THREE.Group();
  const RF = Rb + rf + 0.3;                                  // the frame stands behind the robot (away from the camera)
  for (const a of [Math.PI * 0.95, Math.PI * 1.55]) { const p = box(r * 0.9, Ht + r * 2.4, r * 0.9, MAT.frame); p.position.set(Math.cos(a) * RF, 0, Math.sin(a) * RF); root.add(p);
    const beam = box(RF, r * 0.9, r * 0.9, MAT.frame, false); beam.position.set(Math.cos(a) * RF / 2, Ht + r * 2.8, Math.sin(a) * RF / 2); beam.rotation.y = -a; root.add(beam); }
  const top = new THREE.Group(); top.position.y = Ht; root.add(top);
  const plate = cyl(Rb + 0.08, r * 0.8, MAT.dark, 6, false); plate.position.y = r * 2; top.add(plate);
  top.add(cyl(Rb + r, r * 1.2, MAT.orange, 32, false));
  const eff = new THREE.Group(); root.add(eff);
  eff.add(cyl(Re + r * 0.4, r * 0.6, MAT.orange, 24, false));
  const rodMat = MAT.grey, arms = [];
  for (let i = 0; i < 3; i++) {
    const phi = (i / 3) * Math.PI * 2 + Math.PI / 2, g = new THREE.Group(); g.rotation.y = phi; top.add(g);
    const motor = cylZ(r * 0.9, r * 1.6, MAT.dark); motor.position.x = Rb; g.add(motor);
    const piv = new THREE.Group(); piv.position.x = Rb; g.add(piv); piv.add(cylX(r * 0.45, rf, MAT.orange));
    const rods = [0, 1].map(() => { const m = cyl(r * 0.16, 1, rodMat, 10, false); root.add(m); return m; });
    arms.push({ phi, piv, rods });
  }
  return {
    root,
    reach(f) {
      const T = V(0, Ht, 0), rel = f.clone().sub(T), sol = [];
      for (const a of arms) {
        const rh = V(Math.cos(a.phi), 0, -Math.sin(a.phi)), th = V(Math.sin(a.phi), 0, Math.cos(a.phi));
        const A = rel.clone().addScaledVector(rh, Re), ax = A.dot(rh), ay = A.y, at = A.dot(th);
        const uu = Rb - ax, vv = -ay, K = re * re - at * at - uu * uu - vv * vv - rf * rf, rho = Math.hypot(uu, vv), c = K / (2 * rf * rho);
        if (c > 1 || c < -1) return false;
        const be = Math.atan2(vv, uu), s1 = -be + Math.acos(c), s2 = -be - Math.acos(c);
        const th1 = Math.cos(s1) > Math.cos(s2) ? s1 : s2;
        if (th1 < -0.6 || th1 > 1.7) return false;
        sol.push({ a, th1, rh, th });
      }
      eff.position.copy(f);
      for (const { a, th1, rh, th } of sol) {
        a.piv.rotation.z = -th1;
        const E = V(0, Ht, 0).addScaledVector(rh, Rb + rf * Math.cos(th1)); E.y -= rf * Math.sin(th1);
        const P = f.clone().addScaledVector(rh, Re);
        a.rods.forEach((m, k) => { const s = (k ? 1 : -1) * r * 0.9; rodBetween(m, E.clone().addScaledVector(th, s), P.clone().addScaledVector(th, s)); });
      }
      return true;
    }
  };
}
function makeAMR(s) {                                       // autonomous mobile robot: s = length
  const g = new THREE.Group(), w = s * 0.7, h = s * 0.28;
  const body = box(s, h, w, MAT.white); body.position.y = s * 0.06; g.add(body);
  const bumper = box(s * 1.02, h * 0.3, w * 1.02, MAT.dark); bumper.position.y = s * 0.05; g.add(bumper);
  const stripe = box(s * 1.005, h * 0.16, w * 1.005, MAT.orange); stripe.position.y = s * 0.06 + h * 0.62; g.add(stripe);
  const top = box(s * 0.92, s * 0.03, w * 0.92, MAT.dark); top.position.y = s * 0.06 + h; g.add(top);
  const lidar = cyl(s * 0.07, s * 0.06, MAT.black); lidar.position.set(s * 0.4, s * 0.06 + h, 0); g.add(lidar);
  const wheels = [-1, 1].map((sd) => { const wh = cylZ(s * 0.075, s * 0.05, MAT.black); wh.position.set(0, s * 0.075, sd * (w / 2 - s * 0.02)); g.add(wh); return wh; });
  const ring = new THREE.Mesh(new THREE.RingGeometry(s * 0.75, s * 0.8, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#30a46c', transparent: true, opacity: 0.0, depthWrite: false }));
  ring.position.y = 0.004; g.add(ring);
  g.userData = { deck: s * 0.06 + h + s * 0.03, wheels, ring, s };
  return g;
}

// ---------------------------------------------------------------- props
function pallet(u) {
  const g = new THREE.Group(), s = 2.7 * u, t = 0.08 * u;
  for (const z of [-1, 0, 1]) { const b = box(s, 0.18 * u, 0.28 * u, MAT.wood); b.position.z = z * (s / 2 - 0.14 * u); g.add(b); }
  for (let i = 0; i < 6; i++) { const b = box(s * 0.16, t, s, MAT.wood); b.position.set(-s / 2 + s * 0.08 + i * (s * 0.84 / 5), 0.18 * u, 0); g.add(b); }
  g.userData.h = 0.18 * u + t; return g;
}
function carton(u, w, d, h, open = true) {
  const g = new THREE.Group(), t = 0.04 * u;
  g.add(box(w, t, d, MAT.cardDark));
  for (const s of [-1, 1]) { const a = box(t, h, d, MAT.card); a.position.x = s * (w / 2 - t / 2); g.add(a); const b = box(w, h, t, MAT.card); b.position.z = s * (d / 2 - t / 2); g.add(b); }
  const flaps = [];
  for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * w / 2, h, 0); g.add(piv); const f = box(w / 2, t, d, MAT.card, false); f.position.x = -s * w / 4; piv.add(f); piv.rotation.z = s * (open ? 1.9 : 0); piv.userData.s = s; flaps.push(piv); }
  g.userData = { h, w, d, flaps, t }; return g;
}
function parcel(u) { const g = box(u, 0.9 * u, u, MAT.card); const tp = box(u * 1.002, 0.004, 0.18 * u, MAT.tape); tp.position.y = 0.9 * u; g.add(tp); g.userData = { h: 0.9 * u, w: u }; return g; }
function bottle(u, mat = MAT.glass) {
  const g = new THREE.Group(), R = 0.2 * u, H = 0.95 * u;
  g.add(cyl(R, H * 0.72, mat)); const sh = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.4, R, H * 0.16, 24).translate(0, H * 0.8, 0), mat); g.add(sh);
  const nk = cyl(R * 0.38, H * 0.1, mat); nk.position.y = H * 0.88; g.add(nk); const c = cyl(R * 0.42, H * 0.06, MAT.cap); c.position.y = H * 0.94; g.add(c);
  g.userData = { h: H, w: R }; return g;
}
function conveyor(len, wid, hgt, dir, u) {                  // belt from the origin along dir (unit, horizontal), top at hgt
  const g = new THREE.Group(), ang = Math.atan2(-dir.z, dir.x);
  const inner = new THREE.Group(); inner.rotation.y = ang; g.add(inner);
  const belt = box(len, 0.05 * u, wid, MAT.belt); belt.position.set(len / 2, hgt - 0.05 * u, 0); inner.add(belt);
  for (const s of [-1, 1]) { const side = box(len, 0.12 * u, 0.05 * u, MAT.frame); side.position.set(len / 2, hgt - 0.1 * u, s * (wid / 2 + 0.03 * u)); inner.add(side); }
  for (let i = 0; i <= Math.max(1, Math.round(len / (1.4 * u))); i++) { const x = (i / Math.max(1, Math.round(len / (1.4 * u)))) * len; for (const s of [-1, 1]) { const leg = box(0.07 * u, hgt - 0.1 * u, 0.07 * u, MAT.frame); leg.position.set(x, 0, s * (wid / 2)); inner.add(leg); } }
  const marks = []; for (let i = 0; i < Math.round(len / (0.5 * u)); i++) { const m = box(0.03 * u, 0.004, wid * 0.9, M('#3a4048')); m.position.set(i * 0.5 * u, hgt, 0); inner.add(m); marks.push(m); }
  g.userData = { marks, len, step: 0.5 * u, run: 0, hgt };
  g.tick = (dx) => { g.userData.run = (g.userData.run + dx) % (0.5 * u); marks.forEach((m, i) => { m.position.x = ((i * 0.5 * u + g.userData.run) % len); }); };
  return g;
}
function binBox(u, w, d, h, mat) {
  const g = new THREE.Group(), t = 0.05 * u;
  g.add(box(w, t, d, mat));
  for (const s of [-1, 1]) { const a = box(t, h, d, mat); a.position.x = s * (w / 2 - t / 2); g.add(a); const b = box(w, h, t, mat); b.position.z = s * (d / 2 - t / 2); g.add(b); }
  g.userData = { h, w, d }; return g;
}
function partL(u) {                                         // a small metal bracket
  const g = new THREE.Group(); g.add(box(0.7 * u, 0.14 * u, 0.32 * u, MAT.part)); const b = box(0.14 * u, 0.4 * u, 0.32 * u, MAT.part); b.position.x = 0.28 * u; g.add(b);
  g.userData = { h: 0.4 * u, w: 0.16 * u }; return g;
}
function tray(u, w, d) { const g = box(w, 0.06 * u, d, MAT.tray); g.userData = { h: 0.06 * u }; return g; }
function marker(u, ok) { const m = new THREE.Mesh(new THREE.RingGeometry(0.42 * u, 0.52 * u, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: ok ? '#30a46c' : '#e5484d' })); m.position.y = 0.006; return m; }
function flashCone(u, h) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.75 * u, h, 32, 1, true).translate(0, -h / 2, 0), new THREE.MeshBasicMaterial({ color: '#7fd1ff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); return m; }

// ---------------------------------------------------------------- per-robot settings
// A, B: centres of the two work zones (x, z) on the floor. u: size of a box. cam / target: initial camera.
const ROBOTS = {
  articulated: { build: () => articulated({ h1: 0.45, L2: 0.5, L3: 0.5, L4: 0.14, r: 0.075 }), u: 0.11, A: [0.25, 0.62], B: [0.66, -0.3], cam: [1.6, 1.22, 1.62], target: [0.38, 0.34, 0.12], v: 0.85, arc: true,
    ops: ['pal', 'enc', 'bin', 'ass', 'far', 'eti', 'vis', 'deg', 'amr'] },
  cobot: { build: () => articulated({ h1: 0.3, L2: 0.42, L3: 0.38, L4: 0.11, r: 0.055, style: 'cobot' }), u: 0.085, A: [0.2, 0.5], B: [0.52, -0.26], cam: [1.2, 0.9, 1.22], target: [0.3, 0.24, 0.1], v: 0.55, arc: true,
    ops: ['pal', 'ass', 'enc', 'eti', 'vis', 'bin', 'deg', 'amr'] },
  arm: { build: () => arm3({ h1: 0.42, L2: 0.45, L3: 0.45, r: 0.06 }), u: 0.1, A: [0.22, 0.56], B: [0.6, -0.26], cam: [1.42, 1.1, 1.45], target: [0.36, 0.3, 0.12], v: 0.7, arc: true,
    ops: ['pal', 'enc', 'vis'] },
  scara: { build: () => scara({ H: 0.42, L1: 0.34, L2: 0.3, r: 0.045, lo: 0.04, hi: 0.4 }), u: 0.06, A: [0.2, 0.4], B: [0.45, -0.14], cam: [0.88, 0.7, 0.92], target: [0.28, 0.14, 0.1], v: 0.55, arc: true,
    ops: ['ass', 'enc', 'eti', 'vis', 'bin', 'deg'] },
  delta: { build: () => delta({ Ht: 0.72, Rb: 0.12, rf: 0.22, re: 0.58, Re: 0.045, r: 0.03 }), u: 0.055, A: [0.0, 0.15], B: [0.0, -0.15], cam: [0.95, 0.72, 0.85], target: [0, 0.26, 0], v: 1.0,
    ops: ['enc', 'vis', 'deg', 'far', 'con', 'ass'] },
  gantry: { build: () => gantry({ W: 1.7, D: 1.3, Hg: 1.05, r: 0.05 }), u: 0.13, A: [-0.42, 0.18], B: [0.38, -0.12], cam: [0.35, 1.2, 1.95], target: [0, 0.24, 0], v: 0.8,
    ops: ['pal', 'enc', 'ass', 'eti', 'vis', 'bin', 'con'] },
  mobile: { mobile: true, u: 0.45, cam: [3.2, 2.6, 3.6], target: [0, 0.1, 0], ops: ['shu', 'rou'] }
};

// ---------------------------------------------------------------- the widget
function mount(host) {
  const key = host.dataset.robot, R = ROBOTS[key]; if (!R) return;
  host.innerHTML = `<div class="opsd-bar" role="group" aria-label="${L('Operations', 'Opérations')}"></div>
    <p class="opsd-what"></p>
    <div class="opsd-view"><div class="opsd-step"><span class="opsd-dot"></span><span class="opsd-txt"></span></div>
      <div class="opsd-ctl"><button type="button" class="opsd-pause">${L('Pause', 'Pause')}</button><button type="button" class="opsd-restart">${L('Restart', 'Recommencer')}</button></div></div>`;
  const bar = host.querySelector('.opsd-bar'), what = host.querySelector('.opsd-what'), view = host.querySelector('.opsd-view'), txt = host.querySelector('.opsd-txt');
  const pauseBtn = host.querySelector('.opsd-pause'), restartBtn = host.querySelector('.opsd-restart');

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(42, 1, 0.02, 60);
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  view.prepend(renderer.domElement);
  const orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.maxPolarAngle = Math.PI * 0.49;
  camera.position.set(...R.cam); orbit.target.set(...R.target);
  const hemi = new THREE.HemisphereLight('#ffffff', '#3a3a3a', 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffffff', 1.9), span = R.mobile ? 4 : 1.6; sun.position.set(span * 0.9, span * 2, span * 0.6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 0.1, far: span * 6 }); sun.shadow.bias = -0.0005; scene.add(sun);
  // ground: light grey around, dark grey under the grid (light mode); dark workshop (dark mode)
  const gsize = R.mobile ? 8 : 2.4, grid = new THREE.GridHelper(gsize, R.mobile ? 16 : 12, '#7a7a7a', '#3a3a3a'); grid.position.y = 0.001; scene.add(grid);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(gsize, gsize).rotateX(-Math.PI / 2), M('#7d8691', { roughness: 1 })); pad.receiveShadow = true; scene.add(pad);
  const isLight = () => (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light';
  const gc = grid.geometry.attributes.color, g0 = gc.array.slice();
  function paint() {
    const Lt = isLight(); scene.background = new THREE.Color(Lt ? '#d9dde3' : '#262626'); pad.material.color.set(Lt ? '#7d8691' : '#2b2e33');
    hemi.groundColor.set(Lt ? '#c9d0d8' : '#3a3a3a');
    const a = new THREE.Color(Lt ? '#c3cad3' : '#7a7a7a'), b = new THREE.Color(Lt ? '#a3acb7' : '#3d4148'), mid = (new THREE.Color('#7a7a7a').r + new THREE.Color('#3a3a3a').r) / 2;
    for (let i = 0; i < g0.length; i += 3) { const c = g0[i] > mid ? a : b; gc.array[i] = c.r; gc.array[i + 1] = c.g; gc.array[i + 2] = c.b; } gc.needsUpdate = true;
    host.classList.toggle('light', Lt);
  }
  paint(); new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', paint);

  // robot + tool
  const u = R.u, robot = R.mobile ? null : R.build(), tool = R.mobile ? null : makeGripper(u);
  if (robot) { scene.add(robot.root); robot.root.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); scene.add(tool); tool.traverse((o) => { if (o.isMesh) o.castShadow = true; }); tool.userData.nBase = tool.children.length; }
  const toolLen = tool ? tool.userData.len : 0;
  const tip = V(0, 0, 0); let yaw = 0, ikFails = 0;
  function setTip(p, y = yaw) {
    const f = p.clone(); f.y += toolLen;
    if (!robot.reach(f)) { ikFails++; return false; }
    tip.copy(p); yaw = y; tool.position.copy(p); tool.rotation.y = y; return true;
  }
  const props = new THREE.Group(); scene.add(props);
  const A = R.A ? V(R.A[0], 0, R.A[1]) : V(0, 0, 0), B = R.B ? V(R.B[0], 0, R.B[1]) : V(0, 0, 0);
  const HOME = !R.A ? null : R.arc ? (() => { const a = lerpAng(Math.atan2(A.z, A.x), Math.atan2(B.z, B.x), 0.5), r = (Math.hypot(A.x, A.z) + Math.hypot(B.x, B.z)) / 2; return V(r * Math.cos(a), 4.2 * u, r * Math.sin(a)); })() : A.clone().lerp(B, 0.5).setY(4.2 * u);

  // ------------------------------------------------ tiny timeline: tweens driven by the render loop
  let token = 0, paused = false, speed = 1; const tweens = [], tickers = new Set();
  const ctxFor = (tok) => {
    const alive = () => tok === token, never = new Promise(() => {});
    const tw = (dur, fn) => (alive() ? new Promise((res) => tweens.push({ t: 0, dur: Math.max(dur, 1e-3), fn, res, tok })) : never);
    const c = {
      alive, tw,
      say(en, fr) { if (alive()) { txt.textContent = L(en, fr); } },
      wait: (s) => tw(s, () => {}),
      async move(p, dur, y = yaw) {                           // straight line of the tool tip (an arc around the base for robots that turn on a base)
        const from = tip.clone(), y0 = yaw, d = from.distanceTo(p);
        const r0 = Math.hypot(from.x, from.z), r1 = Math.hypot(p.x, p.z), a0 = Math.atan2(from.z, from.x), a1 = Math.atan2(p.z, p.x);
        const arc = R.arc && r0 > 1e-3 && r1 > 1e-3 && Math.abs(lerpAng(0, a1 - a0, 1)) > 0.05;
        await tw(dur || Math.max(0.35, d / R.v + 0.15), (k) => {
          const e = ease(k);
          if (arc) { const r = r0 + (r1 - r0) * e, a = lerpAng(a0, a1, e); setTip(V(r * Math.cos(a), from.y + (p.y - from.y) * e, r * Math.sin(a)), lerpAng(y0, y, e)); }
          else setTip(from.clone().lerp(p, e), lerpAng(y0, y, e));
        });
      },
      grip(w, dur = 0.35) { const w0 = tool.userData.open; return tw(dur, (k) => tool.setOpen(w0 + (w - w0) * ease(k))); },
      // pick obj (resting on the scene) and put it with its base at dst (world), turned by rotY
      async transfer(obj, dst, o = {}) {
        const h = obj.userData.h, gd = Math.min(h * 0.5, 0.45 * u), travel = o.travel ?? c.travel, ry = o.rotY ?? obj.rotation.y;
        const src = obj.getWorldPosition(V(0, 0, 0));
        await c.move(V(src.x, travel, src.z), null, o.yaw ?? 0);
        await c.move(V(src.x, src.y + h - gd, src.z), Math.max(0.3, (travel - src.y) / R.v * 0.7));
        await c.grip(obj.userData.w + 0.02 * u);
        tool.attach(obj); if (o.onGrab) o.onGrab();
        await c.move(V(src.x, travel, src.z), Math.max(0.3, (travel - src.y) / R.v * 0.7));
        if (o.via) await o.via();
        await c.move(V(dst.x, travel, dst.z), null, (o.yaw ?? 0) + (o.turn || 0));
        await c.move(V(dst.x, dst.y + h - gd, dst.z), Math.max(0.3, (travel - dst.y) / R.v * 0.7));
        await c.grip(0.55 * u);
        props.attach(obj); obj.position.copy(dst); obj.rotation.set(0, ry, 0);
        await c.move(V(dst.x, travel, dst.z), Math.max(0.3, (travel - dst.y) / R.v * 0.7));
      },
      ticker(fn) { if (!alive()) return () => {}; const t = { fn, tok }; tickers.add(t); return () => tickers.delete(t); },
      travel: 3 * u
    };
    return c;
  };
  const add = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; props.add(o); o.traverse((m) => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); return o; };
  const dirOut = (P) => V(P.x, 0, P.z).normalize();                    // horizontal direction from the base to P
  const side = (P) => V(-P.z, 0, P.x).normalize();                     // horizontal direction across

  // ------------------------------------------------ the operation scripts (manipulators)
  const S = {
    async pal(c) {
      c.travel = 4.4 * u;
      const pl = add(pallet(u), B.x, 0, B.z, Math.atan2(-B.z, B.x)), ph = pl.userData.h;
      const d = dirOut(A), cv = add(conveyor(4 * u, 1.3 * u, 0.9 * u, V(-d.x, 0, -d.z), u), A.x + d.x * 3.4 * u, 0, A.z + d.z * 3.4 * u);
      const ax = dirOut(B), ac = side(B), slots = [];
      for (let layer = 0; layer < 2; layer++) for (const [i, j] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) slots.push(B.clone().addScaledVector(ax, i * 0.6 * u).addScaledVector(ac, j * 0.6 * u).setY(ph + layer * 0.9 * u));
      for (let n = 0; n < slots.length; n++) {
        c.say(`Box ${n + 1} of ${slots.length} arrives on the conveyor`, `Le colis ${n + 1} sur ${slots.length} arrive sur le convoyeur`);
        const p = add(parcel(u), A.x + d.x * 3.2 * u, 0.9 * u, A.z + d.z * 3.2 * u, Math.atan2(-d.z, d.x));
        const from = p.position.clone(), to = V(A.x - d.x * 0.1 * u, 0.9 * u, A.z - d.z * 0.1 * u);
        if (n === 0) await c.move(V(A.x, c.travel, A.z));
        await c.tw(1.1, (k) => { p.position.copy(from.clone().lerp(to, ease(k))); cv.tick(0.02 * u); });
        c.say(`Pick box ${n + 1} and place it on layer ${n < 4 ? 1 : 2} of the pallet`, `Prendre le colis ${n + 1} et le poser sur la couche ${n < 4 ? 1 : 2} de la palette`);
        await c.transfer(p, slots[n], { rotY: pl.rotation.y });
      }
      c.say('Pallet complete: 2 layers of 4 boxes', 'Palette terminée : 2 couches de 4 colis'); await c.wait(1.5);
    },
    async enc(c) {
      c.travel = 3.0 * u;
      const ct = add(carton(u, 1.25 * u, 1.85 * u, 1.05 * u), B.x, 0, B.z, Math.atan2(-B.z, B.x));
      const ax = dirOut(B), ac = side(B), d = dirOut(A), sd = side(A), bottles = [], slots = [];
      for (let i = 0; i < 6; i++) bottles.push(add(bottle(u), A.x + sd.x * (i - 2.5) * 0.5 * u, 0, A.z + sd.z * (i - 2.5) * 0.5 * u));
      for (const i of [-1, 1]) for (const j of [-1, 0, 1]) slots.push(B.clone().addScaledVector(ax, i * 0.3 * u).addScaledVector(ac, j * 0.58 * u).setY(0.04 * u));
      for (let n = 0; n < 6; n++) {
        c.say(`Bottle ${n + 1} of 6 into its slot in the carton`, `Bouteille ${n + 1} sur 6 dans sa case du carton`);
        await c.transfer(bottles[n], slots[n]);
      }
      c.say('Close the carton flaps', 'Fermer les rabats du carton');
      await c.move(HOME.clone());
      await c.tw(0.9, (k) => ct.userData.flaps.forEach((f) => { f.rotation.z = f.userData.s * 1.9 * (1 - ease(k)); }));
      c.say('Carton packed and closed', 'Carton rempli et fermé'); await c.wait(1.4);
    },
    async far(c) {
      c.travel = 2.3 * u;
      const sd = side(A), d = dirOut(A), bottles = [], ax = dirOut(B), ac = side(B), slots = [];
      const spots = [[-1.2, -0.6], [0.1, -0.9], [1.1, -0.4], [-0.8, 0.6], [0.4, 0.5], [1.4, 0.8]];
      spots.forEach(([i, j]) => bottles.push(add(bottle(u), A.x + sd.x * i * u + d.x * j * u, 0, A.z + sd.z * i * u + d.z * j * u)));
      const base = add(tray(u, 1.6 * u, 2.1 * u), B.x, 0, B.z, Math.atan2(-B.z, B.x));
      for (const i of [-1, 1]) for (const j of [-1, 0, 1]) slots.push(B.clone().addScaledVector(ax, i * 0.21 * u).addScaledVector(ac, j * 0.41 * u).setY(0.06 * u));
      for (let n = 0; n < 6; n++) { c.say(`Group the bottles: ${n + 1} of 6`, `Regrouper les bouteilles : ${n + 1} sur 6`); await c.transfer(bottles[n], slots[n]); }
      await c.move(HOME.clone());
      c.say('Wrap the pack in shrink film and heat it', 'Entourer le lot d\'un film et le chauffer');
      const film = new THREE.Mesh(new THREE.BoxGeometry(0.95 * u, 1.0 * u, 1.35 * u).translate(0, 0.5 * u, 0), MAT.film.clone());
      film.position.copy(B).setY(0.06 * u); film.rotation.y = base.rotation.y; props.add(film);
      await c.tw(1.2, (k) => { film.material.opacity = 0.45 * ease(k); film.scale.setScalar(1.15 - 0.15 * ease(k)); film.material.emissive = new THREE.Color('#ff8a3d'); film.material.emissiveIntensity = Math.sin(k * Math.PI) * 0.8; });
      c.say('Pack of 6 ready', 'Lot de 6 prêt'); await c.wait(1.4);
    },
    async eti(c) {
      c.travel = 2.6 * u;
      const bx = add(box(1.5 * u, 0.9 * u, 1.1 * u, MAT.card), B.x, 0, B.z, Math.atan2(-B.z, B.x));
      const disp = add(box(0.9 * u, 0.5 * u, 0.9 * u, MAT.dark), A.x, 0, A.z);
      const tex = textTexture([L('LOT 2411-07', 'LOT 2411-07'), '11/2026'], 256, 128);
      const lab = add(box(0.7 * u, 0.02 * u, 0.5 * u, new THREE.MeshStandardMaterial({ color: '#ffffff', map: tex, roughness: 0.6 })), A.x, 0.5 * u, A.z);
      tex.draw(0); lab.userData = { h: 0.02 * u, w: 0.02 * u };
      c.say('Take a label from the dispenser', 'Prendre une étiquette dans le distributeur');
      await c.transfer(lab, V(B.x, 0.9 * u, B.z), { rotY: bx.rotation.y + Math.PI / 2, travel: 2.6 * u, onGrab: () => {} });
      c.say('Label pressed onto the box', 'Étiquette pressée sur la boîte');
      await c.wait(0.3);
      c.say('Laser marking: batch number and date', 'Marquage laser : numéro de lot et date');
      tool.userData.cam.visible = false;
      const beam = cyl(0.025 * u, 1, new THREE.MeshBasicMaterial({ color: '#ff3030' }), 10, false); props.add(beam);
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.06 * u, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffd0d0' })); props.add(spot);
      const top = V(B.x, 0.9 * u + 0.025 * u, B.z), total = 19;
      await c.move(V(B.x, 1.9 * u, B.z));
      await c.tw(2.6, (k) => {
        const n = Math.floor(k * total); tex.draw(n);
        const t = top.clone().add(V((Math.random() - 0.5) * 0.4 * u, 0, (Math.random() - 0.5) * 0.3 * u));
        rodBetween(beam, V(tip.x, tip.y + 0.1 * u, tip.z), t); spot.position.copy(t); beam.visible = spot.visible = k < 0.999;
      });
      tex.draw(); props.remove(beam); props.remove(spot);
      c.say('Box labelled and marked', 'Boîte étiquetée et marquée'); await c.wait(1.4);
    },
    async vis(c) {
      c.travel = 2.4 * u;
      const sd = side(A), d = dirOut(A), parts = [], bad = 2;
      add(tray(u, 4.6 * u, 1.6 * u), A.x, 0, A.z, Math.atan2(-sd.z, sd.x));
      for (let i = 0; i < 4; i++) { const p = add(bottle(u, i === bad ? M('#7cc4a4', { roughness: 0.15 }) : MAT.glass), A.x + sd.x * (i - 1.5) * 1.1 * u, 0.06 * u, A.z + sd.z * (i - 1.5) * 1.1 * u); parts.push(p); }
      parts[bad].children[3].material = M('#2a313b');                    // wrong (missing) red cap: the defect
      const rej = add(binBox(u, 1.5 * u, 1.5 * u, 0.9 * u, MAT.rejBin), B.x, 0, B.z);
      tool.userData.cam.visible = true;
      const cone = flashCone(u, 1.3 * u); props.add(cone);
      for (let i = 0; i < 4; i++) {
        const p = parts[i].position;
        c.say(`Camera checks part ${i + 1} of 4`, `La caméra contrôle la pièce ${i + 1} sur 4`);
        await c.move(V(p.x, 2.1 * u, p.z - 0.32 * u));
        cone.position.set(p.x, 2.1 * u + 0.6 * u, p.z);
        await c.tw(0.5, (k) => { cone.material.opacity = Math.sin(k * Math.PI) * 0.35; });
        const ok = i !== bad; add(marker(u, ok), p.x, 0.065 * u, p.z);
        c.say(ok ? `Part ${i + 1}: OK` : `Part ${i + 1}: defect found (wrong cap)`, ok ? `Pièce ${i + 1} : conforme` : `Pièce ${i + 1} : défaut détecté (mauvais bouchon)`);
        await c.wait(ok ? 0.25 : 0.7);
      }
      tool.userData.cam.visible = false;
      c.say('Take the defective part out to the reject bin', 'Sortir la pièce défectueuse vers le bac de rebut');
      await c.transfer(parts[bad], V(B.x, 0.05 * u, B.z), { travel: 2.6 * u });
      c.say('Inspection done: 3 good, 1 rejected', 'Contrôle terminé : 3 conformes, 1 rejetée'); await c.wait(1.4);
    },
    async bin(c) {
      c.travel = 2.6 * u;
      const bn = add(binBox(u, 2.2 * u, 2.2 * u, 0.8 * u, MAT.bin), A.x, 0, A.z), parts = [];
      const rnd = [[-0.5, -0.4, 0.3], [0.4, -0.5, 1.9], [-0.3, 0.5, 2.6], [0.5, 0.4, 0.9], [0.0, 0.0, 1.4]];
      rnd.forEach(([x, z, r]) => parts.push(add(partL(u), A.x + x * u, 0.05 * u, A.z + z * u, r)));
      const t = add(tray(u, 1.2 * u, 3.4 * u), B.x, 0, B.z, Math.atan2(-B.z, B.x)), ac = side(B);
      const pole = add(box(0.08 * u, 3.4 * u, 0.08 * u, MAT.frame), A.x + dirOut(A).x * 1.6 * u, 0, A.z + dirOut(A).z * 1.6 * u);
      const camH = add(box(0.5 * u, 0.25 * u, 0.35 * u, MAT.black), A.x + dirOut(A).x * 1.6 * u, 3.4 * u, A.z + dirOut(A).z * 1.6 * u);
      const cone = flashCone(u * 1.6, 3.2 * u); props.add(cone); cone.position.set(A.x, 3.3 * u, A.z);
      for (let n = 0; n < 4; n++) {
        c.say('3D camera scans the bin…', 'La caméra 3D scanne le bac…');
        await c.tw(0.55, (k) => { cone.material.opacity = Math.sin(k * Math.PI) * 0.3; });
        const p = parts[n], keep = p.children.map((m) => m.material);
        p.children.forEach((m) => { m.material = M('#30a46c', { emissive: '#1f7a4c', emissiveIntensity: 0.6 }); });
        c.say(`Part found: pick part ${n + 1} and line it up on the tray`, `Pièce trouvée : prendre la pièce ${n + 1} et l'aligner sur le plateau`);
        await c.wait(0.3); p.children.forEach((m, i) => { m.material = keep[i]; });
        await c.transfer(p, B.clone().addScaledVector(ac, (n - 1.5) * 0.8 * u).setY(0.06 * u), { yaw: p.rotation.y, turn: -p.rotation.y + t.rotation.y, rotY: t.rotation.y });
      }
      c.say('Bin picking done: parts lined up', 'Dévracage terminé : pièces alignées'); await c.wait(1.4);
    },
    async deg(c) {
      c.travel = 2.2 * u;
      const sd = side(A), pots = [], links = [];
      for (let i = 0; i < 4; i++) { const p = add(cyl(0.3 * u, 0.6 * u, MAT.pot), A.x + sd.x * (i - 1.5) * 0.66 * u, 0, A.z + sd.z * (i - 1.5) * 0.66 * u); const lid = cyl(0.31 * u, 0.04 * u, MAT.cap); lid.position.y = 0.6 * u; p.add(lid); p.userData = { h: 0.64 * u, w: 0.3 * u }; pots.push(p); }
      for (let i = 0; i < 3; i++) { const l = add(box(0.14 * u, 0.5 * u, 0.06 * u, MAT.pot), A.x + sd.x * (i - 1) * 0.66 * u, 0.05 * u, A.z + sd.z * (i - 1) * 0.66 * u, Math.atan2(-sd.z, sd.x)); links.push(l); }
      const ac = side(B);
      for (let n = 0; n < 4; n++) {
        const p = pots[n];
        c.say(n < 3 ? `Hold pot ${n + 1} and break the link with its neighbour` : 'Last pot: already free', n < 3 ? `Tenir le pot ${n + 1} et casser le lien avec son voisin` : 'Dernier pot : déjà libre');
        await c.transfer(p, B.clone().addScaledVector(ac, (n - 1.5) * 1.0 * u), {
          onGrab: () => {},
          via: n < 3 ? async () => { const l = links[n]; await c.tw(0.35, (k) => { l.rotation.z = 0.8 * k; l.scale.setScalar(1 - 0.6 * k); }); props.remove(l); } : null
        });
      }
      c.say('Pots separated and spaced out', 'Pots séparés et espacés'); await c.wait(1.4);
    },
    async con(c) {
      c.travel = 2.0 * u;
      const ax = V(1, 0, 0), len = 5 * u;
      const cin = add(conveyor(len, 1.2 * u, 0.8 * u, ax, u), A.x - len + 0.5 * u, 0, A.z);
      const cout = add(conveyor(len, 1.2 * u, 0.8 * u, ax, u), B.x - 0.5 * u, 0, B.z);
      for (let n = 0; n < 4; n++) {
        c.say(`Product ${n + 1} arrives on the infeed belt`, `Le produit ${n + 1} arrive sur le tapis d'entrée`);
        const p = add(box(0.7 * u, 0.5 * u, 0.7 * u, n % 2 ? MAT.blue : MAT.red), A.x - len + 0.9 * u, 0.8 * u, A.z); p.userData = { h: 0.5 * u, w: 0.35 * u };
        const from = p.position.clone();
        if (n === 0) await c.move(V(A.x, c.travel, A.z));
        await c.tw(1.0, (k) => { p.position.x = from.x + (A.x - from.x) * ease(k); cin.tick(0.03 * u); });
        c.say('Pick it and transfer it to the outfeed belt', 'Le prendre et le transférer sur le tapis de sortie');
        await c.transfer(p, V(B.x, 0.8 * u, B.z));
        const p0 = p.position.clone();
        c.tw(1.4, (k) => { p.position.x = p0.x + k * (len - 0.9 * u); cout.tick(0.03 * u); if (k >= 1) props.remove(p); });
      }
      await c.wait(1.5); c.say('4 products transferred', '4 produits transférés'); await c.wait(1);
    },
    async amr(c) {
      c.travel = 2.8 * u;
      const d = dirOut(A), sd = side(A), amr = makeAMR(4.2 * u), stop = A.clone();
      add(amr, A.x + sd.x * 14 * u, 0, A.z + sd.z * 14 * u, Math.atan2(sd.z, -sd.x)); amr.rotation.y = Math.atan2(sd.z, -sd.x);
      const deck = amr.userData.deck, tote = binBox(u, 2.6 * u, 1.9 * u, 0.6 * u, MAT.bin); tote.position.y = deck; amr.add(tote);
      const parts = [-0.7, 0, 0.7].map((x) => { const p = partL(u); p.position.set(x * u, deck + 0.05 * u, 0); p.rotation.y = Math.PI / 2; amr.add(p); return p; });
      const t = add(tray(u, 1.2 * u, 3.2 * u), B.x, 0, B.z, Math.atan2(-B.z, B.x)), ac = side(B);
      await c.move(HOME.clone());
      c.say('The AMR drives in with a tote of parts', 'L\'AMR arrive avec un bac de pièces');
      const from = amr.position.clone();
      await c.tw(2.2, (k) => { amr.position.copy(from.clone().lerp(stop, ease(k))); amr.userData.wheels.forEach((w) => { w.rotation.z -= 0.15; }); amr.userData.ring.material.opacity = 0.35; });
      amr.userData.ring.material.opacity = 0;
      for (let n = 0; n < 3; n++) {
        c.say(`Unload part ${n + 1} of 3`, `Décharger la pièce ${n + 1} sur 3`);
        props.attach(parts[n]);
        await c.transfer(parts[n], B.clone().addScaledVector(ac, (n - 1) * 0.9 * u).setY(0.06 * u), { rotY: t.rotation.y, yaw: parts[n].rotation.y });
      }
      await c.move(HOME.clone());
      c.say('The AMR leaves for its next mission', 'L\'AMR repart pour sa mission suivante');
      const go = amr.position.clone(), far = go.clone().addScaledVector(sd, -14 * u);
      await c.tw(2.2, (k) => { amr.position.copy(go.clone().lerp(far, ease(k))); amr.userData.wheels.forEach((w) => { w.rotation.z -= 0.15; }); amr.userData.ring.material.opacity = 0.35; });
      c.say('Tote unloaded', 'Bac déchargé'); await c.wait(1);
    },
    async ass(c) {
      c.travel = 2.4 * u;
      const ry = Math.atan2(-B.z, B.x), housing = add(box(1.6 * u, 0.55 * u, 1.6 * u, MAT.dark), B.x, 0, B.z, ry);
      const cover = add(box(1.6 * u, 0.12 * u, 1.6 * u, MAT.orange), A.x, 0, A.z, ry); cover.userData = { h: 0.12 * u, w: 0.2 * u };
      c.say('Place the cover on the housing', 'Poser le couvercle sur le boîtier');
      await c.transfer(cover, V(B.x, 0.55 * u, B.z), { rotY: ry });
      const ax = dirOut(B), ac = side(B), top = 0.67 * u;
      tool.setOpen(0.05 * u);
      for (let n = 0; n < 4; n++) {
        const [i, j] = [[-1, -1], [1, -1], [1, 1], [-1, 1]][n], P = B.clone().addScaledVector(ax, i * 0.6 * u).addScaledVector(ac, j * 0.6 * u);
        c.say(`Drive screw ${n + 1} of 4`, `Visser la vis ${n + 1} sur 4`);
        const sc = add(cyl(0.09 * u, 0.06 * u, MAT.steel), P.x, top + 0.25 * u, P.z);
        await c.move(V(P.x, top + 0.95 * u, P.z));
        await c.move(V(P.x, top + 0.31 * u, P.z), 0.4);
        const y0 = yaw;
        await c.tw(0.9, (k) => { setTip(V(P.x, top + 0.31 * u - 0.25 * u * k, P.z), y0 + k * 18); sc.position.y = top + 0.25 * u - 0.25 * u * k; sc.rotation.y = k * 18; });
        sc.position.y = top; yaw = y0;
        await c.move(V(P.x, top + 0.95 * u, P.z), 0.4, y0);
      }
      tool.setOpen(0.55 * u);
      c.say('Assembly done: cover screwed on', 'Assemblage terminé : couvercle vissé'); await c.wait(1.4);
    }
  };

  // ------------------------------------------------ mobile robot (AMR) scripts
  let amr = null;
  function amrDrive(c, pts, v = 0.9) {                       // turn on the spot to face each point, then drive straight to it
    return (async () => {
      for (const P of pts) {
        const d = P.clone().sub(amr.position); d.y = 0; const dist = d.length(); if (dist < 1e-3) continue;
        const h = Math.atan2(-d.z, d.x), h0 = amr.rotation.y;
        await c.tw(Math.abs(lerpAng(0, h - h0, 1)) / 2.2 + 0.1, (k) => { amr.rotation.y = lerpAng(h0, h, ease(k)); amr.userData.wheels.forEach((w, i) => { w.rotation.z += (i ? 0.08 : -0.08); }); });
        const from = amr.position.clone();
        await c.tw(dist / v, (k) => { amr.position.copy(from.clone().lerp(P, ease(k))); amr.userData.wheels.forEach((w) => { w.rotation.z -= 0.2; }); amr.userData.ring.material.opacity = 0.3 + 0.15 * Math.sin(performance.now() / 120); });
        amr.userData.ring.material.opacity = 0;
      }
    })();
  }
  function station(x, z, label) {
    const g = new THREE.Group(); g.add(box(0.7, 0.32, 0.5, MAT.frame));
    for (let i = 0; i < 5; i++) { const r = cylZ(0.025, 0.46, MAT.steel); r.position.set(-0.28 + i * 0.14, 0.33, 0); g.add(r); }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), new THREE.MeshBasicMaterial({ map: textTexture([label], 128, 64, '#2f6bff', '#ffffff') })); sign.position.set(0, 0.9, -0.26); g.add(sign);
    const post = box(0.03, 0.8, 0.03, MAT.frame); post.position.set(0, 0, -0.26); g.add(post);
    return add(g, x, 0, z);
  }
  const SM = {
    async shu(c) {
      const sa = station(-2.2, -0.6, 'A'), sb = station(2.2, 0.8, 'B');
      sa.rotation.y = 0; sb.rotation.y = Math.PI;
      const tote = binBox(1, 0.42, 0.34, 0.2, MAT.bin); tote.position.set(-2.2, 0.355, -0.6); props.add(tote);
      amr.position.set(-0.6, 0, -1.6); amr.rotation.y = Math.PI / 2;
      c.say('The AMR goes to station A', 'L\'AMR va au poste A');
      await amrDrive(c, [V(-1.0, 0, -0.6), V(-1.45, 0, -0.6)]);
      await c.tw(0.6, (k) => { amr.rotation.y = lerpAng(amr.rotation.y, 0, ease(k)); });
      c.say('The tote rolls from the station onto the AMR', 'Le bac roule du poste sur l\'AMR');
      const t0 = tote.position.clone(), deck = amr.userData.deck, onAmr = V(amr.position.x, deck, amr.position.z);
      await c.tw(1.0, (k) => { tote.position.copy(t0.clone().lerp(onAmr, ease(k))); });
      amr.attach(tote);
      c.say('Drive to station B, around the other machines', 'Rouler jusqu\'au poste B, en contournant les autres machines');
      await amrDrive(c, [V(-0.6, 0, -0.6), V(0.2, 0, 0.8), V(1.45, 0, 0.8)]);
      await c.tw(0.6, (k) => { amr.rotation.y = lerpAng(amr.rotation.y, Math.PI, ease(k)); });
      c.say('The tote rolls onto station B', 'Le bac roule sur le poste B');
      props.attach(tote); const t1 = tote.position.clone();
      await c.tw(1.0, (k) => { tote.position.copy(t1.clone().lerp(V(2.2, 0.355, 0.8), ease(k))); });
      c.say('Delivered: no rail, no conveyor in between', 'Livré : sans rail ni convoyeur entre les deux'); await c.wait(1.2);
      await amrDrive(c, [V(0.6, 0, 0.8), V(-0.6, 0, -1.6)]);
    },
    async rou(c) {
      for (const [x, z, w, d] of [[0, 0, 1.6, 0.5], [-1.2, 1.6, 0.5, 1.4], [1.4, -1.6, 1.2, 0.5]]) {
        const sh = add(new THREE.Group(), x, 0, z);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const post = box(0.05, 1.2, 0.05, MAT.blue); post.position.set(sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03)); sh.add(post); }
        for (let i = 0; i < 4; i++) {
          const b = box(w, 0.04, d, MAT.frame); b.position.y = 0.12 + i * 0.34; sh.add(b);
          if (i < 3) for (let k = 0; k < Math.floor(Math.max(w, d) / 0.32); k++) { const along = -Math.max(w, d) / 2 + 0.18 + k * 0.32, c = box(0.24, 0.2, 0.24, (k + i) % 3 ? MAT.card : MAT.cardDark); c.position.set(w > d ? along : 0, 0.16 + i * 0.34, w > d ? 0 : along); sh.add(c); }
        }
        sh.traverse((m) => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });
      }
      const stA = station(-2.6, -1.4, '1'), stB = station(2.6, -0.2, '2'), stC = station(-0.2, 2.6, '3'); stB.rotation.y = Math.PI; stC.rotation.y = Math.PI / 2;
      const person = new THREE.Group(); { const b = cyl(0.13, 0.75, MAT.blue); b.position.y = 0.75; person.add(b); const legs = cyl(0.11, 0.75, MAT.dark); person.add(legs); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), M('#f0c8a0')); hd.position.y = 1.62; person.add(hd); }
      add(person, 1.2, 0, 3.4); person.visible = false;
      amr.position.set(-2.6, 0, -0.7); amr.rotation.y = 0;
      c.say('Stop 1: load the order', 'Arrêt 1 : charger la commande'); await c.wait(0.8);
      c.say('Drive to stop 2, around the shelves', 'Rouler vers l\'arrêt 2, en contournant les étagères');
      await amrDrive(c, [V(-1.0, 0, -0.9), V(1.0, 0, -0.9), V(2.0, 0, -0.2)]);
      c.say('Stop 2: hand over the parts', 'Arrêt 2 : livrer les pièces'); await c.wait(0.8);
      c.say('Drive to stop 3', 'Rouler vers l\'arrêt 3');
      await amrDrive(c, [V(2.0, 0, 1.0)], 0.9);
      person.visible = true; person.position.set(2.0 + 1.6, 0, 1.9);
      const ring = amr.userData.ring;
      c.say('A person crosses: the safety scanner stops the AMR', 'Une personne traverse : le scanner de sécurité arrête l\'AMR');
      await c.tw(2.4, (k) => { person.position.x = 3.6 - 3.2 * k; person.rotation.y = Math.PI; ring.material.color.set(k < 0.85 ? '#e5484d' : '#f5c518'); ring.material.opacity = 0.6; });
      person.visible = false; ring.material.color.set('#30a46c');
      c.say('Path clear: the AMR goes on', 'Voie libre : l\'AMR repart');
      await amrDrive(c, [V(1.0, 0, 2.6), V(0.5, 0, 2.6)]);
      c.say('Stop 3: done. Back to stop 1', 'Arrêt 3 : terminé. Retour à l\'arrêt 1'); await c.wait(0.6);
      await amrDrive(c, [V(-0.3, 0, 1.0), V(-2.0, 0, 0.2), V(-2.6, 0, -0.7)]);
    }
  };
  if (R.mobile) { amr = makeAMR(0.9); scene.add(amr); amr.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); amr.userData.nBase = amr.children.length; }

  // ------------------------------------------------ run / switch operations
  let current = null;
  function clearProps() {
    while (props.children.length) props.remove(props.children[0]);
    for (const g of [tool, amr]) if (g) while (g.children.length > g.userData.nBase) g.remove(g.children[g.children.length - 1]);   // anything still carried
  }
  async function run(op) {
    const tok = ++token; tweens.length = 0; tickers.clear();
    current = op; clearProps(); paused = false; pauseBtn.textContent = L('Pause', 'Pause');
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.op === op)));
    what.textContent = OPS[op][1];
    if (robot) { tool.setOpen(0.55 * u); tool.userData.cam.visible = false; setTip(HOME.clone(), 0); }
    const script = (R.mobile ? SM : S)[op];
    while (tok === token) {
      const c = ctxFor(tok);
      await script(c);
      if (tok !== token) return;
      if (robot) await c.move(HOME.clone(), null, 0);
      clearProps(); if (robot) { tool.userData.cam.visible = false; tool.setOpen(0.55 * u); }
      if (amr) { amr.position.set(0, 0, 0); }
      await c.wait(0.3);
    }
  }
  bar.innerHTML = R.ops.map((k) => `<button type="button" data-op="${k}" aria-pressed="false">${OPS[k][0]}</button>`).join('');
  bar.addEventListener('click', (e) => { const b = e.target.closest('button[data-op]'); if (b) run(b.dataset.op); });
  pauseBtn.addEventListener('click', () => { paused = !paused; pauseBtn.textContent = paused ? L('Resume', 'Reprendre') : L('Pause', 'Pause'); host.classList.toggle('paused', paused); });
  restartBtn.addEventListener('click', () => run(current));

  // ------------------------------------------------ render loop (only while visible)
  function resize() { const w = view.clientWidth, h = view.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(view); resize();
  let visible = true, last = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(view);
  function step(dt) {
    for (let i = 0; i < tweens.length; i++) {
      const t = tweens[i]; if (t.tok !== token) { tweens.splice(i--, 1); continue; }
      t.t += dt; const k = Math.min(1, t.t / t.dur); t.fn(k);
      if (k >= 1) { tweens.splice(i--, 1); t.res(); }
    }
  }
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible) return;
    if (!paused) step(dt * speed);
    orbit.update(); renderer.render(scene, camera);
  });
  // test hook: runs the simulation fast, without rendering (used by the automated checks)
  host.__test = async (op, seconds = 90) => {
    run(op); ikFails = 0; const seen = [];
    for (let i = 0; i < seconds * 30; i++) { step(1 / 30); for (let k = 0; k < 6; k++) await null; if (seen[seen.length - 1] !== txt.textContent) seen.push(txt.textContent); }
    return { ikFails, steps: seen.length, last: seen.slice(-3) };
  };
  run(R.ops[0]);
}
document.querySelectorAll('.opsdemo').forEach(mount);
