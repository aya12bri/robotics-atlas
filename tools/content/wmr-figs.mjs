// wmr-figs.mjs — drawings for the wheeled-mobile-robot courses (top views): differential drive and its ICR, odometry,
// Ackermann steering, the ICR as the meeting point of the wheel axles, parallel parking, polar coordinates of the goal,
// pure pursuit, the Stanley controller, traction and tipping. Labels go through svgtx (translated with the course).
import { svgtx } from '../lib.mjs';
import { svgText as T, svgLine as L, svgArrow as A, svgFig as fig } from './mk-figs.mjs';

const R = '#e5484d', G = '#2e9e5b', B = '#2f6bff', O = '#e07b00', GR = '#8a94a3', P = '#8a5cf6', BODY = '#3a4552';
const f = (v) => (+v).toFixed(1), D = Math.PI / 180;
// a robot seen from above: centre (x, y), heading a (deg, counter-clockwise, 0 = to the right), length l, width w
const body = (x, y, a, l = 70, w = 46, c = BODY, op = 0.85) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(-a)})"><rect x="${-l / 2}" y="${-w / 2}" width="${l}" height="${w}" rx="8" fill="${c}" fill-opacity="${op}"/><path d="M${l / 2 - 14},-7 L${l / 2 - 2},0 L${l / 2 - 14},7 z" fill="#fff"/></g>`;
const wheel = (x, y, a, c = '#1d232c') => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(-a)})"><rect x="-13" y="-5" width="26" height="10" rx="3" fill="${c}" stroke="#e8eef5" stroke-width="1.2"/></g>`;
const dot = (x, y, c, r = 5) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}"/>`;
const arcPath = (cx, cy, r, a0, a1, c, w = 2, dash) => { let d = ''; const n = 40; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * D; d += (i ? 'L' : 'M') + f(cx + r * Math.cos(a)) + ',' + f(cy - r * Math.sin(a)); } return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`; };

// 4.2 differential drive: two wheel speeds, the robot speed v and the ICR
export function diffFig() {
  const cx = 200, cy = 200, half = 50, icrY = cy - 170;           // the robot looks to the right; the ICR is on the axle line, to the left (up)
  let s = body(cx, cy, 0, 90, 100) + wheel(cx, cy - half - 6, 0) + wheel(cx, cy + half + 6, 0);
  s += L(cx, icrY - 20, cx, cy + half + 40, GR, 1.4, '6 5') + T(cx + 8, cy + half + 52, svgtx('axle line', 'ligne de l\'essieu'), GR, { fs: 12 });
  s += dot(cx, icrY, R, 6) + T(cx + 10, icrY + 4, svgtx('ICR', 'CIR'), R, { b: 1, fs: 15 });
  s += A(cx, cy - half - 6, cx + 70, cy - half - 6, B, 4) + T(cx + 76, cy - half - 2, svgtx('v_L (left wheel, inside: slow)', 'v_L (roue gauche, intérieure : lente)'), B, { b: 1, fs: 14 });
  s += A(cx, cy + half + 6, cx + 150, cy + half + 6, G, 4) + T(cx + 156, cy + half + 10, svgtx('v_R (right wheel, outside: fast)', 'v_R (roue droite, extérieure : rapide)'), G, { b: 1, fs: 14 });
  s += A(cx, cy, cx + 110, cy, O, 4) + T(cx + 116, cy + 5, 'v', O, { b: 1, fs: 16 });
  s += arcPath(cx, icrY, 170, -90, -55, R, 2, '6 5') + T(cx + 98, cy - 34, 'ω', R, { b: 1, fs: 16 });
  s += L(cx + 6, cy, cx + 6, icrY, R, 1.2) + T(cx - 8, (cy + icrY) / 2, 'R', R, { a: 'end', b: 1, fs: 15 });
  s += T(470, 70, 'v = (v_R + v_L) / 2', 'currentColor', { b: 1, fs: 15 }) + T(470, 98, 'ω = (v_R − v_L) / L', 'currentColor', { b: 1, fs: 15 }) + T(470, 126, 'R = v / ω', 'currentColor', { b: 1, fs: 15 });
  s += T(470, 166, svgtx('the faster wheel is outside:', 'la roue la plus rapide est à l\'extérieur :'), 'currentColor', { fs: 13 }) + T(470, 186, svgtx('the robot turns towards the slow one', 'le robot tourne vers la plus lente'), 'currentColor', { fs: 13 });
  s += T(470, 224, svgtx('L = distance between the wheels', 'L = distance entre les roues'), GR, { fs: 13 });
  return fig('0 10 780 320', s, ['Differential drive seen from above: the two wheels turn around the same point, the ICR, on the line of the axle. The robot speed is the average of the wheel speeds, its rotation their difference divided by L.', 'Entraînement différentiel vu de dessus : les deux roues tournent autour du même point, le CIR, sur la ligne de l\'essieu. La vitesse du robot est la moyenne des vitesses des roues, sa rotation leur différence divisée par L.']);
}

// 4.6 odometry: a few steps, each one an arc Δs with a turn Δθ
export function odoFig() {
  let s = '', x = 70, y = 230, a = 0; const steps = [[60, 8], [60, 12], [60, 16], [60, 10], [60, 4]];
  s += body(x, y, a, 44, 30, GR, 0.5);
  steps.forEach(([ds, dth], i) => {
    const am = (a + dth / 2) * D, nx = x + ds * Math.cos(am) * 1.6, ny = y - ds * Math.sin(am) * 1.6;
    s += A(x, y, nx, ny, i === 2 ? O : B, i === 2 ? 4 : 2.6);
    if (i === 2) s += T((x + nx) / 2 - 8, (y + ny) / 2 - 12, 'Δs', O, { b: 1, fs: 16, a: 'end' }) + T(nx + 10, ny + 22, 'Δθ', O, { b: 1, fs: 16 });
    x = nx; y = ny; a += dth;
    s += body(x, y, a, 44, 30, i === steps.length - 1 ? BODY : GR, i === steps.length - 1 ? 0.9 : 0.45);
  });
  s += T(x + 30, y + 6, svgtx('estimated pose (x, y, θ)', 'pose estimée (x, y, θ)'), 'currentColor', { b: 1, fs: 14 });
  s += T(500, 200, 'Δs = (Δs_R + Δs_L) / 2', 'currentColor', { b: 1, fs: 14 }) + T(500, 226, 'Δθ = (Δs_R − Δs_L) / L', 'currentColor', { b: 1, fs: 14 }) + T(500, 256, svgtx('each step adds to the last one:', 'chaque pas s\'ajoute au précédent :'), GR, { fs: 13 }) + T(500, 276, svgtx('the errors add up too', 'les erreurs aussi s\'ajoutent'), R, { b: 1, fs: 13 });
  return fig('0 0 780 300', s, ['Odometry: at each time step the encoders give the distances rolled by the two wheels; the robot moves by Δs and turns by Δθ, and the pose is updated step after step from the start.', 'L\'odométrie : à chaque pas de temps, les codeurs donnent les distances roulées par les deux roues ; le robot avance de Δs et tourne de Δθ, et la pose est mise à jour pas après pas depuis le départ.']);
}

// 5.4 Ackermann: track 1.4 m, wheelbase 2.5 m, inside 16.2°, outside 14.0°, all axles meet at the ICC (car looking to the right, turning right)
export function ackFig() {
  const k = 40, rx = 150, ry = 110, l = 2.5 * k, d = 1.4 * k;          // rear axle centre (rx, ry)
  const R0 = l / Math.tan(15 * D), icc = [rx, ry + R0];
  const RT = [rx, ry - d / 2], RB = [rx, ry + d / 2], FT = [rx + l, ry - d / 2], FB = [rx + l, ry + d / 2];   // FB = inside (nearer the ICC)
  let s = `<rect x="${rx - 26}" y="${ry - d / 2 - 18}" width="${l + 52}" height="${d + 36}" rx="14" fill="${BODY}" fill-opacity="0.2" stroke="${BODY}" stroke-width="1.5"/>`;
  s += L(rx, ry - d / 2 - 30, icc[0], icc[1] + 10, GR, 1.4, '6 5');
  const ang = (p) => Math.atan2(icc[1] - p[1], p[0] - icc[0]) / D;   // direction ICC → wheel; the wheel rolls perpendicular to it
  s += L(icc[0], icc[1], FT[0], FT[1], B, 1.4, '6 5') + L(icc[0], icc[1], FB[0], FB[1], R, 1.4, '6 5');
  s += wheel(RT[0], RT[1], 0) + wheel(RB[0], RB[1], 0) + wheel(FT[0], FT[1], ang(FT) - 90) + wheel(FB[0], FB[1], ang(FB) - 90);
  s += dot(icc[0], icc[1], R, 6) + T(icc[0] + 12, icc[1] + 5, svgtx('ICC: all the axles meet here', 'CIR : tous les essieux se coupent ici'), R, { b: 1, fs: 14 });
  s += T(FB[0] + 20, FB[1] + 18, svgtx('inside 16.2°', 'intérieure 16,2°'), R, { b: 1, fs: 14 }) + T(FT[0] + 20, FT[1] - 8, svgtx('outside 14.0°', 'extérieure 14,0°'), B, { b: 1, fs: 14 });
  s += L(rx, ry - d / 2 - 44, rx + l, ry - d / 2 - 44, 'currentColor', 1.4) + T(rx + l / 2, ry - d / 2 - 52, svgtx('wheelbase l = 2.5 m', 'empattement l = 2,5 m'), 'currentColor', { a: 'middle', fs: 13 });
  s += L(rx - 44, ry - d / 2, rx - 44, ry + d / 2, 'currentColor', 1.4) + T(rx - 50, ry + 5, svgtx('track d = 1.4 m', 'voie d = 1,4 m'), 'currentColor', { a: 'end', fs: 13 });
  s += T(340, 210, svgtx('cot δ_e − cot δ_i = d / l'), 'currentColor', { b: 1, fs: 15 }) + T(340, 236, '4.01 − 3.45 = 0.56 = 1.4 / 2.5 ✓', 'currentColor', { fs: 14 });
  s += T(340, 276, svgtx('the inside wheel turns more:', 'la roue intérieure braque plus :'), 'currentColor', { fs: 13 }) + T(340, 296, svgtx('it is on a smaller circle', 'elle est sur un plus petit cercle'), 'currentColor', { fs: 13 });
  return fig(`-20 0 640 ${f(icc[1] + 40)}`, s, ['Ackermann steering: the two front wheels are turned by different angles so that the axles of all four wheels meet at the same point, the ICC. Then no tyre is dragged sideways.', 'La direction d\'Ackermann : les deux roues avant sont braquées d\'angles différents pour que les essieux des quatre roues se coupent au même point, le CIR. Alors aucun pneu n\'est traîné de côté.']);
}

// 7.2 the ICR: the zero-motion lines of all the wheels meet at one point
export function icrFig() {
  const icr = [150, 250];
  const wheels = [[430, 120, 25], [520, 250, 0], [400, 300, -15]].map(([x, y]) => { const a = Math.atan2(icr[1] - y, x - icr[0]) / D; return [x, y, a]; });
  let s = body(460, 230, 90 - 18, 190, 130, BODY, 0.18);
  wheels.forEach(([x, y, a]) => { s += L(x, y, icr[0], icr[1], GR, 1.4, '6 5') + `<g transform="translate(${x},${y}) rotate(${f(-a + 90)})"><rect x="-16" y="-6" width="32" height="12" rx="3" fill="#1d232c" stroke="#e8eef5" stroke-width="1.2"/></g>`; const r = Math.hypot(x - icr[0], y - icr[1]), ang = Math.atan2(icr[1] - y, x - icr[0]); s += A(x, y, x - 46 * Math.sin(ang), y - 46 * Math.cos(ang), G, 3); });
  s += dot(icr[0], icr[1], R, 7) + T(icr[0] - 12, icr[1] + 4, svgtx('ICR', 'CIR'), R, { a: 'end', b: 1, fs: 16 });
  s += T(60, 60, svgtx('dashed: the zero-motion line of each wheel (along its axle)', 'pointillés : la ligne de mouvement nul de chaque roue (le long de son axe)'), GR, { fs: 13 }) + T(60, 82, svgtx('green: each wheel rolls perpendicular to its line', 'vert : chaque roue roule perpendiculairement à sa ligne'), G, { fs: 13 });
  return fig('0 0 700 340', s, ['Each standard wheel can only roll along its own plane: it must turn around a point of its zero-motion line. When all these lines meet at one point, the ICR, the robot can move by turning around it; if they do not meet, the robot cannot move without slipping.', 'Chaque roue standard ne peut rouler que dans son propre plan : elle doit tourner autour d\'un point de sa ligne de mouvement nul. Quand toutes ces lignes se coupent en un point, le CIR, le robot peut bouger en tournant autour ; si elles ne se coupent pas, il ne peut pas bouger sans glisser.']);
}

// 8.2 nonholonomic: a car can reach a place beside it, but only with manoeuvres
export function parkFig() {
  let s = `<rect x="40" y="80" width="620" height="200" rx="6" fill="none" stroke="${GR}" stroke-dasharray="4 4"/>`;
  s += body(160, 140, 0, 90, 50, GR, 0.45) + T(160, 108, svgtx('start', 'départ'), GR, { a: 'middle', fs: 13 });
  s += body(160, 230, 0, 90, 50, BODY, 0.9) + T(160, 276, svgtx('goal: 1.5 m to the side', 'but : 1,5 m sur le côté'), 'currentColor', { a: 'middle', b: 1, fs: 13 });
  s += A(212, 140, 212, 222, R, 3, '6 5') + T(222, 186, svgtx('impossible: no sideways speed', 'impossible : aucune vitesse latérale'), R, { b: 1, fs: 13 });
  s += `<path d="M205,140 C300,140 360,150 400,200 C430,240 400,260 300,250 C240,245 220,232 205,230" fill="none" stroke="${G}" stroke-width="3"/>` + A(320, 251, 300, 250, G, 3);
  s += T(410, 150, svgtx('possible: forward, then reverse', 'possible : en avant, puis en marche arrière'), G, { b: 1, fs: 13 }) + T(410, 170, svgtx('(a parallel parking manoeuvre)', '(un créneau)'), G, { fs: 13 });
  s += T(350, 50, svgtx('Every pose can be reached, but not in every direction of motion', 'Toutes les poses sont atteignables, mais pas dans toutes les directions de mouvement'), 'currentColor', { a: 'middle', b: 1, fs: 14 });
  return fig('0 0 700 300', s, ['A nonholonomic constraint limits the velocities, not the reachable positions: the car cannot slide sideways, but a manoeuvre takes it to the place beside it.', 'Une contrainte non holonome limite les vitesses, pas les positions atteignables : la voiture ne peut pas glisser de côté, mais une manœuvre l\'amène à la place d\'à côté.']);
}

// 9.4 polar coordinates of the goal: ρ, α, β
export function polarFig() {
  const goal = [560, 90], rob = [170, 250], th = 15, ang = Math.atan2(rob[1] - goal[1], goal[0] - rob[0]) / D;
  let s = L(goal[0] - 60, goal[1], goal[0] + 90, goal[1], GR, 1.4) + A(goal[0], goal[1], goal[0] + 80, goal[1], GR, 2) + T(goal[0] + 86, goal[1] + 4, svgtx('goal heading', 'cap du but'), GR, { fs: 12 }) + dot(goal[0], goal[1], R, 7) + T(goal[0] + 10, goal[1] - 12, svgtx('goal', 'but'), R, { b: 1, fs: 15 });
  s += body(rob[0], rob[1], th, 80, 50) + A(rob[0], rob[1], rob[0] + 110 * Math.cos(th * D), rob[1] - 110 * Math.sin(th * D), B, 2.6) + T(rob[0] + 116 * Math.cos(th * D), rob[1] - 116 * Math.sin(th * D) + 16, svgtx('robot heading θ', 'cap du robot θ'), B, { fs: 13 });
  s += L(rob[0], rob[1], goal[0], goal[1], O, 3) + T((rob[0] + goal[0]) / 2 - 10, (rob[1] + goal[1]) / 2 - 12, 'ρ', O, { b: 1, fs: 18 });
  s += arcPath(rob[0], rob[1], 70, th, ang, P, 2.6) + T(rob[0] + 82, rob[1] - 30, 'α', P, { b: 1, fs: 18 });
  s += arcPath(goal[0], goal[1], 60, 180 + ang, 180, G, 2.6) + T(goal[0] - 76, goal[1] + 26, 'β', G, { b: 1, fs: 18 });
  s += T(60, 50, svgtx('ρ: distance to the goal', 'ρ : distance au but'), O, { b: 1, fs: 14 }) + T(60, 72, svgtx('α: angle between the heading and the goal', 'α : angle entre le cap et le but'), P, { b: 1, fs: 14 }) + T(60, 94, svgtx('β: angle of the line at the goal', 'β : angle de la droite au but'), G, { b: 1, fs: 14 });
  return fig('0 0 740 300', s, ['The robot described from the goal: ρ is how far it is, α how much it must turn to face the goal, β the orientation it will have to correct at the goal. The controller drives the three to zero.', 'Le robot décrit depuis le but : ρ dit à quelle distance il est, α de combien il doit tourner pour faire face au but, β l\'orientation qu\'il devra corriger au but. Le contrôleur ramène les trois à zéro.']);
}

// 12.2 pure pursuit: the look-ahead point and the circle tangent to the heading
export function ppFig() {
  const rob = [140, 230], Ld = 210, gx = 170, gy = 120, Rr = (gx * gx + gy * gy) / (2 * gy);   // target in the robot frame (x forward, y left)
  const tg = [rob[0] + gx, rob[1] - gy], cen = [rob[0], rob[1] - Rr];
  let s = `<path d="M40,300 C200,290 330,170 420,110 S600,40 700,40" fill="none" stroke="${GR}" stroke-width="4" stroke-opacity="0.6"/>` + T(690, 64, svgtx('path', 'chemin'), GR, { a: 'end', fs: 13 });
  s += `<circle cx="${rob[0]}" cy="${rob[1]}" r="${Math.hypot(gx, gy)}" fill="none" stroke="${P}" stroke-width="1.4" stroke-dasharray="5 5"/>` + T(rob[0] + 20, rob[1] + 80, svgtx('circle of radius L_d (look-ahead distance)', 'cercle de rayon L_d (distance de visée)'), P, { fs: 13 });
  s += arcPath(cen[0], cen[1], Rr, -90, -90 + Math.atan2(gx, Rr - gy) / D, O, 3) + L(rob[0], rob[1], cen[0], cen[1], O, 1.2, '4 4') + T(cen[0] + 8, (rob[1] + cen[1]) / 2, 'R = L_d² / (2 y_g)', O, { b: 1, fs: 14 });
  s += body(rob[0], rob[1], 0, 70, 44) + dot(tg[0], tg[1], R, 7) + T(tg[0] + 12, tg[1] + 18, svgtx('target on the path', 'cible sur le chemin'), R, { b: 1, fs: 14 });
  s += L(rob[0], rob[1], tg[0], tg[1], P, 2) + L(tg[0], tg[1], tg[0], rob[1], GR, 1.2, '3 4') + T(tg[0] + 6, (tg[1] + rob[1]) / 2 + 30, 'y_g', GR, { b: 1, fs: 14 });
  return fig('0 0 740 330', s, ['Pure pursuit: take the point of the path at the look-ahead distance L_d (red), and steer along the circle that leaves the robot tangent to its heading and goes through that point (orange).', 'Pure pursuit : prenez le point du chemin à la distance de visée L_d (rouge), et suivez le cercle qui part du robot tangent à son cap et passe par ce point (orange).']);
}

// 12.4 Stanley: heading error and cross-track error at the front axle
export function stanleyFig() {
  const fa = [330, 210], hd = -12;
  let s = L(40, 150, 700, 150, GR, 4).replace('stroke-linecap="round"', 'stroke-linecap="round" stroke-opacity="0.6"') + T(690, 140, svgtx('path', 'chemin'), GR, { a: 'end', fs: 13 });
  s += body(fa[0] - 60, fa[1] + 12, -hd, 150, 70, BODY, 0.25) + wheel(fa[0], fa[1], -hd + 20) + dot(fa[0], fa[1], O, 5) + T(fa[0] - 10, fa[1] + 30, svgtx('front axle', 'essieu avant'), O, { a: 'end', fs: 13 });
  s += L(fa[0], fa[1], fa[0], 150, R, 3) + T(fa[0] + 8, 186, 'e_y', R, { b: 1, fs: 16 });
  s += A(fa[0], fa[1], fa[0] + 150 * Math.cos(-hd * D), fa[1] - 150 * Math.sin(-hd * D), B, 2.6) + T(fa[0] + 156, fa[1] + 30, svgtx('heading', 'cap'), B, { fs: 13 });
  s += L(fa[0], fa[1], fa[0] + 150, fa[1], GR, 1.2, '4 4') + arcPath(fa[0], fa[1], 90, 0, -hd * -1, P, 2.4) + T(fa[0] + 98, fa[1] + 4, 'e_θ', P, { b: 1, fs: 16 });
  s += A(fa[0], fa[1], fa[0] + 120 * Math.cos(20 * D), fa[1] - 120 * Math.sin(20 * D), O, 3) + T(fa[0] + 124 * Math.cos(20 * D), fa[1] - 124 * Math.sin(20 * D) - 6, svgtx('wheel angle δ', 'braquage δ'), O, { b: 1, fs: 14 });
  s += T(470, 260, svgtx('δ = e_θ + arctan(k e_y / v)'), 'currentColor', { b: 1, fs: 16 }) + T(470, 286, svgtx('fast: the correction of e_y gets weaker', 'rapide : la correction de e_y s\'affaiblit'), GR, { fs: 13 });
  return fig('0 0 740 300', s, ['The Stanley controller looks at the front axle: e_θ is the angle between the car and the path, e_y the distance to the path. The wheel is turned by the heading error plus a correction of the distance that weakens with speed.', 'Le contrôleur de Stanley regarde l\'essieu avant : e_θ est l\'angle entre la voiture et le chemin, e_y la distance au chemin. La roue est braquée de l\'erreur de cap plus une correction de la distance qui s\'affaiblit avec la vitesse.']);
}

// 16.4 tipping: braking, the weight and the inertia meet the wheel line
export function tipFig() {
  const gx = 260, gy = 140, h = 100, b = 70, ground = gy + h;
  let s = L(60, ground, 520, ground, 'currentColor', 2) + `<rect x="${gx - 110}" y="${gy - 50}" width="220" height="${h + 20}" rx="12" fill="${BODY}" fill-opacity="0.25" stroke="${BODY}"/>`;
  s += `<circle cx="${gx - b}" cy="${ground - 18}" r="18" fill="#1d232c"/><circle cx="${gx + b}" cy="${ground - 18}" r="18" fill="#1d232c"/>`;
  s += `<circle cx="${gx}" cy="${gy}" r="9" fill="#fff" stroke="${BODY}" stroke-width="3"/>` + T(gx - 14, gy - 12, svgtx('centre of gravity', 'centre de gravité'), 'currentColor', { a: 'end', b: 1, fs: 13 });
  s += A(gx, gy, gx, gy + 90, B, 3.5) + T(gx + 8, gy + 80, 'm g', B, { b: 1, fs: 15 }) + A(gx, gy, gx + 90, gy, R, 3.5) + T(gx + 94, gy + 5, svgtx('m a (braking)', 'm a (freinage)'), R, { b: 1, fs: 15 });
  s += L(gx, gy, gx + b + 2, ground, O, 2, '6 5') + dot(gx + b, ground, O, 6) + T(gx + b + 10, ground + 22, svgtx('front wheel: the pivot', 'roue avant : le pivot'), O, { b: 1, fs: 13 });
  s += L(gx, ground + 34, gx + b, ground + 34, 'currentColor', 1.4) + T(gx + b / 2, ground + 52, 'b', 'currentColor', { a: 'middle', b: 1 }) + L(gx - 130, gy, gx - 130, ground, 'currentColor', 1.4) + T(gx - 138, gy + h / 2, 'h', 'currentColor', { a: 'end', b: 1 });
  s += T(560, 110, svgtx('No tipping while', 'Pas de basculement tant que'), 'currentColor', { fs: 14 }) + T(560, 136, 'a < g b / h', 'currentColor', { b: 1, fs: 17 }) + T(560, 172, svgtx('the resultant must stay', 'la résultante doit rester'), GR, { fs: 13 }) + T(560, 192, svgtx('between the wheels', 'entre les roues'), GR, { fs: 13 }) + T(560, 226, svgtx('low h, long b: more stable', 'h bas, b long : plus stable'), G, { b: 1, fs: 13 });
  return fig('0 0 760 310', s, ['When the robot brakes, its inertia m a pushes the centre of gravity forward. It tips over the front wheel if the resultant of m g and m a passes in front of it, that is when a > g b / h.', 'Quand le robot freine, son inertie m a pousse le centre de gravité vers l\'avant. Il bascule sur la roue avant si la résultante de m g et m a passe devant elle, c\'est-à-dire quand a > g b / h.']);
}
