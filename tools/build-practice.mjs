// build-practice.mjs — practice.html, the "Practise" page: every hands-on tool of the site in one place (build a robot,
// program it, test sensors, drive mobile robots, code an arm, real projects), and its French dictionary.
//   PLAYWRIGHT=… CHROME=… node tools/build-practice.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, reset, tx } from './lib.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
reset();

// small line icons (24 × 24, stroke = currentColor)
const I = {
  build: '<path d="M14.5 5.5l4 4M4 20l5.5-1.5L19 9l-4-4-9.5 9.5z"/><path d="M12.5 7.5l4 4"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  sensor: '<circle cx="12" cy="12" r="2.2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>',
  wheel: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 4v5.5M12 14.5V20M4 12h5.5M14.5 12H20"/>',
  drive: '<rect x="5" y="7" width="14" height="10" rx="2"/><path d="M3 9v6M21 9v6M9 7V5M15 7V5"/><circle cx="12" cy="12" r="1.6"/>',
  python: '<path d="M12 3c-4 0-4 1.6-4 3v2h4.5v1H6c-2 0-3 1.4-3 3.5S4 16 6 16h2v-2.5C8 12 9 11 10.5 11h3c1.4 0 2.5-1 2.5-2.5V6c0-1.6-1.4-3-4-3z"/><path d="M12 21c4 0 4-1.6 4-3v-2h-4.5v-1H18c2 0 3-1.4 3-3.5S20 8 18 8h-2v2.5c0 1.5-1 2.5-2.5 2.5h-3C9.1 13 8 14 8 15.5V18c0 1.6 1.4 3 4 3z"/>',
  project: '<path d="M4 7h16v12H4z"/><path d="M9 7V5h6v2M4 12h16"/>',
  ops: '<path d="M4 20h16M6 20V10l4 3V10l4 3V6l4 3v11"/>'
};
const LV = [['Beginner', 'Débutant'], ['Intermediate', 'Intermédiaire'], ['Advanced', 'Avancé']];
// [href, icon, colour, [name EN, FR], [what you do EN, FR], level 1-3, minutes]
const GROUPS = [
  [['Try and play', 'Essayer et jouer'], ['In the browser, nothing to install: move, program and test.', 'Dans le navigateur, rien à installer : bouger, programmer et tester.'], [
    ['build.html', 'build', '#2f6bff', ['Build your first robot', 'Construire votre premier robot'], ['Choose a robot, assemble it in 3D, move it and see how its joints work.', 'Choisissez un robot, assemblez-le en 3D, faites-le bouger et voyez comment marchent ses articulations.'], 1, 20],
    ['sandbox.html', 'code', '#6d5dfc', ['Programming sandbox', 'Bac à sable de programmation'], ['Program a SCARA or a 6-axis robot in 3D: moves, loops, pick and place.', 'Programmez un SCARA ou un robot 6 axes en 3D : déplacements, boucles, prise et dépose.'], 2, 30],
    ['sensors.html', 'sensor', '#2e9e5b', ['Sensor test bench', 'Banc d\'essai des capteurs'], ['Encoder, IMU, lidar, camera and ultrasonic sensor, live: see what each one measures and how it fails.', 'Codeur, centrale inertielle, lidar, caméra et ultrason, en direct : voyez ce que chacun mesure et comment il se trompe.'], 2, 30],
    ['wheels.html#wlab', 'wheel', '#f5963a', ['Wheel lab', 'Laboratoire des roues'], ['Push each wheel type in 3D: fixed, castor, steered, omni, Mecanum, ball and tracks.', 'Poussez chaque type de roue en 3D : fixe, folle, orientable, omni, Mecanum, sphérique et chenilles.'], 1, 15],
    ['anatomy-drives.html', 'drive', '#1fb5c9', ['Drive 8 mobile robots', 'Conduire 8 robots mobiles'], ['Differential, Ackermann, omni, Mecanum and more: drive each one with the keyboard.', 'Différentiel, Ackermann, omni, Mecanum et d\'autres : conduisez chacun au clavier.'], 2, 20],
    ['articulated.html#uses', 'ops', '#ff5a5f', ['Industrial operations in 3D', 'Opérations industrielles en 3D'], ['Watch a robot palletise, pack, label and inspect, in a cell with its safety fence.', 'Regardez un robot palettiser, encaisser, étiqueter et contrôler, dans une cellule avec sa barrière de sécurité.'], 1, 15]
  ]],
  [['Code and make', 'Coder et fabriquer'], ['Real code and real robots, step by step.', 'Du vrai code et de vrais robots, étape par étape.'], [
    ['learn-armlab.html', 'python', '#8a5cf6', ['Code a robot arm in Python', 'Coder un bras robot en Python'], ['Forward and inverse models, a DH engine, trajectories, then a real servo arm.', 'Modèles direct et inverse, un moteur DH, des trajectoires, puis un vrai bras à servos.'], 2, 150],
    ['projects.html', 'project', '#e0a100', ['Guided projects', 'Projets guidés'], ['A servo arm, a line follower and a ROS 2 mobile robot: parts, prices, wiring, code and tests.', 'Un bras à servos, un suiveur de ligne et un robot mobile ROS 2 : pièces, prix, câblage, code et tests.'], 3, 600]
  ]]
];
const dur = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`);
const card = ([href, icon, c, n, d, lv, min]) => `<a class="pr-card" href="${href}" style="--c:${c}"><span class="pr-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${I[icon]}</svg></span><span class="pr-tx"><b>${tx(...n)}</b><span>${tx(...d)}</span><small><i class="pr-lv l${lv}"><b></b><b></b><b></b></i> <em>${tx(...LV[lv - 1])}</em> · ${dur(min)}</small></span></a>`;
const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${tx('Practise: build, program and test robots', 'Pratiquer : construire, programmer et tester des robots')}</title>
    <link rel="stylesheet" href="style.css" />
  <script src="nav.js" defer></script></head>
  <body>
    <h1>${tx('Practise', 'Pratiquer')}</h1>
    <p class="lead">${tx('Every hands-on tool of the site in one place. Start with the beginner ones; each card says the level and the time it takes.', 'Tous les outils pratiques du site au même endroit. Commencez par ceux pour débutants ; chaque carte indique le niveau et le temps qu\'il faut.')}</p>
${GROUPS.map(([h, p, list]) => `    <section class="pr-group">
      <h2>${tx(...h)}</h2>
      <p>${tx(...p)}</p>
      <div class="pr-grid">
        ${list.map(card).join('\n        ')}
      </div>
    </section>`).join('\n')}
  </body>
</html>
`;
const file = path.join(root, 'practice.html');
fs.writeFileSync(file, html);
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await (await browser.newContext()).newPage();
await page.goto(pathToFileURL(file).href); await page.waitForFunction(() => window.RA && RA.hash);
const pairs = [...REG.entries()];
const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), pairs.map((p) => p[0]));
await browser.close();
const dict = {}; pairs.forEach(([, fr], i) => { dict[keys[i]] = fr; });
fs.writeFileSync(path.join(root, 'i18n', 'fr-practice.js'), `// Français — practice.html (generated by tools/build-practice.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n`);
console.log('practice.html texts', pairs.length);
