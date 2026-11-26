// el-figs.mjs — circuit drawings and signal plots of the electronics and Arduino course.
// Components are drawn between two points: the body sits in the middle, wires fill the rest.
import { T, LINE, ARROW, DOT, COL as C } from '../practice/fig.mjs';
const fx = (v) => +v.toFixed(1);
const BG = (W, H) => `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
const out = (W, H, s) => ({ vb: `0 0 ${W} ${H}`, svg: BG(W, H) + s });
const INK = C.ink, WIRE = '#c9d3de';
export const wire = (...pts) => `<polyline points="${pts.map((p) => p.map(fx).join(',')).join(' ')}" fill="none" stroke="${WIRE}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;

// the bodies, drawn along +x from 0 to len, centred on y = 0
const BODY = {
  res: [44, () => `<polyline points="0,0 4,-9 11,9 18,-9 25,9 32,-9 39,9 44,0" fill="none" stroke="${C.o}" stroke-width="2.5" stroke-linejoin="round"/>`],
  bat: [24, () => `<line x1="8" y1="-18" x2="8" y2="18" stroke="${INK}" stroke-width="3"/><line x1="16" y1="-10" x2="16" y2="10" stroke="${INK}" stroke-width="5"/>`],
  led: [30, () => `<path d="M4,-11 L4,11 L24,0 Z" fill="${C.r}" stroke="${C.r}" stroke-width="2"/><line x1="25" y1="-12" x2="25" y2="12" stroke="${C.r}" stroke-width="3"/>` +
    `<path d="M14,-14 l8,-10 M18,-14 l8,-10" stroke="${C.y}" stroke-width="2" fill="none"/><path d="M22,-24 l-5,1 l3,3 z M26,-24 l-5,1 l3,3 z" fill="${C.y}"/>`],
  diode: [28, () => `<path d="M4,-10 L4,10 L22,0 Z" fill="none" stroke="${C.p}" stroke-width="2.5"/><line x1="23" y1="-11" x2="23" y2="11" stroke="${C.p}" stroke-width="3"/>`],
  sw: [34, () => `<circle cx="3" cy="0" r="3" fill="${INK}"/><circle cx="31" cy="0" r="3" fill="${INK}"/><line x1="3" y1="0" x2="29" y2="-13" stroke="${INK}" stroke-width="2.5"/><line x1="17" y1="-7" x2="17" y2="-20" stroke="${INK}" stroke-width="2"/><line x1="10" y1="-20" x2="24" y2="-20" stroke="${INK}" stroke-width="2.5"/>`],
  motor: [36, () => `<circle cx="18" cy="0" r="17" fill="#262c35" stroke="${C.b}" stroke-width="2.5"/>`],
  pot: [44, () => `<polyline points="0,0 4,-9 11,9 18,-9 25,9 32,-9 39,9 44,0" fill="none" stroke="${C.o}" stroke-width="2.5" stroke-linejoin="round"/>`]
};
// part(kind, x1, y1, x2, y2): a component between two points
export function part(kind, x1, y1, x2, y2) {
  const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, [b, draw] = BODY[kind], s0 = (L - b) / 2;
  let g = `<g transform="translate(${fx(x1)},${fx(y1)}) rotate(${fx(a)})">` + `<line x1="0" y1="0" x2="${fx(s0)}" y2="0" stroke="${WIRE}" stroke-width="2.5"/><line x1="${fx(s0 + b)}" y1="0" x2="${fx(L)}" y2="0" stroke="${WIRE}" stroke-width="2.5"/>` + `<g transform="translate(${fx(s0)},0)">${draw()}</g></g>`;
  if (kind === 'motor') g += T((x1 + x2) / 2, (y1 + y2) / 2 + 5, 'M', { raw: true, a: 'middle', b: true, c: C.b, fs: 15 });
  return g;
}
export const GND = (x, y) => LINE(x, y, x, y + 10, WIRE, 2.5) + LINE(x - 14, y + 10, x + 14, y + 10, INK, 2.5) + LINE(x - 9, y + 16, x + 9, y + 16, INK, 2.5) + LINE(x - 4, y + 22, x + 4, y + 22, INK, 2.5);
const NODE = (x, y) => DOT(x, y, WIRE, 4.5);
const LAB = (x, y, s, o = {}) => T(x, y, s, { fs: 13, ...o, raw: typeof s === 'string' ? true : o.raw });
const CURR = (x1, y1, x2, y2, s) => ARROW(x1, y1, x2, y2, C.g, 2.5) + (s ? T((x1 + x2) / 2 + (y1 === y2 ? 0 : 10), (y1 + y2) / 2 + (y1 === y2 ? -10 : 4), s, { raw: true, c: C.g, fs: 14, b: true, a: y1 === y2 ? 'middle' : 'start' }) : '');
// a block with a title (an Arduino, a driver, a regulator)
const BLOCK = (x, y, w, h, title, col = C.b) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#262c35" stroke="${col}" stroke-width="2"/>` + T(x + w / 2, y + 20, title, { a: 'middle', b: true, fs: 14, c: col });

// ------------------------------------------------------------------ lesson 1: an LED and its resistor; a voltage divider
export function ledLoop() {
  const W = 580, H = 290;
  let s = wire([90, 70], [90, 60], [470, 60], [470, 75]) + wire([470, 215], [470, 230], [90, 230], [90, 205]);
  s += part('bat', 90, 70, 90, 205) + part('res', 200, 60, 360, 60) + part('led', 470, 75, 470, 215);
  s += LAB(60, 125, '+', { c: C.r, b: true, fs: 18 }) + LAB(48, 148, ['5 V', '5 V'], { a: 'end', b: true }) + LAB(280, 40, 'R = 220 Ω', { a: 'middle', b: true, c: C.o });
  s += LAB(506, 140, ['LED', 'LED'], { b: true, c: C.r }) + LAB(506, 160, ['drops 2 V', 'chute de 2 V'], { c: C.r });
  s += CURR(130, 82, 190, 82) + LAB(160, 104, 'I', { c: C.g, b: true, fs: 15, a: 'middle' }) + CURR(330, 212, 250, 212);
  s += LAB(280, 268, ['I = (5 − 2) / 220 = 13.6 mA', 'I = (5 − 2) / 220 = 13,6 mA'], { a: 'middle', b: true, c: C.g });
  return out(W, H, s);
}
export function divider() {
  const W = 460, H = 300;
  let s = wire([110, 50], [110, 40], [250, 40], [250, 60]) + wire([250, 250], [250, 262], [110, 262], [110, 240]);
  s += part('bat', 110, 50, 110, 240) + part('res', 250, 60, 250, 150) + part('res', 250, 150, 250, 250) + NODE(250, 150) + wire([250, 150], [370, 150]) + DOT(370, 150, C.y, 6);
  s += LAB(80, 140, ['Vin', 'Vin'], { a: 'end', b: true }) + LAB(270, 110, 'R1', { b: true, c: C.o }) + LAB(270, 205, 'R2', { b: true, c: C.o });
  s += LAB(380, 140, ['Vout', 'Vout'], { b: true, c: C.y }) + LAB(380, 160, ['→ A0', '→ A0'], { c: C.y }) + LAB(230, 290, ['Vout = Vin × R2 / (R1 + R2)', 'Vout = Vin × R2 / (R1 + R2)'], { a: 'middle', b: true, c: C.y });
  return out(W, H, s);
}
// ------------------------------------------------------------------ lesson 2: the power of a small robot
export function powerTree() {
  const W = 680, H = 330;
  let s = BLOCK(20, 110, 140, 80, ['Battery 2S LiPo', 'Batterie LiPo 2S'], C.o) + LAB(90, 160, '7.4 V', { a: 'middle', c: C.o }) + LAB(90, 178, '2200 mAh', { a: 'middle', c: C.axis, fs: 12 });
  s += BLOCK(240, 30, 150, 80, ['Buck 5 V', 'Abaisseur 5 V'], C.y) + LAB(315, 80, ['efficiency ≈ 90 %', 'rendement ≈ 90 %'], { a: 'middle', c: C.axis, fs: 12 });
  s += BLOCK(470, 30, 190, 80, ['Arduino + sensors', 'Arduino + capteurs'], C.b) + LAB(565, 80, '5 V, 0.2 A', { a: 'middle', c: C.axis, fs: 12 });
  s += BLOCK(240, 190, 150, 80, ['Motor driver', 'Pilote moteurs'], C.p) + BLOCK(470, 190, 190, 80, ['2 DC motors', '2 moteurs CC'], C.g) + LAB(565, 240, '7.4 V, 2 × 1 A', { a: 'middle', c: C.axis, fs: 12 });
  s += ARROW(160, 135, 238, 75, C.o) + ARROW(160, 165, 238, 225, C.o) + ARROW(390, 70, 468, 70, C.y) + ARROW(390, 230, 468, 230, C.p);
  s += ARROW(565, 112, 340, 188, C.b, 1.8) + LAB(470, 168, ['PWM, direction', 'PWM, sens'], { c: C.b, fs: 12 });
  s += `<line x1="20" y1="296" x2="660" y2="296" stroke="${C.axis}" stroke-width="2" stroke-dasharray="6 5"/>` + LAB(340, 318, ['one common ground (GND) for every block', 'une masse commune (GND) pour tous les blocs'], { a: 'middle', c: C.axis, fs: 12 });
  return out(W, H, s);
}
// ------------------------------------------------------------------ lesson 3: an LED on pin 13
export function blinkWiring() {
  const W = 600, H = 270;
  let s = BLOCK(20, 30, 200, 210, ['Arduino Uno', 'Arduino Uno'], C.b);
  [['13', 80], ['~5', 110], ['2', 140], ['A0', 170], ['GND', 200]].forEach(([p, y]) => { s += `<rect x="204" y="${y - 7}" width="16" height="14" fill="#11161c" stroke="${C.axis}"/>` + LAB(196, y + 4, p, { a: 'end', fs: 12, c: C.axis }); });
  s += wire([220, 80], [270, 80]) + part('res', 270, 80, 380, 80) + wire([380, 80], [440, 80], [440, 95]) + part('led', 440, 95, 440, 175) + wire([440, 175], [440, 200], [220, 200]);
  s += LAB(325, 62, '220 Ω', { a: 'middle', b: true, c: C.o }) + LAB(482, 140, ['LED', 'LED'], { b: true, c: C.r }) + LAB(482, 158, ['long leg (+) up', 'grande patte (+) en haut'], { c: C.axis, fs: 12 });
  s += LAB(330, 228, ['pin 13 HIGH = 5 V → the LED is on', 'broche 13 à HIGH = 5 V → la LED s\'allume'], { a: 'middle', c: C.g });
  return out(W, H, s);
}
// ------------------------------------------------------------------ lesson 4: a button with a pull-up resistor; the ultrasonic echo
export function pullup() {
  const W = 520, H = 300;
  let s = LAB(150, 34, '5 V', { a: 'middle', b: true, c: C.r }) + wire([150, 42], [150, 55]) + part('res', 150, 55, 150, 145) + LAB(170, 105, ['pull-up 20–50 kΩ (inside the chip)', 'tirage 20–50 kΩ (dans la puce)'], { c: C.o, fs: 12 });
  s += NODE(150, 145) + wire([150, 145], [330, 145]) + DOT(330, 145, C.y, 6) + LAB(340, 140, ['pin 2', 'broche 2'], { b: true, c: C.y }) + LAB(340, 160, ['INPUT_PULLUP', 'INPUT_PULLUP'], { c: C.y, fs: 12 });
  s += part('sw', 150, 145, 150, 240) + GND(150, 240) + LAB(190, 196, ['button', 'bouton'], { c: INK });
  s += LAB(260, 225, ['released: pin = 5 V → HIGH', 'relâché : broche = 5 V → HIGH'], { c: C.g, fs: 13 }) + LAB(260, 248, ['pressed: pin = 0 V → LOW', 'appuyé : broche = 0 V → LOW'], { c: C.r, fs: 13 });
  return out(W, H, s);
}
// square signals: rows = [{ label, hi: [[t0, t1], ...], col }], t from 0 to tmax
export function waves(rows, o = {}) {
  const W = o.w || 640, L = o.L || 150, R = 20, rowH = 62, top = 26, H = top + rows.length * rowH + (o.axis ? 40 : 14), tmax = o.tmax, X = (t) => L + t / tmax * (W - L - R);
  let s = '';
  rows.forEach((r, i) => {
    const y0 = top + i * rowH + 44, y1 = y0 - 32; let d = `M${X(0)},${y0}`, cur = y0;
    r.hi.forEach(([a, b]) => { d += ` L${fx(X(a))},${cur} L${fx(X(a))},${y1} L${fx(X(b))},${y1} L${fx(X(b))},${y0}`; cur = y0; });
    d += ` L${X(tmax)},${y0}`;
    s += LINE(L, y0, X(tmax), y0, C.grid, 1) + `<path d="${d}" fill="none" stroke="${r.col || C.o}" stroke-width="2.5" stroke-linejoin="round"/>` + T(L - 12, y0 - 12, r.label, { a: 'end', fs: 13, b: true, c: r.col || C.o });
    if (r.note) s += T(L - 12, y0 + 6, r.note, { a: 'end', fs: 12, c: C.axis });
    if (r.avg !== undefined) { const ya = y0 - 32 * r.avg; s += LINE(L, ya, X(tmax), ya, C.y, 1.8, '6 5'); }
  });
  if (o.axis) { const y = H - 30; s += LINE(L, y, X(tmax), y, C.axis, 1.5); o.axis.ticks.forEach((t) => { s += LINE(X(t), y - 4, X(t), y + 4, C.axis, 1.5) + T(X(t), y + 18, String(t), { raw: true, a: 'middle', fs: 12, c: C.axis }); }); s += T(W - R, y - 8, o.axis.label, { a: 'end', fs: 12, c: C.axis }); }
  return out(W, H, s);
}
// ------------------------------------------------------------------ lesson 5: a MOSFET switch with its flyback diode
export function mosfet() {
  const W = 560, H = 320;
  let s = LAB(280, 30, ['motor supply 7.4 V', 'alimentation moteur 7,4 V'], { a: 'middle', b: true, c: C.r }) + wire([170, 40], [390, 40]);
  s += wire([280, 40], [280, 60]) + part('motor', 280, 60, 280, 150) + NODE(280, 60) + NODE(280, 150);
  s += wire([280, 60], [370, 60]) + part('diode', 370, 150, 370, 60) + wire([370, 150], [280, 150]) + LAB(388, 110, ['flyback diode', 'diode de roue libre'], { c: C.p, fs: 12 });
  // the MOSFET: drain up, source down, gate left
  s += wire([280, 150], [280, 178]) + LINE(280, 178, 280, 240, C.b, 3) + LINE(262, 182, 262, 236, C.b, 3) + wire([280, 240], [280, 262]) + GND(280, 262);
  s += wire([150, 209], [262, 209]) + DOT(150, 209, C.y, 6) + LAB(140, 204, ['pin ~5', 'broche ~5'], { a: 'end', b: true, c: C.y }) + LAB(140, 224, ['(PWM)', '(PWM)'], { a: 'end', c: C.y, fs: 12 });
  s += LAB(296, 200, ['MOSFET', 'MOSFET'], { b: true, c: C.b }) + LAB(296, 218, ['logic level, e.g. IRLZ44N', 'niveau logique, ex. IRLZ44N'], { c: C.axis, fs: 12 });
  s += LAB(296, 300, ['GND common with the Arduino', 'GND commun avec l\'Arduino'], { c: C.axis, fs: 12 });
  return out(W, H, s);
}
// ------------------------------------------------------------------ lesson 6: the H-bridge and its two current paths
export function hbridge(dir = 1) {
  const W = 520, H = 320, xl = 140, xr = 380, yt = 50, yb = 270, ym = 160;
  const on = (k) => (dir > 0 ? (k === 1 || k === 4) : (k === 2 || k === 3));
  const SWI = (k, x1, y1, x2, y2, lx, ly) => (on(k) ? LINE(x1, y1, x2, y2, C.g, 4) : part('sw', x1, y1, x2, y2)) + T(lx, ly, `S${k}`, { raw: true, b: true, c: on(k) ? C.g : C.axis, fs: 14 });
  let s = LAB(W / 2, 30, '+ 7.4 V', { a: 'middle', b: true, c: C.r }) + wire([xl, yt], [xr, yt]) + wire([xl, yb], [xr, yb]) + GND(W / 2, yb);
  s += SWI(1, xl, yt, xl, ym - 22, xl - 40, 100) + SWI(3, xr, yt, xr, ym - 22, xr + 32, 100) + SWI(2, xl, ym + 22, xl, yb, xl - 40, 225) + SWI(4, xr, ym + 22, xr, yb, xr + 32, 225);
  s += wire([xl, ym - 22], [xl, ym + 22]) + wire([xr, ym - 22], [xr, ym + 22]) + NODE(xl, ym) + NODE(xr, ym) + wire([xl, ym], [W / 2 - 40, ym]) + part('motor', W / 2 - 40, ym, W / 2 + 40, ym) + wire([W / 2 + 40, ym], [xr, ym]);
  const p = dir > 0 ? [[xl + 14, yt + 14], [xl + 14, ym - 14], [W / 2 + 60, ym - 14], [xr - 14, ym + 14], [xr - 14, yb - 14]] : [[xr - 14, yt + 14], [xr - 14, ym - 14], [W / 2 - 60, ym - 14], [xl + 14, ym + 14], [xl + 14, yb - 14]];
  s += `<polyline points="${p.map((q) => q.join(',')).join(' ')}" fill="none" stroke="${C.y}" stroke-width="2.5" stroke-dasharray="7 5"/>` + ARROW(p[3][0], p[3][1] - 40, p[3][0], p[3][1] + 30, C.y, 2.5);
  s += LAB(W / 2, 306, dir > 0 ? ['S1 + S4 closed: current left → right, the motor turns forward', 'S1 + S4 fermés : courant de gauche à droite, le moteur tourne en avant'] : ['S3 + S2 closed: current right → left, the motor turns backward', 'S3 + S2 fermés : courant de droite à gauche, le moteur tourne en arrière'], { a: 'middle', c: C.y, fs: 13 });
  return out(W, H, s);
}
