// build-anatomy.mjs — generates the 3D anatomy pages (anatomy.html, anatomy-scara.html, anatomy-cobot.html) and their French
// dictionaries, and links each one from its robot page.   node tools/build-anatomy.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REG, reset, tx, P, UL } from './lib.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
const ALLCOL = ['#2f6bff', '#2e9e5b', '#ff9f43', '#8a5cf6', '#ff5a5f', '#1fb5c9'];

const ROBOTS = {
  six: {
    file: 'anatomy', robotPage: 'articulated', before: '<h2>The spherical wrist</h2>', cols: ALLCOL,
    title: ['Anatomy of a 6-axis robot (3D)', 'Anatomie d\'un robot 6 axes (3D)'], back: ['6-axis robot page', 'Page du robot 6 axes'],
    special: ['Wrist singularity (J5 = 0)', 'Singularité de poignet (J5 = 0)'],
    joints: [
      ['Base rotation', 'Rotation de la base', 'Turns the whole robot around its vertical axis. Its motor and gearbox sit in the base.', 'Fait tourner tout le robot autour de son axe vertical. Son moteur et son réducteur sont dans la base.'],
      ['Shoulder', 'Épaule', 'Tilts the upper arm forward and backward. It carries the weight of the whole arm, so it has the biggest motor.', 'Incline le bras vers l\'avant et vers l\'arrière. Il porte le poids de tout le bras, donc il a le plus gros moteur.'],
      ['Elbow', 'Coude', 'Extends or folds the forearm.', 'Étend ou replie l\'avant-bras.'],
      ['Wrist roll', 'Roulis du poignet', 'Rotates the wrist assembly around the forearm axis.', 'Fait tourner l\'ensemble du poignet autour de l\'axe de l\'avant-bras.'],
      ['Wrist pitch', 'Tangage du poignet', 'Tilts the tool up and down. When J5 = 0, the axes J4 and J6 line up: a wrist singularity.', 'Incline l\'outil vers le haut et vers le bas. Quand J5 = 0, les axes J4 et J6 s\'alignent : une singularité de poignet.'],
      ['Tool rotation', 'Rotation de l\'outil', 'Spins the gripper or the tool around its own axis: it sets the final tool orientation.', 'Fait tourner la pince ou l\'outil autour de son propre axe : il règle l\'orientation finale de l\'outil.']
    ],
    inside: [
      ['<strong>Servo motor</strong> (brushless): turns fast with little torque.', '<strong>Servomoteur</strong> (sans balais) : tourne vite avec peu de couple.'],
      ['<strong>Gearbox</strong> (harmonic or cycloidal): slows the motor down by 50 to 200 times and multiplies the torque by the same factor.', '<strong>Réducteur</strong> (harmonique ou cycloïdal) : ralentit le moteur de 50 à 200 fois et multiplie le couple du même facteur.'],
      ['<strong>Encoder and brake</strong>: the encoder measures the angle; the brake holds the arm when the power is off.', '<strong>Codeur et frein</strong> : le codeur mesure l\'angle ; le frein retient le bras quand le courant est coupé.'],
      ['<strong>Cable harness</strong>: power and signals pass through the hollow links to the wrist and the tool.', '<strong>Faisceau de câbles</strong> : l\'énergie et les signaux passent dans les corps creux jusqu\'au poignet et à l\'outil.'],
      ['<strong>Controller</strong>: the computer and the drives that run the servo loops (in the base or in a cabinet next to the robot).', '<strong>Contrôleur</strong> : l\'ordinateur et les variateurs qui exécutent les boucles d\'asservissement (dans la base ou dans une armoire à côté du robot).']
    ]
  },
  scara: {
    file: 'anatomy-scara', robotPage: 'scara', before: '<h2>Forward kinematics of a SCARA</h2>', cols: [ALLCOL[0], ALLCOL[1], ALLCOL[3], ALLCOL[5]],
    title: ['Anatomy of a SCARA robot (3D)', 'Anatomie d\'un robot SCARA (3D)'], back: ['SCARA page', 'Page du SCARA'],
    special: ['Arm stretched (J2 = 0)', 'Bras tendu (J2 = 0)'],
    joints: [
      ['Base rotation', 'Rotation de la base', 'Turns the whole arm around the vertical column. The motor and the gearbox are in the column.', 'Fait tourner tout le bras autour de la colonne verticale. Le moteur et le réducteur sont dans la colonne.'],
      ['Elbow rotation', 'Rotation du coude', 'Turns the second link around a vertical axis at the end of the first one. Together with J1 it places the tool in the horizontal plane.', 'Fait tourner le second corps autour d\'un axe vertical au bout du premier. Avec J1, il place l\'outil dans le plan horizontal.'],
      ['Vertical slide (prismatic)', 'Coulisse verticale (prismatique)', 'A rod slides up and down through the end of link 2, driven by a ball screw. It sets the height of the tool. The only linear axis.', 'Une tige coulisse de haut en bas à travers le bout du corps 2, entraînée par une vis à billes. Elle règle la hauteur de l\'outil. Le seul axe linéaire.'],
      ['Tool rotation', 'Rotation de l\'outil', 'Spins the tool around the vertical rod: it sets the angle of the gripper in the plane.', 'Fait tourner l\'outil autour de la tige verticale : il règle l\'angle de la pince dans le plan.']
    ],
    inside: [
      ['<strong>Servo motors</strong> at the base and at the elbow, with <strong>harmonic gearboxes</strong>: stiff in the plane, which is why a SCARA is so precise.', '<strong>Servomoteurs</strong> à la base et au coude, avec des <strong>réducteurs harmoniques</strong> : rigide dans le plan, c\'est pourquoi un SCARA est si précis.'],
      ['<strong>Ball screw and spline shaft</strong>: the end of link 2 holds two motors, one for the up-and-down motion (J3) and one for the rotation of the tool (J4), both acting on the same hollow rod.', '<strong>Vis à billes et arbre cannelé</strong> : le bout du corps 2 contient deux moteurs, un pour le mouvement vertical (J3) et un pour la rotation de l\'outil (J4), tous deux agissant sur la même tige creuse.'],
      ['<strong>Brake on J3</strong>: gravity pulls the rod down, so the brake holds it when the power is off.', '<strong>Frein sur J3</strong> : la gravité tire la tige vers le bas, donc le frein la retient quand le courant est coupé.'],
      ['<strong>Cables and air</strong> pass through the hollow rod to the gripper (vacuum or compressed air).', '<strong>Câbles et air</strong> passent dans la tige creuse jusqu\'à la pince (vide ou air comprimé).'],
      ['<strong>Controller</strong>: in the column or in a separate box.', '<strong>Contrôleur</strong> : dans la colonne ou dans un boîtier séparé.']
    ]
  },
  cobot: {
    file: 'anatomy-cobot', robotPage: 'cobot', before: '<h2>What is special about this DH table?</h2>', cols: ALLCOL,
    title: ['Anatomy of a cobot (3D)', 'Anatomie d\'un cobot (3D)'], back: ['Cobot page', 'Page du cobot'],
    special: ['Wrist singularity (J5 = 0)', 'Singularité de poignet (J5 = 0)'],
    joints: [
      ['Base', 'Base', 'Turns the whole robot around its vertical axis.', 'Fait tourner tout le robot autour de son axe vertical.'],
      ['Shoulder', 'Épaule', 'Lifts the upper arm. The joint is offset sideways from the arm.', 'Soulève le bras. L\'articulation est décalée latéralement par rapport au bras.'],
      ['Elbow', 'Coude', 'Folds the forearm.', 'Replie l\'avant-bras.'],
      ['Wrist 1', 'Poignet 1', 'First wrist joint, parallel to the shoulder and the elbow.', 'Première articulation du poignet, parallèle à l\'épaule et au coude.'],
      ['Wrist 2', 'Poignet 2', 'Second wrist joint, perpendicular to wrist 1. With the offsets, its axis does not cross the others: the wrist is not spherical.', 'Deuxième articulation du poignet, perpendiculaire au poignet 1. Avec les décalages, son axe ne coupe pas les autres : le poignet n\'est pas sphérique.'],
      ['Wrist 3', 'Poignet 3', 'Spins the tool flange. When J5 = 0, wrist 1 and wrist 3 line up: a wrist singularity.', 'Fait tourner la bride de l\'outil. Quand J5 = 0, les poignets 1 et 3 s\'alignent : une singularité de poignet.']
    ],
    inside: [
      ['<strong>Compact joint modules</strong>: each joint is a tube with a brushless motor, a harmonic-drive gearbox and the electronics inside.', '<strong>Modules d\'articulation compacts</strong> : chaque articulation est un tube avec un moteur sans balais, un réducteur harmonique et l\'électronique à l\'intérieur.'],
      ['<strong>Two encoders per joint</strong> (motor side and output side) and a <strong>torque sensor or current sensing</strong>: the controller feels contact forces and stops when it touches a person.', '<strong>Deux codeurs par articulation</strong> (côté moteur et côté sortie) et un <strong>capteur de couple ou mesure du courant</strong> : le contrôleur sent les efforts de contact et s\'arrête quand il touche une personne.'],
      ['<strong>Brake</strong> in every joint, and a safety-rated stop circuit.', '<strong>Frein</strong> dans chaque articulation, et un circuit d\'arrêt de sécurité certifié.'],
      ['<strong>Cables</strong> run inside the tubes, with the controller in a separate box connected by one cable.', 'Les <strong>câbles</strong> passent dans les tubes, avec le contrôleur dans un boîtier séparé relié par un seul câble.'],
      ['<strong>Rounded shapes, light weight, limited force</strong>: made to work next to people (see “How a cobot stays safe”).', '<strong>Formes arrondies, poids faible, force limitée</strong> : fait pour travailler à côté des personnes (voir « Comment un cobot reste sûr »).']
    ]
  }
};

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const bpage = await (await browser.newContext()).newPage();
const hashAll = async (file, list) => {                               // fingerprints of English texts, computed in Chromium like nav.js does
  await bpage.goto(pathToFileURL(path.join(root, file)).href); await bpage.waitForFunction(() => window.RA && RA.hash);
  return bpage.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), list);
};
const LINK = ['See it in 3D, with the inside of the robot →', 'Voir en 3D, avec l\'intérieur du robot →'];
const NOTE = ['The angles of this 3D model are those of the drawing, with a zero chosen for display: they differ by a constant from the DH angles of the robot page. The model is simplified: the real inside depends on the make.', 'Les angles de ce modèle 3D sont ceux du dessin, avec un zéro choisi pour l\'affichage : ils diffèrent d\'une constante des angles DH de la page du robot. Le modèle est simplifié : l\'intérieur réel dépend de la marque.'];

for (const [key, R] of Object.entries(ROBOTS)) {
  reset();
  const cards = R.joints.map((j, i) => `<div class="ancard" style="--c:${R.cols[i]}"><button type="button" class="anhead"><span class="ann">J${i + 1}</span><b>${tx(j[0], j[1])}</b></button><p>${tx(j[2], j[3])}</p><label class="ansl"><input type="range" step="1" aria-label="J${i + 1}"><output></output></label></div>`).join('\n        ');
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${tx(...R.title)}</title>
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
      .ansl { display: grid; grid-template-columns: 1fr 3.4rem; gap: 0.5rem; align-items: center; } .ansl input { width: 100%; accent-color: var(--c); } .ansl output { font: 0.8rem var(--mono); text-align: right; color: var(--muted); }
      .toolbar button.on { background: var(--btn); border-color: var(--btn); color: #fff; }
      @media (max-width: 900px) { .anat { grid-template-columns: minmax(0, 1fr); } #anatView { height: 400px; } }
    </style>
    <link rel="modulepreload" href="vendor/three.module.min.js" />
    <link rel="modulepreload" href="vendor/addons/controls/OrbitControls.js" />
    <script type="importmap">
      { "imports": { "three": "./vendor/three.module.min.js", "three/addons/": "./vendor/addons/" } }
    </script>
  <script src="nav.js" defer></script></head>
  <body data-robot="${key}">
    <h1>${tx(...R.title)}</h1>
    <p>${tx(`<a href="index.html" style="color:#ff9f43">← Robot list</a> · <a href="${R.robotPage}.html" style="color:#ff9f43">${R.back[0]}</a>`, `<a href="index.html" style="color:#ff9f43">← Liste des robots</a> · <a href="${R.robotPage}.html" style="color:#ff9f43">${R.back[1]}</a>`)}</p>
    <p class="lead">${tx('Turn the robot with the mouse or your finger. Click an axis (a coloured circle or a card) to light up its ring and its axis, press X-ray to look inside at the motors, gearboxes, controller and cables, and move each joint with its slider.', 'Faites tourner le robot à la souris ou au doigt. Cliquez sur un axe (un cercle coloré ou une carte) pour allumer son anneau et son axe, appuyez sur Rayons X pour voir à l\'intérieur les moteurs, réducteurs, contrôleur et câbles, et bougez chaque articulation avec son curseur.')}</p>
    <div class="toolbar">
      <button id="xrayBtn" type="button" aria-pressed="false">${tx('X-ray (inside)', 'Rayons X (intérieur)')}</button>
      <button id="playBtn" type="button" aria-pressed="false">${tx('Animate the selected axis', 'Animer l\'axe choisi')}</button>
      <button id="spinBtn" type="button" aria-pressed="false">${tx('Auto-rotate', 'Rotation automatique')}</button>
      <button id="wristBtn" type="button">${tx(...R.special)}</button>
      <button id="resetBtn" type="button">${tx('Reset', 'Réinitialiser')}</button>
    </div>
    <div class="anat">
      <div id="anatView"></div>
      <div class="ancards">
        ${cards}
      </div>
    </div>
    <h2>${tx('What is inside each joint?', 'Que contient chaque articulation ?')}</h2>
    ${UL(R.inside)}
    ${P(...NOTE)}
    <script type="module" src="anatomy.js"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(root, R.file + '.html'), html);
  const pairs = [...REG.entries()];
  const keys = await hashAll(R.file + '.html', pairs.map((p) => p[0]));
  const dict = {}; pairs.forEach(([en, fr], i) => { dict[keys[i]] = fr; });
  fs.writeFileSync(path.join(root, 'i18n', `fr-${R.file}.js`), `// Français — ${R.file}.html (généré par tools/build-anatomy.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n`);

  // link from the robot page (and its French text)
  const rp = path.join(root, R.robotPage + '.html'); let h = fs.readFileSync(rp, 'utf8');
  if (h.indexOf(`href="${R.file}.html"`) < 0) { h = h.replace('    ' + R.before, `    <p class="try"><a href="${R.file}.html">${LINK[0]}</a></p>\n\n    ${R.before}`); fs.writeFileSync(rp, h); }
  const lk = { [(await hashAll(R.robotPage + '.html', [LINK[0]]))[0]]: LINK[1] };
  const f = path.join(root, 'i18n', `fr-${R.robotPage}.js`);
  const s = fs.readFileSync(f, 'utf8').replace(/\n?\/\/ BEGIN anatomy[\s\S]*?\/\/ END anatomy\n?/, '\n');
  fs.writeFileSync(f, s.trimEnd() + `\n// BEGIN anatomy (generated by tools/build-anatomy.mjs)\nRA.add(${JSON.stringify(lk)});\n// END anatomy\n`);
  console.log(R.file, 'texts', pairs.length);
}
await browser.close();
