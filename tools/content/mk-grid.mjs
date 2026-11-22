// mk-grid.mjs — a graduated grid for the figures of the maths kit: light squares, numbered axes, origin O.
// X(u), Y(v) turn units into pixels. Axis names are plain letters (the same in English and French).
export function grid({ OX, OY, U, x0 = 0, x1, y0 = 0, y1, nx = 'x', ny = 'y', col = 'currentColor' }) {
  const X = (u) => OX + u * U, Y = (v) => OY - v * U;
  let s = '<defs><marker id="mkg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>';
  for (let u = x0; u <= x1; u++) s += `<line x1="${X(u)}" y1="${Y(y0)}" x2="${X(u)}" y2="${Y(y1)}" stroke="currentColor" stroke-opacity="0.1"/>`;
  for (let v = y0; v <= y1; v++) s += `<line x1="${X(x0)}" y1="${Y(v)}" x2="${X(x1)}" y2="${Y(v)}" stroke="currentColor" stroke-opacity="0.1"/>`;
  s += `<line x1="${X(x0)}" y1="${Y(0)}" x2="${X(x1 + 0.5)}" y2="${Y(0)}" stroke="${col}" stroke-opacity="0.75" stroke-width="1.6" marker-end="url(#mkg)"/>`;
  s += `<line x1="${X(0)}" y1="${Y(y0)}" x2="${X(0)}" y2="${Y(y1 + 0.5)}" stroke="${col}" stroke-opacity="0.75" stroke-width="1.6" marker-end="url(#mkg)"/>`;
  for (let u = x0; u <= x1; u++) if (u) s += `<line x1="${X(u)}" y1="${Y(0) - 4}" x2="${X(u)}" y2="${Y(0) + 4}" stroke="currentColor" stroke-opacity="0.6"/><text x="${X(u)}" y="${Y(0) + 18}" text-anchor="middle" font-size="13" fill="currentColor" opacity="0.7">${u < 0 ? '−' + -u : u}</text>`;
  for (let v = y0; v <= y1; v++) if (v) s += `<line x1="${X(0) - 4}" y1="${Y(v)}" x2="${X(0) + 4}" y2="${Y(v)}" stroke="currentColor" stroke-opacity="0.6"/><text x="${X(0) - 9}" y="${Y(v) + 4}" text-anchor="end" font-size="13" fill="currentColor" opacity="0.7">${v < 0 ? '−' + -v : v}</text>`;
  s += `<text x="${X(x1 + 0.6)}" y="${Y(0) + 5}" font-size="16" font-weight="700" fill="currentColor">${nx}</text><text x="${X(0) - 8}" y="${Y(y1 + 0.55)}" text-anchor="end" font-size="16" font-weight="700" fill="currentColor">${ny}</text>`;
  s += `<text x="${X(0) - 8}" y="${Y(0) + 18}" text-anchor="end" font-size="14" fill="currentColor" opacity="0.8">O</text>`;
  return { s, X, Y };
}
