// robot-page.js — the interactive part of the serial robot pages built from a DH table (cylindrical, spherical, 7-axis).
// A page declares window.ROBOT = { std, mod, joints, look, views, cam, target, ... } and loads this module:
//   - the 3D arm is generated from the standard DH table (dharm.js), so the picture and the equations always agree;
//   - sliders for the joints (helpers.js RB.controls), the DH and DHM tables, the tool matrix;
//   - the kinematic diagram (svg#schema) in three views, with the frames of the chosen convention.
// Revolute joints are in degrees, prismatic joints in metres (their sliders are in cm).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const R = window.ROBOT;
const FR = (window.RA && RA.lang === 'fr') || /-fr(\.html)?$/.test(location.pathname);
const L = (en, fr) => (FR ? fr : en);
const N = R.std.length;

// ================= 3D scene =================
const box = document.getElementById('view');
const scene = new THREE.Scene();
if (window.RA && RA.darkParts) RA.darkParts(scene);
scene.background = new THREE.Color('#1d2638');
const camera = new THREE.PerspectiveCamera(45, box.clientWidth / box.clientHeight, 0.05, 50);
camera.position.set(...R.cam);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.setSize(box.clientWidth, box.clientHeight);
box.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(...R.target);
const hemi = new THREE.HemisphereLight('#ffffff', '#3a3a3a', 1.2); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 1.5); sun.position.set(3, 5, 2); scene.add(sun);
const grid = new THREE.GridHelper(4, 16, '#7a7a7a', '#3a3a3a'); scene.add(grid);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 4).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#253047' }));
floor.position.y = -0.003; scene.add(floor);
{
  const gc = grid.geometry.attributes.color, g0 = gc.array.slice(), mid = (new THREE.Color('#7a7a7a').r + new THREE.Color('#3a3a3a').r) / 2;
  RB.onTheme((light) => {
    scene.background.set(light ? '#d9dde3' : '#1d2638'); floor.material.color.set(light ? '#7d8691' : '#253047'); hemi.groundColor.set(light ? '#c9d0d8' : '#5d6b85');
    hemi.intensity = light ? 1.2 : 1.75; sun.intensity = light ? 1.5 : 2.1;
    const a = new THREE.Color(light ? '#c3cad3' : '#8391a8'), b = new THREE.Color(light ? '#a3acb7' : '#3b4861');
    for (let i = 0; i < g0.length; i += 3) { const c = g0[i] > mid ? a : b; gc.array[i] = c.r; gc.array[i + 1] = c.g; gc.array[i + 2] = c.b; }
    gc.needsUpdate = true; box.classList.toggle('light3d', light);
  });
}
const arm = DHArm.build(THREE, R.std, R.look);
scene.add(arm.root);
// prismatic joints: a square sleeve instead of the round housing, so the two kinds of joints look different
R.joints.forEach((j, i) => {
  if (j.type !== 'P') return;
  const rg = arm.rot[i], s = R.look.sizes[i];
  rg.children.forEach((m) => { if (m.isMesh) m.visible = false; });
  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(s.r * 2, s.r * 2, s.l), arm.materials.joint);
  sleeve.position.z = s.l / 2; rg.add(sleeve);
});
// the tool: a small gripper on the last frame, its z axis pointing where the tool points
const orange = new THREE.MeshStandardMaterial({ color: '#ff9f43' });
const tool = arm.frames[N];
const tl = R.toolLen || 0.06;
const palm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.02), orange); palm.position.z = -tl * 0.2; tool.add(palm);
for (const side of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, tl), orange); f.position.set(side * 0.04, 0, tl * 0.3); tool.add(f); }
if (R.scene3d) R.scene3d(THREE, scene, arm);
const resize = () => { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
window.addEventListener('resize', resize);
let visible = true;
new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(box);
renderer.setAnimationLoop(() => { if (!visible) return; if (R.tick) R.tick(); orbit.update(); renderer.render(scene, camera); });

// ================= diagram =================
const svg = document.getElementById('schema');
const frameSel = document.getElementById('frameSel');
const viewSel = document.getElementById('viewSel');
let showAxes = true;
let q = R.joints.map((j) => (j.type === 'P' ? j.value / 100 : j.value));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const origin = (T) => [T[0][3], T[1][3], T[2][3]];
const zAxis = (T) => [T[0][2], T[1][2], T[2][2]];
const cellv = (c) => (typeof c[1] === 'function' ? c[1](q) : c[1]);
const VIEWS = R.views;
function jointSymbol(P, axis, view, i) {
  const [x, y] = P, type = R.joints[i].type;
  const du = dot(axis, view.right), dv = dot(axis, view.up), dw = dot(axis, view.toward);
  if (type === 'P') {                                  // sliding joint: a square
    const ang = Math.hypot(du, dv) < 0.35 ? 0 : (Math.atan2(-dv, du) * 180) / Math.PI;
    RB.shape(svg, 'rect', { x: x - 11, y: y - 11, width: 22, height: 22, fill: '#262626', stroke: '#e8eef5', 'stroke-width': 2.5, transform: `rotate(${ang} ${x} ${y})` });
  } else if (Math.hypot(du, dv) < 0.35) {              // revolute axis pointing at the viewer (or away): a circle
    RB.shape(svg, 'circle', { cx: x, cy: y, r: 12, fill: '#262626', stroke: '#e8eef5', 'stroke-width': 2.5 });
    if (dw > 0) RB.shape(svg, 'circle', { cx: x, cy: y, r: 3, fill: '#e8eef5' });
    else { RB.shape(svg, 'line', { x1: x - 5, y1: y - 5, x2: x + 5, y2: y + 5, stroke: '#e8eef5', 'stroke-width': 2.5 }); RB.shape(svg, 'line', { x1: x - 5, y1: y + 5, x2: x + 5, y2: y - 5, stroke: '#e8eef5', 'stroke-width': 2.5 }); }
  } else {                                             // revolute axis in the picture: a bar along it
    const ang = (Math.atan2(-dv, du) * 180) / Math.PI;
    RB.shape(svg, 'rect', { x: x - 14, y: y - 6, width: 28, height: 12, rx: 2, fill: '#262626', stroke: '#e8eef5', 'stroke-width': 2.5, transform: `rotate(${ang} ${x} ${y})` });
  }
  RB.label(svg, x - 18, y - 16, `q${i + 1}`, '#ffffff', 17, 'end');
}
function draw(Tstd, frames) {
  const view = VIEWS[viewSel.value];
  const P = (p) => view.map(dot(p, view.right), dot(p, view.up));
  svg.innerHTML = '';
  if (view.ground) { const a = view.map(-2, 0), b = view.map(2, 0); RB.shape(svg, 'line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#7a7a7a', 'stroke-width': 2 }); }
  if (R.drawExtra) R.drawExtra(svg, P, view, q);
  const pts = [P(origin(Tstd[0]))];
  for (let i = 1; i <= N; i++) {
    const o = origin(Tstd[i - 1]), z = zAxis(Tstd[i - 1]), d = cellv(R.std[i - 1].d);
    pts.push(P(o.map((c, k) => c + z[k] * d))); pts.push(P(origin(Tstd[i])));
  }
  RB.shape(svg, 'polyline', { points: pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '), fill: 'none', stroke: '#ff9f43', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  for (let i = 0; i < N; i++) jointSymbol(P(origin(Tstd[i])), zAxis(Tstd[i]), view, i);
  const tip = P(origin(Tstd[N]));
  RB.shape(svg, 'circle', { cx: tip[0], cy: tip[1], r: 6, fill: '#e8eef5' });
  if (showAxes) RB.drawFrames(svg, frames, view, view.map, { only: frameSel.value, len: R.axisLen || 42 });
}

// ================= update =================
const listeners = [];
function update() {
  if (R.beforeDraw) R.beforeDraw(q);
  arm.setPose(q);
  const Tstd = RB.stdChain(R.std, q), Tmod = RB.modChain(R.mod, q);
  const frames = document.querySelector('input[name=conv]:checked').value === 'std' ? Tstd : Tmod;
  const T = Tstd[N];
  RB.renderTable(document.getElementById('dhStd'), 'std', R.std, q);
  RB.renderTable(document.getElementById('dhMod'), 'mod', R.mod, q);
  RB.renderMatrix(document.getElementById('matrix'), T, L('T(0→tool) =', 'T(0→outil) ='));
  document.getElementById('readout').textContent =
    L('Tool position in the base frame {0}: ', 'Position de l\'outil dans le repère de base {0} : ') +
    ['x', 'y', 'z'].map((n, i) => `${n} = ${(Math.abs(T[i][3]) < 5e-4 ? 0 : T[i][3]).toFixed(3)} m`).join('   ');
  draw(Tstd, frames);
  listeners.forEach((f) => f(q, T, Tstd));
}
document.getElementById('axesBtn').addEventListener('click', (e) => { showAxes = !showAxes; e.target.textContent = showAxes ? L('Hide axes', 'Masquer les axes') : L('Show axes', 'Afficher les axes'); update(); });
frameSel.innerHTML = `<option value="all">${L('All frames', 'Tous les repères')}</option>` + Array.from({ length: N + 1 }, (_, i) => `<option value="${i}">${L('Frame', 'Repère')} {${i}} ${L('only', 'seul')}</option>`).join('');
frameSel.addEventListener('change', update);
viewSel.addEventListener('change', update);
document.querySelectorAll('input[name=conv]').forEach((r) => r.addEventListener('change', update));
const ctl = RB.controls(document.getElementById('controls'), R.joints.map((j, i) => ({ label: `q${i + 1} · ${L(j.name[0], j.name[1])} (${j.type})`, min: j.min, max: j.max, step: j.step || 1, value: j.value, unit: j.type === 'P' ? 'cm' : '°' })),
  (v) => { q = v.map((x, i) => (R.joints[i].type === 'P' ? x / 100 : x)); update(); });

// what the page can do from its own script (window.ROBOT.ready): read and set the joints, react to each update
const api = {
  THREE, scene, arm, L, FR,
  get q() { return q.slice(); },
  setQ(nq) {                                            // exact values for the maths; the sliders only show them rounded
    q = nq.slice();
    document.querySelectorAll('#controls .ctl').forEach((row, i) => {
      const v = R.joints[i].type === 'P' ? q[i] * 100 : q[i];
      row.querySelector('[type=range]').value = v; row.querySelector('[type=number]').value = Math.round(v * 10) / 10;
    });
    update();
  },
  onUpdate(f) { listeners.push(f); }
};
if (R.ready) R.ready(api);
update();
