// add-axes.mjs — inserts the "six axes, one by one" section (drawn SVG + table) in articulated.html and its French texts.
// Idempotent: node tools/add-axes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, SVGREG, reset, tx, svgtx, P, TABLE, FIG } from './lib.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');

reset();
const C = { 1: '#2f6bff', 2: '#2e9e5b', 3: '#ff9f43', 4: '#8a5cf6', 5: '#ff5a5f', 6: '#1fb5c9' };
const tag = (n, x, y, label) => `<circle cx="${x}" cy="${y}" r="12" fill="${C[n]}"/><text x="${x}" y="${y + 4}" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:11px">J${n}</text>` + (label ? `<text x="${x + (label[2] || 18)}" y="${y + 4}" text-anchor="${label[3] || 'start'}">${svgtx(label[0], label[1])}</text>` : '');
const arc = (n, d) => `<path d="${d}" fill="none" stroke="${C[n]}" stroke-width="3" stroke-linecap="round"/>`;
const svg = FIG('0 0 640 420', `
  <line class="ax" x1="20" y1="402" x2="620" y2="402"/>
  <rect x="180" y="378" width="140" height="24" rx="4" fill="#3a3a3a" stroke="#9aa7b6"/>
  <rect x="200" y="352" width="100" height="28" rx="6" fill="#4a4a4a" stroke="#9aa7b6"/>
  ${arc(1, 'M 190 372 A 70 14 0 0 0 310 372')}
  <polyline points="250,352 262,300" stroke="#e8761f" stroke-width="30" stroke-linecap="round" fill="none"/>
  <polyline points="262,300 262,150" stroke="#ff9f43" stroke-width="22" stroke-linecap="round" fill="none"/>
  <polyline points="262,150 410,168" stroke="#ff9f43" stroke-width="18" stroke-linecap="round" fill="none"/>
  <polyline points="410,168 446,176" stroke="#c8c8c8" stroke-width="14" stroke-linecap="round" fill="none"/>
  <polyline points="446,176 462,226" stroke="#9aa7b6" stroke-width="12" stroke-linecap="round" fill="none"/>
  <polyline points="450,238 450,256 474,256 474,238 M 450,256 l-4 0 M 474,256 l4 0" stroke="#cfd8e3" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${arc(2, 'M 232 288 A 34 34 0 0 1 290 270')}
  ${arc(3, 'M 238 134 A 30 30 0 0 1 292 130')}
  ${arc(4, 'M 418 150 A 8 18 0 0 1 418 186')}
  ${arc(5, 'M 430 160 A 28 28 0 0 1 462 190')}
  ${arc(6, 'M 446 218 A 22 6 0 1 0 478 218')}
  ${tag(1, 250, 366, ['Base rotation', 'Rotation de la base', 70])}
  ${tag(2, 262, 300, ['Shoulder', 'Épaule', 28])}
  ${tag(3, 262, 150)}<text x="262" y="112" text-anchor="middle">${svgtx('Elbow', 'Coude')}</text>
  ${tag(4, 410, 168)}<text x="410" y="128" text-anchor="middle">${svgtx('Wrist roll', 'Roulis du poignet')}</text>
  ${tag(5, 446, 176, ['Wrist pitch', 'Tangage du poignet', 18])}
  ${tag(6, 462, 226, ['Tool rotation', 'Rotation de l\'outil', 18])}
  <text x="60" y="60">${svgtx('J1-J3 place the wrist centre', 'J1-J3 placent le centre du poignet')}</text>
  <text x="60" y="80">${svgtx('J4-J6 orient the tool', 'J4-J6 orientent l\'outil')}</text>`);

const section = `
    <h2 id="axes">${tx('The six axes, one by one', 'Les six axes, un par un')}</h2>
    ${P('A 6-axis robot is a chain of six rotary joints. Each one has its own servo motor, gearbox and brake inside the arm, and the cables run through the hollow links. The first three axes (J1-J3, the <strong>arm</strong>) place the wrist centre; the last three (J4-J6, the <strong>wrist</strong>) orient the tool.', 'Un robot 6 axes est une chaîne de six articulations rotoïdes. Chacune a son propre servomoteur, réducteur et frein à l\'intérieur du bras, et les câbles passent dans les corps creux. Les trois premiers axes (J1-J3, le <strong>bras</strong>) placent le centre du poignet ; les trois derniers (J4-J6, le <strong>poignet</strong>) orientent l\'outil.')}
    ${svg}
    ${TABLE([['Axis', 'Axe'], ['Name', 'Nom'], ['Movement', 'Mouvement'], ['Group', 'Groupe']], [
      ['J1', ['Base rotation', 'Rotation de la base'], ['Turns the whole robot around its vertical axis.', 'Fait tourner tout le robot autour de son axe vertical.'], ['Arm: position', 'Bras : position']],
      ['J2', ['Shoulder', 'Épaule'], ['Tilts the upper arm forward and backward.', 'Incline le bras vers l\'avant et vers l\'arrière.'], ['Arm: position', 'Bras : position']],
      ['J3', ['Elbow', 'Coude'], ['Extends or folds the forearm.', 'Étend ou replie l\'avant-bras.'], ['Arm: position', 'Bras : position']],
      ['J4', ['Wrist roll', 'Roulis du poignet'], ['Rotates the wrist assembly around the forearm axis.', 'Fait tourner l\'ensemble du poignet autour de l\'axe de l\'avant-bras.'], ['Wrist: orientation', 'Poignet : orientation']],
      ['J5', ['Wrist pitch', 'Tangage du poignet'], ['Tilts the tool up and down.', 'Incline l\'outil vers le haut et vers le bas.'], ['Wrist: orientation', 'Poignet : orientation']],
      ['J6', ['Tool rotation', 'Rotation de l\'outil'], ['Spins the tool or gripper around its own axis.', 'Fait tourner l\'outil ou la pince autour de son propre axe.'], ['Wrist: orientation', 'Poignet : orientation']]
    ])}
    ${P('When J5 = 0, axes J4 and J6 line up: that is the wrist singularity (see the course on singularities).', 'Quand J5 = 0, les axes J4 et J6 s\'alignent : c\'est la singularité de poignet (voir le cours sur les singularités).')}
`;
const file = path.join(root, 'articulated.html');
let h = fs.readFileSync(file, 'utf8');
if (h.indexOf('id="axes"') < 0) {
  h = h.replace('    <h2>The spherical wrist</h2>', section + '\n    <h2>The spherical wrist</h2>');
  fs.writeFileSync(file, h);
}
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await (await browser.newContext()).newPage();
await page.goto(pathToFileURL(path.join(root, 'articulated.html')).href);
await page.waitForFunction(() => window.RA && RA.hash);
const pairs = [...REG.entries()];
const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), pairs.map((p) => p[0]));
const dict = {}; pairs.forEach(([en, fr], i) => { dict[keys[i]] = fr; });
for (const [en, fr] of SVGREG) dict[await page.evaluate((k) => RA.hash(k), en.replace(/\s+/g, ' ').trim())] = fr;
await browser.close();
const f = path.join(root, 'i18n', 'fr-articulated.js');
let s = fs.readFileSync(f, 'utf8').replace(/\n?\/\/ BEGIN axes[\s\S]*?\/\/ END axes\n?/, '\n');
s = s.trimEnd() + `\n// BEGIN axes (generated by tools/add-axes.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n// END axes\n`;
fs.writeFileSync(f, s);
console.log('texts', pairs.length, 'svg', SVGREG.size);
