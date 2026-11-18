// labkit.js — shared helpers of the 2D labs of the courses: canvas, charts, sliders, choices, read-outs, challenges.
// Exposes window.RAK. Texts are given in English and French with RAK.L(en, fr). Colours follow the light / dark theme (RAK.C).
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
    if (!label) { var fr0 = host.closest && host.closest('.tw-frame, .widget'), h0 = fr0 && fr0.querySelector('h4, .tw-t'); label = (h0 && h0.textContent) || L('Graph of the lab', 'Graphique du labo'); }
    var c = el('canvas', { 'class': 'tw-cv', role: 'img', 'aria-label': label }); host.appendChild(c);
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
  function challenge(host, txt) {
    var d = el('div', { 'class': 'tw-chal' }); host.appendChild(d);
    var set = function (ok) { d.className = 'tw-chal' + (ok ? ' ok' : ''); d.innerHTML = '<b>' + L('Challenge', 'Défi') + '</b><p>' + txt + '</p><span>' + (ok ? L('✓ Challenge met!', '✓ Défi réussi !') : L('Not yet: change the settings.', 'Pas encore : changez les réglages.')) + '</span>'; };
    set(false); return set;
  }
  function onView(w, start, stop) { new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else if (stop) stop(); }); }, { rootMargin: '60px' }).observe(w); }
  window.RAK = { FR: FR, L: L, f: f, el: el, get C() { return C; }, redraws: redraws, canvas: canvas, clear: clear, text: text, chart: chart, range: range, slider: slider, seg: seg, check: check, readouts: readouts, note: note, frame: frame, rng: rng, gauss: gauss, challenge: challenge, onView: onView };
  // mount the widgets of every course file that registered itself in RAK.W
  window.RAK.W = window.RAK.W || {};
  function init() { [].forEach.call(document.querySelectorAll('.widget[data-widget]'), function (w) { var k = w.dataset.widget, fn = window.RAK.W[k]; if (fn && !w.firstChild) { try { fn(w); } catch (e) { w.textContent = 'Error: ' + e.message; if (window.console) console.error(e); } } }); }
  window.RAK.init = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); }); else setTimeout(init, 0);
})();
