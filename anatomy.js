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
  wheels: { n: 7, nq: 3, col: [...ALLCOL, '#f1c40f'], lim: [[-12, 12], [-90, 90], [-90, 90]], home: [4, 0, 0], unit: [' rad/s', '°', '°'], dec: 0, grid: 10,
    playBase: [4, 0, 0], playAmp: [8, 70, 70], cam: [0.5, 1.8, 3.9], target: [0, 0.3, 0], special: [[1, 90], [2, 90]] },
  drives: { n: 8, nq: 3, col: ALLCOL.concat(['#f1c40f', '#e67e22']), lim: [[-1, 1], [-1, 1], [-2, 2]], home: [0.4, 0, 0], unit: [' m/s', ' m/s', ' rad/s'], dec: 2, step: 0.05, grid: 30, panel: true,
    playFn: (now) => [0.45, 0.4 * Math.sin(now / 1100), 0.9 * Math.cos(now / 1700)], cam: [1.25, 0.95, 1.4], target: [0, 0.15, 0], special: [[0, 0], [1, 0.5], [2, 0]] },
  stewart: { n: 6, nq: 6, cmd: true, col: ALLCOL, lim: [[-25, 25], [-25, 25], [-20, 20], [-20, 20], [-20, 20], [-25, 25]], home: [0, 0, 0, 0, 0, 0], unit: [' cm', ' cm', ' cm', '°', '°', '°'], dec: 0, grid: 4,
    playFn: (now) => [10 * Math.sin(now / 1300), 10 * Math.sin(now / 1700 + 1), 8 * Math.sin(now / 1100), 12 * Math.sin(now / 900), 12 * Math.sin(now / 1500 + 2), 15 * Math.sin(now / 2100)], cam: [2.0, 1.4, 2.3], target: [0, 0.55, 0], special: [[0, 0], [1, 0], [2, 0], [3, 15], [4, 10], [5, 0]] },
  quadrotor: { n: 6, nq: 4, cmd: true, col: ALLCOL, lim: [[-100, 100], [-25, 25], [-25, 25], [-120, 120]], home: [0, 0, 0, 0], unit: [' %', '°', '°', '°/s'], dec: 0, grid: 40,
    playFn: (now) => [25 * Math.sin(now / 2600), 14 * Math.sin(now / 1500), 14 * Math.cos(now / 1500), 25 * Math.sin(now / 3000)], cam: [0.9, 0.7, 1.05], target: [0, 0.6, 0], special: [[0, 0]] },
  humanoid: { n: 6, nq: 5, cmd: true, col: ALLCOL, lim: [[0, 100], [-60, 60], [-30, 170], [-80, 80], [0, 100]], home: [0, 0, 0, 0, 50], unit: [' %', '°', '°', '°', ' %'], dec: 0, grid: 40,
    playFn: (now) => [35 + 35 * Math.sin(now / 1500), 40 * Math.sin(now / 1900), 75 + 75 * Math.sin(now / 1300), 55 * Math.sin(now / 1700), q[4]], cam: [2.9, 1.3, 2.3], target: [0, 0.85, 0], special: [[0, 0]] },
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


// ------------------------------------------------------------------ model 7: a showroom of seven wheel types
function buildWheels() {
  const R = 0.15, W = 0.06, SP = 0.78, X0 = -3 * SP;
  const slot = (k) => { const g = group(scene, k < 4 ? [(k - 1.5) * 0.78, 0, 0.5] : [(k - 5) * 0.78, 0, -0.5]); boxm(0.64, 0.01, 0.4, DARK, g, [0, 0.005, 0]); return g; };
  const spinners = [], trackers = [];
  const tire = (parent, pos, r, w) => {
    const g = group(parent, pos);
    cyl(r, w, BLACK, g, [0, 0, 0], 'z'); cyl(r * 0.68, w * 1.05, SILVER, g, [0, 0, 0], 'z'); cyl(r * 0.28, w * 1.2, ORANGE, g, [0, 0, 0], 'z');
    for (let i = 0; i < 5; i++) { const sp = boxm(r * 1.2, r * 0.12, w * 0.9, DARK, g, [0, 0, 0]); sp.rotation.z = i * Math.PI / 5; }
    xr(mesh(new THREE.TorusGeometry(r * 0.3, 0.008, 8, 24), SILVER, g, [0, 0, w * 0.58]));          // bearing
    const m = group(g); m.rotation.x = Math.PI / 2; xr(cyl(r * 0.22, w * 1.5, MOTOR, m, [0, 0, 0])); xr(cyl(r * 0.12, w * 1.9, COPPER, m, [0, 0, 0]));   // hub motor
    return g;
  };
  const fork = (parent, r, w, h) => { for (const s of [-1, 1]) boxm(0.012, h, r * 0.5, DARK, parent, [0, r + (h - r) / 2, s * (w / 2 + 0.014)]); boxm(r * 0.5, 0.012, w + 0.05, DARK, parent, [0, r + (h - r) + 0.006, 0]); };
  const plate = (parent, y) => boxm(0.34, 0.025, 0.3, BASE, parent, [0, y, 0]);
  // 0: fixed wheel
  const s0 = slot(0); const w0 = tire(s0, [0, R, 0], R, W); fork(s0, R, W, R * 2 + 0.1); plate(s0, R * 2 + 0.12); spinners.push(w0);
  ring(0, s0, [0, R, 0], 'z', R + 0.05, { noAxis: true });
  // 1: castor
  const s1 = slot(1); boxm(0.3, 0.025, 0.3, BASE, s1, [0, 0.4, 0]); cyl(0.03, 0.12, SILVER, s1, [0, 0.33, 0]);
  xr(mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 24), SILVER, s1, [0, 0.3, 0], [Math.PI / 2, 0, 0]));
  const sw1 = group(s1, [0, 0.28, 0]); boxm(0.14, 0.02, 0.06, DARK, sw1, [-0.05, 0, 0]);
  const gg = group(sw1, [0, -0.28, 0]), w1 = tire(gg, [-0.1, 0.1, 0], 0.1, 0.045); fork(group(gg, [-0.1, 0, 0]), 0.1, 0.045, 0.26); spinners.push(w1);
  ring(1, s1, [0, 0.28, 0], 'y', 0.09, { len: 0.5, axisPos: [0, 0.3, 0] });
  // 2: steered drive wheel
  const s2 = slot(2); boxm(0.3, 0.025, 0.3, BASE, s2, [0, 0.62, 0]); cyl(0.07, 0.08, BLUE, s2, [0, 0.69, 0]);
  xr(cyl(0.05, 0.12, MOTOR, s2, [0, 0.74, 0])); xr(cyl(0.065, 0.015, SILVER, s2, [0, 0.62, 0]));
  const sw2 = group(s2, [0, 0, 0]); const w2 = tire(sw2, [0, R, 0], R, W); fork(sw2, R, W, R * 2 + 0.1); boxm(0.06, 0.2, 0.06, DARK, sw2, [0, 0.5, 0]); cyl(0.04, 0.05, ORANGE, sw2, [0, 0.52, 0]); spinners.push(w2);
  ring(2, s2, [0, 0.6, 0], 'y', 0.1, { len: 0.7, axisPos: [0, 0.4, 0] });
  // 3, 4: omni and mecanum wheels (free rollers around the rim)
  const rollerWheel = (k, tilt) => {
    const sl = slot(k), g = group(sl, [0, R, 0]), N = 12;
    cyl(R * 0.72, W * 1.1, SILVER, g, [0, 0, 0], 'z'); cyl(R * 0.25, W * 1.3, ORANGE, g, [0, 0, 0], 'z');
    const Y = new THREE.Vector3(0, 1, 0), rolls = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2, tg = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0), ax = tilt ? tg.clone().multiplyScalar(Math.cos(Math.PI / 4)).add(new THREE.Vector3(0, 0, Math.sin(Math.PI / 4))).normalize() : tg;
      const r = mesh(new THREE.CapsuleGeometry(0.027, tilt ? 0.05 : 0.035, 6, 14), BLACK, g, [Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, 0]); r.quaternion.setFromUnitVectors(Y, ax); rolls.push(r);
      xr(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.09, 8), SILVER, g, [Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, 0])).quaternion.setFromUnitVectors(Y, ax);
    }
    const m = group(g); m.rotation.x = Math.PI / 2; xr(cyl(R * 0.2, W * 1.6, MOTOR, m, [0, 0, 0]));
    fork(sl, R, W, R * 2 + 0.1); plate(sl, R * 2 + 0.12); spinners.push(g); return sl;
  };
  const s3 = rollerWheel(3, false), s4 = rollerWheel(4, true);
  ring(3, s3, [0, R, 0], 'z', R + 0.05, { noAxis: true }); ring(4, s4, [0, R, 0], 'z', R + 0.05, { noAxis: true });
  // 5: ball wheel
  const s5 = slot(5), tc = document.createElement('canvas'); tc.width = 256; tc.height = 128; const t = tc.getContext('2d'); t.fillStyle = '#d8d8d8'; t.fillRect(0, 0, 256, 128); t.fillStyle = '#ff9a1f'; for (let i = 0; i < 8; i++) t.fillRect(i * 32, 0, 14, 128);
  const tex = new THREE.CanvasTexture(tc), ball = new THREE.Mesh(new THREE.SphereGeometry(R * 0.95, 40, 28), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.1 })); ball.position.y = R + 0.01; s5.add(ball); spinners.push(ball);
  mesh(new THREE.TorusGeometry(R * 0.8, 0.03, 10, 40), DARK, s5, [0, R * 1.5, 0], [Math.PI / 2, 0, 0]); plate(s5, R * 2 + 0.2); cyl(0.025, 0.2, DARK, s5, [0, R * 2 + 0.1, 0]);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.3, rol = cyl(0.04, 0.045, ORANGE, s5, [Math.cos(a) * R * 0.78, R * 1.42, Math.sin(a) * R * 0.78]); rol.rotation.set(0, -a, Math.PI / 2.6); xr(cyl(0.03, 0.08, MOTOR, s5, [Math.cos(a) * R * 1.05, R * 1.7, Math.sin(a) * R * 1.05])); }
  ring(5, s5, [0, R, 0], 'z', R + 0.05, { noAxis: true });
  // 6: track
  const s6 = slot(6), TL = 0.34, TR = 0.1, Pn = 2 * TL + 2 * Math.PI * TR, NB = 30, belt = [];
  for (const sx of [-1, 1]) { cyl(TR * 0.82, 0.14, SILVER, s6, [sx * TL / 2, TR + 0.01, 0], 'z'); cyl(TR * 0.4, 0.16, ORANGE, s6, [sx * TL / 2, TR + 0.01, 0], 'z'); }
  for (let k = -1; k <= 1; k++) cyl(0.04, 0.12, DARK, s6, [k * TL / 2.2, 0.05, 0], 'z');
  for (let i = 0; i < NB; i++) { const b = boxm(0.045, 0.014, 0.16, i % 2 ? BLACK : DARK, s6, [0, 0, 0]); belt.push(b); }
  const place = (off) => belt.forEach((b, i) => { let u = ((i * Pn / NB) + off) % Pn; if (u < 0) u += Pn; let x, y, a; const cy = TR + 0.01;
    if (u < TL) { x = TL / 2 - u; y = cy - TR; a = 0; } else if (u < TL + Math.PI * TR) { const tt = (u - TL) / TR; x = -TL / 2 - Math.sin(tt) * TR; y = cy - Math.cos(tt) * TR; a = tt; }
    else if (u < 2 * TL + Math.PI * TR) { x = -TL / 2 + (u - TL - Math.PI * TR); y = cy + TR; a = Math.PI; } else { const tt = (u - 2 * TL - Math.PI * TR) / TR; x = TL / 2 + Math.sin(tt) * TR; y = cy + Math.cos(tt) * TR; a = Math.PI + tt; }
    b.position.set(x, y, 0); b.rotation.z = a; });
  place(0); trackers.push({ place, P: Pn }); boxm(0.46, 0.04, 0.22, BASE, s6, [0, 0.27, 0]);
  xr(cyl(TR * 0.3, 0.12, MOTOR, s6, [TL / 2, TR + 0.01, 0.0], 'z'));
  ring(6, s6, [0, TR + 0.01, 0], 'z', 0.2, { noAxis: true });
  const st = { a: 0, trk: 0 }, castorWheel = w1;
  function pose() {
    sw1.rotation.y = q[1] * D2R; sw2.rotation.y = q[2] * D2R;
    spinners.forEach((g) => { g.rotation.z = -st.a; }); ball.rotation.z = -st.a; ball.rotation.y = 0;
    trackers.forEach((tk) => tk.place(st.trk));
  }
  pose.tick = (dt) => { st.a += q[0] * dt; st.trk += q[0] * 0.1 * dt; pose(); };
  return pose;
}


// ------------------------------------------------------------------ model 8: eight drive configurations (one robot shown at a time)
function buildDrives() {
  const R = 0.07, W = 0.04, D = D2R;
  const root = group(scene), cfgs = [], st = { x: 0, z: 0, th: 0 }, info = { text: '' };
  const wheelObjs = [];
  function mkWheel(parent, x, y, head, kind, o) {
    o = o || {};
    const pivot = group(parent, [x, 0, -y]), steer = group(pivot), hd = group(steer); hd.rotation.y = head * D;
    const spin = group(hd, [0, R, 0]);
    if (kind === 'fixed') { cyl(R, W, BLACK, spin, [0, 0, 0], 'z'); cyl(R * 0.68, W * 1.05, SILVER, spin, [0, 0, 0], 'z'); cyl(R * 0.28, W * 1.2, ORANGE, spin, [0, 0, 0], 'z');
      for (let i = 0; i < 5; i++) { const sp = boxm(R * 1.2, R * 0.12, W * 0.9, DARK, spin, [0, 0, 0]); sp.rotation.z = i * Math.PI / 5; } }
    else {
      cyl(R * 0.72, W * 1.1, SILVER, spin, [0, 0, 0], 'z'); cyl(R * 0.25, W * 1.3, ORANGE, spin, [0, 0, 0], 'z');
      const Y = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, tg = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0), ax = kind === 'mecanum' ? tg.clone().multiplyScalar(Math.SQRT1_2).add(new THREE.Vector3(0, 0, Math.SQRT1_2 * (o.tilt || 1))).normalize() : tg;
        const r = mesh(new THREE.CapsuleGeometry(0.02, kind === 'mecanum' ? 0.035 : 0.025, 6, 12), BLACK, spin, [Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, 0]); r.quaternion.setFromUnitVectors(Y, ax); }
    }
    for (const sd of [-1, 1]) boxm(0.01, 0.12, 0.05, DARK, hd, [0, R + 0.06, sd * (W / 2 + 0.012)]);
    const m = group(spin); m.rotation.x = Math.PI / 2; xr(cyl(R * 0.22, W * 1.5, MOTOR, m, [0, 0, 0])); xr(cyl(R * 0.12, W * 1.9, COPPER, m, [0, 0, 0]));
    if (o.steered) { cyl(0.035, 0.05, BLUE, hd, [0, 0.2, 0]); xr(cyl(0.025, 0.07, MOTOR, hd, [0, 0.2, 0])); xr(cyl(0.04, 0.012, SILVER, hd, [0, 0.16, 0])); }
    const w = { pivot, steer, spin, a: 0, speed: 0, delta: 0, target: 0, x, y, head, kind, steered: !!o.steered };
    wheelObjs.push(w); return w;
  }
  const deco = (g, size, pos) => { boxm(size[0], 0.05, size[1], ORANGE, g, [pos[0], 0.17, pos[1]]); boxm(size[0] * 0.8, 0.015, size[1] * 0.8, DARK, g, [pos[0], 0.2, pos[1]]); cone(g, pos[0] + size[0] / 2 + 0.01); xr(boxm(0.2, 0.045, 0.14, new THREE.MeshStandardMaterial({ color: '#2a6fd6' }), g, [pos[0] - 0.04, 0.14, pos[1]])); };
  const cone = (g, x) => { const c = mesh(new THREE.ConeGeometry(0.04, 0.09, 16), BLUE, g, [x, 0.17, 0], [0, 0, -Math.PI / 2]); return c; };
  const vel = (w, vx, vy, om) => [vx - om * w.y, vy + om * w.x];
  const along = (w, vw) => { const h = w.head * D; return vw[0] * Math.cos(h) + vw[1] * Math.sin(h); };
  const steerCmd = (w, vw) => { let sp = Math.hypot(vw[0], vw[1]); if (sp < 1e-3) return [w.delta, 0]; let dl = Math.atan2(vw[1], vw[0]) / D; if (Math.abs(dl) > 90) { dl -= Math.sign(dl) * 180; sp = -sp; } return [dl, sp]; };
  const msg = (en, fr) => L(en, fr);
  const defs = [
    // 0 differential
    () => { const g = group(root); deco(g, [0.5, 0.32], [-0.02, 0]); mesh(new THREE.SphereGeometry(0.03, 16, 12), SILVER, g, [-0.25, 0.03, 0]);
      const wl = mkWheel(g, 0, 0.2, 0, 'fixed'), wr = mkWheel(g, 0, -0.2, 0, 'fixed');
      return { g, wheels: [wl, wr], run: (vx, vy, om) => { const n = []; if (Math.abs(vy) > 1e-3) n.push(msg('vy ignored: it cannot slide sideways.', 'vy ignoré : il ne peut pas glisser de côté.')); wl.speed = along(wl, vel(wl, vx, 0, om)) / R; wr.speed = along(wr, vel(wr, vx, 0, om)) / R; return { tw: [vx, 0, om], notes: n }; } }; },
    // 1 tricycle
    () => { const g = group(root); deco(g, [0.62, 0.32], [0.12, 0]); const rl = mkWheel(g, 0, 0.2, 0, 'fixed'), rr = mkWheel(g, 0, -0.2, 0, 'fixed'), f = mkWheel(g, 0.45, 0, 0, 'fixed', { steered: true });
      return { g, wheels: [rl, rr, f], run: (vx, vy, om) => { const n = []; if (Math.abs(vy) > 1e-3) n.push(msg('vy ignored: no sideways motion.', 'vy ignoré : pas de mouvement latéral.')); [rl, rr].forEach((w) => { w.speed = along(w, vel(w, vx, 0, om)) / R; }); const c = steerCmd(f, vel(f, vx, 0, om)); f.target = c[0]; f.speed = c[1] / R; return { tw: [vx, 0, om], notes: n }; } }; },
    // 2 Ackermann car
    () => { const g = group(root); deco(g, [0.74, 0.34], [0.2, 0]); const rl = mkWheel(g, 0, 0.2, 0, 'fixed'), rr = mkWheel(g, 0, -0.2, 0, 'fixed'), fl = mkWheel(g, 0.5, 0.2, 0, 'fixed', { steered: true }), fr = mkWheel(g, 0.5, -0.2, 0, 'fixed', { steered: true });
      return { g, wheels: [rl, rr, fl, fr], run: (vx, vy, om) => { const n = []; if (Math.abs(vy) > 1e-3) n.push(msg('vy ignored: no sideways motion.', 'vy ignoré : pas de mouvement latéral.'));
        if (Math.abs(vx) < 0.02) { if (Math.abs(om) > 1e-3) n.push(msg('A car cannot turn on the spot: it needs to move forward.', 'Une voiture ne peut pas tourner sur place : il faut avancer.')); om = 0; }
        else { let k = 0; while (k++ < 40 && [fl, fr].some((w) => Math.abs(steerCmd(w, vel(w, vx, 0, om))[0]) > 35)) { om *= 0.9; n[0] = msg('Steering limited to ±35°: the turn is reduced.', 'Braquage limité à ±35° : le virage est réduit.'); } }
        [rl, rr].forEach((w) => { w.speed = along(w, vel(w, vx, 0, om)) / R; }); [fl, fr].forEach((w) => { const c = steerCmd(w, vel(w, vx, 0, om)); w.target = c[0]; w.speed = c[1] / R; }); return { tw: [vx, 0, om], notes: n }; } }; },
    // 3 synchro drive
    () => { const g = group(root); cyl(0.3, 0.05, ORANGE, g, [0, 0.17, 0]); cyl(0.26, 0.015, DARK, g, [0, 0.2, 0]); cone(g, 0.3); xr(boxm(0.2, 0.045, 0.14, new THREE.MeshStandardMaterial({ color: '#2a6fd6' }), g, [0, 0.14, 0]));
      const ws = [90, 210, 330].map((a) => mkWheel(g, 0.2 * Math.cos(a * D), 0.2 * Math.sin(a * D), 0, 'fixed', { steered: true }));
      return { g, wheels: ws, run: (vx, vy, om) => { const n = []; if (Math.abs(om) > 1e-3) n.push(msg('ω ignored here: the body keeps its heading (a turret turns it separately).', 'ω ignoré ici : le corps garde son cap (une tourelle le fait tourner séparément).')); const c = steerCmd(ws[0], [vx, vy]); ws.forEach((w) => { w.target = c[0]; w.speed = c[1] / R; }); return { tw: [vx, vy, 0], notes: n }; } }; },
    // 4 kiwi, 3 omni wheels
    () => { const g = group(root); cyl(0.29, 0.05, ORANGE, g, [0, 0.17, 0]); cyl(0.25, 0.015, DARK, g, [0, 0.2, 0]); cone(g, 0.29); xr(boxm(0.2, 0.045, 0.14, new THREE.MeshStandardMaterial({ color: '#2a6fd6' }), g, [0, 0.14, 0]));
      const ws = [90, 210, 330].map((a) => mkWheel(g, 0.25 * Math.cos(a * D), 0.25 * Math.sin(a * D), a + 90, 'omni'));
      return { g, wheels: ws, run: (vx, vy, om) => { ws.forEach((w) => { w.speed = along(w, vel(w, vx, vy, om)) / R; }); return { tw: [vx, vy, om], notes: [] }; } }; },
    // 5 mecanum
    () => { const g = group(root); deco(g, [0.5, 0.32], [0, 0]); const k = 0.22 + 0.2;
      const fl = mkWheel(g, 0.22, 0.2, 0, 'mecanum', { tilt: 1 }), fr = mkWheel(g, 0.22, -0.2, 0, 'mecanum', { tilt: -1 }), rl = mkWheel(g, -0.22, 0.2, 0, 'mecanum', { tilt: -1 }), rr = mkWheel(g, -0.22, -0.2, 0, 'mecanum', { tilt: 1 });
      return { g, wheels: [fl, fr, rl, rr], run: (vx, vy, om) => { fl.speed = (vx - vy - k * om) / R; fr.speed = (vx + vy + k * om) / R; rl.speed = (vx + vy - k * om) / R; rr.speed = (vx - vy + k * om) / R; return { tw: [vx, vy, om], notes: [] }; } }; },
    // 6 swerve
    () => { const g = group(root); deco(g, [0.5, 0.32], [0, 0]); const ws = [[0.22, 0.2], [0.22, -0.2], [-0.22, 0.2], [-0.22, -0.2]].map((p) => mkWheel(g, p[0], p[1], 0, 'fixed', { steered: true }));
      return { g, wheels: ws, run: (vx, vy, om) => { ws.forEach((w) => { const c = steerCmd(w, vel(w, vx, vy, om)); w.target = c[0]; w.speed = c[1] / R; }); return { tw: [vx, vy, om], notes: [] }; } }; },
    // 7 skid-steer with tracks
    () => { const g = group(root); deco(g, [0.62, 0.34], [0, 0]); const tracks = [];
      for (const side of [1, -1]) { const t = group(g, [0, 0, -side * 0.2]), TL = 0.34, TR = 0.09, Pn = 2 * TL + 2 * Math.PI * TR, belt = [], cy = TR + 0.01;
        for (const sx of [-1, 1]) { cyl(TR * 0.82, 0.1, SILVER, t, [sx * TL / 2, cy, 0], 'z'); cyl(TR * 0.4, 0.12, ORANGE, t, [sx * TL / 2, cy, 0], 'z'); }
        for (let i = 0; i < 30; i++) belt.push(boxm(0.045, 0.014, 0.12, i % 2 ? BLACK : DARK, t, [0, 0, 0]));
        xr(cyl(TR * 0.3, 0.1, MOTOR, t, [TL / 2, cy, 0.0], 'z'));
        const tr = { off: 0, speed: 0, side, place: () => belt.forEach((b, i) => { let u = ((i * Pn / 30) + tr.off) % Pn; if (u < 0) u += Pn; let x, y, a;
          if (u < TL) { x = TL / 2 - u; y = cy - TR; a = 0; } else if (u < TL + Math.PI * TR) { const q2 = (u - TL) / TR; x = -TL / 2 - Math.sin(q2) * TR; y = cy - Math.cos(q2) * TR; a = q2; } else if (u < 2 * TL + Math.PI * TR) { x = -TL / 2 + (u - TL - Math.PI * TR); y = cy + TR; a = Math.PI; } else { const q2 = (u - 2 * TL - Math.PI * TR) / TR; x = TL / 2 + Math.sin(q2) * TR; y = cy + Math.cos(q2) * TR; a = Math.PI + q2; }
          b.position.set(x, y, 0); b.rotation.z = a; }) }; tr.place(); tracks.push(tr); }
      return { g, wheels: [], tracks, run: (vx, vy, om) => { const n = []; if (Math.abs(vy) > 1e-3) n.push(msg('vy ignored: it can only slip, not slide freely.', 'vy ignoré : il ne peut que déraper, pas glisser librement.')); tracks.forEach((t) => { t.speed = vx - om * 0.2 * t.side; }); return { tw: [vx, 0, om], notes: n }; } }; }
  ];
  defs.forEach((d, i) => { const c = d(); c.g.visible = false; cfgs.push(c); });
  const trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#ff9f43' })); scene.add(trail);
  const pts = []; let acc = 0, cur = 0; const prev = new THREE.Vector3();
  function pose() { root.position.set(st.x, 0, st.z); root.rotation.y = st.th; }
  pose.onSelect = (i) => { if (i < 0) return; cur = i; cfgs.forEach((c, k) => { c.g.visible = k === i; }); };
  pose.tick = (dt) => {
    const c = cfgs[cur], r = c.run(q[0], q[1], q[2]), tw = r.tw;
    c.wheels.forEach((w) => { w.delta += (w.target - w.delta) * Math.min(1, dt * 10); w.steer.rotation.y = w.delta * D; w.a += w.speed * dt; w.spin.rotation.z = -w.a; });
    (c.tracks || []).forEach((t) => { t.off += t.speed * dt; t.place(); });
    prev.copy(root.position); st.th += tw[2] * dt; st.x += (tw[0] * Math.cos(st.th) - tw[1] * Math.sin(st.th)) * dt; st.z -= (tw[0] * Math.sin(st.th) + tw[1] * Math.cos(st.th)) * dt; pose();
    const dp = root.position.clone().sub(prev); camera.position.add(dp); orbit.target.add(dp);
    acc += dt; if (acc > 0.05 && (Math.hypot(tw[0], tw[1]) > 1e-3 || Math.abs(tw[2]) > 1e-3)) { acc = 0; pts.push(st.x, 0.004, st.z); if (pts.length > 4500) pts.splice(0, 3); trail.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); trail.geometry.computeBoundingSphere(); }
    const lines = c.wheels.map((w, i) => L('wheel ', 'roue ') + (i + 1) + ': ' + w.speed.toFixed(1) + ' rad/s' + (w.steered ? ', ' + L('steering ', 'orientation ') + w.delta.toFixed(0) + '°' : ''));
    (c.tracks || []).forEach((t, i) => lines.push(L(i ? 'right track: ' : 'left track: ', i ? 'chenille droite : ' : 'chenille gauche : ') + t.speed.toFixed(2) + ' m/s'));
    info.text = lines.concat(r.notes).join('\n');
  };
  pose.reset = () => { st.x = st.z = st.th = 0; pts.length = 0; trail.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3)); cfgs.forEach((c) => c.wheels.forEach((w) => { w.a = 0; w.delta = 0; w.target = 0; })); pose(); };
  pose.readout = () => info.text;
  cfgs[0].g.visible = true;
  return pose;
}


// ------------------------------------------------------------------ model 9: Stewart platform (hexapod)
function buildStewart() {
  const Rb = 0.5, Rp = 0.3, A = 15 * D2R, C = 15 * D2R, H0 = 0.8, BY = 0.12, LMIN = 0.55, LMAX = 0.95;
  const bAng = [-A, A, 120 * D2R - A, 120 * D2R + A, 240 * D2R - A, 240 * D2R + A];
  const pAng = [-60 * D2R + C, 60 * D2R - C, 60 * D2R + C, 180 * D2R - C, 180 * D2R + C, 300 * D2R - C];
  const pt = (R, a, y) => new THREE.Vector3(R * Math.cos(a), y, -R * Math.sin(a));
  const Bp = bAng.map((a) => pt(Rb, a, BY)), Pl = pAng.map((a) => pt(Rp, a, 0));
  const root = group(scene), top = group(root, [0, H0, 0]);
  cyl(0.6, 0.06, BASE, root, [0, 0.03, 0]); cyl(0.5, 0.012, DARK, root, [0, 0.066, 0]);
  Bp.forEach((b) => { cyl(0.02, BY - 0.06, DARK, root, [b.x, 0.06 + (BY - 0.06) / 2, b.z]); mesh(new THREE.SphereGeometry(0.032, 16, 12), SILVER, root, [b.x, b.y, b.z]); });
  cyl(Rp + 0.07, 0.035, ORANGE, top, [0, 0, 0]); boxm(0.42, 0.2, 0.34, BLUE, top, [0, 0.12, 0]); boxm(0.3, 0.02, 0.26, DARK, top, [0, 0.235, 0]);
  Pl.forEach((p) => mesh(new THREE.SphereGeometry(0.03, 16, 12), SILVER, top, [p.x, p.y, p.z]));
  const unit = (geo, mat, vis) => { const m = new THREE.Mesh(geo, mat); root.add(m); if (vis === false) xr(m); return m; };
  const legs = Bp.map(() => {
    const rodMat = new THREE.MeshStandardMaterial({ color: '#cfd6df', metalness: 0.6, roughness: 0.3 });
    return { sleeve: unit(new THREE.CylinderGeometry(0.034, 0.034, 1, 20), DARK), rod: unit(new THREE.CylinderGeometry(0.02, 0.02, 1, 14), rodMat), rodMat,
      motor: unit(new THREE.CylinderGeometry(0.045, 0.045, 1, 16), MOTOR, false), screw: unit(new THREE.CylinderGeometry(0.01, 0.01, 1, 10), COPPER, false) };
  });
  ring(0, root, [0, 0.07, 0], 'y', 0.64, { noAxis: true }); ring(1, root, [0, 0.4, 0], 'y', 0.07, { noAxis: true }); ring(2, root, Bp[0].toArray(), 'y', 0.075, { noAxis: true });
  ring(3, top, Pl[0].toArray(), 'y', 0.075, { noAxis: true }); ring(4, top, [0, 0, 0], 'y', Rp + 0.12, { noAxis: true }); ring(5, top, [0, 0.12, 0], 'y', 0.33, { noAxis: true });
  const Y = new THREE.Vector3(0, 1, 0), info = { text: '' }, q4 = new THREE.Quaternion(), Pw = Bp.map(() => new THREE.Vector3());
  const place = (m, a, b) => { const d = b.clone().sub(a), len = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, Math.max(len, 1e-4), 1); m.quaternion.setFromUnitVectors(Y, d.normalize()); };
  function pose() {
    const T = new THREE.Vector3(q[0] / 100, H0 + q[2] / 100, -q[1] / 100);
    q4.setFromEuler(new THREE.Euler(q[3] * D2R, q[5] * D2R, q[4] * D2R, 'YZX')); top.position.copy(T); top.quaternion.copy(q4);
    let bad = 0; const lens = [];
    for (let k = 0; k < 6; k++) {
      const P = Pl[k].clone().applyQuaternion(q4).add(T); Pw[k].copy(P); const B = Bp[k], d = P.clone().sub(B), len = d.length(), dir = d.clone().normalize(); lens.push(len);
      const out = len < LMIN || len > LMAX; if (out) bad++;
      legs[k].rodMat.color.set(out ? '#ff6b6b' : '#cfd6df'); legs[k].rodMat.emissive.set(out ? '#ff2d2d' : '#000000');
      const sl = Math.min(0.55, len * 0.6), s1 = B.clone().addScaledVector(dir, sl);
      place(legs[k].sleeve, B, s1); place(legs[k].rod, B.clone().addScaledVector(dir, sl * 0.9), P); place(legs[k].screw, B, B.clone().addScaledVector(dir, sl * 0.95)); place(legs[k].motor, B.clone().addScaledVector(dir, -0.04), B.clone().addScaledVector(dir, 0.12));
    }
    const mid = Bp[0].clone().add(Pw[0]).multiplyScalar(0.5); rings[1].position.copy(mid); anchors[1].position.copy(mid); rings[1].quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), Pw[0].clone().sub(Bp[0]).normalize());
    const t = (a) => a.map((l) => Math.round(l * 1000)).join('  ');
    info.text = L('leg lengths (mm): ', 'longueurs des vérins (mm) : ') + t(lens.slice(0, 3)) + '\n' + '                   ' + t(lens.slice(3)) + (bad ? '\n' + L('⚠ ' + bad + ' leg(s) out of stroke (' + Math.round(LMIN * 1000) + '–' + Math.round(LMAX * 1000) + ' mm): the pose is not reachable', '⚠ ' + bad + ' vérin(s) hors course (' + Math.round(LMIN * 1000) + '–' + Math.round(LMAX * 1000) + ' mm) : la pose n\'est pas atteignable') : '');
  }
  pose.readout = () => info.text;
  return pose;
}


// ------------------------------------------------------------------ model 10: quadrotor (flies: rigid-body dynamics + attitude controller + mixer)
function buildQuadrotor() {
  const M = 1.2, G = 9.81, ARM = 0.17, KM = 0.02, TMAX = 6, IX = 0.012, IY = 0.022, IZ = 0.012, LEG = 0.1;
  const a = ARM / Math.SQRT2;
  const motors = [{ x: a, z: a, s: 1 }, { x: a, z: -a, s: -1 }, { x: -a, z: a, s: -1 }, { x: -a, z: -a, s: 1 }];   // front right, front left, rear right, rear left
  const drone = group(scene, [0, 0.6, 0]);
  boxm(0.14, 0.05, 0.14, ORANGE, drone, [0, 0, 0]); boxm(0.1, 0.02, 0.1, DARK, drone, [0, 0.035, 0]);
  const props = [], discs = [];
  motors.forEach((m, i) => {
    const ang = Math.atan2(-m.z, m.x), len = ARM;
    const arm = boxm(len, 0.018, 0.03, DARK, drone, [m.x / 2, 0, m.z / 2]); arm.rotation.y = ang;
    cyl(0.024, 0.035, DARK, drone, [m.x, 0.02, m.z]); cyl(0.012, 0.01, SILVER, drone, [m.x, 0.045, m.z]);
    xr(cyl(0.02, 0.03, COPPER, drone, [m.x, 0.02, m.z])); xr(cyl(0.011, 0.04, MOTOR, drone, [m.x, 0.02, m.z]));
    xr(boxm(0.05, 0.01, 0.02, new THREE.MeshStandardMaterial({ color: '#1f8f4a' }), drone, [m.x * 0.5, 0.015, m.z * 0.5])).rotation.y = ang;   // ESC
    const pg = group(drone, [m.x, 0.055, m.z]);
    const bl = boxm(0.21, 0.004, 0.022, m.s > 0 ? BLUE : BLACK, pg, [0, 0, 0]); bl.rotation.y = 0.3;
    const d = mesh(new THREE.CircleGeometry(0.105, 32), new THREE.MeshBasicMaterial({ color: m.s > 0 ? '#2f6bff' : '#cfd6df', transparent: true, opacity: 0.16, side: THREE.DoubleSide }), pg, [0, 0.003, 0], [-Math.PI / 2, 0, 0]);
    props.push({ g: pg, a: 0 }); discs.push(d);
    cyl(0.006, LEG, DARK, drone, [m.x * 0.6, -LEG / 2 - 0.02, m.z * 0.6]);
  });
  mesh(new THREE.SphereGeometry(0.03, 16, 12), BLACK, drone, [0.08, -0.04, 0]); boxm(0.04, 0.03, 0.05, DARK, drone, [0.075, -0.02, 0]);                 // camera on its gimbal
  xr(boxm(0.1, 0.03, 0.06, new THREE.MeshStandardMaterial({ color: '#2a6fd6' }), drone, [-0.01, -0.035, 0]));                                              // battery
  xr(boxm(0.045, 0.006, 0.045, new THREE.MeshStandardMaterial({ color: '#1f8f4a' }), drone, [0.02, 0.005, 0])); xr(boxm(0.012, 0.008, 0.012, BLACK, drone, [0.02, 0.012, 0]));   // flight controller + IMU
  cyl(0.025, 0.01, SILVER, drone, [-0.04, 0.055, 0]); cyl(0.003, 0.05, DARK, drone, [-0.06, 0.07, 0]);                                                  // GPS puck and antenna
  ring(0, drone, [ARM / Math.SQRT2, 0.055, ARM / Math.SQRT2], 'y', 0.12, { noAxis: true }); ring(1, drone, [0, 0, 0], 'y', 0.2, { noAxis: true });
  ring(2, drone, [0.02, 0.01, 0], 'y', 0.06, { noAxis: true, xray: true }); ring(3, drone, [-a * 0.5, 0.015, -a * 0.5], 'y', 0.05, { noAxis: true, xray: true });
  ring(4, drone, [-0.01, -0.035, 0], 'y', 0.09, { noAxis: true, xray: true }); ring(5, drone, [0.08, -0.04, 0], 'y', 0.06, { noAxis: true });
  // ---- rigid body state
  const st = { p: new THREE.Vector3(0, 0.6, 0), v: new THREE.Vector3(), q: new THREE.Quaternion(), w: new THREE.Vector3(), yaw: 0, fail: false, T: [0, 0, 0, 0] };
  const info = { text: '' }, prev = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion();
  const inv = new THREE.Quaternion(), tmp = new THREE.Vector3();
  function step(h) {
    // attitude set-point: yaw (integrated rate) · roll about the forward axis · pitch about the side axis
    st.yaw += q[3] * D2R * h;
    qa.setFromAxisAngle(Y, st.yaw); qb.setFromAxisAngle(new THREE.Vector3(1, 0, 0), q[1] * D2R); qc.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -q[2] * D2R);
    const qd = qa.clone().multiply(qb).multiply(qc);
    const qe = qd.clone().multiply(inv.copy(st.q).invert()); if (qe.w < 0) { qe.x = -qe.x; qe.y = -qe.y; qe.z = -qe.z; qe.w = -qe.w; }
    const werr = new THREE.Vector3(qe.x, qe.y, qe.z).multiplyScalar(2).applyQuaternion(inv.copy(st.q).invert());   // error in body axes
    const tau = new THREE.Vector3(4.8 * werr.x - 0.43 * st.w.x, 0.05 * (q[3] * D2R - st.w.y) * 1.0, 4.8 * werr.z - 0.43 * st.w.z);
    const up = Y.clone().applyQuaternion(st.q).y, Tc = M * G * (1 + 0.6 * q[0] / 100) / Math.max(0.5, up);
    for (let i = 0; i < 4; i++) { const m = motors[i]; let T = Tc / 4 + (-m.z * tau.x) / (4 * a * a) + (m.x * tau.z) / (4 * a * a) + m.s * tau.y / (4 * KM); if (st.fail && i === 0) T = 0; st.T[i] = Math.min(TMAX, Math.max(0, T)); }
    // forces and torques
    let F = 0, tx = 0, ty = 0, tz = 0; for (let i = 0; i < 4; i++) { const T = st.T[i], m = motors[i]; F += T; tx += -m.z * T; tz += m.x * T; ty += m.s * KM * T; }
    const acc = Y.clone().multiplyScalar(F / M).applyQuaternion(st.q).add(new THREE.Vector3(0, -G, 0)).addScaledVector(st.v, -0.5);
    st.v.addScaledVector(acc, h); st.p.addScaledVector(st.v, h);
    const wv = st.w, dw = new THREE.Vector3((tx - (IZ - IY) * wv.y * wv.z) / IX, (ty - (IX - IZ) * wv.z * wv.x) / IY, (tz - (IY - IX) * wv.x * wv.y) / IZ);
    st.w.addScaledVector(dw, h).multiplyScalar(1 - 0.02 * h * 60);
    const dq = new THREE.Quaternion(st.w.x * h * 0.5, st.w.y * h * 0.5, st.w.z * h * 0.5, 1).normalize(); st.q.multiply(dq).normalize();
    if (st.p.y < LEG + 0.02) { st.p.y = LEG + 0.02; if (st.v.y < 0) st.v.y = 0; st.v.x *= 0.9; st.v.z *= 0.9; }
    if (Math.abs(st.p.x) > 18 || Math.abs(st.p.z) > 18) st.v.set(0, 0, 0);
  }
  function pose() { drone.position.copy(st.p); drone.quaternion.copy(st.q); }
  pose.tick = (dt) => {
    prev.copy(st.p); const n = 4, h = Math.min(dt, 0.04) / n; for (let k = 0; k < n; k++) step(h); pose();
    props.forEach((pr, i) => { pr.a += (3 + 40 * Math.sqrt(st.T[i] / TMAX)) * dt * motors[i].s; pr.g.rotation.y = pr.a; discs[i].material.opacity = 0.08 + 0.12 * Math.sqrt(st.T[i] / TMAX); });
    const dp = st.p.clone().sub(prev); camera.position.add(dp); orbit.target.add(dp);
    const eul = new THREE.Euler().setFromQuaternion(st.q, 'YZX'), tilt = Math.acos(Math.min(1, Y.clone().applyQuaternion(st.q).y)) / D2R;
    info.text = L('altitude ', 'altitude ') + (st.p.y - LEG - 0.02).toFixed(2) + ' m, ' + L('speed ', 'vitesse ') + Math.hypot(st.v.x, st.v.z).toFixed(1) + ' m/s, ' + L('tilt ', 'inclinaison ') + tilt.toFixed(0) + '°\n' + L('motors: ', 'moteurs : ') + st.T.map((T, i) => 'M' + (i + 1) + ' ' + Math.round(100 * T / TMAX) + '%').join('  ') + (st.fail ? '\n' + L('⚠ motor 1 has failed: the drone cannot hold its attitude', '⚠ le moteur 1 est en panne : le drone ne peut plus tenir son attitude') : '') + (st.p.y <= LEG + 0.03 ? '\n' + L('on the ground', 'au sol') : '');
  };
  pose.special = () => { st.fail = !st.fail; };
  pose.reset = () => { st.p.set(0, 0.6, 0); st.v.set(0, 0, 0); st.w.set(0, 0, 0); st.q.identity(); st.yaw = 0; st.fail = false; pose(); };
  pose.readout = () => info.text;
  return pose;
}

// ------------------------------------------------------------------ model 11: humanoid (walks: gait generator + 2-link leg inverse kinematics + balance)
function buildHumanoid() {
  const L1 = 0.43, L2 = 0.43, AH = 0.09, HIPZ = 0.1, FX = 0.05, UA = 0.28, FA = 0.26;
  const root = group(scene);
  const mat = new THREE.MeshStandardMaterial({ color: '#1f8f4a' });
  const pelvis = group(root, [0, 0.9, 0]);
  boxm(0.16, 0.13, 0.3, LIGHT, pelvis, [0, 0, 0]); boxm(0.1, 0.06, 0.2, DARK, pelvis, [-0.03, -0.04, 0]);
  xr(boxm(0.05, 0.015, 0.05, mat, pelvis, [0, 0.02, 0])); xr(boxm(0.014, 0.01, 0.014, BLACK, pelvis, [0, 0.032, 0]));   // IMU board
  const waist = group(pelvis, [0, 0.07, 0]);                               // waist: twist (yaw) and lean (pitch)
  cyl(0.09, 0.07, DARK, waist, [0, 0.01, 0]);
  const torso = group(waist, [0, 0.0, 0]);
  const chest = boxm(0.21, 0.4, 0.34, LIGHT, torso, [0, 0.25, 0]); boxm(0.215, 0.1, 0.345, BLUE, torso, [0.0, 0.36, 0]);
  boxm(0.02, 0.12, 0.2, DARK, torso, [0.11, 0.28, 0]);                                                     // chest plate
  xr(boxm(0.1, 0.22, 0.24, new THREE.MeshStandardMaterial({ color: '#2a6fd6' }), torso, [-0.02, 0.2, 0]));   // battery
  const brd = group(torso, [0.07, 0.28, 0]); brd.rotation.y = Math.PI / 2;
  xr(boxm(0.22, 0.2, 0.012, mat, brd, [0, 0, 0])); for (let i = 0; i < 6; i++) xr(boxm(0.035, 0.03, 0.018, i % 2 ? BLACK : SILVER, brd, [-0.07 + (i % 3) * 0.07, -0.05 + Math.floor(i / 3) * 0.08, 0.012]));   // computer
  drive(waist, [0, -0.03, 0], 'y', 0.05, 0.8);
  cable(torso, [[-0.02, 0.1, 0.05], [-0.03, 0.2, 0.0], [-0.02, 0.35, -0.04], [0, 0.48, 0]]);
  // ---- head
  const head = group(torso, [0, 0.52, 0]); cyl(0.04, 0.06, DARK, torso, [0, 0.48, 0]);
  boxm(0.17, 0.2, 0.17, LIGHT, head, [0, 0.1, 0]); boxm(0.04, 0.09, 0.15, BLACK, head, [0.08, 0.11, 0]);       // visor
  for (const s of [-1, 1]) { cyl(0.018, 0.02, SILVER, head, [0.095, 0.12, s * 0.04], 'x'); cyl(0.008, 0.02, BLUE, head, [0.105, 0.12, s * 0.04], 'x'); }   // stereo cameras
  boxm(0.02, 0.012, 0.08, DARK, head, [0.09, 0.05, 0]); cyl(0.012, 0.03, DARK, head, [0, 0.22, 0]);              // microphones and lidar puck
  drive(head, [0, -0.03, 0], 'y', 0.03, 0.7);
  // ---- arms
  const arms = [1, -1].map((s) => {
    const sh = group(torso, [0, 0.4, s * 0.22]); cyl(0.065, 0.1, DARK, sh, [0, 0, 0], 'z');
    mesh(new THREE.CapsuleGeometry(0.045, UA - 0.05, 8, 16), LIGHT, sh, [0, -UA / 2, 0]);
    drive(sh, [0, 0, s * 0.02], 'z', 0.04, 0.75);
    const el = group(sh, [0, -UA, 0]); cyl(0.05, 0.09, DARK, el, [0, 0, 0], 'z');
    mesh(new THREE.CapsuleGeometry(0.04, FA - 0.05, 8, 16), LIGHT, el, [0, -FA / 2, 0]);
    drive(el, [0, 0, s * 0.01], 'z', 0.035, 0.7);
    for (let k = 0; k < 3; k++) xr(cyl(0.012, 0.1, MOTOR, el, [0.012, -0.1 - k * 0.04, (k - 1) * 0.018]));        // finger motors in the forearm
    const hand = group(el, [0, -FA, 0]); boxm(0.035, 0.09, 0.08, DARK, hand, [0, -0.045, 0]);
    for (let k = 0; k < 4; k++) boxm(0.018, 0.07, 0.014, SILVER, hand, [0, -0.125, (k - 1.5) * 0.02]);
    const th = boxm(0.016, 0.055, 0.014, SILVER, hand, [0.03, -0.06, s * 0.0]); th.rotation.z = -0.5;
    cable(el, [[0, -0.01, 0.0], [0.01, -0.1, 0.01], [0.01, -0.18, 0.0], [0.0, -FA, 0.0]], 0.006);
    return { sh, el, hand, s };
  });
  // ---- legs
  const legs = [1, -1].map((s) => {
    const hip = group(pelvis, [0, -0.04, s * HIPZ]); cyl(0.06, 0.1, DARK, hip, [0, 0, 0], 'z'); mesh(new THREE.SphereGeometry(0.055, 16, 12), DARK, hip, [0, 0, 0]);
    mesh(new THREE.CapsuleGeometry(0.06, L1 - 0.1, 8, 16), LIGHT, hip, [0, -L1 / 2, 0]);
    drive(hip, [0, 0.02, 0], 'z', 0.05, 0.8); drive(hip, [0, 0.02, 0], 'x', 0.05, 0.7); drive(hip, [0, 0.0, 0], 'y', 0.05, 0.7);
    const kn = group(hip, [0, -L1, 0]); cyl(0.065, 0.11, DARK, kn, [0, 0, 0], 'z');
    mesh(new THREE.CapsuleGeometry(0.052, L2 - 0.1, 8, 16), LIGHT, kn, [0, -L2 / 2, 0]);
    drive(kn, [0, 0, s * 0.01], 'z', 0.05, 0.8); xr(cyl(0.01, 0.3, SILVER, hip, [-0.05, -L1 / 2, 0])); xr(cyl(0.016, 0.16, MOTOR, hip, [-0.05, -0.1, 0]));
    const an = group(kn, [0, -L2, 0]); cyl(0.045, 0.1, DARK, an, [0, 0, 0], 'z');
    for (const dz of [-1, 1]) { xr(cyl(0.008, 0.2, SILVER, kn, [-0.03, -L2 + 0.12, dz * 0.03])); xr(cyl(0.014, 0.1, MOTOR, kn, [-0.03, -L2 + 0.26, dz * 0.03])); }   // ankle actuators
    boxm(0.26, 0.05, 0.11, BLUE, an, [FX, -0.065, 0]); boxm(0.1, 0.03, 0.1, DARK, an, [0.12, -0.085, 0]);
    return { hip, kn, an, s };
  });
  // joint rings for the six cards
  ring(0, legs[0].kn, [0, 0, 0], 'z', 0.1, { len: 0.5 });
  ring(1, waist, [0, 0.0, 0], 'y', 0.2, { len: 0.5 });
  ring(2, arms[0].sh, [0, 0, 0], 'z', 0.09, { len: 0.5 });
  ring(3, arms[0].hand, [0, -0.05, 0], 'z', 0.07, { len: 0.3 });
  ring(4, head, [0, 0.1, 0], 'y', 0.13, { len: 0.5 });
  ring(5, torso, [0, 0.22, 0], 'y', 0.26, { noAxis: true, xray: true });
  // ---- centre of mass: weighted points on the model
  const pts = [[pelvis, 10], [chest, 22], [head, 5], [arms[0].sh, 4], [arms[1].sh, 4], [arms[0].el, 2.5], [arms[1].el, 2.5], [arms[0].hand, 1], [arms[1].hand, 1], [legs[0].hip, 7], [legs[1].hip, 7], [legs[0].kn, 4], [legs[1].kn, 4], [legs[0].an, 1.5], [legs[1].an, 1.5]];
  const wp = new THREE.Vector3(), com = new THREE.Vector3(), TM = pts.reduce((a, p) => a + p[1], 0);
  function centreOfMass() { root.updateMatrixWorld(true); com.set(0, 0, 0); pts.forEach(([o, m]) => { o.getWorldPosition(wp); com.addScaledVector(wp, m); }); return com.divideScalar(TM); }
  // ---- state
  const st = { phase: 0, wk: 0, walk: false, px: 0, speed: 0, foot: [0, 0], knee: [0, 0], hipA: [0, 0], onGround: [true, true] };
  const info = { text: '' };
  function leg2(lg, ax, ay) {                                                  // ankle target (ax, ay) relative to the hip, in the sagittal plane
    const d = Math.min(Math.hypot(ax, ay), L1 + L2 - 1e-4);
    const k = Math.PI - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))));
    const a1 = Math.atan2(ax, -ay) + Math.atan2(L2 * Math.sin(k), L1 + L2 * Math.cos(k));
    lg.hip.rotation.z = a1; lg.kn.rotation.z = -k; lg.an.rotation.z = k - a1;
    return [a1, k];
  }
  function place() {
    const c = q[0] / 100, w = st.wk, S = (0.12 + 0.12 * q[4] / 100) * w;
    const Hh = 0.93 - 0.4 * c - 0.012 * w * Math.cos(4 * Math.PI * st.phase);        // hip height, a little lower when crouching, a small bob when walking
    pelvis.position.y = Hh + 0.04;
    const swing = Math.sin(2 * Math.PI * st.phase) * w;
    waist.rotation.set(0, -(q[1] * D2R) - 0.12 * swing, -(0.5 * c + 0.06 * w));          // twist (right = positive) and forward lean
    head.rotation.y = -(q[3] * D2R) + (q[1] * D2R) + 0.12 * swing;                       // the head turns relative to the room, not to the chest
    arms.forEach((a, i) => {
      const sw = (i === 0 ? -1 : 1) * 0.55 * swing;                                     // arms swing against the legs
      a.sh.rotation.z = q[2] * D2R + sw; a.el.rotation.z = 0.2 + 0.3 * w + Math.max(0, sw) * 0.6;
    });
    const solve = (px) => {
      pelvis.position.x = px;
      legs.forEach((lg, i) => {
        const ph = (st.phase + (i === 0 ? 0 : 0.5)) % 1; let ax, lift = 0;
        if (ph < 0.5) ax = S - 2 * S * (ph / 0.5);                                       // stance: the foot goes backwards under the body
        else { const u = (ph - 0.5) / 0.5; ax = -S + 2 * S * (u - Math.sin(2 * Math.PI * u) / (2 * Math.PI)); lift = 0.07 * w * Math.sin(Math.PI * u); }   // swing: the foot goes forwards in the air
        const r = leg2(lg, ax - px, -(Hh - AH - lift)); st.hipA[i] = r[0]; st.knee[i] = r[1]; st.foot[i] = ax; st.onGround[i] = lift < 0.005;
      });
    };
    solve(0);
    for (let it = 0; it < 3 && w < 0.999; it++) {                                        // standing: move the hips so that the centre of mass is over the feet
      const cx = centreOfMass().x - root.position.x;
      st.px += ((FX - cx) * (1 - w)) * 0.9; st.px = Math.max(-0.4, Math.min(0.4, st.px)); solve(st.px * (1 - w));
    }
    if (w >= 0.999) solve(0);
  }
  let prevx = 0;
  function pose() { place(); }
  pose.tick = (dt) => {
    const target = st.walk ? 1 : 0; st.wk += Math.sign(target - st.wk) * Math.min(Math.abs(target - st.wk), dt * 1.5);
    const T = 1.5 - 0.8 * q[4] / 100, S = (0.12 + 0.12 * q[4] / 100) * st.wk;
    if (st.wk > 0.001) st.phase = (st.phase + dt / T) % 1;
    st.speed = 4 * S / T; root.position.x += st.speed * dt;
    place();
    const dx = root.position.x - prevx; prevx = root.position.x; camera.position.x += dx; orbit.target.x += dx;
    const c = centreOfMass(), cx = c.x - root.position.x;
    const grounded = st.onGround.map((g, i) => g ? st.foot[i] : null).filter((v) => v !== null);
    const lo = Math.min(...grounded) - 0.08, hi = Math.max(...grounded) + 0.18;
    const inside = grounded.length && cx >= lo && cx <= hi;
    info.text = L('speed ', 'vitesse ') + st.speed.toFixed(2) + ' m/s, ' + L('hip height ', 'hauteur des hanches ') + (pelvis.position.y - 0.04).toFixed(2) + ' m, ' + L('knee ', 'genou ') + Math.round(Math.max(...st.knee) / D2R) + '°\n' +
      (st.wk > 0.5 ? L('walking: the centre of mass leaves the feet, balance is a controlled fall', 'marche : le centre de masse sort des pieds, l\'équilibre est une chute contrôlée') :
        L('standing: centre of mass ', 'debout : centre de masse ') + (inside ? L('inside the feet ✓', 'dans la surface des pieds ✓') : L('outside the feet ✗: the robot would fall', 'hors des pieds ✗ : le robot tomberait')));
  };
  pose.special = () => { st.walk = !st.walk; };
  pose.reset = () => { st.walk = false; st.wk = 0; st.phase = 0; st.px = 0; root.position.x = 0; prevx = 0; place(); };
  pose.readout = () => info.text;
  return pose;
}

const pose = { six: buildSix, scara: buildScara, cobot: buildCobot, delta: buildDelta, mobile: buildMobile, gantry: buildGantry, wheels: buildWheels, drives: buildDrives, stewart: buildStewart, quadrotor: buildQuadrotor, humanoid: buildHumanoid }[KIND]();

// ------------------------------------------------------------------ interface
let sel = -1, xray = false, spin = false, play = false, t0 = 0, last = 0;
const cards = [].slice.call(document.querySelectorAll(CFG.panel ? '.ancfg' : (CFG.cmd ? '.ancard:not(#anCmd)' : '.ancard')));
const tags = CFG.panel ? [] : cards.map((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'antag'; const lab = c.querySelector('.ann').textContent; b.textContent = lab; b.style.background = COL[i]; b.setAttribute('aria-label', lab); b.addEventListener('click', () => select(i === sel ? -1 : i)); box.appendChild(b); return b; });
const mkSlider = (s, i, host) => { s.min = LIM[i][0]; s.max = LIM[i][1]; s.step = CFG.step || 1; s.value = q[i]; const o = host.querySelector('output'); const show = () => { o.textContent = q[i].toFixed(DEC) + CFG.unit[i]; }; show(); s.addEventListener('input', () => { q[i] = +s.value; show(); pose(); if (!CFG.panel && !CFG.cmd) select(i); play = false; syncBtn(); }); s._show = show; return s; };
const sliders = (CFG.panel || CFG.cmd) ? [].slice.call(document.querySelectorAll('#anCmd input[type=range]')).map((s, i) => mkSlider(s, i, s.parentNode)) : cards.map((c, i) => { const s = c.querySelector('input[type=range]'); if (!s) { c.classList.add('info'); return null; } return mkSlider(s, i, c); });
cards.forEach((c, i) => c.querySelector('.anhead').addEventListener('click', () => select(CFG.panel ? i : (i === sel ? -1 : i))));
const readout = document.createElement('div'); readout.className = 'anout'; box.appendChild(readout);
function select(i) {
  sel = i;
  cards.forEach((c, k) => c.classList.toggle('on', k === i)); tags.forEach((t, k) => t.classList.toggle('on', k === i));
  rings.forEach((r, k) => { r.material.emissiveIntensity = k === i ? 1.4 : 0.35; r.scale.setScalar(k === i ? 1.12 : 1); });
  axes.forEach((a, k) => { a.visible = k === i && !a.userData.none; });
  if (i >= 0 && rings[i] && rings[i].userData.xray && !xray) setXray(true);
  if (pose.onSelect) pose.onSelect(i);
}
const $ = (id) => document.getElementById(id);
function setXray(on) {
  xray = on; shells.forEach((m) => { m.transparent = on; m.opacity = on ? 0.16 : 1; m.depthWrite = !on; m.needsUpdate = true; });
  inner.forEach((m) => { m.visible = on; }); rings.forEach((r) => { if (r.userData.xray) r.visible = on; });
  $('xrayBtn').classList.toggle('on', on); $('xrayBtn').setAttribute('aria-pressed', on);
}
function syncBtn() { $('playBtn').classList.toggle('on', play); $('playBtn').setAttribute('aria-pressed', play); $('spinBtn').classList.toggle('on', spin); $('spinBtn').setAttribute('aria-pressed', spin); }
function setQ(i, v) { q[i] = v; if (sliders[i]) { sliders[i].value = v; sliders[i]._show(); } }
$('xrayBtn').addEventListener('click', () => setXray(!xray));
$('spinBtn').addEventListener('click', () => { spin = !spin; syncBtn(); });
$('playBtn').addEventListener('click', () => { play = !play; t0 = performance.now(); if (play && sel < 0 && !CFG.playFn && !CFG.panel && !CFG.cmd) select(0); syncBtn(); });
$('resetBtn').addEventListener('click', () => { CFG.home.forEach((v, i) => setQ(i, v)); if (pose.reset) pose.reset(); pose(); play = false; syncBtn(); camera.position.set(...CFG.cam); orbit.target.set(...CFG.target); });
$('wristBtn').addEventListener('click', () => { if (pose.special) { pose.special(); return; } const sp = Array.isArray(CFG.special[0]) ? CFG.special : [CFG.special]; sp.forEach(([i, v]) => setQ(i, v)); pose(); if (!CFG.panel && !CFG.cmd) select(sp[0][0]); play = false; syncBtn(); });

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
pose(); select(CFG.panel ? 0 : -1); requestAnimationFrame(loop);
window.RA_ANATOMY = { q, select, setXray, pose };
