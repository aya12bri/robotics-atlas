// helpers.js — tools shared by all the robot pages.
// It is a normal script (not a module), so it also works when you double-click a page.

const RB = (function () {
  const D2R = Math.PI / 180;
  const NS = 'http://www.w3.org/2000/svg';

  // ---------- 4x4 matrices (arrays of rows) ----------
  const identity = () => [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];

  function mul(A, B) {
    const C = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        for (let k = 0; k < 4; k++) C[i][j] += A[i][k] * B[k][j];
    return C;
  }

  // Standard DH:  A = Rz(theta) · Tz(d) · Tx(a) · Rx(alpha)        (angles in degrees)
  function stdA(theta, d, a, alpha) {
    const t = theta * D2R, al = alpha * D2R;
    const ct = Math.cos(t), st = Math.sin(t), ca = Math.cos(al), sa = Math.sin(al);
    return [
      [ct, -st * ca,  st * sa, a * ct],
      [st,  ct * ca, -ct * sa, a * st],
      [0,   sa,       ca,      d],
      [0,   0,        0,       1]
    ];
  }

  // Modified DH (DHM):  A = Rx(alpha[i-1]) · Tx(a[i-1]) · Rz(theta) · Tz(d)
  function modA(alpha, a, theta, d) {
    const t = theta * D2R, al = alpha * D2R;
    const ct = Math.cos(t), st = Math.sin(t), ca = Math.cos(al), sa = Math.sin(al);
    return [
      [ct,      -st,      0,   a],
      [st * ca,  ct * ca, -sa, -sa * d],
      [st * sa,  ct * sa,  ca,  ca * d],
      [0,        0,        0,   1]
    ];
  }

  // A DH cell is [ "symbol shown", number or function(q) ]
  const val = (cell, q) => (typeof cell[1] === 'function' ? cell[1](q) : cell[1]);

  // chain returns [T0, T1, T2, ...]: the pose of every frame in the base frame
  function chain(mats) {
    const out = [identity()];
    mats.forEach((M) => out.push(mul(out[out.length - 1], M)));
    return out;
  }
  const stdChain = (rows, q) =>
    chain(rows.map((r) => stdA(val(r.th, q), val(r.d, q), val(r.a, q), val(r.al, q))));
  const modChain = (rows, q) =>
    chain(rows.map((r) => modA(val(r.al, q), val(r.a, q), val(r.th, q), val(r.d, q))));

  // ---------- tables ----------
  const fmt = (x) => String(+x.toFixed(3));

  function cellHtml(cell, q) {
    return typeof cell[1] === 'function'
      ? `${cell[0]}<small>${fmt(cell[1](q))}</small>`
      : cell[0];
  }

  function renderTable(el, kind, rows, q) {
    const head = kind === 'std'
      ? ['i', 'θ<sub>i</sub> (°)', 'd<sub>i</sub> (m)', 'a<sub>i</sub> (m)', 'α<sub>i</sub> (°)']
      : ['i', 'α<sub>i−1</sub> (°)', 'a<sub>i−1</sub> (m)', 'θ<sub>i</sub> (°)', 'd<sub>i</sub> (m)'];
    const order = kind === 'std' ? ['th', 'd', 'a', 'al'] : ['al', 'a', 'th', 'd'];
    let html = '<table class="dh"><tr>' + head.map((h) => `<th>${h}</th>`).join('') + '</tr>';
    rows.forEach((r, i) => {
      html += `<tr><td>${i + 1}</td>` + order.map((k) => `<td>${cellHtml(r[k], q)}</td>`).join('') + '</tr>';
    });
    el.innerHTML = html + '</table>';
  }

  function renderMatrix(el, T, title) {
    const n = (x) => (Math.abs(x) < 5e-4 ? 0 : x).toFixed(3).padStart(8);
    const lines = T.map((row) => row.map(n).join(' '));
    el.textContent = `${title}\n` + lines.join('\n');
  }

  // ---------- sliders + number boxes ----------
  // defs: [{label, min, max, step, value, unit}]. onChange(values) is called at every change.
  // Returns { values(), set(list) } so that a program (for example a demo) can move the sliders too.
  function controls(container, defs, onChange) {
    const vals = defs.map((d) => d.value);
    const rows = [];
    defs.forEach((d, i) => {
      const row = document.createElement('div');
      row.className = 'ctl';
      row.innerHTML =
        `<span class="ctl-name" id="ctl${controls.n = (controls.n || 0) + 1}">${d.label}</span>` +   // the name labels both inputs (screen readers)
        `<input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}" aria-labelledby="ctl${controls.n}">` +
        `<input type="number" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}" aria-labelledby="ctl${controls.n}">` +
        `<span class="ctl-unit">${d.unit}</span>`;
      const range = row.querySelector('[type=range]');
      const num = row.querySelector('[type=number]');
      rows.push({ range, num, d });
      const apply = (v) => { vals[i] = v; onChange(vals.slice()); };

      range.addEventListener('input', () => { num.value = range.value; apply(Number(range.value)); });
      // while typing: only react to valid numbers inside the allowed range
      num.addEventListener('input', () => {
        const v = Number(num.value);
        if (num.value !== '' && !isNaN(v) && v >= d.min && v <= d.max) { range.value = v; apply(v); }
      });
      // when you leave the box (or press Enter): clamp to the allowed range
      num.addEventListener('change', () => {
        let v = Number(num.value);
        if (num.value === '' || isNaN(v)) v = vals[i];
        v = Math.min(d.max, Math.max(d.min, v));
        num.value = v; range.value = v; apply(v);
      });
      container.appendChild(row);
    });
    onChange(vals.slice());
    return {
      values: () => vals.slice(),
      set: (list) => {
        list.forEach((v, i) => {
          const { range, num, d } = rows[i];
          v = Math.min(d.max, Math.max(d.min, v));
          vals[i] = v;
          range.value = v;
          num.value = Math.round(v * 100) / 100;
        });
        onChange(vals.slice());
      }
    };
  }

  // ---------- SVG drawing ----------
  function shape(svg, name, attrs) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    svg.appendChild(e);
    return e;
  }
  function label(svg, x, y, str, color = '#cfd8e3', size = 16, anchor = 'start') {
    const t = shape(svg, 'text', {
      x, y, fill: color, 'font-size': size, 'text-anchor': anchor,
      stroke: '#262626', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round'
    });
    t.textContent = str;
    return t;
  }
  function arrow(svg, x1, y1, x2, y2, color) {
    shape(svg, 'line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
    const ang = Math.atan2(y2 - y1, x2 - x1), s = 7;
    const p = (a) => `${x2 - s * Math.cos(ang + a)},${y2 - s * Math.sin(ang + a)}`;
    shape(svg, 'polygon', { points: `${x2},${y2} ${p(0.4)} ${p(-0.4)}`, fill: color });
  }

  const AXIS_COLOR = { x: '#ff6b6b', y: '#6bdc8b', z: '#5aa9ff' };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  // Draw the x, y, z axes of the frames.
  //   Ts   : list of 4x4 frame poses (from stdChain / modChain)
  //   view : { right, up, toward } three unit vectors describing where we look from
  //   map  : (u, v) => [pixelX, pixelY]
  //   opts : { only: frame number or 'all', len: arrow length in pixels }
  // An axis pointing at the viewer is drawn as ⊙ and an axis pointing away as ⊗.
  // Axes that fall on the same spot share one label, for example "z0=z1".
  function drawFrames(svg, Ts, view, map, opts = {}) {
    const len = opts.len || 50;
    const only = opts.only === undefined || opts.only === 'all' ? null : Number(opts.only);
    const labels = {};
    const addLabel = (x, y, name, color) => {
      const key = color + Math.round(x / 6) + ',' + Math.round(y / 6);
      if (labels[key]) labels[key].names.push(name);
      else labels[key] = { x, y, names: [name], color };
    };
    Ts.forEach((T, i) => {
      if (only !== null && i !== only) return;
      const o = [T[0][3], T[1][3], T[2][3]];
      const [ox, oy] = map(dot(o, view.right), dot(o, view.up));
      ['x', 'y', 'z'].forEach((name, k) => {
        const d = [T[0][k], T[1][k], T[2][k]];
        const du = dot(d, view.right), dv = dot(d, view.up), dw = dot(d, view.toward);
        const color = AXIS_COLOR[name];
        if (Math.hypot(du, dv) < 0.3) {
          shape(svg, 'circle', { cx: ox, cy: oy, r: 9, fill: 'none', stroke: color, 'stroke-width': 2.5 });
          if (dw > 0) {
            shape(svg, 'circle', { cx: ox, cy: oy, r: 3, fill: color });
          } else {
            const c = 5;
            shape(svg, 'line', { x1: ox - c, y1: oy - c, x2: ox + c, y2: oy + c, stroke: color, 'stroke-width': 2.5 });
            shape(svg, 'line', { x1: ox - c, y1: oy + c, x2: ox + c, y2: oy - c, stroke: color, 'stroke-width': 2.5 });
          }
          addLabel(ox + 13, oy + 22, `${name}${i}`, color);
        } else {
          const ex = ox + du * len, ey = oy - dv * len;
          arrow(svg, ox, oy, ex, ey, color);
          addLabel(ex + 5, ey - 5, `${name}${i}`, color);
        }
      });
    });
    Object.values(labels).forEach((l) => label(svg, l.x, l.y, l.names.join('='), l.color, 15));
  }

  return { identity, mul, stdA, modA, stdChain, modChain, fmt,
           renderTable, renderMatrix, controls, shape, label, arrow, drawFrames };
})();
// theme helpers for the 3D views: RB.isLight() and RB.onTheme(fn) (fn(isLight) now and on every theme change)
RB.isLight = () => (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light';
RB.onTheme = (fn) => {
  const run = () => fn(RB.isLight()); run();
  new MutationObserver(run).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', run);
};
window.RB = RB;// kinematic diagrams (svg#schema): no label on top of another one. After each drawing, every text that overlaps a text
// placed before it is moved to the nearest free spot (above, below, then to the sides), inside the picture.
RB.declutter = (svg) => {
  const vb = svg.viewBox && svg.viewBox.baseVal, W = vb && vb.width ? vb.width : 700, H = vb && vb.height ? vb.height : 420;
  const placed = [], pad = 2;
  svg.querySelectorAll('.rb-leader').forEach((l) => l.remove());
  const hit = (b) => placed.some((p) => b.x < p.x + p.w + pad && b.x + b.w + pad > p.x && b.y < p.y + p.h + pad && b.y + b.h + pad > p.y);
  const inside = (b) => b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H;
  // the joint symbols, the tool and the targets are obstacles too (small circles and boxes; not the long links or the base)
  svg.querySelectorAll('circle, rect').forEach((s) => {
    let b; try { b = s.getBBox(); } catch (e) { return; }
    if (b.width && b.width <= 44 && b.height <= 44) placed.push({ x: b.x, y: b.y, w: b.width, h: b.height });
  });
  svg.querySelectorAll('text').forEach((t) => {
    t.removeAttribute('transform');
    let b; try { b = t.getBBox(); } catch (e) { return; }
    if (!b.width) return;
    const box = { x: b.x, y: b.y, w: b.width, h: b.height };
    if (hit(box)) {
      const s = b.height * 0.95, tries = [];
      for (let k = 1; k <= 4; k++) tries.push([0, -k * s], [0, k * s], [-(b.width / 2 + 4) * k / 2, -k * s / 2], [(b.width / 2 + 4) * k / 2, k * s / 2], [-(b.width + 6) * k / 2, 0], [(b.width + 6) * k / 2, 0]);
      const ok = tries.find(([dx, dy]) => { const c = { x: box.x + dx, y: box.y + dy, w: box.w, h: box.h }; return inside(c) && !hit(c); });
      if (ok) {
        t.setAttribute('transform', `translate(${ok[0].toFixed(1)},${ok[1].toFixed(1)})`);
        if (Math.hypot(ok[0], ok[1]) > b.height * 1.5) {     // moved far: a thin leader line back to where the label belongs
          const cx = b.x + b.width / 2, cy = b.y + b.height / 2, nx = cx + ok[0], ny = cy + ok[1];
          const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          const f = 1 - (b.height * 0.6) / Math.hypot(ok[0], ok[1]);
          l.setAttribute('x1', cx); l.setAttribute('y1', cy); l.setAttribute('x2', (cx + ok[0] * f).toFixed(1)); l.setAttribute('y2', (cy + ok[1] * f).toFixed(1));
          l.setAttribute('stroke', t.getAttribute('fill') || '#999'); l.setAttribute('stroke-width', 1); l.setAttribute('stroke-dasharray', '2 2'); l.setAttribute('opacity', 0.7); l.setAttribute('class', 'rb-leader');
          svg.insertBefore(l, svg.firstChild);
        }
        box.x += ok[0]; box.y += ok[1];
      }
    }
    placed.push(box);
  });
};
(function () {
  const watch = (svg) => {
    let queued = false;
    const run = () => { queued = false; RB.declutter(svg); };
    new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(svg, { childList: true });
    run();
  };
  const start = () => document.querySelectorAll('svg#schema').forEach(watch);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
