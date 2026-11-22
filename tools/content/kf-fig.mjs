// kf-fig.mjs — the static figures of the course "Data fusion and the Kalman filter".
import { PRIM } from './tel-fig.mjs';
const { DEFS, V, box, arr, lab } = PRIM;

// sensors → filter → state
export const sensors = () => {
  const S = [[['IMU', 'Centrale inertielle'], ['100–1000 Hz, drifts', '100–1000 Hz, dérive'], V.p], [['GNSS', 'GNSS'], ['1–10 Hz, m to cm', '1–10 Hz, m à cm'], V.g], [['Wheel encoders', 'Codeurs des roues'], ['100 Hz, slip', '100 Hz, glissement'], V.o],
    [['Lidar / UWB', 'Lidar / UWB'], ['10–50 Hz, cm', '10–50 Hz, cm'], V.b], [['Camera', 'Caméra'], ['30 Hz, rich, slow', '30 Hz, riche, lente'], V.y], [['Barometer, compass', 'Baromètre, boussole'], ['height, heading', 'altitude, cap'], V.r]];
  let s = DEFS;
  S.forEach((x, i) => { const y = 14 + i * 50; s += box(10, y, 190, 40, x[2], x[0], x[1]) + arr(202, y + 20, 318, 168, V.axis, 1.6); });
  s += box(320, 128, 150, 80, V.b, ['Fusion filter', 'Filtre de fusion'], ['Kalman, EKF…', 'Kalman, EKF…'], { op: 0.3 }) + arr(472, 168, 518, 168);
  s += box(520, 118, 160, 100, V.g, ['Best estimate', 'Meilleure estimation'], ['x̂ and its covariance Γ', 'x̂ et sa covariance Γ']);
  s += lab(600, 246, ['position, speed, heading…', 'position, vitesse, cap…'], { sm: 1, c: V.axis }) + lab(600, 264, ['and how sure we are', 'et à quel point on en est sûr'], { sm: 1, c: V.axis });
  return { vb: '0 0 690 310', svg: s };
};

// the loop of the Kalman filter
export const loop = () => ({ vb: '0 0 690 290', svg: DEFS +
  box(20, 40, 300, 110, V.b, ['1 · Prediction (the model)', '1 · Prédiction (le modèle)'], null, { top: 1 }) +
  lab(170, 98, 'x̂ₖ₊₁|ₖ = Aₖ x̂ₖ|ₖ + uₖ', { sm: 1 }) + lab(170, 122, 'Γₖ₊₁|ₖ = Aₖ Γₖ|ₖ Aₖᵀ + Γα', { sm: 1 }) +
  box(370, 40, 300, 110, V.g, ['2 · Correction (the measurement)', '2 · Correction (la mesure)'], null, { top: 1 }) +
  lab(520, 92, 'ỹ = y − C x̂ , S = C Γ Cᵀ + Γβ', { sm: 1 }) + lab(520, 114, 'K = Γ Cᵀ S⁻¹', { sm: 1 }) + lab(520, 136, 'x̂ ← x̂ + K ỹ , Γ ← (I − K C) Γ', { sm: 1 }) +
  `<path d="M320,70 C345,70 345,70 368,70" style="fill:none;stroke:${V.axis};stroke-width:2.2" marker-end="url(#tA)"/>` +
  `<path d="M520,152 C520,230 170,230 170,152" style="fill:none;stroke:${V.axis};stroke-width:2.2" marker-end="url(#tA)"/>` +
  lab(345, 222, ['k ← k + 1: the corrected estimate becomes the start of the next prediction', 'k ← k + 1 : l\'estimation corrigée devient le départ de la prédiction suivante'], { sm: 1, c: V.axis }) +
  lab(170, 30, ['uncertainty grows', 'l\'incertitude grandit'], { sm: 1, c: V.r }) + lab(520, 30, ['uncertainty shrinks', 'l\'incertitude diminue'], { sm: 1, c: V.g }) +
  arr(470, 268, 470, 186, V.o) + lab(470, 284, ['measurement yₖ arrives', 'la mesure yₖ arrive'], { sm: 1, c: V.o }) });

// a covariance ellipse with its axes
export const ell = () => {
  const cx = 300, cy = 150, a = 170, b = 70, th = -25 * Math.PI / 180, c = Math.cos(th), s0 = Math.sin(th);
  const P = (u, v) => [cx + c * u - s0 * v, cy + s0 * u + c * v];
  let d = ''; for (let k = 0; k <= 64; k++) { const q = k / 64 * 2 * Math.PI, p = P(a * Math.cos(q), b * Math.sin(q)); d += (k ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }
  const A = P(a, 0), Bq = P(0, -b);
  return { vb: '0 0 620 300', svg: DEFS + `<line x1="40" y1="${cy}" x2="580" y2="${cy}" style="stroke:${V.grid}"/><line x1="${cx}" y1="20" x2="${cx}" y2="280" style="stroke:${V.grid}"/>` +
    `<path d="${d}" style="fill:${V.y};fill-opacity:0.12;stroke:${V.y};stroke-width:2.5"/>` + arr(cx, cy, A[0], A[1], V.g) + arr(cx, cy, Bq[0], Bq[1], V.p) +
    lab(A[0] + 10, A[1] - 6, 'a √λ₁', { a: 'start', c: V.g }) + lab(Bq[0] + 8, Bq[1] - 6, 'a √λ₂', { a: 'start', c: V.p }) + `<circle cx="${cx}" cy="${cy}" r="5" style="fill:${V.r}"/>` + lab(cx - 10, cy + 22, 'x̄', { c: V.r }) +
    lab(310, 290, ['axes = eigenvectors of Γ, half-lengths a√λ, a = √(−2 ln(1 − η))', 'axes = vecteurs propres de Γ, demi-longueurs a√λ, a = √(−2 ln(1 − η))'], { sm: 1, c: V.axis }) };
};

// linearisation for the EKF
export const lin = () => {
  let d = ''; for (let k = 0; k <= 60; k++) { const x = -2.2 + 4.4 * k / 60, y = Math.sin(x); d += (k ? 'L' : 'M') + (320 + x * 110).toFixed(1) + ',' + (150 - y * 90).toFixed(1); }
  const x0 = 0.7, y0 = Math.sin(x0), sl = Math.cos(x0), X = (x) => 320 + x * 110, Y = (y) => 150 - y * 90;
  return { vb: '0 0 640 300', svg: DEFS + `<line x1="60" y1="150" x2="590" y2="150" style="stroke:${V.grid}"/>` +
    `<path d="${d}" style="fill:none;stroke:${V.b};stroke-width:3"/>` + `<line x1="${X(x0 - 1.4)}" y1="${Y(y0 - 1.4 * sl)}" x2="${X(x0 + 1.4)}" y2="${Y(y0 + 1.4 * sl)}" style="stroke:${V.o};stroke-width:2.5;stroke-dasharray:7 5"/>` +
    `<circle cx="${X(x0)}" cy="${Y(y0)}" r="6" style="fill:${V.r}"/>` + lab(X(x0) + 12, Y(y0) + 22, 'x̂', { c: V.r, a: 'start' }) +
    lab(130, 60, ['real function g(x)', 'vraie fonction g(x)'], { c: V.b, a: 'start' }) + lab(450, 40, ['tangent: g(x̂) + C (x − x̂)', 'tangente : g(x̂) + C (x − x̂)'], { c: V.o, a: 'start', sm: 1 }) +
    lab(320, 270, ['Close to x̂ the tangent is a good copy of the curve; far away it is not: the EKF works if the error stays small.', 'Près de x̂ la tangente copie bien la courbe ; loin, non : l\'EKF marche si l\'erreur reste petite.'], { sm: 1, c: V.axis }) +
    lab(320, 290, ['C = dg/dx at x̂ (the Jacobian)', 'C = dg/dx en x̂ (la jacobienne)'], { sm: 1, c: V.axis }) };
};

// multilateration: three circles meet at the robot
export const multi = () => {
  const B = [[110, 230], [520, 230], [320, 40]], R = [215, 230, 150], rob = [312, 190];
  let s = DEFS;
  B.forEach((b, i) => { const r = Math.hypot(rob[0] - b[0], rob[1] - b[1]); s += `<circle cx="${b[0]}" cy="${b[1]}" r="${r.toFixed(1)}" style="fill:none;stroke:${V.b};stroke-width:1.8;stroke-dasharray:6 5;opacity:0.8"/>` + `<circle cx="${b[0]}" cy="${b[1]}" r="9" style="fill:${V.y}"/>` + lab(b[0], b[1] + 28, 'B' + (i + 1), { b: 1, c: V.y }) + `<line x1="${b[0]}" y1="${b[1]}" x2="${rob[0]}" y2="${rob[1]}" style="stroke:${V.y};stroke-width:1.4"/>` + lab((b[0] + rob[0]) / 2 + 8, (b[1] + rob[1]) / 2, 'd' + (i + 1), { sm: 1, c: V.y, a: 'start' }); void R; });
  s += `<rect x="${rob[0] - 14}" y="${rob[1] - 10}" width="28" height="20" rx="4" style="fill:${V.o}"/>` + lab(rob[0] + 22, rob[1] - 14, ['robot', 'robot'], { a: 'start', b: 1, c: V.o });
  s += lab(320, 300, ['one distance → a circle; two → two points; three → one point (in the plane)', 'une distance → un cercle ; deux → deux points ; trois → un point (dans le plan)'], { sm: 1, c: V.axis });
  return { vb: '0 0 640 315', svg: s };
};

// centralised and distributed fusion
export const archi = () => ({ vb: '0 0 690 260', svg: DEFS +
  lab(160, 22, ['Centralised', 'Centralisée'], { b: 1 }) + [0, 1, 2].map((i) => box(20, 40 + i * 60, 90, 40, [V.p, V.y, V.g][i], ['M', 'B', 'T'][i]) + arr(110, 60 + i * 60, 188, 120, V.axis, 1.6)).join('') +
  box(190, 95, 120, 50, V.b, ['one filter', 'un seul filtre']) + lab(160, 240, ['every raw measurement goes to one filter', 'chaque mesure brute va à un seul filtre'], { sm: 1, c: V.axis }) +
  lab(510, 22, ['Distributed', 'Distribuée'], { b: 1 }) + [0, 1, 2].map((i) => box(370, 40 + i * 60, 60, 40, [V.p, V.y, V.g][i], ['M', 'B', 'T'][i]) + arr(430, 60 + i * 60, 458, 60 + i * 60, V.axis, 1.6) + box(460, 40 + i * 60, 90, 40, V.b, ['filter', 'filtre'] .map((w) => w + ' ' + (i + 1))) + arr(550, 60 + i * 60, 588, 120, V.axis, 1.6)).join('') +
  box(590, 95, 90, 50, V.g, ['fusion', 'fusion']) + lab(520, 240, ['local filters, then their estimates are fused', 'des filtres locaux, puis leurs estimations sont fusionnées'], { sm: 1, c: V.axis }) });
