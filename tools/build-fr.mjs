// build-fr.mjs — writes the French twin of every page: learn.html -> learn-fr.html, with its texts already in French,
// so that the search engines find and index the French version (each twin has its own address, see add-meta.mjs).
// The translation is the one of the site itself: the page is opened in a browser with only nav.js running, in a mode
// (window.RA_PRERENDER) where it translates the page as written with the dictionaries of i18n/ and does nothing else.
// The scripts of the page stay in the twin: the parts built by JavaScript are still made in French when it is opened.
//   PLAYWRIGHT=/path/to/playwright-core/index.mjs CHROME=/path/to/chromium node tools/build-fr.mjs
// Run it after the build scripts and before add-meta.mjs, build-search.mjs and build-offline.mjs.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const hasTwin = (f) => /^[a-z0-9-]+\.html$/.test(f) && !/^(404|offline)\.html$/.test(f) && !/-fr\.html$/.test(f);
const isStub = (f) => fs.readFileSync(path.join(root, f), 'utf8').includes('http-equiv="refresh"');   // old addresses that lead to another page (they have their own French twin)
const all = fs.readdirSync(root).filter(hasTwin).sort(), pages = all.filter((f) => !isStub(f));
// old twins of pages that no longer exist
fs.readdirSync(root).filter((f) => /-fr\.html$/.test(f) && !all.includes(f.replace(/-fr\.html$/, '.html'))).forEach((f) => { fs.unlinkSync(path.join(root, f)); console.log('removed', f); });

// the scripts of the page are switched off while it is translated (only nav.js runs), and switched back on after
const OFF = 'text/ra-off';
const scriptsOff = (h) => h.replace(/<script\b([^>]*)>/g, (all, attrs) => {
  if (/\bsrc="nav\.js"/.test(attrs)) return '<script>window.RA_PRERENDER = 1;</script>' + all;
  const t = attrs.match(/\stype="([^"]*)"/);
  return `<script data-ra-type="${t ? t[1] : ''}" type="${OFF}"${attrs.replace(/\stype="[^"]*"/, '')}>`;
});
const scriptsOn = (h) => h.replace(/<script data-ra-type="([^"]*)" type="text\/ra-off"([^>]*)>/g, (all, t, attrs) => `<script${t ? ` type="${t}"` : ''}${attrs}>`);
// links to the other pages lead to their French twins
const frLinks = (h) => h.replace(/(\shref=")([a-z0-9-]+\.html)([?#][^"]*)?"/g, (all, a, f, rest) => (hasTwin(f) ? `${a}${f.replace(/\.html$/, '-fr.html')}${rest || ''}"` : all));

// pages built by their own script (class ra-own, no dictionary): their title and the first lines written in the page
const OWN_FR = {
  'about.html': ['À propos de Robotics Atlas', 'Un site gratuit pour apprendre la robotique, du premier robot au niveau Master.'],
  'certificate.html': ['Mes certificats', 'Terminez un cours de Robotics Atlas pour obtenir un certificat à votre nom, à imprimer ou à enregistrer en PDF.'],
  'exam.html': ['Examens finaux', 'Un examen final par cours : 12 questions, corrigées tout de suite, avec l\'explication de chaque réponse.'],
  'glossary.html': ['Glossaire de la robotique', 'Tous les mots de la robotique au même endroit, avec leur sens, en français et en anglais, et la leçon qui les explique.'],
  'projects.html': ['Projets guidés', 'Trois vrais projets : un bras à servos, un suiveur de ligne et un robot mobile ROS 2, avec pièces, prix, câblage, code et tests.'],
  'review.html': ['Mes révisions', 'Répétition espacée : les questions manquées reviennent après 1, 3, 7, 16 et 35 jours, jusqu\'à ce que vous les sachiez.'],
  'revision.html': ['Fiches de révision', 'Une fiche imprimable par cours : l\'essentiel de chaque leçon, les formules et les termes clés.'],
  'sandbox.html': ['Bac à sable de programmation', 'Écrivez un petit programme et regardez un robot SCARA ou 6 axes l\'exécuter en 3D : mouvements linéaires et articulaires, pince, boucles, et un export dans un style industriel.'],
  'sensors.html': ['Banc d\'essai des capteurs', 'Chaque capteur ment un peu : essayez un codeur, une IMU, un lidar, une caméra, un capteur à ultrasons, un récepteur GNSS, un capteur d\'effort, un capteur infrarouge, une boussole et un fin de course, et voyez leur résolution, leur bruit, leur dérive et leurs angles morts.']
};
// a small server: the page asked for is served with its scripts switched off, every other file as it is
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname), f = path.join(root, u);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  let body = fs.readFileSync(f);
  if (u.endsWith('.html')) body = scriptsOff(body.toString('utf8'));
  res.writeHead(200, { 'content-type': (TYPES[path.extname(f)] || 'application/octet-stream') + '; charset=utf-8' }); res.end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const ctx = await browser.newContext({ serviceWorkers: 'block' });
await ctx.addInitScript(() => { try { localStorage.setItem('ra-lang', 'fr'); } catch (e) { /* */ } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
let n = 0;
for (const f of pages) {
  await page.goto(base + f, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.RA_DONE === true, null, { timeout: 20000 });
  // the figure sizes set by nav.js at run time are not part of the page: take them out before saving the French twin
  const { body, title } = await page.evaluate(() => { document.querySelectorAll('svg[data-sized]').forEach((s) => { s.removeAttribute('data-sized'); s.style.maxWidth = ''; if (!s.getAttribute('style')) s.removeAttribute('style'); }); return { body: document.body.innerHTML, title: document.title }; });
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  const open = src.match(/<body[^>]*>/), close = src.lastIndexOf('</body>');
  if (!open || close < 0) { console.log('no body:', f); continue; }
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let h = src.slice(0, open.index + open[0].length) + frLinks(scriptsOn(body)) + src.slice(close);
  h = h.replace(/<html\b([^>]*)>/, (all, attrs) => `<html lang="fr"${attrs.replace(/\slang="[^"]*"/, '')}>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/ *<!-- seo -->[\s\S]*?<!-- \/seo -->\n/, '');                          // add-meta.mjs writes the French tags
  if (OWN_FR[f]) {
    const [t, lead] = OWN_FR[f];
    h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(t)}</title>`).replace(/<h1>[^<]*<\/h1>/, `<h1>${esc(t)}</h1>`).replace(/<p class="lead">[^<]*<\/p>/, `<p class="lead">${esc(lead)}</p>`);
  }
  h = h.replace(/(<!DOCTYPE html>\n?)/i, `$1<!-- generated by tools/build-fr.mjs from ${f}: do not edit -->\n`);
  fs.writeFileSync(path.join(root, f.replace(/\.html$/, '-fr.html')), h); n++;
}
await browser.close(); server.close();
console.log('French twins:', n);
