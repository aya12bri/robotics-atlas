// mk-dh3d.mjs — the 3D figures of the DH and DHM lessons (maths of robotics, lessons 6 and 7): the four parameters
// drawn between their two axes, and the 3-axis arm with all its frames. Drawn in a simple oblique projection:
// X to the right, Z up, Y into the page (drawn up and to the right), so "towards the reader" (−Y) goes down-left.
// Axis names use Unicode subscripts (zᵢ₋₁, xⱼ…) so that every label is one text node, translated like the rest.
import { tx, svgtx } from '../lib.mjs';

const ZC = '#3d8bff', XC = '#ff5c5c', PC = '#f59e0b', GC = '#9aa5b4';
const f = (v) => (+v).toFixed(1);
const add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, k) => a.map((v) => v * k);
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// rotate vector v around unit axis k by angle t (Rodrigues)
const rot = (v, k, t) => add(add(mul(v, Math.cos(t)), mul(cross(k, v), Math.sin(t))), mul(k, dot(k, v) * (1 - Math.cos(t))));
const D = Math.PI / 180;

function view(cx, cy, S) {
  const P = (p) => [cx + S * (p[0] + 0.42 * p[1]), cy - S * (p[2] + 0.26 * p[1])];
  const marker = (id, c) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`;
  return {
    P,
    defs: `<defs>${marker('dhz', ZC)}${marker('dhx', XC)}${marker('dhp', PC)}</defs>`,
    // an axis: a line from a to b, with an arrow
    arrow: (a, b, c, id, w = 2.4, dash) => { const [x1, y1] = P(a), [x2, y2] = P(b); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} marker-end="url(#${id})"/>`; },
    line: (a, b, c, w = 1.4, dash) => { const [x1, y1] = P(a), [x2, y2] = P(b); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`; },
    // text at a 3D point, shifted by (dx, dy) pixels
    text: (p, s, c, dx = 0, dy = 0, anchor = 'middle', size = 13, bold) => { const [x, y] = P(p); return `<text x="${f(x + dx)}" y="${f(y + dy)}" fill="${c}" font-size="${size}" text-anchor="${anchor}"${bold ? ' font-weight="700"' : ''}>${s}</text>`; },
    dot: (p, c, r = 3.5) => { const [x, y] = P(p); return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}"/>`; },
    // an arc of radius r around the unit axis k at centre o, from the unit direction u, by the angle t (with an arrow)
    arc: (o, k, u, t, r, c) => { let d = ''; for (let i = 0; i <= 24; i++) { const p = P(add(o, mul(rot(u, k, t * i / 24), r))); d += (i ? ' L' : 'M') + f(p[0]) + ',' + f(p[1]); } return `<path d="${d}" fill="none" stroke="${c}" stroke-width="2" marker-end="url(#dhp)"/>`; },
    // a dimension: a thin double line from a to b, with its value in the middle
    dim: (a, b, s, dx = 0, dy = 0) => { const [x1, y1] = P(a), [x2, y2] = P(b); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${PC}" stroke-width="3" stroke-linecap="round" opacity="0.85"/><text x="${f((x1 + x2) / 2 + dx)}" y="${f((y1 + y2) / 2 + dy)}" fill="${PC}" font-size="14" font-weight="700" text-anchor="middle">${s}</text>`; }
  };
}
// one legend row = two text nodes (the symbol, then its sentence), so that the sentence is translated as one piece
const legend = (x, y, rows) => rows.map(([sym, en, fr], k) => `<text x="${x}" y="${y + k * 19}" font-size="12.5" fill="${PC}" font-weight="700">${sym}</text><text x="${x + 44}" y="${y + k * 19}" font-size="12.5" fill="currentColor">${svgtx(en, fr)}</text>`).join('');
let FIGN = 0;
const figure = (vb, svg, cap) => { const id = 'f' + (++FIGN); svg = svg.replace(/(dh[zxp])\b/g, '$1' + id); return `<figure class="figure wide"><svg viewBox="${vb}" class="fig" role="img" aria-hidden="true" style="color:var(--text)">${svg}</svg><figcaption>${tx(...cap)}</figcaption></figure>`; };

// ---------------------------------------------------------------------------------------- the four parameters
// std = true: standard DH, row i (θᵢ, dᵢ on zᵢ₋₁ between xᵢ₋₁ and xᵢ; aᵢ, αᵢ on xᵢ between zᵢ₋₁ and zᵢ)
// std = false: modified DH, row j (αⱼ₋₁, aⱼ₋₁ on xⱼ₋₁ between zⱼ₋₁ and zⱼ; θⱼ, dⱼ on zⱼ between xⱼ₋₁ and xⱼ)
export function paramFig(std) {
  const V = view(150, 250, 150), th = 38 * D, al = 42 * D, a = 0.95, d = 0.62;
  const Z = [0, 0, 1], X = [1, 0, 0];
  let s = V.defs;
  if (std) {
    const O0 = [0, 0, 0], H = [0, 0, d], B = [a, 0, d], xprev = [Math.cos(th), -Math.sin(th), 0], zi = rot(Z, X, al);
    s += V.arrow([0, 0, -0.15], [0, 0, 1.25], ZC, 'dhz') + V.text([0, 0, 1.25], 'zᵢ₋₁', ZC, -8, -6, 'end', 14, true);
    s += V.dot(O0, '#7a8594', 3.5) + V.text(O0, 'Oᵢ₋₁', GC, -8, 16, 'end', 12);
    s += V.arrow(O0, mul(xprev, 0.62), XC, 'dhx') + V.text(mul(xprev, 0.62), 'xᵢ₋₁', XC, 6, 14, 'start', 14, true);
    s += V.line(H, add(H, mul(xprev, 0.42)), XC, 1.3, '5 4');                       // xᵢ₋₁ carried up to the height of xᵢ
    s += V.arrow(H, [a + 0.4, 0, d], XC, 'dhx') + V.text([a + 0.4, 0, d], 'xᵢ', XC, 8, 5, 'start', 14, true);
    s += V.line(add(B, mul(zi, -0.5)), B, ZC, 2.4) + V.arrow(B, add(B, mul(zi, 0.7)), ZC, 'dhz') + V.text(add(B, mul(zi, 0.7)), 'zᵢ', ZC, 8, -4, 'start', 14, true);
    s += V.line(B, add(B, [0, 0, 0.55]), ZC, 1.3, '5 4');                          // zᵢ₋₁ carried to the foot of zᵢ
    s += V.dot(B, '#7a8594', 3.5) + V.text(B, 'Oᵢ', GC, 10, 16, 'start', 12);
    s += V.dim([-0.06, 0, 0], [-0.06, 0, d], 'dᵢ', -18, 4);
    s += V.dim([0.04, 0, d + 0.05], [a - 0.04, 0, d + 0.05], 'aᵢ', 0, -10);
    s += V.arc(H, Z, xprev, th, 0.3, PC) + V.text(add(H, mul(rot(xprev, Z, th / 2), 0.36)), 'θᵢ', PC, 4, 16, 'start', 14, true);
    s += V.arc(B, X, Z, al, 0.36, PC) + V.text(add(B, mul(rot(Z, X, al / 2), 0.42)), 'αᵢ', PC, -2, -2, 'end', 14, true);
    s += legend(420, 40, [
      ['θᵢ', 'angle from xᵢ₋₁ to xᵢ, around zᵢ₋₁', 'angle de xᵢ₋₁ à xᵢ, autour de zᵢ₋₁'],
      ['dᵢ', 'distance from xᵢ₋₁ to xᵢ, along zᵢ₋₁', 'distance de xᵢ₋₁ à xᵢ, le long de zᵢ₋₁'],
      ['aᵢ', 'distance from zᵢ₋₁ to zᵢ, along xᵢ', 'distance de zᵢ₋₁ à zᵢ, le long de xᵢ'],
      ['αᵢ', 'angle from zᵢ₋₁ to zᵢ, around xᵢ', 'angle de zᵢ₋₁ à zᵢ, autour de xᵢ']
    ]);
    s += `<text x="420" y="132" font-size="12" fill="${GC}">${svgtx('θ, d: on the old z, between two x', 'θ, d : sur l\'ancien z, entre deux x')}</text><text x="420" y="150" font-size="12" fill="${GC}">${svgtx('a, α: on the new x, between two z', 'a, α : sur le nouvel x, entre deux z')}</text>`;
    return figure('0 0 790 300', s, ['Standard DH, row i: θ and d are measured on zᵢ₋₁ (between xᵢ₋₁ and xᵢ), a and α on xᵢ (between zᵢ₋₁ and zᵢ). Dashed: an axis moved parallel to itself, to show the angle.',
      'DH standard, ligne i : θ et d se mesurent sur zᵢ₋₁ (entre xᵢ₋₁ et xᵢ), a et α sur xᵢ (entre zᵢ₋₁ et zᵢ). En pointillés : un axe déplacé parallèlement à lui-même, pour montrer l\'angle.']);
  }
  // modified DH: xⱼ₋₁ goes from zⱼ₋₁ to zⱼ; on zⱼ, at the distance dⱼ, xⱼ leaves at the angle θⱼ
  const O = [0, 0, 0.35], B = [a, 0, 0.35], zj = rot(Z, X, al), C = add(B, mul(zj, d)), xj = rot(X, zj, th);
  s += V.arrow([0, 0, 0.05], [0, 0, 1.25], ZC, 'dhz') + V.text([0, 0, 1.25], 'zⱼ₋₁', ZC, -8, -6, 'end', 14, true);
  s += V.dot(O, '#7a8594', 3.5) + V.text(O, 'Oⱼ₋₁', GC, -8, 16, 'end', 12);
  s += V.arrow(O, [a + 0.32, 0, 0.35], XC, 'dhx') + V.text([a + 0.32, 0, 0.35], 'xⱼ₋₁', XC, 8, 16, 'start', 14, true);
  s += V.line(add(B, mul(zj, -0.3)), B, ZC, 2.4) + V.arrow(B, add(C, mul(zj, 0.45)), ZC, 'dhz') + V.text(add(C, mul(zj, 0.45)), 'zⱼ', ZC, 8, -4, 'start', 14, true);
  s += V.line(B, add(B, [0, 0, 0.55]), ZC, 1.3, '5 4');                            // zⱼ₋₁ carried to the foot of zⱼ
  s += V.line(C, add(C, mul(X, 0.42)), XC, 1.3, '5 4');                            // xⱼ₋₁ carried up to the height of xⱼ
  s += V.arrow(C, add(C, mul(xj, 0.62)), XC, 'dhx') + V.text(add(C, mul(xj, 0.62)), 'xⱼ', XC, 8, 4, 'start', 14, true);
  s += V.dot(C, '#7a8594', 3.5) + V.text(C, 'Oⱼ', GC, -12, 4, 'end', 12);
  s += V.dim([0.04, 0, 0.3], [a - 0.04, 0, 0.3], 'aⱼ₋₁', 0, 18);
  s += V.dim(add(B, [-0.07, 0, 0]), add(C, [-0.07, 0, 0]), 'dⱼ', -18, 2);
  s += V.arc(B, X, Z, al, 0.26, PC) + V.text(add(B, [0, 0, 0.26]), 'αⱼ₋₁', PC, 8, 2, 'start', 14, true);
  s += V.arc(C, zj, X, th, 0.3, PC) + V.text(add(C, mul(rot(X, zj, th / 2), 0.36)), 'θⱼ', PC, 8, 16, 'start', 14, true);
  s += legend(420, 40, [
    ['αⱼ₋₁', 'angle from zⱼ₋₁ to zⱼ, around xⱼ₋₁', 'angle de zⱼ₋₁ à zⱼ, autour de xⱼ₋₁'],
    ['aⱼ₋₁', 'distance from zⱼ₋₁ to zⱼ, along xⱼ₋₁', 'distance de zⱼ₋₁ à zⱼ, le long de xⱼ₋₁'],
    ['θⱼ', 'angle from xⱼ₋₁ to xⱼ, around zⱼ', 'angle de xⱼ₋₁ à xⱼ, autour de zⱼ'],
    ['dⱼ', 'distance from xⱼ₋₁ to xⱼ, along zⱼ', 'distance de xⱼ₋₁ à xⱼ, le long de zⱼ']
  ]);
  s += `<text x="420" y="132" font-size="12" fill="${GC}">${svgtx('α, a: on the old x, between two z', 'α, a : sur l\'ancien x, entre deux z')}</text><text x="420" y="150" font-size="12" fill="${GC}">${svgtx('θ, d: on the new z, between two x', 'θ, d : sur le nouveau z, entre deux x')}</text>`;
  s += `<text x="420" y="180" font-size="12" fill="${GC}">${svgtx('Khalil notation: αⱼ, dⱼ, θⱼ, rⱼ', 'Notation Khalil : αⱼ, dⱼ, θⱼ, rⱼ')}</text><text x="420" y="198" font-size="12" fill="${GC}">${svgtx('(their dⱼ = our aⱼ₋₁, their rⱼ = our dⱼ)', '(leur dⱼ = notre aⱼ₋₁, leur rⱼ = notre dⱼ)')}</text>`;
  return figure('0 0 790 300', s, ['Modified DH, row j: α and a are measured on xⱼ₋₁ (between zⱼ₋₁ and zⱼ), θ and d on zⱼ (between xⱼ₋₁ and xⱼ). Dashed: an axis moved parallel to itself, to show the angle.',
    'DH modifié, ligne j : α et a se mesurent sur xⱼ₋₁ (entre zⱼ₋₁ et zⱼ), θ et d sur zⱼ (entre xⱼ₋₁ et xⱼ). En pointillés : un axe déplacé parallèlement à lui-même, pour montrer l\'angle.']);
}

// ---------------------------------------------------------------------------------------- the 3-axis arm with its frames
// The arm drawn at its zero pose: joint 1 vertical, shoulder at 0.40 m, upper arm 0.45 m and forearm 0.38 m horizontal.
// Joints 2 and 3 turn around an axis that points towards the reader (−Y).
export function armFrames(std) {
  const V = view(170, 340, 380), sh = [0, 0, 0.4], el = [0.45, 0, 0.4], tool = [0.83, 0, 0.4], out = [0, -1, 0], L = 0.15;
  let s = V.defs;
  // the robot: floor, base, column, links, joints
  s += V.line([-0.15, 0, 0], [1.0, 0, 0], GC, 1.2, '6 5');
  s += V.line([0, 0, 0.02], [0, 0, 0.4], '#8b96a5', 9) + V.line(sh, el, '#8b96a5', 8) + V.line(el, tool, '#f5963a', 7);
  const joint = (p) => { const [x, y] = V.P(p); return `<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="#e8eef5"/>`; };
  s += joint(sh) + joint(el) + V.dot(tool, '#ff5c5c', 5);
  s += V.text([0, 0, 0.2], svgtx('joint 1', 'liaison 1'), GC, 12, 0, 'start', 12) + V.text(sh, svgtx('joint 2', 'liaison 2'), GC, 30, 46, 'start', 12) + V.text(el, svgtx('joint 3', 'liaison 3'), GC, 30, 46, 'start', 12) + V.text(tool, svgtx('tool', 'outil'), '#ff5c5c', 30, 46, 'start', 12);
  const frame = (o, z, x, nz, nx, dz = [6, 0], dx = [4, 14], name, dn = [-10, 16]) =>
    V.arrow(o, add(o, mul(z, L)), ZC, 'dhz') + V.text(add(o, mul(z, L)), nz, ZC, dz[0], dz[1], 'start', 13, true) +
    V.arrow(o, add(o, mul(x, L)), XC, 'dhx') + V.text(add(o, mul(x, L)), nx, XC, dx[0], dx[1], 'start', 13, true) +
    (name ? V.text(o, name, GC, dn[0], dn[1], 'end', 11) : '');
  const X = [1, 0, 0], Z = [0, 0, 1];
  if (std) {
    s += frame([0, 0, 0], Z, X, 'z₀', 'x₀', [6, 2], [4, 14], 'O₀');
    s += frame(sh, out, X, 'z₁', 'x₁', [-22, 8], [-2, -8], 'O₁', [-12, -10]);
    s += frame(el, out, X, 'z₂', 'x₂', [-22, 8], [-2, -8], 'O₂', [-6, 22]);
    s += frame(tool, out, X, 'z₃', 'x₃', [-22, 8], [-2, -8]);
    s += V.dim([-0.05, 0, 0], [-0.05, 0, 0.4], svgtx('d₁ = 0.40', 'd₁ = 0,40'), -40, 4);
    s += V.dim([0.02, 0, 0.47], [0.43, 0, 0.47], svgtx('a₂ = 0.45', 'a₂ = 0,45'), 0, -10) + V.dim([0.47, 0, 0.47], [0.81, 0, 0.47], svgtx('a₃ = 0.38', 'a₃ = 0,38'), 0, -10);
    s += V.arc(sh, X, Z, 90 * D, 0.09, PC) + V.text(add(sh, [0, -0.05, 0.12]), 'α₁ = 90°', PC, -18, -8, 'end', 13, true);
    return figure('0 0 680 370', s, ['The 3-axis arm at its zero pose, with the frames of standard DH. Each zᵢ₋₁ is on joint i (z₀ vertical on joint 1; z₁, z₂ towards you on joints 2 and 3); each xᵢ goes from zᵢ₋₁ to zᵢ; frame 3 is on the tool.',
      'Le bras à 3 axes dans sa pose zéro, avec les repères du DH standard. Chaque zᵢ₋₁ est sur la liaison i (z₀ vertical sur la liaison 1 ; z₁, z₂ vers vous sur les liaisons 2 et 3) ; chaque xᵢ va de zᵢ₋₁ à zᵢ ; le repère 3 est sur l\'outil.']);
  }
  s += frame([0, 0, 0], Z, X, 'z₀', 'x₀', [6, 2], [4, 14], 'O₀');
  s += frame(sh, Z, X, 'z₁', 'x₁', [6, 2], [8, 22], 'O₁ = O₂', [-14, -8]);
  s += frame(sh, out, X, 'z₂', 'x₂', [-22, 8], [8, 8]);
  s += frame(el, out, X, 'z₃', 'x₃', [-22, 8], [-2, -8], 'O₃', [-6, 22]);
  s += frame(tool, out, X, 'zₑ', 'xₑ', [-22, 8], [-2, -8]);
  s += V.dim([-0.05, 0, 0], [-0.05, 0, 0.4], svgtx('d₁ = 0.40', 'd₁ = 0,40'), -40, 4);
  s += V.dim([0.02, 0, 0.47], [0.43, 0, 0.47], svgtx('a₂ = 0.45', 'a₂ = 0,45'), 0, -10) + V.dim([0.47, 0, 0.47], [0.81, 0, 0.47], svgtx('a₃ = 0.38', 'a₃ = 0,38'), 0, -10);
  s += V.arc(sh, X, Z, 90 * D, 0.09, PC) + V.text(add(sh, [0, -0.05, 0.12]), 'α₁ = 90°', PC, -18, -8, 'end', 13, true);
  return figure('0 0 680 370', s, ['The same arm with the frames of modified DH. Each zⱼ is on joint j itself (z₁ vertical on joint 1; z₂, z₃ towards you on joints 2 and 3); each xⱼ goes from zⱼ to zⱼ₊₁; frames 1 and 2 share the same origin at the shoulder; a fixed frame E is added on the tool.',
    'Le même bras avec les repères du DH modifié. Chaque zⱼ est sur la liaison j elle-même (z₁ vertical sur la liaison 1 ; z₂, z₃ vers vous sur les liaisons 2 et 3) ; chaque xⱼ va de zⱼ à zⱼ₊₁ ; les repères 1 et 2 ont la même origine, à l\'épaule ; un repère fixe E est ajouté sur l\'outil.']);
}

// ---------------------------------------------------------------------------------------- step-by-step demonstration
// Five pictures of the same 3-axis arm: at each step the new axes appear, with a yellow halo; what was drawn before stays.
// std = true: standard DH; false: modified DH. On the page a small script (learn-more-widgets.js) shows one step at a time.
export function dhSteps(std) {
  const V = view(120, 395, 470), sh = [0, 0, 0.4], el = [0.45, 0, 0.4], tool = [0.83, 0, 0.4], out = [0, -1, 0], X = [1, 0, 0], Z = [0, 0, 1];
  const LZ = 0.16, LO = 0.3, HL = '#ffd23f';
  const halo = (a, b) => { const [x1, y1] = V.P(a), [x2, y2] = V.P(b); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${HL}" stroke-width="12" stroke-linecap="round" opacity="0.55"/>`; };
  const ax = (o, d, len, c, id, name, dx, dy, cur) => { const e = add(o, mul(d, len)); return (cur ? halo(o, e) : '') + V.arrow(o, e, c, id, 3) + V.text(e, name, c, dx, dy, 'start', 17, true); };
  const zA = (o, d, name, cur, dx = 8, dy = 4) => ax(o, d, d === out ? LO : LZ, ZC, 'dhz', name, dx, dy, cur);
  const xA = (o, name, cur, dx = 4, dy = -8) => ax(o, X, LZ, XC, 'dhx', name, dx, dy, cur);
  const org = (p, name, cur, dx, dy, anchor = 'end') => { const [x, y] = V.P(p); return (cur ? `<circle cx="${f(x)}" cy="${f(y)}" r="11" fill="${HL}" opacity="0.6"/>` : '') + `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="#2b3340" stroke="#fff" stroke-width="1.5"/>` + V.text(p, name, '#5d6878', dx, dy, anchor, 15, true); };
  // the robot and the axes of its joints (dashed): this is what you start from
  const robot = () => {
    let s = V.line([-0.2, 0, 0], [1.05, 0, 0], GC, 1.2, '6 5');
    s += V.line([0, 0, 0.02], sh, '#8b96a5', 14) + V.line(sh, el, '#8b96a5', 12) + V.line(el, tool, '#f5963a', 10);
    const jt = (p) => { const [x, y] = V.P(p); return `<circle cx="${f(x)}" cy="${f(y)}" r="12" fill="#262c35" stroke="#e8eef5" stroke-width="2"/><circle cx="${f(x)}" cy="${f(y)}" r="3.5" fill="#e8eef5"/>`; };
    s += jt(sh) + jt(el) + V.dot(tool, '#ff5c5c', 6);
    s += V.line([0, 0, -0.03], [0, 0, 0.66], '#7d8796', 1.4, '3 5') + V.line([0, 0.45, 0.4], [0, -0.55, 0.4], '#7d8796', 1.4, '3 5') + V.line([0.45, 0.45, 0.4], [0.45, -0.55, 0.4], '#7d8796', 1.4, '3 5');
    s += V.text([0, 0, 0.66], svgtx('axis of joint 1', 'axe de la liaison 1'), '#7d8796', 8, 4, 'start', 13);
    s += V.text([0, 0.45, 0.4], svgtx('axis of joint 2', 'axe de la liaison 2'), '#7d8796', 6, -4, 'start', 13);
    s += V.text([0.45, 0.45, 0.4], svgtx('axis of joint 3', 'axe de la liaison 3'), '#7d8796', 6, -4, 'start', 13);
    s += V.text(tool, svgtx('tool', 'outil'), '#ff5c5c', 10, 22, 'start', 14);
    return s;
  };
  const title = (k, en, fr) => `<text x="14" y="28" font-size="18" font-weight="700" fill="currentColor">${svgtx(`Step ${k} / 5: ${en}`, `Étape ${k} / 5 : ${fr}`)}</text>`;
  // what each step adds, step by step (k = the step being shown)
  const draw = (k) => {
    let s = V.defs + robot();
    if (std) {
      s += zA([0, 0, 0.02], Z, 'z₀', k === 1, 8, 4) + zA(sh, out, 'z₁', k === 1, -30, 14) + zA(el, out, 'z₂', k === 1, -30, 14);
      if (k >= 2) s += xA(sh, 'x₁', k === 2, 4, -10) + xA(el, 'x₂', k === 2, 4, -10);
      if (k === 2) s += V.line(add(sh, [0.02, 0, 0.05]), add(el, [-0.02, 0, 0.05]), HL, 4) + V.text([0.22, 0, 0.45], svgtx('common perpendicular of z₁ and z₂', 'perpendiculaire commune de z₁ et z₂'), '#b58900', 0, -8, 'middle', 13, true);
      if (k >= 3) s += org(sh, 'O₁', k === 3, -14, -12) + org(el, 'O₂', k === 3, -8, -16);
      if (k >= 4) s += xA([0, 0, 0.02], 'x₀', k === 4, 4, 18) + org([0, 0, 0.02], 'O₀', k === 4, -12, 18);
      if (k >= 5) s += zA(tool, out, 'z₃', k === 5, -30, 14) + xA(tool, 'x₃', k === 5, 4, -10) + org(tool, 'O₃', k === 5, 2, -16, 'middle');
    } else {
      s += zA(sh, Z, 'z₁', k === 1, 8, 4) + zA(sh, out, 'z₂', k === 1, -30, 14) + zA(el, out, 'z₃', k === 1, -30, 14);
      if (k >= 2) s += xA(sh, 'x₁ x₂', k === 2, 4, -10);
      if (k === 2) s += V.line(add(sh, [0.02, 0, 0.05]), add(el, [-0.02, 0, 0.05]), HL, 4) + V.text([0.22, 0, 0.45], svgtx('common perpendicular of z₂ and z₃', 'perpendiculaire commune de z₂ et z₃'), '#b58900', 0, -8, 'middle', 13, true);
      if (k >= 3) s += org(sh, 'O₁ = O₂', k === 3, -14, -12);
      if (k >= 4) s += zA([0, 0, 0.02], Z, 'z₀', k === 4, 8, 4) + xA([0, 0, 0.02], 'x₀', k === 4, 4, 18) + org([0, 0, 0.02], 'O₀', k === 4, -12, 18);
      if (k >= 5) s += xA(el, 'x₃', k === 5, 4, -10) + org(el, 'O₃', k === 5, -8, -16) + zA(tool, out, 'zₑ', k === 5, -30, 14) + xA(tool, 'xₑ', k === 5, 4, -10) + org(tool, 'E', k === 5, 2, -16, 'middle');
    }
    return s;
  };
  const T = std ? [
    ['the z axes', 'les axes z', 'Draw the axis of each joint first (dashed). z₀ goes on the axis of joint 1 (vertical), z₁ on the axis of joint 2 and z₂ on the axis of joint 3 (both towards you): zᵢ₋₁ is on joint i.', 'Tracez d\'abord l\'axe de chaque liaison (pointillés). z₀ va sur l\'axe de la liaison 1 (vertical), z₁ sur l\'axe de la liaison 2 et z₂ sur l\'axe de la liaison 3 (tous deux vers vous) : zᵢ₋₁ est sur la liaison i.'],
    ['the x axes', 'les axes x', 'z₀ and z₁ cross at the shoulder: x₁ goes through that point, perpendicular to both (to the right). z₁ and z₂ are parallel: x₂ is the common perpendicular (yellow) that goes from z₁ to z₂, along the upper arm.', 'z₀ et z₁ se coupent à l\'épaule : x₁ passe par ce point, perpendiculaire aux deux (vers la droite). z₁ et z₂ sont parallèles : x₂ est la perpendiculaire commune (en jaune) qui va de z₁ à z₂, le long du bras.'],
    ['the origins', 'les origines', 'O₁ is where x₁ meets z₁: the shoulder. O₂ is where x₂ meets z₂: the elbow.', 'O₁ est le point où x₁ rencontre z₁ : l\'épaule. O₂ est le point où x₂ rencontre z₂ : le coude.'],
    ['frame 0 (base)', 'le repère 0 (base)', 'O₀ on z₀, on the floor. x₀ to the right, in the direction of x₁, so that θ₁ = 0 in this pose.', 'O₀ sur z₀, au sol. x₀ vers la droite, dans le sens de x₁, pour que θ₁ = 0 dans cette pose.'],
    ['the tool frame', 'le repère de l\'outil', 'O₃ on the tool, z₃ parallel to z₂, x₃ from z₂ towards the tool. The drawing is finished: now read the table (θ, d on each old z; a, α on each new x).', 'O₃ sur l\'outil, z₃ parallèle à z₂, x₃ de z₂ vers l\'outil. Le dessin est fini : lisez maintenant le tableau (θ, d sur chaque ancien z ; a, α sur chaque nouvel x).']
  ] : [
    ['the z axes', 'les axes z', 'Draw the axis of each joint first (dashed). Each z takes the number of its own joint: z₁ on joint 1 (vertical), z₂ on joint 2 and z₃ on joint 3 (towards you).', 'Tracez d\'abord l\'axe de chaque liaison (pointillés). Chaque z prend le numéro de sa propre liaison : z₁ sur la liaison 1 (vertical), z₂ sur la liaison 2 et z₃ sur la liaison 3 (vers vous).'],
    ['the x axes', 'les axes x', 'z₁ and z₂ cross at the shoulder: x₁ goes through that point, perpendicular to both (to the right). z₂ and z₃ are parallel: x₂ is the common perpendicular (yellow) from z₂ to z₃, along the upper arm.', 'z₁ et z₂ se coupent à l\'épaule : x₁ passe par ce point, perpendiculaire aux deux (vers la droite). z₂ et z₃ sont parallèles : x₂ est la perpendiculaire commune (en jaune) de z₂ à z₃, le long du bras.'],
    ['the origins', 'les origines', 'O₁ = where x₁ meets z₁, O₂ = where x₂ meets z₂: both are at the shoulder, so frames 1 and 2 have the same origin.', 'O₁ = où x₁ rencontre z₁, O₂ = où x₂ rencontre z₂ : les deux sont à l\'épaule, donc les repères 1 et 2 ont la même origine.'],
    ['frame 0 (base)', 'le repère 0 (base)', 'z₀ on the same line as z₁, O₀ on the floor, x₀ to the right like x₁.', 'z₀ sur la même droite que z₁, O₀ au sol, x₀ vers la droite comme x₁.'],
    ['the last frame and the tool', 'le dernier repère et l\'outil', 'There is no z₄: x₃ points towards the tool and O₃ is at the elbow. The tool frame E sits on the gripper: it gives the fixed row of the table.', 'Il n\'y a pas de z₄ : x₃ va vers l\'outil et O₃ est au coude. Le repère E de l\'outil est posé sur la pince : il donne la ligne fixe du tableau.']
  ];
  const figs = T.map(([te, tf, ce, cf], k) => `<figure class="figure wide step"><svg viewBox="0 0 660 430" class="fig" role="img" aria-hidden="true" style="color:var(--text)">${(title(k + 1, te, tf) + draw(k + 1)).replace(/(dh[zxp])\b/g, `$1${std ? 's' : 'm'}${k}`)}</svg><figcaption>${tx(ce, cf)}</figcaption></figure>`).join('');
  return `<div class="steps">${figs}</div>`;
}

// ---------------------------------------------------------------------------------------- the common perpendicular, case by case
// One small 3D drawing per case: the two joint axes zᵢ₋₁ and zᵢ (blue), the common perpendicular (yellow) and the xᵢ placed on it (red).
// items = the texts of the cases ([en, fr] each, in the order skew, crossing, parallel, same axis, prismatic).
export function perpCases(items) {
  const HL = '#ffd23f';
  const draw = (k) => {
    const V = view(50, 190, 205);
    const seg = (a, b, c, w, dash) => V.line(a, b, c, w, dash);
    const halo = (a, b) => { const [x1, y1] = V.P(a), [x2, y2] = V.P(b); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${HL}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`; };
    const zax = (a, b, name, dx = 6, dy = 4) => V.arrow(a, b, ZC, 'dhz', 3) + V.text(b, name, ZC, dx, dy, 'start', 15, true);
    const xax = (a, b, name, dx = 4, dy = -8) => halo(a, b) + V.arrow(a, b, XC, 'dhx', 3) + V.text(b, name, XC, dx, dy, 'start', 15, true);
    const dot = (p, name, dx = -8, dy = 16) => V.dot(p, '#2b3340', 4) + (name ? V.text(p, name, '#5d6878', dx, dy, 'end', 13, true) : '');
    let s = V.defs;
    if (k === 0) {        // skew: vertical, and horizontal going into the page, 0.6 to the right
      s += zax([0, 0, 0], [0, 0, 0.8], 'zᵢ₋₁') + seg([0.6, 0.55, 0.5], [0.6, -0.15, 0.5], ZC, 1.4, '4 4') + zax([0.6, -0.15, 0.5], [0.6, 0.55, 0.5], 'zᵢ');
      s += xax([0, 0, 0.5], [0.6, 0, 0.5], 'xᵢ', -6, -10) + dot([0, 0, 0.5], 'Oᵢ₋₁') + dot([0.6, 0, 0.5]) + V.text([0.3, 0, 0.5], 'aᵢ > 0', PC, 0, 20, 'middle', 13, true);
    } else if (k === 1) { // crossing: vertical, and horizontal through it
      s += zax([0, 0, 0], [0, 0, 0.8], 'zᵢ₋₁') + seg([0, 0.6, 0.5], [0, -0.3, 0.5], ZC, 1.4, '4 4') + zax([0, -0.3, 0.5], [0, 0.6, 0.5], 'zᵢ');
      s += xax([0, 0, 0.5], [0.55, 0, 0.5], 'xᵢ') + dot([0, 0, 0.5]) + V.text([0.3, 0, 0.5], 'aᵢ = 0', PC, 0, 20, 'middle', 13, true);
    } else if (k === 2) { // parallel: two verticals; many perpendiculars (dashed), the one through Oᵢ₋₁ is chosen
      s += zax([0, 0, 0], [0, 0, 0.8], 'zᵢ₋₁') + zax([0.6, 0, 0], [0.6, 0, 0.8], 'zᵢ');
      [0.12, 0.66].forEach((h) => { s += seg([0, 0, h], [0.6, 0, h], '#9aa5b4', 1.4, '4 4'); });
      s += xax([0, 0, 0.4], [0.6, 0, 0.4], 'xᵢ', -6, -10) + dot([0, 0, 0.4], 'Oᵢ₋₁') + V.text([0.3, 0, 0.4], 'dᵢ = 0', PC, 0, 20, 'middle', 13, true);
    } else if (k === 3) { // same axis: one vertical line, xᵢ any perpendicular
      s += zax([0, 0, 0], [0, 0, 0.45], 'zᵢ₋₁', -42, 26) + zax([0, 0, 0.5], [0, 0, 0.8], 'zᵢ');
      s += seg([0, 0, 0.5], [-0.3, 0.5, 0.5], '#9aa5b4', 1.4, '4 4') + seg([0, 0, 0.5], [0, 0.6, 0.5], '#9aa5b4', 1.4, '4 4');
      s += xax([0, 0, 0.5], [0.55, 0, 0.5], 'xᵢ') + dot([0, 0, 0.5]) + V.text([0.3, 0, 0.5], svgtx('any one', 'au choix'), PC, 0, 20, 'middle', 13, true);
    } else {              // prismatic: only the direction counts; the line is moved to pass through the origin
      s += seg([0.55, -0.2, 0.05], [0.55, -0.2, 0.85], '#9aa5b4', 2, '5 4') + V.text([0.55, -0.2, 0.85], svgtx('slide', 'glissière'), '#7d8796', 6, 0, 'start', 12);
      s += V.arrow([0.48, -0.2, 0.45], [0.12, 0, 0.45], PC, 'dhp', 2) + zax([0, 0, 0], [0, 0, 0.8], 'zᵢ', 8, 4) + dot([0, 0, 0.1], 'Oᵢ₋₁', -8, 4);
      s += V.text([0.3, -0.1, 0.45], svgtx('moved parallel', 'déplacée parallèlement'), PC, 0, 24, 'middle', 12, true);
    }
    return s.replace(/(dh[zxp])\b/g, `$1c${k}`);
  };
  return `<div class="cases">${items.map((it, k) => `<figure class="case"><svg viewBox="0 0 270 210" role="img" aria-hidden="true" style="color:var(--text)">${draw(k)}</svg><figcaption>${tx(it[0], it[1])}</figcaption></figure>`).join('')}</div>`;
}
