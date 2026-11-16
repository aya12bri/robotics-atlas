// Advanced robotics (Master level), lessons 1 to 3: parallel robots, LQR, MPC.
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, CODE, OUT, lesson } from '../lib.mjs';
const PRE = 'adv-';
const SP = ' &emsp;&emsp; ';

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Parallel robots: the Delta and the Stewart platform', 'Les robots parallèles : le Delta et la plateforme de Stewart'],
  time: 20,
  goal: ['why closed chains change everything, how to compute the inverse kinematics of a Delta and of a Stewart platform, why their forward kinematics is hard, and their two kinds of singularities.', 'pourquoi les chaînes fermées changent tout, comment calculer le modèle inverse d\'un Delta et d\'une plateforme de Stewart, pourquoi leur modèle direct est difficile, et leurs deux sortes de singularités.'],
  body: [
    H4('1.1 Serial and parallel: the world turned upside down', '1.1 Série et parallèle : le monde à l\'envers'),
    P('In a <strong>serial</strong> robot the links form one chain from the base to the tool. In a <strong>parallel</strong> robot the tool (the moving platform) is held by <strong>several chains at once</strong>, each with its own motor near the base. The motors do not carry each other: the moving parts are light, so the robot is very fast (Delta: up to 300 picks per minute) and very stiff (Stewart: flight simulators, machine tools).',
      'Dans un robot <strong>série</strong>, les segments forment une seule chaîne de la base à l\'outil. Dans un robot <strong>parallèle</strong>, l\'outil (la plateforme mobile) est tenu par <strong>plusieurs chaînes à la fois</strong>, chacune avec son moteur près de la base. Les moteurs ne se portent pas les uns les autres : les pièces mobiles sont légères, le robot est donc très rapide (Delta : jusqu\'à 300 prises par minute) et très rigide (Stewart : simulateurs de vol, machines-outils).'),
    TABLE(['', ['Serial robot', 'Robot série'], ['Parallel robot', 'Robot parallèle']], [
      [['Forward kinematics', 'Modèle direct'], ['<strong>easy</strong>: multiply the matrices', '<strong>facile</strong> : multiplier les matrices'], ['<strong>hard</strong>: a system of equations with several solutions', '<strong>difficile</strong> : un système d\'équations à plusieurs solutions']],
      [['Inverse kinematics', 'Modèle inverse'], ['<strong>hard</strong>: several solutions, often numerical', '<strong>difficile</strong> : plusieurs solutions, souvent numérique'], ['<strong>easy</strong>: one independent formula per chain', '<strong>facile</strong> : une formule indépendante par chaîne']],
      [['Workspace', 'Espace de travail'], ['large', 'grand'], ['small (the intersection of the chains)', 'petit (l\'intersection des chaînes)']],
      [['Stiffness, speed', 'Rigidité, vitesse'], ['errors add along the chain', 'les erreurs s\'additionnent le long de la chaîne'], ['the chains share the load: stiff and fast', 'les chaînes se partagent la charge : rigide et rapide']]
    ]),
    H4('1.2 The Delta robot: inverse kinematics, arm by arm', '1.2 Le robot Delta : modèle inverse, bras par bras'),
    P('Three motors on the base, at 120° from each other, at a radius <i>R</i>. Each turns an upper arm of length <i>L</i>; a parallelogram of length <i>l</i> links its end to the platform, at a radius <i>r</i> from its centre. The parallelograms keep the platform horizontal: it only translates (3 DOF: <i>x</i>, <i>y</i>, <i>z</i>).',
      'Trois moteurs sur la base, à 120° les uns des autres, au rayon <i>R</i>. Chacun fait tourner un bras de longueur <i>L</i> ; un parallélogramme de longueur <i>l</i> relie son bout à la plateforme, au rayon <i>r</i> de son centre. Les parallélogrammes gardent la plateforme horizontale : elle ne fait que se translater (3 ddl : <i>x</i>, <i>y</i>, <i>z</i>).'),
    P('The key fact: <strong>each arm only sees the point where its forearm meets the platform</strong>. Given the platform position, this point is known, and the motor angle <i>θ</i> must place the elbow at distance <i>l</i> from it. In the plane of the arm (<i>x</i> along the arm, <i>z</i> up), with (<i>x</i><sub>q</sub>, <i>y</i><sub>q</sub>, <i>z</i><sub>q</sub>) the wrist joint seen from the motor axis:',
      'Le fait clé : <strong>chaque bras ne voit que le point où son avant-bras rejoint la plateforme</strong>. La position de la plateforme étant donnée, ce point est connu, et l\'angle moteur <i>θ</i> doit placer le coude à la distance <i>l</i> de lui. Dans le plan du bras (<i>x</i> le long du bras, <i>z</i> vers le haut), avec (<i>x</i><sub>q</sub>, <i>y</i><sub>q</sub>, <i>z</i><sub>q</sub>) l\'articulation du poignet vue depuis l\'axe du moteur :'),
    EQ(`<i>k</i> = (<i>x</i><sub>q</sub>² + <i>y</i><sub>q</sub>² + <i>z</i><sub>q</sub>² + <i>L</i>² − <i>l</i>²) / (2<i>L</i>)${SP}<i>ρ</i> = √(<i>x</i><sub>q</sub>² + <i>z</i><sub>q</sub>²)${SP}<i>θ</i> = −atan2(<i>z</i><sub>q</sub>, <i>x</i><sub>q</sub>) − arccos(<i>k</i> / <i>ρ</i>)`),
    P('It comes from writing |elbow − wrist|² = <i>l</i>² and grouping the terms in cos <i>θ</i> and sin <i>θ</i>. If |<i>k</i>| > <i>ρ</i>, the point is out of reach. The second sign of arccos gives the elbow pointing inwards, which is never used.',
      'Elle vient de l\'écriture |coude − poignet|² = <i>l</i>² en regroupant les termes en cos <i>θ</i> et sin <i>θ</i>. Si |<i>k</i>| > <i>ρ</i>, le point est hors d\'atteinte. L\'autre signe de l\'arccos donne le coude tourné vers l\'intérieur, qu\'on n\'utilise jamais.'),
    CODE('delta_ik.py'),
    OUT('delta_ik.out.txt'),
    BOX('example', ['Read the output', 'Lire la sortie'],
      P('With <i>R</i> = 0.2 m, <i>r</i> = 0.05 m, <i>L</i> = 0.3 m, <i>l</i> = 0.6 m and the platform centred at 0.6 m below the base, the three motors are at <strong>31.7°</strong>: by symmetry they must be equal. Moving the platform 10 cm towards arm 1 lifts arm 1 (19.6°) and lowers the two others (39.7°). Every forearm is exactly 0.6 m: the solution respects all the constraints.',
        'Avec <i>R</i> = 0,2 m, <i>r</i> = 0,05 m, <i>L</i> = 0,3 m, <i>l</i> = 0,6 m et la plateforme centrée à 0,6 m sous la base, les trois moteurs sont à <strong>31,7°</strong> : par symétrie ils doivent être égaux. Déplacer la plateforme de 10 cm vers le bras 1 relève le bras 1 (19,6°) et abaisse les deux autres (39,7°). Chaque avant-bras mesure exactement 0,6 m : la solution respecte toutes les contraintes.')),
    H4('1.3 The Stewart platform: six legs, six lengths', '1.3 La plateforme de Stewart : six jambes, six longueurs'),
    P('Six linear actuators (legs) link the base to a platform that can move in all 6 directions. Its inverse kinematics is the simplest of all robots: for a wanted pose (position <strong>p</strong>, rotation <i>R</i>) of the platform, leg <i>i</i> joins the base point <strong>a</strong><sub>i</sub> to the platform point <strong>b</strong><sub>i</sub>, so its length is:',
      'Six actionneurs linéaires (jambes) relient la base à une plateforme qui peut bouger dans les 6 directions. Son modèle inverse est le plus simple de tous les robots : pour une pose voulue (position <strong>p</strong>, rotation <i>R</i>) de la plateforme, la jambe <i>i</i> relie le point de base <strong>a</strong><sub>i</sub> au point de plateforme <strong>b</strong><sub>i</sub>, sa longueur vaut donc :'),
    EQ('<i>ℓ</i><sub>i</sub> = ‖ <strong>p</strong> + <i>R</i> <strong>b</strong><sub>i</sub> − <strong>a</strong><sub>i</sub> ‖'),
    P('Example: <strong>a</strong> = (0.5, 0, 0), <strong>b</strong> = (0.3, 0, 0), platform at <strong>p</strong> = (0, 0, 0.8) without rotation: <i>ℓ</i> = ‖(−0.2, 0, 0.8)‖ = <strong>0.825 m</strong>. Six such lines, and the controller knows the length to give each leg. The forward problem (six lengths → the pose) can have up to 40 solutions and is solved numerically, starting from the last known pose.',
      'Exemple : <strong>a</strong> = (0,5 ; 0 ; 0), <strong>b</strong> = (0,3 ; 0 ; 0), plateforme en <strong>p</strong> = (0 ; 0 ; 0,8) sans rotation : <i>ℓ</i> = ‖(−0,2 ; 0 ; 0,8)‖ = <strong>0,825 m</strong>. Six lignes comme celle-là, et le contrôleur connaît la longueur à donner à chaque jambe. Le problème direct (six longueurs → la pose) peut avoir jusqu\'à 40 solutions et se résout numériquement, en partant de la dernière pose connue.'),
    H4('1.4 Two kinds of singularities', '1.4 Deux sortes de singularités'),
    TABLE([['Kind', 'Sorte'], ['What happens', 'Ce qui se passe'], ['Example', 'Exemple']], [
      [['<strong>Serial</strong> (type 1)', '<strong>Série</strong> (type 1)'], ['a chain is stretched or folded: the platform <strong>loses</strong> a direction of motion, as in a serial arm', 'une chaîne est tendue ou repliée : la plateforme <strong>perd</strong> une direction de mouvement, comme un bras série'], ['the edge of the workspace', 'le bord de l\'espace de travail']],
      [['<strong>Parallel</strong> (type 2)', '<strong>Parallèle</strong> (type 2)'], ['the platform <strong>gains</strong> a free motion even with the motors locked: it can no longer resist a force in that direction', 'la plateforme <strong>gagne</strong> un mouvement libre même moteurs bloqués : elle ne peut plus résister à une force dans cette direction'], ['legs of a Stewart platform all lying in one plane', 'jambes d\'une plateforme de Stewart toutes dans un même plan']]
    ]),
    BOX('warn', ['Type 2 is dangerous', 'Le type 2 est dangereux'],
      P('Near a parallel singularity the motor torques needed to hold a small load become huge, and the robot can collapse or break. Designers choose the dimensions so that these poses lie outside the useful workspace, and the controller checks the distance to them.',
        'Près d\'une singularité parallèle, les couples moteurs nécessaires pour tenir une petite charge deviennent énormes, et le robot peut s\'effondrer ou casser. Les concepteurs choisissent les dimensions pour que ces poses soient hors de l\'espace utile, et le contrôleur vérifie la distance à ces poses.'))
  ],
  terms: [['parallel robot', 'robot parallèle'], ['closed chain', 'chaîne fermée'], ['Delta robot', 'robot Delta'], ['Stewart platform', 'plateforme de Stewart'], ['parallel singularity', 'singularité parallèle']],
  quiz: [
    ['For a parallel robot, which model is easy: forward or inverse?', 'Pour un robot parallèle, quel modèle est facile : direct ou inverse ?', 'The inverse model: one independent formula per chain. The forward model is a hard system with several solutions.', 'Le modèle inverse : une formule indépendante par chaîne. Le modèle direct est un système difficile à plusieurs solutions.'],
    ['Why can a Delta robot be so fast?', 'Pourquoi un robot Delta peut-il être si rapide ?', 'The motors are fixed on the base; only light arms and a light platform move.', 'Les moteurs sont fixés sur la base ; seuls des bras légers et une plateforme légère bougent.'],
    ['What happens at a parallel (type 2) singularity?', 'Que se passe-t-il en singularité parallèle (type 2) ?', 'The platform can move even with the motors locked: it can no longer resist a force in that direction.', 'La plateforme peut bouger même moteurs bloqués : elle ne peut plus résister à une force dans cette direction.']
  ],
  link: ['delta.html', 'See the Delta robot in 3D →', 'Voir le robot Delta en 3D →']
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Optimal control: the LQR', 'Commande optimale : le LQR'],
  time: 18,
  goal: ['what “optimal” means for a controller, how the LQR finds the best gains from two weights, and how to choose them.', 'ce que « optimal » veut dire pour une commande, comment le LQR trouve les meilleurs gains à partir de deux poids, et comment les choisir.'],
  body: [
    H4('2.1 From tuning to a price', '2.1 Du réglage à un prix'),
    P('A PID is tuned by hand, gain by gain. With many states (positions and speeds of 6 joints, a drone, a balancing robot) this becomes impossible. The <strong>linear quadratic regulator</strong> (LQR) asks a different question: <em>what does an error cost, and what does a command cost?</em> Then it computes the gains that make the total cost as small as possible.',
      'Un PID se règle à la main, gain par gain. Avec beaucoup d\'états (positions et vitesses de 6 liaisons, un drone, un robot en équilibre), cela devient impossible. Le <strong>régulateur linéaire quadratique</strong> (LQR) pose une autre question : <em>que coûte une erreur, et que coûte une commande ?</em> Puis il calcule les gains qui rendent le coût total le plus petit possible.'),
    P('For a system in state-space form <i>ẋ</i> = <i>A x</i> + <i>B u</i> (control course, lesson 11):', 'Pour un système sous forme d\'état <i>ẋ</i> = <i>A x</i> + <i>B u</i> (cours de commande, leçon 11) :'),
    EQ('<i>J</i> = ∫ ( <i>x</i><sup>T</sup> <i>Q</i> <i>x</i> + <i>u</i><sup>T</sup> <i>R</i> <i>u</i> ) d<i>t</i>'),
    UL([
      ['<i>Q</i> (a diagonal matrix) = the price of each error: a large <i>Q</i> on the position means “be accurate”.', '<i>Q</i> (une matrice diagonale) = le prix de chaque erreur : un grand <i>Q</i> sur la position veut dire « sois précis ».'],
      ['<i>R</i> = the price of the command: a large <i>R</i> means “save the motors, avoid big torques”.', '<i>R</i> = le prix de la commande : un grand <i>R</i> veut dire « ménage les moteurs, évite les gros couples ».']
    ]),
    BOX('keep', ['The result', 'Le résultat'],
      P('The best controller is always a simple state feedback <strong><i>u</i> = −<i>K x</i></strong>, with <i>K</i> = <i>R</i><sup>−1</sup> <i>B</i><sup>T</sup> <i>P</i>, where <i>P</i> solves the <strong>Riccati equation</strong>:', 'La meilleure commande est toujours un simple retour d\'état <strong><i>u</i> = −<i>K x</i></strong>, avec <i>K</i> = <i>R</i><sup>−1</sup> <i>B</i><sup>T</sup> <i>P</i>, où <i>P</i> résout l\'<strong>équation de Riccati</strong> :'),
      EQ('<i>A</i><sup>T</sup> <i>P</i> + <i>P A</i> − <i>P B R</i><sup>−1</sup> <i>B</i><sup>T</sup> <i>P</i> + <i>Q</i> = 0'),
      P('You never solve it by hand: every library has a function (<code>scipy.linalg.solve_continuous_are</code>, <code>lqr</code> in MATLAB). The closed loop is <strong>always stable</strong> when the system is controllable.', 'On ne la résout jamais à la main : chaque bibliothèque a une fonction (<code>scipy.linalg.solve_continuous_are</code>, <code>lqr</code> sous MATLAB). La boucle fermée est <strong>toujours stable</strong> quand le système est commandable.')),
    H4('2.2 A joint, by LQR', '2.2 Une liaison, par LQR'),
    P('A joint driven in acceleration is a double integrator: state = (position error, speed), <i>ẍ</i> = <i>u</i>. The code below integrates the Riccati equation until it stops changing, for three prices of the position error:', 'Une liaison pilotée en accélération est un double intégrateur : état = (erreur de position, vitesse), <i>ẍ</i> = <i>u</i>. Le code ci-dessous intègre l\'équation de Riccati jusqu\'à ce qu\'elle ne change plus, pour trois prix de l\'erreur de position :'),
    CODE('lqr.py'),
    OUT('lqr.out.txt'),
    BOX('example', ['What it teaches', 'Ce que ça apprend'],
      UL([
        ['The LQR finds a <strong>PD controller</strong>: <i>K</i> = [<i>K</i><sub>p</sub>, <i>K</i><sub>d</sub>]. For this system, in theory <i>K</i><sub>p</sub> = √(<i>q</i>/<i>r</i>) and <i>K</i><sub>d</sub> = √(2 √(<i>q</i>/<i>r</i>)): 10 and 4.47 for <i>q</i> = 100, as computed.', 'Le LQR trouve un <strong>correcteur PD</strong> : <i>K</i> = [<i>K</i><sub>p</sub>, <i>K</i><sub>d</sub>]. Pour ce système, en théorie <i>K</i><sub>p</sub> = √(<i>q</i>/<i>r</i>) et <i>K</i><sub>d</sub> = √(2 √(<i>q</i>/<i>r</i>)) : 10 et 4,47 pour <i>q</i> = 100, comme calculé.'],
        ['Multiplying <i>q</i> by 100 makes the loop 10 times faster (<i>ω</i><sub>n</sub> = 1 → 10 rad/s) and asks for 100 times more gain.', 'Multiplier <i>q</i> par 100 rend la boucle 10 fois plus rapide (<i>ω</i><sub>n</sub> = 1 → 10 rad/s) et demande 100 fois plus de gain.'],
        ['The damping is always <strong>0.707</strong>: the LQR gives a well-damped loop by itself, with a good phase margin (at least 60° in theory).', 'L\'amortissement vaut toujours <strong>0,707</strong> : le LQR donne de lui-même une boucle bien amortie, avec une bonne marge de phase (au moins 60° en théorie).']
      ])),
    H4('2.3 How to choose Q and R', '2.3 Comment choisir Q et R'),
    OL([
      ['<strong>Bryson\'s rule</strong>: put on the diagonal 1 / (largest acceptable value)². If 1 cm of error is the most you accept, <i>Q</i> = 1 / 0.01² = 10 000; if the motor gives at most 5 N·m, <i>R</i> = 1 / 25.', '<strong>Règle de Bryson</strong> : mettez sur la diagonale 1 / (plus grande valeur acceptable)². Si 1 cm d\'erreur est le maximum toléré, <i>Q</i> = 1 / 0,01² = 10 000 ; si le moteur donne au plus 5 N·m, <i>R</i> = 1 / 25.'],
      ['Simulate, look at the largest command; if it is too big, increase <i>R</i>; if the response is too slow, increase <i>Q</i>.', 'Simulez, regardez la plus grande commande ; si elle est trop grande, augmentez <i>R</i> ; si la réponse est trop lente, augmentez <i>Q</i>.'],
      ['The LQR needs the full state: if only positions are measured, an observer (a Kalman filter) estimates the speeds. Together they are called <strong>LQG</strong>.', 'Le LQR a besoin de tout l\'état : si seules les positions sont mesurées, un observateur (un filtre de Kalman) estime les vitesses. Ensemble, on les appelle <strong>LQG</strong>.']
    ]),
    P('Where it is used: balancing robots and Segways, the attitude of drones and satellites, the stabilisation of legged robots around a pose, and as the inner loop of many industrial controllers.', 'Où on l\'utilise : robots en équilibre et gyropodes, attitude des drones et des satellites, stabilisation des robots à pattes autour d\'une pose, et comme boucle interne de nombreux contrôleurs industriels.')
  ],
  terms: [['LQR', 'LQR'], ['cost function', 'fonction de coût'], ['Riccati equation', 'équation de Riccati'], ['state feedback', 'retour d\'état'], ['Bryson\'s rule', 'règle de Bryson'], ['LQG', 'LQG']],
  quiz: [
    ['What do Q and R mean in the LQR cost?', 'Que signifient Q et R dans le coût du LQR ?', 'Q is the price of the errors (states), R the price of the commands.', 'Q est le prix des erreurs (états), R le prix des commandes.'],
    ['What is the form of the optimal controller?', 'Quelle est la forme de la commande optimale ?', 'A state feedback u = −K x, with K computed from the Riccati equation.', 'Un retour d\'état u = −K x, avec K calculé à partir de l\'équation de Riccati.'],
    ['The response is too slow. What do you change?', 'La réponse est trop lente. Que changez-vous ?', 'Increase Q (or decrease R): errors become more expensive than commands.', 'Augmenter Q (ou diminuer R) : les erreurs deviennent plus chères que les commandes.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Model predictive control (MPC)', 'La commande prédictive (MPC)'],
  time: 18,
  goal: ['how a controller can look into the future, optimise a whole sequence of commands, respect the limits of the motors, and why it has become the standard for legged robots, cars and drones.', 'comment une commande peut regarder dans le futur, optimiser toute une suite de commandes, respecter les limites des moteurs, et pourquoi elle est devenue la référence pour les robots à pattes, les voitures et les drones.'],
  body: [
    H4('3.1 Plan, act a little, plan again', '3.1 Planifier, agir un peu, replanifier'),
    P('A driver looks at the road ahead, plans how to take the next bend, turns the wheel a little, looks again, and corrects the plan. <strong>MPC</strong> does exactly this, many times per second:', 'Un conducteur regarde la route devant lui, prévoit comment prendre le prochain virage, tourne un peu le volant, regarde de nouveau, et corrige son plan. La <strong>MPC</strong> fait exactement cela, de nombreuses fois par seconde :'),
    OL([
      ['<strong>Predict</strong>: with the model <i>x</i><sub>k+1</sub> = <i>A x</i><sub>k</sub> + <i>B u</i><sub>k</sub>, compute where the robot will be over the next <i>N</i> steps (the <strong>horizon</strong>) for any sequence of commands.', '<strong>Prédire</strong> : avec le modèle <i>x</i><sub>k+1</sub> = <i>A x</i><sub>k</sub> + <i>B u</i><sub>k</sub>, calculer où sera le robot pendant les <i>N</i> pas suivants (l\'<strong>horizon</strong>) pour n\'importe quelle suite de commandes.'],
      ['<strong>Optimise</strong>: choose the sequence <i>u</i><sub>0</sub> … <i>u</i><sub>N−1</sub> that minimises a cost (errors and commands, as in the LQR) <strong>while respecting the limits</strong> (torque, speed, obstacles).', '<strong>Optimiser</strong> : choisir la suite <i>u</i><sub>0</sub> … <i>u</i><sub>N−1</sub> qui minimise un coût (erreurs et commandes, comme dans le LQR) <strong>en respectant les limites</strong> (couple, vitesse, obstacles).'],
      ['<strong>Apply only the first command</strong> <i>u</i><sub>0</sub>, measure the new state, and start again at the next sample.', '<strong>N\'appliquer que la première commande</strong> <i>u</i><sub>0</sub>, mesurer le nouvel état, et recommencer à l\'échantillon suivant.']
    ]),
    BOX('idea', ['The big advantage: constraints', 'Le gros avantage : les contraintes'],
      P('A PID or an LQR does not know the limits: when the motor saturates, the loop behaves badly (lesson 12 of the control course and its anti-windup). MPC <strong>plans with the limits</strong>: it knows that the motor cannot give more than 1 rad/s², so it starts braking at the right time.', 'Un PID ou un LQR ne connaît pas les limites : quand le moteur sature, la boucle se comporte mal (leçon 12 du cours de commande et son anti-emballement). La MPC <strong>planifie avec les limites</strong> : elle sait que le moteur ne peut pas donner plus de 1 rad/s², elle commence donc à freiner au bon moment.')),
    H4('3.2 A joint with a limited acceleration', '3.2 Une liaison à accélération limitée'),
    P('The joint must go from 0 to 1 rad and stop, with |<i>u</i>| ≤ 1 rad/s², a sample time of 0.1 s and a horizon of 20 steps (2 s). The predictions are stacked into one big matrix equation; the optimisation is a <strong>quadratic programme</strong>, solved here with a simple projected gradient (descend, then clip to the limits):',
      'La liaison doit aller de 0 à 1 rad et s\'arrêter, avec |<i>u</i>| ≤ 1 rad/s², une période d\'échantillonnage de 0,1 s et un horizon de 20 pas (2 s). Les prédictions sont empilées en une seule grande équation matricielle ; l\'optimisation est un <strong>programme quadratique</strong>, résolu ici avec un simple gradient projeté (descendre, puis écrêter aux limites) :'),
    CODE('mpc.py'),
    OUT('mpc.out.txt'),
    BOX('example', ['Read the output', 'Lire la sortie'],
      P('The controller accelerates at the limit (+1) until about 0.8 s, then brakes, at the limit again (−1) around 1.5 s, and arrives at 1 rad with almost no overshoot (1.004) around 2.5 s. It never asks more than the motor can give: <strong>the constraint is part of the plan</strong>. An LQR with the same weights would ask for more than 1 rad/s² at the start and be clipped.', 'La commande accélère à la limite (+1) jusqu\'à environ 0,8 s, puis freine, de nouveau à la limite (−1) vers 1,5 s, et arrive à 1 rad presque sans dépassement (1,004) vers 2,5 s. Elle ne demande jamais plus que ce que le moteur peut donner : <strong>la contrainte fait partie du plan</strong>. Un LQR avec les mêmes poids demanderait plus de 1 rad/s² au départ et serait écrêté.')),
    H4('3.3 In practice', '3.3 En pratique'),
    TABLE([['Question', 'Question'], ['Answer', 'Réponse']], [
      [['How long a horizon?', 'Quelle longueur d\'horizon ?'], ['Long enough to see the end of the manoeuvre (here 2 s to brake); longer costs more computation.', 'Assez long pour voir la fin de la manœuvre (ici 2 s pour freiner) ; plus long coûte plus de calcul.']],
      [['Is it fast enough?', 'Est-ce assez rapide ?'], ['Dedicated solvers (OSQP, acados, qpOASES) solve such problems in less than 1 ms: MPC runs at 100 Hz to 1 kHz on legged robots.', 'Des solveurs dédiés (OSQP, acados, qpOASES) résolvent ces problèmes en moins de 1 ms : la MPC tourne à 100 Hz – 1 kHz sur les robots à pattes.']],
      [['Nonlinear robots?', 'Robots non linéaires ?'], ['Nonlinear MPC uses the full model, or relinearises it at each step.', 'La MPC non linéaire utilise le modèle complet, ou le relinéarise à chaque pas.']],
      [['What if the model is wrong?', 'Et si le modèle est faux ?'], ['Replanning at every step corrects small errors; large ones need a better model or a robust MPC.', 'Replanifier à chaque pas corrige les petites erreurs ; les grosses demandent un meilleur modèle ou une MPC robuste.']]
    ]),
    P('Where it is used: the walking of humanoids and quadrupeds (the next lesson), autonomous cars (lane keeping with steering limits), drones racing through gates, and the path following controller of Nav2 (MPPI).', 'Où on l\'utilise : la marche des humanoïdes et des quadrupèdes (la leçon suivante), les voitures autonomes (maintien dans la voie avec limites de braquage), les drones de course, et le contrôleur de suivi de chemin de Nav2 (MPPI).')
  ],
  terms: [['model predictive control (MPC)', 'commande prédictive (MPC)'], ['horizon', 'horizon'], ['receding horizon', 'horizon glissant'], ['constraint', 'contrainte'], ['quadratic programme', 'programme quadratique']],
  quiz: [
    ['Why does MPC apply only the first command of its plan?', 'Pourquoi la MPC n\'applique-t-elle que la première commande de son plan ?', 'Because it replans at the next sample with the new measurement: this corrects model errors and disturbances.', 'Parce qu\'elle replanifie à l\'échantillon suivant avec la nouvelle mesure : cela corrige les erreurs de modèle et les perturbations.'],
    ['What is the main advantage of MPC over an LQR?', 'Quel est le principal avantage de la MPC sur un LQR ?', 'It takes the limits (constraints) into account in the plan.', 'Elle prend en compte les limites (contraintes) dans son plan.'],
    ['What does the horizon N set?', 'Que fixe l\'horizon N ?', 'How far ahead the controller looks: long enough to see the manoeuvre, but more computation.', 'Jusqu\'où la commande regarde en avant : assez loin pour voir la manœuvre, mais plus de calcul.']
  ]
})
  ];
}
