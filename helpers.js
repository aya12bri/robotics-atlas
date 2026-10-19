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
  function controls(container, defs, onChange) {
    const vals = defs.map((d) => d.value);
    defs.forEach((d, i) => {
      const row = document.createElement('div');
      row.className = 'ctl';
      row.innerHTML =
        `<span class="ctl-name">${d.label}</span>` +
        `<input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}">` +
        `<input type="number" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}">` +
        `<span class="ctl-unit">${d.unit}</span>`;
      const range = row.querySelector('[type=range]');
      const num = row.querySelector('[type=number]');
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
      stroke: '#1b2633', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round'
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
window.RB = RB;