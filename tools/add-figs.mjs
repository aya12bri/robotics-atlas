// add-figs.mjs — puts the explanatory drawings of tools/content/mk-figs.mjs (and the arm of mk-dh3d.mjs) into the hand-written
// course pages (learn-model.html…), at the end of the named sections, and adds their French to the page dictionary.
// Each drawing is marked data-gen="<name>", so running the script again replaces it instead of adding a copy.
//   node tools/add-figs.mjs
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const { REG, SVGREG } = await import(root + 'tools/lib.mjs');
const F = await import(root + 'tools/content/mk-figs.mjs');
const { dhSteps } = await import(root + 'tools/content/mk-dh3d.mjs');
function hash(str) { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); }
const norm = (s) => s.replace(/\s+/g, ' ').trim();
// page → [section title (start of the h4 text), name, drawing]
const PLAN = {
  'learn-model.html': [
    ['1.3 The three elementary rotations', 'rot3', () => F.rot3Fig()],
    ['2.1 Euler angles', 'euler', () => F.eulerFig()],
    ['2.2 Cardan angles', 'rpy', () => F.rpyFig()],
    ['3.4 Composition and inverse', 'chain', () => F.chainFig()],
    ['4.2 The rules to place the frames', 'dhm-arm', () => dhSteps(false, true)],
    ['6.2 MGI of the SCARA', 'ik2', () => F.ikFig()],
    ['8.1 The direct kinematic model', 'jac', () => F.jacFig(true)],
    ['9.5 Sine-squared speed law', 'sinlaw', () => F.sinLawFig()]
  ]
};
for (const [page, items] of Object.entries(PLAN)) {
  let t = fs.readFileSync(root + page, 'utf8');
  REG.clear(); SVGREG.clear();
  for (const [title, name, make] of items) {
    const html = make().replace(/^<(figure|div)/, `<$1 data-gen="${name}"`);
    const old = t.indexOf(`data-gen="${name}"`);
    if (old >= 0) { const s = t.lastIndexOf('<', old), e = t.indexOf(html.startsWith('<div') ? '</div></div>' : '</figure>', old) + (html.startsWith('<div') ? 12 : 9); t = t.slice(0, s) + html + t.slice(e); continue; }
    const h = t.indexOf('<h4>' + title); if (h < 0) { console.log('section not found', page, title); continue; }
    const next = Math.min(...['<h4', '<h3'].map((k) => { const i = t.indexOf(k, h + 4); return i < 0 ? Infinity : i; }));
    t = t.slice(0, next) + html + '\n' + t.slice(next);
  }
  fs.writeFileSync(root + page, t);
  const dictFile = root + 'i18n/fr-' + page.replace('.html', '.js');
  let d = fs.readFileSync(dictFile, 'utf8'); const add = [];
  for (const [en, fr] of [...REG, ...SVGREG]) { if (en === fr) continue; const k = hash(norm(en)); if (!d.includes(`"${k}"`)) add.push(`"${k}": ${JSON.stringify(fr)}`); }
  if (add.length) d = d.replace('RA.add({\n', 'RA.add({\n' + add.join(',\n') + ',\n');
  fs.writeFileSync(dictFile, d);
  console.log(page, 'drawings', items.length, 'new translations', add.length);
}
