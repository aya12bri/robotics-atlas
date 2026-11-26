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
// three steps, from playing to building real robots. Each tool: [href, icon, colour, [name EN, FR], [what you do EN, FR], level 1-3, minutes, preview]
// preview: a picture name in thumbs/ (practice-<name>.jpg and -dark.jpg), 'code' (a small Python window) or 'projects' (two robots)
const STEPS = [
  ['discover', ['Discover by playing', 'Découvrir en jouant'], ['Nothing to install and nothing to know: move robots in 3D and see how they work.', 'Rien à installer, rien à savoir : faites bouger des robots en 3D et voyez comment ils marchent.'], [
    ['build.html', 'build', '#2f6bff', ['Build your first robot', 'Construire votre premier robot'], ['Choose a robot, assemble it in 3D piece by piece, move each joint and see what it does. The best place to start.', 'Choisissez un robot, assemblez-le en 3D pièce par pièce, bougez chaque articulation et voyez ce qu\'elle fait. Le meilleur point de départ.'], 1, 20, 'build'],
    ['wheels.html#wlab', 'wheel', '#f5963a', ['Wheel lab', 'Laboratoire des roues'], ['Push each wheel type in 3D: fixed, castor, steered, omni, Mecanum, ball and tracks.', 'Poussez chaque type de roue en 3D : fixe, folle, orientable, omni, Mecanum, sphérique et chenilles.'], 1, 15, 'wheels'],
    ['articulated.html#uses', 'ops', '#ff5a5f', ['Industrial operations in 3D', 'Opérations industrielles en 3D'], ['Watch a robot palletise, pack, label and inspect, in a cell with its safety fence.', 'Regardez un robot palettiser, encaisser, étiqueter et contrôler, dans une cellule avec sa barrière de sécurité.'], 1, 15, 'ops']
  ]],
  ['program', ['Program and measure', 'Programmer et mesurer'], ['Give orders to a robot, drive it, and see what its sensors really measure.', 'Donnez des ordres à un robot, pilotez-le, et voyez ce que ses capteurs mesurent vraiment.'], [
    ['sandbox.html', 'code', '#6d5dfc', ['Programming sandbox', 'Bac à sable de programmation'], ['Program a SCARA or a 6-axis robot in 3D: moves, loops, pick and place.', 'Programmez un SCARA ou un robot 6 axes en 3D : déplacements, boucles, prise et dépose.'], 2, 30, 'sandbox'],
    ['sensors.html', 'sensor', '#2e9e5b', ['Sensor test bench', 'Banc d\'essai des capteurs'], ['Ten sensors live: encoder, IMU, lidar, camera, ultrasonic, GNSS, force, infrared, compass and limit switch. See what each one measures and how it fails.', 'Dix capteurs en direct : codeur, centrale inertielle, lidar, caméra, ultrason, GNSS, effort, infrarouge, boussole et fin de course. Voyez ce que chacun mesure et comment il se trompe.'], 2, 30, 'sensors'],
    ['anatomy-drives.html', 'drive', '#1fb5c9', ['Drive 8 mobile robots', 'Conduire 8 robots mobiles'], ['Differential, Ackermann, omni, Mecanum and more: drive each one with the keyboard.', 'Différentiel, Ackermann, omni, Mecanum et d\'autres : conduisez chacun au clavier.'], 2, 20, 'drives']
  ]],
  ['labs', ['Experiment: interactive labs', 'Expérimenter : labos interactifs'], ['Turn the knobs and watch: a PID loop, a Kalman filter, path planners, singularities. Each lab comes from a lesson, linked below it.', 'Tournez les boutons et regardez : une boucle PID, un filtre de Kalman, des planificateurs, des singularités. Chaque labo vient d\'une leçon, indiquée en dessous.'], [
    { w: 'pid', t: ['Tune a PID controller', 'Régler un correcteur PID'], d: ['Move Kp, Ki and Kd and watch the joint reach its target: overshoot, oscillation, slow rise, static error.', 'Bougez Kp, Ki et Kd et regardez la liaison atteindre sa consigne : dépassement, oscillation, montée lente, erreur statique.'], href: 'learn-control.html#l4', lesson: ['Dynamics and control, lesson 4: feedback and PID', 'Dynamique et commande, leçon 4 : asservissement et PID'], lv: 2, min: 15 },
    { w: 'gravity', t: ['Gravity on one link', 'La gravité sur un segment'], d: ['Change the angle, the mass and the length: see the torque the motor must give to hold the arm.', 'Changez l\'angle, la masse et la longueur : voyez le couple que le moteur doit fournir pour tenir le bras.'], href: 'learn-control.html#l1', lesson: ['Dynamics and control, lesson 1: dynamics', 'Dynamique et commande, leçon 1 : dynamique'], lv: 2, min: 10 },
    { w: 'kalman', t: ['A Kalman filter in one dimension', 'Un filtre de Kalman à une dimension'], d: ['Noisy measurements in, a smooth estimate out: change the noise and see how much the filter trusts each one.', 'Des mesures bruitées en entrée, une estimation lisse en sortie : changez le bruit et voyez combien le filtre fait confiance à chacune.'], href: 'learn-intelligence.html#l3', lesson: ['Perception, planning and AI, lesson 3: Kalman', 'Perception, planification et IA, leçon 3 : Kalman'], lv: 3, min: 15 },
    { w: 'astar', t: ['Plan a path: Dijkstra and A*', 'Planifier un chemin : Dijkstra et A*'], d: ['Draw walls on the grid and compare how much each planner explores before it finds the way.', 'Dessinez des murs sur la grille et comparez combien chaque planificateur explore avant de trouver le chemin.'], href: 'learn-intelligence.html#l5', lesson: ['Perception, planning and AI, lesson 5: path planning', 'Perception, planification et IA, leçon 5 : planification'], lv: 2, min: 10 },
    { w: 'rrt', t: ['Grow a random tree (RRT)', 'Faire pousser un arbre aléatoire (RRT)'], d: ['Watch a sampling planner explore free space towards the goal, the method used for robot arms.', 'Regardez un planificateur par échantillonnage explorer l\'espace libre vers le but, la méthode utilisée pour les bras.'], href: 'learn-intelligence.html#l6', lesson: ['Perception, planning and AI, lesson 6: motion planning', 'Perception, planification et IA, leçon 6 : planification de mouvement'], lv: 3, min: 10 },
    { w: 'jac2r-ellipse', t: ['Singularities of a 2-axis arm', 'Les singularités d\'un bras à 2 axes'], d: ['Move the arm and watch its velocity ellipse flatten when it gets stretched or folded.', 'Bougez le bras et regardez son ellipse de vitesse s\'aplatir quand il se tend ou se replie.'], href: 'learn-singularities.html#l4', lesson: ['Singularities, lesson 4: manipulability', 'Singularités, leçon 4 : manipulabilité'], lv: 3, min: 10 },
    { w: 'gimbal', t: ['Gimbal lock', 'Le blocage de cardan'], d: ['Turn three gimbals and see two of them line up: one direction of rotation is lost.', 'Tournez trois cardans et voyez deux d\'entre eux s\'aligner : une direction de rotation est perdue.'], href: 'learn-singularities.html#l6', lesson: ['Singularities, lesson 6: gimbal lock', 'Singularités, leçon 6 : blocage de cardan'], lv: 3, min: 10 },
    { w: 'dls', t: ['Taming a singularity: the damped inverse', 'Apprivoiser une singularité : l\'inverse amorti'], d: ['Drive the arm through a singularity with and without damping, and compare the joint speeds.', 'Faites passer le bras par une singularité avec et sans amortissement, et comparez les vitesses articulaires.'], href: 'learn-singularities.html#l8', lesson: ['Singularities, lesson 8: the damped inverse', 'Singularités, leçon 8 : l\'inverse amorti'], lv: 3, min: 10 }
  ]],
  ['make', ['Code and make', 'Coder et fabriquer'], ['Real code and real robots, step by step, up to a finished project.', 'Du vrai code et de vrais robots, étape par étape, jusqu\'à un projet terminé.'], [
    ['learn-armlab.html', 'python', '#8a5cf6', ['Code a robot arm in Python', 'Coder un bras robot en Python'], ['Forward and inverse models, a DH engine, trajectories, then a real servo arm.', 'Modèles direct et inverse, un moteur DH, des trajectoires, puis un vrai bras à servos.'], 2, 150, 'code'],
    ['projects.html', 'project', '#e0a100', ['Guided projects', 'Projets guidés'], ['A servo arm, a line follower and a ROS 2 mobile robot: parts, prices, wiring, code and tests.', 'Un bras à servos, un suiveur de ligne et un robot mobile ROS 2 : pièces, prix, câblage, code et tests.'], 3, 600, 'projects']
  ]]
];
const dur = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`);
const pic = (n) => `<img class="th-light" src="thumbs/${n}.jpg" alt="" width="1280" height="800" decoding="async"><img class="th-dark" src="thumbs/${n}-dark.jpg" alt="" width="1280" height="800" decoding="async">`;
const PREVIEW = {
  code: `<span class="px-code" aria-hidden="true"><i></i><i></i><i></i><code><s>import</s> numpy <s>as</s> np\n\n<s>def</s> <u>fk</u>(q1, q2):\n    x = L1*np.cos(q1) + L2*np.cos(q1+q2)\n    y = L1*np.sin(q1) + L2*np.sin(q1+q2)\n    <s>return</s> x, y\n\narm.<u>move_to</u>(0.25, 0.10)</code></span>`,
  projects: `<span class="px-duo">${pic('robot-arm')}</span><span class="px-duo">${pic('anatomy-mobile')}</span>`
};
const ICON = (k) => `<span class="px-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg></span>`;
const card = ([href, icon, c, n, d, lv, min, pv], feat) => `<a class="px-card${feat ? ' px-feat' : ''}" href="${href}" style="--c:${c}">
          <span class="px-img">${PREVIEW[pv] || pic('practice-' + pv)}</span>
          <span class="px-body">
            <span class="px-top">${ICON(icon)}<span class="px-meta"><i class="pr-lv l${lv}"><b></b><b></b><b></b></i><em>${tx(...LV[lv - 1])}</em><span>${dur(min)}</span></span></span>
            <b class="px-t">${tx(...n)}</b>
            <span class="px-d">${tx(...d)}</span>
            <span class="px-go"><em>${tx('Open', 'Ouvrir')}</em> <span aria-hidden="true">→</span></span>
          </span>
        </a>`;
const total = STEPS.reduce((a, s) => a + s[3].length, 0);
const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${tx('Practise: build, program and test robots', 'Pratiquer : construire, programmer et tester des robots')}</title>
    <link rel="stylesheet" href="style.css" />
  <script src="nav.js" defer></script></head>
  <body class="practice">
    <header class="px-hero">
      <span class="px-kicker">${tx('Hands-on', 'Pratique')}</span>
      <h1>${tx('Practise', 'Pratiquer')}</h1>
      <p class="lead">${tx('Learn robotics by doing: build a robot, program it, drive it, then code a real one. Every tool runs in the browser.', 'Apprenez la robotique en faisant : construisez un robot, programmez-le, pilotez-le, puis codez-en un vrai. Tous les outils marchent dans le navigateur.')}</p>
      <ol class="px-steps">
${STEPS.map(([id, h, , list], k) => `        <li><a href="#${id}"><b>${k + 1}</b><span>${tx(...h)}</span><small>${list.length} <em>${tx('tools', 'outils')}</em></small></a></li>`).join('\n')}
      </ol>
      <p class="px-facts"><span>${total} <em>${tx('tools', 'outils')}</em></span><span>${tx('free', 'gratuit')}</span><span>${tx('nothing to install', 'rien à installer')}</span><span>${tx('beginner to advanced', 'du débutant à l\'avancé')}</span></p>
    </header>
${STEPS.map(([id, h, p, list], k) => `    <section class="px-step" id="${id}">
      <div class="px-head"><span class="px-num">${String(k + 1).padStart(2, '0')}</span><div><h2>${tx(...h)}</h2><p>${tx(...p)}</p></div></div>
      ${list[0] && list[0].w ? `<div class="px-labs">
        ${list.map((L) => `<article class="px-lab" id="lab-${L.w}">
          <header><b class="px-t">${tx(...L.t)}</b><span class="px-meta"><i class="pr-lv l${L.lv}"><b></b><b></b><b></b></i><em>${tx(...LV[L.lv - 1])}</em><span>${dur(L.min)}</span></span></header>
          <p class="px-d">${tx(...L.d)}</p>
          <div class="widget" data-widget="${L.w}"></div>
          <a class="px-lesson" href="${L.href}"><span>${tx('From the lesson:', 'Vient de la leçon :')}</span> <span>${tx(...L.lesson)}</span> <span aria-hidden="true">→</span></a>
        </article>`).join('\n        ')}
      </div>` : `<div class="px-grid${list.length === 2 ? ' two' : ''}">
        ${list.map((t, i) => card(t, false)).join('\n        ')}
      </div>`}
      <nav class="px-pager">${k > 0 ? `<a href="#${STEPS[k - 1][0]}" class="prev"><small><i aria-hidden="true">←</i> ${tx('Previous part', 'Partie précédente')}</small><b>${tx(...STEPS[k - 1][1])}</b></a>` : '<span></span>'}${k < STEPS.length - 1 ? `<a href="#${STEPS[k + 1][0]}" class="next"><small>${tx('Next part', 'Partie suivante')} <i aria-hidden="true">→</i></small><b>${tx(...STEPS[k + 1][1])}</b></a>` : ''}</nav>
    </section>`).join('\n')}
    <script src="learn-more-widgets.js" defer></script>
    <script>
      // one part at a time: the three cards at the top (and the buttons at the bottom of each part) open their part
      (function () {
        var steps = [].slice.call(document.querySelectorAll('.px-step')), cards = [].slice.call(document.querySelectorAll('.px-steps a'));
        function show(id, scroll) {
          if (!steps.some(function (s) { return s.id === id; })) id = steps[0].id;
          steps.forEach(function (s) { s.hidden = s.id !== id; });
          cards.forEach(function (a) { var on = a.getAttribute('href') === '#' + id; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
          if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
          if (scroll) { var top = document.querySelector('.px-steps').getBoundingClientRect().top + window.scrollY - 100; window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }); }
        }
        document.addEventListener('click', function (e) {
          var a = e.target.closest && e.target.closest('.px-steps a, .px-pager a'); if (!a) return;
          e.preventDefault(); show(a.getAttribute('href').slice(1), true);
        }, true);
        window.addEventListener('hashchange', function () { show(location.hash.slice(1), false); });
        show(location.hash.slice(1), false);
      })();
    </script>
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
