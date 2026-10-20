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
  const UI = {
    en: { home: 'Home', learn: 'Learn', robots: 'Robots', menu: 'Open the menu', top: 'Back to top', lang: 'Language', theme: 'Switch between dark and light',
          foot: 'Robotics Atlas · a learning project about robots, their kinematics and their uses · 3D with', learnFoot: 'Learn the basics', wheels: 'Wheels' },
    fr: { home: 'Accueil', learn: 'Apprendre', robots: 'Robots', menu: 'Ouvrir le menu', top: 'Haut de page', lang: 'Langue', theme: 'Basculer entre sombre et clair',
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
    const f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap';
    head.appendChild(f);
  }
  if (!head.querySelector('link[rel~=icon]')) {
    const ic = document.createElement('link');
    ic.rel = 'icon';
    ic.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#1f1f1f"/><circle cx="10" cy="22" r="5.5" fill="none" stroke="#ececec" stroke-width="2.4"/><circle cx="10" cy="22" r="1.8" fill="#ececec"/><path d="M14 18 L25 8" stroke="#ff9f43" stroke-width="3.6" stroke-linecap="round"/></svg>');
    head.appendChild(ic);
  }

  // ---------------------------------------------------------------- build the page chrome
  function build() {
    // the mark is a joint seen along its axis (circle with a dot) and the link that leaves it
    const LOGO = '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><circle cx="9" cy="23" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="9" cy="23" r="1.9" fill="currentColor"/><path d="M13.5 18.7 L25 8" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>';
    const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    const link = (href, text) => `<a href="${href}"${here === href ? ' aria-current="page"' : ''}>${text}</a>`;
    const effective = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

    const nav = document.createElement('header');
    nav.className = 'site-nav';
    nav.innerHTML =
      `<a class="brand" href="index.html">${LOGO}<span>Robotics Atlas</span></a>` +
      '<nav class="nav-links" aria-label="Main">' +
      link('index.html', ui.home) + link('learn.html', ui.learn) +
      `<div class="dd"><button class="dd-btn" type="button" aria-haspopup="true" aria-expanded="false">${ui.robots} ▾</button><div class="dd-menu">` +
      ROBOTS.map(([h, n, k]) => link(h, `${n[lang]} <small>${k}</small>`)).join('') + '</div></div></nav>' +
      '<div class="nav-tools">' +
      `<div class="seg" role="group" aria-label="${ui.lang}"><button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="fr" aria-pressed="${lang === 'fr'}">FR</button></div>` +
      `<button class="icon-btn theme-btn" type="button" aria-label="${ui.theme}" title="${ui.theme}"></button>` +
      `<button class="icon-btn nav-toggle" type="button" aria-label="${ui.menu}" aria-expanded="false">☰</button></div>`;
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
    const links = nav.querySelector('.nav-links'), toggle = nav.querySelector('.nav-toggle');
    const ddBtn = nav.querySelector('.dd-btn'), dd = nav.querySelector('.dd');
    toggle.addEventListener('click', () => { const o = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(o)); });
    ddBtn.addEventListener('click', (e) => { e.stopPropagation(); const o = dd.classList.toggle('open'); ddBtn.setAttribute('aria-expanded', String(o)); });
    document.addEventListener('click', () => { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { dd.classList.remove('open'); links.classList.remove('open'); } });

    const foot = document.createElement('footer');
    foot.className = 'site-foot';
    const i = ROBOTS.findIndex((r) => r[0] === here);
    let pager = '';
    if (i >= 0) {
      const p = ROBOTS[(i + ROBOTS.length - 1) % ROBOTS.length], n = ROBOTS[(i + 1) % ROBOTS.length];
      pager = `<div class="pager"><a href="${p[0]}">← ${p[1][lang]}</a><a href="${n[0]}">${n[1][lang]} →</a></div>`;
    }
    foot.innerHTML = pager + `<p>${ui.foot} <a href="https://threejs.org">three.js</a></p>` +
      `<p><a href="index.html">${ui.home}</a> · <a href="learn.html">${ui.learnFoot}</a> · <a href="wheels.html">${ui.wheels}</a></p>`;
    document.body.appendChild(foot);

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
    if (h1 && heads.length > 2) {
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

  function init() {
    build();
    robotPage();
    if (lang === 'fr') loadDictionaries(startTranslation);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
