// learn-teleop-widgets.js — the labs of the course "Teleoperation, cobotics, control architectures and safety" (learn-teleop.html).
// Each widget is mounted on <div class="widget" data-widget="tel-...">. Texts in English and French with L(en, fr).
//   tel-lag     drive a remote robot through a delay (move and wait)
//   tel-msd     the mass-spring-damper: what an impedance does (TD1, step 2)
//   tel-lab     the master-slave simulator of TD1 and TD2: 7 architectures, a remote wall, an imperfect force sensor,
//               a delay, wave variables, scopes and a 3D view (data-preset = free | wall | arch | delay)
//   tel-levels  the four levels of human-robot interaction, animated
//   tel-coman   co-manipulation: amplification, scaling, guiding, filtering (drag the handle)
//   tel-arch    a robot in an arena: sense-plan-act against subsumption
//   tel-pat     the PAT architecture: choose the level of autonomy
//   tel-machine machine, partly completed machinery, or neither?
//   tel-3step   sort safety measures into the three steps
//   tel-plr     the ISO 13849-1 risk graph: required performance level
(function () {
  'use strict';
  var FR = (window.RA && RA.lang) === 'fr';
  var L = function (en, fr) { return FR ? fr : en; };
  var f = function (v, d) { return (isFinite(v) ? (+v).toFixed(d === undefined ? 2 : d) : '∞').replace('.', FR ? ',' : '.').replace(/^-/, '−'); };
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html !== undefined) e.innerHTML = html; return e; }
  var C = {};
  function colours() {
    var cs = getComputedStyle(document.documentElement), g = function (n, d) { return (cs.getPropertyValue(n) || '').trim() || d; };
    C = { bg: g('--fpanel', '#141c2b'), ink: g('--f-ink', '#d6dfeb'), axis: g('--f-axis', '#a3b0c2'), grid: g('--f-grid', '#2c3a50'), box: g('--f-box', '#1c2638'),
      o: g('--f-o', '#ffa04d'), b: g('--f-b', '#5aa9ff'), g: g('--f-g', '#4ed17f'), r: g('--f-r', '#ff6b6b'), p: g('--f-p', '#b88cff'), y: g('--f-y', '#ffd60a'), mute: g('--f-mute', '#8a99ae') };
  }
  colours();
  var redraws = [];
  new MutationObserver(function () { colours(); redraws.forEach(function (r) { r(); }); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var rt = 0; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { redraws.forEach(function (r) { r(true); }); }, 150); });

  // ---------------------------------------------------------------- small UI helpers
  function canvas(host, ratio, label) {
    var c = el('canvas', { 'class': 'tw-cv', role: 'img', 'aria-label': label || '' }); host.appendChild(c);
    var o = { c: c, x: c.getContext('2d'), w: 0, h: 0 };
    o.fit = function () { var w = Math.max(240, c.clientWidth || host.clientWidth || 600), h = Math.round(w * ratio), d = window.devicePixelRatio || 1; c.width = Math.round(w * d); c.height = Math.round(h * d); c.style.height = h + 'px'; o.x.setTransform(d, 0, 0, d, 0, 0); o.w = w; o.h = h; };
    o.fit(); return o;
  }
  function clear(cv) { cv.x.fillStyle = C.bg; cv.x.fillRect(0, 0, cv.w, cv.h); }
  function text(cv, s, px, py, col, size, align, bold) { var x = cv.x; x.fillStyle = col || C.ink; x.font = (bold ? '600 ' : '') + (size || 12) + 'px "IBM Plex Mono", ui-monospace, monospace'; x.textAlign = align || 'left'; x.fillText(s, px, py); }
  // a chart: { x0, x1, y0, y1, series: [{ pts:[[x,y]], col, w, dash, label }], xl, yl, cursor, hlines: [{ y, col, label }] }
  function chart(cv, o, area) {
    var x = cv.x, A = area || { l: 52, t: 14, r: cv.w - 12, b: cv.h - 30 };
    var X = function (v) { return A.l + (v - o.x0) / (o.x1 - o.x0) * (A.r - A.l); }, Y = function (v) { return A.b - (v - o.y0) / (o.y1 - o.y0) * (A.b - A.t); };
    x.lineWidth = 1; x.strokeStyle = C.grid; x.setLineDash([]);
    var dec = function (span) { return span < 0.5 ? 2 : span < 5 ? 1 : 0; };
    for (var i = 0; i <= 5; i++) { var vx = o.x0 + (o.x1 - o.x0) * i / 5; x.beginPath(); x.moveTo(X(vx), A.t); x.lineTo(X(vx), A.b); x.stroke(); text(cv, f(vx, dec(o.x1 - o.x0)), X(vx), A.b + 14, C.axis, 11, 'center'); }
    for (i = 0; i <= 4; i++) { var vy = o.y0 + (o.y1 - o.y0) * i / 4; x.beginPath(); x.moveTo(A.l, Y(vy)); x.lineTo(A.r, Y(vy)); x.stroke(); text(cv, f(vy, dec(o.y1 - o.y0)), A.l - 6, Y(vy) + 4, C.axis, 11, 'right'); }
    if (o.y0 < 0 && o.y1 > 0) { x.strokeStyle = C.axis; x.beginPath(); x.moveTo(A.l, Y(0)); x.lineTo(A.r, Y(0)); x.stroke(); }
    if (o.xl) text(cv, o.xl, A.r, A.b + 27, C.axis, 11, 'right');
    if (o.yl) text(cv, o.yl, A.l + 4, A.t + 11, C.axis, 11, 'left');
    x.save(); x.beginPath(); x.rect(A.l, A.t, A.r - A.l, A.b - A.t); x.clip();
    (o.hlines || []).forEach(function (h) { x.strokeStyle = h.col; x.setLineDash([6, 4]); x.lineWidth = 1.5; x.beginPath(); x.moveTo(A.l, Y(h.y)); x.lineTo(A.r, Y(h.y)); x.stroke(); x.setLineDash([]); if (h.label) text(cv, h.label, A.r - 4, Y(h.y) - 4, h.col, 10, 'right'); });
    o.series.forEach(function (s) {
      x.strokeStyle = s.col; x.lineWidth = s.w || 2; x.setLineDash(s.dash || []); x.beginPath();
      s.pts.forEach(function (p, k) { var py = Math.max(-1e4, Math.min(1e4, Y(p[1]))); if (k) x.lineTo(X(p[0]), py); else x.moveTo(X(p[0]), py); });
      x.stroke();
    });
    x.restore(); x.setLineDash([]);
    var labs = o.series.filter(function (s) { return s.label; });
    if (labs.length) {
      x.font = '11px "IBM Plex Mono", ui-monospace, monospace';
      var lw = Math.max.apply(null, labs.map(function (s) { return x.measureText(s.label).width; })) + 40, lh = labs.length * 15 + 8, lx = A.r - lw - 6, ly0 = A.t + 6;
      x.fillStyle = C.bg; x.globalAlpha = 0.85; x.fillRect(lx, ly0 - 2, lw, lh); x.globalAlpha = 1; x.strokeStyle = C.grid; x.strokeRect(lx, ly0 - 2, lw, lh);
      labs.forEach(function (s, k) { var ly = ly0 + 12 + k * 15; x.fillStyle = s.col; x.fillRect(lx + 8, ly - 5, 14, 3); text(cv, s.label, lx + 28, ly, s.col, 11); });
    }
    if (o.cursor !== undefined) { x.strokeStyle = C.y; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(X(o.cursor), A.t); x.lineTo(X(o.cursor), A.b); x.stroke(); x.setLineDash([]); }
    return { X: X, Y: Y, A: A };
  }
  function range(arr) { var lo = Infinity, hi = -Infinity; arr.forEach(function (v) { if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }); if (!isFinite(lo)) { lo = -1; hi = 1; } if (hi - lo < 1e-6) { lo -= 0.5; hi += 0.5; } var m = (hi - lo) * 0.1; return [lo - m, hi + m]; }
  function slider(host, o) {
    var id = 'tw' + Math.random().toString(36).slice(2, 8), w = el('div', { 'class': 'tw-sl' });
    w.innerHTML = '<label for="' + id + '">' + o.label + '</label><input id="' + id + '" type="range" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || 1) + '" value="' + o.value + '"><output></output>';
    host.appendChild(w);
    var i = w.querySelector('input'), b = w.querySelector('output');
    var val = function () { var v = +i.value; return o.map ? o.map(v) : v; };
    var show = function () { b.textContent = o.fmt ? o.fmt(val()) : f(val(), o.dec || 0) + (o.unit || ''); };
    i.addEventListener('input', function () { show(); if (o.on) o.on(); }); show();
    return { get: val, set: function (v) { i.value = v; show(); }, row: w };
  }
  function seg(host, label, opts, val, cb) {
    var w = el('div', { 'class': 'tw-seg', role: 'radiogroup', 'aria-label': label });
    w.innerHTML = (label ? '<span>' + label + '</span>' : '') + '<div>' + opts.map(function (o) { return '<button type="button" role="radio" data-v="' + o[0] + '" aria-checked="' + (o[0] === val) + '">' + o[1] + '</button>'; }).join('') + '</div>';
    host.appendChild(w); var cur = val;
    var set = function (v) { cur = v; [].forEach.call(w.querySelectorAll('button'), function (x) { x.setAttribute('aria-checked', String(x.dataset.v === cur)); }); };
    w.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (!b || b.dataset.v === cur) return; set(b.dataset.v); if (cb) cb(cur); });
    return { get: function () { return cur; }, set: set, row: w };
  }
  function check(host, label, on, cb) { var w = el('label', { 'class': 'tw-ck' }, '<input type="checkbox"' + (on ? ' checked' : '') + '> ' + label); host.appendChild(w); var i = w.querySelector('input'); i.addEventListener('change', cb); return i; }
  function readouts(host) { var d = el('div', { 'class': 'tw-read', 'aria-live': 'polite' }); host.appendChild(d); return function (rows) { d.innerHTML = rows.map(function (r) { return '<div' + (r[2] ? ' class="' + r[2] + '"' : '') + '><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join(''); }; }
  function note(host, html) { var p = el('p', { 'class': 'tw-note' }, html); host.appendChild(p); return p; }
  function frame(w, title, intro) {
    w.innerHTML = '<h4>' + title + '</h4>' + (intro ? '<p class="wnote">' + intro + '</p>' : '') + '<div class="tw-grid"><div class="tw-view"></div><div class="tw-side"><div class="tw-ctl"></div></div></div>';
    return { view: w.querySelector('.tw-view'), ctl: w.querySelector('.tw-ctl'), side: w.querySelector('.tw-side') };
  }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var W = {};

  // ================================================================ tel-lag: driving through a delay
  W['tel-lag'] = function (w) {
    var F = frame(w, L('Lab: drive a remote robot through a delay', 'Labo : piloter un robot distant à travers un retard'),
      L('Move the master (the slider, or drag in the picture). The remote robot receives your orders after the delay, and you see it only after the same delay again. Put the robot in the green zone and keep it there for one second. Then raise the delay.', 'Bougez le maître (le curseur, ou glissez dans l\'image). Le robot distant reçoit vos ordres après le retard, et vous ne le voyez qu\'après le même retard encore. Mettez le robot dans la zone verte et gardez-l\'y une seconde. Puis augmentez le retard.'));
    var cv = canvas(F.view, 0.42, L('Master and remote robot on a line', 'Maître et robot distant sur une ligne'));
    var master = slider(F.ctl, { label: L('Master position', 'Position du maître'), min: 0, max: 1000, value: 100, map: function (v) { return v / 1000; }, fmt: function (v) { return f(v * 100, 0) + ' %'; } });
    var delay = slider(F.ctl, { label: L('One-way delay', 'Retard aller'), min: 0, max: 2000, step: 50, value: 300, fmt: function (v) { return f(v / 1000, 2) + ' s'; }, on: restart });
    var out = readouts(F.side);
    var target = 0.7, hist = [], t0 = performance.now(), inside = 0, best = null, done = false, last = 0, raf = 0;
    function restart() { hist = []; t0 = performance.now(); inside = 0; done = false; target = 0.3 + Math.random() * 0.6; }
    cv.c.addEventListener('pointerdown', function (e) { cv.c.setPointerCapture(e.pointerId); move(e); }); cv.c.addEventListener('pointermove', function (e) { if (e.buttons) move(e); });
    function move(e) { var r = cv.c.getBoundingClientRect(); master.set(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left - 30) / (r.width - 60))) * 1000)); }
    function at(t) { for (var i = hist.length - 1; i >= 0; i--) if (hist[i][0] <= t) return hist[i][1]; return hist.length ? hist[0][1] : 0.1; }
    function loop(now) {
      var t = (now - t0) / 1000, d = delay.get() / 1000, dt = last ? (now - last) / 1000 : 0; last = now;
      hist.push([t, master.get()]); while (hist.length > 2 && hist[1][0] < t - 2 * d - 1) hist.shift();
      var robot = at(t - d), seen = at(t - 2 * d), ok = Math.abs(robot - target) < 0.04;
      inside = ok ? inside + dt : 0;
      if (inside >= 1 && !done) { done = true; best = t; }
      clear(cv); var x = cv.x, W0 = cv.w, H = cv.h, X = function (v) { return 30 + v * (W0 - 60); };
      x.fillStyle = C.g; x.globalAlpha = 0.25; x.fillRect(X(target - 0.04), 20, X(target + 0.04) - X(target - 0.04), H - 40); x.globalAlpha = 1;
      [[H * 0.3, L('master (you)', 'maître (vous)'), C.b, master.get()], [H * 0.62, L('remote robot (real)', 'robot distant (réel)'), C.o, robot], [H * 0.85, L('what your screen shows', 'ce que montre votre écran'), C.p, seen]].forEach(function (r) {
        x.strokeStyle = C.grid; x.lineWidth = 2; x.beginPath(); x.moveTo(X(0), r[0]); x.lineTo(X(1), r[0]); x.stroke();
        x.fillStyle = r[2]; x.beginPath(); x.arc(X(r[3]), r[0], 9, 0, 7); x.fill(); text(cv, r[1], 30, r[0] - 13, r[2], 11);
      });
      text(cv, done ? L('✓ held for 1 s in ', '✓ tenu 1 s en ') + f(best, 1) + ' s' : L('time: ', 'temps : ') + f(t, 1) + ' s', W0 - 30, 16, done ? C.g : C.axis, 12, 'right', true);
      out([[L('Round trip (order + image)', 'Aller-retour (ordre + image)'), f(2 * d, 2) + ' s'], [L('Gap master – robot', 'Écart maître – robot'), f(Math.abs(master.get() - robot) * 100, 0) + ' %', Math.abs(master.get() - robot) > 0.1 ? 'bad' : ''], [L('In the zone', 'Dans la zone'), ok ? f(inside, 1) + ' s' : '—', ok ? 'ok' : '']]);
      raf = requestAnimationFrame(loop);
    }
    note(F.side, L('With a long delay, the winning strategy is <b>move and wait</b>: a small move, wait for the image, correct. This is how the first space teleoperations worked, and why high delays call for more autonomy on the robot side.', 'Avec un long retard, la stratégie gagnante est <b>bouger puis attendre</b> : un petit mouvement, attendre l\'image, corriger. C\'est ainsi que marchaient les premières téléopérations spatiales, et c\'est pourquoi les grands retards demandent plus d\'autonomie côté robot.'));
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cancelAnimationFrame(raf); if (e.isIntersecting) { last = 0; raf = requestAnimationFrame(loop); } }); }); io.observe(w);
    redraws.push(function (resize) { if (resize) cv.fit(); });
  };

  // ================================================================ tel-msd: mass-spring-damper
  W['tel-msd'] = function (w) {
    var F = frame(w, L('Lab: the mass-spring-damper (an impedance)', 'Labo : la masse-ressort-amortisseur (une impédance)'),
      L('This is the master of TD1 alone: a mass m pushed by the operator force F = A sin(2π f t), slowed by a damper b and pulled back by a spring k. Change one value at a time and watch the position, the speed and the acceleration.', 'C\'est le maître du TD1 seul : une masse m poussée par la force de l\'opérateur F = A sin(2π f t), freinée par un amortisseur b et rappelée par un ressort k. Changez une valeur à la fois et regardez la position, la vitesse et l\'accélération.'));
    var anim = canvas(F.view, 0.22, L('A block on a spring and a damper', 'Un bloc sur un ressort et un amortisseur')), c1 = canvas(F.view, 0.36), c2 = canvas(F.view, 0.36);
    var m = slider(F.ctl, { label: L('Mass m (kg)', 'Masse m (kg)'), min: 1, max: 100, value: 50, map: function (v) { return v / 10; }, dec: 1, on: run });
    var b = slider(F.ctl, { label: L('Damping b (N·s/m)', 'Amortissement b (N·s/m)'), min: 0, max: 400, value: 50, map: function (v) { return v / 10; }, dec: 1, on: run });
    var k = slider(F.ctl, { label: L('Stiffness k (N/m)', 'Raideur k (N/m)'), min: 0, max: 500, value: 0, on: run });
    var A = slider(F.ctl, { label: L('Force amplitude A (N)', 'Amplitude de la force A (N)'), min: 0, max: 30, value: 10, on: run });
    var fq = slider(F.ctl, { label: L('Force frequency f (Hz)', 'Fréquence de la force f (Hz)'), min: 2, max: 200, value: 16, map: function (v) { return v / 100; }, dec: 2, on: run });
    var out = readouts(F.side), R = null, t0 = performance.now(), raf = 0;
    function run() {
      var dt = 0.002, T = 12, x = 0, v = 0, pts = { x: [], v: [], a: [], F: [] }, M = m.get(), B = b.get(), K = k.get();
      for (var i = 0; i * dt <= T; i++) { var t = i * dt, Fh = A.get() * Math.sin(2 * Math.PI * fq.get() * t), a = (Fh - B * v - K * x) / M; v += a * dt; x += v * dt; if (i % 10 === 0) { pts.x.push([t, x]); pts.v.push([t, v]); pts.a.push([t, a]); pts.F.push([t, Fh]); } }
      R = pts;
      var w0 = Math.sqrt(K / M), z = K > 0 ? B / (2 * Math.sqrt(K * M)) : Infinity, Om = 2 * Math.PI * fq.get();
      var Z = Math.sqrt(Math.pow(K - M * Om * Om, 2) + Math.pow(B * Om, 2));             // |Zd(jω)| = |k − mω² + j b ω|
      out([
        [L('Natural frequency √(k/m)', 'Pulsation propre √(k/m)'), K ? f(w0, 2) + ' rad/s (' + f(w0 / (2 * Math.PI), 2) + ' Hz)' : L('none (k = 0)', 'aucune (k = 0)')],
        [L('Damping ratio ζ = b / (2√(km))', 'Amortissement ζ = b / (2√(km))'), K ? f(z, 2) + (z < 1 ? L(' (oscillates)', ' (oscille)') : L(' (no overshoot)', ' (sans dépassement)')) : '—', K && z < 0.3 ? 'bad' : ''],
        [L('|Z_d| at the force frequency', '|Z_d| à la fréquence de la force'), f(Z, 1) + ' N/m'],
        [L('Expected amplitude A / |Z_d|', 'Amplitude attendue A / |Z_d|'), f(A.get() / Z * 100, 1) + ' cm']
      ]);
      draw();
    }
    function draw() {
      if (!R) return;
      clear(c1); var rx = range(R.x.map(function (p) { return p[1]; })), rv = range(R.v.map(function (p) { return p[1]; }));
      chart(c1, { x0: 0, x1: 12, y0: Math.min(rx[0], rv[0]), y1: Math.max(rx[1], rv[1]), xl: L('time (s)', 'temps (s)'), yl: L('x (m), v (m/s)', 'x (m), v (m/s)'), series: [{ pts: R.x, col: C.b, label: L('position x', 'position x') }, { pts: R.v, col: C.g, label: L('speed v', 'vitesse v') }] });
      clear(c2); var rf = range(R.F.map(function (p) { return p[1]; }).concat(R.a.map(function (p) { return p[1]; })));
      chart(c2, { x0: 0, x1: 12, y0: rf[0], y1: rf[1], xl: L('time (s)', 'temps (s)'), yl: L('F (N), a (m/s²)', 'F (N), a (m/s²)'), series: [{ pts: R.F, col: C.o, label: L('operator force F', 'force de l\'opérateur F') }, { pts: R.a, col: C.r, w: 1.5, label: L('acceleration a', 'accélération a') }] });
    }
    function animate(now) {
      if (R) {
        var t = ((now - t0) / 1000) % 12, i = Math.min(R.x.length - 1, Math.round(t / 0.02)), xv = R.x[i][1], fv = R.F[i][1];
        var span = range(R.x.map(function (p) { return p[1]; })), sc = (anim.w * 0.5) / Math.max(0.05, span[1] - span[0]);
        clear(anim); var x = anim.x, H = anim.h, wall = 24, cx = anim.w * 0.55 + (xv - (span[0] + span[1]) / 2) * sc, bw = 54;
        x.fillStyle = C.mute; x.fillRect(wall - 10, 8, 10, H - 16);
        x.strokeStyle = C.g; x.lineWidth = 2; x.beginPath(); var y1 = H * 0.35, n = 12; x.moveTo(wall, y1); for (var s = 1; s < n; s++) x.lineTo(wall + (cx - bw / 2 - wall) * s / n, y1 + (s % 2 ? -7 : 7)); x.lineTo(cx - bw / 2, y1); x.stroke();
        var y2 = H * 0.68, mid = wall + (cx - bw / 2 - wall) * 0.5; x.strokeStyle = C.p; x.beginPath(); x.moveTo(wall, y2); x.lineTo(mid, y2); x.moveTo(mid - 14, y2 - 9); x.lineTo(mid + 4, y2 - 9); x.lineTo(mid + 4, y2 + 9); x.lineTo(mid - 14, y2 + 9); x.moveTo(mid - 4, y2 - 6); x.lineTo(mid - 4, y2 + 6); x.moveTo(mid - 4, y2); x.lineTo(cx - bw / 2, y2); x.stroke();
        x.fillStyle = C.b; x.fillRect(cx - bw / 2, H * 0.18, bw, H * 0.64); text(anim, 'm', cx, H * 0.56, C.bg, 14, 'center', true);
        x.strokeStyle = C.o; x.fillStyle = C.o; x.lineWidth = 3; var L1 = fv * 4; x.beginPath(); x.moveTo(cx + bw / 2, H / 2); x.lineTo(cx + bw / 2 + L1, H / 2); x.stroke();
        if (Math.abs(L1) > 6) { var d = Math.sign(L1); x.beginPath(); x.moveTo(cx + bw / 2 + L1, H / 2); x.lineTo(cx + bw / 2 + L1 - 8 * d, H / 2 - 5); x.lineTo(cx + bw / 2 + L1 - 8 * d, H / 2 + 5); x.fill(); }
        text(anim, 'k', wall + 6, y1 - 10, C.g, 11); text(anim, 'b', wall + 6, y2 + 20, C.p, 11); text(anim, 'F', cx + bw / 2 + 8, H / 2 - 8, C.o, 11);
        draw(); var cvs = [c1, c2]; cvs.forEach(function (c) { var X = 52 + t / 12 * (c.w - 64); c.x.strokeStyle = C.y; c.x.setLineDash([3, 4]); c.x.beginPath(); c.x.moveTo(X, 14); c.x.lineTo(X, c.h - 30); c.x.stroke(); c.x.setLineDash([]); });
      }
      raf = requestAnimationFrame(animate);
    }
    run();
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cancelAnimationFrame(raf); if (e.isIntersecting) raf = requestAnimationFrame(animate); }); }); io.observe(w);
    redraws.push(function (resize) { if (resize) { anim.fit(); c1.fit(); c2.fit(); } draw(); });
  };

  // ================================================================ the master-slave simulator (TD1, TD2)
  var ARCH = {
    pp: [L('Position – position', 'Position – position'), L('The master sends its position, the slave sends its position back; two springs K pull each towards the other.', 'Le maître envoie sa position, l\'esclave renvoie la sienne ; deux ressorts K tirent chacun vers l\'autre.')],
    pv: [L('Position – speed', 'Position – vitesse'), L('The position of the master (a joystick) sets the speed of the slave. The master only feels its own centring spring.', 'La position du maître (un joystick) fixe la vitesse de l\'esclave. Le maître ne sent que son propre ressort de rappel.')],
    fp: [L('Force – position', 'Force – position'), L('Position goes to the slave; the force measured by the sensor of the slave comes back to the master, times a gain α.', 'La position va à l\'esclave ; la force mesurée par le capteur de l\'esclave revient au maître, multipliée par un gain α.')],
    ff: [L('Force – force', 'Force – force'), L('The force of the operator is measured and sent to the slave; the force of the environment comes back. No position is sent: the positions drift apart.', 'La force de l\'opérateur est mesurée et envoyée à l\'esclave ; la force de l\'environnement revient. Aucune position n\'est envoyée : les positions dérivent.')],
    c4: [L('4 channels (Lawrence, speed + force)', '4 canaux (Lawrence, vitesse + force)'), L('Speed and force in both directions: the best transparency in theory, but no position: it drifts.', 'Vitesse et force dans les deux sens : la meilleure transparence en théorie, mais pas de position : ça dérive.')],
    c4p: [L('4 channels, position + force', '4 canaux, position + force'), L('Position and force in both directions: very transparent and no drift.', 'Position et force dans les deux sens : très transparent et sans dérive.')],
    wave: [L('Wave variables', 'Variables d\'onde'), L('Speed and force are coded as waves u and v before crossing the delay: the channel stays passive (it cannot create energy), whatever the delay.', 'Vitesse et force sont codées en ondes u et v avant de traverser le retard : le canal reste passif (il ne peut pas créer d\'énergie), quel que soit le retard.')]
  };
  function simulate(p) {
    var dt = 0.0005, T = p.T, N = Math.round(T / dt), D = Math.max(1, Math.round(p.delay / dt)), r = rng(17), s2b = Math.sqrt(2 * p.b);
    // (D is at least one step: a value is received after it was sent)
    var xm = 0, vm = 0, xs = 0, vs = 0, nz = 0, nzh = 0;
    // what crosses the channel, one sample per step (the receiver reads the value sent D steps ago)
    var M2S = new Float64Array((N + 1) * 4), S2M = new Float64Array((N + 1) * 4);
    var out = { t: [], xm: [], xs: [], fh: [], fe: [], felt: [], ok: true, p: p }, felt = 0;
    var sensor = function (F, n) { var v = F + n; return p.quant > 0 ? Math.round(v / p.quant) * p.quant : v; };
    for (var i = 0; i <= N; i++) {
      var t = i * dt;
      var Fh = p.fh === 'push' ? p.amp * (t < 1 ? t : t < 6 ? 1 : Math.max(0, 7 - t)) : p.amp * Math.sin(2 * Math.PI * p.freq * t);
      var Fe = p.wall && xs > p.xw ? Math.max(0, p.Kw * (xs - p.xw) + p.dw * vs) : 0;
      if (i % 2 === 0) { nz = p.noise * gauss(r); nzh = p.noise * gauss(r); }                 // band-limited noise (1 kHz)
      var FeM = sensor(Fe, nz), FhM = sensor(Fh, nzh);
      var j = i - D, rm = j >= 0 ? j * 4 : -1;                                                 // index of the sample received now
      var g = function (A, k) { return rm >= 0 ? A[rm + k] : 0; };
      var Fm = 0, Fs = 0;
      switch (p.arch) {
        case 'pp': Fs = p.Kps * (g(M2S, 0) - xs); Fm = p.Kpm * (g(S2M, 0) - xm); M2S[i * 4] = xm; S2M[i * 4] = xs; break;
        case 'pv': Fs = 60 * (p.gv * g(M2S, 0) - vs); Fm = -p.Kpm * xm; M2S[i * 4] = xm; break;
        case 'fp': Fs = p.Kps * (g(M2S, 0) - xs); Fm = -p.alpha * g(S2M, 2); M2S[i * 4] = xm; S2M[i * 4 + 2] = FeM; break;
        case 'ff': Fs = g(M2S, 2); Fm = -p.alpha * g(S2M, 2); M2S[i * 4 + 2] = FhM; S2M[i * 4 + 2] = FeM; break;
        case 'c4': Fs = p.Cv * (g(M2S, 1) - vs) + g(M2S, 2); Fm = p.Cv * (g(S2M, 1) - vm) - p.alpha * g(S2M, 2); M2S[i * 4 + 1] = vm; M2S[i * 4 + 2] = FhM; S2M[i * 4 + 1] = vs; S2M[i * 4 + 2] = FeM; break;
        case 'c4p': Fs = p.Kps * (g(M2S, 0) - xs) + g(M2S, 2); Fm = p.Kpm * (g(S2M, 0) - xm) - p.alpha * g(S2M, 2); M2S[i * 4] = xm; M2S[i * 4 + 2] = FhM; S2M[i * 4] = xs; S2M[i * 4 + 2] = FeM; break;
        case 'wave': {
          var vRec = g(S2M, 3), Fw = p.b * vm - s2b * vRec;                                     // master side: the force the transmission asks for
          Fm = -Fw; M2S[i * 4 + 3] = s2b * vm - vRec;
          var uRec = g(M2S, 3);                                                                 // slave side: speed controller fed by the wave
          Fs = p.Kv * (s2b * uRec / p.b - vs) / (1 + p.Kv / p.b);
          var vd = (s2b * uRec - Fs) / p.b; S2M[i * 4 + 3] = (p.b * vd - Fs) / s2b; break;
        }
      }
      var Fhand = Fh - p.kh * xm - p.bh * vm;                                                   // the arm of the operator is a spring and a damper too
      var am = (Fhand + Fm - p.dm * vm) / p.mm, as = (Fs - p.ds * vs - Fe) / p.ms;
      vm += am * dt; xm += vm * dt; vs += as * dt; xs += vs * dt;
      felt = -Fm;
      if (!(Math.abs(xm) < 60 && Math.abs(xs) < 60)) { out.ok = false; out.tEnd = t; break; }
      if (i % 10 === 0) { out.t.push(t); out.xm.push(xm); out.xs.push(xs); out.fh.push(Fh); out.fe.push(Fe); out.felt.push(felt); }
    }
    // a few numbers to read the run
    var n = out.t.length, err = 0, cnt = 0, fe = 0, fl = 0, cc = 0, pen = 0, penM = 0;
    for (var k = 0; k < n; k++) {
      if (out.fe[k] < 0.3) { err += Math.pow(out.xm[k] - out.xs[k], 2); cnt++; }
      else { fe += out.fe[k]; fl += out.felt[k]; cc++; }
      if (p.wall) { pen = Math.max(pen, out.xs[k] - p.xw); penM = Math.max(penM, out.xm[k] - p.xw); }
    }
    out.err = cnt ? Math.sqrt(err / cnt) : 0; out.ratio = cc ? fl / fe : null; out.pen = pen; out.penM = penM; out.drift = n ? Math.abs(out.xm[n - 1] - out.xs[n - 1]) : 0; out.contact = cc * 0.005;
    // oscillations: how much the slave force changes sign quickly during contact
    var sm = out.felt.map(function (v, k2) { var a = 0, c2 = 0; for (var q = Math.max(0, k2 - 6); q <= Math.min(n - 1, k2 + 6); q++) { a += out.felt[q]; c2++; } return a / c2; });   // smoothed over 65 ms: the noise is not an oscillation
    var osc = 0; for (k = 2; k < n; k++) if (out.fe[k] > 0.3 && (sm[k] - sm[k - 1]) * (sm[k - 1] - sm[k - 2]) < 0 && Math.abs(sm[k] - sm[k - 2]) > 0.6) osc++;
    out.osc = osc;
    // growing oscillations: the gap master-slave keeps growing, or the slave bounces deep into the wall
    var gap = function (a, b) { var m = 0; for (var q = Math.floor(a * n); q < Math.floor(b * n); q++) m = Math.max(m, Math.abs(out.xm[q] - out.xs[q])); return m; };
    out.grow = out.ok && ((gap(2 / 3, 1) > 2 * gap(1 / 3, 2 / 3) && gap(2 / 3, 1) > 0.3) || (p.wall && pen > 0.2));
    // the stiffness the operator feels while touching: slope of the felt force against how far the master is beyond the wall
    var sx = 0, sy = 0, sxx = 0, sxy = 0, m2 = 0;
    for (k = 0; k < n; k++) if (p.wall && out.fe[k] > 0.3 && out.xm[k] > p.xw) { var X = out.xm[k] - p.xw, Y = out.felt[k]; sx += X; sy += Y; sxx += X * X; sxy += X * Y; m2++; }
    out.kfelt = m2 > 20 && sxx * m2 - sx * sx > 1e-9 ? (m2 * sxy - sx * sy) / (m2 * sxx - sx * sx) : null;
    return out;
  }

  var THREE = null, threeLoading = null;
  function loadThree() { if (!threeLoading) threeLoading = import('./vendor/three.module.min.js').then(function (m) { THREE = m; return m; }); return threeLoading; }

  W['tel-lab'] = function (w) {
    var preset = w.dataset.preset || 'arch';
    var titles = { free: L('Lab TD1: position-position in free space', 'Labo TD1 : position-position en espace libre'), wall: L('Lab TD2: touch a remote wall', 'Labo TD2 : toucher un mur distant'), arch: L('Lab TD2: compare the architectures', 'Labo TD2 : comparer les architectures'), delay: L('Lab: delay, stability and wave variables', 'Labo : retard, stabilité et variables d\'onde') };
    var intros = {
      free: L('The operator pushes the master with F = 10 sin(t) N. Master and slave are two masses linked by two virtual springs Kpm and Kps (TD1). Change the masses, the damping and the gains, and compare the two positions.', 'L\'opérateur pousse le maître avec F = 10 sin(t) N. Maître et esclave sont deux masses reliées par deux ressorts virtuels Kpm et Kps (TD1). Changez les masses, l\'amortissement et les gains, et comparez les deux positions.'),
      wall: L('Now a wall stands 5 cm in front of the slave (TD2, parameters of question 6). Choose a rigid, medium or soft wall. Does the operator feel it? Look at the force felt and at how far the master goes “through” the wall.', 'Un mur se trouve maintenant à 5 cm devant l\'esclave (TD2, paramètres de la question 6). Choisissez un mur rigide, moyen ou souple. L\'opérateur le sent-il ? Regardez la force ressentie et jusqu\'où le maître va « à travers » le mur.'),
      arch: L('Same wall, seven architectures. The force sensor of the slave is imperfect: add noise and a coarse resolution (TD2, questions 9 to 14). Look for the best transparency without oscillations.', 'Même mur, sept architectures. Le capteur d\'effort de l\'esclave est imparfait : ajoutez du bruit et une résolution grossière (TD2, questions 9 à 14). Cherchez la meilleure transparence sans oscillations.'),
      delay: L('Add a delay on the channel (each way). Watch force-position oscillate, then switch to wave variables.', 'Ajoutez un retard sur le canal (dans chaque sens). Regardez la force-position osciller, puis passez aux variables d\'onde.')
    };
    w.innerHTML = '<h4>' + titles[preset] + '</h4><p class="wnote">' + intros[preset] + '</p><div class="tw-grid"><div class="tw-view"><div class="tw-3d" aria-hidden="true"></div></div><div class="tw-side"><div class="tw-ctl"></div></div></div>';
    var V = w.querySelector('.tw-view'), CT = w.querySelector('.tw-ctl'), SD = w.querySelector('.tw-side'), box3 = w.querySelector('.tw-3d');
    var c1 = canvas(V, 0.36, L('Positions of master and slave', 'Positions du maître et de l\'esclave')), c2 = canvas(V, 0.36, L('Forces', 'Forces'));
    var archs = preset === 'free' || preset === 'wall' ? ['pp'] : preset === 'delay' ? ['pp', 'fp', 'c4p', 'wave'] : ['pp', 'pv', 'fp', 'ff', 'c4', 'c4p', 'wave'];
    var arch = archs.length > 1 ? seg(CT, L('Architecture', 'Architecture'), archs.map(function (a) { return [a, ARCH[a][0]]; }), preset === 'delay' ? 'fp' : 'fp', run) : { get: function () { return 'pp'; } };
    var archNote = archs.length > 1 ? note(CT, '') : null;
    var WALLS = { rigid: [10000, 100], medium: [1000, 50], soft: [100, 10] };
    var wallSel = preset === 'free' ? null : seg(CT, L('Wall at 5 cm', 'Mur à 5 cm'), [['rigid', L('rigid', 'rigide')], ['medium', L('medium', 'moyen')], ['soft', L('soft', 'souple')]].concat(preset === 'wall' ? [['none', L('no wall', 'pas de mur')]] : []), 'medium', run);
    var sl = {};
    var add = function (k, o) { o.on = run; sl[k] = slider(CT, o); };
    if (preset === 'free') {
      add('mm', { label: L('Master mass m_m (kg)', 'Masse du maître m_m (kg)'), min: 1, max: 100, value: 50, map: function (v) { return v / 10; }, dec: 1 });
      add('dm', { label: L('Master damping d_m (N·s/m)', 'Amortissement du maître d_m (N·s/m)'), min: 0, max: 200, value: 50, map: function (v) { return v / 10; }, dec: 1 });
      add('ms', { label: L('Slave mass m_s (kg)', 'Masse de l\'esclave m_s (kg)'), min: 1, max: 100, value: 50, map: function (v) { return v / 10; }, dec: 1 });
      add('ds', { label: L('Slave damping d_s (N·s/m)', 'Amortissement de l\'esclave d_s (N·s/m)'), min: 0, max: 200, value: 50, map: function (v) { return v / 10; }, dec: 1 });
    }
    add('K', { label: L('Gains K_pm = K_ps (N/m)', 'Gains K_pm = K_ps (N/m)'), min: 5, max: 1000, step: 5, value: 100 });
    if (preset === 'arch' || preset === 'delay') add('alpha', { label: L('Force feedback gain α', 'Gain du retour d\'effort α'), min: 0, max: 200, value: 100, map: function (v) { return v / 100; }, dec: 2 });
    if (preset === 'arch') {
      add('noise', { label: L('Sensor noise σ (N)', 'Bruit du capteur σ (N)'), min: 0, max: 50, value: 5, map: function (v) { return v / 10; }, dec: 1 });
      add('quant', { label: L('Sensor resolution (N)', 'Résolution du capteur (N)'), min: 0, max: 50, value: 1, map: function (v) { return v / 10; }, dec: 1 });
    }
    if (preset === 'delay' || preset === 'arch') add('delay', { label: L('Delay each way (ms)', 'Retard dans chaque sens (ms)'), min: 0, max: 500, step: 10, value: preset === 'delay' ? 100 : 0 });
    if (preset === 'delay' || preset === 'arch') add('b', { label: L('Wave impedance b (N·s/m)', 'Impédance d\'onde b (N·s/m)'), min: 1, max: 60, value: 15 });
    var fh = seg(CT, L('Operator', 'Opérateur'), [['sin', L('F = 10 sin(t)', 'F = 10 sin(t)')], ['push', L('push 8 N, then let go', 'pousse 8 N, puis lâche')]], 'sin', run);
    var out = readouts(SD);
    var chal = el('div', { 'class': 'tw-chal' }); SD.appendChild(chal);
    var R = null, play = 0, t0 = 0, raf = 0, view3 = null;
    function params() {
      var a = arch.get(), wv = wallSel ? wallSel.get() : 'none', Wp = WALLS[wv] || [0, 0], g = function (k, d) { return sl[k] ? sl[k].get() : d; };
      var sym = preset === 'free';
      return { arch: a, T: 12, mm: g('mm', sym ? 5 : 0.2), dm: g('dm', sym ? 5 : 1.5), ms: g('ms', 5), ds: g('ds', 5), Kpm: g('K', 100), Kps: g('K', 100), alpha: g('alpha', 1), Cv: 20, gv: 2, Kv: 60,
        kh: sym ? 0 : 40, bh: sym ? 0 : 4, b: g('b', 15), noise: g('noise', 0), quant: g('quant', 0), delay: g('delay', 0) / 1000, wall: wv !== 'none', xw: 0.05, Kw: Wp[0], dw: Wp[1], fh: fh.get(), amp: fh.get() === 'push' ? 8 : 10, freq: 1 / (2 * Math.PI) };
    }
    function run() {
      var p = params(); R = simulate(p);
      if (archNote) archNote.innerHTML = ARCH[p.arch][1];
      var stable = R.ok && !R.grow && R.osc < 8;
      out([
        [L('Stability', 'Stabilité'), !R.ok ? L('UNSTABLE (diverges at ', 'INSTABLE (diverge à ') + f(R.tEnd, 1) + ' s)' : R.grow ? L('UNSTABLE (growing oscillations)', 'INSTABLE (oscillations qui grandissent)') : R.osc >= 8 ? L('oscillates in contact', 'oscille au contact') : L('stable', 'stable'), stable ? 'ok' : 'bad'],
        [L('Position error in free motion (RMS)', 'Écart de position en espace libre (RMS)'), f(R.err * 100, 1) + ' cm', R.err > 0.05 ? 'bad' : ''],
        [L('Position drift at the end', 'Dérive de position à la fin'), f(R.drift * 100, 1) + ' cm', R.drift > 0.05 ? 'bad' : '']
      ].concat(p.wall ? [
        [L('Force felt / wall force', 'Force ressentie / force du mur'), R.ratio === null ? L('no contact', 'pas de contact') : f(R.ratio * 100, 0) + ' %', R.ratio !== null && R.ratio > 0.7 && R.ratio < 1.3 ? 'ok' : ''],
        [L('Wall stiffness felt (real: ', 'Raideur du mur ressentie (réelle : ') + p.Kw + ' N/m)', R.kfelt === null || R.kfelt <= 0 ? '—' : f(Math.max(0, R.kfelt), 0) + ' N/m (' + f(Math.max(0, R.kfelt) / p.Kw * 100, 0) + ' %)', R.kfelt !== null && R.kfelt / p.Kw > 0.5 ? 'ok' : ''],
        [L('Slave into the wall (max)', 'Esclave dans le mur (max)'), f(R.pen * 1000, 1) + ' mm'],
        [L('Master beyond the wall (max)', 'Maître au-delà du mur (max)'), f(Math.max(0, R.penM) * 100, 1) + ' cm', R.penM > 0.03 ? 'bad' : '']
      ] : []));
      // the challenge of the preset
      var ok = false, txt = '';
      if (preset === 'free') { txt = L('Make the slave follow the master within 1 cm (RMS) without changing the masses.', 'Faites suivre le maître par l\'esclave à moins de 1 cm (RMS) sans changer les masses.'); ok = R.ok && R.err < 0.01 && p.mm === 5 && p.ms === 5; }
      else if (preset === 'wall') { txt = L('With the rigid wall, keep the master less than 2 cm beyond the wall.', 'Avec le mur rigide, gardez le maître à moins de 2 cm au-delà du mur.'); ok = R.ok && wallSel.get() === 'rigid' && R.penM < 0.02; }
      else if (preset === 'arch') { txt = L('With a sensor noise of at least 2 N, make the operator feel at least 50 % of the wall stiffness, stable, with a drift under 3 cm.', 'Avec un bruit de capteur d\'au moins 2 N, faites sentir à l\'opérateur au moins 50 % de la raideur du mur, de façon stable, avec une dérive sous 3 cm.'); ok = stable && p.noise >= 2 && R.kfelt !== null && R.kfelt / p.Kw >= 0.5 && R.drift < 0.03; }
      else { txt = L('With 300 ms of delay each way and α = 1, find an architecture with a force channel that stays stable and still makes the operator feel at least 50 % of the wall force.', 'Avec 300 ms de retard dans chaque sens et α = 1, trouvez une architecture avec un canal de force qui reste stable et fait encore sentir à l\'opérateur au moins 50 % de la force du mur.'); ok = stable && p.delay >= 0.3 && p.alpha === 1 && R.ratio !== null && R.ratio >= 0.5 && p.arch !== 'pp'; }
      chal.className = 'tw-chal' + (ok ? ' ok' : ''); chal.innerHTML = '<b>' + L('Challenge', 'Défi') + '</b><p>' + txt + '</p><span>' + (ok ? L('✓ Challenge met!', '✓ Défi réussi !') : L('Not yet: change the settings.', 'Pas encore : changez les réglages.')) + '</span>';
      t0 = performance.now(); draw(0);
    }
    function draw(t) {
      if (!R) return; var T = R.t.length ? R.t[R.t.length - 1] : 1, pick = function (A) { return R.t.map(function (tt, k) { return [tt, A[k]]; }); };
      var rx = range(R.xm.concat(R.xs, R.p.wall ? [R.p.xw] : []));
      clear(c1); chart(c1, { x0: 0, x1: R.p.T, y0: rx[0], y1: rx[1], xl: L('time (s)', 'temps (s)'), yl: L('position (m)', 'position (m)'), cursor: t, hlines: R.p.wall ? [{ y: R.p.xw, col: C.mute, label: L('wall', 'mur') }] : [],
        series: [{ pts: pick(R.xm), col: C.b, label: L('master x_m', 'maître x_m') }, { pts: pick(R.xs), col: C.o, label: L('slave x_s', 'esclave x_s') }] });
      var rf = range(R.fh.concat(R.fe, R.felt));
      clear(c2); chart(c2, { x0: 0, x1: R.p.T, y0: rf[0], y1: rf[1], xl: L('time (s)', 'temps (s)'), yl: L('force (N)', 'force (N)'), cursor: t,
        series: [{ pts: pick(R.fh), col: C.mute, w: 1.5, dash: [5, 4], label: L('operator F_h', 'opérateur F_h') }].concat(R.p.wall ? [{ pts: pick(R.fe), col: C.r, label: L('wall F_env', 'mur F_env') }] : []).concat([{ pts: pick(R.felt), col: C.g, w: 1.5, label: L('felt by the operator', 'ressentie par l\'opérateur') }]) });
      if (!R.ok) text(c1, L('UNSTABLE', 'INSTABLE'), c1.w / 2, c1.h / 2, C.r, 22, 'center', true);
      void T;
    }
    // ---- 3D view: the haptic master on the left, the slave and its wall on the right, the channel between
    function build3d() {
      return loadThree().then(function () {
        var T3 = THREE, W3 = box3.clientWidth || 600, H3 = Math.round(W3 * 0.42);
        var renderer = new T3.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W3, H3); box3.appendChild(renderer.domElement);
        var scene = new T3.Scene(), cam = new T3.PerspectiveCamera(34, W3 / H3, 0.05, 50); cam.position.set(0, 1.7, 4.3); cam.lookAt(0, 0.22, 0);
        scene.add(new T3.HemisphereLight(0xffffff, 0x445066, 1.6)); var sun = new T3.DirectionalLight(0xffffff, 1.8); sun.position.set(2, 4, 3); scene.add(sun);
        var mat = function (c, o) { return new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.15 }, o || {})); };
        var root = new T3.Group(); scene.add(root);
        var floor = new T3.Mesh(new T3.BoxGeometry(5.6, 0.05, 1.5), mat(0x2a3550, { roughness: 0.95 })); floor.position.y = -0.03; floor.userData.raKeep = true; root.add(floor);
        var S = 0.55;                                                                            // 1 m of motion → 0.55 scene units
        // master: a base, a rail, a moving handle (haptic device)
        var M = new T3.Group(); M.position.set(-1.7, 0, 0); root.add(M);
        var mb = new T3.Mesh(new T3.BoxGeometry(1.7, 0.12, 0.5), mat(0x3a3f48)); mb.position.y = 0.06; mb.userData.raKeep = true; M.add(mb);
        var mr = new T3.Mesh(new T3.BoxGeometry(1.6, 0.04, 0.08), mat(0xb8c2cf, { metalness: 0.6 })); mr.position.y = 0.14; M.add(mr);
        var mh = new T3.Group(); M.add(mh);
        var mc = new T3.Mesh(new T3.BoxGeometry(0.16, 0.1, 0.2), mat(0x5aa9ff)); mc.position.y = 0.2; mh.add(mc);
        var ms = new T3.Mesh(new T3.CylinderGeometry(0.03, 0.03, 0.38, 16), mat(0xd5dbe1, { metalness: 0.5 })); ms.position.y = 0.43; mh.add(ms);
        var mk = new T3.Mesh(new T3.SphereGeometry(0.075, 24, 16), mat(0x5aa9ff)); mk.position.y = 0.64; mh.add(mk);
        // slave: a rail, a carriage with a probe, the wall
        var Sg = new T3.Group(); Sg.position.set(1.5, 0, 0); root.add(Sg);
        var sb = new T3.Mesh(new T3.BoxGeometry(1.9, 0.12, 0.5), mat(0x3a3f48)); sb.position.y = 0.06; sb.userData.raKeep = true; Sg.add(sb);
        var sr = new T3.Mesh(new T3.BoxGeometry(1.8, 0.04, 0.08), mat(0xb8c2cf, { metalness: 0.6 })); sr.position.y = 0.14; Sg.add(sr);
        var sc = new T3.Group(); Sg.add(sc);
        var body = new T3.Mesh(new T3.BoxGeometry(0.3, 0.24, 0.34), mat(0xff9f43)); body.position.y = 0.27; sc.add(body);
        var probe = new T3.Mesh(new T3.CylinderGeometry(0.025, 0.025, 0.3, 16), mat(0xd5dbe1, { metalness: 0.5 })); probe.rotation.z = Math.PI / 2; probe.position.set(0.3, 0.3, 0); sc.add(probe);
        var tip = new T3.Mesh(new T3.SphereGeometry(0.04, 16, 12), mat(0x3a3f48)); tip.position.set(0.45, 0.3, 0); tip.userData.raKeep = true; sc.add(tip);
        var wallM = mat(0x8a94a3, { transparent: true, opacity: 0.92 }), wall = new T3.Mesh(new T3.BoxGeometry(0.08, 0.7, 0.7), wallM); Sg.add(wall);
        // force arrows
        var arrow = function (col) { var g = new T3.Group(), sh = new T3.Mesh(new T3.CylinderGeometry(0.018, 0.018, 1, 10), mat(col, { emissive: col, emissiveIntensity: 0.3 })), hd = new T3.Mesh(new T3.ConeGeometry(0.05, 0.12, 14), sh.material); sh.rotation.z = -Math.PI / 2; sh.position.x = 0.5; hd.rotation.z = -Math.PI / 2; g.add(sh, hd); g.sh = sh; g.hd = hd; return g; };
        var aH = arrow(0x8a99ae), aF = arrow(0x4ed17f), aE = arrow(0xff6b6b); M.add(aH, aF); Sg.add(aE);
        var setA = function (a, x, y, F, k) { var l = Math.min(0.6, Math.abs(F) * k); a.visible = l > 0.02; a.position.set(x, y, 0); a.scale.set(1, 1, 1); a.sh.scale.y = Math.max(0.001, l); a.sh.position.x = Math.sign(F) * l / 2; a.hd.position.x = Math.sign(F) * l; a.hd.rotation.z = F >= 0 ? -Math.PI / 2 : Math.PI / 2; };
        // the channel: a cable and packets travelling at a speed set by the delay
        var cable = new T3.Mesh(new T3.CylinderGeometry(0.012, 0.012, 1.6, 8), mat(0x8a99ae)); cable.rotation.z = Math.PI / 2; cable.position.set(-0.1, 0.25, -0.35); root.add(cable);
        var packets = [0, 1, 2, 3].map(function (k) { var m = new T3.Mesh(new T3.SphereGeometry(0.035, 12, 8), mat(k % 2 ? 0xff9f43 : 0x5aa9ff, { emissive: k % 2 ? 0xff9f43 : 0x5aa9ff, emissiveIntensity: 0.5 })); m.position.set(0, 0.25, -0.35); root.add(m); return m; });
        if (window.RA && RA.darkParts) RA.darkParts(scene);
        var drag = null; renderer.domElement.addEventListener('pointerdown', function (e) { drag = [e.clientX, root.rotation.y]; renderer.domElement.setPointerCapture(e.pointerId); });
        renderer.domElement.addEventListener('pointermove', function (e) { if (drag) root.rotation.y = Math.max(-0.8, Math.min(0.8, drag[1] + (e.clientX - drag[0]) / 200)); });
        renderer.domElement.addEventListener('pointerup', function () { drag = null; });
        var paintBg = function () { scene.background = new T3.Color(C.bg); };
        paintBg(); redraws.push(paintBg);
        return {
          resize: function () { var W4 = box3.clientWidth || 600, H4 = Math.round(W4 * 0.42); renderer.setSize(W4, H4); cam.aspect = W4 / H4; cam.updateProjectionMatrix(); },
          show: function (k, tt) {
            var p = R.p, xm = R.xm[k], xs = R.xs[k], clamp = function (v) { return Math.max(-1.35, Math.min(0.75, v)); };
            mh.position.x = clamp(xm * S); sc.position.x = clamp(xs * S) - 0.2;
            wall.visible = p.wall; wall.position.set(p.xw * S - 0.2 + 0.45 + 0.04, 0.35, 0);
            wallM.color.set(p.Kw >= 10000 ? 0x8a94a3 : p.Kw >= 1000 ? 0xc29a6b : 0x9ad1a0);
            var fe = R.fe[k]; wall.scale.x = 1; wallM.emissive = wallM.emissive || new T3.Color(); wallM.emissive.set(fe > 0.3 ? 0x661111 : 0x000000);
            setA(aH, mh.position.x - 0.05, 0.64, R.fh[k], 0.05); setA(aF, mh.position.x + 0.05, 0.5, -R.felt[k], 0.05);   // the force the master applies on the hand
            setA(aE, sc.position.x - 0.2 + 0.45, 0.48, -fe, 0.05); aE.visible = fe > 0.3;
            var d = Math.max(0.05, p.delay), ph = (tt / (d * 4 + 0.6)) % 1;
            packets.forEach(function (m, i) { var q = (ph + i / 4) % 1; m.position.x = -0.9 + (i % 2 ? 1 - q : q) * 1.6; });
            renderer.render(scene, cam);
          }
        };
      }).catch(function () { box3.remove(); return null; });
    }
    function loop(now) {
      if (R && R.t.length) {
        var tt = ((now - t0) / 1000) % (R.t[R.t.length - 1] + 1.5), k = Math.min(R.t.length - 1, Math.round(tt / 0.005));
        draw(Math.min(tt, R.t[R.t.length - 1])); if (view3) view3.show(k, now / 1000);
      }
      raf = requestAnimationFrame(loop);
    }
    run();
    var started = false;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cancelAnimationFrame(raf); if (e.isIntersecting) { if (!started) { started = true; build3d().then(function (v) { view3 = v; }); } raf = requestAnimationFrame(loop); } }); }, { rootMargin: '100px' });
    io.observe(w);
    redraws.push(function (resize) { if (resize) { c1.fit(); c2.fit(); if (view3) view3.resize(); } draw(0); });
    void play;
  };

  // ================================================================ tel-levels: the four levels of interaction
  W['tel-levels'] = function (w) {
    var F = frame(w, L('See the four levels of human-robot interaction', 'Voir les quatre niveaux d\'interaction humain-robot'), L('Top view of a work table. The robot (orange) and the operator (blue) work on parts. Choose a level and watch who is where, and when.', 'Vue de dessus d\'une table de travail. Le robot (orange) et l\'opérateur (bleu) travaillent sur des pièces. Choisissez un niveau et regardez qui est où, et quand.'));
    var cv = canvas(F.view, 0.55, L('Robot and operator around a table', 'Robot et opérateur autour d\'une table'));
    var LV = {
      coex: [L('Coexistence', 'Coexistence'), L('Separate work zones, no shared space: the robot works behind a virtual fence, the operator next to it. No interaction.', 'Zones de travail séparées, pas d\'espace partagé : le robot travaille derrière une barrière virtuelle, l\'opérateur à côté. Aucune interaction.')],
      sync: [L('Synchronised', 'Synchronisée'), L('A shared workspace, but never at the same time: the robot works, leaves, then the operator comes in (and the other way round).', 'Un espace de travail partagé, mais jamais en même temps : le robot travaille, sort, puis l\'opérateur entre (et inversement).')],
      coop: [L('Cooperation', 'Coopération'), L('Both in the shared space at the same time, each on their own task (two different parts).', 'Les deux dans l\'espace partagé en même temps, chacun sur sa propre tâche (deux pièces différentes).')],
      coll: [L('Collaboration (co-manipulation)', 'Collaboration (comanipulation)'), L('Both on the same task at the same time: they hold the same part. Contact is part of the job, so force and speed must be limited.', 'Les deux sur la même tâche en même temps : ils tiennent la même pièce. Le contact fait partie du travail, la force et la vitesse doivent donc être limitées.')]
    };
    var lv = seg(F.ctl, L('Level', 'Niveau'), Object.keys(LV).map(function (k) { return [k, LV[k][0]]; }), 'coex', function () { nt.innerHTML = LV[lv.get()][1]; });
    var nt = note(F.ctl, LV.coex[1]);
    var tbl = el('div', { 'class': 'tw-read' }); F.side.appendChild(tbl);
    tbl.innerHTML = '<div><span></span><b>' + L('same space · same time · same task', 'même espace · même moment · même tâche') + '</b></div>' + [['coex', '✗ · ✗ · ✗'], ['sync', '✓ · ✗ · ✗'], ['coop', '✓ · ✓ · ✗'], ['coll', '✓ · ✓ · ✓']].map(function (r) { return '<div><span>' + LV[r[0]][0] + '</span><b>' + r[1] + '</b></div>'; }).join('');
    var raf = 0, t0 = performance.now();
    function person(x, y, col) { var c = cv.x; c.fillStyle = col; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill(); c.fillStyle = C.bg; c.beginPath(); c.arc(x, y - 3, 6, 0, 7); c.fill(); }
    function robot(bx, by, tx, ty) {
      var c = cv.x; c.fillStyle = C.mute; c.beginPath(); c.arc(bx, by, 16, 0, 7); c.fill();
      var mx = (bx + tx) / 2 + (ty - by) * 0.25, my = (by + ty) / 2 - (tx - bx) * 0.25;
      c.strokeStyle = C.o; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, by); c.lineTo(mx, my); c.lineTo(tx, ty); c.stroke(); c.lineWidth = 1;
      c.fillStyle = C.o; c.beginPath(); c.arc(tx, ty, 7, 0, 7); c.fill();
    }
    function loop(now) {
      var t = (now - t0) / 1000, c = cv.x, Wd = cv.w, H = cv.h, k = lv.get();
      clear(cv);
      c.fillStyle = C.box; c.fillRect(Wd * 0.2, H * 0.25, Wd * 0.6, H * 0.5); text(cv, L('table', 'table'), Wd * 0.21, H * 0.25 + 14, C.axis, 11);
      var bx = Wd * 0.5, by = H * 0.12, s = Math.sin(t * 1.4), part = function (x, y, col) { c.fillStyle = col; c.fillRect(x - 14, y - 10, 28, 20); };
      if (k === 'coex') {
        c.fillStyle = C.o; c.globalAlpha = 0.12; c.fillRect(Wd * 0.2, H * 0.25, Wd * 0.3, H * 0.5); c.fillStyle = C.b; c.fillRect(Wd * 0.55, H * 0.25, Wd * 0.25, H * 0.5); c.globalAlpha = 1;
        c.strokeStyle = C.r; c.setLineDash([6, 5]); c.lineWidth = 2; c.beginPath(); c.moveTo(Wd * 0.52, H * 0.08); c.lineTo(Wd * 0.52, H * 0.92); c.stroke(); c.setLineDash([]);
        part(Wd * 0.32, H * 0.5, C.y); part(Wd * 0.68, H * 0.5, C.p);
        robot(Wd * 0.3, by, Wd * 0.32 + s * 30, H * 0.5); person(Wd * 0.68 + s * 10, H * 0.86, C.b);
      } else if (k === 'sync') {
        var ph = (t % 6) / 6, robIn = ph < 0.5, rT = robIn ? Math.sin(ph * 2 * Math.PI) : 0, hT = robIn ? 0 : Math.sin((ph - 0.5) * 2 * Math.PI);
        c.fillStyle = robIn ? C.o : C.b; c.globalAlpha = 0.14; c.fillRect(Wd * 0.35, H * 0.3, Wd * 0.3, H * 0.4); c.globalAlpha = 1;
        part(Wd * 0.5, H * 0.5, C.y);
        robot(bx, by, bx + (robIn ? 0 : -60), by + 30 + rT * (H * 0.36));
        person(Wd * 0.5, H * 0.92 - hT * H * 0.33, C.b);
        text(cv, robIn ? L('robot\'s turn', 'au tour du robot') : L('operator\'s turn', 'au tour de l\'opérateur'), Wd * 0.5, H * 0.24, robIn ? C.o : C.b, 12, 'center', true);
      } else if (k === 'coop') {
        c.fillStyle = C.g; c.globalAlpha = 0.12; c.fillRect(Wd * 0.25, H * 0.3, Wd * 0.5, H * 0.4); c.globalAlpha = 1;
        part(Wd * 0.38, H * 0.5, C.y); part(Wd * 0.62, H * 0.52, C.p);
        robot(bx, by, Wd * 0.38 + s * 25, H * 0.5 + Math.cos(t * 1.4) * 15); person(Wd * 0.62 + Math.cos(t) * 12, H * 0.62, C.b);
      } else {
        var px = Wd * 0.5 + s * Wd * 0.12, py = H * 0.5;
        c.fillStyle = C.g; c.globalAlpha = 0.12; c.fillRect(Wd * 0.25, H * 0.3, Wd * 0.5, H * 0.4); c.globalAlpha = 1;
        c.fillStyle = C.y; c.fillRect(px - 50, py - 10, 100, 20);
        robot(bx, by, px - 40, py); person(px + 40, py + 30, C.b);
        c.strokeStyle = C.b; c.lineWidth = 6; c.beginPath(); c.moveTo(px + 40, py + 20); c.lineTo(px + 42, py + 4); c.stroke(); c.lineWidth = 1;
        text(cv, L('one part, held together', 'une pièce, tenue ensemble'), Wd * 0.5, H * 0.24, C.g, 12, 'center', true);
      }
      raf = requestAnimationFrame(loop);
    }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cancelAnimationFrame(raf); if (e.isIntersecting) raf = requestAnimationFrame(loop); }); }); io.observe(w);
    redraws.push(function (resize) { if (resize) cv.fit(); });
  };

  // ================================================================ tel-coman: co-manipulation
  W['tel-coman'] = function (w) {
    var F = frame(w, L('Lab: co-manipulation, hand on the robot', 'Labo : comanipulation, la main sur le robot'),
      L('Drag the blue handle (your hand). The orange point is the tool held by the cobot. Choose what the cobot adds to your gesture. “Auto demo” moves the hand for you, with a slight tremor.', 'Glissez la poignée bleue (votre main). Le point orange est l\'outil tenu par le cobot. Choisissez ce que le cobot ajoute à votre geste. « Démo auto » bouge la main pour vous, avec un léger tremblement.'));
    var cv = canvas(F.view, 0.62, L('Hand and tool paths', 'Trajets de la main et de l\'outil'));
    var MODES = {
      free: [L('Transparent', 'Transparent'), L('The cobot follows the hand without resisting: the tool does exactly what the hand does (including its errors).', 'Le cobot suit la main sans résister : l\'outil fait exactement ce que fait la main (y compris ses erreurs).')],
      amp: [L('Force amplification', 'Amplification d\'effort'), L('The cobot carries a 30 kg load: you only push with the force divided by the gain. Used for heavy parts (parallel and orthotic co-manipulation).', 'Le cobot porte une charge de 30 kg : vous ne poussez qu\'avec la force divisée par le gain. Utilisé pour les pièces lourdes (comanipulation parallèle et orthétique).')],
      scale: [L('Scaling', 'Changement d\'échelle'), L('The tool moves 5 times less than the hand: large, easy gestures become precise ones (serial co-manipulation, surgery).', 'L\'outil bouge 5 fois moins que la main : de grands gestes faciles deviennent précis (comanipulation sérielle, chirurgie).')],
      guide: [L('Gesture guiding', 'Guidage du geste'), L('A virtual guide (a “virtual fixture”) pulls the tool towards the dashed path: moving along it is free, leaving it is resisted.', 'Un guide virtuel (« virtual fixture ») attire l\'outil vers le trajet en tirets : avancer le long est libre, s\'en écarter est freiné.')],
      filter: [L('Filtering', 'Filtrage'), L('A low-pass filter removes the tremor and the jerks of the hand: only the intended gesture reaches the tool.', 'Un filtre passe-bas enlève les tremblements et les à-coups de la main : seul le geste voulu arrive à l\'outil.')]
    };
    var mode = seg(F.ctl, L('What the cobot does', 'Ce que fait le cobot'), Object.keys(MODES).map(function (k) { return [k, MODES[k][0]]; }), 'free', function () { nt.innerHTML = MODES[mode.get()][1]; reset(); });
    var nt = note(F.ctl, MODES.free[1]);
    var gain = slider(F.ctl, { label: L('Gain', 'Gain'), min: 1, max: 20, value: 5, on: reset });
    var trem = slider(F.ctl, { label: L('Hand tremor (mm)', 'Tremblement de la main (mm)'), min: 0, max: 20, value: 6, on: function () {} });
    var auto = check(F.ctl, L('Auto demo', 'Démo auto'), true, reset);
    var out = readouts(F.side);
    var hand = [0.25, 0.5], tool = [0.25, 0.5], filt = [0.25, 0.5], hp = [], tp = [], t0 = performance.now(), last = 0, raf = 0, dragging = false, errS = 0, errN = 0, r = rng(3);
    var path = function (u) { return [0.12 + u * 0.76, 0.5 + 0.22 * Math.sin(u * Math.PI * 2)]; };   // the guide (normalised coordinates)
    function nearest(p) { var best = null, bd = 1e9; for (var i = 0; i <= 200; i++) { var q = path(i / 200), d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = q; } } return [best, bd]; }
    function reset() { hp = []; tp = []; errS = 0; errN = 0; t0 = performance.now(); var h0 = path(0); hand = h0.slice(); tool = h0.slice(); filt = h0.slice(); }
    var toN = function (e) { var b = cv.c.getBoundingClientRect(); return [(e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height]; };
    cv.c.addEventListener('pointerdown', function (e) { dragging = true; auto.checked = false; cv.c.setPointerCapture(e.pointerId); hand = toN(e); });
    cv.c.addEventListener('pointermove', function (e) { if (dragging) hand = toN(e); });
    cv.c.addEventListener('pointerup', function () { dragging = false; });
    function loop(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      var t = (now - t0) / 1000, m = mode.get(), G = gain.get(), tr = trem.get() / 1000 * 0.9;
      if (auto.checked) { var u = (t / 10) % 1, q = path(u); hand = [q[0] + 0.03 * Math.sin(t * 2.1), q[1] + 0.035 * Math.sin(t * 1.3)]; }
      var hn = [hand[0] + tr * (Math.sin(t * 52) + 0.6 * gauss(r) * 0.4), hand[1] + tr * (Math.cos(t * 47) + 0.6 * gauss(r) * 0.4)];   // the real hand, with its tremor
      var a = 1 - Math.exp(-dt * 6);
      if (m === 'filter') { filt[0] += (hn[0] - filt[0]) * a; filt[1] += (hn[1] - filt[1]) * a; tool = filt.slice(); }
      else if (m === 'scale') { if (!hp.length) tool = hn.slice(); else { var pr = hp[hp.length - 1]; tool = [tool[0] + (hn[0] - pr[0]) / G, tool[1] + (hn[1] - pr[1]) / G]; } }
      else if (m === 'guide') { var nr = nearest(hn), k = Math.min(1, G / 8); tool = [hn[0] + (nr[0][0] - hn[0]) * k, hn[1] + (nr[0][1] - hn[1]) * k]; }
      else tool = hn.slice();
      hp.push(hn); tp.push(tool.slice()); if (hp.length > 600) { hp.shift(); tp.shift(); }
      var ne = nearest(tool)[1]; errS += ne * ne; errN++;
      clear(cv); var c = cv.x, Wd = cv.w, H = cv.h, X = function (p) { return [p[0] * Wd, p[1] * H]; };
      if (m === 'guide' || m === 'filter' || m === 'free') { c.strokeStyle = C.g; c.setLineDash([6, 5]); c.lineWidth = 2; c.beginPath(); for (var i = 0; i <= 100; i++) { var pp = X(path(i / 100)); if (i) c.lineTo(pp[0], pp[1]); else c.moveTo(pp[0], pp[1]); } c.stroke(); c.setLineDash([]); }
      [[hp, C.b, 1.5], [tp, C.o, 2.5]].forEach(function (s) { c.strokeStyle = s[1]; c.lineWidth = s[2]; c.beginPath(); s[0].forEach(function (p, k) { var q = X(p); if (k) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.stroke(); });
      var hq = X(hn), tq = X(tool); c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(hq[0], hq[1]); c.lineTo(tq[0], tq[1]); c.stroke();
      c.fillStyle = C.b; c.beginPath(); c.arc(hq[0], hq[1], 11, 0, 7); c.fill(); c.fillStyle = C.o; c.beginPath(); c.arc(tq[0], tq[1], 7, 0, 7); c.fill();
      text(cv, L('hand', 'main'), hq[0] + 14, hq[1] - 10, C.b, 11); text(cv, L('tool', 'outil'), tq[0] + 10, tq[1] + 16, C.o, 11);
      var rows = [[L('Tool distance to the path (RMS)', 'Distance de l\'outil au trajet (RMS)'), f(Math.sqrt(errS / Math.max(1, errN)) * 400, 1) + ' mm', Math.sqrt(errS / Math.max(1, errN)) * 400 < 5 ? 'ok' : '']];
      if (m === 'amp') rows.push([L('Force to move 30 kg (1 m/s²)', 'Force pour bouger 30 kg (1 m/s²)'), f(30 / G, 1) + ' N ' + L('instead of 30 N', 'au lieu de 30 N'), 'ok']);
      if (m === 'scale') rows.push([L('Hand moves 10 mm → tool', 'La main bouge de 10 mm → l\'outil'), f(10 / G, 1) + ' mm']);
      out(rows);
      raf = requestAnimationFrame(loop);
    }
    reset();
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cancelAnimationFrame(raf); if (e.isIntersecting) { last = 0; raf = requestAnimationFrame(loop); } }); }); io.observe(w);
    redraws.push(function (resize) { if (resize) cv.fit(); });
  };

  // ================================================================ tel-arch: sense-plan-act against subsumption
  W['tel-arch'] = function (w) {
    var F = frame(w, L('Lab: two ways to organise the same robot', 'Labo : deux façons d\'organiser le même robot'),
      L('The robot must reach the green goal while a person (red) walks across the room. In <b>sense-model-plan-act</b>, it perceives, builds its map, plans a path and then executes it: thinking takes time, and the plan is old when it acts. In <b>subsumption</b>, simple behaviours run in parallel; a higher layer takes over a lower one when it has something to say.', 'Le robot doit atteindre le but vert pendant qu\'une personne (rouge) traverse la salle. En <b>percevoir-modéliser-planifier-agir</b>, il perçoit, construit sa carte, planifie un chemin puis l\'exécute : réfléchir prend du temps, et le plan est vieux quand il agit. En <b>subsomption</b>, des comportements simples tournent en parallèle ; une couche supérieure prend la main sur une couche inférieure quand elle a quelque chose à dire.'));
    var cv = canvas(F.view, 0.6, L('A robot, a goal and a moving person', 'Un robot, un but et une personne qui bouge'));
    var ar = seg(F.ctl, L('Architecture', 'Architecture'), [['smpa', L('Sense-model-plan-act', 'Percevoir-modéliser-planifier-agir')], ['sub', L('Subsumption (Brooks 1986)', 'Subsomption (Brooks 1986)')]], 'smpa', reset);
    var think = slider(F.ctl, { label: L('Time to plan (s)', 'Temps pour planifier (s)'), min: 1, max: 30, value: 15, map: function (v) { return v / 10; }, dec: 1 });
    var spd = slider(F.ctl, { label: L('Speed of the person (m/s)', 'Vitesse de la personne (m/s)'), min: 2, max: 15, value: 8, map: function (v) { return v / 10; }, dec: 1 });
    var btn = el('button', { type: 'button', 'class': 'btn sm ghost' }, L('Run again', 'Relancer')); F.ctl.appendChild(btn); btn.addEventListener('click', reset);
    var lay = el('div', { 'class': 'tw-layers' }); F.side.appendChild(lay);
    var out = readouts(F.side);
    var R = {}, raf = 0, last = 0;
    var Wm = 10, Hm = 6, goal = [9, 3], person = {};
    function reset() { R = { x: 0.8, y: 3, th: 0, t: 0, hits: 0, done: false, plan: null, planAt: -1, phase: 'sense', touch: 0, trail: [] }; person = { x: 5, y: 0.4, vy: 1 }; }
    function behaviours(sense) {
      // layers from the lowest to the highest; the highest one that wants to act wins
      var L0 = { n: L('0 · go to the goal', '0 · aller au but'), v: 0.8, w: Math.atan2(goal[1] - R.y, goal[0] - R.x) - R.th, on: true };
      var L1 = { n: L('1 · avoid obstacles', '1 · éviter les obstacles'), on: sense.d < 1.6, v: 0.35, w: sense.side > 0 ? -2.2 : 2.2 };
      var L2 = { n: L('2 · stop if very close', '2 · s\'arrêter si très près'), on: sense.d < 0.7, v: 0, w: 0 };
      return [L0, L1, L2];
    }
    function step(dt) {
      if (R.done) return;
      R.t += dt; person.y += person.vy * spd.get() * dt; if (person.y > Hm - 0.4 || person.y < 0.4) person.vy *= -1;
      var dx = person.x - R.x, dy = person.y - R.y, d = Math.hypot(dx, dy), rel = Math.atan2(dy, dx) - R.th; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      var sense = { d: Math.abs(rel) < 1.2 ? d : 99, side: rel };
      var v = 0, wv = 0, active = [];
      if (ar.get() === 'sub') {
        var B = behaviours(sense), win = B[0]; B.forEach(function (b) { if (b.on) win = b; }); v = win.v; wv = win.w; active = B.map(function (b) { return [b.n, b === win ? 'win' : b.on ? 'on' : 'off']; });
        lay.innerHTML = '<b>' + L('Layers (the highest active one wins)', 'Couches (la plus haute active gagne)') + '</b>' + active.slice().reverse().map(function (a) { return '<div class="' + a[1] + '">' + a[0] + '</div>'; }).join('');
      } else {
        // a loop: sense → model → plan (takes "think" seconds, the robot stands still) → act on the old plan for 3 s
        var T = think.get();
        if (R.phase === 'act' && R.t - R.planAt > T + 3) R.phase = 'sense';
        if (R.phase === 'sense') { R.phase = 'plan'; R.planAt = R.t; R.snap = { x: person.x, y: person.y }; }
        if (R.phase === 'plan' && R.t - R.planAt >= T) {
          // plan around the person where it WAS when the robot looked
          var s = R.snap, side = R.y < s.y ? -1 : 1, via = [s.x, Math.max(0.5, Math.min(Hm - 0.5, s.y + side * 1.6))];
          R.plan = Math.abs(R.y - s.y) < 1.5 && s.x > R.x ? [via, goal] : [goal]; R.phase = 'act';
        }
        if (R.phase === 'act' && R.plan) { var tg = R.plan[0]; if (Math.hypot(tg[0] - R.x, tg[1] - R.y) < 0.4 && R.plan.length > 1) R.plan.shift(); tg = R.plan[0]; v = 0.8; wv = Math.atan2(tg[1] - R.y, tg[0] - R.x) - R.th; }
        var ph = { sense: L('sense', 'percevoir'), plan: L('model + plan…', 'modéliser + planifier…'), act: L('act (on the old plan)', 'agir (sur le vieux plan)') };
        lay.innerHTML = '<b>' + L('The loop, one step after the other', 'La boucle, une étape après l\'autre') + '</b>' + ['sense', 'plan', 'act'].map(function (k) { return '<div class="' + (R.phase === k ? 'win' : 'off') + '">' + ph[k] + '</div>'; }).join('');
      }
      wv = Math.atan2(Math.sin(wv), Math.cos(wv)) * 3; wv = Math.max(-2.5, Math.min(2.5, wv));
      R.th += wv * dt; R.x += v * Math.cos(R.th) * dt; R.y += v * Math.sin(R.th) * dt; R.x = Math.max(0.3, Math.min(Wm - 0.3, R.x)); R.y = Math.max(0.3, Math.min(Hm - 0.3, R.y));
      if (d < 0.45) { if (!R.touch) R.hits++; R.touch = 1; } else R.touch = 0;
      if (Math.hypot(goal[0] - R.x, goal[1] - R.y) < 0.35 || R.t > 40) R.done = true;
      R.trail.push([R.x, R.y]); if (R.trail.length > 2000) R.trail.shift();
    }
    function loop(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      for (var i = 0; i < 4; i++) step(dt / 2);
      clear(cv); var c = cv.x, S = Math.min(cv.w / Wm, cv.h / Hm), X = function (v) { return v * S; }, Y = function (v) { return cv.h - v * S; };
      c.strokeStyle = C.grid; for (var g = 0; g <= Wm; g++) { c.beginPath(); c.moveTo(X(g), 0); c.lineTo(X(g), cv.h); c.stroke(); }
      c.fillStyle = C.g; c.globalAlpha = 0.3; c.beginPath(); c.arc(X(goal[0]), Y(goal[1]), 0.35 * S, 0, 7); c.fill(); c.globalAlpha = 1;
      c.strokeStyle = C.o; c.lineWidth = 1.5; c.beginPath(); R.trail.forEach(function (p, k) { if (k) c.lineTo(X(p[0]), Y(p[1])); else c.moveTo(X(p[0]), Y(p[1])); }); c.stroke();
      if (ar.get() === 'smpa' && R.snap) { c.strokeStyle = C.r; c.setLineDash([4, 4]); c.beginPath(); c.arc(X(R.snap.x), Y(R.snap.y), 0.25 * S, 0, 7); c.stroke(); c.setLineDash([]); text(cv, L('where the person was', 'où était la personne'), X(R.snap.x) + 10, Y(R.snap.y) - 10, C.r, 10); }
      c.fillStyle = C.r; c.beginPath(); c.arc(X(person.x), Y(person.y), 0.25 * S, 0, 7); c.fill();
      c.save(); c.translate(X(R.x), Y(R.y)); c.rotate(-R.th); c.fillStyle = C.o; c.beginPath(); c.moveTo(0.3 * S, 0); c.lineTo(-0.2 * S, 0.2 * S); c.lineTo(-0.2 * S, -0.2 * S); c.closePath(); c.fill(); c.restore();
      out([[L('Time', 'Temps'), f(R.t, 1) + ' s' + (R.done ? (R.t > 40 ? L(' (gave up)', ' (abandon)') : L(' · goal reached', ' · but atteint')) : '')], [L('Collisions with the person', 'Collisions avec la personne'), R.hits, R.hits ? 'bad' : 'ok']]);
      raf = requestAnimationFrame(loop);
    }
    reset();
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { cancelAnimationFrame(raf); if (e.isIntersecting) { last = 0; raf = requestAnimationFrame(loop); } }); }); io.observe(w);
    redraws.push(function (resize) { if (resize) cv.fit(); });
  };

  // ================================================================ tel-pat: the PAT architecture
  W['tel-pat'] = function (w) {
    var F = frame(w, L('Lab: the PAT architecture, from teleoperation to autonomy', 'Labo : l\'architecture PAT, de la téléopération à l\'autonomie'),
      L('Choose the level of autonomy: the robot runs the yellow (action) and green (perception) blocks up to this level, and the operator (blue) gives the order at the level just above. Or choose a robot of the laboratory.', 'Choisissez le niveau d\'autonomie : le robot fait tourner les blocs jaunes (action) et verts (perception) jusqu\'à ce niveau, et l\'opérateur (bleu) donne l\'ordre au niveau juste au-dessus. Ou choisissez un robot du laboratoire.'));
    var LVL = [
      [L('Servoings', 'Asservissements'), L('Sensors', 'Capteurs'), L('setting points', 'consignes'), L('joint set points q1…qn, wheel speeds', 'consignes articulaires q1…qn, vitesses des roues')],
      [L('Pilot', 'Pilote'), L('Proximity model', 'Modèle de proximité'), L('trajectory', 'trajectoire'), L('a trajectory x(t), y(t): the pilot avoids what is very close (reflexes) and computes the set points (inverse models)', 'une trajectoire x(t), y(t) : le pilote évite ce qui est tout près (réflexes) et calcule les consignes (modèles inverses)')],
      [L('Navigator', 'Navigateur'), L('Local model', 'Modèle local'), L('path', 'chemin'), L('a path (a list of places): the navigator turns it into a trajectory in the local map', 'un chemin (une liste de lieux) : le navigateur le transforme en trajectoire dans la carte locale')],
      [L('Path planner', 'Planificateur'), L('Global model', 'Modèle global'), L('goal', 'but'), L('a goal (“go to room 12”): the planner finds the path in the global map', 'un but (« va en salle 12 ») : le planificateur trouve le chemin dans la carte globale')],
      [L('Mission generator', 'Générateur de mission'), L('General model', 'Modèle général'), L('mission', 'mission'), L('a mission (“explore and find the victims”): the robot chooses its goals itself', 'une mission (« explore et trouve les victimes ») : le robot choisit lui-même ses buts')]
    ];
    var EX = {
      romni: [2, L('ROMNI, omnidirectional robot: the operator sends a trajectory P(x, y, θ); the robot computes its wheel speeds (inverse model) and servoes them.', 'ROMNI, robot omnidirectionnel : l\'opérateur envoie une trajectoire P(x, y, θ) ; le robot calcule les vitesses de ses roues (modèle inverse) et les asservit.')],
      otelo: [2, L('OTELO, tele-echography: the expert moves a fake probe (T3); the robot on the patient follows the trajectory and keeps the contact force.', 'OTELO, télé-échographie : l\'expert bouge une sonde factice (T3) ; le robot sur le patient suit la trajectoire et garde l\'effort de contact.')],
      raoul: [4, L('RAOUL, autonomous mobile robot: the operator only gives a goal; path planner, navigator, pilot and servoings do the rest with lidars and odometry.', 'RAOUL, robot mobile autonome : l\'opérateur ne donne qu\'un but ; planificateur, navigateur, pilote et asservissements font le reste avec les lidars et l\'odométrie.')],
      wifi: [5, L('WifiBot in a robotics challenge: a mission generator chooses the goals (explore, search, reach, identify).', 'WifiBot dans un challenge de robotique : un générateur de mission choisit les buts (explorer, chercher, atteindre, identifier).')]
    };
    var lv = slider(F.ctl, { label: L('Level of autonomy', 'Niveau d\'autonomie'), min: 0, max: 5, value: 2, on: function () { ex.set(''); draw(); } });
    var ex = seg(F.ctl, L('A robot', 'Un robot'), [['romni', 'ROMNI'], ['otelo', 'OTELO'], ['raoul', 'RAOUL'], ['wifi', 'WifiBot']], '', function (k) { lv.set(EX[k][0]); draw(); });
    var nt = note(F.ctl, '');
    var cv = canvas(F.view, 0.72, L('The levels of the PAT architecture', 'Les niveaux de l\'architecture PAT'));
    function draw() {
      var n = lv.get(), k = ex.get();
      clear(cv); var c = cv.x, Wd = cv.w, H = cv.h, top = 14, rowH = (H - top - 50) / 5, cx = [Wd * 0.03, Wd * 0.26, Wd * 0.63], bw = [Wd * 0.18, Wd * 0.33, Wd * 0.33];
      text(cv, L('Teleoperation', 'Téléopération'), cx[0] + bw[0] / 2, top - 2, C.b, 12, 'center', true); text(cv, L('Action', 'Action'), cx[1] + bw[1] / 2, top - 2, C.y, 12, 'center', true); text(cv, L('Perception', 'Perception'), cx[2] + bw[2] / 2, top - 2, C.g, 12, 'center', true);
      for (var i = 5; i >= 1; i--) {
        var y = top + 6 + (5 - i) * rowH, auto = i <= n, op = i === n + 1, hh = rowH - 12;
        c.globalAlpha = op ? 1 : 0.28; c.fillStyle = C.b; c.fillRect(cx[0], y, bw[0], hh); c.globalAlpha = 1;
        text(cv, 'T' + i + (op ? ' ← ' + L('operator', 'opérateur') : ''), cx[0] + 8, y + hh / 2 + 4, op ? C.bg : C.ink, 11, 'left', op);
        c.globalAlpha = auto ? 1 : 0.22; c.fillStyle = C.y; c.fillRect(cx[1], y, bw[1], hh); c.fillStyle = C.g; c.fillRect(cx[2], y, bw[2], hh); c.globalAlpha = 1;
        text(cv, 'A' + i + ' · ' + LVL[i - 1][0], cx[1] + 8, y + hh / 2 + 4, auto ? '#1b1b1b' : C.mute, 11, 'left', true);
        text(cv, 'P' + i + ' · ' + LVL[i - 1][1], cx[2] + 8, y + hh / 2 + 4, auto ? '#1b1b1b' : C.mute, 11, 'left', true);
        text(cv, L('Level ', 'Niveau ') + i, Wd - 4, y + 12, C.axis, 10, 'right');
        if (i > 1) { c.strokeStyle = C.axis; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(cx[1] + bw[1] / 2, y + hh); c.lineTo(cx[1] + bw[1] / 2, y + rowH + 2); c.stroke(); c.setLineDash([]); text(cv, LVL[i - 2][2], cx[1] + bw[1] / 2 + 6, y + hh + 10, C.axis, 10); }
        if (op) { c.strokeStyle = C.b; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx[0] + bw[0], y + hh / 2); c.lineTo(cx[1] - 4, y + hh / 2 + (i <= 5 ? rowH : 0)); c.stroke(); c.lineWidth = 1; }
      }
      var yb = top + 6 + 5 * rowH; c.fillStyle = C.mute; c.fillRect(Wd * 0.38, yb, Wd * 0.3, 30); text(cv, L('Level 0 · the robot (A.M.S.)', 'Niveau 0 · le robot (A.M.S.)'), Wd * 0.53, yb + 19, C.bg, 11, 'center', true);
      if (n === 0) { c.strokeStyle = C.b; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx[0] + bw[0], top + 6 + 4 * rowH + (rowH - 12) / 2); c.lineTo(Wd * 0.38, yb + 15); c.stroke(); c.lineWidth = 1; }
      var what = n === 0 ? L('The operator drives the actuators directly (pure teleoperation, like the first master-slave arms).', 'L\'opérateur commande directement les actionneurs (téléopération pure, comme les premiers bras maître-esclave).') : n === 5 ? L('Full autonomy: the robot generates its own missions; the operator only supervises.', 'Autonomie complète : le robot génère ses propres missions ; l\'opérateur ne fait que superviser.') : L('The operator gives ', 'L\'opérateur donne ') + LVL[n - 1][3] + '.';
      nt.innerHTML = (k ? '<b>' + EX[k][1] + '</b><br>' : '') + what;
    }
    draw(); redraws.push(function (resize) { if (resize) cv.fit(); draw(); });
  };

  // ================================================================ safety: three small exercises
  function sorter(w, title, intro, cats, items) {
    w.innerHTML = '<h4>' + title + '</h4><p class="wnote">' + intro + '</p>';
    var list = el('div', { 'class': 'tw-sort' }); w.appendChild(list);
    var score = el('p', { 'class': 'tw-score', 'aria-live': 'polite' }); w.appendChild(score);
    var done = {};
    items.forEach(function (it, i) {
      var row = el('div', { 'class': 'tw-item' }); row.innerHTML = '<p>' + it[0] + '</p><div class="tw-opts">' + cats.map(function (c) { return '<button type="button" data-c="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div><p class="tw-why" hidden></p>';
      list.appendChild(row);
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-c]'); if (!b) return;
        var ok = b.dataset.c === it[1]; [].forEach.call(row.querySelectorAll('button'), function (x) { x.classList.toggle('good', x.dataset.c === it[1] && ok); x.classList.toggle('bad', x === b && !ok); });
        var why = row.querySelector('.tw-why'); why.hidden = false; why.innerHTML = (ok ? '✓ ' : '✗ ') + it[2]; why.className = 'tw-why ' + (ok ? 'ok' : 'no');
        if (!(i in done)) done[i] = ok;
        var n = Object.keys(done).length, good = Object.keys(done).filter(function (k) { return done[k]; }).length;
        score.textContent = L('First answers right: ', 'Premières réponses justes : ') + good + ' / ' + n + (n === items.length ? (good === items.length ? L(' — perfect!', ' — parfait !') : '') : '');
      });
    });
  }
  W['tel-machine'] = function (w) {
    sorter(w, L('Exercise: machine, partly completed machinery, or neither?', 'Exercice : machine, quasi-machine, ou ni l\'un ni l\'autre ?'),
      L('For each equipment, choose its status under the Machinery Directive, then read the reason.', 'Pour chaque équipement, choisissez son statut selon la directive Machines, puis lisez la raison.'),
      [['m', L('Machine', 'Machine')], ['q', L('Partly completed', 'Quasi-machine')], ['x', L('Neither / excluded', 'Ni l\'un ni l\'autre / exclu')]], [
        [L('A complete robot cell: robot, gripper, conveyor, fences, ready to palletise boxes.', 'Une cellule robotisée complète : robot, pince, convoyeur, clôtures, prête à palettiser des cartons.'), 'm', L('Moving parts, a drive system and a <b>defined application</b>: it is a machine (and the integrator who assembled it is its manufacturer).', 'Des pièces mobiles, un entraînement et une <b>application définie</b> : c\'est une machine (et l\'intégrateur qui l\'a assemblée en est le fabricant).')],
        [L('An industrial robot arm sold alone, without tool and without task.', 'Un bras robot industriel vendu seul, sans outil et sans tâche.'), 'q', L('It cannot do a defined application on its own: it is <b>partly completed machinery</b>, delivered with a declaration of incorporation and assembly instructions.', 'Il ne peut pas faire seul une application définie : c\'est une <b>quasi-machine</b>, livrée avec une déclaration d\'incorporation et une notice d\'assemblage.')],
        [L('A gear motor (motor + gearbox) sold to be built into machines.', 'Un motoréducteur (moteur + réducteur) vendu pour être intégré dans des machines.'), 'q', L('A drive system alone is the textbook example of partly completed machinery.', 'Un système d\'entraînement seul est l\'exemple type de la quasi-machine.')],
        [L('A petrol hedge trimmer.', 'Un taille-haie thermique.'), 'm', L('Motor-driven, moving blade, defined application: a machine (consumer products are covered too).', 'Entraîné par un moteur, lame mobile, application définie : une machine (les produits grand public sont couverts aussi).')],
        [L('A prototype built for temporary use in a research laboratory.', 'Un prototype construit pour un usage temporaire dans un laboratoire de recherche.'), 'x', L('Machines specially designed for research for temporary use in laboratories are <b>excluded</b> from the directive (the employer must still make them safe for the workers).', 'Les machines spécialement conçues pour la recherche, à usage temporaire en laboratoire, sont <b>exclues</b> de la directive (l\'employeur doit quand même les rendre sûres pour les travailleurs).')],
        [L('A spare gearbox sold to replace an identical worn one.', 'Un réducteur de rechange vendu pour remplacer un réducteur usé identique.'), 'x', L('Spare parts replacing identical parts, supplied by the original manufacturer, are excluded.', 'Les pièces de rechange qui remplacent des pièces identiques, fournies par le fabricant d\'origine, sont exclues.')],
        [L('A cobot palletiser sold complete with its gripper and its software.', 'Un palettiseur collaboratif vendu complet avec sa pince et son logiciel.'), 'm', L('Complete and ready for its task: a machine, with CE marking and a declaration of conformity.', 'Complet et prêt pour sa tâche : une machine, avec marquage CE et déclaration de conformité.')],
        [L('A wheelbarrow pushed by hand.', 'Une brouette poussée à la main.'), 'x', L('Its only power is human force applied directly: not a machine under the directive.', 'Sa seule énergie est la force humaine appliquée directement : ce n\'est pas une machine au sens de la directive.')]
      ]);
  };
  W['tel-3step'] = function (w) {
    sorter(w, L('Exercise: which step of the safety method?', 'Exercice : quelle étape de la démarche de sécurité ?'),
      L('The designer must apply the steps in this order: 1. inherently safe design (eliminate or reduce), 2. safeguarding (protect), 3. information for use (inform). Place each measure.', 'Le concepteur doit appliquer les étapes dans cet ordre : 1. prévention intrinsèque (éliminer ou réduire), 2. protection, 3. information pour l\'utilisation (informer). Placez chaque mesure.'),
      [['1', L('1 · Eliminate / reduce', '1 · Éliminer / réduire')], ['2', L('2 · Protect', '2 · Protéger')], ['3', L('3 · Inform', '3 · Informer')]], [
        [L('Round off the sharp edges of the gripper.', 'Arrondir les arêtes vives de la pince.'), '1', L('The danger is removed at the source, by design.', 'Le danger est supprimé à la source, par la conception.')],
        [L('Limit the speed and the force of the cobot so that a contact cannot hurt.', 'Limiter la vitesse et l\'effort du cobot pour qu\'un contact ne puisse pas blesser.'), '1', L('Reducing the energy of the moving part is inherently safe design.', 'Réduire l\'énergie de l\'élément mobile est de la prévention intrinsèque.')],
        [L('A fixed fence around the robot.', 'Une clôture fixe autour du robot.'), '2', L('A fixed guard: a safeguarding measure.', 'Un protecteur fixe : une mesure de protection.')],
        [L('A light curtain that stops the robot when someone enters.', 'Une barrière immatérielle qui arrête le robot quand quelqu\'un entre.'), '2', L('Sensitive protective equipment that detects people: safeguarding.', 'Un équipement de protection sensible qui détecte les personnes : protection.')],
        [L('A door with an interlock: opening it stops the robot.', 'Une porte avec un interverrouillage : l\'ouvrir arrête le robot.'), '2', L('A movable guard with an interlocking device: safeguarding.', 'Un protecteur mobile avec dispositif de verrouillage : protection.')],
        [L('Floor marking of the collaborative zone and a warning light.', 'Un marquage au sol de la zone collaborative et un voyant d\'avertissement.'), '3', L('Signals and markings inform; they do not protect by themselves.', 'Les signaux et marquages informent ; ils ne protègent pas à eux seuls.')],
        [L('The instructions say to wear safety glasses when changing the tool.', 'La notice demande de porter des lunettes de protection pour changer l\'outil.'), '3', L('Information for use, including personal protective equipment: the last step, for the residual risks only.', 'Information pour l\'utilisation, y compris les équipements de protection individuelle : la dernière étape, seulement pour les risques résiduels.')],
        [L('Place the robot so that no crushing zone remains between the arm and a wall.', 'Implanter le robot pour qu\'il ne reste aucune zone d\'écrasement entre le bras et un mur.'), '1', L('Geometry chosen to remove the danger: inherently safe design.', 'Une géométrie choisie pour supprimer le danger : prévention intrinsèque.')]
      ]);
  };
  W['tel-plr'] = function (w) {
    var F = frame(w, L('Lab: the risk graph of ISO 13849-1', 'Labo : le graphe de risque de l\'ISO 13849-1'),
      L('For each safety function (for example “stop the robot when the door opens”), answer three questions: the graph gives the required performance level PL<sub>r</sub>, from a (low) to e (high).', 'Pour chaque fonction de sécurité (par exemple « arrêter le robot quand la porte s\'ouvre »), répondez à trois questions : le graphe donne le niveau de performance requis PL<sub>r</sub>, de a (faible) à e (élevé).'));
    var S = seg(F.ctl, L('S · severity of the injury', 'S · gravité de la blessure'), [['1', L('S1 slight (reversible)', 'S1 légère (réversible)')], ['2', L('S2 serious (irreversible, death)', 'S2 grave (irréversible, mort)')]], '2', draw);
    var Fq = seg(F.ctl, L('F · frequency and/or duration of exposure', 'F · fréquence et/ou durée d\'exposition'), [['1', L('F1 rare, short', 'F1 rare, courte')], ['2', L('F2 frequent, long', 'F2 fréquente, longue')]], '2', draw);
    var Pp = seg(F.ctl, L('P · possibility to avoid the hazard', 'P · possibilité d\'éviter le danger'), [['1', L('P1 possible', 'P1 possible')], ['2', L('P2 scarcely possible', 'P2 à peine possible')]], '1', draw);
    var cv = canvas(F.view, 0.62, L('Risk graph', 'Graphe de risque'));
    var out = readouts(F.side);
    var PL = { '111': 'a', '112': 'b', '121': 'b', '122': 'c', '211': 'c', '212': 'd', '221': 'd', '222': 'e' };
    var MEAN = { a: L('a simple, well-tried component can do', 'un composant simple et éprouvé suffit'), b: L('basic safety principles, single channel', 'principes de sécurité de base, une voie'), c: L('single channel with tests, or two channels', 'une voie avec tests, ou deux voies'), d: L('two channels (redundancy) with good diagnostics: typical for robot cells', 'deux voies (redondance) avec un bon diagnostic : typique des cellules robotisées'), e: L('two channels, high diagnostics, very reliable parts: the highest level', 'deux voies, diagnostic élevé, pièces très fiables : le niveau le plus haut') };
    function draw() {
      var s = S.get(), fq = Fq.get(), p = Pp.get(), key = s + fq + p, r = PL[key];
      clear(cv); var c = cv.x, Wd = cv.w, H = cv.h, x0 = 30, xs = [x0, Wd * 0.25, Wd * 0.47, Wd * 0.68], yc = H / 2;
      // the tree: start → S → F → P → PL
      var leaves = ['111', '112', '121', '122', '211', '212', '221', '222'], ly = function (i) { return 22 + i * (H - 44) / 7; };
      var node = function (lvl, code) { if (lvl === 0) return [xs[0], yc]; var span = Math.pow(2, 3 - lvl), first = parseInt(code.split('').map(function (d) { return d - 1; }).join(''), 2) * span, ys = 0; for (var k = 0; k < span; k++) ys += ly(first + k); return [xs[lvl], ys / span]; };
      var on = function (code) { return key.indexOf(code) === 0; };
      ['1', '2'].forEach(function (a) { ['1', '2'].forEach(function (b) { ['1', '2'].forEach(function (d) {
        [[0, '', a], [1, a, a + b], [2, a + b, a + b + d]].forEach(function (e) {
          var p0 = node(e[0], e[1]), p1 = node(e[0] + 1, e[2]), act = on(e[2]);
          c.strokeStyle = act ? C.y : C.grid; c.lineWidth = act ? 3 : 1.5; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0] - 6, p1[1]); c.stroke();
          if (e[0] < 2 || true) text(cv, ['S', 'F', 'P'][e[0]] + e[2].slice(-1), (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 4, act ? C.y : C.axis, 10, 'center', act);
        });
      }); }); });
      leaves.forEach(function (lf, i) { var y = ly(i), act = lf === key, lv = PL[lf]; c.fillStyle = act ? C.y : C.box; c.fillRect(Wd * 0.8, y - 10, 44, 20); text(cv, 'PL ' + lv, Wd * 0.8 + 22, y + 4, act ? '#1b1b1b' : C.ink, 11, 'center', true); c.strokeStyle = act ? C.y : C.grid; c.lineWidth = act ? 3 : 1; c.beginPath(); c.moveTo(xs[3], y); c.lineTo(Wd * 0.8, y); c.stroke(); });
      c.lineWidth = 1; c.fillStyle = C.b; c.beginPath(); c.arc(xs[0], yc, 6, 0, 7); c.fill(); text(cv, L('start', 'départ'), xs[0] - 4, yc + 20, C.axis, 10);
      out([[L('Required performance level', 'Niveau de performance requis'), 'PL<sub>r</sub> = ' + r, r >= 'd' ? 'bad' : 'ok'], [L('What it means', 'Ce que cela veut dire'), MEAN[r]]]);
    }
    draw(); redraws.push(function (resize) { if (resize) cv.fit(); draw(); });
  };

  function init() { [].forEach.call(document.querySelectorAll('.widget[data-widget^="tel-"]'), function (w) { var k = w.dataset.widget; if (W[k] && !w.firstChild) { try { W[k](w); } catch (e) { w.textContent = 'Error: ' + e.message; if (window.console) console.error(e); } } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
