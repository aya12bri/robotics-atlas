// build-anatomy.mjs — generates anatomy.html (3D anatomy of the 6-axis robot) and i18n/fr-anatomy.js; links it from articulated.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, reset, tx, P, UL, BOX } from './lib.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
reset();
const COL = ['#2f6bff', '#2e9e5b', '#ff9f43', '#8a5cf6', '#ff5a5f', '#1fb5c9'];
const J = [
  ['Base rotation', 'Rotation de la base', 'Turns the whole robot around its vertical axis. Its motor and gearbox sit in the base.', 'Fait tourner tout le robot autour de son axe vertical. Son moteur et son réducteur sont dans la base.'],
  ['Shoulder', 'Épaule', 'Tilts the upper arm forward and backward. It carries the weight of the whole arm, so it has the biggest motor.', 'Incline le bras vers l\'avant et vers l\'arrière. Il porte le poids de tout le bras, donc il a le plus gros moteur.'],
  ['Elbow', 'Coude', 'Extends or folds the forearm.', 'Étend ou replie l\'avant-bras.'],
  ['Wrist roll', 'Roulis du poignet', 'Rotates the wrist assembly around the forearm axis.', 'Fait tourner l\'ensemble du poignet autour de l\'axe de l\'avant-bras.'],
  ['Wrist pitch', 'Tangage du poignet', 'Tilts the tool up and down. When J5 = 0, the axes J4 and J6 line up: a wrist singularity.', 'Incline l\'outil vers le haut et vers le bas. Quand J5 = 0, les axes J4 et J6 s\'alignent : une singularité de poignet.'],
  ['Tool rotation', 'Rotation de l\'outil', 'Spins the gripper or the tool around its own axis: it sets the final tool orientation.', 'Fait tourner la pince ou l\'outil autour de son propre axe : il règle l\'orientation finale de l\'outil.']
];
const cards = J.map((j, i) => `<div class="ancard" style="--c:${COL[i]}"><button type="button" class="anhead"><span class="ann">J${i + 1}</span><b>${tx(j[0], j[1])}</b></button><p>${tx(j[2], j[3])}</p><label class="ansl"><input type="range" step="1" aria-label="J${i + 1}"><output></output></label></div>`).join('\n        ');
const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${tx('Anatomy of a 6-axis robot (3D)', 'Anatomie d\'un robot 6 axes (3D)')}</title>
    <link rel="stylesheet" href="style.css" />
    <style>
      .anat { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 1.2rem; align-items: start; margin: 1rem 0 1.4rem; }
      #anatView { position: relative; width: 100%; height: 580px; border-radius: 12px; overflow: hidden; touch-action: none; }
      #anatView canvas { display: block; }
      .antag { position: absolute; transform: translate(-50%, -50%); width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff; color: #fff; font: 700 11px var(--mono); cursor: pointer; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,.5); }
      .antag.on { transform: translate(-50%, -50%) scale(1.3); }
      .ancards { display: grid; gap: 0.6rem; }
      .ancard { border: 1px solid var(--border); border-left: 5px solid var(--c); border-radius: 12px; padding: 0.55rem 0.8rem 0.6rem; background: color-mix(in srgb, var(--surface) 80%, transparent); }
      .ancard.on { background: color-mix(in srgb, var(--c) 14%, var(--surface)); border-color: var(--c); }
      .anhead { display: flex; align-items: center; gap: 0.6rem; width: 100%; background: none; border: 0; color: var(--text); text-align: left; padding: 0; cursor: pointer; font-size: 1rem; }
      .anhead:hover, .anhead:focus, .anhead:active { background: none; color: var(--text); }
      .ann { background: var(--c); flex: none; width: 2rem; height: 2rem; border-radius: 50%; color: #fff; display: grid; place-items: center; font: 700 0.8rem var(--mono); }
      .ancard p { margin: 0.35rem 0 0.2rem; font-size: 0.88rem; color: var(--muted); max-width: none; }
      .ansl { display: grid; grid-template-columns: 1fr 3.2rem; gap: 0.5rem; align-items: center; } .ansl input { width: 100%; accent-color: var(--c); } .ansl output { font: 0.8rem var(--mono); text-align: right; color: var(--muted); }
      .toolbar button.on { background: var(--btn); border-color: var(--btn); color: #fff; }
      @media (max-width: 900px) { .anat { grid-template-columns: minmax(0, 1fr); } #anatView { height: 400px; } }
    </style>
    <link rel="modulepreload" href="vendor/three.module.min.js" />
    <link rel="modulepreload" href="vendor/addons/controls/OrbitControls.js" />
    <script type="importmap">
      { "imports": { "three": "./vendor/three.module.min.js", "three/addons/": "./vendor/addons/" } }
    </script>
  <script src="nav.js" defer></script></head>
  <body>
    <h1>${tx('Anatomy of a 6-axis robot (3D)', 'Anatomie d\'un robot 6 axes (3D)')}</h1>
    <p>${tx('<a href="index.html" style="color:#ff9f43">← Robot list</a> · <a href="articulated.html" style="color:#ff9f43">6-axis robot page</a>', '<a href="index.html" style="color:#ff9f43">← Liste des robots</a> · <a href="articulated.html" style="color:#ff9f43">Page du robot 6 axes</a>')}</p>
    <p class="lead">${tx('Turn the robot with the mouse or your finger. Click an axis (a coloured circle or a card) to light up its ring and its rotation axis, press X-ray to look inside at the motors, gearboxes, controller and cables, and move each joint with its slider.', 'Faites tourner le robot à la souris ou au doigt. Cliquez sur un axe (un cercle coloré ou une carte) pour allumer son anneau et son axe de rotation, appuyez sur Rayons X pour voir à l\'intérieur les moteurs, réducteurs, contrôleur et câbles, et bougez chaque articulation avec son curseur.')}</p>
    <div class="toolbar">
      <button id="xrayBtn" type="button" aria-pressed="false">${tx('X-ray (inside)', 'Rayons X (intérieur)')}</button>
      <button id="playBtn" type="button" aria-pressed="false">${tx('Animate the selected axis', 'Animer l\'axe choisi')}</button>
      <button id="spinBtn" type="button" aria-pressed="false">${tx('Auto-rotate', 'Rotation automatique')}</button>
      <button id="wristBtn" type="button">${tx('Wrist singularity (J5 = 0)', 'Singularité de poignet (J5 = 0)')}</button>
      <button id="resetBtn" type="button">${tx('Reset', 'Réinitialiser')}</button>
    </div>
    <div class="anat">
      <div id="anatView"></div>
      <div class="ancards">
        ${cards}
      </div>
    </div>
    <h2>${tx('What is inside each joint?', 'Que contient chaque articulation ?')}</h2>
    ${UL([
      ['<strong>Servo motor</strong> (brushless): turns fast with little torque.', '<strong>Servomoteur</strong> (sans balais) : tourne vite avec peu de couple.'],
      ['<strong>Gearbox</strong> (harmonic or cycloidal): slows the motor down by 50 to 200 times and multiplies the torque by the same factor.', '<strong>Réducteur</strong> (harmonique ou cycloïdal) : ralentit le moteur de 50 à 200 fois et multiplie le couple du même facteur.'],
      ['<strong>Encoder and brake</strong>: the encoder measures the angle; the brake holds the arm when the power is off.', '<strong>Codeur et frein</strong> : le codeur mesure l\'angle ; le frein retient le bras quand le courant est coupé.'],
      ['<strong>Cable harness</strong>: power and signals pass through the hollow links to the wrist and the tool.', '<strong>Faisceau de câbles</strong> : l\'énergie et les signaux passent dans les corps creux jusqu\'au poignet et à l\'outil.'],
      ['<strong>Controller</strong>: the computer and the drives that run the servo loops (in the base or in a cabinet next to the robot).', '<strong>Contrôleur</strong> : l\'ordinateur et les variateurs qui exécutent les boucles d\'asservissement (dans la base ou dans une armoire à côté du robot).']
    ])}
    ${P('The model is simplified: the real inside depends on the make. Learn more in the course “Dynamics, actuators and control”.', 'Le modèle est simplifié : l\'intérieur réel dépend de la marque. Pour aller plus loin : le cours « Dynamique, actionneurs et commande ».')}
    <script type="module" src="anatomy.js"></script>
  </body>
</html>
`;
fs.writeFileSync(path.join(root, 'anatomy.html'), html);

// link from the 6-axis page
const art = path.join(root, 'articulated.html'); let h = fs.readFileSync(art, 'utf8');
const link = tx('See it in 3D, with the inside of the robot →', 'Voir en 3D, avec l\'intérieur du robot →');
const LINKP = `    <p class="try"><a href="anatomy.html">${link}</a></p>\n`;
if (h.indexOf('href="anatomy.html"') < 0) { h = h.replace('    <h2>The spherical wrist</h2>', LINKP + '\n    <h2>The spherical wrist</h2>'); fs.writeFileSync(art, h); }

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await (await browser.newContext()).newPage();
await page.goto(pathToFileURL(path.join(root, 'anatomy.html')).href);
await page.waitForFunction(() => window.RA && RA.hash);
const pairs = [...REG.entries()];
const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), pairs.map((p) => p[0]));
const dict = {}; pairs.forEach(([en, fr], i) => { dict[keys[i]] = fr; });
await browser.close();
fs.writeFileSync(path.join(root, 'i18n', 'fr-anatomy.js'), `// Français — anatomy.html (généré par tools/build-anatomy.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n`);
// the link text lives in the dictionary of articulated.html
const f = path.join(root, 'i18n', 'fr-articulated.js');
let s = fs.readFileSync(f, 'utf8').replace(/\n?\/\/ BEGIN anatomy[\s\S]*?\/\/ END anatomy\n?/, '\n');
const lk = { [await (async () => { const b = await chromium.launch({ executablePath: process.env.CHROME || undefined }); const p = await (await b.newContext()).newPage(); await p.goto(pathToFileURL(art).href); await p.waitForFunction(() => window.RA && RA.hash); const k = await p.evaluate((x) => RA.hash(RA.norm(x)), link); await b.close(); return k; })()]: 'Voir en 3D, avec l\'intérieur du robot →' };
fs.writeFileSync(f, s.trimEnd() + `\n// BEGIN anatomy (generated by tools/build-anatomy.mjs)\nRA.add(${JSON.stringify(lk)});\n// END anatomy\n`);
console.log('texts', pairs.length);
