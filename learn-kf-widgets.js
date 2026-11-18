// learn-kf-widgets.js — the labs of the course "Data fusion and the Kalman filter" (learn-kalman.html). Uses labkit.js (RAK) and lab3d.js (RA3D).
//   kf-gauss3d  a 2D Gaussian as a 3D bell: covariance, confidence ellipse = a slice of the bell, samples
//   kf-est      the best linear estimator on the DC motor: each measurement is a line in the parameter plane
//   kf-bells    one Kalman step at a time: prediction widens the bell, the measurement narrows it
//   kf-1d       the temperature of a room: tuning Γα and Γβ, the gain converges to the asymptotic gain
//   kf-pend3d   an extended Kalman filter finds the angle of a pendulum from a gyrometer only (3D)
//   kf-uwb3d    a robot localised by three UWB beacons with an EKF (3D)
//   kf-multi    multimodal fusion: compass, angulation, TDOA and odometry at different rates
(function () {
  'use strict';
  var K = window.RAK; if (!K) return;
  var L = K.L, f = K.f, el = K.el, W = K.W;
  var TAU = Math.PI * 2;
  // ---------------------------------------------------------------- small linear algebra (arrays of arrays)
  var mm = function (A, B) { return A.map(function (r) { return B[0].map(function (_, j) { var s = 0; for (var k = 0; k < r.length; k++) s += r[k] * B[k][j]; return s; }); }); };
  var tr = function (A) { return A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); }); };
  var add = function (A, B) { return A.map(function (r, i) { return r.map(function (v, j) { return v + B[i][j]; }); }); };
  var eye = function (n, s) { var I = []; for (var i = 0; i < n; i++) { I.push([]); for (var j = 0; j < n; j++) I[i].push(i === j ? (s === undefined ? 1 : s) : 0); } return I; };
  // sequential scalar update: x, P, row c, measured y, predicted h, variance r  →  new x, P
  function update(x, P, c, y, h, r) {
    var n = x.length, Pc = [], S = r, i, j;
    for (i = 0; i < n; i++) { var s = 0; for (j = 0; j < n; j++) s += P[i][j] * c[j]; Pc.push(s); }
    for (i = 0; i < n; i++) S += c[i] * Pc[i];
    var Kg = Pc.map(function (v) { return v / S; }), inn = y - h;
    var x2 = x.map(function (v, i2) { return v + Kg[i2] * inn; });
    var P2 = P.map(function (row, i2) { return row.map(function (v, j2) { return v - Kg[i2] * Pc[j2]; }); });
    return { x: x2, P: P2, K: Kg, S: S, inn: inn };
  }
  // 2x2 covariance → ellipse points at probability eta (a = √(−2 ln(1 − η)))
  function ellipse(m, G, eta, n) {
    var a = Math.sqrt(-2 * Math.log(1 - eta)), A = G[0][0], B = G[0][1], D = G[1][1];
    var tm = (A + D) / 2, dt = Math.sqrt(Math.max(0, (A - D) * (A - D) / 4 + B * B)), l1 = tm + dt, l2 = Math.max(0, tm - dt);
    var th = Math.abs(B) < 1e-12 ? (A >= D ? 0 : Math.PI / 2) : Math.atan2(l1 - A, B);
    var pts = [], c = Math.cos(th), s = Math.sin(th);
    for (var k = 0; k <= (n || 64); k++) { var u = k / (n || 64) * TAU, ex = a * Math.sqrt(l1) * Math.cos(u), ey = a * Math.sqrt(l2) * Math.sin(u); pts.push([m[0] + c * ex - s * ey, m[1] + s * ex + c * ey]); }
    pts.l1 = l1; pts.l2 = l2; pts.th = th; pts.a = a; return pts;
  }
  var wrap = function (a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
  var nf = function (v, d) { return f(v, d === undefined ? 2 : d); };
  var mat2 = function (M, d) { return '[' + f(M[0][0], d) + ' ' + f(M[0][1], d) + ' ; ' + f(M[1][0], d) + ' ' + f(M[1][1], d) + ']'; };

  // ================================================================ kf-gauss3d
  W['kf-gauss3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: a Gaussian vector as a bell', 'Labo 3D : un vecteur gaussien en forme de cloche'),
      L('The height of the bell is the probability density of x = (x₁, x₂). Change the standard deviations and the correlation. The yellow ellipse is a <b>horizontal slice</b> of the bell: it contains the chosen probability η. The dots are 400 random draws: count how many fall inside.', 'La hauteur de la cloche est la densité de probabilité de x = (x₁, x₂). Changez les écarts-types et la corrélation. L\'ellipse jaune est une <b>tranche horizontale</b> de la cloche : elle contient la probabilité η choisie. Les points sont 400 tirages au hasard : comptez combien tombent dedans.'));
    var sx = K.slider(F.ctl, { label: L('Standard deviation σ₁', 'Écart-type σ₁'), min: 30, max: 200, value: 120, map: function (v) { return v / 100; }, dec: 2, on: upd });
    var sy = K.slider(F.ctl, { label: L('Standard deviation σ₂', 'Écart-type σ₂'), min: 30, max: 200, value: 70, map: function (v) { return v / 100; }, dec: 2, on: upd });
    var rho = K.slider(F.ctl, { label: L('Correlation ρ', 'Corrélation ρ'), min: -90, max: 90, value: 60, map: function (v) { return v / 100; }, dec: 2, on: upd });
    var eta = K.slider(F.ctl, { label: L('Probability η', 'Probabilité η'), min: 10, max: 99, value: 90, map: function (v) { return v / 100; }, fmt: function (v) { return f(v * 100, 0) + ' %'; }, on: upd });
    var out = K.readouts(F.side);
    var S = 0.42, Hmax = 1.3, v3 = null, surf = null, ring = null, ringF = null, pts = null, axes = [], r = K.rng(7), Z = [];
    for (var i = 0; i < 400; i++) Z.push([K.gauss(r), K.gauss(r)]);
    function cov() { var a = sx.get(), b = sy.get(), c = rho.get(); return [[a * a, c * a * b], [c * a * b, b * b]]; }
    function sqrtm(G) { var e = ellipse([0, 0], G, 0.5, 4), c = Math.cos(e.th), s = Math.sin(e.th), a = Math.sqrt(e.l1), b = Math.sqrt(e.l2); return [[c * c * a + s * s * b, c * s * (a - b)], [c * s * (a - b), s * s * a + c * c * b]]; }
    function upd() {
      var G = cov(), det = G[0][0] * G[1][1] - G[0][1] * G[0][1], Gi = [[G[1][1] / det, -G[0][1] / det], [-G[0][1] / det, G[0][0] / det]];
      var e = ellipse([0, 0], G, eta.get()), Rt = sqrtm(G), inside = 0;
      var samples = Z.map(function (z) { var x = Rt[0][0] * z[0] + Rt[0][1] * z[1], y = Rt[1][0] * z[0] + Rt[1][1] * z[1], q = x * (Gi[0][0] * x + Gi[0][1] * y) + y * (Gi[1][0] * x + Gi[1][1] * y); if (q <= e.a * e.a) inside++; return [x, y]; });
      out([[L('Covariance Γ', 'Covariance Γ'), mat2(G, 2)], [L('Eigenvalues λ₁, λ₂', 'Valeurs propres λ₁, λ₂'), nf(e.l1) + ' ; ' + nf(e.l2)], [L('Half-axes a√λ', 'Demi-axes a√λ'), nf(e.a * Math.sqrt(e.l1)) + ' ; ' + nf(e.a * Math.sqrt(e.l2))], [L('a = √(−2 ln(1 − η))', 'a = √(−2 ln(1 − η))'), nf(e.a)], [L('Draws inside the ellipse', 'Tirages dans l\'ellipse'), inside + ' / 400 = ' + f(inside / 4, 0) + ' %', Math.abs(inside / 4 - eta.get() * 100) < 5 ? 'ok' : '']]);
      if (!v3) return;
      var T = v3.T, pos = surf.geometry.attributes.position, col = surf.geometry.attributes.color, c0 = new T.Color(0x2f6bff), c1 = new T.Color(0xffd60a), tmp = new T.Color();
      for (var k = 0; k < pos.count; k++) { var X = pos.getX(k) / S, Y = -pos.getZ(k) / S, q = X * (Gi[0][0] * X + Gi[0][1] * Y) + Y * (Gi[1][0] * X + Gi[1][1] * Y), hgt = Math.exp(-q / 2); pos.setY(k, 0.012 + hgt * Hmax); tmp.copy(c0).lerp(c1, hgt); col.setXYZ(k, tmp.r, tmp.g, tmp.b); }
      pos.needsUpdate = true; col.needsUpdate = true; surf.geometry.computeVertexNormals();
      var hR = Math.exp(-e.a * e.a / 2) * Hmax;
      ring.setPoints(e.map(function (p) { return [p[0] * S, hR + 0.01, -p[1] * S]; })); ringF.setPoints(e.map(function (p) { return [p[0] * S, 0.01, -p[1] * S]; }));
      var pa = pts.geometry.attributes.position; samples.forEach(function (p, k) { pa.setXYZ(k, p[0] * S, 0.015, -p[1] * S); }); pa.needsUpdate = true;
      axes.forEach(function (ax, k) { var lam = k ? e.l2 : e.l1, ang = e.th + (k ? Math.PI / 2 : 0), len = e.a * Math.sqrt(lam) * S; ax.position.set(0, 0.02, 0); ax.rotation.set(0, ang, 0); ax.set(len); });
    }
    RA3D.scene(F.view, { ratio: 0.62, cam: [2.6, 2.4, 2.9], target: [0, 0.35, 0], floorSize: 2.2 }).then(function (v) {
      v3 = v; var T = v.T;
      var geo = new T.PlaneGeometry(3.4, 3.4, 70, 70); geo.rotateX(-Math.PI / 2); geo.setAttribute('color', new T.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
      surf = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: T.DoubleSide, transparent: true, opacity: 0.88 })); v.root.add(surf);
      var wire = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.07 })); v.root.add(wire);
      ring = v.line(0xffd60a); v.root.add(ring); ringF = v.line(0xffd60a, true); v.root.add(ringF);
      var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(new Float32Array(400 * 3), 3));
      pts = new T.Points(pg, new T.PointsMaterial({ color: 0xff6b6b, size: 0.035 })); v.root.add(pts);
      axes = [v.arrow(0x4ed17f, 0.012), v.arrow(0xb88cff, 0.012)]; axes.forEach(function (a) { v.root.add(a); });
      var lx = v.label('x₁', '#ffa04d'); lx.position.set(1.85, 0.05, 0); v.root.add(lx); var ly = v.label('x₂', '#ffa04d'); ly.position.set(0, 0.05, -1.85); v.root.add(ly);
      upd();
    });
    upd();
  };

  // ================================================================ kf-est: the DC motor
  W['kf-est'] = function (w) {
    var F = K.frame(w, L('Lab: estimating the two parameters of a DC motor', 'Labo : estimer les deux paramètres d\'un moteur à courant continu'),
      L('Ω = x₁ U + x₂ T<sub>r</sub>. Before any measurement we only know x ≈ (1, −1) with a variance of 4 (the large blue ellipse). Each measurement is a <b>line</b> of the plane (x₁, x₂): the estimator moves towards it and the ellipse shrinks across it. Add the measurements one by one.', 'Ω = x₁ U + x₂ T<sub>r</sub>. Avant toute mesure, on sait seulement x ≈ (1, −1) avec une variance de 4 (la grande ellipse bleue). Chaque mesure est une <b>droite</b> du plan (x₁, x₂) : l\'estimateur s\'en rapproche et l\'ellipse rétrécit en travers. Ajoutez les mesures une à une.'));
    var cv = K.canvas(F.view, 0.72, L('Parameter plane', 'Plan des paramètres'));
    var DATA = [[4, 0, 5], [10, 1, 10], [10, 5, 8], [13, 5, 14], [15, 3, 17]], VB = 9;
    var n = 0, hist = [];
    var row = el('div', { 'class': 'tw-seg' }); F.ctl.appendChild(row);
    row.innerHTML = '<div><button type="button" data-a="next">' + L('Add the next measurement', 'Ajouter la mesure suivante') + '</button><button type="button" data-a="all">' + L('All at once', 'Toutes d\'un coup') + '</button><button type="button" data-a="reset">' + L('Start again', 'Recommencer') + '</button></div>';
    var tbl = el('div', { 'class': 'tw-read' }); F.ctl.appendChild(tbl);
    var out = K.readouts(F.side);
    function compute() {
      var x = [[1], [-1]], P = eye(2, 4); hist = [{ x: [1, -1], P: P }];
      for (var k = 0; k < n; k++) { var d = DATA[k], u = update([x[0][0], x[1][0]], P, [d[0], d[1]], d[2], d[0] * x[0][0] + d[1] * x[1][0], VB); x = [[u.x[0]], [u.x[1]]]; P = u.P; hist.push({ x: u.x, P: P, K: u.K }); }
      draw();
    }
    function draw() {
      K.clear(cv); var c = cv.x, Wd = cv.w, H = cv.h, X0 = -3, X1 = 5, Y0 = -5, Y1 = 3, X = function (v) { return 40 + (v - X0) / (X1 - X0) * (Wd - 60); }, Y = function (v) { return H - 30 - (v - Y0) / (Y1 - Y0) * (H - 50); };
      K.chart(cv, { x0: X0, x1: X1, y0: Y0, y1: Y1, xl: 'x₁', yl: 'x₂', series: [] }, { l: 40, t: 20, r: Wd - 20, b: H - 30 });
      var C = K.C;
      DATA.slice(0, n).forEach(function (d, k) {        // the line U x1 + Tr x2 = Ω
        c.strokeStyle = C.o; c.globalAlpha = k === n - 1 ? 1 : 0.35; c.lineWidth = 2; c.beginPath();
        if (Math.abs(d[1]) < 1e-9) { var xv = d[2] / d[0]; c.moveTo(X(xv), Y(Y0)); c.lineTo(X(xv), Y(Y1)); }
        else { c.moveTo(X(X0), Y((d[2] - d[0] * X0) / d[1])); c.lineTo(X(X1), Y((d[2] - d[0] * X1) / d[1])); }
        c.stroke(); c.globalAlpha = 1;
      });
      c.save(); c.beginPath(); c.rect(40, 20, Wd - 60, H - 50); c.clip();
      hist.forEach(function (h, k) {
        var e = ellipse(h.x, h.P, 0.9), last = k === hist.length - 1;
        c.strokeStyle = last ? C.g : C.b; c.globalAlpha = last ? 1 : 0.25 + 0.5 * k / hist.length; c.lineWidth = last ? 2.5 : 1.5; c.beginPath();
        e.forEach(function (p, i) { if (i) c.lineTo(X(p[0]), Y(p[1])); else c.moveTo(X(p[0]), Y(p[1])); }); c.stroke();
        c.fillStyle = last ? C.g : C.b; c.beginPath(); c.arc(X(h.x[0]), Y(h.x[1]), last ? 5 : 3, 0, 7); c.fill(); c.globalAlpha = 1;
      });
      c.restore();
      var h = hist[hist.length - 1];
      K.text(cv, L('90 % ellipse', 'ellipse à 90 %'), Wd - 24, 36, C.g, 11, 'right');
      tbl.innerHTML = '<div><span>k · U · T<sub>r</sub> · Ω</span><b></b></div>' + DATA.map(function (d, k) { return '<div' + (k < n ? ' class="ok"' : '') + '><span>' + k + ' · ' + d[0] + ' V · ' + d[1] + ' N·m</span><b>' + d[2] + ' rad/s</b></div>'; }).join('');
      out([[L('Measurements used', 'Mesures utilisées'), n + ' / 5'], [L('Estimate x̂', 'Estimation x̂'), '(' + nf(h.x[0]) + ' ; ' + nf(h.x[1]) + ')'], [L('Error covariance Γε', 'Covariance de l\'erreur Γε'), mat2(h.P, 3)], [L('Std of x̂₁, x̂₂', 'Écarts-types de x̂₁, x̂₂'), nf(Math.sqrt(h.P[0][0])) + ' ; ' + nf(Math.sqrt(h.P[1][1]))]].concat(h.K ? [[L('Gain of the last step K', 'Gain de la dernière étape K'), '(' + f(h.K[0], 3) + ' ; ' + f(h.K[1], 3) + ')']] : []));
    }
    row.addEventListener('click', function (e) { var b = e.target.closest('button[data-a]'); if (!b) return; var a = b.dataset.a; n = a === 'reset' ? 0 : a === 'all' ? 5 : Math.min(5, n + 1); compute(); });
    compute(); K.redraws.push(function (rs) { if (rs) cv.fit(); draw(); });
  };

  // ================================================================ kf-bells: one step at a time
  W['kf-bells'] = function (w) {
    var F = K.frame(w, L('Lab: one Kalman step at a time', 'Labo : le filtre de Kalman, une étape à la fois'),
      L('A cart moves 2 m to the right at each step, but its wheels slip a little (process noise Γα). A sensor measures its position with noise Γβ. Press <b>Predict</b>: the blue bell moves and widens. Press <b>Correct</b>: the measurement (orange) and the prediction combine into the green bell, narrower than both.', 'Un chariot avance de 2 m vers la droite à chaque étape, mais ses roues glissent un peu (bruit d\'état Γα). Un capteur mesure sa position avec un bruit Γβ. Appuyez sur <b>Prédire</b> : la cloche bleue se déplace et s\'élargit. Appuyez sur <b>Corriger</b> : la mesure (orange) et la prédiction se combinent en la cloche verte, plus étroite que les deux.'));
    var cv = K.canvas(F.view, 0.5, L('Probability bells along the track', 'Cloches de probabilité le long de la voie'));
    var ga = K.slider(F.ctl, { label: L('Process noise Γα (m²)', 'Bruit d\'état Γα (m²)'), min: 1, max: 200, value: 40, map: function (v) { return v / 100; }, dec: 2 });
    var gb = K.slider(F.ctl, { label: L('Measurement noise Γβ (m²)', 'Bruit de mesure Γβ (m²)'), min: 5, max: 400, value: 100, map: function (v) { return v / 100; }, dec: 2 });
    var bar = el('div', { 'class': 'tw-seg' }); F.ctl.appendChild(bar);
    bar.innerHTML = '<div><button type="button" data-a="p">1 · ' + L('Predict', 'Prédire') + '</button><button type="button" data-a="c">2 · ' + L('Correct', 'Corriger') + '</button><button type="button" data-a="r">' + L('Start again', 'Recommencer') + '</button></div>';
    var out = K.readouts(F.side), r = K.rng(5), S = {};
    function reset() { S = { k: 0, xt: 2, xh: 0, P: 4, phase: 'p', prior: null, meas: null, post: { m: 0, v: 4 }, K: null }; draw(); }
    function predict() { if (S.phase !== 'p') return; S.xt += 2 + Math.sqrt(ga.get()) * K.gauss(r); S.prior = { m: S.xh + 2, v: S.P + ga.get() }; S.xh = S.prior.m; S.P = S.prior.v; S.meas = null; S.post = null; S.phase = 'c'; S.k++; draw(); }
    function correct() { if (S.phase !== 'c') return; var y = S.xt + Math.sqrt(gb.get()) * K.gauss(r); S.meas = { m: y, v: gb.get() }; var Kg = S.P / (S.P + gb.get()); S.K = Kg; S.xh = S.xh + Kg * (y - S.xh); S.P = (1 - Kg) * S.P; S.post = { m: S.xh, v: S.P }; S.phase = 'p'; draw(); }
    bar.addEventListener('click', function (e) { var b = e.target.closest('button[data-a]'); if (!b) return; ({ p: predict, c: correct, r: reset })[b.dataset.a](); });
    function draw() {
      K.clear(cv); var c = cv.x, C = K.C, Wd = cv.w, H = cv.h, ctr = S.xh, X0 = ctr - 9, X1 = ctr + 9, X = function (v) { return 30 + (v - X0) / (X1 - X0) * (Wd - 60); }, base = H - 40;
      c.strokeStyle = C.axis; c.beginPath(); c.moveTo(20, base); c.lineTo(Wd - 20, base); c.stroke();
      for (var g = Math.ceil(X0); g <= X1; g++) { c.beginPath(); c.moveTo(X(g), base); c.lineTo(X(g), base + 5); c.stroke(); if (g % 2 === 0) K.text(cv, g + ' m', X(g), base + 18, C.axis, 10, 'center'); }
      var bell = function (b, col, lab) { if (!b) return; var pk = 1 / Math.sqrt(TAU * b.v), sc = (H - 90) * 0.9 / 0.45; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.5; c.globalAlpha = 0.18; c.beginPath(); c.moveTo(X(X0), base);
        for (var i = 0; i <= 200; i++) { var xv = X0 + (X1 - X0) * i / 200, p = Math.exp(-(xv - b.m) * (xv - b.m) / (2 * b.v)) / Math.sqrt(TAU * b.v); c.lineTo(X(xv), base - Math.min(H - 70, p * sc)); }
        c.lineTo(X(X1), base); c.fill(); c.globalAlpha = 1; c.beginPath(); for (i = 0; i <= 200; i++) { xv = X0 + (X1 - X0) * i / 200; p = Math.exp(-(xv - b.m) * (xv - b.m) / (2 * b.v)) / Math.sqrt(TAU * b.v); if (i) c.lineTo(X(xv), base - Math.min(H - 70, p * sc)); else c.moveTo(X(xv), base - Math.min(H - 70, p * sc)); } c.stroke();
        K.text(cv, lab, X(b.m), base - Math.min(H - 70, pk * sc) - 8, col, 11, 'center', true); };
      bell(S.prior, C.b, L('prediction', 'prédiction')); bell(S.meas, C.o, L('measurement', 'mesure')); bell(S.post, C.g, L('corrected', 'corrigée'));
      c.fillStyle = C.ink; c.fillRect(X(S.xt) - 12, base - 14, 24, 12); c.fillStyle = C.mute; c.beginPath(); c.arc(X(S.xt) - 7, base - 2, 3, 0, 7); c.arc(X(S.xt) + 7, base - 2, 3, 0, 7); c.fill();
      K.text(cv, L('real cart', 'vrai chariot'), X(S.xt), base - 20, C.ink, 10, 'center');
      out([[L('Step k', 'Étape k'), S.k + ' · ' + (S.phase === 'c' ? L('now correct', 'maintenant corriger') : L('now predict', 'maintenant prédire'))], [L('Estimate x̂', 'Estimation x̂'), nf(S.xh) + ' m'], [L('Variance Γ', 'Variance Γ'), nf(S.P) + ' m²  (σ = ' + nf(Math.sqrt(S.P)) + ' m)'], [L('Gain K = Γ / (Γ + Γβ)', 'Gain K = Γ / (Γ + Γβ)'), S.K === null ? '—' : nf(S.K)], [L('Real error', 'Erreur réelle'), nf(Math.abs(S.xh - S.xt)) + ' m']]);
    }
    reset(); K.redraws.push(function (rs) { if (rs) cv.fit(); draw(); });
  };

  // ================================================================ kf-1d: the asymptotic filter
  W['kf-1d'] = function (w) {
    var F = K.frame(w, L('Lab: the temperature of a room and the asymptotic gain', 'Labo : la température d\'une pièce et le gain asymptotique'),
      L('x<sub>k+1</sub> = x<sub>k</sub> + α<sub>k</sub>, y<sub>k</sub> = x<sub>k</sub> + β<sub>k</sub>. The real temperature drifts slowly (Γα), the thermometer is noisy (Γβ). Watch the gain K<sub>k</sub> settle on the value K<sub>∞</sub> given by the formula, whatever the start.', 'x<sub>k+1</sub> = x<sub>k</sub> + α<sub>k</sub>, y<sub>k</sub> = x<sub>k</sub> + β<sub>k</sub>. La vraie température dérive lentement (Γα), le thermomètre est bruité (Γβ). Regardez le gain K<sub>k</sub> se poser sur la valeur K<sub>∞</sub> donnée par la formule, quel que soit le départ.'));
    var c1 = K.canvas(F.view, 0.42), c2 = K.canvas(F.view, 0.28);
    var lg = function (v) { return Math.pow(10, v / 10); };
    var ga = K.slider(F.ctl, { label: L('Process noise Γα', 'Bruit d\'état Γα'), min: -30, max: 10, value: -15, map: lg, fmt: function (v) { return v < 0.01 ? v.toExponential(1).replace('.', K.FR ? ',' : '.') : f(v, 3); }, on: run });
    var gb = K.slider(F.ctl, { label: L('Measurement noise Γβ', 'Bruit de mesure Γβ'), min: -20, max: 10, value: 0, map: lg, fmt: function (v) { return f(v, 3); }, on: run });
    var p0 = K.slider(F.ctl, { label: L('Initial variance Γ₀|₋₁', 'Variance initiale Γ₀|₋₁'), min: -10, max: 20, value: 10, map: lg, fmt: function (v) { return f(v, 2); }, on: run });
    var out = K.readouts(F.side), chal = K.challenge(F.side, L('Make the asymptotic gain equal to 0.618 (the golden ratio appears when Γα = Γβ).', 'Rendez le gain asymptotique égal à 0,618 (le nombre d\'or apparaît quand Γα = Γβ).'));
    function run() {
      var A = ga.get(), B = gb.get(), r = K.rng(11), N = 150, x = 20, xh = 15, P = p0.get(), T = [], Y = [], E = [], LO = [], HI = [], KK = [];
      for (var k = 0; k < N; k++) {
        var y = x + Math.sqrt(B) * K.gauss(r), Kg = P / (P + B); xh = xh + Kg * (y - xh); var Pc = (1 - Kg) * P;
        T.push([k, x]); Y.push([k, y]); E.push([k, xh]); LO.push([k, xh - 2 * Math.sqrt(Pc)]); HI.push([k, xh + 2 * Math.sqrt(Pc)]); KK.push([k, Kg]);
        x = x + Math.sqrt(A) * K.gauss(r); P = Pc + A;
      }
      var Pinf = (A + Math.sqrt(A * A + 4 * A * B)) / 2, Kinf = Pinf / (Pinf + B), prec = Pinf * B / (Pinf + B);
      var C = K.C, rr = K.range(T.map(function (p) { return p[1]; }).concat(E.map(function (p) { return p[1]; })));
      K.clear(c1); K.chart(c1, { x0: 0, x1: N, y0: Math.max(rr[0] - 2, 5), y1: Math.min(rr[1] + 2, 35), xl: 'k', yl: '°C', series: [{ pts: Y, col: C.mute, w: 1, label: L('thermometer y', 'thermomètre y') }, { pts: T, col: C.o, w: 2, label: L('real temperature', 'vraie température') }, { pts: E, col: C.g, w: 2, label: L('estimate x̂ (± 2σ)', 'estimation x̂ (± 2σ)') }, { pts: LO, col: C.g, w: 1, dash: [4, 4] }, { pts: HI, col: C.g, w: 1, dash: [4, 4] }] });
      K.clear(c2); K.chart(c2, { x0: 0, x1: N, y0: 0, y1: 1, xl: 'k', yl: L('gain K', 'gain K'), hlines: [{ y: Kinf, col: C.y, label: 'K∞' }], series: [{ pts: KK, col: C.b, w: 2, label: 'K_k' }] });
      out([['Γ∞ = (Γα + √(Γα² + 4ΓαΓβ)) / 2', f(Pinf, 4)], ['K∞ = Γ∞ / (Γ∞ + Γβ)', f(Kinf, 3)], [L('Precision Γ∞Γβ / (Γ∞ + Γβ)', 'Précision Γ∞Γβ / (Γ∞ + Γβ)'), f(prec, 4) + ' (σ = ' + f(Math.sqrt(prec), 3) + ' °C)'], [L('Last gain of the run K₁₄₉', 'Dernier gain du calcul K₁₄₉'), f(KK[N - 1][1], 3)]]);
      chal(Math.abs(Kinf - 0.618) < 0.01);
    }
    run(); K.redraws.push(function (rs) { if (rs) { c1.fit(); c2.fit(); } run(); });
  };

  // ================================================================ kf-pend3d: EKF on a pendulum
  W['kf-pend3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: find the angle of a pendulum from a gyrometer', 'Labo 3D : trouver l\'angle d\'un pendule avec un gyromètre'),
      L('The orange pendulum is the real one. The blue, transparent one is what the extended Kalman filter believes, using <b>only</b> a gyrometer (it measures the speed x₂, never the angle x₁). The model ẋ₂ = −sin x₁ links the two: after a few swings the filter has found the angle.', 'Le pendule orange est le vrai. Le bleu, transparent, est ce que croit le filtre de Kalman étendu, avec <b>seulement</b> un gyromètre (il mesure la vitesse x₂, jamais l\'angle x₁). Le modèle ẋ₂ = −sin x₁ relie les deux : après quelques oscillations le filtre a trouvé l\'angle.'));
    var sg = K.slider(F.ctl, { label: L('Gyro noise σ (rad/s)', 'Bruit du gyro σ (rad/s)'), min: 1, max: 50, value: 10, map: function (v) { return v / 100; }, dec: 2, on: reset });
    var q = K.slider(F.ctl, { label: L('Process noise (tuning) q', 'Bruit d\'état (réglage) q'), min: -60, max: -10, value: -40, map: function (v) { return Math.pow(10, v / 10); }, fmt: function (v) { return v.toExponential(0); }, on: reset });
    var a0 = K.slider(F.ctl, { label: L('Real starting angle (°)', 'Angle de départ réel (°)'), min: 10, max: 150, value: 70, on: reset });
    var btn = el('button', { type: 'button', 'class': 'btn sm ghost' }, L('Start again', 'Recommencer')); F.ctl.appendChild(btn); btn.addEventListener('click', reset);
    var c1 = K.canvas(F.view, 0.32);
    var out = K.readouts(F.side), r = K.rng(3), S = null, dt = 0.01;
    function reset() { S = { t: 0, x: [a0.get() * Math.PI / 180, 0], xh: [0, 0], P: [[1, 0], [0, 1]], H: [] }; }
    function step() {
      var u = 0.15 * Math.sin(0.7 * S.t);                                                        // a small known torque
      S.x = [S.x[0] + dt * S.x[1], S.x[1] + dt * (-Math.sin(S.x[0]) + u)];                    // the real pendulum (Euler, same model)
      var xh = S.xh, A = [[1, dt], [-dt * Math.cos(xh[0]), 1]];
      S.xh = [xh[0] + dt * xh[1], xh[1] + dt * (-Math.sin(xh[0]) + u)];                        // prediction: x̂ = f(x̂, u)
      S.P = add(mm(mm(A, S.P), tr(A)), eye(2, q.get()));                                      // Γ = A Γ Aᵀ + Γα
      var y = S.x[1] + sg.get() * K.gauss(r), U = update(S.xh, S.P, [0, 1], y, S.xh[1], sg.get() * sg.get());   // correction with the gyro
      S.xh = U.x; S.P = U.P; S.t += dt;
      if (Math.round(S.t / dt) % 5 === 0) { S.H.push([S.t, S.x[0], S.xh[0], Math.sqrt(Math.max(0, S.P[0][0]))]); if (S.H.length > 400) S.H.shift(); }
    }
    function draw() {
      var C = K.C, H = S.H; if (!H.length) return;
      K.clear(c1); K.chart(c1, { x0: H[0][0], x1: Math.max(H[0][0] + 10, H[H.length - 1][0]), y0: -3, y1: 3, xl: L('time (s)', 'temps (s)'), yl: L('angle (rad)', 'angle (rad)'),
        series: [{ pts: H.map(function (p) { return [p[0], p[1]]; }), col: C.o, label: L('real angle x₁', 'vrai angle x₁') }, { pts: H.map(function (p) { return [p[0], p[2]]; }), col: C.b, label: L('estimated x̂₁', 'x̂₁ estimé') }, { pts: H.map(function (p) { return [p[0], p[2] + 2 * p[3]]; }), col: C.b, w: 1, dash: [4, 4] }, { pts: H.map(function (p) { return [p[0], p[2] - 2 * p[3]]; }), col: C.b, w: 1, dash: [4, 4] }] });
      var e = wrap(S.x[0] - S.xh[0]);
      out([[L('Time', 'Temps'), f(S.t, 1) + ' s'], [L('Angle error', 'Erreur d\'angle'), f(e * 180 / Math.PI, 1) + '°', Math.abs(e) < 0.05 ? 'ok' : 'bad'], [L('Uncertainty σ(x̂₁)', 'Incertitude σ(x̂₁)'), f(Math.sqrt(S.P[0][0]) * 180 / Math.PI, 1) + '°']]);
    }
    reset();
    var v3 = null, real = null, ghost = null;
    RA3D.scene(F.view, { ratio: 0.5, cam: [0, 1.25, 3.2], target: [0, 1.0, 0], floorSize: 2 }).then(function (v) {
      v3 = v; var T = v.T; F.view.insertBefore(v.box, c1.c);
      var post = new T.Mesh(new T.BoxGeometry(0.08, 1.9, 0.08), v.mat(0x3a3f48)); post.position.set(0, 0.95, -0.25); post.userData.raKeep = true; v.root.add(post);
      var beam = new T.Mesh(new T.BoxGeometry(0.08, 0.08, 0.35), v.mat(0x3a3f48)); beam.position.set(0, 1.9, -0.1); beam.userData.raKeep = true; v.root.add(beam);
      var make = function (col, op) { var g = new T.Group(); g.position.set(0, 1.9, 0.05); var m = v.mat(col, op ? { transparent: true, opacity: op } : {}); var rod = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 1.2, 12), m); rod.position.y = -0.6; var bob = new T.Mesh(new T.SphereGeometry(0.1, 24, 16), m); bob.position.y = -1.2; g.add(rod, bob); v.root.add(g); return g; };
      real = make(0xff9f43); ghost = make(0x5aa9ff, 0.45); ghost.position.z = 0.12;
      var gy = v.label(L('gyrometer', 'gyromètre'), '#b88cff', 0.09); gy.position.set(0.25, 1.95, 0.05); v.root.add(gy);
      v.frame(function (t, d) { for (var i = 0; i < Math.round(d / dt); i++) step(); real.rotation.z = S.x[0]; ghost.rotation.z = S.xh[0]; draw(); });
    });
    K.onView(w, function () { if (!v3) { var go = function () { if (v3) return; for (var i = 0; i < 2; i++) step(); draw(); requestAnimationFrame(go); }; requestAnimationFrame(go); } });
    K.redraws.push(function (rs) { if (rs) c1.fit(); draw(); });
  };

  // ================================================================ kf-uwb3d: multilateration with an EKF
  W['kf-uwb3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: a robot localised by UWB beacons', 'Labo 3D : un robot localisé par des balises UWB'),
      L('Three beacons measure their distance to the robot (time of flight, every 20 ms). The extended Kalman filter predicts with the wheel speeds u and ω, and corrects with each distance. The ground ellipse is the 3σ uncertainty, drawn 10 times larger. Start with a wrong heading: the filter finds it as soon as the robot moves.', 'Trois balises mesurent leur distance au robot (temps de vol, toutes les 20 ms). Le filtre de Kalman étendu prédit avec les vitesses u et ω, et corrige avec chaque distance. L\'ellipse au sol est l\'incertitude à 3σ, dessinée 10 fois plus grande. Partez avec un mauvais cap : le filtre le retrouve dès que le robot bouge.'));
    var nb = K.seg(F.ctl, L('Beacons used', 'Balises utilisées'), [['3', '3'], ['2', '2'], ['1', '1'], ['0', L('none (odometry only)', 'aucune (odométrie seule)')]], '3');
    var sd = K.slider(F.ctl, { label: L('Distance noise σ (cm)', 'Bruit de distance σ (cm)'), min: 1, max: 50, value: 5 });
    var hb = K.slider(F.ctl, { label: L('Initial heading error (°)', 'Erreur de cap initiale (°)'), min: 0, max: 120, value: 60, on: reset });
    var btn = el('button', { type: 'button', 'class': 'btn sm ghost' }, L('Start again', 'Recommencer')); F.ctl.appendChild(btn); btn.addEventListener('click', reset);
    var out = K.readouts(F.side), r = K.rng(9), S = null, dt = 0.02;
    var B = [[0, 0], [10, 0], [5, 9]];
    function reset() { S = { t: 0, x: [3, 2, 0.3], xh: [3, 2, 0.3 + hb.get() * Math.PI / 180], P: [[0.25, 0, 0], [0, 0.25, 0], [0, 0, 1]], tr: [], te: [] }; }
    function step() {
      var u = 1.0, om = 0.45 * Math.sin(0.35 * S.t) + 0.25;
      S.x = [S.x[0] + dt * u * Math.cos(S.x[2]), S.x[1] + dt * u * Math.sin(S.x[2]), S.x[2] + dt * om];
      var um = u * (1 + 0.03 * K.gauss(r)), wm = om + 0.03 * K.gauss(r), th = S.xh[2];   // odometry, slightly wrong
      var A = [[1, 0, -dt * um * Math.sin(th)], [0, 1, dt * um * Math.cos(th)], [0, 0, 1]];
      S.xh = [S.xh[0] + dt * um * Math.cos(th), S.xh[1] + dt * um * Math.sin(th), th + dt * wm];
      S.P = add(mm(mm(A, S.P), tr(A)), [[4e-4, 0, 0], [0, 4e-4, 0], [0, 0, 4e-4]]);
      var n = +nb.get(), sig = sd.get() / 100;
      for (var i = 0; i < n; i++) {
        var b = B[i], d = Math.hypot(S.x[0] - b[0], S.x[1] - b[1]) + sig * K.gauss(r), dh = Math.hypot(S.xh[0] - b[0], S.xh[1] - b[1]) || 1e-6;
        var U = update(S.xh, S.P, [(S.xh[0] - b[0]) / dh, (S.xh[1] - b[1]) / dh, 0], d, dh, sig * sig); S.xh = U.x; S.P = U.P;
      }
      S.xh[2] = wrap(S.xh[2]); S.t += dt;
      if (Math.round(S.t / dt) % 4 === 0) { S.tr.push([S.x[0], S.x[1]]); S.te.push([S.xh[0], S.xh[1]]); if (S.tr.length > 500) { S.tr.shift(); S.te.shift(); } }
      if (S.x[0] < -1 || S.x[0] > 11 || S.x[1] < -1 || S.x[1] > 10) S.x[2] = Math.atan2(4.5 - S.x[1], 5 - S.x[0]);   // stay in the room
    }
    reset();
    RA3D.scene(F.view, { ratio: 0.6, cam: [0, 9, 12.5], target: [0, 0, 0], floorSize: 8 }).then(function (v) {
      var T = v.T, P3 = function (x, y, z) { return new T.Vector3(x - 5, z || 0, -(y - 4.5)); };   // the room (0…10, 0…9) centred on the floor
      var room = new T.Group(); v.root.add(room);
      B.forEach(function (b, i) {
        var tw = new T.Mesh(new T.CylinderGeometry(0.12, 0.18, 1.6, 16), v.mat(0x3a3f48)); tw.position.copy(P3(b[0], b[1], 0.8)); tw.userData.raKeep = true; room.add(tw);
        var top = new T.Mesh(new T.SphereGeometry(0.2, 20, 14), v.mat(0xffd60a, { emissive: 0xffd60a, emissiveIntensity: 0.6 })); top.position.copy(P3(b[0], b[1], 1.7)); top.name = 'b' + i; room.add(top);
        var lb = v.label('B' + (i + 1), '#ffd60a', 0.45); lb.position.copy(P3(b[0], b[1], 2.3)); room.add(lb);
      });
      var robot = new T.Group(), body = new T.Mesh(new T.BoxGeometry(0.7, 0.3, 0.5), v.mat(0xff9f43)); body.position.y = 0.25; robot.add(body);
      var nose = new T.Mesh(new T.ConeGeometry(0.12, 0.3, 12), v.mat(0xff9f43)); nose.rotation.z = -Math.PI / 2; nose.position.set(0.5, 0.25, 0); robot.add(nose); v.root.add(robot);
      var ghost = robot.clone(); ghost.traverse(function (o) { if (o.material) { o.material = o.material.clone(); o.material.color.set(0x5aa9ff); o.material.transparent = true; o.material.opacity = 0.5; } }); v.root.add(ghost);
      var lt = v.line(0xff9f43), le = v.line(0x5aa9ff), ell = v.line(0x4ed17f), rays = [0, 1, 2].map(function () { var l = v.line(0xffd60a, true); v.root.add(l); return l; });
      v.root.add(lt, le, ell);
      v.frame(function (t, d) {
        for (var i = 0; i < Math.round(d / dt); i++) step();
        robot.position.copy(P3(S.x[0], S.x[1], 0)); robot.rotation.y = S.x[2]; ghost.position.copy(P3(S.xh[0], S.xh[1], 0)); ghost.rotation.y = S.xh[2];
        if (S.tr.length > 1) { lt.setPoints(S.tr.map(function (p) { return P3(p[0], p[1], 0.03); })); le.setPoints(S.te.map(function (p) { return P3(p[0], p[1], 0.05); })); }
        var G = [[S.P[0][0] * 100, S.P[0][1] * 100], [S.P[1][0] * 100, S.P[1][1] * 100]], e = ellipse([S.xh[0], S.xh[1]], G, 0.989);
        ell.setPoints(e.map(function (p) { return P3(p[0], p[1], 0.06); }));
        var n = +nb.get(); rays.forEach(function (l, k) { l.visible = k < n; if (k < n) l.setPoints([P3(B[k][0], B[k][1], 1.7), P3(S.x[0], S.x[1], 0.4)]); });
        var ep = Math.hypot(S.x[0] - S.xh[0], S.x[1] - S.xh[1]), eh = Math.abs(wrap(S.x[2] - S.xh[2]));
        out([[L('Time', 'Temps'), f(S.t, 1) + ' s'], [L('Position error', 'Erreur de position'), f(ep * 100, 1) + ' cm', ep < 0.1 ? 'ok' : ep > 0.5 ? 'bad' : ''], [L('Heading error', 'Erreur de cap'), f(eh * 180 / Math.PI, 1) + '°', eh < 0.05 ? 'ok' : 'bad'],
          [L('σ x, σ y, σ θ', 'σ x, σ y, σ θ'), f(Math.sqrt(S.P[0][0]) * 100, 1) + ' cm, ' + f(Math.sqrt(S.P[1][1]) * 100, 1) + ' cm, ' + f(Math.sqrt(S.P[2][2]) * 180 / Math.PI, 1) + '°']]);
      });
    });
  };

  // ================================================================ kf-multi: multimodal fusion
  W['kf-multi'] = function (w) {
    var F = K.frame(w, L('Lab: fuse a compass, angulation and TDOA at different rates', 'Labo : fusionner une boussole, l\'angulation et la TDOA à des cadences différentes'),
      L('Four beacons at (±10, ±10) m. The odometry predicts every 200 ms. The compass (M) measures θ every 200 ms; the angulation (B) measures the bearing of each beacon every 600 ms; the TDOA (T) measures differences of distance every 400 ms. Switch the sensors on and off and watch what each one can see.', 'Quatre balises en (±10, ±10) m. L\'odométrie prédit toutes les 200 ms. La boussole (M) mesure θ toutes les 200 ms ; l\'angulation (B) mesure le relèvement de chaque balise toutes les 600 ms ; la TDOA (T) mesure des différences de distance toutes les 400 ms. Allumez et éteignez les capteurs et regardez ce que chacun peut voir.'));
    var cv = K.canvas(F.view, 0.78, L('Top view of the robot and the beacons', 'Vue de dessus du robot et des balises'));
    var tl = K.canvas(F.view, 0.12, L('Timeline of the measurements', 'Frise des mesures'));
    var cM = K.check(F.ctl, L('M · compass θ (200 ms, 4·10⁻⁴ rad²)', 'M · boussole θ (200 ms, 4·10⁻⁴ rad²)'), true, reset);
    var cB = K.check(F.ctl, L('B · angulation (600 ms, 3.8·10⁻² rad²)', 'B · angulation (600 ms, 3,8·10⁻² rad²)'), false, reset);
    var cT = K.check(F.ctl, L('T · TDOA (400 ms, 10⁻² m²)', 'T · TDOA (400 ms, 10⁻² m²)'), false, reset);
    var btn = el('button', { type: 'button', 'class': 'btn sm ghost' }, L('Start again', 'Recommencer')); F.ctl.appendChild(btn); btn.addEventListener('click', reset);
    var out = K.readouts(F.side);
    var BE = [[-10, -10], [10, -10], [10, 10], [-10, 10]], r = K.rng(4), S = null, acc = 0;
    function reset() { S = { k: 0, x: [6, 0, Math.PI / 2], xh: [4, -2, Math.PI / 2 + 0.6], P: [[4, 0, 0], [0, 4, 0], [0, 0, 0.5]], tr: [], te: [], ev: [] }; }
    function tick() {                                                    // one step of 200 ms
      var u = 0.6, v = 0.1;                                             // displacement and rotation per step: a circle of radius 6 m
      S.x = [S.x[0] + u * Math.cos(S.x[2]), S.x[1] + u * Math.sin(S.x[2]), S.x[2] + v];
      var um = u + 0.03 * K.gauss(r), vm = v + 0.01 * K.gauss(r), th = S.xh[2];
      var A = [[1, 0, -um * Math.sin(th)], [0, 1, um * Math.cos(th)], [0, 0, 1]];
      S.xh = [S.xh[0] + um * Math.cos(th), S.xh[1] + um * Math.sin(th), th + vm]; S.P = add(mm(mm(A, S.P), tr(A)), [[1e-3, 0, 0], [0, 1e-3, 0], [0, 0, 1e-4]]);
      S.k++; var t = S.k * 0.2, ev = [];
      if (cM.checked) { var U = update(S.xh, S.P, [0, 0, 1], S.x[2] + 0.02 * K.gauss(r), S.xh[2], 4e-4); S.xh = U.x; S.P = U.P; ev.push('M'); }
      if (cB.checked && S.k % 3 === 0) { BE.forEach(function (b) {          // bearing of the beacon in the frame of the robot
        var g = Math.atan2(b[1] - S.x[1], b[0] - S.x[0]) - S.x[2] + Math.sqrt(0.038) * K.gauss(r), dx = b[0] - S.xh[0], dy = b[1] - S.xh[1], q = dx * dx + dy * dy, gh = Math.atan2(dy, dx) - S.xh[2];
        var U2 = update(S.xh, S.P, [dy / q, -dx / q, -1], gh + wrap(g - gh), gh, 0.038); S.xh = U2.x; S.P = U2.P; }); ev.push('B'); }
      if (cT.checked && S.k % 2 === 0) { [1, 2, 3].forEach(function (j) {    // differences of distance to beacon 1 and beacon j
        var d = function (p, b) { return Math.hypot(p[0] - b[0], p[1] - b[1]); }, b0 = BE[0], bj = BE[j], dd = d(S.x, b0) - d(S.x, bj) + 0.1 * K.gauss(r), d0 = d(S.xh, b0), dj = d(S.xh, bj);
        var c = [(S.xh[0] - b0[0]) / d0 - (S.xh[0] - bj[0]) / dj, (S.xh[1] - b0[1]) / d0 - (S.xh[1] - bj[1]) / dj, 0], U3 = update(S.xh, S.P, c, dd, d0 - dj, 0.01); S.xh = U3.x; S.P = U3.P; }); ev.push('T'); }
      S.xh[2] = S.x[2] + wrap(S.xh[2] - S.x[2]);
      S.tr.push([S.x[0], S.x[1]]); S.te.push([S.xh[0], S.xh[1]]); if (S.tr.length > 160) { S.tr.shift(); S.te.shift(); }
      S.ev.push([t, ev]); if (S.ev.length > 30) S.ev.shift();
    }
    function draw() {
      var C = K.C, c = cv.x, Wd = cv.w, H = cv.h, sc = Math.min(Wd, H) / 28, ox = Wd / 2, oy = H / 2, X = function (v) { return ox + v * sc; }, Y = function (v) { return oy - v * sc; };
      K.clear(cv); c.strokeStyle = C.grid; for (var g = -12; g <= 12; g += 2) { c.beginPath(); c.moveTo(X(g), Y(-12)); c.lineTo(X(g), Y(12)); c.stroke(); c.beginPath(); c.moveTo(X(-12), Y(g)); c.lineTo(X(12), Y(g)); c.stroke(); }
      BE.forEach(function (b, i) { c.fillStyle = C.y; c.beginPath(); c.arc(X(b[0]), Y(b[1]), 7, 0, 7); c.fill(); K.text(cv, 'B' + (i + 1), X(b[0]) + 10, Y(b[1]) - 8, C.y, 11); });
      [[S.tr, C.o], [S.te, C.b]].forEach(function (s) { c.strokeStyle = s[1]; c.lineWidth = 2; c.beginPath(); s[0].forEach(function (p, k) { if (k) c.lineTo(X(p[0]), Y(p[1])); else c.moveTo(X(p[0]), Y(p[1])); }); c.stroke(); });
      var e = ellipse([S.xh[0], S.xh[1]], [[S.P[0][0], S.P[0][1]], [S.P[1][0], S.P[1][1]]], 0.95); c.strokeStyle = C.g; c.lineWidth = 2; c.beginPath(); e.forEach(function (p, k) { if (k) c.lineTo(X(p[0]), Y(p[1])); else c.moveTo(X(p[0]), Y(p[1])); }); c.stroke();
      var robot = function (p, col) { c.save(); c.translate(X(p[0]), Y(p[1])); c.rotate(-p[2]); c.fillStyle = col; c.beginPath(); c.moveTo(14, 0); c.lineTo(-9, 8); c.lineTo(-9, -8); c.closePath(); c.fill(); c.restore(); };
      robot(S.x, C.o); robot(S.xh, C.b);
      K.text(cv, L('orange: real · blue: estimate · green: 95 % ellipse', 'orange : réel · bleu : estimation · vert : ellipse à 95 %'), 10, 16, C.axis, 11);
      K.clear(tl); var tx = tl.x; S.ev.forEach(function (e2, k) { var x0 = 30 + k * (tl.w - 40) / 30; ['M', 'B', 'T'].forEach(function (m, j) { if (e2[1].indexOf(m) >= 0) { tx.fillStyle = [C.p, C.y, C.g][j]; tx.fillRect(x0, 6 + j * (tl.h - 12) / 3, 8, (tl.h - 12) / 3 - 3); } }); });
      ['M', 'B', 'T'].forEach(function (m, j) { K.text(tl, m, 10, 6 + (j + 0.75) * (tl.h - 12) / 3, [C.p, C.y, C.g][j], 11, 'left', true); });
      var ep = Math.hypot(S.x[0] - S.xh[0], S.x[1] - S.xh[1]), eh = Math.abs(wrap(S.x[2] - S.xh[2])), sp = Math.sqrt(S.P[0][0] + S.P[1][1]);
      out([[L('Position error', 'Erreur de position'), f(ep, 2) + ' m', ep < 0.3 ? 'ok' : 'bad'], [L('Heading error', 'Erreur de cap'), f(eh * 180 / Math.PI, 1) + '°', eh < 0.05 ? 'ok' : 'bad'], [L('Position uncertainty σ', 'Incertitude de position σ'), f(sp, 2) + ' m' + (sp > 3 ? L(' (growing: position not observed)', ' (grandit : position non observée)') : ''), sp > 3 ? 'bad' : ''], [L('Heading uncertainty σ', 'Incertitude de cap σ'), f(Math.sqrt(S.P[2][2]) * 180 / Math.PI, 1) + '°']]);
    }
    reset();
    var raf = 0, last = 0, loop = function (now) { var d = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; acc += d; while (acc > 0.1) { acc -= 0.1; tick(); } draw(); raf = requestAnimationFrame(loop); };
    K.onView(w, function () { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(loop); }, function () { cancelAnimationFrame(raf); });
    K.redraws.push(function (rs) { if (rs) { cv.fit(); tl.fit(); } draw(); });
  };
})();
