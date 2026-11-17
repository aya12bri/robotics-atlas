// revision.js — the revision sheets: one printable sheet per course, made from the lessons (revision-data.js, built by
// tools/build-search.mjs): the essentials of each lesson, what to remember, the main formulas and the key terms.
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0;
    var L = function (en, fr) { return FR ? fr : en; };
    var D = window.RA_REV || [], main = document.getElementById('rev');
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var hours = function (min) { var h = min / 60; return h < 1.5 ? min + ' min' : (FR ? String(Math.round(h * 2) / 2).replace('.', ',') : Math.round(h * 2) / 2) + ' h'; };
    var OPT = { eq: true, keep: true, kt: true };
    try { var o = JSON.parse(localStorage.getItem('ra-rev-opt') || 'null'); if (o) OPT = Object.assign(OPT, o); } catch (e) { /* private mode */ }
    var saveOpt = function () { try { localStorage.setItem('ra-rev-opt', JSON.stringify(OPT)); } catch (e) { /* private mode */ } };
    var LOGO = '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#2f6bff"/><path d="M7.5 25.5 L16 7.5 L24.5 25.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.2 19.2 H20.8" stroke="#ff9f43" stroke-width="3.2" stroke-linecap="round"/><circle cx="16" cy="7.5" r="3.1" fill="#fff"/><circle cx="16" cy="7.5" r="1.1" fill="#2f6bff"/></svg>';

    function chooser() {
      document.title = L('Revision sheets', 'Fiches de révision') + ' — Robotics Atlas';
      document.body.classList.remove('rev-view');
      main.innerHTML = '<h1>' + L('Revision sheets', 'Fiches de révision') + '</h1>' +
        '<p class="lead">' + L('One sheet per course, to revise before an exam or to keep next to you: the essentials of every lesson, the main formulas and the key terms. Print it, or save it as PDF.', 'Une fiche par cours, pour réviser avant un examen ou la garder à côté de vous : l\'essentiel de chaque leçon, les formules principales et les mots clés. Imprimez-la, ou enregistrez-la en PDF.') + '</p>' +
        '<div class="rev-grid">' + D.map(function (c) {
          var min = c.lessons.reduce(function (a, l) { return a + (l.m || 0); }, 0);
          return '<a class="rev-card" href="#' + c.page + '"><span class="rev-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/></svg></span>' +
            '<b>' + esc(c.t[LG]) + '</b><span>' + c.lessons.length + ' ' + L('lessons', 'leçons') + (min ? ' · ' + hours(min) : '') + '</span><em>' + L('Open the sheet', 'Ouvrir la fiche') + ' →</em></a>';
        }).join('') + '</div>';
    }

    function sheet(c) {
      document.title = L('Revision sheet', 'Fiche de révision') + ' · ' + c.t[LG] + ' — Robotics Atlas';
      document.body.classList.add('rev-view');
      var block = function (l) {
        var ess = l.ess[LG] || [], keep = OPT.keep ? (l.keep[LG] || []) : [], eq = OPT.eq ? (l.eq[LG] || []) : [], kt = OPT.kt ? (l.kt[LG] || []) : [];
        return '<section class="rs-l"><h3><span>' + l.n + '</span>' + esc(l.t[LG]) + '</h3>' +
          (ess.length ? '<ul>' + ess.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>' : '') +
          (eq.length ? '<div class="rs-eq">' + eq.map(function (h) { return '<p>' + h + '</p>'; }).join('') + '</div>' : '') +
          keep.map(function (h) { return '<div class="rs-keep">' + h + '</div>'; }).join('') +
          (kt.length ? '<p class="rs-kt"><b>' + L('Key terms', 'Mots clés') + ' :</b> ' + kt.map(esc).join(' · ') + '</p>' : '') +
          '</section>';
      };
      var min = c.lessons.reduce(function (a, l) { return a + (l.m || 0); }, 0);
      var today = new Date().toLocaleDateString(FR ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      var chk = function (k, en, fr) { return '<label><input type="checkbox" data-o="' + k + '"' + (OPT[k] ? ' checked' : '') + '> ' + L(en, fr) + '</label>'; };
      main.innerHTML = '<div class="rev-bar"><a href="#" class="rev-back">← ' + L('All the sheets', 'Toutes les fiches') + '</a>' +
        '<div class="rev-opts">' + chk('eq', 'Formulas', 'Formules') + chk('keep', 'To remember', 'À retenir') + chk('kt', 'Key terms', 'Mots clés') + '</div>' +
        '<button type="button" class="btn sm" id="revPrint">' + L('Print or save as PDF', 'Imprimer ou enregistrer en PDF') + '</button></div>' +
        '<article class="rev-sheet"><header class="rs-head"><div class="rs-brand">' + LOGO + '<span>Robotics Atlas</span><em>' + L('Revision sheet', 'Fiche de révision') + '</em></div>' +
        '<h2>' + esc(c.t[LG]) + '</h2><p>' + c.lessons.length + ' ' + L('lessons', 'leçons') + (min ? ' · ' + L('about', 'environ') + ' ' + hours(min) + ' ' + L('of study', 'de travail') : '') + '</p></header>' +
        '<div class="rs-cols">' + c.lessons.map(block).join('') + '</div>' +
        '<footer class="rs-foot"><span>roboticsatlas.ayabriksine.com/' + c.page + '</span><span>' + today + '</span></footer></article>';
      main.querySelector('#revPrint').addEventListener('click', function () { window.print(); });
      [].forEach.call(main.querySelectorAll('[data-o]'), function (i) { i.addEventListener('change', function () { OPT[i.dataset.o] = i.checked; saveOpt(); sheet(c); }); });
      window.scrollTo(0, 0);
    }

    function render() {
      var k = location.hash.slice(1), c = D.filter(function (x) { return x.page === k; })[0];
      if (c) sheet(c); else chooser();
    }
    window.addEventListener('hashchange', render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
