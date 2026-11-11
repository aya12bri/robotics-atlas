// build-home.mjs — adds the "Look inside the robots" tiles (links to the 3D anatomy pages) to the home page, with their French texts.
//   node tools/build-home.mjs      (idempotent)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, reset, tx } from './lib.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
reset();
// [page, name, kinematics tag, one simple sentence for a beginner]
const GROUPS = [
  [['Robot arms', 'Bras robotisés'], ['Arms that pick, place, weld and assemble in factories.', 'Des bras qui prennent, posent, soudent et assemblent dans les usines.'], [
    ['anatomy.html', ['6-axis industrial robot', 'Robot industriel 6 axes'], '6 × R', ['The arm of car factories: strong, fast, inside a cage.', 'Le bras des usines automobiles : fort, rapide, dans une cage.']],
    ['anatomy-cobot.html', ['Collaborative robot', 'Robot collaboratif'], '6 × R', ['A gentle arm that works next to people, without a cage.', 'Un bras doux qui travaille à côté des personnes, sans cage.']],
    ['anatomy-scara.html', ['SCARA', 'SCARA'], 'R-R-P-R', ['Very fast for assembling small parts on a table.', 'Très rapide pour assembler de petites pièces sur une table.']],
    ['anatomy-gantry.html', ['Cartesian gantry', 'Robot cartésien'], 'P-P-P', ['Three straight axes X, Y, Z: simple, precise, can be huge.', 'Trois axes droits X, Y, Z : simple, précis, peut être immense.']]]],
  [['Parallel robots', 'Robots parallèles'], ['Several arms hold the same platform: light and very fast.', 'Plusieurs bras tiennent la même plateforme : léger et très rapide.'], [
    ['anatomy-delta.html', ['Delta robot', 'Robot Delta'], ['Parallel', 'Parallèle'], ['Picks hundreds of chocolates per minute.', 'Prend des centaines de chocolats par minute.']],
    ['anatomy-stewart.html', ['Stewart platform', 'Plateforme de Stewart'], ['6 legs', '6 vérins'], ['Six legs tilt a platform: flight simulators.', 'Six vérins inclinent une plateforme : simulateurs de vol.']]]],
  [['Mobile robots', 'Robots mobiles'], ['Robots that move around on wheels.', 'Des robots qui se déplacent sur des roues.'], []],
  [['Robots that walk and fly', 'Robots qui marchent et qui volent'], ['Legs and propellers: the most demanding balance.', 'Des jambes et des hélices : l\'équilibre le plus difficile.'], [
    ['anatomy-humanoid.html', ['Humanoid', 'Humanoïde'], ['it walks', 'il marche'], ['Walks on two legs and keeps its balance.', 'Marche sur deux jambes et garde son équilibre.']],
    ['anatomy-quadrotor.html', ['Quadrotor', 'Quadrirotor'], ['it flies', 'il vole'], ['Four propellers: it flies, tilts and turns.', 'Quatre hélices : il vole, s\'incline et tourne.']]]]
];
GROUPS[2] = [GROUPS[2][0], GROUPS[2][1], [
  ['anatomy-mobile.html', ['Mobile robot', 'Robot mobile'], ['2 wheels', '2 roues'], ['Two motor wheels: it goes forward and turns.', 'Deux roues motrices : il avance et tourne.']],
  ['anatomy-drives.html', ['Drive configurations', 'Configurations de motorisation'], ['8 layouts', '8 configurations'], ['Drive 8 different robots yourself.', 'Conduisez vous-même 8 robots différents.']],
  ['anatomy-wheels.html', ['Wheels', 'Roues'], ['7 types', '7 types'], ['From the simple wheel to the omni and Mecanum wheel.', 'De la roue simple à la roue omni et Mecanum.']]]];
const t = (x) => (Array.isArray(x) ? tx(x[0], x[1]) : tx(x));
const card = ([h, n, k, d]) => { const img = h.replace('.html', ''); return `<a href="${h}" class="anat-card"><span class="anat-img"><img class="th-light" src="thumbs/${img}.jpg" alt="" width="670" height="500" loading="lazy" decoding="async"><img class="th-dark" src="thumbs/${img}-dark.jpg" alt="" width="670" height="500" loading="lazy" decoding="async"><i>${t(k)}</i></span><b>${t(n)}</b><em>${t(d)}</em><span class="anat-go">${tx('Explore in 3D →', 'Explorer en 3D →')}</span></a>`; };
const html = `<!-- anatomy-home -->
        <div class="anat-home" id="inside">
          <h3>${tx('Look inside the robots', 'Regarder à l\'intérieur des robots')}</h3>
          <p>${tx('Eleven robots in 3D. Turn them with the mouse, open them in X-ray to see the motors, gearboxes and cables, and take them apart component by component.', 'Onze robots en 3D. Tournez-les à la souris, ouvrez-les en rayons X pour voir les moteurs, réducteurs et câbles, et démontez-les composant par composant.')}</p>
          <div class="anat-filter" role="group" aria-label="${tx('Type of robot', 'Type de robot')}"><button type="button" data-f="all" aria-pressed="true">${tx('All', 'Tous')} <i>11</i></button><button type="button" data-f="man" aria-pressed="false">${tx('Manipulators', 'Manipulateurs')} <i>6</i></button><button type="button" data-f="mob" aria-pressed="false">${tx('Mobile robots', 'Robots mobiles')} <i>3</i></button><button type="button" data-f="leg" aria-pressed="false">${tx('Humanoids and drones', 'Humanoïdes et drones')} <i>2</i></button></div>
          <div class="anat-groups">${[[GROUPS[0], 'man'], [GROUPS[1], 'man'], [GROUPS[3], 'leg'], [GROUPS[2], 'mob']].map(([[g, gd, cards], ty]) => `<section class="anat-group" data-type="${ty}" style="--n:${cards.length}"><div class="anat-gh"><h4>${t(g)}</h4><span>${t(gd)}</span></div><div class="anat-grid">${cards.map(card).join('')}</div></section>`).join('')}</div>
        </div>
          <script>document.querySelectorAll('.anat-filter button').forEach((b) => b.addEventListener('click', () => { const f = b.dataset.f; document.querySelectorAll('.anat-filter button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); document.querySelectorAll('.anat-group').forEach((g) => { g.hidden = f !== 'all' && g.dataset.type !== f; }); document.querySelector('.anat-groups').classList.toggle('filtered', f !== 'all'); }));</script>
        <!-- /anatomy-home -->
`;
const file = path.join(root, 'index.html'); let h = fs.readFileSync(file, 'utf8');
// the tiles sit at the top of the section, right after the gallery, so the 3D views are visible without scrolling to the roadmap
h = h.replace(/ *<!-- anatomy-home -->[\s\S]*?<!-- \/anatomy-home -->\n/, '');
h = h.replace(/ *<div class="rm-head"[^>]*>/, (m) => '        ' + html + '        <div class="rm-head" id="road">');
fs.writeFileSync(file, h);
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await (await browser.newContext()).newPage();
await page.goto(pathToFileURL(file).href); await page.waitForFunction(() => window.RA && RA.hash);
const pairs = [...REG.entries()];
const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), pairs.map((p) => p[0]));
await browser.close();
const dict = {}; pairs.forEach(([en, fr], i) => { dict[keys[i]] = fr; });
const f = path.join(root, 'i18n', 'fr-index.js');
const s = fs.readFileSync(f, 'utf8').replace(/\n?\/\/ BEGIN anatomy-home[\s\S]*?\/\/ END anatomy-home\n?/, '\n');
fs.writeFileSync(f, s.trimEnd() + `\n// BEGIN anatomy-home (generated by tools/build-home.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n// END anatomy-home\n`);
console.log('texts', pairs.length);
