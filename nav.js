// nav.js — navigation bar, theme (dark / light), language (English / French), footer, back-to-top.
// Every page has this ONE line inside <head>:   <script src="nav.js" defer></script>
//
// French: when the language is "fr", the French dictionaries in the folder i18n/ are loaded
// (i18n/fr-common.js and i18n/fr-<page>.js) and every text of the page is translated.
// A text that has no translation simply stays in English. Nothing else to change in the pages.
(function () {
  'use strict';

  // ---------------------------------------------------------------- pages (one line per robot)
  const ROBOTS = [
    ['arm.html',        { en: '3-DOF arm',                fr: 'Bras 3 axes' },              'R-R-R'],
    ['gantry.html',     { en: 'Cartesian gantry',         fr: 'Robot cartésien' },          'P-P-P'],
    ['scara.html',      { en: 'SCARA',                    fr: 'SCARA' },                    'R-R-P-R'],
    ['articulated.html',{ en: '6-axis industrial robot',  fr: 'Robot industriel 6 axes' },  '6 × R'],
    ['cobot.html',      { en: 'Collaborative robot (UR5)',fr: 'Robot collaboratif (UR5)' }, '6 × R'],
    ['delta.html',      { en: 'Delta robot',              fr: 'Robot Delta' },              'parallel / parallèle'],
    ['mobile.html',     { en: 'Mobile robot',             fr: 'Robot mobile' },             '2 wheels / roues'],
    ['wheels.html',     { en: 'Wheels and mobile bases',  fr: 'Roues et bases mobiles' },   '—']
  ];
  const SOCIAL = [
    ['LinkedIn', 'https://www.linkedin.com/in/aya-briksine/', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>'],
    ['GitHub', 'https://github.com/aya12bri', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>'],
    ['Portfolio', 'https://www.ayabriksine.com', '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 4 5.9 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-5.9-4-9.5s1.4-6.8 4-9.5z"/></svg>']
  ];
  window.RA_SOCIAL = SOCIAL;
  const UI = {
    en: { secIntro: 'Intro', secHow: 'How it works', secRobots: 'The robots', secRoad: 'Roadmap', secAbout: 'About', home: 'Home', learn: 'Learn', start: 'Where to start', done: 'Mark this page as done', doneOn: 'Done, well played!', road: 'Back to the roadmap', all: 'All robot pages', by: 'Designed and built by', robots: 'Robots', menu: 'Open the menu', top: 'Back to top', lang: 'Language', theme: 'Switch between dark and light',
          foot: 'Robotics Atlas · a learning project about robots, their kinematics and their uses · 3D with', learnFoot: 'Learn the basics', wheels: 'Wheels' },
    fr: { secIntro: 'Intro', secHow: 'Comment ça marche', secRobots: 'Les robots', secRoad: 'Parcours', secAbout: 'À propos', home: 'Accueil', learn: 'Apprendre', start: 'Par où commencer', done: 'Marquer cette page comme terminée', doneOn: 'Terminée, bien joué !', road: 'Retour au parcours', all: 'Toutes les pages robots', by: 'Conçu et réalisé par', robots: 'Robots', menu: 'Ouvrir le menu', top: 'Haut de page', lang: 'Langue', theme: 'Basculer entre sombre et clair',
          foot: 'Robotics Atlas · un projet pour apprendre les robots, leur cinématique et leurs usages · 3D avec', learnFoot: 'Les bases', wheels: 'Roues' }
  };

  // ---------------------------------------------------------------- preferences
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode: ignore */ } }
  };
  const root = document.documentElement;
  const savedTheme = store.get('ra-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  let lang = store.get('ra-lang');
  if (lang !== 'fr' && lang !== 'en') lang = (navigator.language || 'en').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  root.lang = lang;
  const ui = UI[lang];
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const pageName = here.replace(/\.html$/, '');

  // ---------------------------------------------------------------- translation engine
  const DICT = Object.create(null), RULES = [];
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  function hash(str) {                                                  // cyrb53: short, stable key of an English text
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  const RA = window.RA = {
    lang, hash, norm,
    add(obj) { Object.assign(DICT, obj); },                                // { hashOfEnglish: 'français' }
    rule(re, fn) { RULES.push([re, fn]); },                                // for texts that contain numbers: fn(match) returns the French text
    tr(text) {                                                             // French for a plain text, or null
      const k = norm(text);
      if (!k) return null;
      const v = DICT[hash(k)];
      if (v !== undefined) return v;
      for (const [re, fn] of RULES) { const m = k.match(re); if (m) return fn(m); }   // fn(match) -> French text
      return null;
    },
    text(s) { return RA.tr(s) || s; }
  };
  // what the visitor has finished (roadmap, lessons and robot pages share it)
  const PROG = 'ra-progress';
  RA.progress = {
    all() { try { return JSON.parse(store.get(PROG) || '{}') || {}; } catch (e) { return {}; } },
    get(id) { return !!this.all()[id]; },
    set(id, v) { const o = this.all(); if (v) o[id] = 1; else delete o[id]; store.set(PROG, JSON.stringify(o)); window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id, v: !!v } })); },
    clear(ids) { const o = this.all(); ids.forEach((i) => delete o[i]); store.set(PROG, JSON.stringify(o)); window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id: null } })); }
  };
  window.addEventListener('storage', (e) => { if (e.key === PROG) window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id: null } })); });
  const SKIP = /^(SCRIPT|STYLE|SVG|CANVAS|TEXTAREA|NOSCRIPT|PRE|CODE)$/i;
  const mine = (el) => el.classList && (el.classList.contains('site-nav') || el.classList.contains('site-foot') || el.classList.contains('to-top'));
  const inSvg = (n) => { const e = n.nodeType === 1 ? n : n.parentNode; return !!(e && e.closest && e.closest('svg')); };
  const INLINE = /^(STRONG|EM|B|I|CODE|SUB|SUP|BR|SMALL|SPAN|A|KBD|MARK|ABBR|U)$/;
  // a block we can replace as a whole: only text and inline markup inside, no element that the page's JavaScript may hold on to
  const canReplace = (el) => !el.querySelector('input,select,button,textarea,canvas,svg,[id]') &&
    Array.prototype.every.call(el.children, (c) => INLINE.test(c.tagName) && (!c.children.length || canReplace(c)));

  function doText(n) {
    const s = n.nodeValue, k = norm(s);
    if (!k) return;
    const v = RA.tr(k);
    if (v !== null && v !== k) n.nodeValue = s.match(/^\s*/)[0] + v + s.match(/\s*$/)[0];
  }
  const isSvg = (el) => el.namespaceURI && el.namespaceURI.indexOf('svg') >= 0;
  function doSvg(svg) {                                                     // static captions inside drawings (<text>)
    svg.querySelectorAll('text').forEach((t) => { for (let n = t.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) doText(n); });
  }
  function doEl(el) {
    if (isSvg(el)) { if (el.tagName.toLowerCase() === 'text') doSvg({ querySelectorAll: () => [el] }); else doSvg(el); return; }
    if (SKIP.test(el.tagName) && !(el.tagName === 'PRE' || el.tagName === 'CODE')) return;
    if (mine(el) || !el.textContent.trim()) return;
    if (canReplace(el)) {                                                  // whole element (keeps <strong>, <code>, ... inside)
      const v = DICT[hash(norm(el.innerHTML))];
      if (v !== undefined) { el.innerHTML = v; return; }
    }
    if (el.tagName === 'CODE') return;
    for (let n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 1) doEl(n); else if (n.nodeType === 3) doText(n);
    }
  }
  RA.collect = function (rootEl) {                                         // used only to build the dictionaries
    const out = [];
    (function walk(el) {
      if (isSvg(el)) {
        if (el.tagName.toLowerCase() === 'svg') el.querySelectorAll('text').forEach((t) => { const k = norm(t.textContent); if (k) out.push({ kind: 'svgtext', tag: 'text', key: k, h: hash(k) }); });
        return;
      }
      if (/^(SCRIPT|STYLE|NOSCRIPT|CANVAS|TEXTAREA)$/i.test(el.tagName) || mine(el) || !el.textContent.trim()) return;
      if (canReplace(el)) { const k = norm(el.innerHTML); out.push({ kind: 'el', tag: el.tagName, key: k, h: hash(k) }); return; }
      for (let n = el.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 1) walk(n); else if (n.nodeType === 3 && norm(n.nodeValue)) out.push({ kind: 'text', tag: el.tagName, key: norm(n.nodeValue), h: hash(norm(n.nodeValue)) });
      }
    })(rootEl || document.body);
    return out;
  };

  function startTranslation() {
    doEl(document.body);
    const t = document.title && RA.tr(document.title); if (t) document.title = t;
    const cfg = { childList: true, subtree: true, characterData: true };
    const obs = new MutationObserver((muts) => {
      obs.disconnect();
      try {
        for (const m of muts) {
          if (m.type === 'characterData') { if (!inSvg(m.target)) doText(m.target); continue; }
          m.addedNodes.forEach((n) => {
            if (n.nodeType === 1) doEl(n); else if (n.nodeType === 3 && !inSvg(n)) doText(n);     // (a text inside a drawing is handled with its <text>)
          });
        }
      } finally { obs.observe(document.body, cfg); }
    });
    obs.observe(document.body, cfg);
  }
  function loadDictionaries(done) {
    const files = ['i18n/fr-common.js', `i18n/fr-${pageName}.js`];
    let left = files.length;
    const fin = () => { if (--left === 0) done(); };
    files.forEach((f) => {
      const s = document.createElement('script');
      s.src = f; s.onload = fin; s.onerror = fin;
      document.head.appendChild(s);
    });
  }

  // ---------------------------------------------------------------- fonts and favicon
  const head = document.head;
  if (!document.querySelector('link[href*="fonts.googleapis"]')) {
    ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach((u) => { const l = document.createElement('link'); l.rel = 'preconnect'; l.href = u; if (u.indexOf('gstatic') > 0) l.crossOrigin = ''; head.appendChild(l); });
    const f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..100,600..900&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500' + (pageName === 'index' ? '&family=Mrs+Saint+Delafield' : '') + '&display=swap';
    head.appendChild(f);
  }
  if (!head.querySelector('link[rel~=icon]')) {
    const ic = document.createElement('link');
    ic.rel = 'icon';
    ic.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#2f6bff"/><path d="M7.5 25.5 L16 7.5 L24.5 25.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.2 19.2 H20.8" stroke="#ff9f43" stroke-width="3.2" stroke-linecap="round"/><circle cx="16" cy="7.5" r="3.1" fill="#fff"/><circle cx="16" cy="7.5" r="1.1" fill="#2f6bff"/></svg>');
    head.appendChild(ic);
  }

  // ---------------------------------------------------------------- build the page chrome
  function build() {
    // the mark is a joint seen along its axis (circle with a dot) and the link that leaves it
    // the mark: an "A" drawn as a two-link robot arm (joint at the top, orange crossbar), on a blue tile
    const LOGO = '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#2f6bff"/><path d="M7.5 25.5 L16 7.5 L24.5 25.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.2 19.2 H20.8" stroke="#ff9f43" stroke-width="3.2" stroke-linecap="round"/><circle cx="16" cy="7.5" r="3.1" fill="#fff"/><circle cx="16" cy="7.5" r="1.1" fill="#2f6bff"/></svg>';
    const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    const link = (href, text) => `<a href="${href}"${here === href ? ' aria-current="page"' : ''}>${text}</a>`;
    const effective = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

    const nav = document.createElement('header');
    nav.className = 'site-nav';
    nav.innerHTML =
      `<a class="brand" href="index.html">${LOGO}<span>Robotics Atlas</span></a>` +
      '<nav class="nav-l" aria-label="Main">' +
      (here === 'index.html' ? `<a href="index.html">${ui.secIntro}</a><a href="index.html#tour">${ui.secHow}</a><a href="index.html#gallery">${ui.secRobots}</a><a href="index.html#start">${ui.secRoad}</a>` + link('learn.html', ui.learn) : link('index.html', ui.home) + link('learn.html', ui.learn) + `<a href="index.html#start">${ui.start}</a>`) + `<a class="mob-only" href="index.html#gallery">${ui.robots}</a>` + '</nav>' +
      '<div class="nav-r">' +
      `<div class="dd"><a class="dd-link" href="index.html#gallery">${ui.robots}</a><button class="dd-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${ui.all}">▾</button><div class="dd-menu">` +
      ROBOTS.map(([h, n, k]) => link(h, `${n[lang]} <small>${k}</small>`)).join('') + '</div></div>' +
      '<div class="nav-tools">' +
      `<div class="seg" role="group" aria-label="${ui.lang}"><button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="fr" aria-pressed="${lang === 'fr'}">FR</button></div>` +
      `<button class="icon-btn theme-btn" type="button" aria-label="${ui.theme}" title="${ui.theme}"></button>` +
      `<button class="icon-btn nav-toggle" type="button" aria-label="${ui.menu}" aria-expanded="false">☰</button></div></div>`;
    document.body.insertBefore(nav, document.body.firstChild);

    const themeBtn = nav.querySelector('.theme-btn');
    const paintTheme = () => { themeBtn.innerHTML = effective() === 'dark' ? SUN : MOON; };
    paintTheme();
    themeBtn.addEventListener('click', () => {
      const next = effective() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next; store.set('ra-theme', next); paintTheme();
    });
    nav.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.lang === lang) return;
      store.set('ra-lang', b.dataset.lang);
      location.reload();                                                    // the pages are built in JavaScript: reload keeps everything consistent
    }));
    const links = nav.querySelector('.nav-l'), toggle = nav.querySelector('.nav-toggle');
    const ddBtn = nav.querySelector('.dd-btn'), dd = nav.querySelector('.dd');
    toggle.addEventListener('click', () => { const o = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(o)); });
    ddBtn.addEventListener('click', (e) => { e.stopPropagation(); const o = dd.classList.toggle('open'); ddBtn.setAttribute('aria-expanded', String(o)); });
    document.addEventListener('click', () => { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { dd.classList.remove('open'); nav.classList.remove('open'); } });

    const foot = document.createElement('footer');
    foot.className = 'site-foot';
    const i = ROBOTS.findIndex((r) => r[0] === here);
    let pager = '';
    if (i >= 0) {
      const p = ROBOTS[(i + ROBOTS.length - 1) % ROBOTS.length], n = ROBOTS[(i + 1) % ROBOTS.length];
      pager = `<div class="pager"><a href="${p[0]}">← ${p[1][lang]}</a><a href="${n[0]}">${n[1][lang]} →</a></div>`;
    }
    const doneBar = i >= 0 ? `<div class="done-bar"><label class="done-toggle"><input type="checkbox" id="pageDone"><span class="box" aria-hidden="true"></span><span class="lbl">${ui.done}</span></label><a href="index.html#start">${ui.road} →</a></div>` : '';
    const social = '<p class="social">' + SOCIAL.map(([name, url, icon]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${name}">${icon}<span>${name}</span></a>`).join('') + '</p>';
    foot.innerHTML = doneBar + pager + `<p>${ui.foot} <a href="https://threejs.org">three.js</a></p>` +
      `<p class="by">${ui.by} <a href="https://www.ayabriksine.com" target="_blank" rel="noopener">Aya Briksine</a></p>` + social +
      `<p><a href="index.html">${ui.home}</a> · <a href="learn.html">${ui.learnFoot}</a> · <a href="wheels.html">${ui.wheels}</a></p>`;
    document.body.appendChild(foot);
    const dn = foot.querySelector('#pageDone');
    if (dn) {
      const paint = () => { dn.checked = RA.progress.get(pageName); dn.closest('.done-toggle').classList.toggle('on', dn.checked); dn.parentNode.querySelector('.lbl').textContent = dn.checked ? ui.doneOn : ui.done; };
      dn.addEventListener('change', () => RA.progress.set(pageName, dn.checked)); window.addEventListener('ra-progress', paint); paint();
    }

    const top = document.createElement('button');
    top.className = 'to-top'; top.type = 'button'; top.setAttribute('aria-label', ui.top); top.textContent = '↑';
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(top);
    const onScroll = () => top.classList.toggle('show', window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  // ---------------------------------------------------------------- robot pages: header, "on this page" chips, 3D view next to the controls, diagram fitted and centred
  function robotPage() {
    const body = document.body, h1 = body.querySelector('h1'), view = document.getElementById('view'), controls = document.getElementById('controls');
    if (h1 && h1.nextElementSibling && h1.nextElementSibling.tagName === 'P' && h1.nextElementSibling.querySelector('a[href="index.html"]')) h1.nextElementSibling.classList.add('crumbs');
    // 3D view on the left, joints and sliders on the right (stacked on small screens)
    if (view && controls && view.parentNode === body && controls.parentNode === body) {
      const kids = [...body.children], iv = kids.indexOf(view), ic = kids.indexOf(controls);
      const ih = kids.findIndex((el, i) => i > iv && el.tagName === 'H2');
      if (ih > iv && ic > ih) {
        const stage = document.createElement('div'), main = document.createElement('div'), side = document.createElement('div');
        stage.className = 'stage'; main.className = 'stage-main'; side.className = 'stage-side';
        body.insertBefore(stage, view); stage.append(main, side);
        kids.slice(iv, ih).forEach((el) => main.appendChild(el));
        kids.slice(ih, ic + 1).forEach((el) => side.appendChild(el));
      }
    }
    // chips that jump to each section
    const heads = [...body.querySelectorAll('h2')].filter((h) => !h.closest('.stage-side') && !h.closest('.robot') && h.textContent.trim());
    if (h1 && heads.length > 2 && !body.classList.contains('home') && !body.classList.contains('learn')) {
      const toc = document.createElement('nav'); toc.className = 'toc'; toc.setAttribute('aria-label', lang === 'fr' ? 'Sur cette page' : 'On this page');
      const short = (h) => h.textContent.replace(/^\d+\.\s*/, '').replace(/\s*\(.*$/, '').replace(/,\s*(side|top|front) view$/i, '').trim() || h.textContent.trim();
      heads.forEach((h, i) => {
        if (!h.id) h.id = 'sec' + (i + 1);
        const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = short(h); toc.appendChild(a);
        new MutationObserver(() => { const s = short(h); if (a.textContent !== s) a.textContent = s; }).observe(h, { childList: true, characterData: true, subtree: true });   // follows the language
      });
      const anchor = h1.nextElementSibling && h1.nextElementSibling.classList.contains('crumbs') ? h1.nextElementSibling : h1;
      anchor.after(toc);
    }
    // the kinematic diagram: zoom on the robot (the box only grows, so it does not jitter) and centre it
    const svg = document.getElementById('schema');
    if (svg && svg.viewBox && svg.viewBox.baseVal) {
      let box = null, pending = false;
      const apply = () => {
        pending = false;
        try {
          const b = svg.getBBox(); if (!b.width || !b.height) return;
          box = box ? { x0: Math.min(box.x0, b.x), y0: Math.min(box.y0, b.y), x1: Math.max(box.x1, b.x + b.width), y1: Math.max(box.y1, b.y + b.height) } : { x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height };
          const pad = 44, R = 700 / 420; let w = box.x1 - box.x0 + 2 * pad, h = box.y1 - box.y0 + 2 * pad;
          if (w / h < R) w = h * R; else h = w / R;
          w = Math.min(Math.max(w, 330), 900); h = w / R;
          const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
          svg.setAttribute('viewBox', [cx - w / 2, cy - h / 2, w, h].map((v) => v.toFixed(1)).join(' '));
        } catch (e) { /* svg not displayed yet */ }
      };
      new MutationObserver((ms) => { if (ms.every((m) => m.target === svg && m.attributeName === 'viewBox')) return; if (!pending) { pending = true; requestAnimationFrame(apply); } })
        .observe(svg, { childList: true, subtree: true, attributes: true, characterData: true });
      document.addEventListener('change', () => { box = null; });
    }
  }

  // ---------------------------------------------------------------- smooth scrolling between sections, and the active link in the bar
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let anim = 0;
  function smoothTo(y) {
    const y0 = window.scrollY, dist = y - y0;
    if (reduceMotion || Math.abs(dist) < 2) { window.scrollTo(0, y); return; }
    const dur = Math.min(1300, 550 + Math.abs(dist) * 0.35), t0 = performance.now(), id = ++anim;
    root.classList.add('scrolling');
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    (function step(now) {
      if (id !== anim) return;
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, y0 + dist * ease(k));
      if (k < 1) requestAnimationFrame(step); else root.classList.remove('scrolling');
    })(t0);
  }
  RA.smoothTo = smoothTo;
  ['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, () => { anim++; root.classList.remove('scrolling'); }, { passive: true }));
  function wireScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const u = new URL(a.href, location.href); if (u.origin !== location.origin || u.pathname !== location.pathname) return;
      let y = null;
      if (u.hash) { const t = document.getElementById(u.hash.slice(1)); if (t) y = t.getBoundingClientRect().top + window.scrollY - (t.matches('.scene-sec') ? 0 : 84); }
      else if (/index\.html$|\/$/.test(u.pathname) && !u.search) y = 0;
      if (y === null) return;
      e.preventDefault(); history.replaceState(null, '', u.hash || u.pathname); smoothTo(Math.max(0, y)); document.querySelector('.site-nav').classList.remove('open');
    });
    if (here !== 'index.html') return;
    const map = [['top', 'index.html'], ['tour', 'index.html#tour'], ['gallery', 'index.html#gallery'], ['start', 'index.html#start'], ['sign', 'index.html#start']];
    const marks = () => {
      const mid = window.scrollY + innerHeight / 2; let cur = 'top';
      for (const [id] of map) { const el = document.getElementById(id); if (el && el.offsetTop <= mid) cur = id; }
      document.querySelectorAll('.nav-l a, .dd-link').forEach((a) => {
        const h = a.getAttribute('href'), cur2 = map.find((m) => m[0] === cur)[1], on = h === cur2 && !(a.classList.contains('dd-link') && cur !== 'gallery');
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', marks, { passive: true }); marks();
  }

  // ---------------------------------------------------------------- if the 3D engine cannot be loaded, say so (and offer a reload) instead of leaving empty boxes
  function watch3d() {
    const needs = document.querySelector('script[type="importmap"]'); if (!needs) return;
    const fail = () => {
      if (document.getElementById('err3d')) return;
      const b = document.createElement('div'); b.id = 'err3d'; b.className = 'err3d'; b.setAttribute('role', 'alert');
      b.innerHTML = `<span>${lang === 'fr' ? 'Le moteur 3D n\'a pas pu se charger (connexion lente ou interrompue).' : 'The 3D engine could not be loaded (slow or interrupted connection).'}</span><button type="button">${lang === 'fr' ? 'Recharger' : 'Reload'}</button>`;
      b.querySelector('button').addEventListener('click', () => location.reload()); document.body.appendChild(b);
    };
    window.addEventListener('unhandledrejection', (e) => { if (/dynamically imported|Failed to fetch|module script|import/i.test(String(e.reason && (e.reason.message || e.reason)))) fail(); });
    window.addEventListener('error', (e) => { if (e.target && e.target.tagName === 'SCRIPT' && e.target.type === 'module') fail(); }, true);
    setTimeout(() => { import('./vendor/three.module.min.js').catch(fail); }, 4000);          // already cached when everything worked: no extra download
  }

  function init() {
    build();
    watch3d();
    robotPage();
    wireScroll();
    if (lang === 'fr') loadDictionaries(startTranslation);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
