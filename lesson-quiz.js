// lesson-quiz.js — on every course page:
//  * turns the "Check yourself" block of each lesson into a scored end-of-lesson quiz
//    (multiple-choice questions are checked automatically; for open questions the learner reveals the answer and says if they had it right);
//    passing the quiz marks the lesson as done;
//  * adds "previous / next lesson" buttons at the end of each lesson (the last one leads to the next course).
(function () {
  var FR = function () { return (window.RA && RA.lang) === 'fr'; };
  var L = function (en, fr) { return FR() ? fr : en; };
  var KEY = 'ra-quiz';
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  var ST = load();
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { /* private mode */ } };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var PASS = 0.6;   // share of right answers needed to pass

  function quiz(det, lesson) {
    var lid = lesson.dataset.id || lesson.id, ol = det.querySelector('.qa'); if (!ol) return;
    var box = el('section', 'lquiz');
    box.append(el('h3', '', L('End-of-lesson quiz', 'Quiz de fin de leçon')),
      el('p', 'lqnote', L('Answer every question. Multiple-choice questions are checked at once; for the others, think of your answer, then reveal it and say honestly if you had it right.',
        'Répondez à chaque question. Les QCM sont corrigés tout de suite ; pour les autres, pensez à votre réponse, puis affichez-la et dites honnêtement si vous aviez juste.')));
    var score = el('p', 'lqscore'); score.setAttribute('aria-live', 'polite');
    box.append(ol, score);
    var again = el('button', 'lqagain', L('Start the quiz again', 'Recommencer le quiz')); again.type = 'button';
    box.append(again);
    det.parentNode.replaceChild(box, det);
    var items = [].slice.call(ol.children).filter(function (li) { return li.tagName === 'LI'; });
    var ids = items.map(function (li, k) { return li.dataset.id || (lid + '-o' + (k + 1)); });

    function paint() {
      var ok = 0, done = 0;
      ids.forEach(function (id) { if (ST[id] !== undefined) done++; if (ST[id] === 1) ok++; });
      var all = done === ids.length, passed = all && ok >= Math.ceil(PASS * ids.length);
      score.className = 'lqscore' + (all ? (passed ? ' ok' : ' bad') : '');
      score.innerHTML = L('Score: ', 'Score : ') + '<b>' + ok + ' / ' + ids.length + '</b>' + (all ? ' — ' + (passed
        ? L('Well done! The lesson is marked as done: go on to the next one below.', 'Bravo ! La leçon est marquée comme terminée : passez à la suivante ci-dessous.')
        : L('Read the lesson again (and the worked exercises), then start the quiz again.', 'Relisez la leçon (et les exercices corrigés), puis recommencez le quiz.')) : ' (' + done + '/' + ids.length + ' ' + L('answered', 'répondues') + ')');
      again.style.display = done ? '' : 'none';
      if (passed) { var cb = lesson.querySelector('.lesson-done input'); if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); } }
    }
    function set(id, v) { ST[id] = v; save(); paint(); }

    items.forEach(function (li, k) {
      var id = ids[k], ans = li.querySelector('.a'), fb = li.querySelector('.fb');
      if (!fb) { fb = el('p', 'fb'); fb.setAttribute('aria-live', 'polite'); li.insertBefore(fb, ans); }
      var opts = li.querySelector('.opts');
      if (opts) {                                                       // multiple choice: checked at once, first answer counts
        var lis = [].slice.call(opts.children);
        var show = function (picked) {
          opts.classList.add('locked'); ans.hidden = false;
          lis.forEach(function (o) { o.classList.toggle('right', o.hasAttribute('data-ok')); o.classList.toggle('wrong', o === picked && !o.hasAttribute('data-ok')); });
          var good = ST[id] === 1; fb.className = 'fb ' + (good ? 'ok' : 'bad'); fb.textContent = good ? '✓ ' + L('Correct!', 'Correct !') : '✗ ' + L('Not this one: the right answer is in green.', 'Pas celle-ci : la bonne réponse est en vert.');
        };
        ans.hidden = true;
        lis.forEach(function (o) {
          o.tabIndex = 0; o.setAttribute('role', 'button');
          var pick = function () { if (opts.classList.contains('locked')) return; set(id, o.hasAttribute('data-ok') ? 1 : 0); show(o); };
          o.addEventListener('click', pick); o.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        });
        li._reset = function () { opts.classList.remove('locked'); ans.hidden = true; fb.className = 'fb'; fb.textContent = ''; lis.forEach(function (o) { o.classList.remove('right', 'wrong'); }); };
        if (ST[id] !== undefined) show(null);
      } else {                                                          // open question: reveal, then self-assess
        var row = el('p', 'lqbtns'), see = el('button', '', L('Show the answer', 'Voir la réponse')), yes = el('button', 'yes', '✓ ' + L('I had it right', 'J\'avais juste')), no = el('button', 'no', '✗ ' + L('Not yet', 'Pas encore'));
        [see, yes, no].forEach(function (b) { b.type = 'button'; });
        row.append(see, yes, no); li.insertBefore(row, ans);
        var state = function () {
          var v = ST[id], open = v !== undefined || li._open;
          ans.hidden = !open; see.style.display = open ? 'none' : ''; yes.style.display = no.style.display = open && v === undefined ? '' : 'none';
          fb.className = 'fb' + (v === 1 ? ' ok' : v === 0 ? ' bad' : ''); fb.textContent = v === 1 ? '✓ ' + L('Right.', 'Juste.') : v === 0 ? '✗ ' + L('Read the answer carefully, it will come back in the next lessons.', 'Lisez bien la réponse, elle reviendra dans les leçons suivantes.') : '';
        };
        see.addEventListener('click', function () { li._open = true; state(); });
        yes.addEventListener('click', function () { set(id, 1); state(); });
        no.addEventListener('click', function () { set(id, 0); state(); });
        li._reset = function () { li._open = false; state(); };
        state();
      }
    });
    again.addEventListener('click', function () { ids.forEach(function (id) { delete ST[id]; }); save(); items.forEach(function (li) { li._reset(); }); paint(); });
    paint();
  }

  function pager(lessons) {
    var cur = document.querySelector('.courses .course.current'), next = cur && cur.nextElementSibling;
    while (next && !(next.classList && next.classList.contains('course'))) next = next.nextElementSibling;
    lessons.forEach(function (art, i) {
      var nav = el('nav', 'lesson-pager'); nav.setAttribute('aria-label', L('Lessons', 'Leçons'));
      if (i > 0) { var p = el('a', 'prev', '← ' + L('Previous lesson', 'Leçon précédente')); p.href = '#' + lessons[i - 1].id; nav.append(p); }
      else nav.append(el('span'));
      var n = el('a', 'next');
      if (i < lessons.length - 1) { n.href = '#' + lessons[i + 1].id; n.innerHTML = '<small>' + L('Next lesson', 'Leçon suivante') + ' →</small><b><span>' + (i + 2) + '.</span> <span>' + lessons[i + 1].querySelector('h2').innerHTML + '</span></b>'; }
      else if (next) { n.href = next.getAttribute('href'); n.innerHTML = '<small>' + L('Last lesson done? Next course', 'Dernière leçon finie ? Cours suivant') + ' →</small><b><span>' + next.querySelector('b').innerHTML + '</span></b>'; }
      else { n.href = 'index.html#road'; n.innerHTML = '<small>' + L('All lessons done?', 'Toutes les leçons finies ?') + '</small><b>' + L('Back to the roadmap', 'Retour au parcours') + ' →</b>'; }
      nav.append(n);
      art.append(nav);
    });
  }

  function init() {
    var lessons = [].slice.call(document.querySelectorAll('article.lesson'));
    if (!lessons.length) return;
    lessons.forEach(function (art) { var d = art.querySelector('details.quiz'); if (d) quiz(d, art); });
    pager(lessons);
    oneAtATime(lessons);
  }

  // only one lesson is shown at a time; "next lesson", the checklist and #lN links switch the lesson
  function oneAtATime(lessons) {
    var box = lessons[0].parentNode, after = [].slice.call(box.children).filter(function (e) { return e.tagName === 'SECTION' && e.compareDocumentPosition(lessons[lessons.length - 1]) & Node.DOCUMENT_POSITION_PRECEDING; });
    var nav = document.getElementById('lessonNav'), SK = 'ra-cur:' + location.pathname.split('/').pop(), cur = -1;
    var idx = function (hash) { for (var i = 0; i < lessons.length; i++) if ('#' + lessons[i].id === hash) return i; return -1; };
    function mark() { if (nav) [].forEach.call(nav.querySelectorAll('li'), function (li, i) { li.classList.toggle('on', i === cur); }); }
    function show(i, scroll) {
      if (i < 0 || i >= lessons.length) return;
      cur = i;
      lessons.forEach(function (l, k) { l.hidden = k !== i; });
      after.forEach(function (e) { e.hidden = i !== lessons.length - 1; });
      mark();
      try { localStorage.setItem(SK, String(i)); } catch (e) { /* private mode */ }
      if (location.hash !== '#' + lessons[i].id) history.replaceState(null, '', '#' + lessons[i].id);
      window.dispatchEvent(new Event('resize'));
      if (scroll) {
        var y = Math.max(0, lessons[i].getBoundingClientRect().top + window.scrollY - 90);
        if (window.RA && RA.smoothTo) RA.smoothTo(y); else window.scrollTo(0, y);
      }
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      var i = idx(a.getAttribute('href')); if (i < 0) return;
      e.preventDefault(); show(i, true);
    }, true);                                                         // capture: before the generic smooth-scroll of nav.js
    window.addEventListener('hashchange', function () { var i = idx(location.hash); if (i >= 0 && i !== cur) show(i, true); });
    window.addEventListener('scroll', mark, { passive: true });     // the page's own scroll-spy does not know about hidden lessons
    var start = idx(location.hash), saved = -1;
    try { saved = +localStorage.getItem(SK); } catch (e) { /* private mode */ }
    if (start >= 0) { show(start, false); requestAnimationFrame(function () { lessons[start].scrollIntoView({ behavior: 'instant', block: 'start' }); }); }
    else show(saved > 0 && saved < lessons.length ? saved : 0, false);
  }
  // after the page's own DOMContentLoaded handlers (they listen for the "lesson done" checkbox)
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', init); else init();
})();
