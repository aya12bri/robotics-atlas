// tutor.js — "Ask the tutor": an AI tutor at the end of every lesson (loaded by lesson-quiz.js on the course pages).
// The question goes to /api/tutor (tools/feedback-worker/tutor.js), which reads the lesson from the site and asks Claude
// to explain it like a teacher; the answer arrives word by word. Nothing is stored on the server; the conversation of each
// lesson is kept in this tab only (sessionStorage). Without the server, or offline, the panel says so and nothing breaks.
(function () {
  var FR = function () { return (window.RA && RA.lang) === 'fr'; };
  var L = function (en, fr) { return FR() ? fr : en; };
  var PAGE = (window.RA && RA.page) || location.pathname.split('/').pop().replace(/(-fr)?\.html$/, '');
  var MAXQ = 1200;
  var esc = function (s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // light Markdown → HTML, on text that is escaped first: paragraphs, lists, **bold**, *italic*, `code` and ``` blocks
  function md(src) {
    var blocks = [], out = [], list = null;
    var s = esc(src).replace(/```[a-z]*\n?([\s\S]*?)(```|$)/g, function (m, code) { blocks.push(code.replace(/\n$/, '')); return '\u0000' + (blocks.length - 1) + '\u0000'; });
    var inline = function (t) { return t.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>'); };
    var close = function () { if (list) { out.push('</' + list + '>'); list = null; } };
    var para = [];
    var flush = function () { if (para.length) { out.push('<p>' + inline(para.join('<br>')) + '</p>'); para = []; } };
    s.split('\n').forEach(function (line) {
      var t = line.trim(), m;
      if (/^\u0000\d+\u0000$/.test(t)) { flush(); close(); out.push('<pre><code>' + blocks[+t.slice(1, -1)] + '</code></pre>'); }
      else if ((m = /^[-•*]\s+(.*)$/.exec(t))) { flush(); if (list !== 'ul') { close(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if ((m = /^\d+[.)]\s+(.*)$/.exec(t))) { flush(); if (list !== 'ol') { close(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if ((m = /^#{1,4}\s+(.*)$/.exec(t))) { flush(); close(); out.push('<p><b>' + inline(m[1]) + '</b></p>'); }
      else if (!t) { flush(); close(); }
      else { close(); para.push(t); }
    });
    flush(); close();
    return out.join('').replace(/\u0000(\d+)\u0000/g, function (m, k) { return '<code>' + blocks[+k] + '</code>'; });
  }

  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.6 3.9L17.5 8.5l-3.9 1.6L12 14l-1.6-3.9L6.5 8.5l3.9-1.6z"/><path d="M18.5 14l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8zM6 15.5l.6 1.4 1.4.6-1.4.6L6 19.5l-.6-1.4-1.4-.6 1.4-.6z"/></svg>';
  var SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>';

  function tutor(art) {
    var lesson = art.id, KEY = 'ra-tutor:' + PAGE + '#' + lesson + ':' + (FR() ? 'fr' : 'en');
    var hist = []; try { hist = JSON.parse(sessionStorage.getItem(KEY) || '[]') || []; } catch (e) { /* private mode */ }
    var save = function () { try { sessionStorage.setItem(KEY, JSON.stringify(hist.slice(-20))); } catch (e) { /* private mode */ } };
    var box = document.createElement('section'); box.className = 'ltutor ra-own';
    var title = (art.querySelector('h2') || {}).textContent || '';
    box.innerHTML =
      '<div class="lt-head"><span class="lt-ic">' + ICON + '</span><div><h3>' + L('A question about this lesson?', 'Une question sur cette leçon ?') + '</h3>' +
      '<p>' + L('The AI tutor explains again, gives a hint for an exercise or checks your calculation.', 'Le tuteur IA réexplique, donne un indice pour un exercice ou vérifie votre calcul.') + '</p></div>' +
      '<button type="button" class="lt-open" aria-expanded="false">' + L('Ask the tutor', 'Demander au tuteur') + '</button></div>' +
      '<div class="lt-panel" hidden>' +
        '<div class="lt-log" role="log" aria-live="polite" aria-label="' + esc(L('Conversation with the tutor', 'Conversation avec le tuteur')) + '"></div>' +
        '<div class="lt-sugg"></div>' +
        '<form class="lt-form"><label class="sr-only" for="lt-q-' + lesson + '">' + L('Your question', 'Votre question') + '</label>' +
          '<textarea id="lt-q-' + lesson + '" rows="2" maxlength="' + MAXQ + '" placeholder="' + esc(L('Ask your question…', 'Posez votre question…')) + '" title="' + esc(L('Enter to send, Shift + Enter for a new line', 'Entrée pour envoyer, Maj + Entrée pour aller à la ligne')) + '"></textarea>' +
          '<button type="submit" class="lt-send" aria-label="' + esc(L('Send', 'Envoyer')) + '">' + SEND + '</button></form>' +
        '<p class="lt-note">' + L('Answers are written by an AI (Claude) from this lesson: check them against the lesson. Do not write personal information.', 'Réponses rédigées par une IA (Claude) à partir de cette leçon : vérifiez-les avec la leçon. N\'écrivez pas d\'informations personnelles.') +
          ' <button type="button" class="lt-clear">' + L('Clear the conversation', 'Effacer la conversation') + '</button></p>' +
      '</div>';
    var open = box.querySelector('.lt-open'), panel = box.querySelector('.lt-panel'), log = box.querySelector('.lt-log'), sugg = box.querySelector('.lt-sugg'),
      form = box.querySelector('form'), ta = form.querySelector('textarea'), send = form.querySelector('.lt-send'), busy = false;

    var SUGG = [
      [L('Explain this lesson more simply', 'Explique-moi cette leçon plus simplement'), L('Explain the main idea of this lesson more simply, with an everyday example.', 'Explique-moi l\'idée principale de cette leçon plus simplement, avec un exemple de la vie courante.')],
      [L('Give me a worked example', 'Donne-moi un exemple chiffré'), L('Give me a short worked example with numbers for this lesson.', 'Donne-moi un court exemple chiffré pour cette leçon.')],
      [L('I am stuck on an exercise', 'Je bloque sur un exercice'), L('I am stuck on an exercise of this lesson. Give me a hint, not the solution.', 'Je bloque sur un exercice de cette leçon. Donne-moi un indice, pas la solution.')],
      [L('Quiz me', 'Pose-moi une question'), L('Ask me one short question to check that I understood this lesson, then wait for my answer.', 'Pose-moi une courte question pour vérifier que j\'ai compris cette leçon, puis attends ma réponse.')]
    ];
    SUGG.forEach(function (s) { var b = document.createElement('button'); b.type = 'button'; b.textContent = s[0]; b.onclick = function () { ask(s[1], s[0]); }; sugg.append(b); });

    function bubble(role, html) {
      var m = document.createElement('div'); m.className = 'lt-msg ' + (role === 'user' ? 'me' : 'ai');
      m.innerHTML = (role === 'user' ? '' : '<span class="lt-av">' + ICON + '</span>') + '<div class="lt-b">' + html + '</div>';
      log.append(m); log.scrollTop = log.scrollHeight; return m.querySelector('.lt-b');
    }
    function paint() {
      log.innerHTML = '';
      bubble('assistant', '<p>' + esc(L('Hello! I know the lesson “', 'Bonjour ! Je connais la leçon « ') + title.replace(/^\s*\d+\s*/, '').trim() + L('”. What would you like to understand better?', ' ». Qu\'aimeriez-vous mieux comprendre ?')) + '</p>');
      hist.forEach(function (m) { bubble(m.role, m.role === 'user' ? '<p>' + esc(m.show || m.text) + '</p>' : md(m.text)); });
      sugg.hidden = hist.length > 0;
    }
    var fail = function (code) {
      return code === 'minute' ? L('Many questions in a short time: wait one minute, then ask again.', 'Beaucoup de questions en peu de temps : attendez une minute, puis reposez votre question.')
        : code === 429 ? L('You have reached the limit of questions for today. Come back tomorrow!', 'Vous avez atteint la limite de questions pour aujourd\'hui. Revenez demain !')
        : code === 'offline' ? L('You are offline: the tutor needs the internet.', 'Vous êtes hors ligne : le tuteur a besoin d\'internet.')
        : code === 'refusal' ? L('I cannot help with this question. Ask me about the lesson.', 'Je ne peux pas aider pour cette question. Posez-moi une question sur la leçon.')
        : L('The tutor is not available right now. Try again in a moment.', 'Le tuteur n\'est pas disponible pour le moment. Réessayez dans un instant.');
    };

    function ask(q, show) {
      q = (q || '').trim().slice(0, MAXQ); if (!q || busy) return;
      busy = true; send.disabled = true; sugg.hidden = true; ta.value = '';
      bubble('user', '<p>' + esc(show || q) + '</p>');
      var out = bubble('assistant', '<span class="lt-dots" aria-label="' + esc(L('The tutor is writing', 'Le tuteur écrit')) + '"><i></i><i></i><i></i></span>');
      var past = hist.slice(-6).map(function (m) { return { role: m.role, text: m.text }; });
      var acc = '', done = function (err) {
        busy = false; send.disabled = false;
        if (err) { out.innerHTML = '<p class="lt-err">' + esc(fail(err)) + '</p>'; return; }
        hist.push({ role: 'user', text: q, show: show }, { role: 'assistant', text: acc }); save();
      };
      if (!navigator.onLine) return done('offline');
      fetch('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ page: PAGE, lesson: lesson, lang: FR() ? 'fr' : 'en', question: q, history: past }) })
        .then(function (r) {
          if (r.status === 429) return r.text().then(function (m) { done(/minute/.test(m) ? 'minute' : 429); });
          if (!r.ok || !r.body || !/text\/plain/.test(r.headers.get('content-type') || '')) return done('down');
          var rd = r.body.getReader(), dec = new TextDecoder();
          var pump = function () {
            return rd.read().then(function (c) {
              if (c.done) {
                if (/\[\[refusal\]\]\s*$/.test(acc)) return done('refusal');
                if (/\[\[error\]\]\s*$/.test(acc) && acc.replace(/\[\[error\]\]\s*$/, '').trim().length < 2) return done('down');
                acc = acc.replace(/\s*\[\[error\]\]\s*$/, ' …'); out.innerHTML = md(acc); return done();
              }
              acc += dec.decode(c.value, { stream: true });
              var near = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
              out.innerHTML = md(acc.replace(/\s*\[\[(refusal|error)\]\]\s*$/, '')) || out.innerHTML;
              if (near) log.scrollTop = log.scrollHeight;
              return pump();
            });
          };
          return pump();
        })
        .catch(function () { done(navigator.onLine ? 'down' : 'offline'); });
    }

    open.onclick = function () {
      var show = panel.hidden; panel.hidden = !show; open.setAttribute('aria-expanded', String(show)); box.classList.toggle('on', show);
      open.textContent = show ? L('Close', 'Fermer') : L('Ask the tutor', 'Demander au tuteur');
      if (show) { paint(); ta.focus({ preventScroll: true }); }
    };
    form.onsubmit = function (e) { e.preventDefault(); ask(ta.value); };
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(ta.value); } });
    box.querySelector('.lt-clear').onclick = function () { if (busy) return; hist = []; save(); paint(); ta.focus(); };
    return box;
  }

  function init() {
    [].slice.call(document.querySelectorAll('article.lesson')).forEach(function (art) {
      if (!/^l\d{1,2}$/.test(art.id) || art.querySelector('.ltutor')) return;
      var at = art.querySelector(':scope > .lfb') || art.querySelector(':scope > .lesson-pager');
      var t = tutor(art); if (at) art.insertBefore(t, at); else art.append(t);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
