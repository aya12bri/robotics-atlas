// add-robot-fr.mjs — the French texts of the robot pages written by hand in English (cylindrical, spherical, redundant,
// hexapod), from tools/robots-fr.mjs, into i18n/fr-<page>.js. Then each page is opened in English and in French and every
// visible text left in English is listed, so that nothing is forgotten.
//   PLAYWRIGHT=… CHROME=… node tools/add-robot-fr.mjs [page …]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
const { FR } = await import(pathToFileURL(path.join(root, 'tools', 'robots-fr.mjs')).href + '?t=' + Date.now());
const only = process.argv.slice(2);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const open = async (lang, file) => {
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  await ctx.addInitScript((l) => { localStorage.setItem('ra-lang', l); }, lang);
  const page = await ctx.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(base + file); await page.waitForTimeout(lang === 'fr' ? 1800 : 1200);
  return { page, ctx };
};
// the visible texts of a page, in document order (the site menu and footer excluded)
const texts = () => {
  const out = [], skip = (el) => el.closest('.site-nav, .site-foot, script, style, .ra-own, pre.matrix#matrix, #dhStd, #dhMod');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (/[A-Za-z]{3}/.test(t) && !skip(n.parentElement)) out.push(t); }
  document.querySelectorAll('[aria-label]').forEach((e) => { if (!skip(e)) out.push('@aria ' + e.getAttribute('aria-label')); });
  return out;
};
for (const [file, pairs] of Object.entries(FR)) {
  if (only.length && !only.includes(file.replace(/\.html$/, ''))) continue;
  // 1. the dictionary
  const { page, ctx } = await open('en', file);
  const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), pairs.map((p) => p[0]));
  await ctx.close();
  const dict = {}; pairs.forEach(([, fr], i) => { dict[keys[i]] = fr; });
  const name = file.replace(/\.html$/, '');
  fs.writeFileSync(path.join(root, 'i18n', `fr-${name}.js`), `// Français — page ${name}. Clé = empreinte du texte anglais, valeur = traduction (généré par tools/add-robot-fr.mjs).\nRA.add(${JSON.stringify(dict, null, 0).replace(/","/g, '",\n"')});\n`);
  // 2. what is still in English
  const en = await open('en', file), a = await en.page.evaluate(texts); await en.ctx.close();
  const fr = await open('fr', file), b = await fr.page.evaluate(texts); await fr.ctx.close();
  const left = [...new Set(b.filter((t) => a.includes(t) && !/^(q\d|x\d|y\d|z\d|DH|DHM|MGD|MGI|[A-Z]-[A-Z])/.test(t)))];
  console.log(`${file}: ${pairs.length} texts, ${left.length} left in English${left.length ? ':\n   ' + left.join('\n   ') : ''}`);
}
await browser.close(); server.close();
