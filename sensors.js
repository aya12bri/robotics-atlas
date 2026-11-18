// sensors.js — the sensor test bench (sensors.html): six live benches that show what real sensors measure,
// with their resolution, noise, bias and blind spots: encoder, IMU (gyroscope + accelerometer), 2D lidar,
// camera and stereo depth, ultrasonic range finder, GNSS receiver (satellites, DOP, multipath, SBAS, RTK, fusion).
// Each bench has a challenge; under the benches, a guide to choose a sensor for a need.
// Everything is simulated in the browser (no library).
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr';
    var L = function (en, fr) { return FR ? fr : en; };
    var main = document.getElementById('sens');
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var num = function (v, d) { var s = (+v).toFixed(d === undefined ? 2 : d); return FR ? s.replace('.', ',') : s; };
    document.title = L('Sensor test bench', 'Banc d\'essai des capteurs') + ' — Robotics Atlas';

    // ------------------------------------------------------------------ helpers: random numbers, colours, canvas
    function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    var C = {};
    function colours() {
      var cs = getComputedStyle(document.documentElement), g = function (n, d) { return (cs.getPropertyValue(n) || '').trim() || d; };
      C = { bg: g('--fpanel', '#141c2b'), ink: g('--f-ink', '#d6dfeb'), axis: g('--f-axis', '#a3b0c2'), grid: g('--f-grid', '#2c3a50'), box: g('--f-box', '#1c2638'),
        o: g('--f-o', '#ffa04d'), b: g('--f-b', '#5aa9ff'), g: g('--f-g', '#4ed17f'), r: g('--f-r', '#ff6b6b'), p: g('--f-p', '#b88cff'), y: g('--f-y', '#ffd60a'), mute: g('--f-mute', '#8a99ae') };
    }
    colours();
    function canvas(host, ratio) {
      var c = document.createElement('canvas'); c.className = 'sb-cv'; host.appendChild(c);
      var o = { c: c, x: c.getContext('2d'), w: 0, h: 0, ratio: ratio };
      o.fit = function () { var w = Math.max(240, c.clientWidth || host.clientWidth || 600), h = Math.round(w * ratio), d = window.devicePixelRatio || 1; c.width = Math.round(w * d); c.height = Math.round(h * d); c.style.height = h + 'px'; o.x.setTransform(d, 0, 0, d, 0, 0); o.w = w; o.h = h; };
      o.fit(); return o;
    }
    function clear(cv) { var x = cv.x; x.fillStyle = C.bg; x.fillRect(0, 0, cv.w, cv.h); }
    function text(cv, s, px, py, col, size, align, bold) { var x = cv.x; x.fillStyle = col || C.ink; x.font = (bold ? '600 ' : '') + (size || 12) + 'px "IBM Plex Mono", ui-monospace, monospace'; x.textAlign = align || 'left'; x.fillText(s, px, py); }
    // a time chart: { x0, x1, y0, y1, series: [{ pts:[[x,y]], col, w, dash, label }], xl, yl, cursor }
    function chart(cv, o, area) {
      var x = cv.x, A = area || { l: 48, t: 14, r: cv.w - 12, b: cv.h - 30 };
      var X = function (v) { return A.l + (v - o.x0) / (o.x1 - o.x0) * (A.r - A.l); }, Y = function (v) { return A.b - (v - o.y0) / (o.y1 - o.y0) * (A.b - A.t); };
      x.lineWidth = 1; x.strokeStyle = C.grid; x.setLineDash([]);
      for (var i = 0; i <= 5; i++) { var vx = o.x0 + (o.x1 - o.x0) * i / 5, vy = o.y0 + (o.y1 - o.y0) * i / 4;
        x.beginPath(); x.moveTo(X(vx), A.t); x.lineTo(X(vx), A.b); x.stroke(); text(cv, num(vx, Math.abs(o.x1 - o.x0) < 5 ? 1 : 0), X(vx), A.b + 14, C.axis, 11, 'center');
        if (i <= 4) { x.beginPath(); x.moveTo(A.l, Y(vy)); x.lineTo(A.r, Y(vy)); x.stroke(); text(cv, num(vy, Math.abs(o.y1 - o.y0) < 5 ? 1 : 0), A.l - 6, Y(vy) + 4, C.axis, 11, 'right'); } }
      if (o.xl) text(cv, o.xl, A.r, A.b + 27, C.axis, 11, 'right');
      if (o.yl) text(cv, o.yl, A.l + 4, A.t + 11, C.axis, 11, 'left');
      x.save(); x.beginPath(); x.rect(A.l, A.t, A.r - A.l, A.b - A.t); x.clip();
      o.series.forEach(function (s) {
        x.strokeStyle = s.col; x.lineWidth = s.w || 2; x.setLineDash(s.dash || []); x.beginPath();
        s.pts.forEach(function (p, k) { if (k) x.lineTo(X(p[0]), Y(p[1])); else x.moveTo(X(p[0]), Y(p[1])); });
        x.stroke();
      });
      x.restore(); x.setLineDash([]);
      // the legend, on a background box, under the axis title
      var labs = o.series.filter(function (s) { return s.label; });
      if (labs.length) {
        x.font = '11px "IBM Plex Mono", ui-monospace, monospace';
        var lw = Math.max.apply(null, labs.map(function (s) { return x.measureText(s.label).width; })) + 40, lh = labs.length * 15 + 8, lx = A.l + 8, ly0 = A.t + 18;
        x.fillStyle = C.bg; x.globalAlpha = 0.85; x.fillRect(lx, ly0 - 2, lw, lh); x.globalAlpha = 1; x.strokeStyle = C.grid; x.strokeRect(lx, ly0 - 2, lw, lh);
        labs.forEach(function (s, k) { var ly = ly0 + 12 + k * 15; x.fillStyle = s.col; x.fillRect(lx + 8, ly - 5, 14, 3); text(cv, s.label, lx + 28, ly, s.col, 11); });
      }
      if (o.cursor !== undefined) { x.strokeStyle = C.axis; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(X(o.cursor), A.t); x.lineTo(X(o.cursor), A.b); x.stroke(); x.setLineDash([]); }
      return { X: X, Y: Y, A: A };
    }
    // a slider with its value
    function slider(host, o) {
      var w = document.createElement('label'); w.className = 'sb-sl';
      w.innerHTML = '<span>' + o.label + '</span><input type="range" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || 1) + '" value="' + o.value + '"><b></b>';
      host.appendChild(w);
      var i = w.querySelector('input'), b = w.querySelector('b');
      var val = function () { var v = +i.value; return o.map ? o.map(v) : v; };
      var show = function () { b.textContent = o.fmt ? o.fmt(val()) : num(val(), o.dec || 0); };
      i.addEventListener('input', function () { show(); o.on && o.on(); }); show();
      return { get: val, input: i };
    }
    function check(host, label, on, cb) { var w = document.createElement('label'); w.className = 'sb-ck'; w.innerHTML = '<input type="checkbox"' + (on ? ' checked' : '') + '> ' + label; host.appendChild(w); var i = w.querySelector('input'); i.addEventListener('change', cb); return i; }
    function readouts(host) { var d = document.createElement('div'); d.className = 'sb-read'; host.appendChild(d); return function (rows) { d.innerHTML = rows.map(function (r) { return '<div' + (r[2] ? ' class="' + r[2] + '"' : '') + '><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join(''); }; }

    // a row of choices (one at a time)
    function seg(host, label, opts, val, cb) {
      var w = document.createElement('div'); w.className = 'sb-seg'; w.setAttribute('role', 'radiogroup'); w.setAttribute('aria-label', label);
      w.innerHTML = '<span>' + label + '</span><div>' + opts.map(function (o) { return '<button type="button" role="radio" data-v="' + o[0] + '" aria-checked="' + (o[0] === val) + '">' + o[1] + '</button>'; }).join('') + '</div>';
      host.appendChild(w); var cur = val;
      w.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (!b || b.dataset.v === cur) return; cur = b.dataset.v; [].forEach.call(w.querySelectorAll('button'), function (x) { x.setAttribute('aria-checked', String(x.dataset.v === cur)); }); if (cb) cb(); });
      return { get: function () { return cur; } };
    }
    // a challenge for each bench: it turns green when the settings meet it; the benches already met get a ✓ on their tab
    var CH = 'ra-sens-ch', chDone = function () { try { return JSON.parse(localStorage.getItem(CH) || '{}') || {}; } catch (e) { return {}; } };
    function challenge(host, id, txt) {
      var d = document.createElement('div'); d.className = 'sb-chal'; d.setAttribute('aria-live', 'polite');
      d.innerHTML = '<b>' + L('Challenge', 'Défi') + '</b><p>' + txt + '</p><span></span>'; host.appendChild(d);
      var st = d.querySelector('span'), was = null;
      return function (ok) {
        if (ok === was) return; was = ok; d.classList.toggle('ok', ok);
        var done = chDone();
        if (ok && !done[id]) { done[id] = 1; try { localStorage.setItem(CH, JSON.stringify(done)); } catch (e) { /* */ } paintTabs(); }
        st.textContent = ok ? L('✓ Challenge met!', '✓ Défi réussi !') : done[id] ? L('Met before: can you do it again?', 'Déjà réussi : saurez-vous le refaire ?') : L('Not yet: change the settings.', 'Pas encore : changez les réglages.');
      };
    }
    function paintTabs() { var done = chDone(); [].forEach.call(main.querySelectorAll('.sb-tabs button'), function (b) { b.classList.toggle('done', !!done[b.dataset.b]); }); }

    // ------------------------------------------------------------------ page
    var BENCH = [
      { id: 'encoder', t: L('Encoder', 'Encodeur'), d: L('How finely does a wheel or a joint know its angle and its speed?', 'À quel point une roue ou une articulation connaît-elle son angle et sa vitesse ?') },
      { id: 'imu', t: L('IMU: gyro + accelerometer', 'Centrale inertielle (IMU)'), d: L('Why a gyroscope drifts, why an accelerometer is noisy, and how to combine them.', 'Pourquoi un gyroscope dérive, pourquoi un accéléromètre est bruité, et comment les combiner.') },
      { id: 'lidar', t: L('2D lidar', 'Lidar 2D'), d: L('What a laser scanner sees in a room: noise, resolution, glass and black objects.', 'Ce qu\'un scanner laser voit dans une pièce : bruit, résolution, verre et objets noirs.') },
      { id: 'camera', t: L('Camera and stereo', 'Caméra et stéréo'), d: L('Lens distortion, and why stereo depth gets worse with the square of the distance.', 'La distorsion de l\'objectif, et pourquoi la profondeur stéréo se dégrade avec le carré de la distance.') },
      { id: 'sonar', t: L('Ultrasonic', 'Ultrasons'), d: L('A wide cone, walls that do not answer, and the temperature that changes the distance.', 'Un cône large, des murs qui ne répondent pas, et la température qui change la distance.') },
      { id: 'gnss', t: L('GNSS (GPS…)', 'GNSS (GPS…)'), d: L('Satellites, buildings that hide and reflect them, SBAS and RTK corrections, and the fusion with odometry.', 'Les satellites, les immeubles qui les cachent et les réfléchissent, les corrections SBAS et RTK, et la fusion avec l\'odométrie.') }
    ];
    main.innerHTML = '<h1>' + L('Sensor test bench', 'Banc d\'essai des capteurs') + '</h1>' +
      '<p class="lead">' + L('Every sensor lies a little: it has a resolution, noise, a bias, and blind spots. Turn the knobs and watch what a robot really measures, then read the numbers that engineers use to choose a sensor.', 'Tout capteur ment un peu : il a une résolution, du bruit, un biais et des angles morts. Tournez les boutons et regardez ce qu\'un robot mesure vraiment, puis lisez les chiffres que les ingénieurs utilisent pour choisir un capteur.') + '</p>' +
      '<nav class="sb-tabs" role="tablist">' + BENCH.map(function (b, k) { return '<button type="button" role="tab" data-b="' + b.id + '" aria-selected="' + (k === 0) + '"><b>' + esc(b.t) + '</b><span>' + esc(b.d) + '</span></button>'; }).join('') + '</nav>' +
      BENCH.map(function (b) { return '<section class="sb-bench" id="' + b.id + '" hidden></section>'; }).join('') +
      '<section class="sb-guide" aria-labelledby="sbGuideT"></section>';
    var running = null;                                                    // the animation of the bench on screen
    function show(id) {
      if (!BENCH.some(function (b) { return b.id === id; })) id = 'encoder';
      [].forEach.call(main.querySelectorAll('.sb-tabs button'), function (b) { b.setAttribute('aria-selected', String(b.dataset.b === id)); });
      [].forEach.call(main.querySelectorAll('.sb-bench'), function (s) { s.hidden = s.id !== id; });
      if (running && running.stop) running.stop();
      var sec = document.getElementById(id);
      if (!sec.dataset.ready) { sec.dataset.ready = '1'; sec._b = MAKERS[id](sec); }
      running = sec._b; running.start && running.start();
      if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    }
    main.querySelector('.sb-tabs').addEventListener('click', function (e) { var b = e.target.closest('button[data-b]'); if (b) show(b.dataset.b); });
    function frame(sec, title, intro) {
      sec.innerHTML = '<h2>' + title + '</h2><p class="sb-intro">' + intro + '</p><div class="sb-grid"><div class="sb-view"></div><div class="sb-side"><div class="sb-ctl"></div></div></div><div class="sb-notes"></div>';
      return { view: sec.querySelector('.sb-view'), ctl: sec.querySelector('.sb-ctl'), side: sec.querySelector('.sb-side'), notes: sec.querySelector('.sb-notes') };
    }
    function notes(el, eqs, tips) {
      el.innerHTML = '<div class="sb-eq">' + eqs.map(function (q) { return '<p>' + q + '</p>'; }).join('') + '</div><ul class="sb-tips">' + tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
    }

    var MAKERS = {};
    // ================================================================== 1. encoder
    MAKERS.encoder = function (sec) {
      var F = frame(sec, L('Incremental encoder', 'Encodeur incrémental'), L('A disc with N lines turns in front of two optical sensors A and B, a quarter of a line apart. Each edge is one count; with both channels (quadrature) you get 4 counts per line and the direction. The speed is estimated by counting the edges during a sampling period T.', 'Un disque à N traits tourne devant deux capteurs optiques A et B, décalés d\'un quart de trait. Chaque front est une impulsion ; avec les deux voies (quadrature) on obtient 4 impulsions par trait et le sens. La vitesse est estimée en comptant les fronts pendant une période d\'échantillonnage T.'));
      var top = canvas(F.view, 0.42), bot = canvas(F.view, 0.42);
      var lines = slider(F.ctl, { label: L('Lines per turn N', 'Traits par tour N'), min: 2, max: 11, value: 6, map: function (v) { return Math.pow(2, v); }, fmt: function (v) { return v; }, on: redraw });
      var q4 = check(F.ctl, L('Quadrature ×4 (A and B edges)', 'Quadrature ×4 (fronts de A et B)'), true, redraw);
      var rpm = slider(F.ctl, { label: L('True speed (rpm)', 'Vitesse réelle (tr/min)'), min: 0, max: 100, value: 75, map: function (v) { return Math.round(Math.pow(10, v / 100 * 3.3)) / 1; }, fmt: function (v) { return v; }, on: redraw });
      var per = slider(F.ctl, { label: L('Sampling period T (ms)', 'Période d\'échantillonnage T (ms)'), min: 1, max: 50, value: 10, on: redraw });
      var out = readouts(F.side);
      var ch = challenge(F.side, 'encoder', L('Get a speed resolution of 2 rpm or better with a sampling period of 5 ms or less.', 'Obtenez une résolution de vitesse de 2 tr/min ou mieux avec une période d\'échantillonnage de 5 ms ou moins.'));
      notes(F.notes, [
        L('Angle resolution: Δθ = 360° / (4 N) &emsp; Speed resolution: Δω = 60 / (4 N · T) rpm', 'Résolution d\'angle : Δθ = 360° / (4 N) &emsp; Résolution de vitesse : Δω = 60 / (4 N · T) tr/min'),
        L('Speed estimate: ω̂ = Δcounts / (4 N · T) turns per second', 'Vitesse estimée : ω̂ = Δimpulsions / (4 N · T) tours par seconde')],
        [L('At low speed with a short period, the estimate jumps between 0 and one count: lengthen T, filter, or time the edges (T-method).', 'À basse vitesse avec une période courte, l\'estimation saute entre 0 et une impulsion : allongez T, filtrez, ou mesurez le temps entre fronts (méthode T).'),
          L('More lines or quadrature divide the step by 4: it is free precision. A gearbox after the motor multiplies the resolution at the joint by its ratio.', 'Plus de traits ou la quadrature divisent le pas par 4 : c\'est de la précision gratuite. Un réducteur après le moteur multiplie la résolution à l\'articulation par son rapport.'),
          L('An incremental encoder counts from where it started: it needs a homing at start-up (an absolute encoder does not).', 'Un encodeur incrémental compte depuis là où il a démarré : il lui faut une prise d\'origine au démarrage (un encodeur absolu non).')]);
      var t0 = performance.now(), raf = 0;
      function counts(theta) { var n = lines.get() * (q4.checked ? 4 : 1); return Math.floor(theta * n); }   // theta in turns
      function speedAt(t) { return rpm.get() / 60 * (1 + 0.25 * Math.sin(2 * Math.PI * 0.8 * t)); }      // turns per second, varying a little
      function thetaAt(t) { var w = rpm.get() / 60; return w * t - w * 0.25 / (2 * Math.PI * 0.8) * Math.cos(2 * Math.PI * 0.8 * t) + w * 0.25 / (2 * Math.PI * 0.8); }
      function redraw() {
        var N = lines.get(), n = N * (q4.checked ? 4 : 1), T = per.get() / 1000, W = 2;
        // the speed chart over 2 s
        var tru = [], est = [], err = 0, k = 0, maxv = 0;
        for (var t = 0; t <= W; t += 0.004) { var v = speedAt(t) * 60; tru.push([t, v]); maxv = Math.max(maxv, v); }
        for (var s = T; s <= W; s += T) { var c = counts(thetaAt(s)) - counts(thetaAt(s - T)), v2 = c / n / T * 60; est.push([s - T, v2], [s, v2]); err += Math.pow(v2 - speedAt(s - T / 2) * 60, 2); k++; }
        var ymax = Math.max(1, maxv * 1.35, est.reduce(function (m, p) { return Math.max(m, p[1]); }, 0) * 1.05);
        clear(bot); chart(bot, { x0: 0, x1: W, y0: 0, y1: ymax, xl: L('time (s)', 'temps (s)'), yl: L('speed (rpm)', 'vitesse (tr/min)'), series: [{ pts: tru, col: C.b, w: 2, label: L('true speed', 'vitesse réelle') }, { pts: est, col: C.o, w: 2, label: L('measured (counts / T)', 'mesurée (impulsions / T)') }] });
        out([
          [L('Counts per turn', 'Impulsions par tour'), n],
          [L('Angle resolution', 'Résolution d\'angle'), num(360 / n, 3) + '°'],
          [L('Speed resolution', 'Résolution de vitesse'), num(60 / (n * T), 1) + ' ' + L('rpm', 'tr/min')],
          [L('RMS speed error', 'Erreur de vitesse RMS'), num(Math.sqrt(err / Math.max(1, k)), 1) + ' ' + L('rpm', 'tr/min'), Math.sqrt(err / Math.max(1, k)) > 0.2 * rpm.get() ? 'bad' : 'ok']
        ]);
        ch(60 / (n * T) <= 2.0001 && per.get() <= 5);
      }
      function draw(now) {
        var t = (now - t0) / 1000, N = lines.get(), x = top.x; clear(top);
        // the disc (at most 64 lines drawn), turning slowly for the eye
        var cx = top.h * 0.5 + 8, cy = top.h / 2, R = top.h * 0.42, show = Math.min(N, 64), ang = 2 * Math.PI * ((rpm.get() / 60) * t % 1) * Math.min(1, 1.5 / Math.max(0.1, rpm.get() / 60));
        x.fillStyle = C.box; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill(); x.strokeStyle = C.axis; x.lineWidth = 1.5; x.stroke();
        x.strokeStyle = C.ink; x.lineWidth = Math.max(1, 2 * Math.PI * R / show / 2.4);
        for (var i = 0; i < show; i++) { var a = ang + i * 2 * Math.PI / show; x.beginPath(); x.moveTo(cx + R * 0.72 * Math.cos(a), cy + R * 0.72 * Math.sin(a)); x.lineTo(cx + R * 0.95 * Math.cos(a), cy + R * 0.95 * Math.sin(a)); x.stroke(); }
        x.fillStyle = C.bg; x.beginPath(); x.arc(cx, cy, R * 0.18, 0, 7); x.fill();
        x.fillStyle = C.o; x.fillRect(cx + R * 0.97, cy - 10, 10, 8); x.fillStyle = C.b; x.fillRect(cx + R * 0.97, cy + 2, 10, 8);
        text(top, 'A', cx + R + 14, cy - 2, C.o, 11); text(top, 'B', cx + R + 14, cy + 10, C.b, 11);
        // A and B square waves over a window of 4 lines
        var gx = cx + R + 34, gw = top.w - gx - 12, n4 = 4, period = 1 / N, th = thetaAt(t);
        var sq = function (phase, yb, col) { x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); for (var k = 0; k <= gw; k++) { var u = th - (gw - k) / gw * n4 * period, v = ((u / period + phase) % 1 + 1) % 1 < 0.5 ? 1 : 0, yy = yb - v * 22; if (k) x.lineTo(gx + k, yy); else x.moveTo(gx + k, yy); } x.stroke(); };
        sq(0, cy - 12, C.o); sq(0.25, cy + 34, C.b);
        text(top, L('channel A', 'voie A'), gx, cy - 42, C.o, 11); text(top, L('channel B (90° later)', 'voie B (90° plus tard)'), gx, cy + 4, C.b, 11);
        text(top, L('4 lines shown', '4 traits affichés'), top.w - 12, top.h - 8, C.axis, 11, 'right');
        raf = requestAnimationFrame(draw);
      }
      redraw();
      return { start: function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }, stop: function () { cancelAnimationFrame(raf); }, redraw: function () { top.fit(); bot.fit(); redraw(); } };
    };

    // ================================================================== 2. IMU
    MAKERS.imu = function (sec) {
      var F = frame(sec, L('IMU: gyroscope and accelerometer', 'Centrale inertielle : gyroscope et accéléromètre'), L('A robot tilts back and forth for 60 s. The gyroscope measures the rotation speed: integrated, it gives a smooth angle that slowly drifts (its bias adds up). The accelerometer sees gravity: it gives the tilt without drift, but noisy and disturbed by the movements. A complementary filter takes the best of both.', 'Un robot s\'incline d\'avant en arrière pendant 60 s. Le gyroscope mesure la vitesse de rotation : intégrée, elle donne un angle lisse qui dérive lentement (son biais s\'accumule). L\'accéléromètre voit la gravité : il donne l\'inclinaison sans dérive, mais bruitée et perturbée par les mouvements. Un filtre complémentaire prend le meilleur des deux.'));
      var cv = canvas(F.view, 0.62);
      var bias = slider(F.ctl, { label: L('Gyro bias (°/s)', 'Biais du gyro (°/s)'), min: 0, max: 200, value: 40, map: function (v) { return v / 100; }, dec: 2, on: compute });
      var gn = slider(F.ctl, { label: L('Gyro noise (°/s)', 'Bruit du gyro (°/s)'), min: 0, max: 100, value: 20, map: function (v) { return v / 100; }, dec: 2, on: compute });
      var an = slider(F.ctl, { label: L('Accelerometer noise (°)', 'Bruit de l\'accéléromètre (°)'), min: 0, max: 100, value: 30, map: function (v) { return v / 10; }, dec: 1, on: compute });
      var vib = slider(F.ctl, { label: L('Vibration / moves', 'Vibrations / mouvements'), min: 0, max: 100, value: 40, map: function (v) { return v / 100; }, dec: 2, on: compute });
      var al = slider(F.ctl, { label: L('Filter: gyro weight α', 'Filtre : poids du gyro α'), min: 0, max: 100, value: 80, map: function (v) { return 0.9 + v / 100 * 0.099; }, dec: 3, on: compute });
      var shown = { gyro: true, acc: true, fus: true };
      var out = readouts(F.side);
      var ch = challenge(F.side, 'imu', L('With a gyro bias of at least 1 °/s and vibrations of at least 0.6, bring the RMS error of the complementary filter under 1.1°.', 'Avec un biais de gyro d\'au moins 1 °/s et des vibrations d\'au moins 0,6, ramenez l\'erreur RMS du filtre complémentaire sous 1,1°.'));
      notes(F.notes, [
        L('Gyro only: θ<sub>g</sub>(t) = ∫ ω<sub>meas</sub> dt → error grows like b · t &emsp; Accelerometer: θ<sub>a</sub> = atan2(a<sub>x</sub>, a<sub>z</sub>)', 'Gyro seul : θ<sub>g</sub>(t) = ∫ ω<sub>mes</sub> dt → l\'erreur croît comme b · t &emsp; Accéléromètre : θ<sub>a</sub> = atan2(a<sub>x</sub>, a<sub>z</sub>)'),
        L('Complementary filter: θ ← α (θ + ω<sub>meas</sub> Δt) + (1 − α) θ<sub>a</sub> &emsp; time constant τ = α Δt / (1 − α)', 'Filtre complémentaire : θ ← α (θ + ω<sub>mes</sub> Δt) + (1 − α) θ<sub>a</sub> &emsp; constante de temps τ = α Δt / (1 − α)')],
        [L('A bias of only 0.4 °/s gives 24° of error after one minute: never trust an integrated gyro alone for long.', 'Un biais de seulement 0,4 °/s donne 24° d\'erreur après une minute : ne faites jamais confiance longtemps à un gyro intégré seul.'),
          L('α close to 1 trusts the gyro (smooth, but the bias leaks in); a smaller α trusts the accelerometer (no drift, but noisy): choose τ of about a second.', 'α proche de 1 fait confiance au gyro (lisse, mais le biais passe) ; un α plus petit fait confiance à l\'accéléromètre (pas de dérive, mais bruité) : choisissez τ d\'environ une seconde.'),
          L('The yaw (heading) has no gravity reference: a magnetometer, a camera or a lidar is needed to correct it. A Kalman filter does the same job with the noise levels as weights.', 'Le lacet (cap) n\'a pas de référence de gravité : il faut un magnétomètre, une caméra ou un lidar pour le corriger. Un filtre de Kalman fait le même travail avec les niveaux de bruit comme poids.')]);
      var D = null, t0 = 0, raf = 0, dur = 60, dt = 0.01, play = 9;    // 60 s shown in 9 s
      function compute() {
        var r = rng(7), n = Math.round(dur / dt), th = 0, w = 0, tg = 0, tf = 0, P = { t: [], tru: [], gyr: [], acc: [], fus: [] };
        var b = bias.get(), sg = gn.get(), sa = an.get(), vb = vib.get(), a = al.get();
        // smooth random target angles every 4 s, followed by a second-order motion
        var targets = []; for (var k = 0; k <= dur / 4 + 1; k++) targets.push((r() * 2 - 1) * 30);
        for (var i = 0; i <= n; i++) {
          var t = i * dt, tgt = targets[Math.floor(t / 4)], acc = 6 * (tgt - th) - 4 * w;     // °/s²
          w += acc * dt; th += w * dt;
          var wm = w + b + sg * gauss(r) / Math.sqrt(dt) * 0.1;
          var am = th + sa * gauss(r) + vb * acc * 0.12 + vb * 1.5 * Math.sin(2 * Math.PI * 9 * t);
          tg += wm * dt; tf = a * (tf + wm * dt) + (1 - a) * am;
          if (i % 5 === 0) { P.t.push(t); P.tru.push(th); P.gyr.push(tg); P.acc.push(am); P.fus.push(tf); }
        }
        D = P; t0 = performance.now(); draw(performance.now());
        var rms = function (arr) { var s = 0; for (var j = 0; j < arr.length; j++) s += Math.pow(arr[j] - P.tru[j], 2); return Math.sqrt(s / arr.length); };
        var tau = a * dt / (1 - a);
        out([
          [L('Gyro only: error after 60 s', 'Gyro seul : erreur après 60 s'), num(P.gyr[P.gyr.length - 1] - P.tru[P.tru.length - 1], 1) + '°', Math.abs(P.gyr[P.gyr.length - 1] - P.tru[P.tru.length - 1]) > 5 ? 'bad' : ''],
          [L('Accelerometer only: RMS error', 'Accéléromètre seul : erreur RMS'), num(rms(P.acc), 2) + '°'],
          [L('Complementary filter: RMS error', 'Filtre complémentaire : erreur RMS'), num(rms(P.fus), 2) + '°', rms(P.fus) < Math.min(rms(P.acc), rms(P.gyr)) ? 'ok' : ''],
          [L('Filter time constant τ', 'Constante de temps du filtre τ'), num(tau, 2) + ' s']
        ]);
        ch(b >= 1 && vb >= 0.6 && rms(P.fus) < 1.1);
      }
      var leg = document.createElement('div'); leg.className = 'sb-leg'; F.side.insertBefore(leg, F.side.querySelector('.sb-read'));
      [['gyro', L('gyro integrated', 'gyro intégré'), 'o'], ['acc', L('accelerometer', 'accéléromètre'), 'p'], ['fus', L('filter', 'filtre'), 'g']].forEach(function (s) {
        check(leg, '<i style="background:var(--f-' + s[2] + ')"></i>' + s[1], true, function (e) { shown[s[0]] = e.target.checked; draw(performance.now()); });
      });
      function draw(now) {
        if (!D) return;
        var tt = Math.min(dur, (now - t0) / 1000 / play * dur), m = Math.max(1, Math.round(tt / dur * (D.t.length - 1)));
        var pick = function (arr) { var o = []; for (var j = 0; j <= m && j < arr.length; j++) o.push([D.t[j], arr[j]]); return o; };
        var all = D.tru.concat(D.gyr, D.acc), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * 0.08 + 2;
        var series = [];
        if (shown.acc) series.push({ pts: pick(D.acc), col: C.p, w: 1 });
        if (shown.gyro) series.push({ pts: pick(D.gyr), col: C.o, w: 2 });
        if (shown.fus) series.push({ pts: pick(D.fus), col: C.g, w: 2 });
        series.push({ pts: pick(D.tru), col: C.ink, w: 1.5, dash: [5, 4], label: L('true angle', 'angle réel') });
        clear(cv); chart(cv, { x0: 0, x1: dur, y0: Math.floor(lo - pad), y1: Math.ceil(hi + pad), xl: L('time (s)', 'temps (s)'), yl: L('tilt angle (°)', 'angle d\'inclinaison (°)'), series: series, cursor: tt < dur ? tt : undefined });
        if (tt < dur) raf = requestAnimationFrame(draw);
      }
      var replay = document.createElement('button'); replay.type = 'button'; replay.className = 'btn sm ghost'; replay.textContent = L('Replay the 60 s', 'Rejouer les 60 s');
      replay.addEventListener('click', function () { t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }); F.ctl.appendChild(replay);
      compute();
      return { start: function () { t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }, stop: function () { cancelAnimationFrame(raf); }, redraw: function () { cv.fit(); draw(performance.now() + 1e9); } };
    };

    // ================================================================== 3. lidar
    MAKERS.lidar = function (sec) {
      var F = frame(sec, L('2D lidar in a room', 'Lidar 2D dans une pièce'), L('A laser turns and measures the distance in each direction. Drag the robot in the room (or tick “robot moving”) and watch the points: each one is a distance with some noise. Glass lets the laser through, a black matt object sends almost nothing back, and far walls get few points.', 'Un laser tourne et mesure la distance dans chaque direction. Faites glisser le robot dans la pièce (ou cochez « robot en mouvement ») et regardez les points : chacun est une distance avec un peu de bruit. Le verre laisse passer le laser, un objet noir mat ne renvoie presque rien, et les murs lointains reçoivent peu de points.'));
      var cv = canvas(F.view, 0.62);
      var res = slider(F.ctl, { label: L('Angular resolution (°)', 'Résolution angulaire (°)'), min: 1, max: 40, value: 8, map: function (v) { return v / 8; }, dec: 2, on: rescan });
      var noise = slider(F.ctl, { label: L('Range noise σ (cm)', 'Bruit de distance σ (cm)'), min: 0, max: 20, value: 3, on: rescan });
      var maxr = slider(F.ctl, { label: L('Maximum range (m)', 'Portée maximale (m)'), min: 2, max: 12, value: 8, on: rescan });
      var rate = slider(F.ctl, { label: L('Scan rate (Hz)', 'Fréquence de balayage (Hz)'), min: 1, max: 20, value: 5, on: function () { rescan(); } });
      var moving = check(F.ctl, L('Robot moving (1 m/s)', 'Robot en mouvement (1 m/s)'), false, rescan);
      var showRays = check(F.ctl, L('Show the laser rays', 'Afficher les rayons laser'), false, function () {});
      var out = readouts(F.side);
      var ch = challenge(F.side, 'lidar', L('See a 4 cm wide pole at 5 m (spacing ≤ 4 cm) with at least 10 scans per second, without going over 10 000 points per second.', 'Voyez un poteau de 4 cm de large à 5 m (espacement ≤ 4 cm) avec au moins 10 balayages par seconde, sans dépasser 10 000 points par seconde.'));
      notes(F.notes, [
        L('Points per turn = 360° / Δθ &emsp; Spacing between points at distance d: s = d · Δθ (rad)', 'Points par tour = 360° / Δθ &emsp; Espacement entre points à la distance d : s = d · Δθ (rad)'),
        L('Distortion when moving: the robot travels v / f during one turn (1 m/s at 5 Hz → 20 cm)', 'Distorsion en mouvement : le robot parcourt v / f pendant un tour (1 m/s à 5 Hz → 20 cm)')],
        [L('Small or thin obstacles far away fall between two rays: check the spacing s at the distance where you must stop.', 'Les petits obstacles fins et lointains tombent entre deux rayons : vérifiez l\'espacement s à la distance où vous devez vous arrêter.'),
          L('Glass doors, mirrors and black matt surfaces are classic lidar traps: add bumpers, ultrasonic or cameras.', 'Portes vitrées, miroirs et surfaces noires mates sont les pièges classiques du lidar : ajoutez des pare-chocs, des ultrasons ou des caméras.'),
          L('Correct the motion distortion with the odometry (de-skewing) before building a map.', 'Corrigez la distorsion de mouvement avec l\'odométrie (« de-skewing ») avant de construire une carte.')]);
      // the room (metres): walls, a box, a glass panel, a black object
      var WALLS = [[0, 0, 10, 0], [10, 0, 10, 6], [10, 6, 0, 6], [0, 6, 0, 0], [6, 0, 6, 2.2], [3, 6, 3, 4.5]];
      var BOX = [[1.4, 1.2, 2.4, 1.2], [2.4, 1.2, 2.4, 2], [2.4, 2, 1.4, 2], [1.4, 2, 1.4, 1.2]];
      var GLASS = [[6, 3.4, 6, 6]];
      var BLACK = [[7.6, 3.6, 8.6, 3.6], [8.6, 3.6, 8.6, 4.3], [8.6, 4.3, 7.6, 4.3], [7.6, 4.3, 7.6, 3.6]];
      var robot = { x: 4.2, y: 3.0 }, pts = [], sweep = 0, raf = 0, last = 0;
      function hit(ox, oy, dx, dy, seg) { var x1 = seg[0], y1 = seg[1], x2 = seg[2], y2 = seg[3], ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex; if (Math.abs(den) < 1e-9) return Infinity; var t = ((x1 - ox) * ey - (y1 - oy) * ex) / den, u = ((x1 - ox) * dy - (y1 - oy) * dx) / den; return t > 1e-6 && u >= 0 && u <= 1 ? t : Infinity; }
      function cast(ox, oy, a) {
        var dx = Math.cos(a), dy = Math.sin(a), best = Infinity, kind = 'wall';
        WALLS.concat(BOX).forEach(function (s) { var t = hit(ox, oy, dx, dy, s); if (t < best) { best = t; kind = 'wall'; } });
        BLACK.forEach(function (s) { var t = hit(ox, oy, dx, dy, s); if (t < best) { best = t; kind = 'black'; } });
        GLASS.forEach(function (s) { var t = hit(ox, oy, dx, dy, s); if (t < best) { best = t; kind = 'glass'; } });
        return { d: best, kind: kind };
      }
      var r = rng(3);
      function rescan() {
        pts = []; var step = res.get() * Math.PI / 180, sig = noise.get() / 100, R = maxr.get(), lost = 0, n = Math.round(2 * Math.PI / step), v = moving.checked ? 1 : 0, f = rate.get();
        for (var i = 0; i < n; i++) {
          var a = i * step, ox = robot.x - v / f * (1 - i / n), oy = robot.y;          // moving: the robot was behind at the start of the turn
          var h = cast(ox, oy, a);
          if (h.kind === 'glass') { h = (function () { var dx = Math.cos(a), dy = Math.sin(a), best = Infinity; WALLS.concat(BOX, BLACK).forEach(function (s) { var t = hit(ox, oy, dx, dy, s); if (t < best) best = t; }); return { d: best, kind: 'through' }; })(); }
          if (h.d > R || (h.kind === 'black' && r() < 0.85) || r() < 0.01) { lost++; continue; }
          var d = h.d + sig * gauss(r);
          pts.push({ a: a, x: robot.x + d * Math.cos(a), y: robot.y + d * Math.sin(a), k: h.kind, d: d });   // drawn in the frame of the robot at the end of the turn
        }
        var far = 5;
        out([
          [L('Points per turn', 'Points par tour'), n],
          [L('Points lost (range, black, glass)', 'Points perdus (portée, noir, verre)'), lost],
          [L('Spacing at 5 m', 'Espacement à 5 m'), num(far * step * 100, 1) + ' cm'],
          [L('Points per second', 'Points par seconde'), Math.round(n * rate.get())]
        ]);
        ch(far * step * 100 <= 4.0001 && rate.get() >= 10 && n * rate.get() <= 10000);
      }
      var S = 1, OX = 0, OY = 0;
      function place() { S = Math.min((cv.w - 20) / 10, (cv.h - 20) / 6); OX = (cv.w - 10 * S) / 2; OY = (cv.h - 6 * S) / 2; }
      var P = function (x, y) { return [OX + x * S, OY + (6 - y) * S]; };
      function seg(s, col, w, dash) { var a = P(s[0], s[1]), b = P(s[2], s[3]), x = cv.x; x.strokeStyle = col; x.lineWidth = w; x.setLineDash(dash || []); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); x.setLineDash([]); }
      function draw(now) {
        var dt = last ? (now - last) / 1000 : 0; last = now; sweep = (sweep + dt * rate.get() * 2 * Math.PI) % (2 * Math.PI);
        place(); clear(cv); var x = cv.x;
        WALLS.concat(BOX).forEach(function (s) { seg(s, C.grid, 3); });
        GLASS.forEach(function (s) { seg(s, C.b, 3, [6, 4]); }); BLACK.forEach(function (s) { seg(s, C.mute, 3); });
        var g = P(6.1, 5.3); text(cv, L('glass', 'verre'), g[0] + 4, g[1], C.b, 11);
        var bl = P(7.6, 4.55); text(cv, L('black object', 'objet noir'), bl[0], bl[1], C.mute, 11);
        var rp = P(robot.x, robot.y);
        if (showRays.checked) { x.strokeStyle = C.r; x.globalAlpha = 0.18; x.lineWidth = 1; pts.forEach(function (p) { var q = P(p.x, p.y); x.beginPath(); x.moveTo(rp[0], rp[1]); x.lineTo(q[0], q[1]); x.stroke(); }); x.globalAlpha = 1; }
        // the points appear behind the rotating beam
        pts.forEach(function (p) { var age = (sweep - p.a + 2 * Math.PI) % (2 * Math.PI); var q = P(p.x, p.y); x.globalAlpha = 1 - 0.65 * age / (2 * Math.PI); x.fillStyle = p.k === 'through' ? C.y : C.r; x.fillRect(q[0] - 1.6, q[1] - 1.6, 3.2, 3.2); });
        x.globalAlpha = 1;
        var bx = rp[0] + Math.cos(sweep) * maxr.get() * S, by = rp[1] - Math.sin(sweep) * maxr.get() * S;
        var gr = x.createLinearGradient(rp[0], rp[1], bx, by); gr.addColorStop(0, C.r); gr.addColorStop(1, 'transparent'); x.strokeStyle = gr; x.lineWidth = 2; x.beginPath(); x.moveTo(rp[0], rp[1]); x.lineTo(bx, by); x.stroke();
        x.fillStyle = C.o; x.beginPath(); x.arc(rp[0], rp[1], 9, 0, 7); x.fill(); x.fillStyle = C.bg; x.beginPath(); x.arc(rp[0], rp[1], 3.5, 0, 7); x.fill();
        if (cv.w > 560) text(cv, L('drag the robot', 'faites glisser le robot'), cv.w - 10, cv.h - 8, C.axis, 11, 'right');   // (on a phone the legend takes the line)
        text(cv, '● ' + L('lidar point', 'point lidar'), 12, cv.h - 26, C.r, 11); text(cv, '● ' + L('point seen through the glass', 'point vu à travers le verre'), 12, cv.h - 10, C.y, 11);
        raf = requestAnimationFrame(draw);
      }
      var drag = false;
      var toRoom = function (e) { var b = cv.c.getBoundingClientRect(); return { x: (e.clientX - b.left - OX) / S, y: 6 - (e.clientY - b.top - OY) / S }; };
      cv.c.addEventListener('pointerdown', function (e) { var p = toRoom(e); if (Math.hypot(p.x - robot.x, p.y - robot.y) < 0.6) { drag = true; cv.c.setPointerCapture(e.pointerId); e.preventDefault(); } });
      cv.c.addEventListener('pointermove', function (e) { var p = toRoom(e); cv.c.style.cursor = drag || Math.hypot(p.x - robot.x, p.y - robot.y) < 0.6 ? 'grab' : 'default'; if (!drag) return; robot.x = Math.max(0.3, Math.min(9.7, p.x)); robot.y = Math.max(0.3, Math.min(5.7, p.y)); rescan(); });
      cv.c.addEventListener('pointerup', function () { drag = false; });
      cv.c.style.touchAction = 'none';
      rescan();
      return { start: function () { last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }, stop: function () { cancelAnimationFrame(raf); }, redraw: function () { cv.fit(); } };
    };

    // ================================================================== 4. camera and stereo
    MAKERS.camera = function (sec) {
      var F = frame(sec, L('Camera and stereo depth', 'Caméra et profondeur stéréo'), L('Left: what a camera sees of a flat checkerboard. A real lens bends straight lines (radial distortion): calibration measures it and removes it. Right: a stereo camera finds the depth from the shift (disparity) of a point between its two images; the error grows with the square of the distance.', 'À gauche : ce qu\'une caméra voit d\'un damier plan. Un vrai objectif courbe les droites (distorsion radiale) : l\'étalonnage la mesure et la retire. À droite : une caméra stéréo trouve la profondeur à partir du décalage (disparité) d\'un point entre ses deux images ; l\'erreur croît avec le carré de la distance.'));
      F.view.classList.add('sb-two');
      var a = document.createElement('div'), b = document.createElement('div'); F.view.append(a, b);
      var cam = canvas(a, 0.75), st = canvas(b, 0.75);
      var k1 = slider(F.ctl, { label: L('Radial distortion k₁', 'Distorsion radiale k₁'), min: -40, max: 40, value: -18, map: function (v) { return v / 100; }, dec: 2, on: redraw });
      var corr = check(F.ctl, L('Correct the distortion (calibrated)', 'Corriger la distorsion (étalonnée)'), false, redraw);
      var f = slider(F.ctl, { label: L('Focal length f (pixels)', 'Focale f (pixels)'), min: 300, max: 1500, step: 10, value: 700, on: redraw });
      var B = slider(F.ctl, { label: L('Stereo baseline B (cm)', 'Base stéréo B (cm)'), min: 3, max: 30, value: 12, on: redraw });
      var sd = slider(F.ctl, { label: L('Disparity error σ_d (px)', 'Erreur de disparité σ_d (px)'), min: 5, max: 100, value: 25, map: function (v) { return v / 100; }, dec: 2, on: redraw });
      var Z = slider(F.ctl, { label: L('Object distance Z (m)', 'Distance de l\'objet Z (m)'), min: 2, max: 100, value: 30, map: function (v) { return v / 10; }, dec: 1, on: redraw });
      var out = readouts(F.side);
      var ch = challenge(F.side, 'camera', L('Make the stereo camera measure an object at 5 m with a depth error of 5 cm or less.', 'Faites mesurer à la caméra stéréo un objet à 5 m avec une erreur de profondeur de 5 cm ou moins.'));
      notes(F.notes, [
        L('Pinhole: u = f · X / Z + c<sub>x</sub> &emsp; Distortion: r′ = r (1 + k₁ r²)', 'Sténopé : u = f · X / Z + c<sub>x</sub> &emsp; Distorsion : r′ = r (1 + k₁ r²)'),
        L('Stereo: Z = f · B / d &emsp; Depth error: σ<sub>Z</sub> ≈ Z² · σ<sub>d</sub> / (f · B)', 'Stéréo : Z = f · B / d &emsp; Erreur de profondeur : σ<sub>Z</sub> ≈ Z² · σ<sub>d</sub> / (f · B)')],
        [L('k₁ < 0 is barrel distortion (wide-angle lenses), k₁ > 0 pincushion. Without correction, measurements far from the image centre are wrong.', 'k₁ < 0 est la distorsion en barillet (objectifs grand-angle), k₁ > 0 en coussinet. Sans correction, les mesures loin du centre de l\'image sont fausses.'),
          L('Double the distance and the stereo error is multiplied by 4: to see far, increase the baseline B or the focal length f.', 'Doublez la distance et l\'erreur stéréo est multipliée par 4 : pour voir loin, augmentez la base B ou la focale f.'),
          L('Stereo needs texture: on a white wall there is nothing to match. Active cameras add a projected pattern or measure the time of flight.', 'La stéréo a besoin de texture : sur un mur blanc, il n\'y a rien à apparier. Les caméras actives ajoutent un motif projeté ou mesurent le temps de vol.')]);
      function redraw() {
        // ---- the checkerboard seen by the camera
        clear(cam); var x = cam.x, W = cam.w, H = cam.h, cx = W / 2, cy = H / 2, k = corr.checked ? 0 : k1.get(), sz = Math.min(W, H) * 0.115;
        var dist = function (u, v) { var nx = (u - cx) / (W / 2), ny = (v - cy) / (W / 2), r2 = nx * nx + ny * ny, s = 1 + k * r2; return [cx + (u - cx) * s, cy + (v - cy) * s]; };
        for (var i = -5; i < 5; i++) for (var j = -4; j < 4; j++) {
          if ((i + j) % 2) continue;
          x.fillStyle = C.ink; x.beginPath();
          var corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];   // each side bent through 6 points
          corners.forEach(function (p, q) { var steps = 6; var nxt = corners[(q + 1) % 4]; for (var s = 0; s < steps; s++) { var u = cx + (p[0] + (nxt[0] - p[0]) * s / steps) * sz, v = cy + (p[1] + (nxt[1] - p[1]) * s / steps) * sz, d = dist(u, v); if (!q && !s) x.moveTo(d[0], d[1]); else x.lineTo(d[0], d[1]); } });
          x.closePath(); x.fill();
        }
        x.strokeStyle = C.o; x.lineWidth = 2; x.setLineDash([6, 5]); x.beginPath(); x.moveTo(8, cy + 3 * sz); x.lineTo(W - 8, cy + 3 * sz); x.stroke(); x.setLineDash([]);
        text(cam, L('a straight line of the board', 'une droite du damier'), 10, cy + 3 * sz - 6, C.o, 11);
        text(cam, corr.checked ? L('corrected image', 'image corrigée') : (k1.get() < 0 ? L('barrel distortion', 'distorsion en barillet') : k1.get() > 0 ? L('pincushion distortion', 'distorsion en coussinet') : L('no distortion', 'pas de distorsion')), W - 8, 16, C.axis, 11, 'right');
        // ---- the stereo depth error against the distance
        clear(st); var fb = f.get() * B.get() / 100, s = sd.get(), zmax = 10, pts = [], pts2 = [];
        for (var z = 0.2; z <= zmax; z += 0.05) { pts.push([z, z * z * s / fb * 100]); pts2.push([z, z * z * s / (fb * 2) * 100]); }
        var ymax = Math.max(5, zmax * zmax * s / fb * 100 * 0.6);
        var c = chart(st, { x0: 0, x1: zmax, y0: 0, y1: ymax, xl: L('distance Z (m)', 'distance Z (m)'), yl: L('depth error σ_Z (cm)', 'erreur de profondeur σ_Z (cm)'), series: [{ pts: pts, col: C.o, w: 2.5, label: L('this stereo camera', 'cette caméra stéréo') }, { pts: pts2, col: C.b, w: 1.5, dash: [5, 4], label: L('with twice the baseline', 'avec une base deux fois plus grande') }] });
        var zz = Z.get(), ez = zz * zz * s / fb * 100, px = c.X(zz), py = c.Y(Math.min(ymax, ez));
        st.x.fillStyle = C.r; st.x.beginPath(); st.x.arc(px, py, 5, 0, 7); st.x.fill();
        var d = fb / zz;
        out([
          [L('Disparity at Z', 'Disparité à Z'), num(d, 1) + ' px'],
          [L('Depth error at Z', 'Erreur de profondeur à Z'), num(ez, 1) + ' cm', ez > 10 ? 'bad' : 'ok'],
          [L('Relative error', 'Erreur relative'), num(ez / (zz * 100) * 100, 1) + ' %'],
          [L('Distance where the error reaches 5 cm', 'Distance où l\'erreur atteint 5 cm'), num(Math.sqrt(0.05 * fb / s), 2) + ' m']
        ]);
        ch(25 * s / fb * 100 <= 5);
      }
      redraw();
      return { redraw: function () { cam.fit(); st.fit(); redraw(); } };
    };

    // ================================================================== 5. ultrasonic
    MAKERS.sonar = function (sec) {
      var F = frame(sec, L('Ultrasonic range finder', 'Télémètre à ultrasons'), L('The sensor sends a short sound pulse and times the echo. The sound leaves in a wide cone, so the sensor does not know the exact direction of the obstacle; a smooth wall that is too inclined reflects the sound away like a mirror, and the sensor sees nothing. The speed of sound depends on the temperature.', 'Le capteur envoie une courte impulsion sonore et mesure le temps de l\'écho. Le son part dans un cône large, donc le capteur ne connaît pas la direction exacte de l\'obstacle ; un mur lisse trop incliné renvoie le son ailleurs comme un miroir, et le capteur ne voit rien. La vitesse du son dépend de la température.'));
      var cv = canvas(F.view, 0.62);
      var dw = slider(F.ctl, { label: L('Distance to the wall (m)', 'Distance au mur (m)'), min: 20, max: 400, value: 150, map: function (v) { return v / 100; }, dec: 2, on: draw });
      var ang = slider(F.ctl, { label: L('Wall angle (°)', 'Angle du mur (°)'), min: 0, max: 60, value: 10, on: draw });
      var cone = slider(F.ctl, { label: L('Beam half-angle (°)', 'Demi-angle du faisceau (°)'), min: 5, max: 30, value: 15, on: draw });
      var T = slider(F.ctl, { label: L('Real air temperature (°C)', 'Température réelle de l\'air (°C)'), min: -10, max: 40, value: 35, on: draw });
      var out = readouts(F.side);
      var ch = challenge(F.side, 'sonar', L('With a beam half-angle of 10°, find the steepest wall angle that still sends an echo back.', 'Avec un demi-angle de faisceau de 10°, trouvez l\'inclinaison de mur la plus grande qui renvoie encore un écho.'));
      notes(F.notes, [
        L('Distance: d = c · t / 2 &emsp; Speed of sound: c ≈ 331.3 + 0.606 · T (m/s, T in °C)', 'Distance : d = c · t / 2 &emsp; Vitesse du son : c ≈ 331,3 + 0,606 · T (m/s, T en °C)'),
        L('Width seen at distance d: w = 2 d · tan(half-angle)', 'Largeur vue à la distance d : w = 2 d · tan(demi-angle)')],
        [L('An echo arrives only if the wall is inclined less than about the beam half-angle: beyond, the robot believes the way is free.', 'Un écho ne revient que si le mur est incliné de moins que le demi-angle du faisceau environ : au-delà, le robot croit la voie libre.'),
          L('A sensor set for 20 °C reads about 0.17 % short per degree warmer: 3.9 cm at 1.5 m and 35 °C.', 'Un capteur réglé pour 20 °C mesure environ 0,17 % trop court par degré de plus : 3,9 cm à 1,5 m et 35 °C.'),
          L('Several sensors firing together hear each other (cross-talk): fire them one after the other.', 'Plusieurs capteurs qui émettent ensemble s\'entendent (diaphonie) : faites-les émettre l\'un après l\'autre.')]);
      function draw() {
        clear(cv); var x = cv.x, W = cv.w, H = cv.h, S = (W - 80) / 4.4, sx = 40, sy = H / 2;
        var d = dw.get(), a = ang.get() * Math.PI / 180, h = cone.get() * Math.PI / 180, t = T.get();
        var c20 = 331.3 + 0.606 * 20, cr = 331.3 + 0.606 * t, echo = ang.get() <= cone.get() + 2;
        // the wall, through the point at distance d on the axis, turned by the angle
        var wx = sx + d * S, L2 = 2.2 * S;
        x.strokeStyle = C.ink; x.lineWidth = 5; x.beginPath(); x.moveTo(wx - Math.sin(a) * L2, sy - Math.cos(a) * L2); x.lineTo(wx + Math.sin(a) * L2, sy + Math.cos(a) * L2); x.stroke();
        // the cone
        x.fillStyle = C.b; x.globalAlpha = 0.16; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 4.3 * S, sy - Math.tan(h) * 4.3 * S); x.lineTo(sx + 4.3 * S, sy + Math.tan(h) * 4.3 * S); x.closePath(); x.fill(); x.globalAlpha = 1;
        x.strokeStyle = C.b; x.lineWidth = 1.5; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 4.3 * S, sy - Math.tan(h) * 4.3 * S); x.moveTo(sx, sy); x.lineTo(sx + 4.3 * S, sy + Math.tan(h) * 4.3 * S); x.stroke();
        // the sound: going to the wall, and the reflected direction
        x.strokeStyle = C.o; x.lineWidth = 2.5; x.beginPath(); x.moveTo(sx, sy); x.lineTo(wx, sy); x.stroke();
        var rx = Math.cos(Math.PI - 2 * a), ry = Math.sin(Math.PI - 2 * a);
        x.setLineDash([6, 5]); x.beginPath(); x.moveTo(wx, sy); x.lineTo(wx + rx * 1.4 * S, sy + ry * 1.4 * S); x.stroke(); x.setLineDash([]);
        x.fillStyle = C.axis; x.fillRect(sx - 22, sy - 14, 22, 28); x.fillStyle = C.o; x.beginPath(); x.arc(sx - 4, sy - 6, 5, 0, 7); x.arc(sx - 4, sy + 6, 5, 0, 7); x.fill();
        text(cv, echo ? L('echo received', 'écho reçu') : L('no echo: the sound goes away', 'pas d\'écho : le son part ailleurs'), W - 12, 20, echo ? C.g : C.r, 13, 'right', true);
        // the width of the beam at the wall
        var wd = 2 * d * Math.tan(h);
        text(cv, L('beam width at the wall: ', 'largeur du faisceau au mur : ') + num(wd * 100, 0) + ' cm', W - 12, H - 10, C.axis, 11, 'right');
        var tof = 2 * d / cr, meas = c20 * tof / 2;
        out([
          [L('True distance', 'Distance réelle'), num(d * 100, 1) + ' cm'],
          [L('Echo time', 'Temps de l\'écho'), num(tof * 1000, 2) + ' ms'],
          [L('Measured (set for 20 °C)', 'Mesurée (réglée pour 20 °C)'), echo ? num(meas * 100, 1) + ' cm' : '—', echo ? '' : 'bad'],
          [L('Temperature error', 'Erreur due à la température'), echo ? num((meas - d) * 100, 1) + ' cm' : '—']
        ]);
        ch(cone.get() === 10 && ang.get() === 12);
      }
      draw();
      return { redraw: function () { cv.fit(); draw(); } };
    };

    // ================================================================== 6. GNSS
    MAKERS.gnss = function (sec) {
      var F = frame(sec, L('GNSS receiver: GPS, Galileo, GLONASS, BeiDou', 'Récepteur GNSS : GPS, Galileo, GLONASS, BeiDou'), L(
        'A GNSS receiver measures how long the signal of each satellite took to arrive: that gives its distance to the satellite (a pseudo-range, because the clock of the receiver is not perfect). With four satellites or more it solves its position x, y, z and its clock error. The robot below drives a loop of 30 × 16 m: watch the positions scatter, then change the place, the satellites and the corrections.',
        'Un récepteur GNSS mesure le temps mis par le signal de chaque satellite pour arriver : cela donne sa distance au satellite (une pseudo-distance, car l\'horloge du récepteur n\'est pas parfaite). Avec quatre satellites ou plus, il calcule sa position x, y, z et l\'erreur de son horloge. Le robot ci-dessous fait une boucle de 30 × 16 m : regardez les positions se disperser, puis changez le lieu, les satellites et les corrections.'));
      var row = document.createElement('div'); row.className = 'sb-view sb-two'; F.view.appendChild(row);
      var sky = canvas(row, 1), map = canvas(row, 1), ech = canvas(F.view, 0.34);
      var env = seg(F.ctl, L('Place', 'Lieu'), [['open', L('Open field', 'Champ ouvert')], ['forest', L('Forest', 'Forêt')], ['canyon', L('Street between buildings', 'Rue entre immeubles')], ['wall', L('Along a wall', 'Le long d\'un mur')]], 'open', reset);
      var cor = seg(F.ctl, L('Corrections', 'Corrections'), [['none', L('None', 'Aucune')], ['sbas', 'SBAS (EGNOS)'], ['rtk', 'RTK']], 'none', reset);
      var multi = check(F.ctl, L('All constellations (GPS + Galileo, GLONASS, BeiDou)', 'Toutes les constellations (GPS + Galileo, GLONASS, BeiDou)'), true, reset);
      var mask = slider(F.ctl, { label: L('Elevation mask (°)', 'Masque d\'élévation (°)'), min: 0, max: 30, value: 10, on: reset });
      var fuse = check(F.ctl, L('Fuse with wheel odometry + IMU (Kalman filter)', 'Fusionner avec l\'odométrie des roues + IMU (filtre de Kalman)'), true, resetStats);
      var out = readouts(F.side);
      var ch = challenge(F.side, 'gnss', L('In the street between buildings, keep the error of the position used by the robot under 20 cm (RMS over 30 s).', 'Dans la rue entre immeubles, gardez l\'erreur de la position utilisée par le robot sous 20 cm (RMS sur 30 s).'));
      var nmea = document.createElement('div'); nmea.className = 'sb-nmea'; F.side.appendChild(nmea);
      notes(F.notes, [
        L('Pseudo-range: ρᵢ = c · (t<sub>received</sub> − t<sub>sent</sub>) = ‖Sᵢ − P‖ + c · δt &emsp; 4 unknowns (x, y, z, δt): at least 4 satellites', 'Pseudo-distance : ρᵢ = c · (t<sub>réception</sub> − t<sub>émission</sub>) = ‖Sᵢ − P‖ + c · δt &emsp; 4 inconnues (x, y, z, δt) : au moins 4 satellites'),
        L('Accuracy: σ<sub>position</sub> ≈ DOP × σ<sub>UERE</sub> &emsp; (UERE ≈ 1 to 5 m without corrections, about 1 cm with an RTK fix)', 'Précision : σ<sub>position</sub> ≈ DOP × σ<sub>UERE</sub> &emsp; (UERE ≈ 1 à 5 m sans correction, environ 1 cm en RTK fixe)'),
        L('To local metres: Δnorth = R · Δφ, Δeast = R · cos φ · Δλ &emsp; (R ≈ 6 371 km, angles in radians)', 'Vers des mètres locaux : Δnord = R · Δφ, Δest = R · cos φ · Δλ &emsp; (R ≈ 6 371 km, angles en radians)')],
        [L('Between buildings the signals bounce on the walls (multipath): the path is longer, the error reaches several metres and the receiver does not see it. More constellations give more direct satellites.', 'Entre les immeubles, les signaux rebondissent sur les murs (multitrajets) : le chemin est plus long, l\'erreur atteint plusieurs mètres et le récepteur ne le voit pas. Plus de constellations donnent plus de satellites directs.'),
          L('DOP (dilution of precision): satellites spread over the whole sky give a low DOP; satellites all in one strip of sky (a street) give a large error across it.', 'Le DOP (dilution de précision) : des satellites répartis dans tout le ciel donnent un DOP faible ; des satellites tous dans une bande de ciel (une rue) donnent une grande erreur en travers.'),
          L('RTK: a base station at a known place (or a network, through NTRIP over the internet) sends its corrections; within about 10 to 20 km the robot gets 1 to 2 cm once the solution is “fixed”, a few decimetres while it is “float”.', 'RTK : une station de base à une position connue (ou un réseau, par NTRIP sur internet) envoie ses corrections ; à moins de 10 à 20 km environ, le robot obtient 1 à 2 cm une fois la solution « fixe », quelques décimètres tant qu\'elle est « flottante ».'),
          L('SBAS (EGNOS in Europe, WAAS in America): free corrections broadcast by geostationary satellites, about 1 m.', 'SBAS (EGNOS en Europe, WAAS en Amérique) : des corrections gratuites diffusées par des satellites géostationnaires, environ 1 m.'),
          L('GNSS gives 1 to 10 positions per second and nothing under a roof or in a tunnel: robots fuse it with the odometry and the IMU. In ROS 2: the message sensor_msgs/NavSatFix and navsat_transform_node of robot_localization.', 'Le GNSS donne 1 à 10 positions par seconde et rien sous un toit ou dans un tunnel : les robots le fusionnent avec l\'odométrie et l\'IMU. Dans ROS 2 : le message sensor_msgs/NavSatFix et navsat_transform_node de robot_localization.')]);

      // ---- the satellites (fixed in the sky for this demo): constellation, azimuth, elevation
      var DEG = Math.PI / 180, R0 = rng(11), SATS = [], CONS = [['G', 'GPS', 9, 'b'], ['E', 'Galileo', 8, 'g'], ['R', 'GLONASS', 7, 'r'], ['C', 'BeiDou', 9, 'p']];
      CONS.forEach(function (c) { for (var i = 0; i < c[2]; i++) SATS.push({ c: c[0], col: c[3], id: c[0] + (i < 9 ? '0' : '') + (i + 1), az: R0() * 360, el: 3 + Math.asin(R0()) / DEG * 0.95, h: R0() }); });
      function horizon(az) {                                              // height of the obstacles (°) in the direction az
        az = ((az % 360) + 360) % 360; var e = env.get();
        if (e === 'canyon') { var d = Math.min(az, Math.abs(az - 180), 360 - az); return d < 16 ? 14 : 64; }   // a north-south street
        if (e === 'wall') return az >= 180 ? 72 : 3;                      // a high wall on the west side
        return 0;
      }
      function status(s) {
        if (!multi.checked && s.c !== 'G') return 'off';
        if (s.el < mask.get()) return 'mask';
        var e = env.get();
        if (e === 'forest') return s.el < 40 ? 'weak' : 'ok';
        if (s.el < horizon(s.az)) return s.el < 20 && s.h < (e === 'canyon' ? 0.6 : 0.4) ? 'mp' : 'block';   // the low satellites bounce on the walls
        return 'ok';
      }
      function inv4(M) {
        var A = M.map(function (r, i) { return r.concat([0, 1, 2, 3].map(function (j) { return i === j ? 1 : 0; })); });
        for (var c = 0; c < 4; c++) {
          var p = c, r, k; for (r = c + 1; r < 4; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
          if (Math.abs(A[p][c]) < 1e-9) return null;
          var tmp = A[c]; A[c] = A[p]; A[p] = tmp; var d = A[c][c];
          for (k = 0; k < 8; k++) A[c][k] /= d;
          for (r = 0; r < 4; r++) if (r !== c) { var f = A[r][c]; for (k = 0; k < 8; k++) A[r][k] -= f * A[c][k]; }
        }
        return A.map(function (r) { return r.slice(4); });
      }
      // the solution: satellites used, HDOP, type of fix, accuracy (DRMS, m), multipath bias (m)
      var SOL = null;
      function solve() {
        var used = [], cnt = { ok: 0, weak: 0, mp: 0 }, vis = 0;
        SATS.forEach(function (s) { s.st = status(s); if (s.st !== 'off') vis++; if (s.st === 'ok' || s.st === 'weak' || s.st === 'mp') { used.push(s); cnt[s.st]++; } });
        var o = { used: used.length, vis: vis, cnt: cnt, q: 0, hdop: Infinity, sig: 0, mpb: 0 };
        if (used.length >= 4) {
          var N = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
          used.forEach(function (s) { var a = s.az * DEG, e = s.el * DEG, g = [-Math.cos(e) * Math.sin(a), -Math.cos(e) * Math.cos(a), -Math.sin(e), 1]; for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) N[i][j] += g[i] * g[j]; });
          var Q = inv4(N); if (Q) o.hdop = Math.sqrt(Q[0][0] + Q[1][1]);
        }
        if (o.hdop < 15) {
          var wf = Math.sqrt((cnt.ok + cnt.weak * 6 + cnt.mp) / used.length), m = cor.get();
          if (m === 'rtk' && used.length >= 5 && cnt.mp === 0 && cnt.weak <= 3) { o.q = 4; o.sig = 0.01 * o.hdop; }
          else if (m === 'rtk' && used.length >= 5) { o.q = 5; o.sig = 0.2 * o.hdop * wf; o.mpb = 0.3 * Math.sqrt(cnt.mp); }
          else { o.q = m === 'sbas' ? 2 : 1; o.sig = o.hdop * (m === 'sbas' ? 0.9 : 2.2) * wf; o.mpb = 3 * Math.sqrt(cnt.mp); }
        }
        SOL = o;
      }

      // ---- the robot: a loop of 30 × 16 m at 1.5 m/s, its GNSS fixes (1 per second) and the fused estimate
      var HX = 15, HY = 8, PER = 4 * (HX + HY), V = 1.5;
      function truth(t) {
        var s = (V * t) % PER;
        if (s < 2 * HX) return [-HX + s, -HY, 0];
        s -= 2 * HX; if (s < 2 * HY) return [HX, -HY + s, Math.PI / 2];
        s -= 2 * HY; if (s < 2 * HX) return [HX - s, HY, Math.PI];
        s -= 2 * HX; return [-HX, HY - s, -Math.PI / 2];
      }
      var rr = rng(5), T = 0, tReset = 0, nextFix = 0, ge = [0, 0], mpA = 0, fix = null, fixes = [], fu = null, Pf = 0, trail = [], hist = [], raf = 0, last = 0;
      function resetStats() { hist = []; tReset = T; ch(false); }
      function reset() { solve(); ge = [0, 0]; fixes = []; trail = []; var p = truth(T); fu = [p[0], p[1]]; Pf = 0.01; fix = null; nextFix = T; resetStats(); paint(); }
      function step(dt) {
        var p0 = truth(T); T += dt; var p1 = truth(T);
        // odometry + IMU: the displacement, 2 % too long and turned by a heading error that grows (gyro bias)
        var drift = 0.002 * (T - tReset), dx = (p1[0] - p0[0]) * 1.02, dy = (p1[1] - p0[1]) * 1.02, c = Math.cos(drift), s = Math.sin(drift);
        fu[0] += c * dx - s * dy; fu[1] += s * dx + c * dy; Pf += 0.004 * Math.hypot(dx, dy) + 1e-5;
        if (T >= nextFix) {
          nextFix += 1;
          if (SOL.q) {
            var tau = SOL.q === 4 ? 3 : 20, a = Math.exp(-1 / tau), sa = SOL.sig / Math.SQRT2 * Math.sqrt(1 - a * a);
            ge[0] = a * ge[0] + sa * gauss(rr); ge[1] = a * ge[1] + sa * gauss(rr);
            mpA += 0.25 * gauss(rr);
            fix = [p1[0] + ge[0] + SOL.mpb * Math.cos(mpA), p1[1] + ge[1] + SOL.mpb * Math.sin(mpA) * 0.4, T];
            fixes.push(fix); if (fixes.length > 45) fixes.shift();
            // Kalman update with the accuracy the receiver announces (it cannot know the multipath)
            var Rm = Math.pow(SOL.sig / Math.SQRT2, 2) + 1e-4, K = Pf / (Pf + Rm);
            fu[0] += K * (fix[0] - fu[0]); fu[1] += K * (fix[1] - fu[1]); Pf *= 1 - K;
          } else fix = null;
          hist.push({ t: T, g: fix ? Math.hypot(fix[0] - p1[0], fix[1] - p1[1]) : null, f: Math.hypot(fu[0] - p1[0], fu[1] - p1[1]) });
          while (hist.length && hist[0].t < T - 60) hist.shift();
        }
        trail.push([fu[0], fu[1]]); if (trail.length > 900) trail.shift();
      }
      var fmt = function (m) { return m < 1 ? num(m * 100, m < 0.1 ? 1 : 0) + ' cm' : num(m, 1) + ' m'; };
      function rmsOf(key, win) { var a = hist.filter(function (h) { return h.t >= T - win; }), s = 0, n = 0, miss = 0; a.forEach(function (h) { if (h[key] === null) miss++; else { s += h[key] * h[key]; n++; } }); return { v: n ? Math.sqrt(s / n) : null, n: a.length, miss: miss }; }
      // the NMEA GGA sentence the receiver would send for the last fix
      function gga() {
        var lat0 = 46, lon0 = 2, q = fix ? SOL.q : 0, p = fix || [0, 0], lat = lat0 + p[1] / 111320, lon = lon0 + p[0] / (111320 * Math.cos(lat0 * DEG));
        var dm = function (v, w) { var d = Math.floor(v), m = (v - d) * 60; return String(d).padStart(w, '0') + m.toFixed(5).padStart(8, '0'); };
        var sec = 43200 + Math.floor(T), hh = String(Math.floor(sec / 3600) % 24).padStart(2, '0'), mi = String(Math.floor(sec / 60) % 60).padStart(2, '0'), ss = String(sec % 60).padStart(2, '0');
        var body = (multi.checked ? 'GNGGA' : 'GPGGA') + ',' + hh + mi + ss + '.00,' + (q ? dm(lat, 2) + ',N,' + dm(lon, 3) + ',E,' : ',,,,') + q + ',' + String(Math.min(SOL.used, 99)).padStart(2, '0') + ',' + (q ? SOL.hdop.toFixed(1) : '') + ',' + (q ? '212.4,M,49.6,M,' : ',,,,') + (q >= 4 ? '1.0,0001' : q === 2 ? '3.0,0120' : ',');
        var cs = 0; for (var i = 0; i < body.length; i++) cs ^= body.charCodeAt(i);
        return '$' + body + '*' + cs.toString(16).toUpperCase().padStart(2, '0');
      }

      function drawSky() {
        clear(sky); var x = sky.x, W = sky.w, H = sky.h, cx = W / 2, cy = H / 2 - 8, R = Math.min(W, H) / 2 - 30;
        var P = function (az, el) { var r = R * (90 - el) / 90; return [cx + r * Math.sin(az * DEG), cy - r * Math.cos(az * DEG)]; };
        x.fillStyle = C.box; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
        var e = env.get();
        if (e === 'forest') { x.fillStyle = C.g; x.globalAlpha = 0.2; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.arc(cx, cy, R * 50 / 90, 0, 7, true); x.fill('evenodd'); x.globalAlpha = 1; text(sky, L('leaves: weak signals', 'feuillage : signaux faibles'), cx, cy + R * 0.72, C.g, 11, 'center'); }
        if (e === 'canyon' || e === 'wall') {
          x.fillStyle = C.mute; x.globalAlpha = 0.32; x.beginPath(); x.arc(cx, cy, R, 0, 7);
          for (var a = 360; a >= 0; a -= 2) { var q = P(a, horizon(a)); if (a === 360) x.moveTo(q[0], q[1]); else x.lineTo(q[0], q[1]); }
          x.closePath(); x.fill('evenodd'); x.globalAlpha = 1;
          text(sky, e === 'canyon' ? L('buildings', 'immeubles') : L('wall', 'mur'), e === 'canyon' ? cx + R * 0.62 : cx - R * 0.62, cy + 4, C.ink, 11, 'center', true);
        }
        x.strokeStyle = C.grid; x.lineWidth = 1;
        [0, 30, 60].forEach(function (el) { x.beginPath(); x.arc(cx, cy, R * (90 - el) / 90, 0, 7); x.stroke(); text(sky, el + '°', cx + 3, cy - R * (90 - el) / 90 + 12, C.axis, 10); });
        x.beginPath(); x.moveTo(cx - R, cy); x.lineTo(cx + R, cy); x.moveTo(cx, cy - R); x.lineTo(cx, cy + R); x.stroke();
        if (mask.get() > 0) { x.strokeStyle = C.y; x.setLineDash([4, 4]); x.beginPath(); x.arc(cx, cy, R * (90 - mask.get()) / 90, 0, 7); x.stroke(); x.setLineDash([]); }
        text(sky, 'N', cx, cy - R - 6, C.ink, 12, 'center', true); text(sky, L('S', 'S'), cx, cy + R + 15, C.ink, 12, 'center', true); text(sky, L('E', 'E'), cx + R + 10, cy + 4, C.ink, 12, 'center', true); text(sky, L('W', 'O'), cx - R - 10, cy + 4, C.ink, 12, 'center', true);
        SATS.forEach(function (s) {
          if (s.st === 'off') return; var p = P(s.az, s.el), col = C[s.col];
          x.lineWidth = 2;
          if (s.st === 'ok' || s.st === 'weak') { x.globalAlpha = s.st === 'weak' ? 0.45 : 1; x.fillStyle = col; x.beginPath(); x.arc(p[0], p[1], 7, 0, 7); x.fill(); x.globalAlpha = 1; }
          else if (s.st === 'mp') { x.strokeStyle = C.o; x.setLineDash([3, 2]); x.beginPath(); x.arc(p[0], p[1], 7, 0, 7); x.stroke(); x.setLineDash([]); text(sky, '↯', p[0], p[1] + 4, C.o, 11, 'center', true); }
          else { x.strokeStyle = C.mute; x.beginPath(); x.arc(p[0], p[1], 6, 0, 7); x.stroke(); }
          text(sky, s.id, p[0] + 9, p[1] - 6, s.st === 'ok' || s.st === 'weak' ? C.ink : C.mute, 9);
        });
        // legend
        var lx = 8, ly = H - 8;
        CONS.forEach(function (c) { if (!multi.checked && c[0] !== 'G') return; x.fillStyle = C[c[3]]; x.beginPath(); x.arc(lx + 5, ly - 4, 5, 0, 7); x.fill(); text(sky, c[1], lx + 13, ly, C.ink, 10); lx += x.measureText(c[1]).width + 26; });
        text(sky, L('↯ reflected  ○ hidden', '↯ réfléchi  ○ caché'), W - 8, 16, C.axis, 10, 'right');
      }
      function drawMap() {
        clear(map); var x = map.x, W = map.w, H = map.h, S = Math.min((W - 30) / 36, (H - 50) / 24), ox = W / 2, oy = H / 2 + 6;
        var X = function (v) { return ox + v * S; }, Y = function (v) { return oy - v * S; };
        x.strokeStyle = C.grid; x.lineWidth = 1;
        for (var g = -15; g <= 15; g += 5) { x.beginPath(); x.moveTo(X(g), Y(-11)); x.lineTo(X(g), Y(11)); x.stroke(); }
        for (g = -10; g <= 10; g += 5) { x.beginPath(); x.moveTo(X(-17), Y(g)); x.lineTo(X(17), Y(g)); x.stroke(); }
        x.strokeStyle = C.axis; x.setLineDash([6, 5]); x.lineWidth = 1.5; x.strokeRect(X(-HX), Y(HY), 2 * HX * S, 2 * HY * S); x.setLineDash([]);
        if (fuse.checked && trail.length > 1) { x.strokeStyle = C.g; x.lineWidth = 2; x.beginPath(); trail.forEach(function (p, k) { if (k) x.lineTo(X(p[0]), Y(p[1])); else x.moveTo(X(p[0]), Y(p[1])); }); x.stroke(); }
        x.save(); x.beginPath(); x.rect(0, 24, W, H - 46); x.clip();   // far positions leave the map: they are cut, not drawn over the legend
        fixes.forEach(function (f, k) { x.globalAlpha = 0.25 + 0.75 * k / fixes.length; x.fillStyle = C.o; x.beginPath(); x.arc(X(f[0]), Y(f[1]), 3, 0, 7); x.fill(); }); x.globalAlpha = 1; x.restore();
        var p = truth(T); x.save(); x.translate(X(p[0]), Y(p[1])); x.rotate(-p[2]); x.fillStyle = C.b; x.beginPath(); x.moveTo(9, 0); x.lineTo(-6, 6); x.lineTo(-6, -6); x.closePath(); x.fill(); x.restore();
        text(map, L('top view, 5 m grid', 'vue de dessus, grille de 5 m'), 8, 16, C.axis, 10);
        var lg = [[C.b, L('real robot', 'robot réel')], [C.o, L('GNSS positions', 'positions GNSS')]].concat(fuse.checked ? [[C.g, L('fused estimate', 'estimation fusionnée')]] : []), lx = 8;
        lg.forEach(function (l) { x.fillStyle = l[0]; x.fillRect(lx, H - 14, 12, 4); text(map, l[1], lx + 16, H - 9, l[0], 10); lx += x.measureText(l[1]).width + 30; });
        if (!SOL.q) text(map, L('NO POSITION', 'PAS DE POSITION'), W - 8, 16, C.r, 12, 'right', true);
      }
      function drawErr() {
        clear(ech); var g = [], f = [], seg = [], mx = 0.05;
        hist.forEach(function (h) { if (h.g !== null) { seg.push([h.t, h.g]); mx = Math.max(mx, h.g); } else if (seg.length) { g.push(seg); seg = []; } f.push([h.t, h.f]); if (fuse.checked) mx = Math.max(mx, h.f); });
        if (seg.length) g.push(seg);
        var series = g.map(function (sg, k) { return { pts: sg, col: C.o, w: 2, label: k ? null : L('GNSS error', 'erreur GNSS') }; });
        if (fuse.checked) series.push({ pts: f, col: C.g, w: 2, label: L('fused error', 'erreur fusionnée') });
        chart(ech, { x0: Math.max(0, T - 60), x1: Math.max(60, T), y0: 0, y1: mx * 1.2, xl: L('time (s)', 'temps (s)'), yl: L('horizontal error (m)', 'erreur horizontale (m)'), series: series });
      }
      var FIX = { 0: [L('No position', 'Pas de position'), 'bad'], 1: [L('Autonomous', 'Autonome'), ''], 2: [L('SBAS corrected', 'Corrigée SBAS'), ''], 4: [L('RTK fixed', 'RTK fixe'), 'ok'], 5: [L('RTK float', 'RTK flottant'), ''] };
      function paint() {
        drawSky(); drawMap(); drawErr();
        var rg = rmsOf('g', 30), rf = rmsOf('f', 30);
        out([
          [L('Satellites used', 'Satellites utilisés'), SOL.used + ' / ' + SOL.vis + (SOL.cnt.mp ? ' (' + SOL.cnt.mp + ' ↯)' : ''), SOL.used < 4 ? 'bad' : ''],
          ['HDOP', isFinite(SOL.hdop) ? num(SOL.hdop, 1) : '—', SOL.hdop > 2 ? 'bad' : 'ok'],
          [L('Fix', 'Solution'), FIX[SOL.q][0], FIX[SOL.q][1]],
          [L('Announced accuracy (95 %)', 'Précision annoncée (95 %)'), SOL.q ? fmt(2 * SOL.sig) : '—'],
          [L('Real GNSS error (RMS 30 s)', 'Erreur GNSS réelle (RMS 30 s)'), rg.v === null ? '—' : fmt(rg.v) + (rg.miss ? ' · ' + rg.miss + ' s ' + L('without fix', 'sans position') : ''), rg.v !== null && rg.v > 2 * SOL.sig + 0.05 ? 'bad' : ''],
          [L('Fused error (RMS 30 s)', 'Erreur fusionnée (RMS 30 s)'), fuse.checked && rf.v !== null ? fmt(rf.v) : '—']
        ]);
        nmea.innerHTML = '<span>' + L('What the receiver sends (NMEA GGA):', 'Ce qu\'envoie le récepteur (NMEA GGA) :') + '</span><code>' + esc(gga()) + '</code>';
        var use = fuse.checked ? rf : rg;
        ch(env.get() === 'canyon' && T - tReset >= 30 && use.v !== null && rg.miss <= 3 && use.v < 0.2);   // with GNSS positions, not on odometry alone
      }
      var acc = 0;
      function frameLoop(now) {
        var dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
        var simDt = dt * 4; while (simDt > 0) { var h = Math.min(0.05, simDt); step(h); simDt -= h; }
        acc += dt; if (acc > 0.05) { acc = 0; paint(); }
        raf = requestAnimationFrame(frameLoop);
      }
      reset();
      return { start: function () { last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frameLoop); }, stop: function () { cancelAnimationFrame(raf); }, redraw: function () { sky.fit(); map.fit(); ech.fit(); paint(); } };
    };

    // ------------------------------------------------------------------ which sensor for which need
    (function guide() {
      var G = main.querySelector('.sb-guide');
      // one row per sensor: bench, name, what it measures, range, typical accuracy, indicative price, where, main trap
      var ROWS = [
        ['encoder', L('Encoder', 'Encodeur'), L('Angle and speed of a motor or a wheel', 'Angle et vitesse d\'un moteur ou d\'une roue'), '—', L('0.01° to 1°', '0,01° à 1°'), L('€5 to €100', '5 à 100 €'), L('everywhere', 'partout'), L('wheel slip: it counts turns, not metres', 'le patinage : il compte des tours, pas des mètres')],
        ['imu', L('IMU', 'Centrale inertielle'), L('Rotation speed, acceleration, tilt', 'Vitesse de rotation, accélération, inclinaison'), '—', L('tilt ≈ 0.1° to 1°', 'inclinaison ≈ 0,1° à 1°'), L('€2 to €50 (MEMS)', '2 à 50 € (MEMS)'), L('everywhere', 'partout'), L('the integrated gyro drifts; no heading reference', 'le gyro intégré dérive ; pas de référence de cap')],
        ['gnss', 'GNSS', L('Position on Earth', 'Position sur la Terre'), L('worldwide', 'mondiale'), L('2 to 5 m · 1 m SBAS · 2 cm RTK', '2 à 5 m · 1 m SBAS · 2 cm RTK'), L('€10 to €50 · RTK €150 to €500', '10 à 50 € · RTK 150 à 500 €'), L('outdoors only', 'extérieur seulement'), L('buildings, trees, tunnels: hidden or reflected satellites', 'immeubles, arbres, tunnels : satellites cachés ou réfléchis')],
        ['lidar', L('2D lidar', 'Lidar 2D'), L('Distances all around, in one plane', 'Distances tout autour, dans un plan'), L('0.1 to 30 m', '0,1 à 30 m'), L('1 to 3 cm', '1 à 3 cm'), L('€100 to €1 000', '100 à 1 000 €'), L('indoors (outdoors with care)', 'intérieur (extérieur avec précaution)'), L('glass, black objects, obstacles above or below the plane', 'verre, objets noirs, obstacles au-dessus ou sous le plan')],
        ['camera', L('Camera / stereo', 'Caméra / stéréo'), L('Image, colours, objects; depth with two cameras', 'Image, couleurs, objets ; profondeur avec deux caméras'), L('0.3 to 20 m', '0,3 à 20 m'), L('depth error grows with Z²', 'erreur de profondeur en Z²'), L('€20 to €500', '20 à 500 €'), L('everywhere, with light', 'partout, avec de la lumière'), L('darkness, glare, surfaces without texture', 'obscurité, éblouissement, surfaces sans texture')],
        ['sonar', L('Ultrasonic', 'Ultrasons'), L('One distance, in a wide cone', 'Une distance, dans un cône large'), L('0.02 to 4 m', '0,02 à 4 m'), L('1 cm (plus temperature)', '1 cm (plus la température)'), L('€1 to €30', '1 à 30 €'), L('everywhere', 'partout'), L('inclined walls send no echo; soft materials absorb', 'les murs inclinés ne renvoient rien ; les matières molles absorbent')]
      ];
      var NEEDS = [
        [L('Control a motor or a joint', 'Commander un moteur ou une articulation'), ['encoder'], L('An encoder on each motor: it gives the angle and the speed the controller needs, many times per second.', 'Un encodeur sur chaque moteur : il donne l\'angle et la vitesse dont l\'asservissement a besoin, des centaines de fois par seconde.')],
        [L('Keep a robot balanced or level', 'Garder un robot en équilibre ou à plat'), ['imu'], L('An IMU with a complementary or Kalman filter: the gyro for fast moves, the accelerometer for the long-term tilt.', 'Une centrale inertielle avec un filtre complémentaire ou de Kalman : le gyro pour les mouvements rapides, l\'accéléromètre pour l\'inclinaison à long terme.')],
        [L('Find its way outdoors (field, road, park)', 'Se repérer en extérieur (champ, route, parc)'), ['gnss', 'imu', 'encoder'], L('GNSS for the absolute position (RTK for centimetres), fused with the odometry and the IMU to fill the gaps under trees and between buildings.', 'Le GNSS pour la position absolue (RTK pour le centimètre), fusionné avec l\'odométrie et l\'IMU pour boucher les trous sous les arbres et entre les immeubles.')],
        [L('Map a building and find its way in it', 'Cartographier un bâtiment et s\'y repérer'), ['lidar', 'encoder', 'imu'], L('A 2D lidar for SLAM, helped by the odometry and the IMU; no GNSS indoors.', 'Un lidar 2D pour le SLAM, aidé par l\'odométrie et l\'IMU ; pas de GNSS en intérieur.')],
        [L('Avoid obstacles cheaply', 'Éviter les obstacles à petit prix'), ['sonar', 'lidar'], L('A ring of ultrasonic sensors (fired one after the other) catches glass and close obstacles; a lidar if the budget allows.', 'Une ceinture de capteurs à ultrasons (qui émettent l\'un après l\'autre) attrape le verre et les obstacles proches ; un lidar si le budget le permet.')],
        [L('Recognise and grasp objects', 'Reconnaître et saisir des objets'), ['camera'], L('A camera for recognition, a stereo or depth camera for the distance at short range.', 'Une caméra pour la reconnaissance, une caméra stéréo ou de profondeur pour la distance à courte portée.')]
      ];
      var name = {}; ROWS.forEach(function (r) { name[r[0]] = r[1]; });
      G.innerHTML = '<h2 id="sbGuideT">' + L('Which sensor for which need?', 'Quel capteur pour quel besoin ?') + '</h2>' +
        '<p class="sb-intro">' + L('Choose a need: the sensors that answer it are highlighted in the table. Orders of magnitude for small robots; industrial sensors cost much more.', 'Choisissez un besoin : les capteurs qui y répondent sont mis en avant dans le tableau. Ordres de grandeur pour de petits robots ; les capteurs industriels coûtent bien plus.') + '</p>' +
        '<div class="sb-needs" role="group" aria-label="' + esc(L('Needs', 'Besoins')) + '">' + NEEDS.map(function (n, i) { return '<button type="button" data-n="' + i + '" aria-pressed="false">' + n[0] + '</button>'; }).join('') + '</div>' +
        '<p class="sb-advice" aria-live="polite"></p>' +
        '<div class="sb-tbl"><table class="dh"><thead><tr><th class="left">' + [L('Sensor', 'Capteur'), L('Measures', 'Mesure'), L('Range', 'Portée'), L('Typical accuracy', 'Précision typique'), L('Indicative price', 'Prix indicatif'), L('Where', 'Où'), L('Main trap', 'Piège principal'), ''].join('</th><th class="left">') + '</th></tr></thead><tbody>' +
        ROWS.map(function (r) { return '<tr data-s="' + r[0] + '"><td class="left"><b>' + r[1] + '</b></td>' + r.slice(2).map(function (c) { return '<td class="left">' + c + '</td>'; }).join('') + '<td class="left"><a href="#' + r[0] + '">' + L('Try it', 'Essayer') + ' →</a></td></tr>'; }).join('') + '</tbody></table></div>';
      var adv = G.querySelector('.sb-advice');
      G.querySelector('.sb-needs').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-n]'); if (!b) return;
        var on = b.getAttribute('aria-pressed') !== 'true', n = NEEDS[+b.dataset.n];
        [].forEach.call(G.querySelectorAll('.sb-needs button'), function (x) { x.setAttribute('aria-pressed', String(on && x === b)); });
        [].forEach.call(G.querySelectorAll('tbody tr'), function (tr) { tr.classList.toggle('hit', on && n[1].indexOf(tr.dataset.s) >= 0); tr.classList.toggle('dim', on && n[1].indexOf(tr.dataset.s) < 0); });
        adv.innerHTML = on ? '<b>' + n[1].map(function (k) { return name[k]; }).join(' + ') + '</b> — ' + n[2] : '';
      });
      // "Try it": open the bench and go up to it
      G.addEventListener('click', function (e) { var a = e.target.closest('a[href^="#"]'); if (!a) return; e.preventDefault(); show(a.getAttribute('href').slice(1)); main.querySelector('.sb-tabs').scrollIntoView({ behavior: 'smooth' }); });
    })();
    paintTabs();

    // ------------------------------------------------------------------ theme, size, first bench
    var redrawAll = function () { colours(); [].forEach.call(main.querySelectorAll('.sb-bench'), function (s) { if (s._b && s._b.redraw) s._b.redraw(); }); };
    new MutationObserver(redrawAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    var rt = 0; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(redrawAll, 150); });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
    show(location.hash.slice(1));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
