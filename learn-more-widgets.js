// learn-more-widgets.js — interactive widgets of the advanced courses (singularities, control, intelligence, real world).
// Each widget is mounted on <div class="widget" data-widget="name">. Texts are given in English and French with L(en, fr).
(function () {
  'use strict';
  var FR = (window.RA && RA.lang) === 'fr';
  var L = function (en, fr) { return FR ? fr : en; };
  var NS = 'http://www.w3.org/2000/svg';
  var rad = Math.PI / 180, deg = 180 / Math.PI;
  var f = function (v, d) { return (isFinite(v) ? v.toFixed(d === undefined ? 3 : d) : '∞').replace('.', FR ? ',' : '.'); };
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html !== undefined) e.innerHTML = html; return e; }
  function sv(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, cls, anchor) { var t = sv('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anchor || 'start' }, parent); t.textContent = s; return t; }
  function slider(label, min, max, step, val, unit, on, dec) {
    var id = 'w' + Math.random().toString(36).slice(2, 8), row = el('div', { 'class': 'wrow' });
    var lab = el('label', { 'for': id }, label), inp = el('input', { type: 'range', id: id, min: min, max: max, step: step, value: val }), out = el('output', {}, '');
    var show = function () { out.textContent = f(+inp.value, dec !== undefined ? dec : (step < 1 ? 2 : 0)) + unit; };
    inp.addEventListener('input', function () { show(); on(+inp.value); }); show();
    row.append(lab, inp, out); row.set = function (v) { inp.value = v; show(); }; return row;
  }
  function buttons(list, on) {
    var box = el('div', { 'class': 'wseg' });
    list.forEach(function (b) { var x = el('button', { type: 'button' }, b[0]); x.addEventListener('click', function () { on(b[1]); }); box.append(x); });
    return box;
  }
  function arrow(svg, x1, y1, x2, y2, color, w) {
    sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color, 'stroke-width': w || 3, 'stroke-linecap': 'round' }, svg);
    var a = Math.atan2(y2 - y1, x2 - x1), h = 9;
    if (Math.hypot(x2 - x1, y2 - y1) > 4) sv('polygon', { points: [x2, y2, x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4), x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)].join(','), fill: color }, svg);
  }
  var mat = function (rows, d) { return '<span class="mx c' + rows[0].length + '">' + rows.map(function (r) { return r.map(function (v) { return '<span>' + f(v, d === undefined ? 2 : d) + '</span>'; }).join(''); }).join('') + '</span>'; };

  // ------------------------------------------------------------------ 2-joint arm: Jacobian columns, manipulability ellipse
  function jac2r(root, showEllipse) {
    var S = { L1: 0.5, L2: 0.3, t1: 35, t2: showEllipse ? 60 : 50 };
    root.append(el('h4', {}, showEllipse ? L('Try it: the manipulability ellipse', 'Essayez : l\'ellipse de manipulabilité') : L('Try it: the Jacobian and the singularity', 'Essayez : la jacobienne et la singularité')));
    root.append(el('p', { 'class': 'wnote' }, showEllipse
      ? L('The yellow ellipse shows the tool velocities that unit joint speeds can produce. Bring θ₂ close to 0° and watch it flatten; read w and κ.', 'L\'ellipse jaune montre les vitesses d\'outil que des vitesses articulaires unitaires peuvent produire. Approchez θ₂ de 0° et regardez-la s\'aplatir ; lisez w et κ.')
      : L('The two arrows at the tool are the two columns of J (what joint 1 and joint 2 each do at 1 rad/s). Bring θ₂ to 0° or 180°: the arrows become parallel, det J = 0.', 'Les deux flèches à l\'outil sont les deux colonnes de J (ce que chaque articulation fait à 1 rad/s). Amenez θ₂ à 0° ou 180° : les flèches deviennent parallèles, det J = 0.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var s1 = slider('θ₁', -180, 180, 1, S.t1, '°', function (v) { S.t1 = v; draw(); });
    var s2 = slider('θ₂', -180, 180, 1, S.t2, '°', function (v) { S.t2 = v; draw(); });
    var btn = buttons([[L('stretched', 'tendu'), 0], [L('best (90°)', 'meilleur (90°)'), 90], [L('folded', 'replié'), 180]], function (v) { S.t2 = v; s2.set(v); draw(); });
    ctl.append(s1, s2, btn, out);
    var svg = sv('svg', { viewBox: '0 0 480 300', 'class': 'wsvg', role: 'img', 'aria-label': L('Two-joint arm with Jacobian columns', 'Bras à deux articulations avec colonnes de la jacobienne') });
    box.append(svg, ctl); root.append(box);
    var OX = 190, OY = 150, K = 170, AS = 0.55 * K;
    function draw() {
      var a = S.t1 * rad, b = (S.t1 + S.t2) * rad, L1 = S.L1, L2 = S.L2;
      var jx = L1 * Math.cos(a), jy = L1 * Math.sin(a), ex = jx + L2 * Math.cos(b), ey = jy + L2 * Math.sin(b);
      var c1x = -L1 * Math.sin(a) - L2 * Math.sin(b), c1y = L1 * Math.cos(a) + L2 * Math.cos(b), c2x = -L2 * Math.sin(b), c2y = L2 * Math.cos(b);
      var det = c1x * c2y - c2x * c1y;
      var A = c1x * c1x + c2x * c2x, B = c1x * c1y + c2x * c2y, D = c1y * c1y + c2y * c2y;
      var tr = A + D, disc = Math.sqrt(Math.max(0, (A - D) * (A - D) / 4 + B * B)), l1 = tr / 2 + disc, l2 = Math.max(0, tr / 2 - disc), phi = 0.5 * Math.atan2(2 * B, A - D);
      var sg1 = Math.sqrt(l1), sg2 = Math.sqrt(l2), w = Math.abs(det), kap = sg2 < 1e-9 ? Infinity : sg1 / sg2;
      var P = function (x, y) { return [OX + K * x, OY - K * y]; };
      svg.innerHTML = '';
      var o = P(0, 0), j = P(jx, jy), e = P(ex, ey);
      sv('circle', { cx: o[0], cy: o[1], r: K * (L1 + L2), 'class': 'ring' }, svg); sv('circle', { cx: o[0], cy: o[1], r: K * Math.abs(L1 - L2), 'class': 'hole' }, svg);
      sv('line', { x1: 10, y1: OY, x2: 370, y2: OY, 'class': 'ax' }, svg); sv('line', { x1: OX, y1: 10, x2: OX, y2: 290, 'class': 'ax' }, svg);
      if (showEllipse) { var g = sv('g', { transform: 'translate(' + e[0] + ',' + e[1] + ') rotate(' + (-phi * deg) + ')' }, svg); sv('ellipse', { rx: Math.max(0.6, sg1 * AS), ry: Math.max(0.6, sg2 * AS), fill: 'rgba(255,214,10,.22)', stroke: '#ffd60a', 'stroke-width': 2 }, g); }
      sv('polyline', { points: o.join(',') + ' ' + j.join(','), 'class': 'link1' }, svg); sv('polyline', { points: j.join(',') + ' ' + e.join(','), 'class': 'link2' }, svg);
      [o, j].forEach(function (p) { sv('circle', { cx: p[0], cy: p[1], r: 6, 'class': 'jt' }, svg); });
      sv('circle', { cx: e[0], cy: e[1], r: 7, 'class': 'pt' }, svg);
      if (!showEllipse) {
        arrow(svg, e[0], e[1], e[0] + c1x * AS, e[1] - c1y * AS, '#5aa9ff', 3);
        arrow(svg, e[0], e[1], e[0] + c2x * AS, e[1] - c2y * AS, '#ff9f43', 3);
        txt(svg, 474, 266, L('column 1 (joint 1)', 'colonne 1 (articulation 1)'), '', 'end').setAttribute('fill', '#5aa9ff');
        txt(svg, 474, 284, L('column 2 (joint 2)', 'colonne 2 (articulation 2)'), '', 'end').setAttribute('fill', '#ff9f43');
      }
      var state = w < 0.004 ? [L('SINGULAR', 'SINGULIER'), '#ff6b6b'] : (kap > 30 ? [L('near a singularity', 'près d\'une singularité'), '#ff9f43'] : [L('regular', 'régulier'), '#4ed17f']);
      out.innerHTML = '<b style="color:' + state[1] + '">' + state[0] + '</b><br>det J = L₁L₂ sin θ₂ = ' + f(det, 3) + ' m²<br>w = ' + f(w, 3) + ' m² (max ' + f(L1 * L2, 3) + ')<br>σ₁ = ' + f(sg1, 3) + ',  σ₂ = ' + f(sg2, 3) + '<br>κ = σ₁/σ₂ = ' + (isFinite(kap) ? f(kap, 1) : '∞') + '<br>' + L('J = ', 'J = ') + mat([[c1x, c2x], [c1y, c2y]]);
    }
    draw();
  }

  // ------------------------------------------------------------------ gimbal lock
  function gimbal(root) {
    var S = { a: 20, b: 40, g: 10, d: 30 };
    root.append(el('h4', {}, L('Try it: gimbal lock', 'Essayez : le blocage de cardan')));
    root.append(el('p', { 'class': 'wnote' }, L('R = Rz(α) Ry(β) Rx(γ). The second frame uses α + δ and γ + δ. Set β = 90° and the two frames become identical, whatever δ is.', 'R = Rz(α) Ry(β) Rx(γ). Le second repère utilise α + δ et γ + δ. Mettez β = 90° et les deux repères deviennent identiques, quel que soit δ.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var sa = slider('α', -180, 180, 1, S.a, '°', function (v) { S.a = v; draw(); }), sb = slider('β', -180, 180, 1, S.b, '°', function (v) { S.b = v; draw(); }), sg = slider('γ', -180, 180, 1, S.g, '°', function (v) { S.g = v; draw(); }), sd = slider('δ', -90, 90, 1, S.d, '°', function (v) { S.d = v; draw(); });
    ctl.append(sa, sb, sg, sd, buttons([['β = 90°', 90], ['β = 40°', 40]], function (v) { S.b = v; sb.set(v); draw(); }), out);
    var svg = sv('svg', { viewBox: '0 0 480 250', 'class': 'wsvg', role: 'img', 'aria-label': L('Two frames with Cardan angles', 'Deux repères avec angles de Cardan') });
    box.append(svg, ctl); root.append(box);
    function R(a, b, g) {
      var ca = Math.cos(a * rad), sa_ = Math.sin(a * rad), cb = Math.cos(b * rad), sb_ = Math.sin(b * rad), cg = Math.cos(g * rad), sg_ = Math.sin(g * rad);
      return [[ca * cb, ca * sb_ * sg_ - sa_ * cg, ca * sb_ * cg + sa_ * sg_], [sa_ * cb, sa_ * sb_ * sg_ + ca * cg, sa_ * sb_ * cg - ca * sg_], [-sb_, cb * sg_, cb * cg]];
    }
    function frame(parent, cx, cy, M, title) {
      var k = 88, pr = function (v) { return [cx + k * (v[1] - v[0]) * 0.866, cy - k * (v[2] - (v[0] + v[1]) * 0.5) * 0.9]; };
      var cols = [[M[0][0], M[1][0], M[2][0], '#ff6b6b', 'x'], [M[0][1], M[1][1], M[2][1], '#4ed17f', 'y'], [M[0][2], M[1][2], M[2][2], '#5aa9ff', 'z']];
      sv('circle', { cx: cx, cy: cy, r: 3, fill: '#cfd8e3' }, parent);
      cols.forEach(function (c) { var p = pr(c); arrow(parent, cx, cy, p[0], p[1], c[3], 3); txt(parent, p[0] + (p[0] >= cx ? 6 : -6), p[1] + 4, c[4], '', p[0] >= cx ? 'start' : 'end').setAttribute('fill', c[3]); });
      txt(parent, cx, 238, title, '', 'middle');
    }
    function draw() {
      var R1 = R(S.a, S.b, S.g), R2 = R(S.a + S.d, S.b, S.g + S.d), diff = 0, i, j;
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) diff += Math.pow(R1[i][j] - R2[i][j], 2);
      diff = Math.sqrt(diff);
      svg.innerHTML = '';
      frame(svg, 120, 140, R1, L('angles (α, β, γ)', 'angles (α, β, γ)')); frame(svg, 360, 140, R2, L('angles (α+δ, β, γ+δ)', 'angles (α+δ, β, γ+δ)'));
      var lock = Math.abs(Math.cos(S.b * rad)) < 0.01;
      out.innerHTML = 'R = ' + mat(R1) + '<br>' + L('difference between the two frames', 'différence entre les deux repères') + ' : ' + f(diff, 3) + '<br><b style="color:' + (lock ? '#ff6b6b' : '#4ed17f') + '">' + (lock ? L('Gimbal lock: different angles, the same orientation', 'Blocage de cardan : angles différents, même orientation') : L('Regular: the two orientations differ', 'Régulier : les deux orientations diffèrent')) + '</b>';
    }
    draw();
  }

  // ------------------------------------------------------------------ damped least squares along a line
  function dls(root) {
    var S = { lam: 0.05, v: 0.1, x: 0.7 }, L1 = 0.5, L2 = 0.3, LIM = 6;
    root.append(el('h4', {}, L('Try it: the damped inverse', 'Essayez : l\'inverse amortie')));
    root.append(el('p', { 'class': 'wnote' }, L('The tool moves along the arm axis at the speed v towards the stretched pose (x = 0.8 m). Red: joint speed with the exact inverse. Green: with the damped inverse. Grey line: a motor limit of 6 rad/s.', 'L\'outil avance dans l\'axe du bras à la vitesse v vers la pose tendue (x = 0,8 m). Rouge : vitesse articulaire avec l\'inverse exacte. Vert : avec l\'inverse amortie. Ligne grise : une limite moteur de 6 rad/s.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    ctl.append(slider('λ', 0, 0.2, 0.005, S.lam, '', function (v) { S.lam = v; draw(); }, 3), slider('v', 0.05, 0.4, 0.05, S.v, ' m/s', function (v) { S.v = v; draw(); }), slider('x', 0.3, 0.79, 0.01, S.x, ' m', function (v) { S.x = v; draw(); }), out);
    var svg = sv('svg', { viewBox: '0 0 400 290', 'class': 'wsvg', role: 'img', 'aria-label': L('Joint speeds near the singularity', 'Vitesses articulaires près de la singularité') });
    box.append(svg, ctl); root.append(box);
    function at(x) {
      var c2 = (x * x - L1 * L1 - L2 * L2) / (2 * L1 * L2), t2 = Math.acos(Math.max(-1, Math.min(1, c2))), t1 = -Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
      var a = t1, b = t1 + t2, j11 = -L1 * Math.sin(a) - L2 * Math.sin(b), j12 = -L2 * Math.sin(b), j21 = L1 * Math.cos(a) + L2 * Math.cos(b), j22 = L2 * Math.cos(b);
      var det = j11 * j22 - j12 * j21, v = S.v, q1 = (j22 * v) / det, q2 = (-j21 * v) / det;           // exact: q = J⁻¹ (v, 0)
      var A = j11 * j11 + j12 * j12 + S.lam * S.lam, Bq = j11 * j21 + j12 * j22, D = j21 * j21 + j22 * j22 + S.lam * S.lam, dd = A * D - Bq * Bq;
      var y1 = (D * v) / dd, y2 = (-Bq * v) / dd, d1 = j11 * y1 + j21 * y2, d2 = j12 * y1 + j22 * y2;    // damped: q = Jᵀ (J Jᵀ + λ² I)⁻¹ (v, 0)
      var tv = j11 * d1 + j12 * d2;                                                                      // tool speed along x obtained
      return { exact: Math.hypot(q1, q2), damped: Math.hypot(d1, d2), ratio: tv / v };
    }
    function draw() {
      svg.innerHTML = '';
      var X0 = 46, W = 330, xs = [], n = 120, i, cap = 12;
      var panels = [[16, 'rad/s'], [160, '%']];
      panels.forEach(function (p) { sv('rect', { x: X0, y: p[0], width: W, height: 110, 'class': 'pn' }, svg); });
      var px = function (x) { return X0 + W * (x - 0.3) / 0.5; }, py1 = function (q) { return 16 + 110 - 110 * Math.min(q, cap) / cap; }, py2 = function (r) { return 160 + 110 - 110 * Math.max(0, Math.min(r, 1)); };
      var p1 = [], p2 = [], p3 = [];
      for (i = 0; i <= n; i++) { var x = 0.3 + 0.4999 * i / n, r = at(x); p1.push(px(x).toFixed(1) + ',' + py1(r.exact).toFixed(1)); p2.push(px(x).toFixed(1) + ',' + py1(r.damped).toFixed(1)); p3.push(px(x).toFixed(1) + ',' + py2(r.ratio).toFixed(1)); }
      sv('line', { x1: X0, y1: py1(LIM), x2: X0 + W, y2: py1(LIM), 'class': 'dash' }, svg);
      sv('polyline', { points: p1.join(' '), fill: 'none', stroke: '#ff6b6b', 'stroke-width': 2 }, svg); sv('polyline', { points: p2.join(' '), fill: 'none', stroke: '#4ed17f', 'stroke-width': 2 }, svg); sv('polyline', { points: p3.join(' '), fill: 'none', stroke: '#4ed17f', 'stroke-width': 2 }, svg);
      sv('line', { x1: px(S.x), y1: 16, x2: px(S.x), y2: 270, stroke: '#ffd60a', 'stroke-width': 1 }, svg);
      txt(svg, X0 - 6, 30, '12', '', 'end'); txt(svg, X0 - 6, 126, '0', '', 'end'); txt(svg, X0 - 6, py1(LIM) + 4, '6', '', 'end');
      txt(svg, X0 - 6, 174, '100%', '', 'end'); txt(svg, X0 - 6, 270, '0', '', 'end');
      txt(svg, X0 + 6, 30, L('joint speed |q̇| (rad/s)', 'vitesse articulaire |q̇| (rad/s)'), '');
      txt(svg, X0 + 6, 174, L('tool speed obtained / wanted', 'vitesse d\'outil obtenue / voulue'), '');
      txt(svg, X0, 286, '0.3 m', '', 'start'); txt(svg, X0 + W, 286, '0.8 m', '', 'end'); txt(svg, X0 + W / 2, 286, L('tool position x', 'position de l\'outil x'), '', 'middle');
      var r0 = at(S.x);
      out.innerHTML = L('At x = ', 'À x = ') + f(S.x, 2) + ' m:<br><span style="color:#ff6b6b">' + L('exact inverse', 'inverse exacte') + ': ' + f(r0.exact, 1) + ' rad/s</span><br><span style="color:#4ed17f">' + L('damped inverse', 'inverse amortie') + ': ' + f(r0.damped, 1) + ' rad/s</span><br>' + L('tool speed obtained: ', 'vitesse d\'outil obtenue : ') + f(r0.ratio * 100, 0) + ' %<br>' + (r0.exact > LIM && r0.damped <= LIM ? L('The exact inverse exceeds the motor limit, the damped one does not.', 'L\'inverse exacte dépasse la limite du moteur, l\'amortie non.') : '');
    }
    draw();
  }


  // ------------------------------------------------------------------ gravity torque of one arm
  function gravity(root) {
    var S = { th: 0, m: 2, al: 0 }, MA = 2, LA = 0.5, G = 9.81, LIM = 20;
    root.append(el('h4', {}, L('Try it: the torque to hold and move an arm', 'Essayez : le couple pour tenir et bouger un bras')));
    root.append(el('p', { 'class': 'wnote' }, L('A 2 kg arm of 0.5 m with a payload at its end. θ is measured from the horizontal. Move the angle, the payload and the acceleration; the bar compares the torque with a motor limit of 20 N·m.', 'Un bras de 2 kg et 0,5 m avec une charge au bout. θ est mesuré depuis l\'horizontale. Changez l\'angle, la charge et l\'accélération ; la barre compare le couple à une limite moteur de 20 N·m.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    ctl.append(slider('θ', -90, 90, 1, S.th, '°', function (v) { S.th = v; draw(); }), slider('m', 0, 5, 0.5, S.m, ' kg', function (v) { S.m = v; draw(); }, 1), slider('θ̈', 0, 20, 1, S.al, ' rad/s²', function (v) { S.al = v; draw(); }), out);
    var svg = sv('svg', { viewBox: '0 0 400 260', 'class': 'wsvg', role: 'img', 'aria-label': L('Arm holding a payload', 'Bras tenant une charge') });
    box.append(svg, ctl); root.append(box);
    function draw() {
      var a = S.th * rad, ox = 90, oy = 130, K = 240, ex = ox + K * LA * Math.cos(a), ey = oy - K * LA * Math.sin(a);
      var tg = (MA * LA / 2 + S.m * LA) * G * Math.cos(a), I = MA * LA * LA / 3 + S.m * LA * LA, ti = I * S.al, tot = tg + ti;
      svg.innerHTML = '';
      sv('line', { x1: 20, y1: oy, x2: 380, y2: oy, 'class': 'dash' }, svg);
      sv('line', { x1: ox, y1: oy, x2: ex, y2: ey, 'class': 'link2' }, svg); sv('circle', { cx: ox, cy: oy, r: 7, 'class': 'jt' }, svg);
      sv('circle', { cx: ex, cy: ey, r: 7 + S.m * 2.2, fill: '#ff6b6b', opacity: 0.85 }, svg);
      arrow(svg, ex, ey + 8 + S.m * 2.2, ex, ey + 40 + S.m * 2.2, '#cfd8e3', 2);
      sv('rect', { x: 20, y: 218, width: 360, height: 14, 'class': 'pn' }, svg);
      sv('rect', { x: 20, y: 218, width: Math.min(360, 360 * Math.abs(tot) / (LIM * 1.2)), height: 14, fill: Math.abs(tot) > LIM ? '#ff6b6b' : '#4ed17f' }, svg);
      sv('line', { x1: 20 + 360 / 1.2, y1: 212, x2: 20 + 360 / 1.2, y2: 238, stroke: '#ffd60a', 'stroke-width': 2 }, svg);
      txt(svg, 20 + 360 / 1.2, 252, L('limit 20 N·m', 'limite 20 N·m'), '', 'middle');
      out.innerHTML = L('gravity: ', 'gravité : ') + f(tg, 1) + ' N·m<br>' + L('acceleration: ', 'accélération : ') + f(ti, 1) + ' N·m<br><b>' + L('total: ', 'total : ') + f(tot, 1) + ' N·m</b>' + (Math.abs(tot) > LIM ? '<br><span style="color:#ff6b6b">' + L('Too much for this motor', 'Trop pour ce moteur') + '</span>' : '');
    }
    draw();
  }

  // ------------------------------------------------------------------ PID step response of a joint
  function pid(root) {
    var S = { kp: 50, ki: 0, kd: 10, d: 0, sat: false, aw: true }, J = 0.5, B = 0.1, UMAX = 30;
    root.append(el('h4', {}, L('Try it: tune a PID', 'Essayez : régler un PID')));
    root.append(el('p', { 'class': 'wnote' }, L('A joint (inertia 0.5 kg·m², small friction) must go from 0 to 1 rad. Add a constant load torque (gravity) and see why the integral helps. Switch the saturation on (30 N·m max) and compare with and without anti-windup.', 'Une articulation (inertie 0,5 kg·m², petit frottement) doit aller de 0 à 1 rad. Ajoutez un couple de charge constant (gravité) et voyez pourquoi l\'intégrale aide. Activez la saturation (30 N·m max) et comparez avec et sans anti-windup.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var chk = function (label, key) { var l = el('label', { 'class': 'wchk' }), c = el('input', { type: 'checkbox' }); c.checked = S[key]; c.addEventListener('change', function () { S[key] = c.checked; draw(); }); l.append(c, document.createTextNode(' ' + label)); return l; };
    ctl.append(slider('Kp', 0, 300, 1, S.kp, '', function (v) { S.kp = v; draw(); }, 0), slider('Ki', 0, 600, 5, S.ki, '', function (v) { S.ki = v; draw(); }, 0), slider('Kd', 0, 60, 0.5, S.kd, '', function (v) { S.kd = v; draw(); }, 1), slider(L('load', 'charge'), 0, 12, 0.5, S.d, ' N·m', function (v) { S.d = v; draw(); }, 1), chk(L('torque saturation (30 N·m)', 'saturation du couple (30 N·m)'), 'sat'), chk(L('anti-windup', 'anti-windup'), 'aw'), out);
    var svg = sv('svg', { viewBox: '0 0 400 260', 'class': 'wsvg', role: 'img', 'aria-label': L('Step response', 'Réponse à un échelon') });
    box.append(svg, ctl); root.append(box);
    function draw() {
      var dt = 0.001, T = 3, n = T / dt, th = 0, w = 0, ie = 0, pts = [], os = 0, tset = 0, i, prevMeas = 0;
      for (i = 0; i <= n; i++) {
        var t = i * dt, r = t >= 0.2 ? 1 : 0, e = r - th, dm = (th - prevMeas) / dt; prevMeas = th;
        var u = S.kp * e + S.ki * ie - S.kd * (i ? dm : 0), us = S.sat ? Math.max(-UMAX, Math.min(UMAX, u)) : u;
        if (!(S.sat && S.aw && us !== u && ((u > 0) === (e > 0)))) ie += e * dt;
        var acc = (us - S.d - B * w) / J; w += acc * dt; th += w * dt;
        if (i % 10 === 0) pts.push([t, th]);
        if (t >= 0.2) { os = Math.max(os, th - 1); if (Math.abs(th - 1) > 0.02) tset = t - 0.2; }
        if (!isFinite(th) || Math.abs(th) > 50) { th = Math.sign(th) * 50; w = 0; }
      }
      svg.innerHTML = '';
      sv('rect', { x: 40, y: 10, width: 345, height: 220, 'class': 'pn' }, svg);
      var px = function (t) { return 40 + 345 * t / T; }, py = function (v) { return 230 - 220 * (v + 0.2) / 2; };
      sv('line', { x1: 40, y1: py(1), x2: 385, y2: py(1), 'class': 'dash' }, svg); sv('line', { x1: 40, y1: py(0), x2: 385, y2: py(0), 'class': 'ax' }, svg);
      sv('polyline', { points: [[0, 0], [0.2, 0], [0.2, 1], [T, 1]].map(function (p) { return px(p[0]) + ',' + py(p[1]); }).join(' '), fill: 'none', stroke: '#8a8a8a', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
      sv('polyline', { points: pts.map(function (p) { return px(p[0]).toFixed(1) + ',' + Math.max(10, Math.min(230, py(p[1]))).toFixed(1); }).join(' '), fill: 'none', stroke: '#5aa9ff', 'stroke-width': 2 }, svg);
      txt(svg, 34, py(1) + 4, '1', '', 'end'); txt(svg, 34, py(0) + 4, '0', '', 'end'); txt(svg, 40, 252, '0 s', '', 'start'); txt(svg, 385, 252, '3 s', '', 'end'); txt(svg, 212, 252, 'θ (rad)', '', 'middle');
      var last = pts[pts.length - 1][1], err = 1 - last;
      out.innerHTML = L('overshoot: ', 'dépassement : ') + f(os * 100, 0) + ' %<br>' + L('settling time (2 %): ', 'temps de réponse (2 %) : ') + (tset >= T - 0.3 ? L('not reached', 'non atteint') : f(tset, 2) + ' s') + '<br>' + L('final error: ', 'erreur finale : ') + f(err * 100, 1) + ' %' + (Math.abs(err) > 0.03 ? '<br><span style="color:#ff9f43">' + L('Steady-state error: add Ki, or compensate the load.', 'Erreur statique : ajoutez Ki, ou compensez la charge.') + '</span>' : '');
    }
    draw();
  }

  // ------------------------------------------------------------------ A* / Dijkstra on a grid
  function astar(root) {
    var COLS = 20, ROWS = 12, C = 20, S = { w: 1, walls: {}, S: [2, 6], G: [17, 6], timer: 0 };
    var key = function (x, y) { return x + ',' + y; };
    for (var y = 2; y <= 9; y++) S.walls[key(10, y)] = 1;
    root.append(el('h4', {}, L('Try it: A* and Dijkstra', 'Essayez : A* et Dijkstra')));
    root.append(el('p', { 'class': 'wnote' }, L('Click or drag on the grid to draw walls. Weight 0 is Dijkstra (explores everywhere), 1 is A* (shortest and faster), a high weight is greedy (fast but may not be shortest). Press Run.', 'Cliquez ou glissez sur la grille pour dessiner des murs. Le poids 0 est Dijkstra (explore partout), 1 est A* (le plus court et plus rapide), un poids élevé est glouton (rapide mais pas forcément le plus court). Appuyez sur Lancer.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    ctl.append(slider(L('weight', 'poids'), 0, 5, 0.5, S.w, '', function (v) { S.w = v; }, 1), buttons([[L('Run', 'Lancer'), 'run'], [L('Clear', 'Effacer'), 'clear'], [L('Random', 'Aléatoire'), 'rand']], function (a) {
      if (a === 'run') run(); else { S.walls = {}; if (a === 'rand') for (var i = 0; i < 60; i++) { var x = 1 + Math.floor(Math.random() * (COLS - 2)), yy = Math.floor(Math.random() * ROWS); if (key(x, yy) !== key(S.S[0], S.S[1]) && key(x, yy) !== key(S.G[0], S.G[1])) S.walls[key(x, yy)] = 1; } stop(); draw([], null); out.innerHTML = ''; }
    }), out);
    var svg = sv('svg', { viewBox: '0 0 ' + COLS * C + ' ' + ROWS * C, 'class': 'wsvg', role: 'img', 'aria-label': L('Grid for path planning', 'Grille pour la planification de chemin') });
    box.append(svg, ctl); root.append(box);
    function draw(explored, path) {
      svg.innerHTML = '';
      sv('rect', { x: 0, y: 0, width: COLS * C, height: ROWS * C, fill: 'rgba(255,255,255,0.03)' }, svg);
      explored.forEach(function (c) { sv('rect', { x: c[0] * C, y: c[1] * C, width: C, height: C, fill: 'rgba(90,169,255,0.28)' }, svg); });
      for (var k in S.walls) { var p = k.split(','); sv('rect', { x: p[0] * C, y: p[1] * C, width: C, height: C, fill: '#6f7b8c' }, svg); }
      for (var i = 0; i <= COLS; i++) sv('line', { x1: i * C, y1: 0, x2: i * C, y2: ROWS * C, stroke: 'rgba(255,255,255,0.07)' }, svg);
      for (i = 0; i <= ROWS; i++) sv('line', { x1: 0, y1: i * C, x2: COLS * C, y2: i * C, stroke: 'rgba(255,255,255,0.07)' }, svg);
      if (path) sv('polyline', { points: path.map(function (c) { return (c[0] * C + C / 2) + ',' + (c[1] * C + C / 2); }).join(' '), fill: 'none', stroke: '#ff9f43', 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg);
      sv('circle', { cx: S.S[0] * C + C / 2, cy: S.S[1] * C + C / 2, r: 7, fill: '#5aa9ff' }, svg); sv('circle', { cx: S.G[0] * C + C / 2, cy: S.G[1] * C + C / 2, r: 7, fill: '#4ed17f' }, svg);
    }
    function stop() { if (S.timer) { clearInterval(S.timer); S.timer = 0; } }
    function run() {
      stop();
      var D = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
      var h = function (x, y) { var dx = Math.abs(x - S.G[0]), dy = Math.abs(y - S.G[1]); return S.w * ((dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy)); };
      var open = [{ x: S.S[0], y: S.S[1], g: 0, f: h(S.S[0], S.S[1]) }], g = {}, from = {}, closed = {}, order = [], found = null;
      g[key(S.S[0], S.S[1])] = 0;
      while (open.length) {
        var bi = 0, i; for (i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
        var cur = open.splice(bi, 1)[0], ck = key(cur.x, cur.y);
        if (closed[ck]) continue; closed[ck] = 1; order.push([cur.x, cur.y]);
        if (cur.x === S.G[0] && cur.y === S.G[1]) { found = cur; break; }
        D.forEach(function (d) {
          var nx = cur.x + d[0], ny = cur.y + d[1], nk = key(nx, ny);
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || S.walls[nk] || closed[nk]) return;
          if (d[0] && d[1] && (S.walls[key(cur.x + d[0], cur.y)] || S.walls[key(cur.x, cur.y + d[1])])) return;
          var ng = cur.g + d[2];
          if (g[nk] === undefined || ng < g[nk]) { g[nk] = ng; from[nk] = ck; open.push({ x: nx, y: ny, g: ng, f: ng + h(nx, ny) }); }
        });
      }
      var path = null, cost = 0;
      if (found) { path = []; var k = key(found.x, found.y); while (k) { var q = k.split(','); path.unshift([+q[0], +q[1]]); k = from[k]; } cost = found.g; }
      var shown = 0;
      S.timer = setInterval(function () {
        shown = Math.min(order.length, shown + 4); draw(order.slice(0, shown), shown >= order.length ? path : null);
        if (shown >= order.length) { stop(); out.innerHTML = L('explored cells: ', 'cellules explorées : ') + order.length + '<br>' + (found ? L('path length: ', 'longueur du chemin : ') + f(cost, 1) : '<span style="color:#ff6b6b">' + L('no path', 'pas de chemin') + '</span>'); }
      }, 20);
    }
    var down = false, mode = 1;
    function cell(ev) { var r = svg.getBoundingClientRect(), x = Math.floor((ev.clientX - r.left) / r.width * COLS), y = Math.floor((ev.clientY - r.top) / r.height * ROWS); return [x, y]; }
    function paint(ev) { var c = cell(ev), k = key(c[0], c[1]); if (c[0] < 0 || c[1] < 0 || c[0] >= COLS || c[1] >= ROWS || k === key(S.S[0], S.S[1]) || k === key(S.G[0], S.G[1])) return; if (mode) S.walls[k] = 1; else delete S.walls[k]; stop(); draw([], null); }
    svg.addEventListener('pointerdown', function (e) { down = true; svg.setPointerCapture(e.pointerId); var c = cell(e); mode = S.walls[key(c[0], c[1])] ? 0 : 1; paint(e); });
    svg.addEventListener('pointermove', function (e) { if (down) paint(e); }); svg.addEventListener('pointerup', function () { down = false; });
    draw([], null);
  }

  // ------------------------------------------------------------------ 1-D Kalman filter
  function kalman(root) {
    var S = { q: 0.09, r: 1, seed: 7 }, N = 60;
    root.append(el('h4', {}, L('Try it: a Kalman filter', 'Essayez : un filtre de Kalman')));
    root.append(el('p', { 'class': 'wnote' }, L('A robot moves 1 m per step. Its sensor measures the position with noise (std 1 m). Grey: truth. Dots: measurements. Red: dead reckoning (prediction only). Blue: Kalman estimate. Change what the filter believes about the noise (Q = motion noise, R = sensor noise).', 'Un robot avance de 1 m par pas. Son capteur mesure la position avec du bruit (écart-type 1 m). Gris : la vérité. Points : mesures. Rouge : estime (prédiction seule). Bleu : estimation de Kalman. Changez ce que le filtre croit du bruit (Q = bruit du mouvement, R = bruit du capteur).')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    ctl.append(slider('Q', 0.001, 1, 0.001, S.q, '', function (v) { S.q = v; draw(); }, 3), slider('R', 0.05, 10, 0.05, S.r, '', function (v) { S.r = v; draw(); }, 2), buttons([[L('New noise', 'Nouveau bruit'), 1]], function () { S.seed = Math.floor(Math.random() * 1e6); draw(); }), out);
    var svg = sv('svg', { viewBox: '0 0 400 270', 'class': 'wsvg', role: 'img', 'aria-label': L('Kalman filter result', 'Résultat du filtre de Kalman') });
    box.append(svg, ctl); root.append(box);
    function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function draw() {
      var rand = rng(S.seed), gauss = function () { return Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand()); };
      var truth = [], meas = [], est = [], dr = [], x = 0, xe = 0, P = 4, xd = 0, i, e1 = 0, e2 = 0, e3 = 0;
      for (i = 0; i < N; i++) {
        x += 1 + 0.3 * gauss(); truth.push(x);
        var z = x + 1.0 * gauss(); meas.push(z);
        xd += 1 + 0.02; dr.push(xd);                             // odometry says +1 but is slightly biased
        xe += 1; P += S.q; var K = P / (P + S.r); xe += K * (z - xe); P *= (1 - K); est.push(xe);
        e1 += Math.pow(z - x, 2); e2 += Math.pow(xe - x, 2); e3 += Math.pow(xd - x, 2);
      }
      svg.innerHTML = '';
      sv('rect', { x: 36, y: 8, width: 352, height: 236, 'class': 'pn' }, svg);
      var px = function (i) { return 36 + 352 * i / (N - 1); }, py = function (v) { return 244 - 236 * (v + 4) / (N + 8); };
      var line = function (arr, col, w, dash) { sv('polyline', { points: arr.map(function (v, i) { return px(i).toFixed(1) + ',' + py(v).toFixed(1); }).join(' '), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '' }, svg); };
      line(truth, '#9aa7b6', 2); line(dr, '#ff6b6b', 1.5, '5 4');
      meas.forEach(function (v, i) { sv('circle', { cx: px(i), cy: py(v), r: 2, fill: '#ffd60a', opacity: 0.8 }, svg); });
      line(est, '#5aa9ff', 2.5);
      txt(svg, 36, 262, L('time step →', 'pas de temps →'), '');
      out.innerHTML = L('RMS error:', 'Erreur quadratique :') + '<br><span style="color:#ffd60a">' + L('raw sensor: ', 'capteur brut : ') + f(Math.sqrt(e1 / N), 2) + ' m</span><br><span style="color:#5aa9ff">' + L('Kalman: ', 'Kalman : ') + f(Math.sqrt(e2 / N), 2) + ' m</span><br><span style="color:#ff6b6b">' + L('dead reckoning: ', 'estime seule : ') + f(Math.sqrt(e3 / N), 2) + ' m</span>';
    }
    draw();
  }

  // ------------------------------------------------------------------ RRT in the plane
  function rrt(root) {
    var W = 400, H = 260, S = { step: 14, bias: 0.08, timer: 0 }, start = [30, 130], goal = [370, 130];
    var obs = [[120, 0, 20, 160], [230, 100, 20, 160], [300, 85, 40, 90]];
    root.append(el('h4', {}, L('Try it: RRT', 'Essayez : RRT')));
    root.append(el('p', { 'class': 'wnote' }, L('The tree (blue) grows from the start (left) towards random points; every 1 in 12 or so it is pulled to the goal. When it reaches the goal the path is drawn in orange, then shortened. Press Run again for a new random tree.', 'L\'arbre (bleu) pousse depuis le départ (à gauche) vers des points aléatoires ; de temps en temps il est tiré vers le but. Quand il atteint le but, le chemin est tracé en orange, puis raccourci. Appuyez à nouveau sur Lancer pour un nouvel arbre aléatoire.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    ctl.append(slider(L('step', 'pas'), 6, 30, 1, S.step, ' px', function (v) { S.step = v; }, 0), slider(L('goal bias', 'biais vers le but'), 0, 0.3, 0.01, S.bias, '', function (v) { S.bias = v; }, 2), buttons([[L('Run', 'Lancer'), 1]], function () { go(); }), out);
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'wsvg', role: 'img', 'aria-label': L('RRT tree among obstacles', 'Arbre RRT parmi des obstacles') });
    box.append(svg, ctl); root.append(box);
    var free = function (x, y) { if (x < 0 || y < 0 || x > W || y > H) return false; for (var i = 0; i < obs.length; i++) { var o = obs[i]; if (x >= o[0] && x <= o[0] + o[2] && y >= o[1] && y <= o[1] + o[3]) return false; } return true; };
    var segFree = function (a, b) { var d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / 2); for (var i = 0; i <= n; i++) if (!free(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n)) return false; return true; };
    function base(nodes, path, smooth) {
      svg.innerHTML = '';
      obs.forEach(function (o) { sv('rect', { x: o[0], y: o[1], width: o[2], height: o[3], fill: '#6f7b8c' }, svg); });
      nodes.forEach(function (n) { if (n.p) sv('line', { x1: n.p[0], y1: n.p[1], x2: n.x[0], y2: n.x[1], stroke: '#5aa9ff', 'stroke-width': 1 }, svg); });
      if (path) sv('polyline', { points: path.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: smooth ? '#4ed17f' : '#ff9f43', 'stroke-width': 3 }, svg);
      sv('circle', { cx: start[0], cy: start[1], r: 7, fill: '#5aa9ff' }, svg); sv('circle', { cx: goal[0], cy: goal[1], r: 7, fill: '#4ed17f' }, svg);
    }
    function go() {
      if (S.timer) clearInterval(S.timer);
      var nodes = [{ x: start, p: null, i: 0 }], done = false;
      S.timer = setInterval(function () {
        for (var k = 0; k < 6 && !done; k++) {
          var r = Math.random() < S.bias ? goal : [Math.random() * W, Math.random() * H], bi = 0, bd = 1e9, i;
          for (i = 0; i < nodes.length; i++) { var d = Math.hypot(nodes[i].x[0] - r[0], nodes[i].x[1] - r[1]); if (d < bd) { bd = d; bi = i; } }
          var n = nodes[bi], dd = Math.min(S.step, bd), nx = [n.x[0] + (r[0] - n.x[0]) / bd * dd, n.x[1] + (r[1] - n.x[1]) / bd * dd];
          if (bd > 0 && segFree(n.x, nx)) {
            nodes.push({ x: nx, p: n.x, i: nodes.length, par: n });
            if (Math.hypot(nx[0] - goal[0], nx[1] - goal[1]) < S.step && segFree(nx, goal)) { nodes.push({ x: goal, p: nx, i: nodes.length, par: nodes[nodes.length - 1] }); done = true; }
          }
        }
        if (nodes.length > 2500) done = true;
        var last = nodes[nodes.length - 1], ok = last.x === goal, path = null;
        if (ok) { path = []; for (var c = last; c; c = c.par) path.unshift(c.x); }
        base(nodes, path, false);
        if (done) {
          clearInterval(S.timer); S.timer = 0;
          if (ok) { var len = 0, j; for (j = 1; j < path.length; j++) len += Math.hypot(path[j][0] - path[j - 1][0], path[j][1] - path[j - 1][1]); var sm = [path[0]], a = 0; while (a < path.length - 1) { var b = path.length - 1; while (b > a + 1 && !segFree(path[a], path[b])) b--; sm.push(path[b]); a = b; } var len2 = 0; for (j = 1; j < sm.length; j++) len2 += Math.hypot(sm[j][0] - sm[j - 1][0], sm[j][1] - sm[j - 1][1]); setTimeout(function () { base(nodes, sm, true); }, 700);
            out.innerHTML = L('nodes: ', 'nœuds : ') + nodes.length + '<br>' + L('raw path: ', 'chemin brut : ') + f(len, 0) + ' px<br>' + L('after shortcuts: ', 'après raccourcis : ') + f(len2, 0) + ' px (' + L('green', 'vert') + ')'; }
          else out.innerHTML = '<span style="color:#ff6b6b">' + L('no path found yet: run again or raise the goal bias', 'pas de chemin trouvé : relancez ou augmentez le biais vers le but') + '</span>';
        } else out.innerHTML = L('nodes: ', 'nœuds : ') + nodes.length;
      }, 30);
    }
    base([{ x: start, p: null }], null, false);
  }

  var WIDGETS = { jac2r: function (w) { jac2r(w, false); }, 'jac2r-ellipse': function (w) { jac2r(w, true); }, gimbal: gimbal, dls: dls, gravity: gravity, pid: pid, astar: astar, kalman: kalman, rrt: rrt };
  window.RA_WIDGETS = WIDGETS;                                 // other course files can add their own
  function init() { [].forEach.call(document.querySelectorAll('.widget[data-widget]'), function (w) { var k = w.dataset.widget; if (WIDGETS[k] && !w.firstChild) WIDGETS[k](w); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
