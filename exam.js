// exam.js — the final exams (exam.html): one exam per course (exam-data.js), 12 questions, pass mark 70 %.
// Multiple-choice options are shuffled at every attempt; numbers are accepted within a tolerance (comma or dot).
// The best result is kept in this browser (ra-exam) and is used by the certificates.
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0;
    var L = function (en, fr) { return FR ? fr : en; };
    var EX = window.RA_EXAMS || {}, C = window.RA_COURSES || [], main = document.getElementById('exam'), PASS = 0.7;
    var IN_LESSON = { armlab: 'learn-armlab.html#l6', wmrpro: 'learn-mobile-pro.html#l20' };   // these two courses have their exam in their last lesson
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var num = function (v) { var s = String(+(+v).toPrecision(4)); return FR ? s.replace('.', ',') : s; };
    var load = function () { try { return JSON.parse(localStorage.getItem('ra-exam') || '{}') || {}; } catch (e) { return {}; } };
    var save = function (o) { try { localStorage.setItem('ra-exam', JSON.stringify(o)); } catch (e) { /* private mode */ } };
    var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

    function chooser() {
      document.title = L('Final exams', 'Examens finaux') + ' — Robotics Atlas';
      var R = load();
      main.innerHTML = '<h1>' + L('Final exams', 'Examens finaux') + '</h1>' +
        '<p class="lead">' + L('One final exam per course: 12 questions (multiple choice and calculations), corrected at once, with the explanation of every answer. Score 70 % or more to pass. A passed exam, with all the lessons of the course, gives the certificate.', 'Un examen final par cours : 12 questions (QCM et calculs), corrigées tout de suite, avec l\'explication de chaque réponse. Obtenez 70 % ou plus pour réussir. Un examen réussi, avec toutes les leçons du cours, donne le certificat.') + '</p>' +
        '<div class="rev-grid">' + '<a class="rev-card ex-mock" href="#mock"><span class="rev-ic" aria-hidden="true">⏱</span><b>' + L('Mock exam: every course', 'Examen blanc : tous les cours') + '</b><span>' + MOCK_N + ' ' + L('questions', 'questions') + ' · ' + MOCK_MIN + ' min</span>' + (R.mock ? '<span class="ex-badge">' + L('best', 'meilleur') + ' : ' + R.mock.best + ' %</span>' : '') + '<em>' + L('Start', 'Commencer') + ' →</em></a>' + C.map(function (c) {
          var r = R[c.key], has = !!EX[c.key], inl = IN_LESSON[c.key];
          if (!has && !inl) return '';
          var badge = r && r.passed ? '<span class="ex-badge ok">✓ ' + L('passed', 'réussi') + ' · ' + r.best + ' %</span>' : r ? '<span class="ex-badge">' + L('best', 'meilleur') + ' : ' + r.best + ' %</span>' : '';
          return '<a class="rev-card" href="' + (has ? '#' + c.key : inl) + '"><span class="rev-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg></span>' +
            '<b>' + esc(c.t[LG]) + '</b><span>' + (has ? EX[c.key].length + ' ' + L('questions', 'questions') : L('exam and labs in the last lesson', 'examen et TP dans la dernière leçon')) + '</span>' + badge + '<em>' + (has ? (r ? L('Take it again', 'Le repasser') : L('Take the exam', 'Passer l\'examen')) : L('Open the lesson', 'Ouvrir la leçon')) + ' →</em></a>';
        }).join('') + '</div>';
    }

    // mock exam: 20 questions drawn from every course, 30 minutes
    var MOCK_N = 20, MOCK_MIN = 30, timer = 0;
    function mockItems() { var all = []; Object.keys(EX).forEach(function (k) { EX[k].forEach(function (q, i) { all.push({ q: q, id: k + ':' + i, c: k }); }); }); return shuffle(all).slice(0, MOCK_N); }
    // wrong answers go to the spaced-repetition reviews (review.html, key ra-srs)
    function toReview(ids) {
      if (!ids.length) return; var S = {};
      try { S = JSON.parse(localStorage.getItem('ra-srs') || '{}') || {}; } catch (e) { /* */ }
      var today = new Date().toISOString().slice(0, 10);
      ids.forEach(function (id) { S[id] = { box: 0, due: today }; });
      try { localStorage.setItem('ra-srs', JSON.stringify(S)); } catch (e) { /* private mode */ }
    }
    function exam(key) {
      clearInterval(timer);
      var mock = key === 'mock';
      var c = mock ? { t: [L('Mock exam: every course', 'Examen blanc : tous les cours'), L('Mock exam: every course', 'Examen blanc : tous les cours')], page: 'index.html#road' } : (C.filter(function (x) { return x.key === key; })[0] || { t: [key, key], page: '' });
      var items = mock ? mockItems() : EX[key].map(function (q, i) { return { q: q, id: key + ':' + i, c: key }; }), Q = items.map(function (it) { return it.q; });
      var nameOf = function (k) { var cc = C.filter(function (x) { return x.key === k; })[0]; return cc ? cc.t[LG] : k; };
      document.title = (mock ? c.t[LG] : L('Final exam', 'Examen final') + ' · ' + c.t[LG]) + ' — Robotics Atlas';
      var lessonsDone = function () { var P = RA.progress; if (!P || !c.prefix) return false; for (var i = c.start; i < c.start + c.total; i++) if (!P.get(c.prefix + i)) return false; return true; };
      var order = Q.map(function (q) { return q.o ? shuffle(q.o.map(function (_, i) { return i; })) : null; });
      main.innerHTML = '<p class="cert-back"><a href="#">← ' + L('All the exams', 'Tous les examens') + '</a></p>' +
        '<h1>' + (mock ? esc(c.t[LG]) : L('Final exam', 'Examen final') + ' · ' + esc(c.t[LG])) + '</h1>' +
        (mock ? '<p class="lead">' + L(MOCK_N + ' questions drawn at random from every course, ' + MOCK_MIN + ' minutes. When the time is up, the exam is checked as it is. Each attempt draws new questions.', MOCK_N + ' questions tirées au hasard dans tous les cours, ' + MOCK_MIN + ' minutes. À la fin du temps, l\'examen est corrigé tel quel. Chaque tentative tire de nouvelles questions.') + '</p><p class="ex-timer" aria-live="off"></p>' : '') +
        '<p class="lead"' + (mock ? ' hidden' : '') + '>' + L(Q.length + ' questions, no time limit. Use a calculator and paper for the calculations, then check your answers at the end. Pass mark: 70 %.', Q.length + ' questions, sans limite de temps. Utilisez une calculatrice et du papier pour les calculs, puis faites corriger à la fin. Pour réussir : 70 %.') + '</p>' +
        '<ol class="ex-list">' + Q.map(function (q, k) {
          var body = q.o ? '<div class="ex-opts" role="radiogroup">' + order[k].map(function (i) { return '<label><input type="radio" name="q' + k + '" value="' + i + '"> <span>' + esc(q.o[i][LG]) + '</span></label>'; }).join('') + '</div>'
            : '<label class="ex-num"><input type="text" inputmode="decimal" name="q' + k + '" autocomplete="off" placeholder="' + L('your answer', 'votre réponse') + '"> <span>' + esc(q.u || '') + '</span></label>';
          return '<li class="ex-q" data-k="' + k + '">' + (mock ? '<p class="ex-from">' + esc(nameOf(items[k].c)) + '</p>' : '') + '<p class="ex-text">' + esc(q.q[LG]) + '</p>' + body + '<div class="ex-fb" hidden></div></li>';
        }).join('') + '</ol>' +
        '<div class="ex-bar"><button type="button" class="btn" id="exCheck">' + L('Check my exam', 'Corriger mon examen') + '</button><span class="ex-left"></span></div><div class="ex-result" hidden></div>';
      var left = main.querySelector('.ex-left');
      var answered = function () { var n = 0; Q.forEach(function (q, k) { var el = main.querySelector('[name="q' + k + '"]' + (q.o ? ':checked' : '')); if (el && (q.o || el.value.trim())) n++; }); return n; };
      var paintLeft = function () { var n = answered(); left.textContent = n + ' / ' + Q.length + ' ' + L('answered', 'répondues'); };
      main.addEventListener('input', paintLeft); main.addEventListener('change', paintLeft); paintLeft();
      var check = function (force) {
        clearInterval(timer);
        if (!force && answered() < Q.length && !confirm(L('Some questions have no answer. Check anyway?', 'Certaines questions n\'ont pas de réponse. Corriger quand même ?'))) return;
        var ok = 0, wrong = [];
        Q.forEach(function (q, k) {
          var li = main.querySelector('.ex-q[data-k="' + k + '"]'), fb = li.querySelector('.ex-fb'), good, right;
          if (q.o) { var el = li.querySelector('input:checked'); good = !!el && +el.value === q.a; right = q.o[q.a][LG]; li.querySelectorAll('label').forEach(function (lb) { var v = +lb.querySelector('input').value; lb.classList.toggle('right', v === q.a); lb.classList.toggle('wrong', !!el && v === +el.value && v !== q.a); }); }
          else { var raw = li.querySelector('input').value.trim().replace(',', '.').replace(/\s/g, ''), v = parseFloat(raw); good = raw !== '' && isFinite(v) && Math.abs(v - q.n) <= q.tol; right = num(q.n) + (q.u ? ' ' + q.u : ''); }
          if (good) ok++; else wrong.push(items[k].id);
          li.classList.add(good ? 'ok' : 'bad'); li.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
          fb.hidden = false; fb.innerHTML = '<b>' + (good ? '✓ ' + L('Right', 'Juste') : '✗ ' + L('Answer: ', 'Réponse : ') + esc(right)) + '</b> ' + esc(q.e[LG]);
        });
        toReview(wrong);
        var pct = Math.round(100 * ok / Q.length), passed = ok / Q.length >= PASS, R = load(), prev = R[key];
        if (mock) { R.mock = { best: Math.max(pct, prev ? prev.best : 0) }; save(R); }
        else R[key] = { best: Math.max(pct, prev ? prev.best : 0), passed: passed || !!(prev && prev.passed), date: (prev && prev.passed && prev.date) || (passed ? new Date().toISOString().slice(0, 10) : '') };
        if (!mock) save(R); window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id: null } }));
        var res = main.querySelector('.ex-result');
        res.hidden = false; res.className = 'ex-result ' + (passed ? 'ok' : 'bad');
        var revNote = wrong.length ? '<p>' + L(wrong.length + ' missed question(s) were added to <a href="review.html">my reviews</a>: they will come back in the next days.', wrong.length + ' question(s) ratée(s) ont été ajoutées à <a href="review.html">mes révisions</a> : elles reviendront dans les prochains jours.') + '</p>' : '';
        if (mock) { res.hidden = false; res.className = 'ex-result ' + (passed ? 'ok' : 'bad'); res.innerHTML = '<p class="ex-score"><b>' + ok + ' / ' + Q.length + '</b> · ' + pct + ' %</p><p>' + L('Best mock exam: ', 'Meilleur examen blanc : ') + R.mock.best + ' %</p>' + revNote + '<p class="ex-act"><button type="button" class="btn" id="exAgain">' + L('New mock exam', 'Nouvel examen blanc') + '</button></p>'; main.querySelector('#exCheck').hidden = true; left.textContent = ''; var tm = main.querySelector('.ex-timer'); if (tm) tm.textContent = ''; main.querySelector('#exAgain').addEventListener('click', function () { exam(key); window.scrollTo(0, 0); }); res.scrollIntoView({ block: 'center' }); return; }
        res.innerHTML = revNote.replace(/^/, '') + '<p class="ex-score"><b>' + ok + ' / ' + Q.length + '</b> · ' + pct + ' %</p><p>' + (passed ? (lessonsDone() ? L('Passed! Your certificate is ready.', 'Réussi ! Votre certificat est prêt.') : L('Passed! Finish all the lessons of the course to get its certificate.', 'Réussi ! Terminez toutes les leçons du cours pour obtenir son certificat.')) : L('Not yet: 70 % are needed. Read the explanations, review the lessons, and try again.', 'Pas encore : il faut 70 %. Lisez les explications, revoyez les leçons, et réessayez.')) + '</p>' +
          '<p class="ex-act"><button type="button" class="btn" id="exAgain">' + L('Take it again', 'Recommencer') + '</button> ' + (passed ? '<a class="btn ghost" href="certificate.html#' + key + '">🎓 ' + L('My certificate', 'Mon certificat') + '</a> ' : '') + '<a class="btn ghost" href="' + c.page + '">' + L('Review the course', 'Revoir le cours') + '</a></p>';
        main.querySelector('#exCheck').hidden = true; left.textContent = '';
        main.querySelector('#exAgain').addEventListener('click', function () { exam(key); window.scrollTo(0, 0); });
        res.scrollIntoView({ block: 'center' });
      };
      main.querySelector('#exCheck').addEventListener('click', function () { check(false); });
      if (mock) {
        var end = Date.now() + MOCK_MIN * 60000, tm = main.querySelector('.ex-timer');
        var tick = function () { var r = Math.max(0, end - Date.now()), m = Math.floor(r / 60000), sec = Math.floor(r / 1000) % 60; tm.textContent = '⏱ ' + m + ':' + (sec < 10 ? '0' : '') + sec; tm.classList.toggle('low', r < 5 * 60000); if (r <= 0) check(true); };
        tick(); timer = setInterval(tick, 1000);
      }
    }

    function render() { var k = location.hash.slice(1); if (EX[k] || k === 'mock') exam(k); else { clearInterval(timer); chooser(); } window.scrollTo(0, 0); }
    window.addEventListener('hashchange', render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
