// more-figs.mjs — drawings for the courses on perception and AI, the real world, ROS 2, the arm labs and Kalman:
// stereo depth, configuration space, support polygon, torque at the shoulder, the TCP, a URDF tree, a servo pulse,
// and how a matrix moves an uncertainty. Labels go through svgtx (translated with the course).
import { tx, svgtx } from '../lib.mjs';
import { svgText as T, svgLine as L, svgArrow as A, svgFig as fig, obliqueView as V3 } from './mk-figs.mjs';

const R = '#e5484d', G = '#2e9e5b', B = '#2f6bff', O = '#e07b00', GR = '#8a94a3', P = '#8a5cf6', BODY = '#3a4552';
const f = (v) => (+v).toFixed(1), D = Math.PI / 180;
const box = (x, y, w, h, c, t1, t2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${c}" fill-opacity="0.18" stroke="${c}" stroke-width="2"/>` + T(x + w / 2, y + (t2 ? h / 2 - 2 : h / 2 + 5), t1, 'currentColor', { a: 'middle', b: 1, fs: 14 }) + (t2 ? T(x + w / 2, y + h / 2 + 16, t2, GR, { a: 'middle', fs: 12 }) : '');

// perception 1.1: two cameras, the baseline B, the disparity d and the depth Z
export function stereoFig() {
  const P0 = [340, 50], cl = [240, 280], cr = [440, 280], fl = 60;
  let s = L(cl[0] - 30, cl[1] - fl, cl[0] + 30, cl[1] - fl, B, 3) + L(cr[0] - 30, cr[1] - fl, cr[0] + 30, cr[1] - fl, B, 3);
  [cl, cr].forEach((c) => { s += `<path d="M${c[0] - 22},${c[1]} L${c[0] + 22},${c[1]} L${c[0] + 12},${c[1] + 22} L${c[0] - 12},${c[1] + 22} z" fill="${BODY}"/>` + L(c[0], c[1], P0[0], P0[1], GR, 1.6, '6 5'); });
  const hit = (c) => { const t = fl / (c[1] - P0[1]); return [c[0] + (P0[0] - c[0]) * t, c[1] - fl]; }, hl = hit(cl), hr = hit(cr);
  s += `<circle cx="${f(hl[0])}" cy="${f(hl[1])}" r="5" fill="${R}"/><circle cx="${f(hr[0])}" cy="${f(hr[1])}" r="5" fill="${R}"/>`;
  s += L(cl[0], cl[1] - fl - 14, hl[0], cl[1] - fl - 14, R, 2) + L(cr[0], cr[1] - fl - 14, hr[0], cr[1] - fl - 14, R, 2) + T(cl[0] - 36, cl[1] - fl + 4, svgtx('left image', 'image gauche'), B, { a: 'end', fs: 12 }) + T(cr[0] + 36, cr[1] - fl + 4, svgtx('right image', 'image droite'), B, { fs: 12 }) + T((cl[0] + cr[0]) / 2, cl[1] + 4, svgtx('red: the shifts', 'rouge : les décalages'), R, { a: 'middle', fs: 12 });
  s += `<circle cx="${P0[0]}" cy="${P0[1]}" r="7" fill="${O}"/>` + T(P0[0] + 12, P0[1] + 4, svgtx('point of the scene', 'point de la scène'), O, { b: 1, fs: 14 });
  s += L(cl[0], cl[1] + 36, cr[0], cr[1] + 36, 'currentColor', 1.6) + T((cl[0] + cr[0]) / 2, cl[1] + 54, svgtx('baseline B', 'base B'), 'currentColor', { a: 'middle', b: 1, fs: 14 });
  s += L(590, P0[1], 590, cl[1], 'currentColor', 1.4) + T(600, (P0[1] + cl[1]) / 2, svgtx('depth Z', 'profondeur Z'), 'currentColor', { b: 1, fs: 14 });
  s += T(600, (P0[1] + cl[1]) / 2 + 30, 'Z = f B / d', O, { b: 1, fs: 16 }) + T(600, (P0[1] + cl[1]) / 2 + 54, svgtx('d = disparity (the two shifts added)', 'd = disparité (les deux décalages)'), GR, { fs: 12 });
  return fig('0 20 820 340', s, ['The same point appears shifted in the two images; the total shift is the disparity d. A far point gives a small disparity: Z = f B / d, and the depth error grows with the square of the distance.', 'Le même point apparaît décalé dans les deux images ; le décalage total est la disparité d. Un point lointain donne une petite disparité : Z = f B / d, et l\'erreur de profondeur croît avec le carré de la distance.']);
}

// planning 6.1: a 2-axis arm with an obstacle, and the same obstacle in the configuration space (computed)
export function cspaceFig() {
  const L1 = 0.5, L2 = 0.4, ob = [0.45, 0.45, 0.12];
  const segHit = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((ob[0] - ax) * dx + (ob[1] - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(ax + t * dx - ob[0], ay + t * dy - ob[1]) < ob[2]; };
  const hitQ = (q1, q2) => { const ex = L1 * Math.cos(q1), ey = L1 * Math.sin(q1); return segHit(0, 0, ex, ey) || segHit(ex, ey, ex + L2 * Math.cos(q1 + q2), ey + L2 * Math.sin(q1 + q2)); };
  // left: the workspace
  const U = 230, OX = 140, OY = 260, X = (u) => OX + u * U, Y = (v) => OY - v * U, q = [20 * D, 40 * D];
  let s = T(150, 30, svgtx('Workspace', 'Espace de travail'), 'currentColor', { a: 'middle', b: 1, fs: 15 });
  s += `<circle cx="${X(ob[0])}" cy="${Y(ob[1])}" r="${ob[2] * U}" fill="${R}" fill-opacity="0.3" stroke="${R}" stroke-width="2"/>` + T(X(ob[0]), Y(ob[1]) + 5, svgtx('obstacle', 'obstacle'), R, { a: 'middle', b: 1, fs: 13 });
  const e = [L1 * Math.cos(q[0]), L1 * Math.sin(q[0])], t2 = [e[0] + L2 * Math.cos(q[0] + q[1]), e[1] + L2 * Math.sin(q[0] + q[1])];
  s += L(X(0), Y(0), X(e[0]), Y(e[1]), '#8b96a5', 10) + L(X(e[0]), Y(e[1]), X(t2[0]), Y(t2[1]), '#f5963a', 8) + `<circle cx="${X(0)}" cy="${Y(0)}" r="9" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${X(e[0])}" cy="${Y(e[1])}" r="8" fill="#262c35" stroke="#e8eef5" stroke-width="2"/>`;
  s += T(X(0.25), Y(0) + 26, 'q = (20°, 40°)', B, { a: 'middle', b: 1, fs: 13 });
  // right: the C-space, a grid of (θ₁, θ₂) cells coloured if the arm hits the obstacle
  const cx0 = 400, cy0 = 270, cw = 300, ch = 230, n = 72;
  s += T(cx0 + cw / 2, 30, svgtx('Configuration space', 'Espace des configurations'), 'currentColor', { a: 'middle', b: 1, fs: 15 });
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const q1 = (i + 0.5) / n * Math.PI - 0 * D, q2 = ((j + 0.5) / n * 2 - 1) * Math.PI; if (hitQ(q1, q2)) s += `<rect x="${f(cx0 + i * cw / n)}" y="${f(cy0 - (j + 1) * ch / n)}" width="${f(cw / n + 0.4)}" height="${f(ch / n + 0.4)}" fill="${R}" fill-opacity="0.55"/>`; }
  s += `<rect x="${cx0}" y="${cy0 - ch}" width="${cw}" height="${ch}" fill="none" stroke="currentColor" stroke-opacity="0.5"/>`;
  s += T(cx0 + cw / 2, cy0 + 22, 'θ₁ : 0 → 180°', 'currentColor', { a: 'middle', fs: 13 }) + T(cx0 - 8, cy0 - ch / 2, 'θ₂', 'currentColor', { a: 'end', b: 1, fs: 14 }) + T(cx0 - 8, cy0 - ch + 10, '180°', GR, { a: 'end', fs: 11 }) + T(cx0 - 8, cy0, '−180°', GR, { a: 'end', fs: 11 });
  const px = cx0 + q[0] / Math.PI * cw, py = cy0 - (q[1] / Math.PI + 1) / 2 * ch;
  s += `<circle cx="${f(px)}" cy="${f(py)}" r="6" fill="${B}" stroke="#fff" stroke-width="1.5"/>` + T(px + 10, py + 4, svgtx('the arm = one point', 'le bras = un point'), B, { b: 1, fs: 13 });
  return fig('0 0 740 310', s, ['Left: the arm and an obstacle. Right: every pair of angles (θ₁, θ₂); the red cells are the poses where the arm touches the obstacle. In this space the whole arm is one point, and planning means finding a path between the red regions.', 'À gauche : le bras et un obstacle. À droite : chaque couple d\'angles (θ₁, θ₂) ; les cases rouges sont les poses où le bras touche l\'obstacle. Dans cet espace, tout le bras est un point, et planifier revient à trouver un chemin entre les zones rouges.']);
}

// world 1.3: support polygon of a quadruped, stable and unstable
export function supportFig() {
  const panel = (ox, feet, com, ok, title) => {
    let s = T(ox + 140, 30, title, ok ? G : R, { a: 'middle', b: 1, fs: 15 });
    s += `<polygon points="${feet.map((p) => (ox + p[0]) + ',' + p[1]).join(' ')}" fill="${ok ? G : R}" fill-opacity="0.15" stroke="${ok ? G : R}" stroke-width="2" stroke-dasharray="6 4"/>`;
    [[40, 70], [240, 70], [40, 230], [240, 230]].forEach((p) => { const down = feet.some((q) => q[0] === p[0] && q[1] === p[1]); s += `<circle cx="${ox + p[0]}" cy="${p[1]}" r="12" fill="${down ? BODY : 'none'}" stroke="${BODY}" stroke-width="2"${down ? '' : ' stroke-dasharray="3 3"'}/>`; });
    s += `<rect x="${ox + 55}" y="95" width="170" height="110" rx="16" fill="#f5963a" fill-opacity="0.18" stroke="#f5963a"/>`;
    s += `<circle cx="${ox + com[0]}" cy="${com[1]}" r="8" fill="${ok ? G : R}" stroke="#fff" stroke-width="2"/>` + T(ox + com[0] + 12, com[1] - 10, svgtx('centre of mass', 'centre de masse'), 'currentColor', { fs: 12 });
    return s;
  };
  let s = panel(0, [[40, 70], [240, 70], [40, 230]], [110, 140], true, svgtx('3 feet down, centre inside: stable', '3 pieds au sol, centre dedans : stable'));
  s += panel(360, [[240, 70], [40, 230]], [130, 120], false, svgtx('2 feet down (trot): it falls', '2 pieds au sol (trot) : il tombe'));
  s += T(360, 285, svgtx('dashed: the support polygon (the area between the feet on the ground), seen from above', 'pointillés : le polygone de sustentation (la surface entre les pieds au sol), vu de dessus'), GR, { a: 'middle', fs: 13 });
  return fig('0 0 720 300', s, ['Seen from above: the robot is statically stable while the vertical projection of its centre of mass stays inside the polygon of the feet on the ground. With two feet down the polygon is a line: the robot must keep moving to stay up.', 'Vu de dessus : le robot est statiquement stable tant que la projection verticale de son centre de masse reste dans le polygone des pieds au sol. Avec deux pieds au sol le polygone est une ligne : le robot doit continuer à bouger pour tenir debout.']);
}

// world 2.2: the torque at the shoulder = weights × distances
export function baseTorqueFig() {
  const sx = 90, sy = 150, Lp = 480;
  let s = `<rect x="${sx - 30}" y="${sy}" width="60" height="130" rx="6" fill="${BODY}" fill-opacity="0.5"/>` + L(sx, sy, sx + Lp, sy, '#8b96a5', 14) + `<circle cx="${sx}" cy="${sy}" r="14" fill="#262c35" stroke="#e8eef5" stroke-width="2.5"/>`;
  s += `<rect x="${sx + Lp - 22}" y="${sy + 8}" width="44" height="40" rx="6" fill="${O}" fill-opacity="0.4" stroke="${O}" stroke-width="2"/>` + T(sx + Lp, sy + 33, '5 kg', O, { a: 'middle', b: 1, fs: 13 });
  s += A(sx + Lp, sy + 50, sx + Lp, sy + 120, O, 4) + T(sx + Lp - 10, sy + 110, svgtx('payload: 5 × 9.81 N', 'charge : 5 × 9,81 N'), O, { a: 'end', b: 1, fs: 14 });
  s += `<circle cx="${sx + Lp / 2}" cy="${sy}" r="6" fill="${B}"/>` + A(sx + Lp / 2, sy + 8, sx + Lp / 2, sy + 90, B, 4) + T(sx + Lp / 2 + 8, sy + 80, svgtx('arm 8 kg, at the middle', 'bras 8 kg, au milieu'), B, { b: 1, fs: 14 });
  s += L(sx, sy - 40, sx + Lp, sy - 40, 'currentColor', 1.4) + T(sx + Lp / 2 + 120, sy - 48, 'L = 0.8 m', 'currentColor', { a: 'middle', fs: 14 }) + L(sx, sy - 22, sx + Lp / 2, sy - 22, B, 1.4) + T(sx + Lp / 4, sy - 28, 'L / 2', B, { a: 'middle', fs: 13 });
  s += `<path d="M${sx + 30},${sy} A30,30 0 1 1 ${sx},${sy - 30}" fill="none" stroke="${R}" stroke-width="3"/>` + T(sx - 36, sy - 30, 'τ', R, { a: 'end', b: 1, fs: 18 });
  s += T(300, 292, 'τ ≈ (5 + 8/2) × 9.81 × 0.8 ≈ 71 N·m', R, { a: 'middle', b: 1, fs: 16 });
  return fig('0 60 640 250', s, ['The shoulder must hold every weight times its distance: the payload at full reach and the arm at about half its length. Accelerations add their own torque on top.', 'L\'épaule doit tenir chaque poids fois sa distance : la charge à pleine portée et le bras à environ la moitié de sa longueur. Les accélérations ajoutent leur propre couple par-dessus.']);
}

// world 3.2: flange frame and TCP frame
export function tcpFig() {
  const fx = 260, fy = 120;
  let s = L(80, 60, fx - 30, fy, '#8b96a5', 16) + `<rect x="${fx - 30}" y="${fy - 34}" width="20" height="68" rx="3" fill="${BODY}"/>` + `<rect x="${fx - 10}" y="${fy - 22}" width="120" height="44" rx="6" fill="#f5963a" fill-opacity="0.3" stroke="#f5963a" stroke-width="2"/>` + `<path d="M${fx + 110},${fy - 8} L${fx + 190},${fy - 2} L${fx + 190},${fy + 2} L${fx + 110},${fy + 8} z" fill="#f5963a"/>`;
  const fr = (x, y, c1, c2, n) => A(x, y, x + 60, y, R, 2.6) + A(x, y, x, y - 60, B, 2.6) + T(x + 64, y + 4, 'x', R, { b: 1 }) + T(x - 4, y - 64, 'z', B, { a: 'end', b: 1 }) + `<circle cx="${x}" cy="${y}" r="5" fill="currentColor"/>` + T(x, y + 26, n, 'currentColor', { a: 'middle', b: 1, fs: 14 });
  s += fr(fx - 20, fy, R, B, svgtx('flange', 'bride')) + fr(fx + 190, fy, R, B, 'TCP');
  s += `<path d="M${fx - 10},${fy + 50} Q${fx + 85},${fy + 100} ${fx + 180},${fy + 50}" fill="none" stroke="${P}" stroke-width="2.4"/>` + A(fx + 170, fy + 58, fx + 182, fy + 50, P, 2.4) + T(fx + 85, fy + 110, svgtx('fixed transform flange → TCP (measured once)', 'transformation fixe bride → TCP (mesurée une fois)'), P, { a: 'middle', b: 1, fs: 14 });
  s += T(520, 60, svgtx('the robot knows the flange,', 'le robot connaît la bride,'), 'currentColor', { fs: 13 }) + T(520, 80, svgtx('the program speaks of the TCP', 'le programme parle du TCP'), 'currentColor', { fs: 13 });
  return fig('0 20 720 230', s, ['The robot computes the pose of its flange; the point that works is the TCP at the tip of the tool. A fixed transform links the two, so a wrong TCP moves every taught point.', 'Le robot calcule la pose de sa bride ; le point qui travaille est le TCP au bout de l\'outil. Une transformation fixe relie les deux : un TCP faux décale tous les points appris.']);
}

// ROS 2 6.2: a URDF as a tree of links and joints
export function urdfFig() {
  const link = (x, y, n) => box(x, y, 130, 40, B, svgtx(n)), joint = (x, y, n, t) => (n = svgtx(n), t = svgtx(t), `<ellipse cx="${x}" cy="${y}" rx="72" ry="20" fill="${O}" fill-opacity="0.18" stroke="${O}" stroke-width="2"/>` + T(x, y - 1, n, 'currentColor', { a: 'middle', b: 1, fs: 13 }) + T(x, y + 13, t, GR, { a: 'middle', fs: 11 }));
  let s = link(40, 120, 'base_link') + A(170, 140, 205, 140, GR, 2) + joint(280, 140, 'shoulder', 'revolute') + A(352, 140, 385, 140, GR, 2) + link(388, 120, 'upper_arm') + A(518, 140, 545, 140, GR, 2) + joint(620, 140, 'elbow', 'revolute');
  s += A(620, 160, 620, 205, GR, 2) + link(555, 208, 'forearm') + A(555, 228, 520, 228, GR, 2) + joint(445, 228, 'wrist', 'fixed') + A(373, 228, 340, 228, GR, 2) + link(208, 208, 'tool');
  s += T(40, 60, svgtx('blue: links (rigid parts) — orange: joints (parent → child, origin, axis, type)', 'bleu : segments (pièces rigides) — orange : liaisons (parent → enfant, origine, axe, type)'), 'currentColor', { fs: 13 });
  s += T(40, 290, svgtx('robot_state_publisher reads this tree and the joint angles, and publishes every frame on tf', 'robot_state_publisher lit cet arbre et les angles, et publie chaque repère sur tf'), GR, { fs: 13 });
  return fig('0 30 720 280', s, ['A URDF describes the robot as a chain (a tree) of links joined by joints. Each joint names its parent and its child link, where it sits and how it moves.', 'Un URDF décrit le robot comme une chaîne (un arbre) de segments reliés par des liaisons. Chaque liaison nomme son segment parent et son segment enfant, où elle se trouve et comment elle bouge.']);
}

// arm lab 5.2: a servo pulse every 20 ms; its width sets the angle
export function servoFig() {
  const x0 = 60, y0 = 120, sc = 22;      // 1 ms = 22 px
  const pulse = (t0, w, c) => `<path d="M${x0 + t0 * sc},${y0} L${x0 + t0 * sc},${y0 - 60} L${x0 + (t0 + w) * sc},${y0 - 60} L${x0 + (t0 + w) * sc},${y0}" fill="${c}" fill-opacity="0.2" stroke="${c}" stroke-width="2.5"/>`;
  let s = L(x0, y0, x0 + 26 * sc, y0, 'currentColor', 2) + pulse(0, 1.5, B) + pulse(20, 1.5, B) + T(x0 + 26 * sc + 6, y0 + 4, 't (ms)', 'currentColor', { fs: 12 });
  s += L(x0, y0 + 22, x0 + 20 * sc, y0 + 22, GR, 1.4) + T(x0 + 10 * sc, y0 + 40, svgtx('period 20 ms', 'période 20 ms'), GR, { a: 'middle', fs: 13 }) + T(x0 + 0.75 * sc, y0 - 68, '1.5 ms', B, { a: 'middle', b: 1, fs: 13 });
  const sv = (cx, w, ang, c) => { const a = ang * D; return `<circle cx="${cx}" cy="250" r="34" fill="${BODY}" fill-opacity="0.25" stroke="${BODY}"/>` + L(cx, 250, cx - 46 * Math.cos(a), 250 - 46 * Math.sin(a), c, 6) + `<circle cx="${cx}" cy="250" r="6" fill="${c}"/>` + T(cx, 310, w, c, { a: 'middle', b: 1, fs: 14 }) + T(cx, 328, ang + '°', 'currentColor', { a: 'middle', fs: 13 }); };
  s += sv(140, '0.5 ms', 0, R) + sv(330, '1.5 ms', 90, B) + sv(520, '2.5 ms', 180, G);
  s += T(620, 60, svgtx('pulse width → angle', 'largeur d\'impulsion → angle'), 'currentColor', { b: 1, fs: 14 }) + T(620, 82, svgtx('(check the data sheet)', '(vérifiez la fiche technique)'), GR, { fs: 12 });
  return fig('0 0 800 340', s, ['A hobby servo receives one pulse every 20 ms; only the width of the pulse matters: about 0.5 ms for 0°, 1.5 ms for 90°, 2.5 ms for 180°.', 'Un servo de modélisme reçoit une impulsion toutes les 20 ms ; seule la largeur compte : environ 0,5 ms pour 0°, 1,5 ms pour 90°, 2,5 ms pour 180°.']);
}

// Kalman 2.4: y = A x moves the uncertainty: a circle becomes an ellipse (stretch) or stays a circle (rotation)
export function covFig() {
  const panel = (ox, M, title, sub, c) => {
    const cx = ox + 120, cy = 160, k = 50;
    let s = T(cx, 30, title, 'currentColor', { a: 'middle', b: 1, fs: 15 }) + T(cx, 50, sub, GR, { a: 'middle', fs: 13 });
    s += L(cx - 110, cy, cx + 110, cy, 'currentColor', 1).replace('stroke-width="1"', 'stroke-width="1" stroke-opacity="0.4"') + L(cx, cy - 110, cx, cy + 110, 'currentColor', 1).replace('stroke-width="1"', 'stroke-width="1" stroke-opacity="0.4"');
    let d = '', d0 = ''; for (let i = 0; i <= 60; i++) { const a = i / 60 * 2 * Math.PI, x = Math.cos(a), y = Math.sin(a), X = M[0] * x + M[1] * y, Y = M[2] * x + M[3] * y; d += (i ? 'L' : 'M') + f(cx + X * k) + ',' + f(cy - Y * k); d0 += (i ? 'L' : 'M') + f(cx + x * k) + ',' + f(cy - y * k); }
    s += `<path d="${d0}" fill="none" stroke="${GR}" stroke-width="1.6" stroke-dasharray="5 4"/><path d="${d}" fill="${c}" fill-opacity="0.15" stroke="${c}" stroke-width="3"/>`;
    return s;
  };
  let s = panel(0, [2, 0, 0, 1], 'A = [2 0 ; 0 1]', svgtx('stretch along x: σ₁ = 2', 'étirement selon x : σ₁ = 2'), B);
  const c = Math.SQRT1_2; s += panel(250, [c, -c, c, c], svgtx('A = rotation 45°', 'A = rotation 45°'), svgtx('a circle stays a circle', 'un cercle reste un cercle'), G);
  s += panel(500, [1.6, 0.9, 0.3, 0.8], 'A = [1.6 0.9 ; 0.3 0.8]', svgtx('stretched and tilted', 'étiré et penché'), O);
  return fig('0 0 740 290', s, ['Dashed: the uncertainty of x (σ = 1 in every direction). In colour: the uncertainty of y = A x, Γy = A Γx Aᵀ. A matrix stretches, turns and tilts the uncertainty exactly as it moves the points.', 'En pointillés : l\'incertitude de x (σ = 1 dans toutes les directions). En couleur : l\'incertitude de y = A x, Γy = A Γx Aᵀ. Une matrice étire, tourne et penche l\'incertitude exactement comme elle déplace les points.']);
}

// advanced 1.2: one arm of the Delta robot in its own plane: motor, upper arm L at the angle θ, forearm l to the wrist point Q
export function deltaArmFig() {
  const M = [200, 90], Lp = 150, lp = 230, th = 35 * D, el = [M[0] + Lp * Math.cos(th), M[1] + Lp * Math.sin(th)];
  const Q = [el[0] - 40, el[1] + Math.sqrt(lp * lp - 40 * 40)];
  let s = L(60, M[1], 460, M[1], BODY, 6).replace('stroke-linecap="round"', 'stroke-linecap="round" stroke-opacity="0.6"') + T(70, M[1] - 12, svgtx('fixed base', 'base fixe'), GR, { fs: 13 });
  s += L(M[0], M[1], el[0], el[1], '#f5963a', 10) + L(el[0], el[1], Q[0], Q[1], '#8b96a5', 5) + L(el[0] + 10, el[1] + 2, Q[0] + 10, Q[1] + 2, '#8b96a5', 5);
  s += `<circle cx="${M[0]}" cy="${M[1]}" r="12" fill="#262c35" stroke="#e8eef5" stroke-width="2.5"/><circle cx="${f(el[0])}" cy="${f(el[1])}" r="7" fill="#262c35" stroke="#e8eef5" stroke-width="2"/>`;
  s += `<rect x="${f(Q[0] - 50)}" y="${f(Q[1])}" width="110" height="14" rx="4" fill="${B}" fill-opacity="0.4" stroke="${B}"/>` + `<circle cx="${f(Q[0])}" cy="${f(Q[1])}" r="7" fill="${R}"/>` + T(Q[0] - 58, Q[1] + 12, svgtx('platform', 'plateforme'), B, { a: 'end', fs: 13 });
  s += `<path d="M${M[0] + 50},${M[1]} A50,50 0 0 1 ${f(M[0] + 50 * Math.cos(th))},${f(M[1] + 50 * Math.sin(th))}" fill="none" stroke="${O}" stroke-width="2.5"/>` + T(M[0] + 58, M[1] + 24, 'θ', O, { b: 1, fs: 17 });
  s += T((M[0] + el[0]) / 2 - 4, (M[1] + el[1]) / 2 + 26, svgtx('upper arm L', 'bras L'), '#c0701f', { a: 'end', b: 1, fs: 14 }) + T((el[0] + Q[0]) / 2 + 20, (el[1] + Q[1]) / 2, svgtx('forearm l (parallelogram)', 'avant-bras l (parallélogramme)'), 'currentColor', { b: 1, fs: 14 });
  s += T(Q[0] + 14, Q[1] - 10, svgtx('wrist point Q', 'point du poignet Q'), R, { b: 1, fs: 14 });
  s += `<circle cx="${f(Q[0])}" cy="${f(Q[1])}" r="${lp}" fill="none" stroke="${R}" stroke-width="1.2" stroke-dasharray="4 5" stroke-opacity="0.6"/>` + `<circle cx="${M[0]}" cy="${M[1]}" r="${Lp}" fill="none" stroke="${O}" stroke-width="1.2" stroke-dasharray="4 5" stroke-opacity="0.6"/>`;
  s += T(540, 120, svgtx('the elbow must be', 'le coude doit être'), 'currentColor', { fs: 14 }) + T(540, 142, svgtx('on the circle of radius L', 'sur le cercle de rayon L'), O, { b: 1, fs: 14 }) + T(540, 164, svgtx('around the motor and at the', 'autour du moteur et à la'), 'currentColor', { fs: 14 }) + T(540, 186, svgtx('distance l from Q', 'distance l de Q'), R, { b: 1, fs: 14 }) + T(540, 220, svgtx('→ one angle θ (elbow out)', '→ un angle θ (coude dehors)'), 'currentColor', { b: 1, fs: 14 });
  return fig('0 20 780 400', s, ['One arm of the Delta robot, seen in its own plane. Knowing where the platform must be gives the wrist point Q; the motor angle θ must put the elbow both on the circle of the upper arm and at the distance l from Q.', 'Un bras du robot Delta, vu dans son propre plan. Savoir où doit être la plateforme donne le point du poignet Q ; l\'angle moteur θ doit placer le coude à la fois sur le cercle du bras et à la distance l de Q.']);
}

// advanced 1.3: one leg of the Stewart platform as a vector loop: ℓ = ‖p + R b − a‖
export function stewartFig() {
  const O0 = [120, 290], k = 240, a = [O0[0] + 0.5 * k, O0[1]], p = [O0[0], O0[1] - 0.8 * k], b = [p[0] + 0.3 * k, p[1]];
  let s = L(O0[0] - 140, O0[1], O0[0] + 160, O0[1], BODY, 8).replace('stroke-linecap="round"', 'stroke-linecap="round" stroke-opacity="0.6"') + T(O0[0] - 100, O0[1] + 26, svgtx('base', 'base'), GR, { fs: 13 });
  s += L(p[0] - 100, p[1], p[0] + 100, p[1], B, 7).replace('stroke-linecap="round"', 'stroke-linecap="round" stroke-opacity="0.6"') + T(p[0] - 96, p[1] - 14, svgtx('platform', 'plateforme'), B, { fs: 13 });
  s += L(a[0], a[1], b[0], b[1], '#f5963a', 10) + T((a[0] + b[0]) / 2 + 14, (a[1] + b[1]) / 2, svgtx('leg i: length ℓᵢ', 'jambe i : longueur ℓᵢ'), '#c0701f', { b: 1, fs: 15 });
  s += A(O0[0], O0[1], a[0] - 6, a[1], G, 3) + T((O0[0] + a[0]) / 2, O0[1] + 22, 'aᵢ', G, { a: 'middle', b: 1, fs: 16 });
  s += A(O0[0], O0[1], p[0], p[1] + 6, P, 3) + T(O0[0] - 10, (O0[1] + p[1]) / 2, 'p', P, { a: 'end', b: 1, fs: 16 });
  s += A(p[0], p[1], b[0] - 6, b[1], R, 3) + T((p[0] + b[0]) / 2, p[1] - 12, 'R bᵢ', R, { a: 'middle', b: 1, fs: 16 });
  s += `<circle cx="${O0[0]}" cy="${O0[1]}" r="5" fill="currentColor"/><circle cx="${f(a[0])}" cy="${a[1]}" r="6" fill="${G}"/><circle cx="${f(b[0])}" cy="${b[1]}" r="6" fill="${R}"/>`;
  s += T(430, 110, 'ℓᵢ = ‖ p + R bᵢ − aᵢ ‖', 'currentColor', { b: 1, fs: 17 }) + T(430, 140, svgtx('go up p, out R bᵢ, back aᵢ:', 'monter de p, sortir de R bᵢ, revenir de aᵢ :'), 'currentColor', { fs: 14 }) + T(430, 162, svgtx('what is left is the leg', 'ce qui reste, c\'est la jambe'), 'currentColor', { fs: 14 });
  s += T(430, 206, svgtx('example: a = (0.5, 0, 0), b = (0.3, 0, 0),', 'exemple : a = (0,5 ; 0 ; 0), b = (0,3 ; 0 ; 0),'), GR, { fs: 13 }) + T(430, 226, svgtx('p = (0, 0, 0.8) → ℓ = 0.825 m', 'p = (0 ; 0 ; 0,8) → ℓ = 0,825 m'), GR, { fs: 13 });
  return fig('0 40 760 290', s, ['One leg of the Stewart platform, seen from the side. The vectors p (to the platform centre), R bᵢ (to the leg end on the platform) and aᵢ (to the leg end on the base) close a loop: the length of the leg is what remains.', 'Une jambe de la plateforme de Stewart, vue de côté. Les vecteurs p (vers le centre de la plateforme), R bᵢ (vers le bout de jambe sur la plateforme) et aᵢ (vers le bout de jambe sur la base) ferment une boucle : la longueur de la jambe est ce qui reste.']);
}

// advanced 6.4: from a depth pixel (u, Z) to a 3D point X
export function pcFig() {
  const C = [120, 200], fpx = 140, Zp = 420;
  let s = `<path d="M${C[0] - 20},${C[1] - 18} L${C[0]},${C[1]} L${C[0] - 20},${C[1] + 18} z" fill="${BODY}"/>` + T(C[0] - 26, C[1] + 34, svgtx('camera', 'caméra'), GR, { a: 'end', fs: 13 });
  s += L(C[0], C[1], C[0] + Zp + 60, C[1], GR, 1.4, '6 5') + T(C[0] + Zp + 64, C[1] + 4, svgtx('optical axis', 'axe optique'), GR, { fs: 12 });
  s += L(C[0] + fpx, C[1] - 90, C[0] + fpx, C[1] + 90, B, 3) + T(C[0] + fpx, C[1] + 108, svgtx('image (pixels)', 'image (pixels)'), B, { a: 'middle', fs: 13 });
  const up = 50, Pp = [C[0] + Zp, C[1] - up * Zp / fpx];
  s += L(C[0], C[1], Pp[0], Pp[1], O, 2, '6 4') + `<circle cx="${C[0] + fpx}" cy="${C[1] - up}" r="6" fill="${R}"/>` + T(C[0] + fpx + 10, C[1] - up - 8, svgtx('pixel u (100 px from the centre)', 'pixel u (à 100 px du centre)'), R, { b: 1, fs: 13 });
  s += `<circle cx="${f(Pp[0])}" cy="${f(Pp[1])}" r="7" fill="${O}"/>` + T(Pp[0] + 10, Pp[1] + 4, svgtx('3D point', 'point 3D'), O, { b: 1, fs: 14 });
  s += L(Pp[0], Pp[1], Pp[0], C[1], O, 2) + T(Pp[0] + 8, (Pp[1] + C[1]) / 2, 'X', O, { b: 1, fs: 16 });
  s += L(C[0], C[1] + 40, Pp[0], C[1] + 40, 'currentColor', 1.4) + T((C[0] + Pp[0]) / 2, C[1] + 58, svgtx('depth Z (from the depth camera)', 'profondeur Z (donnée par la caméra)'), 'currentColor', { a: 'middle', fs: 13 }) + L(C[0], C[1] + 70, C[0] + fpx, C[1] + 70, B, 1.4) + T(C[0] + fpx / 2, C[1] + 88, 'f', B, { a: 'middle', b: 1, fs: 14 });
  s += T(620, 120, 'X = (u − cₓ) Z / f', 'currentColor', { b: 1, fs: 16 }) + T(620, 146, svgtx('similar triangles:', 'triangles semblables :'), GR, { fs: 13 }) + T(620, 166, 'X / Z = (u − cₓ) / f', GR, { fs: 13 });
  return fig('0 20 800 300', s, ['Each pixel of a depth image comes with its distance Z. The pixel and the 3D point are on the same ray from the camera (similar triangles), so X = (u − cₓ) Z / f: one 3D point per pixel, a point cloud.', 'Chaque pixel d\'une image de profondeur arrive avec sa distance Z. Le pixel et le point 3D sont sur le même rayon issu de la caméra (triangles semblables), donc X = (u − cₓ) Z / f : un point 3D par pixel, un nuage de points.']);
}

// parallel 6.2: Newton's method for the forward model: a few iterations from the last position
export function newtonFig() {
  const x0 = 70, y0 = 250, w = 480, h = 200, X = (t) => x0 + t * w, Y = (v) => y0 - v * h, g = (x) => 0.1 + 0.85 * x * x;
  let s = L(x0, y0, x0 + w + 10, y0, 'currentColor', 1.2) + L(x0, y0 + 10, x0, 30, 'currentColor', 1.2) + T(x0 + w + 12, y0 + 4, 'X', 'currentColor', { b: 1 }) + T(x0 + 8, 40, svgtx('motor angle G(X)', 'angle moteur G(X)'), 'currentColor', { fs: 13 });
  let d = ''; for (let i = 0; i <= 100; i++) { const t = i / 100; d += (i ? 'L' : 'M') + f(X(t)) + ',' + f(Y(g(t))); } s += `<path d="${d}" fill="none" stroke="${B}" stroke-width="3"/>`;
  const target = 0.5; s += L(x0, Y(target), x0 + w, Y(target), R, 1.6, '6 5') + T(x0 + 8, Y(target) - 8, svgtx('measured motor angle θₐ', 'angle moteur mesuré θₐ'), R, { b: 1, fs: 13 });
  let xk = 0.97; const dg = (x) => 1.7 * x;
  for (let k = 0; k < 3; k++) { const yk = g(xk), xn = xk + (target - yk) / dg(xk); s += `<circle cx="${f(X(xk))}" cy="${f(Y(yk))}" r="5" fill="${O}"/>` + L(X(xk), Y(yk), X(xn), Y(target), O, 2) + L(X(xn), Y(target), X(xn), Y(g(xn)), GR, 1.2, '3 3') + T(X(xk) + 8, Y(yk) + 18, 'X' + ['₀', '₁', '₂'][k], O, { b: 1, fs: 14 }); xk = xn; }
  s += T(600, 110, svgtx('start from the last position X₀', 'partir de la dernière position X₀'), 'currentColor', { fs: 13 }) + T(600, 132, svgtx('follow the tangent (the Jacobian)', 'suivre la tangente (la jacobienne)'), 'currentColor', { fs: 13 }) + T(600, 154, svgtx('2 or 3 steps are enough', '2 ou 3 pas suffisent'), O, { b: 1, fs: 13 });
  return fig('0 20 800 270', s, ['Newton\'s method in one dimension: from the last known position, the tangent of the model gives a better guess; each step lands much closer to the position that matches the measured motor angle.', 'La méthode de Newton en une dimension : depuis la dernière position connue, la tangente du modèle donne une meilleure estimation ; chaque pas arrive beaucoup plus près de la position qui correspond à l\'angle moteur mesuré.']);
}

// ---------------------------------------------------------------------------------------- the robots of the two hard DHM exercises
// Drawn in 3D without frames: only the parts, the dimensions and the way each joint moves (x right, z up, y into the page).
const dim3 = (V, a, b, txt, dx = 0, dy = 0, c = '#7d8796') => { const [x1, y1] = V.P(a), [x2, y2] = V.P(b); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="1.4"/><circle cx="${f(x1)}" cy="${f(y1)}" r="2.5" fill="${c}"/><circle cx="${f(x2)}" cy="${f(y2)}" r="2.5" fill="${c}"/>` + T((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy, txt, 'currentColor', { a: 'middle', b: 1, fs: 14 }); };
const spin = (V, c, axis, r, col, lab, dx = 0, dy = 0) => { const u = axis[2] ? [1, 0, 0] : [0, 0, 1]; return V.arc(c, axis, u, 1.5 * Math.PI, r, col, 2.4) + V.text(c, lab, col, dx, dy, { b: 1, fs: 13 }); };

// exercise 1: SCARA R R P R (shoulder 0.35, links 0.40 and 0.30, slide q₃, tool 0.10 under the last frame)
export function scaraExFig() {
  const V = V3(150, 300, 300), j1 = [0, 0, 0.35], j2 = [0.4, 0, 0.35], j3 = [0.7, 0, 0.35], tip = [0.7, 0, 0.12];
  let s = V.poly([[-0.12, -0.12, 0], [0.12, -0.12, 0], [0.12, 0.12, 0], [-0.12, 0.12, 0]], '#8b96a5', 0.25);
  s += V.line([0, 0, 0], [0, 0, 0.33], '#8b96a5', 22) + V.line(j1, j2, '#f5963a', 16) + V.line(j2, j3, '#f5963a', 13);
  s += V.line([0.7, 0, 0.55], [0.7, 0, 0.18], '#5d6878', 8) + V.line([0.7, 0, 0.18], tip, R, 4) + `<circle cx="${f(V.P(tip)[0])}" cy="${f(V.P(tip)[1])}" r="5" fill="${R}"/>`;
  s += spin(V, [0, 0, 0.42], [0, 0, 1], 0.09, B, svgtx('joint 1', 'liaison 1'), -86, -20) + spin(V, [0.4, 0, 0.42], [0, 0, 1], 0.08, B, svgtx('joint 2', 'liaison 2'), -30, -58);
  s += V.arrow([0.78, 0, 0.3], [0.78, 0, 0.48], G, 3) + V.arrow([0.78, 0, 0.3], [0.78, 0, 0.14], G, 3) + V.text([0.78, 0, 0.5], svgtx('joint 3: slide q₃ (+ up)', 'liaison 3 : glissière q₃ (+ en haut)'), G, 8, -2, { b: 1, fs: 13 });
  s += spin(V, [0.7, 0, 0.2], [0, 0, 1], 0.06, P, svgtx('joint 4: wrist', 'liaison 4 : poignet'), 26, 30);
  s += V.text(tip, svgtx('tool tip', 'pointe de l\'outil'), R, -10, 18, { a: 'end', b: 1, fs: 13 });
  return `<figure class="figure wide exfig"><svg viewBox="0 30 640 300" class="fig" role="img" aria-hidden="true" style="color:var(--text)">${s}</svg><figcaption>${tx('The robot of exercise 1 at q = 0 (side view). Joints 1, 2 and 4 turn around vertical axes; joint 3 slides up and down.', 'Le robot de l\'exercice 1 à q = 0 (vue de côté). Les liaisons 1, 2 et 4 tournent autour d\'axes verticaux ; la liaison 3 glisse de haut en bas.')}</figcaption></figure>`;
}

// exercise 2: column, shoulder 0.15 in front of axis 1 at 0.50 m, upper arm 0.60, elbow shifted 0.10 towards you, forearm 0.50
export function offsetExFig() {
  const V = V3(130, 320, 300), sh = [0.15, 0, 0.5], el = [0.75, -0.1, 0.5], tool = [1.25, -0.1, 0.5];
  let s = V.poly([[-0.12, -0.12, 0], [0.12, -0.12, 0], [0.12, 0.12, 0], [-0.12, 0.12, 0]], '#8b96a5', 0.25);
  s += V.line([0, 0, 0], [0, 0, 0.56], '#8b96a5', 22) + V.line([0, 0, 0.5], sh, '#8b96a5', 14);
  s += V.line(sh, [0.75, 0, 0.5], '#f5963a', 15) + V.line([0.75, 0, 0.5], el, '#5d6878', 10) + V.line(el, tool, '#f5963a', 12) + `<circle cx="${f(V.P(tool)[0])}" cy="${f(V.P(tool)[1])}" r="6" fill="${R}"/>`;
  // joint axes (dashed) and their motion
  s += V.line([0, 0, 0.02], [0, 0, 0.8], B, 1.4, '5 4') + spin(V, [0, 0, 0.66], [0, 0, 1], 0.09, B, svgtx('joint 1 (vertical)', 'liaison 1 (verticale)'), -150, -24);
  s += V.line([0.15, 0.25, 0.5], [0.15, -0.5, 0.5], B, 1.4, '5 4') + V.text([0.15, -0.5, 0.5], svgtx('axis 2: towards you', 'axe 2 : vers vous'), B, -16, 14, { a: 'end', b: 1, fs: 13 });
  s += V.line([0.75, 0.25, 0.5], [0.75, -0.5, 0.5], B, 1.4, '5 4') + V.text([0.75, -0.5, 0.5], svgtx('axis 3 (parallel)', 'axe 3 (parallèle)'), B, -10, 14, { a: 'end', b: 1, fs: 13 });
  s += `<circle cx="${f(V.P(sh)[0])}" cy="${f(V.P(sh)[1])}" r="10" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${f(V.P(el)[0])}" cy="${f(V.P(el)[1])}" r="9" fill="#262c35" stroke="#e8eef5" stroke-width="2"/>`;
  s += V.text(tool, svgtx('tool', 'outil'), R, 10, 4, { b: 1, fs: 13 }) + V.text(sh, svgtx('shoulder', 'épaule'), 'currentColor', 10, 28, { fs: 13 }) + V.text(el, svgtx('elbow: shifted towards you', 'coude : décalé vers vous'), O, 14, 44, { b: 1, fs: 13 });
  return `<figure class="figure wide exfig"><svg viewBox="-100 20 820 330" class="fig" role="img" aria-hidden="true" style="color:var(--text)">${s}</svg><figcaption>${tx('The robot of exercise 2 at q = 0 (“towards you” is drawn down and to the left). Axis 1 is vertical; axes 2 and 3 are horizontal and point towards you.', 'Le robot de l\'exercice 2 à q = 0 (« vers vous » est dessiné vers le bas et la gauche). L\'axe 1 est vertical ; les axes 2 et 3 sont horizontaux et dirigés vers vous.')}</figcaption></figure>`;
}
