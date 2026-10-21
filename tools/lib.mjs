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

export function lesson(prefix, n, { title, time, goal, body, terms, quiz, link }) {
  const q = quiz.map(([qe, qf, ae, af]) => `<li><p class="q">${tx(qe, qf)}</p><p class="a">${tx(ae, af)}</p></li>`).join('');
  return `
        <article class="lesson" id="l${n}" data-id="${prefix}${n}">
          <header class="lesson-head"><span class="num">${n}</span><h2>${tx(title[0], title[1])}</h2><span class="time">${time} min</span></header>
          <div class="goal"><b>${tx('You will learn', 'Vous allez apprendre')}</b><p>${tx(goal[0], goal[1])}</p></div>
${body.join('\n')}
          <h3>${tx('Key terms', 'Mots clés')}</h3>
          <ul class="terms">${terms.map((t) => `<li>${cell(t)}</li>`).join('')}</ul>
<details class="quiz"><summary>${tx('Check yourself', 'Vérifiez-vous')}</summary><ol class="qa">${q}</ol></details>${link ? '\n          ' + TRY(...link) : ''}
          <label class="lesson-done"><input type="checkbox" data-lesson="${n}"><span class="box" aria-hidden="true"></span><span class="lbl"></span></label>
        </article>
`;
}
