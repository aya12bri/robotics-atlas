// anatomy.js — 3D anatomy of a 6-axis industrial robot: coloured joint rings, an X-ray view of the motors, gearboxes,
// controller and cables, and a card per axis. Texts shown from JavaScript use L(english, french).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FR = (window.RA && RA.lang) === 'fr', L = (en, fr) => (FR ? fr : en);
const D2R = Math.PI / 180;
const COL = ['#2f6bff', '#2e9e5b', '#ff9f43', '#8a5cf6', '#ff5a5f', '#1fb5c9'];
const LIM = [[-170, 170], [-100, 100], [-60, 140], [-180, 180], [-115, 115], [-180, 180]];
const HOME = [0, 30, 40, 0, -90, 0];
const q = HOME.slice();
const PLAY_BASE = [0, 30, 40, 0, -60, 0], PLAY_AMP = [70, 25, 25, 80, 35, 120];

const box = document.getElementById('anatView');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#262626');
const camera = new THREE.PerspectiveCamera(42, box.clientWidth / box.clientHeight, 0.1, 50);
camera.position.set(1.9, 1.3, 2.1);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(box.clientWidth, box.clientHeight);
box.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(0.35, 0.7, 0);
orbit.enableDamping = true;
scene.add(new THREE.HemisphereLight('#ffffff', '#4a4a4a', 1.5));
const sun = new THREE.DirectionalLight('#ffffff', 1.7); sun.position.set(3, 5, 2); scene.add(sun);
const fill = new THREE.DirectionalLight('#8fb4ff', 0.5); fill.position.set(-3, 2, -3); scene.add(fill);
const grid = new THREE.GridHelper(4, 16, '#6a6a6a', '#383838'); scene.add(grid);

// ------------------------------------------------------------------ materials
const shells = [];                                           // materials that become transparent in X-ray mode
const shell = (color, extra) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, metalness: 0.25, roughness: 0.45 }, extra)); shells.push(m); return m; };
const ORANGE = shell('#ff9a1f', { metalness: 0.05, roughness: 0.55 }), DARK = shell('#2b2f36'), BASE = shell('#3a3f48');
const SILVER = new THREE.MeshStandardMaterial({ color: '#aeb6c1', metalness: 0.7, roughness: 0.3 });
const MOTOR = new THREE.MeshStandardMaterial({ color: '#3a4250', metalness: 0.5, roughness: 0.4 });
const COPPER = new THREE.MeshStandardMaterial({ color: '#c5772b', metalness: 0.8, roughness: 0.35 });
const BLACK = new THREE.MeshStandardMaterial({ color: '#101114', roughness: 0.8 });

const mesh = (geo, mat, parent, pos, rot) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (rot) m.rotation.set(...rot); parent.add(m); return m; };
const cyl = (r, h, mat, parent, pos, axis) => mesh(new THREE.CylinderGeometry(r, r, h, 40), mat, parent, pos, axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : null);
const group = (parent, pos) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); parent.add(g); return g; };
const inner = [];                                            // parts only visible in X-ray mode
const xr = (m) => { m.visible = false; inner.push(m); return m; };

// a motor + gearbox pair along an axis, at a position (X-ray only)
function drive(parent, pos, axis, r) {
  const g = group(parent, pos); if (axis === 'x') g.rotation.z = Math.PI / 2; else if (axis === 'z') g.rotation.x = Math.PI / 2;
  xr(cyl(r, 0.14, MOTOR, g, [0, 0.06, 0])); xr(cyl(r * 0.45, 0.05, SILVER, g, [0, 0.16, 0]));
  const gear = xr(cyl(r * 1.15, 0.05, SILVER, g, [0, -0.04, 0]));
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; xr(mesh(new THREE.BoxGeometry(0.014, 0.05, 0.014), SILVER, g, [Math.cos(a) * r * 1.2, -0.04, Math.sin(a) * r * 1.2])); }
  xr(cyl(r * 0.5, 0.02, COPPER, g, [0, 0.14, 0]));
  return gear;
}
function cable(parent, pts, r) { const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); return xr(mesh(new THREE.TubeGeometry(c, 24, r || 0.011, 8), BLACK, parent)); }

// ------------------------------------------------------------------ the robot (a hierarchy of groups, one per axis)
const robot = group(scene);
cyl(0.30, 0.04, BASE, robot, [0, 0.02, 0]); cyl(0.24, 0.1, DARK, robot, [0, 0.09, 0]);
const g1 = group(robot, [0, 0.14, 0]);                       // J1: rotation about the vertical axis
cyl(0.22, 0.06, ORANGE, g1, [0, 0.03, 0]);
mesh(new THREE.CapsuleGeometry(0.15, 0.30, 8, 24), ORANGE, g1, [0.06, 0.32, 0]);
mesh(new THREE.BoxGeometry(0.30, 0.42, 0.30), ORANGE, g1, [0.06, 0.30, 0]);
const SH = [0.16, 0.56, 0];                                  // shoulder pivot (in g1)
cyl(0.13, 0.42, DARK, g1, SH, 'z');
// controller, in the lower body
const pcb = xr(mesh(new THREE.BoxGeometry(0.20, 0.26, 0.012), new THREE.MeshStandardMaterial({ color: '#1f8f4a' }), g1, [0.0, 0.28, 0.0]));
for (let i = 0; i < 9; i++) xr(mesh(new THREE.BoxGeometry(0.03 + (i % 3) * 0.01, 0.03, 0.018), i % 2 ? BLACK : SILVER, g1, [-0.06 + (i % 3) * 0.06, 0.2 + Math.floor(i / 3) * 0.07, 0.01]));
const mot1 = drive(g1, [0.1, 0.1, 0], 'y', 0.07);
cable(g1, [[-0.1, 0.28, 0.06], [0.0, 0.4, 0.1], [0.1, 0.5, 0.08], SH]);

const g2 = group(g1, SH);                                    // J2: shoulder
const UA = 0.6;
mesh(new THREE.CapsuleGeometry(0.095, UA - 0.1, 8, 24), ORANGE, g2, [0, UA / 2, 0]);
mesh(new THREE.BoxGeometry(0.2, UA * 0.92, 0.22), ORANGE, g2, [0, UA / 2, 0]);
drive(g2, [0, 0.08, 0.17], 'z', 0.07);
const EL = [0, UA, 0];
cyl(0.115, 0.34, DARK, g2, EL, 'z');
cable(g2, [[0, 0.02, -0.05], [0.02, 0.2, 0.0], [0.02, 0.4, -0.04], [0, UA, -0.03]]);

const g3 = group(g2, EL);                                    // J3: elbow
const FA = 0.42;
mesh(new THREE.BoxGeometry(FA + 0.12, 0.17, 0.2), ORANGE, g3, [(FA + 0.12) / 2 - 0.06, 0, 0]);
drive(g3, [0.04, 0.0, 0.16], 'z', 0.06);
cable(g3, [[0, -0.03, -0.04], [0.15, 0.0, -0.06], [0.3, 0.02, -0.03], [FA, 0, 0]]);

const g4 = group(g3, [FA, 0, 0]);                            // J4: wrist roll (about the forearm axis)
cyl(0.088, 0.2, ORANGE, g4, [0.1, 0, 0], 'x'); mesh(new THREE.SphereGeometry(0.088, 24, 16), ORANGE, g4, [0.2, 0, 0]);
drive(g4, [0.06, 0, 0], 'x', 0.045);
const g5 = group(g4, [0.2, 0, 0]);                           // J5: wrist pitch
cyl(0.075, 0.2, DARK, g5, [0, 0, 0], 'z');
mesh(new THREE.BoxGeometry(0.15, 0.13, 0.13), ORANGE, g5, [0.07, 0, 0]);
drive(g5, [0.03, 0, 0.1], 'z', 0.04);
const g6 = group(g5, [0.15, 0, 0]);                          // J6: tool rotation
cyl(0.06, 0.03, SILVER, g6, [0.015, 0, 0], 'x');
mesh(new THREE.BoxGeometry(0.04, 0.16, 0.07), DARK, g6, [0.05, 0, 0]);
for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.11, 0.018, 0.045), DARK, g6, [0.125, s * 0.06, 0]);
drive(g6, [0.02, 0, 0], 'x', 0.03);
const joints = [g1, g2, g3, g4, g5, g6];

// ------------------------------------------------------------------ joint rings, axes, anchors for the labels
const rings = [], axes = [], anchors = [];
function ring(i, parent, pos, axis, r) {
  const m = new THREE.MeshStandardMaterial({ color: COL[i], emissive: COL[i], emissiveIntensity: 0.35, roughness: 0.4 });
  const t = mesh(new THREE.TorusGeometry(r, 0.012, 12, 64), m, parent, pos); if (axis === 'x') t.rotation.y = Math.PI / 2; else if (axis === 'y') t.rotation.x = Math.PI / 2;
  rings[i] = t;
  const a = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.9, 8), new THREE.MeshBasicMaterial({ color: COL[i], transparent: true, opacity: 0.9 }), parent, pos, axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : null);
  a.visible = false; axes[i] = a;
  const an = new THREE.Object3D(); an.position.set(...pos); parent.add(an); anchors[i] = an;
}
ring(0, robot, [0, 0.14, 0], 'y', 0.33);
ring(1, g1, SH, 'z', 0.2);
ring(2, g2, EL, 'z', 0.17);
ring(3, g3, [FA, 0, 0], 'x', 0.115);
ring(4, g4, [0.2, 0, 0], 'z', 0.11);
ring(5, g5, [0.15, 0, 0], 'x', 0.08);

function pose() {
  g1.rotation.y = q[0] * D2R; g2.rotation.z = -q[1] * D2R; g3.rotation.z = q[2] * D2R;
  g4.rotation.x = q[3] * D2R; g5.rotation.z = q[4] * D2R; g6.rotation.x = q[5] * D2R;
}

// ------------------------------------------------------------------ interface
let sel = -1, xray = false, spin = false, play = false, t0 = 0;
const tags = COL.map((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'antag'; b.textContent = 'J' + (i + 1); b.style.background = c; b.setAttribute('aria-label', 'J' + (i + 1)); b.addEventListener('click', () => select(i === sel ? -1 : i)); box.appendChild(b); return b; });
const cards = [].slice.call(document.querySelectorAll('.ancard'));
const sliders = cards.map((c, i) => { const s = c.querySelector('input[type=range]'); s.min = LIM[i][0]; s.max = LIM[i][1]; s.value = q[i]; const o = c.querySelector('output'); const show = () => { o.textContent = Math.round(q[i]) + '°'; }; show(); s.addEventListener('input', () => { q[i] = +s.value; show(); pose(); select(i); play = false; syncBtn(); }); c._show = show; return s; });
cards.forEach((c, i) => c.querySelector('.anhead').addEventListener('click', () => select(i === sel ? -1 : i)));
function select(i) {
  sel = i;
  cards.forEach((c, k) => c.classList.toggle('on', k === i)); tags.forEach((t, k) => t.classList.toggle('on', k === i));
  rings.forEach((r, k) => { r.material.emissiveIntensity = k === i ? 1.4 : 0.35; r.scale.setScalar(k === i ? 1.12 : 1); });
  axes.forEach((a, k) => { a.visible = k === i; });
}
const $ = (id) => document.getElementById(id);
function setXray(on) {
  xray = on; shells.forEach((m) => { m.transparent = on; m.opacity = on ? 0.16 : 1; m.depthWrite = !on; m.needsUpdate = true; });
  inner.forEach((m) => { m.visible = on; }); $('xrayBtn').classList.toggle('on', on); $('xrayBtn').setAttribute('aria-pressed', on);
}
function syncBtn() { $('playBtn').classList.toggle('on', play); $('playBtn').setAttribute('aria-pressed', play); $('spinBtn').classList.toggle('on', spin); $('spinBtn').setAttribute('aria-pressed', spin); }
$('xrayBtn').addEventListener('click', () => setXray(!xray));
$('spinBtn').addEventListener('click', () => { spin = !spin; syncBtn(); });
$('playBtn').addEventListener('click', () => { play = !play; t0 = performance.now(); if (play && sel < 0) select(0); syncBtn(); });
$('resetBtn').addEventListener('click', () => { HOME.forEach((v, i) => { q[i] = v; sliders[i].value = v; cards[i]._show(); }); pose(); play = false; syncBtn(); camera.position.set(1.9, 1.3, 2.1); orbit.target.set(0.35, 0.7, 0); });
$('wristBtn').addEventListener('click', () => { q[4] = 0; sliders[4].value = 0; cards[4]._show(); pose(); select(4); play = false; syncBtn(); });

function resize() { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
const v = new THREE.Vector3();
function loop(now) {
  requestAnimationFrame(loop);
  if (play && sel >= 0) { q[sel] = PLAY_BASE[sel] + PLAY_AMP[sel] * Math.sin((now - t0) / 700); sliders[sel].value = q[sel]; cards[sel]._show(); pose(); }
  orbit.autoRotate = spin; orbit.autoRotateSpeed = 1.2; orbit.update();
  renderer.render(scene, camera);
  const w = box.clientWidth, h = box.clientHeight;
  anchors.forEach((a, i) => { a.getWorldPosition(v); v.project(camera); const hid = v.z > 1; tags[i].style.display = hid ? 'none' : ''; tags[i].style.left = ((v.x * 0.5 + 0.5) * w) + 'px'; tags[i].style.top = ((-v.y * 0.5 + 0.5) * h) + 'px'; });
}
pose(); select(-1); requestAnimationFrame(loop);
window.RA_ANATOMY = { q, select, setXray, pose };
