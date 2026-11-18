// learn-tr-widgets.js — the labs of the course "Mechanical transmissions and grippers" (learn-transmission.html). Uses labkit.js (RAK) and lab3d.js (RA3D).
//   tr-belt      belt and pulleys: ratio, open or crossed belt (2D)
//   tr-gears3d   two spur gears (and an idler) that really mesh: ratio, speed, torque, direction, centre distance (3D)
//   tr-backlash  the dead zone of backlash: hysteresis and position error (2D)
//   tr-convert3d rack and pinion, screw and nut, worm and wheel (3D)
//   tr-planet3d  a planetary gear: choose the fixed member (3D)
//   tr-harmonic  a harmonic drive: wave generator, flexspline, circular spline (2D)
//   tr-sizing    size a joint drive: reflected inertia, optimal ratio, torque and speed limits (2D)
//   tr-gripper3d a parallel gripper holds a cup: motor torque → jaw force → friction (3D)
(function () {
  'use strict';
  var K = window.RAK; if (!K) return;
  var L = K.L, f = K.f, el = K.el, W = K.W, TAU = Math.PI * 2;

  // ---------------------------------------------------------------- a spur gear as a 3D mesh (teeth around the y axis), module m in scene units
  function gearShape(T, z, m, internal, outerR) {
    var rp = m * z / 2, ra = rp + m, rr = rp - 1.25 * m, w = Math.PI / (2 * z), pts = [];
    if (internal) { ra = rp - m; rr = rp + 1.25 * m; }
    for (var k = 0; k < z; k++) {
      var c = k * TAU / z;
      [[c - Math.PI / z, rr], [c - 1.15 * w, rr], [c - 0.55 * w, ra], [c + 0.55 * w, ra], [c + 1.15 * w, rr]].forEach(function (p) { pts.push(new T.Vector2(Math.cos(p[0]) * p[1], Math.sin(p[0]) * p[1])); });
    }
    if (!internal) { var sh = new T.Shape(pts), hole = new T.Path(); hole.absarc(0, 0, Math.max(m * 1.2, rp * 0.18), 0, TAU, true); sh.holes.push(hole); return sh; }
    var outer = new T.Shape(); outer.absarc(0, 0, outerR, 0, TAU, false); outer.holes.push(new T.Path(pts.slice().reverse())); return outer;
  }
  function gearMesh(v, z, m, col, thick, internal, outerR) {
    var T = v.T, geo = new T.ExtrudeGeometry(gearShape(T, z, m, internal, outerR), { depth: thick, bevelEnabled: false, curveSegments: 24 });
    geo.translate(0, 0, -thick / 2); geo.rotateX(-Math.PI / 2);                      // lie in the xz plane, axis along y
    var g = new T.Group(), mesh = new T.Mesh(geo, v.mat(col, { metalness: 0.45, roughness: 0.35 })); g.add(mesh);
    var mark = new T.Mesh(new T.BoxGeometry(m * z * 0.32, thick * 1.08, m * 0.8), v.mat(0xffffff, { metalness: 0.1 })); mark.position.x = m * z * 0.2; g.add(mark);   // shows the rotation
    return g;
  }
  var dirTxt = function (s) { return s > 0 ? L('same direction', 'même sens') : L('opposite direction', 'sens opposé'); };

  // ================================================================ tr-belt
  W['tr-belt'] = function (w) {
    var F = K.frame(w, L('Lab: belt and pulleys', 'Labo : courroie et poulies'), L('The belt does not slip (timing belt): both pulleys have the same rim speed v = ω r. Change the diameters and cross the belt.', 'La courroie ne glisse pas (courroie crantée) : les deux poulies ont la même vitesse au bord v = ω r. Changez les diamètres et croisez la courroie.'));
    var cv = K.canvas(F.view, 0.5, L('Two pulleys and a belt', 'Deux poulies et une courroie'));
    var d1 = K.slider(F.ctl, { label: L('Driving pulley d₁ (mm)', 'Poulie motrice d₁ (mm)'), min: 20, max: 120, value: 40, unit: ' mm' });
    var d2 = K.slider(F.ctl, { label: L('Driven pulley d₂ (mm)', 'Poulie menée d₂ (mm)'), min: 20, max: 160, value: 100, unit: ' mm' });
    var n1 = K.slider(F.ctl, { label: L('Motor speed n₁ (rpm)', 'Vitesse moteur n₁ (tr/min)'), min: 100, max: 3000, step: 50, value: 1500, unit: ' tr/min' });
    var cross = K.seg(F.ctl, L('Belt', 'Courroie'), [['open', L('open', 'ouverte')], ['cross', L('crossed', 'croisée')]], 'open');
    var out = K.readouts(F.side), a1 = 0, a2 = 0, last = 0, raf = 0;
    function loop(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      var r1 = d1.get() / 2, r2 = d2.get() / 2, i = d2.get() / d1.get(), s = cross.get() === 'cross' ? -1 : 1, w1 = n1.get() / 60 * TAU;
      a1 += w1 * dt * 0.02; a2 += s * w1 / i * dt * 0.02;
      K.clear(cv); var c = cv.x, C = K.C, sc = Math.min(cv.h * 0.4 / 80, 1.2), y = cv.h / 2, x1 = cv.w * 0.28, x2 = cv.w * 0.68, R1 = r1 * sc * 1.4, R2 = r2 * sc * 1.4;
      c.strokeStyle = C.o; c.lineWidth = 4;
      if (s > 0) { c.beginPath(); c.moveTo(x1, y - R1); c.lineTo(x2, y - R2); c.moveTo(x1, y + R1); c.lineTo(x2, y + R2); c.stroke(); }
      else { c.beginPath(); c.moveTo(x1, y - R1); c.lineTo(x2, y + R2); c.moveTo(x1, y + R1); c.lineTo(x2, y - R2); c.stroke(); }
      [[x1, R1, a1, C.b], [x2, R2, a2, C.g]].forEach(function (p) { c.fillStyle = C.box; c.strokeStyle = p[3]; c.lineWidth = 3; c.beginPath(); c.arc(p[0], y, p[1], 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(p[0], y); c.lineTo(p[0] + Math.cos(p[2]) * p[1], y - Math.sin(p[2]) * p[1]); c.stroke(); });
      K.text(cv, L('motor', 'moteur'), x1, y + R1 + 18, C.b, 12, 'center'); K.text(cv, L('load', 'charge'), x2, y + R2 + 18, C.g, 12, 'center');
      out([[L('Ratio i = d₂ / d₁', 'Rapport i = d₂ / d₁'), f(i, 2)], [L('Output speed n₂ = n₁ / i', 'Vitesse de sortie n₂ = n₁ / i'), f(n1.get() / i, 0) + ' ' + L('rpm', 'tr/min')], [L('Torque × i (losses aside)', 'Couple × i (hors pertes)'), '× ' + f(i, 2)], [L('Direction', 'Sens'), dirTxt(s)], [L('Belt speed v', 'Vitesse de courroie v'), f(n1.get() / 60 * Math.PI * d1.get() / 1000, 2) + ' m/s']]);
      raf = requestAnimationFrame(loop);
    }
    K.onView(w, function () { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(loop); }, function () { cancelAnimationFrame(raf); });
    K.redraws.push(function (rs) { if (rs) cv.fit(); });
  };

  // ================================================================ tr-gears3d
  W['tr-gears3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: two gears that really mesh', 'Labo 3D : deux engrenages qui engrènent vraiment'),
      L('The blue gear A is driven by the motor. Change the numbers of teeth, the module, and add an idler gear. Turn the scene with the mouse: watch the teeth roll on each other and the white marks turn at different speeds.', 'La roue bleue A est entraînée par le moteur. Changez les nombres de dents, le module, et ajoutez une roue intermédiaire. Tournez la scène à la souris : regardez les dents rouler les unes sur les autres et les repères blancs tourner à des vitesses différentes.'));
    var NA = K.slider(F.ctl, { label: L('Teeth of A (driving) N_A', 'Dents de A (menante) N_A'), min: 10, max: 40, value: 15, on: rebuild });
    var NB = K.slider(F.ctl, { label: L('Teeth of B (driven) N_B', 'Dents de B (menée) N_B'), min: 10, max: 60, value: 30, on: rebuild });
    var MO = K.slider(F.ctl, { label: L('Module m (mm)', 'Module m (mm)'), min: 1, max: 4, step: 0.5, value: 2, dec: 1, unit: ' mm', on: rebuild });
    var idl = K.check(F.ctl, L('Add an idler gear (20 teeth) between A and B', 'Ajouter une roue intermédiaire (20 dents) entre A et B'), false, rebuild);
    var nIn = K.slider(F.ctl, { label: L('Motor speed (rpm)', 'Vitesse moteur (tr/min)'), min: 10, max: 120, value: 40, unit: ' tr/min' });
    var tIn = K.slider(F.ctl, { label: L('Motor torque (N·m)', 'Couple moteur (N·m)'), min: 1, max: 20, value: 5, unit: ' N·m' });
    var eta = K.slider(F.ctl, { label: L('Efficiency per mesh η', 'Rendement par engrènement η'), min: 80, max: 99, value: 97, map: function (x) { return x / 100; }, dec: 2 });
    var out = K.readouts(F.side), v3 = null, G = [], ang = 0;
    function readout() {
      var a = NA.get(), b = NB.get(), m = MO.get(), id = idl.checked, GR = b / a, meshes = id ? 2 : 1, effi = Math.pow(eta.get(), meshes);
      out([[L('Gear ratio GR = N_B / N_A', 'Rapport GR = N_B / N_A'), f(GR, 2) + ' : 1'], [L('Output speed', 'Vitesse de sortie'), f(nIn.get() / GR, 1) + ' ' + L('rpm', 'tr/min')], [L('Output torque T_A × GR × η', 'Couple de sortie T_A × GR × η'), f(tIn.get() * GR * effi, 2) + ' N·m'],
        [L('Direction of B', 'Sens de B'), dirTxt(id ? 1 : -1)], [L('Pitch diameters d = m N', 'Diamètres primitifs d = m N'), f(m * a, 0) + ' / ' + f(m * b, 0) + ' mm'], [L('Centre distance', 'Entraxe'), id ? f(m * (a + 20) / 2, 1) + ' + ' + f(m * (20 + b) / 2, 1) + ' mm' : f(m * (a + b) / 2, 1) + ' mm'], [L('Overall efficiency', 'Rendement global'), f(effi * 100, 1) + ' %']]);
    }
    var labs = [];
    function rebuild() {
      readout(); if (!v3) return;
      G.forEach(function (g) { v3.root.remove(g.obj); }); labs.forEach(function (l) { v3.root.remove(l); }); G = []; labs = [];
      var S = 0.01, m = MO.get() * S, a = NA.get(), b = NB.get(), th = 0.12, list = idl.checked ? [[a, 0x5aa9ff], [20, 0x8a94a3], [b, 0xff9f43]] : [[a, 0x5aa9ff], [b, 0xff9f43]];
      var total = 0; for (var i = 1; i < list.length; i++) total += m * (list[i - 1][0] + list[i][0]) / 2;
      var x = -total / 2;
      list.forEach(function (it, k) {
        if (k) x += m * (list[k - 1][0] + it[0]) / 2;
        var obj = gearMesh(v3, it[0], m, it[1], th); obj.position.set(x, 0.2, 0); v3.root.add(obj);
        var shaft = new v3.T.Mesh(new v3.T.CylinderGeometry(m * 1.2, m * 1.2, 0.5, 16), v3.mat(0xd5dbe1, { metalness: 0.6 })); shaft.position.y = -0.05; obj.add(shaft);
        G.push({ obj: obj, z: it[0] });
      });
      [[0, L('A · motor', 'A · moteur'), '#5aa9ff'], [G.length - 1, L('B · load', 'B · charge'), '#ffa04d']].forEach(function (q) { var l = v3.label(q[1], q[2], 0.1); l.position.set(G[q[0]].obj.position.x, 0.55, 0); v3.root.add(l); labs.push(l); });
    }
    RA3D.scene(F.view, { ratio: 0.55, cam: [0, 1.35, 1.6], target: [0, 0.12, 0], floorSize: 1.5 }).then(function (v) {
      v3 = v; rebuild();
      v.frame(function (t, dt) {
        ang += nIn.get() / 60 * TAU * dt * 0.25;                                       // shown 4 times slower than real
        // gear i meshes with gear i − 1 on its left: θᵢ = π − π/Nᵢ − θᵢ₋₁ Nᵢ₋₁ / Nᵢ (a tooth of one in a gap of the other)
        var th = ang; G.forEach(function (g, i) { if (i) th = Math.PI - Math.PI / g.z - th * G[i - 1].z / g.z; g.obj.rotation.y = th; });
      });
    });
    [NA, NB, MO].forEach(function () {}); readout();
    [nIn, tIn, eta].forEach(function (s) { s.row.querySelector('input').addEventListener('input', readout); });
  };

  // ================================================================ tr-backlash
  W['tr-backlash'] = function (w) {
    var F = K.frame(w, L('Lab: what backlash does to a position', 'Labo : ce que le jeu fait à une position'), L('The motor goes back and forth. With backlash, the output only moves once the teeth touch on the other side: a dead zone at each reversal.', 'Le moteur va et vient. Avec du jeu, la sortie ne bouge qu\'une fois que les dents se touchent de l\'autre côté : une zone morte à chaque changement de sens.'));
    var c1 = K.canvas(F.view, 0.36), c2 = K.canvas(F.view, 0.42);
    var bl = K.slider(F.ctl, { label: L('Backlash (arcmin)', 'Jeu (minutes d\'arc)'), min: 0, max: 60, value: 20, unit: '′', on: run });
    var amp = K.slider(F.ctl, { label: L('Motion amplitude (°)', 'Amplitude du mouvement (°)'), min: 1, max: 10, value: 3, unit: '°', on: run });
    var arm = K.slider(F.ctl, { label: L('Arm length (mm)', 'Longueur du bras (mm)'), min: 100, max: 1500, step: 50, value: 800, unit: ' mm', on: run });
    var out = K.readouts(F.side);
    function run() {
      var b = bl.get() / 60, A = amp.get(), inP = [], outP = [], hy = [], y = -A + b / 2, maxE = 0;
      for (var i = 0; i <= 400; i++) { var t = i / 400 * 2, x = A * Math.sin(TAU * t / 2 * 2 - Math.PI / 2); if (x - y > b / 2) y = x - b / 2; else if (y - x > b / 2) y = x + b / 2; inP.push([t, x]); outP.push([t, y]); hy.push([x, y]); maxE = Math.max(maxE, Math.abs(x - y)); }
      var C = K.C;
      K.clear(c1); K.chart(c1, { x0: 0, x1: 2, y0: -A * 1.2, y1: A * 1.2, xl: L('time (s)', 'temps (s)'), yl: L('angle (°)', 'angle (°)'), series: [{ pts: inP, col: C.b, label: L('motor side', 'côté moteur') }, { pts: outP, col: C.o, label: L('output', 'sortie') }] });
      K.clear(c2); K.chart(c2, { x0: -A * 1.2, x1: A * 1.2, y0: -A * 1.2, y1: A * 1.2, xl: L('input (°)', 'entrée (°)'), yl: L('output (°)', 'sortie (°)'), series: [{ pts: [[-A, -A], [A, A]], col: C.mute, w: 1, dash: [4, 4], label: L('no backlash', 'sans jeu') }, { pts: hy, col: C.r, w: 2.5, label: L('with backlash: a loop', 'avec jeu : une boucle') }] });
      out([[L('Lost motion at each reversal', 'Mouvement perdu à chaque inversion'), f(bl.get(), 0) + '′ = ' + f(b, 3) + '°'], [L('Error at the end of the arm', 'Erreur au bout du bras'), f(arm.get() * b * Math.PI / 180, 2) + ' mm', arm.get() * b * Math.PI / 180 > 0.1 ? 'bad' : 'ok'], [L('Typical values', 'Valeurs typiques'), L('spur 10–30′, planetary 3–10′, harmonic < 1′', 'droit 10–30′, planétaire 3–10′, harmonic < 1′')]]);
    }
    run(); K.redraws.push(function (rs) { if (rs) { c1.fit(); c2.fit(); } run(); });
  };

  // ================================================================ tr-convert3d
  W['tr-convert3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: turn a rotation into something else', 'Labo 3D : transformer une rotation en autre chose'), L('Choose a mechanism. The motor turns at the speed you choose; read the motion that comes out.', 'Choisissez un mécanisme. Le moteur tourne à la vitesse choisie ; lisez le mouvement qui sort.'));
    var mech = K.seg(F.ctl, L('Mechanism', 'Mécanisme'), [['rack', L('rack and pinion', 'pignon-crémaillère')], ['screw', L('screw and nut', 'vis-écrou')], ['worm', L('worm and wheel', 'roue et vis sans fin')]], 'rack', build);
    var p1 = K.slider(F.ctl, { label: L('Pinion teeth Z / screw lead (mm) / worm starts', 'Dents du pignon Z / pas de la vis (mm) / filets de la vis'), min: 1, max: 30, value: 20 });
    var p2 = K.slider(F.ctl, { label: L('Module m (mm) / — / wheel teeth', 'Module m (mm) / — / dents de la roue'), min: 1, max: 60, value: 2 });
    var n = K.slider(F.ctl, { label: L('Motor speed (rpm)', 'Vitesse moteur (tr/min)'), min: 10, max: 300, value: 60, unit: ' tr/min' });
    var out = K.readouts(F.side), v3 = null, parts = [], pos = 0, ang = 0;
    function info() {
      var k = mech.get(), a = p1.get(), b = p2.get(), N = n.get();
      if (k === 'rack') { var d = b * a, vv = N / 60 * Math.PI * d; out([[L('Pitch diameter d = m Z', 'Diamètre primitif d = m Z'), f(d, 0) + ' mm'], [L('Rack pitch p = π m', 'Pas de la crémaillère p = π m'), f(Math.PI * b, 2) + ' mm'], [L('Linear speed v = ω d / 2', 'Vitesse linéaire v = ω d / 2'), f(vv, 0) + ' mm/s'], [L('Per turn of the pinion', 'Par tour du pignon'), f(Math.PI * d, 0) + ' mm'], [L('Self-locking?', 'Irréversible ?'), L('no: a push on the rack turns the pinion', 'non : une poussée sur la crémaillère fait tourner le pignon')]]); }
      else if (k === 'screw') { out([[L('Lead (advance per turn)', 'Pas (avance par tour)'), f(a, 0) + ' mm'], [L('Linear speed v = n × lead', 'Vitesse linéaire v = n × pas'), f(N / 60 * a, 1) + ' mm/s'], [L('Force from 1 N·m (η = 0.9)', 'Force pour 1 N·m (η = 0,9)'), f(2 * Math.PI * 0.9 / (a / 1000), 0) + ' N'], [L('Self-locking?', 'Irréversible ?'), a <= 3 ? L('yes for a trapezoidal screw with a small lead', 'oui pour une vis trapézoïdale à petit pas') : L('no (a ball screw is never self-locking)', 'non (une vis à billes n\'est jamais irréversible)')]]); }
      else { var z1 = Math.max(1, Math.min(4, Math.round(a / 7.5))), z2 = Math.max(20, b); out([[L('Worm starts z₁', 'Filets de la vis z₁'), z1], [L('Wheel teeth z₂', 'Dents de la roue z₂'), z2], [L('Ratio z₂ / z₁', 'Rapport z₂ / z₁'), f(z2 / z1, 0) + ' : 1'], [L('Wheel speed', 'Vitesse de la roue'), f(N * z1 / z2, 2) + ' ' + L('rpm', 'tr/min')], [L('Self-locking?', 'Irréversible ?'), z1 === 1 ? L('usually yes (one start, small lead angle): the load cannot drive back', 'en général oui (un filet, petit angle d\'hélice) : la charge ne peut pas entraîner en retour') : L('less likely with several starts', 'moins probable avec plusieurs filets')]]); }
    }
    function build() {
      info(); if (!v3) return; var T = v3.T;
      parts.forEach(function (p) { v3.root.remove(p); }); parts = []; pos = 0; ang = 0;
      var add = function (o) { v3.root.add(o); parts.push(o); return o; }, k = mech.get();
      if (k === 'rack') {
        var Z = Math.round(p1.get()), m = 0.02, pin = add(gearMesh(v3, Z, m, 0x5aa9ff, 0.12)); pin.rotation.x = Math.PI / 2; pin.position.set(0, 0.45 + m * Z / 2, 0); pin.userData.k = 'pin';
        var rack = add(new T.Group()); rack.userData.k = 'rack'; rack.position.y = 0.45;
        var bar = new T.Mesh(new T.BoxGeometry(3, 0.1, 0.12), v3.mat(0xff9f43, { metalness: 0.4 })); bar.position.y = -0.05 - 1.25 * m; rack.add(bar);
        for (var i = -40; i <= 40; i++) { var tooth = new T.Mesh(new T.BoxGeometry(m * 1.3, m * 2.1, 0.12), v3.mat(0xff9f43, { metalness: 0.4 })); tooth.position.set(i * Math.PI * m, -0.05 * 0, 0); tooth.position.y = 0; rack.add(tooth); }
      } else if (k === 'screw') {
        var screw = add(new T.Group()); screw.userData.k = 'screw'; screw.position.y = 0.4;
        var core = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.6, 24), v3.mat(0xd5dbe1, { metalness: 0.6 })); core.rotation.z = Math.PI / 2; screw.add(core);
        var lead = Math.max(0.03, p1.get() / 100), pts = []; for (var s = -1.3; s <= 1.3; s += 0.005) pts.push(new T.Vector3(s, Math.cos(s / lead * TAU) * 0.07, Math.sin(s / lead * TAU) * 0.07));
        var helix = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 900, 0.012, 6), v3.mat(0x8a94a3, { metalness: 0.6 })); screw.add(helix);
        var nut = add(new T.Mesh(new T.BoxGeometry(0.22, 0.24, 0.24), v3.mat(0xff9f43))); nut.userData.k = 'nut'; nut.position.y = 0.4;
        var motor = add(new T.Mesh(new T.BoxGeometry(0.25, 0.25, 0.25), v3.mat(0x3a3f48))); motor.position.set(-1.45, 0.4, 0); motor.userData.raKeep = true;
      } else {
        var z1 = Math.max(1, Math.min(4, Math.round(p1.get() / 7.5))), z2 = Math.max(20, p2.get()), mw = 0.02;
        var wheel = add(gearMesh(v3, z2, mw, 0xff9f43, 0.08)); wheel.position.set(0, 0.45, 0); wheel.rotation.x = Math.PI / 2; wheel.userData.k = 'wheel'; wheel.userData.z2 = z2; wheel.userData.z1 = z1;
        var worm = add(new T.Group()); worm.userData.k = 'worm'; worm.userData.z1 = z1; worm.position.set(0, 0.45 - mw * z2 / 2 - 0.07, 0);
        var wc = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.9, 20), v3.mat(0xd5dbe1, { metalness: 0.6 })); wc.rotation.x = Math.PI / 2; worm.add(wc);
        for (var st = 0; st < z1; st++) { var pts2 = []; for (var u = -0.4; u <= 0.4; u += 0.004) { var a2 = u / (Math.PI * mw * z1) * TAU + st * TAU / z1; pts2.push(new T.Vector3(Math.cos(a2) * 0.06, Math.sin(a2) * 0.06, u)); } worm.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts2), 400, 0.012, 6), v3.mat(0x5aa9ff, { metalness: 0.5 }))); }
      }
    }
    [p1, p2].forEach(function (s) { s.row.querySelector('input').addEventListener('input', build); }); n.row.querySelector('input').addEventListener('input', info);
    RA3D.scene(F.view, { ratio: 0.5, cam: [0.3, 1.1, 2.4], target: [0, 0.4, 0], floorSize: 1.8 }).then(function (v) {
      v3 = v; build();
      v.frame(function (t, dt) {
        var N = n.get() / 60 * TAU * dt * 0.5; ang += N;
        parts.forEach(function (p) {
          var k = p.userData.k;
          if (k === 'pin') p.rotation.y = -Math.PI / 2 - ang;                           // a tooth points down at the start
          if (k === 'rack') { var Z = Math.round(p1.get()), m = 0.02, r = m * Z / 2; p.position.x = Math.PI * m / 2 - ((ang * r) % (Math.PI * m * 20)); }   // a gap under the pinion, moving at v = ω r
          if (k === 'screw') p.rotation.x = ang;
          if (k === 'nut') { var lead = Math.max(0.03, p1.get() / 100), x2 = (ang / TAU * lead) % 2.2; p.position.x = -1.1 + x2; }
          if (k === 'worm') p.rotation.z = ang;
          if (k === 'wheel') p.rotation.y = ang * p.userData.z1 / p.userData.z2;           // one turn of the worm moves the wheel by z₁ teeth
        });
      });
    });
    info();
  };

  // ================================================================ tr-planet3d
  W['tr-planet3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: a planetary gear', 'Labo 3D : un train planétaire'), L('Sun (blue) in the middle, three planets (grey) on a carrier (orange arm), and a ring with internal teeth. Fix one of the three members, drive another: the third one comes out.', 'Le soleil (bleu) au centre, trois satellites (gris) sur un porte-satellites (bras orange), et une couronne à denture intérieure. Bloquez un des trois membres, entraînez-en un autre : le troisième sort.'));
    var mode = K.seg(F.ctl, L('Fixed member', 'Membre bloqué'), [['ring', L('ring fixed: sun → carrier', 'couronne bloquée : soleil → porte-satellites')], ['sun', L('sun fixed: ring → carrier', 'soleil bloqué : couronne → porte-satellites')], ['carrier', L('carrier fixed: sun → ring', 'porte-satellites bloqué : soleil → couronne')]], 'ring', info);
    var Zs = K.slider(F.ctl, { label: L('Sun teeth N_s', 'Dents du soleil N_s'), min: 12, max: 36, step: 3, value: 24, on: rebuild });
    var Zp = K.slider(F.ctl, { label: L('Planet teeth N_p', 'Dents des satellites N_p'), min: 12, max: 36, step: 3, value: 18, on: rebuild });
    var out = K.readouts(F.side), v3 = null, P = {}, th = { s: 0, c: 0 };
    var ratio = function () { var s = Zs.get(), r = s + 2 * Zp.get(), k = mode.get(); return k === 'ring' ? 1 + r / s : k === 'sun' ? 1 + s / r : -r / s; };
    function info() {
      var s = Zs.get(), p = Zp.get(), r = s + 2 * p, k = mode.get(), i = ratio();
      out([[L('Ring teeth N_r = N_s + 2 N_p', 'Dents de la couronne N_r = N_s + 2 N_p'), r], [L('Reduction ratio', 'Rapport de réduction'), f(Math.abs(i), 2) + ' : 1' + (i < 0 ? L(' (output reversed)', ' (sortie inversée)') : '')], [L('Formula', 'Formule'), k === 'ring' ? '1 + N_r / N_s' : k === 'sun' ? '1 + N_s / N_r' : '− N_r / N_s'],
        [L('Equal spacing of 3 planets', 'Espacement égal de 3 satellites'), (s + r) % 3 === 0 ? L('possible ((N_s + N_r) / 3 is whole)', 'possible ((N_s + N_r) / 3 est entier)') : L('impossible: change the teeth', 'impossible : changez les dents'), (s + r) % 3 === 0 ? 'ok' : 'bad']]);
    }
    function rebuild() {
      info(); if (!v3) return; var T = v3.T, m = 0.012, s = Zs.get(), p = Zp.get(), r = s + 2 * p;
      ['sun', 'ring', 'carrier'].concat(P.planets || []).forEach(function (k) { var o = typeof k === 'string' ? P[k] : k; if (o) v3.root.remove(o); });
      P.sun = gearMesh(v3, s, m, 0x5aa9ff, 0.1); P.sun.position.y = 0.2; v3.root.add(P.sun);
      P.ring = gearMesh(v3, r, m, 0x6f7a8a, 0.1, true, m * r / 2 + 0.06); P.ring.position.y = 0.2; v3.root.add(P.ring);
      P.carrier = new T.Group(); P.carrier.position.y = 0.29; v3.root.add(P.carrier);
      var R = m * (s + p) / 2; P.R = R;
      for (var k = 0; k < 3; k++) { var arm = new T.Mesh(new T.BoxGeometry(R, 0.03, 0.04), v3.mat(0xff9f43)); arm.position.x = R / 2; var g = new T.Group(); g.rotation.y = k * TAU / 3; g.add(arm); P.carrier.add(g); }
      P.planets = [0, 1, 2].map(function () { var g = gearMesh(v3, p, m, 0xd5dbe1, 0.1); g.position.y = 0.2; v3.root.add(g); return g; });
    }
    RA3D.scene(F.view, { ratio: 0.55, cam: [0, 1.25, 1.1], target: [0, 0.15, 0], floorSize: 1.3 }).then(function (v) {
      v3 = v; rebuild();
      v.frame(function (t, dt) {
        var s = Zs.get(), p = Zp.get(), r = s + 2 * p, k = mode.get(), win = 0.6 * dt, ws, wc, wr;
        if (k === 'ring') { ws = win; wr = 0; wc = ws * s / (s + r); }
        else if (k === 'sun') { wr = win; ws = 0; wc = wr * r / (s + r); }
        else { ws = win; wc = 0; wr = -ws * s / r; }
        th.s += ws; th.c += wc;
        P.sun.rotation.y = th.s; P.carrier.rotation.y = th.c;
        var thp0 = 0;
        P.planets.forEach(function (pl, i) {
          var beta = th.c + i * TAU / 3, thp = beta + Math.PI - (TAU / p) * (0.5 - (beta - th.s) * s / TAU);   // rolls on the sun
          pl.position.set(Math.cos(beta) * P.R, 0.2, -Math.sin(beta) * P.R); pl.rotation.y = thp; if (!i) thp0 = thp;
        });
        P.ring.rotation.y = th.c - (TAU / r) * (0.5 + (th.c - thp0) * p / TAU);                       // and on the ring
      });
    });
    info();
  };

  // ================================================================ tr-harmonic
  W['tr-harmonic'] = function (w) {
    var F = K.frame(w, L('Lab: inside a harmonic drive', 'Labo : à l\'intérieur d\'un harmonic drive'), L('The elliptical wave generator (blue) turns fast and bends the flexspline (orange) so that its teeth mesh with the rigid circular spline (grey) at the two ends of the ellipse. The flexspline has a few teeth less: at each turn of the generator it moves back by this difference.', 'Le générateur d\'onde elliptique (bleu) tourne vite et déforme la roue flexible (orange) pour que ses dents engrènent avec la couronne rigide (grise) aux deux bouts de l\'ellipse. La roue flexible a quelques dents de moins : à chaque tour du générateur, elle recule de cette différence.'));
    var cv = K.canvas(F.view, 0.62, L('Harmonic drive', 'Harmonic drive'));
    var Nc = K.slider(F.ctl, { label: L('Circular spline teeth N_c', 'Dents de la couronne N_c'), min: 40, max: 202, step: 2, value: 102 });
    var dN = K.seg(F.ctl, L('Difference N_c − N_e', 'Différence N_c − N_e'), [['2', '2'], ['4', '4']], '2');
    var spd = K.slider(F.ctl, { label: L('Input speed (rpm)', 'Vitesse d\'entrée (tr/min)'), min: 5, max: 60, value: 20, unit: ' tr/min' });
    var out = K.readouts(F.side), a = 0, b = 0, last = 0, raf = 0;
    function loop(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      var nc = Nc.get(), d = +dN.get(), ne = nc - d, GR = ne / d, win = spd.get() / 60 * TAU;
      a += win * dt; b -= win / GR * dt;
      K.clear(cv); var c = cv.x, C = K.C, cx = cv.w / 2, cy = cv.h / 2, R = Math.min(cv.w, cv.h) * 0.4, e = R * 0.06;
      c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R + 14, 0, 7); c.stroke();
      for (var k = 0; k < nc; k++) { var q = k / nc * TAU; c.beginPath(); c.moveTo(cx + Math.cos(q) * (R + 13), cy + Math.sin(q) * (R + 13)); c.lineTo(cx + Math.cos(q) * (R + 5), cy + Math.sin(q) * (R + 5)); c.stroke(); }
      var rad = function (q) { var u = q - a; return R - e + e * Math.cos(2 * u) * 1.0; };          // the ellipse turning with the generator
      c.strokeStyle = C.o; c.lineWidth = 3; c.beginPath(); for (k = 0; k <= 180; k++) { var q2 = k / 180 * TAU, r2 = rad(q2); if (k) c.lineTo(cx + Math.cos(q2) * r2, cy + Math.sin(q2) * r2); else c.moveTo(cx + Math.cos(q2) * r2, cy + Math.sin(q2) * r2); } c.stroke();
      c.lineWidth = 2; for (k = 0; k < ne; k++) { var q3 = b + k / ne * TAU, r3 = rad(q3); c.beginPath(); c.moveTo(cx + Math.cos(q3) * (r3 - 1), cy + Math.sin(q3) * (r3 - 1)); c.lineTo(cx + Math.cos(q3) * (r3 + 8), cy + Math.sin(q3) * (r3 + 8)); c.stroke(); }
      c.fillStyle = C.b; c.globalAlpha = 0.85; c.beginPath(); c.ellipse(cx, cy, R * 0.82, R * 0.7, a, 0, 7); c.fill(); c.globalAlpha = 1;
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(b) * R * 0.95, cy + Math.sin(b) * R * 0.95); c.stroke();
      K.text(cv, L('white line: the output (on the flexspline)', 'trait blanc : la sortie (sur la roue flexible)'), 10, 18, C.axis, 11);
      out([[L('Flexspline teeth N_e', 'Dents de la roue flexible N_e'), ne], [L('Ratio GR = N_e / (N_c − N_e)', 'Rapport GR = N_e / (N_c − N_e)'), f(GR, 0) + ' : 1'], [L('Output speed', 'Vitesse de sortie'), f(spd.get() / GR, 3) + ' ' + L('rpm, reversed', 'tr/min, inversée')], [L('Backlash', 'Jeu'), L('almost zero (teeth preloaded)', 'presque nul (dents précontraintes)'), 'ok']]);
      raf = requestAnimationFrame(loop);
    }
    K.onView(w, function () { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(loop); }, function () { cancelAnimationFrame(raf); });
    K.redraws.push(function (rs) { if (rs) cv.fit(); });
  };

  // ================================================================ tr-sizing
  W['tr-sizing'] = function (w) {
    var F = K.frame(w, L('Lab: size the drive of a robot joint', 'Labo : dimensionner l\'entraînement d\'une articulation'), L('A motor and a gearbox move a load (an arm) that must accelerate and turn fast. The motor sees the load inertia divided by N²: choose the ratio N so that the torque and the speed of the motor both stay within its limits.', 'Un moteur et un réducteur entraînent une charge (un bras) qui doit accélérer et tourner vite. Le moteur voit l\'inertie de la charge divisée par N² : choisissez le rapport N pour que le couple et la vitesse du moteur restent dans leurs limites.'));
    var cv = K.canvas(F.view, 0.5);
    var JL = K.slider(F.ctl, { label: L('Load inertia J_L (kg·m²)', 'Inertie de la charge J_L (kg·m²)'), min: 1, max: 100, value: 20, map: function (x) { return x / 10; }, dec: 1, on: run });
    var Jm = K.slider(F.ctl, { label: L('Motor inertia J_m (kg·cm²)', 'Inertie du moteur J_m (kg·cm²)'), min: 1, max: 50, value: 3, map: function (x) { return x / 10; }, dec: 1, on: run });
    var acc = K.slider(F.ctl, { label: L('Joint acceleration (rad/s²)', 'Accélération de l\'articulation (rad/s²)'), min: 1, max: 30, value: 10, on: run });
    var vel = K.slider(F.ctl, { label: L('Joint speed (°/s)', 'Vitesse de l\'articulation (°/s)'), min: 30, max: 360, step: 10, value: 180, on: run });
    var TL = K.slider(F.ctl, { label: L('Load torque (gravity) (N·m)', 'Couple de charge (gravité) (N·m)'), min: 0, max: 100, value: 30, on: run });
    var N = K.slider(F.ctl, { label: L('Gear ratio N', 'Rapport de réduction N'), min: 5, max: 200, value: 15, on: run });
    var out = K.readouts(F.side), chal = K.challenge(F.side, L('Motor limits: 3 N·m peak torque and 3000 rpm. Find a ratio that respects both.', 'Limites du moteur : 3 N·m de couple crête et 3000 tr/min. Trouvez un rapport qui respecte les deux.'));
    var eta = 0.85, Tmax = 3, nmax = 3000;
    var Tm = function (n) { var jm = Jm.get() / 1e4, jl = JL.get(), a = acc.get(); return jm * n * a + (jl * a + TL.get()) / (n * eta); };
    function run() {
      var n = N.get(), jm = Jm.get() / 1e4, jl = JL.get(), C = K.C, pts = [], sp = [], best = Math.sqrt(jl / jm);
      for (var i = 5; i <= 200; i++) { pts.push([i, Tm(i)]); sp.push([i, vel.get() / 360 * 60 * i / 1000]); }
      K.clear(cv); var ch = K.chart(cv, { x0: 5, x1: 200, y0: 0, y1: Math.max(6, Math.min(20, Tm(5))), xl: L('gear ratio N', 'rapport N'), yl: L('motor torque (N·m) · speed (×1000 rpm)', 'couple moteur (N·m) · vitesse (×1000 tr/min)'), hlines: [{ y: Tmax, col: C.r, label: L('torque limit', 'limite de couple') }, { y: nmax / 1000, col: C.p, label: L('speed limit', 'limite de vitesse') }],
        series: [{ pts: pts, col: C.o, label: L('motor torque needed', 'couple moteur nécessaire') }, { pts: sp, col: C.b, label: L('motor speed', 'vitesse moteur') }] });
      cv.x.strokeStyle = C.y; cv.x.setLineDash([3, 4]); cv.x.beginPath(); cv.x.moveTo(ch.X(n), ch.A.t); cv.x.lineTo(ch.X(n), ch.A.b); cv.x.stroke(); cv.x.setLineDash([]);
      var t = Tm(n), rpm = vel.get() / 360 * 60 * n, ok = t <= Tmax && rpm <= nmax;
      out([[L('Reflected inertia J_L / N²', 'Inertie ramenée J_L / N²'), f(jl / n / n * 1e4, 2) + ' kg·cm²'], [L('Inertia ratio (load / motor)', 'Rapport d\'inerties (charge / moteur)'), f(jl / n / n / jm, 2), jl / n / n / jm > 10 ? 'bad' : ''], [L('Ratio that minimises the acceleration torque √(J_L / J_m)', 'Rapport qui minimise le couple d\'accélération √(J_L / J_m)'), f(best, 0)],
        [L('Motor torque needed', 'Couple moteur nécessaire'), f(t, 2) + ' N·m', t <= Tmax ? 'ok' : 'bad'], [L('Motor speed', 'Vitesse moteur'), f(rpm, 0) + ' ' + L('rpm', 'tr/min'), rpm <= nmax ? 'ok' : 'bad']]);
      chal(ok);
    }
    run(); K.redraws.push(function (rs) { if (rs) cv.fit(); run(); });
  };

  // ================================================================ tr-gripper3d
  W['tr-gripper3d'] = function (w) {
    var F = K.frame(w, L('Lab 3D: a gripper for cups (the design project)', 'Labo 3D : une pince pour des tasses (le projet de conception)'), L('A parallel gripper driven by a motor through a screw closes on a cup. Will the friction hold it while the robot accelerates? Change the cup, the jaws and the motor.', 'Une pince parallèle entraînée par un moteur à travers une vis se ferme sur une tasse. Le frottement la tiendra-t-il pendant que le robot accélère ? Changez la tasse, les mors et le moteur.'));
    var mass = K.slider(F.ctl, { label: L('Cup mass (g)', 'Masse de la tasse (g)'), min: 50, max: 500, step: 10, value: 400, unit: ' g', on: upd });
    var diam = K.slider(F.ctl, { label: L('Cup diameter (cm)', 'Diamètre de la tasse (cm)'), min: 4, max: 10, step: 0.5, value: 8, dec: 1, unit: ' cm', on: upd });
    var mu = K.seg(F.ctl, L('Jaw pads on ceramic', 'Patins des mors sur céramique'), [['0.3', L('metal μ 0.3', 'métal μ 0,3')], ['0.6', L('rubber μ 0.6', 'caoutchouc μ 0,6')], ['0.9', L('soft silicone μ 0.9', 'silicone souple μ 0,9')]], '0.3', upd);
    var Tm = K.slider(F.ctl, { label: L('Motor torque (N·cm)', 'Couple moteur (N·cm)'), min: 1, max: 50, value: 2, unit: ' N·cm', on: upd });
    var lead = K.slider(F.ctl, { label: L('Screw lead (mm)', 'Pas de la vis (mm)'), min: 1, max: 8, value: 2, unit: ' mm', on: upd });
    var acc = K.slider(F.ctl, { label: L('Vertical acceleration of the robot (m/s²)', 'Accélération verticale du robot (m/s²)'), min: 0, max: 10, value: 8, unit: ' m/s²', on: upd });
    var out = K.readouts(F.side), v3 = null, jaws = [], cup = null, S = 2, eta = 0.4, closing = 0;
    function calc() { var Fj = 2 * Math.PI * eta * (Tm.get() / 100) / (lead.get() / 1000), need = (mass.get() / 1000) * (9.81 + acc.get()) * S / (2 * +mu.get()); return { Fj: Fj, need: need }; }
    function upd() {
      var c = calc(), ok = c.Fj >= c.need, crush = c.Fj > 150;
      out([[L('Jaw force F = 2π η T / lead', 'Force de serrage F = 2π η T / pas'), f(c.Fj, 1) + ' N'], [L('Needed: m (g + a) S / (2 μ)', 'Nécessaire : m (g + a) S / (2 μ)'), f(c.need, 1) + ' N'], [L('Verdict', 'Verdict'), ok ? (crush ? L('holds, but may crush a thin plastic cup', 'tient, mais peut écraser un gobelet fin') : L('the cup is held', 'la tasse est tenue')) : L('the cup slips', 'la tasse glisse'), ok && !crush ? 'ok' : 'bad'], [L('Safety factor S, screw efficiency η', 'Coefficient de sécurité S, rendement de la vis η'), '2 · 0,4']]);
      if (cup) { cup.scale.set(diam.get() / 8, 1, diam.get() / 8); }
    }
    RA3D.scene(F.view, { ratio: 0.55, cam: [0.32, 0.5, 0.62], target: [0, 0.36, 0], floorSize: 1 }).then(function (v) {
      v3 = v; var T = v.T;
      var body = new T.Mesh(new T.BoxGeometry(0.34, 0.08, 0.1), v.mat(0x3a3f48)); body.position.y = 0.52; body.userData.raKeep = true; v.root.add(body);
      var flange = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.1, 24), v.mat(0x8a94a3, { metalness: 0.5 })); flange.position.y = 0.61; v.root.add(flange);
      [-1, 1].forEach(function (s) { var j = new T.Group(); var finger = new T.Mesh(new T.BoxGeometry(0.025, 0.2, 0.06), v.mat(0xff9f43)); finger.position.y = -0.1; j.add(finger); var pad = new T.Mesh(new T.BoxGeometry(0.01, 0.07, 0.05), v.mat(0x30a46c)); pad.position.set(-s * 0.017, -0.16, 0); j.add(pad); j.position.set(s * 0.12, 0.48, 0); j.userData.s = s; v.root.add(j); jaws.push(j); });
      var pts = [[0.0, 0], [0.036, 0], [0.04, 0.005], [0.042, 0.09], [0.038, 0.09], [0.036, 0.008], [0, 0.008]].map(function (p) { return new T.Vector2(p[0], p[1]); });
      cup = new T.Mesh(new T.LatheGeometry(pts, 40), v.mat(0xf2f2f2, { roughness: 0.3, side: T.DoubleSide })); cup.position.y = 0.27; cup.scale.setScalar(1); v.root.add(cup);
      var handle = new T.Mesh(new T.TorusGeometry(0.022, 0.006, 10, 24, Math.PI), v.mat(0xf2f2f2)); handle.rotation.z = -Math.PI / 2; handle.position.set(0.043, 0.045, 0); cup.add(handle);
      var lab = v.label(L('screw inside the body', 'vis dans le corps'), '#b8c2cf', 0.04); lab.position.set(0, 0.6, 0.08); v.root.add(lab);
      upd();
      v.frame(function (t, dt) {
        closing = (t % 5) / 5; var c = calc(), held = c.Fj >= c.need, r = diam.get() / 200 + 0.0215, open = 0.12, gap = closing < 0.4 ? open - (open - r) * closing / 0.4 : r;
        jaws.forEach(function (j) { j.position.x = j.userData.s * gap; });
        var lift = closing > 0.5 ? (closing - 0.5) * 0.4 : 0; jaws.forEach(function (j) { j.position.y = 0.48 + lift; }); body.position.y = 0.52 + lift; flange.position.y = 0.61 + lift;
        cup.position.y = 0.27 + (held ? lift : Math.max(0, lift - (closing - 0.5) * 0.25));
      });
    });
    upd();
  };
})();
