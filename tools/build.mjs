// build.mjs — generates the course pages (learn-*.html) and their French dictionaries (i18n/fr-learn-*.js).
//   node tools/build.mjs            (needs playwright-core and the Chromium of PLAYWRIGHT_BROWSERS_PATH)
// The French dictionary is keyed by the fingerprint that nav.js computes in the browser, so the keys are
// computed in a real Chromium (same HTML normalisation) and every untranslated text is reported.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, SVGREG, reset, tx, CONFLICTS } from './lib.mjs';
import { COURSES, courseCards, CARDS } from './courses.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');

const pageHtml = (c, lessonsHtml) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${c.title}</title>
    <link rel="stylesheet" href="style.css" />
  <script src="nav.js" defer></script></head>
  <body class="learn">
    <h1>${c.title}</h1>
    <p>${tx('<a href="index.html" style="color:#ff9f43">← Robot list</a> · <a href="learn.html" style="color:#ff9f43">The basics</a>', '<a href="index.html" style="color:#ff9f43">← Liste des robots</a> · <a href="learn.html" style="color:#ff9f43">Les bases</a>')}</p>
    <p class="lead">${c.lead}</p>
    ${courseCards(c.page)}
    ${c.intro ? `<section class="intro">\n${c.intro}\n    </section>\n` : ''}
    <div class="learn-layout">
      <aside class="lesson-nav" id="lessonNav" aria-label="Checklist"></aside>
      <div class="lessons">
${lessonsHtml}
        <section class="gloss">
          <h2>${c.glossTitle}</h2>
          <p>${c.glossIntro}</p>
${c.gloss}
        </section>

        <section class="finish">
          <h2>${c.finish.h}</h2>
          <p>${c.finish.p}</p>
          <p class="cta"><a class="btn" href="${c.finish.next[0]}">${c.finish.next[1]}</a> <a class="btn ghost" href="index.html#road">${c.finish.back}</a></p>
        </section>
      </div>
    </div>
    <script src="learn-more-widgets.js" defer></script>
    <script>
document.addEventListener('DOMContentLoaded', function () {
  var FR = (window.RA && RA.lang) === 'fr', L = function (en, fr) { return FR ? fr : en; };
  var PREFIX = '${c.prefix}', KEY = '${c.key}';
  var lessons = [].slice.call(document.querySelectorAll('.lesson')), nav = document.getElementById('lessonNav');
  var P = function () { return (window.RA && RA.progress) || { get: function () { return false; }, set: function () {} }; };
  nav.innerHTML = '<div class="ln-head"><b id="lnCount"></b><div class="rm-bar"><i id="lnBar"></i></div></div><ol>' + lessons.map(function (el, i) { return '<li><a href="#l' + (i + 1) + '" data-i="' + (i + 1) + '"><span class="n">' + (i + 1) + '</span><span class="t">' + el.querySelector('h2').innerHTML + '</span></a></li>'; }).join('') + '</ol>';
  function paint() {
    var done = 0;
    lessons.forEach(function (el, i) { var ok = P().get(PREFIX + (i + 1)); if (ok) done++; el.classList.toggle('done', ok); var cb = el.querySelector('input'); cb.checked = ok; el.querySelector('.lbl').textContent = ok ? L('Lesson done', 'Leçon terminée') : L('Mark this lesson as done', 'Marquer cette leçon comme terminée'); nav.querySelector('a[data-i="' + (i + 1) + '"]').parentNode.classList.toggle('done', ok); });
    document.getElementById('lnCount').textContent = done + ' / ' + lessons.length + ' ' + L('lessons done', 'leçons terminées');
    document.getElementById('lnBar').style.width = Math.round(done / lessons.length * 100) + '%';
    var all = done === lessons.length; if (P().get(KEY) !== all) P().set(KEY, all);
    [].forEach.call(document.querySelectorAll('.course'), function (a) { var n = 0, t = +a.dataset.total; for (var i = 1; i <= t; i++) if (P().get(a.dataset.prefix + i)) n++; a.querySelector('.cnt').textContent = n + ' / ' + t; a.classList.toggle('complete', n === t); });
  }
  document.addEventListener('change', function (e) { var i = e.target.getAttribute && e.target.getAttribute('data-lesson'); if (i) P().set(PREFIX + i, e.target.checked); });
  window.addEventListener('ra-progress', paint); paint();
  function spy() { var m = window.scrollY + window.innerHeight * 0.3, cur = 1; lessons.forEach(function (el, i) { if (el.offsetTop <= m) cur = i + 1; }); [].forEach.call(nav.querySelectorAll('li'), function (li, i) { li.classList.toggle('on', i + 1 === cur); }); }
  window.addEventListener('scroll', spy, { passive: true }); spy();
});
    </script>
  </body>
</html>
`;

const patchCommon = () => {};
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const ctx = await browser.newContext();
const page = await ctx.newPage();
let bad = 0;
for (const c of COURSES) {
  reset();
  const { head, lessons } = await c.build();            // builds strings and fills the registries
  const html = pageHtml({ ...c, ...head }, lessons.join('\n'));
  patchCommon();
  fs.writeFileSync(path.join(root, c.page), html);
  // fingerprint of every registered text, computed by the browser the same way nav.js does
  await page.goto(pathToFileURL(path.join(root, c.page)).href);
  await page.waitForFunction(() => window.RA && RA.hash);
  const pairs = [...REG.entries()];
  const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; const k = RA.norm(d.innerHTML); return [k, RA.hash(k)]; }), pairs.map((p) => p[0]));
  const dict = {};
  pairs.forEach(([en, fr], i) => { dict[keys[i][1]] = fr; });
  for (const [en, fr] of SVGREG) { const k = en.replace(/\s+/g, ' ').trim(); dict[await page.evaluate((k) => RA.hash(k), k)] = fr; }
  // coverage: walk the page exactly like nav.js does and report what would stay in English
  const miss = await page.evaluate((have) => {
    const INLINE = /^(STRONG|EM|B|I|CODE|SUB|SUP|BR|SMALL|SPAN|A|KBD|MARK|ABBR|U)$/, out = [];
    const canReplace = (el) => !el.querySelector('input,select,button,textarea,canvas,svg,[id]') && Array.prototype.every.call(el.children, (c) => INLINE.test(c.tagName) && (!c.children.length || canReplace(c)));
    const skipEl = (el) => el.classList.contains('site-nav') || el.classList.contains('site-foot') || el.classList.contains('to-top') || el.id === 'lessonNav' || el.classList.contains('lbl') || el.classList.contains('widget') || el.classList.contains('time') || el.classList.contains('cnt');
    (function walk(el) {
      if (el.namespaceURI && el.namespaceURI.indexOf('svg') >= 0) return;
      if (/^(SCRIPT|STYLE|CANVAS|TEXTAREA|NOSCRIPT)$/i.test(el.tagName) || skipEl(el) || !el.textContent.trim()) return;
      if (canReplace(el) && (RA.hash(RA.norm(el.innerHTML)) in have)) return;
      if (el.tagName === 'CODE') return;
      for (let n = el.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 1) walk(n);
        else if (n.nodeType === 3) { const k = RA.norm(n.nodeValue); if (/[A-Za-zÀ-ÿ]{3}/.test(k) && !(RA.hash(k) in have)) out.push(k); }
      }
    })(document.body);
    document.querySelectorAll('svg.fig text').forEach((t) => { const k = RA.norm(t.textContent); if (/[A-Za-zÀ-ÿ]{3}/.test(k) && !(RA.hash(k) in have)) out.push('[svg] ' + k); });
    return out;
  }, dict);
  const real = miss.filter((k) => !/^(Home|Learn|Where to start|Robots|Intro|Back to top|Language|Designed and built by|LinkedIn|GitHub|Portfolio|Open the menu|Roadmap|The robots|About|How it works|EN|FR|Robotics Atlas)/.test(k));
  const out = `// Français — ${c.page}. Clé = empreinte du texte anglais, valeur = traduction. (généré par tools/build.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n`;
  fs.writeFileSync(path.join(root, 'i18n', `fr-${c.page.replace(/\.html$/, '')}.js`), out);
  CONFLICTS.forEach((k) => console.log('   CONFLICT', k));
  console.log(c.page, 'texts:', pairs.length, 'svg:', SVGREG.size, 'untranslated:', real.length);
  real.slice(0, 40).forEach((k) => console.log('   MISSING', k.slice(0, 110)));
  bad += real.length;
}
// the course cards (shared by every course page) are translated once, in fr-common.js, between two markers
const cardPairs = CARDS.flatMap((c) => [c.t, c.d]);
const ckeys = await page.evaluate((en) => en.map((s) => RA.hash(RA.norm(s))), cardPairs.map((p) => p[0]));
const extra = {};
const cdict = {}; cardPairs.forEach((p, i) => { cdict[ckeys[i]] = p[1]; });

// small edits of the older pages, so that they point to the new courses (idempotent)
const EDITS = [
  { file: 'learn.html', old: 'When you finish, two longer courses go deeper (see the cards above).', neu: 'When you finish, longer courses go deeper (see the cards above): maths, full modelling, singularities, control, perception and AI, and the real world.',
    oldP: /<p class="lead">(12 short lessons[\s\S]*?)<\/p>/, fr: 'Quand vous avez fini, des cours plus longs vont plus loin (voir les cartes ci-dessus) : maths, modélisation complète, singularités, commande, perception et IA, et le monde réel.', paragraph: true },
  { file: 'learn-model.html', old: '<a class="btn" href="scara.html">Go to the SCARA robot →</a> <a class="btn ghost"', neu: '<a class="btn" href="learn-singularities.html">Go to the singularities course →</a> <a class="btn ghost" href="scara.html">Go to the SCARA robot →</a> <a class="btn ghost"', fr: 'Aller au cours sur les singularités →', anchor: 'Go to the singularities course →' }
];
for (const e of EDITS) {
  const file = path.join(root, e.file); let h = fs.readFileSync(file, 'utf8');
  if (e.paragraph) {
    const m = h.match(e.oldP); if (!m) continue;
    const already = m[1].indexOf(e.neu) >= 0, oldEn = already ? m[1].replace(e.neu, e.old) : m[1], newEn = already ? m[1] : m[1].replace(e.old, e.neu);
    if (!already) { h = h.replace(m[1], newEn); fs.writeFileSync(file, h); }
    const hashOf = (en) => page.evaluate((x) => { const d = document.createElement('div'); d.innerHTML = x; return RA.hash(RA.norm(d.innerHTML)); }, en);
    const frDict = fs.readFileSync(path.join(root, 'i18n', 'fr-learn.js'), 'utf8'), ko = await hashOf(oldEn);
    const mm = frDict.match(new RegExp('"' + ko + '": "((?:[^"\\\\]|\\\\.)*)"')); if (!mm) { console.log('   (fr paragraph of', e.file, 'not found)'); continue; }
    extra[await hashOf(newEn)] = JSON.parse('"' + mm[1] + '"').replace(/Quand vous avez fini, deux cours plus longs vont plus loin \(voir les cartes ci-dessus\)\./, e.fr);
  } else if (h.indexOf(e.old) >= 0) {
    h = h.replace(e.old, e.neu); fs.writeFileSync(file, h);
  }
  if (e.anchor) extra[await page.evaluate((en) => RA.hash(RA.norm(en)), e.anchor)] = e.fr;
}

Object.assign(cdict, extra);
const common = path.join(root, 'i18n', 'fr-common.js');
let cs = fs.readFileSync(common, 'utf8').replace(/\n?\/\/ BEGIN courses[\s\S]*?\/\/ END courses\n?/, '\n');
cs = cs.trimEnd() + `\n// BEGIN courses (generated by tools/build.mjs)\nRA.add(${JSON.stringify(cdict, null, 1)});\n// END courses\n`;
fs.writeFileSync(common, cs);
// the three older course pages get the same row of cards
for (const c of CARDS.slice(0, 3)) {
  const file = path.join(root, c.page); let h = fs.readFileSync(file, 'utf8');
  h = h.replace(/<nav class="courses"[\s\S]*?<\/nav>/, courseCards(c.page).replace(/<b>|<\/b>|<span>|<\/span>/g, (m) => m));
  fs.writeFileSync(file, h);
}
await browser.close();
process.exit(bad ? 1 : 0);
