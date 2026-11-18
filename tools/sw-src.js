// The service worker of Robotics Atlas (offline mode). tools/build-offline.mjs writes sw.js = the list of files
// (FILES: url → content hash, SIZE: total bytes, CORE: the files kept at install) + this code.
//  * at install, the core files (home page and everything every page needs) are stored, and the files already stored
//    whose content changed are fetched again; nothing else is downloaded without the visitor asking;
//  * every page the visitor opens is stored, so it works offline next time;
//  * "download the whole site" (message from the page) stores every file;
//  * pages: network first (fresh content), the stored copy when offline; other files: the stored copy (kept up to date
//    by the content hashes), else the network; Google fonts: the stored copy, refreshed in the background.
const SITE = 'ra-site', RUNTIME = 'ra-runtime', META = '/__ra-meta';

// one key per file, whatever URL form is used: /, /index, /learn, /learn.html → /index.html, /learn.html
function key(u) {
  const url = new URL(u, self.location.origin);
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  else if (!/\.[a-z0-9]+$/i.test(p)) p += '.html';
  return p;
}
// what to ask the server for: Cloudflare serves pages at their pretty URL (/learn); a plain server (local tests) at /learn.html
async function fetchFile(k) {
  const tries = k.endsWith('.html') ? [k === '/index.html' ? '/' : k.replace(/\.html$/, ''), k] : [k];
  let last;
  for (const t of tries) {
    try {
      const r = await fetch(t, { cache: 'reload', credentials: 'same-origin' });
      if (r.ok) return clean(r);
      last = r;
    } catch (e) { last = e; }
  }
  throw new Error('fetch failed: ' + k + ' ' + (last && last.status));
}
// a response that followed a redirect cannot answer a page request: copy it
async function clean(r) {
  if (!r.redirected) return r;
  return new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: r.headers });
}
// the stored copy carries the content hash of the file, so an old copy is recognised without any shared state
async function stamp(r, k) {
  const h = new Headers(r.headers); h.set('x-ra-hash', FILES[k] || '');
  return new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: h });
}
const fresh = (r, k) => !!r && r.headers.get('x-ra-hash') === FILES[k];
async function meta(cache) { const r = await cache.match(META); return r ? r.json() : { full: false }; }
async function saveMeta(cache, m) { await cache.put(META, new Response(JSON.stringify(m), { headers: { 'content-type': 'application/json' } })); }

// store the files of a list whose stored copy is missing or old; the progress is reported to the pages
async function store(list, report) {
  const cache = await caches.open(SITE);
  let done = 0, failed = 0;
  const todo = list.filter((k) => FILES[k]);
  const queue = todo.slice();
  async function worker() {
    while (queue.length) {
      const k = queue.shift();
      try {
        if (!fresh(await cache.match(k), k)) await cache.put(k, await stamp(await fetchFile(k), k));
      } catch (e) { failed++; }
      done++;
      if (report && (done % 4 === 0 || done === todo.length)) report({ type: 'progress', done, total: todo.length, failed });
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  return { done, failed };
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SITE), m = await meta(cache);
    // the core, the files already stored (fetched again if they changed), or everything if the visitor asked for it
    const had = (await cache.keys()).map((r) => new URL(r.url).pathname).filter((k) => k !== META);
    const want = m.full ? Object.keys(FILES) : [...new Set(CORE.concat(had))];
    await store(want);
    // files that left the site
    for (const k of had) if (!FILES[k]) await cache.delete(k);
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) if (n !== SITE && n !== RUNTIME) await caches.delete(n);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  const d = e.data || {}, src = e.source;
  const reply = (msg) => src && src.postMessage(msg);
  if (d.type === 'status') {
    e.waitUntil((async () => {
      const cache = await caches.open(SITE), m = await meta(cache);
      const keys = (await cache.keys()).map((r) => new URL(r.url).pathname).filter((k) => FILES[k]);
      const bytes = keys.reduce((a, k) => a + (SIZES[k] || 0), 0);
      const isPage = (k) => k.endsWith('.html') && k !== '/offline.html' && k !== '/404.html';
      reply({ type: 'status', stored: keys.length, total: Object.keys(FILES).length, pages: keys.filter(isPage).length, totalPages: Object.keys(FILES).filter(isPage).length, bytes, size: SIZE, full: !!m.full, version: VERSION });
    })());
  } else if (d.type === 'download-all') {
    e.waitUntil((async () => {
      const r = await store(Object.keys(FILES), reply);
      const cache = await caches.open(SITE), m = await meta(cache);
      m.full = r.failed === 0; await saveMeta(cache, m);
      reply({ type: 'done', failed: r.failed });
    })());
  } else if (d.type === 'clear') {
    e.waitUntil((async () => {
      await caches.delete(RUNTIME);
      const cache = await caches.open(SITE);
      for (const r of await cache.keys()) { const k = new URL(r.url).pathname; if (!CORE.includes(k)) await cache.delete(r); }
      await saveMeta(cache, { full: false });
      reply({ type: 'cleared' });
    })());
  }
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Google fonts: stored copy, refreshed in the background
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith((async () => {
      const cache = await caches.open(RUNTIME), hit = await cache.match(req);
      const net = fetch(req).then((r) => { if (r.ok || r.type === 'opaque') cache.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })());
    return;
  }
  if (url.origin !== self.location.origin) return;
  const k = key(url.href);
  if (k === '/sw.js' || k.startsWith('/__')) return;
  const isPage = req.mode === 'navigate' || k.endsWith('.html');
  if (isPage) {
    // network first (3.5 s at most), then the stored copy, then the offline page
    e.respondWith((async () => {
      const cache = await caches.open(SITE);
      const net = fetch(req);
      const use = (r) => {
        if (r.ok && FILES[k]) { e.waitUntil(stamp(r.clone(), k).then((c) => cache.put(k, c))); return clean(r); }
        return r;
      };
      // a French twin (learn-fr.html) is not stored: its English page is, and nav.js shows it in French at this address
      const stored = async () => (await cache.match(k)) || (/-fr\.html$/.test(k) && await cache.match(k.replace(/-fr\.html$/, '.html')));
      try {
        const r = await Promise.race([net, timeout(3500)]);
        if (r.ok || r.status === 404 || r.type === 'opaqueredirect') return use(r);   // /learn.html → /learn on Cloudflare: the browser follows it
        throw new Error('status ' + r.status);
      } catch (err) {
        const hit = await stored();
        if (hit) return hit;
        // nothing stored for this page (a new page, a first visit): a slow network is not "offline", wait for the real answer
        try { return use(await net); } catch (err2) { return (await cache.match('/offline.html')) || Response.error(); }
      }
    })());
    return;
  }
  // other files: the stored copy if it is up to date, else the network (and store it if it belongs to the site)
  e.respondWith((async () => {
    const cache = await caches.open(SITE), hit = await cache.match(k);
    if (fresh(hit, k)) return hit;
    try {
      const r = await fetch(req);
      if (r.ok && FILES[k]) e.waitUntil(stamp(r.clone(), k).then((c) => cache.put(k, c)));
      return r;
    } catch (err) {
      return hit || Response.error();
    }
  })());
});
