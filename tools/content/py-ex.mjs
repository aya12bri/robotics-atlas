// Python for robotics — the exercises of each lesson, with detailed solutions (rule used, where it is, steps, answer).
import { EXREG, SX } from '../lib.mjs';
const W = (n, en, fr) => [`lesson ${n} — ${en}`, `leçon ${n} — ${fr}`];
const C = (s) => `<code>${s}</code>`;

// built when the course is built (after the dictionary is reset), so that every text of the solutions is translated
export function loadEx() {
EXREG['py-1'] = [
  { lv: 1, q: ['What is the type of the value <code>True</code>?', 'Quel est le type de la valeur <code>True</code> ?'],
    mcq: [['int', 'int'], ['str', 'str'], ['bool', 'bool', 1], ['float', 'float']],
    sol: ['bool', 'bool'],
    sx: SX({ rule: ['True and False are the two values of the type bool (true/false)', 'True et False sont les deux valeurs du type bool (vrai/faux)'], where: W(1, '1.3 Variables and types (table)', '1.3 Variables et types (tableau)'),
      steps: [['True has no quotes, so it is not a text (str).', 'True n\'a pas de guillemets, ce n\'est donc pas un texte (str).'], ['It is not a number either: it is one of the two values of a yes/no question.', 'Ce n\'est pas non plus un nombre : c\'est l\'une des deux valeurs d\'une question oui/non.']],
      ans: ['<b>bool</b> (C)', '<b>bool</b> (C)'] }) },
  { lv: 1, q: ['After <code>n = 6</code> then <code>n = n + 1</code>, what does <code>print(n)</code> show?', 'Après <code>n = 6</code> puis <code>n = n + 1</code>, qu\'affiche <code>print(n)</code> ?'],
    num: { ans: 7, tol: 0 }, sol: ['7', '7'],
    sx: SX({ rule: ['= computes the right-hand side first, then stores the result in the name on the left', '= calcule d\'abord la partie de droite, puis range le résultat dans le nom de gauche'], where: W(1, '1.3, box “Three beginner traps”', '1.3, encadré « Trois pièges de débutant »'),
      steps: [['n holds 6.', 'n contient 6.'], ['n + 1 is computed with the old value: 6 + 1 = 7.', 'n + 1 est calculé avec l\'ancienne valeur : 6 + 1 = 7.'], ['7 is stored in n, which replaces 6.', '7 est rangé dans n, ce qui remplace 6.']],
      ans: ['<b>7</b>', '<b>7</b>'] }) }
];

EXREG['py-2'] = [
  { lv: 1, q: ['A link of length L = 0.8 m is turned by 60°. What does <code>0.8 * math.cos(math.radians(60))</code> give (in m)?', 'Un segment de longueur L = 0,8 m est tourné de 60°. Que donne <code>0.8 * math.cos(math.radians(60))</code> (en m) ?'],
    num: { ans: 0.4, tol: 0.005, unit: 'm' }, sol: ['0.4 m', '0,4 m'],
    sx: SX({ rule: ['end of a link: x = L cos θ, with θ in radians for math.cos', 'bout d\'un segment : x = L cos θ, avec θ en radians pour math.cos'], where: W(2, '2.2 The end of a link', '2.2 Le bout d\'un segment'),
      table: { head: [['Step', 'Étape'], ['Value', 'Valeur']], rows: [['<code>math.radians(60)</code>', '1.047'], ['<code>math.cos(1.047)</code>', '0.5'], ['<code>0.8 * 0.5</code>', '<b>0.4</b>']] },
      ans: ['<b>x = 0.4 m</b>', '<b>x = 0,4 m</b>'] }) },
  { lv: 1, q: ['What does <code>math.degrees(math.atan2(1, -1))</code> give (in degrees)?', 'Que donne <code>math.degrees(math.atan2(1, -1))</code> (en degrés) ?'],
    num: { ans: 135, tol: 0.5, unit: '°' }, sol: ['135°', '135°'],
    sx: SX({ rule: ['atan2(y, x) gives the angle of the point (x, y) in every quadrant; note the order: y first', 'atan2(y, x) donne l\'angle du point (x, y) dans tous les quadrants ; attention à l\'ordre : y d\'abord'], where: W(2, '2.2, list under the program', '2.2, liste sous le programme'),
      steps: [['y = 1 and x = −1: the point is up and to the left, between 90° and 180°.', 'y = 1 et x = −1 : le point est en haut à gauche, entre 90° et 180°.'], ['|y| = |x|, so it is at 45° from the negative x axis: 180° − 45° = 135°.', '|y| = |x|, il est donc à 45° de l\'axe x négatif : 180° − 45° = 135°.'], ['atan2 gives 2.356 rad; math.degrees turns it into 135.', 'atan2 donne 2,356 rad ; math.degrees le transforme en 135.']],
      ans: ['<b>135°</b>', '<b>135°</b>'] }) },
  { lv: 2, q: ['What does <code>-30 % 360</code> give?', 'Que donne <code>-30 % 360</code> ?'],
    num: { ans: 330, tol: 0 }, hint: ['In Python the remainder % has the sign of the divisor (here 360, positive).', 'En Python le reste % a le signe du diviseur (ici 360, positif).'], sol: ['330', '330'],
    sx: SX({ rule: ['a % 360 brings any angle back between 0 and 360°', 'a % 360 ramène n\'importe quel angle entre 0 et 360°'], where: W(2, '2.1 Operators (table and the line below)', '2.1 Les opérateurs (tableau et la ligne dessous)'),
      steps: [['Find the whole number of turns below −30: −30 // 360 = −1.', 'Trouvez le nombre entier de tours en dessous de −30 : −30 // 360 = −1.'], ['Remainder = −30 − (−1 × 360) = −30 + 360 = 330.', 'Reste = −30 − (−1 × 360) = −30 + 360 = 330.'], ['Check: −30° and 330° are the same direction.', 'Vérification : −30° et 330° sont la même direction.']],
      ans: ['<b>330</b>', '<b>330</b>'] }) }
];

EXREG['py-3'] = [
  { lv: 1, q: ['How many lines does <code>for k in range(5): print(k)</code> print?', 'Combien de lignes affiche <code>for k in range(5): print(k)</code> ?'],
    num: { ans: 5, tol: 0 }, sol: ['5', '5'],
    sx: SX({ rule: ['for repeats once for each element; range(5) gives 0, 1, 2, 3, 4', 'for répète une fois pour chaque élément ; range(5) donne 0, 1, 2, 3, 4'], where: W(3, '3.1 (table of keywords)', '3.1 (tableau des mots-clés)'),
      steps: [['range(5) starts at 0 and stops <em>before</em> 5.', 'range(5) commence à 0 et s\'arrête <em>avant</em> 5.'], ['That is 5 values, so 5 lines: 0 1 2 3 4.', 'Cela fait 5 valeurs, donc 5 lignes : 0 1 2 3 4.']],
      ans: ['<b>5 lines</b>', '<b>5 lignes</b>'] }) },
  { lv: 2, q: ['<code>angle = 0</code>, then <code>while angle &lt; 60: angle = angle + 25</code>. What is <code>angle</code> after the loop?', '<code>angle = 0</code>, puis <code>while angle &lt; 60: angle = angle + 25</code>. Que vaut <code>angle</code> après la boucle ?'],
    num: { ans: 75, tol: 0 }, hint: ['Write the value of angle and the test at each turn.', 'Écrivez la valeur de angle et le test à chaque tour.'], sol: ['75', '75'],
    sx: SX({ rule: ['while tests the condition before each turn and stops as soon as it is false', 'while teste la condition avant chaque tour et s\'arrête dès qu\'elle est fausse'], where: W(3, '3.1 (table of keywords)', '3.1 (tableau des mots-clés)'),
      table: { head: [['Turn', 'Tour'], ['angle before', 'angle avant'], ['angle &lt; 60?', 'angle &lt; 60 ?'], ['angle after', 'angle après']], rows: [['1', '0', ['yes', 'oui'], '25'], ['2', '25', ['yes', 'oui'], '50'], ['3', '50', ['yes', 'oui'], '75'], ['—', '75', ['no: stop', 'non : arrêt'], '<b>75</b>']] },
      ans: ['<b>75</b> — the loop goes past 60 because it adds 25 before testing again', '<b>75</b> — la boucle dépasse 60 car elle ajoute 25 avant de tester à nouveau'] }) }
];

EXREG['py-4'] = [
  { lv: 1, q: ['With the function fk of the lesson (L1 = 0.5, L2 = 0.4), what is y for <code>fk(90, 0)</code> (in m)?', 'Avec la fonction fk de la leçon (L1 = 0,5, L2 = 0,4), que vaut y pour <code>fk(90, 0)</code> (en m) ?'],
    num: { ans: 0.9, tol: 0.005, unit: 'm' }, sol: ['0.9 m', '0,9 m'],
    sx: SX({ rule: ['forward kinematics: y = L1 sin θ1 + L2 sin(θ1 + θ2)', 'modèle direct : y = L1 sin θ1 + L2 sin(θ1 + θ2)'], where: W(4, '4.1 The forward kinematics as a function', '4.1 Le modèle direct en fonction'),
      steps: [['θ1 = 90°, θ1 + θ2 = 90°: both links point up.', 'θ1 = 90°, θ1 + θ2 = 90° : les deux segments pointent vers le haut.'], ['y = 0.5 × sin 90° + 0.4 × sin 90° = 0.5 + 0.4.', 'y = 0,5 × sin 90° + 0,4 × sin 90° = 0,5 + 0,4.']],
      ans: ['<b>y = 0.9 m</b> (and x = 0)', '<b>y = 0,9 m</b> (et x = 0)'] }) },
  { lv: 2, q: ['What is x for <code>fk(90, -90)</code> (in m)?', 'Que vaut x pour <code>fk(90, -90)</code> (en m) ?'],
    num: { ans: 0.4, tol: 0.005, unit: 'm' }, hint: ['θ1 + θ2 = 0: the second link is horizontal.', 'θ1 + θ2 = 0 : le second segment est horizontal.'], sol: ['0.4 m', '0,4 m'],
    sx: SX({ rule: ['forward kinematics: x = L1 cos θ1 + L2 cos(θ1 + θ2)', 'modèle direct : x = L1 cos θ1 + L2 cos(θ1 + θ2)'], where: W(4, '4.1 The forward kinematics as a function', '4.1 Le modèle direct en fonction'),
      table: { head: [['Term', 'Terme'], ['Angle', 'Angle'], ['cos', 'cos'], ['Value (m)', 'Valeur (m)']], rows: [['L1 cos θ1', '90°', '0', '0'], ['L2 cos(θ1 + θ2)', '0°', '1', '0.4'], [['<b>sum x</b>', '<b>somme x</b>'], '', '', '<b>0.4</b>']] },
      ans: ['<b>x = 0.4 m</b> (and y = 0.5 m): the arm makes an L', '<b>x = 0,4 m</b> (et y = 0,5 m) : le bras fait un L'] }) }
];

EXREG['py-5'] = [
  { lv: 1, q: ['The list <code>pts</code> has 4 points. After <code>pts.append((0, 0))</code> twice, what is <code>len(pts)</code>?', 'La liste <code>pts</code> a 4 points. Après deux fois <code>pts.append((0, 0))</code>, que vaut <code>len(pts)</code> ?'],
    num: { ans: 6, tol: 0 }, sol: ['6', '6'],
    sx: SX({ rule: ['append adds one element at the end; len counts the elements', 'append ajoute un élément à la fin ; len compte les éléments'], where: W(5, '5.1, list under the program', '5.1, liste sous le programme'),
      steps: [['Start: 4 elements.', 'Départ : 4 éléments.'], ['Each append adds 1: 4 + 1 + 1 = 6.', 'Chaque append ajoute 1 : 4 + 1 + 1 = 6.']],
      ans: ['<b>6</b>', '<b>6</b>'] }) },
  { lv: 1, q: ['With <code>pts = [(0, 0), (30, 45), (60, -30)]</code>, what is <code>pts[-1]</code>?', 'Avec <code>pts = [(0, 0), (30, 45), (60, -30)]</code>, que vaut <code>pts[-1]</code> ?'],
    mcq: [['(0, 0)', '(0, 0)'], ['(60, -30)', '(60, -30)', 1], ['(30, 45)', '(30, 45)'], ['an error', 'une erreur']],
    sol: ['(60, -30)', '(60, -30)'],
    sx: SX({ rule: ['index −1 is the last element of a list', 'l\'indice −1 est le dernier élément d\'une liste'], where: W(5, '5.1, list under the program', '5.1, liste sous le programme'),
      table: { head: [['Index', 'Indice'], '0', '1', '2'], rows: [[['from the end', 'depuis la fin'], '−3', '−2', '<b>−1</b>'], [['element', 'élément'], '(0, 0)', '(30, 45)', '<b>(60, -30)</b>']] },
      ans: ['<b>(60, -30)</b> (B)', '<b>(60, -30)</b> (B)'] }) },
  { lv: 2, q: ['With <code>robot = {"L1": 0.5, "L2": 0.4}</code>, what does <code>robot["L1"] + robot["L2"]</code> give? (It is the reach of the arm, in m.)', 'Avec <code>robot = {"L1": 0.5, "L2": 0.4}</code>, que donne <code>robot["L1"] + robot["L2"]</code> ? (C\'est la portée du bras, en m.)'],
    num: { ans: 0.9, tol: 0.005, unit: 'm' }, sol: ['0.9 m', '0,9 m'],
    sx: SX({ rule: ['a dictionary gives the value stored under a key: robot["L1"]', 'un dictionnaire donne la valeur rangée sous une clé : robot["L1"]'], where: W(5, '5.1 Three containers (table)', '5.1 Trois conteneurs (tableau)'),
      steps: [['robot["L1"] → 0.5 and robot["L2"] → 0.4.', 'robot["L1"] → 0,5 et robot["L2"] → 0,4.'], ['0.5 + 0.4 = 0.9: the arm stretched reaches 0.9 m.', '0,5 + 0,4 = 0,9 : le bras tendu atteint 0,9 m.']],
      ans: ['<b>0.9 m</b>', '<b>0,9 m</b>'] }) }
];

EXREG['py-6'] = [
  { lv: 1, q: ['What does <code>np.linalg.norm(np.array([3, 4]))</code> give?', 'Que donne <code>np.linalg.norm(np.array([3, 4]))</code> ?'],
    num: { ans: 5, tol: 0.001 }, sol: ['5', '5'],
    sx: SX({ rule: ['the norm is the length of the vector: √(x² + y²)', 'la norme est la longueur du vecteur : √(x² + y²)'], where: W(6, '6.1 (table maths → NumPy)', '6.1 (tableau maths → NumPy)'),
      steps: [['3² + 4² = 9 + 16 = 25.', '3² + 4² = 9 + 16 = 25.'], ['√25 = 5.', '√25 = 5.']],
      ans: ['<b>5.0</b>', '<b>5,0</b>'] }) },
  { lv: 1, q: ['What is the step between two values of <code>np.linspace(0, 1, 5)</code>?', 'Quel est le pas entre deux valeurs de <code>np.linspace(0, 1, 5)</code> ?'],
    num: { ans: 0.25, tol: 0.001 }, sol: ['0.25', '0,25'],
    sx: SX({ rule: ['linspace(a, b, n) gives n values, ends included, so n − 1 intervals: step = (b − a) / (n − 1)', 'linspace(a, b, n) donne n valeurs, bornes comprises, donc n − 1 intervalles : pas = (b − a) / (n − 1)'], where: W(6, '6.1 (program and table)', '6.1 (programme et tableau)'),
      steps: [['5 values make 4 intervals.', '5 valeurs font 4 intervalles.'], ['step = (1 − 0) / 4 = 0.25: [0, 0.25, 0.5, 0.75, 1].', 'pas = (1 − 0) / 4 = 0,25 : [0 ; 0,25 ; 0,5 ; 0,75 ; 1].']],
      ans: ['<b>0.25</b>', '<b>0,25</b>'] }) },
  { lv: 2, q: ['With the function rot of the lesson, what is <code>rot(90) @ np.array([1, 0])</code>?', 'Avec la fonction rot de la leçon, que vaut <code>rot(90) @ np.array([1, 0])</code> ?'],
    mcq: [['[0, 1]', '[0, 1]', 1], ['[1, 0]', '[1, 0]'], ['[0, −1]', '[0, −1]'], ['[−1, 0]', '[−1, 0]']],
    sol: ['[0, 1]', '[0, 1]'],
    sx: SX({ rule: ['R(θ) a turns a by θ counter-clockwise; R(90°) = [[0, −1], [1, 0]]', 'R(θ) a tourne a de θ dans le sens trigonométrique ; R(90°) = [[0, −1], [1, 0]]'], where: W(6, '6.1 A rotation in code (and the figure)', '6.1 Une rotation en code (et la figure)'),
      table: { head: [['Row of R', 'Ligne de R'], ['× (1, 0)', '× (1, 0)'], ['Result', 'Résultat']], rows: [['[0, −1]', '0 × 1 + (−1) × 0', '0'], ['[1, 0]', '1 × 1 + 0 × 0', '1']] },
      ans: ['<b>[0, 1]</b> (A): the x axis turned by 90° becomes the y axis (NumPy prints [6.1e-17, 1.] because of rounding)', '<b>[0, 1]</b> (A) : l\'axe x tourné de 90° devient l\'axe y (NumPy affiche [6.1e-17, 1.] à cause des arrondis)'] }) }
];

EXREG['py-7'] = [
  { lv: 1, q: ['On the curve of the lesson (0 to 90° in 2 s), what is the angle at t = 1 s (in degrees)?', 'Sur la courbe de la leçon (0 à 90° en 2 s), quel est l\'angle à t = 1 s (en degrés) ?'],
    num: { ans: 45, tol: 0.5, unit: '°' }, sol: ['45°', '45°'],
    sx: SX({ rule: ['smooth law of degree 5: s(u) = 10u³ − 15u⁴ + 6u⁵ with u = t / T, then θ = 90 s', 'loi douce de degré 5 : s(u) = 10u³ − 15u⁴ + 6u⁵ avec u = t / T, puis θ = 90 s'], where: W(7, '7.1 Plot a joint trajectory', '7.1 Tracer une trajectoire articulaire'),
      table: { head: [['Term', 'Terme'], ['u = 0.5', 'u = 0,5']], rows: [['10u³', '1.25'], ['−15u⁴', '−0.9375'], ['6u⁵', '0.1875'], [['<b>s = sum</b>', '<b>s = somme</b>'], '<b>0.5</b>']] },
      ans: ['<b>θ = 90 × 0.5 = 45°</b>', '<b>θ = 90 × 0,5 = 45°</b>'] }) },
  { lv: 2, q: ['A sensor gives 0.98, 1.00 and 1.02 m. What does <code>data.mean()</code> give (in m)?', 'Un capteur donne 0,98, 1,00 et 1,02 m. Que donne <code>data.mean()</code> (en m) ?'],
    num: { ans: 1, tol: 0.001, unit: 'm' }, sol: ['1.00 m', '1,00 m'],
    sx: SX({ rule: ['mean = sum of the values / number of values', 'moyenne = somme des valeurs / nombre de valeurs'], where: W(7, '7.1 (table, last line)', '7.1 (tableau, dernière ligne)'),
      steps: [['Sum: 0.98 + 1.00 + 1.02 = 3.00.', 'Somme : 0,98 + 1,00 + 1,02 = 3,00.'], ['Divide by 3: 3.00 / 3 = 1.00.', 'Divisez par 3 : 3,00 / 3 = 1,00.']],
      ans: ['<b>1.00 m</b>', '<b>1,00 m</b>'] }) }
];

EXREG['py-8'] = [
  { lv: 1, q: ['In the controller of the lesson, take Kp = 2 instead of 4 (Δt = 0.05, target 60°, start 0°). What is q1 after the first step (in degrees)?', 'Dans le correcteur de la leçon, prenez Kp = 2 au lieu de 4 (Δt = 0,05, consigne 60°, départ 0°). Que vaut q1 après le premier pas (en degrés) ?'],
    num: { ans: 6, tol: 0.05, unit: '°' }, sol: ['6°', '6°'],
    sx: SX({ rule: ['P controller: e = target − q, ω = Kp e, q ← q + ω Δt', 'correcteur P : e = consigne − q, ω = Kp e, q ← q + ω Δt'], where: W(8, '8.2 A proportional controller', '8.2 Un correcteur proportionnel'),
      table: { head: [['Quantity', 'Grandeur'], ['Value', 'Valeur']], rows: [['e = 60 − 0', '60°'], ['ω = 2 × 60', '120 °/s'], ['q = 0 + 120 × 0.05', '<b>6°</b>']] },
      ans: ['<b>6°</b> — half of the 12° of the lesson: half the gain, half the step', '<b>6°</b> — la moitié des 12° de la leçon : deux fois moins de gain, un pas deux fois plus petit'] }) },
  { lv: 2, q: ['Still with Kp = 2, what is the error after 2 steps (in degrees)?', 'Toujours avec Kp = 2, quelle est l\'erreur après 2 pas (en degrés) ?'],
    num: { ans: 48.6, tol: 0.05, unit: '°' }, hint: ['At each step the error is multiplied by 1 − Kp Δt.', 'À chaque pas l\'erreur est multipliée par 1 − Kp Δt.'], sol: ['48.6°', '48,6°'],
    sx: SX({ rule: ['at each step the error is multiplied by 1 − Kp Δt', 'à chaque pas l\'erreur est multipliée par 1 − Kp Δt'], where: W(8, '8.2, paragraph under the figure', '8.2, paragraphe sous la figure'),
      table: { head: [['Step k', 'Pas k'], ['Error (°)', 'Erreur (°)'], ['q1 (°)', 'q1 (°)']], rows: [['0', '60', '0'], ['1', '60 × 0.9 = 54', '6'], ['2', '<b>54 × 0.9 = 48.6</b>', '11.4']] },
      steps: [['1 − Kp Δt = 1 − 2 × 0.05 = 0.9.', '1 − Kp Δt = 1 − 2 × 0,05 = 0,9.']],
      ans: ['<b>48.6°</b>', '<b>48,6°</b>'] }) },
  { lv: 3, q: ['Which gain makes the loop unstable with Δt = 0.05 s?', 'Quel gain rend la boucle instable avec Δt = 0,05 s ?'],
    mcq: [['Kp = 4 /s', 'Kp = 4 /s'], ['Kp = 20 /s', 'Kp = 20 /s'], ['Kp = 35 /s', 'Kp = 35 /s'], ['Kp = 50 /s', 'Kp = 50 /s', 1]],
    sol: ['Kp = 50 /s', 'Kp = 50 /s'],
    sx: SX({ rule: ['the loop is stable if |1 − Kp Δt| &lt; 1, that is 0 &lt; Kp Δt &lt; 2', 'la boucle est stable si |1 − Kp Δt| &lt; 1, c\'est-à-dire 0 &lt; Kp Δt &lt; 2'], where: W(8, '8.2, paragraph under the figure', '8.2, paragraphe sous la figure'),
      table: { head: ['Kp', 'Kp Δt', '1 − Kp Δt', ['Behaviour', 'Comportement']], rows: [['4', '0.2', '0.8', ['smooth', 'douce']], ['20', '1', '0', ['reaches the target in 1 step', 'atteint la consigne en 1 pas']], ['35', '1.75', '−0.75', ['oscillates but converges', 'oscille mais converge']], ['<b>50</b>', '<b>2.5</b>', '<b>−1.5</b>', ['<b>oscillates and grows: unstable</b>', '<b>oscille et grandit : instable</b>']]] },
      ans: ['<b>Kp = 50 /s</b> (D)', '<b>Kp = 50 /s</b> (D)'] }) }
];
}
