// Python for robotics — lessons 5 to 8: lists and dictionaries, NumPy, plots and files, classes and a first controller.
import { P, H4, UL, OL, EQ, BOX, TABLE, CODE, OUT, lesson } from '../lib.mjs';
import { plot, ARROW, T, DOT, LINE, COL as C } from '../practice/fig.mjs';
const PRE = 'py-';
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));
const FIGO = (o, cap) => `<figure class="figure"><svg viewBox="${o.vb}" class="fig" role="img" aria-hidden="true">${o.svg}</svg>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;

// a vector a = (0.3, 0.4) and the same vector turned by 90°
function rotFig() {
  const W = 460, H = 300, ox = 230, oy = 230, s = 400;
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
  g += ARROW(30, oy, W - 30, oy, C.axis, 1.5) + T(W - 34, oy + 20, 'x', { raw: true, c: C.axis, a: 'end' }) + ARROW(ox, oy + 40, ox, 20, C.axis, 1.5) + T(ox + 10, 30, 'y', { raw: true, c: C.axis });
  g += ARROW(ox, oy, ox + 0.3 * s, oy - 0.4 * s, C.o, 3.5) + T(ox + 0.3 * s + 8, oy - 0.4 * s, 'a = (0.3, 0.4)', { raw: true, c: C.o, fs: 14, b: true });
  g += ARROW(ox, oy, ox - 0.4 * s, oy - 0.3 * s, C.b, 3.5) + T(ox - 0.4 * s - 6, oy - 0.3 * s - 10, 'rot(90) @ a = (−0.4, 0.3)', { raw: true, c: C.b, fs: 14, b: true, a: 'start' });
  g += `<path d="M${ox + 42},${oy - 56} A70,70 0 0 0 ${ox - 56},${oy - 42}" fill="none" stroke="${C.y}" stroke-width="2" stroke-dasharray="5 4"/>` + T(ox - 4, oy - 82, '90°', { raw: true, c: C.y, fs: 14, a: 'middle' });
  return { vb: `0 0 ${W} ${H}`, svg: g };
}
const quint = (t) => { const u = t / 2; return 90 * (10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5); };
// the steps of the P controller of lesson 8 (Kp = 4, dt = 0.05)
const pSteps = (() => { const r = [[0, 0]]; let q = 0; for (let k = 1; k <= 12; k++) { q += 4 * (60 - q) * 0.05; r.push([k * 0.05, q]); } return r; })();

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['Lists and dictionaries: waypoints and parameters', 'Listes et dictionnaires : points de passage et paramètres'],
  time: 25,
  goal: ['how to keep many values together: a list for an ordered path of waypoints, a tuple for a fixed pair, a dictionary for the named parameters of a robot.', 'comment garder beaucoup de valeurs ensemble : une liste pour un chemin ordonné de points de passage, un tuple pour une paire fixe, un dictionnaire pour les paramètres nommés d\'un robot.'],
  body: [
    ONE('A list is numbered from 0 and keeps the order; a dictionary finds a value by its name.', 'Une liste est numérotée à partir de 0 et garde l\'ordre ; un dictionnaire retrouve une valeur par son nom.'),
    H4('5.1 Three containers', '5.1 Trois conteneurs'),
    TABLE([['Container', 'Conteneur'], ['Written', 'Écriture'], ['Read one value', 'Lire une valeur'], ['In a robot', 'Dans un robot']], [
      [['list', 'liste'], '<code>[0, 30, 60]</code>', '<code>pts[0]</code>, <code>pts[-1]</code>', ['a path, the samples of a sensor', 'un chemin, les échantillons d\'un capteur']],
      [['tuple', 'tuple'], '<code>(30, 45)</code>', '<code>p[1]</code>', ['one pose (θ₁, θ₂), a point (x, y)', 'une pose (θ₁, θ₂), un point (x, y)']],
      [['dictionary', 'dictionnaire'], '<code>{"L1": 0.5}</code>', '<code>robot["L1"]</code>', ['the parameters of a robot, a configuration file', 'les paramètres d\'un robot, un fichier de configuration']]
    ]),
    CODE('py-lists.py'),
    OUT('py-lists.out.txt'),
    UL([
      ['The first element is number <strong>0</strong>; <code>[-1]</code> is the last one.', 'Le premier élément est le numéro <strong>0</strong> ; <code>[-1]</code> est le dernier.'],
      ['<code>len(pts)</code> gives the number of elements; <code>pts.append(p)</code> adds one at the end.', '<code>len(pts)</code> donne le nombre d\'éléments ; <code>pts.append(p)</code> en ajoute un à la fin.'],
      ['<code>for i, (t1, t2) in enumerate(pts)</code> gives at the same time the number and the two angles of each point.', '<code>for i, (t1, t2) in enumerate(pts)</code> donne à la fois le numéro et les deux angles de chaque point.']
    ]),
    BOX('note', ['Why a dictionary for the parameters?', 'Pourquoi un dictionnaire pour les paramètres ?'], P('<code>robot["L1"]</code> says what it is; <code>robot[1]</code> does not. The configuration files of ROS 2 (YAML) and of most robots are read in Python as dictionaries.', '<code>robot["L1"]</code> dit ce que c\'est ; <code>robot[1]</code> ne le dit pas. Les fichiers de configuration de ROS 2 (YAML) et de la plupart des robots se lisent en Python comme des dictionnaires.'))
  ],
  terms: [['list, index', 'liste, indice'], ['tuple', 'tuple'], ['dictionary, key', 'dictionnaire, clé'], ['len, append', 'len, append'], ['enumerate', 'enumerate']],
  quiz: [
    ['What is waypoints[0] in the program?', 'Que vaut waypoints[0] dans le programme ?', '(0, 0): the first point, number 0.', '(0, 0) : le premier point, numéro 0.'],
    ['How do you read the length L2 of the robot?', 'Comment lire la longueur L2 du robot ?', 'robot["L2"] → 0.4.', 'robot["L2"] → 0,4.'],
    ['When is a tuple better than a list?', 'Quand un tuple vaut-il mieux qu\'une liste ?', 'For a small fixed group of values that belong together, such as one pose (θ₁, θ₂): it cannot be changed by mistake.', 'Pour un petit groupe fixe de valeurs qui vont ensemble, comme une pose (θ₁, θ₂) : on ne peut pas la modifier par erreur.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['NumPy: vectors, matrices, whole trajectories', 'NumPy : vecteurs, matrices, trajectoires entières'],
  time: 30,
  goal: ['how NumPy stores vectors and matrices, the matrix product @, a rotation matrix as a function, and how to compute a whole trajectory in one line instead of a loop.', 'comment NumPy range vecteurs et matrices, le produit matriciel @, une matrice de rotation en fonction, et comment calculer toute une trajectoire en une ligne au lieu d\'une boucle.'],
  body: [
    ONE('NumPy turns the maths of the course into code almost word for word: a vector is np.array, a product of matrices is @.', 'NumPy transforme les maths du cours en code presque mot pour mot : un vecteur est np.array, un produit de matrices est @.'),
    H4('6.1 A rotation in code', '6.1 Une rotation en code'),
    EQ('R(<i>θ</i>) = [[cos <i>θ</i>, −sin <i>θ</i>], [sin <i>θ</i>, cos <i>θ</i>]] &emsp; <i>a</i>′ = R(<i>θ</i>) <i>a</i>'),
    CODE('py-numpy.py'),
    OUT('py-numpy.out.txt'),
    FIGO(rotFig()),
    TABLE([['Maths', 'Maths'], ['NumPy', 'NumPy']], [
      [['vector a', 'vecteur a'], '<code>np.array([0.3, 0.4])</code>'],
      [['length ‖a‖', 'longueur ‖a‖'], '<code>np.linalg.norm(a)</code>'],
      [['product of matrices R a', 'produit de matrices R a'], '<code>R @ a</code>'],
      [['transpose Rᵀ, inverse R⁻¹', 'transposée Rᵀ, inverse R⁻¹'], '<code>R.T</code>, <code>np.linalg.inv(R)</code>'],
      [['n instants from 0 to T', 'n instants de 0 à T'], '<code>np.linspace(0, T, n)</code>']
    ]),
    H4('6.2 No loop needed', '6.2 Pas besoin de boucle'),
    P('<code>theta = 90 * t / 2</code> computes the 5 angles at once, because <code>t</code> is an array: every operation is done on every element. This is shorter and about 100 times faster than a <code>for</code> loop on long trajectories.', '<code>theta = 90 * t / 2</code> calcule les 5 angles d\'un coup, car <code>t</code> est un tableau : chaque opération est faite sur chaque élément. C\'est plus court et environ 100 fois plus rapide qu\'une boucle <code>for</code> sur de longues trajectoires.'),
    BOX('warn', ['* is not @', '* n\'est pas @'], P('<code>A * B</code> multiplies element by element; the matrix product of the maths course is <code>A @ B</code>. Mixing them up gives a result of the right size but wrong values.', '<code>A * B</code> multiplie élément par élément ; le produit matriciel du cours de maths est <code>A @ B</code>. Les confondre donne un résultat de la bonne taille mais aux mauvaises valeurs.'))
  ],
  terms: [['NumPy, array', 'NumPy, tableau'], ['matrix product @', 'produit matriciel @'], ['norm', 'norme'], ['linspace', 'linspace'], ['vectorised computation', 'calcul vectorisé']],
  quiz: [
    ['What does np.linalg.norm(np.array([3, 4])) give?', 'Que donne np.linalg.norm(np.array([3, 4])) ?', '5.0 = √(3² + 4²).', '5,0 = √(3² + 4²).'],
    ['What is the difference between R * a and R @ a?', 'Quelle différence entre R * a et R @ a ?', 'R * a multiplies element by element; R @ a is the matrix product (the rotation).', 'R * a multiplie élément par élément ; R @ a est le produit matriciel (la rotation).'],
    ['How many values does np.linspace(0, 2, 5) give, and what is the step?', 'Combien de valeurs donne np.linspace(0, 2, 5), et quel est le pas ?', '5 values, step 0.5: [0, 0.5, 1, 1.5, 2].', '5 valeurs, pas de 0,5 : [0 ; 0,5 ; 1 ; 1,5 ; 2].']
  ]
}),
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['Plots and data files: seeing what the robot does', 'Graphiques et fichiers : voir ce que fait le robot'],
  time: 25,
  goal: ['how to draw a curve with Matplotlib (axes, labels, legend, grid), how to save it, and how to read a file of measurements and compute its mean and standard deviation.', 'comment tracer une courbe avec Matplotlib (axes, étiquettes, légende, grille), comment l\'enregistrer, et comment lire un fichier de mesures et calculer sa moyenne et son écart-type.'],
  body: [
    ONE('Never trust a trajectory or a sensor you have not plotted.', 'Ne faites jamais confiance à une trajectoire ou à un capteur que vous n\'avez pas tracé.'),
    H4('7.1 Plot a joint trajectory', '7.1 Tracer une trajectoire articulaire'),
    P('The program draws the smooth law of degree 5 of the maths course (lesson 7): the joint goes from 0 to 90° in 2 s, starting and stopping with zero speed and acceleration.', 'Le programme trace la loi douce de degré 5 du cours de maths (leçon 7) : la liaison va de 0 à 90° en 2 s, en partant et en s\'arrêtant avec une vitesse et une accélération nulles.'),
    CODE('py-plot.py'),
    FIGO(plot({ x: [0, 2], y: [0, 90], ticks: [4, 3], curves: [{ f: quint, label: ['theta (deg)', 'theta (deg)'] }], xl: ['time (s)', 'temps (s)'], yl: ['angle (deg)', 'angle (deg)'], marks: [[1, 45, ['half-way: 45° at 1 s', 'à mi-chemin : 45° à 1 s']]] })),
    P('The picture saved in <code>trajectory.png</code> looks like the figure above. Then the program reads 10 measurements of a distance sensor pointed at a wall 1 m away:', 'L\'image enregistrée dans <code>trajectory.png</code> ressemble à la figure ci-dessus. Puis le programme lit 10 mesures d\'un capteur de distance pointé vers un mur à 1 m :'),
    OUT('py-plot.out.txt'),
    TABLE([['Line', 'Ligne'], ['What the line does', 'Ce que fait la ligne']], [
      ['<code>plt.plot(t, theta, label=…)</code>', ['draws theta against t and names the curve', 'trace theta en fonction de t et nomme la courbe']],
      ['<code>plt.xlabel / ylabel / legend / grid</code>', ['the names of the axes with units, the legend, the grid', 'les noms des axes avec les unités, la légende, la grille']],
      ['<code>plt.savefig("….png")</code>', ['saves the picture (plt.show() opens a window)', 'enregistre l\'image (plt.show() ouvre une fenêtre)']],
      ['<code>np.loadtxt("….csv", delimiter=",")</code>', ['reads a text file of numbers into an array', 'lit un fichier texte de nombres dans un tableau']],
      ['<code>data.mean(), data.std()</code>', ['the mean and the standard deviation (the noise of the sensor)', 'la moyenne et l\'écart-type (le bruit du capteur)']]
    ]),
    BOX('method', ['A good plot in four checks', 'Un bon graphique en quatre vérifications'], OL([
      ['each axis has a name and a unit;', 'chaque axe a un nom et une unité ;'],
      ['each curve has a label and the legend does not hide it;', 'chaque courbe a une étiquette et la légende ne la cache pas ;'],
      ['the start and end values are the expected ones (0 and 90° here);', 'les valeurs de départ et d\'arrivée sont celles attendues (0 et 90° ici) ;'],
      ['there is no jump: a jump in a position means an infinite speed.', 'il n\'y a pas de saut : un saut de position veut dire une vitesse infinie.']
    ]))
  ],
  terms: [['Matplotlib', 'Matplotlib'], ['label, legend', 'étiquette, légende'], ['CSV file', 'fichier CSV'], ['mean', 'moyenne'], ['standard deviation', 'écart-type']],
  quiz: [
    ['What is the angle at t = 1 s on the curve?', 'Quel est l\'angle à t = 1 s sur la courbe ?', '45°: the smooth law is symmetric, half the motion is done at half the time.', '45° : la loi douce est symétrique, la moitié du mouvement est faite à la moitié du temps.'],
    ['What does the standard deviation of the 10 measurements tell you?', 'Que vous dit l\'écart-type des 10 mesures ?', 'The size of the sensor noise: about 0.019 m = 1.9 cm here.', 'La taille du bruit du capteur : environ 0,019 m = 1,9 cm ici.'],
    ['What is the difference between plt.savefig and plt.show?', 'Quelle différence entre plt.savefig et plt.show ?', 'savefig writes the picture into a file; show opens it in a window.', 'savefig écrit l\'image dans un fichier ; show l\'ouvre dans une fenêtre.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['Classes and a first controller', 'Les classes et un premier correcteur'],
  time: 30,
  goal: ['how a class groups the data of a robot and its functions, what self and __init__ are, and how to write the loop of a proportional controller that brings a joint to a target.', 'comment une classe regroupe les données d\'un robot et ses fonctions, ce que sont self et __init__, et comment écrire la boucle d\'un correcteur proportionnel qui amène une liaison vers une consigne.'],
  body: [
    ONE('A class is a mould for objects: Arm2() makes a robot that keeps its own lengths and angles and knows how to compute its tool.', 'Une classe est un moule à objets : Arm2() fabrique un robot qui garde ses propres longueurs et angles et sait calculer son outil.'),
    H4('8.1 The class Arm2', '8.1 La classe Arm2'),
    UL([
      ['<code>__init__</code> runs when the object is made: it stores <code>L1</code>, <code>L2</code> and the angles <code>q</code> in <code>self</code>.', '<code>__init__</code> s\'exécute quand l\'objet est créé : il range <code>L1</code>, <code>L2</code> et les angles <code>q</code> dans <code>self</code>.'],
      ['<code>self</code> is “this robot”: two objects <code>Arm2()</code> have their own angles.', '<code>self</code> veut dire « ce robot-ci » : deux objets <code>Arm2()</code> ont chacun leurs angles.'],
      ['<code>tool()</code> is a <strong>method</strong>: a function that uses the data of the object (the forward kinematics of lesson 4).', '<code>tool()</code> est une <strong>méthode</strong> : une fonction qui utilise les données de l\'objet (le modèle direct de la leçon 4).']
    ]),
    H4('8.2 A proportional controller', '8.2 Un correcteur proportionnel'),
    EQ('<i>e</i> = <i>q</i><sub>target</sub> − <i>q</i> &emsp; <i>ω</i> = <i>K</i><sub>p</sub> <i>e</i> &emsp; <i>q</i> ← <i>q</i> + <i>ω</i> Δ<i>t</i>', '<i>e</i> = <i>q</i><sub>consigne</sub> − <i>q</i> &emsp; <i>ω</i> = <i>K</i><sub>p</sub> <i>e</i> &emsp; <i>q</i> ← <i>q</i> + <i>ω</i> Δ<i>t</i>'),
    CODE('py-class.py'),
    OUT('py-class.out.txt'),
    FIGO(plot({ x: [0, 0.6], y: [0, 70], ticks: [6, 7], curves: [{ f: () => 60, c: C.g, dash: '6 5', label: ['target 60°', 'consigne 60°'] }, { f: (t) => 60 * (1 - Math.exp(-4 * t)), c: C.o, label: ['q₁ with Kp = 4 /s', 'q₁ avec Kp = 4 /s'] }], marks: pSteps.map(([t, q]) => [t, q, '', C.y]), xl: ['time (s)', 'temps (s)'], yl: ['q₁ (deg)', 'q₁ (deg)'] })),
    P('At each step the error is multiplied by 1 − <i>K</i><sub>p</sub>Δ<i>t</i> = 1 − 4 × 0.05 = 0.8: 60 → 48 → 38.4 → … The joint gets closer and closer without overshoot. A larger <i>K</i><sub>p</sub> is faster, but if <i>K</i><sub>p</sub>Δ<i>t</i> &gt; 2 the error changes sign and grows at every step: the loop is unstable.',
      'À chaque pas l\'erreur est multipliée par 1 − <i>K</i><sub>p</sub>Δ<i>t</i> = 1 − 4 × 0,05 = 0,8 : 60 → 48 → 38,4 → … La liaison s\'approche de plus en plus sans dépassement. Un <i>K</i><sub>p</sub> plus grand va plus vite, mais si <i>K</i><sub>p</sub>Δ<i>t</i> &gt; 2 l\'erreur change de signe et grandit à chaque pas : la boucle est instable.'),
    BOX('note', ['Where to go next', 'Pour aller plus loin'], P('The PID of the control course adds an integral term (no error left at the end) and a derivative term (less overshoot). In ROS 2 the same class becomes a node (ROS 2 course, lesson 3), and on a microcontroller the same loop becomes loop() (electronics course).', 'Le PID du cours de commande ajoute un terme intégral (plus d\'erreur à la fin) et un terme dérivé (moins de dépassement). Dans ROS 2 la même classe devient un nœud (cours ROS 2, leçon 3), et sur un microcontrôleur la même boucle devient loop() (cours d\'électronique).'))
  ],
  terms: [['class, object', 'classe, objet'], ['__init__, self', '__init__, self'], ['method', 'méthode'], ['proportional controller', 'correcteur proportionnel'], ['gain Kp, period Δt', 'gain Kp, période Δt']],
  quiz: [
    ['What is the error after the first step of the program?', 'Quelle est l\'erreur après le premier pas du programme ?', '48: q1 went from 0 to 12 and the target is 60.', '48 : q1 est passé de 0 à 12 et la consigne est 60.'],
    ['Why does q1 never quite reach 60 in 6 steps?', 'Pourquoi q1 n\'atteint-il pas tout à fait 60 en 6 pas ?', 'Because each step only removes 20 % of the remaining error; it gets closer and closer (exponentially).', 'Parce que chaque pas n\'enlève que 20 % de l\'erreur restante ; il s\'approche de plus en plus (exponentiellement).'],
    ['What happens with Kp = 50 and Δt = 0.05?', 'Que se passe-t-il avec Kp = 50 et Δt = 0,05 ?', 'Kp Δt = 2.5 > 2: the error is multiplied by −1.5 at each step, the joint oscillates more and more — unstable.', 'Kp Δt = 2,5 > 2 : l\'erreur est multipliée par −1,5 à chaque pas, la liaison oscille de plus en plus — instable.']
  ]
})
  ];
}
