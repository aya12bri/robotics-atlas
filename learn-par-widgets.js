// learn-par-widgets.js — the labs of the course "Workspaces, motion modes and parallel robots" (learn-parallel.html). Uses labkit.js (RAK) and lab3d.js (RA3D).
//   par-spaces    joint space and operational space of a 2-link arm side by side: straight lines, joint limits, aspects (2D)
//   par-moves3d   a SCARA draws a triangle in three motion modes: linear, joint, linear with blending (3D)
//   par-redund3d  a redundant planar 3R arm: the same point, infinitely many postures (3D)
//   par-grubler   the mobility formula of Grübler on classic mechanisms (2D)
//   par-fivebar3d a five-bar parallel robot (DexTAR type): IGM per chain, DGM by Newton, the two kinds of singularities (3D)
//   par-3rpr      a planar 3-RPR platform: leg lengths, Jacobian and singularity (2D)
(function () {
  'use strict';
  var K = window.RAK; if (!K) return;
  var L = K.L, f = K.f, el = K.el, W = K.W, D = Math.PI / 180, TAU = Math.PI * 2;
  var wrap = function (a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };

  // ================================================================ par-spaces
  W['par-spaces'] = function (w) {
    var limits = w.dataset.mode === 'limits';
    var F = K.frame(w, limits ? L('Lab: from joint limits to the real workspace', 'Labo : des limites articulaires à l\'espace de travail réel') : L('Lab: joint space and operational space', 'Labo : espace articulaire et espace opérationnel'),
      limits ? L('Arms of equal length, limits of an OMRON Cobra SCARA: −105° ≤ θ₁ ≤ 105°, −157.5° ≤ θ₂ ≤ 157.5°. The four borders of the joint rectangle (left) have images in the plane (right): together they draw the boundary of the workspace. Blue: elbow on one side, orange: on the other (the two aspects).', 'Bras de même longueur, limites d\'un SCARA OMRON Cobra : −105° ≤ θ₁ ≤ 105°, −157,5° ≤ θ₂ ≤ 157,5°. Les quatre bords du rectangle articulaire (à gauche) ont des images dans le plan (à droite) : ensemble, elles dessinent la frontière de l\'espace de travail. Bleu : coude d\'un côté, orange : de l\'autre (les deux aspects).')
        : L('Drag the point in either picture. The left picture is the joint space (θ₁, θ₂), the right one the real plane (x, y). Draw a straight path in one space and look at its image in the other: a straight line in one is a curve in the other.', 'Glissez le point dans l\'une ou l\'autre image. L\'image de gauche est l\'espace articulaire (θ₁, θ₂), celle de droite le plan réel (x, y). Tracez un chemin droit dans un espace et regardez son image dans l\'autre : une droite dans l\'un est une courbe dans l\'autre.'));
    var row = el('div', { 'class': 'tw-two' }); F.view.appendChild(row);
    var cj = K.canvas(row, 1, L('Joint space', 'Espace articulaire')), co = K.canvas(row, 1, L('Operational space', 'Espace opérationnel'));
    var mode = K.seg(F.ctl, L('Path from A to B', 'Chemin de A à B'), [['joint', L('straight in joint space', 'droit dans l\'espace articulaire')], ['task', L('straight in the plane', 'droit dans le plan')]], 'joint', draw);
    var showB = K.check(F.ctl, L('Show the images of the joint limits', 'Montrer les images des limites articulaires'), limits, draw);
    var out = K.readouts(F.side);
    var L1 = 1, L2 = 1, Q1 = [-105 * D, 105 * D], Q2 = [-157.5 * D, 157.5 * D];
    var A = [-60 * D, 100 * D], B = [70 * D, 40 * D], drag = null;
    var fk = function (q) { return [L1 * Math.cos(q[0]) + L2 * Math.cos(q[0] + q[1]), L1 * Math.sin(q[0]) + L2 * Math.sin(q[0] + q[1])]; };
    var ik = function (p, sgn) { var r2 = p[0] * p[0] + p[1] * p[1], c = (r2 - 2) / 2; if (c < -1 || c > 1) return null; var q2 = sgn * Math.acos(c), q1 = Math.atan2(p[1], p[0]) - Math.atan2(Math.sin(q2), 1 + Math.cos(q2)); return [wrap(q1), q2]; };
    var inLim = function (q) { return q && q[0] >= Q1[0] && q[0] <= Q1[1] && q[1] >= Q2[0] && q[1] <= Q2[1]; };
    function geo(cv) { var s = Math.min(cv.w, cv.h); return { s: s, cx: cv.w / 2, cy: cv.h / 2 }; }
    var J = function (q) { var g = geo(cj), k = (g.s - 40) / TAU; return [g.cx + q[0] * k, g.cy - q[1] * k]; }, Ji = function (p) { var g = geo(cj), k = (g.s - 40) / TAU; return [(p[0] - g.cx) / k, -(p[1] - g.cy) / k]; };
    var O = function (p) { var g = geo(co), k = (g.s - 30) / 4.4; return [g.cx + p[0] * k, g.cy - p[1] * k]; }, Oi = function (p) { var g = geo(co), k = (g.s - 30) / 4.4; return [(p[0] - g.cx) / k, -(p[1] - g.cy) / k]; };
    function path() {
      var pts = [];
      if (mode.get() === 'joint') { for (var i = 0; i <= 60; i++) { var t = i / 60; pts.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]); } return pts; }
      var pa = fk(A), pb = fk(B), sg = A[1] >= 0 ? 1 : -1;
      for (i = 0; i <= 60; i++) { t = i / 60; var q = ik([pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t], sg); pts.push(q || [NaN, NaN]); }
      return pts;
    }
    function draw() {
      var C = K.C;
      [cj, co].forEach(function (c) { K.clear(c); });
      var x = cj.x, a = J([Q1[0], Q2[1]]), b = J([Q1[1], Q2[0]]);
      x.strokeStyle = C.grid; x.lineWidth = 1; for (var g = -180; g <= 180; g += 45) { var p1 = J([g * D, -Math.PI]), p2 = J([g * D, Math.PI]); x.beginPath(); x.moveTo(p1[0], p1[1]); x.lineTo(p2[0], p2[1]); x.stroke(); p1 = J([-Math.PI, g * D]); p2 = J([Math.PI, g * D]); x.beginPath(); x.moveTo(p1[0], p1[1]); x.lineTo(p2[0], p2[1]); x.stroke(); }
      x.fillStyle = C.b; x.globalAlpha = 0.12; x.fillRect(a[0], a[1], b[0] - a[0], (J([0, 0])[1] - a[1])); x.fillStyle = C.o; x.fillRect(a[0], J([0, 0])[1], b[0] - a[0], b[1] - J([0, 0])[1]); x.globalAlpha = 1;
      x.strokeStyle = C.ink; x.lineWidth = 2; x.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      K.text(cj, 'θ₁', cj.w - 18, J([0, 0])[1] - 6, C.axis, 12); K.text(cj, 'θ₂', J([0, 0])[0] + 6, 16, C.axis, 12);
      K.text(cj, L('joint space', 'espace articulaire'), 8, cj.h - 8, C.axis, 11);
      // the operational space: reachable disc, images of the borders
      var y = co.x, oc = O([0, 0]), R = O([2, 0])[0] - oc[0];
      y.strokeStyle = C.grid; y.beginPath(); y.arc(oc[0], oc[1], R, 0, 7); y.stroke();
      if (showB.checked) {
        var borders = [[[Q1[0], Q2[0]], [Q1[1], Q2[0]]], [[Q1[1], Q2[0]], [Q1[1], Q2[1]]], [[Q1[1], Q2[1]], [Q1[0], Q2[1]]], [[Q1[0], Q2[1]], [Q1[0], Q2[0]]], [[Q1[0], 0], [Q1[1], 0]]];
        borders.forEach(function (bd, k) {
          y.strokeStyle = k === 4 ? C.r : C.g; y.lineWidth = k === 4 ? 1.5 : 2.2; y.setLineDash(k === 4 ? [5, 4] : []); y.beginPath(); x.strokeStyle = y.strokeStyle; x.lineWidth = 3;
          for (var i = 0; i <= 80; i++) { var t = i / 80, q = [bd[0][0] + (bd[1][0] - bd[0][0]) * t, bd[0][1] + (bd[1][1] - bd[0][1]) * t], p = O(fk(q)); if (i) y.lineTo(p[0], p[1]); else y.moveTo(p[0], p[1]); }
          y.stroke(); y.setLineDash([]);
          if (k < 4) { var j0 = J(bd[0]), j1 = J(bd[1]); x.beginPath(); x.moveTo(j0[0], j0[1]); x.lineTo(j1[0], j1[1]); x.stroke(); }
        });
        K.text(co, L('red dashed: θ₂ = 0, the boundary between the two aspects', 'tirets rouges : θ₂ = 0, la frontière entre les deux aspects'), 8, co.h - 8, C.r, 10);
      } else K.text(co, L('operational space (the plane)', 'espace opérationnel (le plan)'), 8, co.h - 8, C.axis, 11);
      // the path in both spaces
      var P = path(), bad = 0;
      [[x, J, function (q) { return q; }], [y, O, fk]].forEach(function (s) {
        s[0].strokeStyle = C.y; s[0].lineWidth = 2.5; s[0].beginPath(); var on = false;
        P.forEach(function (q) { if (!isFinite(q[0])) { on = false; return; } var p = s[1](s[2](q)); if (on) s[0].lineTo(p[0], p[1]); else s[0].moveTo(p[0], p[1]); on = true; }); s[0].stroke();
      });
      P.forEach(function (q) { if (!isFinite(q[0]) || !inLim(q)) bad++; });
      // the arm at A and B in the plane, the points in both spaces
      [[A, C.b, 'A'], [B, C.o, 'B']].forEach(function (s) {
        var q = s[0], e = fk(q), el1 = [L1 * Math.cos(q[0]), L1 * Math.sin(q[0])], p0 = O([0, 0]), p1 = O(el1), p2 = O(e);
        y.strokeStyle = s[1]; y.lineWidth = 5; y.globalAlpha = 0.65; y.beginPath(); y.moveTo(p0[0], p0[1]); y.lineTo(p1[0], p1[1]); y.lineTo(p2[0], p2[1]); y.stroke(); y.globalAlpha = 1;
        y.fillStyle = s[1]; y.beginPath(); y.arc(p2[0], p2[1], 7, 0, 7); y.fill(); K.text(co, s[2], p2[0] + 9, p2[1] - 8, s[1], 13, 'left', true);
        var j = J(q); x.fillStyle = s[1]; x.beginPath(); x.arc(j[0], j[1], 7, 0, 7); x.fill(); K.text(cj, s[2], j[0] + 9, j[1] - 8, s[1], 13, 'left', true);
      });
      var pa = fk(A), pb = fk(B);
      out([[L('A: θ₁, θ₂', 'A : θ₁, θ₂'), f(A[0] / D, 0) + '°, ' + f(A[1] / D, 0) + '°'], [L('A: x, y', 'A : x, y'), f(pa[0], 2) + ' ; ' + f(pa[1], 2)], [L('B: θ₁, θ₂', 'B : θ₁, θ₂'), f(B[0] / D, 0) + '°, ' + f(B[1] / D, 0) + '°'],
        [L('Path inside the joint limits?', 'Chemin dans les limites articulaires ?'), bad ? L('no: ', 'non : ') + bad + L(' points outside (or unreachable)', ' points dehors (ou inaccessibles)') : L('yes', 'oui'), bad ? 'bad' : 'ok'], [L('Aspect of A, of B', 'Aspect de A, de B'), (A[1] >= 0 ? '+' : '−') + ' / ' + (B[1] >= 0 ? '+' : '−') + (A[1] * B[1] < 0 ? L(' (changing aspect crosses θ₂ = 0, arm stretched)', ' (changer d\'aspect passe par θ₂ = 0, bras tendu)') : '')]]);
    }
    function pick(c, e) { var r = c.c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    [[cj, function (p) { return Ji(p); }], [co, function (p) { var q = ik(Oi(p), drag && drag.q[1] >= 0 ? 1 : -1); return q; }]].forEach(function (s, idx) {
      s[0].c.addEventListener('pointerdown', function (e) { var p = pick(s[0], e), best = null, bd = 400; [A, B].forEach(function (q) { var m = idx ? O(fk(q)) : J(q), d = (m[0] - p[0]) * (m[0] - p[0]) + (m[1] - p[1]) * (m[1] - p[1]); if (d < bd) { bd = d; best = q; } }); if (best) { drag = { q: best }; s[0].c.setPointerCapture(e.pointerId); } });
      s[0].c.addEventListener('pointermove', function (e) { if (!drag) return; var q = s[1](pick(s[0], e)); if (q && isFinite(q[0])) { drag.q[0] = Math.max(-Math.PI, Math.min(Math.PI, q[0])); drag.q[1] = Math.max(-Math.PI, Math.min(Math.PI, q[1])); draw(); } });
      s[0].c.addEventListener('pointerup', function () { drag = null; });
    });
    draw(); K.redraws.push(function (rs) { if (rs) { cj.fit(); co.fit(); } draw(); });
  };

  // ================================================================ par-moves3d
  W['par-moves3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: three ways to draw a triangle', 'Labo 3D : trois façons de dessiner un triangle'),
      L('A SCARA must go through the three corners of a triangle with its tool. <b>Linear</b>: straight sides, the tool stops at each corner. <b>Joint</b>: point to point, the joints move together, the sides are curved. <b>Linear with blending</b>: straight sides, corners rounded at constant speed, as for gluing.', 'Un SCARA doit passer par les trois sommets d\'un triangle avec son outil. <b>Linéaire</b> : côtés droits, l\'outil s\'arrête à chaque sommet. <b>Articulaire</b> : point à point, les articulations bougent ensemble, les côtés sont courbes. <b>Linéaire à vitesse constante</b> : côtés droits, sommets arrondis à vitesse constante, comme pour encoller.'));
    var mode = K.seg(F.ctl, L('Motion mode', 'Mode de déplacement'), [['lin', L('linear', 'linéaire')], ['joint', L('joint', 'articulaire')], ['blend', L('linear with blending', 'linéaire à vitesse constante')]], 'lin', reset);
    var rb = K.slider(F.ctl, { label: L('Blending radius (cm)', 'Rayon d\'arrondi (cm)'), min: 1, max: 10, value: 5, unit: ' cm', on: reset });
    var cv = K.canvas(F.view, 0.26, L('Tool speed', 'Vitesse de l\'outil'));
    var out = K.readouts(F.side);
    var L1 = 0.35, L2 = 0.3, T = [[0.45, -0.15], [0.3, 0.3], [0.15, -0.1]], st = null;
    var ik = function (p) { var r2 = p[0] * p[0] + p[1] * p[1], c = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2); c = Math.max(-1, Math.min(1, c)); var q2 = -Math.acos(c); return [Math.atan2(p[1], p[0]) - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2)), q2]; };
    var fk = function (q) { return [L1 * Math.cos(q[0]) + L2 * Math.cos(q[0] + q[1]), L1 * Math.sin(q[0]) + L2 * Math.sin(q[0] + q[1])]; };
    function plan() {                                                   // a list of tool points sampled every 10 ms
      var m = mode.get(), pts = [], V = 0.25, dt = 0.01, i, k, n;
      var seg = function (a, b) { var d = Math.hypot(b[0] - a[0], b[1] - a[1]), Tt = Math.max(0.3, d / V * 1.5); n = Math.round(Tt / dt); for (k = 1; k <= n; k++) { var s = k / n, sm = s * s * (3 - 2 * s); pts.push([a[0] + (b[0] - a[0]) * sm, a[1] + (b[1] - a[1]) * sm]); } };
      if (m === 'lin') { pts.push(T[0]); for (i = 0; i < 3; i++) seg(T[i], T[(i + 1) % 3]); }
      else if (m === 'joint') { pts.push(T[0]); for (i = 0; i < 3; i++) { var qa = ik(T[i]), qb = ik(T[(i + 1) % 3]), dq = Math.max(Math.abs(qb[0] - qa[0]), Math.abs(qb[1] - qa[1])), Tt = Math.max(0.3, dq / 1.6 * 1.5); n = Math.round(Tt / dt); for (k = 1; k <= n; k++) { var s = k / n, sm = s * s * (3 - 2 * s); pts.push(fk([qa[0] + (qb[0] - qa[0]) * sm, qa[1] + (qb[1] - qa[1]) * sm])); } } }
      else {                                                             // straight lines, corners replaced by arcs, constant speed
        var r = rb.get() / 100, path = [];
        for (i = 0; i < 3; i++) {
          var P0 = T[(i + 2) % 3], P1 = T[i], P2 = T[(i + 1) % 3], u1 = [P1[0] - P0[0], P1[1] - P0[1]], u2 = [P2[0] - P1[0], P2[1] - P1[1]], n1 = Math.hypot(u1[0], u1[1]), n2 = Math.hypot(u2[0], u2[1]);
          u1 = [u1[0] / n1, u1[1] / n1]; u2 = [u2[0] / n2, u2[1] / n2];
          var a = [P1[0] - u1[0] * r, P1[1] - u1[1] * r], b = [P1[0] + u2[0] * r, P1[1] + u2[1] * r];
          for (k = 0; k <= 10; k++) { var t = k / 10; path.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * P1[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * P1[1] + t * t * b[1]]); }
        }
        path.push(path[0]);
        var acc = 0; pts.push(path[0]); for (i = 1; i < path.length; i++) { var d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); acc += d; while (acc >= V * dt) { acc -= V * dt; var tt = 1 - acc / d; pts.push([path[i - 1][0] + (path[i][0] - path[i - 1][0]) * tt, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * tt]); } }
      }
      return pts;
    }
    function reset() {
      var P = plan(), sp = P.map(function (p, i) { return i ? Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) / 0.01 : 0; }), stops = 0;
      for (var i = 1; i < sp.length - 1; i++) if (sp[i] < 0.005 && sp[i - 1] >= 0.005) stops++;
      var dev = 0; P.forEach(function (p) { var best = 1e9; for (var k = 0; k < 3; k++) { var a = T[k], b = T[(k + 1) % 3], ab = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] * ab[0] + ab[1] * ab[1]))), q = [a[0] + ab[0] * t, a[1] + ab[1] * t]; best = Math.min(best, Math.hypot(p[0] - q[0], p[1] - q[1])); } dev = Math.max(dev, best); });
      st = { P: P, sp: sp, i: 0, t: 0 };
      var C = K.C; K.clear(cv); K.chart(cv, { x0: 0, x1: P.length * 0.01, y0: 0, y1: 0.6, xl: L('time (s)', 'temps (s)'), yl: L('tool speed (m/s)', 'vitesse de l\'outil (m/s)'), series: [{ pts: sp.map(function (v, i) { return [i * 0.01, v]; }), col: C.o, label: L('speed', 'vitesse') }] });
      out([[L('Cycle time', 'Temps de cycle'), f(P.length * 0.01, 2) + ' s'], [L('Stops at the corners', 'Arrêts aux sommets'), mode.get() === 'blend' ? '0' : '3'], [L('Largest distance to the triangle', 'Plus grand écart au triangle'), f(dev * 1000, 1) + ' mm', dev < 0.002 ? 'ok' : ''], [L('Glue (constant speed)?', 'Colle (vitesse constante) ?'), mode.get() === 'blend' ? L('yes: no blob at the corners', 'oui : pas de surépaisseur aux sommets') : L('no: the tool slows down or stops', 'non : l\'outil ralentit ou s\'arrête'), mode.get() === 'blend' ? 'ok' : 'bad']]);
      if (st.v && st.v.trail) st.v.trail.setPoints([[0, 0, 0], [0, 0, 0]]);
    }
    reset();
    RA3D.scene(F.view, { ratio: 0.52, cam: [0.15, 1.0, 1.05], target: [0.28, 0.05, 0], floorSize: 1.2 }).then(function (v) {
      var T3 = v.T; F.view.insertBefore(v.box, cv.c);
      var P3 = function (p, z) { return new T3.Vector3(p[0], z || 0.012, -p[1]); };
      var tri = v.line(0x8a94a3, true); tri.setPoints([T[0], T[1], T[2], T[0]].map(function (p) { return P3(p, 0.006); })); v.root.add(tri);
      var trail = v.line(0xffd60a); v.root.add(trail); st.v = { trail: trail };
      var base = new T3.Mesh(new T3.CylinderGeometry(0.06, 0.08, 0.3, 32), v.mat(0x3a3f48)); base.position.y = 0.15; base.userData.raKeep = true; v.root.add(base);
      var j1 = new T3.Group(); j1.position.y = 0.3; v.root.add(j1);
      var a1 = new T3.Mesh(new T3.BoxGeometry(L1, 0.05, 0.08), v.mat(0xff9f43)); a1.position.x = L1 / 2; j1.add(a1);
      var j2 = new T3.Group(); j2.position.x = L1; j1.add(j2);
      var a2 = new T3.Mesh(new T3.BoxGeometry(L2, 0.045, 0.065), v.mat(0xff9f43)); a2.position.set(L2 / 2, 0.05, 0); j2.add(a2);
      var tool = new T3.Mesh(new T3.CylinderGeometry(0.012, 0.012, 0.28, 12), v.mat(0xd5dbe1, { metalness: 0.5 })); tool.position.set(L2, -0.08, 0); j2.add(tool);
      var hist = [];
      v.frame(function (t, dt) {
        if (!st || !st.P.length) return; st.t += dt; var i = Math.floor(st.t / 0.01);
        if (i >= st.P.length + 60) { st.t = 0; i = 0; hist = []; }
        var p = st.P[Math.min(i, st.P.length - 1)], q = ik(p);
        j1.rotation.y = q[0]; j2.rotation.y = q[1];
        if (i < st.P.length) { hist.push(P3(p)); if (hist.length > 1) trail.setPoints(hist); }
      });
    });
    K.redraws.push(function (rs) { if (rs) cv.fit(); reset(); });
  };

  // ================================================================ par-redund3d
  W['par-redund3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: a redundant arm, many postures for one point', 'Labo 3D : un bras redondant, beaucoup de postures pour un point'),
      L('Three joints for a point of the plane (2 coordinates): one joint too many. Keep the tool on the target and turn the free parameter (the angle of the last link): the arm moves, the tool does not. This is the self-motion of redundant robots such as the 7-axis KUKA LBR.', 'Trois articulations pour un point du plan (2 coordonnées) : une articulation de trop. Gardez l\'outil sur la cible et tournez le paramètre libre (l\'angle du dernier segment) : le bras bouge, l\'outil non. C\'est le mouvement propre des robots redondants comme le KUKA LBR à 7 axes.'));
    var phi = K.slider(F.ctl, { label: L('Free parameter: angle of the last link φ (°)', 'Paramètre libre : angle du dernier segment φ (°)'), min: -180, max: 180, value: 60, unit: '°' });
    var tx = K.slider(F.ctl, { label: L('Target x (m)', 'Cible x (m)'), min: 20, max: 110, value: 70, map: function (v) { return v / 100; }, dec: 2 });
    var ty = K.slider(F.ctl, { label: L('Target y (m)', 'Cible y (m)'), min: -60, max: 80, value: 20, map: function (v) { return v / 100; }, dec: 2 });
    var sweep = K.check(F.ctl, L('Sweep φ automatically and leave ghosts', 'Balayer φ automatiquement et laisser des fantômes'), true);
    var elb = K.seg(F.ctl, L('Elbow', 'Coude'), [['up', L('up', 'en haut')], ['down', L('down', 'en bas')]], 'up');
    var out = K.readouts(F.side), Ls = [0.5, 0.4, 0.25];
    function solve(ph) {
      var px = tx.get() - Ls[2] * Math.cos(ph), py = ty.get() - Ls[2] * Math.sin(ph), r2 = px * px + py * py, c = (r2 - Ls[0] * Ls[0] - Ls[1] * Ls[1]) / (2 * Ls[0] * Ls[1]);
      if (c < -1 || c > 1) return null; var s = elb.get() === 'up' ? 1 : -1, q2 = s * Math.acos(c), q1 = Math.atan2(py, px) - Math.atan2(Ls[1] * Math.sin(q2), Ls[0] + Ls[1] * Math.cos(q2)); return [q1, q2, ph - q1 - q2];
    }
    RA3D.scene(F.view, { ratio: 0.6, cam: [0.35, 1.5, 1.25], target: [0.4, 0, -0.1], floorSize: 1.6 }).then(function (v) {
      var T = v.T, P3 = function (x, y, z) { return new T.Vector3(x, z || 0, -y); };
      var mk = function (op) { var g = new T.Group(); g.position.y = 0.05; v.root.add(g); var cur = g, segs = []; Ls.forEach(function (l, i) { var j = new T.Group(); if (i) j.position.x = Ls[i - 1]; cur.add(j); var m = new T.Mesh(new T.BoxGeometry(l, 0.04, 0.05), v.mat([0xff9f43, 0x5aa9ff, 0x4ed17f][i], op ? { transparent: true, opacity: op } : {})); m.position.x = l / 2; j.add(m); var jt = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.06, 20), v.mat(0xd5dbe1, op ? { transparent: true, opacity: op } : { metalness: 0.5 })); j.add(jt); segs.push(j); cur = j; }); g.segs = segs; return g; };
      var arm = mk(0), ghosts = [], gi = 0;
      for (var k = 0; k < 10; k++) { var g = mk(0.18); g.visible = false; ghosts.push(g); }
      var target = new T.Mesh(new T.TorusGeometry(0.04, 0.008, 10, 30), v.mat(0xffd60a, { emissive: 0xffd60a, emissiveIntensity: 0.5 })); target.rotation.x = Math.PI / 2; v.root.add(target);
      var base = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.05, 24), v.mat(0x3a3f48)); base.position.y = 0.025; base.userData.raKeep = true; v.root.add(base);
      var set = function (g, q) { g.segs.forEach(function (s, i) { s.rotation.y = q[i]; }); };
      var ph = phi.get() * D, lastG = 0, count = 0;
      v.frame(function (t, dt) {
        if (sweep.checked) { ph += dt * 0.8; if (ph > Math.PI) ph -= TAU; phi.set(Math.round(ph / D)); } else ph = phi.get() * D;
        target.position.copy(P3(tx.get(), ty.get(), 0.05));
        var q = solve(ph); arm.visible = !!q; if (q) set(arm, q);
        if (sweep.checked && q && t - lastG > 0.4) { lastG = t; var g2 = ghosts[gi++ % ghosts.length]; g2.visible = true; set(g2, q); }
        if (!sweep.checked) ghosts.forEach(function (g3) { g3.visible = false; });
        count = 0; for (var a = -180; a < 180; a += 2) if (solve(a * D)) count++;
        out([[L('Joint angles q₁, q₂, q₃', 'Angles articulaires q₁, q₂, q₃'), q ? q.map(function (x) { return f(wrap(x) / D, 0) + '°'; }).join(', ') : L('unreachable for this φ', 'inaccessible pour ce φ'), q ? '' : 'bad'], [L('Range of φ that reaches the target', 'Plage de φ qui atteint la cible'), f(count * 2, 0) + '° / 360°'], [L('Solutions', 'Solutions'), L('infinitely many (one per φ, two elbows each)', 'une infinité (une par φ, deux coudes chacune)')]]);
      });
    });
  };

  // ================================================================ par-grubler
  W['par-grubler'] = function (w) {
    var F = K.frame(w, L('Lab: count the mobility with Grübler’s formula', 'Labo : compter la mobilité avec la formule de Grübler'), L('Choose a mechanism, or type your own numbers. l counts the rigid bodies including the base and the effector, n the joints, Σdᵢ the degrees of freedom of all the joints.', 'Choisissez un mécanisme, ou tapez vos propres nombres. l compte les corps rigides, base et effecteur compris, n les liaisons, Σdᵢ les degrés de liberté de toutes les liaisons.'));
    var PR = {
      fourbar: ['plane', 4, 4, 4, 1, L('Four-bar linkage: 4 pivots. One motor drives it.', 'Quadrilatère articulé : 4 pivots. Un moteur l\'entraîne.')],
      fivebar: ['plane', 5, 5, 5, 2, L('Five-bar (DexTAR): two chains of 2 pivots + the effector pivot. Two motors: x and y.', 'Cinq barres (DexTAR) : deux chaînes de 2 pivots + le pivot de l\'effecteur. Deux moteurs : x et y.')],
      twin: ['plane', 3, 3, 3, 1, L('Two identical chains with superposed pivots: the formula says 0, the real mechanism moves (1): redundant constraints fool the formula.', 'Deux chaînes identiques à pivots superposés : la formule dit 0, le vrai mécanisme bouge (1) : les contraintes redondantes trompent la formule.')],
      rpr3: ['plane', 8, 9, 9, 3, L('3-RPR: three legs (pivot, slider, pivot) hold a platform: x, y and its rotation.', '3-RPR : trois jambes (pivot, glissière, pivot) tiennent une plateforme : x, y et sa rotation.')],
      sps6: ['space', 14, 18, 42, 6, L('Gough-Stewart with ball joints at both ends (6-SPS): the formula gives 12, because each leg can spin on itself: 6 internal motions that move nothing.', 'Gough-Stewart avec rotules aux deux bouts (6-SPS) : la formule donne 12, car chaque jambe peut tourner sur elle-même : 6 mouvements internes qui ne bougent rien.')],
      ups6: ['space', 14, 18, 36, 6, L('Gough-Stewart with a universal joint at the base (6-UPS): 6, the six degrees of freedom of the platform.', 'Gough-Stewart avec un cardan à la base (6-UPS) : 6, les six degrés de liberté de la plateforme.')],
      serial6: ['space', 7, 6, 6, 6, L('A 6-axis serial robot, for comparison: an open chain.', 'Un robot série 6 axes, pour comparer : une chaîne ouverte.')]
    };
    var pre = K.seg(F.ctl, L('Mechanism', 'Mécanisme'), [['fourbar', L('four-bar', 'quatre barres')], ['fivebar', L('five-bar', 'cinq barres')], ['twin', L('twin chains', 'chaînes jumelles')], ['rpr3', '3-RPR'], ['sps6', '6-SPS'], ['ups6', '6-UPS'], ['serial6', L('serial 6R', 'série 6R')]], 'fivebar', load);
    var sp = K.seg(F.ctl, L('Space', 'Espace'), [['plane', L('plane: 3(l − n − 1) + Σdᵢ', 'plan : 3(l − n − 1) + Σdᵢ')], ['space', L('space: 6(l − n − 1) + Σdᵢ', 'espace : 6(l − n − 1) + Σdᵢ')]], 'plane', calc);
    var sl = K.slider(F.ctl, { label: L('Bodies l', 'Corps l'), min: 2, max: 20, value: 5, on: calc }), sn = K.slider(F.ctl, { label: L('Joints n', 'Liaisons n'), min: 1, max: 24, value: 5, on: calc }), sd = K.slider(F.ctl, { label: L('Σdᵢ', 'Σdᵢ'), min: 1, max: 48, value: 5, on: calc });
    var nt = K.note(F.side, ''), out = K.readouts(F.side);
    function load() { var p = PR[pre.get()]; sp.set(p[0]); sl.set(p[1]); sn.set(p[2]); sd.set(p[3]); nt.innerHTML = p[5]; calc(); }
    function calc() { var k = sp.get() === 'plane' ? 3 : 6, m = k * (sl.get() - sn.get() - 1) + sd.get(), p = PR[pre.get()]; out([[L('Mobility m', 'Mobilité m'), m, ''], [L('Real mobility of the chosen mechanism', 'Mobilité réelle du mécanisme choisi'), p[4]], [L('Formula = reality?', 'Formule = réalité ?'), m === p[4] ? L('yes', 'oui') : L('no: see the note', 'non : voir la note'), m === p[4] ? 'ok' : 'bad']]); }
    load();
  };

  // ================================================================ par-fivebar3d
  W['par-fivebar3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: a five-bar parallel robot', 'Labo 3D : un robot parallèle à cinq barres'),
      L('Two motors on the base (blue), two proximal arms, two distal arms joined at the effector (yellow). Move the effector: each chain is solved alone (inverse model). Or move the motors and let Newton’s method find the effector (direct model). Watch the indicators of the two kinds of singularity.', 'Deux moteurs sur la base (bleus), deux bras proximaux, deux bras distaux réunis à l\'effecteur (jaune). Déplacez l\'effecteur : chaque chaîne est résolue seule (modèle inverse). Ou bougez les moteurs et laissez la méthode de Newton trouver l\'effecteur (modèle direct). Surveillez les indicateurs des deux sortes de singularité.'));
    var mode = K.seg(F.ctl, L('What you drive', 'Ce que vous pilotez'), [['ik', L('the effector (inverse model)', 'l\'effecteur (modèle inverse)')], ['dk', L('the motors (direct model, Newton)', 'les moteurs (modèle direct, Newton)')]], 'ik', sync);
    var sx = K.slider(F.ctl, { label: 'x (m)', min: -40, max: 40, value: 0, map: function (v) { return v / 100; }, dec: 2, on: function () { mode.set('ik'); } });
    var sy = K.slider(F.ctl, { label: 'y (m)', min: 5, max: 70, value: 40, map: function (v) { return v / 100; }, dec: 2, on: function () { mode.set('ik'); } });
    var t1 = K.slider(F.ctl, { label: L('Motor 1 θ₁ (°)', 'Moteur 1 θ₁ (°)'), min: -60, max: 240, value: 110, unit: '°', on: function () { mode.set('dk'); } });
    var t2 = K.slider(F.ctl, { label: L('Motor 2 θ₂ (°)', 'Moteur 2 θ₂ (°)'), min: -60, max: 240, value: 70, unit: '°', on: function () { mode.set('dk'); } });
    var out = K.readouts(F.side);
    var d = 0.3, L1 = 0.3, L2 = 0.4, A1 = [-d / 2, 0], A2 = [d / 2, 0], X = [0, 0.4], th = [110 * D, 70 * D], newton = 0;
    var C = function (i, t) { var A = i ? A2 : A1; return [A[0] + L1 * Math.cos(t), A[1] + L1 * Math.sin(t)]; };
    function igm(P) {                                                    // each chain is a 2R arm: chain 1 elbow out to the left, chain 2 to the right
      var r = [];
      for (var i = 0; i < 2; i++) { var A = i ? A2 : A1, dx = P[0] - A[0], dy = P[1] - A[1], rr = Math.hypot(dx, dy), c = (L1 * L1 + rr * rr - L2 * L2) / (2 * L1 * rr); if (c < -1 || c > 1) return null; r.push(Math.atan2(dy, dx) + (i ? -1 : 1) * Math.acos(c)); }
      return r;
    }
    function AB(P, t) { var c1 = C(0, t[0]), c2 = C(1, t[1]), u1 = [P[0] - c1[0], P[1] - c1[1]], u2 = [P[0] - c2[0], P[1] - c2[1]];
      var a = function (u, tt) { return -(u[0] * (-L1 * Math.sin(tt)) + u[1] * (L1 * Math.cos(tt))); };
      return { A: [a(u1, t[0]), a(u2, t[1])], B: [[u1[0], u1[1]], [u2[0], u2[1]]] }; }
    function jac(P, t) { var m = AB(P, t), B = m.B, det = B[0][0] * B[1][1] - B[0][1] * B[1][0]; if (Math.abs(det) < 1e-9) return null; var Bi = [[B[1][1] / det, -B[0][1] / det], [-B[1][0] / det, B[0][0] / det]]; return [[-Bi[0][0] * m.A[0], -Bi[0][1] * m.A[1]], [-Bi[1][0] * m.A[0], -Bi[1][1] * m.A[1]]]; }
    function dgm(t, X0) {                                               // Newton: X ← X + J (θ − G(X))
      var Xk = X0.slice(); newton = 0;
      for (var k = 0; k < 30; k++) { var g = igm(Xk); if (!g) return null; var e = [wrap(t[0] - g[0]), wrap(t[1] - g[1])]; if (Math.abs(e[0]) + Math.abs(e[1]) < 1e-9) break; var Jm = jac(Xk, g); if (!Jm) return null; Xk = [Xk[0] + Jm[0][0] * e[0] + Jm[0][1] * e[1], Xk[1] + Jm[1][0] * e[0] + Jm[1][1] * e[1]]; newton++; }
      var g2 = igm(Xk); if (!g2 || Math.abs(wrap(t[0] - g2[0])) + Math.abs(wrap(t[1] - g2[1])) > 1e-4) return null; return Xk;
    }
    function sync() {
      if (mode.get() === 'ik') { var P = [sx.get(), sy.get()], g = igm(P); if (g) { X = P; th = g; t1.set(Math.round(g[0] / D)); t2.set(Math.round(g[1] / D)); } }
      else { var t = [t1.get() * D, t2.get() * D], Xn = dgm(t, X); if (Xn) { X = Xn; th = t; sx.set(Math.round(X[0] * 100)); sy.set(Math.round(X[1] * 100)); } }
      var m = AB(X, th), dA = m.A[0] * m.A[1], dB = m.B[0][0] * m.B[1][1] - m.B[0][1] * m.B[1][0];
      var nA = Math.abs(dA) / (L1 * L2 * L1 * L2), nB = Math.abs(dB) / (L2 * L2);
      out([[L('Effector x, y', 'Effecteur x, y'), f(X[0], 3) + ' ; ' + f(X[1], 3) + ' m'], [L('Motors θ₁, θ₂', 'Moteurs θ₁, θ₂'), f(th[0] / D, 1) + '°, ' + f(th[1] / D, 1) + '°'], [L('Newton iterations (direct model)', 'Itérations de Newton (modèle direct)'), mode.get() === 'dk' ? newton : '—'],
        [L('Serial singularity |det A| (a chain stretched or folded)', 'Singularité série |det A| (une chaîne tendue ou repliée)'), f(nA, 3), nA < 0.08 ? 'bad' : 'ok'], [L('Parallel singularity |det B| (the distal arms aligned)', 'Singularité parallèle |det B| (bras distaux alignés)'), f(nB, 3), nB < 0.08 ? 'bad' : 'ok']]);
    }
    [sx, sy, t1, t2].forEach(function (s) { s.row.querySelector('input').addEventListener('input', sync); });
    sync();
    RA3D.scene(F.view, { ratio: 0.62, cam: [0, 1.15, 0.85], target: [0, 0.03, -0.3], floorSize: 1.1 }).then(function (v) {
      var T = v.T, P3 = function (p, z) { return new T.Vector3(p[0], z || 0.04, -p[1]); };
      var plate = new T.Mesh(new T.BoxGeometry(0.55, 0.03, 0.12), v.mat(0x3a3f48)); plate.position.set(0, 0.015, 0); plate.userData.raKeep = true; v.root.add(plate);
      var cyl = function (r, h, c) { return new T.Mesh(new T.CylinderGeometry(r, r, h, 24), v.mat(c, { metalness: 0.4 })); };
      [A1, A2].forEach(function (A) { var m = cyl(0.035, 0.08, 0x5aa9ff); m.position.copy(P3(A, 0.06)); v.root.add(m); });
      var bar = function (c, rad) { var m = new T.Mesh(new T.CylinderGeometry(rad, rad, 1, 12), v.mat(c)); v.root.add(m); return m; };
      var place = function (m, a, b, z) { var pa = P3(a, z), pb = P3(b, z), mid = pa.clone().add(pb).multiplyScalar(0.5), len = pa.distanceTo(pb); m.position.copy(mid); m.scale.set(1, len, 1); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), pb.clone().sub(pa).normalize()); };
      var p1 = bar(0xff9f43, 0.014), p2 = bar(0xff9f43, 0.014), q1 = bar(0xd5dbe1, 0.01), q2 = bar(0xd5dbe1, 0.01);
      var e1 = cyl(0.02, 0.05, 0xd5dbe1), e2 = cyl(0.02, 0.05, 0xd5dbe1), eff = cyl(0.03, 0.09, 0xffd60a); [e1, e2, eff].forEach(function (m) { v.root.add(m); });
      var ws = v.line(0x4ed17f, true); v.root.add(ws);
      var pts = []; for (var a = 0; a <= 360; a += 3) { var r0 = 0.05, P0 = [0, 0.4]; for (var r = 0.02; r < 0.6; r += 0.01) { var P = [Math.cos(a * D) * r, 0.4 + Math.sin(a * D) * r]; if (igm(P)) r0 = r; else break; } pts.push(P3([Math.cos(a * D) * r0, 0.4 + Math.sin(a * D) * r0], 0.005)); void P0; }
      ws.setPoints(pts);
      var lab = v.label(L('green dashes: reachable zone (this working mode)', 'tirets verts : zone atteignable (ce mode de travail)'), '#4ed17f', 0.035); lab.position.set(0, 0.02, -0.95); v.root.add(lab);
      v.frame(function () {
        var c1 = C(0, th[0]), c2 = C(1, th[1]);
        place(p1, A1, c1, 0.09); place(p2, A2, c2, 0.09); place(q1, c1, X, 0.13); place(q2, c2, X, 0.13);
        e1.position.copy(P3(c1, 0.11)); e2.position.copy(P3(c2, 0.11)); eff.position.copy(P3(X, 0.13));
      });
    });
  };

  // ================================================================ par-3rpr
  W['par-3rpr'] = function (w) {
    var F = K.frame(w, L('Lab: a planar 3-RPR platform', 'Labo : une plateforme plane 3-RPR'), L('Three legs whose length is motorised (prismatic joints) hold a triangle. Choose the pose of the platform (x, y, φ): the inverse model gives the three leg lengths directly. The Jacobian links the leg speeds to the platform speeds; it becomes singular when the three leg lines meet at one point.', 'Trois jambes dont la longueur est motorisée (liaisons glissières) tiennent un triangle. Choisissez la pose de la plateforme (x, y, φ) : le modèle inverse donne directement les trois longueurs de jambe. La jacobienne relie les vitesses des jambes à celles de la plateforme ; elle devient singulière quand les trois droites des jambes se coupent en un point.'));
    var cv = K.canvas(F.view, 0.7, L('3-RPR platform', 'Plateforme 3-RPR'));
    var px = K.slider(F.ctl, { label: 'x (m)', min: -30, max: 30, value: 0, map: function (v) { return v / 100; }, dec: 2, on: draw });
    var py = K.slider(F.ctl, { label: 'y (m)', min: -20, max: 40, value: 5, map: function (v) { return v / 100; }, dec: 2, on: draw });
    var ph = K.slider(F.ctl, { label: 'φ (°)', min: -90, max: 90, value: 10, unit: '°', on: draw });
    var out = K.readouts(F.side);
    var B = [[-0.5, -0.3], [0.5, -0.3], [0, 0.55]], p = [[-0.12, -0.07], [0.12, -0.07], [0, 0.14]];
    function draw() {
      var x = px.get(), y = py.get(), a = ph.get() * D, c = Math.cos(a), s = Math.sin(a), C = K.C, P = p.map(function (q) { return [x + c * q[0] - s * q[1], y + s * q[0] + c * q[1]]; });
      var rows = [], len = [];
      for (var i = 0; i < 3; i++) { var u = [P[i][0] - B[i][0], P[i][1] - B[i][1]], l = Math.hypot(u[0], u[1]); len.push(l); u = [u[0] / l, u[1] / l]; var r = [P[i][0] - x, P[i][1] - y]; rows.push([u[0] * r[1] * -1 + u[1] * r[0], u[0], u[1]]); }   // ρ̇ᵢ = uᵢ·v + (rᵢ × uᵢ)·φ̇
      rows = rows.map(function (rw, i) { var r = [P[i][0] - x, P[i][1] - y], u = [(P[i][0] - B[i][0]) / len[i], (P[i][1] - B[i][1]) / len[i]]; return [r[0] * u[1] - r[1] * u[0], u[0], u[1]]; });
      var det = rows[0][0] * (rows[1][1] * rows[2][2] - rows[1][2] * rows[2][1]) - rows[0][1] * (rows[1][0] * rows[2][2] - rows[1][2] * rows[2][0]) + rows[0][2] * (rows[1][0] * rows[2][1] - rows[1][1] * rows[2][0]);
      K.clear(cv); var g = cv.x, S = Math.min(cv.w, cv.h) * 0.75, ox = cv.w / 2, oy = cv.h * 0.58, X = function (q) { return [ox + q[0] * S, oy - q[1] * S]; };
      g.strokeStyle = C.grid; g.setLineDash([4, 4]); for (i = 0; i < 3; i++) { var u2 = [P[i][0] - B[i][0], P[i][1] - B[i][1]], a0 = X([B[i][0] - u2[0] * 2, B[i][1] - u2[1] * 2]), a1 = X([B[i][0] + u2[0] * 3, B[i][1] + u2[1] * 3]); g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke(); } g.setLineDash([]);
      for (i = 0; i < 3; i++) { var b = X(B[i]), q = X(P[i]); g.strokeStyle = C.o; g.lineWidth = 7; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(q[0], q[1]); g.stroke(); g.fillStyle = C.b; g.beginPath(); g.arc(b[0], b[1], 8, 0, 7); g.fill(); K.text(cv, 'ρ' + (i + 1) + ' = ' + f(len[i], 3), (b[0] + q[0]) / 2 + 8, (b[1] + q[1]) / 2, C.o, 11); }
      g.fillStyle = C.g; g.globalAlpha = 0.5; g.beginPath(); P.forEach(function (q, k) { var z = X(q); if (k) g.lineTo(z[0], z[1]); else g.moveTo(z[0], z[1]); }); g.closePath(); g.fill(); g.globalAlpha = 1;
      var sing = Math.abs(det) < 0.01;
      out([[L('Leg lengths ρ₁, ρ₂, ρ₃', 'Longueurs ρ₁, ρ₂, ρ₃'), len.map(function (l) { return f(l, 3); }).join(' ; ') + ' m'], [L('det of the Jacobian (leg side)', 'det de la jacobienne (côté jambes)'), f(det, 4), sing ? 'bad' : 'ok'], [L('State', 'État'), sing ? L('near a parallel singularity: the platform can turn without changing the legs', 'près d\'une singularité parallèle : la plateforme peut tourner sans changer les jambes') : L('regular', 'régulier'), sing ? 'bad' : 'ok']]);
    }
    draw(); K.redraws.push(function (rs) { if (rs) cv.fit(); draw(); });
  };
})();
