// wheel-lab.js — 3D wheel lab: each wheel type as a 3D model, with a small simulation of how it performs.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FR = (window.RA && window.RA.lang) === 'fr';
const L = (en, fr) => (FR ? fr : en);
const WHEELS = window.WHEELS, icon = window.wheelIcon;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const R = 0.5, W = 0.24;                       // wheel radius and width (m)
const TAU = Math.PI * 2, GAMMA = Math.PI / 4;   // roller angle of the Mecanum wheel
const fmt = (v, d = 2) => v.toFixed(d).replace('.', FR ? ',' : '.');

const SCORE = {   // 1 (poor) to 5 (excellent)
  fixed: [5, 5, 5, 1, 5, 5], castor: [2, 3, 2, 4, 5, 2], steer: [5, 4, 4, 4, 2, 4], omni: [2, 2, 2, 5, 3, 2], mecanum: [3, 3, 2, 5, 2, 2], ball: [2, 1, 3, 5, 1, 3], track: [5, 5, 2, 2, 3, 1]
};
const SCORE_NAMES = [['Grip', 'Adhérence'], ['Load', 'Charge'], ['Smoothness', 'Douceur'], ['Direction freedom', 'Liberté de direction'], ['Simplicity', 'Simplicité'], ['Odometry', 'Odométrie']];

// ------------------------------------------------------------------ scene
const canvas = $('wlCanvas'), box = $('wlView');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x262626);
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x262626, 7, 18);
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60); camera.position.set(2.5, 1.7, 3.5);
const orbit = new OrbitControls(camera, canvas); orbit.target.set(0, 0.7, 0); orbit.enableDamping = true; orbit.minDistance = 1.6; orbit.maxDistance = 7; orbit.maxPolarAngle = Math.PI * 0.49; orbit.enablePan = false;
scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(3, 5, 2.5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 14 }); sun.shadow.bias = -0.0005; scene.add(sun);

const gc = document.createElement('canvas'); gc.width = gc.height = 128; { const g = gc.getContext('2d'); g.fillStyle = '#303030'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#4a4a4a'; g.lineWidth = 2; g.strokeRect(1, 1, 126, 126); g.strokeStyle = '#3c3c3c'; g.lineWidth = 1; g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 128); g.moveTo(0, 64); g.lineTo(128, 64); g.stroke(); g.fillStyle = '#6b97ff'; g.fillRect(62, 62, 4, 4); }
const gtex = new THREE.CanvasTexture(gc); gtex.wrapS = gtex.wrapT = THREE.RepeatWrapping; gtex.repeat.set(40, 40); gtex.anisotropy = 4; gtex.colorSpace = THREE.SRGBColorSpace;
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: gtex, roughness: 0.95 })); ground.receiveShadow = true; scene.add(ground);

// ------------------------------------------------------------------ materials and parts
const M = (c, r = 0.5, m = 0.1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const mTire = M('#1c1c1c', 0.9, 0), mRim = M('#c9ced6', 0.35, 0.5), mDark = M('#3a3f48', 0.6, 0.3), mOr = M('#ff9f43', 0.45, 0.1), mBlue = M('#2f6bff', 0.4, 0.1), mChassis = new THREE.MeshStandardMaterial({ color: '#5b8fd6', roughness: 0.5, transparent: true, opacity: 0.75 }), mRoller = M('#ff9f43', 0.5, 0.1), mStripe = M('#222222', 0.6, 0);
const bx = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = m.receiveShadow = true; return m; };
const cylZ = (r, h, mat, seg = 40) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.rotation.x = Math.PI / 2; m.castShadow = m.receiveShadow = true; return m; };
const cylY = (r, h, mat, seg = 32) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.castShadow = m.receiveShadow = true; return m; };

function tireWheel() {                              // rubber tire, rim, spokes, hub (axle along z)
  const g = new THREE.Group(); g.add(cylZ(R, W, mTire, 56));
  for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU, t = bx(0.05, 0.05, W * 1.02, mStripe); t.position.set(Math.cos(a) * R, Math.sin(a) * R, 0); t.rotation.z = a; g.add(t); }
  const rim = cylZ(R - 0.12, W * 1.04, mRim); g.add(rim);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU, s = bx(R - 0.18, 0.06, W * 0.5, mDark); s.position.set(Math.cos(a) * (R - 0.18) / 2, Math.sin(a) * (R - 0.18) / 2, W * 0.5); s.rotation.z = a; g.add(s); }
  g.add(cylZ(0.09, W * 1.3, mOr)); return g;
}
function fork(width = W + 0.16) {                   // two plates on both sides of the wheel and a top bar
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const p = bx(0.12, R * 2 + 0.2, 0.04, mDark); p.position.set(0, R + 0.18, s * (width / 2)); g.add(p); }
  const top = bx(0.2, 0.06, width + 0.1, mDark); top.position.y = R * 2 + 0.28; g.add(top); const ax = cylZ(0.035, width + 0.05, mRim); ax.position.y = R; g.add(ax); return g;
}
const chassis = (y) => { const c = bx(1.25, 0.1, 0.9, mChassis); c.position.y = y; c.castShadow = false; return c; };
const lab = (x, y, z, en, fr) => ({ p: new THREE.Vector3(x, y, z), en, fr });

function rollerWheel(kind) {                        // omni (rollers at 90°) and Mecanum (rollers at 45°)
  const g = new THREE.Group(), spin = new THREE.Group(); spin.position.y = R; g.add(spin);
  const N = kind === 'omni' ? 12 : 11, rollers = [];
  const rows = kind === 'omni' ? [-1, 1] : [0];
  const rr = kind === 'omni' ? 0.075 : 0.095, rl = kind === 'omni' ? 0.2 : 0.4;
  for (const sd of [-1, 1]) { const d = cylZ(R - 0.14, 0.035, mRim); d.position.z = sd * (kind === 'omni' ? 0.17 : 0.2); spin.add(d); }
  spin.add(cylZ(0.1, W + 0.2, mOr));
  rows.forEach((row, ri) => {
    for (let i = 0; i < N; i++) {
      const a = ((i + (ri ? 0.5 : 0)) / N) * TAU, pos = new THREE.Vector3(Math.cos(a) * (R - rr * 0.55), Math.sin(a) * (R - rr * 0.55), row * 0.085);
      const tan = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0), axis = kind === 'omni' ? tan : tan.clone().multiplyScalar(Math.cos(GAMMA)).add(new THREE.Vector3(0, 0, Math.sin(GAMMA))).normalize();
      const holder = new THREE.Group(); holder.position.copy(pos); holder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
      const inner = new THREE.Group(); const body = new THREE.Mesh(new THREE.CapsuleGeometry(rr, rl, 4, 12), mRoller); body.castShadow = true; inner.add(body);
      const stripe = bx(rr * 0.5, rl * 0.7, rr * 0.25, mStripe); stripe.position.set(0, 0, rr * 0.95); inner.add(stripe); holder.add(inner); spin.add(holder); rollers.push(inner);
    }
  });
  g.add(fork(kind === 'omni' ? 0.5 : 0.56), chassis(R * 2 + 0.38));
  const labels = kind === 'omni'
    ? [lab(0.42, 1.05, 0.1, 'Free rollers, 90° to the rolling direction', 'Galets libres, à 90° du sens de roulement'), lab(0, 0.5, 0.3, 'Hub and motor shaft', 'Moyeu et arbre moteur'), lab(-0.1, 0.28, -0.2, 'Rim discs', 'Flasques de jante'), lab(0, 1.4, 0.3, 'Fork and chassis', 'Fourche et châssis')]
    : [lab(0.42, 1.05, 0.15, 'Rollers at 45°', 'Galets à 45°'), lab(0, 0.5, 0.32, 'Hub and motor shaft', 'Moyeu et arbre moteur'), lab(-0.1, 0.28, -0.22, 'Rim discs', 'Flasques de jante'), lab(0, 1.4, 0.3, 'Fork and chassis', 'Fourche et châssis')];
  return { group: g, spin, rollers, labels };
}

function buildModel(kind) {
  const g = new THREE.Group();
  if (kind === 'fixed') {
    const spin = tireWheel(); spin.position.y = R; g.add(spin, fork(), chassis(R * 2 + 0.38));
    return { group: g, spin, labels: [lab(0.5, 0.35, 0, 'Tire (rubber tread)', 'Pneu (bande de roulement)'), lab(0, 0.5, 0.2, 'Rim and hub', 'Jante et moyeu'), lab(0, 1.25, 0.26, 'Fork (fixed axle)', 'Fourche (axe fixe)'), lab(0.2, 1.4, -0.3, 'Chassis', 'Châssis')] };
  }
  if (kind === 'castor') {
    const sw = new THREE.Group(), E = 0.3;
    const wheel = tireWheel(); wheel.position.set(-E, R, 0); wheel.scale.setScalar(0.62); wheel.position.y = R * 0.62; sw.add(wheel);
    const f = fork(0.34); f.scale.setScalar(0.62); f.position.set(-E, 0, 0); sw.add(f);
    const arm = bx(E + 0.1, 0.07, 0.3, mDark); arm.position.set(-E / 2, R * 1.24 + 0.26, 0); sw.add(arm);
    const pivot = cylY(0.09, 0.28, mOr); pivot.position.set(0, R * 1.24 + 0.34, 0); sw.add(pivot);
    const plate = cylY(0.2, 0.05, mRim); plate.position.set(0, R * 1.24 + 0.5, 0); g.add(plate); g.add(chassis(R * 1.24 + 0.58)); g.add(sw);
    return { group: g, spin: wheel, swivel: sw, labels: [lab(-0.62, 0.3, 0, 'Wheel (small, no motor)', 'Roue (petite, sans moteur)'), lab(0, 0.95, 0.15, 'Swivel pivot (vertical axis)', 'Pivot orientable (axe vertical)'), lab(-0.25, 0.8, 0.26, 'Offset: the wheel trails behind the pivot', 'Déport : la roue suit derrière le pivot'), lab(0.3, 1.18, -0.3, 'Chassis', 'Châssis')] };
  }
  if (kind === 'steer') {
    const sw = new THREE.Group(), spin = tireWheel(); spin.position.y = R; sw.add(spin, fork());
    const motor = cylY(0.14, 0.3, mBlue); motor.position.y = R * 2 + 0.5; sw.add(motor);
    const col = cylY(0.025, R * 2 + 0.5, mOr); col.position.y = (R * 2 + 0.5) / 2; col.material = mOr; col.scale.set(1, 1, 1); sw.add(col);
    g.add(sw, chassis(R * 2 + 0.7));
    return { group: g, spin, swivel: sw, labels: [lab(0.5, 0.35, 0, 'Driven wheel (drive motor)', 'Roue motrice (moteur de roue)'), lab(0, 1.52, 0.2, 'Steering motor', 'Moteur d\'orientation'), lab(0.18, 0.85, 0.28, 'Vertical axis through the contact point', 'Axe vertical passant par le point de contact'), lab(0.3, 1.7, -0.3, 'Chassis', 'Châssis')] };
  }
  if (kind === 'omni' || kind === 'mecanum') return Object.assign(rollerWheel(kind), {});
  if (kind === 'ball') {
    const ball = new THREE.Group(), tc = document.createElement('canvas'); tc.width = 256; tc.height = 128; const t = tc.getContext('2d'); t.fillStyle = '#d8d8d8'; t.fillRect(0, 0, 256, 128); t.fillStyle = '#ff9f43'; for (let i = 0; i < 8; i++) t.fillRect(i * 32, 0, 14, 128); t.fillStyle = '#2f6bff'; t.fillRect(0, 56, 256, 16);
    const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace;
    const sph = new THREE.Mesh(new THREE.SphereGeometry(R * 0.92, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.15 })); sph.castShadow = true; ball.add(sph); ball.position.y = R * 0.92; g.add(ball);
    const cup = new THREE.Mesh(new THREE.TorusGeometry(R * 0.78, 0.07, 12, 48), mDark); cup.rotation.x = Math.PI / 2; cup.position.y = R * 1.55; g.add(cup);
    const drivers = [];
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.3, tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)); const rol = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.13, 20), mOr); rol.castShadow = true; rol.position.set(Math.cos(a) * R * 0.74, R * 1.35, Math.sin(a) * R * 0.74); rol.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent); g.add(rol); drivers.push(rol); }
    const post = cylY(0.05, 0.4, mDark); post.position.y = R * 1.55 + 0.25; g.add(post); g.add(chassis(R * 1.55 + 0.5));
    return { group: g, ball, drivers, labels: [lab(0.45, 0.4, 0.2, 'Ball', 'Sphère'), lab(0.38, 0.82, 0.3, 'Drive rollers (omni wheels)', 'Galets d\'entraînement (roues omni)'), lab(0, 1.0, -0.4, 'Cup and ball transfers', 'Coupelle et billes de guidage'), lab(0.3, 1.25, -0.4, 'Chassis', 'Châssis')] };
  }
  // track
  const belt = [], P = 2 * 0.9 + TAU * 0.3, N = 40, base = new THREE.Group(); base.position.y = 0;
  for (const sx of [-1, 1]) { const sp = cylZ(0.27, 0.34, mRim, 28); sp.position.set(sx * 0.45, 0.3, 0); base.add(sp); const hub = cylZ(0.12, 0.4, mOr, 20); hub.position.set(sx * 0.45, 0.3, 0); base.add(hub); }
  for (let k = -1; k <= 1; k++) { const rw = cylZ(0.12, 0.3, mDark, 20); rw.position.set(k * 0.3, 0.14, 0); base.add(rw); }
  for (let i = 0; i < N; i++) { const b = bx(0.1, 0.045, 0.36, mTire); const lug = bx(0.1, 0.06, 0.06, mStripe); lug.position.set(0, -0.04, 0); b.add(lug); belt.push(b); base.add(b); }
  const chas = chassis(0.95), side = bx(1.4, 0.2, 0.05, mDark); side.position.set(0, 0.7, 0.22); const side2 = side.clone(); side2.position.z = -0.22; base.add(chas, side, side2);
  const place = (off) => { belt.forEach((b, i) => { let s = ((i * P) / N + off) % P; if (s < 0) s += P; let x, y, a; const Lb = 0.9, r = 0.3, cy = 0.3;
    if (s < Lb) { x = Lb / 2 - s; y = 0.02; a = 0; } else if (s < Lb + Math.PI * r) { const t = (s - Lb) / r; x = -Lb / 2 - Math.sin(t) * r; y = cy - Math.cos(t) * r; a = t; } else if (s < 2 * Lb + Math.PI * r) { x = -Lb / 2 + (s - Lb - Math.PI * r); y = cy + r + 0.02; a = Math.PI; } else { const t = (s - 2 * Lb - Math.PI * r) / r; x = Lb / 2 + Math.sin(t) * r; y = cy + Math.cos(t) * r; a = Math.PI + t; }
    b.position.set(x, y, 0); b.rotation.z = a; }); };
  place(0); g.add(base);
  return { group: g, belt: { place, P }, labels: [lab(0, 0.0, 0.26, 'Track belt with treads', 'Chenille à crampons'), lab(0.45, 0.55, 0.26, 'Drive sprocket', 'Barbotin (roue motrice)'), lab(-0.45, 0.58, 0.26, 'Idler wheel', 'Roue folle (tendeuse)'), lab(0.2, 1.1, 0.3, 'Chassis', 'Châssis')] };
}

// ------------------------------------------------------------------ arrows, skid marks
const arrow = (color) => { const a = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, color, 0.14, 0.09); a.visible = false; scene.add(a); return a; };
const aCmd = arrow(0x6b97ff), aRoll = arrow(0xffffff), aSlide = arrow(0xff9f43), aSkid = arrow(0xff5a5a);
const MARKS = 70, marks = [], markMat = new THREE.MeshBasicMaterial({ color: 0xff5a5a, transparent: true, opacity: 0.85 }), markMat2 = new THREE.MeshBasicMaterial({ color: 0xffa94d, transparent: true, opacity: 0.8 });
for (let i = 0; i < MARKS; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.035).rotateX(-Math.PI / 2), markMat); m.visible = false; m.position.y = 0.006; scene.add(m); marks.push(m); }
let markIdx = 0, markT = 0;
function setArrow(a, dir, len, y) { if (len < 0.04) { a.visible = false; return; } a.visible = true; a.position.set(0, y, 0); a.setDirection(dir.clone().normalize()); a.setLength(len, Math.min(0.14, len * 0.4), 0.08); }

const pad = $('wlPad'), puck = $('wlPuck');
// ------------------------------------------------------------------ state
const S = { kind: 'fixed', model: null, theta: 0, cmd: new THREE.Vector3(), target: new THREE.Vector3(), vmax: 1, auto: true, autoT: 0, groundX: 0, groundZ: 0, u: 0, slide: 0, skid: 0, vx: 0, vy: 0, rollSpin: 0, rollerSpin: 0, showLabels: true, interacted: false };
const DEMO = [[1, 0], [0, 1], [0.7, 0.7], [-1, 0], [0, -1], [0.7, -0.7], [0, 0]];
let current = null;

function select(kind) {
  S.kind = kind; if (current) { scene.remove(current.group); current.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
  current = buildModel(kind); S.model = current; scene.add(current.group); S.theta = (kind === 'castor') ? 0.4 : 0; if (current.swivel) current.swivel.rotation.y = S.theta; S.groundX = S.groundZ = 0;
  marks.forEach((m) => { m.visible = false; });
  [...$('wlTabs').children].forEach((b) => b.classList.toggle('on', b.dataset.k === kind));
  info(kind); score(kind); polar(kind); buildLabels(); verdictKey = '';
}

// ------------------------------------------------------------------ info panel (same markup as the old cards, so the French dictionary applies)
function info(kind) {
  const w = WHEELS.find((x) => x.kind === kind);
  $('wlInfo').innerHTML = `<h3>${w.name}</h3><p class="fr">${w.fr}</p><p>${w.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</p><p>${w.what}</p><p><strong>Used in:</strong> ${w.used}</p><p><span class="pro">+</span> ${w.pro}</p><p><span class="con">−</span> ${w.con}</p>`;
}
function score(kind) {
  const s = SCORE[kind];
  $('wlScore').innerHTML = `<h4>${L('Performance scorecard', 'Fiche de performances')}</h4>` + SCORE_NAMES.map((n, i) => `<div class="sc"><span>${L(n[0], n[1])}</span><i><b style="width:${s[i] * 20}%"></b></i><em>${s[i]}/5</em></div>`).join('');
}
// ------------------------------------------------------------------ polar plot: in which directions can the wheel follow a push?
function freedom(kind, phi) {          // phi: direction of the push, 0 = along the wheel heading. returns [fraction 0..1, colour]
  const c = Math.abs(Math.cos(phi));
  if (kind === 'fixed') return [c, '#ff5a5a'];
  if (kind === 'track') return [Math.max(c, 0.35), '#ffa94d'];
  if (kind === 'castor' || kind === 'steer') return [1, '#ffa94d'];
  return [1, '#4ed17f'];
}
function polar(kind) {
  const cx = 100, cy = 100, rad = 78, N = 72; let paths = '';
  for (let i = 0; i < N; i++) { const p0 = (i / N) * TAU, p1 = ((i + 1) / N) * TAU, [f, col] = freedom(kind, (p0 + p1) / 2); const r = 12 + (rad - 12) * f; const pt = (p, rr) => `${(cx + Math.sin(p) * rr).toFixed(1)},${(cy - Math.cos(p) * rr).toFixed(1)}`; paths += `<path d="M${pt(p0, 12)} L${pt(p0, r)} L${pt(p1, r)} L${pt(p1, 12)} Z" fill="${col}" fill-opacity="0.75"/>`; }
  $('wlPolar').innerHTML = `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="78" fill="none" stroke="#555" stroke-dasharray="3 4"/><circle cx="100" cy="100" r="12" fill="#222"/>${paths}<line id="plMark" x1="100" y1="100" x2="100" y2="14" stroke="#6b97ff" stroke-width="3" stroke-linecap="round"/><text x="100" y="10" fill="#9fb0c3" font-size="10" text-anchor="middle">${L('heading', 'cap')}</text></svg>` +
    `<p class="plkey"><span style="background:#4ed17f"></span>${L('free', 'libre')} <span style="background:#ffa94d"></span>${L('needs time or slips a little', 'demande du temps ou glisse un peu')} <span style="background:#ff5a5a"></span>${L('blocked: skids', 'bloqué : dérape')}</p>`;
}
// ------------------------------------------------------------------ part labels (HTML over the canvas)
let labEls = [];
function buildLabels() { labEls.forEach((e) => e.remove()); labEls = (current.labels || []).map((l) => { const e = document.createElement('span'); e.className = 'wl-lab'; e.textContent = L(l.en, l.fr); box.appendChild(e); return e; }); }
const v3 = new THREE.Vector3();
function placeLabels() { if (!current) return; const r = canvas.getBoundingClientRect(); current.labels.forEach((l, i) => { v3.copy(l.p); current.group.localToWorld(v3); v3.project(camera); const on = S.showLabels && v3.z < 1; labEls[i].style.display = on ? '' : 'none'; labEls[i].style.transform = `translate(${(v3.x + 1) / 2 * r.width}px, ${(1 - v3.y) / 2 * r.height}px) translate(-50%, -120%)`; }); }

// ------------------------------------------------------------------ the simulation of one step
const hv = new THREE.Vector3(), rv = new THREE.Vector3(), tmp = new THREE.Vector3();
let verdictKey = '', lastRead = 0;
function step(dt, t) {
  // command: demo, joystick or buttons; smoothed like a real chassis (limited acceleration)
  if (S.auto) { S.autoT += dt; const k = Math.floor(S.autoT / 2.4) % DEMO.length; S.target.set(DEMO[k][0] * S.vmax, 0, DEMO[k][1] * S.vmax); }
  const dv = tmp.copy(S.target).sub(S.cmd), mx = 4 * dt; if (dv.length() > mx) dv.setLength(mx); S.cmd.add(dv);
  const v = S.cmd, speed = v.length(), kind = S.kind;
  puck.style.transform = `translate(${(v.z / S.vmax) * 38}px, ${(-v.x / S.vmax) * 38}px)`;       // the puck shows the command
  // heading of the wheel (castor swivels by itself, steered wheel is turned by its motor, the others are fixed)
  if (kind === 'castor') { const e = 0.3, vyc = v.x * Math.sin(S.theta) + v.z * Math.cos(S.theta); S.theta += (-vyc / e) * dt; if (speed > 0.05 && Math.abs(Math.sin(S.theta)) < 0.002 && v.x * Math.cos(S.theta) < 0) S.theta += 0.01; }
  else if (kind === 'steer') { if (speed > 0.05) { let tgt = Math.atan2(-v.z, v.x); const cur = S.theta; let d = tgt - cur; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) > Math.PI / 2) d -= Math.sign(d) * Math.PI; S.theta += clamp(d * 6, -2.6, 2.6) * dt; } }
  else S.theta = 0;
  S.theta = Math.atan2(Math.sin(S.theta), Math.cos(S.theta));
  hv.set(Math.cos(S.theta), 0, -Math.sin(S.theta)); rv.set(Math.sin(S.theta), 0, Math.cos(S.theta));
  const vx = v.dot(hv), vy = v.dot(rv); let u = vx, slide = 0, skid = 0;
  if (kind === 'omni') { slide = vy; }
  else if (kind === 'mecanum') { slide = vy / Math.sin(GAMMA); u = vx - slide * Math.cos(GAMMA); }
  else if (kind === 'ball') { u = vx; slide = vy; }
  else skid = vy;
  S.u = u; S.slide = slide; S.skid = skid; S.vx = vx; S.vy = vy;
  // the ground moves under the wheel (the wheel stays in view)
  S.groundX -= v.x * dt; S.groundZ -= v.z * dt; gtex.offset.set(-S.groundX, S.groundZ);
  // animate the model
  const m = current; if (current.swivel) current.swivel.rotation.y = S.theta;
  const idle = speed < 0.02, spinAng = (idle ? 0.8 : u) / (m.spin && kind === 'castor' ? R * 0.62 : R) * dt;
  if (m.spin) m.spin.rotation.z -= spinAng;
  if (m.rollers) { S.rollerSpin += (kind === 'mecanum' ? slide : slide) / 0.08 * dt; m.rollers.forEach((r) => { r.rotation.y = S.rollerSpin; }); }
  if (m.ball) { if (speed > 0.02) { tmp.set(v.x, 0, v.z).normalize(); const axis = new THREE.Vector3().crossVectors(tmp, new THREE.Vector3(0, 1, 0)); m.ball.rotateOnWorldAxis(axis.normalize(), -(speed / (R * 0.92)) * dt); } else m.ball.rotation.y += 0.01; if (m.drivers) m.drivers.forEach((d) => { d.rotateY(speed * dt * 6); }); }
  if (m.belt) { S.beltOff = (S.beltOff || 0) + (idle ? 0.4 : u) * dt; m.belt.place(S.beltOff); }
  if ((kind === 'omni' || kind === 'mecanum') && !idle) m.group.position.y = Math.abs(Math.sin(t * 38)) * 0.004;   // the rollers make the ride slightly bumpy
  else m.group.position.y = 0;
  // arrows: blue = command, white = driven rolling, orange = free sliding, red = skid
  const cdir = v.clone().normalize(), L1 = 1.1;
  setArrow(aCmd, cdir, speed * L1, 0.05); setArrow(aRoll, hv.clone().multiplyScalar(Math.sign(u) || 1), Math.abs(u) * L1, 0.2);
  const fdir = kind === 'mecanum' ? hv.clone().multiplyScalar(Math.cos(GAMMA)).add(rv.clone().multiplyScalar(Math.sin(GAMMA))) : rv.clone();
  setArrow(aSlide, fdir.multiplyScalar(Math.sign(slide) || 1), Math.abs(slide) * L1 * (kind === 'mecanum' ? 1 : 1), 0.35);
  setArrow(aSkid, rv.clone().multiplyScalar(Math.sign(skid) || 1), Math.abs(skid) * L1, 0.5);
  // skid marks on the ground
  markT += dt; if (Math.abs(skid) > 0.05 && markT > 0.035) { markT = 0; const mk = marks[markIdx++ % MARKS]; mk.visible = true; mk.material = kind === 'track' ? markMat2 : markMat; mk.position.set(0, 0.006, 0); mk.rotation.y = Math.atan2(-v.z, v.x) ; mk.scale.set(1 + Math.abs(skid) * 2, 1, 1); }
  marks.forEach((mk) => { if (!mk.visible) return; mk.position.x -= v.x * dt; mk.position.z -= v.z * dt; if (Math.abs(mk.position.x) > 4.5 || Math.abs(mk.position.z) > 4.5) mk.visible = false; });
  // readouts
  if (t - lastRead > 0.1) { lastRead = t; readouts(speed, u, slide, skid, vx, vy); }
}
function verdict(kind, speed, vx, vy) {
  const ang = speed > 0.05 ? Math.abs(Math.atan2(Math.abs(vy), Math.abs(vx))) * 180 / Math.PI : 0, side = ang > 12;
  switch (kind) {
    case 'fixed': return !speed ? L('Push the wheel: it only rolls along its heading.', 'Poussez la roue : elle ne roule que dans son sens.') : side ? L('Blocked sideways: the tire skids (red marks) and wears.', 'Bloquée sur le côté : le pneu dérape (traces rouges) et s\'use.') : L('Rolling freely along its heading: efficient and accurate.', 'Roule librement dans son sens : efficace et précise.');
    case 'castor': return !speed ? L('Push the wheel: it will swivel by itself.', 'Poussez la roue : elle va pivoter toute seule.') : side ? L('Swivelling to line up with the motion (see the angle).', 'Elle pivote pour s\'aligner sur le mouvement (voir l\'angle).') : L('Lined up: it trails behind the pivot and rolls.', 'Alignée : elle suit derrière le pivot et roule.');
    case 'steer': return !speed ? L('Push the wheel: its motor will steer it.', 'Poussez la roue : son moteur va l\'orienter.') : side ? L('The steering motor turns the wheel (limited speed): a little skid meanwhile.', 'Le moteur d\'orientation tourne la roue (vitesse limitée) : un peu de dérapage en attendant.') : L('Steered along the motion: rolls without skidding.', 'Orientée dans le sens du mouvement : roule sans déraper.');
    case 'omni': return !speed ? L('Push the wheel in any direction.', 'Poussez la roue dans n\'importe quelle direction.') : side ? L('The wheel drives one direction and slides freely on its rollers in the other: no skid, but only one component is powered.', 'La roue entraîne une direction et glisse librement sur ses galets dans l\'autre : pas de dérapage, mais une seule composante est motorisée.') : L('Rolling along its driven direction.', 'Elle roule dans sa direction motrice.');
    case 'mecanum': return !speed ? L('Push the wheel in any direction.', 'Poussez la roue dans n\'importe quelle direction.') : Math.abs(vx - vy) < 0.08 * speed ? L('Along the roller axis (45°) the wheel does not turn at all: it just slides on its rollers.', 'Le long de l\'axe des galets (45°), la roue ne tourne pas du tout : elle glisse sur ses galets.') : L('Rollers at 45°: the wheel must turn even for a sideways move.', 'Galets à 45° : la roue doit tourner même pour un déplacement latéral.');
    case 'ball': return !speed ? L('Push the ball in any direction.', 'Poussez la sphère dans n\'importe quelle direction.') : L('Two rollers drive the ball: it rolls any way, without steering.', 'Deux galets entraînent la sphère : elle roule dans tous les sens, sans orientation.');
    default: return !speed ? L('Push the track in any direction.', 'Poussez la chenille dans n\'importe quelle direction.') : side ? L('Sideways: the track scrubs and tears the ground (orange marks), high slip and energy.', 'Sur le côté : la chenille frotte et arrache le sol (traces orange), fort glissement et forte consommation.') : L('Rolling along the track: low pressure on the ground.', 'Roule le long de la chenille : faible pression au sol.');
  }
}
function readouts(speed, u, slide, skid, vx, vy) {
  const rpm = (u / R) * 60 / TAU, ang = S.theta * 180 / Math.PI, eff = speed > 0.03 ? (['omni', 'mecanum', 'ball'].includes(S.kind) ? 1 : Math.abs(vx) / speed) : 1;
  const rows = [[L('Command speed', 'Vitesse commandée'), `${fmt(speed)} m/s`], [L('Wheel rim speed', 'Vitesse de jante'), `${fmt(u)} m/s (${fmt(u / R, 1)} rad/s, ${fmt(rpm, 0)} rpm)`], [L('Free sliding (rollers)', 'Glissement libre (galets)'), `${fmt(Math.abs(slide))} m/s`], [L('Skid on the floor', 'Dérapage au sol'), `${fmt(Math.abs(skid))} m/s`]];
  if (S.kind === 'castor' || S.kind === 'steer') rows.push([S.kind === 'castor' ? L('Swivel angle', 'Angle de pivot') : L('Steering angle', 'Angle d\'orientation'), `${fmt(ang, 0)}°`]);
  rows.push([L('Rolling share of the push', 'Part de roulement de la poussée'), `${Math.round(eff * 100)} %`]);
  $('wlRead').innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
  const vk = S.kind + (speed < 0.05 ? 'i' : '') + Math.round(Math.abs(Math.atan2(Math.abs(vy), Math.abs(vx))) * 180 / Math.PI / 12) + (Math.abs(vx - vy) < 0.08 * speed ? 'd' : '');
  if (vk !== verdictKey) { verdictKey = vk; $('wlVerdict').textContent = verdict(S.kind, speed, vx, vy); }
  const mk = document.getElementById('plMark'); if (mk) { const rel = Math.atan2(S.cmd.z, S.cmd.x), len = 86 * Math.min(1, speed / S.vmax + 0.15); mk.setAttribute('x2', (100 + Math.sin(rel) * len).toFixed(1)); mk.setAttribute('y2', (100 - Math.cos(rel) * len).toFixed(1)); mk.style.opacity = speed > 0.03 ? 1 : 0.25; }
}

// ------------------------------------------------------------------ joystick pad, preset buttons

function setTargetFromPad(e) { const r = pad.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * 2 - 1, y = ((e.clientY - r.top) / r.height) * 2 - 1, d = Math.hypot(x, y), k = d > 1 ? 1 / d : 1; const px = x * k, py = y * k; puck.style.transform = `translate(${px * 38}px, ${py * 38}px)`; S.target.set(-py * S.vmax, 0, px * S.vmax); if (Math.hypot(px, py) < 0.08) S.target.set(0, 0, 0); }
function manual() { S.auto = false; $('wlAuto').classList.remove('on'); }
let drag = false;
pad.addEventListener('pointerdown', (e) => { drag = true; manual(); pad.setPointerCapture(e.pointerId); setTargetFromPad(e); });
pad.addEventListener('pointermove', (e) => { if (drag) setTargetFromPad(e); });
pad.addEventListener('pointerup', () => { drag = false; });
const PRE = { fwd: [1, 0], back: [-1, 0], right: [0, 1], left: [0, -1], diag: [0.7, 0.7], stop: [0, 0] };
$('wlPre').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; manual(); const p = PRE[b.dataset.p]; S.target.set(p[0] * S.vmax, 0, p[1] * S.vmax); puck.style.transform = `translate(${p[1] * 38}px, ${-p[0] * 38}px)`; });
$('wlAuto').addEventListener('click', () => { S.auto = !S.auto; $('wlAuto').classList.toggle('on', S.auto); S.autoT = 0; });
$('wlSpeed').addEventListener('input', (e) => { S.vmax = +e.target.value; $('wlSpeedV').textContent = fmt(S.vmax, 1) + ' m/s'; if (!S.auto) S.target.setLength(Math.min(S.target.length(), S.vmax)); });
$('wlLabels').addEventListener('click', () => { S.showLabels = !S.showLabels; $('wlLabels').classList.toggle('on', S.showLabels); });
const VIEWS = { side: [0, 0.8, 3.6], top: [0.01, 4.2, 0.01], front: [3.6, 0.9, 0], iso: [2.5, 1.7, 3.5] };
$('wlViews').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; camera.position.set(...VIEWS[b.dataset.v]); orbit.update(); });
pad.addEventListener('keydown', (e) => { const m = { ArrowUp: 'fwd', ArrowDown: 'back', ArrowLeft: 'left', ArrowRight: 'right', ' ': 'stop' }[e.key]; if (!m) return; e.preventDefault(); manual(); const p = PRE[m]; S.target.set(p[0] * S.vmax, 0, p[1] * S.vmax); });

// ------------------------------------------------------------------ boot
$('wlTabs').innerHTML = WHEELS.map((w) => `<button type="button" class="wl-tab" data-k="${w.kind}" title="${w.name}">${icon(w.kind)}<span>${w.name}</span></button>`).join('');
$('wlTabs').addEventListener('click', (e) => { const b = e.target.closest('.wl-tab'); if (b) select(b.dataset.k); });
function size() { const r = box.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); }
size(); addEventListener('resize', size);
select('fixed');
let visible = true, tPrev = performance.now();
new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(box);
function frame(now) {
  requestAnimationFrame(frame); if (!visible || document.hidden) { tPrev = now; return; }
  const dt = clamp((now - tPrev) / 1000, 0, 0.05); tPrev = now; step(dt, now / 1000); orbit.update(); renderer.render(scene, camera); placeLabels();
}
requestAnimationFrame(frame);
