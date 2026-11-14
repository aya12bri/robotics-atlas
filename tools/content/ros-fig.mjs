// Small block diagrams for the ROS 2 course. Labels are [en, fr] pairs (translated) or plain strings (technical names, the same in both languages).
import { svgtx, SVGREG } from '../lib.mjs';
const t = (s) => { if (Array.isArray(s)) return svgtx(s[0], s[1]); if (!SVGREG.has(s)) svgtx(s); return s; };
export const ARR = '<defs><marker id="rosar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#9aa7b6"/></marker></defs>';
export const node = (x, y, w, name) => `<ellipse class="pn" cx="${x}" cy="${y}" rx="${w / 2}" ry="20"/><text x="${x}" y="${y + 4}" text-anchor="middle">${t(name)}</text>`;
export const box = (x, y, w, name, sub) => `<rect class="pn" x="${x - w / 2}" y="${y - 20}" width="${w}" height="40" rx="6"/><text x="${x}" y="${y + (sub ? -2 : 4)}" text-anchor="middle" class="c-l">${t(name)}</text>${sub ? `<text x="${x}" y="${y + 12}" text-anchor="middle" class="sm">${t(sub)}</text>` : ''}`;
export const arrow = (x1, y1, x2, y2) => `<line class="ax" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#rosar)"/>`;
export const lab = (x, y, s, cls = '') => `<text x="${x}" y="${y}" text-anchor="middle"${cls ? ` class="${cls}"` : ''}>${t(s)}</text>`;
