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
    ['arm.html',        { en: '3-axis arm',   fr: 'Bras 3 axes' },   'R-R-R'],
    ['gantry.html',     { en: 'Gantry',       fr: 'Cartésien' },     'P-P-P'],
    ['cylindrical.html',{ en: 'Cylindrical',  fr: 'Cylindrique' },   'R-P-P'],
    ['spherical.html',  { en: 'Spherical',    fr: 'Sphérique' },     'R-R-P'],
    ['scara.html',      { en: 'SCARA',        fr: 'SCARA' },         'R-R-P-R'],
    ['articulated.html',{ en: '6-axis robot', fr: 'Robot 6 axes' },  '6 × R'],
    ['cobot.html',      { en: 'Cobot',        fr: 'Cobot' },         '6 × R'],
    ['redundant.html',  { en: '7-axis robot', fr: 'Robot 7 axes' },  '7 × R'],
    ['delta.html',      { en: 'Delta',        fr: 'Delta' },         'parallel / parallèle'],
    ['hexapod.html',    { en: 'Hexapod',      fr: 'Hexapode' },      '6-UPS'],
    ['mobile.html',     { en: 'Mobile robot', fr: 'Robot mobile' },  '2 wheels / 2 roues'],
    ['wheels.html',     { en: 'Wheels',       fr: 'Roues' },         '—']
  ];
  // the 3D "anatomy" pages (in the menu, not in the previous / next pager)
  const ANATOMY = [
    ['anatomy.html',         { en: '6-axis robot', fr: 'Robot 6 axes' }],
    ['anatomy-scara.html',   { en: 'SCARA',        fr: 'SCARA' }],
    ['anatomy-cobot.html',   { en: 'Cobot',        fr: 'Cobot' }],
    ['anatomy-delta.html',   { en: 'Delta',        fr: 'Delta' }],
    ['anatomy-gantry.html',  { en: 'Gantry',       fr: 'Cartésien' }],
    ['anatomy-mobile.html',  { en: 'Mobile robot', fr: 'Robot mobile' }],
    ['anatomy-wheels.html',  { en: 'Wheels',       fr: 'Roues' }],
    ['anatomy-drives.html',  { en: 'Drives',       fr: 'Motorisations' }],
    ['anatomy-stewart.html', { en: 'Hexapod',      fr: 'Hexapode' }],
    ['anatomy-quadrotor.html', { en: 'Drone',      fr: 'Drone' }],
    ['anatomy-humanoid.html', { en: 'Humanoid',    fr: 'Humanoïde' }]
  ];
  // the groups of links of the footer: the robots by family, the tools, my space
  const ROBOT_FAMILIES = [
    [{ en: 'Serial arms', fr: 'Bras série' }, ['arm.html', 'gantry.html', 'cylindrical.html', 'spherical.html', 'scara.html', 'articulated.html', 'cobot.html', 'redundant.html']],
    [{ en: 'Parallel robots', fr: 'Robots parallèles' }, ['delta.html', 'hexapod.html']],
    [{ en: 'Mobile robots', fr: 'Robots mobiles' }, ['mobile.html', 'wheels.html']]
  ];
  const MENU_TOOLS = [['build.html', 'Build your first robot', 'Construire votre premier robot'], ['sandbox.html', 'Programming sandbox', 'Bac à sable de programmation'], ['sensors.html', 'Sensor test bench', 'Banc d\'essai des capteurs'], ['projects.html', 'Guided projects', 'Projets guidés']];
  const MENU_ME = [['index.html#road', 'My roadmap', 'Mon parcours'], ['certificate.html', 'My certificates', 'Mes certificats'], ['exam.html', 'Final exams', 'Examens finaux'], ['review.html', 'My reviews', 'Mes révisions'], ['revision.html', 'Revision sheets', 'Fiches de révision'], ['glossary.html', 'Glossary', 'Glossaire'], ['index.html#rmBackup', 'Save my progress, offline mode', 'Sauvegarde et mode hors ligne']];
  const SOCIAL = [
    ['LinkedIn', 'https://www.linkedin.com/in/aya-briksine/', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>'],
    ['GitHub', 'https://github.com/aya12bri', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>'],
    ['Portfolio', 'https://ayabriksine.com', '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 4 5.9 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-5.9-4-9.5s1.4-6.8 4-9.5z"/></svg>']
  ];
  window.RA_SOCIAL = SOCIAL;
  const UI = {
    en: { courses: 'Courses', tools: 'Tools', me: 'My space', allCourses: 'All the courses (roadmap)', allRobots: 'All the robots, by family', learnH: 'Learn', aboutH: 'About', secIntro: 'Intro', secHow: 'How it works', secRobots: 'The robots', secInside: 'Anatomy 3D', secRoad: 'Roadmap', secAbout: 'About', home: 'Home', learn: 'Learn', start: 'Where to start', done: 'Mark this page as done', doneOn: 'Done, well played!', road: 'Back to the roadmap', all: 'All robot pages', by: 'Designed and built by', robots: 'Robots', menu: 'Open the menu', top: 'Back to top', lang: 'Language', theme: 'Switch between dark and light', search: 'Search the site (Ctrl + K)',
          foot: 'Robotics Atlas · a learning project about robots, their kinematics and their uses · 3D with', learnFoot: 'Learn the basics', wheels: 'Wheels', certs: 'My certificates', gloss: 'Glossary', rev: 'Revision sheets', sens: 'Sensor bench', sbx: 'Sandbox', prj: 'Projects', about: 'About', review: 'My reviews', offline: 'Offline mode', anatomy: 'Anatomy in 3D', build: 'Build' },
    fr: { courses: 'Cours', tools: 'Outils', me: 'Mon espace', allCourses: 'Tous les cours (parcours)', allRobots: 'Tous les robots, par famille', learnH: 'Apprendre', aboutH: 'À propos', secIntro: 'Intro', secHow: 'Comment ça marche', secRobots: 'Les robots', secInside: 'Anatomie 3D', secRoad: 'Parcours', secAbout: 'À propos', home: 'Accueil', learn: 'Apprendre', start: 'Par où commencer', done: 'Marquer cette page comme terminée', doneOn: 'Terminée, bien joué !', road: 'Retour au parcours', all: 'Toutes les pages robots', by: 'Conçu et réalisé par', robots: 'Robots', menu: 'Ouvrir le menu', top: 'Haut de page', lang: 'Langue', theme: 'Basculer entre sombre et clair', search: 'Rechercher dans le site (Ctrl + K)',
          foot: 'Robotics Atlas · un projet pour apprendre les robots, leur cinématique et leurs usages · 3D avec', learnFoot: 'Les bases', wheels: 'Roues', certs: 'Mes certificats', gloss: 'Glossaire', rev: 'Fiches de révision', sens: 'Banc des capteurs', sbx: 'Bac à sable', prj: 'Projets', about: 'À propos', review: 'Mes révisions', offline: 'Mode hors ligne', anatomy: 'Anatomie en 3D', build: 'Construire' }
  };

  // ---------------------------------------------------------------- preferences
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode: ignore */ } }
  };
  const root = document.documentElement;
  const savedTheme = store.get('ra-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  // the page: "learn.html" locally, "/learn" once online (pretty URLs). Each page has a French twin, "learn-fr.html",
  // made by tools/build-fr.mjs with its texts already in French (for the search engines); here is always the English name.
  let here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (here.indexOf('.') < 0) here += '.html';
  const frTwin = /-fr\.html$/.test(here);
  if (frTwin) here = here.replace(/-fr\.html$/, '.html');
  const hasTwin = (f) => /^[a-z0-9-]+\.html$/.test(f) && !/^(404|offline)\.html$/.test(f) && !/-fr\.html$/.test(f);
  const pageName = document.documentElement.dataset.page || here.replace(/\.html$/, '');   // data-page: pages served under another URL (the 404 page)
  let lang = store.get('ra-lang');
  if (lang !== 'fr' && lang !== 'en') lang = (navigator.language || 'en').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  if (frTwin && lang !== 'fr') { lang = 'fr'; store.set('ra-lang', 'fr'); }   // a French address is always in French
  root.lang = lang;
  const ui = UI[lang];
  // the address of this page in the other language (same ?query and #hash)
  const twinUrl = (to) => {
    const p = location.pathname, pretty = !/\.html$/.test(p), dir = p.slice(0, p.lastIndexOf('/') + 1);
    const name = here.replace(/\.html$/, '') + (to === 'fr' ? '-fr' : '');
    const file = name === 'index' ? '' : name + (pretty ? '' : '.html');
    return dir + file + location.search + location.hash;
  };

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
  RA.page = here.replace(/\.html$/, '');                                   // the English name of the page, also on its French twin
  // what the visitor has finished (roadmap, lessons and robot pages share it)
  const PROG = 'ra-progress';
  RA.progress = {
    all() { try { return JSON.parse(store.get(PROG) || '{}') || {}; } catch (e) { return {}; } },
    get(id) { return !!this.all()[id]; },
    set(id, v) { const o = this.all(); if (v) o[id] = 1; else delete o[id]; store.set(PROG, JSON.stringify(o)); window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id, v: !!v } })); },
    clear(ids) { const o = this.all(); ids.forEach((i) => delete o[i]); store.set(PROG, JSON.stringify(o)); window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id: null } })); }
  };
  // save / restore everything the visitor did (progress, quiz answers, exercises, name for the certificates) as one file or one code
  const KEEP = (k) => /^ra-/.test(k) && !/^ra-(lang|theme|cur:)/.test(k);
  RA.backup = {
    dump() {
      const data = {};
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (KEEP(k)) data[k] = localStorage.getItem(k); } } catch (e) { /* private mode */ }
      return { app: 'robotics-atlas', v: 1, date: new Date().toISOString().slice(0, 10), data };
    },
    code() { return btoa(unescape(encodeURIComponent(JSON.stringify(this.dump())))); },
    // merges a backup into this browser: finished items are added (never removed), the other keys are replaced
    restore(input) {
      let o = input;
      if (typeof o === 'string') {
        const t = o.trim();
        try { o = JSON.parse(t.charAt(0) === '{' ? t : decodeURIComponent(escape(atob(t.replace(/\s+/g, ''))))); } catch (e) { return 0; }
      }
      if (!o || o.app !== 'robotics-atlas' || !o.data || typeof o.data !== 'object') return 0;
      let n = 0;
      Object.keys(o.data).forEach((k) => {
        if (!KEEP(k) || typeof o.data[k] !== 'string') return;
        let v = o.data[k];
        if (k === PROG || k === 'ra-quiz' || k === 'ra-wmr-ex' || k === 'ra-cert' || k === 'ra-exam' || k === 'ra-srs') {
          try { const cur = JSON.parse(store.get(k) || '{}') || {}, add = JSON.parse(v) || {}; v = JSON.stringify(Object.assign(cur, add)); } catch (e) { return; }
        }
        store.set(k, v); n++;
      });
      window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id: null } }));
      return n;
    }
  };
  // ---------------------------------------------------------------- the "tool cards" (home roadmap, certificate page)
  const ICON = {
    cert: '<path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="m8.5 14 -1.5 7 5-2.5 5 2.5-1.5-7"/>',
    sens: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="m12 15 3.5-4.5"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/><path d="M4 19h16"/>',
    review: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>',
    rev: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/>',
    save: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    off: '<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5.5 12a10 10 0 0 1 13 0"/><path d="M9 15.5a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/>'
  };
  // one card: an icon, a small label, a title, a text, a line of status, and the actions
  RA.toolCard = function (host, kind, tag, title, text) {
    const c = document.createElement('article');
    c.className = 'tool-card ra-own'; c.dataset.kind = kind;
    c.innerHTML = `<div class="tc-top"><span class="tc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[kind]}</svg></span><span class="rm-tag">${tag}</span></div>` +
      `<h3>${title}</h3><p class="tc-text">${text}</p><div class="tc-status"></div><div class="tc-act"></div><div class="tc-more"></div>`;
    host.appendChild(c);
    return c;
  };
  // the status is bottom-aligned in its box: its first (inline) part goes in one line block
  const tcStatus = (c, html, cls) => {
    const s = c.querySelector('.tc-status');
    s.innerHTML = html.replace(/^([\s\S]*?)(?=<span class="tc-sub"|<div class="tc-bar"|$)/, '<div class="tc-line">$1</div>');
    s.className = 'tc-status' + (cls ? ' ' + cls : '');
  };
  RA.toolStatus = tcStatus;
  const bar = (pct, cls) => `<div class="tc-bar${cls ? ' ' + cls : ''}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;

  // save / restore the progress
  RA.backupPanel = function (host) {
    const fr = RA.lang === 'fr', L = (en, f) => (fr ? f : en);
    const c = RA.toolCard(host, 'save', L('Progress', 'Progression'), L('Save my progress', 'Sauvegarder'),
      L('It is kept only in this browser: save it so you do not lose it, or to continue on another device.', "Elle n'est gardée que dans ce navigateur : sauvegardez-la pour ne pas la perdre, ou pour continuer ailleurs."));
    c.id = 'backup';
    c.querySelector('.tc-act').innerHTML = `<button type="button" class="btn sm" data-a="file">${L('Download', 'Télécharger')}</button>` +
      `<label class="btn sm ghost">${L('Restore', 'Restaurer')}<input type="file" accept=".json,application/json" hidden></label>`;
    const more = c.querySelector('.tc-more');
    more.innerHTML = `<p class="tc-links">${L('By code:', 'Par code :')} <button type="button" class="linkish" data-a="copy">${L('copy my code', 'copier mon code')}</button> · <button type="button" class="linkish" data-a="paste">${L('paste a code', 'coller un code')}</button></p>` +
      `<div class="tc-code" hidden><textarea spellcheck="false" aria-label="${L('Progress code', 'Code de progression')}"></textarea><button type="button" class="btn sm" data-a="apply" hidden>${L('Restore this code', 'Restaurer ce code')}</button></div>`;
    const box = more.querySelector('.tc-code'), ta = box.querySelector('textarea'), apply = box.querySelector('[data-a=apply]');
    const count = () => Object.keys(RA.progress.all()).length;
    const idle = () => tcStatus(c, `<b>${count()}</b> ${L(count() > 1 ? 'pages and lessons finished' : 'page or lesson finished', count() > 1 ? 'pages et leçons terminées' : 'page ou leçon terminée')}`);
    const say = (t, ok) => tcStatus(c, t, ok ? 'ok' : 'bad');
    const done = (n) => n ? say('✓ ' + L(`Progress restored: ${count()} finished.`, `Progression restaurée : ${count()} terminées.`), true) : say(L('This is not a Robotics Atlas progress file or code.', "Ce n'est pas un fichier ou un code de progression Robotics Atlas."), false);
    c.addEventListener('click', (e) => {
      const a = e.target.closest('button[data-a]'); if (!a) return;
      if (a.dataset.a === 'file') {
        const b = new Blob([JSON.stringify(RA.backup.dump(), null, 1)], { type: 'application/json' });
        const u = URL.createObjectURL(b), l = document.createElement('a');
        l.href = u; l.download = `robotics-atlas-progress-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(l); l.click(); l.remove();
        setTimeout(() => URL.revokeObjectURL(u), 1000);
        say('✓ ' + L('File saved. Open it with "Restore" on your other device.', 'Fichier enregistré. Ouvrez-le avec « Restaurer » sur votre autre appareil.'), true);
      } else if (a.dataset.a === 'copy') {
        box.hidden = false; apply.hidden = true; ta.value = RA.backup.code(); ta.readOnly = true; ta.select();
        const ok = () => say('✓ ' + L('Code copied. Paste it on your other device.', 'Code copié. Collez-le sur votre autre appareil.'), true);
        if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(ok, () => say(L('Select the code and copy it.', 'Sélectionnez le code et copiez-le.'), true));
        else ok();
      } else if (a.dataset.a === 'paste') {
        box.hidden = false; apply.hidden = false; ta.readOnly = false; ta.value = ''; ta.placeholder = L('Paste your code here', 'Collez votre code ici'); ta.focus(); idle();
      } else if (a.dataset.a === 'apply') {
        done(RA.backup.restore(ta.value)); if (count()) { box.hidden = true; }
      }
    });
    c.querySelector('input[type=file]').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => done(RA.backup.restore(String(r.result))); r.readAsText(f); e.target.value = '';
    });
    window.addEventListener('ra-progress', () => { if (!c.querySelector('.tc-status.ok, .tc-status.bad')) idle(); });
    idle();
    return c;
  };
  // ---------------------------------------------------------------- visit statistics (Cloudflare Web Analytics, no cookie)
  // Paste the token given by Cloudflare here, or use its automatic setup and leave it empty (tools/feedback-worker/README.md).
  const CF_ANALYTICS_TOKEN = '';
  if (CF_ANALYTICS_TOKEN && location.protocol === 'https:') {
    const b = document.createElement('script'); b.defer = true; b.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    b.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_ANALYTICS_TOKEN })); document.head.appendChild(b);
  }
  // ---------------------------------------------------------------- offline mode (sw.js) and installation as an app
  const swOK = 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; window.dispatchEvent(new Event('ra-offline')); });
  window.addEventListener('appinstalled', () => { installEvt = null; window.dispatchEvent(new Event('ra-offline')); });
  if (swOK) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* offline mode not available */ }); });
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  // asks the service worker; answers come back as messages
  const swAsk = (msg, onMsg) => {
    if (!swOK) return Promise.resolve(false);
    return navigator.serviceWorker.ready.then((reg) => {
      const sw = reg.active; if (!sw) return false;
      const ch = (e) => { if (onMsg(e.data) === 'stop') navigator.serviceWorker.removeEventListener('message', ch); };
      navigator.serviceWorker.addEventListener('message', ch);
      sw.postMessage(msg); return true;
    });
  };
  RA.offlinePanel = function (host) {
    const fr = RA.lang === 'fr', L = (en, f) => (fr ? f : en);
    const mb = (b) => (b / 1048576).toFixed(1).replace('.', fr ? ',' : '.') + (fr ? ' Mo' : ' MB');
    const c = RA.toolCard(host, 'off', L('Offline', 'Hors ligne'), L('Use it without internet', 'Utiliser sans internet'),
      L('The pages you open stay on this device. Download the whole site, or install it as an app.', "Les pages ouvertes restent sur cet appareil. Téléchargez tout le site, ou installez-le comme une application."));
    c.id = 'offline';
    const act = c.querySelector('.tc-act'), more = c.querySelector('.tc-more');
    act.innerHTML = `<button type="button" class="btn sm" data-o="all">${L('Download all', 'Tout télécharger')}</button><button type="button" class="btn sm ghost" data-o="install" hidden>${L('Install the app', "Installer l'app")}</button>`;
    more.innerHTML = `<p class="tc-links tc-ios" hidden>${L('iPhone / iPad: Share, then "Add to Home Screen".', "iPhone / iPad : Partager, puis « Sur l'écran d'accueil ».")}</p><p class="tc-links"><button type="button" class="linkish" data-o="clear">${L('Remove the downloaded files', 'Supprimer les fichiers téléchargés')}</button></p>`;
    const all = act.querySelector('[data-o=all]'), inst = act.querySelector('[data-o=install]'), clr = more.querySelector('[data-o=clear]');
    clr.parentNode.hidden = true;                                       // shown once the service worker says there is something to remove
    if (!swOK) { tcStatus(c, L('Not available in this browser.', 'Pas disponible dans ce navigateur.'), 'bad'); all.hidden = true; clr.parentNode.hidden = true; return c; }
    let busy = false;
    const paint = () => {
      inst.hidden = !installEvt;
      more.querySelector('.tc-ios').hidden = !(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone());
      if (busy) return;
      swAsk({ type: 'status' }, (m) => {
        if (!m || m.type !== 'status') return;
        const pct = 100 * m.bytes / m.size;
        tcStatus(c, (m.full ? '✓ ' + L('The whole site is on this device', 'Tout le site est sur cet appareil') : `<b>${m.pages}</b> / ${m.totalPages} ${L('pages on this device', 'pages sur cet appareil')}`) +
          `<span class="tc-sub">${mb(m.bytes)} / ${mb(m.size)}${standalone() ? ' · ' + L('app installed', 'application installée') : ''}</span>` + bar(pct, m.full ? 'full' : ''), m.full ? 'ok' : '');
        all.hidden = m.full; all.textContent = L(`Download all · ${mb(m.size)}`, `Tout télécharger · ${mb(m.size)}`);
        clr.parentNode.hidden = !(m.pages > 2 || m.full);
        return 'stop';
      }).then((ok) => { if (!ok) tcStatus(c, L('Getting ready…', 'Préparation…')); });
    };
    all.addEventListener('click', () => {
      if (busy) return; busy = true; all.disabled = true;
      tcStatus(c, L('Downloading…', 'Téléchargement…') + bar(0));
      swAsk({ type: 'download-all' }, (m) => {
        if (m.type === 'progress') tcStatus(c, L('Downloading… ', 'Téléchargement… ') + `<b>${m.done}</b> / ${m.total}` + bar(100 * m.done / m.total));
        else if (m.type === 'done') {
          busy = false; all.disabled = false;
          if (m.failed) tcStatus(c, L(`${m.failed} files could not be downloaded: check the connection and try again.`, `${m.failed} fichiers n'ont pas pu être téléchargés : vérifiez la connexion et réessayez.`), 'bad');
          else paint();
          return 'stop';
        }
      });
    });
    inst.addEventListener('click', () => { if (!installEvt) return; installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; paint(); }); });
    clr.addEventListener('click', () => {
      if (!confirm(L('Remove the downloaded files from this device? (Your progress is kept.)', 'Supprimer les fichiers téléchargés de cet appareil ? (Votre progression est gardée.)'))) return;
      swAsk({ type: 'clear' }, (m) => { if (m.type === 'cleared') { paint(); return 'stop'; } });
    });
    // "Offline mode" links (footer) bring the card into view
    const flash = () => { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); };
    if (location.hash === '#offline') setTimeout(() => { c.scrollIntoView({ block: 'center' }); flash(); }, 700);
    window.addEventListener('hashchange', () => { if (location.hash === '#offline') flash(); });
    document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href$="#offline"]'); if (a) setTimeout(flash, 300); }, true);
    window.addEventListener('ra-offline', paint);
    paint();
    return c;
  };
  // ---------------------------------------------------------------- 3D views: dark parts become light grey in dark mode
  // Every 3D scene calls RA.darkParts(scene). In dark mode, any black or very dark part of a robot (caps, tyres, forks,
  // frames, arrows) is shown light grey, so that it stands out on the night background; in light mode its own colour
  // comes back. Floors, grids, shadows and the colours the code changes on purpose (highlights) are left alone.
  RA.darkParts = function (scene, opts) {
    if (!scene || !scene.traverse) return;
    let rim = null;                                                        // dark mode: a cool back light that draws the outline of the parts (black tyres too)
    const KEEP = new Set(['1d2638', '253047', '2a3550', '242f44', '27324a', '2b2e33', '262626', '0e1420', '2e3a52', '3d4b66']);   // floors and pads
    const lum = (h) => { const v = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const dark = () => (root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'dark';
    const apply = () => {
      const D = dark(); let changed = false;
      if (!rim) {                                                            // made from the key light of the scene (no need to import three.js here)
        let key = null; scene.traverse((o) => { if (!key && o.isDirectionalLight && !o.userData.raRim) key = o; });
        // low and behind the scene: it grazes the edges of the parts, not the floor
        if (key) { rim = key.clone(); rim.userData.raRim = true; rim.castShadow = false; rim.color.set('#a9c4ff'); rim.position.set(-key.position.x, Math.abs(key.position.y) * 0.1 + 0.1, -key.position.z); rim.userData.k = key; scene.add(rim); }
      }
      if (rim) rim.intensity = D ? Math.min(0.9, rim.userData.k.intensity * 0.5) : 0;
      scene.traverse((o) => {
        if (!o.material || o.isGridHelper || o.userData.raKeep) return;
        const g = o.geometry && o.geometry.type; if (g === 'PlaneGeometry' || g === 'PlaneBufferGeometry') return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          if (!m || m.userData.raKeep || m.vertexColors || m.map || (m.transparent && m.opacity < 0.6)) return;   // raKeep: tyres stay black (realistic)
          const col = m.userData.base && m.userData.base.isColor ? m.userData.base : m.color;     // some scenes recompute the colour from a base
          if (!col || !col.getHexString) return;
          const u = m.userData;
          if (u.raDark === undefined) { const h = col.getHexString(), l = lum(h); u.raDark = h; u.raLight = KEEP.has(h) || l >= 0.36 ? null : l < 0.06 ? '6f7a8a' : '8a94a3'; }   // bases and supports are marked raKeep: they keep their dark grey   // graphite: visible, but still darker than the light links
          if (!u.raLight) return;
          const cur = col.getHexString();
          if (D && cur === u.raDark) { col.set('#' + u.raLight); changed = true; } else if (!D && cur === u.raLight) { col.set('#' + u.raDark); changed = true; }
        });
      });
      if (changed && opts && opts.onChange) opts.onChange();                 // scenes that recompute their colours from a base (home gallery)
    };
    apply();
    new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', apply);
    setInterval(() => { if (!document.hidden) apply(); }, 1000);                 // parts added later (assembly, demos)
  };
  window.addEventListener('storage', (e) => { if (e.key === PROG) window.dispatchEvent(new CustomEvent('ra-progress', { detail: { id: null } })); });
  const SKIP = /^(SCRIPT|STYLE|SVG|CANVAS|TEXTAREA|NOSCRIPT|PRE|CODE)$/i;
  const mine = (el) => el.classList && (el.classList.contains('site-nav') || el.classList.contains('site-foot') || el.classList.contains('to-top') || el.classList.contains('ra-own'));   // ra-own: built in the right language by its own script
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
    // pages built in the right language by their own script have no page dictionary
    const own = ['certificate', 'glossary', 'revision', 'exam', 'sensors', 'sandbox', 'offline', 'projects', 'about', 'review'].includes(pageName);
    const files = ['i18n/fr-common.js'].concat(own ? [] : [`i18n/fr-${pageName}.js`]);
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
      (here === 'index.html' ? `<a href="index.html">${ui.secIntro}</a><a href="index.html#tour">${ui.secHow}</a><a href="index.html#gallery">${ui.secRobots}</a><a href="index.html#inside">${ui.secInside}</a><a href="index.html#road">${ui.secRoad}</a><a href="build.html">${ui.build}</a>` : link('index.html', ui.home) + `<a href="index.html#road"${/^learn/.test(here) ? ' aria-current="page"' : ''}>${ui.secRoad}</a><a href="index.html#inside">${ui.secInside}</a>` + link('build.html', ui.build)) + (here === 'index.html' ? '' : `<a class="mob-only" href="index.html#gallery">${ui.robots}</a>`) + '</nav>' +   // the home page already has "The robots"
      '<div class="nav-r">' +
      (here === 'index.html' ? '' : `<div class="dd"><a class="dd-link" href="index.html#gallery">${ui.robots}</a><button class="dd-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${ui.all}">▾</button><div class="dd-menu">` +
      ROBOTS.map(([h, n, k]) => { const t = k.split(' / ')[lang === 'fr' && k.includes(' / ') ? 1 : 0]; return link(h, `${n[lang]}${t === '—' ? '' : ` <small>${t}</small>`}`); }).join('') + `<span class="dd-sep">${ui.anatomy}</span>` + ANATOMY.map(([h, n]) => link(h, `${n[lang]} <small>3D</small>`)).join('') + '</div></div>') +   // the home page already has "The robots": no second robots menu there
      '<div class="nav-tools">' +
      `<button class="icon-btn search-btn" type="button" aria-label="${ui.search}" title="${ui.search}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg></button>` +
      `<div class="seg" role="group" aria-label="${ui.lang}"><button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="fr" aria-pressed="${lang === 'fr'}">FR</button></div>` +
      `<button class="icon-btn theme-btn" type="button" aria-label="${ui.theme}" title="${ui.theme}"></button>` +
      `<button class="icon-btn nav-toggle" type="button" aria-label="${ui.menu}" aria-expanded="false">☰</button></div></div>`;
    document.body.insertBefore(nav, document.body.firstChild);

    // a small badge while the connection is lost
    const badge = document.createElement('span');
    badge.className = 'off-badge'; badge.textContent = lang === 'fr' ? 'Hors ligne' : 'Offline';
    badge.title = lang === 'fr' ? 'Pas de connexion : vous lisez la copie enregistrée sur cet appareil.' : 'No connection: you are reading the copy stored on this device.';
    nav.querySelector('.nav-tools').prepend(badge);
    const net = () => { badge.hidden = navigator.onLine !== false; };
    window.addEventListener('online', net); window.addEventListener('offline', net); net();
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
      // go to the twin page in that language when there is one, else reload (the pages are built in JavaScript)
      if (hasTwin(here) && pageName !== '404') location.href = twinUrl(b.dataset.lang); else location.reload();
    }));
    const links = nav.querySelector('.nav-l'), toggle = nav.querySelector('.nav-toggle');
    const ddBtn = nav.querySelector('.dd-btn'), dd = nav.querySelector('.dd');
    toggle.addEventListener('click', () => { const o = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(o)); });
    if (ddBtn) {
      ddBtn.addEventListener('click', (e) => { e.stopPropagation(); const o = dd.classList.toggle('open'); ddBtn.setAttribute('aria-expanded', String(o)); });
      document.addEventListener('click', () => { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); });
    }
    // the search: search.js is loaded the first time it is opened
    const openSearch = (q) => {
      if (RA.openSearch) return RA.openSearch(q);
      const sc = document.createElement('script'); sc.src = 'search.js'; sc.onload = () => RA.openSearch && RA.openSearch(q); document.head.appendChild(sc);
    };
    nav.querySelector('.search-btn').addEventListener('click', () => { nav.classList.remove('open'); openSearch(); });
    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
      if (((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) || (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey)) { e.preventDefault(); openSearch(); }
    });
    const q0 = new URLSearchParams(location.search).get('q'); if (q0) openSearch(q0);
    // course pages: the list of the 17 courses is folded into one line (this course, its progress, "All the courses")
    const cnav = document.querySelector('nav.courses');
    if (cnav && cnav.querySelector('.course.current')) {
      cnav.classList.add('fold');
      const tg = document.createElement('button'); tg.type = 'button'; tg.className = 'courses-toggle ra-own'; tg.setAttribute('aria-expanded', 'false');
      const lab = (o) => { tg.innerHTML = o ? (lang === 'fr' ? 'Replier la liste ▴' : 'Fold the list ▴') : (lang === 'fr' ? 'Tous les cours ▾' : 'All the courses ▾'); };
      lab(false); cnav.appendChild(tg);
      tg.addEventListener('click', () => { const o = cnav.classList.toggle('open'); tg.setAttribute('aria-expanded', String(o)); lab(o); });
    }
    // course pages: a link to the certificate after the last lesson
    const cta = document.querySelector('.finish .cta'), curCard = document.querySelector('.courses .course.current');
    if (cta && curCard) {
      const c = document.createElement('p');
      c.className = 'cta cert-cta ra-own';
      const noExam = ['armlab', 'wmrpro'].includes(curCard.dataset.key);   // these two have their exam in their last lesson
      c.innerHTML = (noExam ? '' : `<a class="btn" href="exam.html#${curCard.dataset.key}">${lang === 'fr' ? '📝 Passer l\'examen final' : '📝 Take the final exam'}</a> `) + `<a class="btn ghost" href="certificate.html#${curCard.dataset.key}">${lang === 'fr' ? '🎓 Obtenir mon certificat' : '🎓 Get my certificate'}</a> <a class="btn ghost" href="revision.html#${here.replace(/\.html$/, '')}">${lang === 'fr' ? '🖨 Fiche de révision du cours' : '🖨 Revision sheet of the course'}</a>`;
      cta.after(c);
    }
    // lessons about sensors: a link to the matching bench of the sensor test bench
    const SENS = { learn: { l10: 'encoder' }, 'learn-control': { l3: 'encoder' }, 'learn-intelligence': { l1: 'lidar', l3: 'imu' }, 'learn-mobile-pro': { l14: 'imu', l15: 'gnss' } };
    Object.entries(SENS[here.replace(/\.html$/, '')] || {}).forEach(([id, bench]) => {
      const art = document.getElementById(id); if (!art) return;
      const p = document.createElement('p'); p.className = 'try sb-link ra-own';
      p.innerHTML = `<a href="sensors.html#${bench}">${lang === 'fr' ? 'Essayez les capteurs en direct : le banc d\'essai des capteurs (encodeur, IMU, lidar, caméra, ultrasons, GNSS) →' : 'Try the sensors live: the sensor test bench (encoder, IMU, lidar, camera, ultrasonic, GNSS) →'}</a>`;
      const at = art.querySelector('details.quiz, .lquiz, .exs, label.lesson-done');
      if (at) at.before(p); else art.appendChild(p);
    });
    // course pages: at the end of each lesson, the lessons of the other courses that prepare it and that go further (links-data.js)
    if (document.querySelector('article.lesson[id]')) {
      const showLinks = () => {
        const DATA = window.RA_LINKS || {}, fr = lang === 'fr', pg = here.replace(/\.html$/, '');
        const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const item = (x) => `<li><a href="${x.u.replace('#', '.html#')}"><b>${esc(x.c[+fr])}</b> · ${fr ? 'leçon' : 'lesson'} ${esc(x.n)}${fr ? ' : ' : ': '}${esc(x.t[+fr])}</a><span>${esc(x.w[+fr])}</span></li>`;
        document.querySelectorAll('article.lesson[id]').forEach((art) => {
          const L = DATA[pg + '#' + art.id]; if (!L || art.querySelector('.xlinks')) return;
          const box = document.createElement('aside'); box.className = 'xlinks ra-own';
          box.innerHTML = `<div class="xl-t">${fr ? '🔗 Liens avec les autres cours' : '🔗 Links with the other courses'}</div>` +
            (L.pre.length ? `<div class="xl-h">${fr ? 'À revoir d\'abord si besoin' : 'Revise first if needed'}</div><ul>${L.pre.map(item).join('')}</ul>` : '') +
            (L.next.length ? `<div class="xl-h">${fr ? 'Pour aller plus loin' : 'To go further'}</div><ul>${L.next.map(item).join('')}</ul>` : '');
          const at = art.querySelector('details.quiz, .lquiz, label.lesson-done');
          if (at) at.before(box); else art.appendChild(box);
        });
      };
      if (window.RA_LINKS) showLinks(); else { const s = document.createElement('script'); s.src = 'links-data.js'; s.onload = showLinks; document.head.appendChild(s); }
    }
    // course glossaries: a link to the general glossary, filtered on this course
    const gl = document.querySelector('section.gloss > p');
    if (gl) {
      const g = document.createElement('p');
      g.className = 'gl-link ra-own';
      g.innerHTML = `<a class="btn sm ghost" href="glossary.html?course=${here.replace(/\.html$/, '')}">${lang === 'fr' ? 'Ouvrir le glossaire général de tous les cours →' : 'Open the general glossary of every course →'}</a> <a class="btn sm ghost" href="revision.html#${here.replace(/\.html$/, '')}">${lang === 'fr' ? 'Fiche de révision imprimable →' : 'Printable revision sheet →'}</a>`;
      gl.after(g);
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (dd) dd.classList.remove('open'); nav.classList.remove('open'); } });

    const foot = document.createElement('footer');
    foot.className = 'site-foot';
    const i = ROBOTS.findIndex((r) => r[0] === here);
    let pager = '';
    if (i >= 0) {
      const p = ROBOTS[(i + ROBOTS.length - 1) % ROBOTS.length], n = ROBOTS[(i + 1) % ROBOTS.length];
      pager = `<div class="pager"><a href="${p[0]}">← ${p[1][lang]}</a><a href="${n[0]}">${n[1][lang]} →</a></div>`;
    }
    const doneBar = i >= 0 ? `<div class="done-bar"><label class="done-toggle"><input type="checkbox" id="pageDone"><span class="box" aria-hidden="true"></span><span class="lbl">${ui.done}</span></label><a href="index.html#road">${ui.road} →</a></div>` : '';
    const social = '<p class="social">' + SOCIAL.map(([name, url, icon]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${name}">${icon}<span>${name}</span></a>`).join('') + '</p>';
    // the footer: four columns of links (the same groups as the top menus), then who made the site
    const col = (title, items) => `<div class="fcol"><span class="fh">${title}</span>${items.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>`;
    const T = (list) => list.map(([h, en, fr]) => [h, lang === 'fr' ? fr : en]);
    const cols = '<nav class="fcols" aria-label="' + (lang === 'fr' ? 'Plan du site' : 'Site map') + '">' +
      col(ui.learnH, [['index.html#road', lang === 'fr' ? 'Parcours et tous les cours' : 'Roadmap and all the courses'], ['learn.html', ui.learnFoot], ['glossary.html', ui.gloss], ['revision.html', ui.rev], ['exam.html', lang === 'fr' ? 'Examens finaux' : 'Final exams']]) +
      col(ui.robots, ROBOT_FAMILIES.map(([g, list]) => [list[0], g[lang]]).concat([['index.html#robots', ui.allRobots], ['anatomy.html', ui.anatomy]])) +
      col(ui.tools, T(MENU_TOOLS)) +
      col(ui.me, T(MENU_ME.filter((x) => !/glossary|revision|exam/.test(x[0]))).concat([['about.html', ui.aboutH]])) + '</nav>';
    foot.innerHTML = doneBar + pager + cols +
      `<p class="by">${ui.by} <a href="https://ayabriksine.com" target="_blank" rel="noopener">Aya Briksine</a></p>` + social +
      `<p class="fsmall">${ui.foot} <a href="https://threejs.org">three.js</a></p>`;
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
    if (h1 && h1.nextElementSibling && h1.nextElementSibling.tagName === 'P' && h1.nextElementSibling.querySelector('a[href="index.html"], a[href="index-fr.html"]')) h1.nextElementSibling.classList.add('crumbs');
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
    // long pages in three parts, with a menu on the left that lists every title. starts: the three body children where the
    // parts begin; T: the names of the parts; IDS: their addresses. One part is shown at a time; a title opens its part.
    const makeTabs = (starts, T, IDS) => {
      const kids = [...body.children], at = starts.map((el) => kids.indexOf(el));
      const skip = (el) => /^(SCRIPT|STYLE|HEADER|FOOTER)$/.test(el.tagName) || el.classList.contains('site-nav') || el.classList.contains('site-foot') || el.classList.contains('to-top');
      const panes = IDS.map((id) => { const d = document.createElement('section'); d.className = 'rtab-pane'; d.id = 'tab-' + id; return d; });
      kids.forEach((el, i) => { if (i < at[0] || skip(el)) return; panes[i < at[1] ? 0 : i < at[2] ? 1 : 2].appendChild(el); });
      // the menu: each part, then the titles (h2) inside it
      const wrap = document.createElement('div'); wrap.className = 'rside-wrap';
      const side = document.createElement('nav'); side.className = 'rside ra-own'; side.setAttribute('aria-label', lang === 'fr' ? 'Sommaire de la page' : 'Page contents');
      const main = document.createElement('div'); main.className = 'rside-main';
      let n = 0;
      const heads = panes.map((p) => [...p.querySelectorAll('h2')].filter((h) => h.textContent.trim()).map((h) => { if (!h.id) h.id = 'sec' + (++n); return h; }));
      const short = (h) => h.textContent.replace(/\s*\((schéma cinématique|kinematic diagram)\)\s*$/i, '').trim();
      side.innerHTML = `<details open><summary>${lang === 'fr' ? 'Sommaire' : 'Contents'}</summary><ol>` + IDS.map((id, k) =>
        `<li class="rs-part" data-k="${k}"><a href="#${id}" class="rs-head" data-k="${k}"><b>${k + 1}</b>${T[k]}</a><ul>` +
        heads[k].map((h) => `<li><a href="#${h.id}" data-k="${k}" data-h="${h.id}">${short(h)}</a></li>`).join('') + '</ul></li>').join('') + '</ol></details>';
      const anchor = h1.nextElementSibling && h1.nextElementSibling.classList.contains('crumbs') ? h1.nextElementSibling : h1;
      anchor.after(wrap); wrap.append(side, main); main.append(...panes);
      // the menu follows the language (the titles are translated after the page is built)
      heads.flat().forEach((h) => new MutationObserver(() => { const a = side.querySelector(`a[data-h="${h.id}"]`); if (a && a.textContent !== short(h)) a.textContent = short(h); }).observe(h, { childList: true, characterData: true, subtree: true }));
      let cur = -1;
      const show = (k) => {
        if (k === cur) return; cur = k;
        panes.forEach((p, j) => { p.hidden = j !== k; });
        side.querySelectorAll('.rs-part').forEach((li) => li.classList.toggle('open', +li.dataset.k === k));
        window.dispatchEvent(new Event('resize'));                                   // the 3D views and the diagram take their size again
        const svg = document.getElementById('schema'); if (svg) svg.setAttribute('data-shown', String(Date.now()));
      };
      const go = (y) => window.scrollTo({ top: Math.max(0, y - 90), behavior: 'smooth' });
      side.addEventListener('click', (e) => {
        const a = e.target.closest('a'); if (!a) return; e.preventDefault();
        const k = +a.dataset.k; show(k);
        if (a.dataset.h) { const h = document.getElementById(a.dataset.h); go(h.getBoundingClientRect().top + window.scrollY); history.replaceState(null, '', '#' + a.dataset.h); }
        else { go(wrap.getBoundingClientRect().top + window.scrollY); history.replaceState(null, '', '#' + IDS[k]); }
        if (matchMedia('(max-width: 900px)').matches) side.querySelector('details').open = false;
      });
      // the title being read is marked in the menu
      const mark = () => {
        const list = heads[cur] || []; let on = null;
        for (const h of list) if (h.getBoundingClientRect().top < 140) on = h.id;
        side.querySelectorAll('a[data-h]').forEach((a) => a.classList.toggle('on', a.dataset.h === on));
      };
      window.addEventListener('scroll', mark, { passive: true });
      // the part of the address: one of IDS, or the part that holds the element the address points to
      const h = decodeURIComponent(location.hash.slice(1)), byId = IDS.indexOf(h), el = h && document.getElementById(h);
      show(byId >= 0 ? byId : el ? Math.max(0, panes.findIndex((p) => p.contains(el))) : 0);
      if (matchMedia('(max-width: 900px)').matches) side.querySelector('details').open = false;
      mark();
      // other links to a section of a hidden part open that part first
      document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (!a || a.closest('.rside')) return; const t = document.getElementById(a.getAttribute('href').slice(1)); const k = t ? panes.findIndex((p) => p.contains(t)) : -1; if (k >= 0 && panes[k].hidden) show(k); }, true);
      side.querySelector('summary').addEventListener('click', (e) => { if (!matchMedia('(max-width: 900px)').matches) e.preventDefault(); });   // always open on a computer
      body.classList.add('has-rside');
    };
    const fr = lang === 'fr', bodyH2 = [...body.children].filter((el) => el.tagName === 'H2' && !el.closest('.stage-side'));
    // robot pages: 1. the robot in 3D (view and joints), 2. kinematics and models (from the kinematic diagram to the result),
    // 3. uses and inside (where it is used, the real components, the operations)
    const usesAt = body.querySelector(':scope > .robot');
    if (h1 && view && bodyH2[0] && usesAt && [...body.children].indexOf(usesAt) > [...body.children].indexOf(bodyH2[0])) {
      makeTabs([body.querySelector(':scope > .stage') || view, bodyH2[0], usesAt], fr ? ['Le robot en 3D', 'Cinématique et modèles', 'Usages et intérieur'] : ['The robot in 3D', 'Kinematics and models', 'Uses and inside'], ['robot', 'kinematics', 'uses']);
    }
    // 3D anatomy pages: 1. the robot in 3D (the model, X-ray, the axes), 2. inside each joint, 3. all the components
    const anat = body.querySelector(':scope > .anat');
    if (h1 && anat && bodyH2.length >= 2 && !body.querySelector('.rside')) {
      const first = body.querySelector(':scope > p.lead') || anat;
      makeTabs([first, bodyH2[0], bodyH2[1]], fr ? ['Le robot en 3D', 'Dans chaque articulation', 'Tous les composants'] : ['The robot in 3D', 'Inside each joint', 'All the components'], ['robot', 'joints', 'components']);
    }
    // chips that jump to each section
    const heads = [...body.querySelectorAll('h2')].filter((h) => !h.closest('.stage-side') && !h.closest('.robot') && h.textContent.trim());
    if (h1 && heads.length > 2 && !body.classList.contains('home') && !body.classList.contains('learn') && !body.querySelector('.rside')) {
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
      const u = new URL(a.href, location.href), same = (p) => (p.endsWith('/') ? p + 'index' : p).replace(/\.html$/, '');   // /, /index, /index.html: one page
      if (u.origin !== location.origin || same(u.pathname) !== same(location.pathname)) return;
      let y = null;
      if (u.hash) { const t = document.getElementById(u.hash.slice(1)); if (t) y = t.getBoundingClientRect().top + window.scrollY - (t.matches('.scene-sec') ? 0 : 84); }
      else if (/index(-fr)?(\.html)?$|\/$/.test(u.pathname) && !u.search) y = 0;
      if (y === null) return;
      e.preventDefault(); history.replaceState(null, '', u.hash || u.pathname); smoothTo(Math.max(0, y)); document.querySelector('.site-nav').classList.remove('open');
    });
    if (here !== 'index.html') return;
    const map = [['top', 'index.html'], ['tour', 'index.html#tour'], ['gallery', 'index.html#gallery'], ['start', 'index.html#inside'], ['inside', 'index.html#inside'], ['road', 'index.html#road'], ['sign', 'index.html#road']];
    const marks = () => {
      const mid = window.scrollY + innerHeight / 2; let cur = 'top';
      for (const [id] of map) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top + window.scrollY <= mid) cur = id; }
      document.querySelectorAll('.nav-l a, .dd-link').forEach((a) => {
        const h = (a.getAttribute('href') || '').replace('index-fr.html', 'index.html'), cur2 = map.find((m) => m[0] === cur)[1], on = h === cur2 && !(a.classList.contains('dd-link') && cur !== 'gallery');
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', marks, { passive: true }); marks();
  }

  // ---------------------------------------------------------------- if the 3D engine cannot be loaded, say so (and offer a reload) instead of leaving empty boxes
  function watch3d() {
    const needs = document.querySelector('script[type="importmap"]'); if (!needs || document.body.classList.contains('learn')) return;   // course pages load three only when a 3D lab is opened
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

  // on a French twin page, the links to the other pages lead to their French twins
  function frLinks(el) {
    const fix = (a) => {
      const h = a.getAttribute('href'), m = h && h.match(/^([a-z0-9-]+\.html)([?#].*)?$/);
      if (m && hasTwin(m[1])) a.setAttribute('href', m[1].replace(/\.html$/, '-fr.html') + (m[2] || ''));
    };
    if (el.tagName === 'A') fix(el); el.querySelectorAll('a[href]').forEach(fix);
  }
  function init() {
    if (window.RA_PRERENDER) {                                              // tools/build-fr.mjs: translate the page as it is written, nothing else
      loadDictionaries(() => { doEl(document.body); const t = RA.tr(document.title); if (t) document.title = t; window.RA_DONE = true; });
      return;
    }
    build();
    if (frTwin) { frLinks(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) frLinks(n); }))).observe(document.body, { childList: true, subtree: true }); }
    // code blocks that scroll sideways can be reached and scrolled with the keyboard
    document.querySelectorAll('pre').forEach((pre) => { if (!pre.hasAttribute('tabindex')) pre.tabIndex = 0; });
    watch3d();
    robotPage();
    wireScroll();
    if (lang === 'fr') loadDictionaries(startTranslation);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
