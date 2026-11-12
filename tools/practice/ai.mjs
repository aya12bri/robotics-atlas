// Practice blocks for learn-intelligence.html ("Perception, planning and intelligence").
import { plot, chain, T, LINE, ARROW, DOT, COL } from './fig.mjs';
const D = Math.PI / 180;
const e = (x, d = 2) => String(+x.toFixed(d)), f = (x, d = 2) => String(+x.toFixed(d)).replace('.', ',');
const gauss = (m, s) => (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
const kw1 = 1 / 9, kw2 = 1 / 16, kx = (10 * kw1 + 12 * kw2) / (kw1 + kw2), ks = Math.sqrt(1 / (kw1 + kw2));

// the pinhole camera
const pinhole = (() => {
  const W = 620, H = 260; let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
  const cx = 200, cy = 140;
  s += LINE(40, cy, W - 30, cy, COL.axis, 1.5, '6 5') + LINE(cx - 90, 60, cx - 90, 220, COL.b, 4) + T(cx - 90, 245, ['image (sensor)', 'image (capteur)'], { a: 'middle', fs: 13, c: COL.b });
  s += DOT(cx, cy, COL.y, 6) + T(cx, cy + 26, ['lens centre', 'centre optique'], { a: 'middle', fs: 13, c: COL.y });
  s += ARROW(520, cy, 520, 50, COL.o, 4) + T(530, 95, ['object, height X', 'objet, hauteur X'], { fs: 13, c: COL.o });
  s += LINE(520, 50, cx - 90, cy + (cy - 50) * 90 / 320, COL.ink, 1.5);
  s += ARROW(cx - 90, cy, cx - 90, cy + (cy - 50) * 90 / 320, COL.o, 3) + T(cx - 100, cy + 18, 'u', { a: 'end', raw: true, c: COL.o });
  s += T((cx - 90 + cx) / 2, cy - 8, 'f', { a: 'middle', raw: true, b: true }) + T((cx + 520) / 2, cy + 22, 'Z', { a: 'middle', raw: true, b: true });
  s += T(W - 24, 30, 'u = f · X / Z', { a: 'end', raw: true, fs: 17, b: true, c: COL.y });
  return { vb: `0 0 ${W} ${H}`, svg: s };
})();

// a grid map with a path found by A*
const grid = (() => {
  const n = 8, m = 6, c = 46, ox = 20, oy = 20, W = ox * 2 + n * c, H = oy * 2 + m * c + 26;
  const wall = new Set(['3,0', '3,1', '3,2', '3,3', '5,2', '5,3', '5,4', '5,5']);
  const path = [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [4, 4], [4, 3], [4, 2], [4, 1], [5, 1], [6, 1], [7, 1], [7, 0]];
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) s += `<rect x="${ox + i * c}" y="${oy + j * c}" width="${c - 2}" height="${c - 2}" rx="4" fill="${wall.has(i + ',' + j) ? '#5b6573' : '#262c35'}"/>`;
  const P = ([i, j]) => [ox + i * c + c / 2 - 1, oy + j * c + c / 2 - 1];
  s += `<path d="${path.map((p, k) => (k ? 'L' : 'M') + P(p).join(',')).join(' ')}" fill="none" stroke="${COL.o}" stroke-width="5" stroke-linejoin="round"/>`;
  s += DOT(...P(path[0]), COL.g, 10) + T(P(path[0])[0], P(path[0])[1] + 5, 'S', { a: 'middle', raw: true, b: true, c: '#111' });
  s += DOT(...P(path.at(-1)), COL.r, 10) + T(P(path.at(-1))[0], P(path.at(-1))[1] + 5, 'G', { a: 'middle', raw: true, b: true, c: '#111' });
  s += T(W / 2, H - 10, ['grey: wall · orange: shortest path', 'gris : mur · orange : plus court chemin'], { a: 'middle', fs: 12 });
  return { vb: `0 0 ${W} ${H}`, svg: s };
})();

export const PRACTICE = {
  1: { sum: [['Proprioceptive sensors measure the robot itself (encoders, IMU); exteroceptive ones measure the world (camera, lidar, ultrasound).', 'Les capteurs proprioceptifs mesurent le robot lui-même (codeurs, centrale inertielle) ; les extéroceptifs mesurent le monde (caméra, lidar, ultrasons).'],
      ['Time of flight: distance = speed × time / 2 (the signal goes and comes back).', 'Temps de vol : distance = vitesse × temps / 2 (le signal fait l\'aller-retour).'],
      ['Every sensor has noise, a range and a rate: choose by the need.', 'Chaque capteur a du bruit, une portée et une fréquence : on choisit selon le besoin.']],
    ex: [
      { lv: 1, q: ['An ultrasound echo comes back after 5.83 ms (sound: 343 m/s). Distance to the wall (m)?', 'Un écho ultrason revient après 5,83 ms (son : 343 m/s). Distance au mur (m) ?'], num: { ans: 343 * 0.00583 / 2, tol: 0.01, unit: 'm' }, sol: [`d = 343 × 0.00583 / 2 = <b>${e(343 * 0.00583 / 2)} m</b>. We divide by 2 because the sound goes there and back.`, `d = 343 × 0,00583 / 2 = <b>${f(343 * 0.00583 / 2)} m</b>. On divise par 2 car le son fait l\'aller-retour.`] },
      { lv: 2, q: ['A lidar measures a time of flight of 20 ns (light: 3×10⁸ m/s). Distance (m)?', 'Un lidar mesure un temps de vol de 20 ns (lumière : 3×10⁸ m/s). Distance (m) ?'], num: { ans: 3, tol: 0.01, unit: 'm' }, sol: ['d = 3×10⁸ × 20×10⁻⁹ / 2 = 6 / 2 = <b>3 m</b>.', 'd = 3×10⁸ × 20×10⁻⁹ / 2 = 6 / 2 = <b>3 m</b>.'] },
      { lv: 3, q: ['Which sensor tells a mobile robot that it is tilting, without looking outside?', 'Quel capteur dit à un robot mobile qu\'il penche, sans regarder dehors ?'], mcq: [['An IMU (accelerometer + gyroscope).', 'Une centrale inertielle (accéléromètre + gyroscope).', true], ['A camera.', 'Une caméra.', false], ['A lidar.', 'Un lidar.', false]], sol: ['The <b>IMU</b> is proprioceptive: it measures gravity and rotations of the robot body.', 'La <b>centrale inertielle</b> est proprioceptive : elle mesure la gravité et les rotations du corps du robot.'] }] },

  2: { sum: [['A camera follows the pinhole model: u = f X / Z (pixels).', 'Une caméra suit le modèle sténopé : u = f X / Z (pixels).'],
      ['Calibration finds f, the image centre and the distortion, plus where the camera is relative to the robot.', 'L\'étalonnage trouve f, le centre de l\'image et la distorsion, plus la position de la caméra par rapport au robot.'],
      ['With two cameras (stereo): depth Z = f B / d. Visual servoing moves the robot to make the image error zero.', 'Avec deux caméras (stéréo) : profondeur Z = f B / d. L\'asservissement visuel bouge le robot pour annuler l\'erreur dans l\'image.']],
    fig: pinhole, cap: ['Pinhole camera: a point far away (big Z) gives a smaller image u.', 'Caméra sténopé : un point éloigné (grand Z) donne une image u plus petite.'],
    ex: [
      { lv: 1, q: ['f = 800 px, a point at X = 0.5 m, Z = 2 m. Image coordinate u (px)?', 'f = 800 px, un point à X = 0,5 m, Z = 2 m. Coordonnée image u (px) ?'], num: { ans: 200, tol: 0.5, unit: 'px' }, sol: ['u = 800 × 0.5 / 2 = <b>200 px</b>.', 'u = 800 × 0,5 / 2 = <b>200 px</b>.'] },
      { lv: 2, q: ['A box 0.2 m wide at 4 m, f = 600 px. Width in the image (px)?', 'Une boîte de 0,2 m de large à 4 m, f = 600 px. Largeur dans l\'image (px) ?'], num: { ans: 30, tol: 0.2, unit: 'px' }, sol: ['600 × 0.2 / 4 = <b>30 px</b>.', '600 × 0,2 / 4 = <b>30 px</b>.'] },
      { lv: 3, q: ['Stereo: f = 700 px, baseline B = 0.12 m, disparity d = 21 px. Depth Z (m)?', 'Stéréo : f = 700 px, base B = 0,12 m, disparité d = 21 px. Profondeur Z (m) ?'], num: { ans: 4, tol: 0.01, unit: 'm' }, sol: ['Z = f B / d = 700 × 0.12 / 21 = 84 / 21 = <b>4 m</b>. Far objects have a small disparity.', 'Z = f B / d = 700 × 0,12 / 21 = 84 / 21 = <b>4 m</b>. Les objets lointains ont une petite disparité.'] }] },

  3: { sum: [['Each measure is uncertain; the Kalman filter mixes prediction and measure, giving more weight to the more precise one.', 'Chaque mesure est incertaine ; le filtre de Kalman mélange prédiction et mesure, en donnant plus de poids à la plus précise.'],
      ['Fusion of two estimates: x = (x₁/σ₁² + x₂/σ₂²) / (1/σ₁² + 1/σ₂²).', 'Fusion de deux estimations : x = (x₁/σ₁² + x₂/σ₂²) / (1/σ₁² + 1/σ₂²).'],
      ['The fused uncertainty is always smaller than each one: 1/σ² = 1/σ₁² + 1/σ₂².', 'L\'incertitude fusionnée est toujours plus petite que chacune : 1/σ² = 1/σ₁² + 1/σ₂².']],
    fig: plot({ x: [0, 22], y: [0, 0.18], ticks: [11, 3], curves: [{ f: gauss(10, 3), c: COL.b, label: ['GPS: 10 m, σ = 3', 'GPS : 10 m, σ = 3'] }, { f: gauss(12, 4), c: COL.p, label: ['odometry: 12 m, σ = 4', 'odométrie : 12 m, σ = 4'] }, { f: gauss(kx, ks), c: COL.o, label: [`fused: ${e(kx)} m, σ = ${e(ks, 1)}`, `fusion : ${f(kx)} m, σ = ${f(ks, 1)}`] }], xl: ['position (m)', 'position (m)'] }), cap: ['Two uncertain estimates (blue, purple) give a sharper fused estimate (orange), closer to the more precise one.', 'Deux estimations incertaines (bleu, violet) donnent une fusion plus nette (orange), plus proche de la plus précise.'],
    ex: [
      { lv: 1, q: ['GPS σ = 3 m and odometry σ = 4 m. Fused σ (m)?', 'GPS σ = 3 m et odométrie σ = 4 m. σ fusionné (m) ?'], num: { ans: ks, tol: 0.01, unit: 'm' }, sol: ['1/σ² = 1/9 + 1/16 = 25/144 → σ² = 5.76 → σ = <b>2.4 m</b>. Better than each sensor alone.', '1/σ² = 1/9 + 1/16 = 25/144 → σ² = 5,76 → σ = <b>2,4 m</b>. Mieux que chaque capteur seul.'] },
      { lv: 2, q: ['GPS says 10 m (σ = 3), odometry says 12 m (σ = 4). Fused position (m)?', 'Le GPS dit 10 m (σ = 3), l\'odométrie dit 12 m (σ = 4). Position fusionnée (m) ?'], num: { ans: kx, tol: 0.02, unit: 'm' }, sol: [`Weights 1/9 = 0.111 and 1/16 = 0.0625. x = (10 × 0.111 + 12 × 0.0625) / 0.1736 = <b>${e(kx)} m</b>: closer to the GPS, which is more precise.`, `Poids 1/9 = 0,111 et 1/16 = 0,0625. x = (10 × 0,111 + 12 × 0,0625) / 0,1736 = <b>${f(kx)} m</b> : plus près du GPS, qui est plus précis.`] },
      { lv: 3, q: ['Kalman gain K = P / (P + R). Prediction variance P = 4, measure variance R = 1. K?', 'Gain de Kalman K = P / (P + R). Variance de prédiction P = 4, variance de mesure R = 1. K ?'], num: { ans: 0.8, tol: 0.005, unit: '' }, sol: ['K = 4 / (4 + 1) = <b>0.8</b>: the measure is trusted at 80 % because it is more precise than the prediction.', 'K = 4 / (4 + 1) = <b>0,8</b> : on fait confiance à 80 % à la mesure car elle est plus précise que la prédiction.'] }] },

  4: { sum: [['Odometry counts wheel turns: simple but the error grows with the distance travelled (drift).', 'L\'odométrie compte les tours de roue : simple mais l\'erreur grandit avec la distance parcourue (dérive).'],
      ['Localisation corrects the drift with landmarks seen on a known map.', 'La localisation corrige la dérive avec des repères vus sur une carte connue.'],
      ['SLAM builds the map and localises at the same time; a loop closure removes the accumulated error.', 'Le SLAM construit la carte et se localise en même temps ; une fermeture de boucle supprime l\'erreur accumulée.']],
    fig: plot({ x: [0, 50], y: [0, 1], curves: [{ f: (d) => d * Math.sin(1 * D), c: COL.r, label: ['odometry alone (1° heading error)', 'odométrie seule (erreur de cap de 1°)'] }, { f: (d) => 0.05 + 0.04 * Math.abs(Math.sin(d / 8)), c: COL.g, label: ['with landmarks', 'avec des repères'] }], xl: ['distance travelled (m)', 'distance parcourue (m)'], yl: ['error (m)', 'erreur (m)'] }), cap: ['Odometry drift grows with distance; landmarks keep the error small.', 'La dérive de l\'odométrie grandit avec la distance ; les repères gardent l\'erreur petite.'],
    ex: [
      { lv: 1, q: ['A wheel of radius 5 cm makes 10 turns. Distance (m)?', 'Une roue de rayon 5 cm fait 10 tours. Distance (m) ?'], num: { ans: 2 * Math.PI * 0.05 * 10, tol: 0.01, unit: 'm' }, sol: [`One turn = 2π × 0.05 = 0.314 m; 10 turns = <b>${e(Math.PI, 2)} m</b>.`, `Un tour = 2π × 0,05 = 0,314 m ; 10 tours = <b>${f(Math.PI, 2)} m</b>.`] },
      { lv: 2, q: ['The heading is wrong by 1°. Side error after 20 m in a straight line (m)?', 'Le cap est faux de 1°. Erreur latérale après 20 m en ligne droite (m) ?'], num: { ans: 20 * Math.sin(D), tol: 0.005, unit: 'm' }, sol: [`20 × sin 1° = 20 × 0.01745 = <b>${e(20 * Math.sin(D), 3)} m</b>: a tiny angle error becomes 35 cm.`, `20 × sin 1° = 20 × 0,01745 = <b>${f(20 * Math.sin(D), 3)} m</b> : une petite erreur d\'angle devient 35 cm.`] },
      { lv: 3, q: ['In SLAM, what is a "loop closure"?', 'En SLAM, qu\'est-ce qu\'une « fermeture de boucle » ?'], mcq: [['Recognising a place already visited, which corrects all the map.', 'Reconnaître un lieu déjà visité, ce qui corrige toute la carte.', true], ['Turning the robot off and on.', 'Éteindre et rallumer le robot.', false], ['Driving in a circle to calibrate.', 'Rouler en cercle pour s\'étalonner.', false]], sol: ['When the robot <b>recognises a known place</b>, it knows where it really is, and spreads the correction over the whole path.', 'Quand le robot <b>reconnaît un lieu connu</b>, il sait où il est vraiment, et répartit la correction sur tout le trajet.'] }] },

  5: { sum: [['The map is cut into cells (grid) or nodes (graph); planning = finding the cheapest path.', 'La carte est découpée en cases (grille) ou en nœuds (graphe) ; planifier = trouver le chemin le moins cher.'],
      ['Dijkstra explores in all directions; A* adds a guess h (distance to the goal) and explores f = g + h first.', 'Dijkstra explore dans toutes les directions ; A* ajoute une estimation h (distance au but) et explore d\'abord f = g + h.'],
      ['If h never overestimates, A* finds the shortest path, much faster.', 'Si h ne surestime jamais, A* trouve le plus court chemin, bien plus vite.']],
    fig: grid, cap: ['A grid map: the planner goes around the walls from S to G.', 'Une carte en grille : le planificateur contourne les murs de S à G.'],
    ex: [
      { lv: 1, q: ['Moves up/down/left/right only, no obstacles. Number of moves from (0,0) to (5,3)?', 'Déplacements haut/bas/gauche/droite seulement, sans obstacle. Nombre de déplacements de (0,0) à (5,3) ?'], num: { ans: 8, tol: 0.01, unit: '' }, sol: ['Manhattan distance = 5 + 3 = <b>8</b>.', 'Distance de Manhattan = 5 + 3 = <b>8</b>.'] },
      { lv: 2, q: ['Same, but diagonal moves are allowed (cost √2). Cost from (0,0) to (5,3)?', 'Pareil, mais les diagonales sont permises (coût √2). Coût de (0,0) à (5,3) ?'], num: { ans: 3 * Math.SQRT2 + 2, tol: 0.01, unit: '' }, sol: [`3 diagonals + 2 straight moves: 3 × 1.414 + 2 = <b>${e(3 * Math.SQRT2 + 2)}</b>.`, `3 diagonales + 2 pas droits : 3 × 1,414 + 2 = <b>${f(3 * Math.SQRT2 + 2)}</b>.`] },
      { lv: 3, q: ['A* has two cells to open. A: g = 4, h = 6. B: g = 7, h = 2. Which one first?', 'A* a deux cases à ouvrir. A : g = 4, h = 6. B : g = 7, h = 2. Laquelle d\'abord ?'], mcq: [['B (f = 9)', 'B (f = 9)', true], ['A (f = 10)', 'A (f = 10)', false]], sol: ['f(A) = 10, f(B) = 9: A* opens the smallest f, so <b>B</b>.', 'f(A) = 10, f(B) = 9 : A* ouvre le plus petit f, donc <b>B</b>.'] }] },

  6: { sum: [['An arm plans in the configuration space (C-space): one axis per joint; obstacles become forbidden zones.', 'Un bras planifie dans l\'espace des configurations (C-space) : un axe par articulation ; les obstacles deviennent des zones interdites.'],
      ['With 6 joints a grid is far too big: we use random sampling (RRT, PRM).', 'Avec 6 articulations, une grille est bien trop grande : on utilise l\'échantillonnage aléatoire (RRT, PRM).'],
      ['RRT grows a tree of random collision-free steps until it reaches the goal, then smooths the path.', 'RRT fait pousser un arbre de petits pas aléatoires sans collision jusqu\'au but, puis lisse le chemin.']],
    ex: [
      { lv: 1, q: ['2 joints, each cut in steps of 1° over 360°. Number of cells?', '2 articulations, chacune découpée par pas de 1° sur 360°. Nombre de cases ?'], num: { ans: 129600, tol: 1, unit: '' }, sol: ['360 × 360 = <b>129 600</b> cells: still possible.', '360 × 360 = <b>129 600</b> cases : encore possible.'] },
      { lv: 2, q: ['6 joints, steps of 10° (36 values each). Number of cells, in billions?', '6 articulations, pas de 10° (36 valeurs chacune). Nombre de cases, en milliards ?'], num: { ans: 36 ** 6 / 1e9, tol: 0.01, unit: '' }, sol: [`36⁶ = 2 176 782 336 ≈ <b>${e(36 ** 6 / 1e9)} billion</b>, even with coarse steps: this is why we sample randomly.`, `36⁶ = 2 176 782 336 ≈ <b>${f(36 ** 6 / 1e9)} milliards</b>, même avec des pas grossiers : voilà pourquoi on échantillonne au hasard.`] },
      { lv: 3, q: ['RRT draws a random point; the nearest tree node is 0.5 rad away and the step size is 0.1 rad. How far does the new node go?', 'RRT tire un point au hasard ; le nœud le plus proche de l\'arbre est à 0,5 rad et le pas vaut 0,1 rad. De combien avance le nouveau nœud ?'], num: { ans: 0.1, tol: 0.001, unit: 'rad' }, sol: ['The tree only grows by one step towards the random point: <b>0.1 rad</b>, if that step is free of collision.', 'L\'arbre n\'avance que d\'un pas vers le point aléatoire : <b>0,1 rad</b>, si ce pas est sans collision.'] }] },

  7: { sum: [['A state machine: a few states (wait, pick, place, error) and transitions triggered by events.', 'Une machine à états : quelques états (attendre, prendre, poser, erreur) et des transitions déclenchées par des événements.'],
      ['A behaviour tree: Sequence (→) does its children in order and fails if one fails; Fallback (?) tries them until one succeeds.', 'Un arbre de comportement : Séquence (→) fait ses enfants dans l\'ordre et échoue si l\'un échoue ; Repli (?) les essaie jusqu\'à ce que l\'un réussisse.'],
      ['Behaviour trees are easier to extend and reuse in big robots.', 'Les arbres de comportement sont plus faciles à étendre et réutiliser sur les gros robots.']],
    fig: chain([[['Wait', 'Attendre'], COL.b], [['Pick', 'Prendre'], COL.o], [['Move', 'Déplacer'], COL.y], [['Place', 'Poser'], COL.g]], { fb: [0, ['done → back to Wait', 'fini → retour à Attendre']] }), cap: ['A simple pick-and-place state machine.', 'Une machine à états simple de prise-dépose.'],
    ex: [
      { lv: 1, q: ['A Sequence with 3 children: the 2nd one fails. Result of the Sequence?', 'Une Séquence avec 3 enfants : le 2e échoue. Résultat de la Séquence ?'], mcq: [['Failure (the 3rd is not run)', 'Échec (le 3e n\'est pas lancé)', true], ['Success', 'Succès', false]], sol: ['A Sequence stops at the first failure: <b>failure</b>.', 'Une Séquence s\'arrête au premier échec : <b>échec</b>.'] },
      { lv: 2, q: ['A Fallback: "grasp with camera" fails, "grasp at known position" succeeds. Result?', 'Un Repli : « saisir avec caméra » échoue, « saisir à la position connue » réussit. Résultat ?'], mcq: [['Success', 'Succès', true], ['Failure', 'Échec', false]], sol: ['A Fallback succeeds as soon as one child succeeds: <b>success</b>.', 'Un Repli réussit dès qu\'un enfant réussit : <b>succès</b>.'] },
      { lv: 3, q: ['A Sequence of 3 actions, each succeeds 90 % of the time. Chance that the whole Sequence succeeds (%)?', 'Une Séquence de 3 actions, chacune réussit 90 % du temps. Chance que toute la Séquence réussisse (%) ?'], num: { ans: 72.9, tol: 0.05, unit: '%' }, sol: ['0.9 × 0.9 × 0.9 = 0.729 → <b>72.9 %</b>. Long sequences need recovery branches (Fallbacks).', '0,9 × 0,9 × 0,9 = 0,729 → <b>72,9 %</b>. Les longues séquences ont besoin de branches de secours (Replis).'] }] },

  8: { sum: [['Supervised learning: learn from labelled examples (images → "screw", "nut").', 'Apprentissage supervisé : apprendre à partir d\'exemples étiquetés (images → « vis », « écrou »).'],
      ['Always test on data the model has never seen (test set).', 'Toujours tester sur des données que le modèle n\'a jamais vues (jeu de test).'],
      ['Reinforcement learning: the robot tries, gets rewards, and maximises the sum of future rewards.', 'Apprentissage par renforcement : le robot essaie, reçoit des récompenses, et maximise la somme des récompenses futures.']],
    ex: [
      { lv: 1, q: ['5000 labelled images, 80 % for training. How many test images?', '5000 images étiquetées, 80 % pour l\'entraînement. Combien d\'images de test ?'], num: { ans: 1000, tol: 0.5, unit: '' }, sol: ['20 % of 5000 = <b>1000</b> images.', '20 % de 5000 = <b>1000</b> images.'] },
      { lv: 2, q: ['940 of the 1000 test images are correctly classified. Accuracy (%)?', '940 des 1000 images de test sont bien classées. Précision (%) ?'], num: { ans: 94, tol: 0.05, unit: '%' }, sol: ['940 / 1000 = <b>94 %</b>.', '940 / 1000 = <b>94 %</b>.'] },
      { lv: 3, q: ['Rewards 1, 1, 1 at the next three steps, discount γ = 0.9. Return G = r₀ + γ r₁ + γ² r₂?', 'Récompenses 1, 1, 1 aux trois prochains pas, actualisation γ = 0,9. Retour G = r₀ + γ r₁ + γ² r₂ ?'], num: { ans: 2.71, tol: 0.005, unit: '' }, sol: ['G = 1 + 0.9 + 0.81 = <b>2.71</b>. A reward far in the future counts a bit less.', 'G = 1 + 0,9 + 0,81 = <b>2,71</b>. Une récompense lointaine compte un peu moins.'] }] },

  9: { sum: [['A fleet manager gives missions to many robots, avoids traffic jams and sends them to charge.', 'Un gestionnaire de flotte donne des missions à de nombreux robots, évite les bouchons et les envoie se recharger.'],
      ['Swarms: many simple robots with local rules create a group behaviour.', 'Essaims : beaucoup de robots simples avec des règles locales créent un comportement de groupe.'],
      ['With humans: share the space safely, show intentions clearly, let people take over.', 'Avec les humains : partager l\'espace en sécurité, montrer clairement ses intentions, laisser l\'humain reprendre la main.']],
    ex: [
      { lv: 1, q: ['5 robots, each does 12 missions per hour. Missions per hour for the fleet?', '5 robots, chacun fait 12 missions par heure. Missions par heure pour la flotte ?'], num: { ans: 60, tol: 0.1, unit: '' }, sol: ['5 × 12 = <b>60</b> missions/h.', '5 × 12 = <b>60</b> missions/h.'] },
      { lv: 2, q: ['A robot works 4 h then charges 1 h. Fraction of time it works (%)?', 'Un robot travaille 4 h puis se recharge 1 h. Part du temps où il travaille (%) ?'], num: { ans: 80, tol: 0.05, unit: '%' }, sol: ['4 / (4 + 1) = <b>80 %</b>.', '4 / (4 + 1) = <b>80 %</b>.'] },
      { lv: 3, q: ['We need 8 robots working at every moment. How many robots must we buy?', 'Il faut 8 robots au travail à chaque instant. Combien de robots acheter ?'], num: { ans: 10, tol: 0.01, unit: '' }, sol: ['Each robot is available 80 % of the time: 8 / 0.8 = <b>10</b> robots.', 'Chaque robot est disponible 80 % du temps : 8 / 0,8 = <b>10</b> robots.'] }] }
};
