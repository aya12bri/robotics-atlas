// fig.mjs — small SVG figures for the practice blocks: graphs of functions and simple robot drawings.
// Text in the figures goes through svgtx(en, fr) so that it is translated like the rest of the course.
import { svgtx } from '../lib.mjs';

const C = { ink: '#e8eef5', grid: '#3a4552', axis: '#9fb0c3', o: '#ff9f43', b: '#5aa9ff', g: '#3ddc84', r: '#ff5c5c', p: '#b07cff', y: '#f5c518' };
export const COL = C;
const fx = (v) => +v.toFixed(1);
export const T = (x, y, s, o = {}) => `<text x="${fx(x)}" y="${fx(y)}" fill="${o.c || C.ink}" font-size="${o.fs || 14}" text-anchor="${o.a || 'start'}"${o.b ? ' font-weight="700"' : ''}>${o.raw ? s : svgtx(...(Array.isArray(s) ? s : [s]))}</text>`;
export const LINE = (x1, y1, x2, y2, c = C.ink, w = 2, dash) => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
export const ARROW = (x1, y1, x2, y2, c = C.ink, w = 2.5) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 10; return LINE(x1, y1, x2, y2, c, w) + `<path d="M${fx(x2)},${fx(y2)} L${fx(x2 - h * Math.cos(a - 0.4))},${fx(y2 - h * Math.sin(a - 0.4))} L${fx(x2 - h * Math.cos(a + 0.4))},${fx(y2 - h * Math.sin(a + 0.4))} z" fill="${c}"/>`; };
export const DOT = (x, y, c = C.ink, r = 5) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="${r}" fill="${c}"/>`;
export const JOINT = (x, y) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="11" fill="#262626" stroke="${C.ink}" stroke-width="2.5"/><circle cx="${fx(x)}" cy="${fx(y)}" r="3" fill="${C.ink}"/>`;
export const BOXR = (x, y, w, h, fill, stroke = C.axis, txt) => `<rect x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>` + (txt ? T(x + w / 2, y + h / 2 + 5, txt, { a: 'middle', fs: 14, b: true }) : '');
export const ARC = (cx, cy, r, a0, a1, c = C.y) => { const p = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)], [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${fx(x0)},${fx(y0)} A${r},${r} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${a1 > a0 ? 0 : 1} ${fx(x1)},${fx(y1)}" fill="none" stroke="${c}" stroke-width="2"/>`; };

// a graph: plot({ x: [0, 5], y: [-1, 1], curves: [{ f, c, label }], xl, yl, marks, w, h, ticks })
export function plot(o) {
  const W = o.w || 640, H = o.h || 300, L = 56, R = 18, Tp = 18, B = 44, pw = W - L - R, ph = H - Tp - B;
  const X = (x) => L + (x - o.x[0]) / (o.x[1] - o.x[0]) * pw, Y = (y) => Tp + (1 - (y - o.y[0]) / (o.y[1] - o.y[0])) * ph;
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
  const nx = o.ticks ? o.ticks[0] : 5, ny = o.ticks ? o.ticks[1] : 4;
  for (let i = 0; i <= nx; i++) { const v = o.x[0] + (o.x[1] - o.x[0]) * i / nx; s += LINE(X(v), Tp, X(v), Tp + ph, C.grid, 1) + T(X(v), H - B + 18, String(+v.toFixed(2)), { a: 'middle', fs: 12, c: C.axis, raw: true }); }
  for (let i = 0; i <= ny; i++) { const v = o.y[0] + (o.y[1] - o.y[0]) * i / ny; s += LINE(L, Y(v), L + pw, Y(v), C.grid, 1) + T(L - 8, Y(v) + 4, String(+v.toFixed(2)), { a: 'end', fs: 12, c: C.axis, raw: true }); }
  if (o.y[0] < 0 && o.y[1] > 0) s += LINE(L, Y(0), L + pw, Y(0), C.axis, 1.5);
  s += LINE(L, Tp + ph, L + pw, Tp + ph, C.axis, 1.5) + LINE(L, Tp, L, Tp + ph, C.axis, 1.5);
  (o.curves || []).forEach((cv, k) => {
    const n = 160; let d = '';
    for (let i = 0; i <= n; i++) { const x = o.x[0] + (o.x[1] - o.x[0]) * i / n, y = cv.f(x); if (!isFinite(y)) continue; d += (d ? 'L' : 'M') + fx(X(x)) + ',' + fx(Y(Math.max(o.y[0] - 1e3, Math.min(o.y[1] + 1e3, y)))); }
    s += `<path d="${d}" fill="none" stroke="${cv.c || C.o}" stroke-width="${cv.w || 3}"${cv.dash ? ` stroke-dasharray="${cv.dash}"` : ''}/>`;
    if (cv.label) s += `<rect x="${L + 10}" y="${Tp + 8 + k * 22}" width="14" height="4" fill="${cv.c || C.o}"/>` + T(L + 30, Tp + 14 + k * 22, cv.label, { fs: 13, c: cv.c || C.o });
  });
  (o.marks || []).forEach(([x, y, lab, c]) => { s += DOT(X(x), Y(y), c || C.y, 5) + (lab ? T(X(x) + 8, Y(y) - 8, lab, { fs: 13, c: c || C.y }) : ''); });
  if (o.xl) s += T(L + pw, H - 6, o.xl, { a: 'end', fs: 13, c: C.axis });
  if (o.yl) s += T(8, Tp - 4 + 2, o.yl, { fs: 13, c: C.axis });
  return { vb: `0 0 ${W} ${H}`, svg: s };
}
// a two-link arm in the plane: arm2(l1, l2, t1, t2 (deg), opts)
export function arm2(l1, l2, t1, t2, o = {}) {
  const W = o.w || 560, H = o.h || 320, s0 = o.scale || 110, ox = o.ox || 170, oy = o.oy || 270, D = Math.PI / 180;
  const x1 = ox + s0 * l1 * Math.cos(t1 * D), y1 = oy - s0 * l1 * Math.sin(t1 * D), x2 = x1 + s0 * l2 * Math.cos((t1 + t2) * D), y2 = y1 - s0 * l2 * Math.sin((t1 + t2) * D);
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
  s += ARROW(ox - 30, oy, W - 30, oy, C.r, 2) + T(W - 32, oy + 20, 'x', { c: C.r, raw: true, a: 'end' }) + ARROW(ox, oy + 20, ox, 24, C.g, 2) + T(ox + 10, 30, 'y', { c: C.g, raw: true });
  s += `<rect x="${ox - 26}" y="${oy}" width="52" height="12" fill="#3a4552"/>`;
  s += LINE(ox, oy, x1, y1, C.o, 9) + LINE(x1, y1, x2, y2, C.o, 9) + JOINT(ox, oy) + JOINT(x1, y1) + DOT(x2, y2, C.ink, 6);
  s += ARC(ox, oy, 40, 0, t1 * D) + T(ox + 46, oy - 12, 'θ₁', { c: C.y, raw: true, fs: 15 });
  s += LINE(x1, y1, x1 + 55 * Math.cos(t1 * D), y1 - 55 * Math.sin(t1 * D), C.axis, 1.5, '4 4') + ARC(x1, y1, 32, t1 * D, (t1 + t2) * D) + T(x1 + 38 * Math.cos((t1 + t2 / 2) * D) + 4, y1 - 38 * Math.sin((t1 + t2 / 2) * D), 'θ₂', { c: C.y, raw: true, fs: 15 });
  s += T((ox + x1) / 2 - 18, (oy + y1) / 2 - 6, 'L₁', { raw: true, fs: 15, b: true }) + T((x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8, 'L₂', { raw: true, fs: 15, b: true });
  s += LINE(x2, y2, x2, oy, C.b, 1.5, '5 4') + LINE(ox, y2, x2, y2, C.b, 1.5, '5 4') + T(x2, oy + 20, 'x', { c: C.b, raw: true, a: 'middle' }) + T(ox - 10, y2 + 4, 'y', { c: C.b, raw: true, a: 'end' }) + T(x2 + 10, y2 - 8, ['tool (x, y)', 'outil (x, y)'], { fs: 13 });
  return { vb: `0 0 ${W} ${H}`, svg: s + (o.extra || '') };
}
// a block diagram: blocks([[label, color], ...]) in a row, joined by arrows; optional feedback arrow
export function chain(items, o = {}) {
  const n = items.length, W = o.w || 680, bw = Math.min(140, (W - 40 - (n - 1) * 26) / n), H = o.fb ? 170 : 120, y = 30;
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`, x = 20;
  const xs = [];
  items.forEach(([lab, col], i) => { s += BOXR(x, y, bw, 56, '#262c35', col || C.axis) + T(x + bw / 2, y + 33, lab, { a: 'middle', fs: 13, b: true }); xs.push(x); if (i < n - 1) s += ARROW(x + bw + 2, y + 28, x + bw + 24, y + 28, C.axis, 2); x += bw + 26; });
  if (o.fb) { const a = xs[n - 1] + bw / 2, b = xs[o.fb[0]] + bw / 2; s += LINE(a, y + 56, a, y + 100, C.g, 2) + LINE(a, y + 100, b, y + 100, C.g, 2) + ARROW(b, y + 100, b, y + 58, C.g, 2) + T((a + b) / 2, y + 120, o.fb[1], { a: 'middle', fs: 13, c: C.g }); }
  return { vb: `0 0 ${W} ${H}`, svg: s };
}
