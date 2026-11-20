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
const figure = (vb, svg, cap) => `<figure class="figure"><svg viewBox="${vb}" class="fig" role="img" aria-hidden="true" style="color:var(--text)">${svg}</svg><figcaption>${tx(...cap)}</figcaption></figure>`;

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
