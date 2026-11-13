// build.js — "Build your first robot": a six-step workshop.
//   1 choose a robot · 2 discover its parts · 3 assemble it · 4 joints and degrees of freedom · 5 move it · 6 see how the motion is computed
// One generic engine: a robot is a chain of joints (R = revolute, P = prismatic); the 3D model, the sliders,
// the forward kinematics shown on the page and the numerical inverse kinematics all come from the same description.
// Usage:  <div class="byr" id="byr"></div>  +  <script type="module" src="build.js"></script>
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FR = (window.RA && RA.lang) === 'fr';
const L = (en, fr) => (FR ? fr : en);
const D2R = Math.PI / 180, V = (x, y, z) => new THREE.Vector3(x, y, z);
const AX = { x: V(1, 0, 0), y: V(0, 1, 0), z: V(0, 0, 1), '-y': V(0, -1, 0), '-z': V(0, 0, -1) };
const fmt = (v, d = 2) => v.toFixed(d).replace('.', FR ? ',' : '.').replace('-', '−');
const JC = ['#ff6b6b', '#3fbf6f', '#5aa9ff', '#b07cff'];         // one colour per joint

// ---------------------------------------------------------------- the robots
// scene axes: x to the right, y up, z towards the viewer. Shown to the learner as a robot frame with z up: X = x, Y = −z, Z = y.
// joint: type, axis (in the frame of the previous body), lim (deg or m), q0 (start value), link (vector to the next joint / to the tool)
const ROBOTS = {
  planar: {
    name: L('2-axis arm', 'Bras 2 axes'), code: 'R-R', lv: L('Easiest', 'Le plus simple'), page: ['learn-maths.html#l4', L('the 2-axis arm lesson', 'la leçon du bras à 2 axes')],
    desc: L('Two rotating joints in one plane. The best robot to understand the maths.', 'Deux liaisons qui tournent dans un plan. Le meilleur robot pour comprendre les maths.'),
    at: V(0, 0.35, 0), tool: 'x', cam: [V(0.35, 0.75, 2.5), V(0.35, 0.5, 0)],
    joints: [{ type: 'R', axis: 'z', lim: [0, 180], q0: 60, link: V(0.5, 0, 0) }, { type: 'R', axis: 'z', lim: [-150, 150], q0: -70, link: V(0.4, 0, 0) }],
    dof: L('2 DOF: the tool reaches any point (x, z) of its plane, inside its workspace. It cannot leave the plane or choose its own angle.', '2 ddl : l\'outil atteint n\'importe quel point (x, z) de son plan, dans son espace de travail. Il ne peut pas sortir du plan ni choisir son angle.'),
    fk: (q, p) => [`x = L₁ cos θ₁ + L₂ cos(θ₁+θ₂) = 0,5 × ${fmt(Math.cos(q[0] * D2R))} + 0,4 × ${fmt(Math.cos((q[0] + q[1]) * D2R))} = <b>${fmt(p.X)}</b> m`,
      `z = h + L₁ sin θ₁ + L₂ sin(θ₁+θ₂) = 0,35 + 0,5 × ${fmt(Math.sin(q[0] * D2R))} + 0,4 × ${fmt(Math.sin((q[0] + q[1]) * D2R))} = <b>${fmt(p.Z)}</b> m`]
  },
  arm: {
    name: L('3-axis arm', 'Bras 3 axes'), code: 'R-R-R', lv: L('Classic', 'Classique'), page: ['arm.html', L('the 3-axis arm page', 'la page du bras 3 axes')],
    desc: L('A turning base, a shoulder and an elbow: the skeleton of every industrial arm.', 'Une base qui tourne, une épaule et un coude : le squelette de tous les bras industriels.'),
    at: V(0, 0.22, 0), tool: 'x', cam: [V(1.5, 1.25, 2.0), V(0.15, 0.5, 0)],
    joints: [{ type: 'R', axis: 'y', lim: [-170, 170], q0: 25, link: V(0, 0.18, 0) }, { type: 'R', axis: 'z', lim: [-10, 170], q0: 70, link: V(0.45, 0, 0) }, { type: 'R', axis: 'z', lim: [-150, 150], q0: -80, link: V(0.38, 0, 0) }],
    dof: L('3 DOF: the tool reaches any position (x, y, z) inside its workspace, but it cannot choose its orientation. A 6-axis robot adds a 3-axis wrist for that.', '3 ddl : l\'outil atteint n\'importe quelle position (x, y, z) dans son espace de travail, mais il ne choisit pas son orientation. Un robot 6 axes ajoute un poignet à 3 axes pour cela.'),
    fk: (q, p) => { const r = 0.45 * Math.cos(q[1] * D2R) + 0.38 * Math.cos((q[1] + q[2]) * D2R); return [
      `r = L₂ cos θ₂ + L₃ cos(θ₂+θ₃) = 0,45 × ${fmt(Math.cos(q[1] * D2R))} + 0,38 × ${fmt(Math.cos((q[1] + q[2]) * D2R))} = ${fmt(r)} m`,
      `x = r cos θ₁ = ${fmt(r)} × ${fmt(Math.cos(q[0] * D2R))} = <b>${fmt(p.X)}</b> m`, `y = r sin θ₁ = ${fmt(r)} × ${fmt(Math.sin(q[0] * D2R))} = <b>${fmt(p.Y)}</b> m`,
      `z = h + L₂ sin θ₂ + L₃ sin(θ₂+θ₃) = 0,40 + 0,45 × ${fmt(Math.sin(q[1] * D2R))} + 0,38 × ${fmt(Math.sin((q[1] + q[2]) * D2R))} = <b>${fmt(p.Z)}</b> m`]; }
  },
  scara: {
    name: 'SCARA', code: 'R-R-P', lv: L('Fast assembly', 'Assemblage rapide'), page: ['scara.html', L('the SCARA page', 'la page du SCARA')],
    desc: L('Two joints that turn flat like a folding screen, and one that goes down. Very fast for pick and place.', 'Deux liaisons qui tournent à plat comme un paravent, et une qui descend. Très rapide pour prendre et poser.'),
    at: V(0, 0.62, 0), tool: '-y', cam: [V(1.1, 1.5, 2.0), V(0.3, 0.4, 0)],
    joints: [{ type: 'R', axis: 'y', lim: [-140, 140], q0: 30, link: V(0.42, 0, 0) }, { type: 'R', axis: 'y', lim: [-145, 145], q0: -60, link: V(0.32, 0, 0) }, { type: 'P', axis: '-y', lim: [0, 0.3], q0: 0.1, link: V(0, -0.12, 0) }],
    dof: L('3 DOF: two rotations place the tool above the right point (x, y), the sliding joint lowers it (z). All three axes are vertical, so the arm is very stiff from top to bottom.', '3 ddl : deux rotations placent l\'outil au-dessus du bon point (x, y), la liaison glissière le descend (z). Les trois axes sont verticaux, le bras est donc très rigide de haut en bas.'),
    fk: (q, p) => [`x = L₁ cos θ₁ + L₂ cos(θ₁+θ₂) = 0,42 × ${fmt(Math.cos(q[0] * D2R))} + 0,32 × ${fmt(Math.cos((q[0] + q[1]) * D2R))} = <b>${fmt(p.X)}</b> m`,
      `y = L₁ sin θ₁ + L₂ sin(θ₁+θ₂) = 0,42 × ${fmt(Math.sin(q[0] * D2R))} + 0,32 × ${fmt(Math.sin((q[0] + q[1]) * D2R))} = <b>${fmt(p.Y)}</b> m`,
      `z = h − d₃ = 0,50 − ${fmt(q[2])} = <b>${fmt(p.Z)}</b> m`]
  },
  gantry: {
    name: L('Cartesian robot', 'Robot cartésien'), code: 'P-P-P', lv: L('Simplest maths', 'Maths les plus simples'), page: ['gantry.html', L('the Cartesian robot page', 'la page du robot cartésien')],
    desc: L('Three sliding axes at right angles, like a 3D printer. Each motor moves one coordinate.', 'Trois axes qui coulissent à angle droit, comme une imprimante 3D. Chaque moteur déplace une coordonnée.'),
    at: V(0, 0.9, 0), tool: '-y', cam: [V(1.6, 1.7, 2.3), V(0, 0.45, 0)],
    joints: [{ type: 'P', axis: 'x', lim: [-0.4, 0.4], q0: 0.15, link: V(0, 0, 0) }, { type: 'P', axis: '-z', lim: [-0.3, 0.3], q0: 0.1, link: V(0, 0, 0) }, { type: 'P', axis: '-y', lim: [0, 0.5], q0: 0.2, link: V(0, -0.14, 0) }],
    dof: L('3 DOF: one motor per coordinate. Moving x never changes y or z: this is why the maths are so simple and why 3D printers and CNC machines use it.', '3 ddl : un moteur par coordonnée. Bouger x ne change jamais y ni z : c\'est pourquoi les maths sont si simples et que les imprimantes 3D et les machines CNC l\'utilisent.'),
    fk: (q, p) => [`x = d₁ = <b>${fmt(p.X)}</b> m`, `y = d₂ = <b>${fmt(p.Y)}</b> m`, `z = h − d₃ = 0,76 − ${fmt(q[2])} = <b>${fmt(p.Z)}</b> m`]
  }
};
const STEPS = [L('Choose', 'Choisir'), L('Parts', 'Composants'), L('Assemble', 'Assembler'), L('Joints', 'Articulations'), L('Move', 'Manipuler'), L('Compute', 'Calculer')];
const AXNAME = { x: L('the left-right axis', 'l\'axe gauche-droite'), y: L('the vertical axis', 'l\'axe vertical'), z: L('a horizontal axis', 'un axe horizontal'), '-y': L('the vertical axis', 'l\'axe vertical'), '-z': L('the front-back axis', 'l\'axe avant-arrière') };
const de = (s) => (/^un /.test(s) ? 'd\'' + s : 'de ' + s);                    // French: de + un = d'un

// ---------------------------------------------------------------- page skeleton
const host = document.getElementById('byr');
host.innerHTML = `
  <ol class="byr-steps">${STEPS.map((s, i) => `<li><button type="button" data-s="${i}"><b>${i + 1}</b><span>${s}</span></button></li>`).join('')}</ol>
  <div class="byr-main">
    <div class="byr-stage"><div class="byr-labels"></div><p class="byr-hint">${L('Drag to turn · scroll to zoom', 'Glisser pour tourner · molette pour zoomer')}</p><div class="byr-toast" hidden></div></div>
    <div class="byr-panel"><div class="byr-body"></div>
      <div class="byr-nav"><button type="button" class="btn ghost byr-back">← ${L('Back', 'Retour')}</button><button type="button" class="btn byr-next">${L('Next', 'Suivant')} →</button></div>
    </div>
  </div>`;
const stage = host.querySelector('.byr-stage'), body = host.querySelector('.byr-body'), labelsEl = host.querySelector('.byr-labels'), toast = host.querySelector('.byr-toast');
const backBtn = host.querySelector('.byr-back'), nextBtn = host.querySelector('.byr-next');

// ---------------------------------------------------------------- 3D scene
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.01, 40);
const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.prepend(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.enablePan = false; orbit.minDistance = 0.9; orbit.maxDistance = 6; orbit.maxPolarAngle = Math.PI * 0.495;
scene.add(new THREE.HemisphereLight('#ffffff', '#555a60', 1.15));
const sun = new THREE.DirectionalLight('#ffffff', 2.0); sun.position.set(2, 4, 3); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.1, far: 12 }); scene.add(sun);
const fill = new THREE.DirectionalLight('#cfe0ff', 0.7); fill.position.set(-3, 1.5, -2); scene.add(fill);
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.15, ...o });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2), mat('#7d8691', { roughness: 1 })); floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(3.2, 16, '#c3cad3', '#a3acb7'); grid.position.y = 0.001; grid.material.transparent = true; scene.add(grid);
const isLight = () => (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light';
const paint = () => { const Lt = isLight(); scene.background = new THREE.Color(Lt ? '#d9dde3' : '#262626'); floor.material.color.set(Lt ? '#7d8691' : '#2b2e33'); grid.material.opacity = Lt ? 1 : 0.35; host.classList.toggle('light', Lt); };
paint(); new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); matchMedia('(prefers-color-scheme: light)').addEventListener('change', paint);
// the frame of the robot (x red, y green, z blue, z up) drawn at the foot of the robot
{ const o = V(-1.25, 0.004, 1.25), mk = (d, c) => scene.add(new THREE.ArrowHelper(d, o, 0.32, c, 0.08, 0.05)); mk(V(1, 0, 0), '#ff6b6b'); mk(V(0, 0, -1), '#3fbf6f'); mk(V(0, 1, 0), '#5aa9ff'); }
const target = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 16), new THREE.MeshStandardMaterial({ color: '#30d158', emissive: '#0b5', emissiveIntensity: 0.6 })); target.visible = false; scene.add(target);
const trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#ffd60a' })); trail.frustumCulled = false; scene.add(trail); let trailPts = [];

// ---------------------------------------------------------------- build a robot from its description
const M = { link: () => mat('#ff9f43'), joint: () => mat('#2f3338', { metalness: 0.4, roughness: 0.4 }), base: () => mat('#4a4f57', { metalness: 0.3 }), steel: () => mat('#c9d0d8', { metalness: 0.6, roughness: 0.3 }), tool: () => mat('#e8eef5', { metalness: 0.3 }) };
const mesh = (g, m) => { const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; };
function bar(a, b, r, m) {                                     // a round bar from point a to point b
  const d = b.clone().sub(a), len = d.length(); if (len < 1e-4) return new THREE.Group();
  const o = mesh(new THREE.CylinderGeometry(r, r, len, 20), m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o;
}
function gripper(dir) {
  const g = new THREE.Group(), m = M.tool(), body2 = mesh(new THREE.BoxGeometry(0.05, 0.09, 0.07), m); g.add(body2);
  [-1, 1].forEach((s) => { const f = mesh(new THREE.BoxGeometry(0.07, 0.016, 0.03), mat('#2f3338')); f.position.set(0.055, s * 0.032, 0); g.add(f); });
  g.quaternion.setFromUnitVectors(V(1, 0, 0), dir); return g;
}
let R = null;                                                  // the current robot: { def, root, J[], Mv[], parts[], tip, q[] }
function buildRobot(key) {
  if (R) scene.remove(R.root);
  const def = ROBOTS[key], root = new THREE.Group(), parts = [], J = [], Mv = [];
  const add = (kind, i, parent, obj, name, role) => { const node = new THREE.Group(); node.add(obj); parent.add(node); obj.traverse((m) => { if (m.isMesh) m.userData.part = parts.length; }); parts.push({ kind, i, node, name, role, placed: true, k: 1 }); };
  // base
  { const g = new THREE.Group(), h = def.at.y;
    if (key === 'gantry') { [-0.5, 0.5].forEach((x) => { const p = mesh(new THREE.BoxGeometry(0.07, h, 0.07), M.base()); p.position.set(x, h / 2, 0); g.add(p); const ft = mesh(new THREE.BoxGeometry(0.12, 0.03, 0.5), M.base()); ft.position.set(x, 0.015, 0); g.add(ft); }); }
    else { g.add(mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.05, 40).translate(0, 0.025, 0), M.base())); const top = def.joints[0].axis === 'z' ? h - 0.02 : h - 0.06; g.add(mesh(new THREE.CylinderGeometry(0.075, 0.09, top - 0.05, 28).translate(0, 0.05 + (top - 0.05) / 2, 0), M.base())); }
    add('base', -1, root, g, L('Base', 'Base'), L('Fixed to the floor. It carries everything and does not move.', 'Fixée au sol. Elle porte tout et ne bouge pas.')); }
  let parent = root, at = def.at;
  def.joints.forEach((j, i) => {
    const Jg = new THREE.Group(); Jg.position.copy(at); parent.add(Jg);              // where the joint sits
    const Mg = new THREE.Group(); Jg.add(Mg);                                        // what the joint moves
    const ax = AX[j.axis], n = i + 1;
    if (j.type === 'R') {
      const g = new THREE.Group(), c = mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.15, 30), M.joint()); c.quaternion.setFromUnitVectors(V(0, 1, 0), ax); g.add(c);
      const ring = mesh(new THREE.CylinderGeometry(0.071, 0.071, 0.03, 30), mat(JC[i])); ring.quaternion.copy(c.quaternion); g.add(ring);
      add('joint', i, Jg, g, L(`Motor of joint ${n} (revolute)`, `Moteur de la liaison ${n} (rotoïde)`), L('A motor with a gearbox and an encoder. It turns the next link around its axis.', 'Un moteur avec un réducteur et un codeur. Il fait tourner le segment suivant autour de son axe.'));
    } else {
      const a = ax.clone().multiplyScalar(j.lim[0] - 0.06), b = ax.clone().multiplyScalar(j.lim[1] + 0.06), g = new THREE.Group(); g.add(bar(a, b, 0.028, M.steel()));
      const mot = mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), M.joint()); mot.position.copy(a); g.add(mot); const stripe = mesh(new THREE.BoxGeometry(0.094, 0.03, 0.094), mat(JC[i])); stripe.position.copy(a); g.add(stripe);
      add('joint', i, Jg, g, L(`Linear axis ${n} (prismatic)`, `Axe linéaire ${n} (prismatique)`), L('A rail with a motor and a screw or a belt. It slides the next part in a straight line.', 'Un rail avec un moteur et une vis ou une courroie. Il fait glisser la pièce suivante en ligne droite.'));
    }
    { const g = new THREE.Group();
      if (j.type === 'P') g.add(mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), M.link()));
      g.add(bar(V(0, 0, 0), j.link, 0.036, M.link()));
      const last = i === def.joints.length - 1;
      add('link', i, Mg, g, j.type === 'P' ? L(`Carriage ${n}`, `Chariot ${n}`) : L(`Link ${n}`, `Segment ${n}`), last ? L('The last rigid part: it carries the tool.', 'La dernière pièce rigide : elle porte l\'outil.') : L('A rigid part, like a bone. It carries the next joint.', 'Une pièce rigide, comme un os. Elle porte la liaison suivante.')); }
    J.push(Jg); Mv.push(Mg); parent = Mg; at = j.link;
  });
  const tip = new THREE.Group(); tip.position.copy(at); parent.add(tip);
  add('tool', -1, tip, gripper(AX[def.tool]), L('Gripper (end effector)', 'Pince (organe terminal)'), L('The hand of the robot: it does the useful work. Its centre is the tool point.', 'La main du robot : elle fait le travail utile. Son centre est le point outil.'));
  const tcp = new THREE.Group(); tip.add(tcp);                 // the tool point: the end of the last link, in the middle of the gripper
  scene.add(root);
  R = { key, def, root, J, Mv, parts, tip: tcp, q: def.joints.map((j) => j.q0), n: def.joints.length };
  apply(); trailPts = []; trail.geometry.setFromPoints([]);
  fly(1, 0);
}
function fly(k, dy) { const c = R.def.cam, t = c[1].clone().add(V(0, dy, 0)); camGoal = { p: t.clone().add(c[0].clone().sub(c[1]).multiplyScalar(k)), t }; camFrom = { p: camera.position.clone(), t: orbit.target.clone() }; camK = 0; }
function apply() {
  R.def.joints.forEach((j, i) => { const ax = AX[j.axis]; if (j.type === 'R') R.Mv[i].quaternion.setFromAxisAngle(ax, R.q[i] * D2R); else R.Mv[i].position.copy(ax).multiplyScalar(R.q[i]); });
  R.root.updateMatrixWorld(true);
}
const tmp = V(0, 0, 0);
const toolPos = () => { R.tip.getWorldPosition(tmp); return { v: tmp.clone(), X: tmp.x, Y: -tmp.z, Z: tmp.y }; };
const disp = (v) => `(${fmt(v.x)} ; ${fmt(-v.z)} ; ${fmt(v.y)})`;
// numerical inverse kinematics on the position (damped least squares), inside the joint limits
function solveIK(goal) {                                      // from the current pose; if the limits block it, from a few other start poses
  let best = ikFrom(goal, R.q.slice());
  for (let t = 0; t < 12 && best.err > 0.008; t++) { const r = ikFrom(goal, R.def.joints.map((j) => j.lim[0] + Math.random() * (j.lim[1] - j.lim[0]))); if (r.err < best.err) best = r; }
  return best;
}
function ikFrom(goal, q) {
  const keep = R.q.slice(), n = R.n, set = (qq) => { R.q = qq; apply(); return toolPos().v; };
  for (let it = 0; it < 200; it++) {
    const p = set(q), e = goal.clone().sub(p); if (e.length() < 0.004) break;
    const Jm = [];                                              // 3 x n
    for (let k = 0; k < n; k++) { const h = R.def.joints[k].type === 'R' ? 0.5 : 0.002, q2 = q.slice(); q2[k] += h; const d = set(q2).sub(p).multiplyScalar(1 / h); Jm.push([d.x, d.y, d.z]); }
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { let s = 0; for (let k = 0; k < n; k++) s += Jm[k][a] * Jm[k][b]; A[a][b] = s + (a === b ? 1e-4 : 0); }
    const m3 = new THREE.Matrix3().set(A[0][0], A[0][1], A[0][2], A[1][0], A[1][1], A[1][2], A[2][0], A[2][1], A[2][2]).invert(), y = e.clone().applyMatrix3(m3), ya = [y.x, y.y, y.z];
    for (let k = 0; k < n; k++) { let dq = 0; for (let a = 0; a < 3; a++) dq += Jm[k][a] * ya[a]; const j = R.def.joints[k], cap = j.type === 'R' ? 12 : 0.05; q[k] = Math.max(j.lim[0], Math.min(j.lim[1], q[k] + Math.max(-cap, Math.min(cap, dq)))); }
  }
  const err = set(q).distanceTo(goal); set(keep); return { q, err };
}
function newTarget() {                                         // a reachable point: the tool position of a random pose
  const keep = R.q.slice(); let best = null;
  for (let t = 0; t < 30; t++) { R.q = R.def.joints.map((j) => j.lim[0] + (0.12 + 0.76 * Math.random()) * (j.lim[1] - j.lim[0])); apply(); const p = toolPos().v; if (p.y > 0.12 && p.distanceTo(V(0, p.y, 0)) > 0.2 && (!best || p.distanceTo(S.tool0) > best.distanceTo(S.tool0))) best = p; if (best && t > 8) break; }
  R.q = keep; apply(); target.position.copy(best || V(0.4, 0.4, 0)); target.visible = true; S.hit = false;
}

// ---------------------------------------------------------------- state and steps
const S = { step: 0, key: null, sel: -1, done: [false, false, false, true, true, true], wig: null, tween: null, hit: false, tool0: V(0, 0, 0), auto: null };
let camFrom = null, camGoal = null, camK = 1;
const say = (html, good) => { toast.innerHTML = html; toast.hidden = false; toast.className = 'byr-toast' + (good ? ' good' : ''); clearTimeout(say.t); say.t = setTimeout(() => { toast.hidden = true; }, 4200); };
const hlMats = new Map();
function highlight(k) {
  S.sel = k;
  R.parts.forEach((p, i) => p.node.traverse((m) => { if (!m.isMesh) return; if (!m.userData.base) m.userData.base = m.material; if (i === k) { if (!hlMats.has(m.userData.base)) { const c = m.userData.base.clone(); c.emissive = new THREE.Color('#6d5dfc'); c.emissiveIntensity = 0.55; hlMats.set(m.userData.base, c); } m.material = hlMats.get(m.userData.base); } else m.material = m.userData.base; }));
  body.querySelectorAll('[data-part]').forEach((b) => b.classList.toggle('on', +b.dataset.part === k));
}
const sliders = () => `<div class="byr-sl">${R.def.joints.map((j, i) => `<label style="--c:${JC[i]}"><span><b>J${i + 1}</b> ${j.type === 'R' ? 'θ' : 'd'}<sub>${i + 1}</sub></span><input type="range" data-j="${i}" min="${j.lim[0]}" max="${j.lim[1]}" step="${j.type === 'R' ? 1 : 0.005}" value="${R.q[i]}"><output></output></label>`).join('')}</div>`;
function paintSliders() { body.querySelectorAll('.byr-sl label').forEach((lab, i) => { const j = R.def.joints[i]; lab.querySelector('input').value = R.q[i]; lab.querySelector('output').textContent = j.type === 'R' ? fmt(R.q[i], 0) + '°' : fmt(R.q[i]) + ' m'; }); }

const VIEW = [
  // 1 — choose
  () => `<h2>${L('1 · Choose your robot', '1 · Choisissez votre robot')}</h2><p>${L('Four real robot families. Pick one: you will discover its parts, assemble it, move it and see how its motion is computed.', 'Quatre vraies familles de robots. Choisissez-en une : vous allez découvrir ses pièces, l\'assembler, le bouger et voir comment son mouvement est calculé.')}</p>
    <div class="byr-cards">${Object.entries(ROBOTS).map(([k, r]) => `<button type="button" data-robot="${k}" class="${k === S.key ? 'on' : ''}"><span class="byr-code">${r.code}</span><strong>${r.name}</strong><em>${r.lv} · ${r.joints.length} ${L('DOF', 'ddl')}</em><small>${r.desc}</small></button>`).join('')}</div>`,
  // 2 — parts
  () => `<h2>${L('2 · Discover its parts', '2 · Découvrez ses composants')}</h2><p>${L(`Your ${R.def.name} has ${R.parts.length} parts. Click each one, in the list or on the picture, to see what it does.`, `Votre ${R.def.name} a ${R.parts.length} pièces. Cliquez sur chacune, dans la liste ou sur l'image, pour voir à quoi elle sert.`)}</p>
    <ol class="byr-parts">${R.parts.map((p, i) => `<li><button type="button" data-part="${i}"><b>${i + 1}</b><span><strong>${p.name}</strong><small>${p.role}</small></span></button></li>`).join('')}</ol>
    <p class="byr-note">${L('Hidden inside: every motor has an <b>encoder</b> that measures its position, and a <b>controller</b> (the brain) reads them and sends the orders.', 'Cachés à l\'intérieur : chaque moteur a un <b>codeur</b> qui mesure sa position, et un <b>contrôleur</b> (le cerveau) les lit et envoie les ordres.')} <a href="anatomy.html">${L('See every component in 3D', 'Voir tous les composants en 3D')} →</a></p>`,
  // 3 — assemble
  () => { const left = R.parts.filter((p) => !p.placed).length; const order = S.tray || (S.tray = R.parts.map((_, i) => i).sort(() => Math.random() - 0.5));
    return `<h2>${L('3 · Assemble it', '3 · Assemblez-le')}</h2><p>${L('Mount the parts in the right order, from the floor to the tool. The grey shape shows where the robot will stand.', 'Montez les pièces dans le bon ordre, du sol jusqu\'à l\'outil. La forme grise montre où le robot va se dresser.')}</p>
    <div class="byr-tray">${order.map((i) => `<button type="button" data-place="${i}" ${R.parts[i].placed ? 'disabled' : ''}>${R.parts[i].placed ? '✓ ' : ''}${R.parts[i].name}</button>`).join('')}</div>
    <p class="byr-prog"><b>${R.parts.length - left} / ${R.parts.length}</b> ${L('parts mounted', 'pièces montées')}${left ? '' : ' — ' + L('your robot is assembled!', 'votre robot est assemblé !')}</p>
    <p><button type="button" class="byr-link" data-act="auto">${L('Assemble it for me', 'L\'assembler pour moi')}</button> · <button type="button" class="byr-link" data-act="again">${L('Start again', 'Recommencer')}</button></p>`; },
  // 4 — joints and DOF
  () => `<h2>${L('4 · Joints and degrees of freedom', '4 · Articulations et degrés de liberté')}</h2>
    <p>${L('A joint is a place where the robot can move. Each joint here gives <b>one</b> motion: one degree of freedom (DOF).', 'Une articulation (liaison) est un endroit où le robot peut bouger. Chaque liaison donne ici <b>un</b> mouvement : un degré de liberté (ddl).')}</p>
    <ul class="byr-joints">${R.def.joints.map((j, i) => `<li style="--c:${JC[i]}"><b>J${i + 1}</b><span><strong>${j.type === 'R' ? L('Revolute (R)', 'Rotoïde (R)') : L('Prismatic (P)', 'Prismatique (P)')}</strong><small>${j.type === 'R' ? L(`turns around ${AXNAME[j.axis]}, like ${j.axis === 'y' ? 'a turntable' : 'an elbow'}`, `tourne autour ${de(AXNAME[j.axis])}, comme ${j.axis === 'y' ? 'un plateau tournant' : 'un coude'}`) : L(`slides along ${AXNAME[j.axis]}, like a drawer`, `coulisse le long ${de(AXNAME[j.axis])}, comme un tiroir`)} · 1 ${L('DOF', 'ddl')}</small></span><button type="button" data-wig="${i}">${L('Move it', 'La bouger')}</button></li>`).join('')}</ul>
    <div class="byr-sum"><span>${R.def.code}</span><b>= ${R.n} ${L('degrees of freedom', 'degrés de liberté')}</b></div><p>${R.def.dof}</p>
    <p class="byr-note">${L('The coloured line through each joint is its <b>axis</b>: the line it turns around, or slides along.', 'La ligne colorée qui traverse chaque liaison est son <b>axe</b> : la ligne autour de laquelle elle tourne, ou le long de laquelle elle coulisse.')}</p>`,
  // 5 — move
  () => `<h2>${L('5 · Move your robot', '5 · Manipulez votre robot')}</h2><p>${L('Each slider drives one motor. <b>Challenge:</b> bring the gripper onto the green ball.', 'Chaque curseur pilote un moteur. <b>Défi :</b> amenez la pince sur la balle verte.')}</p>
    ${sliders()}<p class="byr-pos">${L('Tool position', 'Position de l\'outil')} (x ; y ; z) : <b class="byr-xyz"></b> m<br>${L('Distance to the ball', 'Distance à la balle')} : <b class="byr-dist"></b></p>
    <p><button type="button" class="byr-link" data-act="ball">${L('Another ball', 'Une autre balle')}</button> · <button type="button" class="byr-link" data-act="home">${L('Back to the start pose', 'Revenir à la pose de départ')}</button> · <button type="button" class="byr-link" data-act="trail">${L('Erase the trail', 'Effacer la trace')}</button></p>
    <p class="byr-note">${L('The yellow line is the path of the tool. Notice that turning one joint draws an arc, and sliding one draws a straight line.', 'La ligne jaune est le trajet de l\'outil. Remarquez que tourner une liaison trace un arc, et en faire coulisser une trace une ligne droite.')}</p>`,
  // 6 — compute
  () => `<h2>${L('6 · How the motion is computed', '6 · Comment le mouvement est calculé')}</h2>
    <h3>${L('Forward: from the motors to the tool', 'Direct : des moteurs vers l\'outil')}</h3><p>${L('The controller knows every joint value (from the encoders). It adds the links one after the other to find where the tool is. Move a slider and watch the numbers.', 'Le contrôleur connaît la valeur de chaque liaison (grâce aux codeurs). Il ajoute les segments l\'un après l\'autre pour trouver où est l\'outil. Bougez un curseur et regardez les chiffres.')}</p>
    ${sliders()}<div class="byr-fk"></div><table class="byr-chain"></table>
    <h3>${L('Inverse: from the target to the motors', 'Inverse : de la cible vers les moteurs')}</h3><p>${L('In real life you give the target, not the angles. The controller must find the joint values that put the tool on it: this is inverse kinematics.', 'Dans la vraie vie, on donne la cible, pas les angles. Le contrôleur doit trouver les valeurs des liaisons qui amènent l\'outil dessus : c\'est la cinématique inverse.')}</p>
    <p><button type="button" class="btn byr-ik" data-act="ik">${L('Send the tool to the ball', 'Envoyer l\'outil sur la balle')}</button> <button type="button" class="byr-link" data-act="ball">${L('Another ball', 'Une autre balle')}</button></p><div class="byr-ikout"></div>
    <div class="byr-end"><strong>${L('Well done: you built, moved and understood your first robot!', 'Bravo : vous avez construit, bougé et compris votre premier robot !')}</strong>
      <p>${L('Go further with', 'Allez plus loin avec')} <a href="${R.def.page[0]}">${R.def.page[1]}</a>, ${L('or build another robot.', 'ou construisez un autre robot.')}</p>
      <p><a class="btn" href="learn.html">${L('Continue: learn the basics', 'Continuer : apprendre les bases')} →</a> <button type="button" class="btn ghost" data-act="restart">${L('Build another robot', 'Construire un autre robot')}</button> <a class="btn ghost" href="index.html#road">${L('Roadmap', 'Parcours')}</a></p></div>`
];

function go(i) {
  i = Math.max(0, Math.min(5, i)); if (i > 0 && !R) return;
  for (let k = 0; k < i; k++) if (!S.done[k]) { i = k; break; }                // cannot skip an unfinished step
  S.step = i; S.wig = null; S.tween = null; clearInterval(S.auto); toast.hidden = true;
  if (R) { highlight(-1); if (i !== 2) R.parts.forEach((p) => { p.placed = true; }); }
  if (i === 2 && !S.done[2]) { R.parts.forEach((p) => { p.placed = false; p.k = 0; }); S.tray = null; }
  if (i >= 4 && R) { S.tool0 = toolPos().v; if (!target.visible) newTarget(); } else target.visible = false;
  if (R) fly(i === 1 ? 1.45 : 1, i === 1 ? 0.3 : 0);
  trail.visible = i === 4; if (i === 5 && window.RA && RA.progress) RA.progress.set('build', true);
  render();
  host.querySelectorAll('.byr-steps button').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('ok', k < i); b.disabled = k > 0 && !R; });
  if (innerWidth < 900 && go.used) host.scrollIntoView({ behavior: 'smooth', block: 'start' }); go.used = true;
}
function render() {
  body.innerHTML = VIEW[S.step](); backBtn.style.visibility = S.step ? '' : 'hidden';
  nextBtn.style.display = S.step === 5 ? 'none' : ''; nextBtn.disabled = !S.done[S.step];
  if (S.step < 5) nextBtn.innerHTML = (S.step === 0 && R ? L(`Build the ${R.def.name}`, `Construire le ${R.def.name}`) : S.step === 0 ? L('Choose a robot', 'Choisissez un robot') : L('Next', 'Suivant') + ': ' + STEPS[S.step + 1]) + ' →';
  if (S.step >= 4) { paintSliders(); live(); }
}
function live() {                                              // numbers that follow the robot (steps 5 and 6)
  const p = toolPos();
  if (S.step === 4) { const d = p.v.distanceTo(target.position); body.querySelector('.byr-xyz').textContent = disp(p.v); body.querySelector('.byr-dist').innerHTML = d < 0.04 ? `<span class="good">✓ ${L('touched!', 'touchée !')}</span>` : fmt(d * 100, 0) + ' cm';
    if (d < 0.04 && !S.hit) { S.hit = true; say('✓ ' + L('Well done, the gripper is on the ball! Try another ball, or go to the last step.', 'Bravo, la pince est sur la balle ! Essayez une autre balle, ou passez à la dernière étape.'), true); } }
  if (S.step === 5) {
    body.querySelector('.byr-fk').innerHTML = R.def.fk(R.q, p).map((s) => `<p>${FR ? s : s.replace(/(\d),(\d)/g, '$1.$2')}</p>`).join('');
    const rows = [[L('Base', 'Base'), V(0, 0, 0)]]; R.J.forEach((j, i) => { j.getWorldPosition(tmp); rows.push([`J${i + 1}`, tmp.clone()]); }); rows.push([L('Tool', 'Outil'), p.v]);
    body.querySelector('.byr-chain').innerHTML = `<tr><th>${L('Point', 'Point')}</th><th>(x ; y ; z) m</th></tr>` + rows.map(([n, v], i) => `<tr${i === rows.length - 1 ? ' class="tool"' : ''}><td>${n}</td><td>${disp(v)}</td></tr>`).join('');
  }
}

// ---------------------------------------------------------------- events
host.querySelector('.byr-steps').addEventListener('click', (e) => { const b = e.target.closest('button[data-s]'); if (b) go(+b.dataset.s); });
backBtn.addEventListener('click', () => go(S.step - 1)); nextBtn.addEventListener('click', () => go(S.step + 1));
function place(i) {
  const p = R.parts[i], next = R.parts.findIndex((q) => !q.placed);
  if (i !== next) { const need = R.parts[next]; say(L(`Not yet: the <b>${p.name}</b> has nothing to hold on to. Mount the <b>${need.name}</b> first.`, `Pas encore : la pièce <b>${p.name}</b> n'a rien pour se fixer. Montez d'abord : <b>${need.name}</b>.`)); return; }
  p.placed = true; p.k = 0;
  if (R.parts.every((q) => q.placed)) { S.done[2] = true; say('✓ ' + L('Your robot is assembled! Go to the next step.', 'Votre robot est assemblé ! Passez à l\'étape suivante.'), true); }
  render();
}
body.addEventListener('click', (e) => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.robot) { S.key = t.dataset.robot; S.done = [true, true, false, true, true, true]; buildRobot(S.key); target.visible = false; render(); }
  else if (t.dataset.part) highlight(+t.dataset.part === S.sel ? -1 : +t.dataset.part);
  else if (t.dataset.place) place(+t.dataset.place);
  else if (t.dataset.wig) S.wig = { i: +t.dataset.wig, t: 0, q0: R.q[+t.dataset.wig] };
  else if (t.dataset.act === 'auto') { clearInterval(S.auto); S.auto = setInterval(() => { const n = R.parts.findIndex((q) => !q.placed); if (n < 0 || S.step !== 2) clearInterval(S.auto); else place(n); }, 650); }
  else if (t.dataset.act === 'again') { S.done[2] = false; go(2); }
  else if (t.dataset.act === 'ball') { S.tool0 = toolPos().v; newTarget(); live(); if (S.step === 5) body.querySelector('.byr-ikout').innerHTML = ''; }
  else if (t.dataset.act === 'home') S.tween = { from: R.q.slice(), to: R.def.joints.map((j) => j.q0), t: 0 };
  else if (t.dataset.act === 'trail') { trailPts = []; trail.geometry.setFromPoints([]); }
  else if (t.dataset.act === 'ik') { const r = solveIK(target.position.clone()); S.tween = { from: R.q.slice(), to: r.q, t: 0 };
    body.querySelector('.byr-ikout').innerHTML = `<p>${L('Target', 'Cible')} ${disp(target.position)} m → ${L('the controller found', 'le contrôleur a trouvé')} :</p><p class="byr-sol">${r.q.map((v, i) => `<span style="--c:${JC[i]}">${R.def.joints[i].type === 'R' ? 'θ' : 'd'}<sub>${i + 1}</sub> = <b>${R.def.joints[i].type === 'R' ? fmt(v, 1) + '°' : fmt(v, 3) + ' m'}</b></span>`).join('')}</p><p class="byr-note">${r.err < 0.01 ? L('It searched step by step: at each step it looks at how each joint moves the tool (the Jacobian) and corrects the joints a little. An arm often has several solutions (elbow up or down): the controller keeps the closest one.', 'Il a cherché pas à pas : à chaque pas, il regarde comment chaque liaison déplace l\'outil (la jacobienne) et corrige un peu les liaisons. Un bras a souvent plusieurs solutions (coude en haut ou en bas) : le contrôleur garde la plus proche.') : L('This ball is at the edge of what the robot can reach: it stopped as close as it could.', 'Cette balle est à la limite de ce que le robot peut atteindre : il s\'est arrêté le plus près possible.')}</p>`; }
  else if (t.dataset.act === 'restart') { S.done = [true, true, false, true, true, true]; go(0); }
});
body.addEventListener('input', (e) => { const j = e.target.dataset && e.target.dataset.j; if (j === undefined) return; S.tween = null; R.q[+j] = +e.target.value; apply(); paintSliders(); live(); });
// click a part in the picture (step 2)
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down || !R || S.step !== 1 || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObject(R.root, true).find((h) => h.object.userData.part !== undefined); highlight(hit ? hit.object.userData.part : -1);
  if (hit) { const li = body.querySelector(`[data-part="${hit.object.userData.part}"]`); if (li && innerWidth >= 900) li.scrollIntoView({ block: 'nearest' }); }
});

// ---------------------------------------------------------------- joint axes and labels (step 4)
const axisG = new THREE.Group(); scene.add(axisG);
function paintAxes() {
  axisG.clear(); labelsEl.innerHTML = '';
  if (!R || S.step !== 3) return;
  R.def.joints.forEach((j, i) => { const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([AX[j.axis].clone().multiplyScalar(-0.3), AX[j.axis].clone().multiplyScalar(0.3)]), new THREE.LineDashedMaterial({ color: JC[i], dashSize: 0.03, gapSize: 0.02 })); ln.computeLineDistances(); ln.userData.j = i; axisG.add(ln);
    labelsEl.insertAdjacentHTML('beforeend', `<span style="--c:${JC[i]}">J${i + 1} · ${j.type}</span>`); });
}

// ---------------------------------------------------------------- frame loop
function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = camera.aspect < 0.9 ? 48 : 36; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(stage); resize();
camera.position.set(1.6, 1.3, 2.2); orbit.target.set(0, 0.45, 0);
let last = performance.now(), visible = true, axesFor = '';
new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(stage);
const ease = (k) => k * k * (3 - 2 * k), up = V(0, 0, 0), qi = new THREE.Quaternion();
function frame(now) {
  requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!visible) return;
  if (camK < 1 && camGoal) { camK = Math.min(1, camK + dt / 1.0); const e = ease(camK); camera.position.copy(camFrom.p.clone().lerp(camGoal.p, e)); orbit.target.copy(camFrom.t.clone().lerp(camGoal.t, e)); }
  if (R) {
    const key = R.key + S.step; if (key !== axesFor) { axesFor = key; paintAxes(); }
    if (S.step === 0) { const t = now / 1000; R.def.joints.forEach((j, i) => { const mid = (j.lim[0] + j.lim[1]) / 2, a = (j.lim[1] - j.lim[0]) * 0.16; R.q[i] = j.q0 + a * Math.sin(t * (0.7 + i * 0.23) + i) * (Math.abs(j.q0 - mid) > a * 4 ? 0.5 : 1); R.q[i] = Math.max(j.lim[0], Math.min(j.lim[1], R.q[i])); }); apply(); }
    if (S.wig) { const w = S.wig, j = R.def.joints[w.i]; w.t += dt; const a = (j.lim[1] - j.lim[0]) * 0.22; R.q[w.i] = Math.max(j.lim[0], Math.min(j.lim[1], w.q0 + a * Math.sin(w.t * 3.2))); if (w.t > Math.PI * 2 / 3.2) { R.q[w.i] = w.q0; S.wig = null; } apply(); }
    if (S.tween) { const w = S.tween; w.t = Math.min(1, w.t + dt / 1.4); const e = ease(w.t); R.q = w.from.map((a, i) => a + (w.to[i] - a) * e); apply(); if (S.step >= 4) { paintSliders(); live(); } if (w.t >= 1) S.tween = null; }
    // parts: exploded (step 2), ghost / dropping in (step 3), in place otherwise
    const n = R.parts.length;
    R.parts.forEach((p, i) => {
      p.k = Math.min(1, p.k + dt / 0.55);
      const lift = S.step === 1 ? i * 0.085 : S.step === 2 && p.placed ? (1 - ease(p.k)) * 0.5 : 0; p.lift = (p.lift || 0) + (lift - (p.lift || 0)) * Math.min(1, dt * (S.step === 2 ? 30 : 5));
      p.node.parent.getWorldQuaternion(qi).invert(); p.node.position.copy(up.set(0, p.lift, 0).applyQuaternion(qi));
      const ghost = S.step === 2 && !p.placed;
      p.node.traverse((m) => { if (!m.isMesh) return; if (!m.userData.base) m.userData.base = m.material; if (ghost) { if (!m.userData.ghost) { m.userData.ghost = new THREE.MeshBasicMaterial({ color: '#9aa3ae', transparent: true, opacity: 0.16, depthWrite: false }); } m.material = m.userData.ghost; m.castShadow = false; } else { if (m.material === m.userData.ghost) m.material = m.userData.base; m.castShadow = true; } });
    });
    if (S.step === 1 || S.step === 2) { if (S.pose !== 'neutral') { S.keep = R.q.slice(); S.pose = 'neutral'; } R.q = R.def.joints.map((j) => j.q0); apply(); } else if (S.pose === 'neutral') S.pose = '';
    if (S.step === 3) { const r = stage.getBoundingClientRect(); axisG.children.forEach((ln, i) => { R.J[i].getWorldPosition(ln.position); R.J[i].getWorldQuaternion(ln.quaternion); tmp.copy(ln.position).project(camera); const s = labelsEl.children[i]; if (s) { s.style.left = ((tmp.x + 1) / 2 * r.width) + 'px'; s.style.top = ((1 - tmp.y) / 2 * r.height - 26) + 'px'; } }); }
    if (S.step === 4) { const p = toolPos().v; if (!trailPts.length || trailPts[trailPts.length - 1].distanceTo(p) > 0.004) { trailPts.push(p); if (trailPts.length > 900) trailPts.shift(); trail.geometry.setFromPoints(trailPts); } }
    if (target.visible) target.scale.setScalar(1 + 0.15 * Math.sin(now / 250));
  }
  orbit.update(); renderer.render(scene, camera);
}
S.key = 'arm'; S.done = [true, true, false, true, true, true]; buildRobot('arm');     // a robot is already on the table: the learner can keep it or pick another one
go(0); requestAnimationFrame(frame);
