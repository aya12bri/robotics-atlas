// add-practice.mjs — adds to every lesson of the courses: a short "The essentials" box, a figure or a graph,
// and "Worked exercises" (graded, with a hint and a step-by-step solution, checked in the browser), with their French texts.
// The content is in tools/practice/<course>.mjs. Idempotent: the blocks sit between <!-- BEGIN practice --> markers.
//   PLAYWRIGHT=... CHROME=... node tools/add-practice.mjs [course ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, SVGREG, reset, tx, BOX, UL, EXS } from './lib.mjs';
import { QUIZ } from './practice/quiz.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');

const COURSES = [
  ['learn', 'learn.html', 'lesson-', 'learn'], ['maths', 'learn-maths.html', 'maths-', 'learn-maths'], ['model', 'learn-model.html', 'model-', 'learn-model'],
  ['sing', 'learn-singularities.html', 'sing-', 'learn-singularities'], ['control', 'learn-control.html', 'ctrl-', 'learn-control'],
  ['ai', 'learn-intelligence.html', 'ai-', 'learn-intelligence'], ['world', 'learn-world.html', 'world-', 'learn-world'], ['ros', 'learn-ros.html', 'ros-', 'learn-ros']
];
const only = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await (await browser.newContext()).newPage();
for (const [key, file, prefix, i18n] of COURSES) {
  if (only.length && !only.includes(key)) continue;
  const src = path.join(root, 'tools', 'practice', key + '.mjs'); if (!fs.existsSync(src)) continue;
  reset();
  const { PRACTICE } = await import(pathToFileURL(src).href + '?t=' + Date.now());
  const f = path.join(root, file); let h = fs.readFileSync(f, 'utf8');
  h = h.replace(/\n? *<!-- BEGIN practice -->[\s\S]*?<!-- END practice -->\n?/g, '\n');
  let count = 0;
  for (const [n, L] of Object.entries(PRACTICE)) {
    const fig = L.fig ? `<figure class="figure pfig"><svg viewBox="${L.fig.vb}" class="fig" role="img" aria-hidden="true">${L.fig.svg}</svg>${L.cap ? `<figcaption>${tx(L.cap[0], L.cap[1])}</figcaption>` : ''}</figure>` : '';
    const block = `          <!-- BEGIN practice -->
          ${BOX('key', ['The essentials', 'L\'essentiel'], UL(L.sum))}
          ${fig}
          ${EXS(prefix, n, L.ex, { title: ['Worked exercises', 'Exercices corrigés'], note: ['Do each exercise on paper first, then type your answer (a small error is accepted) or pick an option. Open the hint if you are stuck, then read the solution: every step is explained.', 'Faites d\'abord chaque exercice sur papier, puis tapez votre réponse (une petite erreur est acceptée) ou choisissez une option. Ouvrez l\'indice si vous bloquez, puis lisez la solution : chaque étape est expliquée.'] })}
          <!-- END practice -->
`;
    const a = h.indexOf(`id="l${n}" data-id="${prefix}${n}"`); if (a < 0) throw new Error(`${file}: lesson ${n} not found`);
    const end = h.indexOf('</article>', a);
    let at = h.indexOf('<details class="quiz">', a); if (at < 0 || at > end) at = h.indexOf('<label class="lesson-done"', a);
    if (at < 0 || at > end) at = end;
    const lineStart = h.lastIndexOf('\n', at) + 1;
    h = h.slice(0, lineStart) + block + h.slice(lineStart); count++;
  }
  // extra multiple-choice questions in the end-of-lesson quiz (at least 3 questions per lesson)
  h = h.replace(/<!-- BEGIN quizx -->[\s\S]*?<!-- END quizx -->/g, '');
  for (const [n, list] of Object.entries(QUIZ[key] || {})) {
    const items = list.map((it, k) => `<li class="qm" data-id="q-${prefix}${n}-${k + 1}"><p class="q">${tx(it.q[0], it.q[1])}</p><ol class="opts" type="A">${it.o.map((o) => `<li${o[2] ? ' data-ok="1"' : ''}>${tx(o[0], o[1])}</li>`).join('')}</ol><p class="fb" aria-live="polite"></p><p class="a">${tx(it.a[0], it.a[1])}</p></li>`).join('');
    const a = h.indexOf(`id="l${n}" data-id="${prefix}${n}"`), end = h.indexOf('</article>', a);
    const qz = h.indexOf('<details class="quiz">', a);
    if (qz > 0 && qz < end) { const at = h.indexOf('</ol></details>', qz); h = h.slice(0, at) + `<!-- BEGIN quizx -->${items}<!-- END quizx -->` + h.slice(at); }
    else { const at = h.lastIndexOf('<label class="lesson-done"', end); const ls = h.lastIndexOf('\n', at) + 1; h = h.slice(0, ls) + `<!-- BEGIN quizx --><details class="quiz"><summary>${tx('Check yourself', 'Vérifiez vos acquis')}</summary><ol class="qa">${items}</ol></details><!-- END quizx -->\n` + h.slice(ls); }
  }
  if (!h.includes('src="lesson-quiz.js"')) h = h.replace(/(\s*)<\/body>/, '\n    <script src="lesson-quiz.js" defer></script>$1</body>');
  if (!h.includes('src="learn-mobile-widgets.js"')) h = h.replace(/(\s*)<\/body>/, '\n    <script src="learn-mobile-widgets.js" defer></script>$1</body>');   // the exercise checker
  fs.writeFileSync(f, h);
  // French texts, keyed like nav.js does
  await page.goto(pathToFileURL(f).href); await page.waitForFunction(() => window.RA && RA.hash);
  const pairs = [...REG.entries()];
  const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), pairs.map((p) => p[0]));
  const dict = {}; pairs.forEach(([, fr], i) => { dict[keys[i]] = fr; });
  for (const [en, fr] of SVGREG) dict[await page.evaluate((k) => RA.hash(RA.norm(k)), en)] = fr;
  const fr = path.join(root, 'i18n', `fr-${i18n}.js`);
  const s = fs.readFileSync(fr, 'utf8').replace(/\n?\/\/ BEGIN practice[\s\S]*?\/\/ END practice\n?/, '\n');
  fs.writeFileSync(fr, s.trimEnd() + `\n// BEGIN practice (generated by tools/add-practice.mjs)\nRA.add(${JSON.stringify(dict)});\n// END practice\n`);
  console.log(key, 'lessons', count, 'texts', pairs.length, 'svg', SVGREG.size);
}
await browser.close();
