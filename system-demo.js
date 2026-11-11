// system-demo.js — "All the components, from A to Z" on the Anatomy 3D pages.
// Every component of a robot system is modelled on a 3D workbench and wired up with its real cables
// (sensor signals, fieldbus, power, motor phases, encoder feedback, safety loop). Each part has a number;
// click it (or its card) to fly to it and read what it is, real examples and how it works. "How it works"
// plays the global loop: sensors → controller → drives → motors → motion → encoders back to the controller.
//
// Usage:  <div class="sysdemo" data-set="arm|mobile|humanoid|drone"></div>  +  <script type="module" src="system-demo.js"></script>
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { articulated, scara, delta, gantry, makeAMR, makePerson } from './ops-demo.js';
import { callouts } from './inside-demo.js';

const FR = (window.RA && RA.lang) === 'fr';
const L = (en, fr) => (FR ? fr : en);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.15, ...o });
const C = {
  alu: M('#c9d1d9', { roughness: 0.3, metalness: 0.75 }), steel: M('#9aa5b1', { roughness: 0.25, metalness: 0.85 }), dark: M('#2c333c', { roughness: 0.5, metalness: 0.4 }),
  black: M('#16191d', { roughness: 0.55 }), grey: M('#6b7480', { roughness: 0.5, metalness: 0.3 }), white: M('#eef1f4', { roughness: 0.45 }), cream: M('#e6e1d6', { roughness: 0.6 }),
  pcb: M('#1f6f43', { roughness: 0.55 }), pcbBlue: M('#1f4fa8', { roughness: 0.55 }), pcbRed: M('#b3262c', { roughness: 0.55 }), gold: M('#e2b33c', { roughness: 0.3, metalness: 0.9 }),
  copper: M('#c8742e', { roughness: 0.35, metalness: 0.8 }), orange: M('#ff9f43', { roughness: 0.4 }), yellow: M('#f5c518', { roughness: 0.45 }), red: M('#e5484d', { roughness: 0.4 }),
  blue: M('#2f6bff', { roughness: 0.45 }), cyan: M('#1aa0c8', { roughness: 0.4 }), green: M('#30a46c'), rubber: M('#1d2024', { roughness: 0.95 }), glass: new THREE.MeshStandardMaterial({ color: '#7fb6e6', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.75 }),
  lens: M('#0b1622', { roughness: 0.05, metalness: 0.6 }), led: M('#30ff8a', { emissive: '#30ff8a', emissiveIntensity: 0.9 }), ledR: M('#ff3b3b', { emissive: '#ff3b3b', emissiveIntensity: 0.9 }), wood: M('#b98d5a', { roughness: 0.85 })
};
const bx = (w, h, d, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y + h / 2, z); o.castShadow = o.receiveShadow = true; return o; };
const cy = (r, h, m, x = 0, y = 0, z = 0, seg = 32) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); o.position.set(x, y + h / 2, z); o.castShadow = o.receiveShadow = true; return o; };
const cyX = (r, h, m, x = 0, y = 0, z = 0, seg = 32) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg).rotateZ(Math.PI / 2), m); o.position.set(x + h / 2, y, z); o.castShadow = o.receiveShadow = true; return o; };
const cyZ = (r, h, m, x = 0, y = 0, z = 0, seg = 32) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg).rotateX(Math.PI / 2), m); o.position.set(x, y, z + h / 2); o.castShadow = o.receiveShadow = true; return o; };
const G = (...ch) => { const g = new THREE.Group(); ch.forEach((c) => g.add(c)); return g; };
function tex(lines, w = 256, h = 128, bg = '#0f1720', fg = '#7fe0ff', font = 'bold 30px monospace') {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = font; g.textBaseline = 'middle';
  lines.forEach((s, i) => g.fillText(s, 12, (h * (i + 0.6)) / (lines.length + 0.2))); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const screen = (w, h, lines, x, y, z, ry = 0) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(lines) })); s.position.set(x, y, z); s.rotation.y = ry; return s; };
function chips(board, n, w, d, y, m = C.black) { for (let i = 0; i < n; i++) board.add(bx(0.03 + (i % 3) * 0.012, 0.008, 0.03, m, (Math.sin(i * 7.1) * w) / 2.6, y, (Math.cos(i * 3.7) * d) / 2.6)); }

// ---------------------------------------------------------------- component models (about 0.1 – 0.5 units, origin on the bench)
const B = {
  servo() { const g = G(bx(0.16, 0.16, 0.05, C.alu, 0, 0, 0.12), cyZ(0.065, 0.24, C.black, 0, 0.08, -0.14), cyZ(0.012, 0.06, C.steel, 0, 0.08, 0.145), bx(0.05, 0.04, 0.05, C.dark, 0, 0.16, -0.04));
    g.userData.spin = g.children[2]; return g; },
  stepper() { const g = G(bx(0.12, 0.12, 0.03, C.dark, 0, 0, 0.07)); for (let i = 0; i < 5; i++) g.add(bx(0.115, 0.115, 0.012, i % 2 ? C.black : C.grey, 0, 0.002, 0.04 - i * 0.022)); g.add(bx(0.12, 0.12, 0.03, C.dark, 0, 0, -0.08)); const sh = cyZ(0.01, 0.06, C.steel, 0, 0.06, 0.085); g.add(sh); g.userData.spin = sh; return g; },
  harmonic() { const g = G(cyZ(0.1, 0.07, C.steel, 0, 0.1, -0.035)); const fs = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 10, 40), C.alu); fs.position.set(0, 0.1, 0.045); fs.scale.set(1.1, 0.9, 1); g.add(fs); const wg = cyZ(0.05, 0.03, C.dark, 0, 0.1, 0.04); wg.scale.set(1.15, 0.85, 1); g.add(wg); g.userData.spin = wg; return g; },
  rv() { const g = G(cyZ(0.12, 0.12, C.dark, 0, 0.12, -0.06), cyZ(0.1, 0.03, C.steel, 0, 0.12, 0.06)); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.add(cyZ(0.01, 0.02, C.black, Math.cos(a) * 0.075, 0.12 + Math.sin(a) * 0.075, 0.085)); } return g; },
  planet() { const g = G(cyZ(0.07, 0.12, C.alu, 0, 0.07, -0.06), cyZ(0.05, 0.02, C.dark, 0, 0.07, 0.06), cyZ(0.012, 0.04, C.steel, 0, 0.07, 0.08)); g.userData.spin = g.children[2]; return g; },
  enc() { const g = G(cy(0.045, 0.05, C.alu), cy(0.02, 0.02, C.steel, 0, 0.05)); const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0.04, 0.025, 0), V(0.1, 0.02, 0.03), V(0.14, 0.005, 0.0)]), 12, 0.006, 6), C.black); g.add(c); return g; },
  brake() { return G(cy(0.07, 0.04, C.dark), cy(0.065, 0.012, M('#7a4a2a', { roughness: 0.9 }), 0, 0.04), cy(0.04, 0.02, C.copper, 0, 0.052)); },
  prox() { const g = G(cyX(0.018, 0.12, C.steel, -0.06, 0.03), cyX(0.016, 0.01, C.ledR, 0.06, 0.03)); for (let i = 0; i < 2; i++) g.add(bx(0.008, 0.045, 0.045, C.steel, -0.03 + i * 0.06, 0.008)); g.add(cyX(0.007, 0.08, C.black, -0.14, 0.03)); return g; },
  photo() { return G(bx(0.05, 0.08, 0.04, C.yellow), cyZ(0.012, 0.01, C.lens, 0, 0.055, 0.02), bx(0.01, 0.01, 0.005, C.led, 0.015, 0.07, 0.02)); },
  us() { const g = G(bx(0.12, 0.008, 0.05, C.pcbBlue)); g.add(cy(0.018, 0.03, C.alu, -0.03, 0.008)); g.add(cy(0.018, 0.03, C.alu, 0.03, 0.008)); for (let i = 0; i < 4; i++) g.add(bx(0.004, 0.02, 0.004, C.gold, -0.012 + i * 0.008, -0.012, -0.022)); return g; },
  imu() { const g = G(bx(0.06, 0.006, 0.05, C.pcbBlue), bx(0.016, 0.004, 0.016, C.black, 0, 0.006)); for (let i = 0; i < 6; i++) g.add(bx(0.004, 0.004, 0.004, C.gold, -0.025 + i * 0.01, 0.006, -0.02)); return g; },
  cam() { return G(bx(0.08, 0.06, 0.07, C.black), cyZ(0.024, 0.04, C.dark, 0, 0.03, 0.035), cyZ(0.018, 0.005, C.lens, 0, 0.03, 0.075)); },
  cam3d() { const g = G(bx(0.18, 0.035, 0.035, C.dark)); for (const x of [-0.06, 0, 0.06]) g.add(cyZ(0.011, 0.004, C.lens, x, 0.017, 0.018)); return g; },
  ft() { const g = G(cy(0.06, 0.035, C.alu), cy(0.06, 0.01, C.dark, 0, 0.035)); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.add(cy(0.006, 0.004, C.black, Math.cos(a) * 0.045, 0.045, Math.sin(a) * 0.045)); } return g; },
  fsr() { const g = G(cy(0.035, 0.003, C.black, 0, 0, 0, 40)); g.add(bx(0.014, 0.002, 0.08, C.black, 0, 0, 0.06)); return g; },
  lidar() { const g = G(cy(0.05, 0.04, C.black)); const top = cy(0.045, 0.035, C.dark, 0, 0.04); g.add(top); g.add(bx(0.03, 0.015, 0.005, C.ledR, 0, 0.05, 0.045)); g.userData.spin = top; g.userData.spinAxis = 'y'; return g; },
  gps() { return G(bx(0.05, 0.006, 0.05, C.pcb), bx(0.035, 0.006, 0.035, C.cream, 0, 0.006)); },
  pcb() { const g = G(bx(0.16, 0.008, 0.11, C.pcb)); chips(g, 9, 0.16, 0.11, 0.008); g.add(bx(0.03, 0.02, 0.012, C.white, 0.06, 0.008, -0.045)); for (let i = 0; i < 3; i++) g.add(cy(0.008, 0.022, C.alu, -0.06 + i * 0.02, 0.008, 0.04, 14)); return g; },
  mcu() { const g = G(bx(0.1, 0.006, 0.06, C.pcbBlue), bx(0.022, 0.004, 0.022, C.black, 0, 0.006), bx(0.02, 0.012, 0.016, C.steel, -0.045, 0.006, 0)); for (let i = 0; i < 10; i++) g.add(bx(0.004, 0.01, 0.004, C.black, -0.03 + i * 0.007, 0.006, 0.026)); return g; },
  sbc() { const g = G(bx(0.085, 0.006, 0.056, C.pcb), bx(0.016, 0.003, 0.016, C.steel, -0.01, 0.006, 0)); for (let i = 0; i < 2; i++) g.add(bx(0.017, 0.016, 0.014, C.steel, 0.035, 0.006, -0.012 + i * 0.026)); g.add(bx(0.016, 0.014, 0.016, C.steel, 0.035, 0.022, 0.0)); g.add(bx(0.05, 0.006, 0.005, C.black, -0.005, 0.006, -0.025)); return g; },
  ai() { const g = G(bx(0.1, 0.008, 0.08, C.black), bx(0.08, 0.03, 0.07, C.alu, 0, 0.008)); for (let i = 0; i < 9; i++) g.add(bx(0.004, 0.02, 0.07, C.alu, -0.036 + i * 0.009, 0.038)); const fan = cy(0.025, 0.006, C.black, 0, 0.058); g.add(fan); g.userData.spin = fan; g.userData.spinAxis = 'y'; g.add(bx(0.03, 0.006, 0.008, C.green, 0, 0.008, 0.04)); return g; },
  driver() { const g = G(bx(0.07, 0.006, 0.07, C.pcbRed)); for (let i = 0; i < 6; i++) g.add(bx(0.004, 0.025, 0.06, C.alu, -0.025 + i * 0.01, 0.006)); for (let i = 0; i < 4; i++) g.add(bx(0.008, 0.01, 0.01, C.cyan, -0.03 + i * 0.02, 0.006, 0.03)); return g; },
  radio() { const g = G(bx(0.03, 0.004, 0.05, C.pcbBlue), bx(0.018, 0.003, 0.02, C.steel, 0, 0.004, -0.008)); g.add(bx(0.022, 0.002, 0.012, C.gold, 0, 0.004, 0.018)); return g; },
  router() { const g = G(bx(0.16, 0.03, 0.1, C.black), bx(0.12, 0.001, 0.001, C.led, 0, 0.031, 0.05)); for (const x of [-0.06, 0, 0.06]) g.add(cy(0.004, 0.12, C.black, x, 0.03, -0.045, 8)); return g; },
  battery() { return G(bx(0.2, 0.08, 0.1, C.blue), bx(0.18, 0.002, 0.06, C.white, 0, 0.08), cy(0.006, 0.02, C.red, -0.08, 0.08, 0.03), cy(0.006, 0.02, C.black, -0.06, 0.08, 0.03), bx(0.04, 0.004, 0.03, C.pcb, 0.05, 0.08)); },
  psu() { const g = G(bx(0.2, 0.06, 0.11, C.alu)); for (let i = 0; i < 6; i++) g.add(bx(0.006, 0.01, 0.006, C.dark, -0.08 + i * 0.012, 0.06, 0.045)); for (let i = 0; i < 7; i++) g.add(bx(0.01, 0.012, 0.012, C.dark, -0.06 + i * 0.022, 0.024, 0.056)); g.add(bx(0.006, 0.006, 0.002, C.led, 0.085, 0.045, 0.056)); return g; },
  heatsink() { const g = G(bx(0.1, 0.012, 0.08, C.dark)); for (let i = 0; i < 9; i++) g.add(bx(0.005, 0.045, 0.08, C.dark, -0.044 + i * 0.011, 0.012)); return g; },
  drive() { const g = G(bx(0.07, 0.22, 0.16, C.dark), screen(0.04, 0.025, ['RUN'], 0, 0.18, 0.081)); for (let i = 0; i < 3; i++) g.add(bx(0.004, 0.004, 0.002, i ? C.led : C.ledR, -0.02 + i * 0.012, 0.15, 0.081)); for (let i = 0; i < 8; i++) g.add(bx(0.072, 0.005, 0.15, C.grey, 0, 0.012 + i * 0.012, -0.005)); for (let i = 0; i < 4; i++) g.add(bx(0.012, 0.012, 0.004, C.white, -0.018 + (i % 2) * 0.03, 0.05 + Math.floor(i / 2) * 0.025, 0.081)); return g; },
  plc() { const g = G(bx(0.3, 0.012, 0.03, C.steel, 0, 0.035, 0)); const cols = [C.dark, C.grey, C.grey, C.cream, C.cream, C.grey]; cols.forEach((m, i) => { g.add(bx(0.045, 0.12, 0.08, m, -0.12 + i * 0.048, 0)); g.add(bx(0.006, 0.006, 0.002, i % 2 ? C.led : C.ledR, -0.12 + i * 0.048, 0.1, 0.041)); }); g.add(screen(0.03, 0.02, ['S7'], -0.12, 0.07, 0.041)); return g; },
  cabinet() { const g = G(bx(0.42, 0.62, 0.3, C.cream), bx(0.4, 0.6, 0.005, C.cream, 0, 0.01, 0.152)); g.add(bx(0.03, 0.08, 0.01, C.dark, 0.17, 0.27, 0.16)); for (let i = 0; i < 5; i++) g.add(bx(0.12, 0.006, 0.004, C.grey, -0.12, 0.08 + i * 0.012, 0.156)); g.add(screen(0.13, 0.08, ['ROBOT CTRL', 'OK  24V'], 0, 0.48, 0.156)); g.add(cy(0.025, 0.02, C.red, 0.1, 0.44, 0.15)); return g; },
  pendant() { const g = G(bx(0.2, 0.025, 0.14, C.cream)); g.add(screen(0.13, 0.085, ['J1  12.5°', 'J2 -40.0°'], -0.015, 0.0261, 0.0, 0)); g.children[1].rotation.x = -Math.PI / 2; g.add(cy(0.012, 0.012, C.red, 0.075, 0.025, -0.045)); for (let i = 0; i < 6; i++) g.add(bx(0.012, 0.006, 0.012, C.dark, 0.075, 0.025, -0.02 + i * 0.012)); return g; },
  bus() { const g = new THREE.Group(); const curve = new THREE.CatmullRomCurve3([...Array(18)].map((_, i) => V(Math.cos(i * 1.1) * (0.05 + i * 0.002), 0.006 + i * 0.0012, Math.sin(i * 1.1) * (0.05 + i * 0.002)))); g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.006, 6), M('#2aa66a'))); g.add(bx(0.022, 0.016, 0.03, C.glass, 0.08, 0.0, 0.0)); g.add(bx(0.12, 0.03, 0.08, C.dark, 0, 0, -0.14)); for (let i = 0; i < 5; i++) g.add(bx(0.016, 0.012, 0.004, C.steel, -0.04 + i * 0.02, 0.008, -0.099)); return g; },
  harness() { const g = new THREE.Group(); const curve = new THREE.CatmullRomCurve3([V(-0.15, 0.02, 0), V(-0.05, 0.08, 0.05), V(0.05, 0.03, -0.04), V(0.15, 0.05, 0.02)]); g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.018, 10), C.black)); for (let i = 0; i < 12; i++) { const t = curve.getPointAt(i / 11); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.004, 6, 16), C.dark); ring.position.copy(t); g.add(ring); } return g; },
  gripper() { return G(bx(0.1, 0.03, 0.05, C.alu, 0, 0.09), bx(0.018, 0.09, 0.03, C.dark, -0.03, 0), bx(0.018, 0.09, 0.03, C.dark, 0.03, 0), cy(0.03, 0.02, C.steel, 0, 0.12)); },
  vacuum() { return G(cy(0.008, 0.08, C.steel, 0, 0.02), new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.025, 24, 1, true).translate(0, 0.012, 0), M('#2b2f36', { side: THREE.DoubleSide })), cy(0.015, 0.012, C.alu, 0, 0.1)); },
  estop() { return G(bx(0.08, 0.06, 0.08, C.yellow), cy(0.022, 0.012, C.dark, 0, 0.06), cy(0.03, 0.02, C.red, 0, 0.072)); },
  curtain() { const g = new THREE.Group(); for (const x of [-0.16, 0.16]) { g.add(bx(0.03, 0.4, 0.03, C.yellow, x, 0)); for (let i = 0; i < 8; i++) g.add(bx(0.006, 0.006, 0.002, C.ledR, x + (x < 0 ? 0.016 : -0.016), 0.05 + i * 0.045, 0)); } const beams = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.36), new THREE.MeshBasicMaterial({ color: '#ff4040', transparent: true, opacity: 0.08, side: THREE.DoubleSide })); beams.position.y = 0.22; g.add(beams); return g; },
  scanner() { return G(bx(0.1, 0.1, 0.1, C.yellow), cy(0.04, 0.04, C.black, 0, 0.1), bx(0.06, 0.02, 0.005, C.lens, 0, 0.11, 0.04)); },
  bumper() { const g = new THREE.Group(); const curve = new THREE.CatmullRomCurve3([V(-0.15, 0.03, -0.05), V(0, 0.03, 0.05), V(0.15, 0.03, -0.05)]); g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.02, 10), M('#2b2f36', { roughness: 0.9 }))); g.add(bx(0.03, 0.02, 0.02, C.dark, 0, 0.0, 0.035)); return g; },
  struct() { const g = G(bx(0.3, 0.06, 0.06, C.alu)); for (let i = 0; i < 4; i++) g.add(bx(0.3, 0.01, 0.01, C.grey, 0, 0.025 + (i % 2) * 0.012, (i < 2 ? -1 : 1) * 0.03)); g.add(cy(0.06, 0.08, C.white, -0.18, 0)); return g; },
  chassis() { const g = new THREE.Group(); for (const z of [-0.08, 0.08]) g.add(bx(0.3, 0.02, 0.02, C.alu, 0, 0, z)); for (const x of [-0.14, 0, 0.14]) g.add(bx(0.02, 0.02, 0.18, C.alu, x, 0)); g.add(bx(0.28, 0.004, 0.16, C.dark, 0, 0.02)); return g; },
  enclosure() { return G(bx(0.18, 0.1, 0.12, C.black), bx(0.18, 0.006, 0.12, C.dark, 0, 0.1), cy(0.008, 0.014, C.grey, 0.07, 0.1, 0.04)); },
  wheel() { const g = new THREE.Group(); const w = new THREE.Group(); w.position.y = 0.08; w.add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.022, 12, 30), C.rubber)); w.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 24).rotateX(Math.PI / 2), C.alu)); g.add(w); g.userData.spin = w; g.userData.spinAxis = 'z'; return g; },
  track() { const g = new THREE.Group(); const shape = new THREE.Shape(); shape.absarc(-0.08, 0, 0.04, Math.PI / 2, Math.PI * 1.5); shape.absarc(0.08, 0, 0.04, -Math.PI / 2, Math.PI / 2); const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false }); const t = new THREE.Mesh(geo, C.rubber); t.position.set(0, 0.045, -0.02); g.add(t); for (const x of [-0.08, 0, 0.08]) g.add(cyZ(0.025, 0.045, C.alu, x, 0.045, -0.022)); return g; },
  prop() { const g = G(cy(0.025, 0.035, C.dark), cy(0.006, 0.02, C.steel, 0, 0.035)); const p = new THREE.Group(); p.position.y = 0.055; for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.003, 0.018), C.black); b.position.x = s * 0.055; b.rotation.x = s * 0.25; p.add(b); } g.add(p); g.userData.spin = p; g.userData.spinAxis = 'y'; return g; },
  esc() { return G(bx(0.05, 0.01, 0.025, C.pcbBlue), bx(0.05, 0.004, 0.025, M('#c43', { transparent: true, opacity: 0.6 }), 0, 0.01)); },
  cyl() { const g = G(cyX(0.025, 0.2, C.alu, -0.1, 0.03), cyX(0.008, 0.08, C.steel, 0.1, 0.03), cyX(0.026, 0.02, C.dark, -0.1, 0.03), cyX(0.026, 0.02, C.dark, 0.08, 0.03)); g.userData.rod = g.children[1]; return g; },
  dc() { const g = G(cyX(0.03, 0.09, C.steel, -0.06, 0.035), cyX(0.03, 0.04, C.alu, 0.03, 0.035), cyX(0.005, 0.03, C.steel, 0.07, 0.035)); g.userData.spin = g.children[2]; g.userData.spinAxis = 'x'; return g; },
  hobby() { const g = G(bx(0.04, 0.04, 0.02, C.blue), bx(0.055, 0.004, 0.02, C.blue, 0, 0.03), cy(0.008, 0.008, C.white, 0.01, 0.04)); const horn = bx(0.035, 0.004, 0.008, C.white, 0.01, 0.048); g.add(horn); g.userData.spin = horn; g.userData.spinAxis = 'y'; return g; },
  laptop() { const g = G(bx(0.3, 0.012, 0.2, C.grey)); const lid = new THREE.Group(); lid.position.set(0, 0.012, -0.1); lid.rotation.x = -0.25; lid.add(bx(0.3, 0.19, 0.008, C.grey, 0, 0, -0.004)); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.165), new THREE.MeshBasicMaterial({ map: tex(['$ ros2 launch arm', '> move_to(0.4, 0.2)', 'RoboDK  ●  sim OK'], 512, 300, '#0d1420', '#7fe0ff', 'bold 34px monospace') })); s.position.set(0, 0.095, 0.001); lid.add(s); g.add(lid); return g; },
  pid() { const g = G(bx(0.2, 0.13, 0.02, C.black)); g.add(screen(0.18, 0.11, ['e = cible - mesure', 'u = Kp·e + Ki∫e + Kd·de', 'PID @ 1 kHz'], 0, 0.068, 0.0101)); return g; },
  cables() { const g = new THREE.Group(); const cols = [C.red, C.black, C.blue, M('#f5c518'), C.green]; cols.forEach((m, i) => { const c = new THREE.CatmullRomCurve3([V(-0.12, 0.01 + i * 0.006, -0.02 + i * 0.01), V(-0.03, 0.05, 0.03), V(0.05, 0.015, -0.03 + i * 0.01), V(0.13, 0.02 + i * 0.004, 0.01)]); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.004, 6), m)); }); g.add(bx(0.03, 0.015, 0.02, C.white, 0.14, 0.012, 0.02)); return g; },
  mot3() { const g = G(cyX(0.05, 0.14, C.black, -0.07, 0.055), bx(0.02, 0.11, 0.11, C.alu, 0.07, 0)); const sh = cyX(0.01, 0.05, C.steel, 0.08, 0.055); g.add(sh); g.userData.spin = sh; g.userData.spinAxis = 'x'; return g; }
};

// ---------------------------------------------------------------- the parts lists
// cat: category id; pos: [x, z] on the bench; t: [name, examples, role, how it works] (each [en, fr])
const CATS = {
  act: [L('Actuators (motors)', 'Actionneurs (moteurs)'), '#ff9f43'], red: [L('Gearboxes', 'Réducteurs'), '#e67e22'], enc: [L('Encoders', 'Codeurs'), '#9b59b6'],
  sen: [L('Sensors', 'Capteurs'), '#1aa0c8'], adv: [L('Advanced sensors', 'Capteurs avancés'), '#16a085'], brd: [L('Electronics and control boards', 'Électronique et cartes de contrôle'), '#27ae60'],
  ctl: [L('Controller / PLC', 'Contrôleur / automate'), '#2f6bff'], drv: [L('Drives', 'Variateurs / drivers'), '#e74c3c'], pow: [L('Power', 'Alimentation / énergie'), '#c0392b'],
  com: [L('Communication', 'Communication'), '#f1c40f'], tool: [L('Tools and accessories', 'Outils et accessoires'), '#7f8c8d'], saf: [L('Safety', 'Sécurité'), '#f39c12'],
  str: [L('Mechanical structure', 'Structure mécanique'), '#95a5a6'], sw: [L('Software and control', 'Logiciels et commande'), '#6d5dfc']
};
const T = (ne, nf, ee, ef, re, rf, he, hf) => [[ne, nf], [ee, ef], [re, rf], [he, hf]];
const PARTS = {
  servo: ['act', 'servo', T('Servo motor (AC brushless)', 'Servomoteur (AC sans balais)', 'Yaskawa Sigma-7, Siemens 1FK7, Panasonic Minas', 'Yaskawa Sigma-7, Siemens 1FK7, Panasonic Minas', 'Moves each axis.', 'Fait bouger chaque axe.', 'Copper coils in the stator make a turning magnetic field; the magnets of the rotor follow it. The drive controls the current, so the torque and the speed are exact.', 'Des bobines de cuivre dans le stator créent un champ magnétique tournant ; les aimants du rotor le suivent. Le variateur règle le courant, donc le couple et la vitesse sont exacts.')],
  stepper: ['act', 'stepper', T('Stepper motor', 'Moteur pas à pas', 'NEMA 17 / NEMA 23 (1.8° per step)', 'NEMA 17 / NEMA 23 (1,8° par pas)', 'Cheap motors for light axes, grippers and small machines.', 'Moteurs bon marché pour les axes légers, les pinces et les petites machines.', 'Each current pulse moves the rotor by one step (200 steps per turn): you count pulses instead of measuring, but it can lose steps if overloaded.', 'Chaque impulsion de courant avance le rotor d\'un pas (200 pas par tour) : on compte les impulsions au lieu de mesurer, mais il peut perdre des pas s\'il est surchargé.')],
  harmonic: ['red', 'harmonic', T('Harmonic drive (strain wave gear)', 'Réducteur harmonique', 'Harmonic Drive CSG, Leaderdrive', 'Harmonic Drive CSG, Leaderdrive', 'Slows the motor down and multiplies its torque, with no play.', 'Ralentit le moteur et multiplie son couple, sans jeu.', 'An elliptical cam bends a flexible toothed cup inside a rigid ring with 2 more teeth: 100:1 in a flat, light package. Used in the wrist and in cobots.', 'Une came elliptique déforme une cloche dentée flexible dans une couronne qui a 2 dents de plus : 100:1 dans un volume plat et léger. Utilisé dans le poignet et les cobots.')],
  rv: ['red', 'rv', T('RV (cycloidal) reducer', 'Réducteur RV (cycloïdal)', 'Nabtesco RV-E', 'Nabtesco RV-E', 'Heavy-duty gearbox for the big axes (base, shoulder, elbow).', 'Réducteur robuste pour les gros axes (base, épaule, coude).', 'Lobed discs roll eccentrically against pins: very stiff and shock-proof, ratios of 100 to 200:1.', 'Des disques à lobes roulent de façon excentrique contre des goupilles : très rigide et résistant aux chocs, rapports de 100 à 200:1.')],
  planet: ['red', 'planet', T('Planetary gearbox', 'Réducteur planétaire', 'Neugart PLE, gearmotors of mobile robots', 'Neugart PLE, motoréducteurs des robots mobiles', 'Compact gearbox in line with the motor.', 'Réducteur compact dans l\'axe du moteur.', 'A sun gear drives three planets inside a fixed ring; the carrier is the output (3:1 to 10:1 per stage).', 'Un pignon solaire entraîne trois satellites dans une couronne fixe ; le porte-satellites est la sortie (3:1 à 10:1 par étage).')],
  enc: ['enc', 'enc', T('Absolute encoder / resolver', 'Codeur absolu / résolveur', '17 to 24-bit optical encoders, resolvers on harsh axes', 'Codeurs optiques 17 à 24 bits, résolveurs sur les axes sévères', 'Measures the position of each motor.', 'Mesure la position de chaque moteur.', 'A disc with fine tracks is read by light (or a magnetic field): it gives the angle to 1/131 072 of a turn and keeps it after a power cut.', 'Un disque à pistes fines est lu par la lumière (ou un champ magnétique) : il donne l\'angle au 1/131 072 de tour et le garde après une coupure.')],
  brake: ['act', 'brake', T('Holding brake', 'Frein de maintien', 'Spring-applied brake on each heavy axis', 'Frein à ressort sur chaque axe lourd', 'Holds the arm when the power is off.', 'Tient le bras quand le courant est coupé.', 'Springs press a friction disc; the coil releases it only when powered. A power cut = the brake closes: the arm cannot fall.', 'Des ressorts serrent un disque de friction ; la bobine ne le libère que si elle est alimentée. Coupure = frein serré : le bras ne peut pas tomber.')],
  prox: ['sen', 'prox', T('Inductive proximity sensor', 'Capteur de proximité inductif', 'M18 PNP, 8 mm range', 'M18 PNP, portée 8 mm', 'Detects a metal part without contact: home position, part present.', 'Détecte une pièce métallique sans contact : origine, présence de pièce.', 'A coil makes a small magnetic field; metal close by changes it and the output switches to 24 V.', 'Une bobine crée un petit champ magnétique ; un métal proche le modifie et la sortie passe à 24 V.')],
  photo: ['sen', 'photo', T('Photoelectric sensor', 'Capteur photoélectrique', 'Sick, Keyence, Omron cells', 'Cellules Sick, Keyence, Omron', 'Detects any object crossing a light beam, on conveyors.', 'Détecte tout objet qui coupe un faisceau lumineux, sur les convoyeurs.', 'It sends red or infrared light and watches the reflection: an object cuts or returns the beam.', 'Il envoie une lumière rouge ou infrarouge et surveille le retour : un objet coupe ou renvoie le faisceau.')],
  us: ['sen', 'us', T('Ultrasonic distance sensor', 'Capteur de distance à ultrasons', 'HC-SR04, Maxbotix', 'HC-SR04, Maxbotix', 'Measures distance to obstacles (2 cm to 4 m).', 'Mesure la distance aux obstacles (2 cm à 4 m).', 'It sends a 40 kHz chirp and times the echo: distance = speed of sound × time / 2.', 'Il envoie un son à 40 kHz et chronomètre l\'écho : distance = vitesse du son × temps / 2.')],
  imu: ['sen', 'imu', T('Accelerometer / gyroscope (IMU)', 'Accéléromètre / gyroscope (IMU)', 'MPU-6050, BNO085', 'MPU-6050, BNO085', 'Measures tilt, rotation and shocks: balance of humanoids and drones.', 'Mesure l\'inclinaison, la rotation et les chocs : équilibre des humanoïdes et des drones.', 'Tiny silicon masses on springs (MEMS) move with acceleration and rotation; the chip measures the change of capacitance.', 'De minuscules masses de silicium sur ressorts (MEMS) bougent avec l\'accélération et la rotation ; la puce mesure la variation de capacité.')],
  cam: ['adv', 'cam', T('Camera (2D vision)', 'Caméra (vision 2D)', 'Basler, Cognex, Raspberry Pi camera', 'Basler, Cognex, caméra Raspberry Pi', 'Finds parts, reads codes, checks quality.', 'Repère les pièces, lit les codes, contrôle la qualité.', 'A lens focuses the image on a sensor of millions of pixels; software finds shapes, colours and codes in it.', 'Un objectif forme l\'image sur un capteur de millions de pixels ; un logiciel y trouve formes, couleurs et codes.')],
  cam3d: ['adv', 'cam3d', T('3D camera (depth)', 'Caméra 3D (profondeur)', 'Intel RealSense, Zivid, Photoneo', 'Intel RealSense, Zivid, Photoneo', 'Sees the shape and distance of objects: bin picking, obstacles.', 'Voit la forme et la distance des objets : dévracage, obstacles.', 'Two cameras (stereo) or a projected light pattern give the distance of every pixel: a 3D point cloud.', 'Deux caméras (stéréo) ou un motif lumineux projeté donnent la distance de chaque pixel : un nuage de points 3D.')],
  ft: ['adv', 'ft', T('Force / torque sensor', 'Capteur d\'effort (force / couple)', 'ATI Axia, Robotiq FT 300', 'ATI Axia, Robotiq FT 300', 'Feels forces at the wrist: assembly, polishing, hand guiding.', 'Sent les efforts au poignet : assemblage, polissage, guidage à la main.', 'Strain gauges glued on a metal cross change resistance when it bends: 3 forces + 3 torques.', 'Des jauges de contrainte collées sur une croix en métal changent de résistance quand elle fléchit : 3 forces + 3 couples.')],
  fsr: ['sen', 'fsr', T('Force sensor (pad)', 'Capteur de force (pastille)', 'FSR 402, load cells under the feet', 'FSR 402, cellules de charge sous les pieds', 'Feels contact and pressure: feet of humanoids, fingers of grippers.', 'Sent le contact et la pression : pieds des humanoïdes, doigts des pinces.', 'Pressing the pad lowers its resistance; the board reads it as a voltage.', 'Appuyer sur la pastille baisse sa résistance ; la carte la lit comme une tension.')],
  lidar: ['adv', 'lidar', T('LiDAR (laser range finder)', 'Télémètre laser (LiDAR)', 'RPLIDAR A2, Sick TiM, Ouster', 'RPLIDAR A2, Sick TiM, Ouster', 'Maps the room and sees obstacles all around.', 'Cartographie la pièce et voit les obstacles tout autour.', 'A spinning laser measures thousands of distances per second (time of flight): a 360° slice of the world.', 'Un laser qui tourne mesure des milliers de distances par seconde (temps de vol) : une tranche du monde à 360°.')],
  gps: ['sen', 'gps', T('GPS / GNSS module', 'Module GPS / GNSS', 'u-blox M8N, RTK modules', 'u-blox M8N, modules RTK', 'Gives the position outdoors (drones, field robots).', 'Donne la position en extérieur (drones, robots agricoles).', 'It times signals from 4 or more satellites; RTK corrections bring it to 2 cm.', 'Il chronomètre les signaux de 4 satellites ou plus ; les corrections RTK le ramènent à 2 cm.')],
  pcb: ['brd', 'pcb', T('Control board (PCB)', 'Carte électronique (PCB)', 'Axis board, I/O board, carrier boards', 'Carte d\'axe, carte d\'entrées/sorties, cartes support', 'Processes the signals and drives the motors.', 'Traite les signaux et pilote les moteurs.', 'Copper tracks connect chips, connectors and power parts: it reads sensors, filters signals and switches outputs.', 'Des pistes de cuivre relient puces, connecteurs et composants de puissance : elle lit les capteurs, filtre les signaux et commute les sorties.')],
  mcu: ['brd', 'mcu', T('Microcontroller', 'Microcontrôleur', 'Arduino, STM32, ESP32', 'Arduino, STM32, ESP32', 'Runs fast, simple loops: reading sensors, PWM for motors.', 'Exécute des boucles rapides et simples : lecture des capteurs, PWM des moteurs.', 'A small computer on one chip: it repeats its program thousands of times per second with exact timing.', 'Un petit ordinateur sur une puce : il répète son programme des milliers de fois par seconde avec un timing exact.')],
  sbc: ['brd', 'sbc', T('Processor board', 'Processeur (carte)', 'Raspberry Pi, industrial PC', 'Raspberry Pi, PC industriel', 'Runs Linux and ROS: maps, paths, user interface.', 'Fait tourner Linux et ROS : cartes, trajets, interface.', 'A full computer on a credit-card board: it plans, the microcontroller executes.', 'Un vrai ordinateur sur une carte de la taille d\'une carte bancaire : il planifie, le microcontrôleur exécute.')],
  ai: ['brd', 'ai', T('AI processing unit', 'Unité de traitement IA', 'NVIDIA Jetson Orin', 'NVIDIA Jetson Orin', 'Runs neural networks: recognise objects, people, gestures.', 'Fait tourner des réseaux de neurones : reconnaître objets, personnes, gestes.', 'A GPU with thousands of small cores computes the network in parallel, tens of images per second; the fan and heatsink take the heat away.', 'Un GPU à milliers de petits cœurs calcule le réseau en parallèle, des dizaines d\'images par seconde ; ventilateur et dissipateur évacuent la chaleur.')],
  driver: ['drv', 'driver', T('Motor driver board', 'Driver moteur (carte)', 'L298N, VESC, ODrive, TMC2209', 'L298N, VESC, ODrive, TMC2209', 'Turns a small command into the strong current a motor needs.', 'Transforme une petite commande en fort courant pour le moteur.', 'Power transistors switch the battery voltage on and off very fast (PWM); the average sets the speed, the order sets the direction.', 'Des transistors de puissance commutent la tension très vite (PWM) ; la moyenne règle la vitesse, l\'ordre règle le sens.')],
  drive: ['drv', 'drive', T('Servo drive', 'Variateur (servo drive)', 'Yaskawa, Siemens Sinamics, Beckhoff AX', 'Yaskawa, Siemens Sinamics, Beckhoff AX', 'Precise control of each motor: current, speed, position.', 'Commande précise de chaque moteur : courant, vitesse, position.', 'It reads the encoder, compares with the order from the controller and adjusts the 3-phase current 20 000 times per second.', 'Il lit le codeur, compare à l\'ordre du contrôleur et ajuste le courant triphasé 20 000 fois par seconde.')],
  esc: ['drv', 'esc', T('ESC (speed controller)', 'ESC (contrôleur de vitesse)', '4-in-1 ESC, BLHeli', 'ESC 4-en-1, BLHeli', 'Drives each propeller motor of a drone.', 'Pilote chaque moteur d\'hélice d\'un drone.', 'Switches the three phases of a brushless motor in the right order, hundreds of times per second.', 'Commute les trois phases d\'un moteur sans balais dans le bon ordre, des centaines de fois par seconde.')],
  radio: ['com', 'radio', T('Bluetooth / Wi-Fi module', 'Module Bluetooth / Wi-Fi', 'ESP32, HC-05', 'ESP32, HC-05', 'Wireless link to a phone, a tablet or the network.', 'Liaison sans fil avec un téléphone, une tablette ou le réseau.', 'A radio chip and a printed antenna exchange data at 2.4 GHz.', 'Une puce radio et une antenne imprimée échangent des données à 2,4 GHz.')],
  router: ['com', 'router', T('Wi-Fi / network', 'Wi-Fi / réseau', 'Industrial access point, 5G', 'Point d\'accès industriel, 5G', 'Connects the robots to the fleet manager and the factory.', 'Relie les robots au gestionnaire de flotte et à l\'usine.', 'Missions, maps and status travel over the network; safety never depends on it.', 'Missions, cartes et états passent par le réseau ; la sécurité n\'en dépend jamais.')],
  bus: ['com', 'bus', T('Industrial network (fieldbus)', 'Réseau industriel (bus de terrain)', 'EtherCAT, PROFINET, EtherNet/IP, Modbus', 'EtherCAT, PROFINET, EtherNet/IP, Modbus', 'Links the controller, the drives and the sensors.', 'Relie le contrôleur, les variateurs et les capteurs.', 'Ethernet cables with a real-time protocol: every millisecond, all positions and orders are exchanged at the same instant.', 'Des câbles Ethernet avec un protocole temps réel : chaque milliseconde, toutes les positions et consignes sont échangées au même instant.')],
  harness: ['com', 'harness', T('Power and signal cable', 'Câble d\'alimentation et de communication', 'Robot dress pack, drag chain', 'Habillage robot, chaîne porte-câbles', 'Brings power and signals along the arm.', 'Amène la puissance et les signaux le long du bras.', 'Very flexible cables in a protective hose, built to bend millions of times.', 'Des câbles très souples dans une gaine de protection, faits pour plier des millions de fois.')],
  cabinet: ['ctl', 'cabinet', T('Robot controller (cabinet)', 'Contrôleur robot (armoire)', 'KUKA KR C5, ABB OmniCore, FANUC R-30iB', 'KUKA KR C5, ABB OmniCore, FANUC R-30iB', 'The brain: runs the program and plans every movement.', 'Le cerveau : exécute le programme et planifie chaque mouvement.', 'It computes the path and the inverse kinematics, then sends each drive a new position every millisecond.', 'Il calcule la trajectoire et la cinématique inverse, puis envoie une nouvelle position à chaque variateur toutes les millisecondes.')],
  plc: ['ctl', 'plc', T('PLC (automate)', 'Automate (PLC)', 'Siemens S7-1500, Allen-Bradley, Schneider', 'Siemens S7-1500, Allen-Bradley, Schneider', 'Runs the cell: conveyors, sensors, sequence, talks to the robot.', 'Gère la cellule : convoyeurs, capteurs, séquence, dialogue avec le robot.', 'It reads all inputs, runs its program, then writes all outputs, in a cycle of a few milliseconds.', 'Il lit toutes les entrées, exécute son programme, puis écrit toutes les sorties, en un cycle de quelques millisecondes.')],
  pendant: ['ctl', 'pendant', T('Teach pendant', 'Pupitre de programmation', 'KUKA smartPAD, ABB FlexPendant', 'KUKA smartPAD, ABB FlexPendant', 'To move the robot by hand and write its program.', 'Pour bouger le robot à la main et écrire son programme.', 'A touch screen with jog keys, an emergency stop and a three-position enabling switch at the back.', 'Un écran tactile avec touches de déplacement, un arrêt d\'urgence et un bouton d\'homme mort à 3 positions au dos.')],
  psu: ['pow', 'psu', T('Power supply', 'Alimentation', '24 V / 48 V DC, Mean Well, Phoenix', '24 V / 48 V continu, Mean Well, Phoenix', 'Gives the right voltage to boards, sensors and brakes.', 'Donne la bonne tension aux cartes, capteurs et freins.', 'A switching converter turns the 230 V mains into a stable, safe low voltage.', 'Un convertisseur à découpage transforme le 230 V du secteur en basse tension stable et sûre.')],
  battery: ['pow', 'battery', T('Battery + BMS', 'Batterie + BMS', 'Li-ion / LiFePO4 24–48 V packs', 'Packs Li-ion / LiFePO4 24–48 V', 'Energy for mobile robots, drones, humanoids.', 'Énergie des robots mobiles, drones, humanoïdes.', 'Cells in series give the voltage, in parallel the capacity; the BMS board balances and protects them.', 'Les cellules en série donnent la tension, en parallèle la capacité ; la carte BMS les équilibre et les protège.')],
  heatsink: ['pow', 'heatsink', T('Heatsink', 'Dissipateur thermique', 'Aluminium fins, fans', 'Ailettes en aluminium, ventilateurs', 'Keeps drives and processors cool.', 'Garde variateurs et processeurs au frais.', 'Many thin fins give a large surface: heat flows into the air.', 'De nombreuses ailettes minces offrent une grande surface : la chaleur passe dans l\'air.')],
  gripper: ['tool', 'gripper', T('Gripper', 'Pince', 'Schunk, Robotiq 2F-85, OnRobot', 'Schunk, Robotiq 2F-85, OnRobot', 'Holds the parts.', 'Tient les pièces.', 'Two fingers driven by an electric motor or compressed air close on the part; sensors confirm the grip.', 'Deux doigts entraînés par un moteur électrique ou de l\'air comprimé se ferment sur la pièce ; des capteurs confirment la prise.')],
  vacuum: ['tool', 'vacuum', T('Vacuum cup', 'Ventouse', 'Piab, Schmalz', 'Piab, Schmalz', 'Picks boxes, sheets, glass.', 'Prend cartons, tôles, verre.', 'A venturi makes a vacuum under the cup: the air pressure outside holds the part.', 'Un venturi fait le vide sous la ventouse : la pression de l\'air extérieur tient la pièce.')],
  cyl: ['act', 'cyl', T('Pneumatic cylinder', 'Vérin pneumatique', 'Festo DSNU, SMC', 'Festo DSNU, SMC', 'Fast push / pull moves: clamps, stoppers, grippers.', 'Mouvements rapides de poussée / traction : brides, butées, pinces.', 'Compressed air pushes a piston one way or the other; a valve chooses the side.', 'L\'air comprimé pousse un piston dans un sens ou dans l\'autre ; un distributeur choisit le côté.')],
  estop: ['saf', 'estop', T('Emergency stop', 'Arrêt d\'urgence', 'Red mushroom button on yellow', 'Bouton coup-de-poing rouge sur fond jaune', 'Stops everything at once.', 'Arrête tout immédiatement.', 'It opens a safety circuit with two contacts: the safety relay cuts the motor power and the brakes close.', 'Il ouvre un circuit de sécurité à deux contacts : le relais de sécurité coupe la puissance et les freins se serrent.')],
  curtain: ['saf', 'curtain', T('Light curtain', 'Barrière immatérielle', 'Sick deTec, Keyence GL-R', 'Sick deTec, Keyence GL-R', 'Stops the robot when someone enters the cell.', 'Arrête le robot quand quelqu\'un entre dans la cellule.', 'Rows of infrared beams between two bars: one cut beam = safety stop.', 'Des rangées de faisceaux infrarouges entre deux barres : un faisceau coupé = arrêt de sécurité.')],
  scanner: ['saf', 'scanner', T('Safety laser scanner', 'Scanner laser de sécurité', 'Sick microScan3, Keyence SZ', 'Sick microScan3, Keyence SZ', 'Watches zones around robots and AMRs: slow down, then stop.', 'Surveille des zones autour des robots et des AMR : ralentir, puis arrêter.', 'A certified laser scanner with warning and protective fields that change with speed.', 'Un scanner laser certifié avec des champs d\'alerte et de protection qui changent avec la vitesse.')],
  bumper: ['saf', 'bumper', T('Safety bumper', 'Pare-chocs de sécurité', 'Soft edge with switch', 'Bord souple avec contact', 'Last protection of a mobile robot: touch = stop.', 'Dernière protection d\'un robot mobile : contact = arrêt.', 'A soft edge closes a switch when pressed, which stops the motors.', 'Un bord souple ferme un contact quand on l\'écrase, ce qui arrête les moteurs.')],
  struct: ['str', 'struct', T('Arm, column, frame', 'Bras, colonne, bâti', 'Cast aluminium links, steel base, profiles', 'Segments en aluminium moulé, base en acier, profilés', 'Carries the load and keeps the precision.', 'Porte la charge et garde la précision.', 'Stiff and light parts: the stiffer the structure, the less it bends and vibrates.', 'Des pièces rigides et légères : plus la structure est rigide, moins elle fléchit et vibre.')],
  chassis: ['str', 'chassis', T('Chassis', 'Châssis', 'Aluminium profiles, welded steel', 'Profilés aluminium, acier soudé', 'Holds everything together on a mobile robot.', 'Tient tout ensemble sur un robot mobile.', 'A frame that carries the battery, the boards and the drive units, and takes the shocks.', 'Un cadre qui porte la batterie, les cartes et les blocs moteurs, et encaisse les chocs.')],
  enclosure: ['str', 'enclosure', T('Enclosure', 'Boîtier', 'IP54 / IP65 boxes', 'Boîtiers IP54 / IP65', 'Protects the electronics from dust, water and hands.', 'Protège l\'électronique de la poussière, de l\'eau et des mains.', 'A sealed box with cable glands; the IP code says how well it is sealed.', 'Une boîte étanche avec presse-étoupes ; le code IP indique son étanchéité.')],
  wheel: ['str', 'wheel', T('Wheels', 'Roues', 'Polyurethane drive wheels, casters, mecanum', 'Roues motrices en polyuréthane, roulettes, mecanum', 'Make the robot move on the floor.', 'Font avancer le robot sur le sol.', 'Two motor wheels at different speeds turn the robot; casters carry the rest.', 'Deux roues motrices à vitesses différentes font tourner le robot ; des roulettes portent le reste.')],
  track: ['str', 'track', T('Tracks', 'Chenilles', 'Rubber tracks for rough ground', 'Chenilles caoutchouc pour terrain difficile', 'Grip on rough ground and stairs.', 'Accrochent sur terrain difficile et escaliers.', 'A long contact with the ground spreads the weight; the robot turns by skidding.', 'Un long contact avec le sol répartit le poids ; le robot tourne en dérapant.')],
  prop: ['act', 'prop', T('Brushless motor + propeller', 'Moteur sans balais + hélice', '2306 motors, 5" props', 'Moteurs 2306, hélices 5"', 'Lift and steer a drone.', 'Soulèvent et dirigent un drone.', 'Thrust grows with the square of the speed; changing the speed of each motor tilts and turns the drone.', 'La poussée croît avec le carré de la vitesse ; changer la vitesse de chaque moteur incline et tourne le drone.')],
  dc: ['act', 'dc', T('DC gearmotor', 'Motoréducteur à courant continu', 'Pololu, JGA25', 'Pololu, JGA25', 'Simple motor for small wheels and mechanisms.', 'Moteur simple pour petites roues et mécanismes.', 'Voltage sets the speed, polarity the direction; the small gearbox gives torque.', 'La tension règle la vitesse, la polarité le sens ; le petit réducteur donne le couple.')],
  hobby: ['act', 'hobby', T('Servomotor (hobby / smart)', 'Servomoteur (modélisme / intelligent)', 'MG996R, Dynamixel', 'MG996R, Dynamixel', 'Joints of small humanoids and grippers.', 'Articulations des petits humanoïdes et pinces.', 'Motor + gearbox + position sensor + board in one box: you send an angle, it goes there and holds it.', 'Moteur + réducteur + capteur de position + carte dans un boîtier : on envoie un angle, il y va et le tient.')],
  laptop: ['sw', 'laptop', T('Programming and simulation software', 'Logiciels : programmation, simulation', 'ROS 2, RoboDK, RobotStudio, MoveIt', 'ROS 2, RoboDK, RobotStudio, MoveIt', 'Write, test and simulate the program before running it.', 'Écrire, tester et simuler le programme avant de le lancer.', 'The cell is simulated in 3D to check reach and collisions; the program is then sent to the controller.', 'La cellule est simulée en 3D pour vérifier la portée et les collisions ; le programme est ensuite envoyé au contrôleur.')],
  pid: ['sw', 'pid', T('Control loop (PID)', 'Système de contrôle (PID)', 'Current, speed and position loops', 'Boucles de courant, de vitesse et de position', 'Makes every axis reach its target without overshoot.', 'Fait atteindre sa consigne à chaque axe sans dépassement.', 'Error = target − measure. Command = Kp·error + Ki·(sum of errors) + Kd·(change of error), recomputed every millisecond.', 'Erreur = consigne − mesure. Commande = Kp·erreur + Ki·(somme des erreurs) + Kd·(variation de l\'erreur), recalculée chaque milliseconde.')],
  cables: ['com', 'cables', T('Cables and connectors', 'Câbles et connecteurs', 'M8/M12 sensor plugs, JST, XT60', 'Connecteurs capteurs M8/M12, JST, XT60', 'Carry power and signals between all parts.', 'Transportent puissance et signaux entre toutes les pièces.', 'Colour codes and keyed connectors avoid mistakes; shielded cables keep the signals clean.', 'Codes couleur et connecteurs détrompés évitent les erreurs ; les câbles blindés gardent les signaux propres.')],
  mot3: ['act', 'mot3', T('Joint motor (BLDC)', 'Moteur d\'articulation (BLDC)', 'Frameless torque motors, T-Motor', 'Moteurs couple sans carter, T-Motor', 'Moves the legs and arms of humanoids and legged robots.', 'Fait bouger les jambes et les bras des humanoïdes et robots à pattes.', 'A flat brushless motor with high torque, often with a small gearbox: fast and back-drivable.', 'Un moteur plat sans balais à fort couple, souvent avec un petit réducteur : rapide et réversible.')]
};
// which parts, where on the bench (x, z), for each set; and the cables between them
const SETS = {
  arm: {
    parts: [['cam', -1.9, -0.75], ['cam3d', -1.9, -0.3], ['ft', -1.9, 0.15], ['prox', -1.9, 0.6], ['photo', -1.55, 0.6],
      ['cabinet', -0.85, -0.55], ['plc', -0.85, 0.2], ['pendant', -0.85, 0.75], ['pcb', -0.3, 0.75], ['pid', -0.3, -0.85],
      ['psu', 0.15, -0.75], ['drive', 0.15, -0.2], ['bus', 0.15, 0.35], ['harness', 0.15, 0.85],
      ['servo', 0.85, -0.7], ['stepper', 0.85, -0.25], ['brake', 0.85, 0.2], ['enc', 0.85, 0.6],
      ['harmonic', 1.45, -0.7], ['rv', 1.45, -0.2], ['struct', 1.5, 0.3], ['gripper', 1.95, 0.75], ['vacuum', 1.5, 0.8],
      ['estop', -1.4, 1.35], ['curtain', -0.6, 1.35], ['laptop', 0.35, 1.35], ['cyl', 1.1, 1.35]],
    wires: [['cam', 'plc', 'sig'], ['cam3d', 'cabinet', 'sig'], ['ft', 'cabinet', 'sig'], ['prox', 'plc', 'sig'], ['photo', 'plc', 'sig'],
      ['plc', 'cabinet', 'bus'], ['cabinet', 'drive', 'bus'], ['pendant', 'cabinet', 'sig'], ['laptop', 'cabinet', 'bus'], ['bus', 'drive', 'bus'],
      ['psu', 'cabinet', 'pow'], ['psu', 'drive', 'pow'], ['drive', 'servo', 'mot'], ['drive', 'stepper', 'mot'], ['enc', 'drive', 'fb'], ['drive', 'brake', 'pow'],
      ['servo', 'harmonic', 'mech'], ['stepper', 'rv', 'mech'], ['rv', 'struct', 'mech'], ['harmonic', 'struct', 'mech'], ['struct', 'gripper', 'mech'], ['plc', 'cyl', 'sig'],
      ['estop', 'cabinet', 'safe'], ['curtain', 'plc', 'safe']]
  },
  mobile: {
    parts: [['lidar', -1.9, -0.75], ['cam3d', -1.9, -0.3], ['us', -1.9, 0.15], ['imu', -1.9, 0.55], ['cam', -1.5, -0.75], ['prox', -1.5, 0.55], ['gps', -1.5, 0.15],
      ['ai', -0.85, -0.7], ['sbc', -0.85, -0.2], ['mcu', -0.85, 0.3], ['pcb', -0.85, 0.75], ['radio', -0.4, 0.3], ['router', -0.35, -0.75],
      ['battery', 0.2, -0.7], ['driver', 0.2, -0.15], ['heatsink', 0.2, 0.35], ['cables', 0.2, 0.8],
      ['dc', 0.95, -0.7], ['planet', 0.95, -0.2], ['enc', 0.95, 0.3], ['hobby', 0.95, 0.75], ['stepper', 1.45, 0.75],
      ['wheel', 1.6, -0.65], ['track', 1.6, -0.1], ['chassis', 1.6, 0.4], ['enclosure', 2.0, 0.75],
      ['bumper', -1.4, 1.35], ['scanner', -0.75, 1.35], ['estop', -0.2, 1.35], ['laptop', 0.45, 1.35], ['pid', 1.15, 1.35], ['cyl', 1.75, 1.35]],
    wires: [['lidar', 'sbc', 'sig'], ['cam3d', 'ai', 'sig'], ['cam', 'ai', 'sig'], ['us', 'mcu', 'sig'], ['imu', 'mcu', 'sig'], ['prox', 'mcu', 'sig'], ['gps', 'sbc', 'sig'],
      ['ai', 'sbc', 'bus'], ['sbc', 'mcu', 'bus'], ['router', 'sbc', 'bus'], ['radio', 'mcu', 'bus'], ['laptop', 'router', 'bus'],
      ['battery', 'driver', 'pow'], ['battery', 'pcb', 'pow'], ['pcb', 'mcu', 'pow'], ['mcu', 'driver', 'bus'], ['driver', 'dc', 'mot'], ['driver', 'stepper', 'mot'], ['mcu', 'hobby', 'mot'],
      ['enc', 'mcu', 'fb'], ['dc', 'planet', 'mech'], ['planet', 'wheel', 'mech'], ['wheel', 'chassis', 'mech'], ['track', 'chassis', 'mech'],
      ['bumper', 'mcu', 'safe'], ['scanner', 'driver', 'safe'], ['estop', 'driver', 'safe']]
  }
};
SETS.humanoid = { parts: SETS.mobile.parts.map((p) => (p[0] === 'track' ? ['mot3', p[1], p[2]] : p[0] === 'wheel' ? ['fsr', p[1], p[2]] : p[0] === 'gps' ? ['ft', p[1], p[2]] : p)),
  wires: SETS.mobile.wires.map((w) => w.map((x) => (x === 'track' ? 'mot3' : x === 'wheel' ? 'fsr' : x === 'gps' ? 'ft' : x))).concat([['driver', 'mot3', 'mot']]) };
SETS.drone = { parts: SETS.mobile.parts.filter((p) => !['bumper', 'track', 'hobby', 'cyl'].includes(p[0])).map((p) => (p[0] === 'wheel' ? ['prop', p[1], p[2]] : p[0] === 'driver' ? ['esc', p[1], p[2]] : p)),
  wires: SETS.mobile.wires.filter((w) => !w.some((x) => ['bumper', 'track', 'hobby'].includes(x))).map((w) => w.map((x) => (x === 'wheel' ? 'prop' : x === 'driver' ? 'esc' : x))).concat([['esc', 'prop', 'mot']]) };
SETS.cobot = { parts: SETS.arm.parts.map((p) => (p[0] === 'curtain' ? ['scanner', p[1], p[2]] : p)), wires: SETS.arm.wires.map((w) => w.map((x) => (x === 'curtain' ? 'scanner' : x))) };
const WIRE = { sig: ['#1aa0c8', L('sensor signals', 'signaux capteurs')], bus: ['#f1c40f', L('network / fieldbus', 'réseau / bus de terrain')], pow: ['#e5484d', L('power', 'alimentation')],
  mot: ['#ff8a2a', L('motor current', 'courant moteur')], fb: ['#30c67c', L('encoder feedback', 'retour codeur')], mech: ['#9aa5b1', L('mechanical link', 'liaison mécanique')], safe: ['#111111', L('safety loop', 'boucle de sécurité')] };
const FLOW = [
  [['sig'], L('1. The sensors measure the world and send their signals', '1. Les capteurs mesurent le monde et envoient leurs signaux')],
  [['bus'], L('2. The controller decides: it plans the motion and sends the orders on the network', '2. Le contrôleur décide : il planifie le mouvement et envoie les consignes sur le réseau')],
  [['pow', 'mot'], L('3. The drives take power and feed exactly the right current to the motors', '3. Les variateurs prennent l\'énergie et envoient exactement le bon courant aux moteurs')],
  [['mech'], L('4. Motors and gearboxes move the structure and the tool: the robot moves', '4. Moteurs et réducteurs font bouger la structure et l\'outil : le robot bouge')],
  [['fb'], L('5. The encoders send the real position back: the loop is closed, and it starts again', '5. Les codeurs renvoient la position réelle : la boucle est fermée, et tout recommence')]
];

// ---------------------------------------------------------------- the assembled robot, with the place ("slot") of each component
function armJoints(h1, L2, L3, L4, f) {                       // joint positions of the 6-axis model for a flange point f (z = 0)
  const wy = f.y + L4, zz = wy - h1, D = (f.x * f.x + zz * zz - L2 * L2 - L3 * L3) / (2 * L2 * L3), a3 = -Math.acos(D), a2 = Math.atan2(zz, f.x) + Math.atan2(L3 * Math.sin(-a3), L2 + L3 * D);
  return { sh: V(0, h1, 0), el: V(L2 * Math.cos(a2), h1 + L2 * Math.sin(a2), 0), wr: V(f.x, wy, 0), fl: V(f.x, f.y, 0) };
}
function withGripper(g, at) { const gr = B.gripper(); gr.position.copy(at).add(V(0, -0.135, 0)); g.add(gr); }
function humanoidModel() {
  const g = new THREE.Group(), W = C.white, D = C.dark;
  g.add(cy(0.3, 0.1, D, 0, 0.03)); for (const x of [-0.28, 0.28]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 24).rotateZ(Math.PI / 2), C.rubber); w.position.set(x, 0.08, 0); g.add(w); }
  for (const x of [-0.1, 0.1]) { g.add(cy(0.06, 0.32, W, x, 0.16)); { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), D); sp.position.set(x, 0.5, 0.02); g.add(sp); } g.add(cy(0.065, 0.32, W, x, 0.52)); g.add(bx(0.11, 0.05, 0.18, D, x, 0.13, 0.04)); }
  g.add(bx(0.32, 0.1, 0.2, D, 0, 0.82)); g.add(bx(0.42, 0.44, 0.24, W, 0, 0.9)); g.add(bx(0.22, 0.18, 0.02, D, 0, 1.06, 0.12)); g.add(bx(0.03, 0.03, 0.005, C.cyan, 0, 1.2, 0.125));
  g.add(cy(0.05, 0.06, D, 0, 1.34)); const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), W); head.position.set(0, 1.5, 0); g.add(head); const visor = new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 12, -1.1, 2.2, 1.1, 0.9), C.black); visor.position.set(0, 1.5, 0.02); g.add(visor);
  for (const sx of [-1, 1]) { { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), D); sp.position.set(sx * 0.26, 1.28, 0); g.add(sp); } const up = cy(0.045, 0.24, W, sx * 0.28, 1.02); g.add(up); { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), D); sp.position.set(sx * 0.29, 1.0, 0); g.add(sp); } g.add(cy(0.04, 0.22, W, sx * 0.3, 0.77)); g.add(bx(0.06, 0.09, 0.04, D, sx * 0.31, 0.67, 0.01)); }
  return { g, slots: { head: V(0, 1.52, 0.11), chest: V(0, 1.12, 0.13), torso: V(0, 1.05, 0), back: V(0, 1.1, -0.13), shoulder: V(0.27, 1.28, 0), wrist: V(0.3, 0.8, 0.02), hand: V(0.31, 0.7, 0.03), hip: V(0.1, 0.85, 0.05), knee: V(0.1, 0.5, 0.07), foot: V(0.1, 0.16, 0.1), base: V(0, 0.1, 0.28), wheel: V(0.29, 0.08, 0) } };
}
function droneModel() {
  const g = new THREE.Group(); g.add(bx(0.24, 0.07, 0.24, C.dark, 0, 0.1)); g.add(bx(0.2, 0.05, 0.12, C.blue, 0, 0.17));
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const arm = bx(0.4, 0.025, 0.04, C.black, x * 0.17, 0.12, z * 0.17); arm.rotation.y = -Math.atan2(z, x); g.add(arm); g.add(cy(0.035, 0.05, C.dark, x * 0.31, 0.13, z * 0.31)); const p = bx(0.26, 0.004, 0.025, C.black, x * 0.31, 0.19, z * 0.31); p.rotation.y = x * z; g.add(p); g.add(bx(0.015, 0.1, 0.015, C.dark, x * 0.1, 0, z * 0.1)); }
  g.add(cy(0.006, 0.12, C.dark, 0, 0.17, -0.06)); g.add(cy(0.03, 0.01, C.cream, 0, 0.29, -0.06)); g.add(bx(0.06, 0.05, 0.06, C.black, 0, 0.03, 0.12)); g.add(cyZ(0.018, 0.02, C.lens, 0, 0.055, 0.15));
  g.scale.setScalar(1.6);
  const S = (x, y, z) => V(x, y, z);   // slots are in the model's own coordinates (its scale is applied by localToWorld)
  return { g, slots: { center: S(0, 0.13, 0), top: S(0, 0.2, 0), mast: S(0, 0.29, -0.06), front: S(0, 0.05, 0.15), bottom: S(0, 0.08, 0), arm: S(0.18, 0.13, 0.18), motor: S(0.31, 0.15, 0.31), prop: S(0.31, 0.2, -0.31) } };
}
function stewartModel() {
  const g = new THREE.Group(); g.add(cy(0.45, 0.06, C.dark)); g.add(cy(0.3, 0.05, C.orange, 0, 0.66));
  for (let i = 0; i < 6; i++) { const a = (Math.floor(i / 2) * 2 * Math.PI) / 3 + (i % 2 ? 0.3 : -0.3), b2 = (Math.floor(((i + 1) % 6) / 2) * 2 * Math.PI) / 3 + 1.05 * (i % 2 ? -1 : 1) * 0;
    const P0 = V(Math.cos(a) * 0.4, 0.07, Math.sin(a) * 0.4), P1 = V(Math.cos(a + (i % 2 ? 0.75 : -0.75)) * 0.26, 0.66, Math.sin(a + (i % 2 ? 0.75 : -0.75)) * 0.26);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 12), C.alu), d = P1.clone().sub(P0); leg.position.copy(P0).addScaledVector(d, 0.5); leg.scale.y = d.length(); leg.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(leg); void b2; }
  return { g, slots: { base: V(0, 0.04, 0.3), j1: V(0.4, 0.08, 0.05), j2: V(0.33, 0.36, 0.12), j3: V(0.25, 0.64, 0.08), wrist: V(0, 0.69, 0), tool: V(0, 0.8, 0), link: V(-0.3, 0.36, 0.15), cable: V(-0.42, 0.08, 0.1) } };
}
function makeRobot(key) {
  let g, slots;
  if (key === 'six' || key === 'cobot') {
    const P = key === 'cobot' ? { h1: 0.3, L2: 0.42, L3: 0.38, L4: 0.11, r: 0.055, style: 'cobot' } : { h1: 0.45, L2: 0.5, L3: 0.5, L4: 0.14, r: 0.075 }, f = key === 'cobot' ? V(0.45, 0.38, 0) : V(0.55, 0.52, 0);
    const r = articulated(P); r.reach(f); g = new THREE.Group(); g.add(r.root); withGripper(g, f); const j = armJoints(P.h1, P.L2, P.L3, P.L4, f);
    slots = { base: V(0, 0.04, 0.15), j1: V(0, P.h1 * 0.55, 0.1), j2: j.sh.clone().add(V(0, 0, 0.1)), j3: j.el.clone().add(V(0, 0, 0.08)), wrist: j.wr.clone().add(V(0, 0, 0.06)), tool: j.fl.clone().add(V(0, -0.1, 0.03)), link: j.sh.clone().lerp(j.el, 0.5), cable: j.sh.clone().lerp(j.el, 0.5).add(V(-0.08, 0, -0.06)) };
  } else if (key === 'scara') {
    const H = 0.42, L1 = 0.34, L2 = 0.3, f = V(0.45, 0.2, -0.25), r = scara({ H, L1, L2, r: 0.045, lo: 0.04, hi: 0.4 }); r.reach(f); g = new THREE.Group(); g.add(r.root); withGripper(g, f);
    const x = f.x, y = -f.z, D = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2), t2 = Math.acos(D), t1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * D);
    const j2 = V(L1 * Math.cos(t1), H + 0.05, -L1 * Math.sin(t1));
    slots = { base: V(0, 0.04, 0.1), j1: V(0, H, 0.06), j2, j3: V(f.x, H + 0.1, f.z), wrist: V(f.x, f.y + 0.02, f.z), tool: V(f.x, f.y - 0.1, f.z), link: V(0, H, 0).lerp(j2, 0.5), cable: V(0, H + 0.12, -0.05) };
  } else if (key === 'delta') {
    const Ht = 0.8, Rb = 0.13, r = delta({ Ht, Rb, rf: 0.25, re: 0.66, Re: 0.045, r: 0.03 }); r.reach(V(0, 0.25, 0)); g = new THREE.Group(); g.add(r.root); withGripper(g, V(0, 0.25, 0));
    const p1 = (2 * Math.PI) / 3 + Math.PI / 2;
    slots = { base: V(0, Ht + 0.06, 0), j1: V(0, Ht, -Rb), j2: V(Rb * Math.cos(p1), Ht, -Rb * Math.sin(p1)), j3: V(0, Ht - 0.12, -Rb - 0.2), wrist: V(0, 0.26, 0), tool: V(0, 0.15, 0), link: V(0, 0.5, -0.17), cable: V(0.1, Ht + 0.12, 0.1) };
  } else if (key === 'gantry') {
    const r = gantry({ W: 1.7, D: 1.3, Hg: 1.05, r: 0.05 }); r.reach(V(0.1, 0.3, 0)); g = new THREE.Group(); g.add(r.root); withGripper(g, V(0.1, 0.3, 0));
    slots = { base: V(-0.85, 0.5, 0.65), j1: V(-0.85, 1.11, 0.65), j2: V(0.1, 1.16, 0.6), j3: V(0.1, 1.16, 0), wrist: V(0.1, 0.32, 0), tool: V(0.1, 0.2, 0), link: V(0.1, 1.14, -0.35), cable: V(0.1, 1.3, 0.2) };
  } else if (key === 'stewart') { ({ g, slots } = stewartModel()); }
  else if (key === 'humanoid') { ({ g, slots } = humanoidModel()); }
  else if (key === 'quadrotor') { ({ g, slots } = droneModel()); }
  else { const a = makeAMR(0.9); g = new THREE.Group(); g.add(a); slots = { lidar: V(0.36, 0.34, 0), front: V(0.46, 0.18, 0), top: V(0, 0.35, 0), inside: V(0, 0.18, 0), wheel: V(0, 0.07, 0.3), side: V(0, 0.2, 0.32), bumper: V(0.46, 0.06, 0.1), back: V(-0.42, 0.25, 0) }; }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } });
  return { g, slots };
}
// which slot each component goes to, for each set (cell slots are around the robot)
const SLOT = {
  arm: { cam: 'tool', cam3d: 'camstand', ft: 'wrist', prox: 'conveyor', photo: 'conveyor', cabinet: 'cabinet', plc: 'cabinet', pendant: 'operator', pcb: 'cabinet', pid: 'cabinet', psu: 'cabinet', drive: 'cabinet', bus: 'cable', harness: 'cable',
    servo: 'j2', stepper: 'tool', brake: 'j2', enc: 'j3', harmonic: 'wrist', rv: 'j1', struct: 'link', gripper: 'tool', vacuum: 'tool', estop: 'panel', curtain: 'fence', scanner: 'fence', laptop: 'desk', cyl: 'conveyor' },
  mobile: { lidar: 'lidar', cam3d: 'front', us: 'front', imu: 'inside', cam: 'front', prox: 'side', gps: 'top', ai: 'inside', sbc: 'inside', mcu: 'inside', pcb: 'inside', radio: 'inside', router: 'pole', battery: 'inside', driver: 'inside',
    heatsink: 'inside', cables: 'inside', dc: 'wheel', planet: 'wheel', enc: 'wheel', hobby: 'top', stepper: 'top', wheel: 'wheel', track: 'wheel', chassis: 'inside', enclosure: 'top', bumper: 'bumper', scanner: 'front', estop: 'back', laptop: 'desk', pid: 'inside', cyl: 'top' },
  humanoid: { lidar: 'head', cam3d: 'head', us: 'chest', imu: 'chest', cam: 'head', prox: 'hand', ft: 'wrist', ai: 'back', sbc: 'back', mcu: 'torso', pcb: 'torso', radio: 'back', router: 'pole', battery: 'torso', driver: 'torso', heatsink: 'back', cables: 'shoulder',
    dc: 'wheel', planet: 'knee', enc: 'knee', hobby: 'hand', stepper: 'hand', fsr: 'foot', mot3: 'hip', chassis: 'torso', enclosure: 'torso', bumper: 'base', scanner: 'base', estop: 'back', laptop: 'desk', pid: 'torso', cyl: 'hand' },
  drone: { lidar: 'bottom', cam3d: 'front', us: 'bottom', imu: 'center', cam: 'front', prox: 'arm', gps: 'mast', ai: 'center', sbc: 'center', mcu: 'center', pcb: 'center', radio: 'center', router: 'pole', battery: 'top', esc: 'arm', heatsink: 'center', cables: 'arm',
    dc: 'motor', planet: 'motor', enc: 'motor', prop: 'prop', chassis: 'arm', enclosure: 'center', scanner: 'bottom', estop: 'desk', laptop: 'desk', pid: 'center', cyl: 'bottom' }
};
SLOT.cobot = SLOT.arm;
const WHERE = { operator: L('in the hands of the operator (teach pendant)', 'dans les mains de l\'opératrice (pupitre de programmation)'), j1: L('axis 1, in the base', 'axe 1, dans la base'), j2: L('the shoulder (axis 2)', 'l\'épaule (axe 2)'), j3: L('the elbow (axis 3)', 'le coude (axe 3)'), wrist: L('the wrist', 'le poignet'), tool: L('the tool, at the end of the arm', 'l\'outil, au bout du bras'),
  link: L('the arm itself', 'le bras lui-même'), cable: L('along the arm (cable hose)', 'le long du bras (gaine de câbles)'), base: L('the base', 'la base'), cabinet: L('in the controller cabinet next to the robot', 'dans l\'armoire de commande à côté du robot'),
  panel: L('on the cabinet, for the operator', 'sur l\'armoire, pour l\'opérateur'), desk: L('on the engineer\'s desk', 'sur le bureau de l\'ingénieur'), conveyor: L('on the conveyor that feeds the robot', 'sur le convoyeur qui alimente le robot'),
  camstand: L('on a stand above the work area', 'sur un support au-dessus de la zone de travail'), fence: L('at the entrance of the cell', 'à l\'entrée de la cellule'), pole: L('on the wall of the building', 'au mur du bâtiment'),
  lidar: L('on top, at the front', 'en haut, à l\'avant'), front: L('on the front face', 'sur la face avant'), top: L('on the top deck', 'sur le plateau'), inside: L('inside the body', 'à l\'intérieur du châssis'), wheel: L('in the drive wheels', 'dans les roues motrices'),
  side: L('on the sides', 'sur les côtés'), bumper: L('all around, at the bottom', 'tout autour, en bas'), back: L('at the back', 'à l\'arrière'), head: L('in the head', 'dans la tête'), chest: L('in the chest', 'dans la poitrine'), torso: L('in the torso', 'dans le torse'),
  shoulder: L('in the shoulders and arms', 'dans les épaules et les bras'), hand: L('in the hands', 'dans les mains'), hip: L('in the hips and legs', 'dans les hanches et les jambes'), knee: L('in the knees', 'dans les genoux'), foot: L('under the feet', 'sous les pieds'),
  center: L('in the centre body', 'dans le corps central'), mast: L('on the GPS mast', 'sur le mât GPS'), bottom: L('underneath', 'en dessous'), arm: L('in the arms', 'dans les bras'), motor: L('at the end of each arm', 'au bout de chaque bras'), prop: L('on top of each motor', 'sur chaque moteur') };

// ---------------------------------------------------------------- the widget
function mount(host) {
  const setName = host.dataset.set || 'arm', SET = SETS[setName]; if (!SET) return;
  const list = SET.parts.map(([id, x, z], i) => ({ id, x, z, n: i + 1, def: PARTS[id] }));
  host.innerHTML = `<div class="sys-stage"><div class="sys-pins"></div><div class="sys-flow" hidden></div>
      <div class="sys-ctl"><button type="button" class="sys-mode"></button><button type="button" class="sys-play">${L('▶ How it works', '▶ Comment ça marche')}</button><button type="button" class="sys-stop">${L('Emergency stop', 'Arrêt d\'urgence')}</button><button type="button" class="sys-all">${L('Overview', 'Vue d\'ensemble')}</button></div>
      <div class="sys-pop" hidden><button type="button" class="sys-x" aria-label="${L('Close', 'Fermer')}">×</button><div class="sys-pop-in"></div></div><p class="sys-hint">${L('Click a number or a part', 'Cliquez sur un numéro ou une pièce')}</p></div>
    <div class="sys-legend">${Object.entries(WIRE).map(([k, [c, n]]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}</div>
    <div class="sys-detail" hidden></div>
    <div class="sys-cats"></div>`;
  const stage = host.querySelector('.sys-stage'), pinsEl = host.querySelector('.sys-pins'), flowEl = host.querySelector('.sys-flow'), detail = host.querySelector('.sys-detail'), catsEl = host.querySelector('.sys-cats');
  const pop = host.querySelector('.sys-pop'); pop.querySelector('.sys-x').addEventListener('click', () => { if (sel) select(sel, false); });
  const playBtn = host.querySelector('.sys-play'), stopBtn = host.querySelector('.sys-stop'), allBtn = host.querySelector('.sys-all'), modeBtn = host.querySelector('.sys-mode');

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.01, 50);
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
  const orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.maxPolarAngle = Math.PI * 0.47; orbit.minDistance = 0.4; orbit.maxDistance = 9;
  scene.add(new THREE.HemisphereLight('#ffffff', '#5b6068', 1.15));
  const sun = new THREE.DirectionalLight('#ffffff', 1.9); sun.position.set(1.5, 4, 2.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 12 }); sun.shadow.bias = -0.0004; scene.add(sun);
  // the workbench: dark grey grid area on a light floor
  const bench = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.05, 3.3), M('#7d8691', { roughness: 0.95 })); bench.position.set(0.05, -0.025, 0.3); bench.receiveShadow = true; scene.add(bench);
  const grid = new THREE.GridHelper(4.8, 24, '#c3cad3', '#a3acb7'); grid.scale.z = 3.2 / 4.8; grid.position.set(0.05, 0.001, 0.3); scene.add(grid);
  // category zones painted on the bench
  const zone = (x, z, w, d, col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.12, depthWrite: false })); m.position.set(x, 0.002, z); scene.add(m); };
  const isLight = () => (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light';
  const paint = () => { const Lt = isLight(); scene.background = new THREE.Color(Lt ? '#d9dde3' : '#24272c'); bench.material.color.set(Lt ? '#7d8691' : '#33383f'); host.classList.toggle('light', Lt); };
  paint(); new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // place the parts
  const objs = {}, anchors = {};
  for (const p of list) {
    const o = B[p.def[1]](), sz = new THREE.Box3().setFromObject(o).getSize(V(0, 0, 0)), big = Math.max(sz.x, sz.y, sz.z);
    o.position.set(p.x, 0, p.z); o.scale.setScalar(Math.min(3.2, Math.max(1.2, 0.34 / big))); scene.add(o); objs[p.id] = o;   // small parts are shown bigger so every one is easy to see
    o.traverse((m) => { if (m.isMesh) { m.userData.part = p.id; m.castShadow = true; m.receiveShadow = true; } });
    const bb = new THREE.Box3().setFromObject(o); anchors[p.id] = { top: V(p.x, bb.max.y, p.z), mid: bb.getCenter(V(0, 0, 0)), r: bb.getSize(V(0, 0, 0)).length() };
    const c = CATS[p.def[0]]; const ring = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.19, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: c[1], transparent: true, opacity: 0.85 })); ring.position.set(p.x, 0.003, p.z); scene.add(ring); o.userData.ring = ring;
  }
  // the cables: a tube per wire, with pulses that travel along it
  const wires = [];
  for (const [a, b, type] of SET.wires) {
    if (!anchors[a] || !anchors[b]) continue;
    const A = V(anchors[a].mid.x, 0.02, anchors[a].mid.z), Bp = V(anchors[b].mid.x, 0.02, anchors[b].mid.z), mid = A.clone().lerp(Bp, 0.5); mid.y = 0.08 + A.distanceTo(Bp) * 0.12;
    const curve = new THREE.CatmullRomCurve3([A, A.clone().lerp(mid, 0.5).setY(mid.y * 0.8), mid, Bp.clone().lerp(mid, 0.5).setY(mid.y * 0.8), Bp]);
    const col = WIRE[type][0], tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, type === 'mech' ? 0.006 : 0.008, 8), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, transparent: true, opacity: type === 'mech' ? 0.5 : 0.9 }));
    tube.castShadow = true; scene.add(tube);
    const pulses = [0, 1, 2].map(() => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), new THREE.MeshBasicMaterial({ color: type === 'safe' ? '#ffd400' : col })); s.visible = false; scene.add(s); return s; });
    wires.push({ a, b, type, curve, tube, pulses, back: type === 'fb' });
  }

  // ------------------------------------------------ the assembled robot in its cell, behind the bench
  const RC = V(0.05, 0, -2.5), rob = makeRobot(host.dataset.robot || 'six'), robotG = new THREE.Group(); robotG.add(rob.g); scene.add(robotG);
  { const bb = new THREE.Box3().setFromObject(rob.g), sz = bb.getSize(V(0, 0, 0)), c = bb.getCenter(V(0, 0, 0)); rob.g.position.set(-c.x, 0, -c.z); robotG.scale.setScalar(Math.min(1.7, 1.5 / Math.max(sz.x, sz.y, sz.z))); robotG.position.copy(RC); }
  const cellFloor = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.05, 2.3), bench.material); cellFloor.position.set(0.05, -0.025, RC.z); cellFloor.receiveShadow = true; scene.add(cellFloor);
  const cellGrid = new THREE.GridHelper(4.8, 24, '#c3cad3', '#a3acb7'); cellGrid.scale.z = 2.2 / 4.8; cellGrid.position.set(0.05, 0.001, RC.z); scene.add(cellGrid);
  const prop = (o, x, z) => { o.position.set(RC.x + x, 0, RC.z + z); o.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } }); scene.add(o); return o; };
  const armSet = setName === 'arm' || setName === 'cobot';
  if (armSet) {
    prop(G(bx(0.45, 0.8, 0.32, C.cream), bx(0.08, 0.1, 0.02, C.dark, 0.12, 0.6, 0.17), bx(0.12, 0.09, 0.02, C.yellow, -0.1, 0.55, 0.17), cy(0.025, 0.02, C.red, -0.1, 0.62, 0.17)), -1.6, -0.25);
    prop(G(bx(0.5, 0.36, 0.35, C.grey), bx(0.3, 0.012, 0.2, C.dark, 0, 0.36)), -1.6, 0.6);
    prop(G(bx(0.35, 0.3, 1.1, C.grey), bx(0.33, 0.02, 1.08, C.black, 0, 0.3)), 1.6, 0.05);
    prop(G(bx(0.04, 1.35, 0.04, C.grey), bx(0.3, 0.03, 0.03, C.grey, -0.13, 1.33), bx(0.07, 0.05, 0.06, C.black, -0.27, 1.27)), 1.85, -0.4);
    prop(G(bx(0.04, 0.9, 0.04, C.yellow, -0.35), bx(0.04, 0.9, 0.04, C.yellow, 0.35)), 1.0, 0.95);
  } else {
    prop(G(bx(0.05, 1.5, 0.05, C.grey), bx(0.2, 0.05, 0.12, C.black, 0, 1.2, 0.06)), -1.7, -0.3);
    prop(G(bx(0.5, 0.36, 0.35, C.grey), bx(0.3, 0.012, 0.2, C.dark, 0, 0.36)), -1.6, 0.6);
  }
  // the operator, at real size next to the robot, with the teach pendant (a tablet for mobile robots)
  const HUMAN = { six: 0.58, cobot: 0.6, scara: 0.72, delta: 0.75, gantry: 0.62, stewart: 0.7, humanoid: 0.95, quadrotor: 0.6, mobile: 1, wheels: 1, drives: 1 }[host.dataset.robot || 'six'] || 0.7;
  const oper = makePerson({ female: true, pendant: true, helmet: armSet }); oper.scale.setScalar(Math.min(1.25, HUMAN * robotG.scale.x)); oper.position.set(RC.x - 1.05, 0, RC.z + 0.3); oper.rotation.y = Math.PI / 2; scene.add(oper);
  oper.updateMatrixWorld(true); const pendantW = oper.userData.pendant.getWorldPosition(V(0, 0, 0));
  const CELL = { cabinet: V(-1.6, 0.45, -0.08), panel: V(-1.6, 0.6, -0.08), desk: V(-1.6, 0.42, 0.6), conveyor: V(1.6, 0.33, 0.05), camstand: V(1.58, 1.28, -0.4), fence: V(1.0, 0.55, 0.95), pole: V(-1.7, 1.25, -0.24) };
  robotG.updateMatrixWorld(true);
  const slotOf = (id) => (SLOT[setName] || SLOT.arm)[id];
  const slotW = (id) => { const k = slotOf(id); if (k === 'operator') return pendantW.clone(); return rob.slots[k] ? rob.g.localToWorld(rob.slots[k].clone()) : CELL[k] ? RC.clone().add(CELL[k]) : RC.clone().add(V(0, 0.6, 0)); };
  // where each part is when it sits in the robot, and where it lands on the bench
  for (const p of list) { const o = objs[p.id]; o.userData.home = o.position.clone(); o.userData.hs = o.scale.x; o.userData.slot = slotW(p.id); o.userData.ord = Math.random() * 0.35; }
  let mode = 'robot', mk = 0;                                    // mk: 0 = everything inside the robot, 1 = everything on the bench
  const rbox = new THREE.Box3().setFromObject(robotG), rcen = rbox.getCenter(V(0, 0, 0)), rmax = Math.max(...rbox.getSize(V(0, 0, 0)).toArray());
  const ROBOTCAM = { p: rcen.clone().add(V(0.55, 0.42, 0.85).normalize().multiplyScalar(rmax * 2.4 + 0.5)), t: rcen.clone() };
  const leader = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 1, 0)]), new THREE.LineDashedMaterial({ color: '#6d5dfc', dashSize: 0.05, gapSize: 0.03, depthTest: false }));
  leader.renderOrder = 5; leader.visible = false; scene.add(leader);
  const spot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: '#6d5dfc', transparent: true, opacity: 0.8, depthTest: false })); spot.renderOrder = 6; spot.visible = false; scene.add(spot);
  function setMode(m) {
    mode = m; modeBtn.textContent = m === 'robot' ? L('Take the components out ▸', 'Sortir les composants ▸') : L('◂ Put them back in the robot', '◂ Les remettre dans le robot');
    modeBtn.classList.toggle('on', m === 'robot'); host.classList.toggle('in-robot', m === 'robot');
    if (m === 'robot') { if (playing) playBtn.click(); fly(ROBOTCAM.p.clone(), ROBOTCAM.t.clone()); } else fly(HOME.p.clone(), HOME.t.clone());
  }
  modeBtn.addEventListener('click', () => setMode(mode === 'robot' ? 'parts' : 'robot'));

  // ------------------------------------------------ number pins + cards
  pinsEl.innerHTML = '<svg class="sys-lines"></svg>' + list.map((p) => `<button type="button" data-p="${p.id}" style="--c:${CATS[p.def[0]][1]}" title="${p.def[2][0][FR ? 1 : 0]}">${p.n}</button>`).join('');
  const byCat = {}; list.forEach((p) => { (byCat[p.def[0]] = byCat[p.def[0]] || []).push(p); });
  catsEl.innerHTML = Object.entries(byCat).map(([cat, ps]) => `<section style="--c:${CATS[cat][1]}"><h3>${CATS[cat][0]}</h3><ul>${ps.map((p) => `<li><button type="button" data-p="${p.id}"><b>${p.n}</b><span><strong>${p.def[2][0][FR ? 1 : 0]}</strong><small>${p.def[2][1][FR ? 1 : 0]}</small><em>${p.def[2][2][FR ? 1 : 0]}</em></span></button></li>`).join('')}</ul></section>`).join('');
  let sel = null, camGoal = null, camFrom = null, camK = 1;
  const HOME = { p: V(0.15, 4.3, 4.9), t: V(0.05, 0, -0.75) };
  function fly(p, t) { camFrom = { p: camera.position.clone(), t: orbit.target.clone() }; camGoal = { p, t }; camK = 0; }
  const hlMat = new Map();
  function select(id, flyTo = true) {
    sel = sel === id ? null : id;
    for (const p of list) {
      const on = !sel || p.id === sel; objs[p.id].userData.ring.material.opacity = sel ? (on ? 1 : 0.15) : 0.85;
      objs[p.id].traverse((m) => { if (m.isMesh && m.material.emissive) { if (!m.userData.base) m.userData.base = m.material; if (p.id === sel) { if (!hlMat.has(m.userData.base)) { const c = m.userData.base.clone(); c.emissive = new THREE.Color('#6d5dfc'); c.emissiveIntensity = 0.45; hlMat.set(m.userData.base, c); } m.material = hlMat.get(m.userData.base); } else m.material = m.userData.base; } });
    }
    wires.forEach((w) => { w.tube.material.opacity = !sel || w.a === sel || w.b === sel ? (w.type === 'mech' ? 0.5 : 0.9) : 0.12; });
    host.querySelectorAll('[data-p]').forEach((b) => b.classList.toggle('on', b.dataset.p === sel));
    detail.hidden = !sel; pop.hidden = !sel;
    if (sel) {
      const p = list.find((q) => q.id === sel), d = p.def[2], i = FR ? 1 : 0, c = CATS[p.def[0]];
      const links = wires.filter((w) => w.a === sel || w.b === sel).map((w) => `<li><i style="background:${WIRE[w.type][0]}"></i>${WIRE[w.type][1]} : ${PARTS[w.a === sel ? w.b : w.a][2][0][i]}</li>`).join('');
      detail.innerHTML = `<span class="sys-tag" style="--c:${c[1]}">${p.n} · ${c[0]}</span><h3>${d[0][i]}</h3><p class="sys-where"><b>${L('Where in the robot', 'Où dans le robot')} :</b> ${WHERE[slotOf(sel)] || ''}</p><p><b>${L('Examples', 'Exemples')} :</b> ${d[1][i]}</p><p><b>${L('Role', 'Rôle')} :</b> ${d[2][i]}</p><p><b>${L('How it works', 'Comment ça marche')} :</b> ${d[3][i]}</p>${links ? `<ul class="sys-links">${links}</ul>` : ''}`;
      pop.querySelector('.sys-pop-in').innerHTML = `<span class="sys-tag" style="--c:${c[1]}">${p.n} · ${c[0]}</span><h4>${d[0][i]}</h4><p class="sys-where"><b>${L('Where', 'Où')} :</b> ${WHERE[slotOf(sel)] || ''}</p><p><b>${L('Role', 'Rôle')} :</b> ${d[2][i]}</p><p><b>${L('How it works', 'Comment ça marche')} :</b> ${d[3][i]}</p><p class="sys-ex"><b>${L('Examples', 'Exemples')} :</b> ${d[1][i]}</p>`;
      if (flyTo && mode === 'robot') { const sw = objs[sel].userData.slot; fly(sw.clone().add(V(0.7, 0.55, 1.1)), sw.clone()); }
      else if (flyTo) { const a = anchors[sel], sw = objs[sel].userData.slot, mid = a.mid.clone().lerp(sw, 0.5); fly(mid.clone().add(V(0.3, 1.0, 1.0).multiplyScalar(Math.max(2.0, a.mid.distanceTo(sw) * 1.45))), mid); }
    } else if (flyTo) fly((mode === 'robot' ? ROBOTCAM : HOME).p.clone(), (mode === 'robot' ? ROBOTCAM : HOME).t.clone());
  }
  host.addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b && host.contains(b)) { select(b.dataset.p); if (b.closest('.sys-cats')) stage.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  allBtn.addEventListener('click', () => { if (sel) select(sel, false); const H = mode === 'robot' ? ROBOTCAM : HOME; fly(H.p.clone(), H.t.clone()); });
  // clicking a part in 3D
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return; const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(Object.values(objs), true).find((h) => h.object.userData.part); if (hit) select(hit.object.userData.part);
  });

  // ------------------------------------------------ how it works: the loop, and the emergency stop
  let playing = false, stopped = false, fStep = 0, fT = 0, t = 0;
  playBtn.addEventListener('click', () => { if (mode === 'robot' && !playing) setMode('parts'); playing = !playing; fStep = 0; fT = 0; playBtn.textContent = playing ? L('■ Stop the animation', '■ Arrêter l\'animation') : L('▶ How it works', '▶ Comment ça marche'); playBtn.classList.toggle('on', playing); flowEl.hidden = !playing; if (playing && sel) select(sel, false); if (playing && camK >= 1) fly(HOME.p.clone(), HOME.t.clone()); });
  stopBtn.addEventListener('click', () => { stopped = !stopped; stopBtn.classList.toggle('on', stopped); stopBtn.textContent = stopped ? L('Reset the emergency stop', 'Réarmer l\'arrêt d\'urgence') : L('Emergency stop', 'Arrêt d\'urgence'); host.classList.toggle('estop', stopped); });
  const active = () => (stopped ? ['safe'] : playing ? FLOW[fStep][0] : []);
  function frame(dt) {
    t += dt;
    if (playing && !stopped) { fT += dt; if (fT > 3.2) { fT = 0; fStep = (fStep + 1) % FLOW.length; } flowEl.textContent = FLOW[fStep][1]; flowEl.className = 'sys-flow'; }
    if (stopped) { flowEl.hidden = false; flowEl.className = 'sys-flow stop'; flowEl.textContent = L('EMERGENCY STOP: the safety loop is open, power to the motors is cut and the brakes are on. Nothing moves until it is reset.', 'ARRÊT D\'URGENCE : la boucle de sécurité est ouverte, la puissance des moteurs est coupée et les freins sont serrés. Rien ne bouge avant le réarmement.'); }
    else if (!playing) flowEl.hidden = true;
    const act = active();
    for (const w of wires) {
      const on = act.includes(w.type) || (playing && !stopped && w.type === 'pow' && fStep >= 2);
      w.pulses.forEach((s, i) => { s.visible = on && w.type !== 'mech'; if (s.visible) { let u = ((t * 0.45 + i / 3) % 1); if (w.back || (w.type === 'safe' && false)) u = 1 - u; s.position.copy(w.curve.getPointAt(u)); } });
      if (w.type === 'mech') w.tube.material.color.set(on ? '#ffffff' : WIRE.mech[0]);
    }
    // moving parts
    const run = !stopped && (!playing || fStep >= 3);
    for (const p of list) { const o = objs[p.id], sp = o.userData.spin; if (sp) { const ax = o.userData.spinAxis || 'z'; if (run || p.id === 'lidar' || p.id === 'ai') sp.rotation[ax] += dt * (p.id === 'prop' ? 25 : 4); } if (o.userData.rod) o.userData.rod.position.x = 0.1 + (run ? 0.035 * Math.sin(t * 2) : 0); }
    if (objs.estop) objs.estop.children[2].position.y = stopped ? 0.06 : 0.072;
    // parts: inside the robot (hidden, at their slot) or out on the bench
    mk += ((mode === 'parts' ? 1 : 0) - mk) * Math.min(1, dt * 1.6); if (Math.abs((mode === 'parts' ? 1 : 0) - mk) < 0.002) mk = mode === 'parts' ? 1 : 0;
    for (const p of list) {
      const o = objs[p.id], u = o.userData, k = Math.max(0, Math.min(1, (mk - u.ord) / (1 - u.ord))), e = k * k * (3 - 2 * k);
      o.visible = k > 0.01; o.position.copy(u.slot).lerp(u.home, e); o.position.y += Math.sin(e * Math.PI) * 0.7 - (1 - e) * 0.05; o.scale.setScalar(u.hs * (0.3 + 0.7 * e));
      u.ring.visible = k > 0.95;
    }
    const wv = mk > 0.97; wires.forEach((w) => { w.tube.visible = wv; if (!wv) w.pulses.forEach((s2) => { s2.visible = false; }); });
    // pins: on the robot (at the slot of each part, spread side by side) or on the parts
    const r = stage.getBoundingClientRect(), v = V(0, 0, 0), inRobot = mk < 0.5, groups = {};
    if (inRobot) list.forEach((p) => { const k = slotOf(p.id); (groups[k] = groups[k] || []).push(p.id); });
    let lines = '';
    pinsEl.querySelectorAll('button').forEach((b) => {
      const id = b.dataset.p; let dx = 0;
      let dy = 22; if (inRobot) { const g2 = groups[slotOf(id)], i = g2.indexOf(id), row = Math.floor(i / 7), n = Math.min(7, g2.length - row * 7); dx = ((i % 7) - (n - 1) / 2) * 27; dy = 22 + row * 27; v.copy(objs[id].userData.slot); } else v.copy(anchors[id].top).add(V(0, 0.06, 0));
      const sx = 0, w0 = v.clone().project(camera); void sx; const hide = w0.z > 1; b.style.display = hide ? 'none' : '';
      const px = (w0.x + 1) / 2 * r.width, py = (1 - w0.y) / 2 * r.height; b.style.left = (px + dx) + 'px'; b.style.top = (py - (inRobot ? dy : 0)) + 'px';
      if (inRobot && !hide) lines += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(px + dx).toFixed(1)}" y2="${(py - dy).toFixed(1)}" class="${id === sel ? 'on' : ''}"/>`;
      if (inRobot && !hide && groups[slotOf(id)][0] === id) lines += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4"/>`;
    });
    const svg = pinsEl.querySelector('svg'); svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`); svg.innerHTML = lines;
    // the selected part: a dashed line from the part on the bench to its place in the robot
    leader.visible = spot.visible = !!sel;
    if (sel) { const sw = objs[sel].userData.slot, from = mk > 0.5 ? anchors[sel].mid : sw; leader.geometry.setFromPoints([from, sw]); leader.computeLineDistances(); spot.position.copy(sw); spot.scale.setScalar(1 + 0.35 * Math.sin(t * 6)); leader.visible = mk > 0.5; }
    if (camK < 1 && camGoal) { camK = Math.min(1, camK + dt / 1.1); const e = camK * camK * (3 - 2 * camK); camera.position.copy(camFrom.p.clone().lerp(camGoal.p, e)); orbit.target.copy(camFrom.t.clone().lerp(camGoal.t, e)); }
  }
  function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = camera.aspect < 0.9 ? 50 : 36; camera.updateProjectionMatrix();
    if (camera.aspect < 0.9) { HOME.p.set(4.2, 4.3, -0.6); } else HOME.p.set(0.15, 4.3, 4.9); }   // portrait screens look along the bench
  new ResizeObserver(resize).observe(stage); resize();
  camera.position.copy(ROBOTCAM.p); orbit.target.copy(ROBOTCAM.t); setMode('robot'); camK = 1;
  let visible = true, last = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(stage);
  renderer.setAnimationLoop((now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!visible) return; frame(dt); orbit.update(); renderer.render(scene, camera); });
  host.__mode = (m) => { setMode(m); mk = m === 'parts' ? 1 : 0; camK = 1; const H = m === 'robot' ? ROBOTCAM : HOME; camera.position.copy(H.p); orbit.target.copy(H.t); };
  host.__test = () => ({ parts: list.length, wires: wires.length, missing: SET.parts.filter(([id]) => !PARTS[id] || !B[PARTS[id][1]]).map((p) => p[0]) });
}
document.querySelectorAll('.sysdemo').forEach(mount);
