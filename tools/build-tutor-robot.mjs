// build-tutor-robot.mjs — the AI tutor's mascot (tutor.js): a little white robot with a black visor ringed in glowing cyan,
// navy and orange details and a notebook in its hands, modelled in 3D with three.js and rendered once into a strip of
// small pictures (thumbs/tutor-robot.webp) that the page animates with CSS: no 3D on the pages themselves.
// Frames: 0 rest · 1 half-closed eyes · 2 closed eyes · 3–10 waving hello. The same robot for both themes.
// Also writes a large preview (PREVIEW, default tutor-robot-preview.png).
//   PLAYWRIGHT=… CHROME=… node tools/build-tutor-robot.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
const SIZE = 160, N = 11;

// a tiny static server for three.js (ES modules do not load from file://)
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const PAGE = `<!doctype html><html><body style="margin:0;background:transparent">
<script type="importmap">{ "imports": { "three": "/vendor/three.module.min.js", "three/addons/": "/vendor/addons/" } }</script>
<script type="module">
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const R = ${SIZE} * 2;                                              // rendered at twice the size, then reduced (smooth edges)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(R, R); renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50); cam.position.set(0, ${process.env.CAMY || 0.4}, ${process.env.CAMZ || 7.3}); cam.lookAt(0, ${process.env.LOOKY || 0.17}, 0);
const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-3, 4, 5); scene.add(key);
const back = new THREE.DirectionalLight(0x8fd8ff, 1.6); back.position.set(4, 1, -3); scene.add(back);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// materials: glossy warm-white shell, navy blue parts, orange and glowing cyan details, black glass visor
const shell = new THREE.MeshPhysicalMaterial({ color: 0xf8f5ee, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 });
const navy = new THREE.MeshPhysicalMaterial({ color: 0x141d6b, roughness: 0.3, metalness: 0.15, clearcoat: 0.9 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0x07090f, roughness: 0.08, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03 });
const glow = (c, i) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 });
const neon = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });   // lights: unlit, so they keep their full colour
const cyan = neon(0x12c8ff), orange = glow(0xff8c1a, 0.55);
const paper = new THREE.MeshStandardMaterial({ color: 0xfbf8f1, roughness: 0.8 });
const bot = new THREE.Group(); scene.add(bot); bot.rotation.y = -0.38; bot.rotation.x = 0.06;
const add = (geo, mat, x, y, z, parent = bot) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
const ring = (r, tube) => new THREE.TorusGeometry(r, tube, 20, 72);

// the head: a white bubble with a big black visor framed by a glowing cyan ring
const head = new THREE.Group(); head.position.y = 0.55; bot.add(head);
add(new THREE.SphereGeometry(1, 96, 64), shell, 0, 0, 0, head);
// a point on a sphere of radius r: phi around the vertical axis (front = π/2), theta from the top (equator = π/2)
const sph = (phi, theta, r) => new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
// the visor: a rounded square (a "squircle" in angles) cut out of a sphere just above the head
const P0 = Math.PI / 2, T0 = Math.PI / 2 + 0.04, A = 0.9, B = 0.62;
const inside = (phi, th) => Math.abs((phi - P0) / A) ** 4 + Math.abs((th - T0) / B) ** 4 <= 1;
const vg = new THREE.SphereGeometry(1.012, 320, 200, P0 - A, 2 * A, T0 - B, 2 * B), vp = vg.attributes.position, keep = [];
const ang = (i) => { const x = vp.getX(i), y = vp.getY(i), z = vp.getZ(i), r = Math.hypot(x, y, z); return [Math.atan2(z, -x), Math.acos(y / r)]; };
const ok = []; for (let i = 0; i < vp.count; i++) ok.push(inside(...ang(i)));
const idx = vg.index.array; for (let i = 0; i < idx.length; i += 3) if (ok[idx[i]] && ok[idx[i + 1]] && ok[idx[i + 2]]) keep.push(idx[i], idx[i + 1], idx[i + 2]);
vg.setIndex(keep); head.add(new THREE.Mesh(vg, glass));
const edge = []; for (let k = 0; k < 240; k++) { const a = k / 240 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  edge.push(sph(P0 + A * Math.sign(c) * Math.abs(c) ** 0.5, T0 + B * Math.sign(s) * Math.abs(s) ** 0.5, 1.018)); }
head.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true), 400, 0.04, 12, true), cyan));
const onVisor = (dphi, dth, obj) => { obj.position.copy(sph(P0 + dphi, T0 + dth, 1.026)); obj.lookAt(obj.position.clone().multiplyScalar(2)); head.add(obj); return obj; };
const eyes = [];
for (const s of [-1, 1]) {                                          // happy eyes: two glowing arcs
  const g = onVisor(s * 0.33, -0.12, new THREE.Group());
  add(new THREE.TorusGeometry(0.12, 0.03, 12, 40, Math.PI), cyan, 0, 0, 0, g); eyes.push(g);
}
const sm = onVisor(0.02, 0.26, new THREE.Group());
add(new THREE.TorusGeometry(0.085, 0.024, 12, 40, Math.PI), cyan, 0, 0, 0, sm).rotation.z = Math.PI;
for (const s of [-1, 1]) {                                          // ears: navy pods with orange and cyan rings
  const e = new THREE.Group(); e.position.set(s * 0.97, 0.02, 0); e.rotation.z = Math.PI / 2; head.add(e);
  add(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 64), navy, 0, 0, 0, e);
  const o = add(ring(0.22, 0.035), orange, 0, -s * 0.115, 0, e); o.rotation.x = Math.PI / 2;
  const c = add(ring(0.13, 0.025), cyan, 0, -s * 0.115, 0, e); c.rotation.x = Math.PI / 2;
}
const cap = add(new THREE.SphereGeometry(1, 48, 32), navy, 0, 0.93, 0.18, head); cap.scale.set(0.34, 0.1, 0.28);
add(new THREE.CylinderGeometry(0.025, 0.03, 0.34, 12), navy, -0.38, 1.02, -0.2, head).rotation.z = 0.25;
add(new THREE.SphereGeometry(0.075, 24, 16), orange, -0.43, 1.2, -0.2, head);

// the body: a small white egg with navy and cyan bands, a navy backpack and a cyan glow underneath
const body = add(new THREE.SphereGeometry(1, 72, 48), shell, 0, -0.78, 0); body.scale.set(0.78, 0.66, 0.72);
const band = add(ring(0.77, 0.055), navy, 0, -0.95, 0); band.rotation.x = Math.PI / 2; band.scale.set(1, 0.93, 1);
const line = add(ring(0.76, 0.018), cyan, 0, -0.84, 0); line.rotation.x = Math.PI / 2; line.scale.set(1, 0.93, 1);
const neck = add(ring(0.5, 0.05), navy, 0, -0.32, 0); neck.rotation.x = Math.PI / 2;
const under = add(ring(0.42, 0.04), cyan, 0, -1.37, 0); under.rotation.x = Math.PI / 2;
const pack = add(new RoundedBoxGeometry(0.95, 0.85, 0.42, 6, 0.14), navy, 0, -0.55, -0.62); pack.rotation.x = 0.12;
add(new THREE.BoxGeometry(0.5, 0.06, 0.1), orange, 0, -0.68, -0.85);
add(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 32), cyan, 0, -0.42, -0.86).rotation.x = Math.PI / 2;

// the notebook: navy cover, cream pages, an orange bookmark ribbon, two lines of glowing text
const book = new THREE.Group(); book.position.set(0, -0.86, 0.8); book.rotation.set(-0.32, 0, -0.08); bot.add(book);
add(new RoundedBoxGeometry(0.66, 0.84, 0.07, 3, 0.025), navy, 0, 0, 0, book);
add(new THREE.BoxGeometry(0.6, 0.78, 0.06), paper, 0.02, 0, -0.035, book);
add(new THREE.BoxGeometry(0.4, 0.035, 0.01), cyan, -0.02, 0.22, 0.04, book);
add(new THREE.BoxGeometry(0.3, 0.035, 0.01), cyan, -0.07, 0.12, 0.04, book);

// arms: white shoulder with an orange ring, navy cuff, round hand. The left one holds the notebook, the right one waves.
const arm = (s) => {
  const sh = new THREE.Group(); sh.position.set(s * 0.72, -0.58, 0.18); bot.add(sh);
  add(new THREE.SphereGeometry(0.19, 32, 24), shell, 0, 0, 0, sh);
  const o = add(ring(0.15, 0.025), orange, s * 0.12, 0, 0, sh); o.rotation.y = Math.PI / 2;
  add(new THREE.CapsuleGeometry(0.12, 0.28, 8, 24), shell, 0, -0.26, 0, sh);
  const cuff = add(ring(0.12, 0.035), navy, 0, -0.42, 0, sh); cuff.rotation.x = Math.PI / 2;
  add(new THREE.SphereGeometry(0.14, 32, 24), shell, 0, -0.55, 0, sh);
  return sh;
};
const left = arm(1), right = arm(-1);
const rest = () => { left.rotation.set(-1.3, 0, -0.55); right.rotation.set(-1.3, 0, 0.55); };
rest();

const out = document.createElement('canvas'); out.width = ${SIZE} * ${N}; out.height = ${SIZE};
const ctx = out.getContext('2d'); ctx.imageSmoothingQuality = 'high';
const frame = (k) => { renderer.render(scene, cam); ctx.drawImage(renderer.domElement, 0, 0, R, R, k * ${SIZE}, 0, ${SIZE}, ${SIZE}); };
const blink = (v) => eyes.forEach((e) => { e.scale.y = v; });
frame(0); blink(0.5); frame(1); blink(0.12); frame(2); blink(1);
// waving: the right arm goes up and swings, the head leans a little
const W = 8;
for (let i = 0; i < W; i++) {
  const up = Math.min(1, i / 2), sw = Math.sin((i - 1) / (W - 2) * Math.PI * 3) * (i > 1 ? 1 : 0);
  right.rotation.set(-1.3 * (1 - up) - 0.15 * up, 0, 0.55 * (1 - up) - (2.5 + 0.35 * sw) * up);
  head.rotation.z = -0.1 * up; head.rotation.y = 0.08 * up;
  frame(3 + i);
}
// a large preview, at rest
rest(); head.rotation.set(0, 0, 0);
renderer.setSize(640, 640); renderer.render(scene, cam);
window.RESULT = { sheet: out.toDataURL('image/webp', 0.9), preview: renderer.domElement.toDataURL('image/png') };
</script></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.route('**/__robot.html*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: PAGE }));
await page.goto(`http://localhost:${port}/__robot.html`);
await page.waitForFunction(() => window.RESULT, null, { timeout: 120000 });
const { sheet, preview } = await page.evaluate(() => window.RESULT);
await browser.close(); server.close();
const save = (url, f) => { fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); return fs.statSync(f).size; };
const kb = save(sheet, path.join(root, 'thumbs', 'tutor-robot.webp'));
const prev = process.env.PREVIEW || path.join(root, 'tutor-robot-preview.png');
save(preview, prev);
console.log(`thumbs/tutor-robot.webp: ${N} frames of ${SIZE} px, ${Math.round(kb / 1024)} KB · preview: ${prev}`);
