// Course: Code a robot arm in Python — lessons 1 to 3.
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, CODE, OUT, lesson } from '../lib.mjs';
const PRE = 'lab-';

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Your workbench and a first arm in code', 'Votre établi et un premier bras en code'],
  time: 15,
  goal: ['to set up Python and NumPy, and to write the forward kinematics of a 2-axis arm as a function you can test.', 'à installer Python et NumPy, et à écrire le modèle direct d\'un bras à 2 axes sous forme d\'une fonction que l\'on peut tester.'],
  body: [
    H4('1.1 Why code it yourself', '1.1 Pourquoi le coder soi-même'),
    P('The other courses explained the formulas. Here you <strong>make them run</strong>. Writing the code forces you to understand every sign and every angle, and the computer tells you at once if you are wrong. At the end of this course you will have a small library that moves a real arm.',
      'Les autres cours ont expliqué les formules. Ici, vous les <strong>faites tourner</strong>. Écrire le code oblige à comprendre chaque signe et chaque angle, et l\'ordinateur vous dit tout de suite si vous vous trompez. À la fin de ce cours, vous aurez une petite bibliothèque qui fait bouger un vrai bras.'),
    H4('1.2 Install', '1.2 Installer'),
    UL([
      ['<strong>Python 3</strong> (python.org, or already on Linux and macOS) and the library <strong>NumPy</strong>: <code>pip install numpy</code>. Optional: <code>matplotlib</code> to draw the arm.', '<strong>Python 3</strong> (python.org, ou déjà présent sous Linux et macOS) et la bibliothèque <strong>NumPy</strong> : <code>pip install numpy</code>. Facultatif : <code>matplotlib</code> pour dessiner le bras.'],
      ['An editor: VS Code, Thonny (very simple for beginners) or any other. Or nothing to install: a Jupyter notebook online such as Google Colab.', 'Un éditeur : VS Code, Thonny (très simple pour débuter) ou un autre. Ou rien à installer : un carnet Jupyter en ligne comme Google Colab.'],
      ['Put every file of this course in the same folder: the later lessons import the earlier ones.', 'Mettez tous les fichiers de ce cours dans le même dossier : les leçons suivantes importent les précédentes.']
    ]),
    H4('1.3 Three NumPy habits', '1.3 Trois habitudes NumPy'),
    TABLE([['To…', 'Pour…'], ['Write', 'Écrire'], ['Remember', 'À retenir']], [
      [['make a vector', 'faire un vecteur'], '<code>np.array([0.5, 0.2])</code>', ['vectors add and scale element by element', 'les vecteurs s\'additionnent et se multiplient élément par élément']],
      [['convert angles', 'convertir des angles'], '<code>np.radians(30)</code>, <code>np.degrees(q)</code>', ['NumPy works in radians, like all formulas', 'NumPy travaille en radians, comme toutes les formules']],
      [['multiply matrices', 'multiplier des matrices'], '<code>A @ B</code>', ['<code>A * B</code> multiplies element by element: not a matrix product', '<code>A * B</code> multiplie élément par élément : ce n\'est pas un produit matriciel']]
    ]),
    H4('1.4 Forward kinematics of the 2-axis arm', '1.4 Le modèle direct du bras à 2 axes'),
    P('File <code>arm_fk2.py</code>. The formulas are those of the maths course: the tool is the sum of the arrows of the two links.', 'Fichier <code>arm_fk2.py</code>. Les formules sont celles du cours de maths : l\'outil est la somme des flèches des deux segments.'),
    CODE('arm_fk2.py'),
    P('Run it (<code>python arm_fk2.py</code>). Output:', 'Lancez-le (<code>python arm_fk2.py</code>). Sortie :'),
    OUT('arm_fk2.out.txt'),
    BOX('keep', ['Always test with poses you can check by eye', 'Testez toujours avec des poses vérifiables à l\'œil'],
      UL([
        ['(0°, 0°): the arm is stretched along x, the tool must be at <i>L</i><sub>1</sub> + <i>L</i><sub>2</sub> = 0.9 m.', '(0°, 0°) : le bras est tendu selon x, l\'outil doit être en <i>L</i><sub>1</sub> + <i>L</i><sub>2</sub> = 0,9 m.'],
        ['(90°, −90°): link 1 points up, link 2 points right: tool at (0.4, 0.5).', '(90°, −90°) : le segment 1 pointe vers le haut, le segment 2 vers la droite : outil en (0,4 ; 0,5).'],
        ['(30°, 45°): the value computed by hand in the maths course, (0.537, 0.636).', '(30°, 45°) : la valeur calculée à la main dans le cours de maths, (0,537 ; 0,636).']
      ])),
    P('If one of these is wrong, the bug is in the code, not in the robot. This habit of “known poses” will save you hours on a real arm.', 'Si l\'une d\'elles est fausse, le bug est dans le code, pas dans le robot. Cette habitude des « poses connues » vous fera gagner des heures sur un vrai bras.')
  ],
  terms: [['NumPy', 'NumPy'], ['function', 'fonction'], ['radians', 'radians'], ['matrix product @', 'produit matriciel @'], ['test pose', 'pose de test']],
  quiz: [
    ['In NumPy, which operator multiplies two matrices?', 'En NumPy, quel opérateur multiplie deux matrices ?', '@ (A @ B). The * operator multiplies element by element.', '@ (A @ B). L\'opérateur * multiplie élément par élément.'],
    ['Why test the pose (0°, 0°) first?', 'Pourquoi tester d\'abord la pose (0°, 0°) ?', 'The answer is obvious (the arm is stretched, reach L1 + L2): any other result shows a bug at once.', 'La réponse est évidente (le bras est tendu, portée L1 + L2) : tout autre résultat montre tout de suite un bug.'],
    ['Does np.cos(90) give 0?', 'np.cos(90) donne-t-il 0 ?', 'No: 90 is read as radians. Write np.cos(np.radians(90)).', 'Non : 90 est lu en radians. Écrivez np.cos(np.radians(90)).']
  ],
  link: ['learn-mathkit.html#l1', 'Review trigonometry and vectors →', 'Revoir la trigonométrie et les vecteurs →']
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Any robot from its DH table', 'N\'importe quel robot à partir de son tableau DH'],
  time: 16,
  goal: ['to write one function that computes the pose of the tool of any serial arm from its DH table, in both conventions, and to check that they agree.', 'à écrire une seule fonction qui calcule la pose de l\'outil de n\'importe quel bras série à partir de son tableau DH, dans les deux conventions, et à vérifier qu\'elles sont d\'accord.'],
  body: [
    P('Drawing and adding arrows works for 2 joints, not for 6. The DH table (maths course, lessons 6 to 8) turns every robot into a list of rows; the code only needs the matrix of one row and a loop that multiplies them.',
      'Dessiner et additionner des flèches marche pour 2 liaisons, pas pour 6. Le tableau DH (cours de maths, leçons 6 à 8) transforme chaque robot en une liste de lignes ; le code n\'a besoin que de la matrice d\'une ligne et d\'une boucle qui les multiplie.'),
    CODE('arm_dh.py'),
    OUT('arm_dh.out.txt'),
    H4('2.1 Read the code', '2.1 Lire le code'),
    UL([
      ['<code>dh_std</code> and <code>dh_mod</code> are the two matrices of the maths course, written cell by cell. The order of their arguments follows the order of the columns of each table.', '<code>dh_std</code> et <code>dh_mod</code> sont les deux matrices du cours de maths, écrites case par case. L\'ordre de leurs arguments suit l\'ordre des colonnes de chaque tableau.'],
      ['<code>fk</code> starts from the identity and multiplies the rows from the base to the tool: <i>T</i> = <i>T</i><sub>1</sub> <i>T</i><sub>2</sub> … <i>T</i><sub>n</sub>.', '<code>fk</code> part de l\'identité et multiplie les lignes de la base vers l\'outil : <i>T</i> = <i>T</i><sub>1</sub> <i>T</i><sub>2</sub> … <i>T</i><sub>n</sub>.'],
      ['The last column of <i>T</i> (<code>T[:3, 3]</code>) is the position of the tool; the top-left 3×3 block is its orientation.', 'La dernière colonne de <i>T</i> (<code>T[:3, 3]</code>) est la position de l\'outil ; le bloc 3×3 en haut à gauche est son orientation.'],
      ['The robot is only data: to study another robot, change the table, not the code.', 'Le robot n\'est que des données : pour étudier un autre robot, on change le tableau, pas le code.']
    ]),
    BOX('example', ['What the output proves', 'Ce que prouve la sortie'],
      P('The standard and the modified tables of the same arm give the same tool position (0.479, 0.223, 0.757) — the value found by hand in the maths course — and <code>np.allclose</code> confirms that even the orientation is identical. The zero pose gives (0.83, 0, 0.40): the arm stretched along x at the height of the shoulder.',
        'Les tableaux standard et modifié du même bras donnent la même position d\'outil (0,479 ; 0,223 ; 0,757) — la valeur trouvée à la main dans le cours de maths — et <code>np.allclose</code> confirme que même l\'orientation est identique. La pose zéro donne (0,83 ; 0 ; 0,40) : le bras tendu selon x à la hauteur de l\'épaule.')),
    BOX('warn', ['The two classic bugs', 'Les deux bugs classiques'],
      UL([
        ['Feeding a standard table to the modified matrix (or the reverse): no error, just a wrong robot. Keep the convention in the name of the function.', 'Donner un tableau standard à la matrice modifiée (ou l\'inverse) : aucune erreur, juste un robot faux. Gardez la convention dans le nom de la fonction.'],
        ['Degrees instead of radians in α: write <code>np.pi / 2</code> or <code>np.radians(90)</code>, never <code>90</code>.', 'Des degrés au lieu de radians dans α : écrivez <code>np.pi / 2</code> ou <code>np.radians(90)</code>, jamais <code>90</code>.']
      ]))
  ],
  terms: [['DH table', 'tableau DH'], ['homogeneous matrix', 'matrice homogène'], ['loop', 'boucle'], ['np.allclose', 'np.allclose']],
  quiz: [
    ['Where do you read the position of the tool in the 4×4 matrix T?', 'Où lit-on la position de l\'outil dans la matrice 4×4 T ?', 'In the last column, first three rows: T[:3, 3].', 'Dans la dernière colonne, trois premières lignes : T[:3, 3].'],
    ['To study a SCARA instead of the 3-axis arm, what do you change?', 'Pour étudier un SCARA au lieu du bras à 3 axes, que changez-vous ?', 'Only the DH table (the data); the functions stay the same.', 'Seulement le tableau DH (les données) ; les fonctions restent les mêmes.'],
    ['Why does the modified table have one more row?', 'Pourquoi le tableau modifié a-t-il une ligne de plus ?', 'Its last frame sits on the last joint; a fixed row (θ = 0) brings it to the tool.', 'Son dernier repère est sur la dernière liaison ; une ligne fixe (θ = 0) l\'amène jusqu\'à l\'outil.']
  ],
  link: ['learn-mathkit.html#l8', 'Review DH and DHM side by side →', 'Revoir DH et DHM côte à côte →']
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Inverse kinematics in closed form', 'Le modèle inverse en formule fermée'],
  time: 16,
  goal: ['to code the exact inverse kinematics of the 2-axis arm with its two elbow solutions, to detect unreachable points, and to test it with the round trip FK(IK(x)) = x.', 'à coder le modèle inverse exact du bras à 2 axes avec ses deux solutions de coude, à détecter les points inaccessibles, et à le tester avec l\'aller-retour MGD(MGI(x)) = x.'],
  body: [
    H4('3.1 The formulas', '3.1 Les formules'),
    P('The distance from the base to the target fixes the angle of the elbow (law of cosines); then the direction of the target fixes the shoulder:', 'La distance de la base à la cible fixe l\'angle du coude (loi des cosinus) ; puis la direction de la cible fixe l\'épaule :'),
    EQ('cos <i>θ</i><sub>2</sub> = (<i>x</i>² + <i>y</i>² − <i>L</i><sub>1</sub>² − <i>L</i><sub>2</sub>²) / (2 <i>L</i><sub>1</sub> <i>L</i><sub>2</sub>) &emsp;&emsp; <i>θ</i><sub>1</sub> = atan2(<i>y</i>, <i>x</i>) − atan2(<i>L</i><sub>2</sub> sin <i>θ</i><sub>2</sub>, <i>L</i><sub>1</sub> + <i>L</i><sub>2</sub> cos <i>θ</i><sub>2</sub>)'),
    UL([
      ['If |cos <i>θ</i><sub>2</sub>| > 1 the point is <strong>out of reach</strong>: return “no solution” instead of crashing.', 'Si |cos <i>θ</i><sub>2</sub>| > 1, le point est <strong>hors d\'atteinte</strong> : renvoyer « pas de solution » au lieu de planter.'],
      ['sin <i>θ</i><sub>2</sub> = ±√(1 − cos² <i>θ</i><sub>2</sub>): the two signs are the <strong>two elbows</strong> (up and down).', 'sin <i>θ</i><sub>2</sub> = ±√(1 − cos² <i>θ</i><sub>2</sub>) : les deux signes sont les <strong>deux coudes</strong> (haut et bas).'],
      ['Use <strong>atan2</strong>, never arccos alone or arctan of a ratio: they lose the quadrant.', 'Utilisez <strong>atan2</strong>, jamais arccos seul ni arctan d\'un rapport : ils perdent le quadrant.']
    ]),
    CODE('arm_ik2.py'),
    OUT('arm_ik2.out.txt'),
    H4('3.2 The round trip test', '3.2 Le test de l\'aller-retour'),
    P('The best test of an inverse model needs no answer key: <strong>compute the forward kinematics of the solution</strong> and compare with the target. Here both elbows give back (0.537, 0.636) exactly, and the elbow-down solution (29.96°, 45°) is, with rounding, the pose (30°, 45°) of lesson 1. The point at 1.0 m is correctly refused: the reach is 0.9 m.',
      'Le meilleur test d\'un modèle inverse n\'a pas besoin de corrigé : <strong>calculez le modèle direct de la solution</strong> et comparez à la cible. Ici, les deux coudes redonnent exactement (0,537 ; 0,636), et la solution coude en bas (29,96° ; 45°) est, aux arrondis près, la pose (30° ; 45°) de la leçon 1. Le point à 1,0 m est correctement refusé : la portée est de 0,9 m.'),
    BOX('keep', ['Which elbow to choose?', 'Quel coude choisir ?'],
      P('A real controller keeps the solution <strong>closest to the current pose</strong> (smallest joint motion), and checks the joint limits and the obstacles. Switching elbow in the middle of a motion makes the arm flip: never do it while moving.',
        'Un vrai contrôleur garde la solution <strong>la plus proche de la pose actuelle</strong> (le plus petit mouvement des liaisons), et vérifie les butées et les obstacles. Changer de coude au milieu d\'un mouvement fait basculer le bras : ne le faites jamais en marche.'))
  ],
  terms: [['inverse kinematics', 'modèle inverse (MGI)'], ['closed form', 'formule fermée'], ['law of cosines', 'loi des cosinus'], ['elbow up / down', 'coude haut / bas'], ['round trip test', 'test de l\'aller-retour']],
  quiz: [
    ['What does |cos θ₂| > 1 mean?', 'Que veut dire |cos θ₂| > 1 ?', 'The target is out of reach (too far or too close): there is no solution.', 'La cible est hors d\'atteinte (trop loin ou trop près) : il n\'y a pas de solution.'],
    ['How do you test an inverse model without knowing the right angles?', 'Comment tester un modèle inverse sans connaître les bons angles ?', 'Apply the forward model to the solution and check that it gives back the target.', 'Appliquer le modèle direct à la solution et vérifier qu\'il redonne la cible.'],
    ['Where do the two solutions of the 2-axis arm come from?', 'D\'où viennent les deux solutions du bras à 2 axes ?', 'From the sign of sin θ₂ = ±√(1 − cos² θ₂): elbow up or elbow down.', 'Du signe de sin θ₂ = ±√(1 − cos² θ₂) : coude en haut ou coude en bas.']
  ]
})
  ];
}
