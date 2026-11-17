// build-search.mjs — builds search-index.js, the index of the site search (nav.js → search.js).
//   PLAYWRIGHT=/path/to/playwright-core/index.mjs CHROME=/path/to/chrome node tools/build-search.mjs
// Every page is opened in a real Chromium, in English and in French (the French texts come from the
// same dictionaries the visitor gets), and its lessons (or, for the other pages, its sections) are indexed.
// Run it after build.mjs, add-meta.mjs and add-practice.mjs.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');

// pages in the order results of equal score are shown; the 404 page is not indexed
const PAGES = fs.readdirSync(root).filter((f) => f.endsWith('.html') && f !== '404.html' && f !== 'certificate.html' && f !== 'glossary.html' && f !== 'offline.html')
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
function rank(f) { return f === 'index.html' ? 0 : f.startsWith('learn') ? 1 : f.startsWith('anatomy') ? 3 : 2; }

const TYPES = { gloss: ['Glossary', 'Glossaire'], learn: ['Course', 'Cours'], robot: ['Robot', 'Robot'], anatomy: ['3D anatomy', 'Anatomie 3D'], page: ['Page', 'Page'] };
const type = (f) => f.startsWith('learn') ? 'learn' : f.startsWith('anatomy') ? 'anatomy' : ['index.html', 'build.html', 'wheels.html'].includes(f) ? 'page' : 'robot';

// a tiny static server: the pages load their scripts and dictionaries with relative URLs
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

// what is read from a page, in the browser (the same code for both languages)
function extract() {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const txt = (el) => clean(el && el.textContent);
  const all = (r, s) => [].slice.call(r.querySelectorAll(s));
  const h1 = document.querySelector('h1');
  const title = clean(h1 && (h1.getAttribute('aria-label') || h1.textContent)) || clean(document.title);
  const lessons = all(document, 'article.lesson');
  if (lessons.length) {
    const course = { id: '', t: title, x: (txt(document.querySelector('p.lead')) + ' · ' + lessons.map((l) => clean(l.querySelector('h2').textContent)).join(' · ')).slice(0, 1600) };
    return { title, items: [course].concat(lessons.map((l) => {
      const parts = [txt(l.querySelector('.goal p'))]
        .concat(all(l, 'h3, h4, .terms li, figcaption, .ess li, th').map(txt));
      const body = all(l, 'p').map(txt).join(' ').slice(0, 500);       // a little of the text, for words that are in no heading
      return { id: l.id, n: txt(l.querySelector('.num')), t: clean(l.querySelector('h2').textContent), x: (parts.join(' · ') + ' · ' + body).slice(0, 1600), min: +(txt(l.querySelector('.time')).match(/\d+/) || [0])[0],
        kt: all(l, '.terms li').map(txt), hd: all(l, 'h3, h4').map(txt).join(' · '), body: txt(l).slice(0, 20000) };
    })), gloss: all(document, '.gloss table tr').map((tr) => all(tr, 'td').map((td) => clean(td.innerHTML))).filter((r) => r.length === 2) };
  }
  // other pages: the page itself, then each section that has an id and a heading
  const lead = txt(document.querySelector('p.lead, .rtag, main p, body > p:not(:first-of-type)'));
  const heads = all(document, 'main h2, main h3, body > h2, section h2, section h3').map(txt).filter(Boolean);
  const items = [{ id: '', t: title, x: (lead + ' · ' + heads.join(' · ')).slice(0, 1600) }];
  all(document, 'section[id], article[id]').forEach((s) => {
    const h = s.querySelector('h2, h3'); if (!h || s.closest('.site-nav, .site-foot')) return;
    const t = txt(h); if (!t || t === title) return;
    const x = all(s, 'h3, h4, p, dt').map(txt).join(' · ').slice(0, 600);
    items.push({ id: s.id, t, x });
  });
  return { title, items };
}

// the home page: its sections, written by hand (their headings are robot names and slogans)
const HOME = [
  ['', ['Robotics Atlas: home', 'Robotics Atlas : accueil'], ['An illustrated atlas of robot types: tasks, kinematic diagrams, DH tables and interactive 3D models.', 'Un atlas illustré des types de robots : tâches, schémas cinématiques, tableaux DH et modèles 3D interactifs.']],
  ['tour', ['How a robot works', 'Comment marche un robot'], ['A robot is a chain of joints: links, joints, degrees of freedom, motors, sensors, controller.', 'Un robot est une chaîne de liaisons : segments, articulations, degrés de liberté, moteurs, capteurs, contrôleur.']],
  ['gallery', ['The robots', 'Les robots'], ['Every robot type: arm, gantry, SCARA, 6-axis, cobot, Delta, mobile robot, wheels.', 'Tous les types de robots : bras, portique, SCARA, 6 axes, cobot, Delta, robot mobile, roues.']],
  ['inside', ['Anatomy in 3D', 'Anatomie en 3D'], ['Look inside the robots: every component, layer by layer.', "Regarder à l'intérieur des robots : chaque composant, couche par couche."]],
  ['road', ['Learning roadmap', "Parcours d'apprentissage"], ['Five levels from beginner to Master: courses, robots and progress, save your progress, certificates.', 'Cinq niveaux du débutant au Master : cours, robots et progression, sauvegarder sa progression, certificats.']]
].map(([id, t, x]) => ({ u: 'index' + (id ? '#' + id : ''), k: 'page', p: ['Robotics Atlas', 'Robotics Atlas'], n: '', t, x, m: 0 }));
HOME.push({ u: 'certificate', k: 'page', p: ['Robotics Atlas', 'Robotics Atlas'], n: '', t: ['My certificates', 'Mes certificats'], x: ['Get a certificate of completion with your name for each finished course, print it or save it as PDF. Save or restore your progress (file or code).', 'Obtenez un certificat de réussite à votre nom pour chaque cours terminé, imprimez-le ou enregistrez-le en PDF. Sauvegardez ou restaurez votre progression (fichier ou code).'], m: 0 });

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const read = async (lang, file) => {
  const ctx = await browser.newContext();
  await ctx.addInitScript((l) => { try { localStorage.setItem('ra-lang', l); } catch (e) { /* ignore */ } }, lang);
  const page = await ctx.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.route(/\/vendor\//, (r) => r.abort());                     // no 3D engine needed to read the texts
  await page.goto(base + file, { waitUntil: 'load' });
  await page.waitForTimeout(lang === 'fr' ? 700 : 200);                // French: the dictionaries are applied after load
  const r = await page.evaluate(extract);
  await ctx.close();
  return r;
};

const out = [];
let lessons = 0;
const GL = [];                                                          // glossary rows of every course, with the lessons of the page
for (const f of PAGES) {
  if (f === 'index.html') { out.push(...HOME); continue; }
  const en = await read('en', f), fr = await read('fr', f);
  const byId = new Map(fr.items.map((i) => [i.id, i]));
  for (const it of en.items) {
    const o = byId.get(it.id) || it;
    out.push({ u: f.replace(/\.html$/, '') + (it.id ? '#' + it.id : ''), k: type(f), p: [en.title, fr.title], n: it.n || '', t: [it.t, o.t], x: [it.x, o.x], m: it.min || 0 });
    if (it.n) lessons++;
  }
  if (en.gloss && en.gloss.length) GL.push({ page: f.replace(/\.html$/, ''), title: [en.title, fr.title], rows: en.gloss.map((r, i) => [r, (fr.gloss || [])[i] || r]), lessons: en.items.filter((i) => i.n).map((i) => ({ ...i, tf: (byId.get(i.id) || i).t })) });
  process.stdout.write('.');
}
await browser.close(); server.close();

// ---------------------------------------------------------------- the general glossary (glossary.html)
// every term of every course glossary, merged by its English name, linked to the lesson that teaches it
const plain = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const nk = (s) => plain(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9θωαβφ]+/g, ' ').trim();
const hay = (s) => ' ' + plain(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9θωαβφ*]+/g, ' ').trim() + ' ';   // (keeps what is in brackets)
const variants = (t) => plain(t).split(/\s+\/\s+|,\s+/).map(nk).filter((v) => v.length > 1);
function findLesson(term, lessonsOfPage) {
  const vs = variants(term);
  const hit = (pred) => lessonsOfPage.find((l) => vs.some((v) => pred(l, v)));
  return hit((l, v) => l.kt.some((k) => { const kk = nk(k); return kk === v || (v.length > 3 && (kk.includes(v) || v.includes(kk) && kk.length > 3)); }))   // in the key terms
    || hit((l, v) => v.length > 2 && hay(l.t + ' · ' + l.hd).includes(' ' + v + ' '))                                                        // in a heading
    || hit((l, v) => v.length > 2 && hay(l.body).includes(' ' + v + ' '))                                                                       // in the text
    || hit((l, v) => { const w = v.split(' ').filter((x) => x.length > 3); return w.length > 1 && w.every((x) => hay(l.t + ' · ' + l.hd).includes(' ' + x)); });   // every word in the headings
}
const { CARDS } = await import('./courses.mjs');
const cardTitle = (page) => (CARDS.find((c) => c.page === page + '.html') || {}).t;
const ORDER = ['learn', 'learn-mathkit', 'learn-maths', 'learn-model', 'learn-singularities', 'learn-control', 'learn-armlab', 'learn-ros', 'learn-intelligence', 'learn-world', 'learn-mobile', 'learn-mobile-pro', 'learn-advanced'];
GL.sort((a, b) => ORDER.indexOf(a.page) - ORDER.indexOf(b.page));
const gloss = new Map();
for (const g of GL) for (const [[te, de], [tf, df]] of g.rows) {
  const k = nk(te).replace(/(\w{3,}) [a-z]$/, '$1'); if (!k) continue;   // "Jacobian J" and "Jacobian" are one entry
  const l = findLesson(te, g.lessons);
  const src = { u: g.page + (l ? '#' + l.id : ''), c: cardTitle(g.page) || g.title, n: l ? l.n : '', lt: l ? [l.t, l.tf] : null };
  if (!gloss.has(k)) gloss.set(k, { id: k.replace(/ /g, '-').slice(0, 60), t: [plain(te), plain(tf)], d: [de, df], src: [] });
  const e = gloss.get(k);
  if (!e.src.some((s) => s.u.split('#')[0] === src.u.split('#')[0] || s.u === src.u)) e.src.push(src);
}
const GLOSS = [...gloss.values()];
const ids = new Set(); GLOSS.forEach((e) => { let id = e.id, i = 2; while (ids.has(id)) id = e.id + '-' + i++; e.id = id; ids.add(id); });
fs.writeFileSync(path.join(root, 'glossary-data.js'), '// glossary-data.js — generated by tools/build-search.mjs from the glossaries of the courses: do not edit.\n' + `window.RA_GLOSS = ${JSON.stringify(GLOSS)};\n`);
// the glossary entries are found by the search too
for (const e of GLOSS) out.push({ u: 'glossary#' + e.id, k: 'gloss', p: [ 'Glossary', 'Glossaire' ], n: '', t: e.t, x: [plain(e.d[0]), plain(e.d[1])], m: 0 });
out.push({ u: 'glossary', k: 'page', p: ['Robotics Atlas', 'Robotics Atlas'], n: '', t: ['Robotics glossary', 'Glossaire de la robotique'], x: [`Every word of robotics in one place: ${GLOSS.length} terms with their meaning, in English and French, and the lesson that explains them.`, `Tous les mots de la robotique au même endroit : ${GLOSS.length} termes avec leur sens, en anglais et en français, et la leçon qui les explique.`], m: 0 });
console.log(`glossary: ${GLOSS.length} terms from ${GL.length} courses, ${GLOSS.filter((e) => e.src.some((s) => s.n)).length} linked to a lesson`);
const js = '// search-index.js — generated by tools/build-search.mjs: do not edit.\n' +
  `window.RA_TYPES = ${JSON.stringify(TYPES)};\nwindow.RA_SEARCH = ${JSON.stringify(out)};\n`;
fs.writeFileSync(path.join(root, 'search-index.js'), js);
// the list of courses for the certificate page, with the time of their lessons
const courses = CARDS.map((c) => {
  const pg = c.page.replace(/\.html$/, ''), min = out.filter((e) => e.u.startsWith(pg + '#') && e.n).reduce((a, e) => a + e.m, 0);
  return { page: c.page, key: c.key, prefix: c.prefix, start: c.start || 1, total: c.total, t: c.t, d: c.d, min };
});
fs.writeFileSync(path.join(root, 'courses.js'), '// courses.js — generated by tools/build-search.mjs from tools/courses.mjs: do not edit.\n' + `window.RA_COURSES = ${JSON.stringify(courses)};\n`);
console.log(`\npages ${PAGES.length} entries ${out.length} lessons ${lessons} size ${(js.length / 1024).toFixed(0)} KB`);
