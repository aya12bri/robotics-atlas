// more-figs.mjs — drawings for the courses on perception and AI, the real world, ROS 2, the arm labs and Kalman:
// stereo depth, configuration space, support polygon, torque at the shoulder, the TCP, a URDF tree, a servo pulse,
// and how a matrix moves an uncertainty. Labels go through svgtx (translated with the course).
import { svgtx } from '../lib.mjs';
import { svgText as T, svgLine as L, svgArrow as A, svgFig as fig } from './mk-figs.mjs';

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
