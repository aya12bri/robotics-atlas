// add-more-robots.mjs — the French texts of the four carousel cards of the home page added with the robot pages
// cylindrical, spherical, redundant and hexapod (into i18n/fr-index.js). It also removes the old "More robot families"
// block, now part of the robot catalogue (tools/build-home.mjs). Idempotent.
//   PLAYWRIGHT=… CHROME=… node tools/add-more-robots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');
const PAIRS = [
  ['3-axis arm', 'Bras 3 axes'], ['Gantry', 'Cartésien'], ['Cylindrical', 'Cylindrique'], ['Spherical', 'Sphérique'], ['6-axis robot', 'Robot 6 axes'], ['Cobot', 'Cobot'], ['7-axis robot', 'Robot 7 axes'], ['Delta', 'Delta'], ['Hexapod', 'Hexapode'], ['Mobile robot', 'Robot mobile'], ['Wheels and drives', 'Roues et motorisations'],
  ['Cylindrical robot', 'Robot cylindrique'], ['Spherical (polar) robot', 'Robot sphérique (polaire)'], ['7-axis redundant robot', 'Robot redondant 7 axes'], ['Hexapod (Stewart platform)', 'Hexapode (plateforme de Stewart)'],
  ['<span class="notation">R-P-P</span>3 degrees of freedom, cylindrical coordinates', '<span class="notation">R-P-P</span>3 degrés de liberté, coordonnées cylindriques'],
  ['<span class="notation">R-R-P</span>3 degrees of freedom, spherical coordinates', '<span class="notation">R-R-P</span>3 degrés de liberté, coordonnées sphériques'],
  ['<span class="notation">7 × R</span>7 degrees of freedom, one more than needed', '<span class="notation">7 × R</span>7 degrés de liberté, un de plus que nécessaire'],
  ['<span class="notation">6-UPS</span>6 degrees of freedom, fully parallel', '<span class="notation">6-UPS</span>6 degrés de liberté, pleinement parallèle'],
  ['A column that turns, a carriage that goes up and an arm that comes out: an angle, a height and a radius.', 'Une colonne qui tourne, un chariot qui monte et un bras qui sort : un angle, une hauteur et un rayon.'],
  ['Two angles and a telescopic arm, like the Unimate, the very first industrial robot (1961).', 'Deux angles et un bras télescopique, comme l\'Unimate, le tout premier robot industriel (1961).'],
  ['Like a human arm: for one pose of the tool the elbow can still move, to avoid obstacles and joint limits.', 'Comme un bras humain : pour une même pose de l\'outil, le coude peut encore bouger, pour éviter les obstacles et les butées.'],
  ['Six legs that change length move a platform in its six directions: very stiff and precise.', 'Six jambes qui changent de longueur bougent une plateforme dans ses six directions : très rigide et précis.'],
  ['Machine tending, die casting, clean rooms, wafer handling, simple assembly.', 'Chargement de machines, fonderie sous pression, salles blanches, manutention de plaquettes, assemblage simple.'],
  ['Gripper or vacuum cup pointing outwards.', 'Pince ou ventouse tournée vers l\'extérieur.'],
  ['Spot welding, forging, loading presses, pointing telescopes and antennas.', 'Soudage par points, forge, chargement de presses, pointage de télescopes et d\'antennes.'],
  ['Welding gun, gripper for hot parts.', 'Pince de soudage, préhenseur pour pièces chaudes.'],
  ['Collaborative and medical robots (KUKA LBR iiwa, Franka), research, space arms.', 'Robots collaboratifs et médicaux (KUKA LBR iiwa, Franka), recherche, bras spatiaux.'],
  ['Gripper, screwdriver, surgical instrument, camera.', 'Pince, visseuse, instrument chirurgical, caméra.'],
  ['Flight simulators, vibration tables, telescope mirrors, precision positioning.', 'Simulateurs de vol, tables vibrantes, miroirs de télescopes, positionnement de précision.'],
  ['The platform itself: a cockpit, a mirror, a part to machine.', 'La plateforme elle-même : un cockpit, un miroir, une pièce à usiner.'],
  ['Open the 3D model and the self-motion', 'Ouvrir le modèle 3D et le mouvement propre'],
  ['Six levels, from your first robot to intelligent robotics. The level where you are is open; click on another level to see its pages. Tick every page you finish.', 'Six niveaux, de votre premier robot à la robotique intelligente. Le niveau où vous en êtes est ouvert ; cliquez sur un autre niveau pour voir ses pages. Cochez chaque page terminée.']
];
const file = path.join(root, 'index.html');
let h = fs.readFileSync(file, 'utf8');
h = h.replace(/ *<!-- more-robots -->[\s\S]*?<!-- \/more-robots -->\n/, '');
fs.writeFileSync(file, h);
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await (await browser.newContext()).newPage();
await page.goto(pathToFileURL(file).href); await page.waitForFunction(() => window.RA && RA.hash);
const keys = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), PAIRS.map((p) => p[0]));
await browser.close();
const dict = {}; PAIRS.forEach(([, fr], i) => { dict[keys[i]] = fr; });
const f = path.join(root, 'i18n', 'fr-index.js');
const s = fs.readFileSync(f, 'utf8').replace(/\n?\/\/ BEGIN more-robots[\s\S]*?\/\/ END more-robots\n?/, '\n');
fs.writeFileSync(f, s.trimEnd() + `\n// BEGIN more-robots (generated by tools/add-more-robots.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n// END more-robots\n`);
console.log('carousel cards: texts', PAIRS.length);
