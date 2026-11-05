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
      out.innerHTML = '<ul><li>v = (V<sub>R</sub> + V<sub>L</sub>) / 2 = <b>' + f(v) + '</b> m/s</li><li>ω = (V<sub>R</sub> − V<sub>L</sub>) / L = <b>' + f(w) + '</b> rad/s</li><li>R = v / ω = <b>' + f(R) + '</b> m</li></ul>' +
        (Math.abs(VR - VL) < 1e-9 ? L('Equal speeds: straight line, R = ∞.', 'Vitesses égales : ligne droite, R = ∞.') : Math.abs(VR + VL) < 1e-9 ? L('Opposite speeds: the robot spins on the spot (R = 0).', 'Vitesses opposées : le robot tourne sur place (R = 0).') : (Math.abs(VL) < 1e-9 || Math.abs(VR) < 1e-9) ? L('One wheel stopped: the robot pivots around it (R = L/2).', 'Une roue arrêtée : le robot pivote autour d\'elle (R = L/2).') : (w > 0 ? L('The right wheel is faster: the robot turns left.', 'La roue droite est plus rapide : le robot tourne à gauche.') : L('The left wheel is faster: the robot turns right.', 'La roue gauche est plus rapide : le robot tourne à droite.')));
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
      out.innerHTML = cond + msg + (eight ? '' : '<br>' + (last.ok ? L('Arrived after ', 'Arrivé après ') + '<b>' + f(last.t, 1) + '</b> s ' + L('with final heading ', 'avec le cap final ') + '<b>' + f(wrap(last.th) * deg, 0) + '°</b>.' : L('The robot did not reach the goal within 40 s.', 'Le robot n\'a pas atteint le but en 40 s.')));
    }
    run();
  }

  var W = window.RA_WIDGETS = window.RA_WIDGETS || {};
  W['wmr-diff'] = diff; W['wmr-car'] = car; W['wmr-omni'] = omni; W['wmr-icr'] = icrWidget; W['wmr-goto'] = goto_;
  function init() { [].forEach.call(document.querySelectorAll('.widget[data-widget^="wmr-"]'), function (w) { var k = w.dataset.widget; if (W[k] && !w.firstChild) W[k](w); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
