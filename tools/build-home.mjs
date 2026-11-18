// build-home.mjs — adds the robot catalogue (every robot by family, with its interactive page and its 3D anatomy) to the home page, with its French texts.
//   node tools/build-home.mjs      (idempotent)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, reset, tx } from './lib.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
reset();
// the robot catalogue of the home page, by family. Each robot: [name, kinematics tag, one simple sentence for a beginner,
// its interactive page (or null), its 3D anatomy page (or null), thumbnail]. Each robot appears once, with its two pages.
const FAMILIES = [
  ['ser', ['Serial arms', 'Bras série'], ['One chain of joints from the base to the tool: they pick, place, weld and assemble.', 'Une seule chaîne d\'articulations de la base à l\'outil : ils prennent, posent, soudent et assemblent.'], [
    [['3-axis arm', 'Bras 3 axes'], 'R-R-R', ['The simplest arm that reaches a point in space.', 'Le bras le plus simple qui atteint un point de l\'espace.'], 'arm.html', null, 'robot-arm'],
    [['Gantry', 'Cartésien'], 'P-P-P', ['Three straight axes X, Y, Z: simple, precise, can be huge.', 'Trois axes droits X, Y, Z : simple, précis, peut être immense.'], 'gantry.html', 'anatomy-gantry.html', 'anatomy-gantry'],
    [['Cylindrical', 'Cylindrique'], 'R-P-P', ['A column that turns, a carriage that goes up, an arm that comes out.', 'Une colonne qui tourne, un chariot qui monte, un bras qui sort.'], 'cylindrical.html', null, 'robot-cylindrical'],
    [['Spherical', 'Sphérique'], 'R-R-P', ['Two angles and a telescopic arm: the very first industrial robot.', 'Deux angles et un bras télescopique : le tout premier robot industriel.'], 'spherical.html', null, 'robot-spherical'],
    [['SCARA', 'SCARA'], 'R-R-P-R', ['Very fast for assembling small parts on a table.', 'Très rapide pour assembler de petites pièces sur une table.'], 'scara.html', 'anatomy-scara.html', 'anatomy-scara'],
    [['6-axis', '6 axes'], '6 × R', ['The arm of car factories: strong, fast, inside a cage.', 'Le bras des usines automobiles : fort, rapide, dans une cage.'], 'articulated.html', 'anatomy.html', 'anatomy'],
    [['Cobot', 'Cobot'], '6 × R', ['A gentle arm that works next to people, without a cage.', 'Un bras doux qui travaille à côté des personnes, sans cage.'], 'cobot.html', 'anatomy-cobot.html', 'anatomy-cobot'],
    [['7-axis', '7 axes'], '7 × R', ['One joint too many, on purpose: the elbow moves, the tool stays still.', 'Une articulation de trop, exprès : le coude bouge, l\'outil reste immobile.'], 'redundant.html', null, 'robot-redundant']]],
  ['par', ['Parallel', 'Parallèles'], ['Several chains hold one platform.', 'Plusieurs chaînes tiennent une plateforme.'], [
    [['Delta', 'Delta'], ['Parallel', 'Parallèle'], ['Picks hundreds of chocolates per minute.', 'Prend des centaines de chocolats par minute.'], 'delta.html', 'anatomy-delta.html', 'anatomy-delta'],
    [['Hexapod', 'Hexapode'], '6-UPS', ['Six legs move a platform in 6 directions: flight simulators.', 'Six jambes bougent une plateforme dans 6 directions : simulateurs de vol.'], 'hexapod.html', 'anatomy-stewart.html', 'anatomy-stewart']]],
  ['mob', ['Mobile', 'Mobiles'], ['Robots that move around on wheels.', 'Des robots qui se déplacent sur des roues.'], [
    [['Mobile robot', 'Robot mobile'], ['2 wheels', '2 roues'], ['Two motor wheels: it goes forward and turns.', 'Deux roues motrices : il avance et tourne.'], 'mobile.html', 'anatomy-mobile.html', 'anatomy-mobile'],
    [['Wheels', 'Roues'], ['7 types', '7 types'], ['From the simple wheel to the omni and Mecanum wheel.', 'De la roue simple à la roue omni et Mecanum.'], 'wheels.html', 'anatomy-wheels.html', 'anatomy-wheels'],
    [['Drives', 'Motorisations'], ['8 layouts', '8 configurations'], ['Drive 8 different robots yourself.', 'Conduisez vous-même 8 robots différents.'], null, 'anatomy-drives.html', 'anatomy-drives']]],
  ['leg', ['Walk and fly', 'Marchent et volent'], ['Legs and propellers.', 'Des jambes et des hélices.'], [
    [['Humanoid', 'Humanoïde'], ['it walks', 'il marche'], ['Walks on two legs and keeps its balance.', 'Marche sur deux jambes et garde son équilibre.'], null, 'anatomy-humanoid.html', 'anatomy-humanoid'],
    [['Drone', 'Drone'], ['it flies', 'il vole'], ['Four propellers: it flies, tilts and turns.', 'Quatre hélices : il vole, s\'incline et tourne.'], null, 'anatomy-quadrotor.html', 'anatomy-quadrotor']]]
];
const t = (x) => (Array.isArray(x) ? tx(x[0], x[1]) : tx(x));
const card = ([n, k, d, page, anat, img]) => {
  const main = page || anat;
  const btns = (page ? `<a class="btn sm" href="${page}">${tx('Model', 'Modèle')}</a>` : '') + (anat ? `<a class="btn sm ghost" href="${anat}">${tx('Anatomy', 'Anatomie')}</a>` : '');
  return `<div class="anat-card rcat-card"><a class="anat-img" href="${main}" tabindex="-1" aria-hidden="true"><img class="th-light" src="thumbs/${img}.jpg" alt="" width="670" height="500" loading="lazy" decoding="async"><img class="th-dark" src="thumbs/${img}-dark.jpg" alt="" width="670" height="500" loading="lazy" decoding="async"><i>${t(k)}</i></a><b><a href="${main}">${t(n)}</a></b><em>${t(d)}</em><span class="rcat-btns">${btns}</span></div>`;
};
const total = FAMILIES.reduce((a, f) => a + f[3].length, 0);
const html = `<!-- anatomy-home -->
        <div class="anat-home rcat" id="robots">
          <span id="inside"></span>
          <h3>${tx('All the robots, by family', 'Tous les robots, par famille')}</h3>
          <p>${tx('Model: the interactive robot (joints, kinematic diagram, DH table). Anatomy: inside the robot in 3D (motors, gearboxes, cables).', 'Modèle : le robot interactif (articulations, schéma cinématique, tableau DH). Anatomie : l\'intérieur du robot en 3D (moteurs, réducteurs, câbles).')}</p>
          <div class="anat-filter" role="group" aria-label="${tx('Type of robot', 'Type de robot')}"><button type="button" data-f="all" aria-pressed="true">${tx('All', 'Tous')} <i>${total}</i></button>${FAMILIES.map(([id, name, , list]) => `<button type="button" data-f="${id}" aria-pressed="false">${t(name)} <i>${list.length}</i></button>`).join('')}</div>
          <div class="rcat-groups">${['ser', 'par', 'leg', 'mob'].map((k) => FAMILIES.find((f) => f[0] === k)).map(([id, name, d, list]) => `<section class="anat-group rcat-group" data-type="${id}" style="--n:${Math.min(4, list.length)}"><div class="anat-gh"><h4>${t(name)}</h4><span>${t(d)}</span></div><div class="anat-grid rcat-row">${list.map(card).join('')}</div></section>`).join('')}</div>
        </div>
          <script>document.querySelectorAll('.anat-filter button').forEach((b) => b.addEventListener('click', () => { const f = b.dataset.f; document.querySelectorAll('.anat-filter button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); document.querySelectorAll('.anat-group').forEach((g) => { g.hidden = f !== 'all' && g.dataset.type !== f; }); }));</script>
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
