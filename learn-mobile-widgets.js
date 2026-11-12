// learn-mobile-widgets.js — interactive widgets of the course "Wheeled mobile robots" (learn-mobile.html).
// Each widget is mounted on <div class="widget" data-widget="wmr-...">. Texts are given in English and French with L(en, fr).
(function () {
  'use strict';
  var FR = (window.RA && RA.lang) === 'fr';
  var L = function (en, fr) { return FR ? fr : en; };
  var NS = 'http://www.w3.org/2000/svg';
  var rad = Math.PI / 180, deg = 180 / Math.PI, PI = Math.PI;
  var f = function (v, d) { return (isFinite(v) ? v.toFixed(d === undefined ? 2 : d) : '∞').replace('.', FR ? ',' : '.').replace('-', '−'); };
  var wrap = function (a) { while (a > PI) a -= 2 * PI; while (a <= -PI) a += 2 * PI; return a; };
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html !== undefined) e.innerHTML = html; return e; }
  function sv(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, anchor, color) { var t = sv('text', { x: x, y: y, 'text-anchor': anchor || 'start' }, parent); if (color) t.setAttribute('fill', color); t.textContent = s; return t; }
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
    var a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    if (Math.hypot(x2 - x1, y2 - y1) > 5) sv('polygon', { points: [x2, y2, x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4), x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)].join(','), fill: color }, svg);
  }
  // a wheel (rectangle) at screen position, rolling direction psi (world angle, y up), length len, thickness th
  function wheel(svg, sx, sy, psi, len, th, fill, stroke) {
    var g = sv('g', { transform: 'translate(' + sx + ' ' + sy + ') rotate(' + (-psi * deg) + ')' }, svg);
    sv('rect', { x: -len / 2, y: -th / 2, width: len, height: th, rx: 2, fill: fill || '#6b7686', stroke: stroke || '#cfd8e3', 'stroke-width': 1 }, g);
    return g;
  }
  function chalLine(ok, text) { return '<p class="chal" style="margin:.6rem 0 0;color:' + (ok ? '#2e9e5b' : 'inherit') + '"><b>' + (ok ? '✓ ' : '○ ') + '</b>' + text + (ok ? ' <b>' + L('Done!', 'Réussi !') + '</b>' : '') + '</p>'; }
  var BLUE = '#5aa9ff', ORANGE = '#ff9f43', GREEN = '#4ed17f', RED = '#ff6b6b', GREY = '#7a8696';

  // ------------------------------------------------------------------ lesson 4: differential drive
  function diff(root) {
    var S = { VL: 0.4, VR: 0.5, L: 0.3, T: 8 };
    root.append(el('h4', {}, L('Try it: a differential-drive robot', 'Essayez : un robot différentiel')));
    root.append(el('p', { 'class': 'wnote' }, L('Choose the speed of each wheel. The robot drives for 8 seconds from the grey position. The orange point is the ICC, the centre of the circle it follows. Try equal speeds, opposite speeds, and one wheel stopped.', 'Choisissez la vitesse de chaque roue. Le robot roule pendant 8 secondes depuis la position grise. Le point orange est le CIC, le centre du cercle qu\'il suit. Essayez des vitesses égales, opposées, et une roue arrêtée.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var sL = slider('V<sub>L</sub>', -0.6, 0.6, 0.05, S.VL, ' m/s', function (v) { S.VL = v; draw(); });
    var sR = slider('V<sub>R</sub>', -0.6, 0.6, 0.05, S.VR, ' m/s', function (v) { S.VR = v; draw(); });
    var sW = slider('L', 0.2, 0.6, 0.05, S.L, ' m', function (v) { S.L = v; draw(); });
    var set = function (a, b) { S.VL = a; S.VR = b; sL.set(a); sR.set(b); draw(); };
    var btn = buttons([[L('straight', 'droit'), [0.4, 0.4]], [L('curve', 'courbe'), [0.3, 0.5]], [L('spin', 'pivot sur place'), [-0.3, 0.3]], [L('one wheel', 'une roue'), [0, 0.4]]], function (p) { set(p[0], p[1]); });
    ctl.append(sL, sR, sW, btn, out);
    var svg = sv('svg', { viewBox: '0 0 480 320', 'class': 'wsvg', role: 'img', 'aria-label': L('Top view of a differential-drive robot and its path', 'Vue de dessus d\'un robot différentiel et de sa trajectoire') });
    box.append(svg, ctl); root.append(box);
    function draw() {
      var VL = S.VL, VR = S.VR, Lw = S.L, v = (VR + VL) / 2, w = (VR - VL) / Lw, R = Math.abs(VR - VL) < 1e-9 ? Infinity : Lw / 2 * (VR + VL) / (VR - VL);
      var pts = [], i, N = 80;
      for (i = 0; i <= N; i++) { var t = S.T * i / N; if (Math.abs(w) < 1e-9) pts.push([v * t, 0, 0]); else pts.push([(v / w) * Math.sin(w * t), (v / w) * (1 - Math.cos(w * t)), w * t]); }
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var icc = isFinite(R) && Math.abs(w) > 1e-9 ? [0, v / w] : null;
      if (icc) { xs.push(icc[0]); ys.push(icc[1]); }
      var m = 0.3, x0 = Math.min.apply(null, xs) - m, x1 = Math.max.apply(null, xs) + m, y0 = Math.min.apply(null, ys) - m, y1 = Math.max.apply(null, ys) + m;
      var K = Math.min(440 / (x1 - x0), 290 / (y1 - y0), 320), ox = 20 - K * x0 + (440 - K * (x1 - x0)) / 2, oy = 305 + K * y0 - (290 - K * (y1 - y0)) / 2;
      var X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      svg.innerHTML = '';
      var robot = function (p, ghost) {
        var g = sv('g', { transform: 'translate(' + X(p[0]) + ' ' + Y(p[1]) + ') rotate(' + (-p[2] * deg) + ')', opacity: ghost ? 0.45 : 1 }, svg);
        sv('rect', { x: -K * Lw * 0.45, y: -K * Lw / 2, width: K * Lw * 0.9, height: K * Lw, rx: 4, fill: ghost ? 'none' : 'rgba(91,143,214,.25)', stroke: ghost ? GREY : '#5b8fd6', 'stroke-width': 2 }, g);
        [1, -1].forEach(function (s) { sv('rect', { x: -K * 0.06, y: s * K * Lw / 2 - K * 0.015, width: K * 0.12, height: K * 0.03, fill: '#6b7686', stroke: '#cfd8e3' }, g); });
        sv('circle', { cx: K * Lw * 0.35, cy: 0, r: Math.max(2, K * 0.015), fill: '#6b7686' }, g);
        arrow(g, 0, 0, K * Lw * 0.7, 0, ORANGE, 2);
      };
      if (icc) { sv('line', { x1: X(0), y1: Y(0), x2: X(icc[0]), y2: Y(icc[1]), stroke: GREY, 'stroke-dasharray': '4 4' }, svg); sv('circle', { cx: X(icc[0]), cy: Y(icc[1]), r: 5, fill: ORANGE }, svg); txt(svg, X(icc[0]) + 8, Y(icc[1]) - 6, 'ICC', 'start', ORANGE); }
      sv('polyline', { points: pts.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: BLUE, 'stroke-width': 2.5 }, svg);
      robot(pts[0], true); robot(pts[N], false);
      var chOk = isFinite(R) && Math.abs(R - 1.0) <= 0.05 && v >= 0.3; if (chOk) window.RA_chal('diff');
      out.innerHTML = '<ul><li>v = (V<sub>R</sub> + V<sub>L</sub>) / 2 = <b>' + f(v) + '</b> m/s</li><li>ω = (V<sub>R</sub> − V<sub>L</sub>) / L = <b>' + f(w) + '</b> rad/s</li><li>R = v / ω = <b>' + f(R) + '</b> m</li></ul>' +
        (Math.abs(VR - VL) < 1e-9 ? L('Equal speeds: straight line, R = ∞.', 'Vitesses égales : ligne droite, R = ∞.') : Math.abs(VR + VL) < 1e-9 ? L('Opposite speeds: the robot spins on the spot (R = 0).', 'Vitesses opposées : le robot tourne sur place (R = 0).') : (Math.abs(VL) < 1e-9 || Math.abs(VR) < 1e-9) ? L('One wheel stopped: the robot pivots around it (R = L/2).', 'Une roue arrêtée : le robot pivote autour d\'elle (R = L/2).') : (w > 0 ? L('The right wheel is faster: the robot turns left.', 'La roue droite est plus rapide : le robot tourne à gauche.') : L('The left wheel is faster: the robot turns right.', 'La roue gauche est plus rapide : le robot tourne à droite.'))) + chalLine(chOk, L('Challenge: drive on a circle of radius R = 1.0 m (± 0.05 m) at v ≥ 0.3 m/s.', 'Défi : roulez sur un cercle de rayon R = 1,0 m (± 0,05 m) à v ≥ 0,3 m/s.'));
    }
    draw();
  }

  // ------------------------------------------------------------------ lesson 5: bicycle and car
  function car(root) {
    var S = { mode: 'car', v: 5, d: 15, e: 2.5, Lt: 1.4, r: 0.3 };
    root.append(el('h4', {}, L('Try it: wheel speeds and steering angles', 'Essayez : vitesses des roues et angles de braquage')));
    root.append(el('p', { 'class': 'wnote' }, L('Give the speed v of the virtual central front wheel and its steering angle δ (positive = left). Read the angular speed of every wheel and the steering angle of each front wheel. The dashed lines are the wheel axes: they all meet at the ICR.', 'Donnez la vitesse v de la roue avant centrale virtuelle et son angle de braquage δ (positif = gauche). Lisez la vitesse angulaire de chaque roue et l\'angle de braquage de chaque roue avant. Les traits pointillés sont les axes des roues : ils se coupent tous au CIR.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var mb = buttons([[L('Bicycle', 'Vélo'), 'bike'], [L('Car', 'Voiture'), 'car']], function (m) { S.mode = m; trackRow.style.display = m === 'car' ? '' : 'none'; draw(); });
    var sv_ = slider('v', 0.5, 10, 0.5, S.v, ' m/s', function (v) { S.v = v; draw(); }, 1);
    var sd = slider('δ', -40, 40, 1, S.d, '°', function (v) { S.d = v; draw(); }, 0);
    var se = slider('e', 1.0, 3.5, 0.1, S.e, ' m', function (v) { S.e = v; draw(); }, 1);
    var sL = slider('L', 0.6, 1.6, 0.1, S.Lt, ' m', function (v) { S.Lt = v; draw(); }, 1);
    var trackRow = sL;
    var sr = slider('r', 0.15, 0.5, 0.05, S.r, ' m', function (v) { S.r = v; draw(); });
    ctl.append(mb, sv_, sd, se, sL, sr, out);
    var svg = sv('svg', { viewBox: '0 0 480 300', 'class': 'wsvg', role: 'img', 'aria-label': L('Top view of a bicycle or a car in a turn', 'Vue de dessus d\'un vélo ou d\'une voiture dans un virage') });
    box.append(svg, ctl); root.append(box);
    function draw() {
      var e = S.e, Lt = S.Lt, r = S.r, v = S.v, dl = S.d * rad, bike = S.mode === 'bike', straight = Math.abs(dl) < 1e-6;
      var R = straight ? Infinity : e / Math.tan(dl), om = straight ? 0 : v * Math.sin(dl) / e;
      var Rc = isFinite(R) ? Math.max(-9, Math.min(9, R)) : 0, ymax = Math.max(bike ? 0.3 : Lt / 2, Rc) + 0.55, ymin = Math.min(bike ? -0.3 : -Lt / 2, Rc) - 0.55;
      var K = Math.min(400 / (e + 2.2), 285 / (ymax - ymin)), ox = 40 + (400 - K * (e + 1.6)) / 2 + K * 0.6, oy = 8 + K * ymax + (285 - K * (ymax - ymin)) / 2;
      var X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      svg.innerHTML = '';
      var ws = bike ? [{ n: 'F', x: 0, y: 0, fr: false }, { n: 'C', x: e, y: 0, fr: true }] : [{ n: 'F1', x: 0, y: Lt / 2, fr: false }, { n: 'F2', x: 0, y: -Lt / 2, fr: false }, { n: 'C1', x: e, y: Lt / 2, fr: true }, { n: 'C2', x: e, y: -Lt / 2, fr: true }];
      sv('rect', { x: X(-0.1), y: Y(bike ? 0.04 : Lt / 2), width: K * (e + 0.2), height: K * (bike ? 0.08 : Lt), rx: 4, fill: 'rgba(91,143,214,.12)', stroke: '#5b8fd6', 'stroke-dasharray': bike ? '' : '3 3' }, svg);
      var res = [];
      ws.forEach(function (w) {
        var psi = 0, sp = v;
        if (!straight) { var ux = om * (R - w.y), uy = om * e * (w.fr ? 1 : 0); if (!w.fr) { psi = 0; sp = om * (R - w.y); } else { if (ux < 0) { ux = -ux; uy = -uy; } psi = Math.atan2(uy, ux); sp = Math.sign(om * (R - w.y)) * Math.abs(om) * Math.hypot(R - w.y, e); } }
        if (bike && w.fr) { psi = dl; sp = v; }
        if (bike && !w.fr) sp = v * Math.cos(dl);
        res.push({ n: w.n, psi: psi, phi: sp / r, fr: w.fr });
        if (!straight && isFinite(R)) sv('line', { x1: X(w.x), y1: Y(w.y), x2: X(0), y2: Y(R), stroke: GREY, 'stroke-dasharray': '4 4', 'stroke-width': 1 }, svg);
        if (straight) sv('line', { x1: X(w.x), y1: Y(w.y) - 60, x2: X(w.x), y2: Y(w.y) + 60, stroke: GREY, 'stroke-dasharray': '4 4', 'stroke-width': 1 }, svg);
      });
      if (!straight) { sv('circle', { cx: X(0), cy: Y(R), r: 5, fill: ORANGE }, svg); txt(svg, X(0) + 8, Y(R) + (R > 0 ? -8 : 16), 'ICR', 'start', ORANGE); }
      ws.forEach(function (w, i) { wheel(svg, X(w.x), Y(w.y), res[i].psi, K * 0.55, K * 0.17, w.fr ? '#8aa4c8' : '#6b7686'); txt(svg, X(w.x) - 6, Y(w.y) + (w.y >= 0 ? -K * 0.18 - 4 : K * 0.18 + 12), w.n, 'end', '#cfd8e3'); });
      arrow(svg, X(e), Y(0), X(e) + 52 * Math.cos(dl), Y(0) - 52 * Math.sin(dl), RED, 3); txt(svg, X(e) + 58 * Math.cos(dl), Y(0) - 58 * Math.sin(dl) - 4, 'v', 'start', RED);
      var li = '<ul>', fm = function (x) { return f(x * deg, 1) + '°'; };
      res.forEach(function (q) { li += '<li>φ̇<sub>' + q.n + '</sub> = <b>' + f(q.phi, 1) + '</b> rad/s' + (q.fr && !bike ? ' &nbsp; δ<sub>' + q.n + '</sub> = <b>' + fm(q.psi) + '</b>' : '') + '</li>'; });
      li += '</ul>R = e / tan δ = <b>' + f(R) + '</b> m, ω = <b>' + f(om) + '</b> rad/s';
      if (!bike && !straight) { var c1 = 1 / Math.tan(res[2].psi), c2 = 1 / Math.tan(res[3].psi); li += '<br>' + L('Ackermann check: |cot δ', 'Contrôle d\'Ackermann : |cot δ') + '<sub>C1</sub> − cot δ<sub>C2</sub>| = <b>' + f(Math.abs(c1 - c2)) + '</b> = L / e = <b>' + f(Lt / e) + '</b>'; }
      var chOk = isFinite(R) && Math.abs(Math.abs(R) - 6) <= 0.3 && v >= 3; if (chOk) window.RA_chal('car');
      li += chalLine(chOk, L('Challenge: turn on a circle of radius 6 m (± 0.3 m) at v ≥ 3 m/s.', 'Défi : tournez sur un cercle de rayon 6 m (± 0,3 m) à v ≥ 3 m/s.'));
      out.innerHTML = li;
    }
    draw();
  }

  // ------------------------------------------------------------------ lesson 6: three omni wheels
  function omni(root) {
    var S = { mode: 'fwd', l: 0.2, r: 0.03, ph: [4, 1, 2], vx: 0.3, vy: 0.2, w: 0.5 };
    root.append(el('h4', {}, L('Try it: a three-wheel omnidirectional robot', 'Essayez : un robot omnidirectionnel à trois roues')));
    root.append(el('p', { 'class': 'wnote' }, L('Forward kinematics: choose the three wheel speeds and read the motion of the robot. Inverse kinematics: choose the motion you want and read the wheel speeds. Robot heading θ = 0 (the robot frame is the global frame). The first preset is the worked example of the lesson.', 'Cinématique directe : choisissez les trois vitesses de roues et lisez le mouvement du robot. Cinématique inverse : choisissez le mouvement voulu et lisez les vitesses des roues. Cap du robot θ = 0 (le repère robot est le repère global). Le premier préréglage est l\'exemple résolu de la leçon.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var modeB = buttons([[L('Wheel speeds → motion', 'Vitesses des roues → mouvement'), 'fwd'], [L('Motion → wheel speeds', 'Mouvement → vitesses des roues')  , 'inv']], function (m) { S.mode = m; show(); draw(); });
    var p = [0, 1, 2].map(function (i) { return slider('φ̇<sub>' + (i + 1) + '</sub>', -10, 10, 0.5, S.ph[i], ' rad/s', function (v) { S.ph[i] = v; draw(); }, 1); });
    var q = [slider('ẋ', -1, 1, 0.05, S.vx, ' m/s', function (v) { S.vx = v; draw(); }), slider('ẏ', -1, 1, 0.05, S.vy, ' m/s', function (v) { S.vy = v; draw(); }), slider('θ̇', -3, 3, 0.1, S.w, ' rad/s', function (v) { S.w = v; draw(); }, 1)];
    var sl = slider('l', 0.05, 1, 0.05, S.l, ' m', function (v) { S.l = v; draw(); }), sr = slider('r', 0.01, 1, 0.01, S.r, ' m', function (v) { S.r = v; draw(); });
    var pre = buttons([[L('lesson example', 'exemple de la leçon'), 'ex'], [L('same speed', 'même vitesse'), 'same']], function (k) {
      if (k === 'ex') { S.l = 1; S.r = 1; S.ph = [4, 1, 2]; sl.set(1); sr.set(1); p.forEach(function (s, i) { s.set(S.ph[i]); }); S.mode = 'fwd'; } else { S.ph = [3, 3, 3]; p.forEach(function (s, i) { s.set(3); }); S.mode = 'fwd'; }
      show(); draw();
    });
    function show() { p.forEach(function (s) { s.style.display = S.mode === 'fwd' ? '' : 'none'; }); q.forEach(function (s) { s.style.display = S.mode === 'inv' ? '' : 'none'; }); }
    ctl.append(modeB, pre); p.forEach(function (s) { ctl.append(s); }); q.forEach(function (s) { ctl.append(s); }); ctl.append(sl, sr, out);
    var svg = sv('svg', { viewBox: '0 0 480 320', 'class': 'wsvg', role: 'img', 'aria-label': L('Top view of a three-wheel omnidirectional robot', 'Vue de dessus d\'un robot omnidirectionnel à trois roues') });
    box.append(svg, ctl); root.append(box);
    var AL = [PI / 3, PI, -PI / 3], s3 = Math.sqrt(3);
    function rows(l) { return AL.map(function (a) { return [Math.sin(a), -Math.cos(a), -l]; }); }
    function draw() {
      var l = S.l, r = S.r, J = rows(l), v, ph;
      if (S.mode === 'fwd') {
        ph = S.ph.slice();
        v = [(ph[0] - ph[2]) * r / s3, (-ph[0] + 2 * ph[1] - ph[2]) * r / 3, -(ph[0] + ph[1] + ph[2]) * r / (3 * l)];
      } else {
        v = [S.vx, S.vy, S.w];
        ph = J.map(function (j) { return (j[0] * v[0] + j[1] * v[1] + j[2] * v[2]) / r; });
      }
      var K = 100 / l, ox = 240, oy = 160;                  // the wheels are always 100 px from the centre
      var X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      svg.innerHTML = '';
      var pts = AL.map(function (a) { return [l * Math.cos(a), l * Math.sin(a)]; });
      sv('polygon', { points: pts.map(function (p_) { return X(p_[0] * 0.95) + ',' + Y(p_[1] * 0.95); }).join(' '), fill: 'rgba(91,143,214,.18)', stroke: '#5b8fd6', 'stroke-width': 2 }, svg);
      AL.forEach(function (a, i) {
        var px = l * Math.cos(a), py = l * Math.sin(a), roll = Math.atan2(-Math.cos(a), Math.sin(a));
        wheel(svg, X(px), Y(py), roll, 36, 12, '#6b7686');
        var spd = r * ph[i], sc = Math.max(-1, Math.min(1, spd / (0.4 + Math.abs(spd)))) * 60;
        arrow(svg, X(px), Y(py), X(px) + sc * Math.cos(roll), Y(py) - sc * Math.sin(roll), i === 0 ? ORANGE : i === 1 ? GREEN : BLUE, 3);
        txt(svg, X(px * 1.35) - 4, Y(py * 1.35) + 4, '' + (i + 1), 'middle', '#cfd8e3');
      });
      sv('circle', { cx: ox, cy: oy, r: 4, fill: RED }, svg); txt(svg, ox + 8, oy + 16, 'P', 'start', RED);
      var vm = Math.hypot(v[0], v[1]); if (vm > 1e-6) { var sc2 = Math.min(120, 40 + vm * 120); arrow(svg, ox, oy, ox + sc2 * v[0] / vm, oy - sc2 * v[1] / vm, RED, 4); }
      if (Math.abs(v[2]) > 1e-6) { var ang = Math.max(-1, Math.min(1, v[2] / 3)) * 300 * rad, R0 = 34; sv('path', { d: 'M ' + (ox + R0) + ' ' + oy + ' A ' + R0 + ' ' + R0 + ' 0 ' + (Math.abs(ang) > PI ? 1 : 0) + ' ' + (ang > 0 ? 0 : 1) + ' ' + (ox + R0 * Math.cos(ang)) + ' ' + (oy - R0 * Math.sin(ang)), fill: 'none', stroke: GREEN, 'stroke-width': 3 }, svg); }
      out.innerHTML = '<ul>' + ph.map(function (x, i) { return '<li>φ̇<sub>' + (i + 1) + '</sub> = <b>' + f(x, 2) + '</b> rad/s</li>'; }).join('') + '</ul><ul><li>ẋ = <b>' + f(v[0], 3) + '</b> m/s</li><li>ẏ = <b>' + f(v[1], 3) + '</b> m/s</li><li>θ̇ = <b>' + f(v[2], 3) + '</b> rad/s</li></ul>' +
        (Math.abs(v[0]) < 1e-9 && Math.abs(v[1]) < 1e-9 && Math.abs(v[2]) > 1e-9 ? L('Pure rotation: the robot spins on the spot.', 'Rotation pure : le robot tourne sur place.') : '');
    }
    show(); draw();
  }

  // ------------------------------------------------------------------ lesson 7: constraints, ICR and maneuverability
  var CFG = {
    unicycle: { n: ['One fixed wheel (unicycle)', 'Une roue fixe (monocycle)'], w: [{ x: 0, y: 0, k: 'f' }], steer: 0, motors: 0 },
    diff: { n: ['Differential drive (2 fixed wheels + castor)', 'Robot différentiel (2 roues fixes + roue folle)'], w: [{ x: 0, y: 0.15, k: 'f' }, { x: 0, y: -0.15, k: 'f' }], steer: 0, motors: 0 },
    bikeLocked: { n: ['Bicycle with the steering locked', 'Vélo avec la direction bloquée'], w: [{ x: -0.5, y: 0, k: 'f' }, { x: 0.5, y: 0, k: 'f' }], steer: 0, motors: 0 },
    bike: { n: ['Bicycle (steered front wheel)', 'Vélo (roue avant orientable)'], w: [{ x: -0.5, y: 0, k: 'f' }, { x: 0.5, y: 0, k: 's' }], steer: 1, motors: 1 },
    tricycle: { n: ['Tricycle', 'Tricycle'], w: [{ x: 0, y: 0.25, k: 'f' }, { x: 0, y: -0.25, k: 'f' }, { x: 0.8, y: 0, k: 's' }], steer: 1, motors: 1 },
    car: { n: ['Car (Ackermann)', 'Voiture (Ackermann)'], w: [{ x: 0, y: 0.35, k: 'f' }, { x: 0, y: -0.35, k: 'f' }, { x: 0.9, y: 0.35, k: 'a' }, { x: 0.9, y: -0.35, k: 'a' }], steer: 1, motors: 1 },
    twosteer: { n: ['Two-steer (both wheels steered)', 'Deux roues orientables'], w: [{ x: -0.5, y: 0, k: 's2' }, { x: 0.5, y: 0, k: 's' }], steer: 1, motors: 2 },
    omnisteer: { n: ['Omni-steer (2 omni wheels + 1 steered wheel)', 'Omni-steer (2 roues omni + 1 roue orientable)'], w: [{ x: 0, y: 0.25, k: 'o' }, { x: 0, y: -0.25, k: 'o' }, { x: 0.8, y: 0, k: 's' }], steer: 1, motors: 1 },
    synchro: { n: ['Synchro drive (3 wheels steered together)', 'Entraînement synchrone (3 roues orientées ensemble)'], w: [{ x: 0.2, y: 0, k: 's' }, { x: -0.1, y: 0.17, k: 's' }, { x: -0.1, y: -0.17, k: 's' }], steer: 1, motors: 1, sync: true },
    omni: { n: ['Omnidirectional (3 omni wheels)', 'Omnidirectionnel (3 roues omni)'], w: [{ x: 0.2, y: 0, k: 'o' }, { x: -0.1, y: 0.17, k: 'o' }, { x: -0.1, y: -0.17, k: 'o' }], steer: 0, motors: 0 }
  };
  function rank(rows) {                                    // Gaussian elimination
    var A = rows.map(function (r) { return r.slice(); }), rk = 0, c, i, j, p;
    for (c = 0; c < 3 && rk < A.length; c++) {
      p = rk; for (i = rk + 1; i < A.length; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
      if (Math.abs(A[p][c]) < 1e-9) continue;
      var t = A[rk]; A[rk] = A[p]; A[p] = t;
      for (i = rk + 1; i < A.length; i++) { var m = A[i][c] / A[rk][c]; for (j = c; j < 3; j++) A[i][j] -= m * A[rk][j]; }
      rk++;
    }
    return rk;
  }
  function icrWidget(root) {
    var S = { cfg: 'diff', d: 20 };
    root.append(el('h4', {}, L('Try it: constraints, rank and maneuverability', 'Essayez : contraintes, rang et manœuvrabilité')));
    root.append(el('p', { 'class': 'wnote' }, L('Pick a wheel layout. The page builds the sliding-constraint row of every standard wheel (omni wheels give none), computes the rank and reads δm, δs and δM. The dashed lines are the zero-motion lines: where they meet is the ICR.', 'Choisissez une disposition de roues. La page construit la ligne de contrainte de glissement de chaque roue standard (les roues omni n\'en donnent aucune), calcule le rang et lit δm, δs et δM. Les traits pointillés sont les lignes de mouvement nul : leur point de rencontre est le CIR.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var sel = el('select', { 'aria-label': L('Wheel layout', 'Disposition des roues') });
    Object.keys(CFG).forEach(function (k) { sel.append(el('option', { value: k }, CFG[k].n[FR ? 1 : 0])); });
    sel.value = S.cfg; sel.addEventListener('change', function () { S.cfg = sel.value; draw(); });
    var sd = slider('δ', -35, 35, 1, S.d, '°', function (v) { S.d = v; draw(); }, 0);
    ctl.append(sel, sd, out);
    var svg = sv('svg', { viewBox: '0 0 480 300', 'class': 'wsvg', role: 'img', 'aria-label': L('Top view of the wheels with their zero-motion lines', 'Vue de dessus des roues avec leurs lignes de mouvement nul') });
    box.append(svg, ctl); root.append(box);
    function draw() {
      var c = CFG[S.cfg], dl = S.d * rad, rowsAll = [], rowsF = [], lines = [], ws = [];
      sd.style.display = c.steer ? '' : 'none';
      c.w.forEach(function (w, idx) {
        var psi = 0;
        if (w.k === 's' || w.k === 's2') psi = w.k === 's2' ? -dl * 0.6 : dl;
        if (w.k === 'a') { var R0 = Math.abs(dl) < 1e-6 ? 1e9 : 0.9 / Math.tan(dl); psi = Math.atan2(0.9, R0 - w.y); }
        if (S.cfg === 'synchro') psi = dl;
        ws.push({ x: w.x, y: w.y, psi: psi, k: w.k });
        if (w.k === 'o') return;
        var row = [-Math.sin(psi), Math.cos(psi), w.x * Math.cos(psi) + w.y * Math.sin(psi)];
        rowsAll.push(row); if (w.k === 'f') rowsF.push(row);
      });
      var rk = rank(rowsAll), rkF = rank(rowsF), dm = 3 - rk, extra = rk - rkF, ds = c.sync ? 1 : Math.min(extra, c.motors || 0), dM = dm + ds;
      // ICR from the null space when rank = 2
      var icr = null, icrDir = null;
      if (rk === 2) {
        var r1 = null, r2 = null, i, j;
        outer: for (i = 0; i < rowsAll.length; i++) for (j = i + 1; j < rowsAll.length; j++) { var cr = [rowsAll[i][1] * rowsAll[j][2] - rowsAll[i][2] * rowsAll[j][1], rowsAll[i][2] * rowsAll[j][0] - rowsAll[i][0] * rowsAll[j][2], rowsAll[i][0] * rowsAll[j][1] - rowsAll[i][1] * rowsAll[j][0]]; if (Math.hypot(cr[0], cr[1], cr[2]) > 1e-6) { r1 = cr; break outer; } }
        if (r1) { if (Math.abs(r1[2]) > 1e-6) icr = [-r1[1] / r1[2], r1[0] / r1[2]]; else icrDir = Math.atan2(r1[1], r1[0]); }
      }
      var bx = ws.map(function (w) { return w.x; }), by = ws.map(function (w) { return w.y; });
      if (icr && Math.hypot(icr[0], icr[1]) < 7) { bx.push(icr[0]); by.push(icr[1]); }
      var x0 = Math.min.apply(null, bx) - 0.45, x1 = Math.max.apply(null, bx) + 0.45, y0 = Math.min.apply(null, by) - 0.45, y1 = Math.max.apply(null, by) + 0.45;
      var K = Math.min(440 / (x1 - x0), 280 / (y1 - y0), 220), ox = 20 - K * x0 + (440 - K * (x1 - x0)) / 2, oy = 10 + K * y1 + (280 - K * (y1 - y0)) / 2;
      var X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      svg.innerHTML = '';
      ws.forEach(function (w) {
        if (w.k === 'o') return;
        var ax = -Math.sin(w.psi), ay = Math.cos(w.psi);
        sv('line', { x1: X(w.x - 6 * ax), y1: Y(w.y - 6 * ay), x2: X(w.x + 6 * ax), y2: Y(w.y + 6 * ay), stroke: GREY, 'stroke-dasharray': '4 4', 'stroke-width': 1 }, svg);
      });
      var cx0 = Math.min.apply(null, ws.map(function (w) { return w.x; })) - 0.25, cx1 = Math.max.apply(null, ws.map(function (w) { return w.x; })) + 0.25, cy0 = Math.min.apply(null, ws.map(function (w) { return w.y; })) - 0.2, cy1 = Math.max.apply(null, ws.map(function (w) { return w.y; })) + 0.2;
      sv('rect', { x: X(cx0), y: Y(cy1), width: K * (cx1 - cx0), height: K * (cy1 - cy0), rx: 8, fill: 'rgba(91,143,214,.1)', stroke: '#5b8fd6', 'stroke-dasharray': '3 3' }, svg);
      ws.forEach(function (w) {
        if (w.k === 'o') { sv('circle', { cx: X(w.x), cy: Y(w.y), r: 11, fill: 'rgba(255,159,67,.25)', stroke: ORANGE, 'stroke-width': 2 }, svg); return; }
        wheel(svg, X(w.x), Y(w.y), w.psi, 34, 12, w.k === 'f' ? '#6b7686' : '#8aa4c8');
      });
      if (icr && Math.hypot(icr[0], icr[1]) < 3) { sv('circle', { cx: X(icr[0]), cy: Y(icr[1]), r: 6, fill: ORANGE }, svg); txt(svg, X(icr[0]) + 9, Y(icr[1]) - 7, 'ICR', 'start', ORANGE); }
      var what = c.sync ? L('All the wheels stay parallel: the ICR is at infinity (pure translation); steering only changes its direction.', 'Toutes les roues restent parallèles : le CIR est à l\'infini (translation pure) ; l\'orientation ne change que sa direction.') : dm === 3 ? L('No constraint: any velocity is possible, the ICR can be anywhere.', 'Aucune contrainte : toute vitesse est possible, le CIR peut être n\'importe où.')
        : dm === 2 ? L('One constraint: the ICR must lie on a line (the zero-motion line).', 'Une contrainte : le CIR doit être sur une droite (la ligne de mouvement nul).')
        : dm === 1 ? L('Two independent constraints: at each instant the ICR is a single point' + (ds === 0 ? ' and it cannot move: only a line or a circle can be followed.' : ' (it moves when the steering changes).'), 'Deux contraintes indépendantes : à chaque instant le CIR est un point unique' + (ds === 0 ? ' et il ne peut pas bouger : seule une droite ou un cercle est possible.' : ' (il bouge quand le braquage change).'))
        : L('Completely constrained: the robot cannot move.', 'Complètement contraint : le robot ne peut pas bouger.');
      out.innerHTML = '<ul><li>' + L('standard wheels (rows of C₁)', 'roues standard (lignes de C₁)') + ': <b>' + rowsAll.length + '</b></li><li>rank C₁ = <b>' + rk + '</b></li><li>δ<sub>m</sub> = 3 − ' + rk + ' = <b>' + dm + '</b></li><li>δ<sub>s</sub> = <b>' + ds + '</b>' + (c.sync ? ' (' + L('one motor steers all three wheels', 'un seul moteur oriente les trois roues') + ')' : '') + '</li><li>δ<sub>M</sub> = δ<sub>m</sub> + δ<sub>s</sub> = <b>' + dM + '</b></li></ul>' + what;
    }
    draw();
  }

  // ------------------------------------------------------------------ lesson 9: go to a goal pose
  function goto_(root) {
    var S = { x: -2, y: -1, th: 0, kr: 1.5, ka: 6, kb: -2 };
    root.append(el('h4', {}, L('Try it: drive a robot to the goal', 'Essayez : conduire un robot vers le but')));
    root.append(el('p', { 'class': 'wnote' }, L('The goal is the origin, with the robot pointing to the right (θ = 0). Choose where the robot starts and the three gains, then press “Go”. Try the textbook gains 3, 8, −1.5 (fast, but the heading ends less precise), and break the stability conditions (for example k<sub>β</sub> > 0) to see what happens. If the goal is behind the robot it drives backwards. “8 starts” draws the paths from eight start positions.', 'Le but est l\'origine, avec le robot pointant vers la droite (θ = 0). Choisissez le départ du robot et les trois gains, puis appuyez sur « Go ». Essayez les gains classiques 3, 8, −1,5 (rapide, mais le cap final est moins précis), et cassez les conditions de stabilité (par exemple k<sub>β</sub> > 0) pour voir ce qui se passe. Si le but est derrière le robot, il roule en marche arrière. « 8 départs » trace les chemins depuis huit positions.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var sx = slider('x₀', -3, 3, 0.1, S.x, ' m', function (v) { S.x = v; run(); }, 1), sy = slider('y₀', -2.2, 2.2, 0.1, S.y, ' m', function (v) { S.y = v; run(); }, 1), st = slider('θ₀', -180, 180, 5, S.th, '°', function (v) { S.th = v; run(); }, 0);
    var kr = slider('k<sub>ρ</sub>', 0.5, 6, 0.5, S.kr, '', function (v) { S.kr = v; run(); }, 1), ka = slider('k<sub>α</sub>', 0, 14, 0.5, S.ka, '', function (v) { S.ka = v; run(); }, 1), kb = slider('k<sub>β</sub>', -4, 2, 0.5, S.kb, '', function (v) { S.kb = v; run(); }, 1);
    var bt = buttons([['Go', 'go'], [L('8 starts', '8 départs'), 'eight']], function (m) { run(m === 'eight'); });
    ctl.append(sx, sy, st, kr, ka, kb, bt, out);
    var svg = sv('svg', { viewBox: '0 0 480 320', 'class': 'wsvg', role: 'img', 'aria-label': L('Path of a robot driving to a goal pose', 'Trajectoire d\'un robot qui se rend à une pose but') });
    box.append(svg, ctl); root.append(box);
    function sim(x, y, th) {
      var pts = [[x, y, th]], dt = 0.02, t, res = { ok: false, vmin: Infinity, t: 0 };
      for (t = 0; t < 40; t += dt) {
        var dx = -x, dy = -y, rho = Math.hypot(dx, dy), g = Math.atan2(dy, dx), th2 = th, sgn = 1;
        var al = wrap(g - th);
        if (Math.abs(al) > PI / 2) { th2 = th + PI; al = wrap(g - th2); sgn = -1; }
        var be = wrap(-th2 - al), v = sgn * S.kr * rho, w = S.ka * al + S.kb * be;
        if (rho < 0.01) { res.ok = true; break; }
        x += v * Math.cos(th) * dt; y += v * Math.sin(th) * dt; th += w * dt;
        pts.push([x, y, th]); if (!isFinite(x) || Math.hypot(x, y) > 30) break;
      }
      res.t = t; res.th = th; res.pts = pts; return res;
    }
    var K = 70, ox = 240, oy = 160, X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
    function robot(p, col) { var g = sv('g', { transform: 'translate(' + X(p[0]) + ' ' + Y(p[1]) + ') rotate(' + (-p[2] * deg) + ')' }, svg); sv('polygon', { points: '12,0 -8,7 -8,-7', fill: col, stroke: '#cfd8e3', 'stroke-width': 1 }, g); }
    function run(eight) {
      svg.innerHTML = '';
      sv('line', { x1: 10, y1: oy, x2: 470, y2: oy, stroke: '#6f7b8c', 'stroke-width': 1 }, svg); sv('line', { x1: ox, y1: 8, x2: ox, y2: 312, stroke: '#6f7b8c', 'stroke-width': 1 }, svg);
      var starts = eight ? [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * PI / 4; return [2.2 * Math.cos(a), 1.6 * Math.sin(a), S.th * rad]; }) : [[S.x, S.y, S.th * rad]], last = null;
      starts.forEach(function (s0, i) {
        var r = sim(s0[0], s0[1], s0[2]); last = r;
        sv('polyline', { points: r.pts.filter(function (p, k) { return k % 2 === 0 && Math.abs(p[0]) < 6 && Math.abs(p[1]) < 4; }).map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: eight ? BLUE : GREEN, 'stroke-width': 2 }, svg);
        robot(s0, GREY); if (!eight) robot(r.pts[r.pts.length - 1], ORANGE);
      });
      arrow(svg, X(0), Y(0), X(0) + 38, Y(0), RED, 3); sv('circle', { cx: X(0), cy: Y(0), r: 5, fill: RED }, svg); txt(svg, X(0) - 8, Y(0) + 18, L('goal', 'but'), 'end', RED);
      var stable = S.kr > 0 && S.kb < 0 && S.ka - S.kr > 0, cond = '<ul><li>k<sub>ρ</sub> &gt; 0: <b>' + (S.kr > 0 ? '✓' : '✗') + '</b></li><li>k<sub>β</sub> &lt; 0: <b>' + (S.kb < 0 ? '✓' : '✗') + '</b></li><li>k<sub>α</sub> − k<sub>ρ</sub> &gt; 0: <b>' + (S.ka - S.kr > 0 ? '✓' : '✗') + '</b> (' + f(S.ka - S.kr, 1) + ')</li></ul>';
      var msg = stable ? L('Stability conditions met.', 'Conditions de stabilité respectées.') : L('A condition is broken: convergence is not guaranteed.', 'Une condition est violée : la convergence n\'est pas garantie.');
      var chOk = !eight && last.ok && S.x === -2.5 && S.y === 1.5 && S.th === 0 && last.t < 4 && Math.abs(wrap(last.th) * deg) < 2; if (chOk) window.RA_chal('goto');
      out.innerHTML = cond + msg + (eight ? '' : '<br>' + (last.ok ? L('Arrived after ', 'Arrivé après ') + '<b>' + f(last.t, 1) + '</b> s ' + L('with final heading ', 'avec le cap final ') + '<b>' + f(wrap(last.th) * deg, 0) + '°</b>.' : L('The robot did not reach the goal within 40 s.', 'Le robot n\'a pas atteint le but en 40 s.'))) + chalLine(chOk, L('Challenge: start at x₀ = −2.5, y₀ = 1.5, θ₀ = 0°; arrive in less than 4 s with a final heading error below 2°. Press Go to test.', 'Défi : partez de x₀ = −2,5, y₀ = 1,5, θ₀ = 0° ; arrivez en moins de 4 s avec une erreur de cap finale inférieure à 2°. Appuyez sur Go pour tester.'));
    }
    run();
  }



  // ------------------------------------------------------------------ lesson 8: Mecanum and swerve
  function mecanum(root) {
    var S = { mode: 'mec', vx: 0.5, vy: 0.3, w: 0.2, lim: 30 };
    root.append(el('h4', {}, L('Try it: Mecanum and swerve', 'Essayez : Mecanum et swerve')));
    root.append(el('p', { 'class': 'wnote' }, L('Choose the robot velocity (in the robot frame). Mecanum: the four wheel speeds, the hidden condition FL + FR = RL + RR, and the scaling when a motor limit is exceeded. Swerve: the speed and the steering angle of each module (angles beyond 90° are flipped).', 'Choisissez la vitesse du robot (dans son repère). Mecanum : les quatre vitesses de roues, la condition cachée AVG + AVD = ARG + ARD, et la mise à l\'échelle quand une limite de moteur est dépassée. Swerve : la vitesse et l\'angle de braquage de chaque module (les angles au-delà de 90° sont retournés).')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var mb = buttons([['Mecanum', 'mec'], ['Swerve', 'sw']], function (m) { S.mode = m; limRow.style.display = m === 'mec' ? '' : 'none'; draw(); });
    var sx = slider('v<sub>x</sub>', -1, 1, 0.05, S.vx, ' m/s', function (v) { S.vx = v; draw(); }), sy = slider('v<sub>y</sub>', -1, 1, 0.05, S.vy, ' m/s', function (v) { S.vy = v; draw(); }), sw = slider('ω', -2, 2, 0.05, S.w, ' rad/s', function (v) { S.w = v; draw(); });
    var limRow = slider(L('limit', 'limite'), 5, 60, 1, S.lim, ' rad/s', function (v) { S.lim = v; draw(); }, 0);
    ctl.append(mb, sx, sy, sw, limRow, out);
    var svg = sv('svg', { viewBox: '0 0 480 300', 'class': 'wsvg', role: 'img', 'aria-label': L('Top view of a Mecanum or swerve robot', 'Vue de dessus d\'un robot Mecanum ou swerve') });
    box.append(svg, ctl); root.append(box);
    function draw() {
      svg.innerHTML = '';
      var K = 380, ox = 240, oy = 150;
      var X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      var vx = S.vx, vy = S.vy, w = S.w;
      if (S.mode === 'mec') {
        var r = 0.05, lx = 0.2, ly = 0.15, k = lx + ly, ph = [(vx - vy - k * w) / r, (vx + vy + k * w) / r, (vx + vy - k * w) / r, (vx - vy + k * w) / r], names = ['FL', 'FR', 'RL', 'RR'];
        var mx = Math.max.apply(null, ph.map(Math.abs)), sc = Math.max(1, mx / S.lim), pos = [[lx, ly], [lx, -ly], [-lx, ly], [-lx, -ly]];
        sv('rect', { x: X(-lx - 0.04), y: Y(ly), width: K * (2 * lx + 0.08), height: K * 2 * ly, rx: 8, fill: 'rgba(91,143,214,.15)', stroke: '#5b8fd6' }, svg);
        pos.forEach(function (p, i) {
          var cx = X(p[0]), cy = Y(p[1]), g = sv('g', { transform: 'translate(' + cx + ' ' + cy + ')' }, svg);
          sv('rect', { x: -26, y: -9, width: 52, height: 18, rx: 3, fill: '#4a5566', stroke: '#cfd8e3' }, g);
          var sl = (i === 0 || i === 3) ? -1 : 1;                             // roller direction: the rollers of the 4 wheels form an X
          for (var q = -16; q <= 16; q += 10) sv('line', { x1: q - 4 * sl, y1: 6, x2: q + 4 * sl, y2: -6, stroke: '#9aa7b6', 'stroke-width': 2 }, g);
          var a = Math.max(-1, Math.min(1, ph[i] / sc / 40)) * 70; if (Math.abs(a) > 3) arrow(g, 0, 0, a, 0, i % 3 === 0 ? ORANGE : GREEN, 3);
          txt(g, 0, p[1] > 0 ? -16 : 28, names[i] + ' ' + f(ph[i] / sc, 1), 'middle', '#cfd8e3');
        });
        var vm = Math.hypot(vx, vy); if (vm > 1e-6) arrow(svg, ox, oy, ox + 60 * vx / vm * Math.min(1, vm + 0.3), oy - 60 * vy / vm * Math.min(1, vm + 0.3), RED, 4);
        out.innerHTML = '<ul>' + names.map(function (n, i) { return '<li>φ̇<sub>' + n + '</sub> = <b>' + f(ph[i], 1) + '</b> rad/s</li>'; }).join('') + '</ul>' +
          L('Condition FL + FR = RL + RR: ', 'Condition AVG + AVD = ARG + ARD : ') + '<b>' + f(ph[0] + ph[1], 1) + ' = ' + f(ph[2] + ph[3], 1) + '</b><br>' +
          (sc > 1 ? '<span style="color:var(--f-r)">' + L('Motor limit exceeded: all wheels are divided by s = ', 'Limite moteur dépassée : toutes les roues sont divisées par s = ') + f(sc, 2) + '</span><br>' + L('The robot goes in the same direction, ', 'Le robot va dans la même direction, ') + f(sc, 2) + L(' times slower.', ' fois plus lentement.') : L('All wheels are within the motor limit.', 'Toutes les roues sont dans la limite des moteurs.'));
      } else {
        var mods = [[0.3, 0.25], [0.3, -0.25], [-0.3, 0.25], [-0.3, -0.25]], KS = 200, li = '<ul>';
        var X2 = function (x) { return ox + KS * x; }, Y2 = function (y) { return oy - KS * y; };
        sv('rect', { x: X2(-0.34), y: Y2(0.29), width: KS * 0.68, height: KS * 0.58, rx: 8, fill: 'rgba(91,143,214,.15)', stroke: '#5b8fd6' }, svg);
        mods.forEach(function (m, i) {
          var ux = vx - w * m[1], uy = vy + w * m[0], sp = Math.hypot(ux, uy), ang = Math.atan2(uy, ux), flip = false;
          if (sp < 1e-6) ang = 0; if (ang > PI / 2 + 1e-9) { ang -= PI; sp = -sp; flip = true; } else if (ang < -PI / 2 - 1e-9) { ang += PI; sp = -sp; flip = true; }
          wheel(svg, X2(m[0]), Y2(m[1]), ang, 46, 14, '#8aa4c8');
          arrow(svg, X2(m[0]), Y2(m[1]), X2(m[0]) + 60 * sp * Math.cos(ang), Y2(m[1]) - 60 * sp * Math.sin(ang), i % 3 === 0 ? ORANGE : GREEN, 3);
          li += '<li>' + ['FL', 'FR', 'RL', 'RR'][i] + ': ' + f(sp, 2) + ' m/s, ' + f(ang * deg, 1) + '°' + (flip ? ' (' + L('flipped', 'retourné') + ')' : '') + '</li>';
        });
        out.innerHTML = li + '</ul>' + L('Each module: u = (v<sub>x</sub> − ω y, v<sub>y</sub> + ω x). If the angle exceeds 90° the module is turned by 180° and the speed changes sign.', 'Chaque module : u = (v<sub>x</sub> − ω y, v<sub>y</sub> + ω x). Si l\'angle dépasse 90° le module est tourné de 180° et la vitesse change de signe.');
      }
    }
    limRow.style.display = S.mode === 'mec' ? '' : 'none'; draw();
  }

  // ------------------------------------------------------------------ lesson 12: pure pursuit with motor lag
  function pursuit(root) {
    var S = { Ld: 1.0, v: 1.0, tau: 0.3 };
    root.append(el('h4', {}, L('Try it: pure pursuit and the look-ahead distance', 'Essayez : la poursuite pure et la distance d\'anticipation')));
    root.append(el('p', { 'class': 'wnote' }, L('The robot starts 0.4 m below the wavy path and follows it with pure pursuit. “Motor lag” is the time constant of the turning-rate response of the motors. The error is measured after the first 3 seconds. Find a look-ahead distance that works at high speed with a lag.', 'Le robot part 0,4 m sous le chemin ondulé et le suit en poursuite pure. Le « retard moteur » est la constante de temps de la réponse en vitesse de rotation des moteurs. L\'erreur est mesurée après les 3 premières secondes. Trouvez une distance d\'anticipation qui marche à grande vitesse avec un retard.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var sl = slider('L<sub>d</sub>', 0.2, 3, 0.1, S.Ld, ' m', function (v) { S.Ld = v; run(); }, 1), sv_ = slider('v', 0.3, 2, 0.1, S.v, ' m/s', function (v) { S.v = v; run(); }, 1), st = slider(L('lag', 'retard'), 0, 0.6, 0.05, S.tau, ' s', function (v) { S.tau = v; run(); });
    var pre = buttons([[L('challenge setup', 'réglage du défi'), 'c']], function () { S.v = 1.0; S.tau = 0.4; sv_.set(1.0); st.set(0.4); run(); });
    ctl.append(sl, sv_, st, pre, out);
    var svg = sv('svg', { viewBox: '0 0 480 220', 'class': 'wsvg', role: 'img', 'aria-label': L('A robot following a wavy path with pure pursuit', 'Un robot suivant un chemin ondulé en poursuite pure') });
    box.append(svg, ctl); root.append(box);
    var path = []; for (var x = 0; x <= 14.001; x += 0.05) path.push([x, 0.8 * Math.sin(0.6 * x)]);
    var K = 30, ox = 20, oy = 110, X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
    function run() {
      var px = 0, py = -0.4, th = 0, wa = 0, dt = 0.02, maxe = 0, sse = 0, n = 0, idx = 0, tr = [[px, py]], t, done = false, worst = [px, py];
      for (t = 0; t < 60; t += dt) {
        var best = 1e9, bi = idx, i;
        for (i = Math.max(0, idx - 5); i < Math.min(path.length, idx + 80); i++) { var d = Math.hypot(path[i][0] - px, path[i][1] - py); if (d < best) { best = d; bi = i; } }
        idx = bi; if (idx >= path.length - 3) { done = true; break; }
        var li = idx; while (li < path.length - 1 && Math.hypot(path[li][0] - px, path[li][1] - py) < S.Ld) li++;
        var gx = path[li][0] - px, gy = path[li][1] - py, xr = Math.cos(th) * gx + Math.sin(th) * gy, yr = -Math.sin(th) * gx + Math.cos(th) * gy, w = S.v * 2 * yr / (xr * xr + yr * yr);
        w = Math.max(-2.5, Math.min(2.5, w)); if (S.tau > 0) wa += (w - wa) * dt / S.tau; else wa = w;
        px += S.v * Math.cos(th) * dt; py += S.v * Math.sin(th) * dt; th += wa * dt; tr.push([px, py]);
        if (t > 3) { if (best > maxe) { maxe = best; worst = [px, py]; } sse += best * best; n++; }
        if (!isFinite(px) || Math.abs(py) > 20) break;
      }
      var rms = Math.sqrt(sse / Math.max(n, 1)), ok = done && S.v >= 1.0 - 1e-9 && Math.abs(S.tau - 0.4) < 1e-9 && maxe < 0.15;
      svg.innerHTML = '';
      sv('polyline', { points: path.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: GREY, 'stroke-width': 6, opacity: 0.5 }, svg);
      sv('polyline', { points: tr.filter(function (p, k) { return k % 2 === 0 && Math.abs(p[1]) < 3.5 && p[0] < 15; }).map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: done ? GREEN : RED, 'stroke-width': 2 }, svg);
      sv('circle', { cx: X(0), cy: Y(-0.4), r: 4, fill: ORANGE }, svg);
      if (maxe > 0.02 && Math.abs(worst[1]) < 3.5) { sv('circle', { cx: X(worst[0]), cy: Y(worst[1]), r: 6, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg); }
      if (ok) window.RA_chal('pursuit');
      out.innerHTML = '<ul><li>' + L('maximum cross-track error', 'erreur transversale maximale') + ': <b>' + f(maxe, 3) + '</b> m</li><li>' + L('RMS error', 'erreur RMS') + ': <b>' + f(rms, 3) + '</b> m</li><li>' + (done ? L('end of the path reached', 'fin du chemin atteinte') : '<span style="color:var(--f-r)">' + L('lost the path (unstable)', 'chemin perdu (instable)') + '</span>') + '</li></ul>' +
        chalLine(ok, L('Challenge: with lag = 0.4 s and v ≥ 1.0 m/s, keep the maximum error below 0.15 m.', 'Défi : avec un retard de 0,4 s et v ≥ 1,0 m/s, gardez l\'erreur maximale sous 0,15 m.'));
    }
    run();
  }

  // ------------------------------------------------------------------ lesson 13: Dubins paths
  function dubinsWidget(root) {
    var S = { gx: 3, gy: 2, gt: 90, R: 1 };
    root.append(el('h4', {}, L('Try it: the shortest path of a car-like robot', 'Essayez : le plus court chemin d\'un robot de type voiture')));
    root.append(el('p', { 'class': 'wnote' }, L('The robot starts at the origin pointing right. Choose the goal pose and the minimum turning radius R. The orange path is the shortest of the four words LSL, LSR, RSL, RSR; the grey ones are the other candidates.', 'Le robot part de l\'origine, orienté vers la droite. Choisissez la pose but et le rayon de virage minimal R. Le chemin orange est le plus court des quatre mots LSL, LSR, RSL, RSR ; les gris sont les autres candidats.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var a = slider('x', -8, 8, 0.5, S.gx, ' m', function (v) { S.gx = v; draw(); }, 1), b = slider('y', -5, 5, 0.5, S.gy, ' m', function (v) { S.gy = v; draw(); }, 1), c = slider('θ', -180, 180, 15, S.gt, '°', function (v) { S.gt = v; draw(); }, 0), d = slider('R', 0.5, 3, 0.25, S.R, ' m', function (v) { S.R = v; draw(); });
    ctl.append(a, b, c, d, out);
    var svg = sv('svg', { viewBox: '0 0 480 300', 'class': 'wsvg', role: 'img', 'aria-label': L('Dubins paths between two poses', 'Chemins de Dubins entre deux poses') });
    box.append(svg, ctl); root.append(box);
    var mod = function (x) { x = x % (2 * PI); return x < 0 ? x + 2 * PI : x; };
    function words(gx, gy, gt, R) {
      var dd = Math.hypot(gx, gy) / R, th = Math.atan2(gy, gx), al = mod(-th), be = mod(gt - th), sa = Math.sin(al), ca = Math.cos(al), sb = Math.sin(be), cb = Math.cos(be), cc = Math.cos(al - be), out_ = [], p2, tmp, p;
      p2 = 2 + dd * dd - 2 * cc + 2 * dd * (sa - sb); if (p2 >= 0) { tmp = Math.atan2(cb - ca, dd + sa - sb); out_.push({ w: 'LSL', t: mod(-al + tmp), p: Math.sqrt(p2), q: mod(be - tmp) }); }
      p2 = 2 + dd * dd - 2 * cc + 2 * dd * (sb - sa); if (p2 >= 0) { tmp = Math.atan2(ca - cb, dd - sa + sb); out_.push({ w: 'RSR', t: mod(al - tmp), p: Math.sqrt(p2), q: mod(-be + tmp) }); }
      p2 = -2 + dd * dd + 2 * cc + 2 * dd * (sa + sb); if (p2 >= 0) { p = Math.sqrt(p2); tmp = Math.atan2(-ca - cb, dd + sa + sb) - Math.atan2(-2, p); out_.push({ w: 'LSR', t: mod(-al + tmp), p: p, q: mod(-mod(be) + tmp) }); }
      p2 = dd * dd - 2 + 2 * cc - 2 * dd * (sa + sb); if (p2 >= 0) { p = Math.sqrt(p2); tmp = Math.atan2(ca + cb, dd - sa - sb) - Math.atan2(2, p); out_.push({ w: 'RSL', t: mod(al - tmp), p: p, q: mod(be - tmp) }); }
      out_.forEach(function (o) { o.len = (o.t + o.p + o.q) * R; }); out_.sort(function (u, v) { return u.len - v.len; }); return out_;
    }
    function pts(o, R) {
      var x = 0, y = 0, th = 0, res = [[0, 0]], seg = [[o.w[0], o.t], ['S', o.p], [o.w[2], o.q]];
      seg.forEach(function (sg) {
        var n = Math.max(2, Math.ceil(sg[1] * 12)), i;
        for (i = 1; i <= n; i++) { var u = sg[1] * i / n; if (sg[0] === 'S') res.push([x + u * R * Math.cos(th), y + u * R * Math.sin(th)]); else { var sgn = sg[0] === 'L' ? 1 : -1, an = u * sgn; res.push([x + sgn * R * (Math.sin(th + an) - Math.sin(th)), y - sgn * R * (Math.cos(th + an) - Math.cos(th))]); } }
        var last = res[res.length - 1]; if (sg[0] !== 'S') th += sg[1] * (sg[0] === 'L' ? 1 : -1); x = last[0]; y = last[1];
      });
      return res;
    }
    function draw() {
      var gx = S.gx, gy = S.gy, gt = S.gt * rad, R = S.R, K = 28, ox = 240, oy = 150, X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      svg.innerHTML = '';
      sv('line', { x1: 8, y1: oy, x2: 472, y2: oy, stroke: '#6f7b8c', 'stroke-width': 1 }, svg); sv('line', { x1: ox, y1: 8, x2: ox, y2: 292, stroke: '#6f7b8c', 'stroke-width': 1 }, svg);
      var ws = words(gx, gy, gt, R);
      ws.slice(1).forEach(function (o) { sv('polyline', { points: pts(o, R).map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: GREY, 'stroke-width': 1.5, opacity: 0.7 }, svg); });
      if (ws.length) sv('polyline', { points: pts(ws[0], R).map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: ORANGE, 'stroke-width': 3.5 }, svg);
      arrow(svg, X(0), Y(0), X(0) + 30, Y(0), GREEN, 3); arrow(svg, X(gx), Y(gy), X(gx) + 30 * Math.cos(gt), Y(gy) - 30 * Math.sin(gt), RED, 3);
      sv('circle', { cx: X(0), cy: Y(0), r: 4, fill: GREEN }, svg); sv('circle', { cx: X(gx), cy: Y(gy), r: 4, fill: RED }, svg);
      var direct = Math.hypot(gx, gy);
      out.innerHTML = '<ul>' + ws.map(function (o, i) { return '<li' + (i === 0 ? ' style="color:var(--f-o)"' : '') + '>' + o.w + ': <b>' + f(o.len, 2) + '</b> m (t = ' + f(o.t, 2) + ', p = ' + f(o.p, 2) + ', q = ' + f(o.q, 2) + ')</li>'; }).join('') + '</ul>' + L('straight distance', 'distance en ligne droite') + ': <b>' + f(direct, 2) + '</b> m' + (ws.length ? ' · ' + L('extra length for the heading', 'longueur en plus pour le cap') + ': <b>' + f(ws[0].len - direct, 2) + '</b> m' : '');
    }
    draw();
  }


  // ------------------------------------------------------------------ small helpers for the next widgets
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * PI * v); }

  // ------------------------------------------------------------------ lesson 14: odometry errors and calibration (square test, both directions)
  function drift(root) {
    var TRUE = { sl: 1.012, sL: 1.02, noise: 0.005 }, S = { cl: 1.0, cL: 1.0 };
    root.append(el('h4', {}, L('Try it: calibrate a robot with the square test', 'Essayez : étalonner un robot avec le test du carré')));
    root.append(el('p', { 'class': 'wnote' }, L('This robot has two unknown systematic errors (its left wheel and its track are not what the program assumes). 30 runs of a 2 m open-loop square are made clockwise (blue) and counter-clockwise (orange). The crosses are the centres of the end points: they should be at the start (the green circle, 5 cm). Adjust your two corrections: if both centres are on the same side, the track is wrong; if they are on opposite sides, a wheel radius is wrong.', 'Ce robot a deux erreurs systématiques inconnues (sa roue gauche et sa voie ne sont pas celles que suppose le programme). 30 essais d\'un carré de 2 m en boucle ouverte sont faits en sens horaire (bleu) et antihoraire (orange). Les croix sont les centres des points d\'arrivée : ils doivent être au départ (le cercle vert, 5 cm). Réglez vos deux corrections : si les deux centres sont du même côté, la voie est fausse ; s\'ils sont de côtés opposés, un rayon de roue est faux.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var a = slider(L('left wheel ×', 'roue gauche ×'), 0.97, 1.03, 0.001, S.cl, '', function (v) { S.cl = v; run(); }, 3), b = slider(L('track ×', 'voie ×'), 0.97, 1.05, 0.001, S.cL, '', function (v) { S.cL = v; run(); }, 3);
    ctl.append(a, b, out);
    var svg = sv('svg', { viewBox: '0 0 480 300', 'class': 'wsvg', role: 'img', 'aria-label': L('End points of 30 square trips in each direction', 'Points d\'arrivée de 30 carrés dans chaque sens') });
    box.append(svg, ctl); root.append(box);
    function square(ccw, r) {
      var rr = 0.05, Lb = 0.30 * S.cL, rlTrue = 0.05 * TRUE.sl, Lt = 0.30 * TRUE.sL, dt = 0.01, x = 0, y = 0, th = 0, sg = ccw ? 1 : -1, leg, i, n;
      var run1 = function (v, w, T) {
        n = Math.round(T / dt);
        for (i = 0; i < n; i++) {
          var wr = (v + w * Lb / 2) / rr, wl = (v - w * Lb / 2) / (0.05 * S.cl);
          var dsr = rr * wr * dt * (1 + TRUE.noise * gauss(r)), dsl = rlTrue * wl * dt * (1 + TRUE.noise * gauss(r)), ds = (dsr + dsl) / 2, dth = (dsr - dsl) / Lt;
          x += ds * Math.cos(th + dth / 2); y += ds * Math.sin(th + dth / 2); th += dth;
        }
      };
      for (leg = 0; leg < 4; leg++) { run1(0.4, 0, 2 / 0.4); run1(0, sg * 1.0, (PI / 2) / 1.0); }
      return [x, y];
    }
    function run() {
      var r = rng(7), res = { cw: [], ccw: [] }, k, cg = {};
      for (k = 0; k < 30; k++) { res.ccw.push(square(true, r)); res.cw.push(square(false, r)); }
      ['cw', 'ccw'].forEach(function (d) { var sx = 0, sy = 0; res[d].forEach(function (p) { sx += p[0]; sy += p[1]; }); cg[d] = [sx / 30, sy / 30]; });
      var K = 150, ox = 240, oy = 150, X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      svg.innerHTML = '';
      sv('line', { x1: 8, y1: oy, x2: 472, y2: oy, stroke: '#6f7b8c', 'stroke-width': 1 }, svg); sv('line', { x1: ox, y1: 8, x2: ox, y2: 292, stroke: '#6f7b8c', 'stroke-width': 1 }, svg);
      sv('circle', { cx: X(0), cy: Y(0), r: K * 0.05, fill: 'rgba(78,209,127,.2)', stroke: GREEN, 'stroke-width': 2 }, svg);
      [['cw', BLUE], ['ccw', ORANGE]].forEach(function (d) {
        res[d[0]].forEach(function (p) { sv('circle', { cx: X(p[0]), cy: Y(p[1]), r: 2.5, fill: d[1], opacity: 0.55 }, svg); });
        var c = cg[d[0]]; sv('line', { x1: X(c[0]) - 7, y1: Y(c[1]), x2: X(c[0]) + 7, y2: Y(c[1]), stroke: d[1], 'stroke-width': 3 }, svg); sv('line', { x1: X(c[0]), y1: Y(c[1]) - 7, x2: X(c[0]), y2: Y(c[1]) + 7, stroke: d[1], 'stroke-width': 3 }, svg);
      });
      var e1 = Math.hypot(cg.cw[0], cg.cw[1]), e2 = Math.hypot(cg.ccw[0], cg.ccw[1]), ok = e1 < 0.05 && e2 < 0.05; if (ok) window.RA_chal('drift');
      out.innerHTML = '<ul><li style="color:' + BLUE + '">' + L('clockwise centre', 'centre horaire') + ': (' + f(cg.cw[0], 3) + ', ' + f(cg.cw[1], 3) + ') m → <b>' + f(e1 * 100, 1) + '</b> cm</li><li style="color:' + ORANGE + '">' + L('counter-clockwise centre', 'centre antihoraire') + ': (' + f(cg.ccw[0], 3) + ', ' + f(cg.ccw[1], 3) + ') m → <b>' + f(e2 * 100, 1) + '</b> cm</li></ul>' +
        (Math.sign(cg.cw[0]) === Math.sign(cg.ccw[0]) && Math.abs(cg.cw[0]) > 0.03 && Math.abs(cg.ccw[0]) > 0.03 ? L('Same side in x → a track error.', 'Même côté en x → une erreur de voie.') : (Math.abs(cg.cw[0]) > 0.03 && Math.abs(cg.ccw[0]) > 0.03 ? L('Opposite sides in x → a wheel-radius error.', 'Côtés opposés en x → une erreur de rayon de roue.') : '')) +
        chalLine(ok, L('Challenge: bring both centres within 5 cm of the start.', 'Défi : amenez les deux centres à moins de 5 cm du départ.'));
    }
    run();
  }

  // ------------------------------------------------------------------ lesson 15: EKF, the uncertainty ellipse
  function ekfWidget(root) {
    var S = { qf: 1, sg: 0.1 }, st;
    root.append(el('h4', {}, L('Try it: watch the uncertainty grow and shrink', 'Essayez : voir l\'incertitude grandir et diminuer')));
    root.append(el('p', { 'class': 'wnote' }, L('The robot drives a circle (green: the truth). Its odometry has a speed error of 3 % and a gyroscope bias, so the estimate (orange) drifts. The ellipse is the 2σ uncertainty of the position. Press “Drive” and see it grow, then “Position fix” and see it shrink and the estimate come back to the truth.', 'Le robot parcourt un cercle (vert : la vérité). Son odométrie a une erreur de vitesse de 3 % et un biais de gyroscope, donc l\'estimation (orange) dérive. L\'ellipse est l\'incertitude 2σ de la position. Appuyez sur « Avancer » et voyez-la grandir, puis sur « Recalage » et voyez-la diminuer et l\'estimation revenir vers la vérité.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var sq = slider('Q ×', 0.1, 100, 0.1, S.qf, '', function (v) { S.qf = v; show(); }, 1), sg = slider('σ fix', 0.02, 0.5, 0.01, S.sg, ' m', function (v) { S.sg = v; show(); });
    var bt = buttons([[L('Drive 1 s', 'Avancer 1 s'), 1], [L('Drive 10 s', 'Avancer 10 s'), 10], [L('Position fix', 'Recalage'), 'fix'], [L('Reset', 'Remise à zéro'), 'reset']], function (a) { if (a === 'reset') reset(); else if (a === 'fix') fix(); else drive(a); });
    ctl.append(sq, sg, bt, out);
    var svg = sv('svg', { viewBox: '0 0 480 300', 'class': 'wsvg', role: 'img', 'aria-label': L('Truth, estimate and uncertainty ellipse of a robot', 'Vérité, estimation et ellipse d\'incertitude d\'un robot') });
    box.append(svg, ctl); root.append(box);
    var mm = function (A, B) { return A.map(function (r) { return B[0].map(function (_, j) { return r.reduce(function (s_, a, k) { return s_ + a * B[k][j]; }, 0); }); }); }, tr = function (A) { return A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); }); };
    function reset() { st = { t: 0, r: rng(11), tru: [0, 0, 0], mu: [0, 0, 0], S: [[1e-4, 0, 0], [0, 1e-4, 0], [0, 0, 1e-4]], path: [[0, 0]], est: [[0, 0]], fixes: [], d2: null }; show(); }
    function drive(sec) {
      var dt = 0.1, n = Math.round(sec / dt), i, v = 0.5, w = 0.25;
      for (i = 0; i < n; i++) {
        st.tru = [st.tru[0] + v * dt * Math.cos(st.tru[2]), st.tru[1] + v * dt * Math.sin(st.tru[2]), st.tru[2] + w * dt];
        var vm = v * 1.03 + 0.02 * gauss(st.r), wm = w + 0.02 + 0.01 * gauss(st.r), th = st.mu[2];
        var G = [[1, 0, -vm * dt * Math.sin(th)], [0, 1, vm * dt * Math.cos(th)], [0, 0, 1]];
        st.mu = [st.mu[0] + vm * dt * Math.cos(th), st.mu[1] + vm * dt * Math.sin(th), th + wm * dt];
        var P = mm(mm(G, st.S), tr(G)); for (var k = 0; k < 3; k++) P[k][k] += 1e-5 * S.qf; st.S = P;
        st.t += dt; if (i % 5 === 4) { st.path.push([st.tru[0], st.tru[1]]); st.est.push([st.mu[0], st.mu[1]]); }
      }
      show();
    }
    function fix() {
      var z = [st.tru[0] + S.sg * gauss(st.r), st.tru[1] + S.sg * gauss(st.r)], P = st.S;
      var s11 = P[0][0] + S.sg * S.sg, s12 = P[0][1], s22 = P[1][1] + S.sg * S.sg, det = s11 * s22 - s12 * s12, inv = [[s22 / det, -s12 / det], [-s12 / det, s11 / det]];
      var nu = [z[0] - st.mu[0], z[1] - st.mu[1]], K = [0, 1, 2].map(function (i) { var a = P[i][0], b = P[i][1]; return [a * inv[0][0] + b * inv[1][0], a * inv[0][1] + b * inv[1][1]]; });
      st.d2 = nu[0] * (inv[0][0] * nu[0] + inv[0][1] * nu[1]) + nu[1] * (inv[1][0] * nu[0] + inv[1][1] * nu[1]);
      if (st.d2 > 9.21) { st.rejected = true; show(); return; } st.rejected = false;
      st.mu = [st.mu[0] + K[0][0] * nu[0] + K[0][1] * nu[1], st.mu[1] + K[1][0] * nu[0] + K[1][1] * nu[1], st.mu[2] + K[2][0] * nu[0] + K[2][1] * nu[1]];
      var KH = [[K[0][0], K[0][1], 0], [K[1][0], K[1][1], 0], [K[2][0], K[2][1], 0]], IKH = [[1 - KH[0][0], -KH[0][1], 0], [-KH[1][0], 1 - KH[1][1], 0], [-KH[2][0], -KH[2][1], 1]];
      st.S = mm(IKH, P); st.fixes.push(z); st.est.push([st.mu[0], st.mu[1]]); st.path.push([st.tru[0], st.tru[1]]); show();
    }
    function show() {
      var K = 42, ox = 190, oy = 270, X = function (x) { return ox + K * x; }, Y = function (y) { return oy - K * y; };
      svg.innerHTML = '';
      sv('polyline', { points: st.path.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: GREEN, 'stroke-width': 2 }, svg);
      sv('polyline', { points: st.est.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill: 'none', stroke: ORANGE, 'stroke-width': 2, 'stroke-dasharray': '5 3' }, svg);
      var a = st.S[0][0], b = st.S[0][1], c = st.S[1][1], tr_ = a + c, dd = Math.sqrt(Math.max(0, (a - c) * (a - c) / 4 + b * b)), l1 = tr_ / 2 + dd, l2 = Math.max(0, tr_ / 2 - dd), ph = 0.5 * Math.atan2(2 * b, a - c);
      var g = sv('g', { transform: 'translate(' + X(st.mu[0]) + ' ' + Y(st.mu[1]) + ') rotate(' + (-ph * deg) + ')' }, svg); sv('ellipse', { rx: Math.max(2, 2 * Math.sqrt(l1) * K), ry: Math.max(2, 2 * Math.sqrt(l2) * K), fill: 'rgba(255,159,67,.2)', stroke: ORANGE, 'stroke-width': 1.5 }, g);
      st.fixes.slice(-6).forEach(function (z) { sv('circle', { cx: X(z[0]), cy: Y(z[1]), r: 3, fill: BLUE }, svg); });
      sv('circle', { cx: X(st.tru[0]), cy: Y(st.tru[1]), r: 5, fill: GREEN }, svg); sv('circle', { cx: X(st.mu[0]), cy: Y(st.mu[1]), r: 4, fill: ORANGE }, svg);
      var err = Math.hypot(st.mu[0] - st.tru[0], st.mu[1] - st.tru[1]);
      out.innerHTML = '<ul><li>t = <b>' + f(st.t, 1) + '</b> s</li><li>' + L('real error', 'erreur réelle') + ': <b>' + f(err * 100, 1) + '</b> cm</li><li>σ<sub>x</sub> = <b>' + f(Math.sqrt(st.S[0][0]) * 100, 1) + '</b> cm, σ<sub>y</sub> = <b>' + f(Math.sqrt(st.S[1][1]) * 100, 1) + '</b> cm, σ<sub>θ</sub> = <b>' + f(Math.sqrt(st.S[2][2]) * deg, 2) + '</b>°</li>' + (st.d2 !== null ? '<li>d² = <b>' + f(st.d2, 2) + '</b> ' + (st.rejected ? '<span style="color:var(--f-r)">(' + L('rejected: above 9.21', 'rejeté : au-dessus de 9,21') + ')</span>' : '(' + L('accepted', 'accepté') + ')') + '</li>' : '') + '</ul>' + L('Green = truth, orange = estimate, blue = position fixes.', 'Vert = vérité, orange = estimation, bleu = recalages de position.');
    }
    reset();
  }

  // ------------------------------------------------------------------ lesson 16: motor and battery sizing
  function sizing(root) {
    var S = { m: 60, v: 1.2, a: 0.5, sl: 5, r: 0.1, G: 20, nd: 2, wd: 80, wh: 480, pe: 30, crr: 0.02, mu: 0.6, h: 0.4, T: 0.5, b: 0.3 };
    root.append(el('h4', {}, L('Try it: size the motors and the battery of a robot', 'Essayez : dimensionner les moteurs et la batterie d\'un robot')));
    root.append(el('p', { 'class': 'wnote' }, L('The defaults are the worked example of the lesson (a 60 kg AMR). Change the data and read the torque per motor, the motor speed, the electrical power, the runtime, and the traction and tipping checks.', 'Les valeurs par défaut sont l\'exemple résolu de la leçon (un AMR de 60 kg). Changez les données et lisez le couple par moteur, la vitesse du moteur, la puissance électrique, l\'autonomie, et les contrôles d\'adhérence et de basculement.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var def = [['m', L('mass', 'masse'), 5, 300, 1, ' kg', 0], ['v', 'v', 0.2, 3, 0.1, ' m/s', 1], ['a', 'a', 0.1, 2, 0.1, ' m/s²', 1], ['sl', L('slope', 'pente'), 0, 15, 0.5, ' %', 1], ['r', L('wheel r', 'rayon r'), 0.05, 0.3, 0.01, ' m', 2], ['G', L('gear', 'réduction'), 1, 60, 1, ':1', 0], ['nd', L('driven', 'motrices'), 1, 4, 1, '', 0], ['wd', L('load on driven', 'charge motrices'), 30, 100, 5, ' %', 0], ['wh', L('battery', 'batterie'), 50, 2000, 10, ' Wh', 0], ['pe', L('electronics', 'électronique'), 0, 200, 5, ' W', 0], ['crr', 'c<sub>rr</sub>', 0.005, 0.1, 0.005, '', 3], ['mu', 'μ', 0.2, 0.9, 0.05, '', 2], ['h', L('CG height', 'hauteur CG'), 0.1, 1, 0.05, ' m', 2], ['T', L('track', 'voie'), 0.2, 1.2, 0.05, ' m', 2], ['b', L('half wheelbase', 'demi-empattement'), 0.1, 0.8, 0.05, ' m', 2]];
    def.forEach(function (d) { ctl.append(slider(d[1], d[2], d[3], d[4], S[d[0]], d[5], function (v) { S[d[0]] = v; calc(); }, d[6])); });
    ctl.append(out);
    var info = el('div', { 'class': 'wout' }); box.append(info, ctl); root.append(box);
    function calc() {
      var g = 9.81, al = Math.atan(S.sl / 100), Fa = S.m * S.a, Fr = S.crr * S.m * g, Fg = S.m * g * Math.sin(al), F = Fa + Fr + Fg, etaG = 0.85;
      var tw = F * S.r / S.nd, tm = tw / (S.G * etaG), ww = S.v / S.r, rpm = ww * S.G * 60 / (2 * PI), Fc = Fr + Fg, Pm = Fc * S.v, Pe = Pm / 0.7 + S.pe, hrs = S.wh * 0.8 / Pe;
      var Fmax = S.mu * S.m * g * S.wd / 100 * Math.cos(al), aTip = g * S.b / S.h, aLat = g * S.T / (2 * S.h), slTip = Math.atan(S.T / (2 * S.h)) * deg;
      var line = function (name, val, ok) { return '<li style="color:' + (ok === false ? '#ff6b6b' : 'inherit') + '">' + name + ': <b>' + val + '</b>' + (ok === false ? ' ✗' : ok === true ? ' ✓' : '') + '</li>'; };
      info.innerHTML = '<ul>' + line(L('force to produce at the wheels', 'force à produire aux roues'), f(F, 1) + ' N (' + f(Fa, 1) + ' + ' + f(Fr, 1) + ' + ' + f(Fg, 1) + ')') + line(L('torque per driven wheel', 'couple par roue motrice'), f(tw, 2) + ' N·m') + line(L('torque per motor (gear efficiency 0.85)', 'couple par moteur (rendement 0,85)'), f(tm, 3) + ' N·m') + line(L('motor speed at v', 'vitesse du moteur à v'), f(rpm, 0) + ' rpm') + '</ul>' +
        '<ul>' + line(L('mechanical power at cruise', 'puissance mécanique en croisière'), f(Pm, 1) + ' W') + line(L('electrical power (efficiency 0.7 + electronics)', 'puissance électrique (rendement 0,7 + électronique)'), f(Pe, 1) + ' W') + line(L('runtime (80 % of the battery)', 'autonomie (80 % de la batterie)'), f(hrs, 2) + ' h') + '</ul>' +
        '<ul>' + line(L('traction available / needed', 'adhérence disponible / nécessaire'), f(Fmax, 0) + ' N / ' + f(F, 0) + ' N', Fmax >= F) + line(L('braking tip-over limit (g b / h)', 'limite de basculement au freinage (g b / h)'), f(aTip, 2) + ' m/s²', aTip > Math.max(S.a, S.mu * g)) + line(L('turning tip-over limit (g T / 2h)', 'limite de basculement en virage (g T / 2h)'), f(aLat, 2) + ' m/s²', aLat > S.mu * g) + line(L('sideways tip-over slope', 'pente de basculement latéral'), f(slTip, 1) + '°', true) + '</ul>';
    }
    calc();
  }

  // ------------------------------------------------------------------ exercises: numeric answers, multiple choice, labs, challenges, scores
  var KEY = 'ra-wmr-ex';
  function loadS() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function saveS(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* private mode: ignore */ } }
  var ST = loadS();
  function setS(id, v) { ST[id] = v; saveS(ST); refresh(); }
  window.RA_chal = function (id) { if (ST['chal:' + id] !== 1) setS('chal:' + id, 1); };
  function refresh() {
    [].forEach.call(document.querySelectorAll('.exs'), function (sec) {
      var all = sec.querySelectorAll('.ex'), ok = 0, tried = 0;
      [].forEach.call(all, function (e) { var v = ST[e.dataset.id]; if (v === 1) ok++; if (v !== undefined) tried++; });
      var sc = sec.querySelector('.exscore'); if (sc) sc.innerHTML = L('Score: ', 'Score : ') + '<b>' + ok + ' / ' + all.length + '</b>' + (sec.classList.contains('exam') ? ' (' + tried + ' ' + L('answered', 'répondues') + ')' : '');
    });
    [].forEach.call(document.querySelectorAll('[data-chal]'), function (li) { li.classList.toggle('good', ST['chal:' + li.dataset.chal] === 1); });
    var sum = document.getElementById('examSum'); if (!sum) return;
    var items = document.querySelectorAll('.ex[data-exam]'), ok = 0, tried = 0, i;
    for (i = 0; i < items.length; i++) { var v = ST[items[i].dataset.id]; if (v === 1) ok++; if (v !== undefined) tried++; }
    var chals = (sum.dataset.chals || '').split(',').filter(Boolean), chOk = chals.filter(function (c) { return ST['chal:' + c] === 1; }).length;
    var labs = (sum.dataset.labs || '').split(',').filter(Boolean), lbOk = labs.filter(function (c) { return ST['lab:' + c] === 1; }).length;
    var need = +sum.dataset.pass || 70, pct = items.length ? Math.round(100 * ok / items.length) : 0, finished = tried === items.length, passed = finished && pct >= need;
    var row = function (name, val, good) { return '<li class="' + (good ? 'good' : '') + '"><span>' + (good ? '✓' : '○') + '</span> ' + name + ': <b>' + val + '</b></li>'; };
    sum.innerHTML = '<ul>' +
      row(L('Written exam', 'Examen écrit'), ok + ' / ' + items.length + ' (' + pct + ' %) · ' + tried + '/' + items.length + ' ' + L('answered', 'répondues') + ' · ' + L('pass mark', 'seuil') + ' ' + need + ' %', passed) +
      row(L('In-browser practical challenges', 'Défis pratiques dans le navigateur'), chOk + ' / ' + chals.length, chOk === chals.length && chals.length > 0) +
      row(L('Labs done (software and hardware)', 'TP faits (logiciel et matériel)'), lbOk + ' / ' + labs.length + ' (' + L('at least ', 'au moins ') + (+sum.dataset.labmin || labs.length) + ')', lbOk >= (+sum.dataset.labmin || labs.length)) + '</ul>' +
      '<p class="verdict">' + (passed && chOk === chals.length && lbOk >= (+sum.dataset.labmin || labs.length) ? '🏆 ' + L('Course complete: you passed the exam, the challenges and the labs. You can now model, size, control and test a wheeled mobile robot at professional level.', 'Cours terminé : vous avez réussi l\'examen, les défis et les TP. Vous savez maintenant modéliser, dimensionner, commander et tester un robot mobile à roues au niveau professionnel.') : L('Complete the three parts to finish the course.', 'Terminez les trois parties pour finir le cours.')) + '</p>' +
      '<p><button type="button" class="exreset">' + L('Reset the exam and start again', 'Réinitialiser l\'examen et recommencer') + '</button></p>';
    var rb = sum.querySelector('.exreset'); if (rb) rb.onclick = function () { [].forEach.call(document.querySelectorAll('.ex[data-exam]'), function (e) { delete ST[e.dataset.id]; }); saveS(ST); location.reload(); };
  }
  function fb(ex, ok, locked) {
    var p = ex.querySelector('.fb'); p.className = 'fb ' + (ok ? 'ok' : 'bad');
    p.textContent = locked ? (ok ? '✓ ' : '✗ ') + L('Answer recorded.', 'Réponse enregistrée.') : ok ? '✓ ' + L('Correct!', 'Correct !') : '✗ ' + L('Not quite. Check the units, the signs and the rounding, then try again.', 'Pas tout à fait. Vérifiez les unités, les signes et l\'arrondi, puis réessayez.');
  }
  function initExercises() {
    [].forEach.call(document.querySelectorAll('.numin'), function (box) {
      if (box.firstChild) return;
      var ex = box.closest('.ex'), id = ex.dataset.id, exam = ex.hasAttribute('data-exam'), ans = +box.dataset.ans, tol = +box.dataset.tol;
      var inp = el('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': L('Your answer', 'Votre réponse') }), unit = el('span', { 'class': 'unit' }, box.dataset.unit || ''), btn = el('button', { type: 'button' }, L('Check', 'Vérifier'));
      box.append(inp, unit, btn);
      var lock = function () { inp.disabled = true; btn.disabled = true; };
      var go = function () {
        var x = parseFloat(inp.value.replace(',', '.').replace('−', '-')); if (!isFinite(x)) { var p = ex.querySelector('.fb'); p.className = 'fb bad'; p.textContent = L('Type a number first.', 'Tapez d\'abord un nombre.'); return; }
        var ok = Math.abs(x - ans) <= tol; fb(ex, ok, exam); if (exam) lock(); if (ok || ST[id] === undefined || exam) setS(id, ok ? 1 : 0);
      };
      btn.addEventListener('click', go); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      if (ST[id] !== undefined && (exam || ST[id] === 1)) { fb(ex, ST[id] === 1, exam); if (exam) lock(); }
    });
    [].forEach.call(document.querySelectorAll('.ex .opts'), function (ol) {
      var ex = ol.closest('.ex'), id = ex.dataset.id, exam = ex.hasAttribute('data-exam'), lis = ol.querySelectorAll('li'), locked = false;
      var lock = function () { locked = true; ol.classList.add('locked'); };
      [].forEach.call(lis, function (li) {
        li.setAttribute('tabindex', '0'); li.setAttribute('role', 'button');
        var pick = function () {
          if (locked) return; var ok = li.hasAttribute('data-ok');
          [].forEach.call(lis, function (o) { o.classList.remove('wrong'); }); li.classList.add(ok ? 'right' : 'wrong');
          fb(ex, ok, exam); if (exam) lock(); else if (ok) lock(); if (ok || ST[id] === undefined || exam) setS(id, ok ? 1 : 0);
        };
        li.addEventListener('click', pick); li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      if (ST[id] !== undefined && (exam || ST[id] === 1)) { fb(ex, ST[id] === 1, exam); lock(); if (ST[id] === 1) [].forEach.call(lis, function (li) { if (li.hasAttribute('data-ok')) li.classList.add('right'); }); }
    });
    [].forEach.call(document.querySelectorAll('input[data-lab]'), function (cb) {
      cb.checked = ST['lab:' + cb.dataset.lab] === 1;
      cb.addEventListener('change', function () { setS('lab:' + cb.dataset.lab, cb.checked ? 1 : 0); });
    });
    refresh();
  }

  var W = window.RA_WIDGETS = window.RA_WIDGETS || {};
  W['wmr-diff'] = diff; W['wmr-car'] = car; W['wmr-omni'] = omni; W['wmr-icr'] = icrWidget; W['wmr-goto'] = goto_; W['wmr-mecanum'] = mecanum; W['wmr-pursuit'] = pursuit; W['wmr-dubins'] = dubinsWidget; W['wmr-drift'] = drift; W['wmr-ekf'] = ekfWidget; W['wmr-size'] = sizing;
  function init() { [].forEach.call(document.querySelectorAll('.widget[data-widget^="wmr-"]'), function (w) { var k = w.dataset.widget; if (W[k] && !w.firstChild) W[k](w); }); initExercises(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
