// med-figs.mjs — drawings of the medical robotics course: timeline, trocar and remote centre of motion,
// the three kinds of co-manipulation, the tele-ultrasound chain.
import { T, LINE, ARROW, DOT, JOINT, BOXR, COL as C } from '../practice/fig.mjs';
const BG = (W, H) => `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
const out = (W, H, s) => ({ vb: `0 0 ${W} ${H}`, svg: BG(W, H) + s });

// ------------------------------------------------------------------ a timeline of medical robotics
export function timeline() {
  const ev = [
    [1985, ['Neurosurgery: an industrial arm holds a biopsy needle', 'Neurochirurgie : un bras industriel tient une aiguille de biopsie'], C.b],
    [1991, ['Probot: prostate surgery (Imperial College)', 'Probot : chirurgie de la prostate (Imperial College)'], C.p],
    [1992, ['Robodoc: hip surgery, orthopaedics', 'Robodoc : chirurgie de la hanche, orthopédie'], C.o],
    [1994, ['AESOP: voice-driven endoscope holder', 'AESOP : porte-endoscope commandé à la voix'], C.g],
    [1998, ['Syrtech (PRISME): first robotic tele-ultrasound', 'Syrtech (PRISME) : première télé-échographie robotisée'], C.y],
    [2000, ['da Vinci: robotic minimally invasive surgery', 'da Vinci : chirurgie mini-invasive robotisée'], C.r],
    [2001, ['Operation Lindbergh: New York → Strasbourg', 'Opération Lindbergh : New York → Strasbourg'], C.b],
    [2015, ['Melody: a tele-ultrasound robot on the market', 'Melody : un robot de télé-échographie commercialisé'], C.y]
  ];
  const W = 640, row = 38, top = 30, H = top + ev.length * row + 10, ax = 110;
  let s = LINE(ax, top - 12, ax, H - 14, C.axis, 2.5);
  ev.forEach(([yr, txt, c], i) => {
    const y = top + i * row + 10;
    s += T(ax - 18, y + 5, String(yr), { raw: true, a: 'end', b: true, fs: 15, c }) + DOT(ax, y, c, 7) + LINE(ax + 8, y, ax + 26, y, c, 2) + T(ax + 34, y + 5, txt, { fs: 14, c: C.ink });
  });
  return out(W, H, s);
}
// ------------------------------------------------------------------ the trocar: a fixed point in the abdominal wall
export function trocar() {
  const W = 620, H = 370, px = 300, py = 160;              // the pivot (trocar) in the wall
  let s = `<path d="M30,${py} Q${px},${py - 26} ${W - 30},${py}" fill="none" stroke="#e89a9a" stroke-width="8"/>` + T(40, py - 16, ['abdominal wall', 'paroi abdominale'], { fs: 12, c: '#e89a9a' });
  s += T(W - 40, py + 34, ['inside the patient', 'dans le patient'], { a: 'end', fs: 12, c: C.axis }) + T(W - 40, 36, ['outside', 'à l\'extérieur'], { a: 'end', fs: 12, c: C.axis });
  const a = 62 * Math.PI / 180, L1 = 120, L2 = 150;           // the instrument, tilted: 120 px outside, 150 px inside
  const hx = px - L1 * Math.cos(a), hy = py - L1 * Math.sin(a), tx = px + L2 * Math.cos(a), ty = py + L2 * Math.sin(a);
  s += LINE(hx, hy, tx, ty, C.ink, 5) + BOXR(hx - 26, hy - 30, 52, 26, '#262c35', C.b) + T(hx, hy - 38, ['surgeon\'s hand / robot', 'main du chirurgien / robot'], { a: 'middle', fs: 12, c: C.b });
  s += `<rect x="${px - 14}" y="${py - 8}" width="28" height="16" rx="3" fill="#262c35" stroke="${C.y}" stroke-width="2.5"/>` + T(px + 22, py - 14, ['trocar = fixed point (RCM)', 'trocart = point fixe (RCM)'], { fs: 13, b: true, c: C.y });
  s += DOT(tx, ty, C.r, 7) + T(tx + 12, ty + 4, ['tip', 'pointe'], { fs: 13, c: C.r });
  // the fulcrum effect: the hand goes left, the tip goes right
  const d = 34; s += ARROW(hx - 4, hy + 12, hx - 4 - d, hy + 12, C.g, 2.5) + T(hx - 22, hy + 32, ['hand →', 'main →'], { a: 'middle', fs: 12, c: C.g });
  s += ARROW(tx + 4, ty + 18, tx + 4 + d * L2 / L1, ty + 18, C.g, 2.5) + T(tx + 20, ty + 40, ['← tip: opposite, × L_in / L_out', '← pointe : sens opposé, × L_int / L_ext'], { a: 'middle', fs: 12, c: C.g });
  s += T(W / 2, H - 12, ['4 DOF left: 2 tilts around the trocar, insertion, rotation about the instrument', '4 DDL restants : 2 inclinaisons autour du trocart, insertion, rotation autour de l\'instrument'], { a: 'middle', fs: 13, c: C.ink });
  return out(W, H, s);
}
// ------------------------------------------------------------------ the three kinds of co-manipulation
export function comanip() {
  const W = 760, H = 270, w = 240;
  const panel = (k, title, sub, draw) => `<g transform="translate(${10 + k * (w + 10)},0)"><rect x="0" y="10" width="${w}" height="${H - 20}" rx="10" fill="#262c35" stroke="${C.axis}" stroke-width="1.5"/>` + T(w / 2, 36, title, { a: 'middle', b: true, fs: 14, c: C.o }) + T(w / 2, 56, sub, { a: 'middle', fs: 12, c: C.axis }) + draw + `</g>`;
  const human = (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="none" stroke="${C.ink}" stroke-width="2.5"/>` + LINE(x, y + 14, x, y + 70, C.ink, 3) + LINE(x, y + 30, x + 50, y + 10, C.ink, 3);
  const tool = (x, y) => LINE(x, y, x, y + 70, C.y, 4) + DOT(x, y + 72, C.r, 5);
  let s = panel(0, ['Parallel', 'Parallèle'], ['forces add up', 'les efforts s\'additionnent'], human(50, 120) + tool(110, 120) + LINE(200, 210, 200, 150, C.b, 7) + LINE(200, 150, 130, 120, C.b, 7) + JOINT(200, 150) + LINE(112, 118, 130, 120, C.b, 4) + T(w / 2, H - 22, ['human and robot hold the same tool', 'humain et robot tiennent le même outil'], { a: 'middle', fs: 11, c: C.ink }));
  s += panel(1, ['Serial', 'Série'], ['velocities add up', 'les vitesses s\'additionnent'], human(50, 120) + LINE(100, 110, 140, 100, C.b, 7) + JOINT(140, 100) + LINE(140, 100, 170, 130, C.b, 7) + tool(170, 130) + T(w / 2, H - 22, ['the robot sits between hand and tool', 'le robot est entre la main et l\'outil'], { a: 'middle', fs: 11, c: C.ink }));
  s += panel(2, ['Orthotic', 'Orthétique'], ['joint torques add up', 'les couples articulaires s\'additionnent'], human(60, 120) + LINE(60, 150, 110, 130, C.b, 6) + JOINT(60, 150) + JOINT(110, 130) + tool(112, 130) + T(w / 2, H - 22, ['the robot is worn on the arm (exoskeleton)', 'robot porté sur le bras (exosquelette)'], { a: 'middle', fs: 11, c: C.ink }));
  return out(W, H, s);
}
// ------------------------------------------------------------------ the tele-ultrasound chain (expert station → patient station)
export function teleEcho() {
  const W = 760, H = 250;
  let s = BOXR(20, 60, 200, 110, '#262c35', C.b) + T(120, 86, ['Expert station', 'Station expert'], { a: 'middle', b: true, fs: 14, c: C.b }) + T(120, 110, ['haptic probe', 'sonde haptique'], { a: 'middle', fs: 12 }) + T(120, 128, ['ultrasound images', 'images échographiques'], { a: 'middle', fs: 12 }) + T(120, 146, ['videoconference', 'visioconférence'], { a: 'middle', fs: 12 });
  s += BOXR(540, 60, 200, 110, '#262c35', C.g) + T(640, 86, ['Patient station', 'Station patient'], { a: 'middle', b: true, fs: 14, c: C.g }) + T(640, 110, ['robot holding the probe', 'robot porte-sonde'], { a: 'middle', fs: 12 }) + T(640, 128, ['force sensor', 'capteur d\'effort'], { a: 'middle', fs: 12 }) + T(640, 146, ['ultrasound scanner', 'échographe'], { a: 'middle', fs: 12 });
  s += ARROW(222, 92, 538, 92, C.o, 2.5) + T(380, 84, ['robot commands', 'commandes du robot'], { a: 'middle', fs: 12, c: C.o });
  s += ARROW(538, 138, 222, 138, C.y, 2.5) + T(380, 160, ['images + force feedback', 'images + retour d\'effort'], { a: 'middle', fs: 12, c: C.y });
  s += T(380, 116, ['satellite, 4G/5G or Internet', 'satellite, 4G/5G ou Internet'], { a: 'middle', fs: 12, c: C.axis });
  s += T(W / 2, 214, ['the expert moves a dummy probe; the robot reproduces the gesture on the distant patient', 'l\'expert bouge une sonde factice ; le robot reproduit le geste sur le patient distant'], { a: 'middle', fs: 13, c: C.ink });
  return out(W, H, s);
}
