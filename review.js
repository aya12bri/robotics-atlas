// review.js — spaced repetition (review.html) over the question bank of the final exams (exam-data.js).
// Each card has a box 0–5; a right answer moves it up and sets its next date (+1, 3, 7, 16, 35 days), a wrong one
// sends it back to box 0 (again today). State in this browser: ra-srs { "course:index": { box, due } }.
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0;
    var L = function (en, fr) { return FR ? fr : en; };
    var EX = window.RA_EXAMS || {}, C = (window.RA_COURSES || []).filter(function (c) { return EX[c.key]; }), main = document.getElementById('rv');
    var GAP = [0, 1, 3, 7, 16, 35], SESSION = 20, NEW = 5;
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var num = function (v) { var s = String(+(+v).toPrecision(4)); return FR ? s.replace('.', ',') : s; };
    var day = function (d) { var t = new Date(); t.setDate(t.getDate() + (d || 0)); return t.toISOString().slice(0, 10); };
    var load = function () { try { return JSON.parse(localStorage.getItem('ra-srs') || '{}') || {}; } catch (e) { return {}; } };
    var save = function (S) { try { localStorage.setItem('ra-srs', JSON.stringify(S)); } catch (e) { /* private mode */ } };
    var card = function (id) { var p = id.split(':'), Q = EX[p[0]]; return Q ? Q[+p[1]] : null; };
    var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    var cname = function (k) { var c = C.filter(function (x) { return x.key === k; })[0]; return c ? c.t[LG] : k; };
    document.title = L('My reviews', 'Mes révisions') + ' — Robotics Atlas';

    function home() {
      var S = load(), ids = Object.keys(S).filter(card), today = day();
      var due = ids.filter(function (id) { return S[id].due <= today; });
      var mastered = ids.filter(function (id) { return S[id].box >= 4; }).length;
      var week = []; for (var d = 1; d <= 7; d++) { var dd = day(d); week.push(ids.filter(function (id) { return S[id].due === dd; }).length); }
      var max = Math.max(1, Math.max.apply(null, week));
      main.innerHTML = '<h1>' + L('My reviews', 'Mes révisions') + '</h1>' +
        '<p class="lead">' + L('Spaced repetition is the most effective way to remember: a question comes back just before you would forget it (1, 3, 7, 16, then 35 days later). A few minutes a day are enough.', 'La révision espacée est la façon la plus efficace de retenir : une question revient juste avant que vous ne l\'oubliiez (1, 3, 7, 16, puis 35 jours plus tard). Quelques minutes par jour suffisent.') + '</p>' +
        '<div class="rv-stats"><div><b>' + due.length + '</b><span>' + L('to review today', 'à réviser aujourd\'hui') + '</span></div><div><b>' + ids.length + '</b><span>' + L('questions in my deck', 'questions dans mon paquet') + '</span></div><div><b>' + mastered + '</b><span>' + L('well known (16 days or more)', 'bien sues (16 jours ou plus)') + '</span></div>' +
        '<div class="rv-week" aria-label="' + L('The next 7 days', 'Les 7 prochains jours') + '">' + week.map(function (n, i) { return '<i style="height:' + (8 + 40 * n / max) + 'px" title="' + n + '"></i>'; }).join('') + '<span>' + L('next 7 days', '7 prochains jours') + '</span></div></div>' +
        (due.length ? '<p><button type="button" class="btn" id="rvGo">' + L('Start the review', 'Commencer la révision') + ' (' + Math.min(due.length, SESSION) + ')</button></p>' : '<p class="rv-none">' + (ids.length ? L('Nothing to review today: come back tomorrow, or add new questions below.', 'Rien à réviser aujourd\'hui : revenez demain, ou ajoutez de nouvelles questions ci-dessous.') : L('Your deck is empty. Add questions from the courses you are studying: they also come in by themselves when you miss a question in a final exam.', 'Votre paquet est vide. Ajoutez des questions des cours que vous étudiez : elles arrivent aussi toutes seules quand vous ratez une question à un examen final.')) + '</p>') +
        '<h2>' + L('Add questions', 'Ajouter des questions') + '</h2><div class="rv-add">' + C.map(function (c) {
          var inDeck = EX[c.key].filter(function (_, i) { return S[c.key + ':' + i]; }).length;
          return '<div class="rv-c"><b>' + esc(c.t[LG]) + '</b><span>' + inDeck + ' / ' + EX[c.key].length + '</span>' + (inDeck < EX[c.key].length ? '<button type="button" class="btn sm ghost" data-add="' + c.key + '">+ ' + Math.min(NEW, EX[c.key].length - inDeck) + '</button>' : '<em>✓</em>') + '</div>';
        }).join('') + '</div>' +
        (ids.length ? '<p class="rv-reset"><button type="button" class="linkish" id="rvReset">' + L('Empty my deck', 'Vider mon paquet') + '</button></p>' : '');
      var go = main.querySelector('#rvGo'); if (go) go.addEventListener('click', function () { session(shuffle(due).slice(0, SESSION)); });
      main.querySelectorAll('[data-add]').forEach(function (b) { b.addEventListener('click', function () {
        var k = b.dataset.add, S2 = load(), n = 0;
        EX[k].forEach(function (_, i) { var id = k + ':' + i; if (!S2[id] && n < NEW) { S2[id] = { box: 0, due: day() }; n++; } });
        save(S2); home();
      }); });
      var rs = main.querySelector('#rvReset'); if (rs) rs.addEventListener('click', function () { if (confirm(L('Remove every question from your deck?', 'Retirer toutes les questions de votre paquet ?'))) { save({}); home(); } });
    }

    function session(queue) {
      var done = 0, right = 0, again = {};
      var next = function () {
        if (!queue.length) {
          main.innerHTML = '<h1>' + L('Review done', 'Révision terminée') + '</h1><p class="lead">' + L(right + ' right out of ' + done + ' answers. The missed ones come back tomorrow.', right + ' justes sur ' + done + ' réponses. Les ratées reviennent demain.') + '</p><p><button type="button" class="btn" id="rvHome">' + L('Back to my reviews', 'Retour à mes révisions') + '</button></p>';
          main.querySelector('#rvHome').addEventListener('click', home); return;
        }
        var id = queue.shift(), q = card(id), k = id.split(':')[0], order = q.o ? shuffle(q.o.map(function (_, i) { return i; })) : null;
        main.innerHTML = '<p class="cert-back"><button type="button" class="linkish" id="rvStop">← ' + L('Stop', 'Arrêter') + '</button> · ' + (queue.length + 1) + ' ' + L('left', 'restantes') + '</p>' +
          '<div class="rv-card"><p class="ex-from">' + esc(cname(k)) + '</p><p class="ex-text">' + esc(q.q[LG]) + '</p>' +
          (q.o ? '<div class="ex-opts">' + order.map(function (i) { return '<label><input type="radio" name="rv" value="' + i + '"> <span>' + esc(q.o[i][LG]) + '</span></label>'; }).join('') + '</div>'
            : '<label class="ex-num"><input type="text" inputmode="decimal" autocomplete="off" placeholder="' + L('your answer', 'votre réponse') + '"> <span>' + esc(q.u || '') + '</span></label>') +
          '<div class="ex-fb" hidden></div><p class="ex-act"><button type="button" class="btn" id="rvCheck">' + L('Check', 'Vérifier') + '</button></p></div>';
        main.querySelector('#rvStop').addEventListener('click', home);
        var inp = main.querySelector('.ex-num input'); if (inp) { inp.focus(); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') main.querySelector('#rvCheck').click(); }); }
        var checked = false;
        main.querySelector('#rvCheck').addEventListener('click', function () {
          if (checked) return next();
          var good, ans;
          if (q.o) { var el = main.querySelector('input[name=rv]:checked'); if (!el) return; good = +el.value === q.a; ans = q.o[q.a][LG];
            main.querySelectorAll('.ex-opts label').forEach(function (lb) { var v = +lb.querySelector('input').value; lb.classList.toggle('right', v === q.a); lb.classList.toggle('wrong', v === +el.value && v !== q.a); }); }
          else { var raw = inp.value.trim().replace(',', '.').replace(/\s/g, ''); if (!raw) return; var v = parseFloat(raw); good = isFinite(v) && Math.abs(v - q.n) <= q.tol; ans = num(q.n) + (q.u ? ' ' + q.u : ''); }
          main.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
          var S = load(), c = S[id] || { box: 0 };
          if (!again[id]) { done++; if (good) right++; }
          if (good && !again[id]) { c.box = Math.min(5, c.box + 1); c.due = day(GAP[c.box]); }
          else if (!good) { c.box = 0; c.due = day(1); if (!again[id]) { again[id] = 1; queue.push(id); } }   // once more at the end of this session, then tomorrow
          S[id] = c; save(S);
          var fb = main.querySelector('.ex-fb'); fb.hidden = false; fb.className = 'ex-fb ' + (good ? 'ok' : 'bad');
          fb.innerHTML = '<b>' + (good ? '✓ ' + L('Right', 'Juste') + ' · ' + L('next time in ' + GAP[c.box] + ' days', 'prochaine fois dans ' + GAP[c.box] + ' jours') : '✗ ' + L('Answer: ', 'Réponse : ') + esc(ans)) + '</b> ' + esc(q.e[LG]);
          checked = true; var b = main.querySelector('#rvCheck'); b.textContent = L('Next', 'Suivante') + ' →'; b.focus();
        });
      };
      next();
    }
    home();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
