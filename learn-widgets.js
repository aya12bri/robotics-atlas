// learn-widgets.js — two small interactive widgets of the maths course: the two-joint arm and the trapezoid law.
(function () {
  'use strict';
  var FR = (window.RA && RA.lang) === 'fr';
  var L = function (en, fr) { return FR ? fr : en; };
  var NS = 'http://www.w3.org/2000/svg';
  var f = function (v, d) { return v.toFixed(d === undefined ? 3 : d).replace('.', FR ? ',' : '.'); };
  var rad = Math.PI / 180, deg = 180 / Math.PI;
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html !== undefined) e.innerHTML = html; return e; }
  function sv(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); return e; }
  function slider(label, min, max, step, val, unit, on) {
    var id = 'w' + Math.random().toString(36).slice(2, 8), row = el('div', { 'class': 'wrow' });
    var lab = el('label', { 'for': id }, label), inp = el('input', { type: 'range', id: id, min: min, max: max, step: step, value: val }), out = el('output', {}, '');
    var show = function () { out.textContent = f(+inp.value, step < 1 ? 2 : 0) + unit; };
    inp.addEventListener('input', function () { show(); on(+inp.value); }); show();
    row.append(lab, inp, out); row.set = function (v) { inp.value = v; show(); }; return row;
  }

  // ------------------------------------------------------------------ two-joint arm
  function arm2(root) {
    var S = { L1: 0.5, L2: 0.3, t1: 30, t2: 60, asp: 1 };
    root.append(el('h4', {}, L('Try it: the two-joint arm', 'Essayez : le bras à deux articulations')));
    root.append(el('p', { 'class': 'wnote' }, L('Move the sliders (direct model), or click or drag in the drawing to place the tool (inverse model).', 'Bougez les curseurs (modèle direct), ou cliquez ou glissez dans le dessin pour placer l\'outil (modèle inverse).')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    var s1 = slider('θ₁', -180, 180, 1, S.t1, '°', function (v) { S.t1 = v; draw(); });
    var s2 = slider('θ₂', -170, 170, 1, S.t2, '°', function (v) { S.t2 = v; draw(); });
    var sl1 = slider('L₁', 0.2, 0.8, 0.05, S.L1, ' m', function (v) { S.L1 = v; draw(); });
    var sl2 = slider('L₂', 0.2, 0.8, 0.05, S.L2, ' m', function (v) { S.L2 = v; draw(); });
    var asp = el('div', { 'class': 'wseg' }, '<button type="button" data-a="1" class="on">' + L('Elbow θ₂ > 0', 'Coude θ₂ > 0') + '</button><button type="button" data-a="-1">' + L('Elbow θ₂ < 0', 'Coude θ₂ < 0') + '</button>');
    ctl.append(s1, s2, sl1, sl2, asp, out);
    var svg = sv('svg', { viewBox: '0 0 480 270', 'class': 'wsvg', role: 'img', 'aria-label': L('Two-joint arm', 'Bras à deux articulations') });
    box.append(svg, ctl); root.append(box);
    var OX = 240, OY = 140, K = 150;
    function pt(x, y) { return [OX + K * x, OY - K * y]; }
    function draw() {
      var a = S.t1 * rad, b = (S.t1 + S.t2) * rad, jx = S.L1 * Math.cos(a), jy = S.L1 * Math.sin(a), ex = jx + S.L2 * Math.cos(b), ey = jy + S.L2 * Math.sin(b);
      var R = S.L1 + S.L2, r = Math.abs(S.L1 - S.L2), o = pt(0, 0), j = pt(jx, jy), e = pt(ex, ey);
      svg.innerHTML = '';
      svg.append(sv('circle', { cx: o[0], cy: o[1], r: K * R, 'class': 'ring' }), sv('circle', { cx: o[0], cy: o[1], r: K * r, 'class': 'hole' }));
      svg.append(sv('line', { x1: 20, y1: OY, x2: 460, y2: OY, 'class': 'ax' }), sv('line', { x1: OX, y1: 10, x2: OX, y2: 262, 'class': 'ax' }));
      // the other elbow solution (dashed)
      var d = Math.hypot(ex, ey), c2 = (d * d - S.L1 * S.L1 - S.L2 * S.L2) / (2 * S.L1 * S.L2);
      if (Math.abs(c2) <= 1) { var t2o = -Math.acos(c2) * Math.sign(S.t2 || 1) , t1o = Math.atan2(ey, ex) - Math.atan2(S.L2 * Math.sin(t2o), S.L1 + S.L2 * Math.cos(t2o)); var jo = pt(S.L1 * Math.cos(t1o), S.L1 * Math.sin(t1o)); svg.append(sv('polyline', { points: o.join(',') + ' ' + jo.join(',') + ' ' + e.join(','), 'class': 'alt' })); }
      svg.append(sv('polyline', { points: o.join(',') + ' ' + j.join(','), 'class': 'link1' }), sv('polyline', { points: j.join(',') + ' ' + e.join(','), 'class': 'link2' }));
      [o, j].forEach(function (p) { svg.append(sv('circle', { cx: p[0], cy: p[1], r: 6, 'class': 'jt' })); });
      svg.append(sv('circle', { cx: e[0], cy: e[1], r: 7, 'class': 'pt' }));
      var t = sv('text', { x: e[0] + 11, y: e[1] - 8, 'class': 'c-pt' }); t.textContent = 'E (' + f(ex, 2) + ' ; ' + f(ey, 2) + ')'; svg.append(t);
      var sols = '';
      if (Math.abs(c2) <= 1) {
        [1, -1].forEach(function (sg) { var q2 = sg * Math.acos(c2), q1 = Math.atan2(ey, ex) - Math.atan2(S.L2 * Math.sin(q2), S.L1 + S.L2 * Math.cos(q2)); sols += '<li>' + (sg > 0 ? L('elbow θ₂ > 0', 'coude θ₂ > 0') : L('elbow θ₂ < 0', 'coude θ₂ < 0')) + ' : θ₁ = ' + f(q1 * deg, 1) + '°, θ₂ = ' + f(q2 * deg, 1) + '°</li>'; });
      } else sols = '<li>' + L('out of reach', 'hors d\'atteinte') + '</li>';
      out.innerHTML = '<b>' + L('Direct model', 'Modèle direct') + '</b><br>x = L₁cosθ₁ + L₂cos(θ₁+θ₂) = ' + f(ex) + ' m<br>y = L₁sinθ₁ + L₂sin(θ₁+θ₂) = ' + f(ey) + ' m<br><b>' + L('Inverse model for this point', 'Modèle inverse pour ce point') + '</b><ul>' + sols + '</ul>' + L('θ₂ = 0 or 180°: singularity (stretched or folded arm).', 'θ₂ = 0 ou 180° : singularité (bras tendu ou replié).');
    }
    function target(ev) {
      var r = svg.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width * 480 - OX) / K, y = (OY - (ev.clientY - r.top) / r.height * 270) / K;
      var d = Math.hypot(x, y), R = S.L1 + S.L2, rr = Math.abs(S.L1 - S.L2); if (d > R) { x *= R / d; y *= R / d; d = R; } if (d < rr + 1e-3) { x *= (rr + 1e-3) / (d || 1e-3); y *= (rr + 1e-3) / (d || 1e-3); d = rr + 1e-3; }
      var c2 = Math.max(-1, Math.min(1, (d * d - S.L1 * S.L1 - S.L2 * S.L2) / (2 * S.L1 * S.L2))), q2 = S.asp * Math.acos(c2), q1 = Math.atan2(y, x) - Math.atan2(S.L2 * Math.sin(q2), S.L1 + S.L2 * Math.cos(q2));
      S.t1 = Math.round(q1 * deg); S.t2 = Math.round(q2 * deg); if (S.t1 > 180) S.t1 -= 360; if (S.t1 < -180) S.t1 += 360; s1.set(S.t1); s2.set(S.t2); draw();
    }
    var down = false; svg.addEventListener('pointerdown', function (e) { down = true; svg.setPointerCapture(e.pointerId); target(e); }); svg.addEventListener('pointermove', function (e) { if (down) target(e); }); svg.addEventListener('pointerup', function () { down = false; });
    asp.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.asp = +b.dataset.a; [].forEach.call(asp.children, function (x) { x.classList.toggle('on', x === b); }); var a = S.t2 < 0 ? -1 : 1; if (a !== S.asp) { S.t2 = -S.t2; s2.set(S.t2); } draw(); });
    draw();
  }

  // ------------------------------------------------------------------ trapezoid law
  function trap(root) {
    var S = { X: 1, V: 0.5, a: 1 };
    root.append(el('h4', {}, L('Try it: the trapezoid law', 'Essayez : la loi en trapèze')));
    root.append(el('p', { 'class': 'wnote' }, L('Change the distance, the maximum speed and the acceleration: the robot chooses a trapezoid or a triangle.', 'Changez la distance, la vitesse maximale et l\'accélération : le robot choisit un trapèze ou un triangle.')));
    var box = el('div', { 'class': 'wbox' }), ctl = el('div', { 'class': 'wctl' }), out = el('div', { 'class': 'wout' });
    ctl.append(slider('X', 0.05, 3, 0.05, S.X, ' m', function (v) { S.X = v; draw(); }), slider('Vmax', 0.1, 2, 0.05, S.V, ' m/s', function (v) { S.V = v; draw(); }), slider('a', 0.1, 4, 0.05, S.a, ' m/s²', function (v) { S.a = v; draw(); }), out);
    var svg = sv('svg', { viewBox: '0 0 380 300', 'class': 'wsvg', role: 'img', 'aria-label': L('Speed law', 'Loi de vitesse') });
    box.append(svg, ctl); root.append(box);
    function draw() {
      var X = S.X, V = S.V, a = S.a, T1 = V / a, T2, T3, Vr = V, tri = !(X > V * V / a);
      if (!tri) { T2 = X / V - T1; T3 = T1; } else { T1 = Math.sqrt(X / a); T2 = 0; T3 = T1; Vr = Math.sqrt(X * a); }
      var Tt = T1 + T2 + T3, n = 120, pts = [], pos = 0, prev = null;
      for (var i = 0; i <= n; i++) { var t = Tt * i / n, ac, v; if (t <= T1) { ac = a; v = a * t; } else if (t <= T1 + T2) { ac = 0; v = Vr; } else { ac = -a; v = Math.max(0, Vr - a * (t - T1 - T2)); } if (prev) pos += (t - prev[0]) * (v + prev[2]) / 2; prev = [t, ac, v]; pts.push([t, ac, v, pos]); }
      svg.innerHTML = '';
      var panels = [[14, 1, 'c-acc', -1.3 * a, 1.3 * a, 'a'], [104, 2, 'c-vel', 0, 1.15 * Math.max(V, Vr), 'V'], [194, 3, 'c-pos', 0, 1.05 * X, 'x']];
      panels.forEach(function (p) { svg.append(sv('rect', { x: 50, y: p[0], width: 300, height: 70, 'class': 'pn' })); var d = pts.map(function (r) { return (50 + 300 * r[0] / Tt).toFixed(1) + ',' + (p[0] + 70 - 70 * (r[p[1]] - p[3]) / (p[4] - p[3])).toFixed(1); }).join(' '); svg.append(sv('polyline', { points: d, 'class': p[2], fill: 'none' })); var t = sv('text', { x: 44, y: p[0] + 39, 'text-anchor': 'end' }); t.textContent = p[5]; svg.append(t); });
      [T1, T1 + T2].forEach(function (tt) { var xx = 50 + 300 * tt / Tt; svg.append(sv('line', { x1: xx, y1: 14, x2: xx, y2: 264, 'class': 'dash' })); });
      [['T₁', T1 / 2], ['T₂', T1 + T2 / 2], ['T₃', T1 + T2 + T3 / 2]].forEach(function (l) { var t = sv('text', { x: 50 + 300 * l[1] / Tt, y: 284, 'text-anchor': 'middle' }); t.textContent = l[0]; svg.append(t); });
      out.innerHTML = '<b>' + (tri ? L('Triangle (bang-bang): Vmax is never reached', 'Triangle (bang-bang) : Vmax n\'est jamais atteinte') : L('Trapezoid: there is a cruise phase', 'Trapèze : il y a un palier')) + '</b><br>V²max/a = ' + f(V * V / a, 2) + (tri ? ' ≥ ' : ' < ') + 'X = ' + f(X, 2) + '<br>T₁ = ' + f(T1) + ' s<br>T₂ = ' + f(T2) + ' s<br>T₃ = ' + f(T3) + ' s<br>T = ' + f(Tt) + ' s' + (tri ? '<br>V* = ' + f(Vr) + ' m/s' : '');
    }
    draw();
  }

  function init() { [].forEach.call(document.querySelectorAll('.widget[data-widget]'), function (w) { var k = w.dataset.widget; if (k === 'arm2') arm2(w); else if (k === 'trap') trap(w); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
