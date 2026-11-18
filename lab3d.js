// lab3d.js — a small shared toolkit for the 3D labs of the courses (three.js is loaded only when a lab comes into view).
// Usage:  RA3D.scene(host, { ratio: 0.55, cam: [x, y, z], target: [x, y, z], floor: true }).then((v) => { ... v.frame((t, dt) => ...) });
// v = { T (three), scene, camera, renderer, controls, root, mat(color, opts), label(text, color), arrow(color), line(color), frame(fn), render(), dispose() }
// The page needs the import map of three (the course pages have it). Colours follow the light / dark theme.
(function () {
  'use strict';
  var RA = window.RA || {};
  var loading = null;
  function load() {
    if (!loading) loading = Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]).then(function (m) { return { T: m[0], Orbit: m[1].OrbitControls }; });
    return loading;
  }
  var css = function (n, d) { return (getComputedStyle(document.documentElement).getPropertyValue(n) || '').trim() || d; };
  function scene(host, o) {
    o = o || {};
    return load().then(function (M) {
      var T = M.T, ratio = o.ratio || 0.55;
      var box = document.createElement('div'); box.className = 'l3d'; host.appendChild(box);
      var W = Math.max(260, host.clientWidth || 600), H = Math.round(W * ratio);
      var renderer = new T.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H);
      renderer.shadowMap.enabled = !!o.shadows; box.appendChild(renderer.domElement);
      var hint = document.createElement('span'); hint.className = 'l3d-hint'; hint.textContent = RA.lang === 'fr' ? 'glisser pour tourner · molette pour zoomer' : 'drag to turn · wheel to zoom'; box.appendChild(hint);
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(o.fov || 38, W / H, 0.01, 200);
      var c = o.cam || [3, 2.4, 3.6], tg = o.target || [0, 0.4, 0]; cam.position.set(c[0], c[1], c[2]);
      var controls = new M.Orbit(cam, renderer.domElement); controls.target.set(tg[0], tg[1], tg[2]); controls.enableDamping = true; controls.update();
      if (o.noZoom) controls.enableZoom = false;
      sc.add(new T.HemisphereLight(0xffffff, 0x445066, 1.5));
      var sun = new T.DirectionalLight(0xffffff, 1.9); sun.position.set(3, 6, 4); sun.castShadow = !!o.shadows; sc.add(sun);
      var root = new T.Group(); sc.add(root);
      var floor = null;
      if (o.floor !== false) {
        floor = new T.Mesh(new T.CircleGeometry(o.floorSize || 4, 64), new T.MeshStandardMaterial({ color: 0x2a3550, roughness: 0.95 }));
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.userData.raKeep = true; sc.add(floor);
        var grid = new T.GridHelper((o.floorSize || 4) * 2, (o.floorSize || 4) * 4, 0x8a94a3, 0x4a5568); grid.position.y = 0.002; grid.material.transparent = true; grid.material.opacity = 0.35; sc.add(grid);
      }
      var mat = function (col, op) { return new T.MeshStandardMaterial(Object.assign({ color: col, roughness: 0.5, metalness: 0.15 }, op || {})); };
      // a text label that always faces the camera
      var label = function (txt, col, size) {
        var cv = document.createElement('canvas'), x = cv.getContext('2d'), fs = 44; x.font = '600 ' + fs + 'px "IBM Plex Sans", system-ui, sans-serif';
        var w = Math.ceil(x.measureText(txt).width) + 24; cv.width = w; cv.height = fs + 20; x.font = '600 ' + fs + 'px "IBM Plex Sans", system-ui, sans-serif';
        x.fillStyle = 'rgba(10,15,24,0.72)'; x.beginPath(); if (x.roundRect) x.roundRect(0, 0, w, fs + 20, 14); else x.rect(0, 0, w, fs + 20); x.fill();
        x.fillStyle = col || '#ffffff'; x.textBaseline = 'middle'; x.fillText(txt, 12, (fs + 20) / 2 + 2);
        var tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
        var sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); var s = (size || 0.12);
        sp.scale.set(s * w / (fs + 20), s, 1); sp.renderOrder = 10; return sp;
      };
      // an arrow made of a cylinder and a cone, along +x; set(len) changes its length
      var arrow = function (col, rad) {
        var g = new T.Group(), m = mat(col, { emissive: col, emissiveIntensity: 0.25 }), r = rad || 0.02;
        var sh = new T.Mesh(new T.CylinderGeometry(r, r, 1, 12), m), hd = new T.Mesh(new T.ConeGeometry(r * 2.6, r * 7, 16), m);
        sh.rotation.z = -Math.PI / 2; hd.rotation.z = -Math.PI / 2; g.add(sh, hd);
        g.set = function (len) { var L = Math.max(0.001, Math.abs(len)); g.visible = L > 0.005; sh.scale.y = Math.max(0.001, L - r * 7); sh.position.x = (L - r * 7) / 2; hd.position.x = L - r * 3.5; g.scale.x = len < 0 ? -1 : 1; };
        g.set(0.5); return g;
      };
      var line = function (col, dashed) { var geo = new T.BufferGeometry(); var mt = dashed ? new T.LineDashedMaterial({ color: col, dashSize: 0.05, gapSize: 0.04 }) : new T.LineBasicMaterial({ color: col }); var l = new T.Line(geo, mt); l.frustumCulled = false; l.setPoints = function (pts) { geo.setFromPoints(pts.map(function (p) { return p.isVector3 ? p : new T.Vector3(p[0], p[1], p[2]); })); if (dashed) l.computeLineDistances(); }; return l; };
      var fns = [], raf = 0, last = 0, visible = false, t0 = performance.now();
      var paint = function () { sc.background = new T.Color(css('--fpanel', '#141c2b')); if (floor) floor.material.color.set(document.documentElement.dataset.theme === 'light' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: light)').matches) ? 0xd9dee5 : 0x2a3550); };
      paint(); new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      if (RA.darkParts) RA.darkParts(sc);
      var render = function () { controls.update(); renderer.render(sc, cam); };
      var loop = function (now) { var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; fns.forEach(function (f) { f((now - t0) / 1000, dt); }); render(); raf = requestAnimationFrame(loop); };
      new IntersectionObserver(function (es) { es.forEach(function (e) { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) { last = 0; raf = requestAnimationFrame(loop); } }); }, { rootMargin: '80px' }).observe(box);
      var resize = function () { var w = Math.max(260, host.clientWidth || 600), h = Math.round(w * ratio); renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); render(); };
      new ResizeObserver(function () { resize(); }).observe(host);
      return { T: T, scene: sc, camera: cam, renderer: renderer, controls: controls, root: root, box: box, mat: mat, label: label, arrow: arrow, line: line,
        frame: function (fn) { fns.push(fn); }, render: render };
    });
  }
  window.RA3D = { scene: scene, load: load };
})();
