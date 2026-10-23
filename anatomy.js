// anatomy.js — 3D anatomy of a robot (6-axis, SCARA or cobot, chosen by <body data-robot="six|scara|cobot">):
// coloured joint rings, an X-ray view of the motors, gearboxes, controller and cables, and a card per axis.
// Texts shown from JavaScript use L(english, french).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FR = (window.RA && RA.lang) === 'fr', L = (en, fr) => (FR ? fr : en);
const D2R = Math.PI / 180;
const KIND = document.body.dataset.robot || 'six';
const ALLCOL = ['#2f6bff', '#2e9e5b', '#ff9f43', '#8a5cf6', '#ff5a5f', '#1fb5c9'];
const CFG = {
  six: { n: 6, col: ALLCOL, lim: [[-170, 170], [-100, 100], [-60, 140], [-180, 180], [-115, 115], [-180, 180]], home: [0, 30, 40, 0, -90, 0], unit: ['°', '°', '°', '°', '°', '°'],
    playBase: [0, 30, 40, 0, -60, 0], playAmp: [70, 25, 25, 80, 35, 120], cam: [1.9, 1.3, 2.1], target: [0.35, 0.7, 0], special: [4, 0] },
  scara: { n: 4, col: [ALLCOL[0], ALLCOL[1], ALLCOL[3], ALLCOL[5]], lim: [[-130, 130], [-145, 145], [0, 30], [-180, 180]], home: [30, 60, 10, 0], unit: ['°', '°', ' cm', '°'],
    playBase: [30, 60, 15, 0], playAmp: [60, 50, 14, 120], cam: [1.7, 1.4, 1.9], target: [0.45, 0.45, 0], special: [1, 0] },
  cobot: { n: 6, col: ALLCOL, lim: [[-180, 180], [-100, 100], [-150, 150], [-180, 180], [-120, 120], [-180, 180]], home: [0, 30, 40, -90, 90, 0], unit: ['°', '°', '°', '°', '°', '°'],
    playBase: [0, 30, 40, -90, 60, 0], playAmp: [70, 25, 25, 80, 45, 120], cam: [1.0, 0.75, 1.15], target: [0.28, 0.33, 0], special: [4, 0] },
  delta: { n: 5, nq: 3, col: ALLCOL.slice(0, 5), lim: [[-25, 75], [-25, 75], [-25, 75]], home: [25, 25, 25], unit: ['°', '°', '°'], dec: 0,
    playBase: [25, 25, 25], playAmp: [40, 40, 40], cam: [1.35, 0.95, 1.5], target: [0, 0.4, 0], special: [[0, 25], [1, 25], [2, 25]] },
  gantry: { n: 5, nq: 3, col: ALLCOL.slice(0, 5), lim: [[0, 100], [0, 80], [0, 45]], home: [50, 40, 20], unit: [' cm', ' cm', ' cm'], dec: 0,
    playBase: [50, 40, 22], playAmp: [45, 35, 20], cam: [2.3, 1.5, 1.7], target: [0.5, 0.5, -0.4], special: [[0, 100], [1, 80], [2, 45]] },
  mobile: { n: 6, nq: 2, col: ALLCOL, lim: [[-12, 12], [-12, 12]], home: [6, 8], unit: [' rad/s', ' rad/s'], dec: 1, step: 0.5, grid: 30,
    playFn: (now) => [5 + 3.5 * Math.sin(now / 900), 5 - 3.5 * Math.sin(now / 900)], cam: [1.6, 1.2, 1.8], target: [0, 0.15, 0], special: [[0, -5], [1, 5]] }
}[KIND];
const COL = CFG.col, LIM = CFG.lim, N = CFG.n, NQ = CFG.nq || CFG.n;
const DEC = CFG.dec || 0;
const q = CFG.home.slice();

const box = document.getElementById('anatView');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#262626');
const camera = new THREE.PerspectiveCamera(42, box.clientWidth / box.clientHeight, 0.1, 50);
camera.position.set(...CFG.cam);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(box.clientWidth, box.clientHeight);
box.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(...CFG.target);
orbit.enableDamping = true;
scene.add(new THREE.HemisphereLight('#ffffff', '#4a4a4a', 1.5));
const sun = new THREE.DirectionalLight('#ffffff', 1.7); sun.position.set(3, 5, 2); scene.add(sun);
const fill = new THREE.DirectionalLight('#8fb4ff', 0.5); fill.position.set(-3, 2, -3); scene.add(fill);
scene.add(new THREE.GridHelper(CFG.grid || 4, (CFG.grid || 4) * 4, '#6a6a6a', '#383838'));

// ------------------------------------------------------------------ materials and helpers
const shells = [];                                           // materials that become transparent in X-ray mode
const shell = (color, extra) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, metalness: 0.25, roughness: 0.45 }, extra)); shells.push(m); return m; };
const ORANGE = shell('#ff9a1f', { metalness: 0.05, roughness: 0.55 }), DARK = shell('#2b2f36'), BASE = shell('#3a3f48');
const LIGHT = shell('#d3d9e1', { metalness: 0.15, roughness: 0.4 }), BLUE = shell('#2f6bff', { metalness: 0.2, roughness: 0.4 });
const SILVER = new THREE.MeshStandardMaterial({ color: '#aeb6c1', metalness: 0.7, roughness: 0.3 });
const MOTOR = new THREE.MeshStandardMaterial({ color: '#3a4250', metalness: 0.5, roughness: 0.4 });
const COPPER = new THREE.MeshStandardMaterial({ color: '#c5772b', metalness: 0.8, roughness: 0.35 });
const BLACK = new THREE.MeshStandardMaterial({ color: '#101114', roughness: 0.8 });

const mesh = (geo, mat, parent, pos, rot) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (rot) m.rotation.set(...rot); parent.add(m); return m; };
const cyl = (r, h, mat, parent, pos, axis) => mesh(new THREE.CylinderGeometry(r, r, h, 40), mat, parent, pos, axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : null);
const boxm = (w, h, d, mat, parent, pos) => mesh(new THREE.BoxGeometry(w, h, d), mat, parent, pos);
const group = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); parent.add(g); return g; };
const inner = [];                                            // parts only visible in X-ray mode
const xr = (m) => { m.visible = false; inner.push(m); return m; };

// a motor + gearbox pair along an axis, at a position, scaled by s (X-ray only)
function drive(parent, pos, axis, r, s) {
  const g = group(parent, pos); if (axis === 'x') g.rotation.z = Math.PI / 2; else if (axis === 'z') g.rotation.x = Math.PI / 2; if (s) g.scale.setScalar(s);
  xr(cyl(r, 0.14, MOTOR, g, [0, 0.06, 0])); xr(cyl(r * 0.45, 0.05, SILVER, g, [0, 0.16, 0]));
  xr(cyl(r * 1.15, 0.05, SILVER, g, [0, -0.04, 0]));
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; xr(mesh(new THREE.BoxGeometry(0.014, 0.05, 0.014), SILVER, g, [Math.cos(a) * r * 1.2, -0.04, Math.sin(a) * r * 1.2])); }
  xr(cyl(r * 0.5, 0.02, COPPER, g, [0, 0.14, 0]));
}
function cable(parent, pts, r) { const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); return xr(mesh(new THREE.TubeGeometry(c, 24, r || 0.011, 8), BLACK, parent)); }
function controller(parent, pos, rotY) {
  const g = group(parent, pos); g.rotation.y = rotY || 0;
  xr(boxm(0.20, 0.26, 0.012, new THREE.MeshStandardMaterial({ color: '#1f8f4a' }), g, [0, 0, 0]));
  for (let i = 0; i < 9; i++) xr(boxm(0.03 + (i % 3) * 0.01, 0.03, 0.018, i % 2 ? BLACK : SILVER, g, [-0.06 + (i % 3) * 0.06, -0.08 + Math.floor(i / 3) * 0.07, 0.01]));
}

// joint rings, rotation / sliding axes and anchors for the labels (filled by the models)
const rings = [], axes = [], anchors = [];
function ring(i, parent, pos, axis, r, opt) {
  opt = opt || {};
  const m = new THREE.MeshStandardMaterial({ color: COL[i], emissive: COL[i], emissiveIntensity: 0.35, roughness: 0.4 });
  const t = mesh(new THREE.TorusGeometry(r, 0.012, 12, 64), m, parent, pos); if (axis === 'x') t.rotation.y = Math.PI / 2; else if (axis === 'y') t.rotation.x = Math.PI / 2;
  rings[i] = t; if (opt.xray) { t.visible = false; t.userData.xray = true; }
  const a = mesh(new THREE.CylinderGeometry(0.004, 0.004, opt.len || 0.9, 8), new THREE.MeshBasicMaterial({ color: COL[i], transparent: true, opacity: 0.9 }), opt.axisParent || parent, opt.axisPos || pos, axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : null);
  a.visible = false; axes[i] = a; if (opt.noAxis) a.userData.none = true;
  const an = new THREE.Object3D(); an.position.set(...pos); parent.add(an); anchors[i] = an;
}

// ------------------------------------------------------------------ model 1: 6-axis industrial robot
function buildSix() {
  const robot = group(scene);
  cyl(0.30, 0.04, BASE, robot, [0, 0.02, 0]); cyl(0.24, 0.1, DARK, robot, [0, 0.09, 0]);
  const g1 = group(robot, [0, 0.14, 0]);                       // J1: rotation about the vertical axis
  cyl(0.22, 0.06, ORANGE, g1, [0, 0.03, 0]);
  mesh(new THREE.CapsuleGeometry(0.15, 0.30, 8, 24), ORANGE, g1, [0.06, 0.32, 0]);
  boxm(0.30, 0.42, 0.30, ORANGE, g1, [0.06, 0.30, 0]);
  const SH = [0.16, 0.56, 0];                                  // shoulder pivot (in g1)
  cyl(0.13, 0.42, DARK, g1, SH, 'z');
  controller(g1, [0, 0.28, 0]);
  drive(g1, [0.1, 0.1, 0], 'y', 0.07);
  cable(g1, [[-0.1, 0.28, 0.06], [0.0, 0.4, 0.1], [0.1, 0.5, 0.08], SH]);
  const g2 = group(g1, SH);                                    // J2: shoulder
  const UA = 0.6;
  mesh(new THREE.CapsuleGeometry(0.095, UA - 0.1, 8, 24), ORANGE, g2, [0, UA / 2, 0]);
  boxm(0.2, UA * 0.92, 0.22, ORANGE, g2, [0, UA / 2, 0]);
  drive(g2, [0, 0.08, 0.17], 'z', 0.07);
  const EL = [0, UA, 0];
  cyl(0.115, 0.34, DARK, g2, EL, 'z');
  cable(g2, [[0, 0.02, -0.05], [0.02, 0.2, 0.0], [0.02, 0.4, -0.04], [0, UA, -0.03]]);
  const g3 = group(g2, EL);                                    // J3: elbow
  const FA = 0.42;
  boxm(FA + 0.12, 0.17, 0.2, ORANGE, g3, [(FA + 0.12) / 2 - 0.06, 0, 0]);
  drive(g3, [0.04, 0.0, 0.16], 'z', 0.06);
  cable(g3, [[0, -0.03, -0.04], [0.15, 0.0, -0.06], [0.3, 0.02, -0.03], [FA, 0, 0]]);
  const g4 = group(g3, [FA, 0, 0]);                            // J4: wrist roll (about the forearm axis)
  cyl(0.088, 0.2, ORANGE, g4, [0.1, 0, 0], 'x'); mesh(new THREE.SphereGeometry(0.088, 24, 16), ORANGE, g4, [0.2, 0, 0]);
  drive(g4, [0.06, 0, 0], 'x', 0.045);
  const g5 = group(g4, [0.2, 0, 0]);                           // J5: wrist pitch
  cyl(0.075, 0.2, DARK, g5, [0, 0, 0], 'z');
  boxm(0.15, 0.13, 0.13, ORANGE, g5, [0.07, 0, 0]);
  drive(g5, [0.03, 0, 0.1], 'z', 0.04);
  const g6 = group(g5, [0.15, 0, 0]);                          // J6: tool rotation
  cyl(0.06, 0.03, SILVER, g6, [0.015, 0, 0], 'x');
  boxm(0.04, 0.16, 0.07, DARK, g6, [0.05, 0, 0]);
  for (const s of [-1, 1]) boxm(0.11, 0.018, 0.045, DARK, g6, [0.125, s * 0.06, 0]);
  drive(g6, [0.02, 0, 0], 'x', 0.03);
  ring(0, robot, [0, 0.14, 0], 'y', 0.33); ring(1, g1, SH, 'z', 0.2); ring(2, g2, EL, 'z', 0.17);
  ring(3, g3, [FA, 0, 0], 'x', 0.115); ring(4, g4, [0.2, 0, 0], 'z', 0.11); ring(5, g5, [0.15, 0, 0], 'x', 0.08);
  return () => { g1.rotation.y = q[0] * D2R; g2.rotation.z = -q[1] * D2R; g3.rotation.z = q[2] * D2R; g4.rotation.x = q[3] * D2R; g5.rotation.z = q[4] * D2R; g6.rotation.x = q[5] * D2R; };
}

// ------------------------------------------------------------------ model 2: SCARA (R-R-P-R)
function buildScara() {
  const robot = group(scene);
  boxm(0.55, 0.06, 0.55, BASE, robot, [0, 0.03, 0]);
  cyl(0.13, 0.54, ORANGE, robot, [0, 0.33, 0]);
  controller(robot, [0, 0.3, 0.0], 0.0);
  const H = 0.6;
  const g1 = group(robot, [0, H, 0]);                          // J1: base rotation
  cyl(0.14, 0.14, DARK, g1, [0, 0, 0]);
  boxm(0.6, 0.1, 0.2, ORANGE, g1, [0.3, 0, 0]); cyl(0.1, 0.1, ORANGE, g1, [0, 0, 0]); cyl(0.1, 0.1, ORANGE, g1, [0.6, 0, 0]);
  drive(g1, [0, -0.0, 0], 'y', 0.06, 0.55);
  cable(g1, [[0.05, 0.0, 0.07], [0.3, 0.01, 0.06], [0.58, 0.02, 0.04]]);
  const g2 = group(g1, [0.6, 0.1, 0]);                         // J2: elbow rotation
  cyl(0.085, 0.12, DARK, g2, [0, 0, 0]);
  boxm(0.5, 0.09, 0.18, ORANGE, g2, [0.25, 0, 0]); cyl(0.09, 0.09, ORANGE, g2, [0.5, 0, 0]);
  drive(g2, [0, 0, 0], 'y', 0.05, 0.5);
  cyl(0.065, 0.2, DARK, g2, [0.5, 0.0, 0]);                    // housing of the quill
  drive(g2, [0.43, 0.1, 0.0], 'y', 0.04, 0.6); drive(g2, [0.57, 0.1, 0.0], 'y', 0.04, 0.6);   // J3 (screw) and J4 motors
  cable(g2, [[0.05, 0.03, 0.06], [0.25, 0.03, 0.05], [0.5, 0.05, 0.04]]);
  const g3 = group(g2, [0.5, -0.3, 0]);                        // J3: vertical slide (the rod moves down)
  cyl(0.022, 0.6, SILVER, g3, [0, 0.3, 0]);
  xr(cyl(0.008, 0.55, COPPER, g3, [0.0, 0.3, 0.0]));            // the screw
  const g4 = group(g3);                                        // J4: tool rotation
  cyl(0.045, 0.02, SILVER, g4, [0, -0.01, 0]);
  boxm(0.14, 0.03, 0.05, DARK, g4, [0, -0.04, 0]);
  for (const s of [-1, 1]) boxm(0.018, 0.07, 0.04, DARK, g4, [s * 0.06, -0.09, 0]);
  ring(0, robot, [0, H, 0], 'y', 0.2); ring(1, g1, [0.6, 0.1, 0], 'y', 0.15);
  ring(2, g2, [0.5, -0.07, 0], 'y', 0.09); ring(3, g3, [0, -0.01, 0], 'y', 0.07);
  return () => { g1.rotation.y = q[0] * D2R; g2.rotation.y = q[1] * D2R; g3.position.y = -0.3 - q[2] / 100; g4.rotation.y = q[3] * D2R; };
}

// ------------------------------------------------------------------ model 3: cobot (UR style, offset wrist)
function buildCobot() {
  const robot = group(scene);
  cyl(0.085, 0.04, BASE, robot, [0, 0.02, 0]);
  const g1 = group(robot, [0, 0.04, 0]);                       // J1: base rotation
  cyl(0.07, 0.1, LIGHT, g1, [0, 0.05, 0]); cyl(0.073, 0.02, BLUE, g1, [0, 0.0, 0]);
  const SH = [0, 0.09, 0];
  cyl(0.065, 0.16, LIGHT, g1, SH, 'z'); cyl(0.068, 0.02, BLUE, g1, [0, 0.09, 0.09], 'z'); cyl(0.068, 0.02, BLUE, g1, [0, 0.09, -0.09], 'z');
  controller(g1, [0, 0.05, 0.0], 0);
  drive(g1, [0, 0.0, 0], 'y', 0.04, 0.5);
  const g2 = group(g1, SH);                                    // J2: shoulder
  const UA = 0.425, OFF = 0.13;
  cyl(0.052, UA, LIGHT, g2, [0, UA / 2, OFF]); cyl(0.056, 0.02, BLUE, g2, [0, 0.0, OFF - 0.02]); 
  boxm(0.06, 0.1, OFF, LIGHT, g2, [0, 0.03, OFF / 2]);
  drive(g2, [0, 0.0, 0.07], 'z', 0.04, 0.6);
  const EL = [0, UA, OFF];
  cyl(0.058, 0.14, LIGHT, g2, EL, 'z'); cyl(0.061, 0.02, BLUE, g2, [0, UA, OFF + 0.07], 'z');
  cable(g2, [[0, 0.02, 0.03], [0.0, 0.2, 0.08], [0.0, UA - 0.05, OFF]], 0.008);
  const g3 = group(g2, EL);                                    // J3: elbow
  const FA = 0.392;
  cyl(0.048, FA, LIGHT, g3, [FA / 2, 0, 0.0], 'x'); cyl(0.051, 0.02, BLUE, g3, [0.0, 0, 0.0], 'x');
  drive(g3, [0.06, 0, 0.0], 'x', 0.035, 0.6);
  cable(g3, [[0, 0, 0.03], [0.15, 0.0, 0.03], [FA, 0, 0.03]], 0.008);
  const g4 = group(g3, [FA, 0, 0]);                            // J4: wrist 1
  cyl(0.045, 0.1, LIGHT, g4, [0, 0, 0], 'z'); cyl(0.048, 0.02, BLUE, g4, [0, 0, 0.05], 'z');
  boxm(0.07, 0.109, 0.07, LIGHT, g4, [0, -0.0545, 0]);
  drive(g4, [0, -0.02, 0.0], 'z', 0.03, 0.5);
  const g5 = group(g4, [0, -0.109, 0]);                        // J5: wrist 2 (axis perpendicular to J4)
  cyl(0.045, 0.1, LIGHT, g5, [0, 0, 0]); cyl(0.048, 0.02, BLUE, g5, [0, -0.05, 0]);
  boxm(0.07, 0.07, 0.095, LIGHT, g5, [0, 0, 0.0475]);
  drive(g5, [0, 0.0, 0.0], 'y', 0.03, 0.5);
  const g6 = group(g5, [0, 0, 0.095]);                         // J6: wrist 3 (tool flange)
  cyl(0.04, 0.05, LIGHT, g6, [0, 0, 0.025], 'z'); cyl(0.043, 0.012, BLUE, g6, [0, 0, 0.056], 'z');
  boxm(0.14, 0.03, 0.03, DARK, g6, [0, 0, 0.075]);
  for (const s of [-1, 1]) boxm(0.018, 0.035, 0.07, DARK, g6, [s * 0.06, 0, 0.11]);
  ring(0, robot, [0, 0.04, 0], 'y', 0.11); ring(1, g1, SH, 'z', 0.12); ring(2, g2, EL, 'z', 0.11);
  ring(3, g3, [FA, 0, 0], 'z', 0.085); ring(4, g4, [0, -0.109, 0], 'y', 0.085); ring(5, g5, [0, 0, 0.095], 'z', 0.075);
  return () => { g1.rotation.y = q[0] * D2R; g2.rotation.z = -q[1] * D2R; g3.rotation.z = q[2] * D2R; g4.rotation.z = q[3] * D2R; g5.rotation.y = q[4] * D2R; g6.rotation.z = q[5] * D2R; };
}

// ------------------------------------------------------------------ model 4: Delta robot (3 arms, parallelograms)
function buildDelta() {
  const RB = 0.16, RE = 0.05, LU = 0.28, LF = 0.55, W = 0.07, H = 0.74;
  const PHI = [0, 120, 240].map((d) => d * D2R);
  const Uv = (i) => new THREE.Vector3(Math.cos(PHI[i]), 0, Math.sin(PHI[i])), Tv = (i) => new THREE.Vector3(-Math.sin(PHI[i]), 0, Math.cos(PHI[i]));
  const robot = group(scene);
  for (let i = 0; i < 3; i++) { const a = PHI[i] + Math.PI / 3; cyl(0.014, H + 0.08, BASE, robot, [0.27 * Math.cos(a), (H + 0.08) / 2, 0.27 * Math.sin(a)]); }
  mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.025, 3), BASE, robot, [0, H + 0.075, 0], [0, -Math.PI / 2 + 0.0, 0]);
  cyl(0.05, 0.03, DARK, robot, [0, H + 0.1, 0]);
  const arms = [], elbowBars = [];
  for (let i = 0; i < 3; i++) {
    const leg = group(robot); leg.rotation.y = -PHI[i];
    cyl(0.048, 0.13, DARK, leg, [RB, H, 0], 'z'); boxm(0.06, 0.07, 0.12, BASE, leg, [RB, H + 0.045, 0]);
    drive(leg, [RB, H, 0], 'z', 0.04, 0.9);
    const arm = group(leg, [RB, H, 0]); arms.push(arm);
    boxm(LU, 0.035, 0.045, ORANGE, arm, [LU / 2, 0, 0]);
    cyl(0.013, W + 0.03, DARK, arm, [LU, 0, 0], 'z');
    for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.017, 16, 12), SILVER, arm, [LU, 0, s * W / 2]);
    ring(i, leg, [RB, H, 0], 'z', 0.08);
  }
  const rods = []; for (let k = 0; k < 6; k++) rods.push(mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 1, 12), new THREE.MeshStandardMaterial({ color: '#cfd6df', metalness: 0.3, roughness: 0.4 }), robot));
  const eff = group(robot);
  mesh(new THREE.CylinderGeometry(RE + 0.02, RE + 0.02, 0.016, 3), ORANGE, eff, [0, 0, 0], [0, -Math.PI / 2, 0]);
  cyl(0.012, 0.05, SILVER, eff, [0, -0.033, 0]); mesh(new THREE.CylinderGeometry(0.014, 0.03, 0.03, 20), BLACK, eff, [0, -0.07, 0]);
  const shaft = xr(cyl(0.01, 1, SILVER, robot, [0, 0, 0]));
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.017, 16, 12), SILVER, eff, Uv(i).clone().multiplyScalar(RE).add(Tv(i).clone().multiplyScalar(s * W / 2)).toArray());
  ring(3, robot, [0, 0, 0], 'y', 0.06, { noAxis: true }); ring(4, eff, [0, 0, 0], 'y', 0.075, { noAxis: true });
  const ringP = rings[3];
  const yAxis = new THREE.Vector3(0, 1, 0);
  const P = new THREE.Vector3(0, H - 0.5, 0), out = { text: '' };
  const place = (m, A, B) => { const d = B.clone().sub(A), len = d.length(); m.position.copy(A).addScaledVector(d, 0.5); m.scale.set(1, len, 1); m.quaternion.setFromUnitVectors(yAxis, d.normalize()); };
  function pose() {
    const E = [], C = [];
    for (let i = 0; i < 3; i++) { const th = q[i] * D2R; arms[i].rotation.z = -th; const e = Uv(i).clone().multiplyScalar(RB + LU * Math.cos(th)); e.y = H - LU * Math.sin(th); E.push(e); C.push(e.clone().addScaledVector(Uv(i), -RE)); }
    // trilateration of the three spheres (centres C, radius LF): the effector is the lower intersection
    const ex = C[1].clone().sub(C[0]), d = ex.length(); ex.normalize();
    const t3 = C[2].clone().sub(C[0]), ii = ex.dot(t3), ey = t3.clone().addScaledVector(ex, -ii), j = ey.length(); ey.normalize();
    const ez = new THREE.Vector3().crossVectors(ex, ey);
    const x = d / 2, y = (ii * ii + j * j) / (2 * j) - (ii / j) * x, zz = LF * LF - x * x - y * y;
    if (zz >= 0) {
      const z = Math.sqrt(zz), a = C[0].clone().addScaledVector(ex, x).addScaledVector(ey, y), p1 = a.clone().addScaledVector(ez, z), p2 = a.clone().addScaledVector(ez, -z);
      P.copy(p1.y < p2.y ? p1 : p2);
    }
    eff.position.copy(P); shaft.visible = xray; place(shaft, new THREE.Vector3(0, H + 0.1, 0), P);
    for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) { const s = k ? 1 : -1, off = Tv(i).clone().multiplyScalar(s * W / 2); place(rods[i * 2 + k], E[i].clone().add(off), P.clone().addScaledVector(Uv(i), RE).add(off)); }
    const mid = E[0].clone().add(P.clone().addScaledVector(Uv(0), RE)).multiplyScalar(0.5); ringP.position.copy(mid); anchors[3].position.copy(mid); ringP.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), P.clone().addScaledVector(Uv(0), RE).sub(E[0]).normalize());
    out.text = L('effector: x = ', 'effecteur : x = ') + Math.round(P.x * 1000) + ' mm, z = ' + Math.round(P.z * 1000) + ' mm, ' + L('height below the plate = ', 'hauteur sous la plaque = ') + Math.round((H - P.y) * 1000) + ' mm';
  }
  pose.readout = () => out.text;
  return pose;
}

// ------------------------------------------------------------------ model 5: differential-drive mobile robot
function buildMobile() {
  const R = 0.07, TR = 0.40;
  const robot = group(scene), body = group(robot);
  boxm(0.46, 0.07, 0.32, ORANGE, body, [0, 0.105, 0]); boxm(0.40, 0.02, 0.30, DARK, body, [0, 0.15, 0]); boxm(0.02, 0.05, 0.30, DARK, body, [0.24, 0.1, 0]);
  cyl(0.012, 0.07, DARK, body, [0.05, 0.195, 0]);
  const lid = group(body, [0.05, 0.24, 0]); cyl(0.045, 0.045, DARK, lid, [0, 0, 0]); cyl(0.047, 0.012, SILVER, lid, [0, 0.015, 0]); boxm(0.02, 0.02, 0.03, ORANGE, lid, [0.04, 0, 0]);
  xr(boxm(0.20, 0.05, 0.16, new THREE.MeshStandardMaterial({ color: '#2a6fd6' }), body, [-0.05, 0.09, 0]));
  xr(boxm(0.18, 0.012, 0.12, new THREE.MeshStandardMaterial({ color: '#1f8f4a' }), body, [0.09, 0.138, 0]));
  for (let i = 0; i < 6; i++) xr(boxm(0.03, 0.014, 0.025, i % 2 ? BLACK : SILVER, body, [0.04 + (i % 3) * 0.05, 0.146, -0.03 + Math.floor(i / 3) * 0.06]));
  for (const s of [-1, 1]) { drive(body, [0, 0.085, s * 0.115], 'z', 0.03, 0.8); xr(cyl(0.028, 0.008, SILVER, body, [0, 0.085, s * 0.07], 'z')); }
  cable(body, [[-0.1, 0.1, 0.0], [0.0, 0.13, 0.05], [0.1, 0.14, 0.04]], 0.006); cable(body, [[0.05, 0.14, 0.0], [0.05, 0.19, 0.0], [0.05, 0.23, 0.0]], 0.006);
  const mkWheel = (z) => { const g = group(robot, [0, R, z]); cyl(R, 0.04, BLACK, g, [0, 0, 0], 'z'); cyl(0.045, 0.044, SILVER, g, [0, 0, 0], 'z');
    for (let k = 0; k < 5; k++) { const sp = boxm(0.07, 0.012, 0.046, DARK, g, [0, 0, 0]); sp.rotation.z = k * Math.PI / 5; } return g; };
  const wl = mkWheel(-TR / 2), wr = mkWheel(TR / 2);
  mesh(new THREE.SphereGeometry(0.035, 20, 16), SILVER, robot, [-0.19, 0.035, 0]); cyl(0.012, 0.04, DARK, robot, [-0.19, 0.07, 0]);
  ring(0, robot, [0, R, -TR / 2], 'z', 0.1); ring(1, robot, [0, R, TR / 2], 'z', 0.1);
  ring(2, robot, [-0.19, 0.04, 0], 'y', 0.06, { noAxis: true }); ring(3, body, [0.05, 0.24, 0], 'y', 0.075, { noAxis: true });
  ring(4, body, [-0.05, 0.09, 0], 'y', 0.13, { noAxis: true, xray: true }); ring(5, body, [0.09, 0.138, 0], 'y', 0.11, { noAxis: true, xray: true });
  const trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#ff9f43' })); scene.add(trail);
  const pts = []; let acc = 0;
  const st = { x: 0, z: 0, th: 0, wl: 0, wr: 0 };
  const info = { text: '' };
  const prev = new THREE.Vector3();
  function pose() { robot.position.set(st.x, 0, st.z); robot.rotation.y = st.th; wl.rotation.z = -st.wl; wr.rotation.z = -st.wr; }
  pose.tick = (dt) => {
    const wL = q[0], wR = q[1], v = R * (wL + wR) / 2, om = R * (wR - wL) / TR;
    st.wl += wL * dt; st.wr += wR * dt; prev.copy(robot.position);
    st.th += om * dt; st.x += v * Math.cos(st.th) * dt; st.z -= v * Math.sin(st.th) * dt;
    pose(); lid.rotation.y += 6 * dt;
    const dp = robot.position.clone().sub(prev); camera.position.add(dp); orbit.target.add(dp);
    acc += dt; if (acc > 0.05 && (Math.abs(v) > 1e-3 || Math.abs(om) > 1e-3)) { acc = 0; pts.push(st.x, 0.004, st.z); if (pts.length > 3 * 1500) pts.splice(0, 3); trail.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); trail.geometry.computeBoundingSphere(); }
    const rad = Math.abs(wR - wL) < 1e-6 ? '∞' : (TR / 2 * (wL + wR) / (wR - wL)).toFixed(2) + ' m';
    info.text = 'v = ' + v.toFixed(2) + ' m/s, ω = ' + om.toFixed(2) + ' rad/s, ' + L('turning radius = ', 'rayon de virage = ') + rad;
  };
  pose.reset = () => { st.x = st.z = st.th = 0; pts.length = 0; trail.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3)); pose(); };
  pose.readout = () => info.text;
  return pose;
}

// ------------------------------------------------------------------ model 6: Cartesian gantry (P-P-P)
function buildGantry() {
  const ZH = 0.95, XA = -0.1, XB = 1.1, ZA = 0.05, ZB = -0.85;           // frame height, rail ends, rail positions (scene z = -y)
  const robot = group(scene);
  for (const x of [XA, XB]) for (const z of [ZA, ZB]) { cyl(0.025, ZH, BASE, robot, [x, ZH / 2, z]); boxm(0.14, 0.02, 0.14, DARK, robot, [x, 0.01, z]); }
  for (const z of [ZA, ZB]) { boxm(XB - XA + 0.05, 0.05, 0.05, BASE, robot, [(XA + XB) / 2, ZH, z]); xr(boxm(XB - XA, 0.006, 0.012, BLACK, robot, [(XA + XB) / 2, ZH + 0.03, z + (z > -0.4 ? -0.015 : 0.015)])); }
  boxm(0.5, 0.55, 0.3, DARK, robot, [XB + 0.4, 0.275, ZB + 0.15]);       // the controller cabinet
  xr(boxm(0.2, 0.26, 0.012, new THREE.MeshStandardMaterial({ color: '#1f8f4a' }), robot, [XB + 0.4, 0.3, ZB + 0.31]));
  drive(robot, [XA - 0.06, ZH, ZA], 'x', 0.04, 0.9);
  cable(robot, [[XB + 0.2, 0.3, ZB + 0.1], [XB + 0.1, 0.1, ZB + 0.05], [XB, ZH - 0.2, ZB + 0.02], [XB, ZH + 0.02, ZB + 0.02]], 0.007);
  const gX = group(robot, [0.5, ZH, 0]);                                 // J1: the bridge moves along X
  for (const z of [ZA, ZB]) { boxm(0.1, 0.09, 0.09, ORANGE, gX, [0, 0, z]); xr(boxm(0.1, 0.02, 0.02, SILVER, gX, [0, 0.055, z])); }
  const BL = ZA - ZB;
  boxm(0.07, 0.09, BL, ORANGE, gX, [0, -0.02, (ZA + ZB) / 2]);
  drive(gX, [0, 0.07, ZB + 0.1], 'z', 0.04, 0.9);
  xr(boxm(0.012, 0.006, BL, BLACK, gX, [0, 0.03, (ZA + ZB) / 2]));
  const gY = group(gX, [0, -0.02, -0.4]);                                // J2: the carriage moves along the bridge
  boxm(0.17, 0.1, 0.14, DARK, gY, [0, -0.07, 0]);
  drive(gY, [0.0, 0.06, 0.0], 'y', 0.04, 0.8);
  cable(gY, [[0.07, 0.0, -0.03], [0.2, 0.0, -0.1], [0.28, -0.05, -0.3]], 0.006);
  const gZ = group(gY, [0, 0.02 - 0.2, 0]);                                    // J3: the vertical axis moves down
  cyl(0.026, 0.55, SILVER, gZ, [0, 0.275, 0]);
  xr(cyl(0.01, 0.5, COPPER, gZ, [0, 0.275, 0]));                          // the ball screw
  cyl(0.04, 0.03, DARK, gZ, [0, -0.015, 0]);
  boxm(0.14, 0.03, 0.05, DARK, gZ, [0, -0.045, 0]);
  for (const s of [-1, 1]) boxm(0.018, 0.1, 0.04, DARK, gZ, [s * 0.06, -0.1, 0]);
  ring(0, gX, [0, 0, ZA], 'x', 0.07, { axisParent: robot, axisPos: [0.5, ZH, ZA], len: 1.3 });
  ring(1, gY, [0, -0.02, 0], 'z', 0.09, { axisParent: gX, axisPos: [0, -0.02, -0.4], len: 1.1 });
  ring(2, gY, [0, -0.17, 0], 'y', 0.05, { axisParent: gY, axisPos: [0, -0.5, 0], len: 0.85 });
  ring(3, robot, [XA, 0.25, ZA], 'y', 0.07, { noAxis: true }); ring(4, gZ, [0, -0.08, 0], 'y', 0.09, { noAxis: true });
  const info = { text: '' };
  function pose() {
    gX.position.x = q[0] / 100; gY.position.z = -q[1] / 100; gZ.position.y = 0.02 - q[2] / 100;
    info.text = L('tool: x = ', 'outil : x = ') + Math.round(q[0]) + ' cm, y = ' + Math.round(q[1]) + ' cm, ' + L('height above the floor = ', 'hauteur au-dessus du sol = ') + Math.round((ZH - 0.15 - q[2] / 100) * 100) + ' cm';
  }
  pose.readout = () => info.text;
  return pose;
}

const pose = { six: buildSix, scara: buildScara, cobot: buildCobot, delta: buildDelta, mobile: buildMobile, gantry: buildGantry }[KIND]();

// ------------------------------------------------------------------ interface
let sel = -1, xray = false, spin = false, play = false, t0 = 0, last = 0;
const cards = [].slice.call(document.querySelectorAll('.ancard'));
const tags = cards.map((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'antag'; const lab = c.querySelector('.ann').textContent; b.textContent = lab; b.style.background = COL[i]; b.setAttribute('aria-label', lab); b.addEventListener('click', () => select(i === sel ? -1 : i)); box.appendChild(b); return b; });
const sliders = cards.map((c, i) => { const s = c.querySelector('input[type=range]'); if (!s) { c.classList.add('info'); return null; } s.min = LIM[i][0]; s.max = LIM[i][1]; s.step = CFG.step || 1; s.value = q[i]; const o = c.querySelector('output'); const show = () => { o.textContent = q[i].toFixed(DEC) + CFG.unit[i]; }; show(); s.addEventListener('input', () => { q[i] = +s.value; show(); pose(); select(i); play = false; syncBtn(); }); c._show = show; return s; });
cards.forEach((c, i) => c.querySelector('.anhead').addEventListener('click', () => select(i === sel ? -1 : i)));
const readout = document.createElement('div'); readout.className = 'anout'; box.appendChild(readout);
function select(i) {
  sel = i;
  cards.forEach((c, k) => c.classList.toggle('on', k === i)); tags.forEach((t, k) => t.classList.toggle('on', k === i));
  rings.forEach((r, k) => { r.material.emissiveIntensity = k === i ? 1.4 : 0.35; r.scale.setScalar(k === i ? 1.12 : 1); });
  axes.forEach((a, k) => { a.visible = k === i && !a.userData.none; });
  if (i >= 0 && rings[i] && rings[i].userData.xray && !xray) setXray(true);
}
const $ = (id) => document.getElementById(id);
function setXray(on) {
  xray = on; shells.forEach((m) => { m.transparent = on; m.opacity = on ? 0.16 : 1; m.depthWrite = !on; m.needsUpdate = true; });
  inner.forEach((m) => { m.visible = on; }); rings.forEach((r) => { if (r.userData.xray) r.visible = on; });
  $('xrayBtn').classList.toggle('on', on); $('xrayBtn').setAttribute('aria-pressed', on);
}
function syncBtn() { $('playBtn').classList.toggle('on', play); $('playBtn').setAttribute('aria-pressed', play); $('spinBtn').classList.toggle('on', spin); $('spinBtn').setAttribute('aria-pressed', spin); }
function setQ(i, v) { q[i] = v; if (sliders[i]) { sliders[i].value = v; cards[i]._show(); } }
$('xrayBtn').addEventListener('click', () => setXray(!xray));
$('spinBtn').addEventListener('click', () => { spin = !spin; syncBtn(); });
$('playBtn').addEventListener('click', () => { play = !play; t0 = performance.now(); if (play && sel < 0 && !CFG.playFn) select(0); syncBtn(); });
$('resetBtn').addEventListener('click', () => { CFG.home.forEach((v, i) => setQ(i, v)); if (pose.reset) pose.reset(); pose(); play = false; syncBtn(); camera.position.set(...CFG.cam); orbit.target.set(...CFG.target); });
$('wristBtn').addEventListener('click', () => { const sp = Array.isArray(CFG.special[0]) ? CFG.special : [CFG.special]; sp.forEach(([i, v]) => setQ(i, v)); pose(); select(sp[0][0]); play = false; syncBtn(); });

function resize() { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
const v = new THREE.Vector3();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
  if (play) {
    if (CFG.playFn) CFG.playFn(now).forEach((val, i) => setQ(i, val));
    else if (sel >= 0 && sel < NQ) setQ(sel, CFG.playBase[sel] + CFG.playAmp[sel] * Math.sin((now - t0) / 700));
  }
  if (pose.tick) pose.tick(dt); else if (play) pose();
  if (pose.readout) readout.textContent = pose.readout();
  orbit.autoRotate = spin; orbit.autoRotateSpeed = 1.2; orbit.update();
  renderer.render(scene, camera);
  const w = box.clientWidth, h = box.clientHeight;
  anchors.forEach((a, i) => { a.getWorldPosition(v); v.project(camera); tags[i].style.display = v.z > 1 ? 'none' : ''; tags[i].style.left = ((v.x * 0.5 + 0.5) * w) + 'px'; tags[i].style.top = ((-v.y * 0.5 + 0.5) * h) + 'px'; });
}
pose(); select(-1); requestAnimationFrame(loop);
window.RA_ANATOMY = { q, select, setXray, pose };
