// sandbox.js — the programming sandbox (sandbox.html): write a small program, a 3D robot (SCARA or 6-axis arm) runs it.
// Commands (English or French): move x y (linear) | movej x y (joint) | down | up | open | close | wait s | repeat n … end, # comments.
// After a run, the trace can be exported as an indicative ABB RAPID-like or KUKA KRL-like listing.
// Coordinates in cm, from the axis of the robot. Missions check where the cubes end up.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0;
const L = (en, fr) => (FR ? fr : en);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n1 = (v) => { const s = String(Math.round(v * 10) / 10); return FR ? s.replace('.', ',') : s; };
document.title = L('Programming sandbox', 'Bac à sable de programmation') + ' — Robotics Atlas';

// ---------------------------------------------------------------- the robot (cm)
const ZTOP = 22, CUBE = 5;                       // tool height when "up", cube size
// SCARA: two arms in a horizontal plane (L1, L2) + a vertical axis. q = [θ1, θ2, z]
const L1 = 30, L2 = 25;
const SCARA = { id: 'scara', rmin: Math.abs(L1 - L2) + 1, rmax: L1 + L2 - 0.5,
  ik(x, y, z) {                                  // elbow on the right
    const r2 = x * x + y * y, c2 = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
    if (c2 < -1 || c2 > 1 || Math.sqrt(r2) < this.rmin) return null;
    const t2 = -Math.acos(c2), t1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
    return [t1, t2, z];
  },
  fk: (q) => [L1 * Math.cos(q[0]) + L2 * Math.cos(q[0] + q[1]), L1 * Math.sin(q[0]) + L2 * Math.sin(q[0] + q[1]), q[2]] };
// 6-axis arm: shoulder at D1, upper arm A1, forearm A2, the wrist keeps the tool vertical (D6 from wrist to tool point).
// q = [θ1 … θ6] in radians; θ4 = θ6 = 0 here, θ5 = −(θ2 + θ3) − 90° keeps the gripper pointing down.
const D1 = 32, A1 = 30, A2 = 30, D6 = 15;
const SIX = { id: 'six', rmin: 12, rmax: 55,
  ik(x, y, z) {
    const r = Math.hypot(x, y), h = z + D6 - D1, c = (r * r + h * h - A1 * A1 - A2 * A2) / (2 * A1 * A2);
    if (r < this.rmin || c < -1 || c > 1) return null;
    const b = -Math.acos(c), a = Math.atan2(h, r) - Math.atan2(A2 * Math.sin(b), A1 + A2 * Math.cos(b));   // elbow up
    return [Math.atan2(y, x), a, b, 0, -(a + b) - Math.PI / 2, 0];
  },
  fk(q) { const r = A1 * Math.cos(q[1]) + A2 * Math.cos(q[1] + q[2]), h = A1 * Math.sin(q[1]) + A2 * Math.sin(q[1] + q[2]); return [r * Math.cos(q[0]), r * Math.sin(q[0]), h + D1 - D6]; } };
let R = SCARA;

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
const KW = { move: 'move', movel: 'move', lin: 'move', linear: 'move', 'linéaire': 'move', lineaire: 'move', deplacer: 'move', 'déplacer': 'move', aller: 'move',
  movej: 'movej', ptp: 'movej', joint: 'movej', articulaire: 'movej', down: 'down', descendre: 'down', up: 'up', monter: 'up', open: 'open', ouvrir: 'open', close: 'close', fermer: 'close', wait: 'wait', attendre: 'wait', repeat: 'repeat', 'répéter': 'repeat', repeter: 'repeat', end: 'end', fin: 'end' };
function parse(src) {
  const lines = src.split('\n'), stack = [{ body: [] }];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/#.*/, '').trim(); if (!raw) continue;
    const w = raw.split(/[\s,;]+/).filter(Boolean), cmd = KW[w[0].toLowerCase()], line = i + 1;
    const nums = w.slice(1).map((s) => parseFloat(s.replace(',', '.')));
    const err = (en, fr) => { throw { line, msg: L(en, fr) }; };
    if (!cmd) err(`unknown command "${w[0]}"`, `commande inconnue « ${w[0]} »`);
    const body = stack[stack.length - 1].body;
    if (cmd === 'move' || cmd === 'movej') { if (nums.length !== 2 || nums.some((v) => !isFinite(v))) err(`${w[0]} needs two numbers: ${w[0]} x y`, `${w[0]} demande deux nombres : ${w[0]} x y`); body.push({ op: cmd, x: nums[0], y: nums[1], line }); }
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
<p class="lead">${L('Write a small program and watch a robot run it in 3D: a SCARA or a 6-axis arm. Coordinates are in centimetres, from the axis of the robot. Choose a mission, complete the program, press Run; then compare a linear move with a joint move, and export your program in the style of an industrial language.', 'Écrivez un petit programme et regardez un robot l\'exécuter en 3D : un SCARA ou un bras 6 axes. Les coordonnées sont en centimètres, depuis l\'axe du robot. Choisissez une mission, complétez le programme, appuyez sur Exécuter ; comparez ensuite un mouvement linéaire et un mouvement articulaire, et exportez votre programme dans le style d\'un langage industriel.')}</p>
<div class="sbx-robot" role="radiogroup" aria-label="Robot"><span>Robot :</span><button type="button" role="radio" data-r="scara">SCARA</button><button type="button" role="radio" data-r="six">${L('6-axis arm', 'Bras 6 axes')}</button><span class="sbx-reach"></span></div>
<div class="sbx-missions" role="tablist">${MISSIONS.map((m, i) => `<button type="button" role="tab" data-m="${i}">${esc(m.t[LG])}</button>`).join('')}</div>
<div class="sbx-grid">
  <div class="sbx-left">
    <p class="sbx-goal"></p>
    <div class="sbx-ed"><pre class="sbx-gutter" aria-hidden="true"></pre><textarea spellcheck="false" aria-label="${L('Program', 'Programme')}"></textarea></div>
    <div class="sbx-bar"><button type="button" class="btn" id="sbxRun">▶ ${L('Run', 'Exécuter')}</button><button type="button" class="btn ghost" id="sbxStop">■ ${L('Stop', 'Arrêter')}</button><button type="button" class="btn ghost" id="sbxReset">↺ ${L('Reset', 'Réinitialiser')}</button>
      <button type="button" class="btn ghost" id="sbxExport">⇩ ${L('Export', 'Exporter')}</button>
      <label class="sbx-speed">${L('Speed', 'Vitesse')} <input type="range" id="sbxSpeed" min="0.5" max="4" step="0.5" value="1.5"></label></div>
    <p class="sbx-msg" aria-live="polite"></p>
    <div class="sbx-export" hidden><div class="sbx-tabs" role="tablist"><button type="button" role="tab" data-x="rapid">${L('ABB style (RAPID)', 'Style ABB (RAPID)')}</button><button type="button" role="tab" data-x="krl">${L('KUKA style (KRL)', 'Style KUKA (KRL)')}</button><button type="button" class="linkish" id="sbxCopy">${L('Copy', 'Copier')}</button></div>
      <pre tabindex="0"></pre>
      <p class="sbx-note">${L('Indicative listing generated from the trace of your last run (loops unrolled, millimetres, in a frame placed on the table). A real program also needs the tool and frame data taught on the cell, suitable speeds and the safety checks: never run it as is.', 'Listing indicatif généré à partir de la trace de votre dernière exécution (boucles déroulées, millimètres, dans un repère posé sur la table). Un vrai programme demande aussi les données d\'outil et de repère apprises sur la cellule, des vitesses adaptées et les vérifications de sécurité : ne l\'exécutez jamais tel quel.')}</p></div>
    <details class="sbx-help"><summary>${L('Commands', 'Commandes')}</summary><table class="dh"><tr><th class="left">${L('Command', 'Commande')}</th><th class="left">${L('What it does', 'Ce qu\'elle fait')}</th></tr>
      <tr><td class="left"><code>${L('move x y', 'déplacer x y')}</code></td><td class="left">${L('moves the tool above the point (x, y), in cm, in a straight line (linear move, like MoveL or LIN)', 'déplace l\'outil au-dessus du point (x, y), en cm, en ligne droite (mouvement linéaire, comme MoveL ou LIN)')}</td></tr>
      <tr><td class="left"><code>${L('movej x y', 'articulaire x y')}</code></td><td class="left">${L('same target, but every joint turns at once from its start angle to its end angle (joint move, like MoveJ or PTP): often faster, but the path is curved', 'même cible, mais chaque axe tourne en même temps de son angle de départ à son angle d\'arrivée (mouvement articulaire, comme MoveJ ou PTP) : souvent plus rapide, mais la trajectoire est courbe')}</td></tr>
      <tr><td class="left"><code>${L('down', 'descendre')}</code> / <code>${L('up', 'monter')}</code></td><td class="left">${L('lowers the tool onto what is below / lifts it', 'descend l\'outil sur ce qui est dessous / le remonte')}</td></tr>
      <tr><td class="left"><code>${L('close', 'fermer')}</code> / <code>${L('open', 'ouvrir')}</code></td><td class="left">${L('closes the gripper (grasps the cube under it) / opens it (releases)', 'ferme la pince (saisit le cube dessous) / l\'ouvre (relâche)')}</td></tr>
      <tr><td class="left"><code>${L('wait 1', 'attendre 1')}</code></td><td class="left">${L('waits 1 second', 'attend 1 seconde')}</td></tr>
      <tr><td class="left"><code>${L('repeat 3', 'répéter 3')}</code> … <code>${L('end', 'fin')}</code></td><td class="left">${L('repeats the lines in between', 'répète les lignes entre les deux')}</td></tr>
      <tr><td class="left"><code># …</code></td><td class="left">${L('a comment, ignored', 'un commentaire, ignoré')}</td></tr></table>
      <p>${L('The commands work in English and in French (move, movel, lin = linear; movej, ptp = joint). Decimals with a dot or a comma. The trace on the table shows the path of the tool: blue for linear moves, pink for joint moves.', 'Les commandes marchent en français et en anglais (déplacer, linéaire, move, lin = linéaire ; articulaire, movej, ptp = articulaire). Décimales avec un point ou une virgule. La trace montre le chemin de l\'outil : bleue pour les mouvements linéaires, rose pour les mouvements articulaires.')}</p></details>
  </div>
  <div class="sbx-right"><div class="sbx-view" id="sbxView"><div class="sbx-read"></div></div></div>
</div>`;
const exportBox = main.querySelector('.sbx-export'), exportPre = exportBox.querySelector('pre');
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
// reach ring (rebuilt for each robot)
const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.55, 96), new THREE.MeshBasicMaterial({ color: '#2f6bff', transparent: true, opacity: 0.08, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.0015; scene.add(ring);
// axes labels on the floor: +x, +y
const arrow = (dir, col) => { const a = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0.002, 0), 0.62, col, 0.04, 0.025); a.userData.raKeep = true; scene.add(a); };
arrow(new THREE.Vector3(1, 0, 0), '#e5484d'); arrow(new THREE.Vector3(0, 0, -1), '#30a46c');   // robot y is the scene −z
const P = (x, y, z) => new THREE.Vector3(x * S, (z || 0) * S, -y * S);
const orange = mat('#ff9f43'), grey = mat('#d5dbe1', { metalness: 0.4 }), dark = mat('#3a3f48'); dark.userData.raKeep = true;
const cyl = (r, h, m, axisZ) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), m); if (axisZ) c.rotation.x = Math.PI / 2; c.castShadow = true; return c; };
const gripper = (parent) => {                     // palm + two fingers; the group origin is the palm
  const g = new THREE.Group(); parent.add(g);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.015, 0.03), grey));
  const f = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.045, 0.026), dark); m.position.set(s * 0.034, -0.03, 0); m.castShadow = true; g.add(m); return m; });
  return { g, f };
};
// --- SCARA
const scara = new THREE.Group(); scene.add(scara);
{ const base = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.3, 40), dark); base.position.y = 0.15; base.castShadow = true; scara.add(base); }
const j1 = new THREE.Group(); j1.position.y = 0.3; scara.add(j1);
{ const l = new THREE.Mesh(new THREE.BoxGeometry(L1 * S, 0.05, 0.08), orange); l.position.x = L1 * S / 2; l.castShadow = true; j1.add(l); j1.add(cyl(0.055, 0.07, grey)); }
const j2 = new THREE.Group(); j2.position.x = L1 * S; j1.add(j2);
{ j2.add(cyl(0.05, 0.07, grey)); const l = new THREE.Mesh(new THREE.BoxGeometry(L2 * S, 0.045, 0.065), orange); l.position.x = L2 * S / 2; l.castShadow = true; j2.add(l); }
const quill = new THREE.Group(); quill.position.x = L2 * S; j2.add(quill);
const ROD = 32;                                                    // rod length (cm)
const rod = cyl(0.012, ROD * S, grey); quill.add(rod);
const gS = gripper(quill);
SCARA.apply = (q) => {
  j1.rotation.y = q[0]; j2.rotation.y = q[1]; quill.rotation.y = -q[0] - q[1];
  const toolY = (q[2] + 4.5) * S - 0.3;                            // tool height in the joint plane (30 cm up)
  rod.position.y = toolY + ROD * S / 2 + 0.01; gS.g.position.y = toolY + 0.045;
};
SCARA.grip = gS.f; SCARA.obj = scara;
SCARA.joints = (q) => `J1 ${Math.round(q[0] * 180 / Math.PI)}° · J2 ${Math.round(q[1] * 180 / Math.PI)}° · J3 ${n1(q[2])} cm`;
// --- 6-axis arm
const six = new THREE.Group(); scene.add(six);
{ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.05, 40), dark); b.position.y = 0.025; b.castShadow = true; six.add(b); }
const s1 = new THREE.Group(); s1.position.y = 0.05; six.add(s1);
{ const c = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, (D1 * S) - 0.05, 32), orange); c.position.y = ((D1 * S) - 0.05) / 2; c.castShadow = true; s1.add(c); }
const s2 = new THREE.Group(); s2.position.y = D1 * S - 0.05; s1.add(s2);
{ s2.add(cyl(0.05, 0.12, grey, true)); const l = new THREE.Mesh(new THREE.BoxGeometry(A1 * S, 0.06, 0.06), orange); l.position.x = A1 * S / 2; l.castShadow = true; s2.add(l); }
const s3 = new THREE.Group(); s3.position.x = A1 * S; s2.add(s3);
{ s3.add(cyl(0.042, 0.1, grey, true)); const l = new THREE.Mesh(new THREE.BoxGeometry(A2 * S, 0.048, 0.048), orange); l.position.x = A2 * S / 2; l.castShadow = true; s3.add(l); }
const s5 = new THREE.Group(); s5.position.x = A2 * S; s3.add(s5);
s5.add(cyl(0.03, 0.07, grey, true));
const flange = new THREE.Group(); flange.rotation.z = Math.PI / 2; s5.add(flange);     // local −y = along the wrist = down
{ const c = cyl(0.022, 0.05, dark); c.position.y = -0.025; flange.add(c); }
const g6 = gripper(flange); g6.g.position.y = -(D6 * S - 0.09);
SIX.apply = (q) => { s1.rotation.y = q[0]; s2.rotation.z = q[1]; s3.rotation.z = q[2]; s5.rotation.z = q[4]; };
SIX.grip = g6.f; SIX.obj = six;
SIX.joints = (q) => q.map((v, i) => `J${i + 1} ${Math.round(v * 180 / Math.PI)}°`).join(' · ');
// a mark on the table under the tool, and a dashed line up to it: where the tool is, seen from any angle
const mark = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.026, 32), new THREE.MeshBasicMaterial({ color: '#ffd60a', side: THREE.DoubleSide })); mark.rotation.x = -Math.PI / 2; scene.add(mark);
const plumbGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]);
const plumb = new THREE.Line(plumbGeo, new THREE.LineDashedMaterial({ color: '#ffd60a', dashSize: 0.012, gapSize: 0.01 })); scene.add(plumb);
// the trace of the tool: blue for linear moves, pink for joint moves
const TMAX = 6000, tPos = new Float32Array(TMAX * 3), tCol = new Float32Array(TMAX * 3);
const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3)); trailGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3)); trailGeo.setDrawRange(0, 0);
const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true })); trail.frustumCulled = false; scene.add(trail);
let tN = 0, tLast = null, tKind = 'L';
const TC = { L: new THREE.Color('#22b8f0'), J: new THREE.Color('#ff4fa3') };
const trailClear = () => { tN = 0; tLast = null; trailGeo.setDrawRange(0, 0); };
function trailAdd() {
  if (tN >= TMAX) return; const v = P(st.x, st.y, st.z + 0.6);
  if (tLast && tLast.distanceTo(v) < 0.003) return;
  v.toArray(tPos, tN * 3); TC[tKind].toArray(tCol, tN * 3); tN++; tLast = v;
  trailGeo.setDrawRange(0, tN); trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true;
}
const st = { q: null, x: 40, y: 0, z: ZTOP, grip: 0, held: null, joint: false };
function pose() {
  if (!st.joint) { const q = R.ik(st.x, st.y, st.z); if (q) st.q = q; }        // linear: the tool point leads, the joints follow
  R.apply(st.q);
  R.grip.forEach((f, i) => { f.position.x = (i ? 1 : -1) * (0.034 - st.grip * 0.008); });
  if (st.held) st.held.position.copy(P(st.x, st.y, st.z + CUBE / 2 - 0.2));
  const floor = st.held ? surface(st.x, st.y, st.held) : surface(st.x, st.y);
  mark.position.copy(P(st.x, st.y, floor + 0.2)); plumb.position.copy(P(st.x, st.y, floor + 0.2)); plumb.scale.y = Math.max(0.001, (st.z - floor) * S); plumb.computeLineDistances(); plumb.visible = st.z - floor > 1;
  if (st.tracing) trailAdd();
  read.innerHTML = `x ${n1(st.x)} · y ${n1(st.y)} · z ${n1(st.z)} cm · ${st.held ? L('holding', 'tient') + ' ' + L(st.held.userData.c, { red: 'rouge', blue: 'bleu', yellow: 'jaune', green: 'vert' }[st.held.userData.c]) : st.grip ? L('closed', 'fermée') : L('open', 'ouverte')}<br><span>${R.joints(st.q)}</span>`;
}
// cubes and zones
let cubes = [], zones = [];
function setup(m) {
  cubes.forEach((c) => scene.remove(c)); zones.forEach((z) => scene.remove(z)); cubes = []; zones = [];
  m.zones.forEach((z) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial({ color: COLS[z], transparent: true, opacity: 0.45 })); q.rotation.x = -Math.PI / 2; q.position.copy(P(ZONES[z][0], ZONES[z][1], 0.15)); scene.add(q); zones.push(q); });
  m.cubes.forEach(([c, x, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(CUBE * S, CUBE * S, CUBE * S), mat(COLS[c], { roughness: 0.4 })); b.castShadow = true; b.receiveShadow = true; b.userData = { c, x, y, z: 0, raKeep: true }; b.position.copy(P(x, y, CUBE / 2)); scene.add(b); cubes.push(b); });
  Object.assign(st, { x: 40, y: 0, z: ZTOP, grip: 0, held: null, joint: false, tracing: false }); trailClear(); pose();
}
const cubeAt = (x, y, skip) => cubes.filter((c) => c !== skip && Math.hypot(c.userData.x - x, c.userData.y - y) < CUBE * 0.75);
const surface = (x, y, skip) => cubeAt(x, y, skip).reduce((h, c) => Math.max(h, c.userData.z + CUBE), 0);   // height of what is under (x, y)
function resize() { const w = view.clientWidth, h = view.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(view); resize();
const paintTheme = () => { const light = (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light'; scene.background = new THREE.Color(light ? '#d9dde3' : '#1d2638'); table.material.color.set(light ? '#c7ccd3' : '#2a3550'); };
paintTheme(); new MutationObserver(paintTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
renderer.setAnimationLoop(() => { orbit.update(); renderer.render(scene, camera); });

// ---------------------------------------------------------------- running a program
let running = 0, trace = [];
const speed = () => +main.querySelector('#sbxSpeed').value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function tween(dur, fn, token) {
  const t0 = performance.now(), T = dur * 1000 / speed();
  for (;;) { if (token !== running) throw 'stop'; const k = Math.min(1, (performance.now() - t0) / T); fn(k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); pose(); if (k >= 1) return; await new Promise(requestAnimationFrame); }
}
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const rec = (op, extra) => trace.push(Object.assign({ op, x: st.x, y: st.y, z: st.z }, extra || {}));
async function exec(s, token) {
  if (s.op === 'move' || s.op === 'movej') {
    const far = Math.hypot(s.x, s.y);
    if (!R.ik(s.x, s.y, ZTOP)) throw { line: s.line, msg: L(`the point (${n1(s.x)}, ${n1(s.y)}) is out of reach: the robot reaches from ${R.rmin} to ${Math.round(R.rmax)} cm from its axis (here ${n1(far)} cm)`, `le point (${n1(s.x)}, ${n1(s.y)}) est hors d'atteinte : le robot atteint de ${R.rmin} à ${Math.round(R.rmax)} cm de son axe (ici ${n1(far)} cm)`) };
    if (st.z < ZTOP - 0.5) throw { line: s.line, msg: L('go up before moving: the tool would hit the cubes', 'montez avant de vous déplacer : l\'outil heurterait les cubes') };
    const x0 = st.x, y0 = st.y;
    if (s.op === 'move') {
      // a straight line must stay reachable all along: it cannot pass too close to the axis of the robot
      let rmin = Infinity; for (let k = 0; k <= 60; k++) { const x = x0 + (s.x - x0) * k / 60, y = y0 + (s.y - y0) * k / 60; rmin = Math.min(rmin, Math.hypot(x, y)); }
      if (rmin < R.rmin) throw { line: s.line, msg: L(`the straight line from (${n1(x0)}, ${n1(y0)}) to (${n1(s.x)}, ${n1(s.y)}) passes ${n1(rmin)} cm from the axis of the robot: too close, it cannot follow it there. Use a joint move (movej), or go through a point in between.`, `la ligne droite de (${n1(x0)}, ${n1(y0)}) à (${n1(s.x)}, ${n1(s.y)}) passe à ${n1(rmin)} cm de l'axe du robot : trop près, il ne peut pas la suivre là. Utilisez un mouvement articulaire (articulaire x y), ou passez par un point intermédiaire.`) };
      tKind = 'L'; const d = Math.hypot(s.x - x0, s.y - y0);
      await tween(Math.max(0.35, d / 45), (k) => { st.x = x0 + (s.x - x0) * k; st.y = y0 + (s.y - y0) * k; }, token);   // IK at every frame
    } else {
      const q0 = st.q.slice(), q1 = R.ik(s.x, s.y, ZTOP);
      // the joints move together: the tool follows a curve. Check it does not hit anything on the way.
      for (let k = 1; k < 40; k++) { const [x, y, z] = R.fk(lerp(q0, q1, k / 40)); if (z - (st.held ? CUBE : 0) < surface(x, y, st.held) + 0.5) throw { line: s.line, msg: L(`with a joint move the tool follows a curve, and this one dips into a cube near (${n1(x)}, ${n1(y)}). Use a linear move here.`, `en mouvement articulaire l'outil suit une courbe, et celle-ci plonge dans un cube vers (${n1(x)}, ${n1(y)}). Utilisez ici un mouvement linéaire.`) }; }
      tKind = 'J'; const dq = Math.max(...q0.map((v, i) => Math.abs(q1[i] - v)));
      st.joint = true;
      try { await tween(Math.max(0.35, dq / 2.2), (k) => { st.q = lerp(q0, q1, k); [st.x, st.y, st.z] = R.fk(st.q); }, token); } finally { st.joint = false; }
      st.x = s.x; st.y = s.y; st.z = ZTOP;
    }
    rec(s.op === 'move' ? 'L' : 'J');
  } else if (s.op === 'down') {
    const target = st.held ? surface(st.x, st.y, st.held) + 0.2 : Math.max(0, surface(st.x, st.y) - CUBE * 0.6);   // empty gripper: around the top cube
    tKind = 'L'; const z0 = st.z; await tween(0.6, (k) => { st.z = z0 + (target - z0) * k; }, token); rec('L');
  } else if (s.op === 'up') { tKind = 'L'; const z0 = st.z; await tween(0.6, (k) => { st.z = z0 + (ZTOP - z0) * k; }, token); rec('L'); }
  else if (s.op === 'close') {
    const g0 = st.grip; await tween(0.35, (k) => { st.grip = g0 + (1 - g0) * k; }, token);
    if (!st.held) { const under = cubeAt(st.x, st.y).filter((c) => Math.abs(c.userData.z + CUBE / 2 - (st.z + CUBE / 2)) < CUBE * 0.7).sort((a, b) => b.userData.z - a.userData.z)[0]; if (under) { st.held = under; under.userData.z = -1; pose(); } }
    rec('grip', { v: 1 });
  } else if (s.op === 'open') {
    if (st.held) { const c = st.held; st.held = null; const zf = surface(st.x, st.y, c); c.userData.x = st.x; c.userData.y = st.y; c.userData.z = zf; c.position.copy(P(st.x, st.y, zf + CUBE / 2)); }
    const g0 = st.grip; await tween(0.35, (k) => { st.grip = g0 * (1 - k); }, token); rec('grip', { v: 0 });
  } else if (s.op === 'wait') { const t0 = performance.now(); while (performance.now() - t0 < s.s * 1000 / speed()) { if (token !== running) throw 'stop'; await sleep(30); } rec('wait', { s: s.s }); }
}
async function run() {
  let prog; try { prog = parse(ta.value); } catch (e) { gutter(e.line); return say(`✗ ${L('Line', 'Ligne')} ${e.line} : ${esc(e.msg)}`, 'bad'); }
  const token = ++running; setup(MISSIONS[mi]); say(L('Running…', 'Exécution…'));
  trace = [{ op: 'home', x: st.x, y: st.y, z: st.z }]; st.tracing = true; trailAdd(); exportBox.hidden = true;
  try {
    for (const s of prog.steps) { gutter(s.line); await exec(s, token); }
  } catch (e) { st.tracing = false; if (e === 'stop') return; gutter(e.line); running++; return say(`✗ ${L('Line', 'Ligne')} ${e.line} : ${esc(e.msg)}`, 'bad'); }
  st.tracing = false; gutter(); running++; trace.done = true;
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
  ta.value = s['p' + i] !== undefined ? s['p' + i] : m.start; gutter(); setup(m); say(''); paintTabs(); trace = []; exportBox.hidden = true;
}
main.querySelector('.sbx-missions').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (b) pick(+b.dataset.m); });
main.querySelector('#sbxRun').addEventListener('click', run);
main.querySelector('#sbxStop').addEventListener('click', () => { running++; gutter(); say(L('Stopped.', 'Arrêté.')); });
main.querySelector('#sbxReset').addEventListener('click', () => { if (!confirm(L('Put back the starting program of this mission?', 'Remettre le programme de départ de cette mission ?'))) return; ta.value = MISSIONS[mi].start; save(); pick(mi); });
// ---------------------------------------------------------------- choosing the robot
function useRobot(id, quiet) {
  R = id === 'six' ? SIX : SCARA;
  SCARA.obj.visible = R === SCARA; SIX.obj.visible = R === SIX;
  if (R === SIX) { camera.position.set(0.78, 1.02, 1.08); orbit.target.set(0.02, 0.12, -0.04); } else { camera.position.set(0.62, 1.05, 0.85); orbit.target.set(0.02, 0.02, -0.04); }
  ring.geometry.dispose(); ring.geometry = new THREE.RingGeometry(R.rmin * S, R.rmax * S, 96);
  main.querySelectorAll('.sbx-robot [data-r]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.r === R.id)));
  main.querySelector('.sbx-reach').textContent = L(`reach: ${R.rmin} to ${Math.round(R.rmax)} cm from the axis`, `portée : de ${R.rmin} à ${Math.round(R.rmax)} cm de l'axe`);
  try { const s = store(); s.robot = R.id; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* */ }
  if (!quiet) { running++; gutter(); setup(MISSIONS[mi]); exportBox.hidden = true; trace = []; say(''); }
}
main.querySelector('.sbx-robot').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) useRobot(b.dataset.r); });

// ---------------------------------------------------------------- export (indicative, from the trace of the last run)
const mm = (v) => String(Math.round(v * 10));
function listing(kind) {
  const out = [], name = 'mission' + mi;
  const home = trace[0]; let at = home;
  const steps = trace.filter((t) => {                // drop moves to where the tool already is
    if (t.op === 'home') return false; if (t.op !== 'L' && t.op !== 'J') return true;
    const same = Math.hypot(t.x - at.x, t.y - at.y, t.z - at.z) < 0.05; at = t; return !same;
  });
  const head = L('Robotics Atlas sandbox — indicative export, not for a real robot', 'Robotics Atlas, bac à sable — export indicatif, pas pour un vrai robot');
  const note = L('positions in mm in a frame on the table, gripper pointing down; loops unrolled', 'positions en mm dans un repère posé sur la table, pince vers le bas ; boucles déroulées');
  if (kind === 'rapid') {
    out.push(`MODULE Mission${mi}`, `  ! ${head}`, `  ! ${note}`, `  ! ${L('pTable and tGripper must be taught on the real cell', 'pTable et tGripper doivent être appris sur la vraie cellule')}`,
      '  PERS robtarget pTable := [[0,0,0],[0,0,1,0],[0,0,0,0],[9E9,9E9,9E9,9E9,9E9,9E9]];', '  PERS tooldata tGripper := [TRUE,[[0,0,150],[1,0,0,0]],[1,[0,0,50],[1,0,0,0],0,0,0]];', '',
      `  PROC ${name}()`, `    MoveJ Offs(pTable,${mm(home.x)},${mm(home.y)},${mm(home.z)}), v500, fine, tGripper;  ! ${L('start', 'départ')}`);
    steps.forEach((t) => {
      if (t.op === 'L') out.push(`    MoveL Offs(pTable,${mm(t.x)},${mm(t.y)},${mm(t.z)}), v200, fine, tGripper;`);
      else if (t.op === 'J') out.push(`    MoveJ Offs(pTable,${mm(t.x)},${mm(t.y)},${mm(t.z)}), v500, fine, tGripper;`);
      else if (t.op === 'grip') out.push(`    SetDO doGripper, ${t.v};  ! ${t.v ? L('close', 'fermer') : L('open', 'ouvrir')}`, '    WaitTime 0.3;');
      else if (t.op === 'wait') out.push(`    WaitTime ${t.s};`);
    });
    out.push('  ENDPROC', 'ENDMODULE');
  } else {
    const pos = (t) => `{X ${mm(t.x)}, Y ${mm(t.y)}, Z ${mm(t.z)}, A 0, B 90, C 0}`;
    out.push(`DEF ${name}()`, `  ; ${head}`, `  ; ${note}`, `  ; ${L('BASE_DATA[1] and TOOL_DATA[1] must be measured on the real cell', 'BASE_DATA[1] et TOOL_DATA[1] doivent être mesurés sur la vraie cellule')}`,
      '  $BASE = BASE_DATA[1]', '  $TOOL = TOOL_DATA[1]', '  $VEL.CP = 0.2  ; m/s', '',
      `  PTP ${pos(home)}  ; ${L('start', 'départ')}`);
    steps.forEach((t) => {
      if (t.op === 'L') out.push(`  LIN ${pos(t)}`);
      else if (t.op === 'J') out.push(`  PTP ${pos(t)}`);
      else if (t.op === 'grip') out.push(`  $OUT[1] = ${t.v ? 'TRUE' : 'FALSE'}  ; ${t.v ? L('close', 'fermer') : L('open', 'ouvrir')}`, '  WAIT SEC 0.3');
      else if (t.op === 'wait') out.push(`  WAIT SEC ${t.s}`);
    });
    out.push('END');
  }
  return out.join('\n');
}
let xKind = 'rapid';
const paintExport = () => { exportPre.textContent = listing(xKind); exportBox.querySelectorAll('[data-x]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.x === xKind))); };
main.querySelector('#sbxExport').addEventListener('click', () => {
  if (!trace.done) return say(L('Run the program to the end first: the export is made from what the robot did.', 'Exécutez d\'abord le programme jusqu\'au bout : l\'export est fait à partir de ce que le robot a fait.'), 'bad');
  exportBox.hidden = !exportBox.hidden; if (!exportBox.hidden) paintExport();
});
exportBox.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (b) { xKind = b.dataset.x; paintExport(); } });
main.querySelector('#sbxCopy').addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(exportPre.textContent); e.target.textContent = L('Copied ✓', 'Copié ✓'); setTimeout(() => { e.target.textContent = L('Copy', 'Copier'); }, 1500); } catch (err) { /* no clipboard */ } });
useRobot(store().robot === 'six' ? 'six' : 'scara', true);
pick(0);
