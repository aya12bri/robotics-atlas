// sandbox.js — the programming sandbox (sandbox.html): write a small program, a 3D SCARA robot runs it.
// Commands (English or French): move x y | down | up | open | close | wait s | repeat n … end, # comments.
// Coordinates in cm, from the axis of the robot. Missions check where the cubes end up.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0;
const L = (en, fr) => (FR ? fr : en);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n1 = (v) => { const s = String(Math.round(v * 10) / 10); return FR ? s.replace('.', ',') : s; };
document.title = L('Programming sandbox', 'Bac à sable de programmation') + ' — Robotics Atlas';

// ---------------------------------------------------------------- the robot (cm)
const L1 = 30, L2 = 25, RMIN = Math.abs(L1 - L2) + 1, RMAX = L1 + L2 - 0.5;
const ZTOP = 22, CUBE = 5;                       // tool height when "up", cube size
function ik(x, y) {                              // SCARA, elbow on the right
  const r2 = x * x + y * y, c2 = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  if (c2 < -1 || c2 > 1 || Math.sqrt(r2) < RMIN) return null;
  const t2 = -Math.acos(c2), t1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
  return [t1, t2];
}

// ---------------------------------------------------------------- missions
const ZONES = { red: [32, -24], green: [-12, 40], blue: [30, 26], yellow: [-30, 18] };
const COLS = { red: '#e5484d', blue: '#2f6bff', green: '#30a46c', yellow: '#f5c518' };
const MISSIONS = [
  { id: 'free', t: [`Free play`, `Jeu libre`], d: [`Three cubes, four zones: try anything.`, `Trois cubes, quatre zones : essayez ce que vous voulez.`],
    cubes: [['red', 40, 0], ['blue', 0, 42], ['yellow', 25, 35]], zones: ['red', 'green', 'blue', 'yellow'],
    start: `# ${L('Pick the red cube and put it on the green zone', 'Prendre le cube rouge et le poser sur la zone verte')}\nopen\nmove 40 0\ndown\nclose\nup\nmove -12 40\ndown\nopen\nup\n` },
  { id: 'move', t: [`Mission 1: move a cube`, `Mission 1 : déplacer un cube`], d: [`Put the red cube on the green zone (at −12, 40).`, `Posez le cube rouge sur la zone verte (en −12, 40).`],
    cubes: [['red', 40, 0]], zones: ['green'], check: (C) => onZone(C.red, 'green'),
    start: `# ${L('The red cube is at (40, 0). Complete the program.', 'Le cube rouge est en (40, 0). Complétez le programme.')}\nopen\nmove 40 0\ndown\n` },
  { id: 'stack', t: [`Mission 2: stack`, `Mission 2 : empiler`], d: [`Put the blue cube on top of the red cube.`, `Posez le cube bleu sur le cube rouge.`],
    cubes: [['red', 35, -15], ['blue', 10, 40]], zones: [], check: (C) => Math.hypot(C.blue.x - C.red.x, C.blue.y - C.red.y) < 2.5 && C.blue.z > C.red.z + CUBE * 0.9,
    start: `# ${L('Red at (35, −15), blue at (10, 40).', 'Rouge en (35, −15), bleu en (10, 40).')}\n` },
  { id: 'sort', t: [`Mission 3: sort by colour`, `Mission 3 : trier par couleur`], d: [`Put each cube on the zone of its colour. Try to use repeat… end, or as few lines as you can.`, `Posez chaque cube sur la zone de sa couleur. Essayez d'utiliser répéter… fin, ou le moins de lignes possible.`],
    cubes: [['red', 0, 45], ['blue', 45, 5], ['yellow', 20, -40]], zones: ['red', 'blue', 'yellow'], check: (C) => onZone(C.red, 'red') && onZone(C.blue, 'blue') && onZone(C.yellow, 'yellow'),
    start: `# ${L('Red at (0, 45), blue at (45, 5), yellow at (20, −40).', 'Rouge en (0, 45), bleu en (45, 5), jaune en (20, −40).')}\n# ${L('Zones: red (32, −24), blue (30, 26), yellow (−30, 18).', 'Zones : rouge (32, −24), bleu (30, 26), jaune (−30, 18).')}\n` }
];
const onZone = (c, z) => c && Math.hypot(c.x - ZONES[z][0], c.y - ZONES[z][1]) < 5 && c.z < CUBE * 0.6;

// ---------------------------------------------------------------- the language
const KW = { move: 'move', deplacer: 'move', 'déplacer': 'move', aller: 'move', down: 'down', descendre: 'down', up: 'up', monter: 'up', open: 'open', ouvrir: 'open', close: 'close', fermer: 'close', wait: 'wait', attendre: 'wait', repeat: 'repeat', 'répéter': 'repeat', repeter: 'repeat', end: 'end', fin: 'end' };
function parse(src) {
  const lines = src.split('\n'), stack = [{ body: [] }];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/#.*/, '').trim(); if (!raw) continue;
    const w = raw.split(/[\s,;]+/).filter(Boolean), cmd = KW[w[0].toLowerCase()], line = i + 1;
    const nums = w.slice(1).map((s) => parseFloat(s.replace(',', '.')));
    const err = (en, fr) => { throw { line, msg: L(en, fr) }; };
    if (!cmd) err(`unknown command "${w[0]}"`, `commande inconnue « ${w[0]} »`);
    const body = stack[stack.length - 1].body;
    if (cmd === 'move') { if (nums.length !== 2 || nums.some((v) => !isFinite(v))) err('move needs two numbers: move x y', 'déplacer demande deux nombres : déplacer x y'); body.push({ op: 'move', x: nums[0], y: nums[1], line }); }
    else if (cmd === 'wait') { if (!(nums[0] >= 0)) err('wait needs a time in seconds', 'attendre demande un temps en secondes'); body.push({ op: 'wait', s: Math.min(nums[0], 10), line }); }
    else if (cmd === 'repeat') { if (!(nums[0] >= 1)) err('repeat needs a number: repeat 3', 'répéter demande un nombre : répéter 3'); const blk = { op: 'repeat', n: Math.min(Math.floor(nums[0]), 50), body: [], line }; body.push(blk); stack.push(blk); }
    else if (cmd === 'end') { if (stack.length < 2) err('end without repeat', 'fin sans répéter'); stack.pop(); }
    else body.push({ op: cmd, line });
  }
  if (stack.length > 1) throw { line: stack[stack.length - 1].line, msg: L('repeat without end', 'répéter sans fin') };
  const flat = [], walk = (b) => b.forEach((s) => { if (s.op === 'repeat') for (let k = 0; k < s.n; k++) walk(s.body); else flat.push(s); });
  walk(stack[0].body);
  if (flat.length > 400) throw { line: 1, msg: L('the program is too long (more than 400 steps)', 'le programme est trop long (plus de 400 étapes)') };
  return { steps: flat, lines: lines.filter((l) => l.replace(/#.*/, '').trim()).length };
}

// ---------------------------------------------------------------- page
const main = document.getElementById('sbx');
main.innerHTML = `<h1>${L('Programming sandbox', 'Bac à sable de programmation')}</h1>
<p class="lead">${L('Write a small program and watch a SCARA robot run it in 3D. Coordinates are in centimetres, from the axis of the robot; it reaches from 6 to 55 cm. Choose a mission, complete the program, press Run.', 'Écrivez un petit programme et regardez un robot SCARA l\'exécuter en 3D. Les coordonnées sont en centimètres, depuis l\'axe du robot ; il atteint de 6 à 55 cm. Choisissez une mission, complétez le programme, appuyez sur Exécuter.')}</p>
<div class="sbx-missions" role="tablist">${MISSIONS.map((m, i) => `<button type="button" data-m="${i}">${esc(m.t[LG])}</button>`).join('')}</div>
<div class="sbx-grid">
  <div class="sbx-left">
    <p class="sbx-goal"></p>
    <div class="sbx-ed"><pre class="sbx-gutter" aria-hidden="true"></pre><textarea spellcheck="false" aria-label="${L('Program', 'Programme')}"></textarea></div>
    <div class="sbx-bar"><button type="button" class="btn" id="sbxRun">▶ ${L('Run', 'Exécuter')}</button><button type="button" class="btn ghost" id="sbxStop">■ ${L('Stop', 'Arrêter')}</button><button type="button" class="btn ghost" id="sbxReset">↺ ${L('Reset', 'Réinitialiser')}</button>
      <label class="sbx-speed">${L('Speed', 'Vitesse')} <input type="range" id="sbxSpeed" min="0.5" max="4" step="0.5" value="1.5"></label></div>
    <p class="sbx-msg" aria-live="polite"></p>
    <details class="sbx-help"><summary>${L('Commands', 'Commandes')}</summary><table class="dh"><tr><th class="left">${L('Command', 'Commande')}</th><th class="left">${L('What it does', 'Ce qu\'elle fait')}</th></tr>
      <tr><td class="left"><code>${L('move x y', 'déplacer x y')}</code></td><td class="left">${L('moves the tool above the point (x, y), in cm', 'déplace l\'outil au-dessus du point (x, y), en cm')}</td></tr>
      <tr><td class="left"><code>${L('down', 'descendre')}</code> / <code>${L('up', 'monter')}</code></td><td class="left">${L('lowers the tool onto what is below / lifts it', 'descend l\'outil sur ce qui est dessous / le remonte')}</td></tr>
      <tr><td class="left"><code>${L('close', 'fermer')}</code> / <code>${L('open', 'ouvrir')}</code></td><td class="left">${L('closes the gripper (grasps the cube under it) / opens it (releases)', 'ferme la pince (saisit le cube dessous) / l\'ouvre (relâche)')}</td></tr>
      <tr><td class="left"><code>${L('wait 1', 'attendre 1')}</code></td><td class="left">${L('waits 1 second', 'attend 1 seconde')}</td></tr>
      <tr><td class="left"><code>${L('repeat 3', 'répéter 3')}</code> … <code>${L('end', 'fin')}</code></td><td class="left">${L('repeats the lines in between', 'répète les lignes entre les deux')}</td></tr>
      <tr><td class="left"><code># …</code></td><td class="left">${L('a comment, ignored', 'un commentaire, ignoré')}</td></tr></table>
      <p>${L('The commands work in English and in French. Decimals with a dot or a comma.', 'Les commandes marchent en français et en anglais. Décimales avec un point ou une virgule.')}</p></details>
  </div>
  <div class="sbx-right"><div class="sbx-view" id="sbxView"><div class="sbx-read"></div></div></div>
</div>`;
const ta = main.querySelector('textarea'), gut = main.querySelector('.sbx-gutter'), msg = main.querySelector('.sbx-msg'), goal = main.querySelector('.sbx-goal'), read = main.querySelector('.sbx-read');
const gutter = (hi) => { const n = ta.value.split('\n').length; gut.innerHTML = Array.from({ length: n }, (_, i) => i + 1 === hi ? `<b>${i + 1}</b>` : i + 1).join('\n'); gut.scrollTop = ta.scrollTop; };
ta.addEventListener('input', () => { gutter(); save(); }); ta.addEventListener('scroll', () => { gut.scrollTop = ta.scrollTop; });
ta.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); gutter(); } if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
const say = (t, cls) => { msg.innerHTML = t; msg.className = 'sbx-msg ' + (cls || ''); };
const KEY = 'ra-sandbox';
const store = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
let mi = 0;
const save = () => { try { const s = store(); s['p' + mi] = ta.value; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };

// ---------------------------------------------------------------- 3D scene (1 unit = 1 cm × 0.01 = 1 m scale kept small)
const view = main.querySelector('#sbxView'), S = 0.01;
const scene = new THREE.Scene();
if (RA.darkParts) RA.darkParts(scene);
const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 20); camera.position.set(0.62, 1.05, 0.85);
const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.shadowMap.enabled = true; view.prepend(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement); orbit.target.set(0.02, 0.02, -0.04); orbit.enableDamping = true;
const hemi = new THREE.HemisphereLight('#ffffff', '#5d6b85', 1.4); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2.0); sun.position.set(0.8, 1.6, 0.5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -0.8, right: 0.8, top: 0.8, bottom: -0.8 }); scene.add(sun);
const mat = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.1 }, o || {}));
const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 1.4), mat('#c7ccd3', { roughness: 0.9 })); table.position.y = -0.02; table.receiveShadow = true; table.userData.raKeep = true; scene.add(table);
const grid = new THREE.GridHelper(1.2, 12, '#8a94a3', '#a8b0bb'); grid.position.y = 0.001; scene.add(grid);
// reach ring
const ring = new THREE.Mesh(new THREE.RingGeometry(RMIN * S, RMAX * S, 96), new THREE.MeshBasicMaterial({ color: '#2f6bff', transparent: true, opacity: 0.08, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.0015; scene.add(ring);
// axes labels on the floor: +x, +y
const arrow = (dir, col) => { const a = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0.002, 0), 0.62, col, 0.04, 0.025); a.userData.raKeep = true; scene.add(a); };
arrow(new THREE.Vector3(1, 0, 0), '#e5484d'); arrow(new THREE.Vector3(0, 0, -1), '#30a46c');   // robot y is the scene −z
const P = (x, y, z) => new THREE.Vector3(x * S, (z || 0) * S, -y * S);
// robot
const orange = mat('#ff9f43'), grey = mat('#d5dbe1', { metalness: 0.4 }), dark = mat('#3a3f48'); dark.userData.raKeep = true;
const base = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.3, 40), dark); base.position.y = 0.15; base.castShadow = true; scene.add(base);
const j1 = new THREE.Group(); j1.position.y = 0.3; scene.add(j1);
const link1 = new THREE.Mesh(new THREE.BoxGeometry(L1 * S, 0.05, 0.08), orange); link1.position.x = L1 * S / 2; link1.castShadow = true; j1.add(link1);
j1.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 32), grey));
const j2 = new THREE.Group(); j2.position.x = L1 * S; j1.add(j2);
j2.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 32), grey));
const link2 = new THREE.Mesh(new THREE.BoxGeometry(L2 * S, 0.045, 0.065), orange); link2.position.x = L2 * S / 2; link2.castShadow = true; j2.add(link2);
const quill = new THREE.Group(); quill.position.x = L2 * S; j2.add(quill);
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 16), grey); quill.add(rod);
const tool = new THREE.Group(); quill.add(tool);
const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.015, 0.03), grey); tool.add(palm);
const fingers = [-1, 1].map((s) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.045, 0.026), dark); f.position.set(s * 0.034, -0.03, 0); f.castShadow = true; tool.add(f); return f; });
// a mark on the table under the tool, and a dashed line up to it: where the tool is, seen from any angle
const mark = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.026, 32), new THREE.MeshBasicMaterial({ color: '#ffd60a', side: THREE.DoubleSide })); mark.rotation.x = -Math.PI / 2; scene.add(mark);
const plumbGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]);
const plumb = new THREE.Line(plumbGeo, new THREE.LineDashedMaterial({ color: '#ffd60a', dashSize: 0.012, gapSize: 0.01 })); scene.add(plumb);
const st = { t1: 0, t2: 0, x: 40, y: 0, z: ZTOP, grip: 0, held: null };
const ROD = 32;                                                    // rod length (cm); its bottom is the tool
function pose() {
  const r = ik(st.x, st.y); if (r) { st.t1 = r[0]; st.t2 = r[1]; }
  j1.rotation.y = st.t1; j2.rotation.y = st.t2;
  // the tool height z (cm above the table) = bottom of the fingers; the joint plane is at 30 cm
  const toolY = (st.z + 4.5) * S - 0.3;
  rod.position.y = toolY + ROD * S / 2 + 0.01; tool.position.y = toolY + 0.045; quill.rotation.y = -st.t1 - st.t2;
  fingers.forEach((f, i) => { f.position.x = (i ? 1 : -1) * (0.034 - st.grip * 0.008); });
  if (st.held) st.held.position.copy(P(st.x, st.y, st.z + CUBE / 2 - 0.2));
  const floor = st.held ? surface(st.x, st.y, st.held) : surface(st.x, st.y);
  mark.position.copy(P(st.x, st.y, floor + 0.2)); plumb.position.copy(P(st.x, st.y, floor + 0.2)); plumb.scale.y = Math.max(0.001, (st.z - floor) * S); plumb.computeLineDistances(); plumb.visible = st.z - floor > 1;
  read.textContent = `x ${n1(st.x)} · y ${n1(st.y)} · z ${n1(st.z)} cm · ${st.held ? L('holding', 'tient') + ' ' + L(st.held.userData.c, { red: 'rouge', blue: 'bleu', yellow: 'jaune', green: 'vert' }[st.held.userData.c]) : st.grip ? L('closed', 'fermée') : L('open', 'ouverte')}`;
}
// cubes and zones
let cubes = [], zones = [];
function setup(m) {
  cubes.forEach((c) => scene.remove(c)); zones.forEach((z) => scene.remove(z)); cubes = []; zones = [];
  m.zones.forEach((z) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial({ color: COLS[z], transparent: true, opacity: 0.45 })); q.rotation.x = -Math.PI / 2; q.position.copy(P(ZONES[z][0], ZONES[z][1], 0.15)); scene.add(q); zones.push(q); });
  m.cubes.forEach(([c, x, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(CUBE * S, CUBE * S, CUBE * S), mat(COLS[c], { roughness: 0.4 })); b.castShadow = true; b.receiveShadow = true; b.userData = { c, x, y, z: 0, raKeep: true }; b.position.copy(P(x, y, CUBE / 2)); scene.add(b); cubes.push(b); });
  Object.assign(st, { x: 40, y: 0, z: ZTOP, grip: 0, held: null }); pose();
}
const cubeAt = (x, y, skip) => cubes.filter((c) => c !== skip && Math.hypot(c.userData.x - x, c.userData.y - y) < CUBE * 0.75);
const surface = (x, y, skip) => cubeAt(x, y, skip).reduce((h, c) => Math.max(h, c.userData.z + CUBE), 0);   // height of what is under (x, y)
function resize() { const w = view.clientWidth, h = view.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(view); resize();
const paintTheme = () => { const light = (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light'; scene.background = new THREE.Color(light ? '#d9dde3' : '#1d2638'); table.material.color.set(light ? '#c7ccd3' : '#2a3550'); };
paintTheme(); new MutationObserver(paintTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
renderer.setAnimationLoop(() => { orbit.update(); renderer.render(scene, camera); });

// ---------------------------------------------------------------- running a program
let running = 0;
const speed = () => +main.querySelector('#sbxSpeed').value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function tween(dur, fn, token) {
  const t0 = performance.now(), T = dur * 1000 / speed();
  for (;;) { if (token !== running) throw 'stop'; const k = Math.min(1, (performance.now() - t0) / T); fn(k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); pose(); if (k >= 1) return; await new Promise(requestAnimationFrame); }
}
async function exec(s, token) {
  if (s.op === 'move') {
    if (!ik(s.x, s.y)) throw { line: s.line, msg: L(`the point (${n1(s.x)}, ${n1(s.y)}) is out of reach: the robot reaches from ${RMIN} to ${Math.round(RMAX)} cm from its axis (here ${n1(Math.hypot(s.x, s.y))} cm)`, `le point (${n1(s.x)}, ${n1(s.y)}) est hors d'atteinte : le robot atteint de ${RMIN} à ${Math.round(RMAX)} cm de son axe (ici ${n1(Math.hypot(s.x, s.y))} cm)`) };
    if (st.z < ZTOP - 0.5) throw { line: s.line, msg: L('go up before moving: the tool would hit the cubes', 'montez avant de vous déplacer : l\'outil heurterait les cubes') };
    const x0 = st.x, y0 = st.y, d = Math.hypot(s.x - x0, s.y - y0);
    await tween(Math.max(0.35, d / 45), (k) => { st.x = x0 + (s.x - x0) * k; st.y = y0 + (s.y - y0) * k; }, token);       // straight line (IK at every frame)
  } else if (s.op === 'down') {
    const target = st.held ? surface(st.x, st.y, st.held) + 0.2 : Math.max(0, surface(st.x, st.y) - CUBE * 0.6);   // empty gripper: around the top cube
    const z0 = st.z; await tween(0.6, (k) => { st.z = z0 + (target - z0) * k; }, token);
  } else if (s.op === 'up') { const z0 = st.z; await tween(0.6, (k) => { st.z = z0 + (ZTOP - z0) * k; }, token); }
  else if (s.op === 'close') {
    const g0 = st.grip; await tween(0.35, (k) => { st.grip = g0 + (1 - g0) * k; }, token);
    if (!st.held) { const under = cubeAt(st.x, st.y).filter((c) => Math.abs(c.userData.z + CUBE / 2 - (st.z + CUBE / 2)) < CUBE * 0.7).sort((a, b) => b.userData.z - a.userData.z)[0]; if (under) { st.held = under; under.userData.z = -1; pose(); } }
  } else if (s.op === 'open') {
    if (st.held) { const c = st.held; st.held = null; const zf = surface(st.x, st.y, c); c.userData.x = st.x; c.userData.y = st.y; c.userData.z = zf; c.position.copy(P(st.x, st.y, zf + CUBE / 2)); }
    const g0 = st.grip; await tween(0.35, (k) => { st.grip = g0 * (1 - k); }, token);
  } else if (s.op === 'wait') { const t0 = performance.now(); while (performance.now() - t0 < s.s * 1000 / speed()) { if (token !== running) throw 'stop'; await sleep(30); } }
}
async function run() {
  let prog; try { prog = parse(ta.value); } catch (e) { gutter(e.line); return say(`✗ ${L('Line', 'Ligne')} ${e.line} : ${esc(e.msg)}`, 'bad'); }
  const token = ++running; setup(MISSIONS[mi]); say(L('Running…', 'Exécution…'));
  try {
    for (const s of prog.steps) { gutter(s.line); await exec(s, token); }
  } catch (e) { if (e === 'stop') return; gutter(e.line); running++; return say(`✗ ${L('Line', 'Ligne')} ${e.line} : ${esc(e.msg)}`, 'bad'); }
  gutter(); running++;
  const m = MISSIONS[mi];
  if (!m.check) return say(L(`Done: ${prog.steps.length} steps.`, `Terminé : ${prog.steps.length} étapes.`), 'ok');
  const C = {}; cubes.forEach((c) => { C[c.userData.c] = c.userData; });
  if (m.check(C)) {
    const best = store(); best['ok' + mi] = Math.min(best['ok' + mi] || 999, prog.lines); try { localStorage.setItem(KEY, JSON.stringify(best)); } catch (e) { /* */ }
    say(`✓ ${L('Mission complete!', 'Mission réussie !')} ${prog.lines} ${L('lines of program', 'lignes de programme')} (${L('your best', 'votre meilleur')} : ${best['ok' + mi]}). ${mi < MISSIONS.length - 1 ? `<button type="button" class="linkish" id="sbxNext">${L('Next mission →', 'Mission suivante →')}</button>` : ''}`, 'ok');
    const nx = main.querySelector('#sbxNext'); if (nx) nx.addEventListener('click', () => pick(mi + 1));
    paintTabs();
  } else say(L('Not yet: look where the cubes are, fix the program and run it again.', 'Pas encore : regardez où sont les cubes, corrigez le programme et relancez-le.'), 'bad');
}
const paintTabs = () => { const s = store(); main.querySelectorAll('.sbx-missions button').forEach((b, i) => { b.setAttribute('aria-selected', String(i === mi)); b.classList.toggle('done', !!s['ok' + i]); }); };
function pick(i) {
  running++; mi = i; const m = MISSIONS[i], s = store();
  goal.innerHTML = `<b>${esc(m.t[LG])}</b> — ${esc(m.d[LG])}`;
  ta.value = s['p' + i] !== undefined ? s['p' + i] : m.start; gutter(); setup(m); say(''); paintTabs();
}
main.querySelector('.sbx-missions').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (b) pick(+b.dataset.m); });
main.querySelector('#sbxRun').addEventListener('click', run);
main.querySelector('#sbxStop').addEventListener('click', () => { running++; gutter(); say(L('Stopped.', 'Arrêté.')); });
main.querySelector('#sbxReset').addEventListener('click', () => { if (!confirm(L('Put back the starting program of this mission?', 'Remettre le programme de départ de cette mission ?'))) return; ta.value = MISSIONS[mi].start; save(); pick(mi); });
pick(0);
