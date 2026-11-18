// search.js — the site search. nav.js loads it the first time the visitor opens the search
// (magnifier button, Ctrl/⌘ + K, or "/"); it loads the index (search-index.js, built by tools/build-search.mjs).
(function () {
  var RA = window.RA = window.RA || {};
  var FR = (RA.lang === 'fr'), LG = FR ? 1 : 0;
  var L = function (en, fr) { return FR ? fr : en; };
  var here = RA.page || 'index';

  // same length as the text, so a match found in the normalised text can be highlighted in the original one
  function norm(s) {
    var o = '';
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i), d = c.normalize ? c.normalize('NFD').charAt(0) : c; o += /[a-z0-9]/i.test(d) ? d.toLowerCase() : (/\s|[-'’_/·:.,;()]/.test(c) ? ' ' : c.toLowerCase()); }
    return o;
  }
  var STOP = {}; ('a an and the of to in on for with is are by or at as from into how what why de du des la le les l d un une et en au aux a pour par sur dans avec ou que qui est son sa ses').split(' ').forEach(function (w) { STOP[w] = 1; });
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var box, input, list, status, items = [], sel = -1, DATA = null, loading = false;
  var SUGGEST = FR ? ['DH', 'jacobienne', 'MGI', 'PID', 'Kalman', 'ROS 2', 'SCARA', 'quaternion', 'Mecanum', 'MPC']
    : ['DH', 'Jacobian', 'inverse kinematics', 'PID', 'Kalman', 'ROS 2', 'SCARA', 'quaternion', 'Mecanum', 'MPC'];

  function build() {
    box = document.createElement('div');
    box.className = 'ra-search ra-own'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', L('Search the site', 'Rechercher dans le site'));
    box.innerHTML = '<div class="rs-panel"><div class="rs-bar"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>' +
      '<input type="search" autocomplete="off" spellcheck="false" aria-controls="rsList" aria-autocomplete="list" placeholder="' + L('Search a lesson, a robot, a word (e.g. Jacobian)', 'Chercher une leçon, un robot, un mot (ex. jacobienne)') + '">' +
      '<button type="button" class="rs-close" aria-label="' + L('Close', 'Fermer') + '">Esc</button></div>' +
      '<p class="rs-status" aria-live="polite"></p><ul class="rs-list" id="rsList" role="listbox"></ul>' +
      '<p class="rs-help"><kbd>↑</kbd><kbd>↓</kbd> ' + L('to choose', 'pour choisir') + ' · <kbd>Enter</kbd> ' + L('to open', 'pour ouvrir') + ' · <kbd>Esc</kbd> ' + L('to close', 'pour fermer') + '</p></div>';
    document.body.appendChild(box);
    input = box.querySelector('input'); list = box.querySelector('.rs-list'); status = box.querySelector('.rs-status');
    box.addEventListener('mousedown', function (e) { if (e.target === box) close(); });
    box.querySelector('.rs-close').addEventListener('click', close);
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); move(e.key === 'ArrowDown' ? 1 : -1); }
      else if (e.key === 'Enter') { var a = list.querySelector('li.on a') || list.querySelector('li a'); if (a) { e.preventDefault(); a.click(); } }
    });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    list.addEventListener('click', function (e) {
      var chip = e.target.closest('button[data-q]'); if (chip) { input.value = chip.dataset.q; run(); input.focus(); return; }
      var a = e.target.closest('a'); if (a && a.getAttribute('href').charAt(0) === '#') close();    // same page: the page handles the anchor
    });
  }

  function load(done) {
    if (DATA) return done();
    if (loading) return; loading = true;
    status.textContent = L('Loading the index…', "Chargement de l'index…");
    var s = document.createElement('script'); s.src = 'search-index.js';
    s.onload = function () {
      DATA = (window.RA_SEARCH || []).map(function (e) {
        return { e: e, t: [norm(e.t[0]), norm(e.t[1])], x: [norm(e.x[0]), norm(e.x[1])], p: [norm(e.p[0]), norm(e.p[1])] };
      });
      done();
    };
    s.onerror = function () { loading = false; status.textContent = L('The search index could not be loaded.', "L'index de recherche n'a pas pu être chargé."); };
    document.head.appendChild(s);
  }

  // score of one entry: every word of the query must be found somewhere (in either language)
  function score(d, words) {
    var total = 0;
    for (var k = 0; k < words.length; k++) {
      var w = words[k], best = 0;
      for (var g = 0; g < 2; g++) {
        var f = g === LG ? 1 : 0.4, t = d.t[g], s = 0, i;
        if ((i = t.indexOf(w)) >= 0) s = (i === 0 || t.charAt(i - 1) === ' ' ? 12 : 7);
        else if ((i = d.p[g].indexOf(w)) >= 0) s = (i === 0 || d.p[g].charAt(i - 1) === ' ' ? 4 : 2);
        else if ((i = d.x[g].indexOf(w)) >= 0) s = (i === 0 || d.x[g].charAt(i - 1) === ' ' ? 3 : 1.5);
        if (s * f > best) best = s * f;
      }
      if (!best) return 0;
      total += best;
    }
    return total + (d.e.n ? 0.5 : 1);                                   // a page beats one of its lessons when both match the same way
  }
  function mark(text, ntext, words) {
    var spans = [];
    words.forEach(function (w) { var i = ntext.indexOf(w); while (i >= 0 && spans.length < 12) { if (i === 0 || !/[a-z0-9]/.test(ntext.charAt(i - 1))) spans.push([i, i + w.length]); i = ntext.indexOf(w, i + w.length); } });
    spans.sort(function (a, b) { return a[0] - b[0]; });
    var o = '', at = 0;
    spans.forEach(function (s) { if (s[0] < at) return; o += esc(text.slice(at, s[0])) + '<mark>' + esc(text.slice(s[0], s[1])) + '</mark>'; at = s[1]; });
    return o + esc(text.slice(at));
  }
  function snippet(d, words) {
    var g = LG, x = d.e.x[g], nx = d.x[g], i = -1;
    for (var k = 0; k < words.length && i < 0; k++) i = nx.indexOf(words[k]);
    if (i < 0) return esc(x.slice(0, 140)) + (x.length > 140 ? '…' : '');
    var a = Math.max(0, i - 50), b = Math.min(x.length, i + 110);
    while (a > 0 && x.charAt(a - 1) !== ' ') a--;
    return (a > 0 ? '…' : '') + mark(x.slice(a, b), nx.slice(a, b), words) + (b < x.length ? '…' : '');
  }
  function href(e) {
    var parts = e.u.split('#'), page = parts[0], id = parts[1] || '';
    if (page === here) return id ? '#' + id : '#';
    return page + '.html' + (id ? '#' + id : '');
  }

  function run() {
    var q = norm(input.value).trim();
    sel = -1;
    if (!q) {
      status.textContent = '';
      list.innerHTML = '<li class="rs-sug"><span>' + L('Try:', 'Essayez :') + '</span>' + SUGGEST.map(function (s) { return '<button type="button" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</li>';
      return;
    }
    if (!DATA) return load(run);
    var all = q.split(/\s+/).filter(Boolean);
    var words = all.filter(function (w) { return !STOP[w] && (w.length > 1 || all.length === 1); });   // "filtre de Kalman" → filtre, kalman
    if (!words.length) words = all;
    var res = [];
    DATA.forEach(function (d) { var s = score(d, words); if (s) res.push([s, d]); });
    res.sort(function (a, b) { return b[0] - a[0]; });
    items = res.slice(0, 40);
    status.textContent = res.length ? (res.length + ' ' + L(res.length > 1 ? 'results' : 'result', res.length > 1 ? 'résultats' : 'résultat') + (res.length > 40 ? ' ' + L('(the 40 best are shown)', '(les 40 meilleurs sont affichés)') : ''))
      : L('No result. Try another word, or the word in English.', 'Aucun résultat. Essayez un autre mot, ou le mot en anglais.');
    var T = window.RA_TYPES || {};
    list.innerHTML = items.map(function (r, k) {
      var e = r[1].e, ty = (T[e.k] || ['', ''])[LG];
      var where = e.n ? esc(e.p[LG]) + ' · ' + L('lesson', 'leçon') + ' ' + e.n + (e.m ? ' · ' + e.m + ' min' : '') : (e.u.indexOf('#') > 0 ? esc(e.p[LG]) : '');
      return '<li role="option" id="rs' + k + '"><a href="' + href(e) + '"><span class="rs-meta"><em>' + esc(ty) + '</em>' + where + '</span>' +
        '<b>' + mark(e.t[LG], r[1].t[LG], words) + '</b><span class="rs-snip">' + snippet(r[1], words) + '</span></a></li>';
    }).join('');
  }
  function move(d) {
    var lis = list.querySelectorAll('li[role=option]'); if (!lis.length) return;
    sel = (sel + d + lis.length) % lis.length;
    [].forEach.call(lis, function (li, k) { li.classList.toggle('on', k === sel); li.setAttribute('aria-selected', String(k === sel)); });
    input.setAttribute('aria-activedescendant', 'rs' + sel);
    lis[sel].scrollIntoView({ block: 'nearest' });
  }
  var last = null;
  function open(q) {
    if (!box) build();
    last = document.activeElement;
    box.hidden = false; document.documentElement.classList.add('rs-open');
    if (typeof q === 'string') input.value = q;
    input.focus(); input.select(); run();
    load(function () { if (input.value.trim()) run(); });
  }
  function close() {
    if (!box || box.hidden) return;
    box.hidden = true; document.documentElement.classList.remove('rs-open');
    if (last && last.focus) last.focus();
  }
  RA.openSearch = open;
  RA.closeSearch = close;
})();
