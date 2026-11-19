// tutor.js — the AI tutor: a small robot on the side of every page of the site (loaded by nav.js).
// It asks "Do you have a question?"; a click opens a chat about the lesson shown on the screen (course pages)
// or about the page itself (robots, tools, home…). The question goes to
// /api/tutor (tools/feedback-worker/tutor.js), which reads the lesson from the site and asks an AI model to explain it
// like a teacher; the answer arrives word by word. Nothing is stored on the server; the conversation of each lesson is
// kept in this tab only (sessionStorage). Without the server, or offline, the panel says so and nothing breaks.
// Test mode: open a course page with ?tutor-debug to see under each answer which model wrote it (Gemini or Claude).
(function () {
  var FR = function () { return (window.RA && RA.lang) === 'fr'; };
  var L = function (en, fr) { return FR() ? fr : en; };
  var PAGE = (window.RA && RA.page) || location.pathname.split('/').pop().replace(/(-fr)?\.html$/, '');
  var MAXQ = 1200;
  var esc = function (s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = function (k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } return null; };
  var DEBUG = /[?&]tutor-debug\b/.test(location.search);
  try { if (DEBUG) localStorage.setItem('ra-tutor-debug', '1'); else DEBUG = localStorage.getItem('ra-tutor-debug') === '1'; } catch (e) { /* private mode */ }

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

  // the robot: a 3D mascot rendered once into a strip of pictures (thumbs/tutor-robot.webp, tools/build-tutor-robot.mjs);
  // CSS shows one picture at a time to make it blink and wave
  var ROBOT = '<span class="rb-face" aria-hidden="true"></span>';
  var SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>';

  function init() {
    var lessons = [].slice.call(document.querySelectorAll('article.lesson')).filter(function (a) { return /^l\d{1,2}$/.test(a.id); });
    if (document.querySelector('.rbot')) return;
    var root = document.createElement('div'); root.className = 'rbot ra-own';
    root.innerHTML =
      '<div class="rb-bubble" hidden><button type="button" class="rb-x" aria-label="' + esc(L('Hide', 'Masquer')) + '">×</button>' +
        '<button type="button" class="rb-ask">' + L('Do you have any questions?', 'Avez-vous une question ?') + '</button></div>' +
      '<section class="rb-panel" role="dialog" aria-modal="false" hidden>' +
        '<header class="rb-head"><span class="rb-mini">' + ROBOT + '</span><div><b>' + L('AI tutor', 'Tuteur IA') + '</b><small class="rb-lesson"></small></div>' +
          '<button type="button" class="rb-close" aria-label="' + esc(L('Close', 'Fermer')) + '">×</button></header>' +
        '<div class="rb-log" role="log" aria-live="polite"></div>' +
        '<div class="rb-sugg"></div>' +
        '<form class="rb-form"><label class="sr-only" for="rb-q">' + L('Your question', 'Votre question') + '</label>' +
          '<textarea id="rb-q" rows="1" maxlength="' + MAXQ + '" placeholder="' + esc(L('Ask your question…', 'Posez votre question…')) + '" title="' + esc(L('Enter to send, Shift + Enter for a new line', 'Entrée pour envoyer, Maj + Entrée pour aller à la ligne')) + '"></textarea>' +
          '<button type="submit" class="rb-send" aria-label="' + esc(L('Send', 'Envoyer')) + '">' + SEND + '</button></form>' +
        '<p class="rb-note">' + (lessons.length ? L('Answers are written by an AI from this lesson: check them against the lesson. Do not write personal information.', 'Réponses rédigées par une IA à partir de cette leçon : vérifiez-les avec la leçon. N\'écrivez pas d\'informations personnelles.')
          : L('Answers are written by an AI from this page: check them. Do not write personal information.', 'Réponses rédigées par une IA à partir de cette page : vérifiez-les. N\'écrivez pas d\'informations personnelles.')) +
          ' <button type="button" class="rb-clear">' + L('Clear', 'Effacer') + '</button></p>' +
      '</section>' +
      '<button type="button" class="rb-btn" aria-expanded="false" aria-label="' + esc(L('Ask the AI tutor a question', 'Poser une question au tuteur IA')) + '">' + ROBOT + '</button>';
    document.body.append(root);
    var $ = function (s) { return root.querySelector(s); };
    var btn = $('.rb-btn'), bubble = $('.rb-bubble'), panel = $('.rb-panel'), log = $('.rb-log'), sugg = $('.rb-sugg'), form = $('.rb-form'), ta = $('textarea'), send = $('.rb-send'), lname = $('.rb-lesson');
    panel.setAttribute('aria-label', L('AI tutor', 'Tuteur IA'));

    var cur = null, busy = false;
    // course pages: the lesson shown on the screen; other pages: the page itself (null)
    var current = function () { for (var i = 0; i < lessons.length; i++) if (!lessons[i].hidden) return lessons[i]; return lessons[0] || null; };
    var KEY = function (art) { return 'ra-tutor:' + PAGE + '#' + (art ? art.id : 'page') + ':' + (FR() ? 'fr' : 'en'); };
    var load = function (art) { try { return JSON.parse(store(KEY(art)) || '[]') || []; } catch (e) { return []; } };
    var titleOf = function (art) {
      if (!art) { var h1 = document.querySelector('h1'); return ((h1 && h1.textContent) || document.title.split(/ [—|·-] /)[0]).replace(/\s+/g, ' ').trim(); }
      var h = art.querySelector('h2'); return h ? h.textContent.replace(/^\s*\d+\s*/, '').trim() : '';
    };

    var SUGG = [
      [L('Explain this lesson more simply', 'Explique-moi cette leçon plus simplement'), L('Explain the main idea of this lesson more simply, with an everyday example.', 'Explique-moi l\'idée principale de cette leçon plus simplement, avec un exemple de la vie courante.')],
      [L('Give me a worked example', 'Donne-moi un exemple chiffré'), L('Give me a short worked example with numbers for this lesson.', 'Donne-moi un court exemple chiffré pour cette leçon.')],
      [L('I am stuck on an exercise', 'Je bloque sur un exercice'), L('I am stuck on an exercise of this lesson. Give me a hint, not the solution.', 'Je bloque sur un exercice de cette leçon. Donne-moi un indice, pas la solution.')],
      [L('Quiz me', 'Pose-moi une question'), L('Ask me one short question to check that I understood this lesson, then wait for my answer.', 'Pose-moi une courte question pour vérifier que j\'ai compris cette leçon, puis attends ma réponse.')]
    ];
    if (!lessons.length) SUGG = [
      [L('Explain this page simply', 'Explique-moi cette page simplement'), L('Explain simply what this page shows and what it is for.', 'Explique-moi simplement ce que montre cette page et à quoi ça sert.')],
      [L('What is it used for in real life?', 'À quoi ça sert dans la vraie vie ?'), L('Give me real examples, in industry or everyday life, of what this page is about.', 'Donne-moi des exemples réels, dans l\'industrie ou la vie de tous les jours, de ce dont parle cette page.')],
      [L('Where should I start learning?', 'Par où commencer pour apprendre ?'), L('I want to learn this. Which course of the site should I start with, and why?', 'Je veux apprendre ça. Par quel cours du site commencer, et pourquoi ?')],
      [L('Quiz me', 'Pose-moi une question'), L('Ask me one short question about this page to check that I understood it, then wait for my answer.', 'Pose-moi une courte question sur cette page pour vérifier que j\'ai compris, puis attends ma réponse.')]
    ];
    SUGG.forEach(function (s) { var b = document.createElement('button'); b.type = 'button'; b.textContent = s[0]; b.onclick = function () { ask(s[1], s[0]); }; sugg.append(b); });

    function bubbleMsg(role, html, model) {
      var m = document.createElement('div'); m.className = 'rb-msg ' + (role === 'user' ? 'me' : 'ai');
      m.innerHTML = (role === 'user' ? '' : '<span class="rb-av">' + ROBOT + '</span>') + '<div class="rb-b">' + html + '</div>';
      if (DEBUG && model) m.querySelector('.rb-b').insertAdjacentHTML('beforeend', '<span class="rb-model">' + esc(model) + '</span>');
      log.append(m); log.scrollTop = log.scrollHeight; return m.querySelector('.rb-b');
    }
    function paint() {
      cur = current(); var hist = load(cur);
      lname.textContent = titleOf(cur);
      log.innerHTML = '';
      bubbleMsg('assistant', '<p>' + esc(cur ? L('Hello! I know the lesson “', 'Bonjour ! Je connais la leçon « ') + titleOf(cur) + L('”. What would you like to understand better?', ' ». Qu\'aimeriez-vous mieux comprendre ?')
        : L('Hello! I can explain this page, “', 'Bonjour ! Je peux vous expliquer cette page, « ') + titleOf(cur) + L('”, or anything about robotics. What would you like to understand?', ' », ou n\'importe quelle question de robotique. Qu\'aimeriez-vous comprendre ?')) + '</p>');
      hist.forEach(function (m) { bubbleMsg(m.role, m.role === 'user' ? '<p>' + esc(m.show || m.text) + '</p>' : md(m.text), m.model); });
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
      var art = cur, hist = load(art);
      busy = true; send.disabled = true; sugg.hidden = true; ta.value = ''; grow();
      bubbleMsg('user', '<p>' + esc(show || q) + '</p>');
      var out = bubbleMsg('assistant', '<span class="rb-dots" aria-label="' + esc(L('The tutor is writing', 'Le tuteur écrit')) + '"><i></i><i></i><i></i></span>');
      var past = hist.slice(-6).map(function (m) { return { role: m.role, text: m.text }; });
      var acc = '', model = '', why = '', t0 = Date.now(), first = 0;
      var done = function (err, detail) {
        busy = false; send.disabled = false;
        if (err) { out.innerHTML = '<p class="rb-err">' + esc(fail(err)) + (detail ? ' <small>(' + esc(detail) + ')</small>' : '') + '</p>'; return; }
        if (model && first) model += ' · ' + ((first - t0) / 1000).toFixed(1).replace('.', FR() ? ',' : '.') + ' s';   // time to the first words
        if (model && why) model += ' · Gemini : ' + why;
        if (DEBUG && model) out.insertAdjacentHTML('beforeend', '<span class="rb-model">' + esc(model) + '</span>');
        hist.push({ role: 'user', text: q, show: show }, { role: 'assistant', text: acc, model: model }); store(KEY(art), JSON.stringify(hist.slice(-20)));
      };
      var clean = function (s) { return s.replace(/\s*\[\[(refusal|error ?\d*)\]?\]?\s*$/, '').replace(/\s*\[\[[a-z0-9 ]*$/, ''); };
      if (!navigator.onLine) return done('offline');
      fetch('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ page: PAGE, lesson: art ? art.id : '', lang: FR() ? 'fr' : 'en', question: q, history: past }) })
        .then(function (r) {
          if (r.status === 429) return r.text().then(function (m) { done(/minute/.test(m) ? 'minute' : 429); });
          if (!r.ok || !r.body || !/text\/plain/.test(r.headers.get('content-type') || '')) return r.text().then(function (m) { done('down', r.status + (/^[a-z :]{3,40}$/.test(m) ? ' · ' + m : '')); }, function () { done('down', String(r.status)); });
          var rd = r.body.getReader(), dec = new TextDecoder(), dog = 0, stalled = false;
          var pump = function () {
            clearTimeout(dog); dog = setTimeout(function () { stalled = true; rd.cancel().catch(function () {}); }, 45000);   // nothing for 45 s: stop waiting
            return rd.read().then(function (c) {
              if (c.done) { clearTimeout(dog); if (stalled) acc += '\n\n[[error]]'; }
              if (!c.done) acc += dec.decode(c.value, { stream: true });
              var mm = /^\[\[m:(\w+)(?:\|([^\]]*))?\]\]/.exec(acc);     // the server says first which model answers (and why not Gemini)
              if (mm) { model = mm[1] === 'gemini' ? 'Gemini' : 'Claude'; why = mm[2] || ''; acc = acc.slice(mm[0].length); }
              if (c.done) {
                if (/\[\[refusal\]\]\s*$/.test(acc)) return done('refusal');
                var em = /\[\[error ?(\d*)\]\]\s*$/.exec(acc);
                if (em && acc.slice(0, em.index).trim().length < 2) return done('down', 'API ' + (em[1] || '?'));
                var cut = !!em; acc = acc.replace(/\s*\[\[error ?\d*\]\]\s*$/, '').replace(/[\s*_`]+$/, '') + ' …';   // (no half-open bold at the end) out.innerHTML = md(acc);
                if (cut) out.insertAdjacentHTML('beforeend', '<p class="rb-err">' + esc(L('(answer cut off: please ask again)', '(réponse interrompue : reposez votre question)')) + '</p>');
                return done();
              }
              if (/^\[\[(m(:[^\]]*)?)?$/.test(acc) || /^\[\[m:[^\]]*\]$/.test(acc)) return pump();                 // the model tag is not complete yet
              if (!first && clean(acc).trim()) first = Date.now();
              var near = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
              out.innerHTML = md(clean(acc)) || out.innerHTML;
              if (near) log.scrollTop = log.scrollHeight;
              return pump();
            });
          };
          return pump();
        })
        .catch(function () { done(navigator.onLine ? 'down' : 'offline'); });
    }

    // open / close
    function setOpen(open) {
      panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); root.classList.toggle('open', open);
      if (open) { hideBubble(); if (cur !== current() || !log.children.length) paint(); setTimeout(function () { ta.focus({ preventScroll: true }); }, 30); }
    }
    btn.onclick = function () { setOpen(panel.hidden); };
    $('.rb-close').onclick = function () { setOpen(false); btn.focus(); };
    $('.rb-ask').onclick = function () { setOpen(true); };
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); btn.focus(); } });
    form.onsubmit = function (e) { e.preventDefault(); ask(ta.value); };
    function grow() { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'; }
    ta.addEventListener('input', grow);
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(ta.value); } });
    $('.rb-clear').onclick = function () { if (busy) return; store(KEY(cur), '[]'); paint(); ta.focus(); };

    // to be noticed: the robot jumps and waves hello, then its bubble says "Do you have any questions?". It starts soon
    // after the page opens, then jumps and waves again every 15 s while nobody opened the chat; the bubble comes back
    // with every third wave (three bubbles at most per page, counted again on each new lesson).
    var bubbleT = 0, againT = 0, waves = 0, asked = 0, OFF = 'ra-tutor-quiet', WAVE_MS = 3600, EVERY = 15000;
    var quiet = function () { return store(OFF) === '1' || !panel.hidden; };
    function hideBubble() { clearTimeout(bubbleT); clearTimeout(againT); bubble.hidden = true; root.classList.remove('talk', 'wave'); }
    function showBubble(delay) {
      hideBubble();
      if (quiet()) return;
      bubbleT = setTimeout(function () {
        if (quiet()) return;
        root.classList.remove('wave'); void root.offsetWidth; root.classList.add('wave'); waves++;   // 1. jump and wave hello
        bubbleT = setTimeout(function () {
          root.classList.remove('wave');
          if (quiet()) return;
          var ask = waves % 3 === 1 && asked < 3;
          if (ask) { asked++; bubble.hidden = false; root.classList.add('talk'); }                    // 2. then ask
          bubbleT = setTimeout(function () {
            bubble.hidden = true; root.classList.remove('talk');
            againT = setTimeout(function () { showBubble(0); }, EVERY);                               // 3. again in a moment
          }, ask ? 8000 : 0);
        }, WAVE_MS);
      }, delay);
    }
    $('.rb-x').onclick = function () { store(OFF, '1'); hideBubble(); };
    showBubble(1500);

    // the lesson on the screen changes (lesson-quiz.js shows one lesson at a time): follow it
    var seen = current();
    var mo = new MutationObserver(function () {
      var now = current(); if (now === seen) return; seen = now;
      if (!panel.hidden && !busy) paint(); else if (panel.hidden) { cur = null; waves = 0; asked = 0; showBubble(1200); }
    });
    lessons.forEach(function (a) { mo.observe(a, { attributes: true, attributeFilter: ['hidden'] }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
