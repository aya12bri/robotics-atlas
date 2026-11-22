// mk-figs.mjs — drawings that explain, in pictures, the parts of the maths kit that were only text:
// cross product, order of two moves, the three rotations, the homogeneous matrix, chaining frames, the four moves of a DH row,
// the finite difference, the Jacobian on the arm, the fusion of two sensors, roll-pitch-yaw and gimbal lock.
// Every label goes through svgtx (translated like the rest); axis names use Unicode subscripts.
import { tx, svgtx } from '../lib.mjs';
import { grid } from './mk-grid.mjs';

const R = '#e5484d', G = '#2e9e5b', B = '#2f6bff', O = '#e07b00', Y = '#ffd23f', GR = '#8a94a3', P = '#8a5cf6';
const f = (v) => (+v).toFixed(1);
const D = Math.PI / 180;
const add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, k) => a.map((v) => v * k);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const rot = (v, k, t) => add(add(mul(v, Math.cos(t)), mul(cross(k, v), Math.sin(t))), mul(k, dot3(k, v) * (1 - Math.cos(t))));
let N = 0;                                                         // unique ids for the arrow heads of each picture
const fig = (vb, s, cap, wide = true) => `<figure class="figure${wide ? ' wide' : ''}"><svg viewBox="${vb}" class="fig" role="img" aria-hidden="true" style="color:var(--text)">${s}</svg>${cap ? `<figcaption>${tx(cap[0], cap[1])}</figcaption>` : ''}</figure>`;
const T = (x, y, s, c = 'currentColor', o = {}) => `<text x="${f(x)}" y="${f(y)}" fill="${c}" font-size="${o.fs || 14}" text-anchor="${o.a || 'start'}"${o.b ? ' font-weight="700"' : ''}${o.op ? ` opacity="${o.op}"` : ''}>${s}</text>`;
const L = (x1, y1, x2, y2, c, w = 2, dash) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
// an arrow with its own head (no marker, so it works in every picture)
const A = (x1, y1, x2, y2, c, w = 3, dash) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 7 + w * 1.6; return L(x1, y1, x2 - Math.cos(a) * h * 0.6, y2 - Math.sin(a) * h * 0.6, c, w, dash) + `<path d="M${f(x2)},${f(y2)} L${f(x2 - h * Math.cos(a - 0.38))},${f(y2 - h * Math.sin(a - 0.38))} L${f(x2 - h * Math.cos(a + 0.38))},${f(y2 - h * Math.sin(a + 0.38))} z" fill="${c}"/>`; };
// oblique 3D view: x to the right, z up, y into the page (drawn up-right)
const view = (cx, cy, S) => { const P2 = (p) => [cx + S * (p[0] + 0.42 * p[1]), cy - S * (p[2] + 0.26 * p[1])]; return {
  P: P2,
  arrow: (a, b, c, w = 3, dash) => { const [x1, y1] = P2(a), [x2, y2] = P2(b); return A(x1, y1, x2, y2, c, w, dash); },
  line: (a, b, c, w = 2, dash) => { const [x1, y1] = P2(a), [x2, y2] = P2(b); return L(x1, y1, x2, y2, c, w, dash); },
  text: (p, s, c, dx = 0, dy = 0, o = {}) => { const [x, y] = P2(p); return T(x + dx, y + dy, s, c, o); },
  poly: (pts, fill, op = 0.25) => `<polygon points="${pts.map((p) => P2(p).map(f).join(',')).join(' ')}" fill="${fill}" fill-opacity="${op}" stroke="${fill}" stroke-width="1.5"/>`,
  arc: (o, k, u, t, r, c, w = 2.2) => { let d = ''; const n = 30; for (let i = 0; i <= n; i++) { const p = P2(add(o, mul(rot(u, k, t * i / n), r))); d += (i ? 'L' : 'M') + f(p[0]) + ',' + f(p[1]); } const e = P2(add(o, mul(rot(u, k, t), r))), e0 = P2(add(o, mul(rot(u, k, t * 0.9), r))); return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>` + A(e0[0], e0[1], e[0], e[1], c, w); }
}; };
const frame3 = (V, o, X, Yv, Z, names, len = 0.42, opt = {}) => {
  const c = opt.ghost ? [GR, GR, GR] : [R, G, B], w = opt.ghost ? 1.6 : 3, dash = opt.ghost ? '5 4' : null;
  return V.arrow(o, add(o, mul(X, len)), c[0], w, dash) + V.arrow(o, add(o, mul(Yv, len)), c[1], w, dash) + V.arrow(o, add(o, mul(Z, len)), c[2], w, dash) +
    (names ? V.text(add(o, mul(X, len)), names[0], c[0], 6, 4, { b: 1, fs: 15 }) + V.text(add(o, mul(Yv, len)), names[1], c[1], 6, -4, { b: 1, fs: 15 }) + V.text(add(o, mul(Z, len)), names[2], c[2], 6, 0, { b: 1, fs: 15 }) : '');
};

// 2.5 the cross product
export function crossFig() {
  const V = view(110, 215, 165), a = [0.95, -0.45, 0], b = [0.45, 0.95, 0], c = cross(a, b);
  let s = V.poly([[0, 0, 0], a, add(a, b), b], O, 0.18);
  s += V.arrow([0, 0, 0], a, B, 4) + V.text(a, 'a', B, 8, 6, { b: 1, fs: 18 });
  s += V.arrow([0, 0, 0], b, O, 4) + V.text(b, 'b', O, 8, -2, { b: 1, fs: 18 });
  s += V.arrow([0, 0, 0], c, G, 4) + V.text(c, 'a × b', G, 8, 4, { b: 1, fs: 18 });
  s += V.text(add(mul(a, 0.55), mul(b, 0.45)), svgtx('area = |a × b|', 'aire = |a × b|'), O, 0, 5, { a: 'middle', fs: 13, b: 1 });
  s += V.arc([0, 0, 0], [0, 0, 1], [0.904, -0.428, 0], 1.57, 0.3, GR, 1.6);
  s += T(440, 70, svgtx('Right hand:', 'Main droite :'), 'currentColor', { b: 1, fs: 15 }) + T(440, 96, svgtx('index along a,', 'index selon a,'), B) + T(440, 120, svgtx('middle finger along b,', 'majeur selon b,'), O) + T(440, 144, svgtx('the thumb gives a × b.', 'le pouce donne a × b.'), G);
  s += T(440, 186, svgtx('a × b is perpendicular', 'a × b est perpendiculaire'), 'currentColor', { fs: 13 }) + T(440, 206, svgtx('to a and to b.', 'à a et à b.'), 'currentColor', { fs: 13 });
  s += T(440, 236, svgtx('b × a points down: −(a × b).', 'b × a pointe vers le bas : −(a × b).'), GR, { fs: 13 });
  return fig('0 0 700 290', s, ['a and b lie in the floor plane; a × b stands up, perpendicular to both. Its length is the area of the orange parallelogram.', 'a et b sont dans le plan du sol ; a × b est debout, perpendiculaire aux deux. Sa longueur est l\'aire du parallélogramme orange.']);
}

// 3.2 the order of two moves: turn then go, or go then turn
export function orderFig() {
  const panel = (ox, title, turnFirst) => {
    const G2 = grid({ OX: ox + 50, OY: 250, U: 55, x1: 3, y1: 3 }), { X, Y: Yy } = G2;
    let s = G2.s.replace(/mkg/g, 'mkg' + ox);
    s += T(ox + 150, 26, title, 'currentColor', { a: 'middle', b: 1, fs: 15 });
    const robot = (u, v, ang, c) => { const x = X(u), y = Yy(v), a = -ang * D; return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(-ang)})"><rect x="-13" y="-10" width="26" height="20" rx="4" fill="${c}" fill-opacity="0.25" stroke="${c}" stroke-width="2"/><path d="M13,-6 L22,0 L13,6 z" fill="${c}"/></g>`; };
    s += robot(0, 0, 0, GR);
    if (turnFirst) { s += `<path d="M${X(0) + 26},${Yy(0)} A26,26 0 0 0 ${X(0)},${Yy(0) - 26}" fill="none" stroke="${O}" stroke-width="2.4"/>` + T(X(0) + 30, Yy(0) - 22, '① 90°', O, { b: 1 }) + A(X(0), Yy(0) - 30, X(0), Yy(2), B, 3.5) + T(X(0) + 8, Yy(1.3), svgtx('② go 2', '② avancer de 2'), B, { b: 1 }) + robot(0, 2, 90, B) + T(X(0) + 14, Yy(2) - 16, svgtx('end: (0, 2)', 'arrivée : (0, 2)'), B, { b: 1 }); }
    else { s += A(X(0) + 26, Yy(0), X(2), Yy(0), B, 3.5) + T(X(1), Yy(0) - 12, svgtx('① go 2', '① avancer de 2'), B, { a: 'middle', b: 1 }) + `<path d="M${X(2) + 26},${Yy(0)} A26,26 0 0 0 ${X(2)},${Yy(0) - 26}" fill="none" stroke="${O}" stroke-width="2.4"/>` + T(X(2) + 30, Yy(0) - 22, '② 90°', O, { b: 1 }) + robot(2, 0, 90, R) + T(X(2), Yy(0) - 44, svgtx('end: (2, 0)', 'arrivée : (2, 0)'), R, { a: 'middle', b: 1 }); }
    return s;
  };
  const s = panel(0, svgtx('Turn, then go forward', 'Tourner, puis avancer'), true) + panel(340, svgtx('Go forward, then turn', 'Avancer, puis tourner'), false);
  return fig('0 0 680 290', s, ['The same two moves in a different order do not lead to the same place: this is why A B ≠ B A for matrices.', 'Les deux mêmes mouvements dans un autre ordre ne mènent pas au même endroit : c\'est pourquoi A B ≠ B A pour les matrices.']);
}

// 4.3 the three basic rotations: one axis stays, the two others turn
export function rot3Fig() {
  const th = 35 * D, X = [1, 0, 0], Yv = [0, 1, 0], Z = [0, 0, 1];
  const panel = (k, ox) => {
    const V = view(ox + 75, 190, 125), ax = [X, Yv, Z][k], names = ['x', 'y', 'z'], cols = [R, G, B];
    let s = T(ox + 105, 28, ['R<tspan dy="4" font-size="11">x</tspan>', 'R<tspan dy="4" font-size="11">y</tspan>', 'R<tspan dy="4" font-size="11">z</tspan>'][k] + '<tspan dy="-4">(θ)</tspan>', 'currentColor', { a: 'middle', b: 1, fs: 17 });
    [X, Yv, Z].forEach((v, i) => {
      if (i === k) { s += V.arrow([0, 0, 0], mul(v, 1.0), cols[i], 5) + V.text(mul(v, 1.0), names[i], cols[i], 6, 4, { b: 1, fs: 16 }); return; }
      s += V.arrow([0, 0, 0], mul(v, 0.8), GR, 1.5, '5 4');
      const w = rot(v, ax, th); s += V.arrow([0, 0, 0], mul(w, 0.8), cols[i], 3) + V.text(mul(w, 0.8), names[i] + "'", cols[i], 6, 4, { b: 1, fs: 15 });
    });
    const u = k === 2 ? X : k === 1 ? Z : Yv;
    s += V.arc(mul(ax, 0.55), ax, u, 1.4 * Math.PI, 0.18, O);
    s += T(ox + 105, 285, svgtx(['x does not move', 'y does not move', 'z does not move'][k], ['x ne bouge pas', 'y ne bouge pas', 'z ne bouge pas'][k]), cols[k], { a: 'middle', b: 1, fs: 14 });
    return s;
  };
  const s = panel(0, 0) + panel(1, 230) + panel(2, 460);
  return fig('0 0 700 300', s, ['Each basic rotation keeps one axis fixed (thick) and turns the two others by θ (dashed: before, solid: after). The orange arrow shows the positive direction (right hand, thumb along the axis).', 'Chaque rotation de base garde un axe fixe (épais) et tourne les deux autres de θ (pointillés : avant, trait plein : après). La flèche orange montre le sens positif (main droite, pouce selon l\'axe).']);
}

// 5.2 how to read a homogeneous matrix
export function homFig() {
  const x0 = 60, y0 = 40, c = 64;
  const cell = (i, j, s, fill) => `<rect x="${x0 + j * c}" y="${y0 + i * c}" width="${c - 4}" height="${c - 4}" rx="8" fill="${fill}" fill-opacity="0.22" stroke="${fill}" stroke-width="1.5"/>` + T(x0 + j * c + (c - 4) / 2, y0 + i * c + c / 2 + 3, s, 'currentColor', { a: 'middle', fs: 15, b: 1 });
  const RR = [['r₁₁', 'r₁₂', 'r₁₃'], ['r₂₁', 'r₂₂', 'r₂₃'], ['r₃₁', 'r₃₂', 'r₃₃']];
  let s = '';
  for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) s += cell(i, j, RR[i][j], B); s += cell(i, 3, ['tₓ', 'tᵧ', 't<tspan dy="4" font-size="11">z</tspan>'][i], O); }
  ['0', '0', '0'].forEach((v, j) => { s += cell(3, j, v, GR); }); s += cell(3, 3, '1', GR);
  s += `<path d="M${x0 - 14},${y0} L${x0 - 22},${y0} L${x0 - 22},${y0 + 4 * c - 4} L${x0 - 14},${y0 + 4 * c - 4}" fill="none" stroke="currentColor" stroke-width="2"/><path d="M${x0 + 4 * c + 10},${y0} L${x0 + 4 * c + 18},${y0} L${x0 + 4 * c + 18},${y0 + 4 * c - 4} L${x0 + 4 * c + 10},${y0 + 4 * c - 4}" fill="none" stroke="currentColor" stroke-width="2"/>`;
  const tx0 = x0 + 4 * c + 50;
  s += `<rect x="${tx0}" y="${y0 + 6}" width="16" height="16" rx="3" fill="${B}" fill-opacity="0.4"/>` + T(tx0 + 26, y0 + 20, svgtx('R (3 × 3): the orientation', 'R (3 × 3) : l\'orientation'), B, { b: 1, fs: 15 });
  s += T(tx0 + 26, y0 + 42, svgtx('its columns = the axes x, y, z of B, written in A', 'ses colonnes = les axes x, y, z de B, écrits dans A'), 'currentColor', { fs: 13 });
  s += `<rect x="${tx0}" y="${y0 + 76}" width="16" height="16" rx="3" fill="${O}" fill-opacity="0.4"/>` + T(tx0 + 26, y0 + 90, svgtx('t (3 numbers): the position', 't (3 nombres) : la position'), O, { b: 1, fs: 15 });
  s += T(tx0 + 26, y0 + 112, svgtx('where the origin of B is, seen from A', 'où est l\'origine de B, vue depuis A'), 'currentColor', { fs: 13 });
  s += `<rect x="${tx0}" y="${y0 + 146}" width="16" height="16" rx="3" fill="${GR}" fill-opacity="0.4"/>` + T(tx0 + 26, y0 + 160, svgtx('0 0 0 1: always the same', '0 0 0 1 : toujours pareil'), GR, { b: 1, fs: 15 });
  s += T(tx0 + 26, y0 + 182, svgtx('it lets one product turn and move', 'elle permet à un seul produit de tourner et déplacer'), 'currentColor', { fs: 13 });
  s += T(x0 + 2 * c - 2, y0 + 4 * c + 26, '⁰T₁', 'currentColor', { a: 'middle', b: 1, fs: 17 });
  return fig('0 0 760 330', s, ['The 4 × 4 homogeneous matrix in three blocks: the rotation R (where the axes of the new frame point), the translation t (where its origin is), and the fixed last row.', 'La matrice homogène 4 × 4 en trois blocs : la rotation R (où pointent les axes du nouveau repère), la translation t (où est son origine), et la dernière ligne fixe.']);
}

// 5.3 chaining frames on the 2-axis arm (L₁ = 0.5, L₂ = 0.4, θ₁ = 30°, θ₂ = 45°)
export function chainFig() {
  const U = 340, OX = 70, OY = 300;
  const X = (u) => OX + u * U, Yy = (v) => OY - v * U;
  const p1 = [0.5 * Math.cos(30 * D), 0.5 * Math.sin(30 * D)], p2 = [p1[0] + 0.4 * Math.cos(75 * D), p1[1] + 0.4 * Math.sin(75 * D)];
  let s = '';
  for (let u = 0; u <= 0.8001; u += 0.1) s += L(X(u), Yy(0), X(u), Yy(0.8), 'currentColor', 1) .replace('stroke-width="1"', 'stroke-width="1" stroke-opacity="0.08"');
  for (let v = 0; v <= 0.8001; v += 0.1) s += L(X(0), Yy(v), X(0.8), Yy(v), 'currentColor', 1).replace('stroke-width="1"', 'stroke-width="1" stroke-opacity="0.08"');
  s += L(X(0), Yy(p2[1]), X(p2[0]), Yy(p2[1]), GR, 1.2, '3 4') + L(X(p2[0]), Yy(0), X(p2[0]), Yy(p2[1]), GR, 1.2, '3 4');
  s += T(X(p2[0]), Yy(0) + 18, '0.537', GR, { a: 'middle', fs: 13 }) + T(X(0) - 8, Yy(p2[1]) + 4, '0.636', GR, { a: 'end', fs: 13 });
  s += L(X(0), Yy(0), X(p1[0]), Yy(p1[1]), '#8b96a5', 11) + L(X(p1[0]), Yy(p1[1]), X(p2[0]), Yy(p2[1]), '#f5963a', 9);
  const fr = (p, a, n) => { const c = Math.cos(a * D), sn = Math.sin(a * D), l = 52; return A(X(p[0]), Yy(p[1]), X(p[0]) + l * c, Yy(p[1]) - l * sn, R, 2.6) + A(X(p[0]), Yy(p[1]), X(p[0]) - l * sn, Yy(p[1]) - l * c, G, 2.6) + T(X(p[0]) + (l + 8) * c, Yy(p[1]) - (l + 8) * sn + 4, 'x' + n, R, { b: 1, fs: 15 }) + T(X(p[0]) - (l + 8) * sn - 4, Yy(p[1]) - (l + 8) * c, 'y' + n, G, { b: 1, fs: 15, a: 'end' }); };
  s += fr([0, 0], 0, '₀') + fr(p1, 30, '₁') + fr(p2, 75, '₂');
  s += `<circle cx="${X(0)}" cy="${Yy(0)}" r="10" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${X(p1[0])}" cy="${Yy(p1[1])}" r="10" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${X(p2[0])}" cy="${Yy(p2[1])}" r="6" fill="${R}"/>`;
  // the three matrices as curved arrows
  const curve = (a, b, bend, c, lab, dash) => { const mx = (X(a[0]) + X(b[0])) / 2, my = (Yy(a[1]) + Yy(b[1])) / 2, dx = Yy(b[1]) - Yy(a[1]), dy = X(a[0]) - X(b[0]), k = bend; const qx = mx + dx * k, qy = my + dy * k; return `<path d="M${f(X(a[0]))},${f(Yy(a[1]))} Q${f(qx)},${f(qy)} ${f(X(b[0]))},${f(Yy(b[1]))}" fill="none" stroke="${c}" stroke-width="2.4"${dash ? ' stroke-dasharray="7 5"' : ''}/>` + T(qx, qy, lab, c, { a: 'middle', b: 1, fs: 17 }); };
  s += curve([0, 0], p1, 0.35, O, '⁰T₁') + curve(p1, p2, 0.45, P, '¹T₂') + curve([0, 0], p2, -0.45, B, '⁰T₂', true);
  s += T(410, 70, '⁰T₂ = ⁰T₁ · ¹T₂', B, { b: 1, fs: 18 });
  s += T(410, 104, svgtx('go from 0 to 1, then from 1 to 2', 'aller de 0 à 1, puis de 1 à 2'), 'currentColor', { fs: 14 });
  s += T(410, 140, svgtx('last column of ⁰T₂ =', 'dernière colonne de ⁰T₂ ='), 'currentColor', { fs: 14 }) + T(410, 164, svgtx('the tool: (0.537, 0.636) m', 'l\'outil : (0,537 ; 0,636) m'), R, { fs: 15, b: 1 });
  s += T(410, 200, svgtx('1 square = 0.1 m', '1 carreau = 0,1 m'), GR, { fs: 13 });
  return fig('0 0 700 330', s, ['The 2-axis arm of the worked example with its three frames. ⁰T₁ takes frame 0 to frame 1, ¹T₂ takes frame 1 to frame 2; their product ⁰T₂ goes straight from the base to the tool.', 'Le bras à 2 axes de l\'exemple résolu avec ses trois repères. ⁰T₁ amène le repère 0 sur le repère 1, ¹T₂ le repère 1 sur le repère 2 ; leur produit ⁰T₂ va directement de la base à l\'outil.']);
}

// 6.7 / 7.6 the four simple moves of one DH (std) or DHM row, applied one after the other
export function movesFig(std) {
  const th = 40 * D, dd = 0.4, aa = 0.4, al = 60 * D;
  let o = [0, 0, 0], X = [1, 0, 0], Yv = [0, 1, 0], Z = [0, 0, 1];
  const steps = std ? [['rz', th], ['tz', dd], ['tx', aa], ['rx', al]] : [['rx', al], ['tx', aa], ['rz', th], ['tz', dd]];
  const name = { rz: ['Rot(z, θ)', 'turn θ around z', 'tourner de θ autour de z'], tz: ['Trans(z, d)', 'slide d along z', 'glisser de d le long de z'], tx: ['Trans(x, a)', 'slide a along x', 'glisser de a le long de x'], rx: ['Rot(x, α)', 'twist α around x', 'vriller de α autour de x'] };
  let s = '';
  steps.forEach(([k, v], i) => {
    const ox = i * 190, V = view(ox + 55, 215, 125);
    const before = { o, X, Yv, Z };
    if (k === 'rz') { X = rot(X, Z, v); Yv = rot(Yv, Z, v); }
    if (k === 'rx') { Yv = rot(Yv, X, v); Z = rot(Z, X, v); }
    if (k === 'tz') o = add(o, mul(Z, v));
    if (k === 'tx') o = add(o, mul(X, v));
    s += T(ox + 95, 26, svgtx(`${i + 1}. ${name[k][0]}`), 'currentColor', { a: 'middle', b: 1, fs: 15 }) + T(ox + 95, 46, svgtx(name[k][1], name[k][2]), GR, { a: 'middle', fs: 12 });
    const z0 = [0, 0, 0], rel = add(o, mul(before.o, -1));          // each panel is drawn around the frame it starts from
    s += frame3(V, z0, before.X, before.Yv, before.Z, null, 0.5, { ghost: 1 });
    s += frame3(V, rel, X, Yv, Z, ['x', 'y', 'z'], 0.5);
    if (k === 'rz') s += V.arc(mul(before.Z, 0.12), before.Z, before.X, v, 0.36, O, 2.6);
    if (k === 'rx') s += V.arc(mul(before.X, 0.2), before.X, before.Yv, v, 0.32, O, 2.6);
    if (k === 'tz' || k === 'tx') s += V.line(z0, rel, O, 6).replace('stroke-linecap="round"', 'stroke-linecap="round" opacity="0.6"') + V.text(mul(rel, 0.5), k === 'tz' ? 'd' : 'a', O, k === 'tz' ? -16 : 0, k === 'tz' ? 4 : 20, { b: 1, fs: 16 });
    if (k === 'rz' || k === 'rx') s += V.text(k === 'rz' ? [0.42, 0.25, 0.12] : [0.2, 0.25, 0.3], k === 'rz' ? 'θ' : 'α', O, 6, 0, { b: 1, fs: 16 });
    if (i < 3) s += A(ox + 176, 150, ox + 196, 150, GR, 2);
  });
  const cap = std ? ['One row of a standard DH table is four simple moves, in this order. Dashed grey: the frame before the move; in colour: after. After the fourth move you are on frame i.', 'Une ligne d\'un tableau DH standard, ce sont quatre mouvements simples, dans cet ordre. En gris pointillé : le repère avant le mouvement ; en couleur : après. Après le quatrième mouvement, on est sur le repère i.']
    : ['One row of a modified DH table: the same four moves, but the moves along and around x come first. Dashed grey: before the move; in colour: after. After the fourth move you are on frame j.', 'Une ligne d\'un tableau DH modifié : les quatre mêmes mouvements, mais ceux le long et autour de x viennent d\'abord. En gris pointillé : avant le mouvement ; en couleur : après. Après le quatrième mouvement, on est sur le repère j.'];
  return fig('0 0 770 300', s, cap);
}

// 9.3 the finite difference: the slope between two samples
export function fdFig() {
  const x0 = 70, y0 = 260, sx = 500, sy = 200, th = (t) => 0.2 + 0.9 * t * t;   // t from 0 to 1
  const X = (t) => x0 + t * sx, Yp = (v) => y0 - v * sy;
  let s = L(x0, y0, x0 + sx + 20, y0, 'currentColor', 1.5) + L(x0, y0, x0, 30, 'currentColor', 1.5) + T(x0 + sx + 26, y0 + 5, svgtx('time t', 'temps t'), 'currentColor', { fs: 13 }) + T(x0 - 8, 30, 'θ', 'currentColor', { a: 'end', b: 1, fs: 16 });
  let d = ''; for (let i = 0; i <= 60; i++) { const t = i / 60; d += (i ? 'L' : 'M') + f(X(t)) + ',' + f(Yp(th(t))); }
  s += `<path d="${d}" fill="none" stroke="${B}" stroke-width="3"/>`;
  for (let i = 0; i <= 10; i++) { const t = i / 10; s += `<circle cx="${f(X(t))}" cy="${f(Yp(th(t)))}" r="3.5" fill="${B}"/>`; }
  const t1 = 0.5, t2 = 0.7, p1 = [X(t1), Yp(th(t1))], p2 = [X(t2), Yp(th(t2))];
  s += L(p1[0], p1[1], p2[0], p1[1], O, 2.5) + L(p2[0], p1[1], p2[0], p2[1], O, 2.5) + T((p1[0] + p2[0]) / 2, p1[1] + 20, 'Δt', O, { a: 'middle', b: 1, fs: 15 }) + T(p2[0] + 8, (p1[1] + p2[1]) / 2 + 5, 'Δθ', O, { b: 1, fs: 15 });
  const k = (p2[1] - p1[1]) / (p2[0] - p1[0]); s += L(p1[0] - 120, p1[1] - 120 * k, p2[0] + 90, p2[1] + 90 * k, R, 2.2, '7 5');
  s += `<circle cx="${f(p1[0])}" cy="${f(p1[1])}" r="6" fill="${R}"/><circle cx="${f(p2[0])}" cy="${f(p2[1])}" r="6" fill="${R}"/>`;
  s += T(p1[0] - 8, p1[1] - 12, 'θ(t)', R, { a: 'end', b: 1 }) + T(p2[0] - 10, p2[1] - 12, 'θ(t + Δt)', R, { a: 'end', b: 1 });
  s += T(100, 50, svgtx('speed ≈ slope of the red line', 'vitesse ≈ pente de la droite rouge'), R, { b: 1, fs: 14 }) + T(100, 74, 'θ̇ ≈ Δθ / Δt', R, { b: 1, fs: 16 });
  s += T(100, 100, svgtx('dots: the samples of the encoder', 'points : les mesures du codeur'), B, { fs: 13 });
  return fig('0 0 640 290', s, ['The robot only has samples (dots). Between two samples, the change Δθ divided by the time step Δt is the slope of the red line: an estimate of the speed.', 'Le robot n\'a que des mesures (les points). Entre deux mesures, la variation Δθ divisée par le pas de temps Δt est la pente de la droite rouge : une estimation de la vitesse.']);
}

// 9.4 / 9.5 the columns of the Jacobian on the arm: what happens if only one motor turns
export function jacFig() {
  const U = 330, OX = 120, OY = 300, X = (u) => OX + u * U, Yy = (v) => OY - v * U;
  const p1 = [0.5 * Math.cos(30 * D), 0.5 * Math.sin(30 * D)], p2 = [0.537, 0.636];
  let s = L(X(-0.2), Yy(0), X(0.9), Yy(0), GR, 1.2, '6 5');
  const r1 = Math.hypot(p2[0], p2[1]), a1 = Math.atan2(p2[1], p2[0]);
  let d = ''; for (let i = 0; i <= 30; i++) { const a = a1 - 0.35 + 0.7 * i / 30; d += (i ? 'L' : 'M') + f(X(r1 * Math.cos(a))) + ',' + f(Yy(r1 * Math.sin(a))); }
  s += `<path d="${d}" fill="none" stroke="${O}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  const r2 = 0.4, a2 = 75 * D; d = ''; for (let i = 0; i <= 30; i++) { const a = a2 - 0.6 + 1.2 * i / 30; d += (i ? 'L' : 'M') + f(X(p1[0] + r2 * Math.cos(a))) + ',' + f(Yy(p1[1] + r2 * Math.sin(a))); }
  s += `<path d="${d}" fill="none" stroke="${P}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  s += L(X(0), Yy(0), X(p1[0]), Yy(p1[1]), '#8b96a5', 11) + L(X(p1[0]), Yy(p1[1]), X(p2[0]), Yy(p2[1]), '#f5963a', 9);
  s += `<circle cx="${X(0)}" cy="${Yy(0)}" r="10" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${X(p1[0])}" cy="${Yy(p1[1])}" r="10" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${X(p2[0])}" cy="${Yy(p2[1])}" r="6" fill="${R}"/>`;
  const k = 0.28;
  s += A(X(p2[0]), Yy(p2[1]), X(p2[0] - 0.636 * k), Yy(p2[1] + 0.537 * k), O, 3.5) + T(X(p2[0] - 0.636 * k) - 8, Yy(p2[1] + 0.537 * k) - 6, svgtx('column 1: (−0.636, 0.537)', 'colonne 1 : (−0,636 ; 0,537)'), O, { a: 'end', b: 1, fs: 14 });
  s += A(X(p2[0]), Yy(p2[1]), X(p2[0] - 0.386 * k), Yy(p2[1] + 0.104 * k), P, 3.5) + T(X(p2[0] - 0.386 * k) - 8, Yy(p2[1] + 0.104 * k) + 18, svgtx('column 2: (−0.386, 0.104)', 'colonne 2 : (−0,386 ; 0,104)'), P, { a: 'end', b: 1, fs: 14 });
  s += T(X(0) - 6, Yy(0) + 24, svgtx('motor 1', 'moteur 1'), 'currentColor', { a: 'middle', fs: 13 }) + T(X(p1[0]) + 16, Yy(p1[1]) + 18, svgtx('motor 2', 'moteur 2'), 'currentColor', { fs: 13 });
  s += T(420, 60, svgtx('Only motor 1 turns:', 'Seul le moteur 1 tourne :'), O, { b: 1, fs: 14 }) + T(420, 82, svgtx('the tool goes round the base', 'l\'outil tourne autour de la base'), 'currentColor', { fs: 13 }) + T(420, 102, svgtx('→ ∂x/∂θ₁, ∂y/∂θ₁ (column 1)', '→ ∂x/∂θ₁, ∂y/∂θ₁ (colonne 1)'), O, { fs: 13 });
  s += T(420, 140, svgtx('Only motor 2 turns:', 'Seul le moteur 2 tourne :'), P, { b: 1, fs: 14 }) + T(420, 162, svgtx('the tool goes round the elbow', 'l\'outil tourne autour du coude'), 'currentColor', { fs: 13 }) + T(420, 182, svgtx('→ ∂x/∂θ₂, ∂y/∂θ₂ (column 2)', '→ ∂x/∂θ₂, ∂y/∂θ₂ (colonne 2)'), P, { fs: 13 });
  s += T(420, 222, svgtx('Both turn: the two arrows add', 'Les deux tournent : les flèches s\'ajoutent'), 'currentColor', { b: 1, fs: 14 }) + T(420, 244, 'Ẋ = J θ̇', 'currentColor', { b: 1, fs: 16 });
  return fig('0 0 700 330', s, ['Each column of the Jacobian is the speed of the tool when only one motor turns (1 rad/s): around the base for column 1, around the elbow for column 2. The arm of the worked example: L₁ = 0.5 m, L₂ = 0.4 m, θ₁ = 30°, θ₂ = 45°.', 'Chaque colonne de la jacobienne est la vitesse de l\'outil quand un seul moteur tourne (1 rad/s) : autour de la base pour la colonne 1, autour du coude pour la colonne 2. Le bras de l\'exemple résolu : L₁ = 0,5 m, L₂ = 0,4 m, θ₁ = 30°, θ₂ = 45°.']);
}

// 10.5 fusing two sensors: GPS 10 m (σ 3), wheels 12 m (σ 4) → 10.72 m (σ 2.4)
export function fuseFig() {
  const x0 = 50, y0 = 260, sx = 22, sy = 1250, X = (v) => x0 + v * sx, Yp = (p) => y0 - p * sy;
  const g = (m, s) => (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  let s = L(x0, y0, x0 + 22 * sx + 10, y0, 'currentColor', 1.5);
  for (let v = 0; v <= 22; v += 2) s += L(X(v), y0, X(v), y0 + 5, 'currentColor', 1) + T(X(v), y0 + 20, String(v), 'currentColor', { a: 'middle', fs: 12, op: 0.7 });
  s += T(x0 + 11 * sx, y0 + 40, svgtx('position (m)', 'position (m)'), 'currentColor', { a: 'middle', fs: 13 });
  const curve = (fn, c, w) => { let d = ''; for (let i = 0; i <= 220; i++) { const x = i / 10; d += (i ? 'L' : 'M') + f(X(x)) + ',' + f(Yp(fn(x))); } return `<path d="${d}" fill="${c}" fill-opacity="0.08" stroke="${c}" stroke-width="${w}"/>`; };
  s += curve(g(10, 3), B, 2.5) + curve(g(12, 4), P, 2.5) + curve(g(10.72, 2.4), O, 3.5);
  [[10, 3, B], [12, 4, P], [10.72, 2.4, O]].forEach(([m, sg, c]) => { s += L(X(m), Yp(g(m, sg)(m)), X(m), y0, c, 1.4, '4 4'); });
  const lx = 560, leg = (y, c, w, txt) => L(lx, y - 5, lx + 26, y - 5, c, w) + T(lx + 34, y, txt, c, { b: 1, fs: 14 });
  s += leg(60, B, 3, svgtx('GPS: 10 m, σ = 3', 'GPS : 10 m, σ = 3')) + leg(90, P, 3, svgtx('wheels: 12 m, σ = 4', 'roues : 12 m, σ = 4')) + leg(120, O, 4, svgtx('fusion: 10.72 m, σ = 2.4', 'fusion : 10,72 m, σ = 2,4'));
  s += T(lx, 160, svgtx('narrower = more sure', 'plus étroite = plus sûre'), 'currentColor', { fs: 13 }) + T(lx, 182, svgtx('closer to the GPS,', 'plus proche du GPS,'), 'currentColor', { fs: 13 }) + T(lx, 202, svgtx('the more precise sensor', 'le capteur le plus précis'), 'currentColor', { fs: 13 });
  return fig('0 0 780 310', s, ['Two uncertain measurements of the same position (blue, violet) give a fused estimate (orange) that is narrower than both and closer to the more precise sensor.', 'Deux mesures incertaines de la même position (bleu, violet) donnent une estimation fusionnée (orange) plus étroite que les deux, et plus proche du capteur le plus précis.']);
}

// 11.2 yaw, pitch, roll one after the other, then gimbal lock
export function rpyFig() {
  const ps = 50 * D, te = 30 * D, ph = 40 * D;
  let X = [1, 0, 0], Yv = [0, 1, 0], Z = [0, 0, 1];
  const nose = (V, X2, Y2, Z2) => { const b = mul(X2, 0.75), w1 = mul(Y2, 0.3), w2 = mul(Y2, -0.3); return V.poly([b, w1, mul(X2, -0.25), w2], O, 0.3); };
  const panel = (i, title, sub) => {
    const ox = i * 190, V = view(ox + 62, 215, 150);
    let s = T(ox + 95, 26, title, 'currentColor', { a: 'middle', b: 1, fs: 15 }) + T(ox + 95, 46, sub, GR, { a: 'middle', fs: 13 });
    const prev = { X, Yv, Z };
    if (i === 0) { X = rot(X, Z, ps); Yv = rot(Yv, Z, ps); s += V.arc([0, 0, 0.05], Z, prev.X, ps, 0.45, B); }
    if (i === 1) { X = rot(X, Yv, -te); Z = rot(Z, Yv, -te); s += V.arc([0, 0, 0], Yv, prev.X, -te, 0.55, G); }
    if (i === 2) { Yv = rot(Yv, X, ph); Z = rot(Z, X, ph); s += V.arc(mul(X, 0.55), X, prev.Yv, ph, 0.22, R); }
    s += frame3(V, [0, 0, 0], prev.X, prev.Yv, prev.Z, null, 0.75, { ghost: 1 }) + frame3(V, [0, 0, 0], X, Yv, Z, ['x', 'y', 'z'], 0.75);
    return s;
  };
  let s = panel(0, svgtx('1. yaw ψ', '1. lacet ψ'), svgtx('around z', 'autour de z')) + panel(1, svgtx('2. pitch θ', '2. tangage θ'), svgtx('around the new y', 'autour du nouveau y')) + panel(2, svgtx('3. roll φ', '3. roulis φ'), svgtx('around the new x', 'autour du nouveau x'));
  // gimbal lock: pitch 90°, the roll axis lies on the yaw axis
  const V = view(3 * 190 + 80, 215, 150), Xl = [0, 0, 1];
  s += T(3 * 190 + 95, 26, svgtx('Gimbal lock', 'Blocage de cardan'), R, { a: 'middle', b: 1, fs: 15 }) + T(3 * 190 + 95, 46, svgtx('pitch θ = 90°', 'tangage θ = 90°'), GR, { a: 'middle', fs: 13 });
  s += V.arrow([0, 0, 0], [0, 0, 0.95], B, 6) + V.arrow([0, 0, 0], [0, 0, 0.8], R, 2.6) + V.arrow([0, 0, 0], [0, 1, 0].map((v) => v * 0.7), G, 3) + V.arrow([0, 0, 0], [-0.7, 0, 0], B, 3);
  s += T(3 * 190 + 95, 68, svgtx('yaw axis = roll axis', 'axe de lacet = axe de roulis'), R, { a: 'middle', b: 1, fs: 13 });
  s += V.arc([0, 0, 0.6], Xl, [1, 0, 0], 1.5 * Math.PI, 0.22, R) + T(3 * 190 + 95, 290, svgtx('ψ and φ do the same', 'ψ et φ font la même chose'), R, { a: 'middle', b: 1, fs: 13 });
  return fig('0 0 770 305', s, ['Roll–pitch–yaw: three turns, each around an axis of the frame obtained so far (grey dashed: before; in colour: after). When the pitch reaches 90°, the roll axis lies on the yaw axis: two angles describe the same motion.', 'Roulis–tangage–lacet : trois rotations, chacune autour d\'un axe du repère obtenu jusque-là (gris pointillé : avant ; en couleur : après). Quand le tangage atteint 90°, l\'axe de roulis se couche sur l\'axe de lacet : deux angles décrivent le même mouvement.']);
}
