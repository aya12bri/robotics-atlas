// certificate.js — the certificate page: the list of courses with the visitor's progress, and, for a finished course,
// a certificate with the visitor's name, to print or save as PDF. Everything stays in this browser (localStorage).
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0;
    var L = function (en, fr) { return FR ? fr : en; };
    var C = window.RA_COURSES || [], page = document.getElementById('cert');
    // the content is redrawn when the progress changes; the save panel stays (it shows its own messages)
    page.innerHTML = '<div id="certBody"></div>';
    var main = document.getElementById('certBody'), row = document.createElement('div');
    row.className = 'tool-row two'; page.appendChild(row);
    var bk = RA.backupPanel ? RA.backupPanel(row) : null; if (RA.offlinePanel) RA.offlinePanel(row);
    if (bk) bk = row;
    var P = RA.progress || { get: function () { return false; }, all: function () { return {}; } };
    var store = {
      get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
    };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var json = function (k) { try { return JSON.parse(store.get(k) || '{}') || {}; } catch (e) { return {}; } };
    document.title = L('My certificates', 'Mes certificats') + ' — Robotics Atlas';

    function stat(c) {
      var n = 0; for (var i = c.start; i < c.start + c.total; i++) if (P.get(c.prefix + i)) n++;
      var Q = json('ra-quiz'), ok = 0, ans = 0, re = new RegExp('^' + c.prefix.replace(/[-]/g, '\\-') + '(\\d+)-');
      Object.keys(Q).forEach(function (k) { var m = re.exec(k); if (m && +m[1] >= c.start && +m[1] < c.start + c.total) { ans++; if (Q[k] === 1) ok++; } });
      // the final exam (exam.html): needed for the courses that have one
      var hasEx = !!(window.RA_EXAMS && window.RA_EXAMS[c.key]), X = json('ra-exam')[c.key];
      var lessons = n === c.total, exOk = !hasEx || !!(X && X.passed);
      return { n: n, lessons: lessons, done: lessons && exOk, hasEx: hasEx, exam: X ? X.best : null, exOk: exOk, quiz: ans ? Math.round(100 * ok / ans) : null };
    }
    // the "full path" certificate: every course finished
    var PATH = { key: 'path', page: 'index.html#road', t: ['The Robotics Atlas path: every course', 'Le parcours Robotics Atlas : tous les cours'], total: C.reduce(function (a, c) { return a + c.total; }, 0), min: C.reduce(function (a, c) { return a + c.min; }, 0) };
    function pathStat() { var n = 0, all = true; C.forEach(function (c) { var s = stat(c); n += s.n; if (!s.done) all = false; }); return { n: n, done: all, quiz: null }; }

    // a short, stable number for a certificate (not a proof: the progress is declared by the learner)
    function num(name, key, date) {
      var s = name.trim().toLowerCase() + '|' + key + '|' + date, h1 = 0xdeadbeef, h2 = 0x41c6ce57;
      for (var i = 0; i < s.length; i++) { var ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
      var h = ((h2 >>> 0).toString(36) + (h1 >>> 0).toString(36)).toUpperCase().replace(/[^0-9A-Z]/g, '');
      return 'RA-' + key.toUpperCase().slice(0, 6) + '-' + h.slice(0, 4) + '-' + h.slice(4, 8);
    }
    function issued(key) {                                                // the date the certificate was first shown is kept
      var D = json('ra-cert'); if (!D[key]) { D[key] = new Date().toISOString().slice(0, 10); store.set('ra-cert', JSON.stringify(D)); }
      return D[key];
    }
    var fmtDate = function (iso) { var d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString(FR ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
    var hours = function (min) { var h = min / 60; return h < 1.5 ? min + ' min' : (FR ? String(Math.round(h * 2) / 2).replace('.', ',') : Math.round(h * 2) / 2) + ' h'; };
    var name = function () { return (store.get('ra-name') || '').trim(); };

    function list() {
      var ps = pathStat();
      var card = function (c, s) {
        var pct = Math.round(100 * s.n / c.total), cls = s.done ? ' done' : '';
        var act = s.done ? '<a class="btn" href="#' + c.key + '">' + L('See my certificate', 'Voir mon certificat') + ' →</a>'
          : s.lessons && !s.exOk ? '<a class="btn" href="exam.html#' + c.key + '">' + L('Take the final exam', 'Passer l\'examen final') + ' →</a>'
          : '<a class="btn ghost" href="' + c.page + '">' + (s.n ? L('Continue', 'Continuer') : L('Start', 'Commencer')) + ' →</a><span class="cc-left">' + (c.total - s.n) + ' ' + L(c.total - s.n > 1 ? 'lessons left' : 'lesson left', c.total - s.n > 1 ? 'leçons restantes' : 'leçon restante') + '</span>';
        return '<article class="cc' + cls + '" id="c-' + c.key + '"><div class="cc-top"><b>' + esc(c.t[LG]) + '</b>' + (s.done ? '<span class="cc-ok">🎓 ' + L('Finished', 'Terminé') + '</span>' : '') + '</div>' +
          '<div class="cc-bar"><i style="width:' + pct + '%"></i></div><p class="cc-meta">' + s.n + ' / ' + c.total + ' ' + L('lessons', 'leçons') + (c.min ? ' · ' + hours(c.min) : '') + (s.quiz !== null ? ' · ' + L('quiz', 'quiz') + ' ' + s.quiz + ' %' : '') + (s.hasEx ? '<br>' + L('Final exam: ', 'Examen final : ') + (s.exOk ? '✓ ' + s.exam + ' %' : s.exam !== null ? s.exam + ' % (' + L('70 % needed', '70 % requis') + ')' : L('to take', 'à passer')) : '') + '</p><div class="cc-act">' + act + '</div></article>';
      };
      main.innerHTML = '<h1>' + L('My certificates', 'Mes certificats') + '</h1>' +
        '<p class="lead">' + L('Finish all the lessons of a course and pass its final exam (70 %) to get a certificate with your name, to print or save as PDF. Finish every course to get the certificate of the full path.',
          'Terminez toutes les leçons d\'un cours et réussissez son examen final (70 %) pour obtenir un certificat à votre nom, à imprimer ou enregistrer en PDF. Terminez tous les cours pour obtenir le certificat du parcours complet.') + '</p>' +
        '<div class="cert-name"><label for="certName">' + L('Your name, as it will appear on your certificates', 'Votre nom, tel qu\'il apparaîtra sur vos certificats') + '</label><input id="certName" type="text" maxlength="60" autocomplete="name" placeholder="' + L('First name Last name', 'Prénom Nom') + '" value="' + esc(name()) + '"></div>' +
        '<p class="cert-sum">' + L('Courses finished: ', 'Cours terminés : ') + '<b>' + C.filter(function (c) { return stat(c).done; }).length + ' / ' + C.length + '</b></p>' +
        '<div class="cc-grid">' + C.map(function (c) { return card(c, stat(c)); }).join('') + card(PATH, ps).replace('class="cc', 'class="cc cc-path') + '</div>' +
        '<p class="cert-note">' + L('Your progress is kept only in this browser. Save it below so you do not lose it (and your certificates with it).', 'Votre progression est gardée seulement dans ce navigateur. Sauvegardez-la ci-dessous pour ne pas la perdre (ni vos certificats avec).') + '</p>';
      var inp = main.querySelector('#certName');
      inp.addEventListener('input', function () { store.set('ra-name', inp.value.trim()); });
      if (bk) bk.hidden = false;
    }

    function sheet(c, s) {
      var nm = name(), date = issued(c.key);
      var line = c.key === 'path' ? C.length + ' ' + L('courses', 'cours') + ' · ' + c.total + ' ' + L('lessons', 'leçons') + ' · ' + L('about', 'environ') + ' ' + hours(c.min)
        : c.total + ' ' + L('lessons', 'leçons') + (c.min ? ' · ' + L('about', 'environ') + ' ' + hours(c.min) + ' ' + L('of study', 'de travail') : '') + (s.hasEx && s.exam !== null ? ' · ' + L('final exam: ', 'examen final : ') + s.exam + ' %' : s.quiz !== null ? ' · ' + L('end-of-lesson quizzes: ', 'quiz de fin de leçon : ') + s.quiz + ' % ' + L('right answers', 'de bonnes réponses') : '');
      main.innerHTML = '<p class="cert-back"><a href="#">← ' + L('All my certificates', 'Tous mes certificats') + '</a></p>' +
        (nm ? '' : '<div class="cert-name warn"><label for="certName">' + L('Write your name first: it appears on the certificate.', 'Écrivez d\'abord votre nom : il apparaît sur le certificat.') + '</label><input id="certName" type="text" maxlength="60" autocomplete="name" placeholder="' + L('First name Last name', 'Prénom Nom') + '"></div>') +
        '<div class="cert-sheet" role="img" aria-label="' + esc(L('Certificate of completion', 'Certificat de réussite') + ' — ' + c.t[LG]) + '"><div class="cs-in">' +
        '<div class="cs-brand"><svg viewBox="0 0 32 32" width="44" height="44" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#2f6bff"/><path d="M7.5 25.5 L16 7.5 L24.5 25.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.2 19.2 H20.8" stroke="#ff9f43" stroke-width="3.2" stroke-linecap="round"/><circle cx="16" cy="7.5" r="3.1" fill="#fff"/><circle cx="16" cy="7.5" r="1.1" fill="#2f6bff"/></svg><span>Robotics Atlas</span></div>' +
        '<p class="cs-kind">' + L('Certificate of completion', 'Certificat de réussite') + '</p>' +
        '<p class="cs-small">' + L('This certifies that', 'Ce certificat atteste que') + '</p>' +
        '<p class="cs-name">' + (nm ? esc(nm) : '<span class="cs-empty">' + L('Your name', 'Votre nom') + '</span>') + '</p>' +
        '<p class="cs-small">' + (c.key === 'path' ? L('has completed every course of', 'a terminé tous les cours de') : L('has completed the course', 'a terminé le cours')) + '</p>' +
        '<p class="cs-course">' + esc(c.t[LG]) + '</p>' +
        '<p class="cs-line">' + line + '</p>' +
        '<div class="cs-foot"><div><b>' + fmtDate(date) + '</b><span>' + L('Date', 'Date') + '</span></div>' +
        '<div class="cs-seal" aria-hidden="true">🎓</div>' +
        '<div><b>' + num(nm, c.key, date) + '</b><span>' + L('Certificate number', 'N° de certificat') + '</span></div></div>' +
        '<p class="cs-note">' + L('Self-paced online course at roboticsatlas.ayabriksine.com. The progress is recorded by the learner.', 'Cours en ligne en autonomie sur roboticsatlas.ayabriksine.com. La progression est enregistrée par l\'apprenant.') + '</p>' +
        '</div></div>' +
        '<p class="cert-tools"><button type="button" class="btn" id="certPrint">' + L('Print or save as PDF', 'Imprimer ou enregistrer en PDF') + '</button> <span>' + L('In the print window, choose "Save as PDF" and the landscape layout.', 'Dans la fenêtre d\'impression, choisissez « Enregistrer au format PDF » et l\'orientation paysage.') + '</span></p>';
      if (bk) bk.hidden = true;
      var inp = main.querySelector('#certName');
      if (inp) inp.addEventListener('change', function () { store.set('ra-name', inp.value.trim()); render(); });
      main.querySelector('#certPrint').addEventListener('click', function () { if (!name()) { var i = main.querySelector('#certName'); if (i) i.focus(); return; } window.print(); });
    }

    function render() {
      var key = location.hash.slice(1), c = key === 'path' ? PATH : C.filter(function (x) { return x.key === key; })[0];
      document.body.classList.remove('cert-view');
      if (c) {
        var s = key === 'path' ? pathStat() : stat(c);
        if (s.done) { document.body.classList.add('cert-view'); sheet(c, s); window.scrollTo(0, 0); return; }
        list();
        var el = document.getElementById('c-' + c.key);
        if (el) { el.classList.add('focus'); el.insertAdjacentHTML('beforeend', '<p class="cc-msg">' + L('Finish all the lessons of this course to get its certificate.', 'Terminez toutes les leçons de ce cours pour obtenir son certificat.') + '</p>'); setTimeout(function () { el.scrollIntoView({ block: 'center' }); }, 50); }
        return;
      }
      list();
    }
    window.addEventListener('hashchange', render);
    window.addEventListener('ra-progress', function () { if (!document.body.classList.contains('cert-view')) { var y = window.scrollY; render(); window.scrollTo(0, y); } });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
