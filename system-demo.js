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
  srelay() { const g = G(bx(0.16, 0.012, 0.03, C.steel, 0, 0.035)); for (let i = 0; i < 2; i++) { g.add(bx(0.045, 0.11, 0.08, C.yellow, -0.03 + i * 0.05, 0)); for (let k = 0; k < 3; k++) g.add(bx(0.008, 0.008, 0.002, k ? C.led : C.ledR, -0.04 + i * 0.05 + k * 0.01, 0.09, 0.041)); for (let k = 0; k < 4; k++) g.add(bx(0.008, 0.01, 0.01, C.dark, -0.045 + i * 0.05 + k * 0.01, 0.11, 0.025)); } return g; },
  jtq() { const g = new THREE.Group(), o = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 10, 36), C.alu); o.rotation.x = Math.PI / 2; o.position.y = 0.02; g.add(o); g.add(cy(0.02, 0.03, C.alu, 0, 0.005)); for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2, sp = bx(0.05, 0.012, 0.012, C.alu, Math.cos(a) * 0.035, 0.014, Math.sin(a) * 0.035); sp.rotation.y = -a; g.add(sp); const gg = bx(0.014, 0.003, 0.01, C.gold, Math.cos(a) * 0.035, 0.027, Math.sin(a) * 0.035); gg.rotation.y = -a; g.add(gg); } return g; },
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
  srelay: ['saf', 'srelay', T('Safety relay (safety controller)', 'Relais de sécurité (automate de sécurité)', 'Pilz PNOZ, Sick Flexi Soft, Siemens 3SK', 'Pilz PNOZ, Sick Flexi Soft, Siemens 3SK', 'Watches the emergency stops, doors and light curtains, and cuts the motor power if one of them opens.', 'Surveille les arrêts d\'urgence, portes et barrières, et coupe la puissance des moteurs si l\'un d\'eux s\'ouvre.', 'It reads every safety device on two separate channels: if one channel fails, the other still works. When a device opens, it switches off the drives\' power stage (STO, "Safe Torque Off") and the brakes close.', 'Il lit chaque dispositif de sécurité sur deux voies séparées : si une voie tombe en panne, l\'autre fonctionne encore. Quand un dispositif s\'ouvre, il coupe l\'étage de puissance des variateurs (STO, « Safe Torque Off ») et les freins se serrent.')],
  jtq: ['adv', 'jtq', T('Joint torque sensor', 'Capteur de couple d\'articulation', 'Built into every joint of a cobot (KUKA LBR iiwa, Franka)', 'Intégré dans chaque articulation d\'un cobot (KUKA LBR iiwa, Franka)', 'Feels the effort in each joint, so the cobot notices when it touches someone.', 'Sent l\'effort dans chaque articulation, pour que le cobot remarque quand il touche quelqu\'un.', 'Strain gauges on thin spokes measure the twist of the joint. The controller compares it with the effort it expects: a difference means a contact, and the cobot stops.', 'Des jauges de contrainte sur de fins rayons mesurent la torsion de l\'articulation. Le contrôleur la compare à l\'effort prévu : une différence signifie un contact, et le cobot s\'arrête.')],
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
      ['estop', -1.4, 1.35], ['curtain', -0.6, 1.35], ['laptop', 0.35, 1.35], ['cyl', 1.1, 1.35], ['srelay', 1.85, 1.35]],
    wires: [['cam', 'plc', 'sig'], ['cam3d', 'cabinet', 'sig'], ['ft', 'cabinet', 'sig'], ['prox', 'plc', 'sig'], ['photo', 'plc', 'sig'],
      ['plc', 'cabinet', 'bus'], ['cabinet', 'drive', 'bus'], ['pendant', 'cabinet', 'sig'], ['laptop', 'cabinet', 'bus'], ['bus', 'drive', 'bus'],
      ['psu', 'cabinet', 'pow'], ['psu', 'drive', 'pow'], ['drive', 'servo', 'mot'], ['drive', 'stepper', 'mot'], ['enc', 'drive', 'fb'], ['drive', 'brake', 'pow'],
      ['servo', 'harmonic', 'mech'], ['stepper', 'rv', 'mech'], ['rv', 'struct', 'mech'], ['harmonic', 'struct', 'mech'], ['struct', 'gripper', 'mech'], ['plc', 'cyl', 'sig'],
      ['estop', 'srelay', 'safe'], ['curtain', 'srelay', 'safe'], ['srelay', 'drive', 'safe']]
  },
  mobile: {
    parts: [['lidar', -1.9, -0.75], ['cam3d', -1.9, -0.3], ['us', -1.9, 0.15], ['imu', -1.9, 0.55], ['cam', -1.5, -0.75], ['prox', -1.5, 0.55], ['gps', -1.5, 0.15],
      ['ai', -0.85, -0.7], ['sbc', -0.85, -0.2], ['mcu', -0.85, 0.3], ['pcb', -0.85, 0.75], ['radio', -0.4, 0.3], ['router', -0.35, -0.75],
      ['battery', 0.2, -0.7], ['driver', 0.2, -0.15], ['heatsink', 0.2, 0.35], ['cables', 0.2, 0.8],
      ['dc', 0.95, -0.7], ['planet', 0.95, -0.2], ['enc', 0.95, 0.3], ['hobby', 0.95, 0.75], ['stepper', 1.45, 0.75],
      ['wheel', 1.6, -0.65], ['track', 1.6, -0.1], ['chassis', 1.6, 0.4], ['enclosure', 2.0, 0.75],
      ['bumper', -1.4, 1.35], ['scanner', -0.75, 1.35], ['estop', -0.2, 1.35], ['laptop', 0.45, 1.35], ['pid', 1.15, 1.35], ['cyl', 1.75, 1.35], ['srelay', 2.2, 0.3]],
    wires: [['lidar', 'sbc', 'sig'], ['cam3d', 'ai', 'sig'], ['cam', 'ai', 'sig'], ['us', 'mcu', 'sig'], ['imu', 'mcu', 'sig'], ['prox', 'mcu', 'sig'], ['gps', 'sbc', 'sig'],
      ['ai', 'sbc', 'bus'], ['sbc', 'mcu', 'bus'], ['router', 'sbc', 'bus'], ['radio', 'mcu', 'bus'], ['laptop', 'router', 'bus'],
      ['battery', 'driver', 'pow'], ['battery', 'pcb', 'pow'], ['pcb', 'mcu', 'pow'], ['mcu', 'driver', 'bus'], ['driver', 'dc', 'mot'], ['driver', 'stepper', 'mot'], ['mcu', 'hobby', 'mot'],
      ['enc', 'mcu', 'fb'], ['dc', 'planet', 'mech'], ['planet', 'wheel', 'mech'], ['wheel', 'chassis', 'mech'], ['track', 'chassis', 'mech'],
      ['bumper', 'srelay', 'safe'], ['scanner', 'srelay', 'safe'], ['estop', 'srelay', 'safe'], ['srelay', 'driver', 'safe']]
  }
};
SETS.humanoid = { parts: SETS.mobile.parts.map((p) => (p[0] === 'track' ? ['mot3', p[1], p[2]] : p[0] === 'wheel' ? ['fsr', p[1], p[2]] : p[0] === 'gps' ? ['ft', p[1], p[2]] : p)),
  wires: SETS.mobile.wires.map((w) => w.map((x) => (x === 'track' ? 'mot3' : x === 'wheel' ? 'fsr' : x === 'gps' ? 'ft' : x))).concat([['driver', 'mot3', 'mot']]) };
SETS.drone = { parts: SETS.mobile.parts.filter((p) => !['bumper', 'track', 'hobby', 'cyl'].includes(p[0])).map((p) => (p[0] === 'wheel' ? ['prop', p[1], p[2]] : p[0] === 'driver' ? ['esc', p[1], p[2]] : p)),
  wires: SETS.mobile.wires.filter((w) => !w.some((x) => ['bumper', 'track', 'hobby'].includes(x))).map((w) => w.map((x) => (x === 'wheel' ? 'prop' : x === 'driver' ? 'esc' : x))).concat([['esc', 'prop', 'mot']]) };
SETS.cobot = { parts: SETS.arm.parts.map((p) => (p[0] === 'curtain' ? ['scanner', p[1], p[2]] : p)).concat([['jtq', 2.1, 0.3]]), wires: SETS.arm.wires.map((w) => w.map((x) => (x === 'curtain' ? 'scanner' : x))).concat([['jtq', 'srelay', 'safe']]) };
const WIRE = { sig: ['#1aa0c8', L('sensor signals', 'signaux capteurs')], bus: ['#f1c40f', L('network / fieldbus', 'réseau / bus de terrain')], pow: ['#e5484d', L('power', 'alimentation')],
  mot: ['#ff8a2a', L('motor current', 'courant moteur')], fb: ['#30c67c', L('encoder feedback', 'retour codeur')], mech: ['#9aa5b1', L('mechanical link', 'liaison mécanique')], safe: ['#111111', L('safety loop', 'boucle de sécurité')] };
const FLOW = [
  [['sig'], L('1. The sensors measure the world and send their signals', '1. Les capteurs mesurent le monde et envoient leurs signaux')],
  [['bus'], L('2. The brains decide: the PLC gives the task, the robot controller computes the motion and sends the orders', '2. Les cerveaux décident : l\'automate donne la tâche, le contrôleur robot calcule le mouvement et envoie les consignes')],
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
  const cup = B.vacuum(); cup.rotation.x = Math.PI; cup.scale.setScalar(1.6); cup.position.y = 0.71 + 0.112 * 1.6; g.add(cup);   // the tool: a vacuum cup facing up
  g.add(bx(0.22, 0.03, 0.16, C.cream, 0, 0.71 + 0.112 * 1.6 + 0.002));                                                         // the part it holds
  return { g, slots: { base: V(0, 0.04, 0.3), j1: V(0.4, 0.08, 0.05), j2: V(0.33, 0.36, 0.12), j3: V(0.25, 0.64, 0.08), wrist: V(0, 0.69, 0), tool: V(0, 0.86, 0), link: V(-0.3, 0.36, 0.15), cable: V(-0.42, 0.08, 0.1) } };
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
SLOT.arm.srelay = 'cabinet'; SLOT.arm.jtq = 'j2'; SLOT.mobile.srelay = 'inside'; SLOT.humanoid.srelay = 'torso'; SLOT.drone.srelay = 'center';
SLOT.cobot = SLOT.arm;
const WHERE = { operator: L('in the hands of the operator (teach pendant)', 'dans les mains de l\'opératrice (pupitre de programmation)'), j1: L('axis 1, in the base', 'axe 1, dans la base'), j2: L('the shoulder (axis 2)', 'l\'épaule (axe 2)'), j3: L('the elbow (axis 3)', 'le coude (axe 3)'), wrist: L('the wrist', 'le poignet'), tool: L('the tool, at the end of the arm', 'l\'outil, au bout du bras'),
  link: L('the arm itself', 'le bras lui-même'), cable: L('along the arm (cable hose)', 'le long du bras (gaine de câbles)'), base: L('the base', 'la base'), cabinet: L('in the controller cabinet next to the robot', 'dans l\'armoire de commande à côté du robot'),
  panel: L('on the cabinet, for the operator', 'sur l\'armoire, pour l\'opérateur'), desk: L('on the engineer\'s desk', 'sur le bureau de l\'ingénieur'), conveyor: L('on the conveyor that feeds the robot', 'sur le convoyeur qui alimente le robot'),
  camstand: L('on a stand above the work area', 'sur un support au-dessus de la zone de travail'), fence: L('at the entrance of the cell', 'à l\'entrée de la cellule'), pole: L('on the wall of the building', 'au mur du bâtiment'),
  lidar: L('on top, at the front', 'en haut, à l\'avant'), front: L('on the front face', 'sur la face avant'), top: L('on the top deck', 'sur le plateau'), inside: L('inside the body', 'à l\'intérieur du châssis'), wheel: L('in the drive wheels', 'dans les roues motrices'),
  side: L('on the sides', 'sur les côtés'), bumper: L('all around, at the bottom', 'tout autour, en bas'), back: L('at the back', 'à l\'arrière'), head: L('in the head', 'dans la tête'), chest: L('in the chest', 'dans la poitrine'), torso: L('in the torso', 'dans le torse'),
  shoulder: L('in the shoulders and arms', 'dans les épaules et les bras'), hand: L('in the hands', 'dans les mains'), hip: L('in the hips and legs', 'dans les hanches et les jambes'), knee: L('in the knees', 'dans les genoux'), foot: L('under the feet', 'sous les pieds'),
  center: L('in the centre body', 'dans le corps central'), mast: L('on the GPS mast', 'sur le mât GPS'), bottom: L('underneath', 'en dessous'), arm: L('in the arms', 'dans les bras'), motor: L('at the end of each arm', 'au bout de chaque bras'), prop: L('on top of each motor', 'sur chaque moteur') };

// ---------------------------------------------------------------- "how it works": a few key components, laid out clearly, with big callout cards
// [candidate ids (first one present is used), x, z on the bench, step of the loop it belongs to (0 = safety)]
const HOWSET = {
  arm: [[['cam'], -2.05, -1.0, 1], [['photo', 'prox'], -2.05, -0.15, 1], [['ft'], -2.05, 0.7, 1],
    [['plc'], -1.0, -1.0, 2], [['pendant'], -1.0, -0.15, 2], [['cabinet'], -0.95, 0.75, 2],
    [['psu'], 0.05, -1.0, 3], [['drive'], 0.05, -0.15, 3],
    [['servo'], 1.0, -0.75, 4], [['enc'], 1.0, -1.18, 5], [['brake'], 1.0, 0.05, 4], [['harmonic'], 1.95, -0.75, 4], [['gripper'], 1.95, 0.15, 4],
    [['estop'], -2.05, 1.65, 0], [['curtain', 'scanner'], -0.95, 1.65, 0], [['srelay'], 0.05, 1.65, 0]],
  mobile: [[['lidar'], -2.05, -1.05, 1], [['cam', 'cam3d'], -2.05, -0.3, 1], [['us'], -2.05, 0.4, 1], [['imu'], -2.05, 1.0, 1],
    [['sbc', 'ai'], -1.0, -1.0, 2], [['mcu'], -1.0, -0.2, 2], [['radio'], -1.0, 0.55, 2],
    [['battery'], 0.05, -1.0, 3], [['driver', 'esc'], 0.05, -0.15, 3],
    [['mot3', 'dc'], 1.0, -0.75, 4], [['enc'], 1.0, -1.18, 5], [['planet'], 1.95, -0.75, 4], [['wheel', 'prop'], 1.95, 0.2, 4],
    [['estop'], -1.0, 1.65, 0], [['bumper'], 0.05, 1.65, 0], [['scanner'], 1.0, 1.0, 0], [['srelay'], 1.95, 1.65, 0]]
};
const HOWTXT = {
  estop: [L('Emergency stop', 'Bouton d\'arrêt d\'urgence'), L('Stops the whole system in case of danger', 'Arrête le système en cas de danger')],
  bumper: [L('Safety bumper', 'Pare-chocs de sécurité'), L('A touch stops the robot at once', 'Un contact arrête le robot aussitôt')],
  photo: [L('Presence sensor', 'Capteur de présence'), L('Detects the part on the conveyor', 'Détecte la pièce sur le convoyeur')],
  prox: [L('Presence sensor', 'Capteur de présence'), L('Detects the part on the conveyor', 'Détecte la pièce sur le convoyeur')],
  cam: [L('Camera', 'Caméra'), L('Finds the objects and checks them', 'Repère les objets et les vérifie')],
  plc: [L('PLC (cell brain)', 'Automate (cerveau de la cellule)'), L('Runs the cell and tells the robot what to do', 'Gère la cellule et dit au robot quoi faire')],
  cabinet: [L('Robot controller (robot brain)', 'Contrôleur robot (cerveau du robot)'), L('Computes the motion and gives the orders to the drives', 'Calcule le mouvement et donne les consignes aux variateurs')],
  srelay: [L('Safety relay', 'Relais de sécurité'), L('Cuts the motor power in case of danger', 'Coupe la puissance des moteurs en cas de danger')],
  jtq: [L('Torque sensor (in the joint)', 'Capteur de couple (dans l\'articulation)'), L('Feels a contact and stops the cobot', 'Sent un contact et arrête le cobot')],
  drive: [L('Servo drive', 'Variateur'), L('Gives the motor exactly the right current', 'Donne au moteur exactement le bon courant')],
  servo: [L('Actuation motor', 'Moteur d\'actionnement'), L('Turns the joint of the robot', 'Fait tourner l\'articulation du robot')],
  enc: [L('Encoder (at the back of the motor)', 'Codeur (au dos du moteur)'), L('Measures the real position and sends it back', 'Mesure la position réelle et la renvoie')],
  lidar: [L('LiDAR', 'LiDAR'), L('Sees the obstacles all around', 'Voit les obstacles tout autour')],
  us: [L('Distance sensor', 'Capteur de distance'), L('Measures the distance in front', 'Mesure la distance devant')],
  imu: [L('IMU', 'Centrale inertielle'), L('Measures tilt and rotation', 'Mesure l\'inclinaison et la rotation')],
  sbc: [L('Main computer', 'Ordinateur principal'), L('Builds the map and chooses the path', 'Construit la carte et choisit le chemin')],
  ai: [L('AI computer', 'Ordinateur IA'), L('Recognises objects and plans', 'Reconnaît les objets et planifie')],
  mcu: [L('Microcontroller', 'Microcontrôleur'), L('Turns the plan into motor orders', 'Transforme le plan en consignes moteur')],
  battery: [L('Battery', 'Batterie'), L('Gives the energy', 'Fournit l\'énergie')],
  driver: [L('Motor driver', 'Driver moteur'), L('Sends the current to the motors', 'Envoie le courant aux moteurs')],
  esc: [L('ESC', 'ESC (contrôleur de vitesse)'), L('Sends the current to the motors', 'Envoie le courant aux moteurs')],
  mot3: [L('Joint motor', 'Moteur d\'articulation'), L('Moves the legs and the arms', 'Fait bouger les jambes et les bras')],
  prop: [L('Motor + propeller', 'Moteur + hélice'), L('Lifts and steers the drone', 'Soulève et dirige le drone')],
  dc: [L('Gear motor', 'Motoréducteur'), L('Turns the wheels', 'Fait tourner les roues')],
  cobotcab: [L('Cobot controller (robot brain)', 'Boîtier de commande du cobot'), L('Computes the motion and gives the orders to the joints', 'Calcule le mouvement et donne les consignes aux articulations')],
  cobotdrv: [L('Drive (inside the joint)', 'Variateur (dans l\'articulation)'), L('Gives the motor exactly the right current', 'Donne au moteur exactement le bon courant')],
  curtain: [L('Light curtain', 'Barrière immatérielle'), L('Stops the robot if someone enters the cell', 'Arrête le robot si quelqu\'un entre dans la cellule')],
  scanner: [L('Safety laser scanner', 'Scanner laser de sécurité'), L('Slows down, then stops, when someone comes close', 'Ralentit, puis arrête, quand quelqu\'un approche')],
  pendant: [L('Teach pendant', 'Pupitre de programmation'), L('To move the robot by hand and write its program', 'Pour bouger le robot à la main et écrire son programme')],
  psu: [L('Power supply', 'Alimentation'), L('Turns the mains into the right voltages', 'Transforme le secteur en bonnes tensions')],
  brake: [L('Holding brake', 'Frein de maintien'), L('Holds the arm when the power is off', 'Tient le bras quand le courant est coupé')],
  harmonic: [L('Gearbox (reducer)', 'Réducteur'), L('Slows the motor down and makes it stronger', 'Ralentit le moteur et le rend plus fort')],
  gripper: [L('Tool (gripper)', 'Outil (pince)'), L('Grabs and holds the part', 'Attrape et tient la pièce')],
  ft: [L('Force sensor (wrist)', 'Capteur d\'effort (poignet)'), L('Feels the forces on the tool', 'Sent les efforts sur l\'outil')],
  cam3d: [L('3D camera', 'Caméra 3D'), L('Sees the shape and distance of objects', 'Voit la forme et la distance des objets')],
  radio: [L('Wi-Fi / Bluetooth', 'Wi-Fi / Bluetooth'), L('Receives the missions from the fleet manager', 'Reçoit les missions du gestionnaire de flotte')],
  planet: [L('Gearbox', 'Réducteur'), L('Slows the motor down and makes it stronger', 'Ralentit le moteur et le rend plus fort')],
  wheel: [L('Drive wheel', 'Roue motrice'), L('Pushes on the floor: the robot moves', 'Pousse sur le sol : le robot avance')],
  robot: [L('The robot moves', 'Le robot bouge'), L('The result: a precise motion', 'Le résultat : un mouvement précis')]
};

// ---------------------------------------------------------------- the layers: the robot is taken apart one layer at a time
const LAYERS = [
  [L('The robot', 'Le robot'), [], L('A robot is a stack of layers, like a body: a skeleton, muscles, senses, a brain, energy, nerves and a guardian. Use the arrows to take it apart one layer at a time: each layer comes out of the robot with its names, and a dotted line shows where each part sits.', 'Un robot est un empilement de couches, comme un corps : un squelette, des muscles, des sens, un cerveau, de l\'énergie, des nerfs et un gardien. Utilisez les flèches pour le démonter couche par couche : chaque couche sort du robot avec ses noms, et un pointillé montre où se trouve chaque pièce.')],
  [L('Structure', 'Structure'), ['str', 'tool'], L('The skeleton and the hand: the arm, the column or the chassis carry the loads and keep the precision; the tool holds the parts.', 'Le squelette et la main : le bras, la colonne ou le châssis portent les charges et gardent la précision ; l\'outil tient les pièces.')],
  [L('Actuators', 'Actionneurs'), ['act', 'red', 'enc'], L('The muscles: motors make every axis move, gearboxes make them strong, brakes hold them, and encoders measure exactly where they are.', 'Les muscles : les moteurs font bouger chaque axe, les réducteurs les rendent forts, les freins les tiennent, et les codeurs mesurent exactement où ils sont.')],
  [L('Sensors', 'Capteurs'), ['sen', 'adv'], L('The senses: they measure the world around the robot (parts present, distances, forces, images) and send it to the brain.', 'Les sens : ils mesurent le monde autour du robot (pièces présentes, distances, efforts, images) et l\'envoient au cerveau.')],
  [L('Brain', 'Cerveau'), ['ctl', 'brd'], L('The brain: the controller, the PLC and the boards decide what to do, thousands of times per second.', 'Le cerveau : le contrôleur, l\'automate et les cartes décident quoi faire, des milliers de fois par seconde.')],
  [L('Energy', 'Énergie'), ['pow', 'drv'], L('The energy: the power supply or the battery, and the drives that give each motor exactly the current it needs.', 'L\'énergie : l\'alimentation ou la batterie, et les variateurs qui donnent à chaque moteur exactement le courant nécessaire.')],
  [L('Network and software', 'Réseau et logiciels'), ['com', 'sw'], L('The nerves and the programs: cables, networks and radio links carry the information; the software and the control loops tell everything what to do.', 'Les nerfs et les programmes : câbles, réseaux et liaisons radio transportent l\'information ; les logiciels et les boucles de régulation disent à tout ce qu\'il faut faire.')],
  [L('Safety', 'Sécurité'), ['saf'], L('The guardian: emergency stop, light curtains, scanners and bumpers can stop everything at any moment to protect people.', 'Le gardien : arrêt d\'urgence, barrières immatérielles, scanners et pare-chocs peuvent tout arrêter à tout moment pour protéger les personnes.')],
  [L('How it works', 'Comment ça marche'), 'all', L('The key components only, wired together like in a real cell. Press "▶ How it works" to follow the signals step by step: sensors → brain → drive → motor → the robot moves → the encoder sends the position back.', 'Seulement les composants clés, câblés comme dans une vraie cellule. Appuyez sur « ▶ Comment ça marche » pour suivre les signaux étape par étape : capteurs → cerveau → variateur → moteur → le robot bouge → le codeur renvoie la position.')]
];

// ---------------------------------------------------------------- the widget
function mount(host) {
  const setName = host.dataset.set || 'arm', SET = SETS[setName]; if (!SET) return;
  const list = SET.parts.map(([id, x, z], i) => ({ id, x, z, n: i + 1, def: PARTS[id] }));
  host.innerHTML = `<div class="sys-stage"><div class="sys-pins"></div><div class="sys-flow" hidden><button type="button" class="sys-fprev" aria-label="${L('Previous step', 'Étape précédente')}">‹</button><button type="button" class="sys-fpause" aria-label="${L('Pause', 'Pause')}">❚❚</button><span class="sys-ftxt"></span><button type="button" class="sys-fnext" aria-label="${L('Next step', 'Étape suivante')}">›</button></div>
      <div class="sys-labs"><svg class="sys-lines"></svg></div><div class="sys-cell"></div><div class="sys-how"><svg class="sys-harrows"><defs><marker id="sysarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs><g></g></svg></div>
      <div class="sys-views" role="group" aria-label="${L('View', 'Vue')}"><button type="button" data-v="iso" aria-pressed="true" title="${L('3D view', 'Vue 3D')}"><svg viewBox="0 0 24 24"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9z M4 7.5 12 12l8-4.5 M12 12v9"/></svg><span>3D</span></button><button type="button" data-v="top" aria-pressed="false" title="${L('Top view', 'Vue de dessus')}"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3"/></svg><span>${L('Top', 'Dessus')}</span></button><button type="button" data-v="front" aria-pressed="false" title="${L('Front view', 'Vue de face')}"><svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M5 15h14"/></svg><span>${L('Front', 'Face')}</span></button><button type="button" data-v="side" aria-pressed="false" title="${L('Side view', 'Vue de côté')}"><svg viewBox="0 0 24 24"><path d="M6 19V5l12 4v10z"/></svg><span>${L('Side', 'Côté')}</span></button><button type="button" class="sys-zoom" data-z="out" title="${L('Zoom out', 'Dézoomer')}"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M8 11h6M16 16l4 4"/></svg></button><button type="button" class="sys-zoom" data-z="in" title="${L('Zoom in', 'Zoomer')}"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M8 11h6M11 8v6M16 16l4 4"/></svg></button><button type="button" class="sys-full" title="${L('Full screen', 'Plein écran')}"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></div>
      <div class="sys-ctl"><button type="button" class="sys-play">${L('▶ How it works', '▶ Comment ça marche')}</button><button type="button" class="sys-stop">${L('Emergency stop', 'Arrêt d\'urgence')}</button><button type="button" class="sys-all">${L('Overview', 'Vue d\'ensemble')}</button></div>
      <div class="sys-pop" hidden><button type="button" class="sys-x" aria-label="${L('Close', 'Fermer')}">×</button><div class="sys-pop-in"></div></div><p class="sys-hint">${L('Click a name or a part', 'Cliquez sur un nom ou une pièce')}</p></div>
    <nav class="sys-layers" aria-label="${L('Layers', 'Couches')}"><button type="button" class="sys-prev" aria-label="${L('Previous layer', 'Couche précédente')}">‹</button><div class="sys-lchips">${LAYERS.map((l, i) => `<button type="button" data-l="${i}">${i && i < LAYERS.length - 1 ? `<b>${i}</b>` : ''}${l[0]}</button>`).join('')}</div><button type="button" class="sys-next" aria-label="${L('Next layer', 'Couche suivante')}">›</button></nav>
    <div class="sys-lcard"><h3></h3><p></p><div class="sys-lparts"></div></div>
    <div class="sys-explain" hidden></div>
    <div class="sys-legend">${Object.entries(WIRE).map(([k, [c, n]]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}</div>
    <div class="sys-detail" hidden></div>
    <div class="sys-cats"></div>`;
  const stage = host.querySelector('.sys-stage'), pinsEl = host.querySelector('.sys-pins'), flowEl = host.querySelector('.sys-flow'), detail = host.querySelector('.sys-detail'), catsEl = host.querySelector('.sys-cats');
  const pop = host.querySelector('.sys-pop'); pop.querySelector('.sys-x').addEventListener('click', () => { if (sel) select(sel, false); });
  const playBtn = host.querySelector('.sys-play'), stopBtn = host.querySelector('.sys-stop'), allBtn = host.querySelector('.sys-all'), labsEl = host.querySelector('.sys-labs');

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.01, 50);
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
  const orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.maxPolarAngle = Math.PI * 0.47; orbit.minDistance = 0.4; orbit.maxDistance = 14;
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
    prop(desk(), -1.6, 0.6);
    prop(conveyorProp(), 1.6, 0.05);
    prop(G(bx(0.04, 1.35, 0.04, C.grey), bx(0.3, 0.03, 0.03, C.grey, -0.13, 1.33), bx(0.07, 0.05, 0.06, C.black, -0.27, 1.27), cyZ(0.015, 0.02, C.lens, -0.27, 1.27, 0.03)), 1.85, -0.4);
    const cur = B.curtain(); cur.scale.setScalar(2.2); cur.children.forEach((m) => { if (m.material && m.material.opacity === 0.08) m.material.opacity = 0.16; }); prop(cur, 1.0, 0.95);
  } else {
    prop(G(bx(0.05, 1.5, 0.05, C.grey), bx(0.2, 0.05, 0.12, C.black, 0, 1.2, 0.06)), -1.7, -0.3);
    prop(desk(), -1.6, 0.6);
  }
  function desk() { const g = G(bx(0.7, 0.04, 0.45, C.wood, 0, 0.4)); for (const [x, z] of [[-0.32, -0.19], [0.32, -0.19], [-0.32, 0.19], [0.32, 0.19]]) g.add(bx(0.04, 0.4, 0.04, C.grey, x, 0, z)); const lp = B.laptop(); lp.scale.setScalar(1.3); lp.position.y = 0.44; g.add(lp); return g; }
  function conveyorProp() { const g = new THREE.Group(), L2 = 1.1; for (const x of [-0.15, 0.15]) for (const z of [-0.5, 0.5]) g.add(bx(0.04, 0.26, 0.04, C.grey, x, 0, z));
    for (const x of [-0.17, 0.17]) g.add(bx(0.03, 0.06, L2, C.grey, x, 0.24)); g.add(bx(0.32, 0.02, L2 - 0.06, C.rubber, 0, 0.28));
    for (const z of [-0.52, 0.52]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 16).rotateZ(Math.PI / 2), C.steel); r.position.set(0, 0.28, z); g.add(r); }
    g.add(bx(0.16, 0.12, 0.16, C.cream, 0, 0.3, -0.15)); g.add(bx(0.16, 0.12, 0.16, C.cream, 0, 0.3, 0.25)); return g; }
  const cellLabels = armSet ? [[L('Controller cabinet', 'Armoire de commande'), V(-1.6, 0.85, -0.25)], [L('Programming desk', 'Poste de programmation'), V(-1.6, 0.75, 0.6)], [L('Conveyor (brings the parts)', 'Convoyeur (amène les pièces)'), V(1.6, 0.5, 0.05)],
      [L('Camera on its stand', 'Caméra sur son support'), V(1.6, 1.42, -0.4)], [L('Light curtain (entrance of the cell)', 'Barrière immatérielle (entrée de la cellule)'), V(1.0, 1.0, 0.95)]]
    : [[L('Wi-Fi access point', 'Point d\'accès Wi-Fi'), V(-1.7, 1.55, -0.3)], [L('Supervision desk', 'Poste de supervision'), V(-1.6, 0.75, 0.6)]];
  // the operator, at real size next to the robot, with the teach pendant (a tablet for mobile robots)
  const HUMAN = { six: 0.58, cobot: 0.6, scara: 0.72, delta: 0.75, gantry: 0.62, stewart: 0.7, humanoid: 0.95, quadrotor: 0.6, mobile: 1, wheels: 1, drives: 1 }[host.dataset.robot || 'six'] || 0.7;
  const oper = makePerson({ female: true, pendant: true, helmet: armSet }); oper.scale.setScalar(Math.min(1.25, HUMAN * robotG.scale.x)); oper.position.set(RC.x - (armSet ? 1.05 : 1.3), 0, RC.z + (armSet ? 0.3 : -0.45)); oper.rotation.y = Math.PI / 2; scene.add(oper);
  oper.updateMatrixWorld(true); const pendantW = oper.userData.pendant.getWorldPosition(V(0, 0, 0));
  const CELL = { cabinet: V(-1.6, 0.45, -0.08), panel: V(-1.6, 0.6, -0.08), desk: V(-1.6, 0.42, 0.6), conveyor: V(1.6, 0.33, 0.05), camstand: V(1.58, 1.28, -0.4), fence: V(1.0, 0.55, 0.95), pole: V(-1.7, 1.25, -0.24) };
  robotG.updateMatrixWorld(true);
  const slotOf = (id) => (SLOT[setName] || SLOT.arm)[id];
  const slotW = (id) => { const k = slotOf(id); if (k === 'operator') return pendantW.clone(); return rob.slots[k] ? rob.g.localToWorld(rob.slots[k].clone()) : CELL[k] ? RC.clone().add(CELL[k]) : RC.clone().add(V(0, 0.6, 0)); };
  // where each part is when it sits in the robot, and where it lands on the bench
  for (const p of list) { const o = objs[p.id]; o.userData.home = o.position.clone(); o.userData.hs = o.scale.x; { const b1 = new THREE.Box3().setFromObject(o).getSize(V(0, 0, 0)); o.userData.rowS = Math.min(1, 0.42 / Math.max(b1.x, b1.y, b1.z)); } o.userData.slot = slotW(p.id); o.userData.ord = Math.random() * 0.35; }
  const rbox = new THREE.Box3().setFromObject(robotG), rcen = rbox.getCenter(V(0, 0, 0)), rmax = Math.max(...rbox.getSize(V(0, 0, 0)).toArray());
  const ROBOTCAM = { p: RC.clone().add(V(1.2, 4.0, 6.0)), t: RC.clone().add(V(0, 0.55, 0)) };   // the whole cell: robot, operator, cabinet, desk, conveyor
  const LAYERCAM = { p: V(0.15, 3.0, 3.4), t: V(0.05, 0.4, -1.75) };
  const layerOf = (p) => LAYERS.findIndex((l) => Array.isArray(l[1]) && l[1].includes(p.def[0]));
  // a dotted line + a dot at the place in the robot, for each part of the current layer
  const cellEl = host.querySelector('.sys-cell');
  if (armSet && rob.slots.tool) cellLabels.push([host.dataset.robot === 'stewart' ? L('The tool: a vacuum cup', 'L\'outil : une ventouse') : L('The tool: a gripper', 'L\'outil : une pince'), null, rob.g.localToWorld(rob.slots.tool.clone()).add(V(0, 0.08, 0))]);
  cellEl.innerHTML = cellLabels.map(([n, , w], i) => `<span class="${w ? 'tool' : ''}">${n}</span>`).join('') + `<span class="op">${L('Operator with the teach pendant', 'Opératrice avec le pupitre')}</span>`;
  const leaders = {};
  for (const p of list) {
    const col = CATS[p.def[0]][1], ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 1, 0)]), new THREE.LineDashedMaterial({ color: col, dashSize: 0.05, gapSize: 0.035, depthTest: false, transparent: true }));
    ln.renderOrder = 5; ln.visible = false; scene.add(ln);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 10), new THREE.MeshBasicMaterial({ color: col, depthTest: false })); dot.renderOrder = 6; dot.visible = false; scene.add(dot);
    leaders[p.id] = { ln, dot };
  }
  // ---- the clean "how it works" layout: key components, dashed cables on the floor, callout cards
  const setKey = setName === 'cobot' ? 'cobot' : setName === 'arm' ? 'arm' : 'mobile', isArm = setKey !== 'mobile', isCobot = setKey === 'cobot';
  const HOW = (isCobot ? HOWSET.arm.concat([[['jtq'], 1.95, 1.05, 0]]) : HOWSET[isArm ? 'arm' : 'mobile']).map(([cands, x, z, step]) => { const id = cands.find((c) => objs[c]); return id ? { id, x: x * 0.74, z: z * 0.92, step } : null; }).filter(Boolean);   // kept in the middle of the bench, between the two columns of cards
  const robotAnchor = () => rcen.clone().add(V(0, rmax * 0.15, 0));
  HOW.push({ id: 'robot', step: 4, robot: true });
  const TX = (id) => (isCobot && id === 'cabinet' ? HOWTXT.cobotcab : isCobot && id === 'drive' ? HOWTXT.cobotdrv : !isArm && id === 'enc' ? [L('Encoder (on the motor)', 'Codeur (sur le moteur)'), L('Counts the turns of the wheel', 'Compte les tours de la roue')] : HOWTXT[id]);
  const howG = new THREE.Group(); scene.add(howG); howG.visible = false;
  const hp = (id) => { const h = HOW.find((q) => q.id === id); return h.robot ? V(RC.x, 0.012, -1.42) : V(h.x, 0.012, h.z); };
  const has = (id) => HOW.some((q) => q.id === id);
  const W2 = (a, b, type) => (has(a) && has(b) ? [a, b, type] : null);
  const ids = HOW.map((h) => h.id), first = (...c) => c.find((x) => ids.includes(x));
  const sensors = HOW.filter((h) => h.step === 1).map((h) => h.id), drv = first('drive', 'driver', 'esc'), mot = first('servo', 'mot3', 'dc'), sb = first('sbc', 'ai'), sf = first('estop', 'bumper'), cur = first('curtain', 'scanner');
  const hw = [];
  if (isArm) {
    hw.push(W2('cam', 'plc', 'sig'), W2(first('photo', 'prox'), 'plc', 'sig'), W2('ft', 'cabinet', 'sig'), W2('plc', 'cabinet', 'bus'), W2('pendant', 'cabinet', 'bus'), W2('cabinet', drv, 'bus'), W2('psu', 'cabinet', 'pow'), W2('psu', drv, 'pow'),
      W2(drv, 'servo', 'mot'), W2(drv, 'brake', 'pow'), W2('servo', 'harmonic', 'mech'), W2('harmonic', 'robot', 'mech'), W2('cabinet', 'gripper', 'sig'), W2('enc', drv, 'fb'),
      W2('estop', 'srelay', 'safe'), W2(cur, 'srelay', 'safe'), W2('jtq', 'srelay', 'safe'), W2('srelay', drv, 'safe'));
  } else {
    const out = first('wheel', 'prop');
    hw.push(W2('lidar', sb, 'sig'), W2(first('cam', 'cam3d'), sb, 'sig'), W2('us', 'mcu', 'sig'), W2('imu', 'mcu', 'sig'), W2(sb, 'mcu', 'bus'), W2('radio', sb, 'bus'), W2('mcu', drv, 'bus'), W2('battery', drv, 'pow'), W2('battery', sb, 'pow'),
      W2(drv, mot, 'mot'), W2(mot, 'planet', 'mech'), W2('planet', out, 'mech'), W2(out, 'robot', 'mech'), W2('enc', 'mcu', 'fb'),
      W2('estop', 'srelay', 'safe'), W2('bumper', 'srelay', 'safe'), W2('scanner', 'srelay', 'safe'), W2('srelay', drv, 'safe'));
    if (!has('planet')) hw.push(W2(mot, out || 'robot', 'mech'));
  }
  const howWires = hw.filter(Boolean).map(([a, b, type], k) => {
    const A = hp(a), B2 = hp(b), zm = (A.z + B2.z) / 2 + (k % 3 - 1) * 0.06;            // right-angled route on the floor, like real cable trays
    const pts = [A, V(A.x, 0.012, zm), V(B2.x, 0.012, zm), B2], col = WIRE[type][0];
    const segs = []; let tot = 0; for (let i = 0; i < 3; i++) { const l = pts[i].distanceTo(pts[i + 1]); segs.push(l); tot += l; }
    const at = (u) => { let d = u * tot; for (let i = 0; i < 3; i++) { if (d <= segs[i] || i === 2) return pts[i].clone().lerp(pts[i + 1], segs[i] ? Math.min(1, d / segs[i]) : 0); d -= segs[i]; } };
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 });
    for (let d = 0.04; d < tot - 0.04; d += 0.1) { const a2 = at(d / tot), b3 = at(Math.min(1, (d + 0.06) / tot)), m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.008, 1), mat); m.position.copy(a2).lerp(b3, 0.5); m.scale.z = Math.max(0.01, a2.distanceTo(b3)); m.lookAt(b3.x, m.position.y, b3.z); howG.add(m); }
    const pulses = [0, 1].map(() => { const sp2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), new THREE.MeshBasicMaterial({ color: type === 'safe' ? '#ffd400' : col })); sp2.visible = false; howG.add(sp2); return sp2; });
    return { a, b, type, at, pulses, mat };
  });
  // the encoder is mounted on the back of the motor: a short shaft joins them
  if (has('enc') && has(mot)) { const e = hp('enc'), m2 = hp(mot), sh = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 12), C.steel); sh.position.copy(e).lerp(m2, 0.5).setY(0.09); sh.scale.y = Math.max(0.05, e.distanceTo(m2) - 0.12); sh.quaternion.setFromUnitVectors(V(0, 1, 0), m2.clone().sub(e).setY(0).normalize()); howG.add(sh); }
  const howEl = host.querySelector('.sys-how');
  howEl.insertAdjacentHTML('beforeend', HOW.map((h, i) => `<span class="sys-hpin" data-h="${h.id}" style="--c:${h.robot ? '#6d5dfc' : CATS[PARTS[h.id][0]][1]}">${i + 1}</span>`).join(''));
  howEl.insertAdjacentHTML('beforeend', HOW.map((h, i) => `<div class="sys-hcard" data-h="${h.id}" style="--c:${h.robot ? '#6d5dfc' : CATS[PARTS[h.id][0]][1]}"><b>${i + 1}</b><div><strong>${TX(h.id)[0]}</strong><span>${TX(h.id)[1]}</span></div></div>`).join(''));
  // ---- the written explanation under the view: the loop step by step, for complete beginners
  const N = (id) => { const k = HOW.findIndex((h) => h.id === id); return k < 0 ? '' : `<b class="sys-n" style="--c:${HOW[k].robot ? '#6d5dfc' : CATS[PARTS[id][0]][1]}">${k + 1}</b> <strong>${TX(id)[0]}</strong>`; };
  const S1 = sensors.map(N).join(L(' and ', ' et '));
  const LIKE = (en, fr) => `<em class="sys-like">${L('Like in the human body: ', 'Comme dans le corps humain : ')}${L(en, fr)}</em>`;
  const STEPS = isArm ? [
    [1, L('1. The sensors see', '1. Les capteurs voient'), L(`${S1} watch the cell. The presence sensor sends a simple "yes / no" signal (24 V) when a part arrives on the conveyor. The camera takes a picture, finds exactly where the part is and checks that it is good. The sensors decide nothing: they only inform.`, `${S1} surveillent la cellule. Le capteur de présence envoie un simple signal « oui / non » (24 V) quand une pièce arrive sur le convoyeur. La caméra prend une photo, trouve exactement où est la pièce et vérifie qu'elle est bonne. Les capteurs ne décident rien : ils informent seulement.`), LIKE('the eyes.', 'les yeux.')],
    [2, L('2. Two brains decide', '2. Deux cerveaux décident'), L(`${N('plc')} is the brain of the <u>cell</u>: it reads all the sensors and follows the sequence ("a good part is here → robot, take it"). It sends this order to ${N('cabinet')}, the brain of the <u>robot</u>. The robot controller computes the path of the gripper and the angle each joint must reach (this calculation is called <i>inverse kinematics</i>), then sends a new position order to every drive each millisecond, through a fast network cable (EtherCAT).${isCobot ? ' On a cobot this controller is a small box, often programmed directly on the tablet.' : ''}`, `${N('plc')} est le cerveau de la <u>cellule</u> : il lit tous les capteurs et suit la séquence (« une bonne pièce est là → robot, prends-la »). Il envoie cet ordre à ${N('cabinet')}, le cerveau du <u>robot</u>. Le contrôleur robot calcule le trajet de la pince et l'angle que chaque articulation doit atteindre (ce calcul s'appelle la <i>cinématique inverse</i>), puis envoie une nouvelle consigne de position à chaque variateur toutes les millisecondes, par un câble réseau rapide (EtherCAT).${isCobot ? ' Sur un cobot, ce contrôleur est un petit boîtier, souvent programmé directement sur la tablette.' : ''}`), LIKE('the brain that plans the gesture.', 'le cerveau qui prépare le geste.')],
    [3, L('3. Power and the drive', '3. L\'énergie et le variateur'), L(`${N('psu')} turns the 230/400 V mains into the voltages each part needs. ${N(drv)} is an amplifier: it receives a tiny order ("go to 35.2°") and turns it into a strong electric current, exactly measured, for the motor: more current = more force.${isCobot ? ' On a cobot, the drive is a small board hidden inside each joint, right next to its motor.' : ' On an industrial robot the drives are in the controller cabinet, one per axis.'} ${N('pendant')} lets a person move the robot by hand and teach it its positions.`, `${N('psu')} transforme le secteur 230/400 V en tensions adaptées à chaque pièce. ${N(drv)} est un amplificateur : il reçoit une toute petite consigne (« va à 35,2° ») et la transforme en un courant électrique fort, exactement dosé, pour le moteur : plus de courant = plus de force.${isCobot ? ' Sur un cobot, le variateur est une petite carte cachée dans chaque articulation, juste à côté de son moteur.' : ' Sur un robot industriel, les variateurs sont dans l\'armoire, un par axe.'} ${N('pendant')} permet à une personne de bouger le robot à la main et de lui apprendre ses positions.`), LIKE('the food (energy) and the nerves that carry the order to the muscles.', 'la nourriture (l\'énergie) et les nerfs qui portent l\'ordre aux muscles.')],
    [4, L('4. The motor moves the robot', '4. Le moteur fait bouger le robot'), L(`${N(mot)} turns fast (about 3 000 turns per minute) but with little force. ${N('harmonic')} slows it down about 100 times and makes it about 100 times stronger. ${N('brake')} is released while the robot moves, and closes as soon as the power is cut so the arm cannot fall. The joints turn, ${N('robot')}, and ${N('gripper')} at the end grabs the part.`, `${N(mot)} tourne vite (environ 3 000 tours par minute) mais avec peu de force. ${N('harmonic')} le ralentit environ 100 fois et le rend environ 100 fois plus fort. ${N('brake')} est relâché pendant que le robot bouge, et se serre dès que le courant est coupé pour que le bras ne tombe pas. Les articulations tournent, ${N('robot')}, et ${N('gripper')} au bout attrape la pièce.`), LIKE('the muscles, and the hand.', 'les muscles, et la main.')],
    [5, L('5. The encoder closes the loop', '5. Le codeur ferme la boucle'), L(`${N('enc')} is fixed at the back of the motor, on the same shaft: motor and encoder form one block. At every instant it measures the real angle and sends it back to the drive. The drive compares: if the arm is behind, it gives more current; if it is ahead, less. This is called a <i>closed loop</i>, and it runs thousands of times per second: that is why a robot is so precise.`, `${N('enc')} est fixé au dos du moteur, sur le même arbre : moteur et codeur forment un seul bloc. À chaque instant il mesure l'angle réel et le renvoie au variateur. Le variateur compare : si le bras est en retard, il donne plus de courant ; s'il est en avance, moins. On appelle cela une <i>boucle fermée</i>, et elle tourne des milliers de fois par seconde : c'est pour cela qu'un robot est si précis.`), LIKE('the sense that tells you where your arm is, even with your eyes closed.', 'le sens qui vous dit où est votre bras, même les yeux fermés.')],
    [0, L('Safety, above everything', 'La sécurité, au-dessus de tout'), L(`${N(sf)} is <u>not</u> read by the program: it is wired to ${N('srelay')} — like ${N(cur)} at the entrance of the cell — a special relay with two separate channels (if one fails, the other still works). When someone presses it, the relay switches off the power of the drives (this is called STO, "Safe Torque Off") and the brakes close. The robot stops, even if the program has a bug.${isCobot ? ` On a cobot, ${N('jtq')} in every joint also feels the effort: if the cobot touches a person, the effort is different from what was expected and it stops. That is why a cobot can work without a cage.` : ' An industrial robot does not feel people: this is why it works inside a cage.'}`, `${N(sf)} n'est <u>pas</u> lu par le programme : il est câblé sur ${N('srelay')}, comme ${N(cur)} à l'entrée de la cellule : un relais spécial à deux voies séparées (si l'une tombe en panne, l'autre fonctionne encore). Quand quelqu'un appuie, le relais coupe la puissance des variateurs (on appelle cela STO, « Safe Torque Off ») et les freins se serrent. Le robot s'arrête, même si le programme a un bug.${isCobot ? ` Sur un cobot, ${N('jtq')} dans chaque articulation sent aussi l'effort : si le cobot touche une personne, l'effort est différent de celui prévu et il s'arrête. C'est pour cela qu'un cobot peut travailler sans cage.` : ' Un robot industriel ne sent pas les personnes : c\'est pour cela qu\'il travaille dans une cage.'}`), LIKE('the reflex that pulls your hand back from a hot plate, without thinking.', 'le réflexe qui retire votre main d\'une plaque chaude, sans réfléchir.')]
  ] : [
    [1, L('1. The sensors see', '1. Les capteurs voient'), L(`${S1} measure the world around the robot. The LiDAR is a laser that spins and measures thousands of distances per second: it draws the walls and obstacles all around. The other sensor watches what is very close, or how the robot is tilted.`, `${S1} mesurent le monde autour du robot. Le LiDAR est un laser qui tourne et mesure des milliers de distances par seconde : il dessine les murs et les obstacles tout autour. L'autre capteur surveille ce qui est tout proche, ou l'inclinaison du robot.`), LIKE('the eyes and the inner ear.', 'les yeux et l\'oreille interne.')],
    [2, L('2. Two brains decide', '2. Deux cerveaux décident'), L(`${N(sb)} is the "big brain": it builds a map, finds where the robot is on it and chooses a path around the obstacles. ${N('mcu')} is the "small fast brain": it turns this plan into precise speed orders for each motor, many times per second.`, `${N(sb)} est le « grand cerveau » : il construit une carte, trouve où est le robot dessus et choisit un chemin autour des obstacles. ${N('mcu')} est le « petit cerveau rapide » : il transforme ce plan en consignes de vitesse précises pour chaque moteur, plusieurs fois par seconde.`), LIKE('the brain that plans, and the spinal cord that reacts fast.', 'le cerveau qui planifie, et la moelle épinière qui réagit vite.')],
    [3, L('3. Energy and power', '3. L\'énergie et la puissance'), L(`${N('battery')} stores the energy and feeds the computer and the motors. ${N(drv)} takes it and switches it on and off very fast (this is called PWM): the longer it is "on", the faster the motor turns.`, `${N('battery')} stocke l'énergie et alimente l'ordinateur et les moteurs. ${N(drv)} la prend et l'allume et l'éteint très vite (on appelle cela le PWM) : plus elle est « allumée » longtemps, plus le moteur tourne vite.`), LIKE('the food (energy) and the nerves (orders).', 'la nourriture (l\'énergie) et les nerfs (les ordres).')],
    [4, L('4. The motors move the robot', '4. Les moteurs font bouger le robot'), L(`${N(mot)} turns fast; ${N('planet')} slows it down and makes it stronger; ${N(first('wheel', 'prop'))} pushes on the floor (or on the air), and ${N('robot')}: it drives, walks or flies along the chosen path.`, `${N(mot)} tourne vite ; ${N('planet')} le ralentit et le rend plus fort ; ${N(first('wheel', 'prop'))} pousse sur le sol (ou sur l'air), et ${N('robot')} : il roule, marche ou vole le long du chemin choisi.`), LIKE('the muscles.', 'les muscles.')],
    [5, L('5. The encoder closes the loop', '5. Le codeur ferme la boucle'), L(`${N('enc')} is fixed on the motor of each wheel. It counts the turns and sends them back to the microcontroller: knowing the size of the wheel, it calculates how far the robot really went (this is called <i>odometry</i>) and corrects the speeds. The sensors then update the map, and the loop starts again.`, `${N('enc')} est fixé sur le moteur de chaque roue. Il compte les tours et les renvoie au microcontrôleur : connaissant la taille de la roue, il calcule de combien le robot a vraiment avancé (on appelle cela l'<i>odométrie</i>) et corrige les vitesses. Les capteurs mettent ensuite la carte à jour, et la boucle recommence.`), LIKE('counting your steps to know how far you walked.', 'compter ses pas pour savoir quelle distance on a marché.')],
    [0, L('Safety, above everything', 'La sécurité, au-dessus de tout'), L(`${N(sf)} is <u>not</u> read by the computer: it is wired to ${N('srelay')}, which cuts the power of the motors directly. The robot stops at once, even if the computer has crashed. Its safety laser scanner can also slow it down, then stop it, when someone comes close.`, `${N(sf)} n'est <u>pas</u> lu par l'ordinateur : il est câblé sur ${N('srelay')}, qui coupe directement la puissance des moteurs. Le robot s'arrête aussitôt, même si l'ordinateur a planté. Son scanner laser de sécurité peut aussi le ralentir, puis l'arrêter, quand quelqu'un s'approche.`), LIKE('the reflex that pulls your hand back from a hot plate, without thinking.', 'le réflexe qui retire votre main d\'une plaque chaude, sans réfléchir.')]
  ];
  const GLOSS = isArm ? [
    [L('Sensor', 'Capteur'), L('a device that measures something (presence, distance, image, force) and turns it into an electric signal.', 'un appareil qui mesure quelque chose (présence, distance, image, effort) et le transforme en signal électrique.')],
    [L('PLC', 'Automate (PLC)'), L('an industrial computer, very robust, that runs the sequence of a machine or a cell.', 'un ordinateur industriel très robuste qui exécute la séquence d\'une machine ou d\'une cellule.')],
    [L('Robot controller', 'Contrôleur robot'), L('the computer of the robot: it computes every movement of the arm.', 'l\'ordinateur du robot : il calcule chaque mouvement du bras.')],
    [L('Drive', 'Variateur'), L('an electronic amplifier that gives the motor exactly the right current.', 'un amplificateur électronique qui donne au moteur exactement le bon courant.')],
    [L('Servomotor', 'Servomoteur'), L('a motor with an encoder, controlled in position: it goes exactly where it is told.', 'un moteur avec un codeur, commandé en position : il va exactement là où on lui dit.')],
    [L('Encoder', 'Codeur'), L('a sensor fixed on the motor shaft that measures its angle very precisely.', 'un capteur fixé sur l\'arbre du moteur qui mesure son angle très précisément.')],
    [L('Closed loop', 'Boucle fermée'), L('measure → compare with the target → correct → measure again… without stopping.', 'mesurer → comparer à la consigne → corriger → mesurer à nouveau… sans arrêt.')],
    [L('Inverse kinematics', 'Cinématique inverse'), L('the calculation that finds the angle of each joint to put the tool at a given point.', 'le calcul qui trouve l\'angle de chaque articulation pour placer l\'outil à un point donné.')],
    ['EtherCAT', L('a very fast industrial network: all the drives get their order in the same millisecond.', 'un réseau industriel très rapide : tous les variateurs reçoivent leur consigne dans la même milliseconde.')],
    [L('Safety relay / STO', 'Relais de sécurité / STO'), L('a certified relay that cuts the motor power ("Safe Torque Off") when a safety device opens.', 'un relais certifié qui coupe la puissance des moteurs (« Safe Torque Off ») quand un dispositif de sécurité s\'ouvre.')]
  ] : [
    [L('Sensor', 'Capteur'), L('a device that measures something (distance, tilt, image) and turns it into an electric signal.', 'un appareil qui mesure quelque chose (distance, inclinaison, image) et le transforme en signal électrique.')],
    ['LiDAR', L('a spinning laser that measures the distance to everything around the robot.', 'un laser qui tourne et mesure la distance à tout ce qui entoure le robot.')],
    [L('Microcontroller', 'Microcontrôleur'), L('a tiny computer on one chip (Arduino, STM32) that runs simple, fast loops.', 'un tout petit ordinateur sur une puce (Arduino, STM32) qui exécute des boucles simples et rapides.')],
    [L('Driver / PWM', 'Driver / PWM'), L('the board that switches the battery current on and off very fast to set the speed of a motor.', 'la carte qui allume et éteint très vite le courant de la batterie pour régler la vitesse d\'un moteur.')],
    [L('Encoder', 'Codeur'), L('a sensor on the motor that counts its turns.', 'un capteur sur le moteur qui compte ses tours.')],
    [L('Odometry', 'Odométrie'), L('estimating the distance travelled from the number of wheel turns.', 'estimer la distance parcourue à partir du nombre de tours de roue.')],
    [L('Closed loop', 'Boucle fermée'), L('measure → compare with the target → correct → measure again… without stopping.', 'mesurer → comparer à la consigne → corriger → mesurer à nouveau… sans arrêt.')],
    [L('Battery + BMS', 'Batterie + BMS'), L('the energy store, and the board that protects each of its cells.', 'la réserve d\'énergie, et la carte qui protège chacune de ses cellules.')],
    [L('Safety relay', 'Relais de sécurité'), L('a certified relay that cuts the motor power when an emergency stop is pressed.', 'un relais certifié qui coupe la puissance des moteurs quand on appuie sur un arrêt d\'urgence.')]
  ];
  const explainEl = host.querySelector('.sys-explain');
  explainEl.innerHTML = `<h3>${L('How it works, step by step', 'Comment ça marche, étape par étape')}</h3><p class="sys-intro">${L('Follow the numbers: they are the same as on the cards of the 3D view. A robot always works in a loop: it <b>senses</b>, it <b>decides</b>, it <b>acts</b>, then it <b>checks</b> the result, and starts again.', 'Suivez les numéros : ce sont les mêmes que sur les fiches de la vue 3D. Un robot fonctionne toujours en boucle : il <b>perçoit</b>, il <b>décide</b>, il <b>agit</b>, puis il <b>vérifie</b> le résultat, et recommence.')}</p><ol>${STEPS.map(([st2, title, txt, like]) => `<li data-s="${st2}" class="${st2 ? '' : 'safe'}"><span class="sys-sn">${st2 || '!'}</span><div><h4>${title}</h4><p>${txt}</p>${like}</div></li>`).join('')}</ol>
    <p class="sys-sum"><b>${L('In short', 'En résumé')} :</b> ${isArm ? L('sensors → PLC → robot controller → drive → motor → the robot moves → encoder → back to the drive. This loop runs thousands of times per second, and the safety loop can cut everything at any moment.', 'capteurs → automate → contrôleur robot → variateur → moteur → le robot bouge → codeur → retour au variateur. Cette boucle tourne des milliers de fois par seconde, et la boucle de sécurité peut tout couper à tout moment.') : L('sensors → computer → microcontroller → driver (with the battery) → motors → movement → encoders → back to the microcontroller. The safety loop can cut everything at any moment.', 'capteurs → ordinateur → microcontrôleur → driver (avec la batterie) → moteurs → mouvement → codeurs → retour au microcontrôleur. La boucle de sécurité peut tout couper à tout moment.')}</p>
    <h3 class="sys-gh">${L('Words to remember', 'Les mots à retenir')}</h3><dl class="sys-gloss">${GLOSS.map(([t2, d2]) => `<div><dt>${t2}</dt><dd>${d2}</dd></div>`).join('')}</dl>`;
  howEl.querySelectorAll('.sys-hcard').forEach((c) => c.addEventListener('click', () => { if (c.dataset.h !== 'robot') select(c.dataset.h, false); }));

  let layer = 0;
  // where each part goes for the current layer: a neat row in front of the robot (or its place on the bench for the whole system)
  function targets() {
    const out = {}, last = layer === LAYERS.length - 1, act = last ? list : list.filter((p) => layerOf(p) === layer), n = act.length, sp = Math.min(0.62, 4.3 / Math.max(1, n));
    if (last) { for (const h of HOW) out[h.id] = V(h.x, 0, h.z); return out; }
    act.forEach((p, i) => { out[p.id] = V((i - (n - 1) / 2) * sp, 0, -1.0); });
    return out;
  }
  let goals = {};
  const lchips = host.querySelectorAll('.sys-lchips button'), lcard = host.querySelector('.sys-lcard');
  function setLayer(i) {
    layer = Math.max(0, Math.min(LAYERS.length - 1, i)); goals = targets(); if (sel) select(sel, false);
    lchips.forEach((b, k) => b.setAttribute('aria-pressed', String(k === layer)));
    host.querySelector('.sys-prev').disabled = layer === 0; host.querySelector('.sys-next').disabled = layer === LAYERS.length - 1;
    lcard.querySelector('h3').textContent = (layer && layer < LAYERS.length - 1 ? L('Layer ', 'Couche ') + layer + ' · ' : '') + LAYERS[layer][0]; lcard.querySelector('p').textContent = LAYERS[layer][2];
    const all = layer === LAYERS.length - 1; host.classList.toggle('sys-all-on', all); explainEl.hidden = !all;
    if (!all && playing) playBtn.click();
    labsEl.querySelectorAll('button').forEach((b) => { b.hidden = !goals[b.dataset.p] || all; });
    lcard.querySelector('.sys-lparts').innerHTML = all ? '' : list.filter((p) => goals[p.id]).map((p) => `<button type="button" data-p="${p.id}" style="--c:${CATS[p.def[0]][1]}" class="${p.id === sel ? 'on' : ''}"><b>${p.n}</b>${p.def[2][0][FR ? 1 : 0]}</button>`).join('');   // the names, as a list (shown on phones, where the view shows only numbers)
    const H = layer === 0 ? ROBOTCAM : all ? HOME : LAYERCAM; fly(H.p.clone(), H.t.clone());
  }
  host.querySelector('.sys-prev').addEventListener('click', () => setLayer(layer - 1));
  host.querySelector('.sys-next').addEventListener('click', () => setLayer(layer + 1));
  lchips.forEach((b) => b.addEventListener('click', () => setLayer(+b.dataset.l)));

  // ------------------------------------------------ number pins + cards
  labsEl.insertAdjacentHTML('beforeend', list.map((p) => `<button type="button" data-p="${p.id}" style="--c:${CATS[p.def[0]][1]}" hidden><b>${p.n}</b>${p.def[2][0][FR ? 1 : 0]}</button>`).join(''));
  pinsEl.innerHTML = list.map((p) => `<button type="button" data-p="${p.id}" style="--c:${CATS[p.def[0]][1]}" title="${p.def[2][0][FR ? 1 : 0]}">${p.n}</button>`).join('');
  const byCat = {}; list.forEach((p) => { const k = layerOf(p); (byCat[k] = byCat[k] || []).push(p); });
  catsEl.innerHTML = Object.entries(byCat).sort((a, b) => a[0] - b[0]).map(([k, ps]) => `<section style="--c:${CATS[ps[0].def[0]][1]}"><h3>${L('Layer ', 'Couche ')}${k} · ${LAYERS[k][0]}</h3><ul>${ps.map((p) => `<li><button type="button" data-p="${p.id}"><b>${p.n}</b><span><strong>${p.def[2][0][FR ? 1 : 0]}</strong><small>${p.def[2][1][FR ? 1 : 0]}</small><em>${p.def[2][2][FR ? 1 : 0]}</em></span></button></li>`).join('')}</ul></section>`).join('');
  let sel = null, camGoal = null, camFrom = null, camK = 1;
  const HOME = { p: V(0.1, 5.6, 5.4), t: V(0.0, 0, -0.45) };
  function fly(p, t) { camFrom = { p: camera.position.clone(), t: orbit.target.clone() }; camGoal = { p, t }; camK = 0; }
  // small view buttons: 3D / top / front / side, zoom, full screen
  const viewBtns = host.querySelectorAll('.sys-views [data-v]');
  viewBtns.forEach((b) => b.addEventListener('click', () => {
    const tg = orbit.target.clone(), d = Math.max(2.2, camera.position.distanceTo(tg)), k = b.dataset.v;
    const dir = k === 'top' ? V(0, 1, 0.0008) : k === 'front' ? V(0, 0.18, 1) : k === 'side' ? V(1, 0.18, 0) : V(0.2, 0.62, 0.95);
    fly(tg.clone().addScaledVector(dir.normalize(), d), tg); viewBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  host.querySelectorAll('.sys-zoom').forEach((b) => b.addEventListener('click', () => { const tg = orbit.target.clone(), f = b.dataset.z === 'out' ? 1.35 : 1 / 1.35; fly(tg.clone().add(camera.position.clone().sub(tg).multiplyScalar(f)), tg); }));
  const fullBtn = host.querySelector('.sys-full');
  fullBtn.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else if (stage.requestFullscreen) stage.requestFullscreen(); });
  document.addEventListener('fullscreenchange', () => { const on = document.fullscreenElement === stage; host.classList.toggle('sys-fs', on); fullBtn.innerHTML = on ? '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'; });
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
      if (flyTo && layer === LAYERS.length - 1) { const a = anchors[sel], sw = objs[sel].userData.slot, mid = a.mid.clone().lerp(sw, 0.5); fly(mid.clone().add(V(0.3, 1.0, 1.0).multiplyScalar(Math.max(2.0, a.mid.distanceTo(sw) * 1.45))), mid); }
    }
  }
  host.addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b && host.contains(b)) { const p = list.find((q) => q.id === b.dataset.p); if (b.closest('.sys-cats') && layer !== layerOf(p) && layer !== LAYERS.length - 1) setLayer(layerOf(p)); select(b.dataset.p, false); if (b.closest('.sys-cats')) stage.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  allBtn.addEventListener('click', () => { if (sel) select(sel, false); setLayer(LAYERS.length - 1); });
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
  // the animation goes step by step, slowly; it can be paused and moved by hand, for people who read slowly
  const STEP_T = 7, fTxt = flowEl.querySelector('.sys-ftxt'), fPauseBtn = flowEl.querySelector('.sys-fpause'); let fPaused = false;
  const setPause = (on) => { fPaused = on; fPauseBtn.textContent = on ? '▶' : '❚❚'; fPauseBtn.setAttribute('aria-label', on ? L('Resume', 'Reprendre') : L('Pause', 'Pause')); fPauseBtn.title = fPauseBtn.getAttribute('aria-label'); };
  setPause(false);
  fPauseBtn.addEventListener('click', () => setPause(!fPaused));
  flowEl.querySelector('.sys-fprev').addEventListener('click', () => { fStep = (fStep + FLOW.length - 1) % FLOW.length; fT = 0; setPause(true); });
  flowEl.querySelector('.sys-fnext').addEventListener('click', () => { fStep = (fStep + 1) % FLOW.length; fT = 0; setPause(true); });
  playBtn.addEventListener('click', () => { setPause(false); if (layer !== LAYERS.length - 1 && !playing) setLayer(LAYERS.length - 1); playing = !playing; fStep = 0; fT = 0; playBtn.textContent = playing ? L('■ Stop the animation', '■ Arrêter l\'animation') : L('▶ How it works', '▶ Comment ça marche'); playBtn.classList.toggle('on', playing); flowEl.hidden = !playing; if (playing && sel) select(sel, false); if (playing && camK >= 1) fly(HOME.p.clone(), HOME.t.clone()); });
  stopBtn.addEventListener('click', () => { stopped = !stopped; stopBtn.classList.toggle('on', stopped); stopBtn.textContent = stopped ? L('Reset the emergency stop', 'Réarmer l\'arrêt d\'urgence') : L('Emergency stop', 'Arrêt d\'urgence'); host.classList.toggle('estop', stopped); });
  const active = () => (stopped ? ['safe'] : playing ? FLOW[fStep][0] : []);
  function frame(dt) {
    t += dt;
    if (playing && !stopped) { if (!fPaused) { fT += dt; if (fT > STEP_T) { fT = 0; fStep = (fStep + 1) % FLOW.length; } } fTxt.textContent = `${fStep + 1}/${FLOW.length} · ` + FLOW[fStep][1].replace(/^\d+\.\s*/, ''); flowEl.className = 'sys-flow' + (fPaused ? ' paused' : ''); }
    if (stopped) { flowEl.hidden = false; flowEl.className = 'sys-flow stop'; fTxt.textContent = L('EMERGENCY STOP: the safety loop is open, power to the motors is cut and the brakes are on. Nothing moves until it is reset.', 'ARRÊT D\'URGENCE : la boucle de sécurité est ouverte, la puissance des moteurs est coupée et les freins sont serrés. Rien ne bouge avant le réarmement.'); }
    else if (!playing) flowEl.hidden = true;
    const act = active();
    for (const w of wires) {
      const on = act.includes(w.type) || (playing && !stopped && w.type === 'pow' && fStep >= 2);
      w.pulses.forEach((s, i) => { s.visible = false; if (s.visible) { let u = ((t * 0.45 + i / 3) % 1); if (w.back || (w.type === 'safe' && false)) u = 1 - u; s.position.copy(w.curve.getPointAt(u)); } });
      if (w.type === 'mech') w.tube.material.color.set(on ? '#ffffff' : WIRE.mech[0]);
    }
    // moving parts
    const run = !stopped && (!playing || fStep >= 3);
    for (const p of list) { const o = objs[p.id], sp = o.userData.spin; if (sp) { const ax = o.userData.spinAxis || 'z'; if (run || p.id === 'lidar' || p.id === 'ai') sp.rotation[ax] += dt * (p.id === 'prop' ? 25 : 4); } if (o.userData.rod) o.userData.rod.position.x = 0.1 + (run ? 0.035 * Math.sin(t * 2) : 0); }
    if (objs.estop) objs.estop.children[2].position.y = stopped ? 0.06 : 0.072;
    // parts: each one moves to its goal for this layer, or back into the robot (where it is hidden)
    const all = layer === LAYERS.length - 1, kk = Math.min(1, dt * 3.2);
    for (const p of list) {
      const o = objs[p.id], u = o.userData, g = goals[p.id];
      if (!u.cur) { u.cur = u.slot.clone(); u.sc = 0.3; }
      const to = g || u.slot; u.cur.lerp(to, kk); u.sc += ((g ? (all ? u.rowS * 1.15 : u.rowS) : 0.3) - u.sc) * kk;
      const left = u.cur.distanceTo(to), lift = g && left > 0.05 ? Math.min(0.5, left * 0.4) : 0;
      o.position.copy(u.cur); o.position.y += lift; o.scale.setScalar(u.hs * u.sc); o.visible = !!g || u.cur.distanceTo(u.slot) > 0.08;
      u.ring.visible = false;
      const L2 = leaders[p.id]; L2.ln.visible = L2.dot.visible = !!g && !all && left < 0.3;
      if (L2.ln.visible) { const b0 = new THREE.Box3().setFromObject(o), top = V(o.position.x, b0.max.y + 0.02, o.position.z); L2.ln.geometry.setFromPoints([top, u.slot]); L2.ln.computeLineDistances(); L2.dot.position.copy(u.slot); L2.dot.scale.setScalar(sel === p.id ? 1.4 + 0.3 * Math.sin(t * 6) : 1); L2.ln.material.opacity = !sel || sel === p.id ? 1 : 0.25; }
    }
    wires.forEach((w) => { w.tube.visible = false; });
    // the clean "how it works" view: dashed cables, moving pulses on the active step, callout cards with arrows
    const settled = all && HOW.every((h) => h.robot || objs[h.id].userData.cur.distanceTo(V(h.x, 0, h.z)) < 0.05);
    const narrow = stage.clientWidth < 700; howG.visible = settled; howEl.hidden = !settled; host.classList.toggle('sys-how-on', settled); host.classList.toggle('sys-narrow', narrow);   // phones: numbers on the parts only, the cards are the list under the view
    const act2 = active();
    for (const w of howWires) {
      const on = act2.includes(w.type) || (playing && !stopped && w.type === 'pow' && fStep >= 2);
      w.mat.opacity = !playing && !stopped ? 0.85 : on ? 1 : 0.25;
      w.pulses.forEach((sp2, i) => { sp2.visible = settled && on; if (sp2.visible) { let u2 = (t * 0.5 + i / 2) % 1; if (w.type === 'fb') u2 = 1 - u2; sp2.position.copy(w.at(u2)).add(V(0, 0.03, 0)); } });
    }
    // numbers on the parts (whole system) and names under the row (layers)
    const r = stage.getBoundingClientRect(), v = V(0, 0, 0);
    pinsEl.hidden = true;
    if (all) pinsEl.querySelectorAll('button').forEach((b) => { v.copy(anchors[b.dataset.p].top).add(V(0, 0.06, 0)).project(camera); b.style.display = v.z > 1 ? 'none' : ''; b.style.left = ((v.x + 1) / 2 * r.width) + 'px'; b.style.top = ((1 - v.y) / 2 * r.height) + 'px'; });
    const labs = [...labsEl.querySelectorAll('button')].filter((b) => !b.hidden), svgL = labsEl.querySelector('svg'); svgL.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    let d = '';
    if (labs.length) {
      const items = labs.map((b) => { const o = objs[b.dataset.p]; v.copy(o.position).project(camera); return { el: b, x: (v.x + 1) / 2 * r.width, y: (1 - v.y) / 2 * r.height }; }).sort((a, b) => a.x - b.x);
      const tiers = [[], []]; items.forEach((it, i) => tiers[i % 2].push(it));
      labsEl.classList.remove('compact');                       // names too wide for the view (phones): only the numbers, the list under the view gives the names
      if (tiers.some((tier) => tier.reduce((a, it) => a + (it.el.offsetWidth || 120) + 6, 0) > r.width - 16)) labsEl.classList.add('compact');
      host.classList.toggle('sys-compact', labsEl.classList.contains('compact'));
      tiers.forEach((tier, k) => {                              // two tiers of names under the row, in the same order as the parts: no crossing lines
        const Y = r.height - 26 - k * 34; let prev = -Infinity;
        for (const it of tier) { const half = (it.el.offsetWidth || 120) / 2; it.p = Math.max(8 + half, it.x, prev + 6 + half); prev = it.p + half; }
        let next = Infinity; for (const it of tier.slice().reverse()) { const half = (it.el.offsetWidth || 120) / 2; it.p = Math.min(it.p, r.width - 8 - half, next - 6 - half); next = it.p - half; }
        for (const it of tier) { const col = it.el.style.getPropertyValue('--c'); it.el.style.left = it.p + 'px'; it.el.style.top = Y + 'px'; d += `<line x1="${it.x.toFixed(1)}" y1="${(it.y + 4).toFixed(1)}" x2="${it.p.toFixed(1)}" y2="${(Y - 13).toFixed(1)}" style="stroke:${col}" class="${it.el.dataset.p === sel ? 'on' : ''}"/><circle cx="${it.x.toFixed(1)}" cy="${(it.y + 4).toFixed(1)}" r="3.5" style="fill:${col}"/>`; }
      });
    }
    svgL.innerHTML = d;
    if (settled && narrow) { howEl.querySelectorAll('.sys-hcard').forEach((c) => { const h = HOW.find((q) => q.id === c.dataset.h), w3 = h.robot ? robotAnchor() : (() => { const b0 = new THREE.Box3().setFromObject(objs[h.id]); return V(objs[h.id].position.x, b0.max.y, objs[h.id].position.z); })(); v.copy(w3).project(camera); const pin = howEl.querySelector(`.sys-hpin[data-h="${h.id}"]`); pin.style.left = ((v.x + 1) / 2 * r.width) + 'px'; pin.style.top = ((1 - v.y) / 2 * r.height - 14) + 'px'; }); howEl.querySelector('svg g').innerHTML = ''; }
    if (settled && !narrow) {                                             // cards in a left and a right column, in the same top-to-bottom order as their parts: arrows never cross
      const curStep = stopped ? 0 : playing ? fStep + 1 : -1, items = [];
      explainEl.querySelectorAll('li').forEach((li) => li.classList.toggle('on', +li.dataset.s === curStep));
      howEl.querySelectorAll('.sys-hcard').forEach((c) => { const h = HOW.find((q) => q.id === c.dataset.h), w3 = h.robot ? robotAnchor() : (() => { const b0 = new THREE.Box3().setFromObject(objs[h.id]); return V(objs[h.id].position.x, b0.max.y, objs[h.id].position.z); })();
        v.copy(w3).project(camera); const it2 = { el: c, x: (v.x + 1) / 2 * r.width, y: (1 - v.y) / 2 * r.height - 14 }; items.push(it2);
        const pin = howEl.querySelector(`.sys-hpin[data-h="${h.id}"]`); pin.style.left = it2.x + 'px'; pin.style.top = it2.y + 'px'; pin.classList.toggle('dim', curStep >= 0 && !(h.step === curStep || (curStep === 3 && h.id === 'battery')));
        c.classList.toggle('on', curStep >= 0 && (h.step === curStep || (curStep === 3 && h.id === 'battery'))); c.classList.toggle('dim', curStep >= 0 && !c.classList.contains('on')); c.classList.toggle('sel', h.id === sel); });
      const cols = [items.filter((it) => it.x < r.width / 2), items.filter((it) => it.x >= r.width / 2)]; let ad = '';
      // segments a-b and c-d cross?
      const cross = (a, b, c, d) => { const o = (p, q, r2) => Math.sign((q[0] - p[0]) * (r2[1] - p[1]) - (q[1] - p[1]) * (r2[0] - p[0])); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
      cols.forEach((col, k) => {
        col.sort((a, b) => a.y - b.y);
        const ww = (it) => it.el.offsetWidth || 200, hh = (it) => it.el.offsetHeight || 54;
        const place = () => {                                  // stack the cards in the current order, as close as possible to their parts
          let prev = (k ? 54 : 8) - 6; for (const it of col) { it.top = Math.max(prev + 6, it.y - hh(it) / 2); prev = it.top + hh(it); }
          let next = r.height - 8; for (const it of col.slice().reverse()) { it.top = Math.min(it.top, next - hh(it)); next = it.top - 6; }
          for (const it of col) { const x0 = k ? r.width - 8 - ww(it) : 8; it.a = [k ? x0 : x0 + ww(it), it.top + hh(it) / 2]; it.b = [it.x + (k ? 11 : -11), it.y]; it.x0 = x0; }
        };
        place();
        // untangle: while two arrows cross, swap the places of their cards (each swap makes the arrows shorter, so it ends)
        for (let pass = 0; pass < 300; pass++) {
          let found = false;
          for (let i = 0; i < col.length && !found; i++) for (let j = i + 1; j < col.length && !found; j++) if (cross(col[i].a, col[i].b, col[j].a, col[j].b)) { [col[i], col[j]] = [col[j], col[i]]; place(); found = true; }
          if (!found) break;
        }
        for (const it of col) { it.el.style.left = it.x0 + 'px'; it.el.style.top = it.top + 'px';
          ad += `<path d="M${it.a[0].toFixed(1)},${it.a[1].toFixed(1)} L${it.b[0].toFixed(1)},${it.b[1].toFixed(1)}" style="stroke:${it.el.style.getPropertyValue('--c')}" class="${it.el.classList.contains('dim') ? 'dim' : ''}" marker-end="url(#sysarr)"/>`; }
      });
      howEl.querySelector('svg').setAttribute('viewBox', `0 0 ${r.width} ${r.height}`); howEl.querySelector('svg g').innerHTML = ad;
    }
    // names of the objects around the robot (cabinet, desk, conveyor, light curtain…), on the robot and layer views
    cellEl.hidden = all;
    if (!all) [...cellEl.children].forEach((el, i) => { const w3 = i < cellLabels.length ? (cellLabels[i][2] ? cellLabels[i][2].clone() : RC.clone().add(cellLabels[i][1])) : oper.localToWorld(V(0, 1.95, 0)); v.copy(w3).project(camera); el.style.display = v.z > 1 ? 'none' : ''; el.style.left = ((v.x + 1) / 2 * r.width) + 'px'; el.style.top = ((1 - v.y) / 2 * r.height) + 'px'; });
    if (camK < 1 && camGoal) { camK = Math.min(1, camK + dt / 1.1); const e = camK * camK * (3 - 2 * camK); camera.position.copy(camFrom.p.clone().lerp(camGoal.p, e)); orbit.target.copy(camFrom.t.clone().lerp(camGoal.t, e)); }
  }
  function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = camera.aspect < 0.9 ? 50 : 36; camera.updateProjectionMatrix();
    if (camera.aspect < 0.9) { HOME.p.set(3.6, 7.6, -0.45); LAYERCAM.p.set(0.1, 3.6, 3.2); } else { HOME.p.set(0.1, 5.6, 5.4); LAYERCAM.p.set(0.15, 3.0, 3.4); } }   // portrait screens look along the bench
  new ResizeObserver(resize).observe(stage); resize();
  camera.position.copy(ROBOTCAM.p); orbit.target.copy(ROBOTCAM.t); setLayer(0); camK = 1;
  let visible = true, last = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(stage);
  renderer.setAnimationLoop((now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!visible) return; frame(dt); orbit.update(); renderer.render(scene, camera); });
  host.__layer = (i) => { setLayer(i); camK = 1; const H = layer === 0 ? ROBOTCAM : layer === LAYERS.length - 1 ? HOME : LAYERCAM; camera.position.copy(H.p); orbit.target.copy(H.t); for (const p of list) { const g = goals[p.id], u = objs[p.id].userData; u.cur = (g || u.slot).clone(); u.sc = g ? (layer === LAYERS.length - 1 ? u.rowS * 1.15 : u.rowS) : 0.3; } };
  host.__test = () => ({ parts: list.length, wires: wires.length, missing: SET.parts.filter(([id]) => !PARTS[id] || !B[PARTS[id][1]]).map((p) => p[0]) });
}
document.querySelectorAll('.sysdemo').forEach(mount);
