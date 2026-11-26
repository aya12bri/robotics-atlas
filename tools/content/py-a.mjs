// Python for robotics — lessons 1 to 4: first program and types, maths and angles, conditions and loops, functions.
import { P, H4, UL, OL, EQ, BOX, TABLE, CODE, OUT, lesson } from '../lib.mjs';
import { arm2 } from '../practice/fig.mjs';
const PRE = 'py-';
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));
const FIGO = (o) => `<figure class="figure"><svg viewBox="${o.vb}" class="fig" role="img" aria-hidden="true">${o.svg}</svg></figure>`;

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Your first program: variables and types', 'Votre premier programme : variables et types'],
  time: 20,
  goal: ['why robots are programmed in Python, how to install it, how to run a program, and the four basic types of values: whole numbers, decimal numbers, texts and true/false.', 'pourquoi on programme les robots en Python, comment l\'installer, comment lancer un programme, et les quatre types de valeurs de base : nombres entiers, nombres décimaux, textes et vrai/faux.'],
  body: [
    ONE('A program is a list of instructions run from top to bottom; a variable is a name that holds a value.', 'Un programme est une liste d\'instructions exécutées de haut en bas ; une variable est un nom qui contient une valeur.'),
    H4('1.1 Why Python?', '1.1 Pourquoi Python ?'),
    P('Python is the most used language to <strong>prototype</strong> robots: it is easy to read, it has ready-made libraries for maths (NumPy), plots (Matplotlib), vision (OpenCV) and robots (ROS 2 speaks Python). The fast loops inside a motor drive are written in C or C++, but almost everything around them — tests, calculations, planning, data — is written in Python.',
      'Python est le langage le plus utilisé pour <strong>prototyper</strong> des robots : il se lit facilement, il a des bibliothèques toutes prêtes pour les maths (NumPy), les graphiques (Matplotlib), la vision (OpenCV) et les robots (ROS 2 parle Python). Les boucles rapides à l\'intérieur d\'un variateur sont écrites en C ou C++, mais presque tout ce qui est autour — tests, calculs, planification, données — s\'écrit en Python.'),
    H4('1.2 Install and run', '1.2 Installer et lancer'),
    OL([
      ['Install Python 3 from python.org (on Windows, tick “Add Python to PATH”). On Linux and macOS it is often already there.', 'Installez Python 3 depuis python.org (sous Windows, cochez « Add Python to PATH »). Sous Linux et macOS il est souvent déjà là.'],
      ['Install an editor: <strong>Thonny</strong> (made for beginners) or <strong>VS Code</strong> with the Python extension.', 'Installez un éditeur : <strong>Thonny</strong> (fait pour les débutants) ou <strong>VS Code</strong> avec l\'extension Python.'],
      ['Write the program below in a file <code>hello.py</code> and run it (the Run button, or <code>python hello.py</code> in a terminal).', 'Écrivez le programme ci-dessous dans un fichier <code>hello.py</code> et lancez-le (le bouton Exécuter, ou <code>python hello.py</code> dans un terminal).'],
      ['Later, add the libraries of this course with <code>pip install numpy matplotlib</code>.', 'Plus tard, ajoutez les bibliothèques de ce cours avec <code>pip install numpy matplotlib</code>.']
    ]),
    H4('1.3 Variables and types', '1.3 Variables et types'),
    CODE('py-hello.py'),
    P('What it prints:', 'Ce qu\'il affiche :'),
    OUT('py-hello.out.txt'),
    TABLE([['Type', 'Type'], ['Example', 'Exemple'], ['In a robot', 'Dans un robot']], [
      ['<code>int</code>', '<code>3</code>, <code>-90</code>', ['a number of joints, an encoder count', 'un nombre de liaisons, un compte de codeur']],
      ['<code>float</code>', '<code>0.45</code>, <code>-1.5e-3</code>', ['a length, an angle, a speed', 'une longueur, un angle, une vitesse']],
      ['<code>str</code>', '<code>"R2"</code>', ['a name, a message', 'un nom, un message']],
      ['<code>bool</code>', '<code>True</code>, <code>False</code>', ['powered or not, a limit switch pressed', 'sous tension ou non, une fin de course appuyée']]
    ]),
    BOX('warn', ['Three beginner traps', 'Trois pièges de débutant'], UL([
      ['Python counts the <strong>spaces</strong> at the start of a line: they say which lines belong together (lesson 3).', 'Python compte les <strong>espaces</strong> en début de ligne : ils disent quelles lignes vont ensemble (leçon 3).'],
      ['The decimal mark is a <strong>point</strong>: <code>0.45</code>, never <code>0,45</code> (a comma makes two values).', 'Le séparateur décimal est un <strong>point</strong> : <code>0.45</code>, jamais <code>0,45</code> (une virgule fait deux valeurs).'],
      ['<code>=</code> stores a value; <code>==</code> compares two values.', '<code>=</code> range une valeur ; <code>==</code> compare deux valeurs.']
    ]))
  ],
  terms: [['program', 'programme'], ['variable', 'variable'], ['int, float, str, bool', 'int, float, str, bool'], ['print', 'print'], ['editor', 'éditeur']],
  quiz: [
    ['What is the type of 0.45?', 'Quel est le type de 0.45 ?', 'float (a decimal number).', 'float (un nombre décimal).'],
    ['How do you write one and a half in Python?', 'Comment écrit-on un et demi en Python ?', '1.5 — with a point, not a comma.', '1.5 — avec un point, pas une virgule.'],
    ['What is the difference between = and ==?', 'Quelle différence entre = et == ?', '= stores a value in a variable, == compares two values and gives True or False.', '= range une valeur dans une variable, == compare deux valeurs et donne True ou False.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Computing with angles: the math module', 'Calculer avec des angles : le module math'],
  time: 20,
  goal: ['the operators, the math module, radians and degrees, and how to compute the end of a robot link with cos and sin, and an angle with atan2.', 'les opérateurs, le module math, radians et degrés, et comment calculer le bout d\'un segment de robot avec cos et sin, et un angle avec atan2.'],
  body: [
    ONE('The functions of math work in radians: convert with math.radians before cos and sin, and back with math.degrees.', 'Les fonctions de math travaillent en radians : convertissez avec math.radians avant cos et sin, et revenez avec math.degrees.'),
    H4('2.1 Operators', '2.1 Les opérateurs'),
    TABLE([['Operator', 'Opérateur'], ['Meaning', 'Sens'], ['Example', 'Exemple']], [
      ['<code>+ - * /</code>', ['the four operations', 'les quatre opérations'], '<code>7 / 2</code> → 3.5'],
      ['<code>//</code>', ['whole division', 'division entière'], '<code>7 // 2</code> → 3'],
      ['<code>%</code>', ['remainder', 'reste'], '<code>370 % 360</code> → 10'],
      ['<code>**</code>', ['power', 'puissance'], '<code>3 ** 2</code> → 9']
    ]),
    P('The remainder <code>%</code> is very useful for angles: <code>a % 360</code> brings any angle back between 0 and 360°.', 'Le reste <code>%</code> est très utile pour les angles : <code>a % 360</code> ramène n\'importe quel angle entre 0 et 360°.'),
    H4('2.2 The end of a link', '2.2 Le bout d\'un segment'),
    P('A link of length <i>L</i> turned by an angle <i>θ</i> ends at <i>x</i> = <i>L</i> cos <i>θ</i>, <i>y</i> = <i>L</i> sin <i>θ</i> (the maths course, lesson 1). In Python:', 'Un segment de longueur <i>L</i> tourné d\'un angle <i>θ</i> finit en <i>x</i> = <i>L</i> cos <i>θ</i>, <i>y</i> = <i>L</i> sin <i>θ</i> (cours de maths, leçon 1). En Python :'),
    CODE('py-math.py'),
    OUT('py-math.out.txt'),
    UL([
      ['<code>import math</code> loads the module once, at the top of the file.', '<code>import math</code> charge le module une fois, en haut du fichier.'],
      ['<code>f"x = {x:.3f}"</code> is an <strong>f-string</strong>: the value of x is written with 3 decimals.', '<code>f"x = {x:.3f}"</code> est une <strong>f-string</strong> : la valeur de x est écrite avec 3 décimales.'],
      ['<code>math.atan2(y, x)</code> gives the angle of a point in every quadrant; <code>math.atan(y / x)</code> gets it wrong when x is negative.', '<code>math.atan2(y, x)</code> donne l\'angle d\'un point dans tous les quadrants ; <code>math.atan(y / x)</code> se trompe quand x est négatif.']
    ]),
    BOX('warn', ['The most common bug in robot code', 'Le bug le plus fréquent du code robot'], P('Passing degrees to <code>math.cos</code>: <code>math.cos(90)</code> is −0.448, not 0, because 90 is read as 90 radians. Always convert: <code>math.cos(math.radians(90))</code> ≈ 0.', 'Donner des degrés à <code>math.cos</code> : <code>math.cos(90)</code> vaut −0,448, pas 0, car 90 est lu comme 90 radians. Convertissez toujours : <code>math.cos(math.radians(90))</code> ≈ 0.'))
  ],
  terms: [['operator', 'opérateur'], ['module, import', 'module, import'], ['radian', 'radian'], ['f-string', 'f-string'], ['atan2', 'atan2']],
  quiz: [
    ['What does 370 % 360 give?', 'Que donne 370 % 360 ?', '10: the remainder of the division, useful to bring an angle back between 0 and 360°.', '10 : le reste de la division, utile pour ramener un angle entre 0 et 360°.'],
    ['Why does math.cos(90) not give 0?', 'Pourquoi math.cos(90) ne donne-t-il pas 0 ?', 'Because math works in radians: 90 is read as 90 rad. Use math.cos(math.radians(90)).', 'Parce que math travaille en radians : 90 est lu comme 90 rad. Utilisez math.cos(math.radians(90)).'],
    ['Which function gives the angle of the point (−1, 1) correctly?', 'Quelle fonction donne correctement l\'angle du point (−1, 1) ?', 'math.atan2(1, −1) → 135°.', 'math.atan2(1, −1) → 135°.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Deciding and repeating: conditions and loops', 'Décider et répéter : conditions et boucles'],
  time: 25,
  goal: ['if, elif and else to take a decision (a joint at its limit), for and while to repeat (a list of points, a control loop), and why indentation matters.', 'if, elif et else pour prendre une décision (une liaison en butée), for et while pour répéter (une liste de points, une boucle de commande), et pourquoi l\'indentation compte.'],
  body: [
    ONE('if chooses which lines run; for repeats over a list; while repeats as long as a condition is true — and the indented lines are the ones inside.', 'if choisit quelles lignes s\'exécutent ; for répète sur une liste ; while répète tant qu\'une condition est vraie — et les lignes indentées sont celles à l\'intérieur.'),
    H4('3.1 A joint and its limits', '3.1 Une liaison et ses butées'),
    CODE('py-loops.py'),
    OUT('py-loops.out.txt'),
    TABLE([['Keyword', 'Mot-clé'], ['What it does', 'Ce qu\'il fait'], ['In a robot', 'Dans un robot']], [
      ['<code>if / elif / else</code>', ['runs the first block whose condition is true', 'exécute le premier bloc dont la condition est vraie'], ['refuse an angle outside the limits, react to a sensor', 'refuser un angle hors butées, réagir à un capteur']],
      ['<code>for x in …</code>', ['repeats once for each element', 'répète une fois pour chaque élément'], ['visit every waypoint, every joint', 'parcourir chaque point de passage, chaque liaison']],
      ['<code>while condition:</code>', ['repeats as long as the condition is true', 'répète tant que la condition est vraie'], ['the control loop: read, compute, command', 'la boucle de commande : lire, calculer, commander']],
      ['<code>break</code>', ['leaves the loop at once', 'sort de la boucle tout de suite'], ['stop when the emergency button is pressed', 'arrêter quand on appuie sur l\'arrêt d\'urgence']]
    ]),
    H4('3.2 The loop of every robot', '3.2 La boucle de tout robot'),
    P('Every robot runs the same loop, many times per second: <strong>read</strong> the sensors, <strong>compute</strong> what to do, <strong>command</strong> the motors, wait for the next period. In Python it is a <code>while</code> loop; on a microcontroller it is the <code>loop()</code> function of the electronics course.',
      'Tout robot tourne la même boucle, de nombreuses fois par seconde : <strong>lire</strong> les capteurs, <strong>calculer</strong> quoi faire, <strong>commander</strong> les moteurs, attendre la période suivante. En Python c\'est une boucle <code>while</code> ; sur un microcontrôleur c\'est la fonction <code>loop()</code> du cours d\'électronique.'),
    BOX('warn', ['Indentation', 'L\'indentation'], P('Use 4 spaces for each level. A line that is not indented any more is <em>after</em> the block, not inside it. A missing or extra space gives an <code>IndentationError</code> or, worse, a program that does something else.', 'Utilisez 4 espaces par niveau. Une ligne qui n\'est plus indentée est <em>après</em> le bloc, pas dedans. Un espace en trop ou en moins donne une <code>IndentationError</code> ou, pire, un programme qui fait autre chose.'))
  ],
  terms: [['condition', 'condition'], ['if / elif / else', 'if / elif / else'], ['for, while', 'for, while'], ['indentation', 'indentation'], ['control loop', 'boucle de commande']],
  quiz: [
    ['How many times does “for a in [-120, 0, 45, 100]” run?', 'Combien de fois « for a in [-120, 0, 45, 100] » s\'exécute-t-il ?', '4 times, once for each element of the list.', '4 fois, une fois par élément de la liste.'],
    ['In the program, why does the while loop stop at 60?', 'Dans le programme, pourquoi la boucle while s\'arrête-t-elle à 60 ?', 'Because the condition angle < 60 becomes false once angle reaches 60.', 'Parce que la condition angle < 60 devient fausse quand angle atteint 60.'],
    ['What are the three steps of the loop of every robot?', 'Quelles sont les trois étapes de la boucle de tout robot ?', 'Read the sensors, compute, command the motors (then wait for the next period).', 'Lire les capteurs, calculer, commander les moteurs (puis attendre la période suivante).']
  ]
}),
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Functions: the forward kinematics of an arm', 'Les fonctions : le modèle direct d\'un bras'],
  time: 25,
  goal: ['how to write a function with def, give it parameters and default values, return several results, and turn the forward kinematics of a 2-link arm into one reusable line.', 'comment écrire une fonction avec def, lui donner des paramètres et des valeurs par défaut, renvoyer plusieurs résultats, et faire du modèle direct d\'un bras à 2 segments une ligne réutilisable.'],
  body: [
    ONE('A function packs a calculation under a name: you write it once, test it once, and call it everywhere.', 'Une fonction range un calcul sous un nom : on l\'écrit une fois, on la teste une fois, et on l\'appelle partout.'),
    H4('4.1 The forward kinematics as a function', '4.1 Le modèle direct en fonction'),
    FIGO(arm2(0.5, 0.4, 30, 45, { w: 520, h: 300, scale: 230, ox: 90, oy: 270 })),
    EQ('<i>x</i> = <i>L</i><sub>1</sub> cos <i>θ</i><sub>1</sub> + <i>L</i><sub>2</sub> cos(<i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>) &emsp; <i>y</i> = <i>L</i><sub>1</sub> sin <i>θ</i><sub>1</sub> + <i>L</i><sub>2</sub> sin(<i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>)'),
    CODE('py-func.py'),
    OUT('py-func.out.txt'),
    UL([
      ['<code>def fk(theta1, theta2, L1=0.5, L2=0.4):</code> — two required parameters and two with a <strong>default value</strong>.', '<code>def fk(theta1, theta2, L1=0.5, L2=0.4):</code> — deux paramètres obligatoires et deux avec une <strong>valeur par défaut</strong>.'],
      ['The text between triple quotes is the <strong>docstring</strong>: it says what goes in and what comes out, with the units.', 'Le texte entre triples guillemets est la <strong>docstring</strong> : elle dit ce qui entre et ce qui sort, avec les unités.'],
      ['<code>return x, y</code> returns two values; <code>x, y = fk(30, 45)</code> takes them apart.', '<code>return x, y</code> renvoie deux valeurs ; <code>x, y = fk(30, 45)</code> les sépare.']
    ]),
    BOX('method', ['Always test a function with a pose you know', 'Testez toujours une fonction avec une pose connue'], P('With all the angles at 0 the arm is stretched along x: <code>fk(0, 0)</code> must give (0.9, 0). With θ₁ = 90°, θ₂ = 0 it points up: (0, 0.9). Two lines of test catch most mistakes (degrees forgotten, sin and cos swapped).', 'Avec tous les angles à 0 le bras est tendu selon x : <code>fk(0, 0)</code> doit donner (0,9 ; 0). Avec θ₁ = 90°, θ₂ = 0 il pointe vers le haut : (0 ; 0,9). Deux lignes de test attrapent la plupart des erreurs (degrés oubliés, sin et cos inversés).'))
  ],
  terms: [['function, def', 'fonction, def'], ['parameter, default value', 'paramètre, valeur par défaut'], ['return', 'return'], ['docstring', 'docstring'], ['forward kinematics', 'modèle direct']],
  quiz: [
    ['What does fk(0, 0) return with L1 = 0.5 and L2 = 0.4?', 'Que renvoie fk(0, 0) avec L1 = 0,5 et L2 = 0,4 ?', '(0.9, 0.0): the arm is stretched along x.', '(0,9 ; 0,0) : le bras est tendu selon x.'],
    ['How do you call fk with an arm of L1 = 1 and L2 = 1?', 'Comment appeler fk avec un bras de L1 = 1 et L2 = 1 ?', 'fk(30, 45, L1=1, L2=1) — the default values are replaced.', 'fk(30, 45, L1=1, L2=1) — les valeurs par défaut sont remplacées.'],
    ['Why write a docstring?', 'Pourquoi écrire une docstring ?', 'To say what goes in and what comes out, with the units (degrees, metres): the reader and you in six months need it.', 'Pour dire ce qui entre et ce qui sort, avec les unités (degrés, mètres) : le lecteur, et vous dans six mois, en avez besoin.']
  ]
})
  ];
}
