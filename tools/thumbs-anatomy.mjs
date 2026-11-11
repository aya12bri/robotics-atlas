// thumbs-anatomy.mjs — takes a clean picture of every Anatomy 3D page for the home page tiles,
// in light and in dark: thumbs/<page>.jpg and thumbs/<page>-dark.jpg (needs a local server on port 8123).
//   PLAYWRIGHT=... CHROME=... node tools/thumbs-anatomy.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
const PAGES = ['anatomy', 'anatomy-scara', 'anatomy-cobot', 'anatomy-delta', 'anatomy-gantry', 'anatomy-mobile', 'anatomy-wheels', 'anatomy-drives', 'anatomy-stewart', 'anatomy-quadrotor', 'anatomy-humanoid'];
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
for (const theme of ['light', 'dark']) for (const f of PAGES) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
  await page.addInitScript((th) => { localStorage.setItem('ra-theme', th); localStorage.setItem('ra-lang', 'en'); }, theme);
  await page.goto(`http://localhost:8123/${f}.html?thumb`); await page.waitForTimeout(1800);
  await page.addStyleTag({ content: '#anatView > :not(canvas) { display: none !important; } #anatView { height: 680px !important; min-height: 0 !important; border-radius: 0 !important; border: 0 !important; box-shadow: none !important; }' });
  await page.waitForTimeout(700);
  await (await page.$('#anatView')).screenshot({ path: path.join(root, 'thumbs', `${f}${theme === 'dark' ? '-dark' : ''}.png`) });
  await page.close();
}
await browser.close();
