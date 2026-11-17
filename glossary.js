// glossary.js — the general glossary: every term of every course glossary (glossary-data.js, built by
// tools/build-search.mjs), in alphabetical order, with a filter, the A–Z letters, and the lesson that explains each term.
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0, OT = 1 - LG;
    var L = function (en, fr) { return FR ? fr : en; };
    var G = (window.RA_GLOSS || []).slice(), main = document.getElementById('gloss');
    document.title = L('Robotics glossary', 'Glossaire de la robotique') + ' — Robotics Atlas';
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var fold = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var plain = function (h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
    var letter = function (e) { var c = fold(e.t[LG]).replace(/^[^a-z0-9]+/, '').charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
    G.forEach(function (e) { e.L = letter(e); e.hay = fold(e.t[0] + ' ' + e.t[1] + ' ' + plain(e.d[0]) + ' ' + plain(e.d[1])); e.name = fold(e.t[0] + ' ' + e.t[1]); });
    G.sort(function (a, b) { return a.t[LG].localeCompare(b.t[LG], FR ? 'fr' : 'en', { sensitivity: 'base' }); });

    // the courses, in the order of the roadmap, for the filter
    var courses = [];
    G.forEach(function (e) { e.src.forEach(function (s) { var p = s.u.split('#')[0]; if (!courses.some(function (c) { return c.p === p; })) courses.push({ p: p, t: s.c }); }); });
    var ORDER = (window.RA_COURSES || []).map(function (c) { return c.page.replace(/\.html$/, ''); });
    courses.sort(function (a, b) { return ORDER.indexOf(a.p) - ORDER.indexOf(b.p); });

    main.innerHTML = '<h1>' + L('Robotics glossary', 'Glossaire de la robotique') + '</h1>' +
      '<p class="lead">' + L('Every word of robotics in one place: its meaning, its name in French, and the lesson that explains it.', 'Tous les mots de la robotique au même endroit : leur sens, leur nom en anglais, et la leçon qui les explique.') + '</p>' +
      '<div class="gl-tools"><div class="gl-search"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>' +
      '<input type="search" id="glQ" autocomplete="off" spellcheck="false" placeholder="' + L('Filter: a word, in English or French', 'Filtrer : un mot, en français ou en anglais') + '" aria-label="' + L('Filter the glossary', 'Filtrer le glossaire') + '"></div>' +
      '<select id="glC" aria-label="' + L('Course', 'Cours') + '"><option value="">' + L('All the courses', 'Tous les cours') + '</option>' +
      courses.map(function (c) { return '<option value="' + c.p + '">' + esc(c.t[LG]) + '</option>'; }).join('') + '</select></div>' +
      '<nav class="gl-az" aria-label="' + L('Letters', 'Lettres') + '"></nav><p class="gl-count" aria-live="polite"></p><div class="gl-list"></div>';
    var q = main.querySelector('#glQ'), sel = main.querySelector('#glC'), az = main.querySelector('.gl-az'), list = main.querySelector('.gl-list'), count = main.querySelector('.gl-count');

    function entry(e) {
      var src = e.src.some(function (s) { return s.n; }) ? e.src.filter(function (s) { return s.n; }) : e.src;
      var other = e.t[OT] !== e.t[LG] ? '<span class="gl-other" lang="' + (FR ? 'en' : 'fr') + '">' + (FR ? 'EN' : 'FR') + ' · ' + esc(e.t[OT]) + '</span>' : '';
      return '<article class="gl-item" id="' + e.id + '"><h3><a href="#' + e.id + '" class="gl-anchor">' + esc(e.t[LG]) + '</a>' + other + '</h3>' +
        '<p class="gl-def">' + e.d[LG] + '</p><p class="gl-src">' + src.map(function (s) {
          var page = s.u.split('#')[0], hash = s.u.split('#')[1];
          return '<a href="' + page + '.html' + (hash ? '#' + hash : '') + '"><b>' + esc(s.c[LG]) + '</b>' + (s.n ? '<span>' + L('lesson', 'leçon') + ' ' + s.n + (s.lt ? ' · ' + esc(s.lt[LG]) : '') + '</span>' : '<span>' + L('course glossary', 'glossaire du cours') + '</span>') + '</a>';
        }).join('') + '</p></article>';
    }
    function render() {
      var words = fold(q.value).split(/\s+/).filter(Boolean), c = sel.value;
      var shown = G.filter(function (e) {
        if (c && !e.src.some(function (s) { return s.u.split('#')[0] === c; })) return false;
        return words.every(function (w) { return e.hay.indexOf(w) >= 0; });
      });
      if (words.length) shown.sort(function (a, b) { return (b.name.indexOf(words[0]) >= 0) - (a.name.indexOf(words[0]) >= 0); });   // names first, then definitions
      var groups = {}, letters = [];
      shown.forEach(function (e) { var k = words.length ? '' : e.L; if (!groups[k]) { groups[k] = []; letters.push(k); } groups[k].push(e); });
      list.innerHTML = shown.length ? letters.map(function (k) { return (k ? '<h2 class="gl-letter" id="gl-' + k + '">' + k + '</h2>' : '') + '<div class="gl-grid">' + groups[k].map(entry).join('') + '</div>'; }).join('')
        : '<p class="gl-none">' + L('No term found. Try another word, or search the whole site:', 'Aucun terme trouvé. Essayez un autre mot, ou cherchez dans tout le site :') + ' <button type="button" class="linkish" id="glAll">' + L('search', 'rechercher') + ' « ' + esc(q.value) + ' »</button></p>';
      var all = list.querySelector('#glAll'); if (all) all.addEventListener('click', function () { if (RA.openSearch) RA.openSearch(q.value); else document.querySelector('.search-btn').click(); });
      count.textContent = shown.length + ' / ' + G.length + ' ' + L('terms', 'termes');
      var have = {}; shown.forEach(function (e) { have[e.L] = 1; });
      az.innerHTML = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(function (k) { return k !== '#' || G.some(function (e) { return e.L === '#'; }); }).map(function (k) {
        return have[k] && !words.length ? '<a href="#gl-' + k + '">' + k + '</a>' : '<span>' + k + '</span>';
      }).join('');
    }
    q.addEventListener('input', render); sel.addEventListener('change', render);
    try { var p0 = new URLSearchParams(location.search); if (p0.get('q')) q.value = p0.get('q'); if (p0.get('course')) sel.value = p0.get('course'); } catch (e) { /* old browser */ }
    render();
    // a link to one term (from the search): show it
    function focusHash() {
      var id = decodeURIComponent(location.hash.slice(1)); if (!id || id.indexOf('gl-') === 0) return;
      var el = document.getElementById(id);
      if (!el && (q.value || sel.value)) { q.value = ''; sel.value = ''; render(); el = document.getElementById(id); }
      if (!el) return;
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      setTimeout(function () { el.scrollIntoView({ block: 'center' }); }, 60);
    }
    window.addEventListener('hashchange', focusHash); focusHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
