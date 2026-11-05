// lib.mjs — tiny helpers to write a course once in English + French.
// Every translatable text goes through tx(en, fr): it returns the English text (for the HTML)
// and remembers the French one (for i18n/fr-<page>.js, keyed by the same fingerprint nav.js uses).
export const REG = new Map();
export const SVGREG = new Map();
export const CONFLICTS = [];
const SAME = new Set();                                      // texts that are the same in both languages (maths, symbols)
export const tx = (en, fr) => {
  if (fr === undefined || fr === en) { if (!REG.has(en)) { REG.set(en, en); SAME.add(en); } return en; }
  if (REG.has(en) && !SAME.has(en) && REG.get(en) !== fr) { CONFLICTS.push(en + '  =>  ' + REG.get(en) + '  /  ' + fr); return en; }
  REG.set(en, fr); SAME.delete(en); return en;
};
export const svgtx = (en, fr) => { SVGREG.set(en, fr === undefined ? en : fr); return en; };
export const reset = () => { REG.clear(); SVGREG.clear(); SAME.clear(); CONFLICTS.length = 0; };

const cell = (c) => (Array.isArray(c) ? tx(c[0], c[1]) : tx(c));
export const P = (en, fr) => `<p>${tx(en, fr)}</p>`;
export const H4 = (en, fr) => `<h4>${tx(en, fr)}</h4>`;
export const UL = (items) => `<ul>${items.map((i) => `<li>${cell(i)}</li>`).join('')}</ul>`;
export const OL = (items) => `<ol>${items.map((i) => `<li>${cell(i)}</li>`).join('')}</ol>`;
export const EQ = (en, fr) => `<p class="eq">${tx(en, fr)}</p>`;
export const BOX = (kind, title, ...body) => `<div class="box ${kind}"><div class="bt">${tx(title[0], title[1])}</div><div class="bb">${body.join('\n')}</div></div>`;
export const TABLE = (head, rows, cls = '') =>
  `<div class="cmp-wrap"><table class="dh ${cls}"><tr>${head.map((h) => `<th class="left">${cell(h)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td class="left">${cell(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
export const FIG = (vb, inner) => `<figure class="figure"><svg viewBox="${vb}" class="fig" role="img" aria-hidden="true">${inner}</svg></figure>`;
export const WIDGET = (name) => `<div class="widget" data-widget="${name}"></div>`;
export const TRY = (href, en, fr) => `<p class="try"><a href="${href}">${tx(en, fr)}</a></p>`;
// matrix helper: MX(2, ['a','b','c','d'])
export const MX = (cols, cells) => `<span class="mx c${cols}">${cells.map((c) => `<span>${c}</span>`).join('')}</span>`;

export const EXREG = {};                                     // exercises of each lesson, filled by the content files: EXREG['wmr-4'] = [...]
export function lesson(prefix, n, { title, time, goal, body, terms, quiz, link, ex }) {
  const q = quiz.map(([qe, qf, ae, af]) => `<li><p class="q">${tx(qe, qf)}</p><p class="a">${tx(ae, af)}</p></li>`).join('');
  return `
        <article class="lesson" id="l${n}" data-id="${prefix}${n}">
          <header class="lesson-head"><span class="num">${n}</span><h2>${tx(title[0], title[1])}</h2><span class="time">${time} min</span></header>
          <div class="goal"><b>${tx('You will learn', 'Vous allez apprendre')}</b><p>${tx(goal[0], goal[1])}</p></div>
${body.join('\n')}
          <h3>${tx('Key terms', 'Mots clés')}</h3>
          <ul class="terms">${terms.map((t) => `<li>${cell(t)}</li>`).join('')}</ul>
${(ex || EXREG[prefix + n]) ? EXS(prefix, n, ex || EXREG[prefix + n]) : ''}<details class="quiz"><summary>${tx('Check yourself', 'Vérifiez-vous')}</summary><ol class="qa">${q}</ol></details>${link ? '\n          ' + TRY(...link) : ''}
          <label class="lesson-done"><input type="checkbox" data-lesson="${n}"><span class="box" aria-hidden="true"></span><span class="lbl"></span></label>
        </article>
`;
}

// ---------------------------------------------------------------- exercises (graded, hint + solution, optional auto-check)
// item = { lv: 1|2|3, q: [en, fr], num?: { ans, tol, unit }, mcq?: [[en, fr, isCorrect], ...], hint?: [en, fr], sol: [en, fr], exam?: true }
// The checking is done in the browser by learn-mobile-widgets.js (numeric answers and multiple choice).
export const LV = [['Level 1 · Beginner', 'Niveau 1 · Débutant'], ['Level 2 · Intermediate', 'Niveau 2 · Intermédiaire'], ['Level 3 · Professional', 'Niveau 3 · Professionnel']];
export const num = (x, d = 2) => [String(+x.toFixed(d)), String(+x.toFixed(d)).replace('.', ',')];   // [en, fr] decimal formatting of a computed value
export function EXS(prefix, n, items, opts = {}) {
  const rows = items.map((it, i) => {
    const id = `${prefix}${n}-${i + 1}`;
    const input = it.num ? `<div class="numin" data-ans="${it.num.ans}" data-tol="${it.num.tol}" data-unit="${it.num.unit || ''}"></div>` : '';
    const optsHtml = it.mcq ? `<ol class="opts" type="A">${it.mcq.map((o) => `<li${o[2] ? ' data-ok="1"' : ''}>${tx(o[0], o[1])}</li>`).join('')}</ol>` : '';
    return `<div class="ex" data-id="${id}" data-lv="${it.lv}"${it.exam ? ' data-exam="1"' : ''}>
<div class="qh"><span class="lv l${it.lv}">${tx(...LV[it.lv - 1])}</span><span class="qn">${i + 1}</span></div>
<p class="q">${tx(it.q[0], it.q[1])}</p>${input}${optsHtml}<p class="fb" aria-live="polite"></p>
${it.hint ? `<details class="hint"><summary>${tx('Hint', 'Indice')}</summary><p>${tx(it.hint[0], it.hint[1])}</p></details>` : ''}<details class="sol"><summary>${tx('Solution', 'Solution')}</summary><p>${tx(it.sol[0], it.sol[1])}</p></details>
</div>`;
  }).join('\n');
  const note = opts.note || [`Try each exercise yourself first. Type your answer in the box (the checker accepts a small tolerance) or pick an option; use the hint only if you are stuck, and read the solution to compare your method.`, `Essayez d'abord chaque exercice vous-même. Tapez votre réponse dans la case (le vérificateur accepte une petite tolérance) ou choisissez une option ; n'utilisez l'indice que si vous êtes bloqué, et lisez la solution pour comparer votre méthode.`];
  return `<section class="exs${opts.exam ? ' exam' : ''}" data-for="${prefix}${n}"><h3>${tx(opts.title ? opts.title[0] : 'Exercises', opts.title ? opts.title[1] : 'Exercices')}</h3><p class="exnote">${tx(note[0], note[1])}</p><p class="exscore" aria-live="polite"></p>
${rows}
</section>`;
}
// a "I did this lab" tick, remembered in the browser
export const LABCHK = (id) => `<label class="labchk"><input type="checkbox" data-lab="${id}"><span>${tx('I did this lab and met the pass criteria', 'J\'ai fait ce TP et atteint les critères de réussite')}</span></label>`;

// ---------------------------------------------------------------- verified code listings (tools/content/code/*.py and the output of their last run)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const CODE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'content', 'code');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const CODE = (file) => `<pre class="code"><code>${esc(fs.readFileSync(path.join(CODE_DIR, file), 'utf8').trimEnd())}</code></pre>`;
export const OUT = (file) => `<pre class="out"><code>${esc(fs.readFileSync(path.join(CODE_DIR, file), 'utf8').trimEnd())}</code></pre>`;
